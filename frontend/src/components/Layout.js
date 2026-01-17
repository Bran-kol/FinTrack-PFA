import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Tableau de Bord';
      case '/transactions': return 'Transactions';
      case '/budget': return 'Budget';
      default: return 'FinTrack';
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-logo">
            <span className="logo-icon">💎</span>
            FinTrack
          </h1>
          <button className="sidebar-close" onClick={closeSidebar}>
            ✕
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section-title">Menu Principal</div>
          
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <span className="nav-icon">📊</span>
            <span className="nav-text">Tableau de Bord</span>
          </NavLink>
          
          <NavLink to="/transactions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <span className="nav-icon">💳</span>
            <span className="nav-text">Transactions</span>
          </NavLink>
          
          <NavLink to="/budget" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <span className="nav-icon">🎯</span>
            <span className="nav-text">Budget</span>
          </NavLink>
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">→</span>
            Déconnexion
          </button>
        </div>
      </aside>
      
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
      
      <main className="main-content">
        <header className="main-header">
          <button className="menu-toggle" onClick={toggleSidebar}>
            ☰
          </button>
          <div className="header-info">
            <h2 className="page-title">{getPageTitle()}</h2>
            <span className="header-greeting">{getGreeting()}, {user?.name?.split(' ')[0]} !</span>
          </div>
          <div className="header-actions">
            <span className="header-date">
              {currentTime.toLocaleDateString('fr-FR', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </header>
        <div className="main-body">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
