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
import WeeklySalesChart from "./pages/saleGraphs/WeeklySalesChart/WeeklySalesChart";
import MonthlySalesChart from "./pages/saleGraphs/MonthlySalesChart/MonthlySalesChart";
import StockMovements from "./pages/stockMovement/StockMovements";
import YearlySummary from "./pages/saleHistory/YearlySummary/YearlySummary";
import YearlySummaryChart from "./pages/saleGraphs/YearlySummary/YearlySummary";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          {/* <Route path="*" element={<Login />} /> */}
          <Route path="/products" element={<Products />} />
          <Route path="/products/add" element={<AddProduct />} />
          <Route path="/products/edit/:id" element={<EditProduct />} />
          <Route path="/products/history/:id" element={<StockHistory />} />
          <Route path="/alerts/low-stock" element={<LowStockAlerts />} />
          {/* <Route path="/sales/add" element={<AddSale />} /> */}

          <Route path="/daily-summary" element={<DailySummary/>} />
          <Route path="/weekly-summary" element={<WeeklySummary />} />
          <Route path="/monthly-summary" element={<MonthlySummary />} />
          <Route path="/yearly-summary" element={<YearlySummary />} />

          <Route path="/weekly-graph-summary" element={<WeeklySalesChart />} />
          <Route path="/monthly-graph-summary" element={<MonthlySalesChart />} /> 
          <Route path="/yearly-graph-summary" element={<YearlySummaryChart />} /> 
          
          <Route path="/stock-movement" element={<StockMovements/>} />
           

          

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
