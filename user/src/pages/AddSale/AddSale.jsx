import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./AddSale.css";
import { AuthContext } from "../../AuthContext";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "../../App";


const AddSale = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [variantSize, setVariantSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [customerPhone, setCustomerPhone] = useState("");
  const [comment, setComment] = useState("");
  const [proofImage, setProofImage] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/products`);
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  const handleSale = async (e) => {
    e.preventDefault();

    if (!productId) {
      setMessage("⚠️ Veuillez sélectionner un produit");
      return;
    }

    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("variantSize", variantSize);
    formData.append("quantity", quantity);
    formData.append("discount", discount);
    formData.append("customerPhone", customerPhone);
    formData.append("comment", comment);
    if (proofImage) formData.append("proofImage", proofImage);

    try {
      const res = await axios.post(
        `${backendUrl}/api/sales`,
        formData,
        { headers: { token } }
      );
      setMessage(res.data.message || "✅ Vente enregistrée avec succès !");
      setProductId("");
      setVariantSize("");
      setQuantity(1);
      setDiscount(0);
      setCustomerPhone("");
      setComment("");
      setProofImage(null);
      navigate("/daily-summary");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "❌ Erreur lors de la vente.");
    }
  };

  return (
    <div className="add-sale-container">
      <h2>Effectuer une Vente</h2>
      <form onSubmit={handleSale} className="add-sale-form">
        <label>Produit :</label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
        >
          <option value="">-- Sélectionnez un produit --</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        <label>Variante (taille) :</label>
        <input
          type="text"
          placeholder="Ex: M, L, XL"
          value={variantSize}
          onChange={(e) => setVariantSize(e.target.value)}
        />

        <label>Quantité :</label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />

        <label>Remise :</label>
        <input
          type="number"
          min="0"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
        />

        <label>Téléphone client :</label>
        <input
          type="text"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
        />

        <label>Commentaire :</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>

        <label>Preuve (optionnel) :</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProofImage(e.target.files[0])}
        />

        <button type="submit">Enregistrer la Vente</button>
      </form>
      {message && <p className="sale-message">{message}</p>}
    </div>
  );
};

export default AddSale;
