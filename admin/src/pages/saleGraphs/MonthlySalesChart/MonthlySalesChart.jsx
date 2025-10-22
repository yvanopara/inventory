import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // ✅ Import du plugin Filler
} from "chart.js";
import "./MonthlySalesChart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // ✅ Enregistrement du plugin
);

const MonthlySalesChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchMonthlySummary = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/sales/summary/monthly"
        );
        const data = res.data;

        const dailySales = data.dailySales || {};
        const days = Object.keys(dailySales).sort();
        const revenues = days.map(day =>
          dailySales[day].reduce((sum, sale) => sum + sale.revenue, 0)
        );

        setChartData({
          labels: days,
          datasets: [
            {
              label: "Revenu par jour (FCFA)",
              data: revenues,
              borderColor: "rgba(153, 102, 255, 1)",
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              tension: 0.3,
              fill: true, // ✅ Maintenant ça fonctionne
            },
          ],
        });
      } catch (error) {
        console.error("Erreur récupération données mensuelles:", error);
      }
    };

    fetchMonthlySummary();
  }, []);

  if (!chartData)
    return <p className="monthly-chart-loading">Chargement du graphique...</p>;

  return (
    <div className="monthly-chart-container">
      <h2 className="monthly-chart-title">Résumé des ventes du mois</h2>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Ventes Mensuelles" }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: "Revenu (FCFA)" }
            },
            x: { title: { display: true, text: "Jour du mois" } }
          }
        }}
      />
    </div>
  );
};

export default MonthlySalesChart;
