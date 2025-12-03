import React, { useState, useEffect } from "react";
import "./Finance.css";

const Finance = () => {
  const [subscriptionData, setSubscriptionData] = useState({
    daysLeft: 0,
    isExpired: false,
    formattedDate: ""
  });

  // Récupérer les données d'abonnement depuis localStorage
  useEffect(() => {
    const loadSubscriptionData = () => {
      const daysLeft = parseInt(localStorage.getItem('subscription_daysLeft') || '0');
      const isExpired = localStorage.getItem('subscription_isExpired') === 'true';
      const formattedDate = localStorage.getItem('subscription_formattedDate') || '';
      
      setSubscriptionData({ 
        daysLeft, 
        isExpired, 
        formattedDate 
      });
    };

    // Charger immédiatement
    loadSubscriptionData();

    // Écouter les changements dans localStorage
    const handleStorageChange = (e) => {
      if (e.key?.includes('subscription_')) {
        loadSubscriptionData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const { daysLeft, isExpired, formattedDate } = subscriptionData;

  const handleCallNow = () => {
    window.location.href = 'tel:+225693800251';
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/225693800251?text=Bonjour%20je%20souhaite%20renouveler%20mon%20abonnement', '_blank');
  };

  return (
    <div className="finance-page">
      {/* Hero Section */}
      <div className="finance-hero">
        <div className="hero-content">
          <h1>💰 Finance & Abonnement</h1>
          <p className="hero-subtitle">
            Investissement dans la sécurité et la performance de votre boutique
          </p>
        </div>
      </div>

      {/* Current Status */}
      <div className="current-status">
        <div className="status-card">
          <div className="status-header">
            <h2>📊 État actuel de votre abonnement</h2>
            <div className={`status-indicator ${isExpired ? 'expired' : daysLeft <= 7 ? 'warning' : 'active'}`}>
              {isExpired ? '❌ Expiré' : daysLeft <= 7 ? '⚠️ Bientôt expiré' : '✅ Actif'}
            </div>
          </div>
          
          <div className="status-details">
            <div className="detail-item">
              <span className="detail-label">📅 Date d'expiration :</span>
              <span className="detail-value">{formattedDate}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">⏳ Jours restants :</span>
              <span className="detail-value days-count">{daysLeft} jours</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">💳 Prochain paiement :</span>
              <span className="detail-value">{formattedDate}</span>
            </div>
          </div>

          {isExpired && (
            <div className="expired-alert">
              <p>⚠️ Votre accès est temporairement suspendu. Renouvelez pour réactiver.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="pricing-section">
        <h2 className="section-title">🎯 Plans d'abonnement disponibles</h2>
        <p className="section-subtitle">
          Choisissez la durée qui correspond à vos besoins
        </p>

        <div className="plans-container">
          <div className="plan-card">
            <div className="plan-header">
              <div className="plan-icon">📈</div>
              <h3>1 Mois</h3>
              <div className="plan-price">2000 FCFA</div>
              <div className="plan-period">par mois</div>
            </div>
            <ul className="plan-features">
              <li> Parfait pour tester le système</li>
              <li> Toutes les fonctionnalités incluses</li>
              <li> Support technique de base</li>
              <li> Mises à jour régulières</li>
            </ul>
          </div>

          <div className="plan-card popular">
            <div className="popular-badge">RECOMMANDÉ</div>
            <div className="plan-header">
              <div className="plan-icon">🚀</div>
              <h3>2 Mois</h3>
              <div className="plan-price">3500 FCFA</div>
              <div className="plan-period">(Économisez 12%)</div>
              <div className="plan-savings">500 FCFA économisés</div>
            </div>
            <ul className="plan-features">
              <li> Toutes les fonctionnalités de base</li>
              <li> Support technique prioritaire</li>
              <li> Sauvegarde automatique des données</li>
              <li> Notifications Telegram avancées</li>
              <li> Accès aux nouvelles fonctionnalités</li>
            </ul>
          </div>

          <div className="plan-card">
            <div className="plan-header">
              <div className="plan-icon">🏆</div>
              <h3>3 Mois</h3>
              <div className="plan-price">5000 FCFA</div>
              <div className="plan-period">(Économisez 16%)</div>
              <div className="plan-savings">1000 FCFA économisés</div>
            </div>
            <ul className="plan-features">
              <li> Tous les avantages des plans précédents</li>
              <li> Support technique premium 24/7</li>
              <li> Sauvegarde cloud sécurisée</li>
              <li> API Telegram illimitée</li>
              <li> Accès anticipé aux nouvelles versions</li>
              <li> Formation personnalisée</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Explanation Section */}
      <div className="explanation-section">
        <h2 className="section-title">🔐 À quoi sert votre abonnement ?</h2>
        
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">🛡️</div>
            <h3>Sécurité des données</h3>
            <p>
              Votre abonnement finance des serveurs sécurisés qui protègent vos produits, 
              photos et informations clients contre les piratages et les pertes de données.
            </p>
            <ul className="benefit-list">
              <li>Chiffrement AES-256 des données</li>
              <li>Sauvegardes quotidiennes automatiques</li>
              <li>Protection contre les attaques DDoS</li>
              <li>Certificat SSL pour connexions sécurisées</li>
            </ul>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">☁️</div>
            <h3>Hébergement & Performance</h3>
            <p>
              Votre boutique fonctionne sur des serveurs performants qui garantissent 
              une disponibilité 24h/24 et des temps de chargement optimaux pour vos clients.
            </p>
            <ul className="benefit-list">
              <li>Serveurs dédiés haute performance</li>
              <li>Disponibilité 99,9% garantie</li>
              <li>Stockage illimité pour vos photos</li>
              <li>CDN pour chargement rapide</li>
            </ul>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">🤖</div>
            <h3>API & Automatisation</h3>
            <p>
              L'abonnement couvre les coûts des services API comme Telegram pour 
              automatiser vos notifications, commandes et communications avec les clients.
            </p>
            <ul className="benefit-list">
              <li>Notifications Telegram en temps réel</li>
              <li>Automatisation des commandes</li>
              <li>Alertes de stock et ventes</li>
              <li>Intégrations avec d'autres services</li>
            </ul>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">🔄</div>
            <h3>Maintenance & Mises à jour</h3>
            <p>
              Nous améliorons continuellement le système avec de nouvelles fonctionnalités, 
              corrections de bugs et mises à jour de sécurité.
            </p>
            <ul className="benefit-list">
              <li>Mises à jour mensuelles gratuites</li>
              <li>Support technique réactif</li>
              <li>Formations et tutoriels</li>
              <li>Adaptation aux nouvelles technologies</li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <h2 className="section-title">❓ Questions fréquentes</h2>
        
        <div className="faq-grid">
          <div className="faq-item">
            <h3>Pourquoi payer un abonnement mensuel ?</h3>
            <p>
              L'abonnement couvre les coûts récurrents de fonctionnement : 
              serveurs, sécurité, API, maintenance et support technique. 
              C'est un investissement dans la stabilité et la croissance de votre boutique.
            </p>
          </div>

          <div className="faq-item">
            <h3>Que se passe-t-il si je ne renouvelle pas ?</h3>
            <p>
              Votre accès est suspendu après expiration. Vos données sont conservées 
              sécurisées pendant 30 jours. Après renouvellement, tout est restauré automatiquement.
            </p>
          </div>

          <div className="faq-item">
            <h3>Comment sont sécurisées mes données ?</h3>
            <p>
              Nous utilisons un chiffrement militaire, des sauvegardes quotidiennes, 
              des pare-feux et une surveillance 24/7 pour protéger vos informations.
            </p>
          </div>

          <div className="faq-item">
            <h3>Puis-je changer de plan à tout moment ?</h3>
            <p>
              Oui ! Vous pouvez passer à un plan supérieur immédiatement. 
              Le changement vers un plan inférieur prend effet au prochain cycle.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="cta-section">
        <h2 className="cta-title">💳 Prêt à renouveler ou à vous abonner ?</h2>
        <p className="cta-subtitle">
          Contactez-nous directement pour un traitement rapide et sécurisé
        </p>
        
        <div className="cta-buttons">
          <button className="cta-btn primary" onClick={handleCallNow}>
            <span className="btn-icon">📞</span>
            Appeler maintenant
            <span className="btn-sub">693 800 251</span>
          </button>
          
          <button className="cta-btn secondary" onClick={handleWhatsApp}>
            <span className="btn-icon">💬</span>
            WhatsApp
            <span className="btn-sub">Message direct</span>
          </button>
          
          <button className="cta-btn outline">
            <span className="btn-icon">📧</span>
            Email
            <span className="btn-sub">yvanlandry4000@gmail.com</span>
          </button>
        </div>

        <div className="payment-info">
          <h3>🏦 Méthodes de paiement acceptées</h3>
          <div className="payment-methods">
            <span className="payment-method">💵 Espèces</span>
            <span className="payment-method">📱 Mobile Money</span>

            <span className="payment-method">💳 Transfert Orange Money</span>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="footer-note">
        <p>
          <strong>💡 Important :</strong> Votre abonnement est essentiel pour maintenir 
          la sécurité, la performance et les fonctionnalités avancées de votre boutique en ligne. 
          C'est un investissement direct dans la croissance et la protection de votre entreprise.
        </p>
      </div>
    </div>
  );
};

export default Finance;