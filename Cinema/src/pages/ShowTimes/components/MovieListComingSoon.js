import React, { useEffect, useState } from "react";
import useStyles from "../style";

export default function MovieListComing() {
    const classes = useStyles();
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        fetch("https://movieapi.cyberlearn.vn/api/QuanLyPhim/LayDanhSachPhim")
            .then((res) => res.json())
            .then((data) => setMovies(data.content.slice(12, 24)))
            .catch((err) => console.log(err));
    }, []);

    return (
        <div className={classes.movieGrid}>
            {movies.map((movie) => (
                <div key={movie.maPhim} className={classes.movieCard}>
                    <img src={movie.hinhAnh} alt={movie.tenPhim} />
                    <h5>{movie.tenPhim}</h5>
                    <p>Thể loại: {movie.moTa.slice(0, 50)}...</p>
                    <button className={classes.btnPrimary}>Thông tin chi tiết</button>
                </div>
            ))}
        </div>
    );
}
