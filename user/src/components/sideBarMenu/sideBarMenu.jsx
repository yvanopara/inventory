import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./sideBarMenu.css";
import {
  FaBars,
  FaTimes,
  FaChartLine,
  FaShoppingCart,
  FaBox,
  FaCog,
  FaChevronDown,
  FaChartPie,
  FaSignOutAlt,
  FaUndo,
} from "react-icons/fa";

const SidebarMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSales, setOpenSales] = useState(false);
  const [openGraphs, setOpenGraphs] = useState(false);

  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
    setOpenSales(false);
    setOpenGraphs(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    handleNavigate("/");
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
            
            {/* ACCUEIL */}
            <li
              className="menu-item dashboard-item"
              onClick={() => handleNavigate("/dashboard")}
            >
              <FaChartLine className="menu-icon" />
              <span>Accueil</span>
            </li>

            {/* ENREGISTRER UNE VENTE */}
            <li
              className="menu-item"
              onClick={() => handleNavigate("/add-sale")}
            >
              <FaShoppingCart className="menu-icon" />
              <span>Enregistrer une vente</span>
            </li>

            {/* FAIRE UNE RESERVATION */}
            <li
              className="menu-item"
              onClick={() => handleNavigate("/reservation")}
            >
              <FaShoppingCart className="menu-icon" />
              <span>Faire une réservation</span>
            </li>

            {/* RESUMER DES VENTES */}
            <li
              className={`menu-item ${openSales ? "active" : ""}`}
              onClick={() => setOpenSales(!openSales)}
            >
              <div className="menu-item-header">
                <div>
                  <FaBox className="menu-icon" />
                  <span>Résumé des ventes</span>
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

            {/* A PROPOS */}
            <li className="menu-item" onClick={() => handleNavigate("/about")}>
              <FaChartPie className="menu-icon" />
              <span>À propos</span>
            </li>

            {/* PARAMÈTRES */}
            <li className="menu-item" onClick={() => handleNavigate("/settings")}>
              <FaCog className="menu-icon" />
              <span>Paramètres</span>
            </li>

            {/* DECONNEXION */}
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
