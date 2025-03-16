import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faRuler, faHiking } from '@fortawesome/free-solid-svg-icons';
import '../../assets/styles/rutasInfo.css';

const TrailDetailComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const mapRef = useRef(null);
  
  // Default coordinates for El Avila National Park
  const defaultCoordinates = { lat: 10.5347, lng: -66.8864 };
  
  const routeData = location.state || {
    // Default values if no state is received
    id: 1,
    title: "Ruta Desconocida",
    about: "Información no disponible.",
    difficulty: "N/A",
    distance: "N/A",
    coordinates: defaultCoordinates,
    imageSrc: ""
  };
  
  // Extract coordinates from routeData or use defaults
  const getCoordinates = () => {
    // If routeData has proper coordinates object
    if (routeData.coordinates && 
        typeof routeData.coordinates === 'object' &&
        'lat' in routeData.coordinates && 
        'lng' in routeData.coordinates) {
      return routeData.coordinates;
    }
    
    // If coordinates are stored as a string like "10.5347,-66.8864"
    if (typeof routeData.coordinates === 'string') {
      const parts = routeData.coordinates.split(',');
      if (parts.length === 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    }
    
    // If there's a map URL with coordinates in it, try to extract them
    if (routeData.map && typeof routeData.map === 'string') {
      // Look for patterns like @10.5347,-66.8864 in Google Maps URLs
      const match = routeData.map.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match && match.length === 3) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    }
    
    // Fall back to default coordinates
    return defaultCoordinates;
  };

  // Initialize map using direct iframe embedding without API key
  useEffect(() => {
    if (!mapRef.current) return;
    
    try {
      const coordinates = getCoordinates();
      console.log("Using coordinates for map:", coordinates);
      
      // Create an iframe with Google Maps embed URL
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.title = `Mapa de ${routeData.title}`;
      
      // Create Google Maps embed URL without API key
      const lat = coordinates.lat;
      const lng = coordinates.lng;
      
      // Use standard Google Maps URL that doesn't require API key
      iframe.src = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3923!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2sus!4v1!5m2!1sen!2sus`;
      
      // Add event listeners
      iframe.onload = () => {
        console.log("Map iframe loaded successfully");
        setMapLoaded(true);
      };
      
      iframe.onerror = (error) => {
        console.error("Error loading map iframe:", error);
        setMapError("Error al cargar el mapa. Por favor, inténtalo de nuevo.");
        
        // Try fallback approach with standard Google Maps URL
        tryFallbackMap(lat, lng);
      };
      
      // Clear existing content and append iframe
      while (mapRef.current.firstChild) {
        mapRef.current.removeChild(mapRef.current.firstChild);
      }
      
      mapRef.current.appendChild(iframe);
      
    } catch (error) {
      console.error("Error setting up map:", error);
      setMapError("Error al configurar el mapa: " + error.message);
      
      // Try fallback to direct Google Maps link
      const coordinates = getCoordinates();
      tryFallbackMap(coordinates.lat, coordinates.lng);
    }
  }, [routeData.title]);
  
  // Fallback approach if iframe loading fails
  const tryFallbackMap = (lat, lng) => {
    if (!mapRef.current) return;
    
    try {
      // Create a link to Google Maps instead
      const mapContainer = document.createElement('div');
      mapContainer.className = 'fallback-map-container';
      mapContainer.innerHTML = `
        <p>El mapa interactivo no pudo cargarse.</p>
        <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" rel="noopener noreferrer" class="view-on-maps-button">
          Ver ubicación en Google Maps
        </a>
        <div class="coordinates-display">
          <p>Coordenadas: ${lat}, ${lng}</p>
        </div>
      `;
      
      // Clear existing content and append fallback
      while (mapRef.current.firstChild) {
        mapRef.current.removeChild(mapRef.current.firstChild);
      }
      
      mapRef.current.appendChild(mapContainer);
      setMapLoaded(true);
      setMapError(null);
      
    } catch (error) {
      console.error("Error setting up fallback map:", error);
      setMapError("No se pudo mostrar la ubicación en el mapa.");
    }
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
                {!mapLoaded && <div className="map-loading">Cargando mapa...</div>}
                {mapError && (
                  <div className="map-error">
                    <p>Error al cargar el mapa</p>
                    <p>{mapError}</p>
                  </div>
                )}
                <div 
                  ref={mapRef}
                  className="google-map"
                ></div>
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