import React, { useState, useEffect } from 'react';
import axios from 'axios';

const KitapPaneli = () => {
  const [kitaplar, setKitaplar] = useState([]);
  const [yeniKitap, setYeniKitap] = useState({
    KitapAdi: '',
    YazarID: '',
    ISBN: '',
    YayineviID: '',
    KutuphaneID: ''
  });
  const [duzenlenenKitap, setDuzenlenenKitap] = useState(null);

  useEffect(() => {
    kitaplariGetir();
  }, []);

  const kitaplariGetir = () => {
    axios.get('http://localhost:3001/api/kitaplar')
      .then(res => setKitaplar(res.data))
      .catch(err => console.error(err));
  };

  const kitapEkle = () => {
    axios.post('http://localhost:3001/api/kitaplar', yeniKitap)
      .then(() => {
        kitaplariGetir();
        setYeniKitap({ KitapAdi: '', YazarID: '', ISBN: '', YayineviID: '', KutuphaneID: '' });
      })
      .catch(err => console.error(err));
  };

  const kitapSil = (id) => {
    axios.delete(`http://localhost:3001/api/kitaplar/${id}`)
      .then(() => kitaplariGetir())
      .catch(err => console.error(err));
  };

  const kitapGuncelle = () => {
    axios.put(`http://localhost:3001/api/kitaplar/${duzenlenenKitap.KitapID}`, duzenlenenKitap)
      .then(() => {
        kitaplariGetir();
        setDuzenlenenKitap(null);
      })
      .catch(err => console.error(err));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>📚 Kitap Yönetim Paneli</h2>

      <h3>Yeni Kitap Ekle</h3>
      <input placeholder="Kitap Adı" value={yeniKitap.KitapAdi} onChange={e => setYeniKitap({ ...yeniKitap, KitapAdi: e.target.value })} />
      <input placeholder="YazarID" value={yeniKitap.YazarID} onChange={e => setYeniKitap({ ...yeniKitap, YazarID: e.target.value })} />
      <input placeholder="ISBN" value={yeniKitap.ISBN} onChange={e => setYeniKitap({ ...yeniKitap, ISBN: e.target.value })} />
      <input placeholder="YayıneviID" value={yeniKitap.YayineviID} onChange={e => setYeniKitap({ ...yeniKitap, YayineviID: e.target.value })} />
      <input placeholder="KütüphaneID" value={yeniKitap.KutuphaneID} onChange={e => setYeniKitap({ ...yeniKitap, KutuphaneID: e.target.value })} />
      <button onClick={kitapEkle}>➕ Ekle</button>

      <hr />

      <h3>Kitap Listesi</h3>
      <ul>
        {kitaplar.map(k => (
          <li key={k.KitapID}>
            <strong>{k.KitapAdi}</strong> (YazarID: {k.YazarID})  
            <button onClick={() => kitapSil(k.KitapID)}>🗑 Sil</button>
            <button onClick={() => setDuzenlenenKitap(k)}>✏ Düzenle</button>
          </li>
        ))}
      </ul>

      {duzenlenenKitap && (
        <div>
          <h3>Kitap Güncelle</h3>
          <input value={duzenlenenKitap.KitapAdi} onChange={e => setDuzenlenenKitap({ ...duzenlenenKitap, KitapAdi: e.target.value })} />
          <input value={duzenlenenKitap.YazarID} onChange={e => setDuzenlenenKitap({ ...duzenlenenKitap, YazarID: e.target.value })} />
          <input value={duzenlenenKitap.ISBN} onChange={e => setDuzenlenenKitap({ ...duzenlenenKitap, ISBN: e.target.value })} />
          <input value={duzenlenenKitap.YayineviID} onChange={e => setDuzenlenenKitap({ ...duzenlenenKitap, YayineviID: e.target.value })} />
          <input value={duzenlenenKitap.KutuphaneID} onChange={e => setDuzenlenenKitap({ ...duzenlenenKitap, KutuphaneID: e.target.value })} />
          <button onClick={kitapGuncelle}>💾 Kaydet</button>
        </div>
      )}
    </div>
  );
};

export default KitapPaneli;
