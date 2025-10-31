// Binema/config/db.js
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",         
  password: "sang2002",      
  database: "cinema", 
});

db.connect((err) => {
  if (err) {
    console.error("❌ Kết nối database thất bại:", err);
  } else {
    console.log("✅ Đã kết nối MySQL thành công!");
  }
});

module.exports = db;
