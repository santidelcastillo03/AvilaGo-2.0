import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import defaultProfileImg from '../../assets/images/default-profile.jpg';
import '../../assets/styles/header.css';
import { useAuth } from '../../context/AuthContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

function Header() {
  const { currentUser, logout } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [profilePic, setProfilePic] = useState(defaultProfileImg);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role);
            
            // If user has a profile picture, use it
            if (userData.profilePic) {
              setProfilePic(userData.profilePic);
            }
          } else {
            setUserRole(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
        setProfilePic(defaultProfileImg);
      }
    };
    
    fetchUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <header className="landing-header">
      <div className="landing-header-logo">
        <Link to="/">
          <img src={logo} alt="UNIMET AvilaGo Logo" />
        </Link>
      </div>
      <nav className="landing-nav">
        <ul>
          <li><Link to="/routes">Rutas</Link></li>
          <li><Link to="/forum">Foro</Link></li>
          <li><Link to="/gallery">Galería</Link></li>
          
          {currentUser && userRole === 'estudiante' && (
            <li><Link to="/reservations">Reservas</Link></li>
          )}
          
          {currentUser && userRole === 'guia' && (
            <li><Link to="/activities">Mis Actividades</Link></li>
          )}
        </ul>
      </nav>
      <div className="landing-nav-right">
        <div className="search-icon">
          <i className="fa fa-search"></i>
        </div>
        <a href="#">Contact us</a>
        <a href="#">About us</a>
        <a href="#">FAQ</a>
        
        <div className="auth-buttons">
          {currentUser ? (
            <>
              <Link to="/profile" className="profile-link">
                <img 
                  src={profilePic} 
                  alt="Profile" 
                  className="profile-pic" 
                />
              </Link>
              <button onClick={handleLogout} className="auth-btn logout-btn">
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="auth-btn login-btn">
                Iniciar sesión
              </Link>
              <Link to="/register" className="auth-btn register-btn">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;