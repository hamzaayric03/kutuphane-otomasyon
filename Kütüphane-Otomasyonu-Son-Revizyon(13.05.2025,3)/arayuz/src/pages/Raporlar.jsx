import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Raporlar.css';
import { FiBook, FiUser, FiCalendar, FiClock, FiAlertCircle, FiCheckCircle, FiXCircle, FiSettings, FiRefreshCw, FiEdit, FiSave, FiCheck, FiFilter, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Raporlar = () => {
  const navigate = useNavigate();
  const [oduncKitaplar, setOduncKitaplar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterTarih, setFilterTarih] = useState('');
  const [filterUye, setFilterUye] = useState('');
  const [filterDurum, setFilterDurum] = useState('');
  const [kitaplar, setKitaplar] = useState([]);
  const [uyeler, setUyeler] = useState([]);
  const [yeniOdunc, setYeniOdunc] = useState({
    KitapID: '',
    UyeID: '',
    AlisTarihi: new Date().toISOString().split('T')[0],
    PlanlananTeslimTarihi: '',
    OduncNotu: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingOduncId, setEditingOduncId] = useState(null);
  
  const teslimTarihiRefs = useRef({});

  useEffect(() => {
    fetchData();
    // Her 30 saniyede bir verileri güncelle
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [oduncResponse, kitaplarResponse, uyelerResponse] = await Promise.all([
        axios.get('http://localhost:3001/api/odunc-kitaplar'),
        axios.get('http://localhost:3001/api/kitaplar'),
        axios.get('http://localhost:3001/api/uyeler')
      ]);

      setOduncKitaplar(oduncResponse.data);
      setKitaplar(kitaplarResponse.data);
      setUyeler(uyelerResponse.data);
      setError('');
    } catch (err) {
      setError('Veriler yüklenirken bir hata oluştu.');
      console.error('Veri çekme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOduncEkle = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/odunc-kitaplar', yeniOdunc);
      setSuccess('Ödünç kitap başarıyla eklendi');
      setTimeout(() => setSuccess(''), 3000);
      fetchData();
      setShowForm(false);
      setYeniOdunc({
        KitapID: '',
        UyeID: '',
        AlisTarihi: new Date().toISOString().split('T')[0],
        PlanlananTeslimTarihi: '',
        OduncNotu: ''
      });
    } catch (err) {
      console.error('Ödünç ekleme hatası:', err);
      setError(err.response?.data?.error || 'Ödünç kitap eklenirken bir hata oluştu.');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleTeslimEt = async (oduncId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await axios.put(`http://localhost:3001/api/odunc-kitaplar/${oduncId}/teslim-tarihi`, {
        gercekTeslimTarihi: today
      });
      setSuccess('Kitap başarıyla teslim edildi');
      setTimeout(() => setSuccess(''), 3000);
      fetchData();
    } catch (err) {
      console.error('Teslim işlemi hatası:', err);
      setError('Kitap teslim edilirken bir hata oluştu: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleTeslimTarihiGuncelle = async (oduncId) => {
    try {
      const gercekTeslimTarihi = teslimTarihiRefs.current[oduncId];
      
      if (!gercekTeslimTarihi) {
        setError('Lütfen geçerli bir teslim tarihi seçin');
        return;
      }
      
      await axios.put(`http://localhost:3001/api/odunc-kitaplar/${oduncId}/teslim-tarihi`, {
        gercekTeslimTarihi
      });
      
      setEditingOduncId(null);
      setSuccess('Teslim tarihi başarıyla güncellendi');
      setTimeout(() => setSuccess(''), 3000);
      fetchData();
    } catch (err) {
      console.error('Teslim tarihi güncelleme hatası:', err);
      setError('Teslim tarihi güncellenirken bir hata oluştu: ' + (err.response?.data?.error || err.message));
    }
  };

  const fixNullDates = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:3001/api/db/fix-null-dates');
      setSuccess(`Veritabanı düzeltme işlemi başarılı: ${response.data.affectedRows} kayıt güncellendi.`);
      
      // 3 saniye sonra başarı mesajını temizle
      setTimeout(() => setSuccess(''), 3000);
      
      // Verileri yeniden çek
      fetchData();
    } catch (err) {
      console.error('Veritabanı düzeltme hatası:', err);
      setError('Veritabanı düzeltme işlemi sırasında bir hata oluştu: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fixDatabaseSchema = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:3001/api/db/fix-schema');
      setSuccess(`Veritabanı şeması düzeltme işlemi başarılı: ${response.data.message}`);
      
      // 3 saniye sonra başarı mesajını temizle
      setTimeout(() => setSuccess(''), 3000);
      
      // Verileri yeniden çek
      fetchData();
    } catch (err) {
      console.error('Veritabanı şema düzeltme hatası:', err);
      setError('Veritabanı şeması düzeltme işlemi sırasında bir hata oluştu: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const filteredKitaplar = oduncKitaplar.filter(kitap => {
    const tarihUygun = filterTarih ? kitap.AlisTarihi?.includes(filterTarih) : true;
    const uyeUygun = filterUye ? 
      (kitap.UyeAdi || '').toLowerCase().includes(filterUye.toLowerCase()) : true;
    const durumUygun = filterDurum ? kitap.GuncelDurum === filterDurum : true;
    return tarihUygun && uyeUygun && durumUygun;
  });

  const formatTarih = (tarih) => {
    if (!tarih) return '-';
    const date = new Date(tarih);
    return date.toLocaleDateString('tr-TR');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Teslim Edildi': return <FiCheckCircle className="status-icon completed" />;
      case 'Gecikmiş': return <FiXCircle className="status-icon overdue" />;
      case 'Yakında Dolacak': return <FiAlertCircle className="status-icon warning" />;
      default: return <FiClock className="status-icon active" />;
    }
  };

  const toggleTeslimTarihiEdit = (oduncId, defaultDate) => {
    if (editingOduncId === oduncId) {
      setEditingOduncId(null);
    } else {
      setEditingOduncId(oduncId);
      teslimTarihiRefs.current[oduncId] = defaultDate || new Date().toISOString().split('T')[0];
    }
  };

  const handleBackClick = () => {
    navigate('/panel');
  };

  if (loading) {
    return (
      <div className="raporlar-container">
        <div className="loading">
          <FiClock className="loading-icon spin" />
          Veriler yükleniyor...
        </div>
      </div>
    );
  }

  return (
    <div className="raporlar-container">
      <div className="page-header">
        <button className="back-button" onClick={handleBackClick}>
          <FiArrowLeft /> Ana Panele Dön
        </button>
        <h2><FiBook /> Kütüphane Raporları</h2>
        <div className="buttons">
          <button 
            className={`settings-button ${showSettings ? 'active' : ''}`}
            onClick={() => setShowSettings(!showSettings)}
          >
            <FiSettings /> Ayarlar
          </button>
          <button 
            className={`ekle-button ${showForm ? 'active' : ''}`}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '❌ Vazgeç' : '📚 Yeni Ödünç Ekle'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <FiAlertCircle /> {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          <FiCheckCircle /> {success}
        </div>
      )}

      {showSettings && (
        <div className="settings-panel">
          <h3>Veritabanı Bakım İşlemleri</h3>
          <div className="maintenance-actions">
            <button 
              className="maintenance-button" 
              onClick={fixDatabaseSchema}
            >
              <FiRefreshCw /> Tablo Şemasını Düzelt
            </button>
            <p className="maintenance-info">
              Bu işlem, veritabanında GercekTeslimTarihi sütununu kontrol eder ve gerekirse ekler.
            </p>
            
            <button 
              className="maintenance-button" 
              onClick={fixNullDates}
            >
              <FiRefreshCw /> Boş Teslim Tarihlerini Düzelt
            </button>
            <p className="maintenance-info">
              Bu işlem, veritabanında Durum alanı boş olan ve teslim tarihi olmayan kayıtları düzeltir.
            </p>
          </div>
        </div>
      )}

      {showForm && (
        <form className="odunc-form" onSubmit={handleOduncEkle}>
          <div className="form-row">
            <div className="form-group">
              <label><FiBook /> Kitap</label>
              <select
                value={yeniOdunc.KitapID}
                onChange={(e) => setYeniOdunc({...yeniOdunc, KitapID: e.target.value})}
                required
              >
                <option value="">Kitap Seçin</option>
                {kitaplar
                  .filter(kitap => kitap.KitapMevcutDurumu)
                  .map(kitap => (
                    <option key={kitap.KitapID} value={kitap.KitapID}>
                      {kitap.KitapAdi}
                    </option>
                  ))}
              </select>
              {kitaplar.filter(kitap => kitap.KitapMevcutDurumu).length === 0 && (
                <div className="form-hint">
                  <small className="text-warning">Şu an ödünç verilebilecek kitap bulunmamaktadır.</small>
                </div>
              )}
            </div>

            <div className="form-group">
              <label><FiUser /> Üye</label>
              <select
                value={yeniOdunc.UyeID}
                onChange={(e) => setYeniOdunc({...yeniOdunc, UyeID: e.target.value})}
                required
              >
                <option value="">Üye Seçin</option>
                {uyeler.map(uye => (
                  <option key={uye.UyeID} value={uye.UyeID}>
                    {uye.UyeAdi} {uye.UyeSoyadi}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><FiCalendar /> Alış Tarihi</label>
              <input
                type="date"
                value={yeniOdunc.AlisTarihi}
                onChange={(e) => setYeniOdunc({...yeniOdunc, AlisTarihi: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label><FiCalendar /> Planlanan Teslim Tarihi</label>
              <input
                type="date"
                value={yeniOdunc.PlanlananTeslimTarihi}
                onChange={(e) => setYeniOdunc({...yeniOdunc, PlanlananTeslimTarihi: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Not</label>
              <input
                type="text"
                placeholder="Ödünç Notu"
                value={yeniOdunc.OduncNotu}
                onChange={(e) => setYeniOdunc({...yeniOdunc, OduncNotu: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" className="kaydet-button">
            💾 Kaydet
          </button>
        </form>
      )}

      <div className="filters">
        <div className="filter-title">
          <FiFilter /> Filtreler
        </div>
        <div className="filter-group">
          <FiCalendar />
          <input
            type="date"
            value={filterTarih}
            onChange={(e) => setFilterTarih(e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <FiUser />
          <input
            type="text"
            placeholder="Üye adı ile filtrele"
            value={filterUye}
            onChange={(e) => setFilterUye(e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={filterDurum}
            onChange={(e) => setFilterDurum(e.target.value)}
            className="filter-input"
          >
            <option value="">Tüm Durumlar</option>
            <option value="Normal">Normal</option>
            <option value="Yakında Dolacak">Yakında Dolacak</option>
            <option value="Gecikmiş">Gecikmiş</option>
            <option value="Teslim Edildi">Teslim Edildi</option>
          </select>
        </div>
      </div>

      <div className="kitap-istatistikleri">
        <div className="istatistik-kart">
          <div className="istatistik-baslik">Toplam Ödünç</div>
          <div className="istatistik-deger">{oduncKitaplar.length}</div>
        </div>
        <div className="istatistik-kart">
          <div className="istatistik-baslik">Teslim Edilmiş</div>
          <div className="istatistik-deger">{oduncKitaplar.filter(k => k.GercekTeslimTarihi).length}</div>
        </div>
        <div className="istatistik-kart">
          <div className="istatistik-baslik">Gecikmiş</div>
          <div className="istatistik-deger">{oduncKitaplar.filter(k => k.GuncelDurum === 'Gecikmiş').length}</div>
        </div>
        <div className="istatistik-kart">
          <div className="istatistik-baslik">Normal</div>
          <div className="istatistik-deger">{oduncKitaplar.filter(k => k.GuncelDurum === 'Normal').length}</div>
        </div>
      </div>

      <div className="table-container">
        <table className="odunc-table">
          <thead>
            <tr>
              <th>Durum</th>
              <th>Kitap Adı</th>
              <th>Üye</th>
              <th>Alış Tarihi</th>
              <th>Planlanan Teslim</th>
              <th>Gerçek Teslim</th>
              <th>Kalan Gün</th>
              <th>Not</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filteredKitaplar.map(kitap => (
              <tr key={kitap.OduncID} className={kitap.StatusClass}>
                <td className="status-cell">
                  {getStatusIcon(kitap.GuncelDurum)}
                  <span className="status-text">{kitap.GuncelDurum}</span>
                </td>
                <td>{kitap.KitapAdi}</td>
                <td>{kitap.UyeAdi}</td>
                <td>{formatTarih(kitap.AlisTarihi)}</td>
                <td>{formatTarih(kitap.PlanlananTeslimTarihi)}</td>
                <td>
                  {editingOduncId === kitap.OduncID ? (
                    <div className="teslim-tarihi-edit">
                      <input 
                        type="date" 
                        defaultValue={kitap.GercekTeslimTarihi || new Date().toISOString().split('T')[0]}
                        onChange={(e) => teslimTarihiRefs.current[kitap.OduncID] = e.target.value}
                        className="teslim-tarihi-input"
                      />
                      <div className="button-group">
                        <button 
                          className="save-button"
                          onClick={() => handleTeslimTarihiGuncelle(kitap.OduncID)}
                          title="Kaydet"
                        >
                          <FiCheck />
                        </button>
                        <button 
                          className="cancel-button"
                          onClick={() => setEditingOduncId(null)}
                          title="İptal"
                        >
                          <FiXCircle />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="teslim-tarihi-display"
                      onClick={() => toggleTeslimTarihiEdit(kitap.OduncID, kitap.GercekTeslimTarihi)}
                    >
                      {kitap.GercekTeslimTarihi ? (
                        <span className="date-value">{formatTarih(kitap.GercekTeslimTarihi)}</span>
                      ) : (
                        <button className="edit-teslim-button">
                          <FiEdit /> Tarih Ekle
                        </button>
                      )}
                    </div>
                  )}
                </td>
                <td className="kalan-gun">
                  {kitap.KalanGun} gün
                </td>
                <td>{kitap.OduncNotu || '-'}</td>
                <td>
                  {!kitap.GercekTeslimTarihi ? (
                    <button
                      className="teslim-button"
                      onClick={() => handleTeslimEt(kitap.OduncID)}
                      title="Bugün teslim edildi olarak işaretle"
                    >
                      <FiCheck /> Teslim Et
                    </button>
                  ) : (
                    <span className="teslim-edildi">
                      <FiCheckCircle /> Teslim Edildi
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {filteredKitaplar.length === 0 && (
              <tr>
                <td colSpan="9" className="no-data">
                  Kayıt bulunamadı
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Raporlar; 