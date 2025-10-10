import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import Login from "./pages/login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import AddSale from "./pages/AddSale/AddSale";
import { AuthProvider } from "./AuthContext";
import DailySummary from "./pages/saleHistory/DailySummary/DailySummary";
import WeeklySummary from "./pages/saleHistory/WeeklySummary/WeeklySummary";
import MonthlySummary from "./pages/saleHistory/MonthlySummary/MonthlySummary";

 // export const backendUrl = "http://localhost:5000";

  export const backendUrl = "https://inventory2-uexd.onrender.com";



function App() {

  
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-sale" element={<AddSale />} />
          <Route path="/daily-summary" element={<DailySummary />} />
          <Route path="/weekly-summary" element={<WeeklySummary />} />
          <Route path="/monthly-summary" element={<MonthlySummary />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
