import React from "react";
import { Link } from "react-router-dom";
import {
  Movie,
  ConfirmationNumber,
  CreditCard,
  LocationOn,
  EventSeat,
  FlashOn,
  LocalOffer,
} from "@material-ui/icons";
import HeadsetMicIcon from "@material-ui/icons/HeadsetMic";

import "./style.css";

export default function Aboutus() {
  return (
    <main className="about-page" id="vechungtoi">
      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero__overlay" />
        <div className="container about-hero__content">
          <p className="about-badge">Cinema Viet Nam</p>
          <h1 className="about-title">Về chúng tôi</h1>
          <p className="about-subtitle">
            Nền tảng đặt vé xem phim trực tuyến: chọn suất chiếu, chọn ghế, thanh
            toán, nhận vé &amp; email xác nhận — nhanh, tiện và an toàn.
          </p>

          <div className="about-cta">
            <Link to="/lichchieu" className="btn btn-warning mr-2">
              Xem lịch chiếu
            </Link>
            <Link to="/tintuc" className="btn btn-outline-light">
              Xem tin tức
            </Link>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="about-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h2 className="about-h2">Trải nghiệm điện ảnh theo cách hiện đại</h2>
              <p className="about-text">
                Cinema Viet Nam tập trung vào trải nghiệm đặt vé trực tuyến đơn
                giản, minh bạch và ổn định: từ danh sách phim, lịch chiếu theo
                rạp/cụm rạp, đến chọn ghế theo thời gian thực.
              </p>
              <p className="about-text">
                An toàn - tiện lợi - giá ưu đãi.
              </p>

              <div className="about-bullets">
                <div className="about-bullet">
                  <Movie className="about-icon" />
                  <div>
                    <div className="about-bullet__title">Danh sách phim</div>
                    <div className="about-bullet__desc">
                      Đang chiếu / sắp chiếu, chi tiết phim, trailer.
                    </div>
                  </div>
                </div>
                <div className="about-bullet">
                  <ConfirmationNumber className="about-icon" />
                  <div>
                    <div className="about-bullet__title">Đặt vé &amp; chọn ghế</div>
                    <div className="about-bullet__desc">
                      Chọn ghế, kiểm tra ghế đã đặt, xem vé đã mua.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="about-card about-card--image">
                <img
                  src={process.env.PUBLIC_URL + "/img/logo.png"}
                  alt="Cinema"
                />
                <div className="about-card__caption text-center">
                  Nền tảng uy tín chất lượng
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      {/* FEATURES */}
      <section className="about-section about-section--muted">
        <div className="container">
          <h2 className="about-h2 text-center">Điểm nổi bật</h2>
          <p className="about-text text-center about-text--center">
            Những tiện ích giúp bạn đặt vé nhanh, chọn ghế dễ và theo dõi ưu đãi thuận tiện.
          </p>

          <div className="row mt-4">
            <div className="col-md-6 col-lg-4 mb-4">
              <div className="about-feature">
                <CreditCard className="about-feature__icon" />
                <h3 className="about-feature__title">Thanh toán online tiện lợi</h3>
                <p className="about-feature__desc">
                  Thanh toán nhanh chóng, an toàn. Xác nhận vé ngay sau khi hoàn tất giao dịch.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 mb-4">
              <div className="about-feature">
                <EventSeat className="about-feature__icon" />
                <h3 className="about-feature__title">Chọn ghế trực quan</h3>
                <p className="about-feature__desc">
                  Sơ đồ ghế rõ ràng, ghế đã đặt được đánh dấu. Chọn chỗ ngồi yêu thích chỉ với vài thao tác.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 mb-4">
              <div className="about-feature">
                <FlashOn className="about-feature__icon" />
                <h3 className="about-feature__title">Đặt vé nhanh trong 1 phút</h3>
                <p className="about-feature__desc">
                  Chọn phim – suất chiếu – ghế ngồi, hoàn tất đặt vé gọn gàng, không rườm rà.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 mb-4">
              <div className="about-feature">
                <ConfirmationNumber className="about-feature__icon" />
                <h3 className="about-feature__title">Vé điện tử &amp; lịch sử đặt vé</h3>
                <p className="about-feature__desc">
                  Xem lại vé đã mua, thông tin rạp/phòng chiếu và thời gian xem phim bất cứ lúc nào.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 mb-4">
              <div className="about-feature">
                <LocalOffer className="about-feature__icon" />
                <h3 className="about-feature__title">Tin tức &amp; ưu đãi mới nhất</h3>
                <p className="about-feature__desc">
                  Cập nhật lịch chiếu, khuyến mãi và sự kiện phim hot để bạn không bỏ lỡ ưu đãi.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 mb-4">
              <div className="about-feature">
                <HeadsetMicIcon className="about-feature__icon" />
                <h3 className="about-feature__title">Hỗ trợ khách hàng</h3>
                <p className="about-feature__desc">
                  Hỗ trợ qua hotline/email khi cần tra cứu vé hoặc giải đáp thắc mắc.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="about-section">
        <div className="container">
          <h2 className="about-h2">Cách đặt vé online</h2>
          <div className="row mt-4">
            <div className="col-md-6 col-lg-3 mb-3">
              <div className="about-step">
                <div className="about-step__num">1</div>
                <div className="about-step__title">Chọn phim</div>
                <div className="about-step__desc">Xem danh sách &amp; chi tiết phim.</div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3 mb-3">
              <div className="about-step">
                <div className="about-step__num">2</div>
                <div className="about-step__title">Chọn rạp &amp; suất</div>
                <div className="about-step__desc">Chọn lịch chiếu phù hợp.</div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3 mb-3">
              <div className="about-step">
                <div className="about-step__num">3</div>
                <div className="about-step__title">Chọn ghế</div>
                <div className="about-step__desc">Ghế đã đặt sẽ được khóa.</div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3 mb-3">
              <div className="about-step">
                <div className="about-step__num">4</div>
                <div className="about-step__title">Thanh toán</div>
                <div className="about-step__desc">VNPay → nhận vé &amp; email.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="about-section about-section--contact">
        <div className="container">
          <div className="about-contact">
            <div className="about-contact__left">
              <h2 className="about-h2">Liên hệ</h2>
              <p className="about-text">
                Bạn cần hỗ trợ về đặt vé, lịch chiếu hoặc tài khoản? Liên hệ với
                chúng tôi theo thông tin bên dưới.
              </p>

              <div className="about-contact__item">
                <HeadsetMicIcon className="about-contact__icon" />
                <div>
                  <div className="about-contact__label">Hotline</div>
                  <div className="about-contact__value">19002099</div>
                </div>
              </div>

              <div className="about-contact__item">
                <LocationOn className="about-contact__icon" />
                <div>
                  <div className="about-contact__label">Địa chỉ</div>
                  <div className="about-contact__value">
                    Tầng 11, Tòa nhà Hồng Hà Building, Lý Thường Kiệt, Hoàn Kiếm,
                    Hà Nội
                  </div>
                </div>
              </div>

              <div className="about-contact__actions">
                <a className="btn btn-outline-light mr-2" href="mailto:cskh@cinema.vn">
                  Email hỗ trợ
                </a>
                <Link className="btn btn-warning" to="/taikhoan">
                  Trang tài khoản
                </Link>
              </div>
            </div>

            <div className="about-contact__right">
              <div className="about-mini-card">
                <div className="about-mini-card__title">Giờ làm việc</div>
                <div className="about-mini-card__value">9:00 – 22:00</div>
                <div className="about-mini-card__hint">(Tất cả các ngày, kể cả Lễ/Tết)</div>
              </div>
              <div className="about-mini-card">
                <div className="about-mini-card__title">Kênh hỗ trợ</div>
                <div className="about-mini-card__value">cskh@cinema.vn</div>
                <div className="about-mini-card__hint">Phản hồi trong giờ làm việc</div>
              </div>
              <div className="about-mini-card">
                <div className="about-mini-card__title">Gợi ý nhanh</div>
                <div className="about-mini-card__hint">
                  Nếu không đăng nhập được, hãy thử đăng xuất → đăng nhập lại để
                  làm mới token.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
