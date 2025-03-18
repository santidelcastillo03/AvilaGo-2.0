import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import defaultProfileImg from '../../assets/images/default-profile.jpg';
import '../../assets/styles/header.css';
import { useAuth } from '../../context/AuthContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faExclamationCircle,
  faInfoCircle,
  faTimes,
  faPhone,
  faEnvelope,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';

function Header() {
  const { currentUser, logout } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [profilePic, setProfilePic] = useState(defaultProfileImg);
  const [showContactModal, setShowContactModal] = useState(false);
  
  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info'); // 'success', 'error', or 'info'
  const toastTimeoutRef = useRef(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role);
            
            // If user has a profile picture, use it
            if (userData.profilePic) {
              setProfilePic(userData.profilePic);
            }
          } else {
            setUserRole(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
        setProfilePic(defaultProfileImg);
      }
    };
    
    fetchUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      showToastNotification('Sesión cerrada exitosamente', 'success');
    } catch (error) {
      console.error('Failed to log out', error);
      showToastNotification('No se pudo cerrar sesión', 'error');
    }
  };
  
  // Toast notification function
  const showToastNotification = (message, type = 'info') => {
    // Clear any existing timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    
    // Set toast message and show it
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    
    // Hide toast after 3 seconds
    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };
  
  const handleContactClick = (e) => {
    e.preventDefault();
    setShowContactModal(true);
  };
  
  const handleAboutUsClick = (e) => {
    e.preventDefault();
    showToastNotification('Sección "Acerca de Nosotros" en desarrollo', 'info');
  };
  
  const handleFAQClick = (e) => {
    e.preventDefault();
    showToastNotification('Sección "Preguntas Frecuentes" en desarrollo', 'info');
  };
  
  const closeContactModal = () => {
    setShowContactModal(false);
  };

  return (
    <header className="landing-header">
      <div className="landing-header-logo">
        <Link to="/">
          <img src={logo} alt="UNIMET AvilaGo Logo" />
        </Link>
      </div>
      <nav className="landing-nav">
        <ul>
          <li><Link to="/routes">Rutas</Link></li>
          <li><Link to="/forum">Foro</Link></li>
          <li><Link to="/gallery">Galería</Link></li>
          
          {currentUser && userRole === 'estudiante' && (
            <li><Link to="/reservations">Reservas</Link></li>
          )}
          
          {currentUser && userRole === 'guia' && (
            <li><Link to="/activitydashboard">Mis Actividades</Link></li>
          )}
          
          {currentUser && userRole === 'admin' && (
            <li><Link to="/admin">Admin Dashboard</Link></li>
          )}
        </ul>
      </nav>
      <div className="landing-nav-right">
        <a href="#" onClick={handleContactClick}>Contact us</a>
        <a href="#" onClick={handleAboutUsClick}>About us</a>
        <a href="#" onClick={handleFAQClick}>FAQ</a>
        
        <div className="auth-buttons">
          {currentUser ? (
            <>
              <Link to="/profile" className="profile-link">
                <img 
                  src={profilePic} 
                  alt="Profile" 
                  className="profile-pic" 
                />
              </Link>
              <button onClick={handleLogout} className="auth-btn logout-btn">
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="auth-btn login-btn">
                Iniciar sesión
              </Link>
              <Link to="/register" className="auth-btn register-btn">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
      
      {/* Contact Modal */}
      {showContactModal && (
        <div className="modal-overlay" onClick={closeContactModal}>
          <div className="contact-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeContactModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <h2 className="modal-title">Contact Us</h2>
            
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">
                  <FontAwesomeIcon icon={faPhone} />
                </div>
                <div className="contact-text">
                  <h3>Telefono</h3>
                  <p>+58 212 555-1234</p>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <div className="contact-text">
                  <h3>Email</h3>
                  <p>contact@avilaGo.com.ve</p>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                </div>
                <div className="contact-text">
                  <h3>Ubicacion</h3>
                  <p>Univesidad Metropolitana</p>
                </div>
              </div>
            </div>
            
            <div className="contact-map">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125530.81098395086!2d-66.91600574179687!3d10.542914199999994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c2a57e0c309988b%3A0xcfbf3f9619f9cb68!2sEl%20%C3%81vila%20National%20Park!5e0!3m2!1sen!2sus!4v1711386621243!5m2!1sen!2sus" 
                width="100%" 
                height="300" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Avila National Park Location"
              ></iframe>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notification */}
      {showToast && (
        <div className={`toast-notification ${
          toastType === 'success' ? 'toast-success' : 
          toastType === 'error' ? 'toast-error' : 
          'toast-info'}`}
        >
          <div className="toast-icon">
            <FontAwesomeIcon icon={
              toastType === 'success' ? faCheckCircle : 
              toastType === 'error' ? faExclamationCircle : 
              faInfoCircle
            } />
          </div>
          <div className="toast-message">
            {toastMessage}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;