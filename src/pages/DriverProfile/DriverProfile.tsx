import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { openF1Api } from "../../services/openF1Api";
import { translateTeamName } from "../../utils/locale";
import styles from "./DriverProfile.module.scss";

interface DriverInfo {
    driver_number: number;
    full_name: string;
    first_name: string;
    last_name: string;
    name_acronym: string;
    team_name: string;
    team_colour: string;
    headshot_url?: string;
    broadcast_name: string;
}

interface ChampionshipDriver {
    driver_number: number;
    points_current: number;
    position_current: number;
}

interface Stint {
    compound: string;
    lap_start: number;
    lap_end: number;
    stint_number: number;
    tyre_age_at_start: number;
}

const COMPOUND_COLORS: Record<string, string> = {
    SOFT: "#e80020",
    MEDIUM: "#ffd600",
    HARD: "#f0f0f0",
    INTERMEDIATE: "#39b54a",
    WET: "#0067ff",
};

const TEAM_COLORS: Record<string, string> = {
    McLaren: "#FF8000",
    Ferrari: "#E80020",
    "Red Bull Racing": "#3671C6",
    Mercedes: "#27F4D2",
    "Aston Martin": "#229971",
    Alpine: "#FF87BC",
    "Haas F1 Team": "#B6BABD",
    Williams: "#64C4FF",
    RB: "#6692FF",
    "Kick Sauber": "#52E252",
};

// Cache básico para evitar chamadas duplicadas no StrictMode
const driverCache: Record<
    number,
    {
        info: DriverInfo;
        champ: ChampionshipDriver | null;
        stints: Stint[];
    }
> = {};

let cachedDriversList: DriverInfo[] | null = null;

export const DriverProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const driverNumber = id ? Number(id) : null;

    // Estados para o perfil individual
    const [info, setInfo] = useState<DriverInfo | null>(null);
    const [champ, setChamp] = useState<ChampionshipDriver | null>(null);
    const [stints, setStints] = useState<Stint[]>([]);

    // Estado para a listagem geral (quando não há ID na URL)
    const [allDrivers, setAllDrivers] = useState<DriverInfo[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDriverProfile = async (num: number) => {
            setLoading(true);
            setError(null);

            if (driverCache[num]) {
                const cached = driverCache[num];
                setInfo(cached.info);
                setChamp(cached.champ);
                setStints(cached.stints);
                setLoading(false);
                return;
            }

            try {
                // Usando a instância openF1Api configurada no seu projeto
                const infoRes = await openF1Api.get<DriverInfo[]>(
                    `/drivers?driver_number=${num}&session_key=latest`,
                );

                // Pequeno delay preventivo contra rate limit da API
                await new Promise((r) => setTimeout(r, 200));

                const champRes = await openF1Api.get<ChampionshipDriver[]>(
                    `/championship_drivers?driver_number=${num}&session_key=latest`,
                );

                await new Promise((r) => setTimeout(r, 200));

                const stintsRes = await openF1Api.get<Stint[]>(
                    `/stints?driver_number=${num}&session_key=latest`,
                );

                const driverData = infoRes.data[0] ?? null;
                const champData = champRes.data[0] ?? null;

                if (!driverData) {
                    setError("Piloto não encontrado.");
                    setLoading(false);
                    return;
                }

                driverCache[num] = {
                    info: driverData,
                    champ: champData,
                    stints: stintsRes.data,
                };

                setInfo(driverData);
                setChamp(champData);
                setStints(stintsRes.data);
            } catch (err: any) {
                if (err?.response?.status === 429) {
                    setError(
                        "Muitas requisições. Aguarde alguns segundos e recarregue.",
                    );
                } else {
                    setError("Não foi possível carregar o perfil do piloto.");
                }
            } finally {
                setLoading(false);
            }
        };

        const loadAllDrivers = async () => {
            setLoading(true);
            setError(null);

            if (cachedDriversList) {
                setAllDrivers(cachedDriversList);
                setLoading(false);
                return;
            }

            try {
                const res = await openF1Api.get<DriverInfo[]>(
                    "/drivers?session_key=latest",
                );
                // Remove duplicatas de pilotos vindas da API na mesma sessão
                const uniqueDrivers = res.data.filter(
                    (driver, index, self) =>
                        self.findIndex(
                            (d) => d.driver_number === driver.driver_number,
                        ) === index,
                );

                cachedDriversList = uniqueDrivers;
                setAllDrivers(uniqueDrivers);
            } catch {
                setError("Não foi possível carregar a lista de pilotos.");
            } finally {
                setLoading(false);
            }
        };

        if (driverNumber && !isNaN(driverNumber)) {
            loadDriverProfile(driverNumber);
        } else {
            loadAllDrivers();
        }
    }, [driverNumber]);

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.skeletonHero} />
                <div className={styles.skeletonBody}>
                    <div className={styles.skeletonCard} />
                    <div className={styles.skeletonCard} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.page}>
                <div className={styles.errorState}>
                    <span>⚠️ {error}</span>
                    <button
                        className={styles.backBtn}
                        onClick={() => navigate("/standings")}
                    >
                        Voltar para Classificação
                    </button>
                </div>
            </div>
        );
    }

    // VISÃO 1: Se não houver ID na URL, renderiza uma lista para o usuário escolher o piloto
    if (!driverNumber) {
        return (
            <div className={styles.page}>
                <header style={{ marginBottom: "2rem" }}>
                    <h1 style={{ color: "#f0f0f0", margin: 0 }}>Pilotos</h1>
                    <p style={{ color: "#888", margin: "0.5rem 0 0" }}>
                        Selecione um piloto para ver estatísticas detalhadas e
                        stints.
                    </p>
                </header>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: "1rem",
                    }}
                >
                    {allDrivers.map((d) => {
                        const cardColor =
                            TEAM_COLORS[d.team_name] ||
                            `#${d.team_colour}` ||
                            "#888";
                        return (
                            <div
                                key={d.driver_number}
                                onClick={() =>
                                    navigate(`/drivers/${d.driver_number}`)
                                }
                                style={{
                                    background: "#1a1a1a",
                                    border: "1px solid rgba(255, 255, 255, 0.07)",
                                    borderLeft: `4px solid ${cardColor}`,
                                    borderRadius: "8px",
                                    padding: "1.25rem",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                }}
                            >
                                {d.headshot_url && (
                                    <img
                                        src={d.headshot_url}
                                        alt={d.full_name}
                                        style={{
                                            width: "45px",
                                            height: "45px",
                                            borderRadius: "50%",
                                            background: "#242424",
                                        }}
                                    />
                                )}
                                <div>
                                    <div
                                        style={{
                                            fontWeight: "bold",
                                            color: "#f0f0f0",
                                        }}
                                    >
                                        {d.full_name}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "0.8rem",
                                            color: "#888",
                                        }}
                                    >
                                        {translateTeamName(d.team_name)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // VISÃO 2: Visão do perfil individual (quando id existe)
    if (!info) return null;
    const teamColor =
        TEAM_COLORS[info.team_name] || `#${info.team_colour}` || "#888";
    const compoundsSeen = [...new Set(stints.map((s) => s.compound))];

    return (
        <div className={styles.page}>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
                ← Voltar
            </button>

            <section className={styles.hero} style={{ borderColor: teamColor }}>
                <div className={styles.heroLeft}>
                    {info.headshot_url ? (
                        <img
                            src={info.headshot_url}
                            alt={info.full_name}
                            className={styles.headshot}
                        />
                    ) : (
                        <div
                            className={styles.headshotPlaceholder}
                            style={{ borderColor: teamColor }}
                        >
                            {info.name_acronym}
                        </div>
                    )}
                </div>
                <div className={styles.heroRight}>
                    <span className={styles.acronym}>{info.name_acronym}</span>
                    <h1 className={styles.fullName}>{info.full_name}</h1>
                    <div
                        className={styles.teamBadge}
                        style={{
                            background: `${teamColor}22`,
                            borderColor: teamColor,
                        }}
                    >
                        <span
                            className={styles.teamDot}
                            style={{ background: teamColor }}
                        />
                        {translateTeamName(info.team_name)}
                    </div>
                    <div
                        className={styles.carNumber}
                        style={{ color: teamColor }}
                    >
                        #{info.driver_number}
                    </div>
                </div>
            </section>

            <div className={styles.statsGrid}>
                <div className={styles.card}>
                    <p className={styles.cardLabel}>Campeonato</p>
                    {champ ? (
                        <div className={styles.champStats}>
                            <div className={styles.statItem}>
                                <span
                                    className={styles.statValue}
                                    style={{ color: teamColor }}
                                >
                                    {champ.position_current}º
                                </span>
                                <span className={styles.statLabel}>
                                    Posição
                                </span>
                            </div>
                            <div className={styles.statDivider} />
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>
                                    {champ.points_current}
                                </span>
                                <span className={styles.statLabel}>Pontos</span>
                            </div>
                        </div>
                    ) : (
                        <p className={styles.naText}>Dados indisponíveis.</p>
                    )}
                </div>

                <div className={styles.card}>
                    <p className={styles.cardLabel}>
                        Compostos na última corrida
                    </p>
                    {compoundsSeen.length > 0 ? (
                        <div className={styles.compounds}>
                            {compoundsSeen.map((c) => (
                                <span
                                    key={c}
                                    className={styles.compound}
                                    style={{
                                        background: `${COMPOUND_COLORS[c] ?? "#888"}22`,
                                        borderColor:
                                            COMPOUND_COLORS[c] ?? "#888",
                                        color: COMPOUND_COLORS[c] ?? "#888",
                                    }}
                                >
                                    {c}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.naText}>Sem dados de stints.</p>
                    )}
                </div>

                {stints.length > 0 && (
                    <div className={`${styles.card} ${styles.cardFull}`}>
                        <p className={styles.cardLabel}>Stints Detalhados</p>
                        <div className={styles.stintsList}>
                            {stints.map((s) => (
                                <div
                                    key={s.stint_number}
                                    className={styles.stintRow}
                                >
                                    <span
                                        className={styles.stintCompound}
                                        style={{
                                            background:
                                                COMPOUND_COLORS[s.compound] ??
                                                "#888",
                                        }}
                                    />
                                    <span className={styles.stintInfo}>
                                        <strong>
                                            Stint {s.stint_number}: {s.compound}
                                        </strong>
                                        <span className={styles.stintDetail}>
                                            Voltas: {s.lap_start} à {s.lap_end}{" "}
                                            ({s.lap_end - s.lap_start + 1}{" "}
                                            voltas conduzidas) • Começou com{" "}
                                            {s.tyre_age_at_start} voltas de uso
                                        </span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
