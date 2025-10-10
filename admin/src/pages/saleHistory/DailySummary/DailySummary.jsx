import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DailySummary.css";

const DailySummary = () => {
  const [summary, setSummary] = useState({});
  const [sales, setSales] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/sales/summary/daily",
          { headers: { token: localStorage.getItem("token") } }
        );
        setSummary(res.data.summary);
        setSales(res.data.sales);
      } catch (err) {
        console.error(err);
        setMessage("Erreur lors du chargement du résumé");
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="daily-summary-container">
      <h2>Résumé des ventes du jour ({summary.totalQuantity || 0} ventes)</h2>
      {message && <p className="error">{message}</p>}

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
          {sales.map((sale, index) => (
            <tr key={index}>
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

      <div className="summary-totals">
        <h3>Résumé Total :</h3>
        <ul>
          <li><b>Quantité vendue :</b> {summary.totalQuantity || 0}</li>
          <li><b>Chiffre d'affaires :</b> {summary.totalRevenue?.toLocaleString() || 0} FCFA</li>
          <li><b>Profit :</b> {summary.totalProfit?.toLocaleString() || 0} FCFA</li>
          <li><b>Coût total :</b> {summary.totalCost?.toLocaleString() || 0} FCFA</li>
        </ul>
      </div>
    </div>
  );
};

export default DailySummary;
