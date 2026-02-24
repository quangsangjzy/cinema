var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var md5 = require("md5");
var mysql = require("mysql2");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { application } = require("express");
var nodemailer = require("nodemailer");
const path = require("path");

let $ = require("jquery");
const request = require("request");
const moment = require("moment");
dotenv.config();

// payOS (SDK hiện tại dùng ESM, nên mình hỗ trợ cả require + dynamic import)
let PayOS;
async function getPayOSClass() {
  if (PayOS) return PayOS;

  try {
    ({ PayOS } = require("@payos/node"));
    return PayOS;
  } catch (e) {
    // fallback sang import()
  }

  const mod = await import("@payos/node");
  PayOS = mod.PayOS || (mod.default && mod.default.PayOS);
  return PayOS;
}

app.use(cors());
app.set("etag", false);

app.use((req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});
app.use(bodyParser.json({ limit: "5000mb" }));
app.use(bodyParser.urlencoded({ limit: "5000mb" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use(express.json());
const uploadRouter = require("./routes/upload");
app.use("/api/upload", uploadRouter);
app.options("*", function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(204);
});

const dbConn = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "sang2002",
  database: "cinema",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
});

dbConn.query("SELECT 1", (err) => {
  if (err) console.error("❌ MySQL pool test failed:", err.message);
  else console.log("✅ MySQL pool ready");
});

const db = dbConn;
const PORT = process.env.PORT || 4003;
const PUBLIC_BASE_URL =
  (process.env.PUBLIC_BASE_URL &&
    process.env.PUBLIC_BASE_URL.replace(/\/$/, "")) ||
  `http://localhost:${PORT}`;
// Các route khác

app.set("trust proxy", true);
function absUrl(p) {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  const rel = p.startsWith("/") ? p : `/${p}`;
  //   console.log("👉 PUBLIC_BASE_URL =", PUBLIC_BASE_URL); // Thêm dòng này
  return `${PUBLIC_BASE_URL}${rel}`;
}
app.get("/", (req, res) => res.send("API đang chạy..."));
// Set up Global configuration access

// === Cloudinary URL helpers ===
function toCloudUrl(keyOrUrl) {
  if (!keyOrUrl) return null;
  if (/^https?:\/\//i.test(keyOrUrl)) return keyOrUrl;
  const base = (process.env.ASSET_BASE_URL || "").replace(/\/$/, "");
  const rel = String(keyOrUrl).replace(/^\/+/, ""); // bỏ slash đầu
  return `${base}/${rel}`;
}

// Chỉ lưu "key" (public_id+ext) vào DB, cắt base nếu FE lỡ gửi full URL
function toCloudKey(input) {
  if (!input) return null;
  const base = (process.env.ASSET_BASE_URL || "").replace(/\/$/, "");
  let key = String(input);
  if (base && key.startsWith(base)) key = key.slice(base.length);
  return key.replace(/^\/+/, ""); // ví dụ: movies/1761226341963.png
}

const validateToken = (req, res) => {
  const tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
  const jwtSecretKey = process.env.JWT_SECRET_KEY;
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verified = jwt.verify(token, jwtSecretKey);
    if (!verified) return res.status(401).send(error);
  } catch (error) {
    console.log(error);
    return res.status(401).send(error);
  }
};
// VNPay
// Thanh toán (payOS)
app.get("/api/create_payment_url", async function (req, res) {
  try {
    const PayOSClass = await getPayOSClass();
    if (!PayOSClass) {
      return res.status(500).json({
        message:
          "Thiếu thư viện payOS. Hãy chạy: npm i @payos/node (trong thư mục Binema)",
      });
    }

    const { amount, maLichChieu, taiKhoanNguoiDung } = req.query;
    const totalAmount = Number(amount || 0);

    if (
      !maLichChieu ||
      !taiKhoanNguoiDung ||
      !Number.isFinite(totalAmount) ||
      totalAmount <= 0
    ) {
      return res.status(400).json({
        message:
          "Thiếu hoặc sai tham số: amount, maLichChieu, taiKhoanNguoiDung",
      });
    }

    // Lấy danh sách vé từ query dạng danhSachVe[0], danhSachVe[1]...
    const seats = Object.keys(req.query)
      .filter((k) => k.startsWith("danhSachVe["))
      .sort((a, b) => {
        const ai = Number(a.match(/\[(\d+)\]/)?.[1] || 0);
        const bi = Number(b.match(/\[(\d+)\]/)?.[1] || 0);
        return ai - bi;
      })
      .map((k) => {
        const raw = req.query[k];
        if (typeof raw === "string") {
          try {
            return JSON.parse(raw);
          } catch {
            return { tenDayDu: String(raw), giaVe: 0 };
          }
        }
        return raw;
      })
      .filter(Boolean);

    const PUBLIC_WEB_URL = (
      process.env.PUBLIC_WEB_URL || "http://localhost:3000"
    ).replace(/\/$/, "");
    const returnUrl = `${PUBLIC_WEB_URL}/datve/${maLichChieu}`;
    const cancelUrl = `${PUBLIC_WEB_URL}/datve/${maLichChieu}`;

    // orderCode bắt buộc là number
    const orderCode = Number(String(Date.now()).slice(-9));

    const payOS = new PayOSClass({
      clientId: process.env.PAYOS_CLIENT_ID,
      apiKey: process.env.PAYOS_API_KEY,
      checksumKey: process.env.PAYOS_CHECKSUM_KEY,
    });

    const items = (
      seats.length ? seats : [{ tenDayDu: "Vé phim", giaVe: totalAmount }]
    ).map((s) => ({
      name: `Ghế ${s.tenDayDu || s.maGhe || ""}`.trim(),
      quantity: 1,
      price: Number(s.giaVe || 0),
    }));

    const paymentData = {
      orderCode,
      amount: totalAmount,
      description: `Thanh toán vé (${maLichChieu})`,
      items,
      cancelUrl,
      returnUrl,
    };

    // SDK dùng paymentRequests.create để tạo link thanh toán
    const paymentLink = await payOS.paymentRequests.create(paymentData);
    return res.send(paymentLink.checkoutUrl);
  } catch (error) {
    console.error("[payOS] create_payment_url error:", error);
    return res.status(500).json({
      message: "Không tạo được link thanh toán payOS",
      error: error?.message || String(error),
    });
  }
});

// QuanLyRap

app.get("/api/QuanLyRap/LayThongTinHeThongRap", function (req, res) {
  dbConn.query(
    "SELECT * FROM hethongrap",
    [],
    function (error, results, fields) {
      if (error) throw error;
      return res.send(results);
    },
  );
});

app.get("/api/QuanLyRap/LayThongTinCumRapTheoHeThong", async (req, res) => {
  const final = [];
  dbConn.query(
    "SELECT * FROM cumrap JOIN hethongrapvacumrap ON cumrap.cid = hethongrapvacumrap.cumrap JOIN hethongrap ON hethongrap.hid = hethongrapvacumrap.hethongrap WHERE hethongrap.maHeThongRap = ?",
    [req.query.maHeThongRap],
    async (error, results, fields) => {
      if (error) throw error;
      for (const result of results) {
        let danhSachRap = [];
        danhSachRap = await new Promise((resolve, reject) => {
          dbConn.query(
            "SELECT * FROM danhsachrap WHERE maCumRap = ?",
            [result.cid],
            async (error, results1, fields) => {
              if (error) throw error;
              for (const result1 of results1) {
                danhSachRap.push({
                  maRap: result1.maRap,
                  tenRap: result1.tenRap,
                });
              }
              resolve(danhSachRap);
            },
          );
        });
        final.push({
          danhSachRap: danhSachRap,
          maCumRap: result.maCumRap,
          tenCumRap: result.tenCumRap,
          diaChi: result.diaChi,
        });
      }
      return res.send(final);
    },
  );
});

app.get("/api/QuanLyRap/LayThongTinRap", async (req, res) => {
  dbConn.query(
    "select * from danhsachrap d join cumrap c on d.maCumRap = c.cid join hethongrapvacumrap h on h.cumrap = c.cid  join hethongrap hr on hr.hid = h.hethongrap ",
    async (error, results, fields) => {
      if (error) throw error;
      return res.send(results);
    },
  );
});
// QuanLyNguoiDung

app.post("/api/QuanLyNguoiDung/DangKy", async (req, res) => {
  const final = await new Promise((resolve, reject) => {
    dbConn.query(
      "INSERT INTO nguoidungvm SET ? ",
      {
        taiKhoan: req.body.taiKhoan,
        matKhau: md5(req.body.matKhau),
        email: req.body.email,
        soDt: req.body.soDt,
        maNhom: req.body.maNhom,
        maLoaiNguoiDung: req.body.maLoaiNguoiDung,
        hoTen: req.body.hoTen,
      },
      function (error, results, fields) {
        if (error) throw error;
        resolve(res.send("Success"));
      },
    );
  });
  return final;
});

app.post("/api/QuanLyNguoiDung/DangNhap", function (req, res) {
  dbConn.query(
    "SELECT * FROM nguoidungvm WHERE taiKhoan=? AND matKhau=?",
    [req.body.taiKhoan, md5(req.body.matKhau)],
    function (error, results, fields) {
      if (error) throw error;
      if (results.length > 0) {
        info = JSON.parse(JSON.stringify(results[0]));
        info["accessToken"] = jwt.sign(info, process.env.JWT_SECRET_KEY);
        return res.send(info);
      }
      return res.status(401).send({ error: true });
    },
  );
});

app.get("/api/QuanLyNguoiDung/LayDanhSachNguoiDung", function (req, res) {
  dbConn.query(
    "SELECT * FROM nguoidungvm WHERE maNhom=?",
    [req.query.MaNhom],
    function (error, results, fields) {
      if (error) throw error;
      return res.send(results);
    },
  );
});

app.get("/api/ThongKe/getMonth", function (req, res) {
  dbConn.query(
    "SELECT MONTH(ngayMuaVe) AS thang, YEAR(ngayMuaVe) AS nam, SUM(amount) AS doanhSo FROM cinema.thongke  GROUP BY YEAR(ngayMuaVe), MONTH(ngayMuaVe) ORDER BY nam, thang",
    [],
    function (error, results, fields) {
      if (error) throw error;
      return res.send(results);
    },
  );
});

app.get("/api/ThongKe/getPhim", function (req, res) {
  dbConn.query(
    "SELECT tenPhim, COUNT(*) AS soLuong from cinema.thongke GROUP BY tenPhim",
    [],
    function (error, results, fields) {
      if (error) throw error;
      return res.send(results);
    },
  );
});

app.get("/api/ThongKe/getTopDoanhThu", async function (req, res) {
  try {
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "5", 10) || 5, 1),
      50,
    );

    // ✅ Top phim theo tổng doanh thu (thongke.amount), join theo tenPhim
    const [rows] = await dbConn.promise().query(
      `SELECT 
         p.maPhim, p.tenPhim, p.biDanh, p.trailer, p.hinhAnh, p.moTa, p.ngayKhoiChieu, p.danhGia,
         p.nhaSanXuat, p.daoDien, p.dienVien, p.maTheLoaiPhim, p.dinhDang,
         IFNULL(SUM(t.amount), 0) AS doanhThu
       FROM phiminsert p
       LEFT JOIN thongke t
  ON t.tenPhim COLLATE utf8mb4_general_ci = p.tenPhim COLLATE utf8mb4_general_ci
       GROUP BY p.maPhim
       ORDER BY doanhThu DESC, p.maPhim DESC
       LIMIT ?`,
      [limit],
    );

    const mapped = (rows || []).map((r) => ({
      ...r,
      hinhAnh: absUrl(r.hinhAnh),
      doanhThu: Number(r.doanhThu || 0),
    }));

    return res.send(mapped);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Lỗi khi lấy top doanh thu");
  }
});

app.post("/api/QuanLyNguoiDung/ThongTinTaiKhoan", function (req, res) {
  validateToken(req, res);
  dbConn.query(
    "SELECT * FROM nguoidungvm WHERE taiKhoan = ?",
    [req.body.taiKhoan],
    function (error, results, fields) {
      if (error) throw error;
      return res.send(results[0]);
    },
  );
});

app.put("/api/QuanLyNguoiDung/CapNhatThongTinNguoiDung", function (req, res) {
  validateToken(req, res);
  if (req.body.matKhau) {
    dbConn.query(
      "UPDATE nguoidungvm SET ? WHERE taiKhoan = ?",
      [
        {
          taiKhoan: req.body.taiKhoan,
          matKhau: md5(req.body.matKhau),
          email: req.body.email,
          soDt: req.body.soDt,
          maNhom: req.body.maNhom,
          maLoaiNguoiDung: req.body.maLoaiNguoiDung,
          hoTen: req.body.hoTen,
        },
        req.body.taiKhoan,
      ],
      function (error, results, fields) {
        if (error) throw error;
        return res.send(results[0]);
      },
    );
  } else {
    dbConn.query(
      "UPDATE nguoidungvm SET ? WHERE taiKhoan = ?",
      [
        {
          taiKhoan: req.body.taiKhoan,
          email: req.body.email,
          soDt: req.body.soDt,
          maNhom: req.body.maNhom,
          maLoaiNguoiDung: req.body.maLoaiNguoiDung,
          hoTen: req.body.hoTen,
        },
        req.body.taiKhoan,
      ],
      function (error, results, fields) {
        if (error) throw error;
        return res.send(results[0]);
      },
    );
  }
});

app.delete("/api/QuanLyNguoiDung/XoaNguoiDung", function (req, res) {
  dbConn.query(
    "DELETE FROM nguoidungvm WHERE taiKhoan=?",
    [req.query.TaiKhoan],
    function (error, results, fields) {
      if (error) throw error;
    },
  );

  dbConn.query(
    "DELETE FROM cinema.datve WHERE taiKhoanNguoiDat = ? AND isConfirm = 0 ",
    [req.query.TaiKhoan],
    function (error, results, fields) {
      return res.send("Success");
    },
  );
});

// QuanLyRap

app.get("/api/QuanLyRap/LayThongTinHeThongRap", function (req, res) {
  dbConn.query(
    "SELECT * FROM hethongrap",
    [],
    function (error, results, fields) {
      if (error) throw error;
      return res.send(results);
    },
  );
});

app.get("/api/QuanLyRap/LayThongTinCumRap", function (req, res) {
  dbConn.query("SELECT * FROM cumrap", [], function (error, results, fields) {
    if (error) throw error;
    return res.send(results);
  });
});

app.get("/api/QuanLyRap/LayThongTinTheLoaiPhim", function (req, res) {
  dbConn.query(
    "SELECT * FROM cinema.theloaiphim",
    [],
    function (error, results, fields) {
      if (error) throw error;
      return res.send(results);
    },
  );
});

app.post("/api/QuanLyRap/AddTheLoaiPhim", function (req, res) {
  dbConn.query(
    "INSERT INTO cinema.theloaiphim (name) VALUES(?)",
    [req.body.tenTheLoai],
    function (error, results, fields) {
      if (error) throw error;
      return res.send(results);
    },
  );
});

app.put("/api/QuanLyRap/UpdateTheLoaiPhim", function (req, res) {
  dbConn.query(
    "UPDATE cinema.theloaiphim SET tenTheLoai=? WHERE id=?",
    [req.body.tenTheLoai, req.body.id],
    function (error, results, fields) {
      if (error) throw error;
      return res.send(results);
    },
  );
});

app.post("/api/QuanLyRap/DeleteTheLoaiPhim", function (req, res) {
  dbConn.query(
    "DELETE FROM cinema.theloaiphim WHERE id=?",
    [req.body.id],
    function (error, results, fields) {
      if (error) throw error;
      return res.send(results);
    },
  );
});

app.get("/api/QuanLyRap/LayThongTinLichChieuHeThongRap", function (req, res) {
  const final = [];
  dbConn.query(
    "SELECT * FROM hethongrap",
    [],
    async (error, results, fields) => {
      if (error) throw error;
      for (const result of results) {
        let lstCumRap = [];
        lstCumRap = await new Promise((resolve, reject) => {
          dbConn.query(
            "SELECT * FROM hethongrap JOIN hethongrapvacumrap ON hethongrap.hid = hethongrapvacumrap.hethongrap JOIN cumrap ON cumrap.cid = hethongrapvacumrap.cumrap WHERE hethongrap.hid = ?",
            [result.hid],
            async (error, results0, fields) => {
              if (error) throw error;
              for (const result0 of results0) {
                let danhSachPhim = [];
                danhSachPhim = await new Promise((resolve, reject) => {
                  dbConn.query(
                    "SELECT * FROM phiminsert JOIN hethongrapvaphim ON phiminsert.maPhim = hethongrapvaphim.maPhim JOIN hethongrap ON hethongrap.hid = hethongrapvaphim.maHeThongRap JOIN phiminsertvalichchieuinsert ON phiminsert.maPhim = phiminsertvalichchieuinsert.phiminsert JOIN cumrapvalichchieuinsert ON phiminsertvalichchieuinsert.lichchieuinsert = cumrapvalichchieuinsert.lichchieuinsert WHERE hethongrap.hid = ? AND cumrapvalichchieuinsert.cumrap = ?",
                    [result0.hid, result0.cid],
                    async (error, results1, fields) => {
                      if (error) throw error;
                      for (const result1 of results1) {
                        let lstLichChieuTheoPhim = [];
                        lstLichChieuTheoPhim = await new Promise(
                          (resolve, reject) => {
                            dbConn.query(
                              "SELECT * FROM lichchieuinsert JOIN phiminsertvalichchieuinsert ON lichchieuinsert.maLichChieu = phiminsertvalichchieuinsert.lichchieuinsert JOIN phiminsert ON phiminsert.maPhim = phiminsertvalichchieuinsert.phiminsert WHERE phiminsertvalichchieuinsert.phiminsert = ?",
                              [result1.maPhim],
                              async (error, results2, fields) => {
                                if (error) throw error;
                                for (const result2 of results2) {
                                  lstLichChieuTheoPhim.push({
                                    maLichChieu: result2.maLichChieu,
                                    maRap: result2.maRap,
                                    tenRap: result2.tenRap,
                                    ngayChieuGioChieu:
                                      result2.ngayChieuGioChieu,
                                    giaVe: result2.giaVe,
                                  });
                                }
                                resolve(lstLichChieuTheoPhim);
                              },
                            );
                          },
                        );
                        const phim = {
                          lstLichChieuTheoPhim: lstLichChieuTheoPhim,
                          maPhim: result1.maPhim,
                          tenPhim: result1.tenPhim,
                          hinhAnh: result1.hinhAnh.toString(),
                        };
                        // console.log("PHIM", phim)
                        danhSachPhim.push(phim);
                      }
                      resolve(danhSachPhim);
                    },
                  );
                });
                let danhSachRap = [];
                danhSachRap = await new Promise((resolve, reject) => {
                  dbConn.query(
                    "SELECT * FROM danhsachrap WHERE danhsachrap.maCumRap = ?",
                    [result0.cid],
                    async (error, results1, fields) => {
                      if (error) throw error;
                      for (const result1 of results1) {
                        const rap = {
                          maRap: result1.maRap,
                        };
                        danhSachRap.push(rap);
                      }
                      resolve(danhSachRap);
                    },
                  );
                });
                const cumrap = {
                  danhSachPhim: danhSachPhim,
                  danhSachRap: danhSachRap,
                  maCumRap: result0.maCumRap,
                  tenCumRap: result0.tenCumRap,
                  diaChi: result0.diaChi,
                };
                lstCumRap.push(cumrap);
              }
              resolve(lstCumRap);
            },
          );
        });
        final.push({
          lstCumRap: lstCumRap,
          maHeThongRap: result.maHeThongRap,
          tenHeThongRap: result.tenHeThongRap,
          logo: result.logo,
          mahom: "GP09",
        });
      }
      return res.send(final);
    },
  );
});

app.get("/api/QuanLyRap/LayThongTinLichChieuPhim", async (req, res) => {
  try {
    const maPhim = req.query.MaPhim || req.query.maPhim;
    if (!maPhim) return res.status(400).json({ message: "Thiếu MaPhim" });

    // ✅ Luôn lấy thông tin phim trước (không phụ thuộc lịch chiếu)
    const [phimRows] = await dbConn
      .promise()
      .query("SELECT * FROM phiminsert WHERE maPhim = ? LIMIT 1", [maPhim]);

    const phim = phimRows?.[0];
    if (!phim) return res.status(404).json({ message: "Không tìm thấy phim" });

    // ✅ Lấy các hệ thống rạp có liên quan tới phim (có thể rỗng nếu chưa set lịch chiếu)
    const [heThongRows] = await dbConn.promise().query(
      `SELECT DISTINCT ht.hid, ht.maHeThongRap, ht.tenHeThongRap, ht.logo
       FROM hethongrap ht
       JOIN hethongrapvaphim htp ON ht.hid = htp.maHeThongRap
       WHERE htp.maPhim = ?`,
      [maPhim],
    );

    const heThongRapChieu = [];

    for (const ht of heThongRows) {
      // Lấy cụm rạp thuộc hệ thống rạp này mà có lịch chiếu của phim
      const [cumRows] = await dbConn.promise().query(
        `SELECT DISTINCT cr.cid, cr.maCumRap, cr.tenCumRap
         FROM hethongrapvacumrap hvc
         JOIN cumrap cr ON cr.cid = hvc.cumrap
         JOIN cumrapvalichchieuinsert cvlc ON cr.cid = cvlc.cumrap
         JOIN phiminsertvalichchieuinsert pvlc ON cvlc.lichchieuinsert = pvlc.lichchieuinsert
         WHERE hvc.hethongrap = ? AND pvlc.phiminsert = ?`,
        [ht.hid, maPhim],
      );

      const cumRapChieu = [];

      for (const cum of cumRows) {
        const [lcRows] = await dbConn.promise().query(
          `SELECT lc.*
           FROM lichchieuinsert lc
           JOIN phiminsertvalichchieuinsert pvlc ON lc.maLichChieu = pvlc.lichchieuinsert
           JOIN cumrapvalichchieuinsert cvlc ON lc.maLichChieu = cvlc.lichchieuinsert
           WHERE pvlc.phiminsert = ? AND cvlc.cumrap = ?
           ORDER BY lc.ngayChieuGioChieu ASC`,
          [maPhim, cum.cid],
        );

        const lichChieuPhim = (lcRows || []).map((r2) => ({
          maLichChieu: r2.maLichChieu,
          maRap: r2.maRap,
          tenRap: r2.tenRap,
          ngayChieuGioChieu: r2.ngayChieuGioChieu,
          giaVe: r2.giaVe,
          thoiLuong: r2.thoiLuong,
        }));

        cumRapChieu.push({
          maCumRap: cum.maCumRap,
          tenCumRap: cum.tenCumRap,
          hinhAnh: null,
          lichChieuPhim,
        });
      }

      heThongRapChieu.push({
        cumRapChieu,
        maHeThongRap: ht.maHeThongRap,
        tenHeThongRap: ht.tenHeThongRap,
        logo: ht.logo,
      });
    }

    // ✅ Trả về info phim luôn đầy đủ; lịch chiếu có thể rỗng
    const final = {
      maPhim: phim.maPhim,
      tenPhim: phim.tenPhim,
      biDanh: phim.biDanh,
      trailer: phim.trailer,
      hinhAnh: absUrl(phim.hinhAnh),
      moTa: phim.moTa,
      maNhom: "GP09",
      ngayKhoiChieu: phim.ngayKhoiChieu,
      danhGia: phim.danhGia,
      nhaSanXuat: phim.nhaSanXuat,
      daoDien: phim.daoDien,
      dienVien: phim.dienVien,
      maTheLoaiPhim: phim.maTheLoaiPhim,
      dinhDang: phim.dinhDang,
      heThongRapChieu,
    };

    res.json(final);
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi khi lấy thông tin lịch chiếu phim");
  }
});
app.post("/api/QuanLyRap/AddCumRap", function (req, res) {
  dbConn.query(
    "INSERT INTO cinema.cumrap SET ? ",
    {
      maCumRap: req.body.maCumRap,
      tenCumRap: req.body.tenCumRap,
      diaChi: req.body.diaChi,
    },
    function (error, results, fields) {
      if (error) throw error;
    },
  );
  dbConn.query(
    "SELECT * FROM cinema.cumrap where  maCumRap = ?",
    [req.body.maCumRap],
    async (error, results0, fields) => {
      if (error) throw error;
      for (const result0 of results0) {
        dbConn.query(
          "INSERT INTO cinema.hethongrapvacumrap (hethongrap, cumrap) VALUES(?, ?)",
          [req.body.hid, result0.cid],
          async (error, results1, fields) => {
            if (error) throw error;
          },
        );
      }
    },
  );
  return res.send("Thêm cụm rạp thành công.");
});

app.put("/api/QuanLyRap/SuaCumRap", function (req, res) {
  dbConn.query(
    "UPDATE cinema.cumrap SET maCumRap=?, tenCumRap=?, diaChi=? WHERE maCumRap = ?",
    [req.body.maCumRap, req.body.tenCumRap, req.body.diaChi, req.body.maCumRap],
    function (error, results, fields) {
      if (error) throw error;
    },
  );
});

app.post("/api/QuanLyRap/XoaCumRap", function (req, res) {
  dbConn.query(
    "DELETE FROM cinema.cumrap WHERE maCumRap = ?",
    [req.body.maCumRap],
    function (error, results, fields) {
      if (error) throw error;
    },
  );

  dbConn.query(
    "SELECT * FROM cinema.cumrap where  maCumRap = ?",
    [req.body.maCumRap],
    async (error, results0, fields) => {
      if (error) throw error;
      for (const result0 of results0) {
        dbConn.query(
          "DELETE FROM cinema.hethongrapvacumrap where  maCumRap = ? ",
          [result0.cid],
          async (error, results1, fields) => {
            if (error) throw error;
          },
        );
      }
    },
  );
});

// QUAN LY DANH SACH RAP

app.put("/api/QuanLyRap/SuaRap", function (req, res) {
  dbConn.query(
    "UPDATE cinema.danhsachrap SET tenRap= ? WHERE maRap = ?",
    [req.body.tenRap, req.body.maRap],
    function (error, results, fields) {
      if (error) throw error;
    },
  );
});

app.post("/api/QuanLyRap/XoaRap", function (req, res) {
  dbConn.query(
    "DELETE FROM cinema.danhsachrap WHERE maRap = ?",
    [req.body.maRap],
    function (error, results, fields) {
      if (error) throw error;
    },
  );
});

app.post("/api/QuanLyRap/ThemRap", function (req, res) {
  dbConn.query(
    "SELECT * FROM cinema.cumrap where  maCumRap = ?",
    [req.body.maCumRap],
    async (error, results0, fields) => {
      if (error) throw error;
      for (const result0 of results0) {
        dbConn.query(
          "INSERT INTO cinema.danhsachrap SET ? ",
          {
            maRap: Math.floor(Math.random() * 1000000),
            tenRap: req.body.tenRap,
            maCumRap: result0.cid,
          },
          async (error, results1, fields) => {
            if (error) throw error;
          },
        );
      }
    },
  );
  return res.send("Thêm rạp thành công.");
});

// QuanLyPhim
app.get("/api/QuanLyPhim/LayDanhSachPhim", (req, res) => {
  const sql = `
    SELECT maPhim, tenPhim, hinhAnh, ngayKhoiChieu, maTheLoaiPhim
    FROM phiminsert
    ORDER BY ngayKhoiChieu DESC, maPhim DESC
  `;
  dbConn.query(sql, (err, rows) => {
    if (err) return res.status(500).send(err);

    const items = rows.map((r) => ({
      ...r,
      hinhAnh: absUrl(r.hinhAnh),
    }));
    res.send(items);
  });
});

app.get("/api/QuanLyPhim/LayThongTinPhim", async (req, res) => {
  try {
    const maPhim = req.query.MaPhim || req.query.maPhim;
    if (!maPhim) return res.status(400).json({ message: "Thiếu MaPhim" });

    const [phimRows] = await dbConn
      .promise()
      .query("SELECT * FROM phiminsert WHERE maPhim = ? LIMIT 1", [maPhim]);

    const phim = phimRows?.[0];
    if (!phim) return res.status(404).json({ message: "Không tìm thấy phim" });

    // Hook check showtime chỉ cần lichchieu là []
    return res.json({
      lichchieu: [],
      maPhim: phim.maPhim,
      tenPhim: phim.tenPhim,
      biDanh: phim.biDanh,
      trailer: phim.trailer,
      hinhAnh: absUrl(phim.hinhAnh),
      moTa: phim.moTa,
      maNhom: "GP09",
      ngayKhoiChieu: phim.ngayKhoiChieu,
      danhGia: phim.danhGia,
      nhaSanXuat: phim.nhaSanXuat,
      daoDien: phim.daoDien,
      dienVien: phim.dienVien,
      maTheLoaiPhim: phim.maTheLoaiPhim,
      dinhDang: phim.dinhDang,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Lỗi LayThongTinPhim", error: err.message });
  }
});

app.put("/api/QuanLyDatVe/ThayDoiTrangThaiDatVe", function (req, res) {
  console.log("RUN", req.body.maGhe, req.body.taiKhoanNguoiDat);
  dbConn.query(
    "update cinema.datve set isConfirm = 1 where maGhe = ? and taiKhoanNguoiDat = ?",
    [req.body.maGhe, req.body.taiKhoanNguoiDat],
    function (error, results, fields) {
      if (error) throw error;
      return res.send("Success");
    },
  );
});

app.get("/api/QuanLyDatVe/LayDanhSachVeDaMuaCuaKhachHang", function (req, res) {
  dbConn.query(
    "SELECT * FROM lichchieuinsert JOIN phiminsertvalichchieuinsert ON lichchieuinsert.maLichChieu = phiminsertvalichchieuinsert.lichchieuinsert JOIN phiminsert ON phiminsert.maPhim = phiminsertvalichchieuinsert.phiminsert JOIN cumrapvalichchieuinsert ON lichchieuinsert.maLichChieu = cumrapvalichchieuinsert.lichchieuinsert JOIN cumrap ON cumrap.cid = cumrapvalichchieuinsert.cumrap JOIN datve ON datve.maLichChieu = lichchieuinsert.maLichChieu ORDER BY ngayChieuGioChieu DESC",
    async (error, results, fields) => {
      if (error) throw error;

      var danhSachVe = [];

      for (var i = 0; i < results.length; i++) {
        danhSachVe.push({
          maLichChieu: results[i].maLichChieu,
          tenCumRap: results[i].tenCumRap,
          tenRap: results[i].tenRap,
          diaChi: results[i].diaChi,
          tenPhim: results[i].tenPhim,
          hinhAnh: results[i].hinhAnh,
          ngayChieu: results[i].ngayChieuGioChieu,
          gioChieu: results[i].ngayChieuGioChieu,
          maGhe: results[i].maGhe,
          tenGhe: results[i].tenGhe,
          tenDayDu: results[i].tenDayDu,
          loaiGhe: results[i].loaiGhe,
          giaVe: results[i].giaVe,
          tenTaiKhoan: results[i].taiKhoanNguoiDat,
          loaiGhe: results[i].giaVe > 75000 ? "Vip" : "Thường",
          isConfirm: results[i].isConfirm.readInt8() === 1,
        });
        console.log(danhSachVe);
      }
      return res.send(danhSachVe);
    },
  );
});

app.get("/api/QuanLyDatVe/LayVeTheoMaGhe", function (req, res) {
  dbConn.query(
    "SELECT * FROM lichchieuinsert JOIN phiminsertvalichchieuinsert ON lichchieuinsert.maLichChieu = phiminsertvalichchieuinsert.lichchieuinsert JOIN phiminsert ON phiminsert.maPhim = phiminsertvalichchieuinsert.phiminsert JOIN cumrapvalichchieuinsert ON lichchieuinsert.maLichChieu = cumrapvalichchieuinsert.lichchieuinsert JOIN cumrap ON cumrap.cid = cumrapvalichchieuinsert.cumrap JOIN datve ON datve.maLichChieu = lichchieuinsert.maLichChieu where datve.maGhe = ? and datve.taiKhoanNguoiDat = ?",
    [req.query.maGhe, req.query.taiKhoanNguoiDat],
    async (error, results, fields) => {
      if (error) throw error;

      var danhSachVe = [];

      for (var i = 0; i < results.length; i++) {
        danhSachVe.push({
          maLichChieu: results[i].maLichChieu,
          tenCumRap: results[i].tenCumRap,
          tenRap: results[i].tenRap,
          diaChi: results[i].diaChi,
          tenPhim: results[i].tenPhim,
          hinhAnh: results[i].hinhAnh,
          ngayChieu: results[i].ngayChieuGioChieu,
          gioChieu: results[i].ngayChieuGioChieu,
          maGhe: results[i].maGhe,
          tenGhe: results[i].tenGhe,
          tenDayDu: results[i].tenDayDu,
          loaiGhe: results[i].loaiGhe,
          giaVe: results[i].giaVe,
          tenTaiKhoan: results[i].taiKhoanNguoiDat,
          loaiGhe: results[i].giaVe > 75000 ? "Vip" : "Thường",
          isConfirm: results[i].isConfirm.readInt8() === 1,
        });
        console.log(danhSachVe);
      }
      return res.send(danhSachVe);
    },
  );
});

app.delete("/api/DeleteTicketOfUser", function (req, res) {
  console.log(req.query.maGhe, req.query.taiKhoanNguoiDat, "DELETE");
  dbConn.query(
    "DELETE FROM cinema.datve WHERE maGhe= ? AND taiKhoanNguoiDat = ?",
    [req.query.maGhe, req.query.taiKhoanNguoiDat],
    async (error, results, fields) => {
      if (error) throw error;
      return res.send("Success");
    },
  );
});

app.get("/api/QuanLyDatVe/LayDanhSachVeDaMua", function (req, res) {
  dbConn.query(
    "SELECT * FROM lichchieuinsert JOIN phiminsertvalichchieuinsert ON lichchieuinsert.maLichChieu = phiminsertvalichchieuinsert.lichchieuinsert JOIN phiminsert ON phiminsert.maPhim = phiminsertvalichchieuinsert.phiminsert JOIN cumrapvalichchieuinsert ON lichchieuinsert.maLichChieu = cumrapvalichchieuinsert.lichchieuinsert JOIN cumrap ON cumrap.cid = cumrapvalichchieuinsert.cumrap JOIN datve ON datve.maLichChieu = lichchieuinsert.maLichChieu WHERE datve.taiKhoanNguoiDat = ? ORDER BY ngayChieuGioChieu DESC",
    [req.query.taiKhoanNguoiDat],
    async (error, results, fields) => {
      if (error) throw error;

      var danhSachVe = [];
      for (var i = 0; i < results.length; i++) {
        danhSachVe.push({
          maGhe: results[i].maGhe,
          maLichChieu: results[i].maLichChieu,
          tenCumRap: results[i].tenCumRap,
          tenRap: results[i].tenRap,
          diaChi: results[i].diaChi,
          tenPhim: results[i].tenPhim,
          hinhAnh: results[i].hinhAnh,
          ngayChieu: results[i].ngayChieuGioChieu,
          gioChieu: results[i].ngayChieuGioChieu,
          tenGhe: results[i].tenGhe,
          tenDayDu: results[i].tenDayDu,
          loaiGhe: results[i].loaiGhe,
          giaVe: results[i].giaVe,
          status: results[i].isConfirm?.readInt8() === 1,
          taiKhoanNguoiDat: results[i].taiKhoanNguoiDat,
        });
        console.log("Status Ticket:", results[i].isConfirm.readInt8() === 1);
      }
      return res.send(danhSachVe);
    },
  );
});

app.get("/api/QuanLyDatVe/LayDanhSachPhongVe", function (req, res) {
  dbConn.query(
    "SELECT * FROM lichchieuinsert JOIN phiminsertvalichchieuinsert ON lichchieuinsert.maLichChieu = phiminsertvalichchieuinsert.lichchieuinsert JOIN phiminsert ON phiminsert.maPhim = phiminsertvalichchieuinsert.phiminsert JOIN cumrapvalichchieuinsert ON lichchieuinsert.maLichChieu = cumrapvalichchieuinsert.lichchieuinsert JOIN cumrap ON cumrap.cid = cumrapvalichchieuinsert.cumrap WHERE maLichChieu = ?",
    [req.query.MaLichChieu],
    async (error, results, fields) => {
      if (error) throw error;

      const maRap = String(results?.[0]?.maRap ?? "");
      const basePrice = Number(results?.[0]?.giaVe ?? 0);
      const DEFAULT_TOTAL = 160;

      // 1) Lấy cấu hình ghế theo rạp (nếu có). Nếu bảng chưa tồn tại thì fallback về logic cũ.
      const seatConfig = await new Promise((resolve) => {
        dbConn.query(
          "SELECT seatIndex, loaiGhe, isActive FROM cinema.ghe WHERE maRap = ? ORDER BY seatIndex ASC",
          [maRap],
          (err, rows) => {
            if (err) {
              // Nếu chưa tạo table cinema.ghe, cứ fallback
              return resolve({ ok: false, rows: [], err });
            }
            resolve({ ok: true, rows: rows || [] });
          },
        );
      });

      const configMap = new Map();
      if (seatConfig.ok && seatConfig.rows.length) {
        for (const r of seatConfig.rows) {
          configMap.set(Number(r.seatIndex), {
            loaiGhe: r.loaiGhe,
            isActive: Number(r.isActive) === 1,
          });
        }
      }

      // 2) Lấy danh sách ghế đã đặt của lịch chiếu
      let danhSachGhe = Array.apply(null, Array(DEFAULT_TOTAL)).map(
        function () {},
      );
      danhSachGhe = await new Promise((resolve, reject) => {
        dbConn.query(
          "SELECT * FROM datve WHERE maLichChieu = ?",
          [req.query.MaLichChieu],
          async (error, results1, fields) => {
            if (error) throw error;
            for (const result1 of results1) {
              const seatIndex = Number(result1.tenGhe);
              const cfg = configMap.get(seatIndex);
              danhSachGhe[seatIndex] = {
                maGhe: result1.maGhe,
                tenGhe: result1.tenGhe,
                maRap: maRap,
                loaiGhe: result1.loaiGhe,
                stt: result1.tenGhe,
                giaVe: result1.giaVe,
                daDat: true,
                taiKhoanNguoiDat: result1.taiKhoanNguoiDat,
                isActive: cfg ? cfg.isActive : true,
              };
            }
            resolve(danhSachGhe);
          },
        );
      });

      // 3) Fill ghế chưa đặt: dùng config nếu có, còn không thì logic cũ (Vip theo index)
      for (let i = 0; i < DEFAULT_TOTAL; i++) {
        const cfg = configMap.get(i);
        const loaiGhe = cfg?.loaiGhe || (i > 44 && i < 90 ? "Vip" : "Thuong");
        const isActive = cfg ? cfg.isActive : true;
        const giaVe = loaiGhe === "Vip" ? basePrice + 15000 : basePrice;

        if (danhSachGhe[i] === undefined) {
          danhSachGhe[i] = {
            maGhe: i,
            tenGhe: i > 9 ? String(i) : "0" + String(i),
            maRap: maRap,
            loaiGhe: loaiGhe,
            stt: i > 9 ? String(i) : "0" + String(i),
            giaVe: giaVe,
            daDat: false,
            taiKhoanNguoiDat: null,
            isActive: isActive,
          };
        } else {
          // ghế đã đặt -> đảm bảo vẫn có isActive theo config
          danhSachGhe[i].isActive = isActive;
        }
      }

      return res.send({
        thongTinPhim: {
          maLichChieu: results[0].maLichChieu,
          tenCumRap: results[0].tenCumRap,
          tenRap: results[0].tenRap,
          diaChi: results[0].diaChi,
          tenPhim: results[0].tenPhim,
          hinhAnh: results[0].hinhAnh,
          ngayChieu: results[0].ngayChieuGioChieu,
          gioChieu: results[0].ngayChieuGioChieu,
        },
        danhSachGhe: danhSachGhe,
      });
    },
  );
});

app.post("/api/QuanLyDatVe/DatVe", async (req, res) => {
  // Nếu có cấu hình ghế theo rạp (bảng cinema.ghe), chặn đặt các ghế bị khóa (isActive=0)
  try {
    const maLichChieu = req.body.maLichChieu;
    const seatIndexList = (req.body.danhSachVe || [])
      .map((v) => Number(v.maGhe))
      .filter((v) => Number.isFinite(v));

    if (maLichChieu && seatIndexList.length) {
      const [lcRows] = await dbConn
        .promise()
        .query(
          "SELECT maRap FROM lichchieuinsert WHERE maLichChieu = ? LIMIT 1",
          [maLichChieu],
        );
      const maRap = String(lcRows?.[0]?.maRap ?? "");

      // Query seat config (nếu table chưa tồn tại thì bỏ qua)
      let gheRows = [];
      try {
        const [rows] = await dbConn
          .promise()
          .query(
            `SELECT seatIndex, isActive FROM cinema.ghe WHERE maRap = ? AND seatIndex IN (${seatIndexList.map(() => "?").join(",")})`,
            [maRap, ...seatIndexList],
          );
        gheRows = rows || [];
      } catch (e) {
        gheRows = [];
      }

      if (gheRows.length) {
        const inactive = gheRows.find((r) => Number(r.isActive) !== 1);
        if (inactive) {
          return res.status(400).json({
            message: "Có ghế đang bị khóa, không thể đặt.",
            seatIndex: inactive.seatIndex,
          });
        }
      }
    }
  } catch (e) {
    // Không chặn luồng đặt vé nếu lỗi check (fallback theo logic cũ)
    console.log("[DatVe] seat active check error:", e?.message || e);
  }

  var listVe = [];
  var email = "";
  var tenPhim = "";
  var tenRap = "";
  var tenCumRap = "";
  var time = "";
  for (const ve of req.body.danhSachVe) {
    listVe.push(ve);
    await new Promise((resolve, reject) => {
      dbConn.query(
        "INSERT INTO datve SET ? ",
        {
          tenGhe: ve.maGhe,
          loaiGhe: ve.giaVe > 75000 ? "Vip" : "Thuong",
          giaVe: ve.giaVe,
          taiKhoanNguoiDat: req.body.taiKhoanNguoiDung,
          maLichChieu: req.body.maLichChieu,
          tenDayDu: ve.tenDayDu,
          isConfirm: 0,
        },
        function (error, results, fields) {
          if (error) throw error;
          resolve();
        },
      );
    });
  }

  dbConn.query(
    "SELECT * FROM nguoidungvm n WHERE n.taiKhoan = ?",
    [req.body.taiKhoanNguoiDung],
    function (error, results3, fields) {
      console.log("QUERY", results3);
      if (error) throw error;
      for (const result1 of results3) {
        email = result1.email;

        dbConn.query(
          "SELECT * FROM lichchieuinsert JOIN phiminsertvalichchieuinsert ON lichchieuinsert.maLichChieu = phiminsertvalichchieuinsert.lichchieuinsert JOIN phiminsert ON phiminsert.maPhim = phiminsertvalichchieuinsert.phiminsert JOIN cumrapvalichchieuinsert ON lichchieuinsert.maLichChieu = cumrapvalichchieuinsert.lichchieuinsert JOIN cumrap ON cumrap.cid = cumrapvalichchieuinsert.cumrap JOIN datve ON datve.maLichChieu = lichchieuinsert.maLichChieu WHERE datve.taiKhoanNguoiDat = ? AND lichchieuinsert.maLichChieu = ? LIMIT 1",
          [req.body.taiKhoanNguoiDung, req.body.maLichChieu],
          function (error, results2, fields) {
            console.log("QUERY", results2);
            if (error) throw error;
            for (const result2 of results2) {
              tenCumRap = result2.tenCumRap;
              tenRap = result2.tenRap;
              tenPhim = result2.tenPhim;
              time = result2.ngayChieuGioChieu;

              dbConn.query(
                "INSERT INTO cinema.thongke SET ? ",
                {
                  tenPhim: result2.tenPhim,
                  ngayMuaVe: new Date(),
                  amount: req.body.amount / 100,
                },
                function (error, results, fields) {
                  if (error) throw error;
                },
              );

              console.log(
                "LOG DAT VE",
                email,
                req.body.maLichChieu,
                listVe,
                tenRap,
                tenCumRap,
                tenPhim,
                time,
              );

              var transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: "khanhhn.hoang@gmail.com",
                  pass: "rmjgjdgtziwhvmai",
                },
              });

              var mailOptions = {
                from: "admin@gmail.com",
                to: email,
                subject: "Bạn đặt vé thành công",
                text:
                  "Các thông tin về vé đặt:\n" +
                  "Mã Ghế: " +
                  listVe.map((ve) => ve.tenDayDu).join(", ") +
                  "\n" +
                  "Tên Rạp: " +
                  tenRap +
                  "\n" +
                  "Tên Cụm Rạp: " +
                  tenCumRap +
                  "\n" +
                  "Tên Phim: " +
                  tenPhim +
                  "\n" +
                  "Thời gian chiếu: " +
                  time,
              };

              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  console.log(error);
                } else {
                  console.log("Email sent: " + info.response);
                }
              });
            }
          },
        );
      }
    },
  );

  return res.send("Success");
});

app.get("/api/QuanLyDatVe/LayLichChieu", async (req, res) => {
  dbConn.query(
    "select * from lichchieuinsert l where l.maLichChieu = ?",
    [req.query.MaLichChieu],
    function (error, results, fields) {
      if (error) throw error;
      return res.send(results);
    },
  );
});

app.put("/api/QuanLyDatVe/SuaLichChieu", async (req, res) => {
  dbConn.query(
    "UPDATE cinema.lichchieuinsert SET ngayChieuGioChieu= ?, giaVe= ? WHERE maLichChieu= ? ",
    [req.body.time, req.body.gia, req.query.MaLichChieu],
    function (error, results, fields) {
      if (error) throw error;
      return res.send(results);
    },
  );
});

app.post("/api/QuanLyDatVe/TaoLichChieu", async (req, res) => {
  dbConn.query(
    "INSERT INTO lichchieuinsert SET ? ",
    {
      ngayChieuGioChieu: req.body.ngayChieuGioChieu,
      maRap: req.body.maRap,
      tenRap: req.body.tenRap,
      giaVe: req.body.giaVe,
      thoiLuong: 120,
    },
    function (error, results, fields) {
      if (error) throw error;
      dbConn.query(
        "INSERT INTO phiminsertvalichchieuinsert SET ? ",
        {
          phiminsert: req.body.maPhim,
          lichchieuinsert: results.insertId,
        },
        function (error, results0, fields) {
          if (error) throw error;
        },
      );
      dbConn.query(
        "SELECT * FROM cumrap JOIN hethongrapvacumrap ON cumrap.cid = hethongrapvacumrap.cumrap WHERE tenCumRap = ?",
        [req.body.cumRap],
        function (error, results1, fields) {
          if (error) throw error;
          dbConn.query(
            "INSERT INTO cumrapvalichchieuinsert SET ? ",
            {
              cumrap: results1[0].cid,
              lichchieuinsert: results.insertId,
            },
            function (error, results2, fields) {
              if (error) throw error;
              console.log(results1[0].hethongrap);
              dbConn.query(
                "SELECT * FROM hethongrapvaphim WHERE maHeThongRap = ? AND maPhim = ?",
                [results1[0].hethongrap, req.body.maPhim],
                function (error, results3, fields) {
                  if (error) throw error;
                  if (!(results3.length > 0)) {
                    dbConn.query(
                      "INSERT INTO hethongrapvaphim SET ? ",
                      {
                        maHeThongRap: results1[0].hethongrap,
                        maPhim: req.body.maPhim,
                      },
                      function (error, results0, fields) {
                        if (error) throw error;
                      },
                    );
                  }
                },
              );
            },
          );
        },
      );
      return res.send("Success");
    },
  );
});

app.delete("/api/QuanLyLichChieu/XoaLichChieu", function (req, res) {
  dbConn.query(
    "DELETE FROM lichchieuinsert WHERE maLichChieu=?",
    [req.query.maLichChieu],
    function (error, results, fields) {
      if (error) throw error;
      return res.send(results);
    },
  );
});

// QuanLyPhim

app.post("/api/QuanLyPhim/ThemPhim", async (req, res) => {
  const imgKey = toCloudKey(req.body.hinhAnh);
  const final = await new Promise((resolve, reject) => {
    dbConn.query(
      "INSERT INTO phiminsert SET ? ",
      {
        tenPhim: req.body.tenPhim,
        biDanh: req.body.biDanh,
        trailer: req.body.trailer,
        hinhAnh: imgKey,
        moTa: req.body.moTa,
        maNhom: req.body.maNhom,
        ngayKhoiChieu: req.body.ngayKhoiChieu,
        danhGia: req.body.danhGia,
        nhaSanXuat: req.body.quocGiaSX,
        daoDien: req.body.daoDien,
        dienVien: req.body.dienVien,
        maTheLoaiPhim: req.body.maTheLoaiPhim,
        dinhDang: req.body.dinhDang,
      },
      function (error, results, fields) {
        if (error) throw error;
        resolve(res.send("Success"));
      },
    );
  });
  return final;
});

app.post("/api/QuanLyPhim/CapNhatPhim", async (req, res) => {
  const imgKey = toCloudKey(req.body.hinhAnh);
  const final = await new Promise((resolve, reject) => {
    dbConn.query(
      "UPDATE phiminsert SET ? WHERE maPhim = ?",
      [
        {
          tenPhim: req.body.tenPhim,
          biDanh: req.body.biDanh,
          trailer: req.body.trailer,
          hinhAnh: imgKey,
          moTa: req.body.moTa,
          maNhom: req.body.maNhom,
          ngayKhoiChieu: req.body.ngayKhoiChieu,
          danhGia: req.body.danhGia,
          nhaSanXuat: req.body.quocGiaSX,
          daoDien: req.body.daoDien,
          dienVien: req.body.dienVien,
          maTheLoaiPhim: req.body.maTheLoaiPhim,
          dinhDang: req.body.dinhDang,
        },
        req.body.maPhim,
      ],
      function (error, results, fields) {
        if (error) throw error;
        resolve(res.send("Success"));
      },
    );
  });
  return final;
});

app.delete(
  "/api/QuanLyPhim/XoaPhim",
  requireAuth,
  requireAdmin,
  function (req, res) {
    const maPhim = req.query.MaPhim || req.query.maPhim;
    if (!maPhim) return res.status(400).send("Thiếu MaPhim");

    // ✅ Chặn xóa nếu phim đã có lịch chiếu
    dbConn.query(
      "SELECT COUNT(*) AS cnt FROM phiminsertvalichchieuinsert WHERE phiminsert=?",
      [maPhim],
      function (err, rows) {
        if (err) {
          return res
            .status(500)
            .send("Lỗi kiểm tra lịch chiếu: " + err.message);
        }

        const cnt = rows?.[0]?.cnt ?? 0;
        if (cnt > 0) {
          return res.status(400).send("Phim đã có lịch chiếu, không thể xóa");
        }

        dbConn.query(
          "DELETE FROM phiminsert WHERE maPhim=?",
          [maPhim],
          function (error) {
            if (error) {
              return res
                .status(500)
                .send("Lỗi khi xóa phim: " + (error.message || String(error)));
            }
            return res.send("Xóa phim thành công");
          },
        );
      },
    );
  },
);

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

function slugify(str = "") {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

app.get("/api/QuanLyTinTuc/LayTinTucTrangChu", (req, res) => {
  const featuredPromoSql = `
    SELECT id,title,slug,thumbnailUrl,coverUrl,category,isFeatured,publishedAt
    FROM tintuc
    WHERE status='PUBLISHED' AND category='PROMO'
    ORDER BY isFeatured DESC, pinOrder DESC, publishedAt DESC
    LIMIT 3
  `;

  const promoCarouselSql = `
    SELECT id,title,slug,thumbnailUrl,coverUrl,category,publishedAt
    FROM tintuc
    WHERE status='PUBLISHED' AND category='PROMO'
    ORDER BY publishedAt DESC
    LIMIT 20
  `;

  const sidelineFeaturedSql = `
    SELECT id,title,slug,thumbnailUrl,coverUrl,category,publishedAt
    FROM tintuc
    WHERE status='PUBLISHED' AND category='SIDELINE'
    ORDER BY isFeatured DESC, pinOrder DESC, publishedAt DESC
    LIMIT 1
  `;

  const sidelineRightTopSql = `
    SELECT id,title,slug,thumbnailUrl,coverUrl,category,publishedAt
    FROM tintuc
    WHERE status='PUBLISHED' AND category='SIDELINE'
    ORDER BY publishedAt DESC
    LIMIT 2
  `;

  const sidelineCarouselSql = `
    SELECT id,title,slug,thumbnailUrl,coverUrl,category,publishedAt
    FROM tintuc
    WHERE status='PUBLISHED' AND category='SIDELINE'
    ORDER BY publishedAt DESC
    LIMIT 20
  `;

  db.query(featuredPromoSql, (e1, featured) => {
    if (e1) return res.status(500).json({ message: "DB error", error: e1 });

    db.query(promoCarouselSql, (e2, promoCarousel) => {
      if (e2) return res.status(500).json({ message: "DB error", error: e2 });

      db.query(sidelineFeaturedSql, (e3, sidelineFeatured) => {
        if (e3) return res.status(500).json({ message: "DB error", error: e3 });

        db.query(sidelineRightTopSql, (e4, sidelineRightTop) => {
          if (e4)
            return res.status(500).json({ message: "DB error", error: e4 });

          db.query(sidelineCarouselSql, (e5, sidelineCarousel) => {
            if (e5)
              return res.status(500).json({ message: "DB error", error: e5 });

            res.json({
              featuredPromos: featured,
              promoCarousel,
              sideline: {
                featured: sidelineFeatured?.[0] || null,
                rightTop: sidelineRightTop,
                carousel: sidelineCarousel,
              },
            });
          });
        });
      });
    });
  });
});

app.get("/api/QuanLyTinTuc/LayDanhSachTinTuc", (req, res) => {
  const category = req.query.category || "PROMO";
  const q = (req.query.q || "").trim();
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const pageSize = Math.min(
    Math.max(parseInt(req.query.pageSize || "10", 10), 1),
    50,
  );
  const offset = (page - 1) * pageSize;

  const where = [];
  const params = [];

  where.push("status='PUBLISHED'");
  where.push("category=?");
  params.push(category);

  if (q) {
    where.push("(title LIKE ? OR excerpt LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const sql = `
    SELECT id,title,slug,excerpt,thumbnailUrl,coverUrl,category,publishedAt,viewCount
    FROM tintuc
    ${whereSql}
    ORDER BY publishedAt DESC
    LIMIT ? OFFSET ?
  `;

  const countSql = `SELECT COUNT(*) as total FROM tintuc ${whereSql}`;

  db.query(countSql, params, (e1, countRows) => {
    if (e1) return res.status(500).json({ message: "DB error", error: e1 });

    db.query(sql, [...params, pageSize, offset], (e2, rows) => {
      if (e2) return res.status(500).json({ message: "DB error", error: e2 });

      res.json({
        page,
        pageSize,
        total: countRows?.[0]?.total || 0,
        items: rows,
      });
    });
  });
});

// ===== Helpers for TinTuc =====
const ALLOWED_CATEGORIES = new Set(["PROMO", "SIDELINE", "EVENT", "RECRUIT"]);
const ALLOWED_STATUS = new Set(["DRAFT", "PUBLISHED", "HIDDEN"]);

function slugifyVN(text = "") {
  return (
    text
      .toString()
      .trim()
      .toLowerCase()
      // remove Vietnamese accents
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      // replace non-alphanumeric with -
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  );
}

// ===== API #1: ThemTinTuc =====
app.post("/api/QuanLyTinTuc/ThemTinTuc", (req, res) => {
  try {
    const {
      title,
      excerpt = "",
      content = "",
      thumbnailUrl = null,
      coverUrl = null,
      category = "PROMO",
      status = "DRAFT",
      isFeatured = 0,
      pinOrder = null,
    } = req.body || {};

    // Validate
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).send({ message: "title là bắt buộc" });
    }
    if (!ALLOWED_CATEGORIES.has(category)) {
      return res.status(400).send({ message: "category không hợp lệ" });
    }
    if (!ALLOWED_STATUS.has(status)) {
      return res.status(400).send({ message: "status không hợp lệ" });
    }

    const now = new Date();
    const publishedAt = status === "PUBLISHED" ? now : null;

    // Generate slug
    let slug = slugifyVN(title);
    if (!slug) slug = `tin-${Date.now()}`;

    // Ensure unique slug (nếu trùng thì thêm hậu tố)
    const checkSql = "SELECT id FROM tintuc WHERE slug = ? LIMIT 1";
    db.query(checkSql, [slug], (checkErr, checkRows) => {
      if (checkErr) return res.status(500).send(checkErr);

      if (checkRows && checkRows.length > 0) {
        slug = `${slug}-${Date.now().toString(36)}`; // suffix ngắn để tránh trùng
      }

      const insertSql = `
        INSERT INTO tintuc
          (title, slug, excerpt, content, thumbnailUrl, coverUrl, category, status,
           isFeatured, pinOrder, viewCount, publishedAt, createdAt, updatedAt)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        title.trim(),
        slug,
        excerpt,
        content,
        thumbnailUrl,
        coverUrl,
        category,
        status,
        Number(isFeatured) ? 1 : 0,
        pinOrder === null || pinOrder === undefined || pinOrder === ""
          ? null
          : Number(pinOrder),
        0, // viewCount default
        publishedAt, // publishedAt
        now, // createdAt
        now, // updatedAt
      ];

      db.query(insertSql, params, (insErr, insResult) => {
        if (insErr) return res.status(500).send(insErr);

        return res.send({
          message: "Tạo tin tức thành công",
          id: insResult.insertId,
          slug,
          status,
          category,
        });
      });
    });
  } catch (e) {
    return res.status(500).send({ message: "Server error", error: String(e) });
  }
});

// Quản lý ghế (Seat Layout)
// Trả về seats: [{ seatIndex, loaiGhe, isActive }]
app.get("/api/QuanLyGhe/LayDanhSachGhe", async (req, res) => {
  const maRap = String(req.query.maRap || "").trim();
  if (!maRap) return res.status(400).json({ message: "Thiếu maRap" });

  try {
    const [rows] = await dbConn
      .promise()
      .query(
        "SELECT seatIndex, loaiGhe, isActive FROM cinema.ghe WHERE maRap = ? ORDER BY seatIndex ASC",
        [maRap],
      );
    return res.json({ maRap, cols: 16, rows: 10, seats: rows || [] });
  } catch (e) {
    // Nếu chưa tạo table cinema.ghe
    if (String(e?.code || "").includes("ER_NO_SUCH_TABLE")) {
      return res.json({ maRap, cols: 16, rows: 10, seats: [] });
    }
    return res
      .status(500)
      .json({ message: "DB error", error: String(e?.message || e) });
  }
});

// Admin tạo sơ đồ ghế mặc định cho 1 rạp
// body: { maRap, rows?:10, cols?:16, vipFrom?:45, vipTo?:89 }
app.post(
  "/api/QuanLyGhe/Admin/TaoSoDoGheMacDinh",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const maRap = String(req.body.maRap || "").trim();
    if (!maRap) return res.status(400).json({ message: "Thiếu maRap" });

    const rows = Math.min(Math.max(parseInt(req.body.rows ?? 10, 10), 1), 30);
    const cols = Math.min(Math.max(parseInt(req.body.cols ?? 16, 10), 1), 30);
    const total = rows * cols;
    const vipFrom = Number.isFinite(Number(req.body.vipFrom))
      ? Number(req.body.vipFrom)
      : 45;
    const vipTo = Number.isFinite(Number(req.body.vipTo))
      ? Number(req.body.vipTo)
      : 89;

    try {
      // Xóa cũ
      await dbConn
        .promise()
        .query("DELETE FROM cinema.ghe WHERE maRap = ?", [maRap]);

      const values = [];
      for (let i = 0; i < total; i++) {
        const loaiGhe = i >= vipFrom && i <= vipTo ? "Vip" : "Thuong";
        values.push([maRap, i, loaiGhe, 1]);
      }

      await dbConn
        .promise()
        .query(
          "INSERT INTO cinema.ghe (maRap, seatIndex, loaiGhe, isActive) VALUES ?",
          [values],
        );
      return res.json({
        message: "Tạo sơ đồ ghế mặc định thành công",
        maRap,
        rows,
        cols,
        total,
      });
    } catch (e) {
      return res
        .status(500)
        .json({ message: "DB error", error: String(e?.message || e) });
    }
  },
);

// Admin cập nhật sơ đồ ghế
// body: { maRap, seats: [{ seatIndex, loaiGhe, isActive }] }
app.put(
  "/api/QuanLyGhe/Admin/CapNhatSoDoGhe",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const maRap = String(req.body.maRap || "").trim();
    const seats = Array.isArray(req.body.seats) ? req.body.seats : [];
    if (!maRap) return res.status(400).json({ message: "Thiếu maRap" });
    if (!seats.length) return res.status(400).json({ message: "Thiếu seats" });

    try {
      const values = seats
        .map((s) => {
          const seatIndex = Number(s.seatIndex);
          const loaiGhe =
            String(s.loaiGhe || "Thuong") === "Vip" ? "Vip" : "Thuong";
          const isActive = Number(s.isActive) === 0 ? 0 : 1;
          return [maRap, seatIndex, loaiGhe, isActive];
        })
        .filter((v) => Number.isFinite(v[1]));

      if (!values.length)
        return res.status(400).json({ message: "Dữ liệu seats không hợp lệ" });

      await dbConn.promise().query(
        `INSERT INTO cinema.ghe (maRap, seatIndex, loaiGhe, isActive)
       VALUES ?
       ON DUPLICATE KEY UPDATE
         loaiGhe = VALUES(loaiGhe),
         isActive = VALUES(isActive)`,
        [values],
      );

      return res.json({
        message: "Cập nhật sơ đồ ghế thành công",
        maRap,
        updated: values.length,
      });
    } catch (e) {
      return res
        .status(500)
        .json({ message: "DB error", error: String(e?.message || e) });
    }
  },
);

function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Thiếu token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Token không hợp lệ",
      error: String(err?.message || err),
    });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.maLoaiNguoiDung !== "QuanTri") {
    return res.status(403).json({ message: "Không có quyền admin" });
  }
  next();
}

app.get(
  "/api/QuanLyTinTuc/Admin/LayDanhSachTinTuc",
  requireAuth,
  requireAdmin,
  (req, res) => {
    const status = (req.query.status || "ALL").trim(); // ALL | DRAFT | PUBLISHED | HIDDEN
    const category = (req.query.category || "ALL").trim(); // ALL | PROMO | SIDELINE | EVENT | RECRUIT
    const q = (req.query.q || "").trim();
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt(req.query.pageSize || "10", 10), 1),
      50,
    );
    const offset = (page - 1) * pageSize;

    const where = [];
    const params = [];

    if (status !== "ALL") {
      where.push("status=?");
      params.push(status);
    }
    if (category !== "ALL") {
      where.push("category=?");
      params.push(category);
    }
    if (q) {
      where.push("(title LIKE ? OR excerpt LIKE ? OR slug LIKE ?)");
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const countSql = `SELECT COUNT(*) as total FROM tintuc ${whereSql}`;
    const sql = `
    SELECT id,title,slug,excerpt,thumbnailUrl,coverUrl,category,status,isFeatured,pinOrder,viewCount,
           publishedAt,createdAt,updatedAt
    FROM tintuc
    ${whereSql}
    ORDER BY updatedAt DESC
    LIMIT ? OFFSET ?
  `;

    db.query(countSql, params, (e1, c) => {
      if (e1) return res.status(500).json({ message: "DB error", error: e1 });
      db.query(sql, [...params, pageSize, offset], (e2, rows) => {
        if (e2) return res.status(500).json({ message: "DB error", error: e2 });
        res.json({ page, pageSize, total: c?.[0]?.total || 0, items: rows });
      });
    });
  },
);

app.get("/api/QuanLyTinTuc/LayChiTietTinTuc", (req, res) => {
  const id = req.query.id ? Number(req.query.id) : null;
  const slug = (req.query.slug || "").trim();
  const preview = req.query.preview;

  if (!id && !slug)
    return res.status(400).json({ message: "Thiếu id hoặc slug" });

  const isPreview = String(preview) === "1";

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  const runQuery = (allowAllStatus) => {
    const whereStatus = allowAllStatus ? "" : " AND status='PUBLISHED'";
    const whereKey = id ? "id=?" : "slug=?";
    const whereVal = id ? id : slug;

    db.query(
      `SELECT * FROM tintuc WHERE ${whereKey} ${whereStatus} LIMIT 1`,
      [whereVal],
      (err, rows) => {
        if (err)
          return res.status(500).json({ message: "DB error", error: err });
        if (!rows || rows.length === 0)
          return res.status(404).json({ message: "Không tìm thấy bài viết" });

        const item = rows[0];

        const finish = () => {
          db.query(
            `SELECT id,title,slug,thumbnailUrl,coverUrl,publishedAt
             FROM tintuc
             WHERE status='PUBLISHED' AND category=? AND id<>?
             ORDER BY publishedAt DESC
             LIMIT 6`,
            [item.category, item.id],
            (e2, relatedRows) => {
              if (e2) return res.json({ item, related: [] });
              return res.json({ item, related: relatedRows || [] });
            },
          );
        };

        // Public mới tăng viewCount
        if (!allowAllStatus) {
          db.query(
            "UPDATE tintuc SET viewCount=viewCount+1 WHERE id=?",
            [item.id],
            () => finish(),
          );
        } else {
          finish();
        }
      },
    );
  };

  // Không preview => public
  if (!isPreview) return runQuery(false);

  // preview=1 => chỉ admin
  if (!token) return res.status(401).json({ message: "Thiếu token preview" });

  try {
    // QUAN TRỌNG: đồng bộ secret với requireAuth
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (decoded?.maLoaiNguoiDung !== "QuanTri") {
      return res.status(403).json({ message: "Không có quyền preview" });
    }
    return runQuery(true);
  } catch (e) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
});

// ======================
// ADMIN: Xóa tin tức
// DELETE /api/QuanLyTinTuc/Admin/XoaTinTuc?slug=abc
// hoặc DELETE /api/QuanLyTinTuc/Admin/XoaTinTuc?id=123
// ======================
app.delete(
  "/api/QuanLyTinTuc/Admin/XoaTinTuc",
  requireAuth,
  requireAdmin,
  (req, res) => {
    try {
      const slug = (req.query.slug || "").trim();
      const id = req.query.id ? Number(req.query.id) : null;

      if (!slug && !id) {
        return res.status(400).json({ message: "Thiếu slug hoặc id" });
      }

      const whereSql = id ? "id=?" : "slug=?";
      const whereVal = id ? id : slug;

      // check tồn tại
      db.query(
        `SELECT id, slug FROM tintuc WHERE ${whereSql} LIMIT 1`,
        [whereVal],
        (e1, rows) => {
          if (e1)
            return res.status(500).json({ message: "DB error", error: e1 });
          if (!rows || rows.length === 0)
            return res.status(404).json({ message: "Không tìm thấy bài viết" });

          const found = rows[0];

          // xóa
          db.query(`DELETE FROM tintuc WHERE ${whereSql}`, [whereVal], (e2) => {
            if (e2)
              return res.status(500).json({ message: "DB error", error: e2 });

            return res.json({
              message: "Xóa tin tức thành công",
              deleted: { id: found.id, slug: found.slug },
            });
          });
        },
      );
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Server error", error: String(err?.message || err) });
    }
  },
);

// (OPTIONAL) Nếu bạn muốn Postman dễ test (một số nơi không cho DELETE), thêm luôn POST alias:
app.post(
  "/api/QuanLyTinTuc/Admin/XoaTinTuc",
  requireAuth,
  requireAdmin,
  (req, res) => {
    // cho phép gửi slug/id qua body hoặc query
    req.query.slug = req.query.slug || req.body?.slug;
    req.query.id = req.query.id || req.body?.id;
    return app._router.handle(req, res, () => {}, "delete");
  },
);

function normalizeNullable(v) {
  if (v === undefined) return undefined;
  if (v === null) return null;
  const s = String(v).trim();
  return s === "" ? null : v;
}

function updateTinTucHandler(req, res) {
  try {
    const id = req.query.id ? Number(req.query.id) : null;
    const slug = (req.query.slug || "").trim();

    if (!id && !slug)
      return res.status(400).json({ message: "Thiếu id hoặc slug" });

    const whereKey = id ? "id=?" : "slug=?";
    const whereVal = id ? id : slug;

    db.query(
      `SELECT * FROM tintuc WHERE ${whereKey} LIMIT 1`,
      [whereVal],
      (e1, rows) => {
        if (e1) return res.status(500).json({ message: "DB error", error: e1 });
        if (!rows || rows.length === 0)
          return res.status(404).json({ message: "Không tìm thấy bài viết" });

        const old = rows[0];
        const body = req.body || {};

        // giữ nguyên nếu không truyền lên
        const nextTitle =
          body.title !== undefined ? String(body.title).trim() : old.title;
        const nextExcerpt =
          body.excerpt !== undefined ? String(body.excerpt) : old.excerpt;
        const nextContent =
          body.content !== undefined ? String(body.content) : old.content;

        const nextThumbnailUrl =
          body.thumbnailUrl !== undefined
            ? normalizeNullable(body.thumbnailUrl)
            : old.thumbnailUrl;

        const nextCoverUrl =
          body.coverUrl !== undefined
            ? normalizeNullable(body.coverUrl)
            : old.coverUrl;

        const nextCategory =
          body.category !== undefined
            ? String(body.category).trim()
            : old.category;
        const nextStatus =
          body.status !== undefined ? String(body.status).trim() : old.status;

        const nextIsFeatured =
          body.isFeatured !== undefined
            ? Number(body.isFeatured)
              ? 1
              : 0
            : old.isFeatured;

        const nextPinOrder =
          body.pinOrder !== undefined
            ? body.pinOrder === null || body.pinOrder === ""
              ? null
              : Number(body.pinOrder)
            : old.pinOrder;

        if (!nextTitle)
          return res.status(400).json({ message: "title là bắt buộc" });
        if (!ALLOWED_CATEGORIES.has(nextCategory))
          return res.status(400).json({ message: "category không hợp lệ" });
        if (!ALLOWED_STATUS.has(nextStatus))
          return res.status(400).json({ message: "status không hợp lệ" });

        // slug: mặc định KHÔNG đổi (để khỏi gãy link). Chỉ đổi khi bạn truyền body.slug
        let nextSlug = old.slug;
        if (body.slug !== undefined) {
          nextSlug = slugifyVN(String(body.slug));
          if (!nextSlug) nextSlug = `tin-${Date.now()}`;
        }

        const now = new Date();

        // publishedAt logic
        let nextPublishedAt = old.publishedAt;
        if (nextStatus === "PUBLISHED") {
          if (!nextPublishedAt) nextPublishedAt = now;
        } else {
          nextPublishedAt = null;
        }

        const doUpdate = () => {
          const updateSql = `
          UPDATE tintuc
          SET title=?,
              slug=?,
              excerpt=?,
              content=?,
              thumbnailUrl=?,
              coverUrl=?,
              category=?,
              status=?,
              isFeatured=?,
              pinOrder=?,
              publishedAt=?,
              updatedAt=?
          WHERE id=?
        `;

          const params = [
            nextTitle,
            nextSlug,
            nextExcerpt,
            nextContent,
            nextThumbnailUrl,
            nextCoverUrl,
            nextCategory,
            nextStatus,
            nextIsFeatured,
            nextPinOrder,
            nextPublishedAt,
            now,
            old.id,
          ];

          db.query(updateSql, params, (e3) => {
            if (e3)
              return res.status(500).json({ message: "DB error", error: e3 });

            return res.json({
              message: "Cập nhật tin tức thành công",
              item: {
                id: old.id,
                slug: nextSlug,
                title: nextTitle,
                category: nextCategory,
                status: nextStatus,
                isFeatured: nextIsFeatured,
                pinOrder: nextPinOrder,
                thumbnailUrl: nextThumbnailUrl,
                coverUrl: nextCoverUrl,
                publishedAt: nextPublishedAt,
                updatedAt: now,
              },
            });
          });
        };

        // Nếu đổi slug thì check trùng
        if (nextSlug !== old.slug) {
          db.query(
            "SELECT id FROM tintuc WHERE slug=? AND id<>? LIMIT 1",
            [nextSlug, old.id],
            (e2, exist) => {
              if (e2)
                return res.status(500).json({ message: "DB error", error: e2 });
              if (exist && exist.length > 0) {
                nextSlug = `${nextSlug}-${Date.now().toString(36)}`;
              }
              doUpdate();
            },
          );
        } else {
          doUpdate();
        }
      },
    );
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: String(err?.message || err) });
  }
}

app.put(
  "/api/QuanLyTinTuc/Admin/CapNhatTinTuc",
  requireAuth,
  requireAdmin,
  (req, res) => {
    const { id, slug } = req.query;
    if (!id && !slug)
      return res.status(400).json({ message: "Thiếu id hoặc slug" });

    const findSql = id
      ? "SELECT * FROM tintuc WHERE id=? LIMIT 1"
      : "SELECT * FROM tintuc WHERE slug=? LIMIT 1";
    const findParams = [id ? Number(id) : slug];

    db.query(findSql, findParams, (e0, rows) => {
      if (e0) return res.status(500).json({ message: "DB error", error: e0 });
      if (!rows || rows.length === 0)
        return res.status(404).json({ message: "Không tìm thấy bài viết" });

      const current = rows[0];

      const {
        title,
        excerpt,
        content,
        thumbnailUrl,
        coverUrl,
        category,
        status,
        isFeatured,
        pinOrder,
      } = req.body || {};

      // lấy giá trị mới (nếu không gửi thì giữ nguyên)
      const nextTitle = (title ?? current.title)?.toString();
      const nextExcerpt = excerpt ?? current.excerpt;
      const nextContent = content ?? current.content;
      const nextThumb = thumbnailUrl ?? current.thumbnailUrl;
      const nextCover = coverUrl ?? current.coverUrl;
      const nextCategory = (category ?? current.category)?.toString();
      const nextStatus = (status ?? current.status)?.toString();

      if (!nextTitle || !nextTitle.trim()) {
        return res.status(400).json({ message: "title là bắt buộc" });
      }
      if (!ALLOWED_CATEGORIES.has(nextCategory)) {
        return res.status(400).json({ message: "category không hợp lệ" });
      }
      if (!ALLOWED_STATUS.has(nextStatus)) {
        return res.status(400).json({ message: "status không hợp lệ" });
      }

      const now = new Date();

      // publishedAt: nếu chuyển sang PUBLISHED mà trước đó null thì set now
      // nếu không phải PUBLISHED thì set null
      let nextPublishedAt = current.publishedAt;
      if (nextStatus === "PUBLISHED") {
        if (!current.publishedAt) nextPublishedAt = now;
      } else {
        nextPublishedAt = null;
      }

      const nextIsFeatured =
        isFeatured === undefined || isFeatured === null
          ? current.isFeatured
          : Number(isFeatured)
            ? 1
            : 0;

      const nextPinOrder =
        pinOrder === undefined || pinOrder === null || pinOrder === ""
          ? current.pinOrder
          : Number(pinOrder);

      const updateSql = `
      UPDATE tintuc
      SET title=?, excerpt=?, content=?, thumbnailUrl=?, coverUrl=?,
          category=?, status=?, isFeatured=?, pinOrder=?, publishedAt=?, updatedAt=?
      WHERE id=?
    `;

      db.query(
        updateSql,
        [
          nextTitle.trim(),
          nextExcerpt,
          nextContent,
          nextThumb,
          nextCover,
          nextCategory,
          nextStatus,
          nextIsFeatured,
          nextPinOrder,
          nextPublishedAt,
          now,
          current.id,
        ],
        (e1) => {
          if (e1)
            return res.status(500).json({ message: "DB error", error: e1 });
          return res.json({
            message: "Cập nhật tin tức thành công",
            id: current.id,
            slug: current.slug,
          });
        },
      );
    });
  },
);

app.get(
  "/api/QuanLyTinTuc/Admin/LayChiTietTinTuc",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { id, slug } = req.query;
      if (!id && !slug)
        return res.status(400).json({ message: "Thiếu id hoặc slug" });

      const where = id ? "id = ?" : "slug = ?";
      const value = id ? id : slug;

      const [rows] = await db
        .promise()
        .query(`SELECT * FROM tintuc WHERE ${where} LIMIT 1`, [value]);
      if (!rows || rows.length === 0)
        return res.status(404).json({ message: "Không tìm thấy bài viết" });

      return res.json({ data: rows[0] });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Lỗi máy chủ" });
    }
  },
);

app.listen(PORT, () =>
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`),
);
