const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,     // π.χ. 'localhost'
  user: process.env.DB_USER,     // π.χ. 'root'
  password: process.env.DB_PASS, // π.χ. ''
  database: process.env.DB_NAME  // π.χ. 'restaurant_app'
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Σφάλμα σύνδεσης στη βάση:', err);
  } else {
    console.log('✅ Συνδέθηκε στη MariaDB');
    connection.release();
  }
});

module.exports = pool.promise();
