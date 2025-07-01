const express = require('express');
const cors = require('cors');
const db = require('./db'); // aynı klasördeki db.js

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

/** 📚 Kitap Listesi **/
app.get('/api/kitaplar', (req, res) => {
  const query = `
    SELECT 
      k.KitapID, 
      k.KitapAdi, 
      k.ISBN,
      y.YazarAdi,
      yev.YayineviAdi,
      GROUP_CONCAT(DISTINCT kat.KategoriAdi SEPARATOR ', ') as KategoriAdi,
      (SELECT COUNT(*) = 0 FROM odunckitap o WHERE o.KitapID = k.KitapID AND o.GercekTeslimTarihi IS NULL) as KitapMevcutDurumu
    FROM Kitap k
    LEFT JOIN Yazar y ON k.YazarID = y.YazarID
    LEFT JOIN Yayinevi yev ON k.YayineviID = yev.YayineviID
    LEFT JOIN Kitap_Kategori kk ON k.KitapID = kk.KitapID
    LEFT JOIN Kategori kat ON kk.KategoriID = kat.KategoriID
    GROUP BY k.KitapID, k.KitapAdi, k.ISBN, y.YazarAdi, yev.YayineviAdi
    ORDER BY k.KitapID DESC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Kitap listesi alınırken hata:', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    res.json(results);
  });
});

/** 📘 2. Kitap Detayı **/
app.get('/api/kitaplar/:id', (req, res) => {
  const kitapId = req.params.id;

  const query = `
    SELECT 
      k.KitapID,
      k.KitapAdi,
      k.ISBN,
      y.YazarAdi,
      ya.YayineviAdi,
      ku.KutuphaneAdi,
      GROUP_CONCAT(DISTINCT ka.KategoriAdi SEPARATOR ', ') AS Kategoriler,
      (SELECT COUNT(*) = 0 FROM odunckitap o WHERE o.KitapID = k.KitapID AND o.GercekTeslimTarihi IS NULL) as KitapMevcutDurumu
    FROM Kitap k
    LEFT JOIN Yazar y ON k.YazarID = y.YazarID
    LEFT JOIN Yayinevi ya ON k.YayineviID = ya.YayineviID
    LEFT JOIN Kutuphane ku ON k.KutuphaneID = ku.KutuphaneID
    LEFT JOIN Kitap_Kategori kk ON k.KitapID = kk.KitapID
    LEFT JOIN Kategori ka ON kk.KategoriID = ka.KategoriID
    WHERE k.KitapID = ?
    GROUP BY k.KitapID
  `;

  db.query(query, [kitapId], (err, results) => {
    if (err) {
      console.error('Kitap detayı çekme hatası:', err.message);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Kitap bulunamadı' });
    }

    res.json(results[0]);
  });
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});

app.post('/api/giris', (req, res) => {
    const { eposta, sifre } = req.body;
  
    const query = `SELECT * FROM gorevli WHERE Eposta = ? AND Sifre = ?`;
  
    db.query(query, [eposta, sifre], (err, results) => {
      if (err) {
        console.error("Giriş hatası:", err);
        return res.status(500).json({ error: 'Sunucu hatası' });
      }
  
      if (results.length > 0) {
        res.json({ success: true, gorevli: results[0] });
      } else {
        res.status(401).json({ error: 'E-posta veya şifre hatalı' });
      }
    });
  });

  // Kitapları getir
// app.get('/api/kitaplar', (req, res) => {
//   db.query("SELECT * FROM Kitap", (err, result) => {
//     if (err) return res.status(500).send(err);
//     res.json(result);
//   });
// });

// Kitap sil
app.delete('/api/kitaplar/:id', (req, res) => {
  const kitapID = req.params.id;

  // Önce ilişkili kategorileri sil
  db.query('DELETE FROM Kitap_Kategori WHERE KitapID = ?', [kitapID], (err) => {
    if (err) {
      console.error('Kategori silme hatası:', err.message);
      return res.status(500).json({ error: 'İlişkili kategoriler silinemedi' });
    }

    // Sonra kitabı sil
    db.query('DELETE FROM Kitap WHERE KitapID = ?', [kitapID], (err2) => {
      if (err2) {
        console.error('Kitap silme hatası:', err2.message);
        return res.status(500).json({ error: 'Kitap silinemedi' });
      }

      res.status(200).json({ message: 'Kitap başarıyla silindi' });
    });
  });
});



// Kitap güncelle
app.put('/api/kitaplar/:id', (req, res) => {
  const kitapID = req.params.id;
  const { KitapAdi, YazarID, ISBN, YayineviID, KutuphaneID } = req.body;

  const query = `
    UPDATE Kitap 
    SET KitapAdi = ?, YazarID = ?, ISBN = ?, YayineviID = ?, KutuphaneID = ?
    WHERE KitapID = ?
  `;

  db.query(query, [KitapAdi, YazarID, ISBN, YayineviID, KutuphaneID, kitapID], (err, result) => {
    if (err) {
      console.error('Güncelleme hatası:', err.message);
      return res.status(500).json({ error: 'Kitap güncellenirken hata oluştu' });
    }

    res.status(200).json({ message: 'Kitap güncellendi' });
    console.log('Gelen güncelleme verisi:', req.body);

  });
});


app.post('/api/kitaplar', async (req, res) => {
  const { KitapAdi, YazarID, ISBN, YayineviID, KategoriID } = req.body;

  console.log('Gelen kitap verisi:', req.body);

  if (!KitapAdi || !YazarID || !ISBN || !YayineviID || !KategoriID) {
    return res.status(400).json({ 
      error: 'Eksik veri',
      message: 'Tüm alanlar (kitap adı, yazar, ISBN, yayınevi ve kategori) doldurulmalıdır.'
    });
  }

  // Transaction başlat
  db.beginTransaction(err => {
    if (err) {
      console.error('Transaction başlatma hatası:', err);
      return res.status(500).json({ error: 'İşlem başlatılamadı' });
    }

    // 1. Önce kitabı ekle
    const kitapQuery = `
      INSERT INTO Kitap (KitapAdi, YazarID, ISBN, YayineviID) 
      VALUES (?, ?, ?, ?)
    `;

    db.query(kitapQuery, [KitapAdi, YazarID, ISBN, YayineviID], (err, kitapResult) => {
      if (err) {
        return db.rollback(() => {
          console.error('Kitap ekleme hatası:', err);
          res.status(500).json({ error: 'Kitap eklenirken hata oluştu' });
        });
      }

      const kitapID = kitapResult.insertId;

      // 2. Kitap-Kategori ilişkisini ekle
      const kategoriQuery = `
        INSERT INTO Kitap_Kategori (KitapID, KategoriID) 
        VALUES (?, ?)
      `;

      db.query(kategoriQuery, [kitapID, KategoriID], (err) => {
        if (err) {
          return db.rollback(() => {
            console.error('Kategori ilişkisi ekleme hatası:', err);
            res.status(500).json({ error: 'Kategori ilişkisi eklenirken hata oluştu' });
          });
        }

        // Transaction'ı tamamla
        db.commit(err => {
          if (err) {
            return db.rollback(() => {
              console.error('Commit hatası:', err);
              res.status(500).json({ error: 'İşlem tamamlanamadı' });
            });
          }

          res.status(200).json({ 
            message: 'Kitap ve kategori ilişkisi başarıyla eklendi',
            KitapID: kitapID
          });
        });
      });
    });
  });
});

// Yazar ekleme API'si
app.post('/api/yazarlar', (req, res) => {
  const { YazarAdi } = req.body;
  db.query("INSERT INTO Yazar (YazarAdi) VALUES (?)", [YazarAdi], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ YazarID: result.insertId }); // Yazarın ID'sini geri döndür
  });
});

/** 📚 Yazarları Getir **/
app.get('/api/yazarlar', (req, res) => {
  const query = 'SELECT * FROM Yazar ORDER BY YazarAdi';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Yazarları getirme hatası:', err.message);
      res.status(500).json({ error: 'Veritabanı hatası' });
    } else {
      res.json(results);
    }
  });
});

/** 📚 Yayınevlerini Getir **/
app.get('/api/yayinevleri', (req, res) => {
  const query = 'SELECT * FROM Yayinevi ORDER BY YayineviAdi';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Yayınevlerini getirme hatası:', err.message);
      res.status(500).json({ error: 'Veritabanı hatası' });
    } else {
      res.json(results);
    }
  });
});

/** 📚 Ödünç Kitapları Getir **/
app.get('/api/odunc-kitaplar', (req, res) => {
  const query = `
    SELECT 
      o.OduncID,
      k.KitapID,
      k.KitapAdi,
      CONCAT(u.UyeAdi, ' ', u.UyeSoyadi) as UyeAdi,
      u.UyeID,
      DATE_FORMAT(o.AlisTarihi, '%Y-%m-%d') as AlisTarihi,
      DATE_FORMAT(o.PlanlananTeslimTarihi, '%Y-%m-%d') as PlanlananTeslimTarihi,
      DATE_FORMAT(o.GercekTeslimTarihi, '%Y-%m-%d') as GercekTeslimTarihi,
      o.Durum,
      o.OduncNotu,
      CASE 
        WHEN o.GercekTeslimTarihi IS NOT NULL THEN 
          DATEDIFF(o.PlanlananTeslimTarihi, o.AlisTarihi)
        ELSE 
          DATEDIFF(o.PlanlananTeslimTarihi, o.AlisTarihi)
      END as KalanGun,
      CASE 
        WHEN o.GercekTeslimTarihi IS NOT NULL AND o.GercekTeslimTarihi > o.PlanlananTeslimTarihi THEN 'Gecikmiş'
        WHEN o.GercekTeslimTarihi IS NOT NULL THEN 'Teslim Edildi'
        WHEN CURDATE() > o.PlanlananTeslimTarihi THEN 'Gecikmiş'
        WHEN DATEDIFF(o.PlanlananTeslimTarihi, CURDATE()) <= 2 THEN 'Yakında Dolacak'
        ELSE 'Normal'
      END as GuncelDurum,
      CASE 
        WHEN o.GercekTeslimTarihi IS NOT NULL AND o.GercekTeslimTarihi > o.PlanlananTeslimTarihi THEN 'overdue'
        WHEN o.GercekTeslimTarihi IS NOT NULL THEN 'completed'
        WHEN CURDATE() > o.PlanlananTeslimTarihi THEN 'overdue'
        WHEN DATEDIFF(o.PlanlananTeslimTarihi, CURDATE()) <= 2 THEN 'warning'
        ELSE 'active'
      END as StatusClass
    FROM odunckitap o
    JOIN Kitap k ON o.KitapID = k.KitapID
    JOIN uye u ON o.UyeID = u.UyeID
    ORDER BY 
      CASE 
        WHEN o.GercekTeslimTarihi IS NOT NULL AND o.GercekTeslimTarihi > o.PlanlananTeslimTarihi THEN 1
        WHEN CURDATE() > o.PlanlananTeslimTarihi THEN 2
        WHEN DATEDIFF(o.PlanlananTeslimTarihi, CURDATE()) <= 2 THEN 3
        WHEN o.GercekTeslimTarihi IS NOT NULL THEN 4
        ELSE 5
      END,
      o.AlisTarihi DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Veritabanı hatası:', err.message);
      res.status(500).json({ error: 'Veritabanı hatası' });
    } else {
      res.json(results);
    }
  });
});

// Ödünç kitaba gerçek teslim tarihi atama veya güncelleme
app.put('/api/odunc-kitaplar/:id/teslim-tarihi', (req, res) => {
  const oduncId = req.params.id;
  const { gercekTeslimTarihi } = req.body;
  
  const query = `
    UPDATE odunckitap 
    SET GercekTeslimTarihi = ?,
        Durum = 'Teslim Edildi'
    WHERE OduncID = ?
  `;

  db.query(query, [gercekTeslimTarihi, oduncId], (err, result) => {
    if (err) {
      console.error('Teslim tarihi güncelleme hatası:', err.message);
      return res.status(500).json({ error: 'Teslim tarihi güncellenirken hata oluştu' });
    }
    
    res.json({ 
      success: true, 
      message: 'Gerçek teslim tarihi başarıyla güncellendi',
      affectedRows: result.affectedRows
    });
  });
});

/** 👥 Üye Ekleme API'si **/
app.post('/api/uyeler', (req, res) => {
    const { UyeAdi, UyeSoyadi, TCKimlik, Telefon, Email, UyelikDurumu } = req.body;
    
    // TC Kimlik kontrolü
    if (!TCKimlik || TCKimlik.length !== 11) {
        return res.status(400).json({ message: 'Geçerli bir TC Kimlik numarası giriniz.' });
    }

    // TC Kimlik benzersizlik kontrolü
    db.query('SELECT UyeID FROM uye WHERE TCKimlik = ?', [TCKimlik], (err, results) => {
        if (err) {
            console.error('TC Kimlik kontrolü hatası:', err);
            return res.status(500).json({ message: 'Veritabanı hatası oluştu.' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Bu TC Kimlik numarası ile kayıtlı bir üye zaten var.' });
        }

        // Yeni üye ekleme
        const query = `
            INSERT INTO uye (
                UyeAdi, 
                UyeSoyadi, 
                TCKimlik, 
                Telefon, 
                Email, 
                UyelikTarihi, 
                UyelikDurumu
            ) VALUES (?, ?, ?, ?, ?, NOW(), ?)
        `;

        db.query(
            query,
            [UyeAdi, UyeSoyadi, TCKimlik, Telefon, Email, UyelikDurumu],
            (err, result) => {
                if (err) {
                    console.error('Üye ekleme hatası:', err);
                    return res.status(500).json({ message: 'Üye eklenirken bir hata oluştu.' });
                }

                res.status(201).json({
                    message: 'Üye başarıyla eklendi',
                    uyeId: result.insertId
                });
            }
        );
    });
});

/** 👥 Üyeleri Getir **/
app.get('/api/uyeler', (req, res) => {
    const query = `
        SELECT 
            UyeID,
            UyeAdi,
            UyeSoyadi,
            TCKimlik,
            Telefon,
            Email,
            UyelikTarihi,
            UyelikDurumu
        FROM uye 
        ORDER BY UyeAdi
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Üyeleri getirme hatası:', err);
            res.status(500).json({ error: 'Veritabanı hatası' });
        } else {
            res.json(results);
        }
    });
});

/** 👥 Üye Güncelleme API'si **/
app.put('/api/uye/guncelle/:id', (req, res) => {
    const uyeID = req.params.id;
    const { UyeAdi, UyeSoyadi, TCKimlik, Telefon, Email, UyelikDurumu } = req.body;

    // Temel veri doğrulama
    if (!UyeAdi || !UyeSoyadi || !TCKimlik) {
        return res.status(400).json({ message: 'Ad, Soyad ve TC Kimlik alanları zorunludur.' });
    }

    // TC Kimlik numarası kontrolü
    if (TCKimlik.length !== 11) {
        return res.status(400).json({ message: 'Geçerli bir TC Kimlik numarası giriniz.' });
    }

    // TC Kimlik benzersizlik kontrolü (kendi ID'si hariç)
    const tcKimlikKontrolQuery = 'SELECT UyeID FROM uye WHERE TCKimlik = ? AND UyeID != ?';
    db.query(tcKimlikKontrolQuery, [TCKimlik, uyeID], (err, results) => {
        if (err) {
            console.error('TC Kimlik kontrolü hatası:', err);
            return res.status(500).json({ message: 'Veritabanı hatası oluştu.' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Bu TC Kimlik numarası başka bir üyeye ait.' });
        }

        // Üye güncelleme
        const updateQuery = `
            UPDATE uye 
            SET 
                UyeAdi = ?,
                UyeSoyadi = ?,
                TCKimlik = ?,
                Telefon = ?,
                Email = ?,
                UyelikDurumu = ?
            WHERE UyeID = ?
        `;

        db.query(
            updateQuery,
            [UyeAdi, UyeSoyadi, TCKimlik, Telefon, Email, UyelikDurumu, uyeID],
            (updateErr, updateResult) => {
                if (updateErr) {
                    console.error('Üye güncelleme hatası:', updateErr);
                    return res.status(500).json({ message: 'Üye güncellenirken bir hata oluştu.' });
                }

                if (updateResult.affectedRows === 0) {
                    return res.status(404).json({ message: 'Güncellenecek üye bulunamadı.' });
                }

                res.json({
                    message: 'Üye başarıyla güncellendi',
                    uyeID: uyeID
                });
            }
        );
    });
});

/** 📊 Veritabanı Bakım İşlemleri **/
app.post('/api/db/fix-null-dates', (req, res) => {
  // İlk olarak, bir hata ayıklama mesajı yazdırarak mevcut durumu görelim
  db.query('SELECT * FROM odunckitap LIMIT 5', (err, result) => {
    if (err) {
      console.error('Örnek veri çekme hatası:', err.message);
    } else {
      console.log('Örnek ödünç kitap kayıtları:', result);
    }
    
    // Şimdi düzeltme işlemini yapalım
    const updateQuery = `
      UPDATE odunckitap 
      SET Durum = CASE 
            WHEN Durum IS NULL OR Durum = '' THEN 'Ödünç Verildi'
            ELSE Durum 
          END
      WHERE GercekTeslimTarihi IS NULL
    `;

    db.query(updateQuery, (updateErr, updateResult) => {
      if (updateErr) {
        console.error('Veritabanı güncelleme hatası:', updateErr.message);
        return res.status(500).json({ error: 'Veritabanı güncelleme hatası: ' + updateErr.message });
      }

      // Tablo yapısını kontrol edelim
      db.query("SHOW COLUMNS FROM odunckitap", (colErr, columns) => {
        if (colErr) {
          console.error('Tablo yapısı çekme hatası:', colErr.message);
        } else {
          console.log('Tablo yapısı:', columns);
        }
        
        res.json({ 
          success: true, 
          message: 'Durum alanları düzeltildi', 
          affectedRows: updateResult.affectedRows,
          tableStructure: columns || []
        });
      });
    });
  });
});

// Yeni ödünç kitap ekleme endpoint'i (eğer yoksa)
app.post('/api/odunc-kitaplar', (req, res) => {
  const { KitapID, UyeID, AlisTarihi, PlanlananTeslimTarihi, OduncNotu } = req.body;

  // Önce kitabın zaten ödünç alınıp alınmadığını kontrol et
  const checkQuery = `
    SELECT COUNT(*) as count FROM odunckitap 
    WHERE KitapID = ? AND GercekTeslimTarihi IS NULL
  `;

  db.query(checkQuery, [KitapID], (checkErr, checkResults) => {
    if (checkErr) {
      console.error('Kitap durumu kontrol hatası:', checkErr.message);
      return res.status(500).json({ error: 'Kitap durumu kontrol edilirken hata oluştu: ' + checkErr.message });
    }

    // Eğer kitap zaten ödünç alınmışsa hata döndür
    if (checkResults[0].count > 0) {
      return res.status(400).json({ error: 'Bu kitap şu anda başka bir üye tarafından ödünç alınmış durumda. Teslim edilene kadar tekrar ödünç verilemez.' });
    }

    // Kitap müsaitse ödünç işlemini gerçekleştir
    const query = `
      INSERT INTO odunckitap 
      (KitapID, UyeID, AlisTarihi, PlanlananTeslimTarihi, Durum, OduncNotu) 
      VALUES (?, ?, ?, ?, 'Ödünç Verildi', ?)
    `;

    db.query(
      query,
      [KitapID, UyeID, AlisTarihi, PlanlananTeslimTarihi, OduncNotu],
      (err, result) => {
        if (err) {
          console.error('Ödünç kitap ekleme hatası:', err.message);
          return res.status(500).json({ error: 'Ödünç kitap eklenirken hata oluştu: ' + err.message });
        }
        res.status(200).json({ message: 'Ödünç kitap başarıyla eklendi', id: result.insertId });
      }
    );
  });
});

// Tablo yapısını düzeltmek için yeni endpoint
app.post('/api/db/fix-schema', (req, res) => {
  // Önce tablo yapısını kontrol edelim
  db.query("SHOW COLUMNS FROM odunckitap", (err, columns) => {
    if (err) {
      console.error('Tablo yapısı kontrol hatası:', err.message);
      return res.status(500).json({ error: 'Tablo yapısı kontrol edilirken hata oluştu: ' + err.message });
    }
    
    // GercekTeslimTarihi sütununun varlığını kontrol et
    const gercekTeslimColumn = columns.find(col => col.Field === 'GercekTeslimTarihi');
    
    if (!gercekTeslimColumn) {
      // Sütun yoksa ekleyelim
      const alterQuery = `
        ALTER TABLE odunckitap 
        ADD COLUMN GercekTeslimTarihi DATE NULL
      `;
      
      db.query(alterQuery, (alterErr) => {
        if (alterErr) {
          console.error('Sütun ekleme hatası:', alterErr.message);
          return res.status(500).json({ error: 'Sütun eklenirken hata oluştu: ' + alterErr.message });
        }
        
        res.json({ 
          success: true, 
          message: 'GercekTeslimTarihi sütunu başarıyla eklendi.' 
        });
      });
    } else {
      // Sütun var, tip kontrolü yapalım
      console.log('GercekTeslimTarihi sütun bilgisi:', gercekTeslimColumn);
      
      // Tip doğruysa diğer temizleme işlemlerine devam et
      const updateQuery = `
        UPDATE odunckitap 
        SET 
          GercekTeslimTarihi = NULL,
          Durum = CASE 
            WHEN Durum IS NULL OR Durum = '' THEN 'Ödünç Verildi'
            ELSE Durum 
          END
        WHERE GercekTeslimTarihi = '0000-00-00' OR GercekTeslimTarihi = '';
      `;
      
      db.query(updateQuery, (updateErr, updateResult) => {
        if (updateErr) {
          console.error('Veri düzeltme hatası:', updateErr.message);
          return res.status(500).json({ error: 'Veri düzeltme hatası: ' + updateErr.message });
        }
        
        res.json({ 
          success: true, 
          message: 'Tablo yapısı doğru, veriler düzeltildi.', 
          affectedRows: updateResult.affectedRows 
        });
      });
    }
  });
});

/** 📚 Kategorileri Getir **/
app.get('/api/kategoriler', (req, res) => {
  const query = 'SELECT * FROM Kategori ORDER BY KategoriAdi';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Kategorileri getirme hatası:', err.message);
      res.status(500).json({ error: 'Veritabanı hatası' });
    } else {
      res.json(results);
    }
  });
});

/** 📚 Yeni Kategori Ekle **/
app.post('/api/kategoriler', (req, res) => {
  const { KategoriAdi } = req.body;

  if (!KategoriAdi || KategoriAdi.trim() === '') {
    return res.status(400).json({ error: 'Kategori adı boş olamaz' });
  }

  const query = 'INSERT INTO Kategori (KategoriAdi) VALUES (?)';
  
  db.query(query, [KategoriAdi], (err, result) => {
    if (err) {
      console.error('Kategori ekleme hatası:', err.message);
      return res.status(500).json({ error: 'Kategori eklenirken bir hata oluştu' });
    }
    
    res.status(201).json({
      KategoriID: result.insertId,
      KategoriAdi: KategoriAdi
    });
  });
});

/** 📚 Kitap-Kategori İlişkisi Ekle **/
app.post('/api/kitap-kategori', (req, res) => {
  const { KitapID, KategoriID } = req.body;

  const query = 'INSERT INTO Kitap_Kategori (KitapID, KategoriID) VALUES (?, ?)';
  
  db.query(query, [KitapID, KategoriID], (err) => {
    if (err) {
      console.error('Kitap-Kategori ilişkisi ekleme hatası:', err.message);
      return res.status(500).json({ error: 'İlişki eklenirken bir hata oluştu' });
    }
    
    res.status(201).json({ message: 'Kitap kategorisi başarıyla eklendi' });
  });
});

  

