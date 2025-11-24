import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { backendUrl } from "../../App";
import ReservedList from "../../components/ReservedList/ReservedList";

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/products`);
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const goToAddSale = () => {
    navigate("/add-sale");
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des produits...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header avec fond gradient */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1>Tableau de Bord 📊</h1>
          <p>Gérez votre inventaire en toute simplicité</p>
        </div>
        <button className="cta-button" onClick={goToAddSale}>
          <span className="button-icon">💰</span>
          Nouvelle Vente
        </button>
      </div>

      {/* Section Produits */}
      <div className="products-section">
        <div className="section-header">
          <div className="header-title">
            <h2>Produits en Stock</h2>
            <div className="product-badge">{products.length} produits</div>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th className="product-col">Produit</th>
                <th className="category-col">Catégorie</th>
                <th className="type-col">Type</th>
                <th className="stock-col">Stock</th>
                <th className="price-col">Prix</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product._id} className="table-row">
                  <td className="product-cell">
                    <div className="product-info">
                      <div className="product-avatar">
                        <img
                          src={product.image || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop"}
                          alt={product.name}
                        />
                      </div>
                      <div className="product-details">
                        <span className="product-name">{product.name}</span>
                        <span className="product-sku">{product.sku || "N/A"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="category-cell">
                    <span className="category-tag">{product.category}</span>
                  </td>
                  <td className="type-cell">
                    <div className={`type-indicator ${product.hasVariants ? 'variant' : 'simple'}`}>
                      {product.hasVariants ? (
                        <>
                          <span className="indicator-dot"></span>
                          {product.sizes.length} variantes
                        </>
                      ) : (
                        <>
                          <span className="indicator-dot"></span>
                          Simple
                        </>
                      )}
                    </div>
                  </td>
                  <td className="stock-cell">
                    {product.hasVariants ? (
                      <div className="variants-container">
                        {product.sizes.slice(0, 2).map((variant, idx) => (
                          <div key={idx} className="stock-item">
                            <span className="size">{variant.size}</span>
                            <span className="quantity">{variant.stock}</span>
                          </div>
                        ))}
                        {product.sizes.length > 2 && (
                          <div className="more-variants">
                            +{product.sizes.length - 2} autres
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="stock-simple">
                        <div className="stock-amount">{product.stock}</div>
                        <span className="stock-label">unités</span>
                      </div>
                    )}
                  </td>
                  <td className="price-cell">
                    {product.hasVariants ? (
                      <div className="prices-container">
                        {product.sizes.slice(0, 2).map((variant, idx) => (
                          <div key={idx} className="price-tag">
                            {variant.sellingPrice} FCFA
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="price-main">{product.sellingPrice} FCFA</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="empty-state">
            <div className="empty-illustration">
              <span className="empty-icon">📦</span>
            </div>
            <h3>Aucun produit trouvé</h3>
            <p>Commencez par ajouter vos premiers produits</p>
            <button className="empty-action">Ajouter un produit</button>
          </div>
        )}
      </div>

      {/* Section Réservations */}
      <div className="reserved-section">
        <ReservedList />
      </div>
    </div>
  );
};

export default Dashboard;