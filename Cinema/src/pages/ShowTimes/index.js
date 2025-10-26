import React, { useState } from "react";
import MovieListNow from "./components/MovieListNowShowing";
import MovieListComing from "./components/MovieListComingSoon";
import useStyles from "./style";

export default function Showtime() {
  const classes = useStyles();
  const [activeTab, setActiveTab] = useState("now");

  return (
    <div className={classes.showtimePage}>
      <div className={classes.showtimeHeader}>
        <h1>LỊCH CHIẾU PHIM</h1>
        <div className={classes.tabButtons}>
          <button
            className={activeTab === "now" ? "active" : ""}
            onClick={() => setActiveTab("now")}
          >
            🎬 Phim đang chiếu
          </button>
          <button
            className={activeTab === "coming" ? "active" : ""}
            onClick={() => setActiveTab("coming")}
          >
            📅 Phim sắp chiếu
          </button>
        </div>
      </div>

      <div className={classes.showtimeContent}>
        {activeTab === "now" ? <MovieListNow /> : <MovieListComing />}
      </div>
    </div>
  );
}
