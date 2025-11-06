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

  const [form, setForm] = useState({
    productId: "",
    variantSize: "",
    quantity: 1,
    discount: 0,
    customerPhone: "",
    comment: "",
    deliveryDate: "",
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
          deliveryDate: "",
        });
        setSelectedProduct(null);
        fetchReservedSales();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erreur lors de la réservation ❌");
    }
  };

  return (
    <div className="reserve-container">
      <h1>Réserver une commande</h1>

      {loadingProducts ? (
        <p>Chargement des produits...</p>
      ) : (
        <form className="reserve-form" onSubmit={handleReserve}>
          <div className="form-group">
            <label>Produit :</label>
            <select name="productId" value={form.productId} onChange={handleProductChange} required>
              <option value="">-- Sélectionner un produit --</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {selectedProduct?.hasVariants && (
            <div className="form-group">
              <label>Taille / Variante :</label>
              <select name="variantSize" value={form.variantSize} onChange={handleChange} required>
                <option value="">-- Choisir une taille --</option>
                {selectedProduct.sizes.map((s, idx) => (
                  <option key={idx} value={s.size}>
                    {s.size} ({s.stock} en stock)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Quantité :</label>
            <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min="1" required />
          </div>

          <div className="form-group">
            <label>Remise :</label>
            <input type="number" name="discount" value={form.discount} onChange={handleChange} min="0" />
          </div>

          <div className="form-group">
            <label>Téléphone client :</label>
            <input type="text" name="customerPhone" value={form.customerPhone} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Commentaire :</label>
            <textarea name="comment" value={form.comment} onChange={handleChange}></textarea>
          </div>

          <div className="form-group">
            <label>Date de livraison :</label>
            <input type="date" name="deliveryDate" value={form.deliveryDate} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn reserve-btn">
            Réserver
          </button>
        </form>
      )}

      <hr />

      <h2>📦 Commandes réservées</h2>
      {loadingSales ? (
        <p>Chargement des commandes réservées...</p>
      ) : reservedSales.length === 0 ? (
        <p>Aucune commande réservée pour le moment.</p>
      ) : (
        <table className="reserved-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Quantité</th>
              <th>Prix final</th>
              <th>Téléphone</th>
              <th>Date de livraison</th>
              <th>Commentaire</th>
            </tr>
          </thead>
          <tbody>
            {reservedSales.map((sale) => (
              <tr key={sale._id}>
                <td>{sale.productName}</td>
                <td>{sale.quantity}</td>
                <td>{sale.finalPrice?.toLocaleString()} FCFA</td>
                <td>{sale.customerPhone || "—"}</td>
                <td>{new Date(sale.deliveryDate).toLocaleDateString()}</td>
                <td>{sale.comment || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
