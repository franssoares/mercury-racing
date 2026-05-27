import type { ReactNode } from "react";
import {
    House,
    Calendar,
    Trophy,
    ChartBar,
    Timer,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";

interface LayoutProps {
    children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
            }}
        >
            {/* Header Global */}
            <header
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "1rem 2rem",
                    borderBottom: "1px solid #ccc",
                    alignItems: "center",
                }}
            >
                <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                    Mercury Racing
                </div>
                <Link
                    to="/login"
                    style={{ textDecoration: "none", color: "blue" }}
                >
                    Login
                </Link>
            </header>

            <div style={{ display: "flex", flex: 1 }}>
                {/* Sidebar */}
                <aside
                    style={{
                        width: "200px",
                        borderRight: "1px solid #ccc",
                        padding: "1rem",
                    }}
                >
                    <nav
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                        }}
                    >
                        <Link to="/">
                            <House /> Home
                        </Link>
                        <Link to="/calendar">
                            <Calendar /> Calendar
                        </Link>
                        <Link to="/standings">
                            <Trophy /> Standings
                        </Link>
                        <Link to="/drivers">
                            <ChartBar /> Drivers
                        </Link>
                        <Link to="/app/h2h">
                            <Trophy /> H2H
                        </Link>
                        <Link to="/app/realtime">
                            <Timer /> Real-Time
                        </Link>
                    </nav>
                </aside>

                {/* Conteúdo */}
                <main style={{ flex: 1, padding: "1rem" }}>{children}</main>
            </div>
        </div>
    );
};
