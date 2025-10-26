import React, { useEffect, useState } from "react";
import useStyles from "../style";

export default function MovieListNow() {
    const classes = useStyles();
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        fetch(" ")
            .then((res) => res.json())
            .then((data) => setMovies(data.content.slice(0, 12)))
            .catch((err) => console.log(err));
    }, []);

    return (
        <div className={classes.movieGrid}>
            {movies.map((movie) => (
                <div key={movie.maPhim} className={classes.movieCard}>
                    <img src={movie.hinhAnh} alt={movie.tenPhim} />
                    <h5>{movie.tenPhim}</h5>
                    <p>Thể loại: {movie.moTa.slice(0, 50)}...</p>
                    <button className={classes.btnPrimary}>Đặt vé ngay</button>
                </div>
            ))}
        </div>
    );
}
