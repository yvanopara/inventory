import { useEffect, useState } from "react";
import { backendUrl } from "../../api/api";
import "./StockMovements.css";

export default function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | sales | cancels | additions

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
  }, [filter]);

  if (loading) return <p>Chargement des mouvements de stock...</p>;

  return (
    <div className="stock-container">
      <h1>Mouvements de Stock</h1>

      {/* 🔹 Boutons de filtre */}
      <div className="filter-buttons">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          Tous
        </button>
        <button
          className={filter === "sales" ? "active" : ""}
          onClick={() => setFilter("sales")}
        >
          Ventes
        </button>
        <button
          className={filter === "cancels" ? "active" : ""}
          onClick={() => setFilter("cancels")}
        >
          Annulations
        </button>
        <button
          className={filter === "additions" ? "active" : ""}
          onClick={() => setFilter("additions")}
        >
          Ajouts
        </button>
      </div>

      <table className="stock-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Produit</th>
            <th>Taille</th>
            <th>Type</th>
            <th>Quantité</th>
            <th>Note</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((mov, index) => (
            <tr key={index}>
              <td>
                <img
                  src={
                    mov.productPhoto
                      ? backendUrl + mov.productPhoto
                      : "/default.jpg"
                  }
                  alt={mov.productName}
                  className="table-image"
                />
              </td>
              <td>{mov.productName}</td>
              <td>{mov.variantSize || "—"}</td>
              <td className={`type ${mov.type}`}>{mov.type}</td>
              <td>{mov.quantity}</td>
              <td>{mov.note || "—"}</td>
              <td>{new Date(mov.date).toLocaleString("fr-FR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
