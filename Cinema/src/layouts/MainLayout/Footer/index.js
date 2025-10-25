import React from "react";
import useStyles from "./style";
import { Facebook, Instagram, YouTube, MusicNote } from "@material-ui/icons";

export default function Footer() {
  const classes = useStyles();

  return (
    <footer className={classes.footer}>
      {/* ----- TOP SECTION ----- */}
      <div className={classes.footerInner}>
        <div className={classes.footerTop}>
          <div className={classes.footerColumn}>
            <h4 className="text-white">VỀ BHD STAR</h4>
            <div className={classes.line}></div>
            <ul>
              <li>Hệ thống rạp</li>
              <li>Cụm rạp</li>
              <li>Liên hệ</li>
            </ul>
            <img
              src="/img/media/certificate.png"
              alt="Bộ Công Thương"
              className={classes.logoVerify}
            />
          </div>

          <div className={classes.footerColumn}>
            <h4 className="text-white">QUY ĐỊNH & ĐIỀU KHOẢN</h4>
            <div className={classes.line}></div>
            <ul>
              <li>Quy định thành viên</li>
              <li>Điều khoản</li>
              <li>Hướng dẫn đặt vé trực tuyến</li>
              <li>Quy định và chính sách chung</li>
              <li>
                Chính sách bảo vệ thông tin cá nhân của người tiêu dùng
              </li>
            </ul>
          </div>

          <div className={classes.footerColumn}>
            <h4 className="text-white">CHĂM SÓC KHÁCH HÀNG</h4>
            <div className={classes.line}></div>
            <p>
              <strong>Hotline:</strong> 19002099
            </p>
            <p>
              <strong>Giờ làm việc:</strong> 9:00 – 22:00 (Tất cả các ngày bao
              gồm cả Lễ, Tết)
            </p>
            <p>
              <strong>Email hỗ trợ:</strong> cskh@cinema.vn
            </p>
            <p className={classes.socialLabel}>MẠNG XÃ HỘI</p>
            <div className={classes.socialIcons}>
              <Facebook />
              <Instagram />
              <MusicNote />
              <YouTube />
            </div>
          </div>
        </div>

        {/* ----- BOTTOM SECTION ----- */}
        <div className={classes.footerBottom}>
          <img
            src="/img/logo.png"
            alt="logo"
            className={classes.logoBottom}
          />
          <div className={classes.companyInfo}>
            <p>
              <strong>Công ty TNHH MTV Cinema Việt Nam</strong>
            </p>
            <p>
              <strong>Giấy CNĐKDN:</strong> 0104597158. Đăng ký lần đầu ngày 15
              tháng 04 năm 2010
            </p>
            <p>
              <strong>Địa chỉ:</strong> Tầng 11, Tòa nhà Hồng Hà Building, Lý
              Thường Kiệt, Quận Hoàn Kiếm, Hà Nội
            </p>
            <p>
              <strong>Hotline:</strong> 19002099
            </p>
            <p>COPYRIGHT 2010 Cinema Viet Nam. ALL RIGHTS RESERVED</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
