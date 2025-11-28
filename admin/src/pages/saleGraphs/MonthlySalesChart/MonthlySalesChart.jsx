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
  Legend,
  Filler
} from "chart.js";

import "./MonthlySalesChart.css";
import { api } from "../../../api/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MonthlySalesChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchMonthlySummary = async () => {
      try {
        const res = await api.get("/api/sales/summary/monthly");
        const data = res.data;

        // Extraction des semaines envoyées par le backend
        const weeklySummaries = data.weeklySummaries || [];

        // 📌 On reconstruit les ventes par jour
        const dailyMap = {};

        weeklySummaries.forEach((week) => {
          week.days.forEach((dayObj) => {
            const date = new Date(dayObj.date);
            const dayNumber = date.getDate();

            const revenue = (dayObj.sales || []).reduce(
              (sum, sale) => sum + (sale.revenue || 0),
              0
            );

            dailyMap[dayNumber] = revenue;
          });
        });

        // Tri par jour du mois
        const days = Object.keys(dailyMap)
          .map(n => Number(n))
          .sort((a, b) => a - b);

        const revenues = days.map((d) => dailyMap[d]);

        // 📊 Préparation des données du graphique
        setChartData({
          labels: days,
          datasets: [
            {
              label: "Revenu par jour (FCFA)",
              data: revenues,
              borderColor: "rgba(153, 102, 255, 1)",
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              tension: 0.3,
              fill: true,
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
            title: { display: true, text: "Ventes Mensuelles" },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: "Revenu (FCFA)" },
            },
            x: {
              title: { display: true, text: "Jour du mois" },
            },
          },
        }}
      />
    </div>
  );
};

export default MonthlySalesChart;
