import React, { useEffect, useState } from "react";
import { api } from "../../../api/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./YearlySummary.css";

const YearlySummaryChart = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [totalSummary, setTotalSummary] = useState({});
  const [year, setYear] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAnnualSummary = async () => {
      try {
        const res = await api.get("/api/sales/yearly-summary");
        setYear(res.data.year);
        setMonthlyData(
          res.data.monthlySummaries.map((m) => ({
            month: m.month.charAt(0).toUpperCase() + m.month.slice(1),
            revenue: m.summary.totalRevenue,
            profit: m.summary.totalProfit,
            cost: m.summary.totalCost,
            quantity: m.summary.totalQuantity,
          }))
        );
        setTotalSummary(res.data.totalSummary);
      } catch (err) {
        console.error(err);
        setMessage("Erreur lors du chargement du résumé annuel");
      }
    };
    fetchAnnualSummary();
  }, []);

  return (
    <div className="annual-summary-container">
      <h2>Résumé annuel des ventes {year && `(${year})`}</h2>
      {message && <p className="error">{message}</p>}

      {/* --- Graphique des ventes --- */}
      <div className="chart-container">
        <h3>Évolution mensuelle du chiffre d'affaires et du profit</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `${value.toLocaleString()} FCFA`} />
            <Legend />
            <Bar dataKey="revenue" name="Chiffre d'affaires" fill="#3b82f6" />
            <Bar dataKey="profit" name="Profit" fill="#10b981" />
            <Bar dataKey="cost" name="Coût" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* --- Résumé total de l'année --- */}
      <div className="summary-totals">
        <h3>Résumé total de l’année :</h3>
        <ul>
          <li>
            <b>Quantité totale vendue :</b> {totalSummary.totalQuantity || 0}
          </li>
          <li>
            <b>Chiffre d’affaires :</b>{" "}
            {totalSummary.totalRevenue?.toLocaleString() || 0} FCFA
          </li>
          <li>
            <b>Profit total :</b>{" "}
            {totalSummary.totalProfit?.toLocaleString() || 0} FCFA
          </li>
          <li>
            <b>Coût total :</b>{" "}
            {totalSummary.totalCost?.toLocaleString() || 0} FCFA
          </li>
        </ul>
      </div>
    </div>
  );
};

export default YearlySummaryChart;
