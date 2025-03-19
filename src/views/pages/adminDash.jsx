import React from 'react';
import '../../assets/styles/adminDash.css';
import Header from '../components/Header.jsx';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarCheck, 
  faUsers, 
  faMapMarkedAlt, 
  faHiking, 
  faImages, 
  faComments 
} from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const showDevelopmentToast = () => {
    toast.info("En desarrollo... Esta función estará disponible próximamente.", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <h1 className="dashboard-title">PANEL DE ADMINISTRACIÓN</h1>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="icon-container">
              <FontAwesomeIcon icon={faCalendarCheck} className="dashboard-fontawesome-icon" />
            </div>
            <button 
              className="dashboard-button"
              onClick={showDevelopmentToast}
            >
              Gestionar Reservas
            </button>
          </div>
          
          <div className="dashboard-card">
            <div className="icon-container">
              <FontAwesomeIcon icon={faUsers} className="dashboard-fontawesome-icon" />
            </div>
            <button 
              className="dashboard-button"
              onClick={() => handleNavigation('/admin/users')}
            >
              Gestionar Usuarios
            </button>
          </div>
          
          <div className="dashboard-card">
            <div className="icon-container">
              <FontAwesomeIcon icon={faMapMarkedAlt} className="dashboard-fontawesome-icon" />
            </div>
            <button 
              className="dashboard-button"
              onClick={() => handleNavigation('/admin/routes')}
            >
              Gestionar Rutas
            </button>
          </div>
          
          <div className="dashboard-card">
            <div className="icon-container">
              <FontAwesomeIcon icon={faHiking} className="dashboard-fontawesome-icon" />
            </div>
            <button 
              className="dashboard-button"
              onClick={() => handleNavigation('/activitydashboard')}
            >
              Gestionar Actividades
            </button>
          </div>
          
          <div className="dashboard-card">
            <div className="icon-container">
              <FontAwesomeIcon icon={faImages} className="dashboard-fontawesome-icon" />
            </div>
            <button 
              className="dashboard-button"
              onClick={showDevelopmentToast}
            >
              Gestionar Galería
            </button>
          </div>
          
          <div className="dashboard-card">
            <div className="icon-container">
              <FontAwesomeIcon icon={faComments} className="dashboard-fontawesome-icon" />
            </div>
            <button 
              className="dashboard-button"
              onClick={showDevelopmentToast}
            >
              Gestionar Foro
            </button>
          </div>
        </div>
        
        {/* Toast Container */}
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div>
  );
};

export default AdminDashboard;