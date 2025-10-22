import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../../api/api"; // ← backendUrl défini ici
import "./StockHistory.css";

export default function StockHistory() {
  const { id } = useParams();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(backendUrl + `/api/products/stock-history/${id}`, { 
          headers: { token: localStorage.getItem("token") }, // token ajouté
        });
        setHistory(res.data.history);
      } catch (err) {
        console.error(
          "Erreur récupération historique :",
          err.response?.data || err
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id]);

  if (loading) return <p>Chargement de l’historique...</p>;
  if (!history) return <p>Aucun historique trouvé.</p>;

  return (
    <div className="stock-history-container">
      <h1>Historique du stock - {history.name}</h1>
      <p>Total Stock : {history.totalStock}</p>
      <p>Total Vendu : {history.totalSold}</p>

      {history.stockByVariant ? (
        <table>
          <thead>
            <tr>
              <th>Variante</th>
              <th>Stock</th>
              <th>Total vendu</th>
            </tr>
          </thead>
          <tbody>
            {history.stockByVariant.map((v, index) => (
              <tr key={index}>
                <td>{v.size}</td>
                <td>{v.stock}</td>
                <td>{v.totalSold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Pas de variantes pour ce produit.</p>
      )}
    </div>
  );
}
