const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Lấy danh sách phim
router.get("/", (req, res) => {
  const sql = `
    SELECT maPhim, tenPhim, theLoai, hinhAnh, trangThai
    FROM phiminsert
    ORDER BY maPhim DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      res.status(500).json({ message: "Lỗi khi lấy danh sách phim" });
    } else {
      res.json(results);
    }
  });
});

module.exports = router;
