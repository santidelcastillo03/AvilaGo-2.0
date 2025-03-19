import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faRuler, faHiking, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import '../../assets/styles/rutasInfo.css';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const TrailDetailComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { routeId } = useParams(); // Get routeId from URL parameters
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  
  // Default coordinates for El Avila National Park
  const defaultCoordinates = { lat: 10.5347, lng: -66.8864 };
  
  // Function to get difficulty class for styling (missing from your code)
  const getDifficultyColorClass = (difficulty) => {
    if (!difficulty) return '';
    
    const lowerDifficulty = difficulty.toLowerCase();
    if (lowerDifficulty.includes('fácil') || lowerDifficulty.includes('facil') || lowerDifficulty === 'easy' || lowerDifficulty === 'baja') {
      return 'difficulty-easy';
    } else if (lowerDifficulty.includes('moderada') || lowerDifficulty.includes('intermedia') || lowerDifficulty === 'medium' || lowerDifficulty === 'media') {
      return 'difficulty-medium';
    } else if (lowerDifficulty.includes('difícil') || lowerDifficulty.includes('dificil') || lowerDifficulty === 'hard' || lowerDifficulty === 'alta') {
      return 'difficulty-hard';
    } else {
      return '';
    }
  };
  
  // Fallback map function (missing from your code)
  const tryFallbackMap = (lat, lng) => {
    try {
      // Create a link to Google Maps as fallback
      const fallbackLink = document.createElement('a');
      fallbackLink.href = `https://www.google.com/maps?q=${lat},${lng}`;
      fallbackLink.target = '_blank';
      fallbackLink.rel = 'noopener noreferrer';
      fallbackLink.className = 'fallback-map-link';
      fallbackLink.innerHTML = `
        <div class="fallback-map-content">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <p>No se pudo cargar el mapa embebido.</p>
          <span>Haz clic para ver en Google Maps</span>
        </div>
      `;
      
      // Clear existing content and append fallback link
      while (mapRef.current.firstChild) {
        mapRef.current.removeChild(mapRef.current.firstChild);
      }
      
      mapRef.current.appendChild(fallbackLink);
    } catch (fallbackError) {
      console.error("Fallback map also failed:", fallbackError);
    }
  };
  
  // Fetch route data if needed
  useEffect(() => {
    const fetchRouteData = async () => {
      try {
        // If data is in location state, use it
        if (location.state && typeof location.state === 'object') {
          console.log("Using route data from location state:", location.state);
          setRouteData(location.state);
          setLoading(false);
          return;
        }
        
        // If no state data but we have an ID, fetch from Firestore
        if (routeId) {
          console.log("Fetching route data for ID:", routeId);
          const db = getFirestore();
          const routeRef = doc(db, "routes", routeId);
          const routeSnapshot = await getDoc(routeRef);
          
          if (routeSnapshot.exists()) {
            const data = {
              id: routeId,
              ...routeSnapshot.data()
            };
            console.log("Route data fetched successfully:", data);
            setRouteData(data);
          } else {
            console.error("No route found with ID:", routeId);
            setRouteData({
              id: routeId || 1,
              title: "Ruta Desconocida",
              about: "Información no disponible.",
              difficulty: "N/A",
              distance: "N/A",
              coordinates: defaultCoordinates,
              imageSrc: ""
            });
          }
        } else {
          // No state and no ID
          console.error("No route ID provided and no location state");
          setRouteData({
            id: 1,
            title: "Ruta Desconocida",
            about: "Información no disponible.",
            difficulty: "N/A",
            distance: "N/A",
            coordinates: defaultCoordinates,
            imageSrc: ""
          });
        }
      } catch (error) {
        console.error("Error in fetchRouteData:", error);
        setRouteData({
          id: routeId || 1,
          title: "Ruta Desconocida",
          about: "Error al cargar la información de la ruta.",
          difficulty: "N/A",
          distance: "N/A",
          coordinates: defaultCoordinates,
          imageSrc: ""
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchRouteData();
  }, [location.state, routeId]);
  
  // Extract coordinates from routeData or use defaults
  const getCoordinates = () => {
    if (!routeData) return defaultCoordinates;
    
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
    if (!mapRef.current || !routeData) return;
    
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
  }, [routeData]);
  
  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="trail-detail-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando información de la ruta...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Safety check to prevent rendering with null data
  if (!routeData) {
    return (
      <div className="trail-detail-page">
        <Header />
        <div className="error-container">
          <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
          <h2>Error de carga</h2>
          <p>No se pudo cargar la información de la ruta.</p>
          <button onClick={() => navigate('/routes')} className="back-button">
            Volver a Rutas
          </button>
        </div>
        <Footer />
      </div>
    );
  }

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