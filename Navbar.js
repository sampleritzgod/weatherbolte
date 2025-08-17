import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Sun, 
  LogOut, 
  User, 
  History, 
  Search, 
  Menu, 
  X,
  Home,
  Settings,
  Bell
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [screenSize, setScreenSize] = useState('desktop');

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const navigationItems = [
    { icon: Home, label: 'Dashboard', path: '/', color: '#3b82f6' },
    { icon: Search, label: 'Search', path: '/search', color: '#10b981' },
    { icon: History, label: 'History', path: '/history', color: '#f59e0b' },
    { icon: User, label: 'Profile', path: '/profile', color: '#8b5cf6' },
  ];

  const isActivePath = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <div 
            className="logo-container"
            onClick={() => handleNavigation('/')}
          >
            <div className="logo-icon">
              <Sun size={screenSize === 'mobile' ? 20 : 24} color="white" />
            </div>
            <span className="logo-text">
              {screenSize === 'mobile' ? 'Weather' : 'WeatherApp'}
            </span>
          </div>

          {/* Desktop/Tablet Navigation */}
          {screenSize !== 'mobile' && (
            <div className="desktop-nav">
              {isAuthenticated && user && (
                <>
                  <div className="nav-items">
                    {navigationItems.map((item) => (
                      <button 
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        className={`nav-btn ${isActivePath(item.path) ? 'active' : ''}`}
                        style={{
                          '--item-color': item.color
                        }}
                      >
                        <item.icon size={18}/> 
                        {screenSize === 'desktop' && <span>{item.label}</span>}
                      </button>
                    ))}
                  </div>
                  
                  <div className="nav-divider" />

                  <div className="user-section">
                    <div className="user-avatar">
                      {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    {screenSize === 'desktop' && (
                      <span className="username">{user.username || 'User'}</span>
                    )}
                  </div>

                  <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={18}/> 
                    {screenSize === 'desktop' && <span>Logout</span>}
                  </button>
                </>
              )}
              
              {!isAuthenticated && (
                <div className="auth-buttons">
                  <button 
                    onClick={() => handleNavigation('/login')} 
                    className="login-btn"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => handleNavigation('/register')} 
                    className="register-btn"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          {screenSize === 'mobile' && (
            <div className="mobile-controls">
              {isAuthenticated && user && (
                <div className="mobile-user-avatar">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="mobile-menu-btn"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && screenSize === 'mobile' && (
        <div className="mobile-overlay">
          <div className="mobile-menu">
            {/* Mobile Menu Header */}
            <div className="mobile-header">
              <div className="mobile-header-content">
                <div className="logo-icon small">
                  <Sun size={20} color="white" />
                </div>
                <span className="mobile-header-title">WeatherApp</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="close-btn"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Profile Section */}
            {isAuthenticated && user && (
              <div className="mobile-user-profile">
                <div className="profile-avatar">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="profile-info">
                  <div className="profile-name">{user.username || 'User'}</div>
                  <div className="profile-email">{user.email || 'user@example.com'}</div>
                </div>
                <button className="notification-btn">
                  <Bell size={16} />
                </button>
              </div>
            )}

            {/* Navigation Items */}
            <div className="mobile-nav-items">
              {isAuthenticated && user && navigationItems.map((item, index) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`mobile-nav-item ${isActivePath(item.path) ? 'active' : ''}`}
                  style={{
                    '--item-color': item.color,
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className="nav-item-icon">
                    <item.icon size={20}/>
                  </div>
                  <div className="nav-item-content">
                    <span className="nav-item-label">{item.label}</span>
                    <span className="nav-item-desc">
                      {item.label === 'Dashboard' && 'Overview & widgets'}
                      {item.label === 'Search' && 'Find weather data'}
                      {item.label === 'History' && 'Past searches'}
                      {item.label === 'Profile' && 'Account settings'}
                    </span>
                  </div>
                  {isActivePath(item.path) && <div className="active-indicator" />}
                </button>
              ))}

              {isAuthenticated && user && (
                <>
                  <div className="mobile-divider" />
                  <button 
                    onClick={() => handleNavigation('/settings')} 
                    className="mobile-nav-item"
                  >
                    <div className="nav-item-icon">
                      <Settings size={20}/>
                    </div>
                    <div className="nav-item-content">
                      <span className="nav-item-label">Settings</span>
                      <span className="nav-item-desc">App preferences</span>
                    </div>
                  </button>
                  
                  <button onClick={handleLogout} className="mobile-logout-btn">
                    <LogOut size={20}/> 
                    <span>Sign Out</span>
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <div className="mobile-auth-section">
                  <button 
                    onClick={() => handleNavigation('/login')} 
                    className="mobile-login-btn"
                  >
                    Login to Your Account
                  </button>
                  <button 
                    onClick={() => handleNavigation('/register')} 
                    className="mobile-register-btn"
                  >
                    Create New Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .navbar {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .navbar-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .logo-container:hover {
          transform: scale(1.02);
        }

        .logo-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .logo-icon.small {
          padding: 6px;
        }

        .logo-text {
          font-weight: 800;
          font-size: 20px;
          letter-spacing: 0.5px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-items {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .nav-btn {
          background: rgba(102, 126, 234, 0.08);
          color: #667eea;
          border: 1px solid rgba(102, 126, 234, 0.15);
          border-radius: 12px;
          padding: 10px 14px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          position: relative;
          overflow: hidden;
        }

        .nav-btn:hover {
          background: rgba(102, 126, 234, 0.12);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.2);
        }

        .nav-btn.active {
          background: var(--item-color, #667eea);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .nav-divider {
          height: 32px;
          width: 1px;
          background: rgba(102, 126, 234, 0.2);
          margin: 0 8px;
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 12px;
          background: rgba(102, 126, 234, 0.08);
          border-radius: 20px;
          border: 1px solid rgba(102, 126, 234, 0.15);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .username {
          font-weight: 600;
          color: #4a5568;
          font-size: 14px;
        }

        .logout-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 10px 14px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .logout-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        }

        .auth-buttons {
          display: flex;
          gap: 8px;
        }

        .login-btn {
          background: transparent;
          color: #667eea;
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 12px;
          padding: 10px 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .login-btn:hover {
          background: rgba(102, 126, 234, 0.08);
        }

        .register-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 10px 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .register-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .mobile-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mobile-user-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 12px;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .mobile-menu-btn {
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 8px;
          padding: 8px;
          color: #667eea;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-menu-btn:hover {
          background: rgba(102, 126, 234, 0.15);
        }

        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          z-index: 999;
          animation: fadeIn 0.3s ease;
        }

        .mobile-menu {
          position: absolute;
          top: 0;
          right: 0;
          width: 90%;
          max-width: 340px;
          height: 100vh;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255, 255, 255, 0.2);
          animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .mobile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid rgba(102, 126, 234, 0.1);
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
        }

        .mobile-header-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .mobile-header-title {
          font-weight: 700;
          font-size: 18px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .close-btn {
          background: rgba(102, 126, 234, 0.1);
          border: none;
          border-radius: 8px;
          padding: 8px;
          color: #667eea;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: rgba(102, 126, 234, 0.15);
        }

        .mobile-user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
          border-bottom: 1px solid rgba(102, 126, 234, 0.1);
        }

        .profile-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .profile-info {
          flex: 1;
        }

        .profile-name {
          font-weight: 600;
          color: #2d3748;
          font-size: 16px;
          margin-bottom: 2px;
        }

        .profile-email {
          font-size: 13px;
          color: #718096;
        }

        .notification-btn {
          background: rgba(102, 126, 234, 0.1);
          border: none;
          border-radius: 8px;
          padding: 8px;
          color: #667eea;
          cursor: pointer;
        }

        .mobile-nav-items {
          flex: 1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mobile-nav-item {
          background: transparent;
          border: none;
          border-radius: 16px;
          padding: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s ease;
          position: relative;
          animation: slideInUp 0.5s ease forwards;
          opacity: 0;
          transform: translateY(20px);
        }

        .mobile-nav-item:hover {
          background: rgba(102, 126, 234, 0.05);
          transform: translateX(4px);
        }

        .mobile-nav-item.active {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .nav-item-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(102, 126, 234, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--item-color, #667eea);
          transition: all 0.3s ease;
        }

        .mobile-nav-item.active .nav-item-icon {
          background: var(--item-color, #667eea);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .nav-item-content {
          flex: 1;
          text-align: left;
        }

        .nav-item-label {
          display: block;
          font-weight: 600;
          font-size: 16px;
          color: #2d3748;
          margin-bottom: 2px;
        }

        .nav-item-desc {
          display: block;
          font-size: 13px;
          color: #718096;
        }

        .active-indicator {
          width: 4px;
          height: 20px;
          background: var(--item-color, #667eea);
          border-radius: 2px;
          opacity: 0.8;
        }

        .mobile-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.2), transparent);
          margin: 16px 0;
        }

        .mobile-logout-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          border-radius: 16px;
          padding: 16px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 8px;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          transition: all 0.3s ease;
        }

        .mobile-logout-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        }

        .mobile-auth-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 20px;
        }

        .mobile-login-btn {
          background: transparent;
          color: #667eea;
          border: 2px solid rgba(102, 126, 234, 0.3);
          border-radius: 16px;
          padding: 16px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .mobile-login-btn:hover {
          background: rgba(102, 126, 234, 0.05);
          border-color: rgba(102, 126, 234, 0.5);
        }

        .mobile-register-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 16px;
          padding: 16px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
        }

        .mobile-register-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInRight {
          from { 
            transform: translateX(100%); 
            opacity: 0;
          }
          to { 
            transform: translateX(0); 
            opacity: 1;
          }
        }

        @keyframes slideInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .navbar-container {
            padding: 8px 12px;
          }
          
          .logo-text {
            font-size: 18px;
          }
        }

        @media (min-width: 640px) and (max-width: 1024px) {
          .navbar-container {
            padding: 12px 20px;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;