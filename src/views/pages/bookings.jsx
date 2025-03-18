import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { auth } from '../../services/firebaseConfig';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faMapMarkerAlt, 
  faUserFriends, 
  faCheckCircle, 
  faHistory,
  faExclamationCircle,
  faClock,
  faRoute,
  faSearch,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import '../../assets/styles/bookings.css';

const BookingsPage = () => {
  const navigate = useNavigate();
  const [activeBookings, setActiveBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState({});
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // Check if user is logged in
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        // Redirect to login if not logged in
        navigate('/login', { 
          state: { 
            message: 'Por favor inicia sesión para ver tus reservas.',
            redirect: '/bookings'
          }
        });
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Query reservations for the current user where payment is confirmed
        const reservationsQuery = query(
          collection(db, 'reservations'),
          where('userId', '==', user.uid),
          where('paymentStatus', '==', 'completed')
        );
        
        const reservationsSnapshot = await getDocs(reservationsQuery);
        
        if (reservationsSnapshot.empty) {
          // No reservations found
          setActiveBookings([]);
          setPastBookings([]);
          setLoading(false);
          return;
        }
        
        const bookingsData = [];
        const currentDate = new Date();
        
        // Process each reservation
        for (const reservationDoc of reservationsSnapshot.docs) {
          const reservationData = reservationDoc.data();
          
          try {
            // Skip if missing required data
            if (!reservationData.activityId) continue;
            
            // Fetch activity details
            const activityRef = doc(db, 'activities', reservationData.activityId);
            const activityDoc = await getDoc(activityRef);
            
            if (!activityDoc.exists()) continue;
            
            const activityData = activityDoc.data();
            
            // Convert timestamp to Date
            const activityDate = activityData.date?.toDate() || new Date();
            
            // Get route data
            let routeData = { title: 'Ruta no disponible' };
            if (activityData.routeId) {
              const routeDoc = await getDoc(doc(db, 'routes', activityData.routeId));
              if (routeDoc.exists()) {
                routeData = routeDoc.data();
              }
            }
            
            // Get guide data
            let guideData = { name: 'Guía no disponible', profilePic: null };
            if (activityData.guideId) {
              const guideDoc = await getDoc(doc(db, 'users', activityData.guideId));
              if (guideDoc.exists()) {
                guideData = guideDoc.data();
              }
            }
            
            // Add to bookings array
            bookingsData.push({
              id: reservationDoc.id,
              bookingDate: reservationData.createdAt?.toDate() || new Date(),
              paymentAmount: reservationData.price || 0,
              paymentMethod: 'PayPal',
              participants: 1, // Default to 1 if not specified
              activity: {
                id: activityData.id || reservationData.activityId,
                title: activityData.title || reservationData.activityName || 'Actividad sin nombre',
                description: activityData.description || 'Sin descripción disponible',
                date: activityDate,
                time: activityData.time || 'Hora no especificada',
                duration: activityData.duration || 'Duración no especificada',
                capacity: activityData.capacity || 'Capacidad no especificada',
                price: activityData.price || 0,
                route: {
                  id: activityData.routeId || 'unknown',
                  title: routeData.title
                },
                guide: {
                  id: activityData.guideId || 'unknown',
                  name: guideData.name || 'Guía no disponible',
                  profilePic: guideData.profilePic || '/default-profile.jpg'
                }
              },
              // Activity is active if date is in the future
              isActive: activityDate > currentDate
            });
          } catch (err) {
            console.error('Error processing reservation:', reservationDoc.id, err);
            // Continue to next reservation
            continue;
          }
        }
        
        // Sort and separate bookings
        const active = bookingsData.filter(booking => booking.isActive);
        const past = bookingsData.filter(booking => !booking.isActive);
        
        // Sort active bookings by closest date first
        active.sort((a, b) => a.activity.date - b.activity.date);
        
        // Sort past bookings by most recent first
        past.sort((a, b) => b.activity.date - a.activity.date);
        
        setActiveBookings(active);
        setPastBookings(past);
      } catch (err) {
        console.error('Error fetching reservations:', err);
        setError('No se pudieron cargar tus reservas. Por favor intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);
  
  const toggleDetails = (bookingId) => {
    setShowDetails(prev => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };
  
  const formatDate = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date)) {
      return 'Fecha no disponible';
    }
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatTime = (time) => {
    return time || 'Hora no especificada';
  };
  
  // Filter active bookings based on search and filter criteria
  const filteredActiveBookings = activeBookings.filter(booking => {
    // Apply search filter
    if (searchTerm && !booking.activity.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Apply time filter
    if (filter === 'this-week') {
      const now = new Date();
      const endOfWeek = new Date();
      endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
      return booking.activity.date <= endOfWeek;
    }
    if (filter === 'this-month') {
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return booking.activity.date <= endOfMonth;
    }
    
    // Show all if no filter applies
    return true;
  });
  
  // Filter past bookings based on search
  const filteredPastBookings = pastBookings.filter(booking => {
    return searchTerm ? booking.activity.title.toLowerCase().includes(searchTerm.toLowerCase()) : true;
  });
  
  // Calculate days remaining until activity
  const getDaysRemaining = (activityDate) => {
    if (!activityDate || !(activityDate instanceof Date) || isNaN(activityDate)) {
      return 0;
    }
    
    const today = new Date();
    const diffTime = activityDate - today;
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };
  
  return (
    <div className="bookings-page">
      <Header />
      
      <main className="bookings-container">
        <h1 className="bookings-title">Mis Reservas</h1>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando reservas...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <FontAwesomeIcon icon={faExclamationCircle} className="error-icon" />
            <p className="error-message">{error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Intentar nuevamente
            </button>
          </div>
        ) : (
          <>
            <div className="bookings-filter-container">
              <div className="search-container">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar actividad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="filter-container">
                <FontAwesomeIcon icon={faFilter} className="filter-icon" />
                <select 
                  className="filter-select"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">Todas las reservas</option>
                  <option value="this-week">Esta semana</option>
                  <option value="this-month">Este mes</option>
                </select>
              </div>
            </div>
            
            <section className="active-bookings-section">
              <h2 className="section-title">
                <FontAwesomeIcon icon={faCalendarAlt} className="section-icon" />
                Actividades Próximas
              </h2>
              
              {filteredActiveBookings.length === 0 ? (
                <div className="empty-bookings">
                  <p>No tienes reservas activas.</p>
                  <button
                    className="view-activities-btn"
                    onClick={() => navigate('/routes')}
                  >
                    Ver actividades disponibles
                  </button>
                </div>
              ) : (
                <div className="bookings-grid">
                  {filteredActiveBookings.map(booking => (
                    <div key={booking.id} className="booking-card">
                      <div className="booking-header">
                        <h3 className="booking-title">{booking.activity.title}</h3>
                        <div className="booking-route">
                          <FontAwesomeIcon icon={faRoute} className="booking-icon" />
                          <span>{booking.activity.route.title}</span>
                        </div>
                      </div>
                      
                      <div className="booking-date">
                        <div className="date-badge">
                          <div className="date-month">
                            {booking.activity.date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}
                          </div>
                          <div className="date-day">
                            {booking.activity.date.getDate()}
                          </div>
                        </div>
                        <div className="date-details">
                          <div className="full-date">
                            {formatDate(booking.activity.date)}
                          </div>
                          <div className="booking-time">
                            <FontAwesomeIcon icon={faClock} className="time-icon" />
                            {formatTime(booking.activity.time)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="booking-info">
                        <div className="info-item">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="info-icon" />
                          <span>Punto de encuentro: UNIMET</span>
                        </div>
                        <div className="info-item">
                          <FontAwesomeIcon icon={faUserFriends} className="info-icon" />
                          <span>Participantes: {booking.participants}</span>
                        </div>
                      </div>
                      
                      <div className="days-remaining">
                        <span className="days-count">{getDaysRemaining(booking.activity.date)}</span>
                        <span className="days-text">días restantes</span>
                      </div>
                      
                      <button
                        className={`details-toggle ${showDetails[booking.id] ? 'active' : ''}`}
                        onClick={() => toggleDetails(booking.id)}
                      >
                        {showDetails[booking.id] ? 'Ocultar detalles' : 'Ver detalles'}
                      </button>
                      
                      {showDetails[booking.id] && (
                        <div className="booking-details">
                          <div className="details-section">
                            <h4>Detalles de la Actividad</h4>
                            <p>{booking.activity.description}</p>
                            <p><strong>Duración:</strong> {booking.activity.duration}</p>
                            <p><strong>Capacidad:</strong> {booking.activity.capacity} personas</p>
                          </div>
                          
                          <div className="details-section">
                            <h4>Detalles de la Reserva</h4>
                            <p><strong>Fecha de reserva:</strong> {formatDate(booking.bookingDate)}</p>
                            <p><strong>Método de pago:</strong> {booking.paymentMethod}</p>
                            <p><strong>Monto pagado:</strong> ${booking.paymentAmount.toFixed(2)} USD</p>
                            <p><strong>Estado:</strong> <span className="payment-confirmed">Pago confirmado</span></p>
                          </div>
                          
                          <div className="details-section guide-info">
                            <h4>Información del Guía</h4>
                            <div className="guide-profile">
                              <img 
                                src={booking.activity.guide.profilePic || '/default-profile.jpg'} 
                                alt={booking.activity.guide.name}
                                className="guide-pic"
                              />
                              <span className="guide-name">{booking.activity.guide.name}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
            
            <section className="past-bookings-section">
              <h2 className="section-title">
                <FontAwesomeIcon icon={faHistory} className="section-icon" />
                Actividades Pasadas
              </h2>
              
              {filteredPastBookings.length === 0 ? (
                <div className="empty-bookings">
                  <p>No tienes actividades pasadas.</p>
                </div>
              ) : (
                <div className="bookings-grid past-grid">
                  {filteredPastBookings.map(booking => (
                    <div key={booking.id} className="booking-card past-booking">
                      <div className="booking-header">
                        <div className="past-badge">Completada</div>
                        <h3 className="booking-title">{booking.activity.title}</h3>
                        <div className="booking-route">
                          <FontAwesomeIcon icon={faRoute} className="booking-icon" />
                          <span>{booking.activity.route.title}</span>
                        </div>
                      </div>
                      
                      <div className="booking-date">
                        <div className="date-badge past-date">
                          <div className="date-month">
                            {booking.activity.date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}
                          </div>
                          <div className="date-day">
                            {booking.activity.date.getDate()}
                          </div>
                        </div>
                        <div className="date-details">
                          <div className="full-date">
                            {formatDate(booking.activity.date)}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        className={`details-toggle ${showDetails[booking.id] ? 'active' : ''}`}
                        onClick={() => toggleDetails(booking.id)}
                      >
                        {showDetails[booking.id] ? 'Ocultar detalles' : 'Ver detalles'}
                      </button>
                      
                      {showDetails[booking.id] && (
                        <div className="booking-details">
                          <div className="details-section">
                            <h4>Detalles de la Actividad</h4>
                            <p>{booking.activity.description}</p>
                            <p><strong>Duración:</strong> {booking.activity.duration}</p>
                            <p><strong>Capacidad:</strong> {booking.activity.capacity} personas</p>
                          </div>
                          
                          <div className="details-section">
                            <h4>Detalles de la Reserva</h4>
                            <p><strong>Participantes:</strong> {booking.participants}</p>
                            <p><strong>Fecha de reserva:</strong> {formatDate(booking.bookingDate)}</p>
                            <p><strong>Método de pago:</strong> {booking.paymentMethod}</p>
                            <p><strong>Monto pagado:</strong> ${booking.paymentAmount.toFixed(2)} USD</p>
                          </div>
                          
                          <div className="details-section guide-info">
                            <h4>Información del Guía</h4>
                            <div className="guide-profile">
                              <img 
                                src={booking.activity.guide.profilePic || '/default-profile.jpg'} 
                                alt={booking.activity.guide.name}
                                className="guide-pic"
                              />
                              <span className="guide-name">{booking.activity.guide.name}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default BookingsPage;