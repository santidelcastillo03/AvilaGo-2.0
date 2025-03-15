// src/views/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../../assets/styles/landingPage.css';
import logo from '../../assets/images/logo.png';
import mountainImage from '../../assets/images/imagen-montana.png';
import rutasImage from '../../assets/images/imagen-senalizacion.png';

function LandingPage() {
  return (
    <div className="landing-page">
      {/* HEADER COMPONENT */}
      <Header />

      {/* SECCIÓN HERO / PRESENTACIÓN */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <p>
              En AvilaGo, conectamos a los estudiantes de la Universidad
              Metropolitana con la naturaleza a través de experiencias
              únicas en el Parque Nacional El Ávila. Nuestra plataforma te
              permite explorar rutas emocionantes, reservar actividades
              guiadas, y formar parte de una comunidad que ama el aire
              libre. Descubre todo lo que este increíble entorno tiene para
              ofrecer mientras fomentamos la conexión con la naturaleza y
              la preservación de nuestro entorno natural.
            </p>
            <div><p>¡Comienza tu aventura hoy mismo!</p></div>
            
          </div>
          <div className="hero-logo">
            <img src={logo} alt="UNIMET AvilaGo Logo Grande" />
          </div>
        </div>
      </section>

      {/* SECCIÓN GALERÍA DE FOTOS Y VIDEOS */}
      <section className="gallery-section">
        <div className="section-content">
          <div className="section-text">
            <h2>Galeria de<br />Fotos y Videos</h2>
            <div className="underline"></div>
            <a href="#" className="btn-link">
              <button className="ver-button">Ver <i className="fa fa-arrow-right"></i></button>
            </a>
          </div>
          <div className="gallery-image">
            <img src={mountainImage} alt="Vista del Ávila" />
          </div>
        </div>
      </section>

      {/* SECCIÓN RUTAS */}
<section className="routes-section">
  <div className="section-content">
    <div className="section-text">
      <h2>Rutas</h2>
      <div className="underline"></div>
      <Link to="/routes" className="btn-link">
        <button className="ver-button">Ver <i className="fa fa-arrow-right"></i></button>
      </Link>
    </div>
    <div className="routes-image">
      <img src={rutasImage} alt="Señalización de rutas" />
    </div>
  </div>
</section>

      {/* SECCIÓN FORO E INFORMACIÓN */}
      <section className="info-forum-section">
        <div className="dual-card-container">
          <div className="info-card forum-card">
            <h2>Foro</h2>
            <p>
              Abre discusiones y comparte ideas con otras personas de la comunidad!
            </p>
            <a href="#" className="btn-link">
              Ir al foro <i className="fa fa-arrow-right"></i>
            </a>
          </div>
          
          <div className="info-card info-interest-card">
            <h2>Informacion de Interes</h2>
            <p>
              Informacion y consejos sobre la naturaleza y el excursionismo
            </p>
            <a href="#" className="btn-link">
              Ver mas <i className="fa fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER COMPONENT */}
      <Footer />
    </div>
  );
}

export default LandingPage;