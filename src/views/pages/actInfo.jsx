import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, 
  faUser, 
  faUsers, 
  faCoins, 
  faClipboardList, 
  faChevronLeft,
  faStar,
  faHiking
} from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import '../../assets/styles/actInfo.css';

const ActivityInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activityId } = useParams(); 
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  
  useEffect(() => {
    const auth = getAuth();
    const checkUserRole = async () => {
      if (auth.currentUser) {
        setCurrentUser(auth.currentUser);
        
        try {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        } catch (err) {
          console.error('Error getting user role:', err);
        }
      }
    };
    
    checkUserRole();
  }, []);
  
 
useEffect(() => {
  const fetchActivityData = async () => {
    setLoading(true);
    
    try {
      if (location.state && location.state.title) {
        console.log("Using activity data from location state:", location.state);
        setActivityData(location.state);
      } 
      else if (activityId) {
        console.log("Fetching activity data for ID:", activityId);
        const db = getFirestore();
        const activityRef = doc(db, "activities", activityId);
        const activitySnapshot = await getDoc(activityRef);
        
        if (activitySnapshot.exists()) {
          const data = {
            id: activitySnapshot.id,
            ...activitySnapshot.data()
          };
          
          console.log("Activity data loaded from Firestore:", data);
          
          
if (data.guideId && (!data.guideName || !data.guideImage)) {
  try {
    console.log("Fetching guide info for ID:", data.guideId);
    const guideRef = doc(db, "users", data.guideId);
    const guideSnapshot = await getDoc(guideRef);
    
    if (guideSnapshot.exists()) {
      const guideData = guideSnapshot.data();
      data.guideName = guideData.name || guideData.displayName || "Guía";
      data.guideImage = guideData.profilePic || "";
      console.log("Added guide data:", { guideName: data.guideName });
    } else {
      console.log("Guide not found, using default values");
      data.guideName = "Guía (no encontrado)";
    }
  } catch (guideErr) {
    console.error("Error fetching guide data:", guideErr);
    data.guideName = "Guía";  
  }
}
          
          setActivityData(data);
        } else {
          console.error("No activity found with ID:", activityId);
          setError("No se encontró la actividad especificada");
        }
      } else {
        setError("No se especificó una actividad");
      }
    } catch (err) {
      console.error("Error fetching activity data:", err);
      setError(`Error al cargar la información: ${err.message}`);
    } finally {
      // Short delay to ensure smooth transition
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };
  
  fetchActivityData();
}, [location.state, activityId]);
  
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const totalStars = 5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FontAwesomeIcon 
          key={`star-${i}`} 
          icon={faStar} 
          className="star-filled" 
        />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <span key="half-star" className="star-half-container">
          <FontAwesomeIcon icon={faStar} className="star-outline" />
          <FontAwesomeIcon icon={faStar} className="star-half" />
        </span>
      );
    }
    
    const emptyStarsCount = totalStars - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStarsCount; i++) {
      stars.push(
        <FontAwesomeIcon 
          key={`empty-star-${i}`} 
          icon={faStar} 
          className="star-outline" 
        />
      );
    }
    
    return stars;
  };
  
  const handleBack = () => {
    navigate(-1); 
  };

  const getActivityTypeIcon = (type) => {
    return faHiking; // Default icon
  };
  
  const handleReservation = () => {
    if (!currentUser) {
      navigate('/login', { 
        state: { 
          from: location.pathname,
          message: 'Inicia sesión para reservar esta actividad'
        } 
      });
      return;
    }
    
    if (userRole !== 'estudiante') {
      alert('Solo los estudiantes pueden reservar actividades');
      return;
    }
    
    navigate('/payment', { state: activityData });
  };

  return (
    <div className="activity-info-page">
      <Header />
      
      <div className="activity-hero">
        <div className="activity-hero-overlay"></div>
        <div className="activity-hero-content">
          <div className="container">
            <button className="back-button" onClick={handleBack}>
              <FontAwesomeIcon icon={faChevronLeft} />
              <span>Volver a actividades</span>
            </button>
            <h1 className="activity-hero-title">
              {loading ? 'Cargando actividad...' : activityData?.title || 'Detalle de Actividad'}
            </h1>
          </div>
        </div>
      </div>
      
      <div className="activity-info-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando información...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-icon">!</div>
            <h2>Información no disponible</h2>
            <p>{error}</p>
            <button 
              onClick={() => navigate('/routes')}
              className="return-button"
            >
              Explorar rutas disponibles
            </button>
          </div>
        ) : !activityData ? (
          <div className="error-container">
            <div className="error-icon">!</div>
            <h2>Información no disponible</h2>
            <p>No se encontró información para esta actividad.</p>
            <button 
              onClick={() => navigate('/routes')}
              className="return-button"
            >
              Explorar rutas disponibles
            </button>
          </div>
        ) : (
          <>
            <div className="activity-content">
              <div className="activity-main-info">
                <div className="activity-image-container">
                  <div className="activity-type-badge">
                    <FontAwesomeIcon icon={getActivityTypeIcon(activityData.type)} />
                    <span>{activityData.type || 'Actividad'}</span>
                  </div>
                  <img 
                    src={activityData.imageSrc} 
                    alt={activityData.title} 
                    className="activity-image"
                  />
                </div>
                
                <div className="activity-description-container">
                  <h2>Sobre esta actividad</h2>
                  <div className="activity-divider"></div>
                  <p className="activity-description">{activityData.description || 'No hay descripción disponible para esta actividad.'}</p>
                  
                  <div className="activity-meta">
                    <div className="activity-guide-rating">
                      <div className="guide-info">
                        <FontAwesomeIcon icon={faUser} className="meta-icon guide-icon" />
                        <div className="guide-details">
                          <span className="meta-label">Guía</span>
                          <span className="guide-name">{activityData.guideName}</span>
                        </div>
                      </div>
                      
                      <div className="rating-display">
                        <span className="meta-label">Calificación</span>
                        <div className="stars-container">
                          {renderStars(activityData.rating || 0)}
                          <span className="rating-value">{(activityData.rating || 0).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="activity-details-section">
                <h2 className="details-title">Detalles de la Actividad</h2>
                <div className="activity-divider centered"></div>
                
                <div className="activity-details-grid">
                  <div className="detail-card">
                    <FontAwesomeIcon icon={faClock} className="detail-icon" />
                    <div className="detail-content">
                      <h3>Duración</h3>
                      <p>{activityData.duration}</p>
                    </div>
                  </div>
                  
                  <div className="detail-card">
                    <FontAwesomeIcon icon={faUsers} className="detail-icon" />
                    <div className="detail-content">
                      <h3>Capacidad</h3>
                      <p>{activityData.capacity}</p>
                    </div>
                  </div>
                  
                  <div className="detail-card">
                    <FontAwesomeIcon icon={faCoins} className="detail-icon" />
                    <div className="detail-content">
                      <h3>Precio</h3>
                      <p className="price-tag">{typeof activityData.price === 'number' 
                        ? `$${activityData.price.toFixed(2)}` 
                        : activityData.price || 'Gratuito'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="activity-requirements-section">
                <div className="section-header">
                  <FontAwesomeIcon icon={faClipboardList} className="section-icon" />
                  <h2>Requisitos</h2>
                </div>
                <div className="activity-divider"></div>
                <div className="requirements-content">
                  <p>{activityData.requirements || 'No hay requisitos específicos para esta actividad.'}</p>
                </div>
              </div>
              
              <div className="activity-actions">
                <button 
                  className="reserve-button"
                  onClick={handleReservation}
                  title={userRole !== 'estudiante' ? 'Solo estudiantes pueden reservar' : 'Reservar esta actividad'}
                >
                  Reservar esta actividad
                  <FontAwesomeIcon icon={faChevronLeft} rotation={180} className="button-icon" />
                </button>
                {userRole && userRole !== 'estudiante' && (
                  <p className="reservation-note">* Solo los estudiantes pueden realizar reservas</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default ActivityInfo;