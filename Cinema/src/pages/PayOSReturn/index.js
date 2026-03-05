import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import usersApi from "../../api/usersApi";

export default function PayOSReturn() {
  const location = useLocation();
  const history = useHistory();
  const [message, setMessage] = useState("Đang xác nhận thanh toán...");

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(location.search);

      // tùy PayOS trả về, thường sẽ có orderCode
      const orderCode = params.get("orderCode") || params.get("id");
      if (!orderCode) {
        setMessage("Thiếu mã đơn hàng (orderCode).");
        return;
      }

      try {
        const info = await usersApi.getPayosPaymentInfo(orderCode);

        // PayOS thường có status: PAID / PENDING / CANCELLED ...
        const status = info?.status || info?.data?.status;

        if (status === "PAID") {
          setMessage("Thanh toán thành công ✅");
          // Bạn có thể điều hướng về trang vé đã mua hoặc trang chủ:
          setTimeout(() => history.push("/"), 1200);
          return;
        }

        if (status === "CANCELLED") {
          setMessage("Bạn đã hủy thanh toán ❌");
          return;
        }

        setMessage("Thanh toán chưa hoàn tất. Vui lòng thử lại.");
      } catch (e) {
        setMessage("Lỗi xác nhận thanh toán. Vui lòng thử lại.");
      }
    };

    run();
  }, [location.search, history]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Kết quả thanh toán</h2>
      <p>{message}</p>
    </div>
  );
}