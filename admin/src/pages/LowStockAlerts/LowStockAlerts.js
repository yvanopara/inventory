import { useEffect, useState } from "react";
import { api } from "../../api/api";
import { Link } from "react-router-dom";
import "./LowStockAlerts.css";

export default function LowStockAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get("/products/alerts/low-stock");
        setAlerts(res.data.alerts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  if (loading) return <p>Chargement des alertes...</p>;

  return (
    <div className="low-stock-container">
      <h1>Alertes Stock Faible</h1>
      {alerts.length === 0 ? (
        <p>Aucune alerte pour le moment.</p>
      ) : (
        <ul>
          {alerts.map((alert, index) => (
            <li key={index}>{alert}</li>
          ))}
        </ul>
      )}
      <Link to="/products">
        <button style={{ marginTop: "20px" }}>Retour aux Produits</button>
      </Link>
    </div>
  );
}
