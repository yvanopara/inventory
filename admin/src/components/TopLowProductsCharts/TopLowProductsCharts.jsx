import React, { useEffect, useState } from "react";
import axios from "axios";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./TopLowProductsCharts.css";
import { backendUrl } from "../../api/api";

ChartJS.register(ArcElement, Tooltip, Legend);

const TopLowProductsCharts = () => {
  const [data, setData] = useState({
    weeklyTop: [],
    weeklyLow: [],
    lastWeekTop: [],
    lastWeekLow: [],
    monthlyTop: [],
    monthlyLow: [],
    lastMonthTop: [],
    lastMonthLow: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/sales/top-and-low-products`);
        setData(res.data);
      } catch (err) {
        console.error("Erreur fetching top/low products:", err);
      }
    };
    fetchData();
  }, []);

  // Palette de couleurs différentes pour chaque produit
  const colors = [
    "#82ca9d",
    "#8884d8",
    "#ffc658",
    "#ff7f50",
    "#a569bd",
  ];

  const renderDoughnut = (chartData, title) => {
    const labels = chartData.map(item => item.name);
    const quantities = chartData.map(item => item.totalQuantity);
    const backgroundColors = chartData.map((_, idx) => colors[idx % colors.length]);

    const doughnutData = {
      labels,
      datasets: [
        {
          data: quantities,
          backgroundColor: backgroundColors,
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    };

    const options = {
      plugins: {
        legend: {
          display: true,
          position: "right",
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              const value = tooltipItem.raw;
              return `${tooltipItem.label}: ${value} ventes`;
            },
          },
        },
      },
      maintainAspectRatio: false,
    };

    return (
      <div className="chart-card">
        <h3 className="chart-title">{title}</h3>
        <div style={{ height: 300 }}>
          <Doughnut data={doughnutData} options={options} />
        </div>
      </div>
    );
  };

  return (
    <div className="charts-container">
      <h2 className="dashboard-title">Produits les plus et moins vendus</h2>

      {/* Ligne 1 : Top 5 (vert) */}
      <div className="charts-grid">
        {renderDoughnut(data.weeklyTop, "Top 5 - Semaine en cours")}
        {renderDoughnut(data.lastWeekTop, "Top 5 - Semaine dernière")}
        {renderDoughnut(data.monthlyTop, "Top 5 - Mois en cours")}
        {renderDoughnut(data.lastMonthTop, "Top 5 - Mois dernier")}
      </div>

      {/* Ligne 2 : Low 5 (rouge) */}
      <div className="charts-grid">
        {renderDoughnut(data.weeklyLow, "Low 5 - Semaine en cours")}
        {renderDoughnut(data.lastWeekLow, "Low 5 - Semaine dernière")}
        {renderDoughnut(data.monthlyLow, "Low 5 - Mois en cours")}
        {renderDoughnut(data.lastMonthLow, "Low 5 - Mois dernier")}
      </div>
    </div>
  );
};

export default TopLowProductsCharts;
