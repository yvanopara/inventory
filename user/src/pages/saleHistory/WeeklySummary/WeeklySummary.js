import React, { useEffect, useState } from "react";
import axios from "axios";
import "./WeeklySummary.css";

const WeeklySummary = () => {
  const [dailySales, setDailySales] = useState({});
  const [summary, setSummary] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [expandedDays, setExpandedDays] = useState({});

  useEffect(() => {
    const fetchWeeklySummary = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "http://localhost:5000/api/sales/summary/weekly",
          { headers: { token: localStorage.getItem("token") } }
        );
        setDailySales(res.data.dailySales);
        setSummary(res.data.summary);
        
        const days = Object.keys(res.data.dailySales);
        if (days.length > 0) {
          setExpandedDays({ [days[0]]: true });
        }
      } catch (err) {
        console.error(err);
        setMessage("Erreur lors du chargement du résumé hebdomadaire");
      } finally {
        setLoading(false);
      }
    };
    fetchWeeklySummary();
  }, []);

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString('fr-FR') + ' FCFA';
  };

  const getWeekRange = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() - today.getDay() + 7);
    
    return `${startOfWeek.toLocaleDateString('fr-FR')} - ${endOfWeek.toLocaleDateString('fr-FR')}`;
  };

  const toggleDayExpansion = (day) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const getDaySalesCount = (day) => {
    return dailySales[day] ? dailySales[day].length : 0;
  };

  const getDayRevenue = (day) => {
    if (!dailySales[day]) return 0;
    return dailySales[day].reduce((total, sale) => total + sale.revenue, 0);
  };

  if (loading) {
    return (
      <div className="ws-container">
        <div className="ws-loading">
          <div className="ws-spinner"></div>
          <p>Chargement des données hebdomadaires...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ws-container">

      <div className="ws-header">
        <div className="ws-header-content">
          <h2>Résumé des Ventes Hebdomadaires</h2>
          <p className="ws-subtitle">Analyse complète de votre performance sur la semaine</p>
        </div>
        <div className="ws-week-badge">
          Semaine: {getWeekRange()}
        </div>
      </div>

      {message && (
        <div className="ws-message-container">
          <div className="ws-error">
            <span className="ws-error-icon">⚠️</span>
            {message}
          </div>
        </div>
      )}

      <div className="ws-stats-grid">
        <div className="ws-stat-card" style={{ borderLeftColor: '#4f46e5' }}>
          <div className="ws-stat-icon" style={{ color: '#4f46e5' }}>
            📊
          </div>
          <div className="ws-stat-content">
            <div className="ws-stat-value">{summary.totalQuantity || 0}</div>
            <div className="ws-stat-title">Ventes Totales</div>
            <div className="ws-stat-subtitle">Unités vendues cette semaine</div>
          </div>
        </div>

        <div className="ws-stat-card" style={{ borderLeftColor: '#10b981' }}>
          <div className="ws-stat-icon" style={{ color: '#10b981' }}>
            💰
          </div>
          <div className="ws-stat-content">
            <div className="ws-stat-value">{formatCurrency(summary.totalRevenue)}</div>
            <div className="ws-stat-title">Chiffre d'Affaires</div>
            <div className="ws-stat-subtitle">Revenu total de la semaine</div>
          </div>
        </div>

        <div className="ws-stat-card" style={{ borderLeftColor: '#f59e0b' }}>
          <div className="ws-stat-icon" style={{ color: '#f59e0b' }}>
            📈
          </div>
          <div className="ws-stat-content">
            <div className="ws-stat-value">{formatCurrency(summary.totalProfit)}</div>
            <div className="ws-stat-title">Profit Total</div>
            <div className="ws-stat-subtitle">Bénéfice net de la semaine</div>
          </div>
        </div>

        <div className="ws-stat-card" style={{ borderLeftColor: '#ef4444' }}>
          <div className="ws-stat-icon" style={{ color: '#ef4444' }}>
            📉
          </div>
          <div className="ws-stat-content">
            <div className="ws-stat-value">{formatCurrency(summary.totalCost)}</div>
            <div className="ws-stat-title">Coût Total</div>
            <div className="ws-stat-subtitle">Coûts engagés cette semaine</div>
          </div>
        </div>
      </div>

      <div className="ws-days-section">
        <div className="ws-section-header">
          <h3>Détail par Jour</h3>
          <div className="ws-days-count">
            <span>Jours avec ventes :</span>
            <span className="ws-count-badge">{Object.keys(dailySales).length} jours</span>
          </div>
        </div>

        {Object.keys(dailySales).map((day, index) => (
          <div key={index} className="ws-day-card">
            <div 
              className="ws-day-header"
              onClick={() => toggleDayExpansion(day)}
            >
              <div className="ws-day-title">
                <h4>{day}</h4>
                <div className="ws-day-stats">
                  <span className="ws-day-sales-count">{getDaySalesCount(day)} ventes</span>
                  <span className="ws-day-revenue">{formatCurrency(getDayRevenue(day))}</span>
                </div>
              </div>
              <div className="ws-day-toggle">
                {expandedDays[day] ? '▼' : '►'}
              </div>
            </div>

            {expandedDays[day] && (
              <div className="ws-day-content">
                <div className="ws-table-container">
                  <div className="ws-table-scroll">
                    <table className="ws-sales-table">
                      <thead>
                        <tr>
                          <th>Produit</th>
                          <th>Photo</th>
                          <th>Quantité</th>
                          <th>Prix</th>
                          <th>Profit</th>
                          <th>Coût</th>
                          <th>Commentaire</th>
                          <th>Client</th> {/* AJOUT ICI */}
                          <th>Preuve</th>
                          <th>Heure</th>
                        </tr>
                      </thead>

                      <tbody>
                        {dailySales[day].map((sale, i) => (
                          <tr key={i} className={i % 2 === 0 ? 'ws-even-row' : 'ws-odd-row'}>

                            <td className="ws-product-cell">
                              <span className="ws-product-name">{sale.productName}</span>
                            </td>

                            <td>
                              {sale.productPhoto ? (
                                <img
                                  src={sale.productPhoto}
                                  alt={sale.productName}
                                  className="ws-product-image"
                                  onClick={() => setSelectedImage(sale.productPhoto)}
                                />
                              ) : (
                                <div className="ws-no-image">📷</div>
                              )}
                            </td>

                            <td className="ws-quantity-cell">
                              <span className="ws-quantity-badge">{sale.quantity}</span>
                            </td>

                            <td className="ws-revenue-cell">{formatCurrency(sale.revenue)}</td>
                            <td className="ws-profit-cell">{formatCurrency(sale.profit)}</td>
                            <td className="ws-cost-cell">{formatCurrency(sale.cost)}</td>

                            <td className="ws-comment-cell">
                              <div className="ws-comment-content">
                                {sale.comment ? (
                                  <span className="ws-comment-text">{sale.comment}</span>
                                ) : (
                                  <span className="ws-no-comment">-</span>
                                )}
                              </div>
                            </td>

                            {/* NUMÉRO CLIENT ICI */}
                            <td className="ws-phone-cell">
                              <span className="ws-phone-badge">
                                {sale.customerPhone || "-"}
                              </span>
                            </td>

                            <td>
                              {sale.proofImage ? (
                                <img
                                  src={sale.proofImage}
                                  alt="Preuve de vente"
                                  className="ws-proof-image"
                                  onClick={() => setSelectedImage(sale.proofImage)}
                                />
                              ) : (
                                <div className="ws-no-proof">📄</div>
                              )}
                            </td>

                            <td className="ws-time-cell">
                              {new Date(sale.date).toLocaleTimeString('fr-FR', {
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
              </div>
            )}

          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="ws-image-modal" onClick={() => setSelectedImage(null)}>
          <div className="ws-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="ws-modal-close"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
            <img src={selectedImage} alt="Agrandissement" className="ws-modal-image" />
          </div>
        </div>
      )}

    </div>
  );
};

export default WeeklySummary;






// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./WeeklySummary.css";

// const WeeklySummary = () => {
//   const [dailySales, setDailySales] = useState({});
//   const [summary, setSummary] = useState({});
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     const fetchWeeklySummary = async () => {
//       try {
//         const res = await axios.get(
//           "http://localhost:5000/api/sales/summary/weekly",
//           { headers: { token: localStorage.getItem("token") } }
//         );
//         setDailySales(res.data.dailySales);
//         setSummary(res.data.summary);
//       } catch (err) {
//         console.error(err);
//         setMessage("Erreur lors du chargement du résumé hebdomadaire");
//       }
//     };
//     fetchWeeklySummary();
//   }, []);

//   return (
//     <div className="weekly-summary-container">
//       <h2>Résumé des ventes de la semaine</h2>
//       {message && <p className="error">{message}</p>}

//       {Object.keys(dailySales).map((day, index) => (
//         <div key={index} className="day-sales">
//           <h3>{day}</h3>
//           <table className="sales-table">
//             <thead>
//               <tr>
//                 <th>Produit</th>
//                 <th>Photo</th>
//                 <th>Quantité</th>
//                 <th>Prix</th>
//                 <th>Profit</th>
//                 <th>Coût</th>
//                 <th>Commentaire</th>
//                 <th>Preuve</th>
//                 <th>Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {dailySales[day].map((sale, i) => (
//                 <tr key={i}>
//                   <td>{sale.productName}</td>
//                   <td>
//                     {sale.productPhoto ? (
//                       <img
//                         src={sale.productPhoto}
//                         alt={sale.productName}
//                         className="product-image-small"
//                       />
//                     ) : (
//                       <div className="no-img">Pas d'image</div>
//                     )}
//                   </td>
//                   <td>{sale.quantity}</td>
//                   <td>{sale.revenue.toLocaleString()} FCFA</td>
//                   <td>{sale.profit.toLocaleString()} FCFA</td>
//                   <td>{sale.cost.toLocaleString()} FCFA</td>
//                   <td className="comment-cell">{sale.comment || "-"}</td>
//                   <td>
//                     {sale.proofImage ? (
//                       <img
//                         src={sale.proofImage}
//                         alt="Preuve"
//                         className="proof-thumb"
//                       />
//                     ) : (
//                       <div className="no-img">Pas de preuve</div>
//                     )}
//                   </td>
//                   <td>{new Date(sale.date).toLocaleTimeString("fr-FR")}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ))}

//       <div className="summary-totals">
//         <h3>Résumé Total de la semaine :</h3>
//         <ul>
//           <li><b>Quantité vendue :</b> {summary.totalQuantity || 0}</li>
//           <li><b>Chiffre d'affaires :</b> {summary.totalRevenue?.toLocaleString() || 0} FCFA</li>
//           <li><b>Profit :</b> {summary.totalProfit?.toLocaleString() || 0} FCFA</li>
//           <li><b>Coût total :</b> {summary.totalCost?.toLocaleString() || 0} FCFA</li>
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default WeeklySummary;
