import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import useStyles from "./style";
import RightSection from "./RightSection";
import { BASE_URL } from "../../../../constants/config";

export default function LichChieuDesktop({ maPhim }) {
  const classes = useStyles();
  const [heThongRapChieu, setHeThongRapChieu] = useState([]);
  const [selectedHeThong, setSelectedHeThong] = useState(null);

  const fetchedRef = useRef(false);

  useEffect(() => {
    console.log("👀 LichChieuDesktop render với maPhim:", maPhim);
    if (!maPhim) {
      console.warn("⚠️ maPhim chưa sẵn sàng, bỏ qua API call.");
      return;
    }
    if (fetchedRef.current) return;      // tránh gọi lại (dev)
    fetchedRef.current = true;

    const url = `${BASE_URL}/QuanLyRap/LayThongTinLichChieuPhim?MaPhim=${maPhim}`;
    console.log("🔗 URL gọi API:", url);

    const fetchData = async () => {
      try {
        const res = await axios.get(url);
        console.log("🎬 Dữ liệu lịch chiếu:", res.data);

        const list = res?.data?.heThongRapChieu ?? [];
        setHeThongRapChieu(list);
        setSelectedHeThong(list.length ? list[0] : null);
      } catch (err) {
        console.error("❌ Lỗi khi load lịch chiếu:", err);
      }
    };

    fetchData();
  }, [maPhim]);

  return (
    <div className={classes.container}>
      {/* CỘT TRÁI: logo hệ thống rạp */}
      <div className={classes.leftPanel}>
        {heThongRapChieu.length === 0 ? (
          <div className={classes.emptyNote}>Không có lịch chiếu.</div>
        ) : (
          heThongRapChieu.map((item) => (
            <div
              key={item.maHeThongRap}
              className={`${classes.tabItem} ${
                selectedHeThong?.maHeThongRap === item.maHeThongRap
                  ? classes.tabSelected
                  : ""
              }`}
              onClick={() => setSelectedHeThong(item)}
            >
              <div className={classes.tabWrapper}>
                <img
                  src={item.logo}
                  alt={item.tenHeThongRap}
                  className={classes.logo}
                />
              </div>
              <div className={classes.theaterName}>
                {item.tenHeThongRap?.toUpperCase?.() || item.tenHeThongRap}
              </div>
            </div>
          ))
        )}
      </div>

      {/* CỘT PHẢI: chi tiết lịch chiếu */}
      <div className={classes.rightPanel}>
        {selectedHeThong ? (
          <RightSection heThongRap={selectedHeThong} maPhim={maPhim} />
        ) : (
          <div className={classes.emptyRight}>Chưa có cụm rạp để hiển thị.</div>
        )}
      </div>
    </div>
  );
}
