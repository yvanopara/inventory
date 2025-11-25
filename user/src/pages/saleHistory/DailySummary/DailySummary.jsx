import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DailySummary.css";
import { backendUrl } from "../../../App";

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
        const res = await axios.get(
          `${backendUrl}/api/sales/summary/daily`,
          { headers: { token: localStorage.getItem("token") } }
        );
        setSummary(res.data.summary);
        setSales(res.data.sales);
      } catch (err) {
        console.error(err);
        setMessage("Erreur lors du chargement du résumé");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString('fr-FR') + ' FCFA';
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="ds-container">
        <div className="ds-loading">
          <div className="ds-spinner"></div>
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ds-container">
      {/* Header */}
      <div className="ds-header">
        <div className="ds-header-content">
          <h2>Résumé des Ventes du Jour</h2>
          <p className="ds-subtitle">Aperçu complet de votre performance commerciale quotidienne</p>
        </div>
        <div className="ds-date-badge">
          {getCurrentDate()}
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
        <div className="ds-stat-card" style={{ borderLeftColor: '#4f46e5' }}>
          <div className="ds-stat-icon" style={{ color: '#4f46e5' }}>
            📊
          </div>
          <div className="ds-stat-content">
            <div className="ds-stat-value">{summary.totalQuantity || 0}</div>
            <div className="ds-stat-title">Ventes Total</div>
            <div className="ds-stat-subtitle">Unités vendues aujourd'hui</div>
          </div>
        </div>

        <div className="ds-stat-card" style={{ borderLeftColor: '#10b981' }}>
          <div className="ds-stat-icon" style={{ color: '#10b981' }}>
            💰
          </div>
          <div className="ds-stat-content">
            <div className="ds-stat-value">{formatCurrency(summary.totalRevenue)}</div>
            <div className="ds-stat-title">Chiffre d'Affaires</div>
            <div className="ds-stat-subtitle">Revenu total généré</div>
          </div>
        </div>

        <div className="ds-stat-card" style={{ borderLeftColor: '#f59e0b' }}>
          <div className="ds-stat-icon" style={{ color: '#f59e0b' }}>
            🛒
          </div>
          <div className="ds-stat-content">
            <div className="ds-stat-value">{sales.length}</div>
            <div className="ds-stat-title">Transactions</div>
            <div className="ds-stat-subtitle">Nombre de ventes effectuées</div>
          </div>
        </div>
      </div>

      {/* Section Tableau */}
      <div className="ds-table-section">
        <div className="ds-table-header">
          <h3>Détail des Ventes</h3>
          <div className="ds-sales-count">
            <span>Total des ventes :</span>
            <span className="ds-count-badge">{sales.length} transactions</span>
          </div>
        </div>

        <div className="ds-table-container">
          <div className="ds-table-scroll">
            <table className="ds-sales-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Photo</th>
                  <th>Quantité</th>
                  <th>Prix</th>
                  <th>Téléphone</th>
                  <th>Commentaire</th>
                  <th>Preuve</th>
                  <th>Heure</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'ds-even-row' : 'ds-odd-row'}>
                    <td className="ds-product-cell">
                      <span className="ds-product-name">{sale.productName}</span>
                    </td>
                    <td>
                      {sale.productPhoto ? (
                        <img
                          src={sale.productPhoto}
                          alt={sale.productName}
                          className="ds-product-image"
                          onClick={() => setSelectedImage(sale.productPhoto)}
                        />
                      ) : (
                        <div className="ds-no-image">📷</div>
                      )}
                    </td>
                    <td className="ds-quantity-cell">
                      <span className="ds-quantity-badge">{sale.quantity}</span>
                    </td>
                    <td className="ds-revenue-cell">{formatCurrency(sale.revenue)}</td>
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
                          <span className="ds-comment-text">{sale.comment}</span>
                        ) : (
                          <span className="ds-no-comment">-</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {sale.proofImage ? (
                        <img
                          src={sale.proofImage}
                          alt="Preuve de vente"
                          className="ds-proof-image"
                          onClick={() => setSelectedImage(sale.proofImage)}
                        />
                      ) : (
                        <div className="ds-no-proof">📄</div>
                      )}
                    </td>
                    <td className="ds-time-cell">
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

        {/* Résumé du jour */}
        <div className="ds-day-summary">
          <div className="ds-summary-item">
            <span className="ds-summary-label">Quantité totale vendue :</span>
            <span className="ds-summary-value">{summary.totalQuantity || 0}</span>
          </div>
          <div className="ds-summary-item">
            <span className="ds-summary-label">Chiffre d'affaires :</span>
            <span className="ds-summary-value ds-profit-highlight">
              {formatCurrency(summary.totalRevenue)}
            </span>
          </div>
          <div className="ds-summary-item">
            <span className="ds-summary-label">Nombre de transactions :</span>
            <span className="ds-summary-value">{sales.length}</span>
          </div>
        </div>
      </div>

      {/* Modal pour les images */}
      {selectedImage && (
        <div className="ds-image-modal" onClick={() => setSelectedImage(null)}>
          <div className="ds-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="ds-modal-close"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
            <img src={selectedImage} alt="Agrandissement" className="ds-modal-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default DailySummary;



// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./DailySummary.css";
// import { backendUrl } from "../../../App";

// const DailySummary = () => {
//   const [summary, setSummary] = useState({});
//   const [sales, setSales] = useState([]);
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     const fetchSummary = async () => {
//       try {
//         const res = await axios.get(
//           `${backendUrl}/api/sales/summary/daily`,
//           { headers: { token: localStorage.getItem("token") } }
//         );
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
//             <th>Numéro de téléphone</th>
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
//               <td>{sale.customerPhone || "-"}</td>
//               <td className="comment-cell">{sale.comment || "-"}</td>
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
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default DailySummary;







