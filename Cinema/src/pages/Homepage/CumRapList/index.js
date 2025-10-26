import React, { useEffect, useState } from "react";
import axios from "axios";
import "./style.css";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Divider,
} from "@material-ui/core";
import { BASE_URL } from "../../../constants/config";

export default function CumRapList() {
  const [cinemaSystems, setCinemaSystems] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/QuanLyRap/LayThongTinLichChieuHeThongRap`)
      .then((res) => setCinemaSystems(res.data))
      .catch((err) => console.log(err));
  }, []);

  const handleOpen = (cinema) => {
    setSelectedCinema({
      ...cinema,
      soPhongChieu: Math.floor(Math.random() * 10) + 5,
      sdt: "1900 123 456",
      quyDinh: [
        "Không mang thức ăn và nước uống từ bên ngoài vào rạp.",
        "Vui lòng giữ vé trong suốt thời gian xem phim.",
        "Trẻ em dưới 13 tuổi không xem phim có giới hạn độ tuổi.",
      ],
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCinema(null);
  };

  return (
    <div className="cumrap-container">
      <h2 className="cumrap-title">HỆ THỐNG RẠP</h2>

      {cinemaSystems.map((system) => (
        <div key={system.maHeThongRap} className="cumrap-system">
          <h3 className="system-name">{system.tenHeThongRap}</h3>
          <div className="cumrap-grid">
            {system.lstCumRap?.map((cinema) => (
              <div key={cinema.maCumRap} className="cumrap-card">
                <img
                  src={system.logo}
                  alt={cinema.tenCumRap}
                  className="cumrap-image"
                />
                <h4 className="cumrap-name">{cinema.tenCumRap}</h4>

                <div className="cumrap-buttons">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpen(cinema)}
                  >
                    Thông tin chi tiết
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => alert(`Chia sẻ ${cinema.tenCumRap}`)}
                  >
                    Chia sẻ
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* ---------- POPUP THÔNG TIN RẠP ---------- */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCinema?.tenCumRap}
        </DialogTitle>
        <Divider />
        <DialogContent dividers>
          {selectedCinema && (
            <>
              {/* --- Địa chỉ --- */}
              <Typography
                variant="body1"
                gutterBottom
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: 500,
                }}
              >
                📍 <span>{selectedCinema.diaChi}</span>
              </Typography>

              {/* --- Số điện thoại --- */}
              <Typography variant="body1" gutterBottom>
                <strong>Số điện thoại liên hệ:</strong> {selectedCinema.sdt}
              </Typography>

              {/* --- Số phòng chiếu --- */}
              <Typography variant="body1" gutterBottom>
                <strong>Số phòng chiếu:</strong> {selectedCinema.soPhongChieu}
              </Typography>

              {/* --- Quy định rạp --- */}
              <Typography variant="body1" gutterBottom>
                <strong>Quy định rạp:</strong>
              </Typography>
              <ul>
                {selectedCinema.quyDinh.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>

              {/* --- Bản đồ --- */}
              <Typography
                variant="body1"
                style={{ marginTop: "15px", fontWeight: 600 }}
              >
                📍 Vị trí bản đồ
              </Typography>
              <div className="map-container">
                <iframe
                  title="google-map"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    selectedCinema.diaChi
                  )}&output=embed`}
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                ></iframe>
              </div>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
