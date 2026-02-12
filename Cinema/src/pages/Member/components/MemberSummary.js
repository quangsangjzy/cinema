import React from "react";
import { UNKNOW_USER } from "../../../constants/config";

export default function MemberSummary({ profile = {}, points = 0 }) {
  const avatar = profile?.avatar || UNKNOW_USER;
  return (
    <div className="member-summary">
      <div className="ms-left">
        <img className="ms-avatar" src={avatar} alt="avatar" />
        <div>
          <h2>{profile?.name || "Khách"}</h2>
          <div className="ms-tier">Hạng: <strong>{profile?.tier || "Normal"}</strong></div>
          <div style={{ marginTop: 6, color: "#666" }}>
            Tổng chi tiêu: <strong>{(profile?.totalSpent || 0).toLocaleString()} VND</strong>
          </div>
        </div>
      </div>

      <div className="ms-right">
        <div className="ms-points-number">{(points || 0).toLocaleString()}</div>
        <div className="ms-points-label">Điểm tích lũy</div>
      </div>
    </div>
  );
}
