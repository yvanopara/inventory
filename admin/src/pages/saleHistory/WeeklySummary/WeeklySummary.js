import React, { useEffect, useState } from "react";
import { api } from "../../../api/api"; // ← chemin corrigé
import "./WeeklySummary.css";

const WeeklySummary = () => {
  const [dailySales, setDailySales] = useState({});
  const [summary, setSummary] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchWeeklySummary = async () => {
      try {
        const res = await api.get("/api/sales/summary/weekly"); // URL relative
        setDailySales(res.data.dailySales);
        setSummary(res.data.summary);
      } catch (err) {
        console.error(err);
        setMessage("Erreur lors du chargement du résumé hebdomadaire");
      }
    };
    fetchWeeklySummary();
  }, []);

  return (
    <div className="weekly-summary-container">
      <h2>Résumé des ventes de la semaine</h2>
      {message && <p className="error">{message}</p>}

      {Object.keys(dailySales).map((day, index) => (
        <div key={index} className="day-sales">
          <h3>{day}</h3>
          <table className="sales-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Photo</th>
                <th>Quantité</th>
                <th>Prix</th>
                <th>Profit</th>
                <th>Coût</th>
                <th>Commentaire</th>
                <th>Preuve</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {dailySales[day].map((sale, i) => (
                <tr key={i}>
                  <td>{sale.productName}</td>
                  <td>
                    {sale.productPhoto ? (
                      <img
                        src={sale.productPhoto}
                        alt={sale.productName}
                        className="product-image-small"
                      />
                    ) : (
                      <div className="no-img">Pas d'image</div>
                    )}
                  </td>
                  <td>{sale.quantity}</td>
                  <td>{sale.revenue.toLocaleString()} FCFA</td>
                  <td>{sale.profit.toLocaleString()} FCFA</td>
                  <td>{sale.cost.toLocaleString()} FCFA</td>
                  <td className="comment-cell">{sale.comment || "-"}</td>
                  <td>
                    {sale.proofImage ? (
                      <img
                        src={sale.proofImage}
                        alt="Preuve"
                        className="proof-thumb"
                      />
                    ) : (
                      <div className="no-img">Pas de preuve</div>
                    )}
                  </td>
                  <td>{new Date(sale.date).toLocaleTimeString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div className="summary-totals">
        <h3>Résumé Total de la semaine :</h3>
        <ul>
          <li>
            <b>Quantité vendue :</b> {summary.totalQuantity || 0}
          </li>
          <li>
            <b>Chiffre d'affaires :</b>{" "}
            {summary.totalRevenue?.toLocaleString() || 0} FCFA
          </li>
          <li>
            <b>Profit :</b> {summary.totalProfit?.toLocaleString() || 0} FCFA
          </li>
          <li>
            <b>Coût total :</b> {summary.totalCost?.toLocaleString() || 0} FCFA
          </li>
        </ul>
      </div>
    </div>
  );
};

export default WeeklySummary;
