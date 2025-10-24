import React, { useState, useEffect } from "react";

import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Button from "@material-ui/core/Button";
import "./style.css"

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
            <div className="movie-grid">
                {movieRender?.map((movie) => (
                    <div
                        className="movie-card"
                        key={movie.maPhim}
                        onClick={() => history.push(`/detail/${movie.maPhim}`)}
                    >
                        <img
                            src={movie.hinhAnh}
                            alt={movie.tenPhim}
                            className="movie-poster"
                        />
                        <div className="movie-info">
                            <h4 className="movie-title">{movie.tenPhim}</h4>
                            <p className="movie-date">
                                {movie.ngayKhoiChieu?.slice(0, 10) || "TBA"}
                            </p>
                            <Button
                                variant="contained"
                                color="secondary"
                                className="btn-buy"
                                onClick={(e) => {
                                    e.stopPropagation(); // ngăn click ảnh bị trùng
                                    history.push(`/detail/${movie.maPhim}`);
                                }}
                            >
                                Mua vé
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};