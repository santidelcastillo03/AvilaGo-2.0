import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../../assets/styles/profile.css';
import { useAuth } from '../../context/AuthContext';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';

// Imagen de perfil por defecto
import defaultProfileImg from '../../assets/images/default-profile.jpg';

// Inicializar cliente de Supabase
const supabaseUrl = 'https://xdrrczaeqgsuuxcolvos.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkcnJjemFlcWdzdXV4Y29sdm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODU5NTQsImV4cCI6MjA1Nzc2MTk1NH0.JFqLtvXUHW6ah8A-YhM_G2oJty_dH-Weoc8Isx6koHA';
const supabase = createClient(supabaseUrl, supabaseKey);

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Referencia al input de archivo oculto
  const fileInputRef = useRef(null);

  // User data state
  const [userData, setUserData] = useState({
    id: '',
    name: 'Usuario',
    email: '',
    phone: '',
    joined: 'Nuevo miembro',
    profileImage: defaultProfileImg,
    role: 'user'
  });

  // Edit mode state
  const [editMode, setEditMode] = useState(false);

  // State for edited user data
  const [editedData, setEditedData] = useState({
    id: '',
    name: 'Usuario',
    email: '',
    phone: '',
    joined: 'Nuevo miembro',
    profileImage: defaultProfileImg,
    role: 'user'
  });

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
          const userDataFromFirestore = userDoc.data();

          setUserData({
            id: currentUser.uid,
            name: userDataFromFirestore.displayName || currentUser.displayName || "User",
            email: currentUser.email,
            phone: userDataFromFirestore.phone || "",
            joined: userDataFromFirestore.createdAt ? new Date(userDataFromFirestore.createdAt).toLocaleDateString() : "Member",
            profileImage: userDataFromFirestore.profilePic || currentUser.photoURL || defaultProfileImg,
            role: userDataFromFirestore.role || "user"
          });

          setEditedData({
            id: currentUser.uid,
            name: userDataFromFirestore.displayName || currentUser.displayName || "User",
            email: currentUser.email,
            phone: userDataFromFirestore.phone || "",
            joined: userDataFromFirestore.createdAt ? new Date(userDataFromFirestore.createdAt).toLocaleDateString() : "Member",
            profileImage: userDataFromFirestore.profilePic || currentUser.photoURL || defaultProfileImg,
            role: userDataFromFirestore.role || "user"
          });

          if (userDataFromFirestore.settings) {
            setSettings(userDataFromFirestore.settings);
          }
        } else {
          const defaultUserData = {
            id: currentUser.uid,
            name: currentUser.displayName || "User",
            email: currentUser.email,
            phone: "",
            joined: "New Member",
            profileImage: currentUser.photoURL || defaultProfileImg,
            role: "user"
          };

          setUserData(defaultUserData);
          setEditedData(defaultUserData);
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

      await updateDoc(userRef, {
        displayName: editedData.name,
        phone: editedData.phone,
        settings: settings
      });

      setUserData({ ...editedData });
      setEditMode(false);
      setLoading(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
      setLoading(false);
    }
  };

  // Trigger file input click
  const handleChangePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection for Supabase Storage (sin requerir autenticación)
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
  
    // Validar tipo de archivo
    if (!selectedFile.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen.');
      return;
    }
  
    // Validar tamaño del archivo (máx 2MB)
    if (selectedFile.size > 2 * 1024 * 1024) {
      alert('La imagen es demasiado grande. El tamaño máximo es 2MB.');
      return;
    }
  
    try {
      setUploadingImage(true);
      console.log("Iniciando subida de imagen a Supabase...");
  
      // Construir nombre y ruta para el archivo en Supabase
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${currentUser.uid}_${Date.now()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;
  
      // Subir archivo al bucket "user-photos"
      const { data, error } = await supabase
        .storage
        .from('user-photos')
        .upload(filePath, selectedFile, { upsert: true });
  
      if (error) {
        throw error;
      }
      console.log("Archivo subido. Obteniendo URL pública...");
  
      // Obtener la URL pública
      const { data: publicUrlData, error: publicUrlError } = supabase
        .storage
        .from('user-photos')
        .getPublicUrl(filePath);
      if (publicUrlError) {
        throw publicUrlError;
      }
      const imageUrl = publicUrlData.publicUrl;
      console.log("URL de la imagen:", imageUrl);
  
      // Actualizar Firestore con la URL de la imagen
      const db = getFirestore();
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, { profilePic: imageUrl });
  
      // Actualizar el estado local
      setEditedData(prev => ({ ...prev, profileImage: imageUrl }));
      setUserData(prev => ({ ...prev, profileImage: imageUrl }));
  
      alert('Imagen de perfil actualizada exitosamente!');
    } catch (err) {
      console.error("Error al subir la imagen:", err);
      alert(`Error al subir la imagen: ${err.message}`);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
                setEditedData({ ...userData });
                setEditMode(true);
              }
            }}
          >
            {editMode ? 'Guardar' : 'Editar Perfil'}
          </button>
        </div>
        <div className="profile-container">
          <div className="profile-section user-info-section">
            <div className="profile-image-container">
              <img 
                src={editMode ? editedData.profileImage : userData.profileImage} 
                alt="Profile"
                className="profile-image"
                onError={(e) => { e.target.src = defaultProfileImg; }}
              />
              {uploadingImage && <div className="uploading-overlay">Subiendo...</div>}
            </div>
            {editMode && (
              <div className="change-photo-container">
                <button 
                  className="change-photo-btn"
                  onClick={handleChangePhotoClick}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? 'Subiendo...' : 'Cambiar imagen de perfil'}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            )}
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
                      disabled
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
                      disabled
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