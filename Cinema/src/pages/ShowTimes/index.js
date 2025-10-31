import React from "react";
import MovieListNowShowing from "./components/MovieListNowShowing";
import MovieListComingSoon from "./components/MovieListComingSoon";

export default function ShowTimes() {
  return (
    <>
      <MovieListNowShowing />
      <MovieListComingSoon />
    </>
  );
}
