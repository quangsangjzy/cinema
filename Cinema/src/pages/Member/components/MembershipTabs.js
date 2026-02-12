import React, { useState } from "react";
import MemberSummary from "./MemberSummary";
import HistoryTable from "./HistoryTable";
import ProfileForm from "./ProfileForm";
import RewardsList from "./RewardsList";
import "../Member.css";

export default function MembershipTabs({ profile, orders, points, onRefresh }) {
  const [tab, setTab] = useState("dashboard");

  const tabButton = (id, label) => (
    <button
      className={tab === id ? "active" : ""}
      onClick={() => setTab(id)}
      type="button"
    >
      {label}
    </button>
  );

  return (
    <div className="member-tabs">
      <nav className="member-tabs-nav">
        {tabButton("dashboard", "Tổng quan")}
        {tabButton("rewards", "Điểm & Ưu đãi")}
        {tabButton("profile", "Thông tin")}
      </nav>

      <div className="member-tab-content">
        {tab === "dashboard" && (
          <div className="overview-box">
            <MemberSummary profile={profile} points={points} />
            <HistoryTable orders={orders} />
          </div>
        )}
        {tab === "rewards" && <RewardsList points={points} onRefresh={onRefresh} />}

        {tab === "profile" && <ProfileForm profile={profile} onSaved={onRefresh} />}
      </div>
    </div>
  );
}
