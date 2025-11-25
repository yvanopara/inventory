import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ReservedList.css";
import { toast } from "react-toastify";
import { backendUrl } from "../../App";

const ReservedList = () => {
  const [reservedSales, setReservedSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(""); // <-- message d'erreur pour l'UI

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
          timeout: 10000, // timeout raisonnable
        });

        // DEBUG: log complet pour la console
        console.debug("fetchReservedSales response:", res);

        // Si backend répond OK et fournit success + reservedSales
        if (res.status === 200 && res.data && res.data.success) {
          const sortedSales = [...(res.data.reservedSales || [])].sort(
            (a, b) => parseDateDMY(a.deliveryDate) - parseDateDMY(b.deliveryDate)
          );
          setReservedSales(sortedSales);
        } else {
          // Pas d'erreur fatale : on considère qu'il n'y a simplement pas de réservations
          setReservedSales(res.data?.reservedSales || []);
          // Ne pas utiliser toast ici (tu l'as demandé)
          console.info("Aucune réservation retournée ou success=false", res.data);
        }
      } catch (err) {
        // Ne plus afficher le toast d'erreur ici — on affiche un message dans l'UI
        console.error("Erreur fetchReservedSales:", err);
        // Extraire message utile s'il existe
        const serverMessage = err.response?.data?.message;
        const status = err.response?.status;
        const message = serverMessage || (status ? `Erreur serveur ${status}` : err.message);
        setErrorMsg(`Impossible de charger les réservations — ${message}`);
        // On vide la liste côté UI pour éviter ancien contenu
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
      console.error("Erreur handleActivate:", err);
      toast.error(err.response?.data?.message || "Erreur lors de l'activation ❌");
    }
  };

  // ... (getDeliveryStatus et styles restent identiques si tu veux)
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

  const colorGradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  ];
  const getCardGradient = (index) => colorGradients[index % colorGradients.length];

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
      <div className="reserved-header">
        <div className="header-content">
          <h1>📦 Commandes Réservées</h1>
          <p>Faites défiler horizontalement pour voir toutes les commandes</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-number">{reservedSales.length}</span>
            <span className="stat-label">En attente</span>
          </div>
        </div>
      </div>

      {/* --- Affiche message d'erreur si la requête a vraiment échoué --- */}
      {errorMsg && (
        <div className="fetch-error">
          <strong>Erreur :</strong> {errorMsg}
          <p style={{ fontSize: 12, color: "#666" }}>
            Vérifie la console réseau (Network) pour plus de détails.
          </p>
        </div>
      )}

      {reservedSales.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>{errorMsg ? "Impossible de charger les réservations" : "Aucune commande réservée"}</h3>
          <p>{errorMsg ? "Voir l'erreur ci-dessus." : "Les nouvelles commandes réservées apparaîtront ici"}</p>
        </div>
      ) : (
        <div className="horizontal-scroll-container">
          <div className="cards-scroll-wrapper">
            {reservedSales.map((sale, index) => {
              const deliveryStatus = getDeliveryStatus(sale.deliveryDate);
              const cardGradient = getCardGradient(index);

              return (
                <div key={sale._id} className="reserved-card" style={{ background: cardGradient }}>
                  <div className="card-content">
                    <div className="card-header">
                      <h3 className="product-name">{sale.productName}</h3>
                      <div className={`status-badge ${deliveryStatus}`}>
                        {deliveryStatus === "overdue" && "⚠️ Retard"}
                        {deliveryStatus === "today" && "🎯 Aujourd'hui"}
                        {deliveryStatus === "urgent" && "🔥 Urgent"}
                        {deliveryStatus === "upcoming" && "📅 Bientôt"}
                        {deliveryStatus === "normal" && "📦 Planifié"}
                      </div>
                    </div>

                    <div className="main-info">
                      <div className="info-row">
                        <span className="info-label">📏 Taille:</span>
                        <span className="info-value">{sale.variantSize || "-"}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">📦 Quantité:</span>
                        <span className="info-value">{sale.quantity}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">💰 Prix unitaire:</span>
                        <span className="info-value">{sale.sellingPrice} FCFA</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">🎫 Remise:</span>
                        <span className="info-value">{sale.discount} FCFA</span>
                      </div>
                    </div>

                    <div className="delivery-section">
                      <div className="delivery-info">
                        <span className="date-icon">📅</span>
                        <span className="delivery-date">{sale.deliveryDate}</span>
                      </div>
                      <div className="customer-info">
                        <span className="phone-icon">📞</span>
                        <span className="customer-phone">{sale.customerPhone || "Non fourni"}</span>
                      </div>
                    </div>

                    <div className="price-section">
                      <div className="total-price">
                        <span>Total:</span>
                        <strong>{sale.finalPrice} FCFA</strong>
                      </div>
                    </div>

                    {sale.comment && (
                      <div className="comment-section">
                        <div className="comment-bubble">
                          <span className="comment-icon">💬</span>
                          <p className="comment-text">{sale.comment}</p>
                        </div>
                      </div>
                    )}

                    <div className="card-actions">
                      <button className="activate-btn" onClick={() => handleActivate(sale._id)}>
                        <span className="btn-icon">✅</span> Marquer payé
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
