import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";
import StockAlerts from "../../components/StockAllert/stockAlerts";
import TopLowProductsCharts from "../../components/TopLowProductsCharts/TopLowProductsCharts";
import { backendUrl } from "../../api/api";



const Dashboard = () => {
  const [salesSummary, setSalesSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);  // <-- état pour alertes
  const [loading, setLoading] = useState(true);

  // --- Récupérer résumé des ventes et alertes ---
  const fetchSalesSummary = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/sales/dashboard-summary`);
      setSalesSummary(data.summary || null);
      setAlerts(data.alerts || []); // <-- récupérer alertes si backend les fournit
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors de la récupération du résumé :", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesSummary();
  }, []);

  const PeriodCard = ({ title, summary }) => (
    <div className="period-card">
      <h3>{title}</h3>
      <p>Quantité vendue : {summary.totalQuantity}</p>
      <p>Chiffre d'affaires : {summary.totalRevenue.toLocaleString()} FCFA</p>
      <p>Profit : {summary.totalProfit.toLocaleString()} FCFA</p>
      <p>Coût total : {summary.totalCost.toLocaleString()} FCFA</p>
    </div>
  );

  return (
    <div className="dashboard">
      <h1>Tableau de bord des ventes</h1>

      {/* --- Alertes stock --- */}
      {alerts.length > 0 && (
        <div className="stock-alerts">
          <h2>⚠️ Alertes de stock</h2>
          <ul>
            {alerts.map((alert, index) => (
              <li key={index}>{alert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* --- Résumé des ventes --- */}
      <div className="sales-summary">
        <h2>Résumé des ventes</h2>
        {loading && <p>Chargement...</p>}
        {!loading && salesSummary && (
          <div className="summary-grid">
            <PeriodCard title="Aujourd'hui" summary={salesSummary.today} />
            <PeriodCard title="Hier" summary={salesSummary.yesterday} />
            <PeriodCard title="Semaine en cours" summary={salesSummary.thisWeek} />
            <PeriodCard title="Semaine dernière" summary={salesSummary.lastWeek} />
            <PeriodCard title="Mois en cours" summary={salesSummary.thisMonth} />
            <PeriodCard title="Mois passé" summary={salesSummary.lastMonth} />
            <PeriodCard title="Année en cours" summary={salesSummary.thisYear} />
            <PeriodCard title="Année passée" summary={salesSummary.lastYear} />
          </div>
        )}
      </div>
      <StockAlerts/>
      <TopLowProductsCharts/>
    </div>
  );
};

export default Dashboard;
