import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  AppBar,
  Badge,
  Box,
  Hidden,
  IconButton,
  Toolbar,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import NotificationsIcon from '@material-ui/icons/NotificationsOutlined';
import InputIcon from '@material-ui/icons/Input';
import Tooltip from '@material-ui/core/Tooltip';
import { useDispatch } from 'react-redux';
import { useHistory } from "react-router-dom";

import { LOGOUT } from '../../reducers/constants/Auth';
import { LOADING_BACKTO_HOME } from '../../reducers/constants/Lazy';
const TopBar = ({
  onMobileNavOpen,
  ...rest
}) => {
  const [notifications] = useState([]);
  const dispatch = useDispatch();
  const history = useHistory();

  const handleClickLogo = () => {
    dispatch({ type: LOADING_BACKTO_HOME })
    setTimeout(() => {
      history.push("/", "")
    }, 50);
  }
  return (
    <AppBar
      elevation={0}
      position="static"
      {...rest}
    >
      <Toolbar>
        <div onClick={handleClickLogo} style={{ cursor: "pointer" }}>
          <img src="https://t3.ftcdn.net/jpg/04/66/39/50/360_F_466395040_mj2YjwJe0qLlRXQk51kg0q8Jw9AwJp5r.jpg" alt="logo" style={{ height: 50 }} />
        </div>
        <Box flexGrow={1} />
        <Hidden mdDown>
          <IconButton color="inherit">
            <Badge
              badgeContent={notifications.length}
              color="primary"
              variant="dot"
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Tooltip title="Đăng xuất">
            <IconButton color="inherit" onClick={() => dispatch({ type: LOGOUT })}>
              <InputIcon />
            </IconButton>
          </Tooltip>
        </Hidden>
        <Hidden lgUp>
          <IconButton
            color="inherit"
            onClick={onMobileNavOpen}
          >
            <MenuIcon />
          </IconButton>
        </Hidden>
      </Toolbar>
    </AppBar>
  );
};
TopBar.propTypes = {
  className: PropTypes.string,
  onMobileNavOpen: PropTypes.func
};

export default TopBar;

