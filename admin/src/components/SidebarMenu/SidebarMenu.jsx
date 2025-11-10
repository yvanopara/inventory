import React, { useState } from "react";
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

  // 🔐 Déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    window.location.href = "/login"; // redirige vers la page de login
  };

  return (
    <>
      {/* === Bouton ☰ visible uniquement quand le menu est fermé === */}
      {!isOpen && (
        <button className="menu-toggle" onClick={() => setIsOpen(true)}>
          <FaBars />
        </button>
      )}

      {/* === Sidebar === */}
      <div className={`sidebar-container ${isOpen ? "visible" : ""}`}>
        <div className={`sidebar ${isOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <h2 className="sidebar-title">Tableau de bord</h2>
            <FaTimes className="close-icon" onClick={() => setIsOpen(false)} />
          </div>

          <ul className="menu-list">
            {/* Accueil */}
            <li className="menu-item dashboard-item">
              <FaChartLine className="menu-icon" />
              <span>Accueil</span>
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
                <FaChevronDown
                  className={`chevron ${openSales ? "rotate" : ""}`}
                />
              </div>
              {openSales && (
                <ul className="submenu">
                  <li>Ventes journalières</li>
                  <li>Ventes hebdomadaires</li>
                  <li>Ventes mensuelles</li>
                  <li>Ventes annuelles</li>
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
                <FaChevronDown
                  className={`chevron ${openGraphs ? "rotate" : ""}`}
                />
              </div>
              {openGraphs && (
                <ul className="submenu">
                  <li>Graphique de la semaine</li>
                  <li>Graphique du mois</li>
                  <li>Graphique de l’année</li>
                </ul>
              )}
            </li>

            {/* Stock faible */}
            <li className="menu-item">
              <FaBox className="menu-icon" />
              <span>Stock faible</span>
            </li>

            {/* Finances */}
            <li className="menu-item">
              <FaMoneyBillWave className="menu-icon" />
              <span>Finances</span>
            </li>

            {/* Paramètres */}
            <li className="menu-item">
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
