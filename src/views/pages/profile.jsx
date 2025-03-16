import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../../assets/styles/profile.css';
import { useAuth } from '../../context/AuthContext';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Sample profile image - replace with your actual image path
import defaultProfileImg from '../../assets/images/default-profile.jpg';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // User data state
  const [userData, setUserData] = useState(null);
  
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  
  // State for edited user data
  const [editedData, setEditedData] = useState(null);
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    newsletterSubscription: true,
    activitySharing: false,
    language: "Spanish"
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        setLoading(false);
        setError("No user logged in");
        return;
      }

      try {
        setLoading(true);
        
        const db = getFirestore();
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Set user data from Firestore
          setUserData({
            id: currentUser.uid,
            name: userData.displayName || currentUser.displayName || "User",
            email: currentUser.email,
            phone: userData.phone || "",
            joined: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "Member",
            profileImage: userData.profilePic || currentUser.photoURL || defaultProfileImg,
            role: userData.role || "user"
          });
          
          setEditedData({
            id: currentUser.uid,
            name: userData.displayName || currentUser.displayName || "User",
            email: currentUser.email,
            phone: userData.phone || "",
            joined: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "Member",
            profileImage: userData.profilePic || currentUser.photoURL || defaultProfileImg,
            role: userData.role || "user"
          });
          
          // Set user settings if available
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Set user data from Firestore
            setUserData({
              id: currentUser.uid,
              name: userData.displayName || currentUser.displayName || "User",
              email: currentUser.email,
              phone: userData.phone || "",
              // Remove joined field
              profileImage: userData.profilePic || defaultProfileImg, // Use default image if no profilePic
              role: userData.role || "user"
            });
            
            setEditedData({
              id: currentUser.uid,
              name: userData.displayName || currentUser.displayName || "User",
              email: currentUser.email,
              phone: userData.phone || "",
              // Remove joined field
              profileImage: userData.profilePic || defaultProfileImg, // Use default image if no profilePic
              role: userData.role || "user"
            });
            
            // Set user settings if available
            if (userData.settings) {
              setSettings(userData.settings);
            }
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to fetch user data");
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle toggle settings
  const handleSettingToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  // Handle language change
  const handleLanguageChange = (e) => {
    setSettings(prev => ({
      ...prev,
      language: e.target.value
    }));
  };
  
  // Save profile changes
  const saveChanges = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      const db = getFirestore();
      const userRef = doc(db, "users", currentUser.uid);
      
      // Only save fields that the user is allowed to edit
      await updateDoc(userRef, {
        displayName: editedData.name,
        phone: editedData.phone,
        settings: settings
      });
      
      // If profile image was changed and it's a data URL (new upload)
      if (editedData.profileImage !== userData.profileImage && 
          editedData.profileImage.startsWith('data:')) {
        await uploadProfileImage(editedData.profileImage);
      }
      
      // Update local state
      setUserData({...editedData});
      setEditMode(false);
      setLoading(false);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
      setLoading(false);
    }
  };
  
  // Upload profile image to Firebase Storage
  const uploadProfileImage = async (dataUrl) => {
    if (!currentUser) return null;
    
    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Upload to Firebase Storage
      const storage = getStorage();
      const storageRef = ref(storage, `profileImages/${currentUser.uid}`);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update user doc with new image URL
      const db = getFirestore();
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        profilePic: downloadURL
      });
      
      return downloadURL;
    } catch (error) {
      console.error("Error uploading profile image:", error);
      return null;
    }
  };
  
  // Handle profile image change
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditedData(prev => ({
          ...prev,
          profileImage: e.target.result
        }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // If loading, show loading indicator
  if (loading) {
    return (
      <div className="profile-page">
        <Header />
        <div className="profile-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando perfil...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // If error or no user, show error message
  if (error || !currentUser) {
    return (
      <div className="profile-page">
        <Header />
        <div className="profile-content">
          <div className="error-container">
            <h2>Oops! No se pudo cargar la información del perfil</h2>
            <p>{error || "Debes iniciar sesión para ver tu perfil"}</p>
            <button className="login-button" onClick={() => navigate('/login')}>
              Iniciar sesión
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header />
      
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-title-section">
            <h1>Mi Perfil</h1>
            <p className="user-status">
              {userData.role === 'guia' ? 'Guía' : 
               userData.role === 'admin' ? 'Administrador' : 
               'Usuario'}
            </p>
          </div>
          <button 
            className="edit-button"
            onClick={() => {
              if (editMode) {
                saveChanges();
              } else {
                setEditedData({...userData});
                setEditMode(true);
              }
            }}
          >
            {editMode ? 'Guardar' : 'Editar Perfil'}
          </button>
        </div>
        
        <div className="profile-container">
          {/* User Info Section */}
          <div className="profile-section user-info-section">
            <div className="profile-image-container">
              <img 
                src={editMode ? editedData.profileImage : userData.profileImage} 
                alt="Profile"
                className="profile-image"
              />
              {editMode && (
                <div className="image-upload-overlay">
                  <label htmlFor="image-upload" className="upload-label">
                    Cambiar imagen
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="image-upload-input"
                    />
                  </label>
                </div>
              )}
            </div>
            
            // Update the user details display section

<div className="user-details">
  {editMode ? (
    <>
      <div className="input-group">
        <label>Nombre</label>
        <input 
          type="text"
          name="name" 
          value={editedData.name}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="input-group">
        <label>Email</label>
        <input 
          type="email"
          name="email" 
          value={editedData.email}
          disabled // Email cannot be changed
        />
      </div>
      
      <div className="input-group">
        <label>Teléfono</label>
        <input 
          type="tel"
          name="phone" 
          value={editedData.phone}
          onChange={handleInputChange}
        />
      </div>

      <div className="input-group">
        <label>Rol</label>
        <input 
          type="text"
          value={userData.role === 'guia' ? 'Guía' : userData.role === 'admin' ? 'Administrador' : 'Usuario'}
          disabled // Role cannot be changed by user
        />
      </div>
    </>
  ) : (
    <>
      <h2 className="user-name">{userData.name}</h2>
      <p className="user-email">{userData.email}</p>
      <p className="user-phone">{userData.phone || "No phone number added"}</p>
      <p className="user-role">
        <span className="role-label">Rol: </span>
        <span className={`role-value role-${userData.role}`}>
          {userData.role === 'guia' ? 'Guía' : 
           userData.role === 'admin' ? 'Administrador' : 
           userData.role === 'estudiante' ? 'Estudiante' : 'Usuario'}
        </span>
      </p>
    </>
  )}
</div>
          </div>
          
          {/* Settings Section */}
          <div className="profile-section">
            <h3 className="section-title">Configuración</h3>
            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Notificaciones</h4>
                  <p>Recibir notificaciones sobre eventos y actualizaciones</p>
                </div>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="notifications" 
                    checked={settings.notifications} 
                    onChange={() => handleSettingToggle('notifications')}
                  />
                  <label htmlFor="notifications"></label>
                </div>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Boletín Informativo</h4>
                  <p>Suscripción al boletín mensual</p>
                </div>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="newsletter" 
                    checked={settings.newsletterSubscription} 
                    onChange={() => handleSettingToggle('newsletterSubscription')}
                  />
                  <label htmlFor="newsletter"></label>
                </div>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Compartir Actividades</h4>
                  <p>Permitir que otros usuarios vean tus actividades</p>
                </div>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="sharing" 
                    checked={settings.activitySharing} 
                    onChange={() => handleSettingToggle('activitySharing')}
                  />
                  <label htmlFor="sharing"></label>
                </div>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Idioma</h4>
                  <p>Selecciona tu idioma preferido</p>
                </div>
                <select 
                  value={settings.language}
                  onChange={handleLanguageChange}
                  className="language-select"
                >
                  <option value="Spanish">Español</option>
                  <option value="English">Inglés</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;