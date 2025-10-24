import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import useStyles from "./style";
import ListSeat from "./ListSeat";
import PayMent from "./PayMent";
import Modal from "./Modal";
import { getListSeat } from "../../reducers/actions/BookTicket";
import {
  SET_ISMOBILE,
  INIT_DATA,
  RESET_DATA_BookTicket,
} from "../../reducers/constants/BookTicket";
import { DISPLAY_MOBILE_BookTicket } from "../../constants/config";
export default function Index() {
  const classes = useStyles();
  const { isLazy } = useSelector((state) => state.lazyReducer);
  const {
    loadingGetListSeat,
    timeOut,
    danhSachPhongVe: { thongTinPhim, danhSachGhe },
    errorGetListSeatMessage,
  } = useSelector((state) => state.BookTicketReducer);
  const { currentUser } = useSelector((state) => state.authReducer);
  const param = useParams();
  const dispatch = useDispatch();
  const mediaQuery = useMediaQuery(DISPLAY_MOBILE_BookTicket);
  const loading = isLazy || loadingGetListSeat;
  useEffect(() => {
    dispatch(getListSeat(param.maLichChieu));
    return () => {
      dispatch({ type: RESET_DATA_BookTicket });
    };
  }, []);
  useEffect(() => {
    let initCode = 64;
    const danhSachGheEdit = danhSachGhe?.map((seat, i) => {
      if (i % 16 === 0) initCode++;
      const txt = String.fromCharCode(initCode);
      const number = ((i % 16) + 1).toString().padStart(2, 0);
      return { ...seat, label: txt + number, selected: false };
    });
    dispatch({
      type: INIT_DATA,
      payload: {
        listSeat: danhSachGheEdit,
        maLichChieu: thongTinPhim?.maLichChieu,
        taiKhoanNguoiDung: currentUser?.taiKhoan,
        email: currentUser?.email,
        phone: currentUser?.soDT,
      },
    });
  }, [danhSachGhe, currentUser, timeOut]);
  useEffect(() => {
    dispatch({ type: SET_ISMOBILE, payload: { isMobile: mediaQuery } });
  }, [mediaQuery]);

  if (errorGetListSeatMessage) {
    return <div>{errorGetListSeatMessage}</div>;
  }
  return (
    <div style={{ display: loading ? "none" : "block" }}>
      <div className={classes.bookTicked}>
        <section className={classes.left}>
          <ListSeat />
        </section>
        <section className={classes.right}>
          <PayMent />
        </section>
      </div>
      <Modal />
    </div>
  );
}
