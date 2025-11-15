import React, { useEffect, useState } from "react";
import { api } from "../../../api/api"; 
import "./DailySummary.css";

const DailySummary = () => {
  const [summary, setSummary] = useState({});
  const [sales, setSales] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/sales/summary/daily");
        setSummary(res.data.summary);
        setSales(res.data.sales);
      } catch (err) {
        console.error(err);
        setMessage("Erreur lors du chargement du résumé quotidien");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString('fr-FR') + ' FCFA';
  };

  const StatCard = ({ title, value, subtitle, icon, color = "#4f46e5" }) => (
    <div className="ds-stat-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="ds-stat-icon">{icon}</div>
      <div className="ds-stat-content">
        <div className="ds-stat-value">{value}</div>
        <div className="ds-stat-title">{title}</div>
        {subtitle && <div className="ds-stat-subtitle">{subtitle}</div>}
      </div>
    </div>
  );

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="ds-container">
        <div className="ds-loading">
          <div className="ds-spinner"></div>
          <p>Chargement des données du jour...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ds-container">
      {/* Header avec date */}
      <div className="ds-header">
        <div className="ds-header-content">
          <h2>Résumé des Ventes du Jour</h2>
          <p className="ds-subtitle">
            Aperçu complet des performances commerciales aujourd'hui
          </p>
        </div>
        <div className="ds-date-badge">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Message d'erreur */}
      {message && (
        <div className="ds-message-container">
          <div className="ds-error">
            <span className="ds-error-icon">⚠️</span>
            {message}
          </div>
        </div>
      )}

      {/* Cartes de statistiques */}
      <div className="ds-stats-grid">
        <StatCard
          title="Total des Ventes"
          value={summary.totalQuantity || 0}
          subtitle="unités vendues"
          icon="📦"
          color="#3B82F6"
        />
        <StatCard
          title="Chiffre d'Affaires"
          value={formatCurrency(summary.totalRevenue)}
          subtitle="revenu total"
          icon="💰"
          color="#10B981"
        />
        <StatCard
          title="Profit Net"
          value={formatCurrency(summary.totalProfit)}
          subtitle="bénéfice réalisé"
          icon="📈"
          color="#059669"
        />
        <StatCard
          title="Coût Total"
          value={formatCurrency(summary.totalCost)}
          subtitle="coût des marchandises"
          icon="💸"
          color="#EF4444"
        />
      </div>

      {/* Indicateur de performance */}
      {summary.totalRevenue > 0 && (
        <div className="ds-performance-indicator">
          <div className="ds-performance-item">
            <span className="ds-performance-label">Marge bénéficiaire :</span>
            <span className="ds-performance-value">
              {((summary.totalProfit / summary.totalRevenue) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="ds-performance-item">
            <span className="ds-performance-label">Vente moyenne :</span>
            <span className="ds-performance-value">
              {formatCurrency(summary.totalRevenue / (summary.totalQuantity || 1))}
            </span>
          </div>
        </div>
      )}

      {/* Tableau des ventes */}
      {sales.length > 0 ? (
        <div className="ds-table-section">
          <div className="ds-table-header">
            <h3>Détail des Ventes</h3>
            <div className="ds-sales-count">
              <span className="ds-count-badge">{sales.length}</span>
              vente(s) aujourd'hui
            </div>
          </div>
          
          <div className="ds-table-container">
            <div className="ds-table-scroll">
              <table className="ds-sales-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Photo</th>
                    <th>Qté</th>
                    <th>Prix</th>
                    <th>Profit</th>
                    <th>Coût</th>
                    <th>Téléphone</th>
                    <th>Commentaire</th>
                    <th>Preuve</th>
                    <th>Heure</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale, index) => (
                    <tr key={index} className={index % 2 === 0 ? "ds-even-row" : "ds-odd-row"}>
                      <td className="ds-product-cell">
                        <span className="ds-product-name">{sale.productName}</span>
                      </td>
                      <td>
                        {sale.productPhoto ? (
                          <img
                            src={sale.productPhoto}
                            alt={sale.productName}
                            className="ds-product-image"
                            onClick={() => openImageModal(sale.productPhoto)}
                          />
                        ) : (
                          <div className="ds-no-image">
                            <span>📷</span>
                          </div>
                        )}
                      </td>
                      <td className="ds-quantity-cell">
                        <span className="ds-quantity-badge">{sale.quantity}</span>
                      </td>
                      <td className="ds-revenue-cell">{formatCurrency(sale.revenue)}</td>
                      <td className="ds-profit-cell">{formatCurrency(sale.profit)}</td>
                      <td className="ds-cost-cell">{formatCurrency(sale.cost)}</td>
                      <td className="ds-phone-cell">
                        {sale.customerPhone ? (
                          <a href={`tel:${sale.customerPhone}`} className="ds-phone-link">
                            {sale.customerPhone}
                          </a>
                        ) : (
                          <span className="ds-no-phone">-</span>
                        )}
                      </td>
                      <td className="ds-comment-cell">
                        <div className="ds-comment-content">
                          {sale.comment ? (
                            <>
                              <span className="ds-comment-text">
                                {sale.comment}
                              </span>
                            </>
                          ) : (
                            <span className="ds-no-comment">-</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {sale.proofImage ? (
                          <img
                            src={sale.proofImage}
                            alt="Preuve"
                            className="ds-proof-image"
                            onClick={() => openImageModal(sale.proofImage)}
                          />
                        ) : (
                          <div className="ds-no-proof">
                            <span>📄</span>
                          </div>
                        )}
                      </td>
                      <td className="ds-time-cell">
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

          {/* Résumé du jour */}
          <div className="ds-day-summary">
            <div className="ds-summary-item">
              <span className="ds-summary-label">Total Quantité :</span>
              <span className="ds-summary-value">{summary.totalQuantity || 0}</span>
            </div>
            <div className="ds-summary-item">
              <span className="ds-summary-label">Total Ventes :</span>
              <span className="ds-summary-value">{formatCurrency(summary.totalRevenue)}</span>
            </div>
            <div className="ds-summary-item">
              <span className="ds-summary-label">Total Profit :</span>
              <span className="ds-summary-value ds-profit-highlight">
                {formatCurrency(summary.totalProfit)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="ds-empty-state">
          <div className="ds-empty-icon">📊</div>
          <h3>Aucune vente aujourd'hui</h3>
          <p>Les ventes du jour apparaîtront ici.</p>
        </div>
      )}

      {/* Modal pour les images */}
      {selectedImage && (
        <div className="ds-image-modal" onClick={closeImageModal}>
          <div className="ds-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="ds-modal-close" onClick={closeImageModal}>×</button>
            <img src={selectedImage} alt="Agrandissement" className="ds-modal-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default DailySummary; 












// import React, { useEffect, useState } from "react";
// import { api } from "../../../api/api"; 
// import "./DailySummary.css";

// const DailySummary = () => {
//   const [summary, setSummary] = useState({});
//   const [sales, setSales] = useState([]);
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     const fetchSummary = async () => {
//       try {
//         const res = await api.get("/api/sales/summary/daily");
//         setSummary(res.data.summary);
//         setSales(res.data.sales);
//       } catch (err) {
//         console.error(err);
//         setMessage("Erreur lors du chargement du résumé");
//       }
//     };

//     fetchSummary();
//   }, []);

//   return (
//     <div className="daily-summary-container">
//       <h2>Résumé des ventes du jour ({summary.totalQuantity || 0} ventes)</h2>
//       {message && <p className="error">{message}</p>}

//       <table className="sales-table">
//         <thead>
//           <tr>
//             <th>Produit</th>
//             <th>Photo</th>
//             <th>Quantité</th>
//             <th>Prix</th>
//             <th>Profit</th>
//             <th>Coût</th>
//             <th>Téléphone</th>
//             <th>Commentaire</th>
//             <th>Preuve</th>
//             <th>Date</th>
//           </tr>
//         </thead>

//         <tbody>
//           {sales.map((sale, index) => (
//             <tr key={index}>
//               <td>{sale.productName}</td>

//               <td>
//                 {sale.productPhoto ? (
//                   <img
//                     src={sale.productPhoto}
//                     alt={sale.productName}
//                     className="product-image-small"
//                   />
//                 ) : (
//                   <div className="no-img">Pas d'image</div>
//                 )}
//               </td>

//               <td>{sale.quantity}</td>
//               <td>{sale.revenue.toLocaleString()} FCFA</td>
//               <td>{sale.profit.toLocaleString()} FCFA</td>
//               <td>{sale.cost.toLocaleString()} FCFA</td>

//               {/* Téléphone */}
//               <td>{sale.customerPhone || "-"}</td>

//               {/* Commentaire avec HOVER TOOLTIP */}
//               <td className="comment-cell tooltip">
//                 {sale.comment || "-"}
//                 {sale.comment && (
//                   <span className="tooltiptext">{sale.comment}</span>
//                 )}
//               </td>

//               <td>
//                 {sale.proofImage ? (
//                   <img
//                     src={sale.proofImage}
//                     alt="Preuve"
//                     className="proof-thumb"
//                   />
//                 ) : (
//                   <div className="no-img">Pas de preuve</div>
//                 )}
//               </td>

//               <td>{new Date(sale.date).toLocaleTimeString("fr-FR")}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <div className="summary-totals">
//         <h3>Résumé Total :</h3>
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

// export default DailySummary;
