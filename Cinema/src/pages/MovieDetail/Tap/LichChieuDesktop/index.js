import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import useStyles from "./style";
import RightSection from "./RightSection";
import { BASE_URL } from "../../../../constants/config";

export default function LichChieuDesktop({ maPhim }) {
  const classes = useStyles();
  const [heThongRapChieu, setHeThongRapChieu] = useState([]);
  const [selectedHeThong, setSelectedHeThong] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!maPhim) return;

    // tránh gọi 2 lần ở React strict mode (dev)
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const url = `${BASE_URL}/QuanLyRap/LayThongTinLichChieuPhim?MaPhim=${maPhim}`;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(url);

        const list = res?.data?.heThongRapChieu ?? [];

        // ✅ LỌC: chỉ giữ các hệ thống rạp có ít nhất 1 suất chiếu
        const listWithShowtimes = list.filter((ht) =>
          (ht?.cumRapChieu || []).some(
            (cum) => (cum?.lichChieuPhim || []).length > 0
          )
        );

        setHeThongRapChieu(listWithShowtimes);
        setSelectedHeThong(listWithShowtimes.length ? listWithShowtimes[0] : null);
      } catch (err) {
        console.error("Lỗi khi load lịch chiếu:", err);
        setHeThongRapChieu([]);
        setSelectedHeThong(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [maPhim]);

  return (
    <div className={classes.container}>
      {/* CỘT TRÁI */}
      <div className={classes.leftPanel}>
        {loading ? (
          <div className={classes.emptyNote}>Đang tải lịch chiếu...</div>
        ) : heThongRapChieu.length === 0 ? (
          <div className={classes.emptyNote}>Hiện chưa có lịch chiếu.</div>
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

      {/* CỘT PHẢI */}
      <div className={classes.rightPanel}>
        {loading ? (
          <div className={classes.emptyRight}>Đang tải dữ liệu...</div>
        ) : selectedHeThong ? (
          <RightSection heThongRap={selectedHeThong} />
        ) : (
          <div className={classes.emptyRight}>Hiện chưa có lịch chiếu cho phim này.</div>
        )}
      </div>
    </div>
  );
}