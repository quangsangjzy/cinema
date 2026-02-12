import axiosClient from "./axiosClient";

// Seat layout APIs
const chairApi = {
  // GET /api/QuanLyGhe/LayDanhSachGhe?maRap=...
  getSeatsByRap: (maRap) => {
    const path = `/QuanLyGhe/LayDanhSachGhe?maRap=${maRap}`;
    return axiosClient.get(path);
  },

  // POST /api/QuanLyGhe/Admin/TaoSoDoGheMacDinh
  createDefaultLayout: (payload) => {
    const path = `/QuanLyGhe/Admin/TaoSoDoGheMacDinh`;
    return axiosClient.post(path, payload);
  },

  // PUT /api/QuanLyGhe/Admin/CapNhatSoDoGhe
  updateLayout: (payload) => {
    const path = `/QuanLyGhe/Admin/CapNhatSoDoGhe`;
    return axiosClient.put(path, payload);
  },
};

export default chairApi;