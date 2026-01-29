import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import VideoPlayer from './components/VideoPlayer';
import LoginModal from './components/Admin/LoginModal';
import Dashboard from './components/Admin/Dashboard';

const ScreenWrapper = () => {
  const { category } = useParams();
  return <VideoPlayer category={decodeURIComponent(category)} />;
};

const InnerApp = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
      {!isTVMode && <Sidebar onAdminClick={handleAdminClick} />}

      <div className="content-area" style={{ 
          flex: 1, 
          position: 'relative', 
          marginLeft: isTVMode ? '0' : '80px' 
      }}>
        <Routes>
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          
          <Route path="/inicio" element={<VideoPlayer category="Inicio" />} />
          <Route path="/hh" element={<VideoPlayer category="HH" />} />
          <Route path="/service-room" element={<VideoPlayer category="Room Service" />} />
          <Route path="/promociones" element={<VideoPlayer category="Promociones" />} />
          <Route path="/clientes" element={<VideoPlayer category="Clientes" />} />

          <Route path="/admin" element={isAdmin ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/inicio" />} />

         
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