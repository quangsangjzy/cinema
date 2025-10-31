import React, { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import { getMovieList } from "../../reducers/actions/Movie";
import { getTheaters } from "../../reducers/actions/Theater";
import Carousel from "./Carousel";
import Theaters from "./Theaters";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import CumRapList from "./CumRapList";

export default function Homepage() {
  const dispatch = useDispatch();
  const movieList = useSelector((state) => state.movieReducer.movieList);
  const theaterList = useSelector((state) => state.theaterReducer.theaterList);

  useEffect(() => {
    if (!movieList.length) {
      dispatch(getMovieList());
    }
    if (!theaterList.length) {
      dispatch(getTheaters());
    }
  }, []);

  return (
    <div>
      <Carousel />
      {/* <Showtime />
      <Theaters /> */}
      <CumRapList />
    </div>
  );
}
