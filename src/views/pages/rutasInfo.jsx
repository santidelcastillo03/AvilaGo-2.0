import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faRuler, faHiking } from '@fortawesome/free-solid-svg-icons';
import '../../assets/styles/rutasInfo.css';

const TrailDetailComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mapLoaded, setMapLoaded] = useState(true);
  const [mapError, setMapError] = useState(null);
  
  const routeData = location.state || {
    // Default values if no state is received
    id: 1,
    title: "Ruta Desconocida",
    about: "Información no disponible.",
    difficulty: "N/A",
    distance: "N/A",
    map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125630.67149933334!2d-66.95195872656248!3d10.502731800000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c2a58adcd824807%3A0x93dd2eae0a998483!2sCaracas%2C%20Distrito%20Capital!5e0!3m2!1ses!2sve!4v1651234567890!5m2!1ses!2sve",
    imageSrc: ""
  };

  // Helper function for difficulty color class
  const getDifficultyColorClass = (difficulty) => {
    if (!difficulty) return "";
    
    const diff = difficulty.toLowerCase();
    if (diff === "fácil" || diff === "facil" || diff === "easy") return "easy";
    if (diff === "moderada" || diff === "medium" || diff === "media") return "moderate";
    if (diff === "difícil" || diff === "dificil" || diff === "hard") return "difficult";
    return "";
  };

  // Function to handle iframe load
  const handleIframeLoad = () => {
    setMapLoaded(true);
  };

  // Function to handle iframe error
  const handleIframeError = () => {
    setMapError("No se pudo cargar el mapa");
    setMapLoaded(true); // Hide loading indicator
  };

  // Helper function to ensure the map URL is properly formatted for embedding
  const getMapEmbedUrl = (mapUrl) => {
    if (!mapUrl) return null;

    try {
      // If it's already an embed URL, use it directly
      if (mapUrl.includes('maps/embed')) {
        return mapUrl;
      }

      // If it's a standard Google Maps URL, convert it to embed format
      if (mapUrl.includes('maps/place') || mapUrl.includes('maps?q=') || mapUrl.includes('goo.gl/maps')) {
        // Extract the important part from the URL (after the /maps/ part)
        let cleanUrl = mapUrl;
        
        // Handle shortened URLs (goo.gl/maps)
        if (mapUrl.includes('goo.gl/maps')) {
          return `https://maps.google.com/maps?q=${encodeURIComponent(mapUrl)}&output=embed`;
        }
        
        // Handle standard URLs
        const mapsIndex = mapUrl.indexOf('/maps/');
        if (mapsIndex !== -1) {
          cleanUrl = mapUrl.substring(mapsIndex);
        }
        
        // Create embed URL
        return `https://www.google.com/maps/embed${cleanUrl}`;
      }

      // If it appears to be just coordinates, create a marker map
      if (mapUrl.match(/^[-+]?\d+\.\d+,[-+]?\d+\.\d+$/)) {
        return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d${mapUrl.split(',')[1]}!3d${mapUrl.split(',')[0]}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2sus!4v1!5m2!1sen!2sus`;
      }

      // Default: just return the URL as is and hope it works
      return mapUrl;
    } catch (error) {
      console.error("Error processing map URL:", error);
      return null;
    }
  };

  // Get the map embed URL
  const mapEmbedUrl = getMapEmbedUrl(routeData.map);

  return (
    <div className="trail-detail-page">
      <Header />
      
      <div className="trail-detail-container">
        <h1 className="trail-title">{routeData.title}</h1>
        
        <div className="trail-images-container">
          {routeData.imageSrc && (
            <div className="trail-image-wrapper">
              <img 
                src={routeData.imageSrc} 
                alt={`Vista de ${routeData.title}`} 
                className="trail-image"
              />
            </div>
          )}
        </div>
        
        <div className="trail-info-section">
          <div className="trail-stats">
            <div className="stat-item">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faHiking} />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Dificultad</h3>
                <p className={`stat-value ${getDifficultyColorClass(routeData.difficulty)}`}>
                  {routeData.difficulty || 'No especificada'}
                </p>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faRuler} />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Distancia</h3>
                <p className="stat-value">{routeData.distance || 'No especificada'}</p>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Ubicación</h3>
                <p className="stat-value">Parque Nacional El Ávila</p>
              </div>
            </div>
          </div>
          
          <div className="content-section">
            <div className="description-section">
              <h3 className="section-title">Descripción</h3>
              <p>{routeData.about || 'No hay descripción disponible para esta ruta.'}</p>
            </div>
            
            <div className="map-section">
              <h3 className="section-title">Ubicación en el mapa</h3>
              <div className="map-container">
                {mapError ? (
                  <div className="map-error">
                    <p>Error al cargar el mapa</p>
                    <p>{mapError}</p>
                  </div>
                ) : (
                  <>
                    {!mapLoaded && <div className="map-loading">Cargando mapa...</div>}
                    {mapEmbedUrl ? (
                      <iframe 
                        title={`Mapa de ${routeData.title}`}
                        src={mapEmbedUrl}
                        className="map-iframe"
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        onLoad={handleIframeLoad}
                        onError={handleIframeError}
                      ></iframe>
                    ) : (
                      <div className="map-error">
                        <p>No hay mapa disponible para esta ruta</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="activities-button-container">
          <button 
            className="activities-button"
            onClick={() => navigate(`/activities/${routeData.id}`)}
          >
            Ver Actividades
          </button>
          <button 
            className="back-button"
            onClick={() => navigate('/routes')}
          >
            Volver a Rutas
          </button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TrailDetailComponent;