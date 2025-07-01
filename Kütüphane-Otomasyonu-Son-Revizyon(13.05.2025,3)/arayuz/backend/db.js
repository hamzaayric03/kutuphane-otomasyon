const mysql = require('mysql2');


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',     // kendi şifreni yaz (XAMPP vs. kullanıyorsan genelde boş)
  database: 'kutuphane_db'
});

db.connect((err) => {
  if (err) {
    console.error('MySQL bağlantı hatası:', err.message);
  } else {
    console.log('MySQL bağlantısı başarılı.');
  }
});

module.exports = db;



