import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./Login.css";
import { AuthContext } from "../../AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/user/login", {
        email,
        password,
      });

      if (res.data.success) {
        login(res.data.token); // ← Sauvegarde du token dans le contexte
        setMessage("Connexion réussie ✅");
        navigate("/dashboard");
      } else {
        setMessage("Identifiants incorrects ❌");
      }
    } catch (error) {
      setMessage("Erreur de connexion ⚠️");
    }
  };

  return (
    <div className="login-container">
      <h2>Connexion Employé</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="login-button" onClick={handleLogin}>
        Se connecter
      </button>
      {message && <p className="login-message">{message}</p>}
    </div>
  );
}
