import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ActCard from '../components/ActCard.jsx';
import '../../assets/styles/activities.css';

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

const Activities = () => {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        console.log("Fetching activities for route ID:", routeId);
        const db = getFirestore();

        // Primero, obtenemos la info de la ruta
        const routeDocRef = doc(db, 'routes', routeId);
        const routeDocSnap = await getDoc(routeDocRef);

        if (routeDocSnap.exists()) {
          console.log("Route data found:", routeDocSnap.data());
          setRouteInfo(routeDocSnap.data());
        } else {
          console.log("No route found with ID:", routeId);
        }

        // Luego, obtenemos las actividades para esta ruta
        const activitiesCollection = collection(db, 'activities');
        const activitiesQuery = query(activitiesCollection, where("routeId", "==", routeId));
        const activitiesSnapshot = await getDocs(activitiesQuery);

        if (activitiesSnapshot.empty) {
          console.log('No activities found for this route');
          setActivities([]);
        } else {
          console.log("Activities found:", activitiesSnapshot.size);
          const activitiesData = await Promise.all(
            activitiesSnapshot.docs.map(async (docSnap) => {
              const data = docSnap.data();
              const type = data.type || 'Hiking';
              const imageSrc = activityImages[type] || activityImages['default'];
          
              // Log para verificar qué valor trae el campo guideName en la actividad
              console.log(`Activity ${docSnap.id} data.guideName:`, data.guideName);
          
              // Aquí se asume que el campo "guideName" contiene el uid del usuario guía
              const guideId = data.guideName;
              let guideRealName = "Guía no asignado";
              if (guideId && typeof guideId === 'string' && guideId.trim() !== "") {
                try {
                  const userDocRef = doc(db, 'users', guideId);
                  const userDocSnap = await getDoc(userDocRef);
                  if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    console.log(`User data for guideId ${guideId}:`, userData);
                    // Asegúrate de que el documento de usuario contenga el campo 'name'
                    guideRealName = userData.name || guideRealName;
                  } else {
                    console.log(`No se encontró usuario para el guideId ${guideId}`);
                  }
                } catch (error) {
                  console.error(`Error fetching guide data for ID ${guideId}:`, error);
                }
              } else {
                console.log(`El campo guideName está vacío o no es válido para la actividad ${docSnap.id}`);
              }
              console.log(`Activity ${docSnap.id} guideRealName:`, guideRealName);
          
              return {
                id: docSnap.id,
                title: data.title || 'Unnamed Activity',
                description: data.description || '',
                type,
                guideName: guideRealName, // Se almacena el nombre real del guía obtenido de la colección "users"
                rating: data.rating || 0,
                price: data.price || 0,
                capacity: data.capacity || 'No especificada',
                duration: data.duration || 'No especificada',
                requirements: data.requirements || 'No hay requisitos específicos',
                imageSrc,
                routeId
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
  }, [routeId]);

  // Check if we should show the placeholder
  const shouldShowPlaceholder = !loading && !error && activities.length === 0;

  return (
    <div className="activities-container">
      <Header />

      <div className="activities-header">
        <div className="back-link-container">
          <button 
            className="back-link" 
            onClick={() => navigate('/routes')}
          >
            &larr; Volver a las rutas
          </button>
        </div>
        <h1 className="activities-title">
          Actividades{routeInfo ? ` en ${routeInfo.title}` : ''}
        </h1>
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
            <p>No hay actividades programadas para esta ruta en este momento.</p>
          </div>
        ) : (
          <div className="activities-grid">
            {activities.map(activity => (
              <div key={activity.id} className="activity-card-container">
                <ActCard
                  title={activity.title}
                  imageSrc={activity.imageSrc}
                  guideName={activity.guideName}  // Se pasa el nombre real del guía
                  rating={activity.rating}
                  onClick={() => navigate(`/activity/${activity.id}`, { state: activity })}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Activities;