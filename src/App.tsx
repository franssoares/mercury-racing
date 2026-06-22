import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { Home } from "./pages/Home/Home";
import { Standings } from "./pages/Standings/Standings";
import { Calendar } from "./pages/Calendar/Calendar";
import { Login } from "./pages/Login/Login";
import { NotFound } from "./pages/NotFound";
import { Realtime } from "./pages/Realtime/Realtime";
import { DriverProfile } from "./pages/DriverProfile/DriverProfile";
import { H2H } from "./pages/H2H/H2H";
import { AppDashboard } from "./pages/AppDashboard";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    {/* Rotas Públicas */}
                    <Route path="/" element={<Home />} />
                    <Route path="/standings" element={<Standings />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/drivers/:id?" element={<DriverProfile />} />
                    <Route path="/login" element={<Login />} />

                    {/* Rotas Protegidas */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/app" element={<AppDashboard />}>
                            <Route path="h2h" element={<H2H />} />
                            <Route path="realtime" element={<Realtime />} />
                        </Route>
                    </Route>

                    {/* Rota 404 (Sempre por último) */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
