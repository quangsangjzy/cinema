const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", // tên folder bạn muốn lưu trên Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "jpeg"],
  },
});

const uploadCloud = multer({ storage });
module.exports = uploadCloud;
