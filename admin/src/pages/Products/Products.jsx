import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../../api/api";
import "./Products.css";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(backendUrl + "/api/products", {
          headers: { token: localStorage.getItem("token") },
        });
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p>Chargement des produits...</p>;

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>Liste des Produits</h1>
        <button className="add-product-btn" onClick={() => navigate("/products/add")}>
          ➕ Ajouter un produit
        </button>
      </div>

      <table className="products-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Nom</th>
            <th>SKU</th>
            <th>Catégorie</th>
            <th>Stock</th>
            <th>Prix</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                />
              </td>
              <td>{product.name}</td>
              <td>{product.sku}</td>
              <td>{product.category}</td>
              <td>{product.totalStock}</td>
              <td>{product.sellingPrice} FCFA</td>
              <td>
                <button onClick={() => navigate(`/products/edit/${product._id}`)}>
                  Modifier
                </button>
                <button
                  style={{ marginLeft: "5px" }}
                  onClick={() => navigate(`/products/history/${product._id}`)}
                >
                  Historique Stock
                </button>
                <button onClick={() => navigate("/sales/add")}>
                  Effectuer une vente
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
