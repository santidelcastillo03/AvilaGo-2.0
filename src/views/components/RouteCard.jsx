import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../assets/styles/routeCard.css';

const RouteCard = ({ id, title, imageSrc }) => {
  const navigate = useNavigate();
  
  // Function to handle button click
  const handleViewRoute = () => {
    console.log("Navigating to route:", id); // Debug logging
    navigate(`/routes/${id}`);
  };

  return (
    <div className="route-card">
      <div className="route-image-container">
        <img src={imageSrc} alt={title} className="route-image" />
      </div>
      <div className="route-info">
        <h3>{title}</h3>
        <div className="route-button-container">
          {/* Use both Link and an onClick button for redundancy */}
          <button 
            className="route-info-button"
            onClick={handleViewRoute}
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