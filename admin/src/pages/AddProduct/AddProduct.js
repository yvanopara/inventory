import { useState } from "react";
import axios from "axios";
import { backendUrl } from "../../api/api";
import { toast } from "react-toastify";
import "./AddProduct.css";

export default function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    costPrice: "",
    sellingPrice: "",
    discount: "",
    stock: "",
    minStock: "", 
    hasVariants: false,
    sizes: []
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...form.sizes];
    updatedSizes[index][field] = value;
    setForm(prev => ({ ...prev, sizes: updatedSizes }));
  };

  const addVariant = () => {
    setForm(prev => ({
      ...prev,
      sizes: [...prev.sizes, { 
        size: "", 
        stock: 0, 
        costPrice: 0, 
        sellingPrice: 0, 
        discount: 0, 
        minStock: 0 
      }]
    }));
    toast.info("Nouvelle variante ajoutée ✨");
  };

  const removeVariant = (index) => {
    const updatedSizes = form.sizes.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, sizes: updatedSizes }));
    toast.warning("Variante supprimée 🗑️");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      toast.info("Image sélectionnée 📷");
    }
  };

  const calculateProfit = () => {
    const selling = parseFloat(form.sellingPrice) || 0;
    const cost = parseFloat(form.costPrice) || 0;
    const discount = parseFloat(form.discount) || 0;
    const finalPrice = selling - discount;
    return finalPrice - cost;
  };

  const calculateMargin = () => {
    const profit = calculateProfit();
    const cost = parseFloat(form.costPrice) || 0;
    if (cost === 0) return 0;
    return ((profit / cost) * 100).toFixed(1);
  };

  const resetForm = () => {
    setForm({
      name: "",
      sku: "",
      category: "",
      costPrice: "",
      sellingPrice: "",
      discount: "",
      stock: "",
      minStock: "", 
      hasVariants: false,
      sizes: []
    });
    setImageFile(null);
    setImagePreview("");
    toast.info("Formulaire réinitialisé 🔄");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("sku", form.sku);
      formData.append("category", form.category);
      formData.append("costPrice", form.costPrice);
      formData.append("sellingPrice", form.sellingPrice);
      formData.append("discount", form.discount);
      formData.append("stock", form.stock);
      formData.append("minStock", form.minStock);
      formData.append("hasVariants", form.hasVariants);

      if (form.hasVariants) {
        formData.append("sizes", JSON.stringify(form.sizes));
      }

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await axios.post(`${backendUrl}/api/products`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data", 
          token: localStorage.getItem("token") 
        }
      });

      console.log("Produit ajouté :", res.data);
      
      // Notification de succès
      toast.success(
        <div>
          <strong>✅ Produit ajouté avec succès !</strong>
          <br />
          <span style={{ fontSize: "0.9em", opacity: 0.8 }}>
            {form.name} a été créé dans le système
          </span>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );

      // Réinitialiser le formulaire après succès
      setTimeout(() => {
        resetForm();
      }, 1000);

    } catch (err) {
      console.error("Erreur ajout produit :", err.response?.data || err);
      
      // Notification d'erreur
      toast.error(
        <div>
          <strong>❌ Erreur lors de l'ajout</strong>
          <br />
          <span style={{ fontSize: "0.9em", opacity: 0.8 }}>
            {err.response?.data?.message || "Veuillez réessayer"}
          </span>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ap-container">
      {/* Header */}
      <div className="ap-header">
        <div className="ap-header-content">
          <h1>Ajouter un Nouveau Produit</h1>
          <p className="ap-subtitle">Créez un nouveau produit dans votre inventaire</p>
        </div>
        <div className="ap-actions">
          <button 
            type="button" 
            onClick={resetForm}
            className="ap-reset-btn"
          >
            <span className="ap-btn-icon">🔄</span>
            Réinitialiser
          </button>
        </div>
      </div>

      <form className="ap-form" onSubmit={handleSubmit}>
        <div className="ap-form-grid">
          {/* Colonne 1 - Informations de base */}
          <div className="ap-form-column">
            {/* Informations principales */}
            <div className="ap-card">
              <div className="ap-card-header">
                <h3>Informations du Produit</h3>
                <div className="ap-card-badge">Requis</div>
              </div>
              
              <div className="ap-form-group">
                <label className="ap-label">
                  Nom du produit <span className="ap-required">*</span>
                </label>
                <input 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange}
                  className="ap-input"
                  placeholder="Ex: T-Shirt Cotton Premium"
                  required 
                />
              </div>

              <div className="ap-form-group">
                <label className="ap-label">SKU/Code produit</label>
                <input 
                  name="sku" 
                  value={form.sku} 
                  onChange={handleChange}
                  className="ap-input"
                  placeholder="Ex: TSH-001-BLK"
                />
              </div>

              <div className="ap-form-group">
                <label className="ap-label">
                  Catégorie <span className="ap-required">*</span>
                </label>
                <input 
                  name="category" 
                  value={form.category} 
                  onChange={handleChange}
                  className="ap-input"
                  placeholder="Ex: Vêtements, Électronique..."
                  required 
                />
              </div>
            </div>

            {/* Prix et rentabilité */}
            <div className="ap-card">
              <div className="ap-card-header">
                <h3>Prix et Rentabilité</h3>
              </div>
              
              <div className="ap-price-grid">
                <div className="ap-form-group">
                  <label className="ap-label">
                    Prix de revient <span className="ap-required">*</span>
                  </label>
                  <input 
                    name="costPrice" 
                    type="number" 
                    value={form.costPrice} 
                    onChange={handleChange}
                    className="ap-input"
                    placeholder="0.00"
                    required 
                  />
                </div>

                <div className="ap-form-group">
                  <label className="ap-label">
                    Prix de vente <span className="ap-required">*</span>
                  </label>
                  <input 
                    name="sellingPrice" 
                    type="number" 
                    value={form.sellingPrice} 
                    onChange={handleChange}
                    className="ap-input"
                    placeholder="0.00"
                    required 
                  />
                </div>

                <div className="ap-form-group">
                  <label className="ap-label">Remise</label>
                  <input 
                    name="discount" 
                    type="number" 
                    value={form.discount} 
                    onChange={handleChange}
                    className="ap-input"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Indicateurs de rentabilité */}
              <div className="ap-profitability">
                <div className="ap-profit-item">
                  <span className="ap-profit-label">Bénéfice estimé:</span>
                  <span className={`ap-profit-value ${calculateProfit() >= 0 ? 'ap-profit-positive' : 'ap-profit-negative'}`}>
                    {calculateProfit().toFixed(2)} FCFA
                  </span>
                </div>
                <div className="ap-profit-item">
                  <span className="ap-profit-label">Marge estimée:</span>
                  <span className={`ap-profit-value ${calculateMargin() >= 0 ? 'ap-profit-positive' : 'ap-profit-negative'}`}>
                    {calculateMargin()}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne 2 - Stock et image */}
          <div className="ap-form-column">
            {/* Gestion du stock */}
            <div className="ap-card">
              <div className="ap-card-header">
                <h3>Gestion du Stock</h3>
              </div>
              
              <div className="ap-stock-grid">
                <div className="ap-form-group">
                  <label className="ap-label">
                    Stock initial <span className="ap-required">*</span>
                  </label>
                  <input 
                    name="stock" 
                    type="number" 
                    value={form.stock} 
                    onChange={handleChange}
                    className="ap-input"
                    placeholder="Ex: 100"
                    required 
                  />
                </div>

                <div className="ap-form-group">
                  <label className="ap-label">
                    Stock minimum <span className="ap-required">*</span>
                  </label>
                  <input 
                    name="minStock" 
                    type="number" 
                    value={form.minStock} 
                    onChange={handleChange}
                    className="ap-input"
                    placeholder="Ex: 10"
                    required 
                  />
                </div>
              </div>

              {/* Alertes de stock */}
              <div className="ap-stock-alert">
                <div className="ap-alert-item">
                  <span className="ap-alert-icon">⚠️</span>
                  <span className="ap-alert-text">
                    Une alerte sera déclenchée quand le stock atteindra le niveau minimum
                  </span>
                </div>
              </div>
            </div>

            {/* Variantes */}
            <div className="ap-card">
              <div className="ap-card-header">
                <h3>Gestion des Variantes</h3>
              </div>
              
              <div className="ap-variant-toggle">
                <label className="ap-checkbox-label">
                  <input 
                    type="checkbox" 
                    name="hasVariants" 
                    checked={form.hasVariants} 
                    onChange={handleChange}
                    className="ap-checkbox"
                  />
                  <span className="ap-checkbox-custom"></span>
                  <span className="ap-checkbox-text">Ce produit a des variantes (tailles, couleurs, etc.)</span>
                </label>
              </div>

              {form.hasVariants && (
                <div className="ap-variants-section">
                  <div className="ap-variants-header">
                    <h4>Variantes configurées</h4>
                    <button 
                      type="button" 
                      onClick={addVariant}
                      className="ap-add-variant-btn"
                    >
                      <span className="ap-btn-icon">+</span>
                      Ajouter une variante
                    </button>
                  </div>

                  {form.sizes.map((variant, index) => (
                    <div key={index} className="ap-variant-card">
                      <div className="ap-variant-header">
                        <h5>Variante #{index + 1}</h5>
                        <button 
                          type="button" 
                          onClick={() => removeVariant(index)}
                          className="ap-remove-variant-btn"
                        >
                          <span className="ap-btn-icon">🗑️</span>
                          Supprimer
                        </button>
                      </div>
                      
                      <div className="ap-variant-grid">
                        <div className="ap-form-group">
                          <label className="ap-label">Taille/Nom</label>
                          <input 
                            value={variant.size} 
                            onChange={e => handleSizeChange(index, "size", e.target.value)}
                            className="ap-input"
                            placeholder="Ex: M, L, XL, Rouge..."
                          />
                        </div>

                        <div className="ap-form-group">
                          <label className="ap-label">Stock</label>
                          <input 
                            type="number" 
                            value={variant.stock} 
                            onChange={e => handleSizeChange(index, "stock", e.target.value)}
                            className="ap-input"
                          />
                        </div>

                        <div className="ap-form-group">
                          <label className="ap-label">Prix coût</label>
                          <input 
                            type="number" 
                            value={variant.costPrice} 
                            onChange={e => handleSizeChange(index, "costPrice", e.target.value)}
                            className="ap-input"
                          />
                        </div>

                        <div className="ap-form-group">
                          <label className="ap-label">Prix vente</label>
                          <input 
                            type="number" 
                            value={variant.sellingPrice} 
                            onChange={e => handleSizeChange(index, "sellingPrice", e.target.value)}
                            className="ap-input"
                          />
                        </div>

                        <div className="ap-form-group">
                          <label className="ap-label">Remise</label>
                          <input 
                            type="number" 
                            value={variant.discount} 
                            onChange={e => handleSizeChange(index, "discount", e.target.value)}
                            className="ap-input"
                          />
                        </div>

                        <div className="ap-form-group">
                          <label className="ap-label">Stock min.</label>
                          <input 
                            type="number" 
                            value={variant.minStock} 
                            onChange={e => handleSizeChange(index, "minStock", e.target.value)}
                            className="ap-input"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Image du produit */}
            <div className="ap-card">
              <div className="ap-card-header">
                <h3>Image du Produit</h3>
              </div>
              
              <div className="ap-image-upload">
                {imagePreview ? (
                  <div className="ap-image-preview">
                    <img src={imagePreview} alt="Aperçu du produit" />
                    <div className="ap-image-overlay">
                      <span className="ap-change-text">Changer l'image</span>
                    </div>
                  </div>
                ) : (
                  <div className="ap-image-placeholder">
                    <span className="ap-placeholder-icon">📷</span>
                    <p>Cliquez pour ajouter une image</p>
                  </div>
                )}
                
                <input 
                  type="file" 
                  onChange={handleImageChange} 
                  className="ap-file-input"
                  accept="image/*"
                />
              </div>

              <p className="ap-image-hint">Formats supportés: JPG, PNG, WEBP. Taille max: 5MB</p>
            </div>

            {/* Bouton de soumission */}
            <div className="ap-submit-section">
              <button 
                type="submit" 
                disabled={loading}
                className="ap-submit-btn"
              >
                <span className="ap-btn-icon">
                  {loading ? '⏳' : '✨'}
                </span>
                {loading ? 'Création en cours...' : 'Créer le produit'}
              </button>
              
              <p className="ap-form-note">
                Tous les champs marqués d'un <span className="ap-required">*</span> sont obligatoires
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}





// import { useState } from "react";
// import axios from "axios";
// import { backendUrl } from "../../api/api";
// import "./AddProduct.css"; // ← ton CSS

// export default function AddProduct() {
//   const [form, setForm] = useState({
//     name: "",
//     sku: "",
//     category: "",
//     costPrice: "",
//     sellingPrice: "",
//     discount: "",
//     stock: "",
//     minStock: "", 
//     hasVariants: false,
//     sizes: []
//   });

//   const [imageFile, setImageFile] = useState(null);

//   const handleChange = e => {
//     const { name, value, type, checked } = e.target;
//     setForm(prev => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value
//     }));
//   };

//   const handleSizeChange = (index, field, value) => {
//     const updatedSizes = [...form.sizes];
//     updatedSizes[index][field] = value;
//     setForm(prev => ({ ...prev, sizes: updatedSizes }));
//   };

//   const addVariant = () => {
//     setForm(prev => ({
//       ...prev,
//       sizes: [...prev.sizes, { size: "", stock: 0, costPrice: 0, sellingPrice: 0, discount: 0, minStock: 0 }]
//     }));
//   };

//   const handleSubmit = async e => {
//     e.preventDefault();

//     try {
//       const formData = new FormData();
//       formData.append("name", form.name);
//       formData.append("sku", form.sku);
//       formData.append("category", form.category);
//       formData.append("costPrice", form.costPrice);
//       formData.append("sellingPrice", form.sellingPrice);
//       formData.append("discount", form.discount);
//       formData.append("stock", form.stock);
//       formData.append("minStock", form.minStock);
//       formData.append("hasVariants", form.hasVariants);

//       if (form.hasVariants) {
//         formData.append("sizes", JSON.stringify(form.sizes));
//       }

//       if (imageFile) {
//         formData.append("image", imageFile);
//       }

//       const res = await axios.post(`${backendUrl}/api/products`, formData, {
//         headers: { "Content-Type": "multipart/form-data", token: localStorage.getItem("token") }
//       });

//       console.log("Produit ajouté :", res.data);
//     } catch (err) {
//       console.error("Erreur ajout produit :", err.response?.data || err);
//     }
//   };

//   return (
//     <div className="add-product-container">
//       <h1>Ajouter un produit</h1>
//       <form className="add-product-form" onSubmit={handleSubmit}>
//         <label>Nom du produit</label>
//         <input name="name" value={form.name} onChange={handleChange} />

//         <label>SKU</label>
//         <input name="sku" value={form.sku} onChange={handleChange} />

//         <label>Catégorie</label>
//         <input name="category" value={form.category} onChange={handleChange} />

//         <label>Prix coût</label>
//         <input name="costPrice" type="number" value={form.costPrice} onChange={handleChange} />

//         <label>Prix vente</label>
//         <input name="sellingPrice" type="number" value={form.sellingPrice} onChange={handleChange} />

//         <label>Remise</label>
//         <input name="discount" type="number" value={form.discount} onChange={handleChange} />

//         <label>Stock initial</label>
//         <input name="stock" type="number" value={form.stock} onChange={handleChange} />

//         <label>Stock minimum</label>
//         <input name="minStock" type="number" value={form.minStock} onChange={handleChange} />

//         <label>
//           <input type="checkbox" name="hasVariants" checked={form.hasVariants} onChange={handleChange} />
//           Ce produit a des variantes
//         </label>

//         {form.hasVariants && (
//           <div>
//             <button type="button" onClick={addVariant}>Ajouter une variante</button>
//             {form.sizes.map((v, i) => (
//               <div key={i}>
//                 <label>Taille</label>
//                 <input value={v.size} onChange={e => handleSizeChange(i, "size", e.target.value)} />

//                 <label>Stock</label>
//                 <input type="number" value={v.stock} onChange={e => handleSizeChange(i, "stock", e.target.value)} />

//                 <label>Prix coût</label>
//                 <input type="number" value={v.costPrice} onChange={e => handleSizeChange(i, "costPrice", e.target.value)} />

//                 <label>Prix vente</label>
//                 <input type="number" value={v.sellingPrice} onChange={e => handleSizeChange(i, "sellingPrice", e.target.value)} />

//                 <label>Remise</label>
//                 <input type="number" value={v.discount} onChange={e => handleSizeChange(i, "discount", e.target.value)} />

//                 <label>Stock minimum</label>
//                 <input type="number" value={v.minStock} onChange={e => handleSizeChange(i, "minStock", e.target.value)} />
//               </div>
//             ))}
//           </div>
//         )}

//         <label>Image</label>
//         <input type="file" onChange={e => setImageFile(e.target.files[0])} />

//         <button type="submit">Ajouter le produit</button>
//       </form>
//     </div>
//   );
// }
