import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./AuthContext";

import Login from "./pages/login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import AddSale from "./pages/AddSale/AddSale";

import DailySummary from "./pages/saleHistory/DailySummary/DailySummary";
import WeeklySummary from "./pages/saleHistory/WeeklySummary/WeeklySummary";
import MonthlySummary from "./pages/saleHistory/MonthlySummary/MonthlySummary";

import ReserveSales from "./pages/ReserveSale/ReserveSale";
import SidebarMenu from "./components/sideBarMenu/sideBarMenu";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// export const backendUrl = "http://localhost:5000";
export const backendUrl = "https://inventory2-uexd.onrender.com";

function AppContent() {
  const location = useLocation();

  return (
    <>
      {/* Sidebar visible seulement si ce n’est pas la page login */}
      {location.pathname !== "/" && <SidebarMenu />}

      <ToastContainer position="top-center" />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-sale" element={<AddSale />} />

        {/* Historiques */}
        <Route path="/daily-summary" element={<DailySummary />} />
        <Route path="/weekly-summary" element={<WeeklySummary />} />
        <Route path="/monthly-summary" element={<MonthlySummary />} />

        {/* Réservations */}
        <Route path="/reservation" element={<ReserveSales />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
