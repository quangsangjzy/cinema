import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@material-ui/core";
import SeatIcon from "@material-ui/icons/EventSeat";
import { useSnackbar } from "notistack";

import theatersApi from "../../api/theatersApi";
import chairApi from "../../api/chairApi";

import "./style.css";

// Layout hiện tại của project đang fix 10x16 (160 ghế)
const DEFAULT_ROWS = 10;
const DEFAULT_COLS = 16;
const DEFAULT_TOTAL = DEFAULT_ROWS * DEFAULT_COLS;

// Đổi label thành A1, A2... F1, F2... (dễ đọc hơn)
function seatLabelByIndex(i) {
  const row = Math.floor(i / DEFAULT_COLS);
  const col = (i % DEFAULT_COLS) + 1;
  const txt = String.fromCharCode(65 + row); // A,B,C...
  return `${txt}${col}`; // ví dụ: F1
}

export default function ChairManagement() {
  const { enqueueSnackbar } = useSnackbar();

  const [loadingRooms, setLoadingRooms] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [maRap, setMaRap] = useState("");

  const [loadingSeats, setLoadingSeats] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seats, setSeats] = useState([]); // [{seatIndex, loaiGhe, isActive}]

  const seatMap = useMemo(() => {
    const m = new Map();
    for (const s of seats) m.set(Number(s.seatIndex), s);
    return m;
  }, [seats]);

  const hasLayout = seats?.length > 0;

  useEffect(() => {
    setLoadingRooms(true);
    theatersApi
      .getListRap()
      .then((r) => {
        setRooms(r.data || []);
      })
      .catch((e) => enqueueSnackbar(String(e?.message || e), { variant: "error" }))
      .finally(() => setLoadingRooms(false));
  }, [enqueueSnackbar]);

  const loadSeats = (rap) => {
    if (!rap) return;
    setLoadingSeats(true);
    chairApi
      .getSeatsByRap(rap)
      .then((r) => {
        const data = r.data;
        setSeats(Array.isArray(data?.seats) ? data.seats : []);
      })
      .catch((e) =>
        enqueueSnackbar(String(e?.response?.data?.message || e?.message || e), { variant: "error" })
      )
      .finally(() => setLoadingSeats(false));
  };

  useEffect(() => {
    if (maRap) loadSeats(maRap);
  }, [maRap]);

  const handleCreateDefault = async () => {
    if (!maRap) return;
    setSaving(true);
    try {
      await chairApi.createDefaultLayout({
        maRap,
        rows: DEFAULT_ROWS,
        cols: DEFAULT_COLS,
        vipFrom: 45,
        vipTo: 89,
      });
      enqueueSnackbar("Đã tạo sơ đồ ghế mặc định", { variant: "success" });
      loadSeats(maRap);
    } catch (e) {
      enqueueSnackbar(String(e?.response?.data?.message || e?.message || e), { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSeat = (seatIndex) => {
    const s = seatMap.get(seatIndex) || { seatIndex, loaiGhe: "Thuong", isActive: 1 };

    // Cycle: Active Thuong -> Active Vip -> Disabled -> Active Thuong
    let next;
    if (Number(s.isActive) !== 1) {
      next = { ...s, isActive: 1, loaiGhe: "Thuong" };
    } else if (s.loaiGhe === "Thuong") {
      next = { ...s, isActive: 1, loaiGhe: "Vip" };
    } else if (s.loaiGhe === "Vip") {
      next = { ...s, isActive: 0, loaiGhe: "Thuong" };
    } else {
      next = { ...s, isActive: 1, loaiGhe: "Thuong" };
    }

    setSeats((prev) => {
      const others = prev.filter((x) => Number(x.seatIndex) !== seatIndex);
      return [...others, next].sort((a, b) => Number(a.seatIndex) - Number(b.seatIndex));
    });
  };

  const handleSave = async () => {
    if (!maRap) return;
    if (!seats.length) {
      enqueueSnackbar("Chưa có dữ liệu ghế để lưu", { variant: "warning" });
      return;
    }
    setSaving(true);
    try {
      // đảm bảo có đủ 160 ghế (tránh lưu thiếu -> booking bị lệch)
      const normalized = Array.from({ length: DEFAULT_TOTAL }).map((_, i) => {
        const s =
          seatMap.get(i) || { seatIndex: i, loaiGhe: i >= 45 && i <= 89 ? "Vip" : "Thuong", isActive: 1 };
        return {
          seatIndex: i,
          loaiGhe: s.loaiGhe === "Vip" ? "Vip" : "Thuong",
          isActive: Number(s.isActive) === 0 ? 0 : 1,
        };
      });

      await chairApi.updateLayout({ maRap, seats: normalized });
      enqueueSnackbar("Lưu sơ đồ ghế thành công", { variant: "success" });
      loadSeats(maRap);
    } catch (e) {
      enqueueSnackbar(String(e?.response?.data?.message || e?.message || e), { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const counts = useMemo(() => {
    const full = Array.from({ length: DEFAULT_TOTAL }).map(
      (_, i) => seatMap.get(i) || { seatIndex: i, loaiGhe: i >= 45 && i <= 89 ? "Vip" : "Thuong", isActive: 1 }
    );
    const active = full.filter((s) => Number(s.isActive) === 1);
    const vip = active.filter((s) => s.loaiGhe === "Vip");
    const disabled = full.filter((s) => Number(s.isActive) !== 1);
    return { total: DEFAULT_TOTAL, active: active.length, vip: vip.length, disabled: disabled.length };
  }, [seatMap]);

  const iconColor = (s) => {
    if (Number(s.isActive) !== 1) return "#9e9e9e"; // disabled
    if (s.loaiGhe === "Vip") return "#f7b500";
    return "#3e515d";
  };

  return (
    <div className="chairRoot">
      <Typography variant="h5" style={{ marginBottom: 8 }}>
        Quản lý ghế
      </Typography>
      <Typography variant="body2" color="#000" style={{ marginBottom: 16, }}>
        Trang này cho phép cấu hình loại ghế (Thường/VIP) và khóa ghế theo từng rạp.
      </Typography>

      <div className="chairToolbar">
        <FormControl variant="outlined" size="small" style={{ minWidth: 320 }} disabled={loadingRooms}>
          <InputLabel id="select-rap">Chọn rạp</InputLabel>
          <Select
            labelId="select-rap"
            value={maRap}
            onChange={(e) => setMaRap(e.target.value)}
            label="Chọn rạp"
          >
            {rooms.map((r) => (
              <MenuItem key={r.did || r.maRap} value={r.maRap}>
                {r.tenRap} — {r.tenCumRap} ({r.tenHeThongRap})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={!maRap || saving || loadingSeats || !hasLayout}
        >
          {saving ? "Đang lưu..." : "Lưu sơ đồ"}
        </Button>

        <Button variant="outlined" onClick={() => maRap && loadSeats(maRap)} disabled={!maRap || saving || loadingSeats}>
          Tải lại
        </Button>

        {!hasLayout && (
          <Button variant="outlined" color="secondary" onClick={handleCreateDefault} disabled={!maRap || saving || loadingSeats}>
            Tạo sơ đồ mặc định (10x16)
          </Button>
        )}

        <Box style={{ marginLeft: "auto" }}>
          <Typography variant="body2">
            Tổng: <b>{counts.total}</b> — Hoạt động: <b>{counts.active}</b> — VIP: <b>{counts.vip}</b> — Khóa: <b>{counts.disabled}</b>
          </Typography>
        </Box>
      </div>

      {loadingSeats ? (
        <Box display="flex" alignItems="center" justifyContent="center" style={{ padding: 32 }}>
          <CircularProgress />
        </Box>
      ) : !maRap ? (
        <Paper style={{ padding: 24 }}>
          <Typography>Hãy chọn rạp để xem/cấu hình sơ đồ ghế.</Typography>
        </Paper>
      ) : !hasLayout ? (
        <Paper style={{ padding: 24 }}>
          <Typography style={{ marginBottom: 8 }}>Rạp này chưa có sơ đồ ghế trong DB.</Typography>
          <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
            Nhấn "Tạo sơ đồ mặc định" để hệ thống tạo 160 ghế theo layout hiện tại của trang đặt vé.
          </Typography>
        </Paper>
      ) : (
        <Paper className="chairGridWrap">
          <div className="chairSeatGrid">
            {Array.from({ length: DEFAULT_TOTAL }).map((_, i) => {
              const s = seatMap.get(i) || { seatIndex: i, loaiGhe: i >= 45 && i <= 89 ? "Vip" : "Thuong", isActive: 1 };
              return (
                <div
                  key={i}
                  className="chairSeatCell"
                  onClick={() => handleToggleSeat(i)}
                  title={`${seatLabelByIndex(i)} — ${Number(s.isActive) === 1 ? s.loaiGhe : "Khóa"}`}
                >
                  <span className="chairSeatLabel">{seatLabelByIndex(i)}</span>
                  <SeatIcon style={{ color: iconColor(s), fontSize: 28 }} />
                </div>
              );
            })}
          </div>
        </Paper>
      )}

      <div className="chairLegend">
        <div className="chairLegendItem">
          <SeatIcon style={{ color: "#3e515d" }} /> <span>Ghế thường</span>
        </div>
        <div className="chairLegendItem">
          <SeatIcon style={{ color: "#f7b500" }} /> <span>Ghế VIP</span>
        </div>
        <div className="chairLegendItem">
          <SeatIcon style={{ color: "#9e9e9e" }} /> <span>Ghế bị khóa</span>
        </div>
      </div>
    </div>
  );
}