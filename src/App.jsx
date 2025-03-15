import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './views/pages/landingPage';
import LogIn from './views/pages/logIn';
import Register from './views/pages/register';
import Rutas from './views/pages/rutas';
import Payment from './views/pages/payment';

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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;