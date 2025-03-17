import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  
  // Check user authentication and role
  useEffect(() => {
    const auth = getAuth();
    const checkUserRole = async () => {
      if (auth.currentUser) {
        setCurrentUser(auth.currentUser);
        
        // Get user role from Firestore
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
  
  // Simulated loading for smoother transition
  useEffect(() => {
    if (location.state) {
      // Short timeout to show smooth transition even if data is available immediately
      const timer = setTimeout(() => {
        setActivityData(location.state);
        setLoading(false);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [location.state]);
  
  // Improved star rating display function
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const totalStars = 5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FontAwesomeIcon 
          key={`star-${i}`} 
          icon={faStar} 
          className="star-filled" 
        />
      );
    }
    
    // Add half star if needed - fixed implementation
    if (hasHalfStar) {
      stars.push(
        <span key="half-star" className="star-half-container">
          <FontAwesomeIcon icon={faStar} className="star-outline" />
          <FontAwesomeIcon icon={faStar} className="star-half" />
        </span>
      );
    }
    
    // Add empty stars to make 5 total
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
  
  // Handle return to activities list
  const handleBack = () => {
    navigate(-1); // Retrocede a la página anterior
  };

  // Get activity icon based on type
  const getActivityTypeIcon = (type) => {
    // You can expand this with more icons for different activity types
    return faHiking; // Default icon
  };
  
  // Handle reservation button click
  const handleReservation = () => {
    if (!currentUser) {
      // Redirect to login if not logged in
      navigate('/login', { 
        state: { 
          from: location.pathname,
          message: 'Inicia sesión para reservar esta actividad'
        } 
      });
      return;
    }
    
    if (userRole !== 'estudiante') {
      // If user is not a student, show an alert
      alert('Solo los estudiantes pueden reservar actividades');
      return;
    }
    
    // Navigate to payment page with activity data
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
                          {renderStars(activityData.rating)}
                          <span className="rating-value">{activityData.rating.toFixed(1)}</span>
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