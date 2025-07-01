# Kütüphane Otomasyonu

Kütüphane Otomasyonu, kitap ve üye işlemlerini kolaylaştıran, web tabanlı bir kütüphane yönetim sistemidir. Kullanıcılar kitap ekleyebilir, güncelleyebilir, silebilir, ödünç alabilir ve iade edebilir. Yönetici paneli ile tüm işlemler kolayca yönetilebilir.

## Özellikler
- Kitap ekleme, silme, güncelleme
- Kitap arama ve listeleme
- Üye ekleme ve yönetimi
- Kitap ödünç alma ve iade işlemleri
- Yönetici paneli
- Raporlama ve istatistikler
- Karanlık/aydınlık tema desteği

## Kurulum

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/kullanici-adi/kutuphane-otomasyonu.git
```

### 2. Bağımlılıkları Yükleyin
Ana dizinde ve `arayuz/backend` klasöründe aşağıdaki komutları çalıştırın:
```bash
cd Kütüphane-Otomasyonu-Son-Revizyon(13.05.2025,3)/arayuz
npm install
cd backend
npm install
```

### 3. Veritabanı Kurulumu
- `KUTUPHANE-DB-SQL.sql` dosyasını bir MySQL sunucusunda çalıştırarak veritabanını oluşturun.
- `backend/db.js` dosyasında veritabanı bağlantı ayarlarını kendi sunucunuza göre düzenleyin.

### 4. Sunucuyu Başlatın
Backend'i başlatmak için:
```bash
cd Kütüphane-Otomasyonu-Son-Revizyon(13.05.2025,3)/arayuz/backend
node server.js
```
Frontend'i başlatmak için:
```bash
cd Kütüphane-Otomasyonu-Son-Revizyon(13.05.2025,3)/arayuz
npm start
```

## Kullanım
- Uygulama açıldığında ana sayfada kitaplar listelenir.
- Yönetici girişi ile kitap ve üye işlemleri yapılabilir.
- Kitap ödünç alma ve iade işlemleri panel üzerinden yönetilir.

## Proje Yapısı
```
Kütüphane-Otomasyonu-Son-Revizyon(13.05.2025,3)/
├── arayuz/
│   ├── backend/         # Node.js + Express backend
│   ├── public/          # Statik dosyalar
│   ├── src/             # React kaynak kodu
│   └── ...
├── KUTUPHANE-DB-SQL.sql # Veritabanı scripti
└── ...
```

![otomasyon_arayuz1](https://github.com/user-attachments/assets/5f7aa02d-e62e-4475-898a-570d6fb2069b)

![otomasyon_arayuz2](https://github.com/user-attachments/assets/933c1833-26a5-480d-bc95-46d41e81a2e0)

![otomasyon_arayuz3](https://github.com/user-attachments/assets/d19f74c6-774f-4a8f-b095-51303683d425)

![otomasyon_arayuz4](https://github.com/user-attachments/assets/c70d9a45-f852-4d5e-bbc9-76a16a3b53a1)

![otomasyon_arayuz5](https://github.com/user-attachments/assets/f24e2ec0-607e-4442-a5cf-b84749b00cd6)

![otomasyon_arayuz6](https://github.com/user-attachments/assets/b7107e3e-b160-416d-bef3-6f0a44378528)

![otomasyon_arayuz7](https://github.com/user-attachments/assets/046b5b33-2070-4ef8-af34-5aac018f676e)

![otomasyon_arayuz8](https://github.com/user-attachments/assets/2cce53d9-3187-4327-86bc-3acb7ea706be)

![otomasyon_arayuz9](https://github.com/user-attachments/assets/de5be067-8ff5-491f-92f6-285516caeecc)







