import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { backendUrl } from "../../api/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "./stockAlerts.css";

export default function Alerts() {
  const { token } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const alertsRes = await axios.get(
          backendUrl + "/api/products/alerts/low-stock",
          {
            headers: { token: localStorage.getItem("token") },
          }
        );
        setAlerts(alertsRes.data.alerts || []);
      } catch (err) {
        console.error(err);
      }
    };

    if (token) fetchAlerts();
  }, [token]);

  const chartData = alerts.map((alert) => ({
    name: alert.productName || alert,
    stock: alert.quantity || 0,
  }));

  return (
    <section className="alerts-container">
      <h2>📊 Produits en stock faible</h2>

      {alerts.length > 0 ? (
        <div className="alerts-content">
          {/* Colonne gauche : Graph */}
          <div className="alerts-graph">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="stock"
                  stroke="#e63946"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Ligne verticale de séparation */}
          <div className="divider"></div>

          {/* Colonne droite : Produits */}
          <div className="alerts-list">
            {alerts.map((alert, index) => (
              <div key={index} className="alert-item">
                <img
                  src={alert.image || "https://via.placeholder.com/50"}
                  alt={alert.productName}
                  className="alert-image"
                />
                <span className="alert-name">{alert.productName}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="no-alert">Aucune alerte pour le moment ✅</p>
      )}
    </section>
  );
}
