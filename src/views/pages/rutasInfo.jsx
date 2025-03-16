import React, { useEffect } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../../assets/styles/rutasInfo.css';

const TrailDetailComponent = ({ 
  trailData = {
    id: 1,
    name: "Sabas Nieves",
    difficulty: "Moderada",
    distance: "3,9 km",
    roundTrip: true,
    location: "Municipio Sucre, Miranda",
    duration: "1 hora y 55 minutos",
    description: "Te presentamos esta travesía de ida y vuelta de 3,9 km ubicada en el Municipio Sucre, Miranda. Clasificada como moderada, suele completarse en aproximadamente 1 hora y 55 minutos. Es una zona muy frecuentada para senderismo y caminatas, donde es común cruzarse con otros excursionistas durante el recorrido. La temporada ideal para recorrerla se extiende desde noviembre hasta agosto, evitando así los meses de mayor pluviosidad. Su combinación de accesibilidad y atractivo natural la convierte en una opción popular para disfrutar de la naturaleza cerca de áreas urbanas.",
    images: {
      primary: "../../assets/images/sabas-nieves.png",
      secondary: "../../assets/images/sabas-nieves.png",
    },
    coordinates: { lat: 10.5164, lng: -66.8455 }
  }
}) => {
  
  useEffect(() => {
    // Initialize Google Maps when component mounts
    if (window.google && window.google.maps) {
      initMap();
    } else {
      // If Google Maps API isn't loaded yet, you could add a script tag here
      console.log("Google Maps API not loaded");
    }
  }, [trailData.coordinates]);
  
  // Function to initialize Google Maps
  const initMap = () => {
    const map = new window.google.maps.Map(document.getElementById("google-map"), {
      center: trailData.coordinates,
      zoom: 14,
      mapTypeId: window.google.maps.MapTypeId.TERRAIN,
    });
    
    const marker = new window.google.maps.Marker({
      position: trailData.coordinates,
      map: map,
      title: trailData.name + " Trailhead",
    });
    
    // Additional trail path can be added here if coordinates are available
  };
  
  // Helper function to determine difficulty color class
  const getDifficultyColorClass = (difficulty) => {
    const difficultyLower = difficulty.toLowerCase();
    if (difficultyLower === "fácil") return "easy";
    if (difficultyLower === "moderada") return "moderate";
    if (difficultyLower === "difícil") return "difficult";
    return "";
  };

  return (
    <div className="trail-detail-page">
      <Header />
      
      <div className="trail-detail-container">
        <h1 className="trail-title">{trailData.name}</h1>
        
        <div className="trail-images-container">
          <div className="trail-images">
            <img 
              src={trailData.images.primary} 
              alt={`Vista principal de ${trailData.name}`} 
              className="trail-image left-image"
            />
            <img 
              src={trailData.images.secondary} 
              alt={`Camino en ${trailData.name}`} 
              className="trail-image right-image"
            />
          </div>
        </div>
        
        <div className="trail-info-section">
          <div className="trail-stats">
            <div className="stat-item">
              <h3 className="stat-title">Dificultad</h3>
              <p className={`stat-value ${getDifficultyColorClass(trailData.difficulty)}`}>
                {trailData.difficulty}
              </p>
            </div>
            
            <div className="stat-item">
              <h3 className="stat-title">Distancia</h3>
              <p className="stat-value">{trailData.distance}</p>
            </div>
            
            <div className="stat-item">
              <h3 className="stat-title">Ida y vuelta</h3>
              <div className="direction-arrows">
                <div className="arrow-left">←</div>
                {trailData.roundTrip && <div className="arrow-right">→</div>}
              </div>
            </div>
            
            <div className="stat-item">
              <h3 className="stat-title">Requerimientos</h3>
              <ul className="requirements-list">
                <li>Zapatos de montaña</li>
                <li>Agua (2L mínimo)</li>
                <li>Protector solar</li>
              </ul>
            </div>
          </div>
          
          <div className="trail-description-section">
            <div className="map-container">
              <div id="google-map" className="google-map">
                {/* Google Maps will be initialized here */}
              </div>
            </div>
            
            <div className="trail-description">
              <p>{trailData.description}</p>
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