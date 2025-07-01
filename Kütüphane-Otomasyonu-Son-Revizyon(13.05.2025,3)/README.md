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

![Kütüphane Görseli](Kütüphane-Otomasyonu-Son-Revizyon(13.05.2025,3)/arayuz/public/img/otomasyon_arayuz1)