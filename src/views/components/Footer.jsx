import React from 'react';
import '../../assets/styles/footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

function Footer() {
  return (
    <footer className="landing-footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="#">Contact us</a>
          <a href="#">FAQ</a>
          <a href="#">About us</a>
        </div>

        <div className="footer-developed">
          <p className="developed-label">Developed by:</p>
          <div className="footer-developers">
            <div className="developer-column">
              <p>Andres Da Corte</p>
              <p>Massimo Restuccia</p>
            </div>
            <div className="developer-column">
              <p>Santiago Del Castillo</p>
            </div>
          </div>
        </div>

        <div className="footer-feedback">
          <input type="text" placeholder="Feedback" />
          <button className="feedback-button">
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;