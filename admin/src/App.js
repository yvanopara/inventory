import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";

import Products from "./pages/Products/Products";
import AddProduct from "./pages/AddProduct/AddProduct";
import EditProduct from "./pages/EditProduct/EditProduct";
import StockHistory from "./pages/StockHistory/StockHistory";

import LowStockAlerts from "./pages/LowStockAlerts/LowStockAlerts";

import DailySummary from "./pages/saleHistory/DailySummary/DailySummary";
import WeeklySummary from "./pages/saleHistory/WeeklySummary/WeeklySummary";
import MonthlySummary from "./pages/saleHistory/MonthlySummary/MonthlySummary";
import YearlySummary from "./pages/saleHistory/YearlySummary/YearlySummary";

import WeeklySalesChart from "./pages/saleGraphs/WeeklySalesChart/WeeklySalesChart";
import MonthlySalesChart from "./pages/saleGraphs/MonthlySalesChart/MonthlySalesChart";
import YearlySummaryChart from "./pages/saleGraphs/YearlySummary/YearlySummary";

import StockMovements from "./pages/stockMovement/StockMovements";
import SidebarMenu from "./components/SidebarMenu/SidebarMenu";
import CancelSale from "./pages/cancelSale/cancelSale";

function AppContent() {
  const location = useLocation();

  return (
    <>
      {/* Affiche le sidebar uniquement si on n'est pas sur la page login */}
      {location.pathname !== "/" && <SidebarMenu />}

      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/products" element={<Products />} />
        <Route path="/products/add" element={<AddProduct />} />
        <Route path="/products/edit/:id" element={<EditProduct />} />
        <Route path="/products/history/:id" element={<StockHistory />} />

        <Route path="/alerts/low-stock" element={<LowStockAlerts />} />

        <Route path="/daily-summary" element={<DailySummary />} />
        <Route path="/weekly-summary" element={<WeeklySummary />} />
        <Route path="/monthly-summary" element={<MonthlySummary />} />
        <Route path="/yearly-summary" element={<YearlySummary />} />

        <Route path="/graph/week" element={<WeeklySalesChart />} />
        <Route path="/graph/month" element={<MonthlySalesChart />} />
        <Route path="/graph/anual" element={<YearlySummaryChart />} />

        <Route path="/stock-movement" element={<StockMovements />} />

        <Route path="/cancel-sale" element={<CancelSale />} />
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
