const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',        
  database: 'cv_app',
  port: 3306
});

module.exports = db;