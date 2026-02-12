import React, { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import useStyles from "./style";

export default function RightSection({ heThongRap }) {
  const classes = useStyles();
  const history = useHistory();

  // Luôn có mảng (kể cả khi heThongRap undefined)
  const cumRapList = useMemo(() => {
    return heThongRap?.cumRapChieu || [];
  }, [heThongRap]);

  // Có suất chiếu hay không (vẫn gọi hook bình thường)
  const hasAnyShowtime = useMemo(() => {
    return cumRapList.some((cum) => (cum?.lichChieuPhim || []).length > 0);
  }, [cumRapList]);

  // Gom danh sách ngày từ lịch chiếu (vẫn gọi hook bình thường)
  const allDates = useMemo(() => {
    const set = new Set();
    cumRapList.forEach((cum) => {
      (cum?.lichChieuPhim || []).forEach((lich) => {
        const day = lich?.ngayChieuGioChieu?.slice(0, 10);
        if (day) set.add(day);
      });
    });
    return Array.from(set).sort();
  }, [cumRapList]);

  // Hook state luôn phải đặt trước mọi return
  const [selectedDate, setSelectedDate] = useState(null);

  // Đồng bộ selectedDate khi allDates thay đổi
  useEffect(() => {
    if (!allDates.length) {
      setSelectedDate(null);
      return;
    }
    setSelectedDate((prev) => (prev && allDates.includes(prev) ? prev : allDates[0]));
  }, [allDates]);

  const handlePickShowtime = (maLichChieu) => {
    if (!maLichChieu) return;
    history.push(`/datve/${maLichChieu}`);
  };

  // ✅ Không return sớm trước hook nữa
  const isEmpty = !cumRapList.length || !hasAnyShowtime;

  return (
    <div className={classes.wrapperContainer}>
      {isEmpty ? (
        <div className={classes.emptyRight}>Hiện chưa có lịch chiếu cho phim này.</div>
      ) : (
        <>
          {/* Dãy ngày */}
          {allDates.length > 0 && (
            <div className={classes.listDay}>
              {allDates.map((day) => (
                <div
                  key={day}
                  className={`${classes.dayItem} ${
                    selectedDate === day ? classes.activeDay : ""
                  }`}
                  onClick={() => setSelectedDate(day)}
                  title="Chọn ngày"
                >
                  {day}
                </div>
              ))}
            </div>
          )}

          {/* Cụm rạp + giờ chiếu */}
          {cumRapList.map((cum, index) => {
            const lichTrongNgay = (cum?.lichChieuPhim || []).filter((lich) => {
              if (!selectedDate) return true;
              return lich?.ngayChieuGioChieu?.slice(0, 10) === selectedDate;
            });

            // Nếu cụm rạp không có giờ trong ngày đang chọn -> ẩn cụm rạp đó
            if (!lichTrongNgay.length) return null;

            return (
              <div key={index} className={classes.cumRapBox}>
                <h4 style={{ color: "#fff", marginBottom: 10 }}>{cum.tenCumRap}</h4>

                <div className={classes.gioChieuWrap}>
                  {lichTrongNgay.map((lich, i) => {
                    const time = lich?.ngayChieuGioChieu?.slice(11, 16) || "--:--";
                    return (
                      <button
                        key={i}
                        type="button"
                        className={classes.gioChieuItem}
                        onClick={() => handlePickShowtime(lich.maLichChieu)}
                        title="Chọn suất chiếu"
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}