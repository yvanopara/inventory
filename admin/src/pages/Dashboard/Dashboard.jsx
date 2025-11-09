import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";
import StockAlerts from "../../components/StockAllert/stockAlerts";
import TopLowProductsCharts from "../../components/TopLowProductsCharts/TopLowProductsCharts";
import { backendUrl } from "../../api/api";

// Icônes
import { 
  FaChartLine, 
  FaExclamationTriangle, 
  FaShoppingCart, 
  FaMoneyBillWave, 
  FaPiggyBank, 
  FaDollarSign,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarAlt,
  FaCalendar
} from "react-icons/fa";

const Dashboard = () => {
  const [salesSummary, setSalesSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const fetchSalesSummary = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/sales/dashboard-summary`);
      setSalesSummary(data.summary || null);
      setAlerts(data.alerts || []);
      setLoading(false);
      setTimeout(() => setIsVisible(true), 100);
    } catch (err) {
      console.error("Erreur lors de la récupération du résumé :", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesSummary();
  }, []);

  const getCardColor = (index) => {
    const colors = [
      { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", text: "#fff" },
      { background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", text: "#fff" },
      { background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", text: "#fff" },
      { background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", text: "#333" },
      { background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", text: "#333" },
      { background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", text: "#333" },
      { background: "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)", text: "#333" },
      { background: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)", text: "#fff" }
    ];
    return colors[index % colors.length];
  };

  const getPeriodIcon = (title) => {
    switch(title) {
      case "Aujourd'hui": return <FaCalendarDay />;
      case "Hier": return <FaCalendarDay />;
      case "Semaine en cours": return <FaCalendarWeek />;
      case "Semaine dernière": return <FaCalendarWeek />;
      case "Mois en cours": return <FaCalendarAlt />;
      case "Mois passé": return <FaCalendarAlt />;
      case "Année en cours": return <FaCalendar />;
      case "Année passée": return <FaCalendar />;
      default: return <FaChartLine />;
    }
  };

  // Calcul simple pour la période actuelle vs précédente
  const calculatePercentage = (current, previous) => {
    if (!previous || previous === 0) return "N/A";
    const ratio = (current / previous) * 100;
    return `${ratio.toFixed(0)}%`;
  };

  // Déterminer la flèche
  const getArrow = (current, previous) => {
    if (!previous || previous === 0) return "";
    if (current > previous) return "▲"; // plus
    if (current < previous) return "▼"; // moins
    return "→"; // stable
  };

  const PeriodCard = ({ title, summary, previousSummary, showVariation, index }) => {
    const colorStyle = getCardColor(index);

    return (
      <div 
        className={`period-card ${isVisible ? 'visible' : ''}`}
        style={{ 
          background: colorStyle.background,
          color: colorStyle.text
        }}
      >
        <div className="card-header">
          <span className="period-icon">{getPeriodIcon(title)}</span>
          <h3>{title}</h3>
        </div>
        <div className="card-content">
          <div className="metric">
            <span className="metric-icon"><FaShoppingCart /></span>
            <div className="metric-text">
              <span className="metric-label">Quantité vendue</span>
              <span className="metric-value">{summary.totalQuantity}</span>
            </div>
          </div>
          <div className="metric">
            <span className="metric-icon"><FaMoneyBillWave /></span>
            <div className="metric-text">
              <span className="metric-label">Chiffre d'affaires</span>
              <span className="metric-value">{summary.totalRevenue.toLocaleString()} FCFA</span>
            </div>
          </div>
          <div className="metric">
            <span className="metric-icon"><FaPiggyBank /></span>
            <div className="metric-text">
              <span className="metric-label">Profit</span>
              <span className="metric-value">{summary.totalProfit.toLocaleString()} FCFA</span>
            </div>
          </div>
          <div className="metric">
            <span className="metric-icon"><FaDollarSign /></span>
            <div className="metric-text">
              <span className="metric-label">Coût total</span>
              <span className="metric-value">{summary.totalCost.toLocaleString()} FCFA</span>
            </div>
          </div>
          {/* Affiche seulement pour les périodes actuelles */}
          {showVariation && previousSummary && (
            <div className="metric">
              <span className="metric-icon">📊</span>
              <div className="metric-text">
                <span className="metric-label">Variation par rapport à la période précédente</span>
                <span className="metric-value">
                  {calculatePercentage(summary.totalRevenue, previousSummary.totalRevenue)} {getArrow(summary.totalRevenue, previousSummary.totalRevenue)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>
          <FaChartLine className="header-icon" />
          Tableau de bord des ventes
        </h1>
        <p>Vue d'ensemble de vos performances commerciales</p>
      </div>

      {/* Alertes stock */}
      {alerts.length > 0 && (
        <div className={`alert-section ${isVisible ? 'visible' : ''}`}>
          <div className="alert-header">
            <FaExclamationTriangle className="alert-icon" />
            <h2>Alertes de stock</h2>
          </div>
          <div className="alerts-container">
            {alerts.map((alert, index) => (
              <div key={index} className="alert-item">
                <span className="alert-badge">!</span>
                <span>{alert}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Résumé des ventes */}
      <div className="sales-summary">
        <div className="section-header">
          <h2>Résumé des ventes</h2>
          <p>Comparaison des performances par période</p>
        </div>
        
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement des données...</p>
          </div>
        )}
        
        {!loading && salesSummary && (
          <div className="summary-grid">
            <PeriodCard title="Aujourd'hui" summary={salesSummary.today} previousSummary={salesSummary.yesterday} showVariation={true} index={0} />
            <PeriodCard title="Hier" summary={salesSummary.yesterday} previousSummary={null} showVariation={false} index={1} />
            <PeriodCard title="Semaine en cours" summary={salesSummary.thisWeek} previousSummary={salesSummary.lastWeek} showVariation={true} index={2} />
            <PeriodCard title="Semaine dernière" summary={salesSummary.lastWeek} previousSummary={null} showVariation={false} index={3} />
            <PeriodCard title="Mois en cours" summary={salesSummary.thisMonth} previousSummary={salesSummary.lastMonth} showVariation={true} index={4} />
            <PeriodCard title="Mois passé" summary={salesSummary.lastMonth} previousSummary={null} showVariation={false} index={5} />
          </div>
        )}
      </div>
      
      <StockAlerts />
      <TopLowProductsCharts />
    </div>
  );
};

export default Dashboard;







// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./Dashboard.css";
// import StockAlerts from "../../components/StockAllert/stockAlerts";
// import TopLowProductsCharts from "../../components/TopLowProductsCharts/TopLowProductsCharts";
// import { backendUrl } from "../../api/api";



// const Dashboard = () => {
//   const [salesSummary, setSalesSummary] = useState(null);
//   const [alerts, setAlerts] = useState([]);  // <-- état pour alertes
//   const [loading, setLoading] = useState(true);

//   // --- Récupérer résumé des ventes et alertes ---
//   const fetchSalesSummary = async () => {
//     try {
//       setLoading(true);
//       const { data } = await axios.get(`${backendUrl}/api/sales/dashboard-summary`);
//       setSalesSummary(data.summary || null);
//       setAlerts(data.alerts || []); // <-- récupérer alertes si backend les fournit
//       setLoading(false);
//     } catch (err) {
//       console.error("Erreur lors de la récupération du résumé :", err);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSalesSummary();
//   }, []);

//   const PeriodCard = ({ title, summary }) => (
//     <div className="period-card">
//       <h3>{title}</h3>
//       <p>Quantité vendue : {summary.totalQuantity}</p>
//       <p>Chiffre d'affaires : {summary.totalRevenue.toLocaleString()} FCFA</p>
//       <p>Profit : {summary.totalProfit.toLocaleString()} FCFA</p>
//       <p>Coût total : {summary.totalCost.toLocaleString()} FCFA</p>
//     </div>
//   );

//   return (
//     <div className="dashboard">
//       <h1>Tableau de bord des ventes</h1>

//       {/* --- Alertes stock --- */}
//       {alerts.length > 0 && (
//         <div className="stock-alerts">
//           <h2>⚠️ Alertes de stock</h2>
//           <ul>
//             {alerts.map((alert, index) => (
//               <li key={index}>{alert}</li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {/* --- Résumé des ventes --- */}
//       <div className="sales-summary">
//         <h2>Résumé des ventes</h2>
//         {loading && <p>Chargement...</p>}
//         {!loading && salesSummary && (
//           <div className="summary-grid">
//             <PeriodCard title="Aujourd'hui" summary={salesSummary.today} />
//             <PeriodCard title="Hier" summary={salesSummary.yesterday} />
//             <PeriodCard title="Semaine en cours" summary={salesSummary.thisWeek} />
//             <PeriodCard title="Semaine dernière" summary={salesSummary.lastWeek} />
//             <PeriodCard title="Mois en cours" summary={salesSummary.thisMonth} />
//             <PeriodCard title="Mois passé" summary={salesSummary.lastMonth} />
//             <PeriodCard title="Année en cours" summary={salesSummary.thisYear} />
//             <PeriodCard title="Année passée" summary={salesSummary.lastYear} />
//           </div>
//         )}
//       </div>
//       <StockAlerts/>
//       <TopLowProductsCharts/>
//     </div>
//   );
// };

// export default Dashboard;
