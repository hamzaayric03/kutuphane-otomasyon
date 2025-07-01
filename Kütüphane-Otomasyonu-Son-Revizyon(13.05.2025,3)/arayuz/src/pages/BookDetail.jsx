import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './BookDetail.css'; // Stil dosyası ekleyebilirsin

const BookDetail = () => {
  const { id } = useParams();
  const [kitap, setKitap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3001/api/kitaplar/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setKitap(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Veri çekme hatası:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Yükleniyor...</div>;
  if (!kitap) return <div>Kitap bulunamadı</div>;

  return (
    <div className="book-detail-container">
      <div className="book-detail-card">
        <h2>{kitap.KitapAdi}</h2>
        
        <div className="availability-status">
          {kitap.KitapMevcutDurumu === 1 ? (
            <div className="kutuphanede-mevcut">KÜTÜPHANEDE MEVCUT</div>
          ) : (
            <div className="kutuphanede-yok">ÖDÜNÇ VERİLDİ</div>
          )}
        </div>
        
        <p><strong>Yazar:</strong> {kitap.YazarAdi}</p>
        <p><strong>ISBN:</strong> {kitap.ISBN}</p>
        <p><strong>Yayınevi:</strong> {kitap.YayineviAdi}</p>
        <p><strong>Kütüphane:</strong> {kitap.KutuphaneAdi}</p>
        <p><strong>Kategoriler:</strong> {kitap.Kategoriler}</p>
      </div>
    </div>
  );
};

export default BookDetail;
