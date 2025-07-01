import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './KitapGuncelleVeSil.css';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiX } from 'react-icons/fi';

const KitapGuncelleVeSil = () => {
  const navigate = useNavigate();
  const [kitaplar, setKitaplar] = useState([]);
  const [guncellenenKitap, setGuncellenenKitap] = useState(null);
  const [yazarlar, setYazarlar] = useState([]);
  const [yayinevleri, setYayinevleri] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchKitaplar();
    fetchYazarlar();
    fetchYayinevleri();
  }, []);

  const fetchKitaplar = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/kitaplar');
      setKitaplar(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchYazarlar = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/yazarlar');
      setYazarlar(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchYayinevleri = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/yayinevleri');
      setYayinevleri(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const kitapGuncelle = async () => {
    try {
      await axios.put(`http://localhost:3001/api/kitaplar/${guncellenenKitap.KitapID}`, guncellenenKitap);
      setGuncellenenKitap(null);
      fetchKitaplar();
      showSuccessMessage('✅ Kitap başarıyla güncellendi!');
    } catch (err) {
      console.error(err);
    }
  };

  const kitapSil = async (id) => {
    if (window.confirm('Bu kitabı silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`http://localhost:3001/api/kitaplar/${id}`);
        fetchKitaplar();
        showSuccessMessage('🗑️ Kitap başarıyla silindi!');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredKitaplar = kitaplar.filter(kitap =>
    kitap.KitapAdi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kitap.YazarAdi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBackClick = () => {
    navigate('/panel');
  };

  if (loading) {
    return (
      <div className="kitap-guncelle-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Kitaplar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="kitap-guncelle-container">
      <div className="page-header">
        <button className="back-button" onClick={handleBackClick}>
          <FiArrowLeft /> Ana Panele Dön
        </button>
        <h2>📚 Kitap Yönetimi</h2>
      </div>
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Kitap adı veya yazar adı ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="search-icon">🔍</span>
      </div>

      <div className="kitap-grid">
        {filteredKitaplar.map((kitap) => (
          <div key={kitap.KitapID} className="kitap-card">
            <div className="kitap-content">
              <h3>{kitap.KitapAdi}</h3>
              <p className="yazar">✍️ {kitap.YazarAdi}</p>
              <p className="isbn">📖 ISBN: {kitap.ISBN || 'Belirtilmemiş'}</p>
              <p className="kategori">🏷️ {kitap.KategoriAdi || 'Kategorisiz'}</p>
            </div>
            <div className="kitap-actions">
              <button 
                className="edit-button"
                onClick={() => setGuncellenenKitap(kitap)}
              >
                ✏️ Düzenle
              </button>
              <button 
                className="delete-button"
                onClick={() => kitapSil(kitap.KitapID)}
              >
                🗑️ Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {guncellenenKitap && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>📝 Kitap Düzenle</h3>
            <div className="form-group">
              <label>Kitap Adı:</label>
              <input
                type="text"
                value={guncellenenKitap.KitapAdi}
                onChange={(e) => setGuncellenenKitap({...guncellenenKitap, KitapAdi: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Yazar:</label>
              <select
                value={guncellenenKitap.YazarID}
                onChange={(e) => setGuncellenenKitap({...guncellenenKitap, YazarID: e.target.value})}
              >
                {yazarlar.map(yazar => (
                  <option key={yazar.YazarID} value={yazar.YazarID}>
                    {yazar.YazarAdi}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>ISBN:</label>
              <input
                type="text"
                value={guncellenenKitap.ISBN || ''}
                onChange={(e) => setGuncellenenKitap({...guncellenenKitap, ISBN: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Yayınevi:</label>
              <select
                value={guncellenenKitap.YayineviID}
                onChange={(e) => setGuncellenenKitap({...guncellenenKitap, YayineviID: e.target.value})}
              >
                {yayinevleri.map(yayinevi => (
                  <option key={yayinevi.YayineviID} value={yayinevi.YayineviID}>
                    {yayinevi.YayineviAdi}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button className="save-button" onClick={kitapGuncelle}>
                <FiSave /> Kaydet
              </button>
              <button className="cancel-button" onClick={() => setGuncellenenKitap(null)}>
                <FiX /> İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitapGuncelleVeSil;
