import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import VideoPlayer from './components/VideoPlayer';
import LoginModal from './components/Admin/LoginModal';
import Dashboard from './components/Admin/Dashboard';

// COMPONENTE EXTRA: Lee la categoría de la URL (para las TVs reales)
const ScreenWrapper = () => {
  const { category } = useParams();
  // Decodificamos la URL (por si tiene espacios como "Room%20Service")
  return <VideoPlayer category={decodeURIComponent(category)} />;
};

const InnerApp = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Detectar si estamos en modo "TV Pantalla Completa" (Ruta empieza con /screen)
  const isTVMode = location.pathname.startsWith('/screen');

  const handleLoginSuccess = (token) => {
    localStorage.setItem('token', token);
    setIsAdmin(true);
    setShowLogin(false);
    navigate('/admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAdmin(false);
    navigate('/inicio');
  }

  useEffect(() => {
    if (isAdmin && !location.pathname.startsWith('/admin')) {
      handleLogout();
    }
  }, [location]); 

  const handleAdminClick = () => {
    if (isAdmin) {
      navigate('/admin');
    } else {
      setShowLogin(true);
    }
  };

  return (
    <div className="app-container">
      {/* SOLO mostramos la Sidebar si NO estamos en modo TV */}
      {!isTVMode && <Sidebar onAdminClick={handleAdminClick} />}

      <div className="content-area" style={{ 
          flex: 1, 
          position: 'relative', 
          // Si es modo TV, quitamos el margen para que ocupe todo
          marginLeft: isTVMode ? '0' : '80px' 
      }}>
        <Routes>
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          
          {/* RUTAS DE NAVEGACIÓN (Para que tú veas las previas en tu compu) */}
          <Route path="/inicio" element={<VideoPlayer category="Inicio" />} />
          <Route path="/hh" element={<VideoPlayer category="HH" />} />
          {/* CORREGIDO: Debe coincidir con el Dashboard ("Room Service", no "Service Room") */}
          <Route path="/service-room" element={<VideoPlayer category="Room Service" />} />
          <Route path="/promociones" element={<VideoPlayer category="Promociones" />} />
          <Route path="/clientes" element={<VideoPlayer category="Clientes" />} />

          {/* RUTA DE ADMINISTRADOR */}
          <Route path="/admin" element={isAdmin ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/inicio" />} />

          {/* RUTA PARA LAS TELEVISIONES (Sin sidebar, dinámica) */}
          {/* Ejemplo de uso en la TV: http://localhost:5173/screen/Inicio */}
          <Route path="/screen/:category" element={<ScreenWrapper />} />
        </Routes>
      </div>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={handleLoginSuccess}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <InnerApp />
    </Router>
  );
}

export default App;