import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faSearch, 
  faComments, 
  faEye, 
  faUser,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import '../../assets/styles/forum.css';

const Forum = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTopicData, setNewTopicData] = useState({
    title: '',
    description: ''
  });
  const [userProfiles, setUserProfiles] = useState({});

  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      try {
        const db = getFirestore();
        const topicsCollection = collection(db, 'forumTopics');
        const topicsQuery = query(topicsCollection, orderBy('createdAt', 'desc'));
        const topicsSnapshot = await getDocs(topicsQuery);
        
        const topicsData = [];
        for (const topicDoc of topicsSnapshot.docs) {
          const data = topicDoc.data();
          
          if (data.userId && !userProfiles[data.userId]) {
            try {
              const userDoc = await getDoc(doc(db, 'users', data.userId));
              if (userDoc.exists()) {
                setUserProfiles(prev => ({
                  ...prev,
                  [data.userId]: userDoc.data()
                }));
              }
            } catch (err) {
              console.error('Error fetching user profile:', err);
            }
          }
          
          topicsData.push({
            id: topicDoc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
          });
        }
        
        setTopics(topicsData);
      } catch (err) {
        console.error('Error fetching topics:', err);
        setError('Error al cargar los temas. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopics();
  }, []);
  
  const handleCreateTopic = async () => {
    if (!currentUser) {
      navigate('/login', { 
        state: { 
          message: 'Por favor inicia sesión para crear un tema.',
          redirect: '/forum'
        }
      });
      return;
    }
    
    if (!newTopicData.title.trim()) {
      alert('Por favor ingresa un título para el tema.');
      return;
    }
    
    try {
      const db = getFirestore();
      const newTopic = {
        title: newTopicData.title.trim(),
        description: newTopicData.description.trim(),
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Usuario',
        commentCount: 0,
        viewCount: 0,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'forumTopics'), newTopic);
      
      setTopics(prevTopics => [
        {
          id: docRef.id,
          ...newTopic,
          createdAt: new Date()
        },
        ...prevTopics
      ]);
      
      setNewTopicData({ title: '', description: '' });
      setShowNewTopicModal(false);
    } catch (error) {
      console.error('Error creating topic:', error);
      alert('Error al crear el tema. Por favor, inténtalo de nuevo.');
    }
  };
  
  const filteredTopics = topics.filter(topic => 
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="forum-page">
      <Header />
      
      <div className="forum-container">
        <div className="forum-header">
          <h1 className="forum-title">Foro de Discusión</h1>
          <p className="forum-subtitle">Comparte experiencias y resuelve dudas con la comunidad</p>
        </div>
        
        <div className="forum-controls">
          <div className="search-container">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar temas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <button 
            className="create-topic-button"
            onClick={() => setShowNewTopicModal(true)}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Crear nuevo tema</span>
          </button>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando temas...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={() => window.location.reload()}>Intentar nuevamente</button>
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="no-topics-message">
            {searchTerm ? (
              <p>No se encontraron temas que coincidan con "{searchTerm}"</p>
            ) : (
              <p>No hay temas disponibles. ¡Sé el primero en crear uno!</p>
            )}
          </div>
        ) : (
          <div className="topics-list">
            <div className="topics-header">
              <div className="topic-column title-column">Tema</div>
              <div className="topic-column stats-column">Estadísticas</div>
            </div>
            
            {filteredTopics.map(topic => (
              <div 
                key={topic.id} 
                className="topic-item"
                onClick={() => navigate(`/forum/topic/${topic.id}`)}
              >
                <div className="topic-main">
                  <h3 className="topic-title">{topic.title}</h3>
                  <p className="topic-description">{topic.description}</p>
                  <div className="topic-author">
                    <FontAwesomeIcon icon={faUser} />
                    <span>{userProfiles[topic.userId]?.name || userProfiles[topic.userId]?.displayName || topic.userName || 'Usuario'}</span>
                  </div>
                </div>
                
                <div className="topic-stats">
                  <div className="stats-item">
                    <FontAwesomeIcon icon={faComments} />
                    <span>{topic.commentCount || 0} comentarios</span>
                  </div>
                  <div className="stats-item">
                    <FontAwesomeIcon icon={faEye} />
                    <span>{topic.viewCount || 0} vistas</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* New Topic Modal */}
      {showNewTopicModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Crear nuevo tema</h2>
              <button 
                className="close-modal-button"
                onClick={() => setShowNewTopicModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="topic-title">Título *</label>
                <input
                  type="text"
                  id="topic-title"
                  value={newTopicData.title}
                  onChange={(e) => setNewTopicData({...newTopicData, title: e.target.value})}
                  placeholder="Escribe un título descriptivo"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="topic-description">Descripción</label>
                <textarea
                  id="topic-description"
                  value={newTopicData.description}
                  onChange={(e) => setNewTopicData({...newTopicData, description: e.target.value})}
                  placeholder="Proporciona más detalles sobre tu tema (opcional)"
                  rows={5}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="cancel-button"
                onClick={() => setShowNewTopicModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="create-button"
                onClick={handleCreateTopic}
              >
                Crear tema
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Forum;