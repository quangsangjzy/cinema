import React from "react";
import { Redirect, Route, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function UserRoute(props) {
  const { currentUser } = useSelector((state) => state.authReducer);
  const { component: Component, ...rest } = props;
  const location = useLocation();

  return (
    <Route
      {...rest}
      render={(routeProps) => {
        if (currentUser) return <Component {...routeProps} />;
        return (
          <Redirect
            to={{
              pathname: "/login",
              state: location.pathname,
            }}
          />
        );
      }}
    />
  );
}
export default UserRoute;