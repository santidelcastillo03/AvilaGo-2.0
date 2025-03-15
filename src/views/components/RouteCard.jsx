import React from 'react';
import '../../assets/styles/routeCard.css';

const RouteCard = ({ title, imageSrc }) => {
  return (
    <div className="route-card">
      <div className="route-image-container">
        <img src={imageSrc} alt={title} className="route-image" />
      </div>
      <div className="route-info">
        <h3>{title}</h3>
        <div className="route-button-container">
          <button className="route-info-button">
            Ver informacion y actividades
            <span className="arrow-icon">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteCard;