// src/components/WeeklySalesChart.js
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { api } from "../../../api/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WeeklySalesChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchWeeklySummary = async () => {
      try {
        // ⬅️ Utilisation du même client API
        const res = await api.get("/api/sales/summary/weekly");
        const data = res.data;

        // Extraire les jours et les ventes
        const days = Object.keys(data.dailySales);
        const revenues = days.map(day => {
          const daySales = data.dailySales[day];
          return daySales.reduce((sum, sale) => sum + sale.revenue, 0);
        });

        setChartData({
          labels: days,
          datasets: [
            {
              label: "Revenu par jour (FCFA)",
              data: revenues,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              tension: 0.3,
              fill: true
            }
          ]
        });
      } catch (error) {
        console.error("Erreur récupération données:", error);
      }
    };

    fetchWeeklySummary();
  }, []);

  if (!chartData) return <p>Chargement du graphique...</p>;

  return (
    <div style={{ width: "90%", margin: "auto" }}>
      <h2 style={{ textAlign: "center" }}>Résumé des ventes de la semaine</h2>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Ventes Hebdomadaires" }
          },
          scales: {
            y: { beginAtZero: true },
            x: { title: { display: true, text: "Jour" } } // corrigé
          }
        }}
      />
    </div>
  );
};

export default WeeklySalesChart;
