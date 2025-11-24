import React, { useEffect, useState } from "react";
import axios from "axios";
import "./cancelSale.css";

import { toast } from "react-toastify";
import { backendUrl } from "../../api/api";

const CancelSale = () => {
  const [sales, setSales] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState(null);

  // Charger les ventes
  const fetchSales = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/sales/get-all`);
      setSales(response.data);
    } catch (err) {
      toast.error("Erreur lors du chargement des ventes");
      console.log(err);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

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
      toast.error(err.response?.data?.message || "Erreur lors de l’annulation");
      console.log(err);
    }
  };

  return (
    <div className="sales-container">
      <h2 className="sales-title">Liste des ventes</h2>

      <table className="sales-table">
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
          {sales.map((sale) => (
            <tr key={sale._id}>
              <td>{sale.productName}</td>
              <td>{sale.variantSize || "-"}</td>
              <td>{sale.quantity}</td>
              <td>{sale.sellingPrice} FCFA</td>
              <td>{sale.discount} FCFA</td>
              <td>{sale.finalPrice} FCFA</td>

              {/* STATUT */}
              <td>
                <span className={`status-badge ${sale.status}`}>
                  {sale.status === "active" && "Active"}
                  {sale.status === "reserved" && "Réservée"}
                  {sale.status === "delivered" && "Livrée"}
                  {sale.status === "cancelled" && "Annulée"}
                </span>
              </td>

              {/* DATE */}
              <td>
                {new Date(sale.createdAt).toLocaleString("fr-FR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </td>

              {/* ACTION */}
              <td>
                {sale.status === "active" ? (
                  <button
                    className="cancel-btn"
                    onClick={() => openModal(sale._id)}
                  >
                    Annuler
                  </button>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Confirmation</h3>
            <p>Voulez-vous vraiment annuler cette vente ?</p>

            <div className="modal-buttons">
              <button className="btn-confirm" onClick={confirmCancel}>
                Oui, annuler
              </button>
              <button className="btn-cancel" onClick={closeModal}>
                Non, fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancelSale;
