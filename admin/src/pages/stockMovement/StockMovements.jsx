import { useEffect, useState } from "react";
import { backendUrl } from "../../api/api";
import "./StockMovements.css";

export default function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [filter, setFilter] = useState("all"); // all | sales | cancels | additions
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchMovements = async () => {
      setLoading(true);
      try {
        let url = backendUrl + "/api/stockMovementRoutes";
        if (filter === "sales") url += "/sales";
        else if (filter === "cancels") url += "/cancels";
        else if (filter === "additions") url += "/additions";

        const res = await fetch(url, {
          headers: { token: localStorage.getItem("token") },
        }).then((r) => r.json());

        setMovements(res);
      } catch (err) {
        console.error("Erreur lors du chargement des mouvements :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
    
    // Vérifier la préférence de mode sombre
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
  }, [filter]);

  useEffect(() => {
    // Appliquer le mode sombre au document
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Filtrer les mouvements
  const filteredMovements = movements.filter(movement => 
    movement.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.variantSize?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Trier les mouvements
  const sortedMovements = [...filteredMovements].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (sortConfig.key === 'date') {
      return sortConfig.direction === 'asc' 
        ? new Date(aValue) - new Date(bValue)
        : new Date(bValue) - new Date(aValue);
    }
    
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
  const currentMovements = sortedMovements.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedMovements.length / itemsPerPage);

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

  const MovementType = ({ type }) => {
    const getTypeConfig = (type) => {
      switch(type?.toLowerCase()) {
        case 'sale':
          return { label: 'Vente', class: 'sale', icon: '💰' };
        case 'cancelsale':
          return { label: 'Annulation', class: 'cancel', icon: '❌' };
        case 'add':
          return { label: 'Ajout', class: 'addition', icon: '📦' };
        default:
          return { label: type, class: 'default', icon: '📝' };
      }
    };

    const config = getTypeConfig(type);

    return (
      <div className={`movement-type ${config.class}`}>
        <span className="type-icon">{config.icon}</span>
        {config.label}
      </div>
    );
  };

  const QuantityDisplay = ({ quantity, type }) => {
    const isNegative = type?.toLowerCase() === 'sale' || type?.toLowerCase() === 'cancelsale';
    
    return (
      <div className={`quantity-display ${isNegative ? 'negative' : 'positive'}`}>
        <span className="quantity-sign">{isNegative ? '-' : '+'}</span>
        {Math.abs(quantity)}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="stock-container">
        <div className="loading-message">
          <p>Chargement des mouvements de stock...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stock-container">
      {/* En-tête avec contrôles */}
      <div className="stock-header">
        <div className="header-content">
          <div className="title-section">
            <h1>Mouvements de Stock</h1>
            <p className="stock-subtitle">
              Suivi complet des entrées et sorties de stock
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
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="filters-section">
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

          <div className="filter-buttons">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              📊 Tous
            </button>
            <button
              className={filter === "sales" ? "active" : ""}
              onClick={() => setFilter("sales")}
            >
              💰 Ventes
            </button>
            <button
              className={filter === "cancels" ? "active" : ""}
              onClick={() => setFilter("cancels")}
            >
              ❌ Annulations
            </button>
            <button
              className={filter === "additions" ? "active" : ""}
              onClick={() => setFilter("additions")}
            >
              📦 Ajouts
            </button>
          </div>

          {searchTerm && (
            <div className="results-info">
              <span>{sortedMovements.length} mouvement(s) trouvé(s)</span>
              <button 
                className="clear-search"
                onClick={() => setSearchTerm("")}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tableau des mouvements */}
      <div className="table-section">
        <div className="table-container">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th onClick={() => handleSort('productName')} className="sortable">
                  Produit {sortConfig.key === 'productName' && <SortIcon direction={sortConfig.direction} />}
                </th>
                <th onClick={() => handleSort('variantSize')} className="sortable">
                  Taille {sortConfig.key === 'variantSize' && <SortIcon direction={sortConfig.direction} />}
                </th>
                <th onClick={() => handleSort('type')} className="sortable">
                  Type {sortConfig.key === 'type' && <SortIcon direction={sortConfig.direction} />}
                </th>
                <th onClick={() => handleSort('quantity')} className="sortable">
                  Quantité {sortConfig.key === 'quantity' && <SortIcon direction={sortConfig.direction} />}
                </th>
                <th>Note</th>
                <th onClick={() => handleSort('date')} className="sortable">
                  Date {sortConfig.key === 'date' && <SortIcon direction={sortConfig.direction} />}
                </th>
              </tr>
            </thead>
            <tbody>
              {currentMovements.map((mov, index) => (
                <tr key={index} className="movement-row">
                  <td>
                    <div className="image-cell">
                      {mov.productPhoto ? (
                        <img
                          src={mov.productPhoto.includes('http') ? mov.productPhoto : backendUrl + mov.productPhoto}
                          alt={mov.productName}
                          className="table-image"
                        />
                      ) : (
                        <div className="no-image">
                          <span>📷</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="product-name">{mov.productName}</td>
                  <td className="size-cell">
                    {mov.variantSize ? (
                      <span className="size-tag">{mov.variantSize}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <MovementType type={mov.type} />
                  </td>
                  <td>
                    <QuantityDisplay quantity={mov.quantity} type={mov.type} />
                  </td>
                  <td className="note-cell">
                    <div className="note-content">
                      {mov.note ? (
                        <>
                          <span className="note-preview">
                            {mov.note.length > 30 
                              ? `${mov.note.substring(0, 30)}...` 
                              : mov.note
                            }
                          </span>
                          {mov.note.length > 30 && (
                            <span className="tooltip">{mov.note}</span>
                          )}
                        </>
                      ) : (
                        "—"
                      )}
                    </div>
                  </td>
                  <td className="date-cell">
                    <div className="date-display">
                      <div className="date-time">
                        {new Date(mov.date).toLocaleDateString("fr-FR")}
                      </div>
                      <div className="time">
                        {new Date(mov.date).toLocaleTimeString("fr-FR", {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* État vide */}
        {movements.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>Aucun mouvement de stock</h3>
            <p>Les mouvements de stock apparaîtront ici.</p>
          </div>
        )}

        {movements.length > 0 && sortedMovements.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>Aucun mouvement correspondant</h3>
            <p>Aucun mouvement ne correspond à vos critères de recherche.</p>
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setSearchTerm("");
                setFilter("all");
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
// import { backendUrl } from "../../api/api";
// import "./StockMovements.css";

// export default function StockMovements() {
//   const [movements, setMovements] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState("all"); // all | sales | cancels | additions

//   useEffect(() => {
//     const fetchMovements = async () => {
//       setLoading(true);
//       try {
//         let url = backendUrl + "/api/stockMovementRoutes";
//         if (filter === "sales") url += "/sales";
//         else if (filter === "cancels") url += "/cancels";
//         else if (filter === "additions") url += "/additions";

//         const res = await fetch(url, {
//           headers: { token: localStorage.getItem("token") },
//         }).then((r) => r.json());

//         setMovements(res);
//       } catch (err) {
//         console.error("Erreur lors du chargement des mouvements :", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMovements();
//   }, [filter]);

//   if (loading) return <p>Chargement des mouvements de stock...</p>;

//   return (
//     <div className="stock-container">
//       <h1>Mouvements de Stock</h1>

//       {/* 🔹 Boutons de filtre */}
//       <div className="filter-buttons">
//         <button
//           className={filter === "all" ? "active" : ""}
//           onClick={() => setFilter("all")}
//         >
//           Tous
//         </button>
//         <button
//           className={filter === "sales" ? "active" : ""}
//           onClick={() => setFilter("sales")}
//         >
//           Ventes
//         </button>
//         <button
//           className={filter === "cancels" ? "active" : ""}
//           onClick={() => setFilter("cancels")}
//         >
//           Annulations
//         </button>
//         <button
//           className={filter === "additions" ? "active" : ""}
//           onClick={() => setFilter("additions")}
//         >
//           Ajouts
//         </button>
//       </div>

//       <table className="stock-table">
//         <thead>
//           <tr>
//             <th>Photo</th>
//             <th>Produit</th>
//             <th>Taille</th>
//             <th>Type</th>
//             <th>Quantité</th>
//             <th>Note</th>
//             <th>Date</th>
//           </tr>
//         </thead>
//         <tbody>
//           {movements.map((mov, index) => (
//             <tr key={index}>
//               <td>
//                 <img
//                   src={
//                     mov.productPhoto
//                       ? backendUrl + mov.productPhoto
//                       : "/default.jpg"
//                   }
//                   alt={mov.productName}
//                   className="table-image"
//                 />
//               </td>
//               <td>{mov.productName}</td>
//               <td>{mov.variantSize || "—"}</td>
//               <td className={`type ${mov.type}`}>{mov.type}</td>
//               <td>{mov.quantity}</td>
//               <td>{mov.note || "—"}</td>
//               <td>{new Date(mov.date).toLocaleString("fr-FR")}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
