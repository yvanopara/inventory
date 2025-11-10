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
      <div className="alerts-header">
        <div className="header-icon">📊</div>
        <h2>Produits en stock faible</h2>
        <div className="alert-badge">{alerts.length}</div>
      </div>

      {alerts.length > 0 ? (
        <div className="alerts-content">
          {/* Colonne gauche : Graph */}
          <div className="alerts-graph">
            <div className="graph-header">
              <h3>Évolution des stocks</h3>
              <span className="graph-subtitle">Niveaux critiques</span>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="stock"
                  stroke="#e63946"
                  strokeWidth={3}
                  dot={{ fill: '#e63946', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: '#ff6b6b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Colonne droite : Produits */}
          <div className="alerts-list-section">
            <div className="list-header">
              <h3>Produits concernés</h3>
              <span className="list-count">{alerts.length} produit(s)</span>
            </div>
            <div className="alerts-list">
              {alerts.map((alert, index) => (
                <div key={index} className="alert-item">
                  <div className="alert-item-content">
                    <img
                      src={alert.image || "https://via.placeholder.com/60?text=📦"}
                      alt={alert.productName}
                      className="alert-image"
                    />
                    <div className="alert-info">
                      <span className="alert-name">{alert.productName}</span>
                      <div className="stock-info">
                        <span className="stock-badge">Stock: {alert.quantity || 0}</span>
                        <div className="urgency-indicator"></div>
                      </div>
                    </div>
                  </div>
                  <div className="alert-arrow">→</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="no-alert-section">
          <div className="success-icon">✅</div>
          <h3>Aucune alerte pour le moment</h3>
          <p>Tous vos stocks sont à des niveaux satisfaisants</p>
        </div>
      )}
    </section>
  );
}