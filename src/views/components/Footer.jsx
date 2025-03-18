import React, { useState, useRef } from 'react';
import '../../assets/styles/footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowRight, 
  faPhone, 
  faEnvelope, 
  faMapMarkerAlt, 
  faTimes, 
  faCheckCircle, 
  faExclamationCircle,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

function Footer() {
  const [showContactModal, setShowContactModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success', 'error', or 'info'
  const toastTimeoutRef = useRef(null);
  
  const openContactModal = (e) => {
    e.preventDefault();
    setShowContactModal(true);
  };
  
  const closeContactModal = () => {
    setShowContactModal(false);
  };
  
  const handleFeedbackChange = (e) => {
    setFeedbackText(e.target.value);
  };
  
  const showToastNotification = (message, type = 'success') => {
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
  
  const handleSubmitFeedback = () => {
    if (feedbackText.trim() === '') {
      showToastNotification('Por favor ingrese su comentario', 'error');
      return;
    }
    
    // Simulate sending feedback (not actually functional)
    console.log('Feedback submitted:', feedbackText);
    
    // Show success message
    showToastNotification('¡Gracias por su comentario!');
    
    // Clear input
    setFeedbackText('');
  };
  
  // Handle enter key press in feedback input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmitFeedback();
    }
  };

  // Handle About Us link click
  const handleAboutUsClick = (e) => {
    e.preventDefault();
    showToastNotification('Sección "Acerca de Nosotros" en desarrollo', 'info');
  };

  // Handle FAQ link click
  const handleFAQClick = (e) => {
    e.preventDefault();
    showToastNotification('Sección "Preguntas Frecuentes" en desarrollo', 'info');
  };

  return (
    <footer className="landing-footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="#" onClick={openContactModal}>Contact us</a>
          <a href="#" onClick={handleFAQClick}>FAQ</a>
          <a href="#" onClick={handleAboutUsClick}>About us</a>
        </div>

        <div className="footer-developed">
          <p className="developed-label">Developed by:</p>
          <div className="footer-developers">
            <div className="developer-column">
              <p>Andres Da Corte</p>
            </div>
            <div className="developer-column">
              <p>Santiago Del Castillo</p>
            </div>
          </div>
        </div>

        <div className="footer-feedback">
          <input 
            type="text" 
            placeholder="Feedback" 
            value={feedbackText}
            onChange={handleFeedbackChange}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="feedback-button"
            onClick={handleSubmitFeedback}
            aria-label="Send feedback"
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
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
                <FontAwesomeIcon icon={faPhone} className="contact-icon" />
                <div className="contact-text">
                  <h3>Telefono</h3>
                  <p>+58 212 555-1234</p>
                </div>
              </div>
              
              <div className="contact-item">
                <FontAwesomeIcon icon={faEnvelope} className="contact-icon" />
                <div className="contact-text">
                  <h3>Email</h3>
                  <p>contact@avilaGo.com.ve</p>
                </div>
              </div>
              
              <div className="contact-item">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="contact-icon" />
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
    </footer>
  );
}

export default Footer;