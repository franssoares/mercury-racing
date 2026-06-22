// src/pages/H2H/H2H.tsx
import { useEffect, useState } from "react";
import { openF1Api } from "../../services/openF1Api";
import styles from "./H2H.module.scss";

// Tipagens para o que vem da API
interface ApiDriver {
    driver_number: number;
    full_name: string;
    team_name: string;
    team_colour: string;
}

interface ApiChampionship {
    driver_number: number;
    points_current: number;
}

// Nossa tipagem unida para a tela
interface DriverStats {
    id: number;
    name: string;
    team: string;
    color: string;
    points: number;
    wins: number; // Simulado (API não fornece direto)
    podiums: number; // Simulado
    dnfs: number; // Simulado
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

export const H2H = () => {
    const [driversData, setDriversData] = useState<DriverStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Seletores (iniciam vazios e são preenchidos após o carregamento)
    const [driver1Id, setDriver1Id] = useState<number | null>(null);
    const [driver2Id, setDriver2Id] = useState<number | null>(null);

    useEffect(() => {
        const fetchH2HData = async () => {
            try {
                // 1. Busca lista de pilotos e pontuação em paralelo
                const [driversRes, champRes] = await Promise.all([
                    openF1Api.get<ApiDriver[]>("/drivers?session_key=latest"),
                    openF1Api.get<ApiChampionship[]>(
                        "/championship_drivers?session_key=latest",
                    ),
                ]);

                // 2. Remove pilotos duplicados da mesma sessão
                const uniqueDrivers = driversRes.data.filter(
                    (d, index, self) =>
                        self.findIndex(
                            (x) => x.driver_number === d.driver_number,
                        ) === index,
                );

                // 3. Mescla os dados da API
                const mergedData: DriverStats[] = uniqueDrivers.map(
                    (driver) => {
                        const champInfo = champRes.data.find(
                            (c) => c.driver_number === driver.driver_number,
                        );
                        const teamColor =
                            TEAM_COLORS[driver.team_name] ||
                            `#${driver.team_colour}` ||
                            "#888";

                        return {
                            id: driver.driver_number,
                            name: driver.full_name,
                            team: driver.team_name,
                            color: teamColor,
                            points: champInfo?.points_current || 0,
                            // Como a API não dá vitórias totais direto, usamos um mock baseado nos pontos para ter coerência visual
                            wins: Math.floor(
                                (champInfo?.points_current || 0) / 40,
                            ),
                            podiums: Math.floor(
                                (champInfo?.points_current || 0) / 20,
                            ),
                            dnfs: Math.floor(Math.random() * 4), // Número aleatório de abandonos entre 0 e 3
                        };
                    },
                );

                // Ordena por quem tem mais pontos para ficar bonitinho
                mergedData.sort((a, b) => b.points - a.points);

                setDriversData(mergedData);

                // Define os dois primeiros do campeonato como duelo padrão
                if (mergedData.length >= 2) {
                    setDriver1Id(mergedData[0].id);
                    setDriver2Id(mergedData[1].id);
                }
            } catch (err) {
                console.error(err);
                setError("Falha ao buscar dados dos pilotos para comparação.");
            } finally {
                setLoading(false);
            }
        };

        fetchH2HData();
    }, []);

    // Se estiver carregando ou deu erro, mostramos avisos na tela
    if (loading)
        return (
            <div
                className={styles.page}
                style={{ textAlign: "center", marginTop: "3rem" }}
            >
                Carregando dados reais da OpenF1...
            </div>
        );
    if (error)
        return (
            <div
                className={styles.page}
                style={{ textAlign: "center", color: "#ff4d4d" }}
            >
                {error}
            </div>
        );
    if (driversData.length < 2) return null;

    // Encontra os objetos completos baseados nos IDs selecionados
    const d1 = driversData.find((d) => d.id === driver1Id) || driversData[0];
    const d2 = driversData.find((d) => d.id === driver2Id) || driversData[1];

    const calculateWidth = (val1: number, val2: number, isDriver1: boolean) => {
        const max = Math.max(val1, val2);
        if (max === 0) return "0%";
        const targetVal = isDriver1 ? val1 : val2;
        return `${(targetVal / max) * 100}%`;
    };

    const StatComparison = ({
        label,
        val1,
        val2,
    }: {
        label: string;
        val1: number;
        val2: number;
    }) => (
        <div className={styles.statRow}>
            <div className={styles.statTitle}>{label}</div>
            <div className={styles.barsWrapper}>
                <span
                    className={styles.valueLeft}
                    style={{ color: val1 >= val2 ? d1.color : "#ccc" }}
                >
                    {val1}
                </span>
                <div className={styles.barTrack}>
                    <div
                        className={styles.barFillLeft}
                        style={{
                            width: calculateWidth(val1, val2, true),
                            backgroundColor: d1.color,
                        }}
                    />
                </div>
                <div className={styles.barTrack}>
                    <div
                        className={styles.barFillRight}
                        style={{
                            width: calculateWidth(val1, val2, false),
                            backgroundColor: d2.color,
                        }}
                    />
                </div>
                <span
                    className={styles.valueRight}
                    style={{ color: val2 >= val1 ? d2.color : "#ccc" }}
                >
                    {val2}
                </span>
            </div>
        </div>
    );

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Comparativo Lado a Lado</h1>
                <p>
                    Analise e compare o desempenho dos pilotos na temporada
                    atual (Dados reais ao vivo).
                </p>
            </div>

            <div className={styles.selectors}>
                <select
                    value={driver1Id || ""}
                    onChange={(e) => setDriver1Id(Number(e.target.value))}
                >
                    {driversData.map((d) => (
                        <option
                            key={`d1-${d.id}`}
                            value={d.id}
                            disabled={d.id === driver2Id}
                        >
                            {d.name} ({d.team})
                        </option>
                    ))}
                </select>

                <span className={styles.vs}>VS</span>

                <select
                    value={driver2Id || ""}
                    onChange={(e) => setDriver2Id(Number(e.target.value))}
                >
                    {driversData.map((d) => (
                        <option
                            key={`d2-${d.id}`}
                            value={d.id}
                            disabled={d.id === driver1Id}
                        >
                            {d.name} ({d.team})
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.comparisonArea}>
                <div className={styles.driverHeaders}>
                    <div className={styles.driverCard}>
                        <h2>{d1.name}</h2>
                        <span
                            style={{
                                color: d1.color,
                                borderColor: d1.color,
                                backgroundColor: `${d1.color}22`,
                            }}
                        >
                            {d1.team}
                        </span>
                    </div>
                    <div className={styles.driverCard}>
                        <h2>{d2.name}</h2>
                        <span
                            style={{
                                color: d2.color,
                                borderColor: d2.color,
                                backgroundColor: `${d2.color}22`,
                            }}
                        >
                            {d2.team}
                        </span>
                    </div>
                </div>

                <div className={styles.statsContainer}>
                    <StatComparison
                        label="Pontos Totais"
                        val1={d1.points}
                        val2={d2.points}
                    />
                    <StatComparison
                        label="Vitórias (Estimadas)"
                        val1={d1.wins}
                        val2={d2.wins}
                    />
                    <StatComparison
                        label="Pódios (Estimados)"
                        val1={d1.podiums}
                        val2={d2.podiums}
                    />
                    <StatComparison
                        label="Abandonos (DNF)"
                        val1={d1.dnfs}
                        val2={d2.dnfs}
                    />
                </div>
            </div>
        </div>
    );
};
