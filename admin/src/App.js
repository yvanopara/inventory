import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Products from "./pages/Products/Products";
import AddProduct from "./pages/AddProduct/AddProduct";
import EditProduct from "./pages/EditProduct/EditProduct";
import StockHistory from "./pages/StockHistory/StockHistory";
import LowStockAlerts from "./pages/LowStockAlerts/LowStockAlerts";
// import AddSale from "./pages/AddSale/AddSale";
import DailySummary from "./pages/saleHistory/DailySummary/DailySummary";
import WeeklySummary from "./pages/saleHistory/WeeklySummary/WeeklySummary";
import MonthlySummary from "./pages/saleHistory/MonthlySummary/MonthlySummary";
import WeeklySalesChart from "./pages/WeeklySalesChart/WeeklySalesChart";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Login />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/add" element={<AddProduct />} />
          <Route path="/products/edit/:id" element={<EditProduct />} />
          <Route path="/products/history/:id" element={<StockHistory />} />
          <Route path="/alerts/low-stock" element={<LowStockAlerts />} />
          {/* <Route path="/sales/add" element={<AddSale />} /> */}

          <Route path="/daily-summary" element={<DailySummary/>} />
          <Route path="/weekly-summary" element={<WeeklySummary />} />
          <Route path="/monthly-summary" element={<MonthlySummary />} />
          <Route path="/graph-summary" element={<WeeklySalesChart />} />

          

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
