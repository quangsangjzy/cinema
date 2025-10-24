const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Cấu hình nơi lưu ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Route upload ảnh
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Không có file upload!" });
  const imageUrl = `http://localhost:4000/uploads/${req.file.filename}`;
  res.json({ message: "Upload thành công", imageUrl });
});

module.exports = router;
