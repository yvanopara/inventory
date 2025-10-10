import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MonthlySummary.css";

const MonthlySummaryTable = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMonthlySummary = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/sales/summary/monthly", {
          headers: { token: localStorage.getItem("token") },
        });
        setSummaryData(res.data);
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement du résumé mensuel.");
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlySummary();
  }, []);

  if (loading) return <p className="loading">Chargement...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!summaryData) return null;

  // Fusionner toutes les ventes du mois
  const allSales = summaryData.weeklySummaries.flatMap(week =>
    week.days.flatMap(day => 
      day.sales.map(sale => ({
        ...sale,
        date: day.date,
      }))
    )
  );

  return (
    <div className="monthly-table-container">
      <h2>Résumé mensuel – {summaryData.month} {summaryData.year}</h2>

      <div className="month-total">
        <p><b>Total Quantité :</b> {summaryData.totalSummary.totalQuantity || 0}</p>
        <p><b>Chiffre d’affaires :</b> {summaryData.totalSummary.totalRevenue || 0} FCFA</p>
        <p><b>Bénéfice :</b> {summaryData.totalSummary.totalProfit || 0} FCFA</p>
        <p><b>Coût total :</b> {summaryData.totalSummary.totalCost || 0} FCFA</p>
      </div>

      <table className="monthly-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Produit</th>
            <th>Image Produit</th>
            <th>Preuve</th>
            <th>Quantité</th>
            <th>Montant</th>
            <th>Bénéfice</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {allSales.map((sale, index) => (
            <tr key={index}>
              <td>{new Date(sale.date).toLocaleDateString("fr-FR")}</td>
              <td>{sale.productName || "Inconnu"}</td>
              <td>
                {sale.productPhoto ? (
                  <img
                    src={sale.productPhoto}
                    alt="Produit"
                    className="product-image"
                  />
                ) : (
                  <span className="no-image">-</span>
                )}
              </td>
              <td>
                {sale.proofImage ? (
                  <img
                    src={sale.proofImage}
                    alt="Preuve"
                    className="proof-image"
                  />
                ) : (
                  <span className="no-image">-</span>
                )}
              </td>
              <td>{sale.quantity}</td>
              <td>{sale.revenue} FCFA</td>
              <td>{sale.profit} FCFA</td>
              <td>{sale.status || "active"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlySummaryTable;
