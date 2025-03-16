import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/routeCard.css';

const RouteCard = ({ id, title, imageSrc, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      // Si se recibió una función onClick, se ejecuta
      onClick();
    } else {
      // Comportamiento por defecto (si no se pasó onClick)
      console.log("Navigating to route:", id);
      navigate(`/routes/${id}`);
    }
  };

  return (
    <div className="route-card">
      <div className="route-image-container">
        <img src={imageSrc} alt={title} className="route-image" />
      </div>
      <div className="route-info">
        <h3>{title}</h3>
        <div className="route-button-container">
          <button 
            className="route-info-button"
            onClick={handleClick}
          >
            Ver información y actividades
            <span className="arrow-icon">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteCard;