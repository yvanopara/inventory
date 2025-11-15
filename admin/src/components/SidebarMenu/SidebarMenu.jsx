import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SidebarMenu.css";
import {
  FaBars,
  FaTimes,
  FaChartLine,
  FaShoppingCart,
  FaMoneyBillWave,
  FaBox,
  FaCog,
  FaChevronDown,
  FaChartPie,
  FaSignOutAlt,
} from "react-icons/fa";

const SidebarMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSales, setOpenSales] = useState(false);
  const [openGraphs, setOpenGraphs] = useState(false);

  const navigate = useNavigate();

  // Navigation + fermeture du menu
  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
    setOpenSales(false);
    setOpenGraphs(false);
  };

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    handleNavigate("/login");
  };

  return (
    <>
      {!isOpen && (
        <button className="menu-toggle" onClick={() => setIsOpen(true)}>
          <FaBars />
        </button>
      )}

      <div className={`sidebar-container ${isOpen ? "visible" : ""}`}>
        <div className={`sidebar ${isOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <h2 className="sidebar-title">Tableau de bord</h2>
            <FaTimes className="close-icon" onClick={() => setIsOpen(false)} />
          </div>

          <ul className="menu-list">

            {/* Accueil */}
            <li className="menu-item dashboard-item" onClick={() => handleNavigate("/")}>
              <FaChartLine className="menu-icon" />
              <span>Accueil</span>
            </li>

            {/* Produits */}
            <li className="menu-item" onClick={() => handleNavigate("/products")}>
              <FaBox className="menu-icon" />
              <span>Produits</span>
            </li>

            {/* Ventes */}
            <li
              className={`menu-item ${openSales ? "active" : ""}`}
              onClick={() => setOpenSales(!openSales)}
            >
              <div className="menu-item-header">
                <div>
                  <FaShoppingCart className="menu-icon" />
                  <span>Ventes</span>
                </div>
                <FaChevronDown className={`chevron ${openSales ? "rotate" : ""}`} />
              </div>
              {openSales && (
                <ul className="submenu">
                  <li onClick={() => handleNavigate("/daily-summary")}>
                    Ventes journalières
                  </li>
                  <li onClick={() => handleNavigate("/weekly-summary")}>
                    Ventes hebdomadaires
                  </li>
                  <li onClick={() => handleNavigate("/monthly-summary")}>
                    Ventes mensuelles
                  </li>
                  <li onClick={() => handleNavigate("/yearly-summary")}>
                    Ventes annuelles
                  </li>
                </ul>
              )}
            </li>

            {/* Graphiques */}
            <li
              className={`menu-item ${openGraphs ? "active" : ""}`}
              onClick={() => setOpenGraphs(!openGraphs)}
            >
              <div className="menu-item-header">
                <div>
                  <FaChartPie className="menu-icon" />
                  <span>Graphiques</span>
                </div>
                <FaChevronDown className={`chevron ${openGraphs ? "rotate" : ""}`} />
              </div>
              {openGraphs && (
                <ul className="submenu">
                  <li onClick={() => handleNavigate("/graph/week")}>
                    Graphique de la semaine
                  </li>
                  <li onClick={() => handleNavigate("/graph/month")}>
                    Graphique du mois
                  </li>
                  <li onClick={() => handleNavigate("/graph/anual")}>
                    Graphique de l’année
                  </li>
                </ul>
              )}
            </li>

            {/* Stock faible */}
            <li className="menu-item" onClick={() => handleNavigate("/alerts/low-stock")}>
              <FaBox className="menu-icon" />
              <span>Stock faible</span>
            </li>

            {/* Stock Movements */}
            <li className="menu-item" onClick={() => handleNavigate("/stock-movement")}>
              <FaBox className="menu-icon" />
              <span>Variation de Stock</span>
            </li>

            {/* Finances */}
            <li className="menu-item" onClick={() => handleNavigate("/finances")}>
              <FaMoneyBillWave className="menu-icon" />
              <span>Finances</span>
            </li>

            {/* Paramètres */}
            <li className="menu-item" onClick={() => handleNavigate("/settings")}>
              <FaCog className="menu-icon" />
              <span>Paramètres</span>
            </li>

            {/* Déconnexion */}
            <li className="menu-item logout" onClick={handleLogout}>
              <FaSignOutAlt className="menu-icon" />
              <span>Déconnexion</span>
            </li>

          </ul>
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;
