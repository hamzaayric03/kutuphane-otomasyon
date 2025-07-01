import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './KitapListesi.css';

const KitapListesi = () => {
  const [kitaplar, setKitaplar] = useState([]);
  const [arama, setArama] = useState('');

  useEffect(() => {
    axios
      .get(`http://localhost:3001/api/kitaplar?search=${arama}`)
      .then(res => {
        console.log("Gelen kitaplar:", res.data);
        setKitaplar(res.data);
      })
      .catch(err => console.error('Veri çekme hatası:', err));
  }, [arama]);

  // Rastgele bir puan oluştur (4.0-5.0 arası)
  const randomRating = () => {
    return (4 + Math.random()).toFixed(1);
  };

  return (
    <div className="kitap-listesi-container">
      <input
        type="text"
        className="arama-input"
        placeholder="Ara: kitap, yazar, kategori..."
        value={arama}
        onChange={e => setArama(e.target.value)}
      />
      
      <div className="kitaplar-grid">
        {kitaplar.map((kitap) => (
          <div key={kitap.KitapID} className="kitap-kart">
            <div className={`kitap-kapak ${kitap.KitapMevcutDurumu === 1 ? 'kitap-mevcut' : 'kitap-odunc'}`}>
              <div className="kitap-icon"></div>
              <div className="kitap-durum-badge">
                {kitap.KitapMevcutDurumu === 1 ? 'MEVCUT' : 'ÖDÜNÇ'}
              </div>
            </div>
            
            <div className="kitap-rating">
              <span className="yildiz">★</span> {randomRating()}
            </div>
            
            <h3 className="kitap-baslik">{kitap.KitapAdi}</h3>
            <p className="kitap-yazar">{kitap.YazarAdi}</p>
            
            <div className="kitap-kategori">
              {kitap.KategoriAdi || "Genel"}
            </div>
            
            {kitap.KitapMevcutDurumu === 1 ? (
              <div className="kutuphanede-mevcut">KÜTÜPHANEDE MEVCUT</div>
            ) : (
              <div className="kutuphanede-yok">ÖDÜNÇ VERİLDİ</div>
            )}
            
            <Link to={`/books/${kitap.KitapID}`} className="detay-link">
              Detayları Görüntüle
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KitapListesi;
