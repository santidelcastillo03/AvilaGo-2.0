import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Add useNavigate
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../../assets/styles/register.css';
import { register } from "./Auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

function Register() {
  const navigate = useNavigate(); 
  const [role, setRole] = useState('');
  const [showModal, setShowModal] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const db = getFirestore();

  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
    setShowModal(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación para estudiantes
    if (role === 'estudiante' && !formData.email.includes('@correo.unimet.edu.ve')) {
      setError('El correo debe pertenecer a @correo.unimet.edu.ve para estudiantes.');
      return;
    }

    try {
      // Registrar usuario y obtener userCredential
      const userCredential = await register(formData.email, formData.password);
      console.log('Usuario registrado exitosamente:', { role, ...formData });
      
      // Guardar datos en Firestore en la colección "users", usando el uid del usuario
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: formData.name,
        email: formData.email,
        uid: userCredential.user.uid,
        role: role
      });

      setSuccess("Registrado exitosamente.");
      setError('');
      
      navigate('/'); 
      
    } catch (error) {
      console.error("Error en el registro:", error.message);
      if (error.code === 'auth/email-already-in-use') {
        setError("El correo ingresado se encuentra en uso.");
      } else {
        setError("Error en el registro, por favor intente nuevamente.");
      }
      setSuccess('');
    }
  };


  return (
    <div className="register-page">
      <Header />
      <section className="register-section">
        <div className="register-container">
          <h2>Registro</h2>
          {role && <p>Registrarse como: <strong>{role}</strong></p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nombre Completo</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Tu nombre"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@mail.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                required
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <button type="submit">Registrarse</button>
            <p className="link-text" style={{ marginTop: '1rem' }}>
              <Link to="/login" className="full-link">
                ¿Ya tienes una cuenta? Inicia sesión aquí.
              </Link>
            </p>
          </form>
        </div>
      </section>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Selecciona tu rol</h2>
            <p>¿Eres Guía o Estudiante?</p>
            <div className="modal-buttons">
              <button onClick={() => handleRoleSelection('guia')}>Guía</button>
              <button onClick={() => handleRoleSelection('estudiante')}>Estudiante</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default Register;