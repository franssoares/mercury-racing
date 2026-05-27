import { Outlet } from "react-router-dom";

export const AppDashboard = () => {
    return (
        <div>
            <h1>Dashboard Analítico</h1>
            {/* O Outlet é onde o H2H ou Realtime aparecerá */}
            <Outlet />
        </div>
    );
};
