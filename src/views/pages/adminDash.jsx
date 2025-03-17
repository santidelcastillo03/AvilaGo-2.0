import React from 'react';
import '../../assets/styles/adminDash.css';
import Header from '../components/Header.jsx';

const AdminDashboard = () => {
  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <h1 className="dashboard-title">ADMIN DASHBOARD</h1>
        <div className="dashboard-grid">
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