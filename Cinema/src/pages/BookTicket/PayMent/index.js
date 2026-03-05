import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";

import useStyles from "./style";
import formatDate from "../../../utilities/formatDate";
import { BookTicket } from "../../../reducers/actions/BookTicket";
import { SET_DATA_PAYMENT, SET_READY_PAYMENT } from "../../../reducers/constants/BookTicket";
import usersApi from "../../../api/usersApi";
import { useHistory, useParams } from "react-router-dom/cjs/react-router-dom.min";
import { useLocation } from "react-router-dom";

import { QRCodeCanvas } from "qrcode.react";

const makeObjError = (name, value, dataSubmit) => {
  let newErrors = {
    ...dataSubmit.errors,
    [name]:
      value?.trim() === ""
        ? `${name.charAt(0).toUpperCase() + name.slice(1)} không được bỏ trống`
        : "",
  };

  const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  const regexNumber =
    /^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/;

  if (name === "email" && value) {
    if (!regexEmail.test(value)) newErrors[name] = "Email không đúng định dạng";
  }
  if (name === "phone" && value) {
    if (!regexNumber.test(value)) newErrors[name] = "Phone không đúng định dạng";
  }
  return newErrors;
};

export default function PayMent() {
  const history = useHistory();
  const { currentUser } = useSelector((state) => state.authReducer);
  const location = useLocation();

  const {
    listSeat,
    amount,
    email,
    phone,
    paymentMethod,
    isReadyPayment,
    isMobile,
    danhSachVe,
    danhSachPhongVe: { thongTinPhim },
    maLichChieu,
    taiKhoanNguoiDung,
    isSelectedSeat,
    listSeatSelected,
    loadingBookTicketTicket,
    successBookTicketTicketMessage,
    errorBookTicketMessage,
  } = useSelector((state) => state.BookTicketReducer);

  const dispatch = useDispatch();
  // ===== PAYOS RETURN HANDLER (tự xác nhận sau khi PayOS redirect về) =====
  const [payosStatusMsg, setPayosStatusMsg] = useState("");
  const [payosVerifying, setPayosVerifying] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const payosFlag = params.get("payos");
    const orderCode = params.get("orderCode");
    const cancel = params.get("cancel");

    // Chỉ xử lý khi PayOS redirect về đúng URL có payos=1&orderCode=...
    if (payosFlag !== "1" || !orderCode) return;

    // Xóa query để tránh chạy lại khi refresh
    const clearQuery = () => {
      try {
        history.replace(location.pathname);
      } catch { }
    };

    if (cancel === "1") {
      setPayosStatusMsg("Bạn đã hủy thanh toán PayOS.");
      clearQuery();
      return;
    }

    setPayosVerifying(true);

    usersApi
      .getPayosPaymentInfo(orderCode)
      .then((res) => {
        const info = res?.data || {};
        const status = info.status;

        if (status === "PAID") {
          const raw = localStorage.getItem(`PAYOS_BOOK_${orderCode}`);
          if (!raw) {
            setPayosStatusMsg(
              "Thanh toán thành công nhưng không tìm thấy dữ liệu đặt vé. Vui lòng thử lại."
            );
            return;
          }
          const payload = JSON.parse(raw);

          setPayosStatusMsg("Thanh toán thành công ✅ Đang tạo vé...");

          dispatch(
            BookTicket({
              maLichChieu: payload.maLichChieu,
              danhSachVe: payload.danhSachVe,
              taiKhoanNguoiDung: payload.taiKhoanNguoiDung,
              // Backend đang chia /100 khi ghi thongke, nên FE gửi *100
              amount: Number(payload.amount || 0) * 100,
              tenPhim: payload.tenPhim,
            })
          );

          localStorage.removeItem(`PAYOS_BOOK_${orderCode}`);
          clearQuery();
        } else if (status === "CANCELLED") {
          setPayosStatusMsg("Thanh toán đã bị hủy.");
          clearQuery();
        } else {
          setPayosStatusMsg("Thanh toán chưa hoàn tất. Vui lòng thử lại.");
          clearQuery();
        }
      })
      .catch(() => {
        setPayosStatusMsg("Không xác nhận được thanh toán PayOS.");
        clearQuery();
      })
      .finally(() => setPayosVerifying(false));
  }, [location.search, location.pathname, history, dispatch]);
  const emailRef = useRef();
  const phoneRef = useRef();
  let variClear = useRef("");

  const [dataFocus, setDataFocus] = useState({ phone: false, email: false });
  const [dataSubmit, setdataSubmit] = useState({
    values: {
      email: '',
      phone: '',
      paymentMethod: paymentMethod,
    },
    errors: {
      email: "",
      phone: "",
    },
  });

  // ===== DEMO PAYMENT =====
  const IS_DEMO_PAYMENT = false; // ✅ dùng PayOS thay cho demo
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoLocalError, setDemoLocalError] = useState("");

  // QR demo: chỉ là QR chứa dữ liệu đơn (demo UI, không chuyển tiền thật)
  const demoQrValue = useMemo(() => {
    const payload = {
      type: "DEMO_PAYMENT",
      maLichChieu,
      taiKhoanNguoiDung,
      danhSachGhe: listSeatSelected || [],
      tongTien: Number(amount || 0),
      tenPhim: thongTinPhim?.tenPhim || "",
      time: new Date().toISOString(),
    };
    return JSON.stringify(payload);
  }, [maLichChieu, taiKhoanNguoiDung, listSeatSelected, amount, thongTinPhim?.tenPhim]);

  const classes = useStyles({
    isSelectedSeat,
    isReadyPayment,
    isMobile,
    dataFocus,
    dataSubmit,
  });

  const openDemo = () => {
    setDemoLocalError("");
    setDemoOpen(true);
  };

  const closeDemo = () => {
    if (loadingBookTicketTicket) return;
    setDemoOpen(false);
  };

  const confirmDemoPaid = () => {
    if (!danhSachVe || danhSachVe.length === 0) {
      setDemoLocalError("Bạn chưa chọn ghế.");
      return;
    }

    setDemoLocalError("");

    // Demo: gửi amount * 100 để khớp logic backend (thống kê chia /100)
    const tenPhim = thongTinPhim?.tenPhim;

    dispatch(
      BookTicket({
        maLichChieu,
        danhSachVe,
        taiKhoanNguoiDung,
        amount: Number(amount || 0) * 100,
        tenPhim,
      })
    );
  };

  useEffect(() => {
    if (demoOpen && successBookTicketTicketMessage) {
      setDemoOpen(false);
    }
  }, [demoOpen, successBookTicketTicketMessage]);

  const onChange = (e) => {
    let { name, value } = e.target;
    let newValues = { ...dataSubmit.values, [name]: value };
    let newErrors = makeObjError(name, value, dataSubmit);

    setdataSubmit((dataSubmit) => ({
      ...dataSubmit,
      values: newValues,
      errors: newErrors,
    }));
  };

  useEffect(() => {
    clearTimeout(variClear.current);
    variClear.current = setTimeout(() => {
      dispatch({
        type: SET_DATA_PAYMENT,
        payload: {
          email: dataSubmit.values.email,
          phone: dataSubmit.values.phone,
          paymentMethod: dataSubmit.values.paymentMethod,
        },
      });

      if (
        !dataSubmit.errors.email &&
        !dataSubmit.errors.phone &&
        dataSubmit.values.email &&
        dataSubmit.values.phone &&
        dataSubmit.values.paymentMethod &&
        isSelectedSeat
      ) {
        dispatch({ type: SET_READY_PAYMENT, payload: { isReadyPayment: true } });
      } else {
        dispatch({ type: SET_READY_PAYMENT, payload: { isReadyPayment: false } });
      }
    }, 500);

    return () => clearTimeout(variClear.current);
  }, [dataSubmit, isSelectedSeat]);

  const handleBookTicket = () => {
    // ✅ Thanh toán thật bằng PayOS (thay cho DEMO)
    if (!danhSachVe || danhSachVe.length === 0) {
      alert("Bạn chưa chọn ghế.");
      return;
    }
    if (!dataSubmit.values.email || !dataSubmit.values.phone) {
      alert("Vui lòng nhập Email và Phone.");
      return;
    }

    usersApi
      .creatPaymentUrl(amount, maLichChieu, danhSachVe, taiKhoanNguoiDung)
      .then((result) => {
        const data = result?.data;

        // Backend có thể trả string (cũ) hoặc object (mới)
        const checkoutUrl =
          typeof data === "string" ? data : data?.checkoutUrl || data?.checkoutURL;
        const orderCode = typeof data === "string" ? null : data?.orderCode;

        if (!checkoutUrl) {
          console.error("PayOS response:", data);
          alert("Không nhận được checkoutUrl từ PayOS.");
          return;
        }

        // Lưu payload để khi PayOS redirect về thì tự đặt vé
        if (orderCode) {
          const payload = {
            maLichChieu,
            danhSachVe,
            taiKhoanNguoiDung,
            amount: Number(amount || 0),
            tenPhim: thongTinPhim?.tenPhim || "",
          };
          localStorage.setItem(`PAYOS_BOOK_${orderCode}`, JSON.stringify(payload));
        }

        window.location.href = checkoutUrl;
      })
      .catch((err) => {
        console.error(err);
        alert("Không tạo được link thanh toán PayOS.");
      });
  };

  const onFocus = (e) => setDataFocus({ ...dataFocus, [e.target.name]: true });
  const onBlur = (e) => setDataFocus({ ...dataFocus, [e.target.name]: false });

  return (
    <>
      <aside className={`container ${classes.payMent}`}>
        <div className="row">
          <div className="col-md-12">
            <p className={`${classes.amount} ${classes.payMentItem}`}>
              {`${Number(amount || 0).toLocaleString("vi-VI")} đ`}
            </p>
            {payosStatusMsg && (
              <p style={{ marginTop: 8, color: payosVerifying ? "#ffb74d" : "#81c784" }}>
                {payosStatusMsg}
              </p>
            )}

          </div>

          <div className="col-md-12">
            <div className={classes.payMentItem}>
              <p className={classes.tenPhim}>{thongTinPhim?.tenPhim}</p>
              <p>{thongTinPhim?.tenCumRap}</p>
              <p>{`${thongTinPhim?.tenRap}`}</p>
            </div>
          </div>

          <div className="col-md-12">
            <div className={`${classes.seatInfo} ${classes.payMentItem}`}>
              <span>{`Ghế ${listSeatSelected?.join(", ")}`}</span>
              <p className={classes.amountLittle}>
                {`${Number(amount || 0).toLocaleString("vi-VI")} đ`}
              </p>
            </div>
          </div>

          <div className="col-md-12">
            <div className={classes.payMentItem}>
              <label className={classes.labelEmail}>E-Mail</label>
              <input
                type="text"
                name="email"
                ref={emailRef}
                onFocus={onFocus}
                onBlur={onBlur}
                value={dataSubmit.values.email || ""}
                className={classes.fillInEmail}
                onChange={onChange}
                autoComplete="off"
              />
              <p className={classes.error}>{dataSubmit.errors.email}</p>
            </div>
          </div>

          <div className="col-md-12">
            <div className={classes.payMentItem}>
              <label className={classes.labelPhone}>Phone</label>
              <br />
              <input
                type="number"
                name="phone"
                ref={phoneRef}
                onFocus={onFocus}
                onBlur={onBlur}
                value={dataSubmit.values.phone || ""}
                className={classes.fillInPhone}
                onChange={onChange}
                autoComplete="off"
              />
              <p className={classes.error}>{dataSubmit.errors.phone}</p>
            </div>
          </div>

          <div className="col-md-12 d-none d-md-block">
            <div className={classes.payMentItem}>
              <label className={classes.label}>Mã giảm giá</label>
              <input type="text" value="Tạm thời không hỗ trợ..." readOnly className={classes.fillIn} />
              <button className={`${classes.btnDiscount} btn btn-primary`} disabled>
                Áp dụng
              </button>
            </div>
          </div>

          <div className="col-md-12">
            <button className={`${classes.btnDV} btn btn-primary`} onClick={handleBookTicket}>
              Đặt Vé
            </button>
          </div>

          <div className="col-md-12">
            <a href="/">
              <button type="button" className={`${classes.btnDV} btn btn-primary`}>
                Quay lại trang chủ →
              </button>
            </a>
          </div>
        </div>
      </aside>

      {/* ===== POPUP DEMO PAYMENT ===== */}
      {demoOpen && (
        <div className={classes.demoOverlay} onClick={closeDemo}>
          <div className={classes.demoModal} onClick={(e) => e.stopPropagation()}>
            <div className={classes.demoHeader}>
              <div className={classes.demoTitle}>Thanh toán (DEMO)</div>
              <button className={classes.demoClose} onClick={closeDemo}>
                ×
              </button>
            </div>

            <div className={classes.demoBody}>
              <div>
                <div className={classes.demoQR}>
                  <QRCodeCanvas value={demoQrValue} size={210} includeMargin={false} level="M" />
                </div>
              </div>

              <div>
                <div className={classes.demoRow}>
                  <span>Phim</span>
                  <b>{thongTinPhim?.tenPhim || "—"}</b>
                </div>
                <div className={classes.demoRow}>
                  <span>Mã lịch chiếu</span>
                  <b>{maLichChieu}</b>
                </div>
                <div className={classes.demoRow}>
                  <span>Ghế</span>
                  <b>{listSeatSelected?.join(", ") || "—"}</b>
                </div>
                <div className={classes.demoRow}>
                  <span>Tổng tiền</span>
                  <b>{Number(amount || 0).toLocaleString("vi-VN")} đ</b>
                </div>

                {(demoLocalError || errorBookTicketMessage) && (
                  <div className={classes.demoError}>
                    {demoLocalError ||
                      (typeof errorBookTicketMessage === "string"
                        ? errorBookTicketMessage
                        : "Đặt vé thất bại")}
                  </div>
                )}

                <div className={classes.demoActions}>
                  <button className="btn btn-secondary" onClick={closeDemo} disabled={loadingBookTicketTicket}>
                    Hủy
                  </button>

                  <button className="btn btn-success" onClick={confirmDemoPaid} disabled={loadingBookTicketTicket}>
                    {loadingBookTicketTicket ? "Đang xử lý..." : "Xác nhận đã thanh toán"}
                  </button>
                </div>

                <div className={classes.demoNote}>
                  * Bấm xác nhận để hệ thống tạo vé như “thanh toán thành công”.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}