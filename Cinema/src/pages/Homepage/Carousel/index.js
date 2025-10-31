import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import ArrowBackIosRoundedIcon from "@material-ui/icons/ArrowBackIosRounded";
import ArrowForwardIosRoundedIcon from "@material-ui/icons/ArrowForwardIosRounded";
import { useHistory } from "react-router-dom";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import { useDispatch } from "react-redux";
import SearchStickets from "./SearchTickets";
import useStyles from "./styles";
import { LOADING_BACKTO_HOME_COMPLETED } from "../../../reducers/constants/Lazy";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./carousel.css";
import axios from "axios";
import {BASE_URL} from '../../../constants/config'


export default function Carousel() {
  const [banner, setBanner] = useState([]);
  const dispatch = useDispatch();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const history = useHistory();
  const classes = useStyles();

  const settings = {
    dots: true,
    infinite: true,
    autoplaySpeed: 4000,
    autoplay: true,
    speed: 400,
    swipeToSlide: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    dotsClass: "slickdotsbanner",
  };

const getFilmBanner = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/QuanLyPhim/LayDanhSachPhim`);
    const list = res.data || [];

    // 🔹 Danh sách mã phim muốn hiển thị trong slide
    const selectedIds = [1347, 1282, 1322, 1345, 1346];

    // 🔹 Lọc phim theo mã phim
    const filteredList = Array.isArray(list)
      ? list.filter((item) => selectedIds.includes(item?.maPhim))
      : [];

    setBanner(filteredList);
    console.log("✅ Danh sách phim hiển thị slide:", filteredList);
  } catch (err) {
    console.error("❌ Lỗi khi load phim:", err);
  }
};

  useEffect(() => {
    dispatch({ type: LOADING_BACKTO_HOME_COMPLETED });
    getFilmBanner();
  }, []);

  function NextArrow(props) {
    const { onClick } = props;
    return (
      <ArrowForwardIosRoundedIcon
        style={{ right: "15px" }}
        onClick={onClick}
        className={classes.Arrow}
      />
    );
  }

  function PrevArrow(props) {
    const { onClick } = props;
    return (
      <ArrowBackIosRoundedIcon
        style={{ left: "15px" }}
        onClick={onClick}
        className={classes.Arrow}
      />
    );
  }

  return (
    <section id="carousel">
      <Slider {...settings}>
        {banner.map((item, index) => (
          <div key={index}>
            <div
              className="carousel-item"
              style={{
                backgroundImage: `url(${item.hinhAnh})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "100vh",
                position: "relative",
              }}
            >
            </div>
          </div>
        ))}
      </Slider>


      {/* ✅ Form tìm kiếm phim giữ nguyên */}
      <div className="form-search responsive">
        <SearchStickets />
      </div>
    </section>
  );
}
