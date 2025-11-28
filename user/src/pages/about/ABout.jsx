import React from "react";
import "./about.css";

const About = () => {
  return (
    <div className="about-container">
      <h1>À propos de moi</h1>
      <p>
        Je suis <strong>Yvan Opara</strong>, ingénieur logiciel passionné et entrepreneur dans le domaine de l’import-export. 
        Depuis plusieurs années, je développe mon expertise dans deux secteurs complémentaires : la conception de solutions logicielles innovantes 
        et le commerce international avec des partenaires en Chine, aux États-Unis, en Turquie et au Nigéria.
      </p>
      <p>
        Après mes études secondaires au Collège Bilingue Orchidée à Douala, couronnées par l’obtention de mon GCE Advanced Level en Sciences, 
        j’ai poursuivi mes études supérieures à l’Université de Buea (College of Technology) où j’ai validé un BTS en ingénierie logicielle. 
        J’ai ensuite consolidé mon parcours académique en obtenant en 2024 un Bachelor Degree en Software Engineering à Landmark Metropolitan University.
      </p>

      <h2>À propos du projet de gestion d’inventaire</h2>
      <p>
        Depuis août 2025, j’ai entrepris le développement d’un <strong>système complet de gestion d’inventaire et de ventes</strong>, 
        conçu pour répondre aux besoins des entreprises qui souhaitent optimiser le suivi de leurs produits et transactions commerciales. 
        Ce projet a été conçu et développé sur une période de <strong>4 mois</strong>, de <strong>août à novembre</strong>, et combine à la fois 
        des technologies modernes et une approche centrée sur l’utilisateur.
      </p>
      <ul>
        <li>Gestion des produits avec différentes tailles et prix par taille, offrant une flexibilité comparable aux plateformes d’import-export.</li>
        <li>Enregistrement, modification et annulation des ventes, ainsi que la <strong>réservation de produits</strong> pour des clients spécifiques.</li>
        <li>Génération de <strong>rapports détaillés</strong> sur les ventes quotidiennes, hebdomadaires, mensuelles et annuelles, avec des graphiques interactifs.</li>
        <li>Sécurisation des données grâce à un back-end robuste utilisant <strong>Node.js/Express</strong> et <strong>MongoDB</strong>, 
        et stockage fiable des images sur <strong>Cloudinary</strong>.</li>
      </ul>
      <p>
        L’objectif principal de ce projet est de fournir aux entreprises un outil pratique, intuitif et performant, permettant de :
      </p>
      <ul>
        <li>Optimiser la gestion des stocks et réduire les pertes liées à une mauvaise organisation.</li>
        <li>Améliorer la prise de décision grâce à des statistiques claires et exploitables.</li>
        <li>Gagner du temps et de l’efficacité, en centralisant toutes les opérations de vente et de suivi des produits dans une seule application.</li>
      </ul>
      <p>
        Ce projet illustre également ma capacité à <strong>concevoir, développer et livrer une solution complète</strong> en autonomie, 
        en combinant mon expertise technique avec ma vision entrepreneuriale pour créer des outils utiles dans le monde réel du commerce et de la logistique.
      </p>
    </div>
  );
};

export default About;
