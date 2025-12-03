import React, { useState, useEffect } from "react";
import "./SubscriptionPage.css"; // Import du CSS

// Définition manuelle de la date d'expiration
const EXPIRATION_DATE = new Date("2050-04-01"); // AAAA-MM-JJ

const SubscriptionPage = ({ children }) => {
  const [showNotification, setShowNotification] = useState(true);
  const [daysLeft, setDaysLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [formattedDate, setFormattedDate] = useState("");
  
  // Calculer le temps restant
  useEffect(() => {
    const now = new Date();
    const timeLeft = EXPIRATION_DATE - now;
    const days = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60 * 24)));
    const expired = now > EXPIRATION_DATE;
    
    setDaysLeft(days);
    setIsExpired(expired);
    
    const formatted = EXPIRATION_DATE.toLocaleDateString("fr-FR", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setFormattedDate(formatted);
    
    // Stocker les infos d'abonnement dans localStorage
    localStorage.setItem('subscription_daysLeft', days.toString());
    localStorage.setItem('subscription_isExpired', expired.toString());
    localStorage.setItem('subscription_formattedDate', formatted);
    localStorage.setItem('subscription_expirationDate', EXPIRATION_DATE.toISOString());
  }, []);

  // Afficher la notification uniquement si moins de 15 jours restants
  useEffect(() => {
    if (daysLeft > 15) {
      setShowNotification(false);
    } else {
      setShowNotification(true);
    }
  }, [daysLeft]);

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  if (isExpired) {
    return (
      <div className="expired-page">
        <div className="expired-container">
          {/* Animation/SVG */}
          <div className="expired-icon">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <h1 className="expired-title">Abonnement expiré</h1>
          <p className="expired-message">
            Votre accès a expiré le <span className="highlight-date">{formattedDate}</span>
          </p>
          
          {/* Message pour la période de grâce */}
          <div className="grace-period-info">
            <div className="grace-icon">⏳</div>
            <div className="grace-content">
              <h3>Important : Période de grâce</h3>
              <p>
                <strong>Votre espace vendeur reste pleinement opérationnel pendant 7 jours après l'expiration de votre forfait.</strong>
              </p>
              <p>
                Cette période de grâce vous permet de ne pas être pénalisé si vous rencontrez des difficultés de paiement momentanées.
                Profitez de ces 7 jours pour régulariser votre situation.
              </p>
            </div>
          </div>
          
          <div className="contact-info">
            <div className="contact-card">
              <div className="contact-icon">📱</div>
              <div className="contact-details">
                <h3>Contactez-nous</h3>
                <p className="phone-number">693 800 251</p>
                <p className="contact-hours">Disponible 7j/7, 8h-20h</p>
              </div>
            </div>
          </div>

          <div className="pricing-section">
            <h2 className="pricing-title">Plans disponibles</h2>
            <div className="plans-grid">
              <div className="plan-card">
                <div className="plan-header">
                  <h3>1 Mois</h3>
                  <div className="plan-price">2000 F</div>
                </div>
                <ul className="plan-features">
                  <li>✅ Accès complet</li>
                  <li>✅ Support technique</li>
                  <li>✅ Mises à jour</li>
                </ul>
              </div>
              
              <div className="plan-card popular">
                <div className="popular-badge">ÉCONOMISEZ 12%</div>
                <div className="plan-header">
                  <h3>2 Mois</h3>
                  <div className="plan-price">3500 F</div>
                </div>
                <ul className="plan-features">
                  <li>✅ Accès complet</li>
                  <li>✅ Support technique</li>
                  <li>✅ Mises à jour</li>
                  <li>✅ Support prioritaire</li>
                </ul>
              </div>
              
              <div className="plan-card">
                <div className="plan-header">
                  <h3>3 Mois</h3>
                  <div className="plan-price">5000 F</div>
                </div>
                <ul className="plan-features">
                  <li>✅ Accès complet</li>
                  <li>✅ Support technique</li>
                  <li>✅ Mises à jour</li>
                  <li>✅ Support prioritaire</li>
                  <li>✅ Accès anticipé</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="action-section">
            <button className="renew-btn" onClick={() => window.location.href = 'tel:+225693800251'}>
              📞 Appeler maintenant
            </button>
            <p className="renew-note">Renouvellement instantané par téléphone</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {children}
      {showNotification && daysLeft <= 15 && (
        <div className="subscription-notification">
          <div className="notification-content">
            <div className="notification-icon">⏳</div>
            <div className="notification-text">
              <strong>Abonnement actif</strong>
              <span>Jours restants : <span className="days-count">{daysLeft}</span></span>
              <small>Expire le {formattedDate}</small>
            </div>
            <button 
              className="notification-close"
              onClick={handleCloseNotification}
              aria-label="Fermer la notification"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;