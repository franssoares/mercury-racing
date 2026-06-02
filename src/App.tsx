import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { Home } from "./pages/Home";
import { Standings } from "./pages/Standings";
import { Calendar } from "./pages/Calendar/Calendar";
import { Login } from "./pages/Login/Login";
import { NotFound } from "./pages/NotFound";
import { Realtime } from "./pages/Realtime";
import { DriverProfile } from "./pages/DriverProfile";
import { H2H } from "./pages/H2H";
import { AppDashboard } from "./pages/AppDashboard";

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/standings" element={<Standings />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/drivers" element={<DriverProfile />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/app" element={<AppDashboard />}>
                        <Route path="h2h" element={<H2H />} />
                        <Route path="realtime" element={<Realtime />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
