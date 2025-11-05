import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ReservedList.css";
import { toast } from "react-toastify";

const ReservedList = () => {
  const [reservedSales, setReservedSales] = useState([]);

  // --- Utilitaire pour parser les dates "dd/mm/yyyy"
  const parseDateDMY = (dateStr) => {
    if (!dateStr) return new Date();
    const [day, month, year] = dateStr.split("/");
    return new Date(`${year}-${month}-${day}`);
  };

  useEffect(() => {
    const fetchReservedSales = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/sales/get-reserve");
        if (res.data.success) {
          // Trier par date de livraison croissante
          const sortedSales = [...res.data.reservedSales].sort(
            (a, b) => parseDateDMY(a.deliveryDate) - parseDateDMY(b.deliveryDate)
          );
          setReservedSales(sortedSales);
        } else {
          toast.error("Aucune commande réservée trouvée");
        }
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors du chargement des réservations ❌");
      }
    };
    fetchReservedSales();
  }, []);

  // --- Activer une réservation
  const handleActivate = async (saleId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Veuillez vous connecter pour modifier la réservation !");
        return;
      }

      const res = await axios.patch(
        `http://localhost:5000/api/sales/deliver/${saleId}`,
        {},
        { headers: { token } }
      );

      if (res.data.success || res.status === 200) {
        toast.success("✅ Réservation activée !");
        // Mettre à jour la liste côté front
        setReservedSales((prev) =>
          prev.filter((sale) => sale._id !== saleId)
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erreur lors de l'activation ❌");
    }
  };

  return (
    <div className="reserved-list">
      <h2>📦 Commandes Réservées</h2>

      {reservedSales.length === 0 ? (
        <p className="no-data">Aucune commande réservée pour le moment.</p>
      ) : (
        <div className="reserved-row">
          {reservedSales.map((sale) => (
            <div key={sale._id} className="reserved-card">
              <h3>{sale.productName}</h3>
              <p><strong>Taille :</strong> {sale.variantSize || "Aucune"}</p>
              <p><strong>Quantité :</strong> {sale.quantity}</p>
              <p><strong>Prix unitaire :</strong> {sale.sellingPrice} FCFA</p>
              <p><strong>Remise :</strong> {sale.discount} FCFA</p>
              <p><strong>Prix total :</strong> {sale.finalPrice} FCFA</p>
              <p><strong>Date de livraison :</strong> {sale.deliveryDate}</p>
              <p><strong>Téléphone client :</strong> {sale.customerPhone || "Non fourni"}</p>
              <p><strong>Commentaire :</strong> {sale.comment || "Aucun"}</p>

              {/* --- Bouton Activer --- */}
              <button
                className="activate-btn"
                onClick={() => handleActivate(sale._id)}
              >
                Activer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservedList;
