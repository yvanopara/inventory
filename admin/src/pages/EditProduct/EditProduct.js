import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../../api/api"; // 🔹 Import de ton backendUrl
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
    hasVariants: false,
    sizes: [],
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Récupération du produit
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
          hasVariants: res.data.hasVariants || false,
          sizes: res.data.sizes || [],
        });
      } catch (err) {
        console.error("❌ Erreur récupération produit :", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // 🔹 Gestion du changement dans les inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // 🔹 Envoi des modifications
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

      const res = await axios.put(`${backendUrl}/api/products/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: localStorage.getItem("token"),
        },
      });

      console.log("✅ Produit modifié :", res.data);
      navigate("/products");
    } catch (err) {
      console.error("❌ Erreur modification produit :", err.response?.data || err.message);
    }
  };

  // 🔹 Modification du stock uniquement
  const handleStockUpdate = async () => {
    try {
      const res = await axios.patch(
        `${backendUrl}/api/products/modify/stock/${id}`,
        { quantity: Number(formData.stock) },
        { headers: { token: localStorage.getItem("token") } }
      );

      console.log("✅ Stock modifié :", res.data);
      alert("Stock mis à jour !");
      setFormData({ ...formData, stock: "" });
    } catch (err) {
      console.error("❌ Erreur modification stock :", err.response?.data || err);
      alert("Erreur lors de la modification du stock");
    }
  };

  if (loading) return <p>Chargement du produit...</p>;

  return (
    <div className="edit-product-container">
      <h1>Modifier le produit</h1>
      <form onSubmit={handleSubmit} className="edit-product-form">
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

        <label>Ajouter au stock</label>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            placeholder="Quantité à ajouter"
          />
          <button type="button" onClick={handleStockUpdate}>Ajouter</button>
        </div>
        <p>Stock actuel : {formData.stock}</p>

        <label>Image</label>
        <input type="file" onChange={(e) => setImage(e.target.files[0])} />

        <button type="submit">Enregistrer les modifications</button>
      </form>
    </div>
  );
}
