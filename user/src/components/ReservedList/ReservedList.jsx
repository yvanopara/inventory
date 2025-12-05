import React, { useEffect, useState } from "react"; 
import axios from "axios"; 
import "./ReservedList.css";
import { toast } from "react-toastify";
import { backendUrl } from "../../App";

// Fonction pour formater les dates ISO en format humain français
const formatISODate = (isoString) => {
  if (!isoString) return "Date inconnue";

  const date = new Date(isoString);

  return date.toLocaleString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const ReservedList = () => {
  const [reservedSales, setReservedSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const parseDateDMY = (dateStr) => {
    if (!dateStr) return new Date();
    const [day, month, year] = dateStr.split("/");
    return new Date(`${year}-${month}-${day}`);
  };

  useEffect(() => {
    const fetchReservedSales = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await axios.get(`${backendUrl}/api/sales/get-reserve`, {
          timeout: 10000,
        });

        if (res.status === 200 && res.data?.success) {
          const sortedSales = [...(res.data.reservedSales || [])].sort(
            (a, b) => parseDateDMY(a.deliveryDate) - parseDateDMY(b.deliveryDate)
          );
          setReservedSales(sortedSales);
        } else {
          setReservedSales(res.data?.reservedSales || []);
        }
      } catch (err) {
        const serverMessage = err.response?.data?.message;
        const status = err.response?.status;
        const message = serverMessage || (status ? `Erreur serveur ${status}` : err.message);
        setErrorMsg(`Impossible de charger les réservations — ${message}`);
        setReservedSales([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReservedSales();
  }, []);

  const handleActivate = async (saleId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Veuillez vous connecter pour modifier la réservation !");
        return;
      }

      const res = await axios.patch(
        `${backendUrl}/api/sales/deliver/${saleId}`,
        {},
        { headers: { token } }
      );

      if (res.data.success || res.status === 200) {
        toast.success("✅ Réservation payée !");
        setReservedSales((prev) => prev.filter((sale) => sale._id !== saleId));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'activation ❌");
    }
  };

  const getDeliveryStatus = (deliveryDate) => {
    const today = new Date();
    const delivery = parseDateDMY(deliveryDate);
    const diffTime = delivery - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "overdue";
    if (diffDays === 0) return "today";
    if (diffDays <= 2) return "urgent";
    if (diffDays <= 7) return "upcoming";
    return "normal";
  };

  const statusConfig = {
    overdue: { label: "⚠️ En retard", color: "#ef4444", bgColor: "#fef2f2" },
    today: { label: "🎯 Aujourd'hui", color: "#3b82f6", bgColor: "#eff6ff" },
    urgent: { label: "🔥 Urgent", color: "#f97316", bgColor: "#fff7ed" },
    upcoming: { label: "📅 À venir", color: "#8b5cf6", bgColor: "#f5f3ff" },
    normal: { label: "📦 Planifié", color: "#10b981", bgColor: "#f0fdf4" }
  };

  const colorThemes = [
    { bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", text: "white" },
    { bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", text: "white" },
    { bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", text: "white" },
    { bg: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", text: "#1f2937" },
    { bg: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", text: "#1f2937" },
  ];

  const getCardTheme = (index) => colorThemes[index % colorThemes.length];

  if (loading) {
    return (
      <div className="reserved-list">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des commandes réservées...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reserved-list">
      <div className="header-section">
        <div className="header-left">
          <h1 className="page-title">📦 Commandes Réservées</h1>
          <p className="page-subtitle">Gestion des réservations en attente de paiement</p>
        </div>
        <div className="header-right">
          <div className="stats-card">
            <span className="stats-number">{reservedSales.length}</span>
            <span className="stats-label">Commandes en attente</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <strong>Erreur de chargement</strong>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      {reservedSales.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>{errorMsg ? "Impossible de charger les réservations" : "Aucune commande réservée"}</h3>
          <p>Les nouvelles commandes réservées apparaîtront ici</p>
        </div>
      ) : (
        <div className="cards-container">
          {reservedSales.map((sale, index) => {
            const deliveryStatus = getDeliveryStatus(sale.deliveryDate);
            const status = statusConfig[deliveryStatus];
            const theme = getCardTheme(index);

            return (
              <div 
                key={sale._id} 
                className="sale-card"
                style={{ 
                  background: theme.bg,
                  color: theme.text
                }}
              >
                <div className="card-header">
                  <div className="product-section">
                    <h3 className="product-name">{sale.productName}</h3>
                    <div 
                      className="status-badge"
                      style={{
                        backgroundColor: status.bgColor,
                        color: status.color
                      }}
                    >
                      {status.label}
                    </div>
                  </div>
                  <div className="delivery-info">
                    <span className="date-icon">📅</span>
                    <span className="delivery-date">{formatISODate(sale.deliveryDate)}</span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-icon">📏</span>
                      <div className="detail-content">
                        <span className="detail-label">Taille</span>
                        <span className="detail-value">{sale.variantSize || "-"}</span>
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-icon">📦</span>
                      <div className="detail-content">
                        <span className="detail-label">Quantité</span>
                        <span className="detail-value">{sale.quantity}</span>
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-icon">💰</span>
                      <div className="detail-content">
                        <span className="detail-label">Prix unitaire</span>
                        <span className="detail-value">{sale.sellingPrice} FCFA</span>
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-icon">🎫</span>
                      <div className="detail-content">
                        <span className="detail-label">Remise</span>
                        <span className="detail-value">{sale.discount} FCFA</span>
                      </div>
                    </div>
                  </div>

                  <div className="customer-section">
                    <div className="customer-item">
                      <span className="customer-icon">📞</span>
                      <div>
                        <span className="customer-label">Téléphone client</span>
                        <span className="customer-phone">{sale.customerPhone || "Non fourni"}</span>
                      </div>
                    </div>
                  </div>

                  {sale.comment && (
                    <div className="comment-section">
                      <span className="comment-icon">💬</span>
                      <div className="comment-text">
                        <p>{sale.comment}</p>
                      </div>
                    </div>
                  )}

                  <div className="total-section">
                    <div className="total-content">
                      <span className="total-label">Montant total</span>
                      <span className="total-amount">{sale.finalPrice} FCFA</span>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <button 
                    className="action-button"
                    onClick={() => handleActivate(sale._id)}
                    style={{
                      backgroundColor: theme.text === "white" ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.1)",
                      color: theme.text === "white" ? "#1f2937" : theme.text
                    }}
                  >
                    <span className="button-icon">✅</span>
                    Marquer comme payé
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReservedList;







// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./ReservedList.css";
// import { toast } from "react-toastify";
// import { backendUrl } from "../../App";

// const ReservedList = () => {
//   const [reservedSales, setReservedSales] = useState([]);

//   // --- Utilitaire pour parser les dates "dd/mm/yyyy"
//   const parseDateDMY = (dateStr) => {
//     if (!dateStr) return new Date();
//     const [day, month, year] = dateStr.split("/");
//     return new Date(`${year}-${month}-${day}`);
//   };

//   useEffect(() => {
//     const fetchReservedSales = async () => {
//       try {
//         const res = await axios.get(`${backendUrl}/api/sales/get-reserve`);
//         if (res.data.success) {
//           // Trier par date de livraison croissante
//           const sortedSales = [...res.data.reservedSales].sort(
//             (a, b) => parseDateDMY(a.deliveryDate) - parseDateDMY(b.deliveryDate)
//           );
//           setReservedSales(sortedSales);
//         } else {
//           toast.error("Aucune commande réservée trouvée");
//         }
//       } catch (err) {
//         console.error(err);
//         toast.error("Erreur lors du chargement des réservations ❌");
//       }
//     };
//     fetchReservedSales();
//   }, []);

//   // --- Activer une réservation
//   const handleActivate = async (saleId) => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         toast.error("Veuillez vous connecter pour modifier la réservation !");
//         return;
//       }

//       const res = await axios.patch(
//         `${backendUrl}/api/sales/deliver/${saleId}`,
//         {},
//         { headers: { token } }
//       );

//       if (res.data.success || res.status === 200) {
//         toast.success("✅ Réservation payée !");
//         // Mettre à jour la liste côté front
//         setReservedSales((prev) =>
//           prev.filter((sale) => sale._id !== saleId)
//         );
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.data?.message || "Erreur lors de l'activation ❌");
//     }
//   };

//   return (
//     <div className="reserved-list">
//       <h2>📦 Commandes Réservées</h2>

//       {reservedSales.length === 0 ? (
//         <p className="no-data">Aucune commande réservée pour le moment.</p>
//       ) : (
//         <div className="reserved-row">
//           {reservedSales.map((sale) => (
//             <div key={sale._id} className="reserved-card">
//               <h3>{sale.productName}</h3>
//               <p><strong>Taille :</strong> {sale.variantSize || "Aucune"}</p>
//               <p><strong>Quantité :</strong> {sale.quantity}</p>
//               <p><strong>Prix unitaire :</strong> {sale.sellingPrice} FCFA</p>
//               <p><strong>Remise :</strong> {sale.discount} FCFA</p>
//               <p><strong>Prix total :</strong> {sale.finalPrice} FCFA</p>
//               <p><strong>Date de livraison :</strong> {sale.deliveryDate}</p>
//               <p><strong>Téléphone client :</strong> {sale.customerPhone || "Non fourni"}</p>
//               <p><strong>Commentaire :</strong> {sale.comment || "Aucun"}</p>

//               <button
//                 className="activate-btn"
//                 onClick={() => handleActivate(sale._id)}
//               >
//                 Activer
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ReservedList;
