-- 1. Veritabanı oluşturma ve seçme
CREATE DATABASE kutuphane_db;
USE kutuphane_db;

-- 2. Ana tabloları oluşturma (başka tablolarca referans edilen tablolar)
CREATE TABLE Kutuphane (
    KutuphaneID INT AUTO_INCREMENT PRIMARY KEY,
    KutuphaneAdi VARCHAR(100) NOT NULL,
    KurulusTarihi DATE
);

CREATE TABLE Yayinevi (
    YayineviID INT AUTO_INCREMENT PRIMARY KEY,
    YayineviAdi VARCHAR(100) NOT NULL
);

CREATE TABLE Yazar (
    YazarID INT AUTO_INCREMENT PRIMARY KEY,
    YazarAdi VARCHAR(100) NOT NULL
);

CREATE TABLE Uye (
    UyeID INT PRIMARY KEY AUTO_INCREMENT,
    UyeAdi VARCHAR(50) NOT NULL,
    UyeSoyadi VARCHAR(50) NOT NULL,
    TCKimlik VARCHAR(11) UNIQUE,
    Telefon VARCHAR(15),
    Email VARCHAR(100),
    UyelikTarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
    UyelikDurumu ENUM('Aktif', 'Pasif') DEFAULT 'Aktif'
);

CREATE TABLE Kategori (
    KategoriID INT AUTO_INCREMENT PRIMARY KEY,
    KategoriAdi VARCHAR(100) NOT NULL,
    KategoriAciklamasi TEXT
);

CREATE TABLE Gorevli (
  GorevliID INT AUTO_INCREMENT PRIMARY KEY,
  AdSoyad VARCHAR(100),
  Eposta VARCHAR(100) UNIQUE,
  Sifre VARCHAR(255)
);

-- 3. İlişkili tabloları oluşturma
CREATE TABLE Kitap (
    KitapID INT AUTO_INCREMENT PRIMARY KEY,
    KitapAdi VARCHAR(100) NOT NULL,
    ISBN VARCHAR(20) UNIQUE NOT NULL,
    KutuphaneID INT,
    YayineviID INT,
    YazarID INT,
    FOREIGN KEY (KutuphaneID) REFERENCES Kutuphane(KutuphaneID),
    FOREIGN KEY (YayineviID) REFERENCES Yayinevi(YayineviID),
    FOREIGN KEY (YazarID) REFERENCES Yazar(YazarID)
);

CREATE TABLE Kitap_Kategori (
    KitapID INT,
    KategoriID INT,
    PRIMARY KEY (KitapID, KategoriID),
    FOREIGN KEY (KitapID) REFERENCES Kitap(KitapID),
    FOREIGN KEY (KategoriID) REFERENCES Kategori(KategoriID)
);

CREATE TABLE Odunc_Islemi (
    OduncID INT AUTO_INCREMENT PRIMARY KEY,
    UyeID INT,
    KitapID INT,
    OduncTarihi DATE NOT NULL,
    TeslimTarihi DATE,
    FOREIGN KEY (UyeID) REFERENCES Uye(UyeID),
    FOREIGN KEY (KitapID) REFERENCES Kitap(KitapID)
);

CREATE TABLE OduncKitap (
    OduncID INT PRIMARY KEY AUTO_INCREMENT,
    KitapID INT NOT NULL,
    UyeID INT NOT NULL,
    AlisTarihi DATETIME NOT NULL,
    PlanlananTeslimTarihi DATETIME NOT NULL,
    GercekTeslimTarihi DATETIME,
    Durum VARCHAR(15),
    OduncNotu TEXT,
    FOREIGN KEY (KitapID) REFERENCES Kitap(KitapID),
    FOREIGN KEY (UyeID) REFERENCES Uye(UyeID)
);




-- 4. Ana tablolara veri ekleme
INSERT INTO Kutuphane (KutuphaneAdi, KurulusTarihi)
VALUES ('Merkez Kütüphane', '1995-06-15');

INSERT INTO Yayinevi (YayineviAdi)
VALUES 
('Martı Yayınları'),
('Artemis Yayınları'),
('İnkılap Kitabevi'),
('Ephesus Yayınları'),
('Nemesis Kitap'),
('Dorlion Yayınevi'),
('Gece Kitaplığı'),
('Can Yayınları'),
('Cinius'),
('Altın Kitaplar'),
('Sokak Kitaplığı Yayınları'),
('Everest Yayınları'),
('Doğan Kitap');

INSERT INTO Yazar (YazarAdi)
VALUES 
('Tess Gerritsen'),
('Serdar Soydan'),
('V. C. Andrews'),
('Robin Cook'),
('Jaci Burton'),
('Hüsseyin Uğuz'),
('Haluk Aytekin'),
('Heinrich Von Kleist'),
('Josh Malerman'),
('Osman Nuri Çelik'),
('Reşat Nuri Güntekin'),
('Eda Aksan'),
('Cecily von Ziegesar'),
('Nicholas Sparks'),
('Sibel Atasoy'),
('Ayfer Güreli'),
('Duru Mavii'),
('Thomas Mann'),
('Nikos Kazancakis'),
('Elizabeth Moon'),
('Kemal Anadol'),
('Jose Mauro De Vasconcelos'),
('Selçuk Büyüktanır'),
('Ahmet Hamdi Tanpınar'),
('Orhan Pamuk'),
('Elif Şafak'),
('Zülfü Livaneli'),
('Hakan Günday'),
('Aslı Perker'),
('Latife Tekin');

INSERT INTO Uye (UyeAdi, UyeSoyadi, TCKimlik, Telefon, Email) VALUES
('Ahmet', 'Yılmaz', '12345678901', '5551234567', 'ahmet@email.com'),
('Ayşe', 'Demir', '12345678902', '5551234568', 'ayse@email.com'),
('Mehmet', 'Kaya', '12345678903', '5551234569', 'mehmet@email.com'),
('Zeynep', 'Şahin', '12345678904', '5551234570', 'zeynep@email.com'),
('Can', 'Öztürk', '12345678905', '5551234571', 'can@email.com');

INSERT INTO Kategori (KategoriAdi, KategoriAciklamasi)
VALUES 
('Polisiye', 'Polisiye romanları içeren kategori'),
('Romantik', 'Romantik türdeki kitapları içeren kategori'),
('Korku Gerilim', 'Korku ve gerilim türündeki kitapları içeren kategori');

INSERT INTO Gorevli (AdSoyad, Eposta, Sifre)

VALUES ('gorevli', 'gorevli@example.com', '123');

-- 5. Kitapları 1'den başlatmak için (opsiyonel)
-- ALTER TABLE Kitap AUTO_INCREMENT = 1;

-- 6. Kitap ve ilişkili verileri ekleme
INSERT INTO Kitap (KitapAdi, ISBN, KutuphaneID, YayineviID, YazarID)
VALUES
('Günahkar (Özel Baskı)', '1234567890', 1, 1, 1),
('Dört Günlük Bir Aşk', '1234567891', 1, 2, 2),
('Gizli Yapraklar', '1234567892', 1, 3, 3),
('Rüzgarla Gelen', '1234567893', 1, 4, 4),
('Kritik', '1234567894', 1, 3, 5),
('Nemesis', '1234567895', 1, 5, 6),
('Gece Yolculuğu', '1234567896', 1, 6, 7),
('Gizem Avcıları', '1234567897', 1, 7, 8),
('Cinayet Kapanı', '1234567898', 1, 8, 9),
('Sırlar Labirenti', '1234567899', 1, 9, 10),
('Gece ve Sis', '1234570000', 1, 10, 11),
('Kan ve Duman', '1234570001', 1, 11, 12),
('Sessizlik', '1234570002', 1, 12, 13),
('Karanlık Sular', '1234570003', 1, 1, 14),
('Yitik Ruhlar', '1234570004', 1, 2, 15),
('Kanlı Ay', '1234570005', 1, 3, 16),
('Gizemli Orman', '1234570006', 1, 4, 17),
('Ateş ve Gölge', '1234570007', 1, 5, 18),
('Sessiz Tanık', '1234570008', 1, 6, 19),
('Karanlık Masallar', '1234570009', 1, 7, 20),
('Gizemli Gece', '1234570010', 1, 8, 21),
('Esrarengiz Adam', '1234570011', 1, 9, 22),
('Tuzak', '1234570012', 1, 10, 23),
('Kayıp Ruhlar', '1234570013', 1, 11, 24),
('Sessiz Sokaklar', '1234570014', 1, 12, 25),
('Karanlık Günbatımı', '1234570015', 1, 1, 26),
('Kanlı Pusula', '1234570016', 1, 2, 27),
('Sisli Gece', '1234570017', 1, 3, 28),
('Sessiz Fırtına', '1234570018', 1, 4, 29),
('Gizemli Ev', '1234570019', 1, 5, 30);

-- 7. İlişki tablolarına veri ekleme
INSERT INTO Kitap_Kategori (KitapID, KategoriID)
VALUES
(1, 3), (2, 2), (3, 3), (4, 2), (5, 3), (6, 1), (7, 3), (8, 1), (9, 3), (10, 1),
(11, 1), (12, 3), (13, 2), (14, 3), (15, 1), (16, 2), (17, 3), (18, 1), (19, 3), (20, 2),
(21, 3), (22, 1), (23, 2), (24, 3), (25, 1), (26, 2), (27, 3), (28, 1), (29, 2), (30, 3);

-- 8. Ödünç verileri ekleme (UyeID değerleri uygun olmalı, 6-8 değerleri yoksa güncelleyin)
INSERT INTO odunckitap (KitapID, UyeID, AlisTarihi, PlanlananTeslimTarihi, GercekTeslimTarihi, Durum, OduncNotu) 
VALUES 
(14, 1, '2024-03-01', '2024-03-15', NULL, 'Normal', 'Standart ödünç'),
(15, 2, '2024-03-02', '2024-03-16', NULL, 'Normal', 'Standart ödünç'),
(16, 3, '2024-03-03', '2024-03-17', NULL, 'Normal', 'Standart ödünç'),
(17, 4, '2024-03-04', '2024-03-18', NULL, 'Normal', 'Standart ödünç'),
(18, 5, '2024-03-05', '2024-03-19', NULL, 'Normal', 'Standart ödünç');