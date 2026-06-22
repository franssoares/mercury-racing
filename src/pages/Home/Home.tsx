// src/pages/Home/Home.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Home.module.scss";

interface Meeting {
    meeting_key: number;
    meeting_name: string;
    circuit_short_name: string;
    country_name: string;
    country_flag: string;
    circuit_image: string;
    date_start: string;
    date_end: string;
    location: string;
}

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

// Cache de módulo
let cachedMeetings: Meeting[] | null = null;
let cachedTop3: ChampionshipDriver[] | null = null;
let cachedDriverInfo: Record<number, DriverInfo> | null = null;
let pendingHome: Promise<void> | null = null;

// Calcula tempo restante até uma data
function useCountdown(targetDate: string | null) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        if (!targetDate) return;

        const tick = () => {
            const diff = new Date(targetDate).getTime() - Date.now();
            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }
            setTimeLeft({
                days: Math.floor(diff / 86400000),
                hours: Math.floor((diff % 86400000) / 3600000),
                minutes: Math.floor((diff % 3600000) / 60000),
                seconds: Math.floor((diff % 60000) / 1000),
            });
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [targetDate]);

    return timeLeft;
}

export const Home = () => {
    const navigate = useNavigate();

    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [top3, setTop3] = useState<ChampionshipDriver[]>([]);
    const [driverInfo, setDriverInfo] = useState<Record<number, DriverInfo>>(
        {},
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            // Usa cache se disponível
            if (cachedMeetings && cachedTop3 && cachedDriverInfo) {
                setMeetings(cachedMeetings);
                setTop3(cachedTop3);
                setDriverInfo(cachedDriverInfo);
                setLoading(false);
                return;
            }

            if (pendingHome) {
                await pendingHome;
                if (cachedMeetings && cachedTop3 && cachedDriverInfo) {
                    setMeetings(cachedMeetings);
                    setTop3(cachedTop3);
                    setDriverInfo(cachedDriverInfo);
                    setLoading(false);
                }
                return;
            }

            pendingHome = (async () => {
                try {
                    const [meetingsRes, champRes, infoRes] = await Promise.all([
                        axios.get<Meeting[]>(`${BASE}/meetings?year=2026`),
                        axios.get<ChampionshipDriver[]>(
                            `${BASE}/championship_drivers?session_key=latest`,
                        ),
                        axios.get<DriverInfo[]>(
                            `${BASE}/drivers?session_key=latest`,
                        ),
                    ]);

                    const sortedMeetings = [...meetingsRes.data].sort(
                        (a, b) =>
                            new Date(a.date_start).getTime() -
                            new Date(b.date_start).getTime(),
                    );

                    const top3Sorted = [...champRes.data]
                        .sort((a, b) => a.position_current - b.position_current)
                        .slice(0, 3);

                    const infoMap: Record<number, DriverInfo> = {};
                    for (const d of infoRes.data) {
                        infoMap[d.driver_number] = d;
                    }

                    cachedMeetings = sortedMeetings;
                    cachedTop3 = top3Sorted;
                    cachedDriverInfo = infoMap;

                    setMeetings(sortedMeetings);
                    setTop3(top3Sorted);
                    setDriverInfo(infoMap);
                } catch (e) {
                    // silently fail — widgets ficam vazios
                } finally {
                    setLoading(false);
                    pendingHome = null;
                }
            })();

            await pendingHome;
        };

        load();
    }, []);

    // Encontra a próxima corrida (date_start no futuro)
    const nextRace =
        meetings.find((m) => new Date(m.date_start) > new Date()) ?? null;
    const countdown = useCountdown(nextRace?.date_start ?? null);

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    return (
        <div className={styles.page}>
            {/* Hero Banner */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <span className={styles.heroEyebrow}>Temporada 2026</span>
                    <h1 className={styles.heroTitle}>
                        Sua{" "}
                        <span className={styles.heroAccent}>pole position</span>
                        <br />
                        para dados da F1.
                    </h1>
                    <p className={styles.heroSub}>
                        Classificações, calendário e telemetria — sem anúncios,
                        sem ruído.
                    </p>
                    <div className={styles.heroActions}>
                        <button
                            className={styles.btnPrimary}
                            onClick={() => navigate("/standings")}
                        >
                            Ver Classificação
                        </button>
                        <button
                            className={styles.btnSecondary}
                            onClick={() => navigate("/calendar")}
                        >
                            Calendário
                        </button>
                    </div>
                </div>
                <div className={styles.heroDecor} aria-hidden="true">
                    <div className={styles.heroCircle} />
                </div>
            </section>

            {/* Widgets */}
            <section className={styles.widgets}>
                {/* Countdown */}
                <div className={styles.widget}>
                    <p className={styles.widgetLabel}>Próxima Corrida</p>

                    {loading && <div className={styles.skeletonBlock} />}

                    {!loading && nextRace && (
                        <>
                            <div className={styles.nextRaceHeader}>
                                {nextRace.country_flag && (
                                    <img
                                        src={nextRace.country_flag}
                                        alt={nextRace.country_name}
                                        className={styles.flag}
                                    />
                                )}
                                <div>
                                    <h2 className={styles.raceName}>
                                        {nextRace.meeting_name}
                                    </h2>
                                    <span className={styles.raceLocation}>
                                        {nextRace.location} ·{" "}
                                        {formatDate(nextRace.date_start)}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.countdown}>
                                {[
                                    { value: countdown.days, label: "dias" },
                                    { value: countdown.hours, label: "h" },
                                    { value: countdown.minutes, label: "min" },
                                    { value: countdown.seconds, label: "seg" },
                                ].map(({ value, label }) => (
                                    <div
                                        key={label}
                                        className={styles.countdownUnit}
                                    >
                                        <span className={styles.countdownNum}>
                                            {String(value).padStart(2, "0")}
                                        </span>
                                        <span className={styles.countdownLabel}>
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {!loading && !nextRace && (
                        <p className={styles.empty}>Temporada encerrada.</p>
                    )}
                </div>

                {/* Top 3 */}
                <div className={styles.widget}>
                    <p className={styles.widgetLabel}>
                        Championship Quick View
                    </p>

                    {loading && (
                        <>
                            <div className={styles.skeletonRow} />
                            <div className={styles.skeletonRow} />
                            <div className={styles.skeletonRow} />
                        </>
                    )}

                    {!loading &&
                        top3.map((d, i) => {
                            const info = driverInfo[d.driver_number];
                            const teamName = info?.team_name ?? "";
                            const color = TEAM_COLORS[teamName] ?? "#888";
                            const medals = ["🥇", "🥈", "🥉"];

                            return (
                                <button
                                    key={d.driver_number}
                                    className={styles.top3Row}
                                    onClick={() =>
                                        navigate(`/drivers/${d.driver_number}`)
                                    }
                                >
                                    <span className={styles.medal}>
                                        {medals[i]}
                                    </span>
                                    {info?.headshot_url && (
                                        <img
                                            src={info.headshot_url}
                                            alt={info.full_name}
                                            className={styles.top3Headshot}
                                        />
                                    )}
                                    <div className={styles.top3Info}>
                                        <span className={styles.top3Acronym}>
                                            {info?.name_acronym ??
                                                `#${d.driver_number}`}
                                        </span>
                                        <span
                                            className={styles.top3Team}
                                            style={{ color }}
                                        >
                                            {teamName}
                                        </span>
                                    </div>
                                    <span className={styles.top3Pts}>
                                        {d.points_current} pts
                                    </span>
                                </button>
                            );
                        })}
                </div>
            </section>
        </div>
    );
};
