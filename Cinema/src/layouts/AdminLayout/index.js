
import React, { useState } from 'react';

import { SnackbarProvider } from 'notistack';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useSelector } from "react-redux";

import NavBar from './NavBar';
import TopBar from './TopBar';

export default function AdminLayout(props) {
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');
  const { currentUser } = useSelector((state) => state.authReducer);
  if (currentUser?.maLoaiNguoiDung !== "QuanTri") {
    return <>{props.children}</>
  }
  return (
    <SnackbarProvider maxSnack={3}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden"
      }}>
        {/* TOP BAR */}
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          height: 64, // chiều cao top bar
          background: "#001529"
        }}>
          <TopBar onMobileNavOpen={() => setMobileNavOpen(true)} />
        </div>

        {/* MAIN BODY */}
        <div style={{
          display: "flex",
          flex: 1,
          marginTop: 64, // tránh đè lên TopBar
          height: "calc(100vh - 64px)"
        }}>
          {/* NAVBAR */}
          <div style={{
            width: 255,
            position: "fixed",
            top: 64, // dưới TopBar
            bottom: 0,
            left: 0,
            background: "#001529",
            overflowY: "auto"
          }}>
            <NavBar
              onMobileClose={() => setMobileNavOpen(false)}
              openMobile={isMobileNavOpen}
            />
          </div>

          {/* CONTENT */}
          <div style={{
            marginLeft: 255,
            flex: 1,
            height: "calc(100vh - 64px)",
            overflowY: "auto",
            background: "#f4f6f8",
            padding: "20px"
          }}>
            {props.children}
          </div>
        </div>
      </div>
    </SnackbarProvider>

  )
}

