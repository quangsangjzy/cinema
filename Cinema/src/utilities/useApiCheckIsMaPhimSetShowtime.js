import { useEffect, useState } from "react";
import Axios from "axios";
import { BASE_URL } from "../constants/config";

// Hook trả về true nếu phim có ít nhất 1 lịch chiếu
// Dùng API LayThongTinLichChieuPhim để check ổn định cho admin.
export default function useApiCheckIsMaPhimSetShowtime(maPhim) {
  // mặc định true để tránh người dùng bấm xóa khi data chưa load
  const [isMaPhimSetShowtime, setIsMaPhimSetShowtime] = useState(true);

  useEffect(() => {
    if (!maPhim || Number.isNaN(Number(maPhim))) {
      setIsMaPhimSetShowtime(false);
      return;
    }

    const cancelSource = Axios.CancelToken.source();
    // thêm cache-buster để tránh 304/cache
    const url = `${BASE_URL}/QuanLyRap/LayThongTinLichChieuPhim?MaPhim=${maPhim}&_=${Date.now()}`;

    (async () => {
      try {
        const res = await Axios.get(url, { cancelToken: cancelSource.token });
        const data = res?.data || {};
        const heThong = Array.isArray(data.heThongRapChieu)
          ? data.heThongRapChieu
          : [];

        const hasShowtime = heThong.some((ht) =>
          (ht?.cumRapChieu || []).some((cum) => {
            const lich =
              cum?.lichChieuPhim ||
              cum?.lichchieuPhim ||
              cum?.lichChieu ||
              cum?.lichchieu ||
              [];
            return Array.isArray(lich) && lich.length > 0;
          })
        );

        setIsMaPhimSetShowtime(hasShowtime);
      } catch (err) {
        if (!Axios.isCancel(err)) {
          // Nếu lỗi API thì cho phép (để tránh khóa UI sai), backend vẫn sẽ chặn nếu có lịch chiếu
          setIsMaPhimSetShowtime(false);
        }
      }
    })();

    return () => cancelSource.cancel();
  }, [maPhim]);

  return isMaPhimSetShowtime;
}
