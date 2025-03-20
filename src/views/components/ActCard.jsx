import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faUser, faCalendarAlt, faClock } from '@fortawesome/free-solid-svg-icons';
import '../../assets/styles/actCard.css';

const ActCard = ({ 
  title, 
  imageSrc, 
  guideName,
  rating = 0,
  date = 'Fechas flexibles', 
  onClick 
}) => {
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
          <FontAwesomeIcon icon={faStar} className="star-filled half" />
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

  const hasTimeInfo = date && date.includes(' a las ');

  return (
    <div className="act-card">
      <div className="act-card-img-container">
        <img 
          src={imageSrc || 'https://via.placeholder.com/300x200?text=No+Image'} 
          alt={title} 
          className="act-card-img"
        />
      </div>
      <div className="act-card-content">
        <h3 className="act-card-title">{title}</h3>
        
        <div className="act-card-schedule">
          <div className="act-card-date-row">
            <FontAwesomeIcon icon={faCalendarAlt} className="schedule-icon" />
            {hasTimeInfo ? (
              <div className="date-time-info">
                <span className="date-part">{date.split(' a las ')[0]}</span>
                <div className="time-part">
                  <FontAwesomeIcon icon={faClock} className="schedule-icon time-icon" />
                  <span>{date.split(' a las ')[1]}</span>
                </div>
              </div>
            ) : (
              <span>{date}</span>
            )}
          </div>
        </div>
        
        <div className="act-card-info">
          <div className="act-card-guide">
            <FontAwesomeIcon icon={faUser} className="guide-icon" />
            <span>{guideName || 'Guía no asignado'}</span>
          </div>
          
          <div className="act-card-rating">
            <div className="stars-container">
              {renderStars(rating)}
            </div>
            <span className="rating-number">{rating.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="act-card-button-container">
          <button 
            className="act-card-btn"
            onClick={onClick}
          >
            Ver detalles de la actividad
            <span className="arrow-icon">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActCard;