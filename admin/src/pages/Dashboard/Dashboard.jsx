import { useEffect, useState, useContext } from "react";
import { api } from "../../api/api";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const summaryRes = await api.get("http://localhost:5000/api/sales/summary/daily");
        setSummary(summaryRes.data);

        const alertsRes = await api.get("/products/alerts/low-stock");
        setAlerts(alertsRes.data.alerts || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [token]);

  return (
    <div className="dashboard-container">
      <h1>Tableau de bord</h1>

      <section className="summary">
        <h2>Résumé des ventes du jour</h2>
        {summary ? (
          <div className="summary-cards">
            <div className="card">
              <h3>Total Quantité</h3>
              <p>{summary.totalQuantity}</p>
            </div>
            <div className="card">
              <h3>Chiffre d'affaires</h3>
              <p>{summary.totalRevenue} FCFA</p>
            </div>
            <div className="card">
              <h3>Bénéfice</h3>
              <p>{summary.totalProfit} FCFA</p>
            </div>
            <div className="card">
              <h3>Coût total</h3>
              <p>{summary.totalCost} FCFA</p>
            </div>
          </div>
        ) : (
          <p>Chargement du résumé...</p>
        )}
      </section>

      <section className="alerts">
        <h2>Alertes Stock Faible</h2>
        {alerts.length > 0 ? (
          <ul>
            {alerts.map((alert, i) => (
              <li key={i}>{alert}</li>
            ))}
          </ul>
        ) : (
          <p>Aucune alerte pour le moment ✅</p>
        )}
      </section>
    </div>
  );
}
