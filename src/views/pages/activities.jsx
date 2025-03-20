import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ActCard from '../components/ActCard.jsx';
import '../../assets/styles/activities.css';

// Import activity images
import hikingImage from '../../assets/images/Hiking1.jpg';
import campingImage from '../../assets/images/Camping1.jpg';
import yogaImage from '../../assets/images/Yoga1.jpg';
import birdwatchingImage from '../../assets/images/Birds1.jpeg';
import photographyImage from '../../assets/images/Photo1.jpg';

// Activity type to image mapping
const activityImages = {
  'Senderismo': hikingImage,
  'Cámping': campingImage,
  'Yoga': yogaImage,
  'Observación de aves': birdwatchingImage,
  'Fotografía': photographyImage,
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
              
              // Fetch available dates for this activity
              let availableDates = [];
              let availableTimes = [];
              
              try {
                // Get dates from the 'activity_dates' subcollection
                const datesCollectionRef = collection(db, 'activities', docSnap.id, 'dates');
                const datesSnapshot = await getDocs(datesCollectionRef);
                
                if (!datesSnapshot.empty) {
                  console.log(`Found ${datesSnapshot.size} dates for activity ${docSnap.id}`);
                  
                  // Extract dates and times
                  // Inside your datesSnapshot.forEach loop
datesSnapshot.forEach(dateDoc => {
  const dateData = dateDoc.data();
  if (dateData.date) {
    // Convert the date field
    if (dateData.date.toDate) {
      availableDates.push(dateData.date.toDate());
    } else if (typeof dateData.date === 'string') {
      availableDates.push(new Date(dateData.date));
    }
    
    // Convert the time field if available
    if (dateData.time) {
      // If time is a Firestore timestamp, convert it
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
                  
                  // Sort dates chronologically
                  availableDates.sort((a, b) => a - b);
                  
                } else {
                  console.log(`No dates found for activity ${docSnap.id}`);
                }
              } catch (error) {
                console.error(`Error fetching dates for activity ${docSnap.id}:`, error);
              }
              
              // If no dates in subcollection, check if there's a single date field on the activity
              if (availableDates.length === 0 && data.date) {
                if (data.date.toDate) {
                  availableDates.push(data.date.toDate());
                } else if (typeof data.date === 'string') {
                  availableDates.push(new Date(data.date));
                }
                
                // Check for a time field too
                if (data.time) {
                  availableTimes.push(data.time);
                }
              }
          
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
                routeId,
                availableDates,
                availableTimes
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
  
  // Format date for display
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
            {activities.map(activity => {
  let dateDisplay = 'Fechas flexibles';

  if (activity.availableDates && activity.availableDates.length > 0) {
    // Combine available dates and times into a single array of objects
    const schedule = activity.availableDates.map((date, i) => ({
      date,
      time: activity.availableTimes && activity.availableTimes[i] ? activity.availableTimes[i] : null
    }));

    const now = new Date();
    // Filter for future schedules
    const futureSchedule = schedule.filter(s => s.date > now);

    if (futureSchedule.length > 0) {
      // Sort by date and pick the nearest one
      futureSchedule.sort((a, b) => a.date - b.date);
      const nearest = futureSchedule[0];
      dateDisplay = formatDate(nearest.date, nearest.time);
    } else {
      // If no future dates, sort by descending order and use the most recent past date
      schedule.sort((a, b) => b.date - a.date);
      const recent = schedule[0];
      dateDisplay = `Finalizado: ${formatDate(recent.date, recent.time)}`;
    }
  }

  return (
    <div key={activity.id} className="activity-card-container">
      <ActCard
        title={activity.title}
        imageSrc={activity.imageSrc}
        guideName={activity.guideName}
        rating={activity.rating}
        date={dateDisplay}
        onClick={() => navigate(`/activity/${activity.id}`, { 
          state: {
            ...activity,
            availableDates: activity.availableDates ? 
              activity.availableDates.map(d => d.toISOString()) : 
              [],
            availableTimes: activity.availableTimes || []
          }
        })}
      />
    </div>
  );
})}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Activities;