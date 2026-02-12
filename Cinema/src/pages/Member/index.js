import React from "react";
import { Link, useHistory } from "react-router-dom";
import "./Member.css";
import MembershipTabs from "./components/MembershipTabs";
import useMember from "./hooks/useMember";

export default function MemberPage() {
  const history = useHistory();
  const currentUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  // Hook phải luôn được gọi theo đúng thứ tự ở mọi render.
  // Vì vậy ta gọi useMember ngay từ đầu và dùng `enabled` để bật/tắt việc gọi API.
  const enabled = Boolean(currentUser?.taiKhoan);

  const { profile, orders, points, loading, error, refetch } = useMember({
    enabled,
    user: currentUser,
  });

  // Chưa đăng nhập: hiển thị lời nhắc + nút điều hướng tới đăng nhập.
  if (!enabled) {
    return (
      <div className="member-page">
        <div className="member-container">
          <div className="member-need-login">
            <div className="mnl-title">Trang Thành viên</div>
            <div className="mnl-desc">
              Vui lòng <strong>đăng nhập</strong> để xem thẻ thành viên, hạng và lịch sử giao dịch.
            </div>
            <button
              type="button"
              className="mnl-btn"
              onClick={() => history.push("/login")}
            >
              Đi tới Đăng nhập
            </button>
            <div className="mnl-link">
              Chưa có tài khoản? <Link to="/signUp">Đăng ký</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }


  if (loading) {
    return (
      <div className="member-page">
        <div className="member-container">
          <div className="member-loading">Đang tải thông tin thành viên...</div>
        </div>
      </div>
    );
  }

  if (error) return <div className="member-error">Lỗi: {error.message}</div>;

  return (
    <div className="member-page">
      <div className="member-container">
        <MembershipTabs
          profile={profile}
          orders={orders}
          points={points}
          onRefresh={refetch}
        />
      </div>
    </div>
  );
}
