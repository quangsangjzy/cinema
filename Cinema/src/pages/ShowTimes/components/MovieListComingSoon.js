import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { BASE_URL } from "../../../constants/config";
import "./style.css";
import { shortenTitle } from "../../../utilities/shortenTitle";

export default function MovieListNowShowing() {
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const history = useHistory();

  const [moviesPerPage, setMoviesPerPage] = useState(15);

  useEffect(() => {
    const fetchNowShowing = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/QuanLyPhim/LayDanhSachPhim`);
        const list = Array.isArray(res.data) ? res.data : [];

        const today = new Date();
        const filtered = list.filter((movie) => {
          if (!movie.ngayKhoiChieu) return false;
          const date = new Date(movie.ngayKhoiChieu);
          return date > today;
        });

        setMovies(filtered);
      } catch (err) {
        console.error("❌ Lỗi tải phim:", err);
      }
    };
    fetchNowShowing();
  }, []);

  useEffect(() => {
    const updateMoviesPerPage = () => {
      if (window.innerWidth <= 768) setMoviesPerPage(6);   // mobile: 2 cột × 3 hàng
      else if (window.innerWidth <= 992) setMoviesPerPage(9); // tablet: 3 cột × 3 hàng
      else setMoviesPerPage(15);  // desktop: 5 cột × 3 hàng
    };

    updateMoviesPerPage(); // gọi lần đầu để thiết lập đúng ngay từ khi load
    window.addEventListener("resize", updateMoviesPerPage); // cập nhật khi resize

    return () => window.removeEventListener("resize", updateMoviesPerPage);
  }, []);


  const totalPages = Math.ceil(movies.length / moviesPerPage);
  const startIndex = (currentPage - 1) * moviesPerPage;
  const currentMovies = movies.slice(startIndex, startIndex + moviesPerPage);

  return (
    <div className="movie-section">
      <h2 className="movie-section-title">DANH SÁCH PHIM NỔI BẬT</h2>

      <div className="movie-grid">
        {currentMovies.map((movie) => (
          <div key={movie.maPhim} className="movie-card">
            <img
              src={movie.hinhAnh}
              alt={shortenTitle(movie.tenPhim, 4)}
              className="movie-img"
            />
            <div className="movie-info">
              <h5 className="movie-name">{shortenTitle(movie.tenPhim, 4)}</h5>
              <p className="movie-date">{movie.ngayKhoiChieu?.slice(0, 10)}</p>
              <button
                className="movie-btn"
                onClick={() => history.push(`/detail/${movie.maPhim}`)}
              >
                Mua vé
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        >
          &lt;
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={currentPage === index + 1 ? "active" : ""}
          >
            {index + 1}
          </button>
        ))}
        <button
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((p) => Math.min(p + 1, totalPages))
          }
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
