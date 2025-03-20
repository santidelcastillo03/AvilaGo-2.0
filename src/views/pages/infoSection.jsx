import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLeaf, 
  faInfoCircle, 
  faExclamationTriangle, 
  faMapMarkedAlt, 
  faListUl, 
  faBook, 
  faCloudSun, 
  faHiking, 
  faShieldAlt, 
  faMountain, 
  faWater
} from '@fortawesome/free-solid-svg-icons';
import '../../assets/styles/infoSection.css';

const InfoSection = () => {
  const recommendations = [
    {
      id: 1,
      title: "Llevar suficiente agua",
      icon: faWater,
      content: "Es fundamental mantenerse hidratado durante toda la excursión. Lleva al menos 2 litros de agua por persona para rutas cortas y 3-4 litros para rutas más largas."
    },
    {
      id: 2,
      title: "Usar calzado adecuado",
      icon: faHiking,
      content: "Utiliza botas de montaña o zapatillas de trail con buena sujeción y suela antideslizante. Evita zapatos nuevos que puedan causar ampollas."
    },
    {
      id: 3,
      title: "Protección solar",
      icon: faCloudSun,
      content: "La radiación UV es más intensa en la montaña. Usa protector solar (mínimo SPF 30), gorra o sombrero, gafas de sol y ropa que cubra brazos y piernas."
    },
    {
      id: 4,
      title: "Revisar el clima",
      icon: faCloudSun,
      content: "Consulta el pronóstico meteorológico antes de tu visita. Evita subir con lluvia o tormenta debido al riesgo de deslizamientos."
    },
    {
      id: 5,
      title: "Iniciar temprano",
      icon: faCloudSun,
      content: "Comienza tu excursión a primera hora de la mañana para evitar el calor del mediodía y asegurarte de tener suficiente luz natural para el descenso."
    }
  ];

  const safetyTips = [
    {
      id: 1,
      title: "No caminar solo",
      content: "Es recomendable ir siempre acompañado. Si vas solo, informa a alguien sobre tu ruta y hora estimada de regreso."
    },
    {
      id: 2,
      title: "Llevar un botiquín básico",
      content: "Incluye vendas, antiséptico, analgésicos, repelente de insectos y algún antihistamínico por si ocurren reacciones alérgicas."
    },
    {
      id: 3,
      title: "Mantente en los senderos marcados",
      content: "No tomes atajos ni te salgas de las rutas establecidas para evitar perderte y para proteger el ecosistema."
    },
    {
      id: 4,
      title: "Lleva contigo un teléfono cargado",
      content: "Aunque la señal puede ser limitada, es útil en caso de emergencia. Guarda el número de los guardaparques: +58-212-xxx-xxxx."
    },
    {
      id: 5,
      title: "Respeta la fauna y flora",
      content: "No alimentes a los animales silvestres ni recolectes plantas. Observa a distancia y no alteres su hábitat natural."
    }
  ];

  const facts = [
    {
      id: 1,
      title: "Creación del Parque Nacional",
      content: "El Parque Nacional El Ávila fue creado el 12 de diciembre de 1958 para proteger la importante cordillera de la costa que separa Caracas del Mar Caribe."
    },
    {
      id: 2,
      title: "Biodiversidad excepcional",
      content: "El parque alberga más de 1,800 especies de plantas, 120 especies de mamíferos, 500 especies de aves y numerosos anfibios, reptiles e insectos endémicos."
    },
    {
      id: 3,
      title: "Sistema teleférico",
      content: "El Teleférico de Caracas, que conecta la ciudad con la cima del Ávila, fue inaugurado en 1956 y renovado en 2002, permitiendo un acceso rápido a más de 2,100 metros de altura."
    },
    {
      id: 4,
      title: "Pico Naiguatá",
      content: "El punto más alto del parque es el Pico Naiguatá, con una altura de 2,765 metros sobre el nivel del mar, convirtiéndolo en el punto más elevado de la Cordillera de la Costa."
    },
    {
      id: 5,
      title: "Antiguos caminos coloniales",
      content: "Varios de los senderos del parque siguen rutas históricas como el Camino de Los Españoles, construido en el siglo XVI para conectar Caracas con el puerto de La Guaira."
    }
  ];

  const hikingTrails = [
    {
      id: 1,
      name: "Sabas Nieves",
      difficulty: "Fácil-Moderada",
      duration: "2-3 horas (ida)",
      highlight: "Ideal para principiantes y familias, ofrece hermosas vistas de Caracas."
    },
    {
      id: 2,
      name: "La Julia",
      difficulty: "Moderada",
      duration: "3-4 horas (ida)",
      highlight: "Sendero menos transitado con gran diversidad de flora."
    },
    {
      id: 3,
      name: "Quebrada Quintero",
      difficulty: "Moderada-Difícil",
      duration: "4-5 horas (ida)",
      highlight: "Ruta refrescante con pequeñas cascadas y pozas naturales."
    },
    {
      id: 4,
      name: "Pico Naiguatá",
      difficulty: "Difícil",
      duration: "8-10 horas (ida y vuelta)",
      highlight: "La cumbre más alta del parque con vistas espectaculares de la costa y Caracas."
    },
    {
      id: 5,
      name: "San José de Galipán",
      difficulty: "Moderada",
      duration: "3-4 horas (ida)",
      highlight: "Pueblo tradicional en la montaña conocido por sus cultivos de flores."
    }
  ];

  return (
    <div className="info-section-page">
      <Header />
      
      <div className="info-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>El Parque Nacional El Ávila</h1>
          <p>Guía completa para disfrutar de uno de los tesoros naturales de Venezuela</p>
        </div>
      </div>
      
      <div className="info-content-container">
        <section className="info-section">
          <div className="section-header">
            <FontAwesomeIcon icon={faBook} className="section-icon" />
            <h2>Acerca del Parque Nacional</h2>
          </div>
          
          <div className="about-content">
            <div className="about-text">
              <p>
                El Parque Nacional El Ávila, también conocido como Waraira Repano (su nombre indígena), es una imponente cordillera que separa la ciudad de Caracas del Mar Caribe. Establecido en 1958, este parque es un símbolo natural de Venezuela y el pulmón verde de Caracas, cubriendo aproximadamente 85,192 hectáreas.
              </p>
              <p>
                Con una altura máxima de 2,765 metros en el Pico Naiguatá, El Ávila ofrece un espectacular contraste de ecosistemas: desde bosques nublados y selvas húmedas hasta zonas de vegetación xerófila, albergando una rica biodiversidad.
              </p>
              <p>
                Para los caraqueños, "subir al Ávila" es una tradición de fin de semana, mientras que para los turistas representa una oportunidad única de disfrutar la naturaleza a pocos minutos de una gran ciudad.
              </p>
            </div>
            <div className="about-image">
            </div>
          </div>
        </section>
        
        <section className="info-section recommendations-section">
          <div className="section-header">
            <FontAwesomeIcon icon={faListUl} className="section-icon" />
            <h2>Recomendaciones para tu Visita</h2>
          </div>
          
          <div className="recommendations-grid">
            {recommendations.map(rec => (
              <div key={rec.id} className="recommendation-card">
                <div className="rec-icon">
                  <FontAwesomeIcon icon={rec.icon} />
                </div>
                <h3>{rec.title}</h3>
                <p>{rec.content}</p>
              </div>
            ))}
          </div>
        </section>
        
        <section className="info-section trails-section">
          <div className="section-header">
            <FontAwesomeIcon icon={faHiking} className="section-icon" />
            <h2>Senderos Recomendados</h2>
          </div>
          
          <div className="trails-table-container">
            <table className="trails-table">
              <thead>
                <tr>
                  <th>Sendero</th>
                  <th>Dificultad</th>
                  <th>Duración</th>
                  <th>Destacado</th>
                </tr>
              </thead>
              <tbody>
                {hikingTrails.map(trail => (
                  <tr key={trail.id}>
                    <td className="trail-name">{trail.name}</td>
                    <td className="trail-difficulty">{trail.difficulty}</td>
                    <td className="trail-duration">{trail.duration}</td>
                    <td className="trail-highlight">{trail.highlight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="trail-disclaimer">
            <p>
              <FontAwesomeIcon icon={faInfoCircle} />
              Consulta siempre a los guardaparques sobre las condiciones actuales de los senderos antes de iniciar tu caminata.
            </p>
          </div>
        </section>
        
        <section className="info-section safety-section">
          <div className="section-header">
            <FontAwesomeIcon icon={faShieldAlt} className="section-icon" />
            <h2>Consejos de Seguridad</h2>
          </div>
          
          <div className="safety-tips-container">
            <div className="safety-warning">
              <FontAwesomeIcon icon={faExclamationTriangle} className="warning-icon" />
              <p>La montaña puede ser impredecible. Tu seguridad depende de tu preparación y decisiones.</p>
            </div>
            
            <div className="safety-tips-list">
              {safetyTips.map(tip => (
                <div key={tip.id} className="safety-tip">
                  <h3>{tip.title}</h3>
                  <p>{tip.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <section className="info-section facts-section">
          <div className="section-header">
            <FontAwesomeIcon icon={faMountain} className="section-icon" />
            <h2>Datos Interesantes</h2>
          </div>
          
          <div className="facts-slider">
            {facts.map(fact => (
              <div key={fact.id} className="fact-card">
                <div className="fact-number">{fact.id}</div>
                <h3>{fact.title}</h3>
                <p>{fact.content}</p>
              </div>
            ))}
          </div>
        </section>
        
        <section className="info-section map-section">
          <div className="section-header">
            <FontAwesomeIcon icon={faMapMarkedAlt} className="section-icon" />
            <h2>Cómo Llegar</h2>
          </div>
          
          <div className="map-content">
            <div className="map-instructions">
              <h3>Accesos principales:</h3>
              <ul>
                <li><strong>Teleférico de Caracas:</strong> Ubicado en Maripérez, permite llegar a la cima del cerro en aproximadamente 15 minutos.</li>
                <li><strong>Entrada Sabas Nieves:</strong> En Altamira, es el acceso más popular para caminantes y excursionistas.</li>
                <li><strong>La Julia:</strong> En San Bernardino, menos concurrido pero con rutas bien demarcadas.</li>
                <li><strong>Quebrada Quintero:</strong> Cerca de La Florida, ideal para quienes buscan rutas con agua.</li>
              </ul>
              
              <div className="opening-hours">
                <h3>Horarios:</h3>
                <p>El parque está abierto de 7:00 AM a 5:00 PM todos los días, aunque se recomienda iniciar el descenso antes de las 2:00 PM para evitar que la noche te sorprenda en la montaña.</p>
              </div>
            </div>
            
            <div className="map-container">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125455.50686422055!2d-67.05962!3d10.5347!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c2a59c270528205%3A0x93df7059f310b2b8!2sParque%20Nacional%20El%20%C3%81vila!5e0!3m2!1sen!2sus!4v1621521034925!5m2!1sen!2sus" 
                width="100%" 
                height="450" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy"
                title="Mapa del Parque Nacional El Ávila"
              ></iframe>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default InfoSection;
