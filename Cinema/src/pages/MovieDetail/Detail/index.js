import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "./style.css";
import useStyles from "./style";
import formatDate from "../../../utilities/formatDate";
import Tap from "../Tap";
import { useDispatch } from "react-redux";
import { OPEN_MODAL } from "../../../reducers/constants/ModalTrailer";

export default function Desktop({ movieDetailShowtimes: data, isMobile }) {
  const { maPhim } = useParams();
  const [onClickBtnMuave, setOnClickBtnMuave] = useState(0);
  const classes = useStyles({ bannerImg: data?.hinhAnh });
  const [imagePage404, setImagePage404] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();

  const handleBtnMuaVe = () => {
    setOnClickBtnMuave(Date.now()); // scroll xuống lịch chiếu
  };

  const openModal = () => {
    dispatch({
      type: OPEN_MODAL,
      payload: {
        open: true,
        urlYoutube: data?.trailer,
      },
    });
  };

  return (
    <div className="movieDetailPage">
      <div className="movieDetailHero">
        <div className="movieDetailCard">
          <div className="movieDetailPoster">
            <img
              src={data?.hinhAnh}
              alt="poster"
              className="movieDetailPosterImg"
              onError={(e) => {
                e.target.onerror = null;
                setImagePage404(true);
              }}
            />
            {imagePage404 && <div className={classes.withOutImage}></div>}
          </div>

          <div className="movieDetailInfo">
            <h2 className="movieDetailTitle text-white">{data?.tenPhim}</h2>

            <div className="movieDetailMeta">
              <div className="movieDetailRow">
                <div className="movieDetailLabel">Ngày công chiếu</div>
                <div className="movieDetailValue">
                  {formatDate(data?.ngayKhoiChieu?.slice(0, 10)).YyMmDd}
                </div>
              </div>
              <div className="movieDetailRow">
                <div className="movieDetailLabel">Đạo diễn</div>
                <div className="movieDetailValue">{data?.daoDien || "—"}</div>
              </div>
              <div className="movieDetailRow">
                <div className="movieDetailLabel">Diễn viên</div>
                <div className="movieDetailValue">{data?.dienVien || "—"}</div>
              </div>
              <div className="movieDetailRow">
                <div className="movieDetailLabel">Thể loại</div>
                <div className="movieDetailValue">{data?.maTheLoaiPhim || "—"}</div>
              </div>
              <div className="movieDetailRow">
                <div className="movieDetailLabel">Định dạng</div>
                <div className="movieDetailValue">{data?.dinhDang || "—"}</div>
              </div>
              <div className="movieDetailRow">
                <div className="movieDetailLabel">Quốc gia SX</div>
                <div className="movieDetailValue">{data?.nhaSanXuat || "—"}</div>
              </div>
              <div className="movieDetailRow movieDetailRowDesc">
                <div className="movieDetailLabel">Nội dung</div>
                <div className="movieDetailValue">{data?.moTa || "—"}</div>
              </div>
            </div>

            <div className="movieDetailActions">
              <button
                className={classes.btnMuaVe}
                onClick={handleBtnMuaVe}
                disabled={Boolean(location.state?.comingMovie)}
                title={location.state?.comingMovie ? "Phim sắp chiếu" : "Xem lịch chiếu"}
              >
                {location.state?.comingMovie ? "Thông tin phim" : "Mua vé"}
              </button>

              <button className={classes.btnMuaVe} onClick={openModal}>
                {location.state?.comingMovie ? "Trailer" : "Xem demo"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="movieDetailSchedule">
        <Tap
          data={data}
          maPhim={maPhim}
          onClickBtnMuave={onClickBtnMuave}
          onIncreaseQuantityComment={() => {}}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}