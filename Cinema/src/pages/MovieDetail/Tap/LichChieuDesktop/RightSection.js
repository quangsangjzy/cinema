import React, { useState } from "react";
import useStyles from "./style";

export default function RightSection({ heThongRap, maPhim }) {
  const classes = useStyles();
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <div className={classes.wrapperContainer}>
      {/* Danh sách ngày chiếu */}
      <div className={classes.listDay}>
        {heThongRap.cumRapChieu?.[0]?.lichChieuPhim.map((lich, index) => {
          const day = lich.ngayChieuGioChieu.slice(0, 10);
          return (
            <div
              key={index}
              className={`${classes.dayItem} ${
                selectedDate === day ? classes.activeDay : ""
              }`}
              onClick={() => setSelectedDate(day)}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Danh sách cụm rạp */}
      {heThongRap.cumRapChieu?.map((cum, index) => (
        <div key={index} className={classes.cumRapBox}>
          <h4 style={{ color: "#fff", marginBottom: 10 }}>{cum.tenCumRap}</h4>
          <div className={classes.gioChieuWrap}>
            {cum.lichChieuPhim.map((lich, i) => {
              const time = lich.ngayChieuGioChieu.slice(11, 16);
              return (
                <div key={i} className={classes.gioChieuItem}>
                  {time}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
