import { Outlet } from "react-router-dom";

export const AppDashboard = () => {
    return (
        <div style={{ width: "100%", height: "100%" }}>
            <Outlet />
        </div>
    );
};
