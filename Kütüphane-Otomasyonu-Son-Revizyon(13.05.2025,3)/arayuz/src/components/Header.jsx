import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Header.css';
import { FiHome, FiBook, FiLogIn, FiSun, FiMoon, FiLogOut } from 'react-icons/fi';

function Header() {
  const { isDarkTheme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isAuthenticated = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const isProtectedPage = () => {
    return location.pathname.includes('/panel') || 
           location.pathname.includes('/kitap-') || 
           location.pathname.includes('/raporlar') || 
           location.pathname.includes('/uye-');
  };

  // Çıkış yapma fonksiyonu
  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('lastLoginTime');
    console.log('Kullanıcı çıkış yaptı');
  };

  const handleNavClick = (e, path) => {
    // Eğer kullanıcı zaten panel sayfalarından birindeyse ve çıkış yapmak istiyorsa
    if (isAuthenticated() && isProtectedPage() && (path === '/' || path === '/books')) {
      e.preventDefault();
      
      // Onay penceresini göster
      const confirmExit = window.confirm("Bu sayfadan ayrılmak istediğinizden emin misiniz? Yönetici panelinden çıkış yapacaksınız.");
      
      if (confirmExit) {
        // Çıkış yap ve sonra yönlendir
        logout();
        navigate(path);
      }
    }
  };

  // Giriş/Çıkış butonuna tıklandığında 
  const handleLoginClick = (e) => {
    // Eğer kullanıcı giriş yapmışsa ve Giriş butonuna tıklıyorsa
    if (isAuthenticated()) {
      e.preventDefault();

      // Onay penceresini göster
      const confirmLogout = window.confirm("Oturumunuzu kapatmak istediğinizden emin misiniz?");
      
      if (confirmLogout) {
        // Çıkış yap ve sonra yönlendir
        logout();
        navigate('/login');
      }
    }
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="logo-section">
          <h1>Kütüphane Sistemi</h1>
        </div>
        
        <nav className="main-nav">
          <Link 
            to="/" 
            className={isActive('/') ? 'active' : ''} 
            onClick={(e) => handleNavClick(e, '/')}
          >
            <FiHome className="nav-icon" /> Ana Sayfa
          </Link>
          <Link 
            to="/books" 
            className={isActive('/books') ? 'active' : ''} 
            onClick={(e) => handleNavClick(e, '/books')}
          >
            <FiBook className="nav-icon" /> Kitaplar
          </Link>
          {isAuthenticated() ? (
            <Link 
              to="/login" 
              className={isActive('/login') ? 'active' : ''}
              onClick={handleLoginClick}
            >
              <FiLogOut className="nav-icon" /> Çıkış Yap
            </Link>
          ) : (
            <Link 
              to="/login" 
              className={isActive('/login') ? 'active' : ''}
            >
              <FiLogIn className="nav-icon" /> Giriş
            </Link>
          )}
        </nav>

        <button 
          className="theme-toggle"
          onClick={toggleTheme}
          title={isDarkTheme ? "Açık Temaya Geç" : "Koyu Temaya Geç"}
        >
          {isDarkTheme ? <FiSun /> : <FiMoon />}
        </button>
      </div>
    </header>
  );
}

export default Header;