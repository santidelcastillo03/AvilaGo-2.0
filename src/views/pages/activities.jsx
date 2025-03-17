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
        
        // First, get the route info using the newer syntax
        const routeDocRef = doc(db, 'routes', routeId);
        const routeDocSnap = await getDoc(routeDocRef);
        
        if (routeDocSnap.exists()) {
          console.log("Route data found:", routeDocSnap.data());
          setRouteInfo(routeDocSnap.data());
        } else {
          console.log("No route found with ID:", routeId);
        }
        
        // Then get activities for this route
        const activitiesCollection = collection(db, 'activities');
        const activitiesQuery = query(
          activitiesCollection, 
          where("routeId", "==", routeId)
        );
        
        const activitiesSnapshot = await getDocs(activitiesQuery);
        
        if (activitiesSnapshot.empty) {
          console.log('No activities found for this route');
          setActivities([]);
        } else {
          console.log("Activities found:", activitiesSnapshot.size);
          const activitiesData = activitiesSnapshot.docs.map((doc) => {
            const data = doc.data();
            const type = data.type || 'Hiking';
            const imageSrc = activityImages[type] || activityImages['default'];
            
            // Store guideId if available but don't use it for click functionality
            const guideId = data.guideId || null;
            
            return {
              id: doc.id,
              title: data.title || 'Unnamed Activity',
              description: data.description || '',
              type,
              guideName: data.guideName || 'Guía no asignado',
              guideId, // Still store the ID for reference
              rating: data.rating || 0,
              // Removed date attribute as it will be handled by reservations
              price: data.price || 0,
              capacity: data.capacity || 'No especificada',
              duration: data.duration || 'No especificada',
              requirements: data.requirements || 'No hay requisitos específicos',
              imageSrc,
              routeId
            };
          });
          
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
                  guideName={activity.guideName}
                  // Not passing guideId to ActCard since we don't need click functionality
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