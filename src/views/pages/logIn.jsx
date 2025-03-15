import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../../assets/styles/logIn.css';
import { login } from "./Auth";
import googleLogo from '../../assets/images/googleLogo.png'; 
import { sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../services/firebaseConfig.js';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errorModal, setErrorModal] = useState('');

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Se ha enviado un correo para restablecer tu contraseña.');
      setErrorModal('');
    } catch (error) {
      console.error(error);
      setErrorModal('Error al enviar el correo. Intenta de nuevo.');
      setMessage('');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Recuperar Contraseña</h2>
        <p>Ingresa tu correo electrónico para restablecer tu contraseña.</p>
        <form onSubmit={handleSubmitModal}>
          <input
            type="email"
            placeholder="ejemplo@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {errorModal && <p className="error-message">{errorModal}</p>}
          {message && <p className="success-message">{message}</p>}
          <button type="submit">Enviar</button>
        </form>
        <button onClick={onClose} className="close-button">X</button>
      </div>
    </div>
  );
}

function GoogleProfileModal({ onClose, onSubmit, userEmail }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !role) return;
    onSubmit({ name, role });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Completa tu perfil</h2>
        <p>Ingresa tu nombre y selecciona tu rol para completar el registro.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            
            <input
              type="text"
              id="googleName"
              name="googleName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre Completo"
              required
            />
          </div>
          <div className="form-group">
            
            <div className="modal-buttons">
              <button type="button" onClick={() => setRole('guia')}>
                Guía
              </button>
              <button 
                type="button" 
                onClick={() => setRole('estudiante')}
                disabled={!userEmail.endsWith('@correo.unimet.edu.ve')}
                title={
                  userEmail.endsWith('@correo.unimet.edu.ve')
                    ? ''
                    : 'Correo no permitido para estudiantes'
                }
              >
                Estudiante
              </button>
            </div>
            {role && <p>Seleccionado: <strong>{role}</strong></p>}
          </div>
          <button type="submit">Guardar</button>
        </form>
        <button onClick={onClose} className="close-button">X</button>
      </div>
    </div>
  );
}

function LogIn() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const navigate = useNavigate();
  const db = getFirestore();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await login(credentials.email, credentials.password);
      console.log('Logged in user:', userCredential.user);
      setError('');
      navigate('/');
    } catch (err) {
      console.error('Error during login:', err);
      setError("Correo o contrasena invalida, verifica los datos e intente de nuevo.");
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('Google user:', result.user);
      // Verificar si ya existe en la colección "users"
      const userRef = doc(db, "users", result.user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        // Usuario ya registrado, navegar a la ruta principal
        setError('');
        navigate('/');
      } else {
        // Primer login, se debe completar el perfil
        setGoogleUser(result.user);
        setShowGoogleModal(true);
      }
    } catch (err) {
      console.error('Error with Google sign in:', err);
      setError("Error al iniciar sesión con Google.");
    }
  };

  const handleGoogleProfileSubmit = async ({ name, role }) => {
    try {
      // Guardar en Firestore los datos del usuario con Google
      await setDoc(doc(db, "users", googleUser.uid), {
        name: name,
        email: googleUser.email,
        uid: googleUser.uid,
        role: role
      });
      setShowGoogleModal(false);
      setError('');
      navigate('/');
    } catch (err) {
      console.error('Error saving Google profile:', err);
      setError("Error al guardar el perfil de Google.");
    }
  };

  return (
    <div className="login-page">
      <Header />
      <section className="login-section">
        <div className="login-container">
          <h2>Iniciar Sesión</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
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
                value={credentials.password}
                onChange={handleChange}
                placeholder="********"
                required
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit">Acceder</button>
            <button type="button" onClick={signInWithGoogle} className="google-btn">
              <img src={googleLogo} alt="Google logo" className="google-icon" />
              Iniciar sesión con Google
            </button>
            <p className="link-text" style={{ marginTop: '1rem' }}>
              <Link to="/register" className="full-link">
                ¿No tienes una cuenta? Regístrate aquí.
              </Link>
            </p>
          </form>
          <p className="link-text" style={{ marginTop: '1rem', textAlign: 'center' }}>
            <span
              onClick={() => setShowForgotModal(true)}
              style={{ color: '#000', textDecoration: 'underline', cursor: 'pointer' }}
            >
              ¿Olvidaste tu contraseña?
            </span>
          </p>
        </div>
      </section>
      {showForgotModal && <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />}
      {showGoogleModal && (
        <GoogleProfileModal 
          onClose={() => setShowGoogleModal(false)}
          onSubmit={handleGoogleProfileSubmit}
          userEmail={googleUser.email}
        />
      )}
      <Footer />
    </div>
  );
}

export default LogIn;