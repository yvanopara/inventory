import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../../api/api";
import "./Products.css";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchProducts();
    
    // Vérifier la préférence de mode sombre
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
  }, []);

  useEffect(() => {
    // Appliquer le mode sombre au document
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const deleteProduct = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce produit ?")) return;
    
    try {
      await axios.delete(`${backendUrl}/api/products/${id}`, {
        headers: { token: localStorage.getItem("token") },
      });
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression", error);
      alert("Erreur lors de la suppression du produit");
    }
  };

  // Extraire les catégories uniques
  const categories = ["all", ...new Set(products.map(product => product.category).filter(Boolean))];

  // Filtrer les produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Trier les produits
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (typeof aValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (sortConfig.direction === 'asc') {
      return (aValue || 0) - (bValue || 0);
    } else {
      return (bValue || 0) - (aValue || 0);
    }
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const SortIcon = ({ direction }) => (
    <span className="sort-icon">
      {direction === 'asc' ? '↑' : '↓'}
    </span>
  );

  const StockDisplay = ({ stock }) => {
    return (
      <div className="stock-display">
        <div className="stock-number">{stock}</div>
        <div className="stock-label">en stock</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="products-container">
        <div className="loading-message">
          <p>Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="products-container">
      {/* En-tête avec contrôles */}
      <div className="products-header">
        <div className="header-content">
          <div className="title-section">
            <h1>Gestion des Produits</h1>
            <p className="products-subtitle">
              Gérez votre inventaire et vos produits
            </p>
          </div>
          <div className="header-controls">
            <button 
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Changer le thème"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button 
              className="add-product-btn" 
              onClick={() => navigate("/products/add")}
            >
              <span className="btn-icon">➕</span>
              Ajouter un produit
            </button>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="filters-bar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="filter-group">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-filter"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "Toutes les catégories" : category}
                </option>
              ))}
            </select>
          </div>

          <div className="results-info">
            {sortedProducts.length} produit(s) trouvé(s)
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={() => setSearchTerm("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tableau des produits */}
      <div className="table-section">
        <div className="table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th onClick={() => handleSort('name')} className="sortable">
                  Nom {sortConfig.key === 'name' && <SortIcon direction={sortConfig.direction} />}
                </th>
                <th onClick={() => handleSort('sku')} className="sortable">
                  SKU {sortConfig.key === 'sku' && <SortIcon direction={sortConfig.direction} />}
                </th>
                <th onClick={() => handleSort('category')} className="sortable">
                  Catégorie {sortConfig.key === 'category' && <SortIcon direction={sortConfig.direction} />}
                </th>
                <th onClick={() => handleSort('totalStock')} className="sortable">
                  Stock {sortConfig.key === 'totalStock' && <SortIcon direction={sortConfig.direction} />}
                </th>
                <th onClick={() => handleSort('sellingPrice')} className="sortable">
                  Prix {sortConfig.key === 'sellingPrice' && <SortIcon direction={sortConfig.direction} />}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product) => (
                <tr key={product._id} className="product-row">
                  <td>
                    <div className="image-cell">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="product-image"
                        />
                      ) : (
                        <div className="no-image">
                          <span>📷</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="product-name">{product.name}</td>
                  <td className="product-sku">{product.sku || "-"}</td>
                  <td className="product-category">
                    <span className="category-tag">{product.category || "Non catégorisé"}</span>
                  </td>
                  <td>
                    <StockDisplay stock={product.totalStock || 0} />
                  </td>
                  <td className="product-price">
                    <div className="price-amount">
                      {product.sellingPrice?.toLocaleString('fr-FR')} FCFA
                    </div>
                    {product.costPrice && (
                      <div className="cost-price">
                        Coût: {product.costPrice.toLocaleString('fr-FR')} FCFA
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button 
                        className="edit-btn"
                        onClick={() => navigate(`/products/edit/${product._id}`)}
                        title="Modifier le produit"
                      >
                        <span className="btn-icon">✏️</span>
                        Modifier
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteProduct(product._id)}
                        title="Supprimer le produit"
                      >
                        <span className="btn-icon">🗑️</span>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* État vide */}
        {products.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>Aucun produit trouvé</h3>
            <p>Commencez par ajouter votre premier produit à l'inventaire.</p>
            <button 
              className="add-product-btn primary"
              onClick={() => navigate("/products/add")}
            >
              ➕ Ajouter un produit
            </button>
          </div>
        )}

        {products.length > 0 && sortedProducts.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>Aucun produit correspondant</h3>
            <p>Aucun produit ne correspond à vos critères de recherche.</p>
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
            >
              ✕ Effacer les filtres
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ‹ Précédent
            </button>
            
            <div className="pagination-numbers">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button 
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Suivant ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}




// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { backendUrl } from "../../api/api";
// import "./Products.css";

// export default function Products() {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   const fetchProducts = async () => {
//     try {
//       const res = await axios.get(backendUrl + "/api/products", {
//         headers: { token: localStorage.getItem("token") },
//       });
//       setProducts(res.data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const deleteProduct = async (id) => {
//     if (!window.confirm("Voulez-vous vraiment supprimer ce produit ?")) return;
//     try {
//       await axios.delete(`${backendUrl}/api/products/${id}`, {
//         headers: { token: localStorage.getItem("token") },
//       });
//       setProducts(products.filter((p) => p._id !== id));
//     } catch (error) {
//       console.error("Erreur lors de la suppression", error);
//     }
//   };

//   if (loading) return <p>Chargement des produits...</p>;

//   return (
//     <div className="products-container">
//       <div className="products-header">
//         <h1>Liste des Produits</h1>
//         <button className="add-product-btn" onClick={() => navigate("/products/add")}>
//           ➕ Ajouter un produit
//         </button>
//       </div>

//       <table className="products-table">
//         <thead>
//           <tr>
//             <th>Image</th>
//             <th>Nom</th>
//             <th>SKU</th>
//             <th>Catégorie</th>
//             <th>Stock</th>
//             <th>Prix</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {products.map((product) => (
//             <tr key={product._id}>
//               <td>
//                 <img
//                   src={product.image}
//                   alt={product.name}
//                   className="product-image"
//                 />
//               </td>
//               <td>{product.name}</td>
//               <td>{product.sku}</td>
//               <td>{product.category}</td>
//               <td>{product.totalStock}</td>
//               <td>{product.sellingPrice} FCFA</td>
//               <td>
//                 <button onClick={() => navigate(`/products/edit/${product._id}`)}>
//                   Modifier
//                 </button>
//                 <button
//                   style={{ marginLeft: "5px", backgroundColor: "red", color: "white" }}
//                   onClick={() => deleteProduct(product._id)}
//                 >
//                   Supprimer
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
