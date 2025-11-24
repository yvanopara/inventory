import React, { useEffect, useState } from "react";
import axios from "axios";
import "./cancelSale.css";

import { toast } from "react-toastify";
import { backendUrl } from "../../api/api";

const CancelSale = () => {
  const [sales, setSales] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Charger les ventes
  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/sales/get-all`);
      setSales(response.data);
    } catch (err) {
      toast.error("Erreur lors du chargement des ventes");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // Filtrer les ventes
  const filteredSales = sales.filter(sale =>
    sale.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ouvrir modal
  const openModal = (saleId) => {
    setSelectedSaleId(saleId);
    setModalVisible(true);
  };

  // Fermer modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedSaleId(null);
  };

  // Confirmer annulation
  const confirmCancel = async () => {
    try {
      await axios.patch(`${backendUrl}/api/sales/cancel/${selectedSaleId}`);
      toast.success("Vente annulée avec succès 🟢");
      fetchSales();
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'annulation");
      console.log(err);
    }
  };

  // Fonction pour obtenir la classe CSS selon le statut
  const getStatusClass = (status) => {
    const statusMap = {
      active: "cs-status-active",
      reserved: "cs-status-reserved",
      delivered: "cs-status-delivered",
      cancelled: "cs-status-cancelled"
    };
    return statusMap[status] || "cs-status-default";
  };

  // Fonction pour formater le texte du statut
  const getStatusText = (status) => {
    const statusTextMap = {
      active: "Active",
      reserved: "Réservée",
      delivered: "Livrée",
      cancelled: "Annulée"
    };
    return statusTextMap[status] || status;
  };

  return (
    <div className="cs-container">
      {/* HEADER */}
      <div className="cs-header">
        <div className="cs-header-content">
          <h2>Gestion des Ventes</h2>
          <p className="cs-subtitle">Annulation et gestion du statut des ventes</p>
        </div>
        <div className="cs-date-badge">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* STATISTIQUES RAPIDES */}
      <div className="cs-stats-grid">
        <div className="cs-stat-card cs-stat-total">
          <div className="cs-stat-icon">💰</div>
          <div className="cs-stat-content">
            <div className="cs-stat-value">{sales.length}</div>
            <div className="cs-stat-title">Total Ventes</div>
            <div className="cs-stat-subtitle">Tous statuts confondus</div>
          </div>
        </div>

        <div className="cs-stat-card cs-stat-active">
          <div className="cs-stat-icon">🟢</div>
          <div className="cs-stat-content">
            <div className="cs-stat-value">
              {sales.filter(s => s.status === 'active').length}
            </div>
            <div className="cs-stat-title">Ventes Actives</div>
            <div className="cs-stat-subtitle">En attente de traitement</div>
          </div>
        </div>

        <div className="cs-stat-card cs-stat-cancelled">
          <div className="cs-stat-icon">🔴</div>
          <div className="cs-stat-content">
            <div className="cs-stat-value">
              {sales.filter(s => s.status === 'cancelled').length}
            </div>
            <div className="cs-stat-title">Ventes Annulées</div>
            <div className="cs-stat-subtitle">Transactions annulées</div>
          </div>
        </div>
      </div>

      {/* BARRE DE RECHERCHE ET ACTIONS */}
      <div className="cs-actions-bar">
        <div className="cs-search-box">
          <input
            type="text"
            placeholder="Rechercher une vente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="cs-search-input"
          />
          <span className="cs-search-icon">🔍</span>
        </div>
        <div className="cs-actions">
          <button 
            className="cs-refresh-btn" 
            onClick={fetchSales} 
            disabled={loading}
          >
            {loading ? "🔄" : "🔄"} Actualiser
          </button>
        </div>
      </div>

      {/* TABLEAU */}
      <div className="cs-table-section">
        <div className="cs-table-header">
          <h3>Liste des Ventes</h3>
          <div className="cs-sales-count">
            <span>Total:</span>
            <div className="cs-count-badge">
              {filteredSales.length} {filteredSales.length > 1 ? 'ventes' : 'vente'}
            </div>
          </div>
        </div>

        <div className="cs-table-container">
          {loading ? (
            <div className="cs-loading">
              <div className="cs-spinner"></div>
              <p>Chargement des ventes en cours...</p>
            </div>
          ) : (
            <div className="cs-table-scroll">
              <table className="cs-sales-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Taille</th>
                    <th>Quantité</th>
                    <th>Prix</th>
                    <th>Remise</th>
                    <th>Prix Final</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="cs-no-data">
                        <div className="cs-empty-state">
                          <div className="cs-empty-icon">📦</div>
                          <h3>Aucune vente trouvée</h3>
                          <p>Aucune vente ne correspond à votre recherche</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredSales.map((sale, index) => (
                      <tr 
                        key={sale._id} 
                        className={`cs-sale-row ${index % 2 === 0 ? 'cs-even-row' : 'cs-odd-row'}`}
                      >
                        <td className="cs-product-cell">
                          <span className="cs-product-name">{sale.productName}</span>
                        </td>
                        <td className="cs-text-center">{sale.variantSize || "-"}</td>
                        <td className="cs-quantity-cell">
                          <span className="cs-quantity-badge">{sale.quantity}</span>
                        </td>
                        <td className="cs-text-right">{sale.sellingPrice} FCFA</td>
                        <td className="cs-text-right">{sale.discount} FCFA</td>
                        <td className="cs-revenue-cell">{sale.finalPrice} FCFA</td>

                        {/* STATUT */}
                        <td>
                          <span className={`cs-status-badge ${getStatusClass(sale.status)}`}>
                            {getStatusText(sale.status)}
                          </span>
                        </td>

                        {/* DATE */}
                        <td className="cs-time-cell">
                          {new Date(sale.createdAt).toLocaleString("fr-FR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>

                        {/* ACTION */}
                        <td className="cs-action-cell">
                          {sale.status === "active" ? (
                            <button
                              className="cs-cancel-btn"
                              onClick={() => openModal(sale._id)}
                            >
                              <span className="cs-btn-icon">✕</span>
                              Annuler
                            </button>
                          ) : (
                            <span className="cs-no-action">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RÉSUMÉ */}
        {!loading && filteredSales.length > 0 && (
          <div className="cs-day-summary">
            <div className="cs-summary-item">
              <span className="cs-summary-label">Chiffre d'affaires total:</span>
              <span className="cs-summary-value cs-profit-highlight">
                {filteredSales.reduce((sum, sale) => sum + (sale.finalPrice || 0), 0)} FCFA
              </span>
            </div>
            <div className="cs-summary-item">
              <span className="cs-summary-label">Ventes annulables:</span>
              <span className="cs-summary-value">
                {filteredSales.filter(s => s.status === 'active').length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE CONFIRMATION */}
      {modalVisible && (
        <div className="cs-modal-overlay" onClick={closeModal}>
          <div className="cs-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="cs-modal-header">
              <h3>Confirmer l'annulation</h3>
              <button className="cs-modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="cs-modal-content">
              <div className="cs-warning-icon">⚠️</div>
              <p>Êtes-vous sûr de vouloir annuler cette vente ?</p>
              <p className="cs-modal-warning">Cette action est irréversible et remettra le stock à jour.</p>
            </div>
            <div className="cs-modal-buttons">
              <button className="cs-btn-cancel" onClick={closeModal}>
                <span className="cs-btn-icon">←</span>
                Non, conserver
              </button>
              <button className="cs-btn-confirm" onClick={confirmCancel}>
                <span className="cs-btn-icon">✕</span>
                Oui, annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancelSale;























// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./cancelSale.css";

// import { toast } from "react-toastify";
// import { backendUrl } from "../../api/api";

// const CancelSale = () => {
//   const [sales, setSales] = useState([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedSaleId, setSelectedSaleId] = useState(null);

//   // Charger les ventes
//   const fetchSales = async () => {
//     try {
//       const response = await axios.get(`${backendUrl}/api/sales/get-all`);
//       setSales(response.data);
//     } catch (err) {
//       toast.error("Erreur lors du chargement des ventes");
//       console.log(err);
//     }
//   };

//   useEffect(() => {
//     fetchSales();
//   }, []);

//   // Ouvrir modal
//   const openModal = (saleId) => {
//     setSelectedSaleId(saleId);
//     setModalVisible(true);
//   };

//   // Fermer modal
//   const closeModal = () => {
//     setModalVisible(false);
//     setSelectedSaleId(null);
//   };

//   // Confirmer annulation
//   const confirmCancel = async () => {
//     try {
//       await axios.patch(`${backendUrl}/api/sales/cancel/${selectedSaleId}`);

//       toast.success("Vente annulée avec succès 🟢");

//       fetchSales();
//       closeModal();
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Erreur lors de l’annulation");
//       console.log(err);
//     }
//   };

//   return (
//     <div className="sales-container">
//       <h2 className="sales-title">Liste des ventes</h2>

//       <table className="sales-table">
//         <thead>
//           <tr>
//             <th>Produit</th>
//             <th>Taille</th>
//             <th>Quantité</th>
//             <th>Prix</th>
//             <th>Remise</th>
//             <th>Prix Final</th>
//             <th>Statut</th>
//             <th>Date</th>
//             <th>Action</th>
//           </tr>
//         </thead>

//         <tbody>
//           {sales.map((sale) => (
//             <tr key={sale._id}>
//               <td>{sale.productName}</td>
//               <td>{sale.variantSize || "-"}</td>
//               <td>{sale.quantity}</td>
//               <td>{sale.sellingPrice} FCFA</td>
//               <td>{sale.discount} FCFA</td>
//               <td>{sale.finalPrice} FCFA</td>

//               {/* STATUT */}
//               <td>
//                 <span className={`status-badge ${sale.status}`}>
//                   {sale.status === "active" && "Active"}
//                   {sale.status === "reserved" && "Réservée"}
//                   {sale.status === "delivered" && "Livrée"}
//                   {sale.status === "cancelled" && "Annulée"}
//                 </span>
//               </td>

//               {/* DATE */}
//               <td>
//                 {new Date(sale.createdAt).toLocaleString("fr-FR", {
//                   dateStyle: "short",
//                   timeStyle: "short",
//                 })}
//               </td>

//               {/* ACTION */}
//               <td>
//                 {sale.status === "active" ? (
//                   <button
//                     className="cancel-btn"
//                     onClick={() => openModal(sale._id)}
//                   >
//                     Annuler
//                   </button>
//                 ) : (
//                   "-"
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* MODAL */}
//       {modalVisible && (
//         <div className="modal-overlay">
//           <div className="modal-box">
//             <h3>Confirmation</h3>
//             <p>Voulez-vous vraiment annuler cette vente ?</p>

//             <div className="modal-buttons">
//               <button className="btn-confirm" onClick={confirmCancel}>
//                 Oui, annuler
//               </button>
//               <button className="btn-cancel" onClick={closeModal}>
//                 Non, fermer
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CancelSale;
