import React, { useEffect, useState } from "react";
import { api } from "../../../api/api"; // ✅ garde le même chemin que WeeklySummary
import "./YearlySummary.css";

const YearlySummary = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthlySummaries, setMonthlySummaries] = useState([]);
  const [totalSummary, setTotalSummary] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchYearlySummary = async () => {
      try {
        const res = await api.get(`/api/sales/yearly-summary?year=${year}`);
        setMonthlySummaries(res.data.monthlySummaries || []);
        setTotalSummary(res.data.totalSummary || {});
      } catch (err) {
        console.error(err);
        setMessage("Erreur lors du chargement du résumé annuel");
      }
    };
    fetchYearlySummary();
  }, [year]);

  return (
    <div className="yearly-summary-container">
      <h2>Résumé des ventes de l'année {year}</h2>

      <div className="year-selector">
        <label>Choisir une année :</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          min="2000"
          max={new Date().getFullYear()}
        />
      </div>

      {message && <p className="error">{message}</p>}

      <table className="yearly-summary-table">
        <thead>
          <tr>
            <th>Mois</th>
            <th>Nombre de ventes</th>
            <th>Quantité totale</th>
            <th>Chiffre d'affaires</th>
            <th>Profit</th>
            <th>Coût total</th>
          </tr>
        </thead>
        <tbody>
          {monthlySummaries.map((month, index) => (
            <tr key={index}>
              <td className="month-name">{month.month}</td>
              <td>{month.numberOfSales}</td>
              <td>{month.summary.totalQuantity || 0}</td>
              <td>{(month.summary.totalRevenue || 0).toLocaleString()} FCFA</td>
              <td>{(month.summary.totalProfit || 0).toLocaleString()} FCFA</td>
              <td>{(month.summary.totalCost || 0).toLocaleString()} FCFA</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="summary-totals">
        <h3>Résumé global de l'année :</h3>
        <ul>
          <li>
            <b>Quantité totale vendue :</b> {totalSummary.totalQuantity || 0}
          </li>
          <li>
            <b>Chiffre d'affaires total :</b>{" "}
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

export default YearlySummary;
