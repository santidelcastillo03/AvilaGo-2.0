import React from 'react';
import '../../assets/styles/adminDash.css'; // Importing the CSS file for styling
import Header from '../components/Header.jsx'; // Importing the existing Header component

const AdminDashboard = () => {
  return (
    <div className="dashboard-container">
      <Header />
      
      <div className="dashboard-content">
        <h1 className="dashboard-title">ADMIN DASHBOARD</h1>
        
        <div className="dashboard-grid">
          {/* First row */}
          <div className="dashboard-card">
            <div className="icon-container">
              <i className="dashboard-icon book-icon"></i>
            </div>
            <button className="dashboard-button">Gestionar Reservas</button>
          </div>
          
          <div className="dashboard-card">
            <div className="icon-container">
              <i className="dashboard-icon user-icon"></i>
            </div>
            <button className="dashboard-button">Gestionar Usuarios</button>
          </div>
          
          <div className="dashboard-card">
            <div className="icon-container">
              <i className="dashboard-icon route-icon"></i>
            </div>
            <button className="dashboard-button">Gestionar Ruta</button>
          </div>
          
          <div className="dashboard-card admin-profile">
            <div className="profile-pic-container">
              <div className="profile-pic"></div>
            </div>
            <div className="admin-info">
              <h2>ADMIN</h2>
              <p className="admin-name">Cristiano Ronado</p>
              <p className="admin-id">V- 77.777.777</p>
              <p className="admin-number">ID: 777777</p>
              <p className="admin-role">Rol: Gestor de Rutas</p>
              <button className="dashboard-button profile-button">Gestionar Perfil</button>
            </div>
          </div>
          
          {/* Second row */}
          <div className="dashboard-card">
            <div className="icon-container">
              <i className="dashboard-icon activity-icon"></i>
            </div>
            <button className="dashboard-button">Gestionar Actividad</button>
          </div>
          
          <div className="dashboard-card">
            <div className="icon-container">
              <i className="dashboard-icon gallery-icon"></i>
            </div>
            <button className="dashboard-button">Gestionar Galeria</button>
          </div>
          
          <div className="dashboard-card">
            <div className="icon-container">
              <i className="dashboard-icon info-icon"></i>
            </div>
            <button className="dashboard-button">Gestionar Información</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;