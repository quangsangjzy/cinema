import React, { memo } from 'react'
import useStyles from './style'

import { useHistory } from "react-router-dom";
import ThoiLuongDanhGia from '../../../../components/ThoiLuongDanhGia/thoiLuongDanhGia'
import { customScrollbar } from '../../../../styles/materialUi'
import { underLine } from '../../../../styles/materialUi'
import LstNgayChieu from './LstNgayChieu/'

function Index(props) {
  const history = useHistory();
  const classes = useStyles({ customScrollbar, underLine });
  console.log("PHIM", props.lstPhim);

  const convertToBase64 = (uint8Array) => {
    let binary = '';
    const length = uint8Array.byteLength;
    for (let i = 0; i < length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  };

  return (
    <div className={classes.lstPhim} hidden={props.hidden}>
      {props.lstPhim.map(phim => (
        <div onClick={() => history.push(`/detail/${phim.maPhim}`)} className={classes.phim} key={phim.maPhim}>
          <div className={classes.phim__info}>
            <img src={phim.hinhAnh} className={classes.phim__img} alt={phim.tenPhim} />
            <div className={classes.phim__text}>
              <p className={classes.phim__text_name}>{phim.tenPhim}</p>
              <ThoiLuongDanhGia maPhim={phim.maPhim} />
            </div>
          </div>
          <div>
            <LstNgayChieu lstLichChieuTheoPhim={phim.lstLichChieuTheoPhim} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(Index);