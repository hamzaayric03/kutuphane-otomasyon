import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './KitapPaneli.css';
import { 
  FiBook, 
  FiUser, 
  FiHash, 
  FiHome, 
  FiLoader, 
  FiTag, 
  FiArrowLeft,
  FiSearch,
  FiX
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// Kategori bazlı renk üreteci
const getCategoryColor = (categoryName) => {
  if (!categoryName) return 'linear-gradient(135deg, #4a00e0 0%, #8e2de2 100%)';
  
  // Kategori isminden bir hash değeri üretelim
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Önceden belirlenmiş koyu renk paleti (gece modunda daha iyi görünür)
  const colorPalettes = [
    'linear-gradient(135deg, #4a00e0 0%, #8e2de2 100%)', // Koyu mor
    'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', // Koyu yeşil
    'linear-gradient(135deg, #e53935 0%, #e35d5b 100%)', // Koyu kırmızı
    'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', // Koyu mavi
    'linear-gradient(135deg, #c31432 0%, #240b36 100%)', // Koyu bordo
    'linear-gradient(135deg, #f12711 0%, #f5af19 100%)', // Koyu turuncu
    'linear-gradient(135deg, #396afc 0%, #2948ff 100%)', // Koyu elektrik mavisi
    'linear-gradient(135deg, #283c86 0%, #45a247 100%)'  // Koyu mavi-yeşil
  ];
  
  // Hash değeriyle bir renk seçelim
  return colorPalettes[Math.abs(hash) % colorPalettes.length];
};

const KitapPaneli = () => {
  const navigate = useNavigate();
  const [yeniKitap, setYeniKitap] = useState({
    KitapAdi: '',
    YazarAdi: '',
    ISBN: '',
    YayineviID: '',
    KategoriID: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [kitaplar, setKitaplar] = useState([]);
  const [yayinevleri, setYayinevleri] = useState([]);
  const [kategoriler, setKategoriler] = useState([]);
  const [aramaMetni, setAramaMetni] = useState('');
  const [filtreSonuc, setFiltreSonuc] = useState([]);

  // Kitap arama fonksiyonu
  const kitapAra = (e) => {
    const arananText = e.target.value.toLowerCase();
    setAramaMetni(arananText);
    
    if (!arananText) {
      setFiltreSonuc(kitaplar);
      return;
    }
    
    const sonuclar = kitaplar.filter(
      kitap => 
        kitap.KitapAdi.toLowerCase().includes(arananText) || 
        kitap.YazarAdi.toLowerCase().includes(arananText) || 
        (kitap.KategoriAdi && kitap.KategoriAdi.toLowerCase().includes(arananText)) ||
        (kitap.ISBN && kitap.ISBN.toLowerCase().includes(arananText))
    );
    
    setFiltreSonuc(sonuclar);
  };

  // Arama çubuğunu temizle
  const aramaTemizle = () => {
    setAramaMetni('');
    setFiltreSonuc(kitaplar);
  };

  // Verileri yükle
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kitaplarRes, yayinevleriRes, kategorilerRes] = await Promise.all([
          axios.get('http://localhost:3001/api/kitaplar'),
          axios.get('http://localhost:3001/api/yayinevleri'),
          axios.get('http://localhost:3001/api/kategoriler')
        ]);

        setKitaplar(kitaplarRes.data);
        setFiltreSonuc(kitaplarRes.data);
        setYayinevleri(yayinevleriRes.data);
        setKategoriler(kategorilerRes.data);
      } catch (err) {
        console.error('Veri yükleme hatası:', err);
        setError('Veriler yüklenirken bir hata oluştu.');
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setYeniKitap(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const kitapEkle = async () => {
    if (!yeniKitap.KitapAdi || !yeniKitap.YazarAdi || !yeniKitap.ISBN || !yeniKitap.YayineviID || !yeniKitap.KategoriID) {
      setError('Lütfen tüm alanları (kitap adı, yazar, ISBN, yayınevi ve kategori) doldurun.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Önce yazarı ekle
      const yazarResponse = await axios.post('http://localhost:3001/api/yazarlar', {
        YazarAdi: yeniKitap.YazarAdi
      });

      const yazarID = yazarResponse.data.YazarID;

      // Sonra kitabı ve kategori ilişkisini ekle
      const kitapVerisi = {
        KitapAdi: yeniKitap.KitapAdi,
        YazarID: yazarID,
        ISBN: yeniKitap.ISBN,
        YayineviID: yeniKitap.YayineviID,
        KategoriID: yeniKitap.KategoriID
      };

      console.log('Gönderilen kitap verisi:', kitapVerisi);

      const kitapResponse = await axios.post('http://localhost:3001/api/kitaplar', kitapVerisi);
      
      if (kitapResponse.status === 200) {
        // Kitap listesini güncelle
        const yeniKitaplarRes = await axios.get('http://localhost:3001/api/kitaplar');
        setKitaplar(yeniKitaplarRes.data);
        
        // Başarılı işlem
        setSuccess('Kitap başarıyla eklendi!');
        setYeniKitap({
          KitapAdi: '',
          YazarAdi: '',
          ISBN: '',
          YayineviID: '',
          KategoriID: ''
        });

        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Kitap ekleme hatası:', err);
      console.error('Hata detayı:', err.response?.data);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Kitap eklenirken bir hata oluştu. Lütfen tüm alanları kontrol edin.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/panel');
  };

  return (
    <div className="kitap-panel-container">
      <div className="page-header">
        <button className="back-button" onClick={handleBackClick}>
          <FiArrowLeft /> Ana Panele Dön
        </button>
        <h1>Kitap Yönetimi</h1>
      </div>

      <div className="form-section">
        <div className="section-header">
          <FiBook className="section-icon" />
          <h2>Yeni Kitap Ekle</h2>
        </div>

        {error && (
          <div className="message error-message">
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="message success-message">
            <p>{success}</p>
          </div>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label>
              <span className="icon-container"><FiBook /></span>
              Kitap Adı
            </label>
            <input
              type="text"
              name="KitapAdi"
              value={yeniKitap.KitapAdi}
              onChange={handleInputChange}
              placeholder="Kitap adını girin"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>
              <span className="icon-container"><FiUser /></span>
              Yazar Adı
            </label>
            <input
              type="text"
              name="YazarAdi"
              value={yeniKitap.YazarAdi}
              onChange={handleInputChange}
              placeholder="Yazar adını girin"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>
              <span className="icon-container"><FiHash /></span>
              ISBN
            </label>
            <input
              type="text"
              name="ISBN"
              value={yeniKitap.ISBN}
              onChange={handleInputChange}
              placeholder="ISBN numarasını girin"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>
              <span className="icon-container"><FiHome /></span>
              Yayınevi
            </label>
            <select
              name="YayineviID"
              value={yeniKitap.YayineviID}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="">Yayınevi seçin</option>
              {yayinevleri.map(yayinevi => (
                <option key={yayinevi.YayineviID} value={yayinevi.YayineviID}>
                  {yayinevi.YayineviAdi}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <span className="icon-container"><FiTag /></span>
              Kategori
            </label>
            <select
              name="KategoriID"
              value={yeniKitap.KategoriID}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="">Kategori seçin</option>
              {kategoriler.map(kategori => (
                <option key={kategori.KategoriID} value={kategori.KategoriID}>
                  {kategori.KategoriAdi}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          className="submit-button"
          onClick={kitapEkle}
          disabled={loading}
        >
          {loading ? (
            <>
              <FiLoader className="spin-icon" /> Ekleniyor...
            </>
          ) : (
            'Kitap Ekle'
          )}
        </button>
      </div>

      <div className="table-section">
        <div className="section-header">
          <FiBook className="section-icon" />
          <h2>Kayıtlı Kitaplar</h2>
        </div>
        
        <div className="arama-kutusu-container">
          <div className="arama-kutusu">
            <FiSearch className="arama-ikonu" />
            <input
              type="text"
              placeholder="Kitap adı, yazar veya kategori ara..."
              value={aramaMetni}
              onChange={kitapAra}
            />
            {aramaMetni && (
              <button 
                className="arama-temizle" 
                onClick={aramaTemizle}
                title="Aramayı temizle"
              >
                <FiX />
              </button>
            )}
          </div>
          <div className="arama-sonuc">
            {aramaMetni && (
              <span>
                <strong>"{aramaMetni}"</strong> için {filtreSonuc.length} sonuç bulundu
              </span>
            )}
          </div>
        </div>
        
        <div className="table-container">
          <table className="kitaplar-table">
            <thead>
              <tr>
                <th><FiBook className="cell-icon" />Kitap Adı</th>
                <th><FiUser className="cell-icon" />Yazar</th>
                <th><FiHash className="cell-icon" />ISBN</th>
                <th><FiHome className="cell-icon" />Yayınevi</th>
                <th><FiTag className="cell-icon" />Kategori</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {filtreSonuc.length > 0 ? (
                filtreSonuc.map(kitap => (
                  <tr key={kitap.KitapID}>
                    <td>{kitap.KitapAdi}</td>
                    <td>{kitap.YazarAdi}</td>
                    <td>{kitap.ISBN}</td>
                    <td>{kitap.YayineviAdi}</td>
                    <td>
                      <div className="kategori-wrapper">
                        <span 
                          className="table-kategori"
                          style={{ background: getCategoryColor(kitap.KategoriAdi) }}
                        >
                          {kitap.KategoriAdi || 'Kategorisiz'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`durum-badge ${kitap.KitapMevcutDurumu ? 'mevcut' : 'mevcut-degil'}`}>
                        {kitap.KitapMevcutDurumu ? 'Mevcut' : 'Ödünç Verildi'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    {aramaMetni ? 'Arama kriterlerine uygun kitap bulunamadı.' : 'Henüz kitap kaydı bulunmuyor.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KitapPaneli;
