import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './views/pages/landingPage';
import LogIn from './views/pages/logIn';
import Register from './views/pages/register';
import Rutas from './views/pages/rutas';
import Payment from './views/pages/payment';
import Gallery from './views/pages/gallery';
import Profile from './views/pages/profile';
import RutaInfo from './views/pages/rutasInfo';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} /> 
          <Route path="/login" element={<LogIn />} /> 
          <Route path="/routes" element={<Rutas />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/rutainfo" element={<RutaInfo />} /> 
          {/* Puedes agregar más rutas aquí según sea necesario */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;