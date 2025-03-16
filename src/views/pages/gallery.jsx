import React, { useState } from 'react';
import '../../assets/styles/gallery.css';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

// Import some of your existing images from assets
import sabasNieves from '../../assets/images/sabas-nieves.png';
import humboldt from '../../assets/images/humboldt.png';
import cruzPalmeros from '../../assets/images/cruz-palmeros.png';
import picoNaiguata from '../../assets/images/pico-naiguata.png';
import elBanquito from '../../assets/images/el-banquito.png';

const GalleryPage = () => {
  // Define all your gallery items in an array - removed isVideo property since they're all images
  const galleryItems = [
    { src: sabasNieves, alt: "Sabas Nieves" },
    { src: humboldt, alt: "Humboldt" },
    { src: cruzPalmeros, alt: "Cruz de los Palmeros" },
    { src: picoNaiguata, alt: "Pico Naiguata" },
    { src: elBanquito, alt: "El Banquito" }
  ];

  // State to track the current position in the carousel
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // State for the focused image modal
  const [focusedImage, setFocusedImage] = useState(null);

  // Calculate which items to show based on current index
  // We'll show 3 items per page
  const itemsPerPage = 3;
  const totalPages = Math.ceil(galleryItems.length / itemsPerPage);
  
  // Handle navigation
  const goToPrevious = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? totalPages - 1 : prevIndex - 1
    );
  };
  
  const goToNext = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === totalPages - 1 ? 0 : prevIndex + 1
    );
  };
  
  // Get visible items for the current page
  const getVisibleItems = () => {
    const startIdx = (currentIndex * itemsPerPage) % galleryItems.length;
    const visibleItems = [];
    
    for (let i = 0; i < itemsPerPage; i++) {
      const idx = (startIdx + i) % galleryItems.length;
      visibleItems.push(galleryItems[idx]);
    }
    
    return visibleItems;
  };
  
  // Handle image click to focus
  const handleImageClick = (item) => {
    setFocusedImage(item);
  };
  
  // Close the modal
  const closeModal = () => {
    setFocusedImage(null);
  };

  return (
    <div className="gallery-container">
      <Header />
      <div className="gallery-content">
        <h1 className="gallery-title">Galería de Imágenes</h1>
        
        <div className="add-button-container">
          <button className="add-button">
            Añadir <span className="plus-icon">+</span>
          </button>
        </div>
        
        <div className="gallery-carousel">
          <div className="carousel-items">
            {getVisibleItems().map((item, index) => (
              <div 
                key={index} 
                className="gallery-item" 
                onClick={() => handleImageClick(item)}
              >
                <img 
                  src={item.src}
                  alt={item.alt}
                  className="gallery-image"
                />
              </div>
            ))}
          </div>
          
          {/* Navigation arrows */}
          <button 
            className="nav-arrow nav-arrow-left"
            onClick={goToPrevious}
          >
            <span>&lt;</span>
          </button>
          <button 
            className="nav-arrow nav-arrow-right"
            onClick={goToNext}
          >
            <span>&gt;</span>
          </button>
          
          {/* Pagination indicators */}
          <div className="carousel-dots">
            {[...Array(totalPages)].map((_, idx) => (
              <span 
                key={idx} 
                className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              ></span>
            ))}
          </div>
        </div>
        
        {/* Modal for focused image */}
        <div className={`image-modal-overlay ${focusedImage ? 'active' : ''}`} onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {focusedImage && (
              <>
                <img 
                  src={focusedImage.src} 
                  alt={focusedImage.alt} 
                  className="modal-image" 
                />
                <button className="modal-close" onClick={closeModal}>×</button>
                <div className="modal-caption">{focusedImage.alt}</div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GalleryPage;