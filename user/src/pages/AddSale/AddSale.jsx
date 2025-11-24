import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./AddSale.css";
import { AuthContext } from "../../AuthContext";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "../../App";

// Composant Toast pour les notifications
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <span className="toast-icon">
          {type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'}
        </span>
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
};

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
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/products`);
        setProducts(res.data);
      } catch (err) {
        console.error(err);
        showToast("❌ Erreur lors du chargement des produits", "error");
      }
    };
    fetchProducts();
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "" });
  };

  // Fonction pour formater et nettoyer le numéro de téléphone
  const handlePhoneChange = (e) => {
    const input = e.target.value;
    // Supprime tous les espaces et caractères non numériques (sauf + au début)
    const cleanedPhone = input.replace(/\s/g, '').replace(/[^\d+]/g, '');
    setCustomerPhone(cleanedPhone);
  };

  // Fonction pour formater l'affichage du numéro (optionnel)
  const formatPhoneDisplay = (phone) => {
    if (!phone) return "";
    
    // Format français : +33 1 23 45 67 89
    if (phone.startsWith('+33')) {
      const rest = phone.slice(3);
      if (rest.length <= 1) return phone;
      return `+33 ${rest.slice(0, 1)} ${rest.slice(1, 3)} ${rest.slice(3, 5)} ${rest.slice(5, 7)} ${rest.slice(7, 9)}`.trim();
    }
    
    // Format international général
    return phone.replace(/(.{2})/g, '$1 ').trim();
  };

  const handleSale = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!productId) {
      showToast("⚠️ Veuillez sélectionner un produit", "warning");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("variantSize", variantSize);
    formData.append("quantity", quantity);
    formData.append("discount", discount);
    formData.append("customerPhone", customerPhone); // Déjà nettoyé des espaces
    formData.append("comment", comment);
    if (proofImage) formData.append("proofImage", proofImage);

    try {
      const res = await axios.post(
        `${backendUrl}/api/sales`,
        formData,
        { headers: { token } }
      );
      
      showToast("✅ Vente enregistrée avec succès !", "success");
      
      // Réinitialiser le formulaire
      setProductId("");
      setVariantSize("");
      setQuantity(1);
      setDiscount(0);
      setCustomerPhone("");
      setComment("");
      setProofImage(null);
      
      // Redirection après un délai
      setTimeout(() => {
        navigate("/daily-summary");
      }, 1500);
      
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "❌ Erreur lors de la vente", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProduct = products.find(p => p._id === productId);

  return (
    <div className="add-sale-container">
      <div className="sale-header">
        <h2>🎯 Effectuer une Vente</h2>
        <p>Remplissez les informations de la vente ci-dessous</p>
      </div>
      
      <form onSubmit={handleSale} className="add-sale-form">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">
              Produit *
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="form-select"
              required
            >
              <option value="">-- Sélectionnez un produit --</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} {p.price ? `- ${p.price}€` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Variante (taille)
            </label>
            <input
              type="text"
              placeholder="Ex: M, L, XL, 38, 40..."
              value={variantSize}
              onChange={(e) => setVariantSize(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Quantité *
            </label>
            <input
              type="number"
              min="1"
              max={selectedProduct?.stock || 999}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="form-input"
              required
            />
            {selectedProduct?.stock && (
              <span className="stock-info">
                Stock disponible: {selectedProduct.stock}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Reduction (FCFA)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            📞 Téléphone client
          </label>
          <input
            type="tel"
            placeholder="+33123456789"
            value={customerPhone}
            onChange={handlePhoneChange}
            className="form-input"
          />
          <small className="phone-hint">
            Les espaces seront automatiquement supprimés
          </small>
        </div>

        <div className="form-group">
          <label className="form-label">
            💬 Commentaire
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="form-textarea"
            placeholder="Notes supplémentaires sur la vente..."
            rows="3"
          ></textarea>
        </div>

        <div className="form-group">
          <label className="form-label">
            📷 Preuve de vente (optionnel)
          </label>
          <div className="file-upload">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProofImage(e.target.files[0])}
              className="file-input"
              id="proofImage"
            />
            <label htmlFor="proofImage" className="file-label">
              {proofImage ? `📁 ${proofImage.name}` : "📎 Choisir un fichier"}
            </label>
          </div>
        </div>

        <button 
          type="submit" 
          className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="spinner"></div>
              Enregistrement...
            </>
          ) : (
            "💾 Enregistrer la Vente"
          )}
        </button>
      </form>

      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}
    </div>
  );
};

export default AddSale;