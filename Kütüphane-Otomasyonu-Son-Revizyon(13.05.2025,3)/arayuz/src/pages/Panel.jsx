import React from 'react';
import { Link } from 'react-router-dom';
import './Panel.css'; // opsiyonel stil

const Panel = () => {
  return (
    <div className="panel-container">
      <div className="panel-header">
        <h2>Yönetim Paneli</h2>
      </div>
      <div className="panel-actions">
        <Link to="/kitap-ekle" className="panel-button">
          <span>📚</span>
          <div>
            <div>Kitap Ekle</div>
            <small style={{ fontSize: '0.8rem', opacity: 0.9 }}>Yeni kitap kaydı oluştur</small>
          </div>
        </Link>
        <Link to="/kitap-duzenle" className="panel-button">
          <span>✏️</span>
          <div>
            <div>Kitap Yönet</div>
            <small style={{ fontSize: '0.8rem', opacity: 0.9 }}>Düzenle veya sil</small>
          </div>
        </Link>
        <Link to="/raporlar" className="panel-button">
          <span>📊</span>
          <div>
            <div>Raporlar</div>
            <small style={{ fontSize: '0.8rem', opacity: 0.9 }}>Ödünç kitap raporları</small>
          </div>
        </Link>
        <Link to="/uye-ekle" className="panel-button">
          <span>👤</span>
          <div>
            <div>Üye Ekle</div>
            <small style={{ fontSize: '0.8rem', opacity: 0.9 }}>Yeni üye kaydı oluştur</small>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Panel;
