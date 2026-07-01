const COUNTRY_NAME_MAP: Record<string, string> = {
    Australia: "Austrália",
    Austria: "Áustria",
    Azerbaijan: "Azerbaijão",
    Bahrain: "Bahrein",
    Belgium: "Bélgica",
    Brazil: "Brasil",
    Canada: "Canadá",
    China: "China",
    France: "França",
    Germany: "Alemanha",
    "Great Britain": "Reino Unido",
    Hungary: "Hungria",
    Italy: "Itália",
    Japan: "Japão",
    Mexico: "México",
    Monaco: "Mônaco",
    Netherlands: "Países Baixos",
    Portugal: "Portugal",
    Qatar: "Catar",
    "Saudi Arabia": "Arábia Saudita",
    Singapore: "Singapura",
    "South Africa": "África do Sul",
    Spain: "Espanha",
    Turkey: "Turquia",
    "United Arab Emirates": "Emirados Árabes Unidos",
    "United Kingdom": "Reino Unido",
    "United States": "Estados Unidos",
};

const SESSION_NAME_MAP: Record<string, string> = {
    Race: "Corrida",
    "Free Practice 1": "Treino Livre 1",
    "Free Practice 2": "Treino Livre 2",
    "Free Practice 3": "Treino Livre 3",
    "Free Practice 4": "Treino Livre 4",
    Practice: "Treino Livre",
    "Practice 1": "Treino Livre 1",
    "Practice 2": "Treino Livre 2",
    "Practice 3": "Treino Livre 3",
    "Practice 4": "Treino Livre 4",
    Qualifying: "Classificação",
    "Sprint Shootout": "Classificação Sprint",
    Sprint: "Sprint",
    "Warm Up": "Aquecimento",
    "Warm-up": "Aquecimento",
    "Grand Prix": "Grande Prêmio",
};

const TEAM_NAME_MAP: Record<string, string> = {
    McLaren: "McLaren",
    Ferrari: "Ferrari",
    "Red Bull Racing": "Red Bull Racing",
    Mercedes: "Mercedes",
    "Aston Martin": "Aston Martin",
    Alpine: "Alpine",
    "Haas F1 Team": "Haas F1 Team",
    Williams: "Williams",
    RB: "RB",
    "Kick Sauber": "Kick Sauber",
    Audi: "Audi",
    Cadillac: "Cadillac",
    "Racing Bulls": "Racing Bulls",
};

export const translateCountryName = (value?: string | null) => {
    if (!value) return "";
    return COUNTRY_NAME_MAP[value] ?? value;
};

export const translateSessionName = (value?: string | null) => {
    if (!value) return "";
    return SESSION_NAME_MAP[value] ?? value;
};

export const translateTeamName = (value?: string | null) => {
    if (!value) return "";
    return TEAM_NAME_MAP[value] ?? value;
};

export const translateApiText = (value?: string | null) => {
    if (!value) return "";

    const normalized = value
        .replace(/\bGrand Prix\b/gi, "Grande Prêmio")
        .replace(/\bFree Practice\b/gi, "Treino Livre")
        .replace(/\bPractice\b/gi, "Treino Livre")
        .replace(/\bQualifying\b/gi, "Classificação")
        .replace(/\bSprint Shootout\b/gi, "Classificação Sprint")
        .replace(/\bWarm Up\b/gi, "Aquecimento")
        .replace(/\bWarm-up\b/gi, "Aquecimento")
        .replace(/\bRace\b/gi, "Corrida")
        .replace(/\bFinalised\b/gi, "Finalizada")
        .replace(/\bFinalized\b/gi, "Finalizada")
        .replace(/\bLive\b/gi, "Ao vivo")
        .replace(/\bDriver\b/gi, "Piloto")
        .replace(/\bLeader\b/gi, "Líder")
        .replace(/\bInterval\b/gi, "Intervalo")
        .replace(/\bPits\b/gi, "Boxes")
        .replace(/\bStint History\b/gi, "Histórico de stint")
        .replace(/\bSession\b/gi, "Sessão")
        .replace(/\bNext Session\b/gi, "Próxima sessão")
        .replace(/\bCalendar\b/gi, "Calendário")
        .replace(/\bLoading\b/gi, "Carregando")
        .replace(/\bFormula 1\b/gi, "Fórmula 1")
        .replace(/\bOffline\b/gi, "offline")
        .replace(/\bPIT\b/gi, "BOX");

    return normalized;
};
