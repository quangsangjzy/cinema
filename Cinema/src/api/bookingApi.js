import axiosClient from "./axiosClient";
const BookTicketApi = {
    getDanhSachPhongVe: (maLichChieu, clientId = "") => {
        const cid = clientId ? `&clientId=${encodeURIComponent(clientId)}` : "";
        const path = `/QuanLyDatVe/LayDanhSachPhongVe?MaLichChieu=${maLichChieu}${cid}`;
        return axiosClient.get(path);
    },

    postDatVe: (data) => {
        const path = `/QuanLyDatVe/DatVe`;

        return axiosClient.post(path, data);
    },

    postTaoLichChieu: (data) => {
        const path = `/QuanLyDatVe/TaoLichChieu`;
        return axiosClient.post(path, data);
    },
    getLichChieuByMaLichChieu : (maLichChieu) => {
        const path = `/QuanLyDatVe/LayLichChieu?MaLichChieu=${maLichChieu}`;
        return axiosClient.get(path);
    },
    editLichChieuByMaLichChieu : (maLichChieu, time, gia) => {
        const path = `/QuanLyDatVe/SuaLichChieu?MaLichChieu=${maLichChieu}`;
        return axiosClient.put(path, {time, gia});
    },

giuGhe: (data) => {
    const path = `/QuanLyDatVe/GiuGhe`;
    return axiosClient.post(path, data);
},

huyGiuGhe: (data) => {
    const path = `/QuanLyDatVe/HuyGiuGhe`;
    return axiosClient.post(path, data);
},

huyGiuGheTatCa: (data) => {
    const path = `/QuanLyDatVe/HuyGiuGheTatCa`;
    return axiosClient.post(path, data);
},
};

export default BookTicketApi;