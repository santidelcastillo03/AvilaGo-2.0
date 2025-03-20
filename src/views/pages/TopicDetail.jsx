import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getFirestore, doc, getDoc, collection, addDoc, getDocs, query, orderBy, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faClock, 
  faReply, 
  faExclamationTriangle,
  faChevronLeft
} from '@fortawesome/free-solid-svg-icons';
import '../../assets/styles/forum.css';

const TopicDetail = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [topic, setTopic] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfiles, setUserProfiles] = useState({});
  
  useEffect(() => {
    const fetchTopicAndComments = async () => {
      setLoading(true);
      try {
        const db = getFirestore();
        
        const topicRef = doc(db, 'forumTopics', topicId);
        const topicSnap = await getDoc(topicRef);
        
        if (!topicSnap.exists()) {
          setError('El tema no existe o ha sido eliminado.');
          setLoading(false);
          return;
        }
        
        const topicData = {
          id: topicSnap.id,
          ...topicSnap.data(),
          createdAt: topicSnap.data().createdAt?.toDate() || new Date(),
          lastActivity: topicSnap.data().lastActivity?.toDate() || new Date()
        };
        
        setTopic(topicData);
        
        await updateDoc(topicRef, {
          viewCount: increment(1)
        });
        
        if (topicData.userId) {
          try {
            const userDoc = await getDoc(doc(db, 'users', topicData.userId));
            if (userDoc.exists()) {
              setUserProfiles(prev => ({
                ...prev,
                [topicData.userId]: userDoc.data()
              }));
            }
          } catch (err) {
            console.error('Error fetching user profile:', err);
          }
        }
        
        const commentsQuery = query(
          collection(db, 'forumTopics', topicId, 'comments'),
          orderBy('createdAt', 'asc')
        );
        
        const commentsSnapshot = await getDocs(commentsQuery);
        const commentsData = [];
        
        for (const commentDoc of commentsSnapshot.docs) {
          const data = commentDoc.data();
          
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
          
          commentsData.push({
            id: commentDoc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date()
          });
        }
        
        setComments(commentsData);
      } catch (err) {
        console.error('Error fetching topic and comments:', err);
        setError('Error al cargar el tema y comentarios. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    if (topicId) {
      fetchTopicAndComments();
    }
  }, [topicId]);
  
  const handlePostComment = async () => {
    if (!currentUser) {
      navigate('/login', { 
        state: { 
          message: 'Por favor inicia sesión para comentar.',
          redirect: `/forum/topic/${topicId}`
        }
      });
      return;
    }
    
    if (!newComment.trim()) {
      alert('Por favor escribe un comentario.');
      return;
    }
    
    try {
      const db = getFirestore();
      const commentData = {
        text: newComment.trim(),
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Usuario',
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(
        collection(db, 'forumTopics', topicId, 'comments'), 
        commentData
      );
      
      await updateDoc(doc(db, 'forumTopics', topicId), {
        lastActivity: serverTimestamp(),
        commentCount: increment(1)
      });
      
      setComments([
        ...comments, 
        {
          id: docRef.id,
          ...commentData,
          createdAt: new Date()
        }
      ]);
      
      setTopic(prev => ({
        ...prev,
        lastActivity: new Date(),
        commentCount: (prev.commentCount || 0) + 1
      }));
      
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Error al publicar el comentario. Por favor, inténtalo de nuevo.');
    }
  };
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getUserDisplayName = (userId, userName) => {
    if (userProfiles[userId]) {
      return userProfiles[userId].name || userProfiles[userId].displayName || userName || 'Usuario';
    }
    return userName || 'Usuario';
  };
  
  const getUserProfilePic = (userId) => {
    if (userProfiles[userId] && userProfiles[userId].profilePic) {
      return userProfiles[userId].profilePic;
    }
    return null; 
  };

  return (
    <div className="topic-detail-page">
      <Header />
      
      <div className="topic-detail-container">
        <button 
          className="back-button"
          onClick={() => navigate('/forum')}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
          <span>Volver al foro</span>
        </button>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando tema...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/forum')} className="back-to-forum-button">
              Volver al foro
            </button>
          </div>
        ) : topic ? (
          <>
            <div className="topic-header">
              <h1 className="topic-title">{topic.title}</h1>
              {topic.description && (
                <p className="topic-description">{topic.description}</p>
              )}
              <div className="topic-meta">
                <div className="topic-author">
                  <div className="avatar">
                    {getUserProfilePic(topic.userId) ? (
                      <img 
                        src={getUserProfilePic(topic.userId)} 
                        alt={getUserDisplayName(topic.userId, topic.userName)} 
                      />
                    ) : (
                      <div className="default-avatar">
                        {getUserDisplayName(topic.userId, topic.userName).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="author-info">
                    <span className="author-name">{getUserDisplayName(topic.userId, topic.userName)}</span>
                    <span className="post-date">
                      <FontAwesomeIcon icon={faClock} />
                      {formatDate(topic.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="comments-section">
              <h2 className="comments-title">
                {comments.length === 0 ? 'No hay comentarios aún' : 
                 comments.length === 1 ? '1 comentario' : 
                 `${comments.length} comentarios`}
              </h2>
              
              {comments.length > 0 && (
                <div className="comments-list">
                  {comments.map(comment => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-author">
                        <div className="avatar">
                          {getUserProfilePic(comment.userId) ? (
                            <img 
                              src={getUserProfilePic(comment.userId)} 
                              alt={getUserDisplayName(comment.userId, comment.userName)} 
                            />
                          ) : (
                            <div className="default-avatar">
                              {getUserDisplayName(comment.userId, comment.userName).charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="author-info">
                          <span className="author-name">{getUserDisplayName(comment.userId, comment.userName)}</span>
                          <span className="comment-date">
                            <FontAwesomeIcon icon={faClock} />
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="comment-content">
                        <p>{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="reply-section">
                <h3 className="reply-title">
                  <FontAwesomeIcon icon={faReply} />
                  Responder
                </h3>
                <div className="reply-form">
                  <textarea
                    className="reply-input"
                    placeholder={currentUser ? "Escribe tu comentario aquí..." : "Inicia sesión para comentar"}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={!currentUser}
                    rows={5}
                  ></textarea>
                  <div className="reply-actions">
                    {currentUser ? (
                      <button 
                        className="post-comment-button"
                        onClick={handlePostComment}
                        disabled={!newComment.trim()}
                      >
                        Publicar comentario
                      </button>
                    ) : (
                      <button 
                        className="login-to-comment-button"
                        onClick={() => navigate('/login', { 
                          state: { 
                            message: 'Por favor inicia sesión para comentar.',
                            redirect: `/forum/topic/${topicId}`
                          }
                        })}
                      >
                        Iniciar sesión para comentar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="error-container">
            <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
            <h2>Tema no encontrado</h2>
            <p>El tema que buscas no existe o ha sido eliminado.</p>
            <button onClick={() => navigate('/forum')} className="back-to-forum-button">
              Volver al foro
            </button>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default TopicDetail;