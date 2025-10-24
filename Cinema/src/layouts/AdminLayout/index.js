
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
      <TopBar onMobileNavOpen={() => setMobileNavOpen(true)} />
      <div className="row">
        <div style={{ width: 255 }}>
          <NavBar
            onMobileClose={() => setMobileNavOpen(false)}
            openMobile={isMobileNavOpen}
          />
        </div>
        <div className='content-admin' style={{ width: isMobile ? "100%" : "calc(100% - 255px)" }}>
          {props.children}
        </div>
      </div>
    </SnackbarProvider>
  )
}

