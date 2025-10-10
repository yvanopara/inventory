import { useState } from "react";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";
import "./AddProduct.css";

export default function AddProduct() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    costPrice: "",
    sellingPrice: "",
    discount: 0,
    stock: "",
    hasVariants: false,
    sizes: [],
  });

  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("sku", formData.sku || "");
      data.append("category", formData.category);
      data.append("costPrice", formData.costPrice);
      data.append("sellingPrice", formData.sellingPrice);
      data.append("discount", formData.discount);
      data.append("stock", formData.stock);
      data.append("hasVariants", formData.hasVariants);

      if (formData.hasVariants && formData.sizes.length > 0) {
        data.append("sizes", JSON.stringify(formData.sizes));
      }

      if (image) {
        data.append("image", image);
      }

      console.log("Envoi au backend:", formData);

      const res = await api.post("/products", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Réponse backend:", res.data);
      navigate("/dashboard");
    } catch (err) {
      console.error("Erreur AddProduct:", err.response?.data || err.message);
    }
  };

  return (
    <div className="add-product-container">
      <h1>Ajouter un produit</h1>
      <form onSubmit={handleSubmit} className="add-product-form">
        <label>Nom</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />

        <label>SKU</label>
        <input type="text" name="sku" value={formData.sku} onChange={handleChange} />

        <label>Catégorie</label>
        <input type="text" name="category" value={formData.category} onChange={handleChange} required />

        <label>Prix de revient</label>
        <input type="number" name="costPrice" value={formData.costPrice} onChange={handleChange} required />

        <label>Prix de vente</label>
        <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} required />

        <label>Remise</label>
        <input type="number" name="discount" value={formData.discount} onChange={handleChange} />

        <label>Stock</label>
        <input type="number" name="stock" value={formData.stock} onChange={handleChange} required />

        <label>Image</label>
        <input type="file" onChange={(e) => setImage(e.target.files[0])} />

        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
}
