import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import Countdown, { zeroPad } from "react-countdown";
import { TIMEOUT, RESET_DATA_BookTicket } from "../../../reducers/constants/BookTicket";
import { getListSeat } from "../../../reducers/actions/BookTicket";

export default function Index({ date, isActive }) {
  const { loadingBookTicketTicket, successBookTicketTicketMessage, errorBookTicketMessage } =
    useSelector((state) => state.BookTicketReducer);
  const dispatch = useDispatch();
  const { maLichChieu } = useParams();

  const handleTimeOut = () => {
    if (!loadingBookTicketTicket && !(successBookTicketTicketMessage || errorBookTicketMessage)) {
      // ✅ Hết 15 phút -> tự hủy giữ ghế: reset + reload ghế
      dispatch({ type: RESET_DATA_BookTicket });
      dispatch(getListSeat(maLichChieu));
      dispatch({ type: TIMEOUT }); // mở modal báo hết giờ (nếu bạn muốn)
    }
  };

  const style = {
    fontWeight: "bold",
    color: "rgb(238, 130, 59)",
    lineHeight: "39px",
  };

  // ✅ Chưa chọn ghế thì không chạy timer
  if (!isActive || !date) {
    return <span style={style}>--:--</span>;
  }

  return (
    <Countdown
      date={date}
      renderer={({ minutes, seconds }) => (
        <span style={style}>
          {zeroPad(minutes)}:{zeroPad(seconds)}
        </span>
      )}
      onComplete={handleTimeOut}
    />
  );
}