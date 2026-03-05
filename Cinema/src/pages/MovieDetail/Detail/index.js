import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "./style.css";
import useStyles from "./style";
import formatDate from "../../../utilities/formatDate";
import getVideoId from "../../../utilities/getVideoIdFromUrlyoutube";
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

  // ✅ Phim sắp chiếu: không cho mua vé / không hiển thị lịch chiếu
  // - Ưu tiên state comingMovie khi điều hướng từ danh sách "Phim sắp chiếu"
  // - Fallback: so sánh ngày khởi chiếu với ngày hiện tại
  const isComingMovie = Boolean(location.state?.comingMovie) ||
    (data?.ngayKhoiChieu ? new Date(data.ngayKhoiChieu) > new Date() : false);

  const trailerId = data?.trailer ? getVideoId(data.trailer) : "";
  const trailerEmbedUrl = trailerId
    ? `https://www.youtube.com/embed/${trailerId}`
    : "";

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
                <div className="movieDetailValue">{data?.tenTheLoai || "—"}</div>
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

            {/* Phim sắp chiếu: chỉ xem thông tin, ẩn các nút mua vé / xem demo */}
            {!isComingMovie && (
              <div className="movieDetailActions">
                <button className={classes.btnMuaVe} onClick={handleBtnMuaVe}>
                  Mua vé
                </button>

                <button className={classes.btnMuaVe} onClick={openModal}>
                  Xem demo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Phim sắp chiếu: không hiển thị lịch chiếu / tab */}
      {!isComingMovie && (
        <div className="movieDetailSchedule">
          <Tap
            data={data}
            maPhim={maPhim}
            onClickBtnMuave={onClickBtnMuave}
            onIncreaseQuantityComment={() => {}}
            isMobile={isMobile}
          />
        </div>
      )}

      {/* Phim sắp chiếu: hiển thị trailer để bớt trống trải */}
      {isComingMovie && (
        <div className="movieDetailTrailer">
          <h3 className="movieDetailTrailerTitle">Trailer</h3>
          {trailerEmbedUrl ? (
            <div className="movieDetailTrailerFrameWrap">
              <iframe
                title="trailer"
                src={trailerEmbedUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="movieDetailTrailerEmpty">
              Trailer đang được cập nhật.
            </div>
          )}
        </div>
      )}
    </div>
  );
}