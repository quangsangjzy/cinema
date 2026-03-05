import React, { useRef, useEffect, useState } from "react";

import SeatIcon from "@material-ui/icons/CallToActionRounded";
import { useSelector, useDispatch } from "react-redux";
import Countdown from "../Countdown";
import BookTicketApi from "../../../api/bookingApi";
import { getListSeat } from "../../../reducers/actions/BookTicket";

import useStyles from "./style";
import { colorTheater, logoTheater } from "../../../constants/theaterData";
import formatDate from "../../../utilities/formatDate";
import {
    CHANGE_LISTSEAT,
    SET_ALERT_OVER10,
} from "../../../reducers/constants/BookTicket";
import TenCumRap from "../../../components/TenCumRap";
import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";
import { format, parse, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ListSeat() {
    const {
        isMobile,
        listSeat,
        danhSachPhongVe: { thongTinPhim },
    } = useSelector((state) => state.BookTicketReducer);
    const { currentUser } = useSelector((state) => state.authReducer);
    const domToSeatElement = useRef(null);
    const [widthSeat, setWidthSeat] = useState(0);
    const classes = useStyles({
        color: colorTheater[thongTinPhim?.tenCumRap.slice(0, 3).toUpperCase()],
        modalLeftImg: thongTinPhim?.hinhAnh,
        isMobile,
        widthLabel: widthSeat / 2,
    });
    const dispatch = useDispatch();

    const clientId = React.useMemo(() => {
        if (currentUser?.taiKhoan) return String(currentUser.taiKhoan);
        const key = "BOOK_CLIENT_ID";
        let cid = localStorage.getItem(key);
        if (!cid) {
            cid = "guest-" + Math.random().toString(36).slice(2) + Date.now();
            localStorage.setItem(key, cid);
        }
        return cid;
    }, [currentUser]);

    const [topping, setTopping] = useState(0);
    const [holdEndTime, setHoldEndTime] = useState(null);

    const handleChange = (event) => {
        setTopping(event.target.value);
    };

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    useEffect(() => {
        handleResize();
    }, [listSeat]);

    useEffect(() => {
        const selectedCount = (listSeat || []).filter((s) => s.selected).length;

        // ✅ chọn ghế lần đầu -> bắt đầu 15 phút
        if (selectedCount > 0 && !holdEndTime) {
            setHoldEndTime(Date.now() + 15 * 60 * 1000);
        }

        // ✅ bỏ chọn hết ghế -> reset timer
        if (selectedCount === 0 && holdEndTime) {
            setHoldEndTime(null);
        }
    }, [listSeat, holdEndTime]);
// ✅ Polling để cập nhật ghế giữ bởi người khác (gần realtime)
useEffect(() => {
    const mlc = thongTinPhim?.maLichChieu;
    if (!mlc) return;
    const timer = setInterval(() => {
        dispatch(getListSeat(mlc, clientId, true));
    }, 5000);
    return () => clearInterval(timer);
}, [thongTinPhim?.maLichChieu, clientId, dispatch]);

    const handleResize = () => {
        setWidthSeat(domToSeatElement?.current?.offsetWidth);
    };

    const handleSelectedSeat = async (seatSelected) => {
        if (seatSelected.daDat || Number(seatSelected.isActive) !== 1) {
            return;
        }
// ✅ Ghế đang được giữ bởi người khác thì không cho chọn
if (seatSelected.isHold && seatSelected.taiKhoanNguoiDat && String(seatSelected.taiKhoanNguoiDat) !== String(clientId)) {
    alert("Ghế đang được giữ bởi người khác, vui lòng chọn ghế khác.");
    return;
}

const mlc = thongTinPhim?.maLichChieu;
const willSelect = !seatSelected.selected;

// ✅ Nếu đang chọn ghế -> gọi API giữ ghế trước
if (willSelect) {
    try {
        await BookTicketApi.giuGhe({ maLichChieu: mlc, tenGhe: seatSelected.maGhe, clientId, holdMinutes: 15 });
    } catch (e) {
        alert(e?.response?.data?.message || "Không giữ được ghế, vui lòng thử lại.");
        // refresh lại danh sách ghế
        if (mlc) dispatch(getListSeat(mlc, clientId));
        return;
    }
} else {
    // ✅ Bỏ chọn ghế -> hủy giữ ghế
    try {
        await BookTicketApi.huyGiuGhe({ maLichChieu: mlc, tenGhe: seatSelected.maGhe, clientId });
    } catch {}
}

        let newListSeat = listSeat.map((seat) => {
            if (seatSelected.maGhe === seat.maGhe) {
                return { ...seat, selected: !seat.selected };
            }
            return seat;
        });
        const newListSeatSelected = newListSeat?.reduce(
            (newListSeatSelected, seat) => {
                if (seat.selected) {
                    return [...newListSeatSelected, seat.label];
                }
                return newListSeatSelected;
            },
            []
        );
        if (newListSeatSelected.length === 11) {
            dispatch({
                type: SET_ALERT_OVER10,
            });
            return;
        }
        const danhSachVe = newListSeat?.reduce((danhSachVe, seat) => {
            if (seat.selected) {
                return [...danhSachVe, { maGhe: seat.maGhe, tenDayDu: seat.label, giaVe: seat.giaVe }];
            }
            return danhSachVe;
        }, []);
        const isSelectedSeat = newListSeatSelected.length > 0 ? true : false;
        const amountWithTopping = newListSeat?.reduce((totalAmount, seat) => {
            if (seat.selected) {
                return totalAmount + seat.giaVe;
            }
            return totalAmount;
        }, 0);

        const amount = (parseInt(amountWithTopping, 10) + parseInt(topping, 10)).toString();
        dispatch({
            type: CHANGE_LISTSEAT,
            payload: {
                listSeat: newListSeat,
                isSelectedSeat,
                listSeatSelected: newListSeatSelected,
                danhSachVe,
                amount,
            },
        });
    };
    const color = (seat) => {
        let color;
        if (Number(seat.isActive) !== 1) {
            color = "#9e9e9e";
            return color;
        }
        if (seat.loaiGhe === "Thuong") {
            color = "#3e515d";
        }
        if (seat.loaiGhe === "Vip") {
            color = "#f7b500";
        }
        if (seat.selected) {
            color = "#44c020";
        }
        if (seat.daDat) {
            color = "#99c5ff";
        }
        return color;
    };

    const ngayChieu = thongTinPhim?.gioChieu;
    console.log(ngayChieu)
    let thu = '';

    if (ngayChieu) {
        const parsedDate = parse(ngayChieu, 'dd/MM/yyyy HH:mm:ss', new Date());
        console.log(parsedDate)

        if (isValid(parsedDate)) {
            thu = format(parsedDate, 'EEEE', { locale: vi });
        }
    }


    return (
        <main className={classes.listSeat}>
            <div className={classes.info_CountDown}>
                <div className={classes.infoTheater}>
                    <img
                        src={logoTheater[thongTinPhim?.tenCumRap.slice(0, 3).toUpperCase()]}
                        alt="phim"
                        style={{ width: 50, height: 50 }}
                    />
                    <div className={classes.text}>
                        <TenCumRap tenCumRap={thongTinPhim?.tenCumRap} />
                        <p className={classes.textTime}>{`${thongTinPhim && thu
                            } - ${thongTinPhim?.gioChieu} - ${thongTinPhim?.tenRap}`}</p>
                    </div>
                </div>
                <div className={classes.countDown}>
                    <p className={classes.timeTitle}>Thời gian giữ ghế</p>
                    <Countdown date={holdEndTime} isActive={!!holdEndTime} />
                </div>
            </div>

            <div className={classes.overflowSeat}>

                <div className={classes.invariantWidth}>
                    {/* Add topping */}

                    <FormControl variant="standard" sx={{ m: 1, minWidth: 520 }}>
                        <InputLabel id="demo-simple-select-standard-label" style={{ color: "white" }}>CHỌN NƯƠC HOẶC BỎNG (NẾU MUỐN)</InputLabel>
                        <Select
                            labelId="demo-simple-select-standard-label"
                            id="demo-simple-select-standard"
                            value={topping}
                            onChange={handleChange}
                            label="Age"
                            style={{ width: "900px", color: "white" }}
                        >
                            <MenuItem value={0}>
                                <em>---CHỌN---</em>
                            </MenuItem>
                            <MenuItem value={30000}>Nước - 30.000 VNĐ</MenuItem>
                            <MenuItem value={50000}>Bỏng - 50.000 VNĐ</MenuItem>
                            <MenuItem value={100000}>Nước + Bỏng - 100.000 VNĐ</MenuItem>
                        </Select>
                    </FormControl>
                    <div className={classes.seatSelect}>
                        {listSeat?.map((seat, i) => (
                            <div
                                className={classes.seat}
                                key={seat.maGhe}
                                ref={domToSeatElement}
                            >
                                {(i === 0 || i % 16 === 0) && (
                                    <p className={classes.label}>{seat.label.slice(0, 1)}</p>
                                )}
                                {seat.selected && (
                                    <p className={classes.seatName}>
                                        {Number(seat.label.slice(1)) < 10
                                            ? seat.label.slice(2)
                                            : seat.label.slice(1)}
                                    </p>
                                )}
                                {(seat.daDat || Number(seat.isActive) !== 1) && (
                                    <img
                                        className={classes.seatLocked}
                                        src="/img/BookTicket/notchoose.png"
                                        alt="notchoose"
                                    />
                                )}
                                <SeatIcon
                                    style={{ color: color(seat) }}
                                    className={classes.seatIcon}
                                />

                                <div
                                    className={classes.areaClick}
                                    onClick={() => handleSelectedSeat(seat)}
                                ></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={classes.noteSeat}>
                <div className={classes.typeSeats}>
                    <div>
                        <SeatIcon style={{ color: "#3e515d", fontSize: 27 }} />
                        <p>Ghế thường</p>
                    </div>
                    <div>
                        <SeatIcon style={{ color: "#f7b500", fontSize: 27 }} />
                        <p>Ghế vip</p>
                    </div>
                    <div>
                        <SeatIcon style={{ color: "#44c020", fontSize: 27 }} />
                        <p>Ghế đang chọn</p>
                    </div>
                    <div>
                        <div style={{ position: "relative" }}>
                            <p className={classes.posiX}>x</p>
                            <SeatIcon style={{ color: "#99c5ff", fontSize: 27 }} />
                        </div>
                        <p>Ghế đã được mua</p>
                    </div>
                </div>
            </div>


        </main>
    );
}
