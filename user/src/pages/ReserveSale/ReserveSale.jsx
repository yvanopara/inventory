import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./ReserveSales.css";
import { backendUrl } from "../../App";

export default function ReserveSales() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reservedSales, setReservedSales] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    productId: "",
    variantSize: "",
    quantity: 1,
    discount: 0,
    customerPhone: "",
    comment: "",
    deliveryDateTime: "",
  });

  // --- Charger les produits ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/products`, {
          headers: { token: localStorage.getItem("token") },
        });
        setProducts(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Impossible de charger les produits ❌");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // --- Charger les ventes réservées ---
  const fetchReservedSales = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/sales/get-reserve`, {
        headers: { token: localStorage.getItem("token") },
      });
      setReservedSales(res.data.reservedSales || []);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des réservations ❌");
    } finally {
      setLoadingSales(false);
    }
  };

  useEffect(() => {
    fetchReservedSales();
  }, []);

  // --- Gestion du formulaire ---
  const handleProductChange = (e) => {
    const productId = e.target.value;
    const prod = products.find((p) => p._id === productId);
    setSelectedProduct(prod);
    setForm({ ...form, productId, variantSize: "" });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleReserve = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Veuillez vous connecter pour réserver une commande !");

    setIsSubmitting(true);
    try {
      const res = await axios.post(`${backendUrl}/api/sales/reserve`, form, {
        headers: { token },
      });

      if (res.data.success === false) toast.error(res.data.message);
      else {
        toast.success("✅ Commande réservée avec succès !");
        setForm({
          productId: "",
          variantSize: "",
          quantity: 1,
          discount: 0,
          customerPhone: "",
          comment: "",
          deliveryDateTime: "",
        });
        setSelectedProduct(null);
        fetchReservedSales();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erreur lors de la réservation ❌");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Supprimer une réservation ---
  const handleDeleteReservation = async (reservationId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette réservation ?")) {
      return;
    }

    setDeletingId(reservationId);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`${backendUrl}/api/sales/delete-reserve/${reservationId}`, {
        headers: { token },
      });

      if (res.data.success) {
        toast.success("✅ Réservation supprimée avec succès !");
        fetchReservedSales();
      } else {
        toast.error(res.data.message || "Erreur lors de la suppression ❌");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erreur lors de la suppression ❌");
    } finally {
      setDeletingId(null);
    }
  };

  const calculateFinalPrice = () => {
    if (!selectedProduct) return 0;
    const basePrice = selectedProduct.price * form.quantity;
    return basePrice - (basePrice * form.discount) / 100;
  };

  return (
    <div className="rs-container">
      {/* Header */}
      <div className="rs-header">
        <div className="rs-header-content">
          <h1>Réserver une Commande</h1>
          <p className="rs-subtitle">Planifiez et gérez vos commandes réservées</p>
        </div>
        <div className="rs-stats-badge">
          <span className="rs-stats-count">{reservedSales.length}</span>
          <span className="rs-stats-label">Réservations</span>
        </div>
      </div>

      {/* Formulaire de Réservation */}
      <div className="rs-form-section">
        <div className="rs-form-card">
          <div className="rs-form-header">
            <h2>📋 Nouvelle Réservation</h2>
            <div className="rs-form-indicator">
              {selectedProduct && (
                <div className="rs-price-preview">
                  Prix final: <span className="rs-final-price">{calculateFinalPrice().toLocaleString()} FCFA</span>
                </div>
              )}
            </div>
          </div>

          {loadingProducts ? (
            <div className="rs-loading">
              <div className="rs-spinner"></div>
              <p>Chargement des produits...</p>
            </div>
          ) : (
            <form className="rs-form" onSubmit={handleReserve}>
              <div className="rs-form-grid">
                <div className="rs-form-group">
                  <label className="rs-label">Produit *</label>
                  <select 
                    className="rs-select" 
                    name="productId" 
                    value={form.productId} 
                    onChange={handleProductChange} 
                    required
                  >
                    <option value="">-- Sélectionner un produit --</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} - {p.price?.toLocaleString()} FCFA
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProduct?.hasVariants && (
                  <div className="rs-form-group">
                    <label className="rs-label">Taille / Variante *</label>
                    <select 
                      className="rs-select" 
                      name="variantSize" 
                      value={form.variantSize} 
                      onChange={handleChange} 
                      required
                    >
                      <option value="">-- Choisir une taille --</option>
                      {selectedProduct.sizes.map((s, idx) => (
                        <option key={idx} value={s.size}>
                          {s.size} ({s.stock} en stock)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="rs-form-group">
                  <label className="rs-label">Quantité *</label>
                  <input 
                    type="number" 
                    className="rs-input" 
                    name="quantity" 
                    value={form.quantity} 
                    onChange={handleChange} 
                    min="1" 
                    required 
                  />
                </div>

                <div className="rs-form-group">
                  <label className="rs-label">Remise (%)</label>
                  <input 
                    type="number" 
                    className="rs-input" 
                    name="discount" 
                    value={form.discount} 
                    onChange={handleChange} 
                    min="0" 
                    max="100"
                  />
                </div>

                <div className="rs-form-group">
                  <label className="rs-label">Téléphone client</label>
                  <input 
                    type="text" 
                    className="rs-input" 
                    name="customerPhone" 
                    value={form.customerPhone} 
                    onChange={handleChange} 
                    placeholder="+225 XX XX XX XX"
                  />
                </div>

                <div className="rs-form-group rs-full-width">
                  <label className="rs-label">Date et heure de livraison *</label>
                  <input
                    type="datetime-local"
                    className="rs-input"
                    name="deliveryDateTime"
                    value={form.deliveryDateTime}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="rs-form-group rs-full-width">
                  <label className="rs-label">Commentaire</label>
                  <textarea 
                    className="rs-textarea" 
                    name="comment" 
                    value={form.comment} 
                    onChange={handleChange}
                    placeholder="Notes supplémentaires..."
                    rows="3"
                  ></textarea>
                </div>
              </div>

              <button 
                type="submit" 
                className={`rs-submit-btn ${isSubmitting ? 'rs-submitting' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="rs-btn-spinner"></div>
                    Réservation en cours...
                  </>
                ) : (
                  '📦 Réserver la Commande'
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Liste des Commandes Réservées */}
      <div className="rs-sales-section">
        <div className="rs-sales-header">
          <h2>📦 Commandes Réservées</h2>
          <div className="rs-sales-count">
            <span className="rs-count-badge">{reservedSales.length}</span>
            <span>commandes</span>
          </div>
        </div>

        {loadingSales ? (
          <div className="rs-loading">
            <div className="rs-spinner"></div>
            <p>Chargement des commandes réservées...</p>
          </div>
        ) : reservedSales.length === 0 ? (
          <div className="rs-empty-state">
            <div className="rs-empty-icon">📭</div>
            <h3>Aucune commande réservée</h3>
            <p>Les commandes que vous réservez apparaîtront ici.</p>
          </div>
        ) : (
          <div className="rs-table-container">
            <div className="rs-table-scroll">
              <table className="rs-sales-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Prix Final</th>
                    <th>Téléphone</th>
                    <th>Date de Livraison</th>
                    <th>Commentaire</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservedSales.map((sale, index) => (
                    <tr key={sale._id} className={index % 2 === 0 ? 'rs-even-row' : 'rs-odd-row'}>
                      <td className="rs-product-cell">
                        <span className="rs-product-name">{sale.productName}</span>
                      </td>
                      <td className="rs-quantity-cell">
                        <span className="rs-quantity-badge">{sale.quantity}</span>
                      </td>
                      <td className="rs-price-cell">{sale.finalPrice?.toLocaleString()} FCFA</td>
                      <td className="rs-phone-cell">
                        {sale.customerPhone ? (
                          <a href={`tel:${sale.customerPhone}`} className="rs-phone-link">
                            {sale.customerPhone}
                          </a>
                        ) : (
                          <span className="rs-no-phone">—</span>
                        )}
                      </td>
                      <td className="rs-date-cell">
                        {new Date(sale.deliveryDate).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="rs-comment-cell">
                        {sale.comment ? (
                          <span className="rs-comment-text">{sale.comment}</span>
                        ) : (
                          <span className="rs-no-comment">—</span>
                        )}
                      </td>
                      <td className="rs-actions-cell">
                        <button
                          className={`rs-delete-btn ${deletingId === sale._id ? 'rs-deleting' : ''}`}
                          onClick={() => handleDeleteReservation(sale._id)}
                          disabled={deletingId === sale._id}
                          title="Supprimer la réservation"
                        >
                          {deletingId === sale._id ? (
                            <div className="rs-delete-spinner"></div>
                          ) : (
                            '🗑️'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import "./ReserveSales.css";
// import { backendUrl } from "../../App";

// export default function ReserveSales() {
// const [products, setProducts] = useState([]);
// const [selectedProduct, setSelectedProduct] = useState(null);
// const [reservedSales, setReservedSales] = useState([]);
// const [loadingProducts, setLoadingProducts] = useState(true);
// const [loadingSales, setLoadingSales] = useState(true);

// const [form, setForm] = useState({
// productId: "",
// variantSize: "",
// quantity: 1,
// discount: 0,
// customerPhone: "",
// comment: "",
// deliveryDateTime: "", // <--- modification
// });

// // --- Charger les produits ---
// useEffect(() => {
// const fetchProducts = async () => {
// try {
// const res = await axios.get(`${backendUrl}/api/products`, {
// headers: { token: localStorage.getItem("token") },
// });
// setProducts(res.data);
// } catch (err) {
// console.error(err);
// toast.error("Impossible de charger les produits ❌");
// } finally {
// setLoadingProducts(false);
// }
// };
// fetchProducts();
// }, []);

// // --- Charger les ventes réservées ---
// const fetchReservedSales = async () => {
// try {
// const res = await axios.get(`${backendUrl}/api/sales/get-reserve`, {
// headers: { token: localStorage.getItem("token") },
// });
// setReservedSales(res.data.reservedSales || []);
// } catch (err) {
// console.error(err);
// toast.error("Erreur lors du chargement des réservations ❌");
// } finally {
// setLoadingSales(false);
// }
// };

// useEffect(() => {
// fetchReservedSales();
// }, []);

// // --- Gestion du formulaire ---
// const handleProductChange = (e) => {
// const productId = e.target.value;
// const prod = products.find((p) => p._id === productId);
// setSelectedProduct(prod);
// setForm({ ...form, productId, variantSize: "" });
// };

// const handleChange = (e) => {
// setForm({ ...form, [e.target.name]: e.target.value });
// };

// const handleReserve = async (e) => {
// e.preventDefault();
// const token = localStorage.getItem("token");
// if (!token) return toast.error("Veuillez vous connecter pour réserver une commande !");


// try {
//   const res = await axios.post(`${backendUrl}/api/sales/reserve`, form, {
//     headers: { token },
//   });

//   if (res.data.success === false) toast.error(res.data.message);
//   else {
//     toast.success("✅ Commande réservée avec succès !");
//     setForm({
//       productId: "",
//       variantSize: "",
//       quantity: 1,
//       discount: 0,
//       customerPhone: "",
//       comment: "",
//       deliveryDateTime: "", // <--- réinitialisation
//     });
//     setSelectedProduct(null);
//     fetchReservedSales();
//   }
// } catch (err) {
//   console.error(err);
//   toast.error(err.response?.data?.message || "Erreur lors de la réservation ❌");
// }


// };

// return ( <div className="reserve-container"> <h1>Réserver une commande</h1>


//   {loadingProducts ? (
//     <p>Chargement des produits...</p>
//   ) : (
//     <form className="reserve-form" onSubmit={handleReserve}>
//       <div className="form-group">
//         <label>Produit :</label>
//         <select name="productId" value={form.productId} onChange={handleProductChange} required>
//           <option value="">-- Sélectionner un produit --</option>
//           {products.map((p) => (
//             <option key={p._id} value={p._id}>
//               {p.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {selectedProduct?.hasVariants && (
//         <div className="form-group">
//           <label>Taille / Variante :</label>
//           <select name="variantSize" value={form.variantSize} onChange={handleChange} required>
//             <option value="">-- Choisir une taille --</option>
//             {selectedProduct.sizes.map((s, idx) => (
//               <option key={idx} value={s.size}>
//                 {s.size} ({s.stock} en stock)
//               </option>
//             ))}
//           </select>
//         </div>
//       )}

//       <div className="form-group">
//         <label>Quantité :</label>
//         <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min="1" required />
//       </div>

//       <div className="form-group">
//         <label>Remise :</label>
//         <input type="number" name="discount" value={form.discount} onChange={handleChange} min="0" />
//       </div>

//       <div className="form-group">
//         <label>Téléphone client :</label>
//         <input type="text" name="customerPhone" value={form.customerPhone} onChange={handleChange} />
//       </div>

//       <div className="form-group">
//         <label>Commentaire :</label>
//         <textarea name="comment" value={form.comment} onChange={handleChange}></textarea>
//       </div>

//       <div className="form-group">
//         <label>Date et heure de livraison :</label>
//         <input
//           type="datetime-local"
//           name="deliveryDateTime"
//           value={form.deliveryDateTime}
//           onChange={handleChange}
//           required
//         />
//       </div>

//       <button type="submit" className="btn reserve-btn">
//         Réserver
//       </button>
//     </form>
//   )}

//   <hr />

//   <h2>📦 Commandes réservées</h2>
//   {loadingSales ? (
//     <p>Chargement des commandes réservées...</p>
//   ) : reservedSales.length === 0 ? (
//     <p>Aucune commande réservée pour le moment.</p>
//   ) : (
//     <table className="reserved-table">
//       <thead>
//         <tr>
//           <th>Produit</th>
//           <th>Quantité</th>
//           <th>Prix final</th>
//           <th>Téléphone</th>
//           <th>Date de livraison</th>
//           <th>Commentaire</th>
//         </tr>
//       </thead>
//       <tbody>
//         {reservedSales.map((sale) => (
//           <tr key={sale._id}>
//             <td>{sale.productName}</td>
//             <td>{sale.quantity}</td>
//             <td>{sale.finalPrice?.toLocaleString()} FCFA</td>
//             <td>{sale.customerPhone || "—"}</td>
//             <td>{new Date(sale.deliveryDate).toLocaleString()}</td>
//             <td>{sale.comment || "—"}</td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   )}
// </div>


// );
// }
