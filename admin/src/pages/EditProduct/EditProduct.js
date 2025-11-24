import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../../api/api";
import "./EditProduct.css";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    costPrice: "",
    sellingPrice: "",
    discount: 0,
    stock: "",
    minStock: "",
    hasVariants: false,
    sizes: [],
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/products/${id}`, {
          headers: { token: localStorage.getItem("token") },
        });

        setFormData({
          name: res.data.name,
          sku: res.data.sku || "",
          category: res.data.category,
          costPrice: res.data.costPrice || "",
          sellingPrice: res.data.sellingPrice || "",
          discount: res.data.discount || 0,
          stock: res.data.stock || "",
          minStock: res.data.minStock || "",
          hasVariants: res.data.hasVariants || false,
          sizes: res.data.sizes || [],
        });

        if (res.data.image) {
          setImagePreview(`${backendUrl}${res.data.image}`);
        }
      } catch (err) {
        console.error("❌ Erreur récupération produit :", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...formData.sizes];
    updatedSizes[index][field] = value;
    setFormData({ ...formData, sizes: updatedSizes });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("sku", formData.sku || "");
      data.append("category", formData.category);
      data.append("costPrice", formData.costPrice);
      data.append("sellingPrice", formData.sellingPrice);
      data.append("discount", formData.discount);
      data.append("stock", formData.stock);
      data.append("minStock", formData.minStock);
      data.append("hasVariants", formData.hasVariants);

      if (formData.hasVariants && formData.sizes.length > 0) {
        data.append("sizes", JSON.stringify(formData.sizes));
      }

      if (image) {
        data.append("image", image);
      }

      const res = await axios.put(`${backendUrl}/api/products/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: localStorage.getItem("token"),
        },
      });

      console.log("✅ Produit modifié :", res.data);
      
      // Animation de succès
      document.querySelector('.ep-success-message').style.display = 'block';
      setTimeout(() => {
        navigate("/products");
      }, 2000);
      
    } catch (err) {
      console.error("❌ Erreur modification produit :", err.response?.data || err.message);
      document.querySelector('.ep-error-message').style.display = 'block';
    } finally {
      setSaving(false);
    }
  };

  const handleStockUpdate = async () => {
    try {
      const res = await axios.patch(
        `${backendUrl}/api/products/modify/stock/${id}`,
        { quantity: Number(formData.stock), minStock: Number(formData.minStock) },
        { headers: { token: localStorage.getItem("token") } }
      );

      console.log("✅ Stock modifié :", res.data);
      
      // Animation de notification
      const notification = document.createElement('div');
      notification.className = 'ep-stock-notification';
      notification.textContent = '✅ Stock et stock minimum mis à jour avec succès !';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
      
      setFormData({ ...formData, stock: "" });
    } catch (err) {
      console.error("❌ Erreur modification stock :", err.response?.data || err);
      
      const notification = document.createElement('div');
      notification.className = 'ep-stock-notification ep-error';
      notification.textContent = '❌ Erreur lors de la mise à jour du stock';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
  };

  const calculateProfit = () => {
    const selling = parseFloat(formData.sellingPrice) || 0;
    const cost = parseFloat(formData.costPrice) || 0;
    const discount = parseFloat(formData.discount) || 0;
    const finalPrice = selling - discount;
    return finalPrice - cost;
  };

  const calculateMargin = () => {
    const profit = calculateProfit();
    const cost = parseFloat(formData.costPrice) || 0;
    if (cost === 0) return 0;
    return ((profit / cost) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="ep-loading-container">
        <div className="ep-spinner"></div>
        <p>Chargement du produit...</p>
      </div>
    );
  }

  return (
    <div className="ep-container">
      {/* Messages de statut */}
      <div className="ep-success-message">
        <div className="ep-message-content">
          <span className="ep-message-icon">✅</span>
          <div>
            <h3>Produit modifié avec succès !</h3>
            <p>Redirection vers la liste des produits...</p>
          </div>
        </div>
      </div>

      <div className="ep-error-message">
        <div className="ep-message-content">
          <span className="ep-message-icon">❌</span>
          <div>
            <h3>Erreur lors de la modification</h3>
            <p>Veuillez réessayer</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="ep-header">
        <div className="ep-header-content">
          <h1>Modifier le Produit</h1>
          <p className="ep-subtitle">Mettez à jour les informations de votre produit</p>
        </div>
        <div className="ep-product-id">
          ID: <span>{id}</span>
        </div>
      </div>

      <div className="ep-content">
        {/* Formulaire principal */}
        <form onSubmit={handleSubmit} className="ep-form">
          <div className="ep-form-grid">
            {/* Colonne 1 */}
            <div className="ep-form-column">
              {/* Informations de base */}
              <div className="ep-card">
                <div className="ep-card-header">
                  <h3>Informations de base</h3>
                  <div className="ep-card-badge">Obligatoire</div>
                </div>
                <div className="ep-form-group">
                  <label className="ep-label">
                    Nom du produit <span className="ep-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="ep-input"
                    required
                  />
                </div>

                <div className="ep-form-group">
                  <label className="ep-label">SKU/Code produit</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="ep-input"
                  />
                </div>

                <div className="ep-form-group">
                  <label className="ep-label">
                    Catégorie <span className="ep-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="ep-input"
                    required
                  />
                </div>
              </div>

              {/* Prix et rentabilité */}
              <div className="ep-card">
                <div className="ep-card-header">
                  <h3>Prix et Rentabilité</h3>
                </div>
                <div className="ep-price-grid">
                  <div className="ep-form-group">
                    <label className="ep-label">
                      Prix de revient <span className="ep-required">*</span>
                    </label>
                    <input
                      type="number"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleChange}
                      className="ep-input"
                      required
                    />
                  </div>

                  <div className="ep-form-group">
                    <label className="ep-label">
                      Prix de vente <span className="ep-required">*</span>
                    </label>
                    <input
                      type="number"
                      name="sellingPrice"
                      value={formData.sellingPrice}
                      onChange={handleChange}
                      className="ep-input"
                      required
                    />
                  </div>

                  <div className="ep-form-group">
                    <label className="ep-label">Remise</label>
                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleChange}
                      className="ep-input"
                    />
                  </div>
                </div>

                {/* Indicateurs de rentabilité */}
                <div className="ep-profitability">
                  <div className="ep-profit-item">
                    <span className="ep-profit-label">Bénéfice:</span>
                    <span className={`ep-profit-value ${calculateProfit() >= 0 ? 'ep-profit-positive' : 'ep-profit-negative'}`}>
                      {calculateProfit().toFixed(2)} FCFA
                    </span>
                  </div>
                  <div className="ep-profit-item">
                    <span className="ep-profit-label">Marge:</span>
                    <span className={`ep-profit-value ${calculateMargin() >= 0 ? 'ep-profit-positive' : 'ep-profit-negative'}`}>
                      {calculateMargin()}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne 2 */}
            <div className="ep-form-column">
              {/* Gestion du stock */}
              <div className="ep-card">
                <div className="ep-card-header">
                  <h3>Gestion du Stock</h3>
                </div>
                
                <div className="ep-stock-grid">
                  <div className="ep-form-group">
                    <label className="ep-label">Quantité à ajouter</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="ep-input"
                      placeholder="Ex: 50"
                    />
                  </div>

                  <div className="ep-form-group">
                    <label className="ep-label">Stock minimum</label>
                    <input
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                      className="ep-input"
                      placeholder="Ex: 10"
                    />
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={handleStockUpdate}
                  className="ep-stock-update-btn"
                >
                  <span className="ep-btn-icon">📦</span>
                  Mettre à jour le stock
                </button>

                <div className="ep-current-stock">
                  <span className="ep-stock-label">Stock actuel:</span>
                  <span className="ep-stock-value">{formData.stock} unités</span>
                </div>
              </div>

              {/* Image du produit */}
              <div className="ep-card">
                <div className="ep-card-header">
                  <h3>Image du Produit</h3>
                </div>
                
                <div className="ep-image-upload">
                  {imagePreview ? (
                    <div className="ep-image-preview">
                      <img src={imagePreview} alt="Aperçu du produit" />
                      <div className="ep-image-overlay">
                        <span className="ep-change-text">Changer l'image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="ep-image-placeholder">
                      <span className="ep-placeholder-icon">📷</span>
                      <p>Aucune image</p>
                    </div>
                  )}
                  
                  <input 
                    type="file" 
                    onChange={handleImageChange} 
                    className="ep-file-input"
                    accept="image/*"
                  />
                </div>

                <p className="ep-image-hint">Format recommandé: JPG, PNG. Taille max: 5MB</p>
              </div>

              {/* Actions */}
              <div className="ep-actions">
                <button 
                  type="button" 
                  onClick={() => navigate("/products")}
                  className="ep-cancel-btn"
                >
                  <span className="ep-btn-icon">←</span>
                  Annuler
                </button>
                
                <button 
                  type="submit" 
                  disabled={saving}
                  className="ep-save-btn"
                >
                  <span className="ep-btn-icon">
                    {saving ? '⏳' : '💾'}
                  </span>
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 














// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { backendUrl } from "../../api/api";
// import "./EditProduct.css";

// export default function EditProduct() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     name: "",
//     sku: "",
//     category: "",
//     costPrice: "",
//     sellingPrice: "",
//     discount: 0,
//     stock: "",
//     minStock: "", // 🔹 Ajout du minStock
//     hasVariants: false,
//     sizes: [],
//   });
//   const [image, setImage] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const res = await axios.get(`${backendUrl}/api/products/${id}`, {
//           headers: { token: localStorage.getItem("token") },
//         });

//         setFormData({
//           name: res.data.name,
//           sku: res.data.sku || "",
//           category: res.data.category,
//           costPrice: res.data.costPrice || "",
//           sellingPrice: res.data.sellingPrice || "",
//           discount: res.data.discount || 0,
//           stock: res.data.stock || "",
//           minStock: res.data.minStock || "", // 🔹 Récupération minStock
//           hasVariants: res.data.hasVariants || false,
//           sizes: res.data.sizes || [],
//         });
//       } catch (err) {
//         console.error("❌ Erreur récupération produit :", err.response?.data || err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProduct();
//   }, [id]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === "checkbox" ? checked : value,
//     });
//   };

//   const handleSizeChange = (index, field, value) => {
//     const updatedSizes = [...formData.sizes];
//     updatedSizes[index][field] = value;
//     setFormData({ ...formData, sizes: updatedSizes });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const data = new FormData();
//       data.append("name", formData.name);
//       data.append("sku", formData.sku || "");
//       data.append("category", formData.category);
//       data.append("costPrice", formData.costPrice);
//       data.append("sellingPrice", formData.sellingPrice);
//       data.append("discount", formData.discount);
//       data.append("stock", formData.stock);
//       data.append("minStock", formData.minStock); // 🔹 Envoi minStock
//       data.append("hasVariants", formData.hasVariants);

//       if (formData.hasVariants && formData.sizes.length > 0) {
//         data.append("sizes", JSON.stringify(formData.sizes));
//       }

//       if (image) {
//         data.append("image", image);
//       }

//       const res = await axios.put(`${backendUrl}/api/products/${id}`, data, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           token: localStorage.getItem("token"),
//         },
//       });

//       console.log("✅ Produit modifié :", res.data);
//       navigate("/products");
//     } catch (err) {
//       console.error("❌ Erreur modification produit :", err.response?.data || err.message);
//     }
//   };

//   const handleStockUpdate = async () => {
//     try {
//       const res = await axios.patch(
//         `${backendUrl}/api/products/modify/stock/${id}`,
//         { quantity: Number(formData.stock), minStock: Number(formData.minStock) }, // 🔹 Ajout minStock
//         { headers: { token: localStorage.getItem("token") } }
//       );

//       console.log("✅ Stock modifié :", res.data);
//       alert("Stock et minimum stock mis à jour !");
//       setFormData({ ...formData, stock: "" });
//     } catch (err) {
//       console.error("❌ Erreur modification stock :", err.response?.data || err);
//       alert("Erreur lors de la modification du stock");
//     }
//   };

//   if (loading) return <p>Chargement du produit...</p>;

//   return (
//     <div className="edit-product-container">
//       <h1>Modifier le produit</h1>
//       <form onSubmit={handleSubmit} className="edit-product-form">
//         <label>Nom</label>
//         <input type="text" name="name" value={formData.name} onChange={handleChange} required />

//         <label>SKU</label>
//         <input type="text" name="sku" value={formData.sku} onChange={handleChange} />

//         <label>Catégorie</label>
//         <input type="text" name="category" value={formData.category} onChange={handleChange} required />

//         <label>Prix de revient</label>
//         <input type="number" name="costPrice" value={formData.costPrice} onChange={handleChange} required />

//         <label>Prix de vente</label>
//         <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} required />

//         <label>Remise</label>
//         <input type="number" name="discount" value={formData.discount} onChange={handleChange} />

//         <label>Ajouter au stock</label>
//         <div style={{ display: "flex", gap: "10px" }}>
//           <input
//             type="number"
//             value={formData.stock}
//             onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
//             placeholder="Quantité à ajouter"
//           />
//           <input
//             type="number"
//             value={formData.minStock}
//             onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
//             placeholder="Stock minimum"
//           />
//           <button type="button" onClick={handleStockUpdate}>Mettre à jour</button>
//         </div>
//         <p>Stock actuel : {formData.stock}</p>

//         <label>Image</label>
//         <input type="file" onChange={(e) => setImage(e.target.files[0])} />

//         <button type="submit">Enregistrer les modifications</button>
//       </form>
//     </div>
//   );
// }
