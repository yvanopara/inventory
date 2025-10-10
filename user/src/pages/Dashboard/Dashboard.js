import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { backendUrl } from "../../App";


const Dashboard = () => {
  const [role, setRole] = useState("");
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);

    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/products`);
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProducts();
  }, []);

  const goToAddSale = () => {
    navigate("/add-sale");
  };

  return (
    <div className="dashboard-container">
      <h1>Bienvenue sur le Dashboard 🎉</h1>
      <p className="role-text">Role: {role}</p>

      <button className="add-sale-button" onClick={goToAddSale}>
        Faire une Vente
      </button>

      <h2>Produits disponibles :</h2>
      <ul className="product-list">
        {products.map((p) => (
          <li key={p._id}>
            <span>{p.name}</span> - <b>{p.sellingPrice} FCFA</b>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
