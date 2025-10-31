import React from "react";
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

export default function SearchStickets() {
    const { movieList: movieRender, errorMovieList } = useSelector(
        (state) => state.movieReducer
    );
    const history = useHistory();
    if (errorMovieList) {
        return <p>{errorMovieList}</p>
    }

    return (
        <div className="movie-list-container">
            <h2 className="movie-list-title text-white">DANH SÁCH PHIM NỔI BẬT</h2>
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={0}
                slidesPerView={4}
                centeredSlides={false}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                loop={true}
                style={{ paddingBottom: "40px" }}
                breakpoints={{
                    0: { slidesPerView: 1, spaceBetween: 10 },       // mobile
                    640: { slidesPerView: 2, spaceBetween: 20 },     // tablet
                    1024: { slidesPerView: 3, spaceBetween: 25 },    // laptop
                    1400: { slidesPerView: 4, spaceBetween: 30 },    // desktop
                }}
            >
                {movieRender?.map((movie) => (
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