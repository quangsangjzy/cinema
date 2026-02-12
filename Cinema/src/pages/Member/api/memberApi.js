import usersApi from "../../../api/usersApi";

// Quy ước điểm/tier (đơn giản, dễ giải thích trong báo cáo)
// - 10.000đ = 1 điểm
// - Hạng dựa theo tổng điểm
export function calcPointsFromAmount(amountVnd = 0) {
  const n = Number(amountVnd) || 0;
  return Math.floor(n / 10000);
}

export function calcTierFromPoints(points = 0) {
  const p = Number(points) || 0;
  if (p >= 2000) return "Kim cương";
  if (p >= 1000) return "Vàng";
  if (p >= 300) return "Bạc";
  return "Thành viên";
}

// Lấy danh sách vé đã đặt của người dùng và chuẩn hóa về dạng "đơn" để hiển thị.
// Backend trả về từng ghế (mỗi record là 1 ghế). FE gom theo maLichChieu + thời gian.
export async function getOrders(user) {
  const taiKhoan = user?.taiKhoan;
  if (!taiKhoan) return [];

  const raw = await usersApi.getDanhSachVeDaDat(taiKhoan);
  const rows = Array.isArray(raw?.data) ? raw.data : raw;

  const map = new Map();
  for (const r of rows || []) {
    const maLichChieu = r?.maLichChieu;
    const date = r?.ngayChieu || r?.gioChieu || "";
    const key = `${maLichChieu || ""}-${date}`;

    const seat = r?.tenDayDu || r?.tenGhe || "";
    const amount = Number(r?.giaVe) || 0;
    const theater = [r?.tenCumRap, r?.tenRap].filter(Boolean).join(" - ");

    if (!map.has(key)) {
      map.set(key, {
        id: key,
        date: date || new Date().toISOString(),
        movie: r?.tenPhim || "",
        theater,
        seats: seat ? [seat] : [],
        amount,
        pointsEarned: 0,
        status: r?.status ?? r?.isConfirm ?? false,
      });
    } else {
      const cur = map.get(key);
      if (seat && !cur.seats.includes(seat)) cur.seats.push(seat);
      cur.amount += amount;
    }
  }

  const orders = Array.from(map.values());
  // tính điểm cho từng "đơn" (để HistoryTable hiển thị)
  orders.forEach((o) => {
    o.pointsEarned = calcPointsFromAmount(o.amount);
  });

  // sắp xếp mới -> cũ
  orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return orders;
}

// Lấy profile từ endpoint ThongTinTaiKhoan.
// Đồng thời tính tổng chi tiêu + hạng dựa theo orders.
export async function getProfile(user, orders = []) {
  const taiKhoan = user?.taiKhoan;
  if (!taiKhoan) return null;

  const raw = await usersApi.getThongTinTaiKhoan({ taiKhoan });
  const u = raw?.data || raw;

  const totalSpent = (orders || []).reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const totalPoints = getPoints(orders);

  return {
    id: u?.taiKhoan || taiKhoan,
    name: u?.hoTen || "",
    avatar: null,
    email: u?.email || "",
    phone: u?.soDt || "",
    birthday: "",
    totalSpent,
    tier: calcTierFromPoints(totalPoints),
    // giữ lại để update profile sau này
    taiKhoan: u?.taiKhoan || taiKhoan,
    maNhom: u?.maNhom,
    maLoaiNguoiDung: u?.maLoaiNguoiDung,
  };
}

export function getPoints(orders = []) {
  return (orders || []).reduce((sum, o) => sum + (Number(o.pointsEarned) || 0), 0);
}

// (Tuỳ chọn) update profile: cập nhật hoTen/email/soDt
// Lưu ý: endpoint cần token hợp lệ.
export async function updateProfile(profile, payload) {
  const next = {
    taiKhoan: profile?.taiKhoan,
    hoTen: payload?.name ?? profile?.name,
    email: payload?.email ?? profile?.email,
    soDt: payload?.phone ?? profile?.phone,
    maNhom: profile?.maNhom,
    maLoaiNguoiDung: profile?.maLoaiNguoiDung,
  };
  const res = await usersApi.editTaiKhoan(next);
  return res?.data || res;
}
