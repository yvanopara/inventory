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

  // Palette de couleurs étendue
  const colors = [
    "#82ca9d",
    "#8884d8",
    "#ffc658",
    "#ff7f50",
    "#a569bd",
    "#3498db",
    "#e74c3c",
    "#2ecc71",
    "#f39c12",
    "#9b59b6",
  ];

  const renderDoughnut = (chartData, title) => {
    if (!chartData || chartData.length === 0) {
      return (
        <div className="chart-card">
          <h3 className="chart-title">{title}</h3>
          <div className="chart-empty">
            <p>Aucune donnée disponible</p>
          </div>
        </div>
      );
    }

    const labels = chartData.map(item => item.name || "Produit sans nom");
    const quantities = chartData.map(item => item.totalQuantity || 0);
    const backgroundColors = chartData.map((_, idx) => colors[idx % colors.length]);

    const doughnutData = {
      labels,
      datasets: [
        {
          data: quantities,
          backgroundColor: backgroundColors,
          borderColor: "#fff",
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    };

    const options = {
      plugins: {
        legend: {
          display: true,
          position: "right",
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 11
            }
          },
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
      cutout: "60%",
    };

    return (
      <div className="chart-card">
        <h3 className="chart-title">{title}</h3>
        <div className="chart-wrapper">
          <Doughnut data={doughnutData} options={options} />
        </div>
      </div>
    );
  };

  return (
    <div className="charts-container">
      <h2 className="dashboard-title">Produits les plus et moins vendus</h2>

      {/* Section Top 5 */}
      <section className="charts-section">
        <h3 className="section-title">Top 5 des produits</h3>
        <div className="charts-grid">
          {renderDoughnut(data.weeklyTop, "Semaine en cours")}
          {renderDoughnut(data.lastWeekTop, "Semaine dernière")}
          {renderDoughnut(data.monthlyTop, "Mois en cours")}
          {renderDoughnut(data.lastMonthTop, "Mois dernier")}
        </div>
      </section>

      {/* Section Low 5 */}
      <section className="charts-section">
        <h3 className="section-title">5 produits les moins vendus</h3>
        <div className="charts-grid">
          {renderDoughnut(data.weeklyLow, "Semaine en cours")}
          {renderDoughnut(data.lastWeekLow, "Semaine dernière")}
          {renderDoughnut(data.monthlyLow, "Mois en cours")}
          {renderDoughnut(data.lastMonthLow, "Mois dernier")}
        </div>
      </section>
    </div>
  );
};

export default TopLowProductsCharts;