import { useState } from "react";
import axios from "axios";
import { backendUrl } from "../../api/api";
import "./AddProduct.css"; // ← ton CSS

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
      sizes: [...prev.sizes, { size: "", stock: 0, costPrice: 0, sellingPrice: 0, discount: 0, minStock: 0 }]
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

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
        headers: { "Content-Type": "multipart/form-data", token: localStorage.getItem("token") }
      });

      console.log("Produit ajouté :", res.data);
    } catch (err) {
      console.error("Erreur ajout produit :", err.response?.data || err);
    }
  };

  return (
    <div className="add-product-container">
      <h1>Ajouter un produit</h1>
      <form className="add-product-form" onSubmit={handleSubmit}>
        <label>Nom du produit</label>
        <input name="name" value={form.name} onChange={handleChange} />

        <label>SKU</label>
        <input name="sku" value={form.sku} onChange={handleChange} />

        <label>Catégorie</label>
        <input name="category" value={form.category} onChange={handleChange} />

        <label>Prix coût</label>
        <input name="costPrice" type="number" value={form.costPrice} onChange={handleChange} />

        <label>Prix vente</label>
        <input name="sellingPrice" type="number" value={form.sellingPrice} onChange={handleChange} />

        <label>Remise</label>
        <input name="discount" type="number" value={form.discount} onChange={handleChange} />

        <label>Stock initial</label>
        <input name="stock" type="number" value={form.stock} onChange={handleChange} />

        <label>Stock minimum</label>
        <input name="minStock" type="number" value={form.minStock} onChange={handleChange} />

        <label>
          <input type="checkbox" name="hasVariants" checked={form.hasVariants} onChange={handleChange} />
          Ce produit a des variantes
        </label>

        {form.hasVariants && (
          <div>
            <button type="button" onClick={addVariant}>Ajouter une variante</button>
            {form.sizes.map((v, i) => (
              <div key={i}>
                <label>Taille</label>
                <input value={v.size} onChange={e => handleSizeChange(i, "size", e.target.value)} />

                <label>Stock</label>
                <input type="number" value={v.stock} onChange={e => handleSizeChange(i, "stock", e.target.value)} />

                <label>Prix coût</label>
                <input type="number" value={v.costPrice} onChange={e => handleSizeChange(i, "costPrice", e.target.value)} />

                <label>Prix vente</label>
                <input type="number" value={v.sellingPrice} onChange={e => handleSizeChange(i, "sellingPrice", e.target.value)} />

                <label>Remise</label>
                <input type="number" value={v.discount} onChange={e => handleSizeChange(i, "discount", e.target.value)} />

                <label>Stock minimum</label>
                <input type="number" value={v.minStock} onChange={e => handleSizeChange(i, "minStock", e.target.value)} />
              </div>
            ))}
          </div>
        )}

        <label>Image</label>
        <input type="file" onChange={e => setImageFile(e.target.files[0])} />

        <button type="submit">Ajouter le produit</button>
      </form>
    </div>
  );
}
