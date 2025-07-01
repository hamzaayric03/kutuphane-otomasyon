import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Books from './pages/Books';
import Login from './pages/Login';
import './App.css';
import Header from './components/Header';
import BookDetail from './pages/BookDetail';
import Panel from './pages/Panel';
import KitapPaneli from './pages/KitapPaneli';
import KitapGuncelleVeSil from './pages/KitapGuncelleVeSil';
import Raporlar from './pages/Raporlar';
import UyeEkle from './pages/UyeEkle';
import { ThemeProvider } from './context/ThemeContext';

// Korumalı route bileşeni
const ProtectedRoute = ({ element }) => {
  // Gerçek uygulamada burada oturum durumu kontrolü yapılır
  const isAuthenticated = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

// Giriş yapmış kullanıcılar için Login sayfasına erişimi engelleyen bileşen
const AuthRedirect = ({ element }) => {
  const isAuthenticated = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  // Giriş yapmış kullanıcıları doğrudan panel sayfasına yönlendir
  return isAuthenticated ? <Navigate to="/panel" replace /> : element;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Books />} />
            <Route path="/login" element={<AuthRedirect element={<Login />} />} />
            <Route path="/books/:id" element={<BookDetail />} />
            
            {/* Korumalı rotalar */}
            <Route path="/panel" element={<ProtectedRoute element={<Panel />} />} />
            <Route path="/kitap-ekle" element={<ProtectedRoute element={<KitapPaneli />} />} />
            <Route path="/kitap-duzenle" element={<ProtectedRoute element={<KitapGuncelleVeSil />} />} />
            <Route path='/raporlar' element={<ProtectedRoute element={<Raporlar />} />} />
            <Route path='/uye-ekle' element={<ProtectedRoute element={<UyeEkle />} />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
