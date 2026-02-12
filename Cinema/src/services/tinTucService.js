import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:4003",
});

export const tinTucService = {
  // Trang chủ tin tức
  getHome() {
    return api.get("/api/QuanLyTinTuc/LayTinTucTrangChu");
  },

  // Danh sách theo category + phân trang + search
  getList({ category = "PROMO", page = 1, pageSize = 10, q = "" } = {}) {
    return api.get("/api/QuanLyTinTuc/LayDanhSachTinTuc", {
      params: { category, page, pageSize, q },
    });
  },

  // Chi tiết theo slug
  getDetail(slug) {
    return api.get("/api/QuanLyTinTuc/LayChiTietTinTuc", { params: { slug } });
  },
};
