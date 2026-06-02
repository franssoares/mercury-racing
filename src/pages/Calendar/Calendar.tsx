import { useEffect, useState, useMemo } from "react";
import { openF1Api } from "../../services/openF1Api";
import styles from "./Calendar.module.scss";

interface Session {
    circuit_key: number;
    circuit_short_name: string;
    country_code: string;
    country_key: number;
    country_name: string;
    date_end: string;
    date_start: string;
    gmt_offset: string;
    is_cancelled: boolean;
    location: string;
    meeting_key: number;
    session_key: number;
    session_name: string;
    session_type: string;
    year: number;
}

interface Meeting {
    meeting_key: number;
    country_name: string;
    location: string;
    circuit_short_name: string;
    sessions: Session[];
    startDate: Date;
    endDate: Date;
}

export const Calendar = () => {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [filtroPesquisa, setFiltroPesquisa] = useState("");
    const [anoSelecionado, setAnoSelecionado] = useState<number>(
        new Date().getFullYear(),
    );
    const anosDisponiveis = [2023, 2024, 2025, 2026];

    useEffect(() => {
        const fetchCalendar = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await openF1Api.get<Session[]>(
                    `/sessions?year=${anoSelecionado}`,
                );
                const todasSessoes = response.data;

                const agrupados: Record<number, Meeting> = {};

                todasSessoes.forEach((session) => {
                    if (!agrupados[session.meeting_key]) {
                        agrupados[session.meeting_key] = {
                            meeting_key: session.meeting_key,
                            country_name: session.country_name,
                            location: session.location,
                            circuit_short_name: session.circuit_short_name,
                            sessions: [],
                            startDate: new Date(session.date_start),
                            endDate: new Date(session.date_end),
                        };
                    }
                    agrupados[session.meeting_key].sessions.push(session);
                });

                const listaMeetings = Object.values(agrupados).map(
                    (meeting) => {
                        meeting.sessions.sort(
                            (a, b) =>
                                new Date(a.date_start).getTime() -
                                new Date(b.date_start).getTime(),
                        );
                        meeting.startDate = new Date(
                            meeting.sessions[0].date_start,
                        );
                        meeting.endDate = new Date(
                            meeting.sessions[meeting.sessions.length - 1]
                                .date_end,
                        );
                        return meeting;
                    },
                );

                setMeetings(listaMeetings);
            } catch (err) {
                setError("Não foi possível carregar o calendário das sessões.");
            } finally {
                setLoading(false);
            }
        };

        fetchCalendar();
    }, [anoSelecionado]);

    const proximoGP = useMemo<Meeting | undefined>(() => {
        const hoje = new Date();
        // Garantimos que a lista base está ordenada cronologicamente antes de procurar o próximo
        const listaCronologica = [...meetings].sort(
            (a, b) => a.startDate.getTime() - b.startDate.getTime(),
        );
        return listaCronologica.find((meeting) => meeting.endDate > hoje);
    }, [meetings]);

    const proximaSessao = useMemo<Session | null>(() => {
        const hoje = new Date();
        let proxima: Session | null = null;
        let menorDiferenca = Infinity;
        const agora = hoje.getTime();

        meetings.forEach((meeting) => {
            meeting.sessions.forEach((session) => {
                const tempoSessao = new Date(session.date_start).getTime();
                if (
                    tempoSessao > agora &&
                    tempoSessao - agora < menorDiferenca
                ) {
                    menorDiferenca = tempoSessao - agora;
                    proxima = session;
                }
            });
        });

        return proxima;
    }, [meetings]);

    // LÓGICA NOVA DE ORDENAÇÃO (Próxima corrida no topo, passadas depois)
    const meetingsOrganizados = useMemo(() => {
        const hoje = new Date().getTime();

        // 1. Aplicar o filtro de pesquisa primeiro
        const filtrados = meetings.filter(
            (meeting) =>
                meeting.country_name
                    .toLowerCase()
                    .includes(filtroPesquisa.toLowerCase()) ||
                meeting.circuit_short_name
                    .toLowerCase()
                    .includes(filtroPesquisa.toLowerCase()),
        );

        // 2. Se for um ano passado (ex: 2023), mostramos na ordem cronológica normal (Janeiro a Dezembro)
        if (anoSelecionado < new Date().getFullYear()) {
            return filtrados.sort(
                (a, b) => a.startDate.getTime() - b.startDate.getTime(),
            );
        }

        // 3. Se for o ano atual, separamos o que já passou do que ainda vem aí
        const futuras = filtrados.filter((m) => m.endDate.getTime() >= hoje);
        const passadas = filtrados.filter((m) => m.endDate.getTime() < hoje);

        // Futuras: A mais próxima fica no topo (Ordem crescente)
        futuras.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

        // Passadas: A corrida que terminou mais recentemente fica logo abaixo (Ordem decrescente)
        passadas.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

        // Juntamos as duas listas
        return [...futuras, ...passadas];
    }, [meetings, filtroPesquisa, anoSelecionado]);

    return (
        <div className={styles.calendarContainer}>
            {/* CABEÇALHO COM TÍTULO E SELETOR DE ANO */}
            <div className={styles.headerControls}>
                <h1 className={styles.title}>Calendário F1</h1>

                <div className={styles.yearSelector}>
                    <label htmlFor="ano">Temporada:</label>
                    <select
                        id="ano"
                        value={anoSelecionado}
                        onChange={(e) =>
                            setAnoSelecionado(Number(e.target.value))
                        }
                    >
                        {anosDisponiveis.map((ano) => (
                            <option key={ano} value={ano}>
                                {ano}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.searchContainer}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Pesquisar por país ou circuito..."
                    value={filtroPesquisa}
                    onChange={(e) => setFiltroPesquisa(e.target.value)}
                />
            </div>

            {loading && (
                <h2 className={styles.loadingMessage}>
                    Carregando calendário...
                </h2>
            )}

            {error && <h2 className={styles.errorMessage}>{error}</h2>}

            {/* LINHA DO TEMPO */}
            {!loading && !error && (
                <div className={styles.timeline}>
                    {/* Agora iteramos sobre meetingsOrganizados em vez de meetingsFiltrados */}
                    {meetingsOrganizados.map((meeting) => {
                        const isProximoGp =
                            proximoGP?.meeting_key === meeting.meeting_key;

                        // Adicionamos uma opacidade menor para as corridas que já passaram para dar foco visual às futuras
                        const jaPassou =
                            meeting.endDate.getTime() < new Date().getTime();

                        return (
                            <div
                                key={meeting.meeting_key}
                                className={`${styles.timelineItem} ${isProximoGp ? styles.highlightedItem : ""}`}
                                style={{ opacity: jaPassou ? 0.6 : 1 }} // Feedback visual extra para corridas passadas
                            >
                                {/* Bolinha na linha do tempo */}
                                <div className={styles.timelineDot}></div>

                                <div className={styles.timelineContent}>
                                    <h3 className={styles.gpCardTitle}>
                                        {meeting.country_name}
                                        {jaPassou && (
                                            <span
                                                style={{
                                                    fontSize: "0.8rem",
                                                    color: "#ccc",
                                                    marginLeft: "10px",
                                                }}
                                            >
                                                (Finalizado)
                                            </span>
                                        )}
                                    </h3>
                                    <p className={styles.gpCardLocation}>
                                        📍 {meeting.circuit_short_name} (
                                        {meeting.location})
                                    </p>

                                    <div className={styles.sessionsContainer}>
                                        <h4 className={styles.sessionsTitle}>
                                            Sessões:
                                        </h4>

                                        {meeting.sessions
                                            .filter(
                                                (s) =>
                                                    s.session_name.includes(
                                                        "Race",
                                                    ) ||
                                                    s.session_name.includes(
                                                        "Qualifying",
                                                    ) ||
                                                    s.session_name.includes(
                                                        "Sprint",
                                                    ) ||
                                                    s.session_name.includes(
                                                        "Practice",
                                                    ),
                                            )
                                            .map((session) => {
                                                const isSessaoDestacada =
                                                    proximaSessao?.session_key ===
                                                    session.session_key;

                                                return (
                                                    <div
                                                        key={
                                                            session.session_key
                                                        }
                                                        className={`${styles.sessionRow} ${isSessaoDestacada ? styles.nextSessionGlow : ""}`}
                                                    >
                                                        <span>
                                                            {
                                                                session.session_name
                                                            }
                                                            {isSessaoDestacada && (
                                                                <span
                                                                    className={
                                                                        styles.badgeProxima
                                                                    }
                                                                >
                                                                    A Seguir
                                                                </span>
                                                            )}
                                                        </span>
                                                        <span
                                                            className={
                                                                styles.sessionTime
                                                            }
                                                        >
                                                            {new Date(
                                                                session.date_start,
                                                            ).toLocaleDateString(
                                                                "pt-BR",
                                                            )}{" "}
                                                            -{" "}
                                                            {new Date(
                                                                session.date_start,
                                                            ).toLocaleTimeString(
                                                                "pt-BR",
                                                                {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                },
                                                            )}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {meetingsOrganizados.length === 0 && (
                        <p className={styles.emptyMessage}>
                            Nenhum Grand Prix encontrado para "{filtroPesquisa}
                            ".
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
