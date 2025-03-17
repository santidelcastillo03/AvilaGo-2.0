import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faUser, faCalendarAlt, faClock } from '@fortawesome/free-solid-svg-icons';
import { Timestamp } from 'firebase/firestore';
import '../../assets/styles/actGuideCard.css';

const ActGuideCard = ({ 
  id,              // Identificador único de la actividad
  title, 
  imageSrc, 
  guideName,
  rating = 0,
  date = 'Fechas flexibles',  // Para visualización
  rawDate = '',               // Para edición (YYYY-MM-DD)
  time = '',                  // Para edición (HH:MM)
  capacity = '',
  description = '',
  duration = '',
  price = '',
  requirements = '',
  type = '',
  onClick, 
  onEditActivity,
  onDeleteActivity  // Función de borrado recibida desde el componente padre
}) => {
  console.log("ActGuideCard: id =", id);

  // Para la visualización se prefiere rawDate (junto con time) si existe
  const displayDate = rawDate 
    ? `${rawDate}${time ? ` a las ${time}` : ''}` 
    : date;
  // Comprueba si displayDate contiene " a las "
  const hasTimeInfo = displayDate && displayDate.includes(' a las ');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    date: '',
    time: '',
    rating: 0,
    capacity: '',
    description: '',
    duration: '',
    price: '',
    requirements: '',
    type: ''
  });

  // Al abrir el modal se usan los valores raw (si existen) para edición
  const handleOpenModal = () => {
    setEditData({
      title,
      date: rawDate || date,
      time: time,
      rating,
      capacity,
      description,
      duration,
      price,
      requirements,
      type
    });
    setShowEditModal(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // Prepara el nuevo objeto actualizando la fecha mediante date+time a Timestamp
    const updatedData = { ...editData };
    if (editData.date) {
      const dateTimeStr = editData.time ? `${editData.date} ${editData.time}` : editData.date;
      updatedData.date = Timestamp.fromDate(new Date(dateTimeStr));
    } else {
      updatedData.date = null;
    }
    console.log("Guardando cambios con datos:", updatedData);
    if (onEditActivity) {
      try {
        await onEditActivity(updatedData);
        console.log("Actualización exitosa");
        window.location.reload();
      } catch (error) {
        console.error("Error actualizando la actividad:", error);
      }
    } else {
      console.error("onEditActivity no está definido");
    }
    setShowEditModal(false);
  };

  const handleDelete = async () => {
    console.log("Iniciando borrado de actividad con id:", id);
    if (window.confirm("¿Estás seguro de que deseas borrar esta actividad?")) {
      if (onDeleteActivity) {
        try {
          await onDeleteActivity(id);
          console.log("Actividad borrada exitosamente");
          setShowEditModal(false);
        } catch (error) {
          console.error("Error borrando la actividad:", error);
        }
      } else {
        console.error("No se ha definido onDeleteActivity");
      }
    } else {
      console.log("Borrado cancelado");
    }
  };

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
          
          <div className="act-card-schedule">
            <div className="act-card-date-row">
              <FontAwesomeIcon icon={faCalendarAlt} className="schedule-icon" />
              {hasTimeInfo ? (
                <div className="date-time-info">
                  <span className="date-part">{displayDate.split(' a las ')[0]}</span>
                  <div className="time-part">
                    <FontAwesomeIcon icon={faClock} className="schedule-icon time-icon" />
                    <span>{displayDate.split(' a las ')[1]}</span>
                  </div>
                </div>
              ) : (
                <span>{displayDate}</span>
              )}
            </div>
          </div>
          
          <div className="act-card-info">
            <div className="act-card-guide">
              <FontAwesomeIcon icon={faUser} className="guide-icon" />
              <span>{guideName || 'Guía no asignado'}</span>
            </div>
            
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
                placeholder="YYYY-MM-DD"
              />
            </label>
            <label>
              Hora:
              <input 
                type="text" 
                name="time" 
                value={editData.time} 
                onChange={handleModalChange} 
                placeholder="HH:MM"
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
              Capacidad:
              <input 
                type="text" 
                name="capacity" 
                value={editData.capacity} 
                onChange={handleModalChange} 
              />
            </label>
            <label>
              Descripción:
              <textarea 
                name="description" 
                value={editData.description} 
                onChange={handleModalChange} 
              ></textarea>
            </label>
            <label>
              Duración:
              <input 
                type="text" 
                name="duration" 
                value={editData.duration} 
                onChange={handleModalChange} 
              />
            </label>
            <label>
              Precio:
              <input 
                type="number" 
                name="price" 
                value={editData.price} 
                onChange={handleModalChange} 
              />
            </label>
            <label>
              Requerimientos:
              <textarea 
                name="requirements" 
                value={editData.requirements} 
                onChange={handleModalChange} 
              ></textarea>
            </label>
            <label>
              Tipo:
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
              <button onClick={handleDelete} className="delete-btn">Borrar actividad</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActGuideCard;