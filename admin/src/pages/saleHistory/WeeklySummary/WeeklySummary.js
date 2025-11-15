import React, { useEffect, useState } from "react";
import { api } from "../../../api/api";
import "./WeeklySummary.css";

const WeeklySummary = () => {
  const [wsDailySales, setWsDailySales] = useState({});
  const [wsSummary, setWsSummary] = useState({});
  const [wsMessage, setWsMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchWeeklySummary = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/api/sales/summary/weekly");
        setWsDailySales(res.data.dailySales);
        setWsSummary(res.data.summary);
      } catch (err) {
        console.error(err);
        setWsMessage("Erreur lors du chargement du résumé hebdomadaire");
      } finally {
        setIsLoading(false);
      }
    };
    fetchWeeklySummary();
  }, []);

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString('fr-FR') + ' FCFA';
  };

  const getDayTotals = (sales) => {
    let totalQty = 0;
    let totalRevenue = 0;
    let totalProfit = 0;
    let totalCost = 0;

    sales.forEach((sale) => {
      totalQty += sale.quantity;
      totalRevenue += sale.revenue;
      totalProfit += sale.profit;
      totalCost += sale.cost;
    });

    return { totalQty, totalRevenue, totalProfit, totalCost };
  };

  // Fonction pour obtenir la couleur en fonction du jour
  const getDayColor = (day) => {
    const colors = {
      "Lundi": "#3B82F6",
      "Mardi": "#10B981", 
      "Mercredi": "#F59E0B",
      "Jeudi": "#EF4444",
      "Vendredi": "#8B5CF6",
      "Samedi": "#EC4899",
      "Dimanche": "#06B6D4"
    };
    return colors[day] || "#64748B";
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  if (isLoading) {
    return (
      <div className="ws-container">
        <div className="ws-loading">
          <div className="ws-spinner"></div>
          <p>Chargement des données de la semaine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ws-container">
      <div className="ws-header">
        <div className="ws-header-content">
          <h2>Résumé des Ventes de la Semaine</h2>
          <p className="ws-subtitle">
            Aperçu complet des performances commerciales cette semaine
          </p>
        </div>
        <div className="ws-period-badge">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {wsMessage && (
        <div className="ws-message-container">
          <div className="ws-error">
            <span className="ws-error-icon">⚠️</span>
            {wsMessage}
          </div>
        </div>
      )}

      {/* Cartes de statistiques */}
      <div className="ws-stats-grid">
        <div className="ws-stat-card ws-card-primary">
          <div className="ws-stat-icon">📦</div>
          <div className="ws-stat-content">
            <div className="ws-value">{wsSummary.totalQuantity || 0}</div>
            <div className="ws-label">Total des Ventes</div>
            <div className="ws-stat-subtitle">unités vendues</div>
          </div>
        </div>

        <div className="ws-stat-card ws-card-success">
          <div className="ws-stat-icon">💰</div>
          <div className="ws-stat-content">
            <div className="ws-value">{formatCurrency(wsSummary.totalRevenue)}</div>
            <div className="ws-label">Chiffre d'Affaires</div>
            <div className="ws-stat-subtitle">revenu total</div>
          </div>
        </div>

        <div className="ws-stat-card ws-card-profit">
          <div className="ws-stat-icon">📈</div>
          <div className="ws-stat-content">
            <div className="ws-value">{formatCurrency(wsSummary.totalProfit)}</div>
            <div className="ws-label">Profit Net</div>
            <div className="ws-stat-subtitle">bénéfice réalisé</div>
          </div>
        </div>

        <div className="ws-stat-card ws-card-warning">
          <div className="ws-stat-icon">💸</div>
          <div className="ws-stat-content">
            <div className="ws-value">{formatCurrency(wsSummary.totalCost)}</div>
            <div className="ws-label">Coût Total</div>
            <div className="ws-stat-subtitle">coût des marchandises</div>
          </div>
        </div>
      </div>

      {/* Ventes par jour */}
      <div className="ws-days-container">
        {Object.keys(wsDailySales).map((day, index) => {
          const dayTotals = getDayTotals(wsDailySales[day]);
          const dayColor = getDayColor(day);

          return (
            <div key={index} className="ws-day-section">
              <div 
                className="ws-day-header"
                style={{ borderLeftColor: dayColor }}
              >
                <div className="ws-day-title-container">
                  <h3 className="ws-day-title">{day}</h3>
                  <div className="ws-sales-count">
                    <span className="ws-count-badge" style={{ backgroundColor: dayColor }}>
                      {wsDailySales[day].length}
                    </span>
                    vente(s) ce jour
                  </div>
                </div>
              </div>

              <div className="ws-table-container">
                <div className="ws-table-scroll">
                  <table className="ws-table">
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Photo</th>
                        <th>Qté</th>
                        <th>Prix</th>
                        <th>Profit</th>
                        <th>Coût</th>
                        <th>Commentaire</th>
                        <th>Preuve</th>
                        <th>Heure</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wsDailySales[day].map((sale, i) => (
                        <tr key={i} className={i % 2 === 0 ? "ws-row-even" : "ws-row-odd"}>
                          <td className="ws-product-cell">
                            <span className="ws-product-name">{sale.productName}</span>
                          </td>
                          <td>
                            {sale.productPhoto ? (
                              <img
                                src={sale.productPhoto}
                                alt={sale.productName}
                                className="ws-img"
                                onClick={() => openImageModal(sale.productPhoto)}
                              />
                            ) : (
                              <div className="ws-no-img">
                                <span>📷</span>
                              </div>
                            )}
                          </td>
                          <td className="ws-quantity-cell">
                            <span className="ws-quantity-badge">{sale.quantity}</span>
                          </td>
                          <td className="ws-money-cell">{formatCurrency(sale.revenue)}</td>
                          <td className="ws-profit-cell">{formatCurrency(sale.profit)}</td>
                          <td className="ws-cost-cell">{formatCurrency(sale.cost)}</td>
                          <td className="ws-comment">
                            {sale.comment ? (
                              <div className="ws-comment-text">{sale.comment}</div>
                            ) : (
                              <span className="ws-no-comment">-</span>
                            )}
                          </td>
                          <td>
                            {sale.proofImage ? (
                              <img
                                src={sale.proofImage}
                                alt="Preuve"
                                className="ws-proof"
                                onClick={() => openImageModal(sale.proofImage)}
                              />
                            ) : (
                              <div className="ws-no-img">
                                <span>📄</span>
                              </div>
                            )}
                          </td>
                          <td className="ws-time-cell">
                            {new Date(sale.date).toLocaleTimeString("fr-FR", {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totaux du jour */}
              <div className="ws-day-totals" style={{ borderLeftColor: dayColor }}>
                <div className="ws-total-item">
                  <span className="ws-total-label">Total Quantité :</span>
                  <span className="ws-total-value">{dayTotals.totalQty}</span>
                </div>
                <div className="ws-total-item">
                  <span className="ws-total-label">Total Ventes :</span>
                  <span className="ws-total-value">{formatCurrency(dayTotals.totalRevenue)}</span>
                </div>
                <div className="ws-total-item">
                  <span className="ws-total-label">Total Profit :</span>
                  <span className="ws-total-value ws-profit-highlight">
                    {formatCurrency(dayTotals.totalProfit)}
                  </span>
                </div>
                <div className="ws-total-item">
                  <span className="ws-total-label">Total Coût :</span>
                  <span className="ws-total-value">{formatCurrency(dayTotals.totalCost)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal pour les images */}
      {selectedImage && (
        <div className="ws-image-modal" onClick={closeImageModal}>
          <div className="ws-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="ws-modal-close" onClick={closeImageModal}>×</button>
            <img src={selectedImage} alt="Agrandissement" className="ws-modal-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklySummary;












// import React, { useEffect, useState } from "react";
// import { api } from "../../../api/api";
// import "./WeeklySummary.css";

// const WeeklySummary = () => {
//   const [wsDailySales, setWsDailySales] = useState({});
//   const [wsSummary, setWsSummary] = useState({});
//   const [wsMessage, setWsMessage] = useState("");

//   useEffect(() => {
//     const fetchWeeklySummary = async () => {
//       try {
//         const res = await api.get("/api/sales/summary/weekly");
//         setWsDailySales(res.data.dailySales);
//         setWsSummary(res.data.summary);
//       } catch (err) {
//         console.error(err);
//         setWsMessage("Erreur lors du chargement du résumé hebdomadaire");
//       }
//     };
//     fetchWeeklySummary();
//   }, []);

//   // --- Fonction pour calculer les totaux du jour ---
//   const getDayTotals = (sales) => {
//     let totalQty = 0;
//     let totalRevenue = 0;
//     let totalProfit = 0;
//     let totalCost = 0;

//     sales.forEach((sale) => {
//       totalQty += sale.quantity;
//       totalRevenue += sale.revenue;
//       totalProfit += sale.profit;
//       totalCost += sale.cost;
//     });

//     return { totalQty, totalRevenue, totalProfit, totalCost };
//   };

//   return (
//     <div className="ws-container">
//       <div className="ws-header">
//         <h2>Résumé des ventes de la semaine</h2>
//         <p className="ws-subtitle">Aperçu détaillé des ventes de lundi à dimanche</p>
//       </div>

//       {wsMessage && <p className="ws-error">{wsMessage}</p>}

//       {/* Résumé global */}
//       <div className="ws-stats-grid">
//         <div className="ws-card">
//           <p className="ws-value">{wsSummary.totalQuantity || 0}</p>
//           <p className="ws-label">Quantité vendue</p>
//         </div>

//         <div className="ws-card">
//           <p className="ws-value">
//             {wsSummary.totalRevenue?.toLocaleString() || 0} FCFA
//           </p>
//           <p className="ws-label">Chiffre d'affaires</p>
//         </div>

//         <div className="ws-card">
//           <p className="ws-value">
//             {wsSummary.totalProfit?.toLocaleString() || 0} FCFA
//           </p>
//           <p className="ws-label">Profit Total</p>
//         </div>

//         <div className="ws-card">
//           <p className="ws-value">
//             {wsSummary.totalCost?.toLocaleString() || 0} FCFA
//           </p>
//           <p className="ws-label">Coût total</p>
//         </div>
//       </div>

//       {/* Ventes par jour */}
//       {Object.keys(wsDailySales).map((day, index) => {
//         const dayTotals = getDayTotals(wsDailySales[day]);

//         return (
//           <div key={index} className="ws-day-section">
//             <h3 className="ws-day-title">{day}</h3>

//             <div className="ws-table-wrapper">
//               <table className="ws-table">
//                 <thead>
//                   <tr>
//                     <th>Produit</th>
//                     <th>Photo</th>
//                     <th>Quantité</th>
//                     <th>Prix</th>
//                     <th>Profit</th>
//                     <th>Coût</th>
//                     <th>Commentaire</th>
//                     <th>Preuve</th>
//                     <th>Heure</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {wsDailySales[day].map((sale, i) => (
//                     <tr key={i}>
//                       <td>{sale.productName}</td>
//                       <td>
//                         {sale.productPhoto ? (
//                           <img
//                             src={sale.productPhoto}
//                             alt={sale.productName}
//                             className="ws-img"
//                           />
//                         ) : (
//                           <div className="ws-no-img">-</div>
//                         )}
//                       </td>

//                       <td>{sale.quantity}</td>
//                       <td>{sale.revenue.toLocaleString()} FCFA</td>
//                       <td>{sale.profit.toLocaleString()} FCFA</td>
//                       <td>{sale.cost.toLocaleString()} FCFA</td>
//                       <td className="ws-comment">{sale.comment || "-"}</td>

//                       <td>
//                         {sale.proofImage ? (
//                           <img
//                             src={sale.proofImage}
//                             alt="preuve"
//                             className="ws-proof"
//                           />
//                         ) : (
//                           <div className="ws-no-img">-</div>
//                         )}
//                       </td>

//                       <td>
//                         {new Date(sale.date).toLocaleTimeString("fr-FR")}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* 🔥 Totaux du jour */}
//             <div className="ws-day-totals">
//               <p><b>Total Quantité :</b> {dayTotals.totalQty}</p>
//               <p>
//                 <b>Total Vente :</b> {dayTotals.totalRevenue.toLocaleString()} FCFA
//               </p>
//               <p>
//                 <b>Total Profit :</b> {dayTotals.totalProfit.toLocaleString()} FCFA
//               </p>
//               <p>
//                 <b>Total Coût :</b> {dayTotals.totalCost.toLocaleString()} FCFA
//               </p>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default WeeklySummary;
