import axiosClient from "./axiosClient";

const newsApi = {
  // ===== PUBLIC (khách hàng) =====
  home: (params) =>
    axiosClient.get("/QuanLyTinTuc/LayTinTucTrangChu", { params }),

  list: (params) =>
    axiosClient.get("/QuanLyTinTuc/LayDanhSachTinTuc", { params }),

  detail: (slug, options = {}) => {
    const { preview = 0 } = options;

    return axiosClient.get("/QuanLyTinTuc/LayChiTietTinTuc", {
      params: preview ? { slug, preview: 1 } : { slug },
    });
  },

  // ===== ADMIN =====
  adminList: (params) =>
    axiosClient.get("/QuanLyTinTuc/Admin/LayDanhSachTinTuc", { params }),

  create: (payload) =>
    axiosClient.post("/QuanLyTinTuc/ThemTinTuc", payload),

  deleteBySlug: (slug) =>
    axiosClient.delete("/QuanLyTinTuc/Admin/XoaTinTuc", {
      params: { slug },
    }),

  updateBySlug: (slug, payload) =>
    axiosClient.put("/QuanLyTinTuc/Admin/CapNhatTinTuc", payload, {
      params: { slug },
    }),
};

export default newsApi;
