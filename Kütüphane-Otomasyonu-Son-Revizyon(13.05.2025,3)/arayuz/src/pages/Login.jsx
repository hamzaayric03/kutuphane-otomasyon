import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // bu dosya varsa onunla stil vereceğiz
import { HiOutlineMail } from 'react-icons/hi';
import { RiLockPasswordLine } from 'react-icons/ri';
import { FiInfo } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    console.log('Giriş denemesi yapılıyor...');

    try {
      // API isteği
      const response = await fetch('http://localhost:3001/api/giris', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eposta: email,
          sifre: sifre
        })
      });

      console.log('API Yanıtı:', response.status);
      const data = await response.json();
      console.log('API Veri:', data);

      if (response.ok && data.success) {
        // Token'ı localStorage'da sakla
        localStorage.setItem('token', data.token || 'default-token');
        // Giriş zamanını kaydet
        localStorage.setItem('lastLoginTime', Date.now().toString());
        console.log('Giriş başarılı, panele yönlendiriliyor');
        
        // Başarılı giriş, panel sayfasına yönlendir
        navigate('/panel');
      } else {
        // Hatalı giriş
        const errorMessage = data.error || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
        console.error('Giriş başarısız:', errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Giriş hatası:', error);
      setError('Sunucu bağlantısı kurulamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Demo kullanıcı bilgilerini form alanlarına doldur
  const fillDemoCredentials = () => {
    setEmail('gorevli@example.com');
    setSifre('123');
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>Kütüphane Yönetim Sistemi</h2>
        <h3>Görevli Girişi</h3>

        {error && <div className="error-message">{error}</div>}
        
        <div className="demo-credentials">
          <div className="demo-credentials-header">
            <FiInfo className="info-icon" />
            <h4>Demo Giriş Bilgileri</h4>
          </div>
          <p>İlk kez giriş yapanlar için:</p>
          <div className="credentials-box">
            <div className="credential-item">
              <span className="credential-label">E-posta:</span>
              <span className="credential-value">gorevli@example.com</span>
            </div>
            <div className="credential-item">
              <span className="credential-label">Şifre:</span>
              <span className="credential-value">123</span>
            </div>
          </div>
          <button 
            type="button" 
            className="demo-fill-button"
            onClick={fillDemoCredentials}
          >
            Bu bilgilerle doldur
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="email"
              placeholder="E-posta adresiniz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <span className="input-icon">
              <HiOutlineMail />
            </span>
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Şifreniz"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              required
              disabled={loading}
            />
            <span className="input-icon">
              <RiLockPasswordLine />
            </span>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
