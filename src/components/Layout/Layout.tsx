import { useEffect, useState, type ReactNode } from "react";
import {
    House,
    Calendar,
    Trophy,
    ChartBar,
    Timer,
    UserCircle,
    SignOut,
} from "@phosphor-icons/react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "../../services/firebase";
import styles from "./Layout.module.scss";

interface LayoutProps {
    children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            console.error("Erro ao fazer logout", error);
        }
    };

    return (
        <div className={styles["layout-container"]}>
            {/* CABEÇALHO */}
            <header className={styles.header}>
                <div className={styles.content}>Mercury Racing</div>

                <div className={styles.userArea}>
                    {user ? (
                        <>
                            <div className={styles.userInfo}>
                                <UserCircle size={28} />
                                <span>{user.email?.split("@")[0]}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className={styles.logoutBtn}
                                title="Sair"
                            >
                                <SignOut size={22} weight="bold" />
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className={styles.loginLink}>
                            Login seguro
                        </Link>
                    )}
                </div>
            </header>

            {/* SIDEBAR / NAVEGAÇÃO */}
            <aside>
                <nav className={styles.sidebar}>
                    <Link to="/">
                        <House /> Painel
                    </Link>
                    <Link to="/calendar">
                        <Calendar /> Calendário
                    </Link>
                    <Link to="/standings">
                        <Trophy /> Classificação
                    </Link>
                    <Link to="/drivers">
                        <ChartBar /> Pilotos
                    </Link>
                    <Link to="/app/h2h">
                        <Trophy /> H2H
                    </Link>
                    <Link to="/app/realtime">
                        <Timer /> Telemetria ao vivo
                    </Link>
                </nav>
            </aside>

            {/* CONTEÚDO PRINCIPAL (ONDE AS PÁGINAS RENDERIZAM) */}
            <main className={styles.mainContent}>{children}</main>

            {/* RODAPÉ */}
            <footer className={styles.footer}>
                <div>© 2026 Mercury Racing</div>
                <div>Sistema de telemetria</div>
                <div>v1.2.0</div>
            </footer>
        </div>
    );
};
