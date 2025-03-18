import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  addDoc,
  Timestamp
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ActCard from '../components/ActGuideCard.jsx';
import '../../assets/styles/actDash.css';

// Import activity images
import hikingImage from '../../assets/images/logo.png';
import campingImage from '../../assets/images/logo.png';
import yogaImage from '../../assets/images/logo.png';
import birdwatchingImage from '../../assets/images/logo.png';
import photographyImage from '../../assets/images/logo.png';

// Activity type to image mapping
const activityImages = {
  'Hiking': hikingImage,
  'Camping': campingImage,
  'Yoga': yogaImage,
  'Birdwatching': birdwatchingImage,
  'Photography': photographyImage,
  'default': hikingImage // Default image
};

const ActDash = () => {
  const navigate = useNavigate();
  const db = getFirestore();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null); // Nuevo estado para el rol del usuario

  // Estado para el modal de creación de actividad
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newActivityData, setNewActivityData] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    type: '',
    capacity: '',
    duration: '',
    price: '',
    requirements: '',
    rating: 0,
    routeId: ''
  });

  // Nuevo estado para guardar las rutas (para el dropdown)
  const [routes, setRoutes] = useState([]);

  const handleCreateModalChange = (e) => {
    const { name, value } = e.target;
    setNewActivityData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateActivity = async () => {
    if (!currentUser) {
      console.error("No hay usuario autenticado");
      return;
    }
    const guideName = currentUser.uid;
    let newDateTimestamp = null;
    if (newActivityData.date) {
      const dateString = newActivityData.time 
        ? `${newActivityData.date} ${newActivityData.time}` 
        : newActivityData.date;
      console.log("Creando actividad con fecha:", dateString);
      newDateTimestamp = Timestamp.fromDate(new Date(dateString));
    }
    const activity = {
      title: newActivityData.title,
      description: newActivityData.description,
      type: newActivityData.type,
      guideName: guideName,
      rating: 0,
      price: newActivityData.price ? Number(newActivityData.price) : 0,
      capacity: newActivityData.capacity || 'No especificada',
      duration: newActivityData.duration || 'No especificada',
      requirements: newActivityData.requirements || 'No hay requisitos específicos',
      date: newDateTimestamp,
      time: newActivityData.time,
      routeId: newActivityData.routeId || ""
    };
    try {
      const docRef = await addDoc(collection(db, 'activities'), activity);
      console.log("Actividad creada con ID:", docRef.id);
      setShowCreateModal(false);
      setNewActivityData({
        title: '',
        date: '',
        time: '',
        description: '',
        type: '',
        capacity: '',
        duration: '',
        price: '',
        requirements: '',
        rating: 0,
        routeId: ''
      });
      window.location.reload();
    } catch (error) {
      console.error("Error creando actividad:", error);
    }
  };

  // Función para actualizar la actividad en la base de datos (para editar)
  const handleActivityEdit = async (activityId, updatedData) => {
    try {
      const activityRef = doc(db, "activities", activityId);
      await updateDoc(activityRef, updatedData);
      console.log("Actividad actualizada en la DB");
      setActivities(prevActivities =>
        prevActivities.map((act) =>
          act.id === activityId ? { ...act, ...updatedData } : act
        )
      );
    } catch (error) {
      console.error("Error al actualizar la actividad:", error);
    }
  };

  // Función para borrar una actividad
  const handleDeleteActivity = async (id) => {
    try {
      console.log("Eliminando actividad con id:", id);
      await deleteDoc(doc(db, "activities", id));
      setActivities(prev => prev.filter(act => act.id !== id));
    } catch (error) {
      console.error("Error eliminando la actividad:", error);
    }
  };

  // Fetch activities y rol del usuario
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        if (!currentUser) {
          setError('No hay usuario autenticado');
          setLoading(false);
          return;
        }
  
        // Obtén el rol del usuario desde Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        let role = null;
        if (userDocSnap.exists()) {
          role = userDocSnap.data().role;
          setUserRole(role);
        } else {
          console.log('No se encontró documento para el usuario');
        }
        
        const isAdmin = role === 'admin';
        console.log("Fetching activities for user:", currentUser.uid, "isAdmin:", isAdmin);
  
        const activitiesCollection = collection(db, 'activities');
        const activitiesQuery = isAdmin
          ? query(activitiesCollection)
          : query(activitiesCollection, where("guideName", "==", currentUser.uid));
  
        const activitiesSnapshot = await getDocs(activitiesQuery);
  
        if (activitiesSnapshot.empty) {
          console.log('No activities found');
          setActivities([]);
        } else {
          const activitiesData = await Promise.all(
            activitiesSnapshot.docs.map(async (docSnap) => {
              const data = docSnap.data();
              const type = data.type || 'Hiking';
              const imageSrc = activityImages[type] || activityImages['default'];
              let guideRealName = "Guía no asignado";
              try {
                const userDocRef = doc(db, 'users', data.guideName);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                  const userData = userDocSnap.data();
                  guideRealName = userData.name || guideRealName;
                } else {
                  console.log(`No se encontró usuario para el guide uid ${data.guideName}`);
                }
              } catch (error) {
                console.error(`Error fetching guide data for uid ${data.guideName}:`, error);
              }
              console.log(`Activity ${docSnap.id} guideRealName:`, guideRealName);
              
              let availableDates = [];
              let availableTimes = [];
              try {
                const datesCollectionRef = collection(db, 'activities', docSnap.id, 'dates');
                const datesSnapshot = await getDocs(datesCollectionRef);
                if (!datesSnapshot.empty) {
                  datesSnapshot.forEach(dateDoc => {
                    const dateData = dateDoc.data();
                    if (dateData.date) {
                      if (dateData.date.toDate) {
                        availableDates.push(dateData.date.toDate());
                      } else if (typeof dateData.date === 'string') {
                        availableDates.push(new Date(dateData.date));
                      }
                      if (dateData.time) {
                        if (dateData.time.toDate) {
                          availableTimes.push(
                            dateData.time.toDate().toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          );
                        } else if (typeof dateData.time === 'string') {
                          availableTimes.push(dateData.time);
                        }
                      }
                    }
                  });
                  availableDates.sort((a, b) => a - b);
                } else {
                  console.log(`No dates found for activity ${docSnap.id}`);
                }
              } catch (error) {
                console.error(`Error fetching dates for activity ${docSnap.id}:`, error);
              }
              
              const rawDate = data.date
                ? (typeof data.date.toDate === "function"
                  ? data.date.toDate().toISOString().split("T")[0]
                  : data.date)
                : "";
              const rawTime = data.time || "";
          
              return {
                id: docSnap.id,
                title: data.title || 'Unnamed Activity',
                description: data.description || '',
                type,
                guideName: guideRealName,
                rating: data.rating || 0,
                price: data.price || 0,
                capacity: data.capacity || 'No especificada',
                duration: data.duration || 'No especificada',
                requirements: data.requirements || 'No hay requisitos específicos',
                imageSrc,
                availableDates,
                availableTimes,
                rawDate,
                rawTime
              };
            })
          );
          console.log("Processed activity data:", activitiesData);
          setActivities(activitiesData);
        }
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('Failed to load activities. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchActivities();
  }, [currentUser, db]);

  // Fetch routes para el dropdown en el modal de crear actividad
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const routesCollection = collection(db, 'routes');
        const routesSnapshot = await getDocs(routesCollection);
        const routesData = [];
        routesSnapshot.forEach(docSnap => {
          routesData.push({ id: docSnap.id, ...docSnap.data() });
        });
        setRoutes(routesData);
      } catch (err) {
        console.error('Error fetching routes for dropdown:', err);
      }
    };
    fetchRoutes();
  }, [db]);

  const formatDate = (date, time = null) => {
    if (!date) return 'Fechas flexibles';
    try {
      const dateStr = date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      return time ? `${dateStr} a las ${time}` : dateStr;
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Fecha no disponible';
    }
  };

  const shouldShowPlaceholder = !loading && !error && activities.length === 0;
  
  return (
    <div className="activities-container">
      <Header />
  
      <div className="activities-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="activities-title">Mis Actividades como Guía</h1>
        {/* Si el usuario no es admin, se muestra el botón de crear */}
        {userRole !== 'admin' && (
           <button 
             className="create-activity-btn"
             onClick={() => setShowCreateModal(true)}
           >
             Crear Actividad
           </button>
        )}
      </div>
  
      <main className="activities-main">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando actividades...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={() => window.location.reload()}>Intentar nuevamente</button>
          </div>
        ) : shouldShowPlaceholder ? (
          <div className="no-activities-message">
            <p>No hay actividades programadas para ti.</p>
          </div>
        ) : (
          <div className="activities-grid">
            {activities.map(activity => {
              let dateDisplay = 'Fechas flexibles';
              if (activity.availableDates && activity.availableDates.length > 0) {
                const schedule = activity.availableDates.map((date, i) => ({
                  date,
                  time: activity.availableTimes && activity.availableTimes[i] ? activity.availableTimes[i] : null
                }));
                const now = new Date();
                const futureSchedule = schedule.filter(s => s.date > now);
                if (futureSchedule.length > 0) {
                  futureSchedule.sort((a, b) => a.date - b.date);
                  const nearest = futureSchedule[0];
                  dateDisplay = formatDate(nearest.date, nearest.time);
                } else {
                  schedule.sort((a, b) => b.date - a.date);
                  const recent = schedule[0];
                  dateDisplay = `Finalizado: ${formatDate(recent.date, recent.time)}`;
                }
              }
              return (
                <div key={activity.id} className="activity-card-container">
                  <ActCard
                    id={activity.id}
                    title={activity.title}
                    imageSrc={activity.imageSrc}
                    guideName={activity.guideName}
                    rating={activity.rating}
                    date={dateDisplay}              // Para visualización
                    rawDate={activity.rawDate}        // Para edición
                    time={activity.rawTime}           // Para edición
                    capacity={activity.capacity}      // Se añaden los valores faltantes
                    description={activity.description}
                    duration={activity.duration}
                    price={activity.price}
                    requirements={activity.requirements}
                    type={activity.type}
                    onClick={() => navigate(`/activity/${activity.id}`, { state: activity })}
                    onEditActivity={(updatedData) => handleActivityEdit(activity.id, updatedData)}
                    onDeleteActivity={handleDeleteActivity}  // Se pasa la función de borrado
                  />
                </div>
              );
            })}
          </div>
        )}
      </main>
  
      <Footer />
  
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Crear Actividad</h2>
            <label>
              Título:
              <input 
                type="text" 
                name="title" 
                value={newActivityData.title} 
                onChange={handleCreateModalChange} 
              />
            </label>
            <label>
              Fecha:
              <input 
                type="text" 
                name="date" 
                value={newActivityData.date} 
                onChange={handleCreateModalChange} 
                placeholder="YYYY-MM-DD"
              />
            </label>
            <label>
              Hora:
              <input 
                type="text" 
                name="time" 
                value={newActivityData.time} 
                onChange={handleCreateModalChange} 
                placeholder="HH:MM"
              />
            </label>
            <label>
              Ruta:
              <select 
                name="routeId" 
                value={newActivityData.routeId} 
                onChange={handleCreateModalChange}
              >
                <option value="">Selecciona una ruta</option>
                {routes.map(route => (
                  <option key={route.id} value={route.id}>{route.title}</option>
                ))}
              </select>
            </label>
            <label>
              Descripción:
              <textarea 
                name="description" 
                value={newActivityData.description} 
                onChange={handleCreateModalChange} 
              ></textarea>
            </label>
            <label>
              Tipo:
              <input 
                type="text" 
                name="type" 
                value={newActivityData.type} 
                onChange={handleCreateModalChange} 
              />
            </label>
            <label>
              Capacidad:
              <input 
                type="text" 
                name="capacity" 
                value={newActivityData.capacity} 
                onChange={handleCreateModalChange} 
              />
            </label>
            <label>
              Duración:
              <input 
                type="text" 
                name="duration" 
                value={newActivityData.duration} 
                onChange={handleCreateModalChange} 
              />
            </label>
            <label>
              Precio:
              <input 
                type="number" 
                name="price" 
                value={newActivityData.price} 
                onChange={handleCreateModalChange} 
              />
            </label>
            <label>
              Requerimientos:
              <textarea 
                name="requirements" 
                value={newActivityData.requirements} 
                onChange={handleCreateModalChange} 
              ></textarea>
            </label>
            <div className="modal-buttons">
              <button onClick={handleCreateActivity}>Crear</button>
              <button onClick={() => setShowCreateModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActDash;