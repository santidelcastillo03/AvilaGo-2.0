import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../../assets/styles/rutasInfo.css';

const TrailDetailComponent = () => {
  const location = useLocation();
  const routeData = location.state || {
    // Valores por defecto en caso de no recibir state
    id: 1,
    title: "Ruta Desconocida",
    about: "Información no disponible.",
    difficulty: "N/A",
    distance: "N/A",
    map: { lat: 0, lng: 0 },
    imageSrc: ""
  };

  useEffect(() => {
    // Initialize Google Maps when component mounts
    if (window.google && window.google.maps && routeData.map) {
      initMap();
    } else {
      console.log("Google Maps API not loaded or no map data");
    }
  }, [routeData.map]);

  // Function to initialize Google Maps using field "map"
  const initMap = () => {
    const mapElement = document.getElementById("google-map");
    if (!mapElement) return;
    const map = new window.google.maps.Map(mapElement, {
      center: routeData.map,
      zoom: 14,
      mapTypeId: window.google.maps.MapTypeId.TERRAIN,
    });
    
    new window.google.maps.Marker({
      position: routeData.map,
      map: map,
      title: `${routeData.title} Punto de inicio`,
    });
  };
  
  // Helper function for difficulty color class
  const getDifficultyColorClass = (difficulty) => {
    const diff = difficulty.toLowerCase();
    if (diff === "fácil") return "easy";
    if (diff === "moderada") return "moderate";
    if (diff === "difícil") return "difficult";
    return "";
  };

  return (
    <div className="trail-detail-page">
      <Header />
      
      <div className="trail-detail-container">
        <h1 className="trail-title">{routeData.title}</h1>
        
        <div className="trail-images-container">
          {/* Si se requiere, se puede mostrar una imagen relacionada */}
          {routeData.imageSrc && (
            <img 
              src={routeData.imageSrc} 
              alt={`Vista de ${routeData.title}`} 
              className="trail-image"
            />
          )}
        </div>
        
        <div className="trail-info-section">
          <div className="trail-stats">
            <div className="stat-item">
              <h3 className="stat-title">Dificultad</h3>
              <p className={`stat-value ${getDifficultyColorClass(routeData.difficulty)}`}>
                {routeData.difficulty}
              </p>
            </div>
            
            <div className="stat-item">
              <h3 className="stat-title">Distancia</h3>
              <p className="stat-value">{routeData.distance}</p>
            </div>
          </div>
          
          <div className="trail-description-section">
            <div className="map-container">
              <div id="google-map" className="google-map">
                {/* Google Maps será inicializado aquí */}
              </div>
            </div>
            
            <div className="trail-description">
              <p>{routeData.about}</p>
            </div>
          </div>
        </div>
        
        <div className="activities-button-container">
          <button className="activities-button">Ver Actividades</button>
        </div>
      </div>
      
      <div className="mountain-footer"></div>
      
      <Footer />
    </div>
  );
};

export default TrailDetailComponent;