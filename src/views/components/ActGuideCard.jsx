import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faUser, faCalendarAlt, faClock } from '@fortawesome/free-solid-svg-icons';
import '../../assets/styles/actGuideCard.css';

const ActGuideCard = ({ 
  title, 
  imageSrc, 
  guideName,
  rating = 0,
  date = 'Fechas flexibles', // Puede incluir " a las " para tiempo
  capacity = '',
  description = '',
  duration = '',
  price = '',
  requirements = '',
  type = '',
  onClick, 
  onEditActivity
}) => {
  // Estado para mostrar/ocultar el modal
  const [showEditModal, setShowEditModal] = useState(false);

  // Estado para los datos del formulario de edición
  const [editData, setEditData] = useState({
    title: '',
    date: '',
    rating: 0,
    capacity: '',
    description: '',
    duration: '',
    price: '',
    requirements: '',
    type: ''
  });

  // Función que valida si los datos actuales (provenientes de las props) coinciden con editData.
  // Si detecta diferencia, actualiza editData.
  const handleOpenModal = () => {
    const dataFromProps = {
      title,
      date,
      rating,
      capacity,
      description,
      duration,
      price,
      requirements,
      type
    };

    let needToUpdate = false;
    for (const key in dataFromProps) {
      if (dataFromProps[key] !== editData[key]) {
        needToUpdate = true;
        break;
      }
    }
    
    if (needToUpdate) {
      console.log("Actualizando datos del modal porque difieren de las props");
      setEditData(dataFromProps);
    }
    setShowEditModal(true);
  };

  // Actualiza editData conforme el usuario modifique los inputs
  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // Guarda los cambios y llama a onEditActivity del componente padre
  const handleSave = async () => {
    console.log("Guardando cambios con datos:", editData);
    if (onEditActivity) {
      try {
        await onEditActivity(editData);
        console.log("Actualización exitosa");
      } catch (error) {
        console.error("Error actualizando la actividad", error);
      }
    }
    setShowEditModal(false);
  };

  // Renderiza las estrellas para el rating
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
    <>
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
          
          {/* Información de fecha y hora */}
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
            
            {/* Contenedor para el rating y el botón de editar */}
            <div className="act-card-rating" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="stars-container">
                {renderStars(rating)}
              </div>
              <span className="rating-number">{rating.toFixed(1)}</span>
              <button 
                className="act-card-btn edit-btn"
                onClick={handleOpenModal}
              >
                Editar actividad
              </button>
            </div>
          </div>
          
          {/* Botón "Ver detalles de la actividad" */}
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

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Editar Actividad</h2>
            <label>
              Título:
              <input 
                type="text" 
                name="title" 
                value={editData.title} 
                onChange={handleModalChange} 
              />
            </label>
            <label>
              Fecha:
              <input 
                type="text" 
                name="date" 
                value={editData.date} 
                onChange={handleModalChange} 
              />
            </label>
            <label>
              Rating:
              <input 
                type="number" 
                name="rating" 
                value={editData.rating} 
                onChange={handleModalChange} 
                step="0.1" 
                min="0" 
                max="5"
                disabled
              />
            </label>
            <label>
              Capacity:
              <input 
                type="text" 
                name="capacity" 
                value={editData.capacity} 
                onChange={handleModalChange} 
              />
            </label>
            <label>
              Description:
              <textarea 
                name="description" 
                value={editData.description} 
                onChange={handleModalChange} 
              ></textarea>
            </label>
            <label>
              Duration:
              <input 
                type="text" 
                name="duration" 
                value={editData.duration} 
                onChange={handleModalChange} 
              />
            </label>
            <label>
              Price:
              <input 
                type="number" 
                name="price" 
                value={editData.price} 
                onChange={handleModalChange} 
              />
            </label>
            <label>
              Requirements:
              <textarea 
                name="requirements" 
                value={editData.requirements} 
                onChange={handleModalChange} 
              ></textarea>
            </label>
            <label>
              Type:
              <input 
                type="text" 
                name="type" 
                value={editData.type} 
                onChange={handleModalChange} 
              />
            </label>
            <div className="modal-buttons">
              <button onClick={handleSave}>Guardar</button>
              <button onClick={() => setShowEditModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActGuideCard;