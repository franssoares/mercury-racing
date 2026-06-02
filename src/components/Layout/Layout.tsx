import type { ReactNode } from "react";
import {
    House,
    Calendar,
    Trophy,
    ChartBar,
    Timer,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import styles from "./Layout.module.scss";

interface LayoutProps {
    children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    return (
        <div className={styles["layout-container"]}>
            <header className={styles.header}>
                <div className={styles.content}>Mercury Racing</div>
                <Link to="/login" className={styles.loginLink}>
                    Login
                </Link>
            </header>

            <aside>
                <nav className={styles.sidebar}>
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
            <main className={styles.mainContent}>{children}</main>
            <footer className={styles.footer}>
                <div>rights</div>
                <div>content</div>
                <div>version</div>
            </footer>
        </div>
    );
};
