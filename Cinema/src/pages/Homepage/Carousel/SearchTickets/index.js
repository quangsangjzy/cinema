import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Button from "@material-ui/core/Button";
import "./style.css"
import { shortenTitle } from "../../../../utilities/shortenTitle"
import axiosClient from "../../../../api/axiosClient";

export default function SearchStickets() {
    const { movieList: movieRender, errorMovieList } = useSelector(
        (state) => state.movieReducer
    );

    // ✅ Top 5 theo doanh thu (fallback về 5 phim đầu nếu API lỗi)
    const [topMovies, setTopMovies] = useState([]);
    const [topError, setTopError] = useState(null);
    const fetchedRef = useRef(false);

    useEffect(() => {
        // tránh gọi 2 lần ở React strict mode (dev)
        if (fetchedRef.current) return;
        fetchedRef.current = true;

        (async () => {
            try {
                setTopError(null);
                const res = await axiosClient.get(`/ThongKe/getTopDoanhThu?limit=5&_=${Date.now()}`);
                const list = Array.isArray(res?.data) ? res.data : [];
                setTopMovies(list.slice(0, 5));
            } catch (err) {
                // fallback: dùng movieRender (nếu có) để UI không bị trống
                setTopMovies([]);
                setTopError(err?.response?.data || err?.message || "Lỗi tải top phim");
            }
        })();
    }, []);
    const history = useHistory();
    if (errorMovieList) {
        return <p>{errorMovieList}</p>
    }

    const moviesToRender = (topMovies?.length ? topMovies : (movieRender || []).slice(0, 5));

    return (
        <div className="movie-list-container">
            <h2 className="movie-list-title text-white">TOP PHIM</h2>
            {/* nếu muốn debug nhanh lỗi API top doanh thu */}
            {/* {topError ? <p className="text-white">{String(topError)}</p> : null} */}
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={0}
                slidesPerView={4}
                centeredSlides={false}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                loop={moviesToRender.length >= 5}
                style={{ paddingBottom: "40px" }}
                breakpoints={{
                    0: { slidesPerView: 1, spaceBetween: 10 },       // mobile
                    640: { slidesPerView: 2, spaceBetween: 20 },     // tablet
                    1024: { slidesPerView: 3, spaceBetween: 25 },    // laptop
                    1400: { slidesPerView: 4, spaceBetween: 30 },    // desktop
                }}
            >
                {moviesToRender?.map((movie) => (
                    <SwiperSlide key={movie.maPhim}>
                        <div
                            className="movie-card1"
                            onClick={() => history.push(`/detail/${movie.maPhim}`)}
                        >
                            <img
                                src={movie.hinhAnh}
                                alt={shortenTitle(movie.tenPhim,4)}
                                className="movie-poster"
                            />
                            <div className="movie-info">
                                <h4 className="movie-title">{shortenTitle(movie.tenPhim,4)}</h4>
                                <p className="movie-date">
                                    {movie.ngayKhoiChieu?.slice(0, 10) || "TBA"}
                                </p>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    className="btn-buy"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        history.push(`/detail/${movie.maPhim}`);
                                    }}
                                >
                                    Mua vé
                                </Button>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};