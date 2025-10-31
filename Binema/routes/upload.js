const express = require("express");
const router = express.Router();
const uploadCloud = require("../middleware/uploadCloud");
const db = require("../config/db"); 

// ==============================
// UPLOAD ẢNH LÊN CLOUDINARY
// VÀ LƯU LINK VÀO BẢNG phiminsert
// ==============================
router.post("/upload", uploadCloud.single("image"), (req, res) => {
  try {
    const imageUrl = req.file.path; // link Cloudinary
    const { maPhim } = req.body; // client gửi kèm mã phim cần update

    if (!maPhim) {
      return res.status(400).json({ error: "Thiếu mã phim (maPhim) trong body" });
    }

    // Cập nhật cột hinhAnh cho phim có mã tương ứng
    const sql = "UPDATE phiminsert SET hinhAnh = ? WHERE maPhim = ?";
    db.query(sql, [imageUrl, maPhim], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Không tìm thấy phim có mã này" });

      res.json({
        message: "Upload thành công và đã lưu link Cloudinary vào bảng phiminsert",
        imageUrl,
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
