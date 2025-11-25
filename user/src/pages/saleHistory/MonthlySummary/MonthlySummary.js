import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MonthlySummary.css";
import { backendUrl } from "../../../App";

const MonthlySummaryTable = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchMonthlySummary = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/sales/summary/monthly`, {
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

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString("fr-FR") + " FCFA";
  };

  const getMonthName = (monthNumber) => {
    const months = [
      "Janvier","Février","Mars","Avril","Mai","Juin",
      "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
    ];
    return months[monthNumber - 1] || "";
  };

  if (loading) {
    return (
      <div className="ms-container">
        <div className="ms-loading">
          <div className="ms-spinner"></div>
          <p>Chargement du résumé mensuel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ms-container">
        <div className="ms-message-container">
          <div className="ms-error">
            <span className="ms-error-icon">⚠️</span>
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!summaryData) return null;

  const allSales = summaryData.weeklySummaries.flatMap((week) =>
    week.days.flatMap((day) =>
      day.sales.map((sale) => ({
        ...sale,
        date: day.date,
      }))
    )
  );

  return (
    <div className="ms-container">
      {/* Header */}
      <div className="ms-header">
        <div className="ms-header-content">
          <h2>Résumé Mensuel des Ventes</h2>
          <p className="ms-subtitle">
            {getMonthName(summaryData.month)} {summaryData.year} - Vue d'ensemble complète
          </p>
        </div>
        <div className="ms-month-badge">
          {getMonthName(summaryData.month)} {summaryData.year}
        </div>
      </div>

      {/* Statistiques principales (profit retiré) */}
      <div className="ms-stats-grid">
        <div className="ms-stat-card" style={{ borderLeftColor: "#4f46e5" }}>
          <div className="ms-stat-icon" style={{ color: "#4f46e5" }}>📊</div>
          <div className="ms-stat-content">
            <div className="ms-stat-value">{summaryData.totalSummary.totalQuantity || 0}</div>
            <div className="ms-stat-title">Ventes Totales</div>
            <div className="ms-stat-subtitle">Unités vendues ce mois</div>
          </div>
        </div>

        <div className="ms-stat-card" style={{ borderLeftColor: "#10b981" }}>
          <div className="ms-stat-icon" style={{ color: "#10b981" }}>💰</div>
          <div className="ms-stat-content">
            <div className="ms-stat-value">{formatCurrency(summaryData.totalSummary.totalRevenue)}</div>
            <div className="ms-stat-title">Chiffre d'Affaires</div>
            <div className="ms-stat-subtitle">Revenu total du mois</div>
          </div>
        </div>

        <div className="ms-stat-card" style={{ borderLeftColor: "#8b5cf6" }}>
          <div className="ms-stat-icon" style={{ color: "#8b5cf6" }}>🛒</div>
          <div className="ms-stat-content">
            <div className="ms-stat-value">{allSales.length}</div>
            <div className="ms-stat-title">Transactions</div>
            <div className="ms-stat-subtitle">Total des opérations</div>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="ms-table-section">
        <div className="ms-table-header">
          <h3>Détail des Ventes Mensuelles</h3>
          <div className="ms-sales-count">
            <span>Total des ventes :</span>
            <span className="ms-count-badge">{allSales.length} transactions</span>
          </div>
        </div>

        <div className="ms-table-container">
          <div className="ms-table-scroll">
            <table className="ms-sales-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Produit</th>
                  <th>Photo</th>
                  <th>Quantité</th>
                  <th>Montant</th>
                  <th>Téléphone</th>
                  <th>Preuve</th>
                </tr>
              </thead>

              <tbody>
                {allSales.map((sale, index) => (
                  <tr key={index} className={index % 2 === 0 ? "ms-even-row" : "ms-odd-row"}>
                    <td className="ms-date-cell">
                      {new Date(sale.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </td>

                    <td className="ms-product-cell">
                      <span className="ms-product-name">{sale.productName || "Inconnu"}</span>
                    </td>

                    <td>
                      {sale.productPhoto ? (
                        <img
                          src={sale.productPhoto}
                          alt="Produit"
                          className="ms-product-image"
                          onClick={() => setSelectedImage(sale.productPhoto)}
                        />
                      ) : (
                        <div className="ms-no-image">📷</div>
                      )}
                    </td>

                    <td className="ms-quantity-cell">
                      <span className="ms-quantity-badge">{sale.quantity}</span>
                    </td>

                    <td className="ms-revenue-cell">
                      {formatCurrency(sale.finalPrice || sale.revenue)}
                    </td>

                    <td className="ms-phone-cell">
                      {sale.customerPhone ? sale.customerPhone : "—"}
                    </td>

                    <td>
                      {sale.proofImage ? (
                        <img
                          src={sale.proofImage}
                          alt="Preuve"
                          className="ms-proof-image"
                          onClick={() => setSelectedImage(sale.proofImage)}
                        />
                      ) : (
                        <div className="ms-no-proof">📄</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Résumé du mois (profit retiré) */}
        <div className="ms-month-summary">
          <div className="ms-summary-item">
            <span className="ms-summary-label">Quantité totale vendue :</span>
            <span className="ms-summary-value">{summaryData.totalSummary.totalQuantity || 0}</span>
          </div>

          <div className="ms-summary-item">
            <span className="ms-summary-label">Chiffre d'affaires total :</span>
            <span className="ms-summary-value ms-revenue-highlight">
              {formatCurrency(summaryData.totalSummary.totalRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedImage && (
        <div className="ms-image-modal" onClick={() => setSelectedImage(null)}>
          <div className="ms-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="ms-modal-close" onClick={() => setSelectedImage(null)}>
              ×
            </button>
            <img src={selectedImage} alt="Agrandissement" className="ms-modal-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlySummaryTable;




// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./MonthlySummary.css";
// import { backendUrl } from "../../../App";


// const MonthlySummaryTable = () => {
//   const [summaryData, setSummaryData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchMonthlySummary = async () => {
//       try {
//         const res = await axios.get(`${backendUrl}/api/sales/summary/monthly`, {
//           headers: { token: localStorage.getItem("token") },
//         });
//         setSummaryData(res.data);
//       } catch (err) {
//         console.error(err);
//         setError("Erreur lors du chargement du résumé mensuel.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMonthlySummary();
//   }, []);

//   if (loading) return <p className="loading">Chargement...</p>;
//   if (error) return <p className="error">{error}</p>;
//   if (!summaryData) return null;

//   const allSales = summaryData.weeklySummaries.flatMap(week =>
//     week.days.flatMap(day => 
//       day.sales.map(sale => ({
//         ...sale,
//         date: day.date,
//       }))
//     )
//   );

//   return (
//     <div className="monthly-table-container">
//       <h2>Résumé mensuel – {summaryData.month} {summaryData.year}</h2>

//       <div className="month-total">
//         <p><b>Total Quantité :</b> {summaryData.totalSummary.totalQuantity || 0}</p>
//         <p><b>Chiffre d’affaires :</b> {summaryData.totalSummary.totalRevenue || 0} FCFA</p>
//         <p><b>Bénéfice :</b> {summaryData.totalSummary.totalProfit || 0} FCFA</p>
//         <p><b>Coût total :</b> {summaryData.totalSummary.totalCost || 0} FCFA</p>
//       </div>

//       <table className="monthly-table">
//         <thead>
//           <tr>
//             <th>Date</th>
//             <th>Produit</th>
//             <th>Image Produit</th>
//             <th>Preuve</th>
//             <th>Quantité</th>
//             <th>Montant</th>
//             <th>Bénéfice</th>
//             <th>Statut</th>
//           </tr>
//         </thead>
//         <tbody>
//           {allSales.map((sale, index) => (
//             <tr key={index}>
//               <td>{new Date(sale.date).toLocaleDateString("fr-FR")}</td>
//               <td>{sale.productName || "Inconnu"}</td>
//               <td>
//                 {sale.productPhoto ? (
//                   <img
//                     src={sale.productPhoto}
//                     alt="Produit"
//                     className="product-image"
//                   />
//                 ) : (
//                   <span className="no-image">-</span>
//                 )}
//               </td>
//               <td>
//                 {sale.proofImage ? (
//                   <img
//                     src={sale.proofImage}
//                     alt="Preuve"
//                     className="proof-image"
//                   />
//                 ) : (
//                   <span className="no-image">-</span>
//                 )}
//               </td>
//               <td>{sale.quantity}</td>
//               <td>{sale.revenue} FCFA</td>
//               <td>{sale.profit} FCFA</td>
//               <td>{sale.status || "active"}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default MonthlySummaryTable;
