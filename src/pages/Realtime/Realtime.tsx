import { useEffect, useState, useRef } from "react";
import { openF1Api } from "../../services/openF1Api";
import styles from "./Realtime.module.scss";

// --- Interfaces da API ---
interface ApiSession {
    session_key: number;
    session_name: string;
    country_name: string;
    date_start: string;
    date_end: string;
}
interface ApiDriver {
    driver_number: number;
    name_acronym: string;
    team_name: string;
    team_colour: string;
}
interface ApiPosition {
    driver_number: number;
    position: number;
}
interface ApiInterval {
    driver_number: number;
    gap_to_leader: number | string | null;
    interval: number | string | null;
}
interface ApiStint {
    driver_number: number;
    stint_number: number;
    compound: string;
    tyre_age_at_start: number;
    lap_start: number;
    lap_end: number;
}
interface ApiLap {
    driver_number: number;
    lap_number: number;
    duration_sector_1: number;
    duration_sector_2: number;
    duration_sector_3: number;
}

// --- Interfaces do Front-End ---
interface StintHistory {
    compound: string;
    laps: number;
}

interface NextRace {
    name: string;
    date: string;
}

interface LiveDriver {
    number: number;
    position: number;
    acronym: string;
    team: string;
    color: string;
    gapToLeader: string;
    interval: string;
    stints: StintHistory[];
    pits: number;
    s1: number | null;
    s2: number | null;
    s3: number | null;
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
    Audi: "#52E252",
    Cadillac: "#FFC000",
    "Racing Bulls": "#6692FF",
};

const TYRE_CONFIG: Record<string, { letter: string; color: string }> = {
    SOFT: { letter: "S", color: "#e80020" },
    MEDIUM: { letter: "M", color: "#ffd600" },
    HARD: { letter: "H", color: "#f0f0f0" },
    INTERMEDIATE: { letter: "I", color: "#39b54a" },
    WET: { letter: "W", color: "#0067ff" },
    UNKNOWN: { letter: "?", color: "#555" },
};

// DADOS DE FALLBACK RICOS (Simulação do GP da Catalunha 2026 Finalizado)
const FALLBACK_DRIVERS: LiveDriver[] = [
    {
        number: 44,
        acronym: "HAM",
        team: "Ferrari",
        color: "#E80020",
        position: 1,
        gapToLeader: "Líder",
        interval: "Líder",
        stints: [
            { compound: "SOFT", laps: 16 },
            { compound: "MEDIUM", laps: 25 },
            { compound: "HARD", laps: 25 },
        ],
        pits: 2,
        s1: 23.385,
        s2: 31.391,
        s3: 23.945,
    },
    {
        number: 63,
        acronym: "RUS",
        team: "Mercedes",
        color: "#27F4D2",
        position: 2,
        gapToLeader: "+19.561s",
        interval: "+19.561s",
        stints: [
            { compound: "MEDIUM", laps: 22 },
            { compound: "HARD", laps: 44 },
        ],
        pits: 1,
        s1: 23.399,
        s2: 32.271,
        s3: 24.388,
    },
    {
        number: 4,
        acronym: "NOR",
        team: "McLaren",
        color: "#FF8000",
        position: 3,
        gapToLeader: "+23.719s",
        interval: "+4.158s",
        stints: [
            { compound: "MEDIUM", laps: 24 },
            { compound: "HARD", laps: 42 },
        ],
        pits: 1,
        s1: 23.347,
        s2: 32.459,
        s3: 24.221,
    },
    {
        number: 1,
        acronym: "VER",
        team: "Red Bull Racing",
        color: "#3671C6",
        position: 4,
        gapToLeader: "+40.497s",
        interval: "+16.778s",
        stints: [
            { compound: "SOFT", laps: 14 },
            { compound: "MEDIUM", laps: 26 },
            { compound: "MEDIUM", laps: 26 },
        ],
        pits: 2,
        s1: 23.363,
        s2: 32.542,
        s3: 24.316,
    },
    {
        number: 81,
        acronym: "PIA",
        team: "McLaren",
        color: "#FF8000",
        position: 5,
        gapToLeader: "+58.661s",
        interval: "+18.164s",
        stints: [
            { compound: "MEDIUM", laps: 26 },
            { compound: "HARD", laps: 40 },
        ],
        pits: 1,
        s1: 23.592,
        s2: 32.704,
        s3: 24.49,
    },
    {
        number: 17,
        acronym: "HAD",
        team: "Red Bull Racing",
        color: "#3671C6",
        position: 6,
        gapToLeader: "+1 LAP",
        interval: "+49.132s",
        stints: [
            { compound: "SOFT", laps: 10 },
            { compound: "MEDIUM", laps: 25 },
            { compound: "HARD", laps: 30 },
        ],
        pits: 2,
        s1: 23.269,
        s2: 32.23,
        s3: 24.651,
    },
    {
        number: 10,
        acronym: "GAS",
        team: "Alpine",
        color: "#FF87BC",
        position: 7,
        gapToLeader: "+1 LAP",
        interval: "+31.162s",
        stints: [
            { compound: "MEDIUM", laps: 21 },
            { compound: "HARD", laps: 44 },
        ],
        pits: 1,
        s1: 23.728,
        s2: 32.929,
        s3: 24.825,
    },
    {
        number: 43,
        acronym: "COL",
        team: "Alpine",
        color: "#FF87BC",
        position: 8,
        gapToLeader: "+1 LAP",
        interval: "+14.078s",
        stints: [
            { compound: "MEDIUM", laps: 23 },
            { compound: "HARD", laps: 42 },
        ],
        pits: 1,
        s1: 23.814,
        s2: 33.619,
        s3: 24.847,
    },
    {
        number: 30,
        acronym: "LAW",
        team: "Racing Bulls",
        color: "#6692FF",
        position: 9,
        gapToLeader: "+1 LAP",
        interval: "+2.357s",
        stints: [
            { compound: "MEDIUM", laps: 25 },
            { compound: "HARD", laps: 40 },
        ],
        pits: 1,
        s1: 23.988,
        s2: 33.475,
        s3: 25.104,
    },
    {
        number: 12,
        acronym: "LIN",
        team: "Racing Bulls",
        color: "#6692FF",
        position: 10,
        gapToLeader: "+1 LAP",
        interval: "+5.850s",
        stints: [
            { compound: "MEDIUM", laps: 28 },
            { compound: "HARD", laps: 37 },
        ],
        pits: 1,
        s1: 23.618,
        s2: 33.251,
        s3: 25.045,
    },
    {
        number: 5,
        acronym: "BOR",
        team: "Audi",
        color: "#52E252",
        position: 11,
        gapToLeader: "+2 LAPS",
        interval: "+31.662s",
        stints: [
            { compound: "SOFT", laps: 11 },
            { compound: "MEDIUM", laps: 20 },
            { compound: "HARD", laps: 33 },
        ],
        pits: 2,
        s1: 23.631,
        s2: 32.875,
        s3: 24.771,
    },
    {
        number: 55,
        acronym: "SAI",
        team: "Williams",
        color: "#64C4FF",
        position: 12,
        gapToLeader: "+2 LAPS",
        interval: "+1.179s",
        stints: [
            { compound: "SOFT", laps: 9 },
            { compound: "MEDIUM", laps: 25 },
            { compound: "HARD", laps: 30 },
        ],
        pits: 2,
        s1: 23.733,
        s2: 33.427,
        s3: 24.784,
    },
    {
        number: 31,
        acronym: "OCO",
        team: "Haas F1 Team",
        color: "#B6BABD",
        position: 13,
        gapToLeader: "+2 LAPS",
        interval: "+31.283s",
        stints: [
            { compound: "SOFT", laps: 6 },
            { compound: "MEDIUM", laps: 28 },
            { compound: "HARD", laps: 30 },
        ],
        pits: 2,
        s1: 23.587,
        s2: 33.051,
        s3: 24.943,
    },
    {
        number: 11,
        acronym: "PER",
        team: "Cadillac",
        color: "#FFC000",
        position: 14,
        gapToLeader: "+3 LAPS",
        interval: "+31.731s",
        stints: [
            { compound: "MEDIUM", laps: 24 },
            { compound: "HARD", laps: 20 },
            { compound: "HARD", laps: 19 },
        ],
        pits: 2,
        s1: 24.108,
        s2: 33.437,
        s3: 24.959,
    },
    {
        number: 16,
        acronym: "LEC",
        team: "Ferrari",
        color: "#E80020",
        position: 15,
        gapToLeader: "DNF",
        interval: "DNF",
        stints: [
            { compound: "MEDIUM", laps: 23 },
            { compound: "HARD", laps: 10 },
        ],
        pits: 1,
        s1: 23.407,
        s2: 32.526,
        s3: 24.368,
    },
    {
        number: 99,
        acronym: "ANT",
        team: "Mercedes",
        color: "#27F4D2",
        position: 16,
        gapToLeader: "DNF",
        interval: "DNF",
        stints: [{ compound: "MEDIUM", laps: 24 }],
        pits: 0,
        s1: 23.423,
        s2: 32.524,
        s3: 24.202,
    },
    {
        number: 87,
        acronym: "BEA",
        team: "Haas F1 Team",
        color: "#B6BABD",
        position: 17,
        gapToLeader: "DNF",
        interval: "DNF",
        stints: [{ compound: "MEDIUM", laps: 21 }],
        pits: 0,
        s1: 23.935,
        s2: 33.338,
        s3: 25.026,
    },
    {
        number: 23,
        acronym: "ALB",
        team: "Williams",
        color: "#64C4FF",
        position: 18,
        gapToLeader: "DNF",
        interval: "DNF",
        stints: [{ compound: "SOFT", laps: 8 }],
        pits: 0,
        s1: 23.861,
        s2: 33.843,
        s3: 24.84,
    },
];

export const Realtime = () => {
    const [liveData, setLiveData] = useState<LiveDriver[]>([]);
    const [isPolling, setIsPolling] = useState(false);
    const [isUsingFallback, setIsUsingFallback] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [sessionInfo, setSessionInfo] = useState({
        name: "Grand Prix",
        isLive: false,
    });
    const [nextRace, setNextRace] = useState<NextRace | null>(null);

    const driversRef = useRef<ApiDriver[]>([]);
    const stintsMapRef = useRef<Map<number, StintHistory[]>>(new Map());
    const isInitialLoadRef = useRef<boolean>(false);
    const isUsingFallbackRef = useRef<boolean>(false);

    useEffect(() => {
        let intervalId: number | undefined;

        const activateFallbackMode = () => {
            isUsingFallbackRef.current = true;
            setIsUsingFallback(true);
            setApiError(null);
            setSessionInfo({
                name: "Catalunya Grand Prix - Race (Offline)",
                isLive: false,
            });

            // Simula a próxima corrida no modo fallback para você testar o layout do banner
            setNextRace({
                name: "Austria Grand Prix - Practice 1",
                date: new Date(Date.now() + 86400000 * 5).toISOString(),
            });

            setLiveData(FALLBACK_DRIVERS);
        };

        const initializeRealtime = async () => {
            if (isInitialLoadRef.current) return;
            isInitialLoadRef.current = true;

            try {
                // 1. Busca os dados estáticos mais pesados
                const [sessionRes, driversRes, stintsRes] = await Promise.all([
                    openF1Api.get<ApiSession[]>("/sessions?session_key=latest"),
                    openF1Api.get<ApiDriver[]>("/drivers?session_key=latest"),
                    openF1Api.get<ApiStint[]>("/stints?session_key=latest"),
                ]);

                const latestSession = sessionRes.data[0];
                const isSessionActive = latestSession
                    ? new Date() < new Date(latestSession.date_end)
                    : false;

                const title = latestSession
                    ? `${latestSession.country_name} Grand Prix - ${latestSession.session_name}`
                    : "Formula 1";
                setSessionInfo({ name: title, isLive: isSessionActive });

                // 2. Lógica da Próxima Corrida (Se não estiver ao vivo)
                if (!isSessionActive) {
                    try {
                        const nowIso = new Date().toISOString();
                        const futureSessions = await openF1Api.get<
                            ApiSession[]
                        >(`/sessions?date_start>=${nowIso}`);
                        if (futureSessions.data.length > 0) {
                            const next = futureSessions.data[0];
                            setNextRace({
                                name: `${next.country_name} Grand Prix - ${next.session_name}`,
                                date: next.date_start,
                            });
                        }
                    } catch (e) {
                        console.warn(
                            "Não foi possível carregar a próxima sessão",
                        );
                    }
                }

                // 3. Processa Pilotos
                driversRef.current = driversRes.data.filter(
                    (d, index, self) =>
                        self.findIndex(
                            (x) => x.driver_number === d.driver_number,
                        ) === index,
                );

                // 4. Agrupa os Stints para construir o Histórico
                const sMap = new Map<number, StintHistory[]>();
                stintsRes.data.forEach((stint) => {
                    const history = sMap.get(stint.driver_number) || [];
                    history.push({
                        compound: stint.compound || "UNKNOWN",
                        laps: stint.lap_end
                            ? stint.lap_end - stint.lap_start + 1
                            : stint.tyre_age_at_start,
                    });
                    sMap.set(stint.driver_number, history);
                });
                stintsMapRef.current = sMap;

                await fetchTelemetry();

                // 5. Configura o Polling de 15 em 15s (só se estiver vivo e não for fallback)
                if (isSessionActive && !isUsingFallbackRef.current) {
                    intervalId = window.setInterval(fetchTelemetry, 15000);
                }
            } catch (error: any) {
                activateFallbackMode();
            }
        };

        const fetchTelemetry = async () => {
            if (isUsingFallbackRef.current || driversRef.current.length === 0)
                return;

            try {
                setIsPolling(true);
                // Busca as posições, gaps e Laps (para pegar os setores)
                const [posRes, intRes, lapsRes] = await Promise.all([
                    openF1Api.get<ApiPosition[]>(
                        "/position?session_key=latest",
                    ),
                    openF1Api.get<ApiInterval[]>(
                        "/intervals?session_key=latest",
                    ),
                    openF1Api.get<ApiLap[]>("/laps?session_key=latest"),
                ]);

                const latestPositions = new Map<number, number>();
                posRes.data.forEach((p) =>
                    latestPositions.set(p.driver_number, p.position),
                );

                const latestGaps = new Map<number, any>();
                const latestIntervals = new Map<number, any>();
                intRes.data.forEach((i) => {
                    latestGaps.set(i.driver_number, i.gap_to_leader);
                    latestIntervals.set(i.driver_number, i.interval);
                });

                // Mapeia a última volta de cada piloto para extrair S1, S2, S3
                const latestLaps = new Map<number, ApiLap>();
                lapsRes.data.forEach((lap) => {
                    const existing = latestLaps.get(lap.driver_number);
                    if (!existing || lap.lap_number > existing.lap_number) {
                        latestLaps.set(lap.driver_number, lap);
                    }
                });

                const formatTime = (raw: any, isLeader: boolean) => {
                    if (isLeader) return "---";
                    if (raw === undefined || raw === null) return "PIT";
                    const num = Number(raw);
                    if (
                        (!isNaN(num) && typeof raw !== "string") ||
                        (typeof raw === "string" &&
                            !isNaN(num) &&
                            raw.trim() !== "")
                    ) {
                        return `+${num.toFixed(3)}s`;
                    }
                    return String(raw);
                };

                const merged: LiveDriver[] = driversRef.current.map(
                    (driver) => {
                        const pos =
                            latestPositions.get(driver.driver_number) || 99;
                        const isLeader = pos === 1;
                        const history =
                            stintsMapRef.current.get(driver.driver_number) ||
                            [];
                        const lastLap = latestLaps.get(driver.driver_number);

                        return {
                            number: driver.driver_number,
                            position: pos,
                            acronym:
                                driver.name_acronym ||
                                `#${driver.driver_number}`,
                            team: driver.team_name,
                            color:
                                TEAM_COLORS[driver.team_name] ||
                                `#${driver.team_colour}` ||
                                "#888",
                            gapToLeader: formatTime(
                                latestGaps.get(driver.driver_number),
                                isLeader,
                            ),
                            interval: formatTime(
                                latestIntervals.get(driver.driver_number),
                                isLeader,
                            ),
                            stints: history,
                            pits: history.length > 0 ? history.length - 1 : 0,
                            s1: lastLap?.duration_sector_1 || null,
                            s2: lastLap?.duration_sector_2 || null,
                            s3: lastLap?.duration_sector_3 || null,
                        };
                    },
                );

                merged.sort((a, b) => a.position - b.position);
                setLiveData(merged);
            } catch (error) {
                activateFallbackMode();
            } finally {
                setIsPolling(false);
            }
        };

        initializeRealtime();

        return () => {
            if (intervalId) window.clearInterval(intervalId);
        };
    }, []);

    // Formatação
    const formatSector = (sec: number | null) => (sec ? sec.toFixed(3) : "-");
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("pt-PT", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className={styles.page}>
            {/* BANNER DA PRÓXIMA CORRIDA (Exibido se não estiver ao vivo) */}
            {!sessionInfo.isLive && nextRace && (
                <div className={styles.nextRaceBanner}>
                    <div className={styles.bannerInfo}>
                        <span>Próxima Sessão Oficial</span>
                        <strong>{nextRace.name}</strong>
                    </div>
                    <div
                        className={styles.bannerInfo}
                        style={{ alignItems: "flex-end" }}
                    >
                        <span>Horário Local</span>
                        <strong>{formatDate(nextRace.date)}</strong>
                    </div>
                </div>
            )}

            {/* CABEÇALHO DA SESSÃO */}
            <div className={styles.sessionHeader}>
                <div className={styles.titleArea}>
                    <h1>🏁 {sessionInfo.name}</h1>
                    <span
                        className={`${styles.status} ${sessionInfo.isLive ? styles.live : styles.finalised}`}
                    >
                        {sessionInfo.isLive ? "● LIVE" : "Finalised"}
                        {isPolling && " (Sincronizando...)"}
                        {isUsingFallback && " (Modo Offline)"}
                    </span>
                </div>
            </div>

            {apiError && !isUsingFallback ? (
                <div style={{ color: "#ff4d4d", marginTop: "2rem" }}>
                    {apiError}
                </div>
            ) : (
                <div className={styles.dataGrid}>
                    {/* CABEÇALHO DA TABELA */}
                    <div className={styles.gridHeader}>
                        <span>Pos</span>
                        <span>Driver</span>
                        <span>Stint History</span>
                        <span className={styles.centerAlign}>Pits</span>
                        <span className={styles.centerAlign}>S1</span>
                        <span className={styles.centerAlign}>S2</span>
                        <span className={styles.centerAlign}>S3</span>
                        <span className={styles.rightAlign}>Leader</span>
                        <span className={styles.rightAlign}>Interval</span>
                    </div>

                    {/* CORPO DA TABELA */}
                    <div className={styles.gridBody}>
                        {liveData.length === 0 ? (
                            <div style={{ padding: "2rem", color: "#666" }}>
                                Carregando telemetria...
                            </div>
                        ) : (
                            liveData.map((driver) => (
                                <div
                                    key={driver.number}
                                    className={styles.driverRow}
                                >
                                    <div className={styles.pos}>
                                        {driver.position !== 99
                                            ? driver.position
                                            : "-"}
                                    </div>

                                    <div className={styles.driverInfo}>
                                        <span className={styles.acronym}>
                                            {driver.acronym}
                                        </span>
                                        <span
                                            className={styles.team}
                                            style={{ color: driver.color }}
                                        >
                                            {driver.team}
                                        </span>
                                    </div>

                                    {/* Histórico Visual de Pneus */}
                                    <div className={styles.stintHistory}>
                                        {driver.stints.map((stint, idx) => {
                                            const tyre =
                                                TYRE_CONFIG[stint.compound] ||
                                                TYRE_CONFIG["UNKNOWN"];
                                            return (
                                                <div
                                                    key={idx}
                                                    className={styles.tyreDot}
                                                    style={{
                                                        borderColor: tyre.color,
                                                    }}
                                                    title={`${stint.laps} voltas`}
                                                >
                                                    {tyre.letter}
                                                </div>
                                            );
                                        })}
                                        {driver.stints.length === 0 && (
                                            <span
                                                style={{
                                                    color: "#666",
                                                    fontSize: "0.7rem",
                                                }}
                                            >
                                                N/A
                                            </span>
                                        )}
                                    </div>

                                    <div className={styles.pits}>
                                        {driver.pits}
                                    </div>

                                    {/* Tempos de Setores */}
                                    <div
                                        className={`${styles.sector} ${!driver.s1 ? styles.empty : ""}`}
                                    >
                                        {formatSector(driver.s1)}
                                    </div>
                                    <div
                                        className={`${styles.sector} ${!driver.s2 ? styles.empty : ""}`}
                                    >
                                        {formatSector(driver.s2)}
                                    </div>
                                    <div
                                        className={`${styles.sector} ${!driver.s3 ? styles.empty : ""}`}
                                    >
                                        {formatSector(driver.s3)}
                                    </div>

                                    <div className={styles.leaderGap}>
                                        {driver.gapToLeader}
                                    </div>
                                    <div className={styles.intervalGap}>
                                        {driver.interval}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
