// src/pages/Standings/Standings.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Standings.module.scss";

interface ChampionshipDriver {
    driver_number: number;
    points_current: number;
    position_current: number;
}

interface DriverInfo {
    driver_number: number;
    full_name: string;
    name_acronym: string;
    team_name: string;
    headshot_url?: string;
}

interface ChampionshipTeam {
    team_name: string;
    points_current: number;
    position_current: number;
}

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

const BASE = "https://api.openf1.org/v1";

// Cache de módulo — evita requisições duplicadas no StrictMode
let cachedDrivers: ChampionshipDriver[] | null = null;
let cachedDriverInfo: Record<number, DriverInfo> | null = null;
let cachedTeams: ChampionshipTeam[] | null = null;
let pendingRequest: Promise<void> | null = null;

export const Standings = () => {
    const [tab, setTab] = useState<"drivers" | "teams">("drivers");
    const [drivers, setDrivers] = useState<ChampionshipDriver[]>([]);
    const [driverInfo, setDriverInfo] = useState<Record<number, DriverInfo>>(
        {},
    );
    const [teams, setTeams] = useState<ChampionshipTeam[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            // 1. Se já temos os dados em cache, usa direto
            if (cachedDrivers && cachedDriverInfo && cachedTeams) {
                setDrivers(cachedDrivers);
                setDriverInfo(cachedDriverInfo);
                setTeams(cachedTeams);
                setLoading(false);
                return;
            }

            // 2. Se já tem uma requisição em andamento (StrictMode), aguarda ela terminar
            if (pendingRequest) {
                await pendingRequest;
                if (cachedDrivers && cachedDriverInfo && cachedTeams) {
                    setDrivers(cachedDrivers);
                    setDriverInfo(cachedDriverInfo);
                    setTeams(cachedTeams);
                    setLoading(false);
                }
                return;
            }

            // 3. Primeira chamada real à API
            pendingRequest = (async () => {
                try {
                    const [champRes, infoRes, teamsRes] = await Promise.all([
                        axios.get<ChampionshipDriver[]>(
                            `${BASE}/championship_drivers?session_key=latest`,
                        ),
                        axios.get<DriverInfo[]>(
                            `${BASE}/drivers?session_key=latest`,
                        ),
                        axios.get<ChampionshipTeam[]>(
                            `${BASE}/championship_teams?session_key=latest`,
                        ),
                    ]);

                    // Ordena pilotos por posição
                    const sortedDrivers = [...champRes.data].sort(
                        (a, b) => a.position_current - b.position_current,
                    );

                    // Cria um mapa { driver_number -> info } para lookup rápido
                    const infoMap: Record<number, DriverInfo> = {};
                    for (const d of infoRes.data) {
                        infoMap[d.driver_number] = d;
                    }

                    // Ordena equipes por posição
                    const sortedTeams = [...teamsRes.data].sort(
                        (a, b) => a.position_current - b.position_current,
                    );

                    // Salva no cache
                    cachedDrivers = sortedDrivers;
                    cachedDriverInfo = infoMap;
                    cachedTeams = sortedTeams;

                    setDrivers(sortedDrivers);
                    setDriverInfo(infoMap);
                    setTeams(sortedTeams);
                } catch {
                    setError(
                        "Não foi possível carregar os dados. Tente novamente mais tarde.",
                    );
                } finally {
                    setLoading(false);
                    pendingRequest = null;
                }
            })();

            await pendingRequest;
        };

        load();
    }, []);

    return (
        <div className={styles.page}>
            <header className={styles.pageHeader}>
                <span className={styles.eyebrow}>Temporada 2026</span>
                <h1 className={styles.title}>Classificação</h1>
                <p className={styles.subtitle}>
                    Atualizado após a última corrida.
                </p>
            </header>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${tab === "drivers" ? styles.active : ""}`}
                    onClick={() => setTab("drivers")}
                >
                    Pilotos
                </button>
                <button
                    className={`${styles.tab} ${tab === "teams" ? styles.active : ""}`}
                    onClick={() => setTab("teams")}
                >
                    Construtores
                </button>
            </div>

            <div className={styles.tableWrap}>
                {loading && (
                    <div className={styles.state}>
                        <div className={styles.spinner} />
                        <span>Carregando dados da OpenF1...</span>
                    </div>
                )}

                {error && !loading && (
                    <div className={styles.state}>
                        <span className={styles.errorIcon}>⚠</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Tabela de Pilotos */}
                {!loading && !error && tab === "drivers" && (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.thPos}>POS</th>
                                <th className={styles.thDriver}>Piloto</th>
                                <th className={styles.thTeam}>Equipe</th>
                                <th className={styles.thPts}>PTS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drivers.map((d) => {
                                const info = driverInfo[d.driver_number];
                                const teamName = info?.team_name ?? "";
                                const color = TEAM_COLORS[teamName] ?? "#888";

                                return (
                                    <tr
                                        key={d.driver_number}
                                        className={`${styles.row} ${d.position_current === 1 ? styles.leader : ""}`}
                                    >
                                        <td className={styles.pos}>
                                            <span
                                                className={styles.posNum}
                                                style={{ borderColor: color }}
                                            >
                                                {d.position_current}
                                            </span>
                                        </td>
                                        <td className={styles.driverCell}>
                                            {info?.headshot_url && (
                                                <img
                                                    src={info.headshot_url}
                                                    alt={info.full_name}
                                                    className={styles.headshot}
                                                />
                                            )}
                                            <div className={styles.driverText}>
                                                <span
                                                    className={styles.acronym}
                                                >
                                                    {info?.name_acronym ??
                                                        `#${d.driver_number}`}
                                                </span>
                                                <span
                                                    className={styles.fullName}
                                                >
                                                    {info?.full_name ??
                                                        `Driver ${d.driver_number}`}
                                                </span>
                                            </div>
                                        </td>
                                        <td className={styles.teamCell}>
                                            <span
                                                className={styles.teamDot}
                                                style={{ background: color }}
                                            />
                                            {teamName || "—"}
                                        </td>
                                        <td className={styles.pts}>
                                            {d.points_current}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {/* Tabela de Construtores */}
                {!loading && !error && tab === "teams" && (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.thPos}>POS</th>
                                <th className={styles.thDriver}>Equipe</th>
                                <th className={styles.thPts}>PTS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teams.map((t) => {
                                const color =
                                    TEAM_COLORS[t.team_name] ?? "#888";

                                return (
                                    <tr
                                        key={t.team_name}
                                        className={`${styles.row} ${t.position_current === 1 ? styles.leader : ""}`}
                                    >
                                        <td className={styles.pos}>
                                            <span
                                                className={styles.posNum}
                                                style={{ borderColor: color }}
                                            >
                                                {t.position_current}
                                            </span>
                                        </td>
                                        <td className={styles.driverCell}>
                                            <div className={styles.driverText}>
                                                <span
                                                    className={styles.acronym}
                                                    style={{ color }}
                                                >
                                                    {t.team_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className={styles.pts}>
                                            {t.points_current}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
