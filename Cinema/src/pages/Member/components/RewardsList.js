import React from "react";

const MOCK_REWARDS = [
  { id: 1, title: "Combo Bắp + Nước", points: 100 },
  { id: 2, title: "Voucher 50k", points: 500 },
  { id: 3, title: "Vé 2D miễn phí", points: 800 },
];

export default function RewardsList({ points = 0, onRefresh = () => {} }) {
  return (
    <div>
      <div style={{ marginBottom: 8, color: "#fff"}}>Bạn có <strong>{(points || 0).toLocaleString()}</strong> điểm.</div>
      <div className="rewards-list">
        {MOCK_REWARDS.map(r => (
          <div className="reward-card" key={r.id}>
            <h4>{r.title}</h4>
            <p>Giá: {r.points} điểm</p>
            <button
              onClick={() => {
                alert(`Yêu cầu đổi "${r.title}" (demo). Nếu muốn thực hiện thực tế, gọi API đổi quà ở đây.`);
                onRefresh();
              }}
            >
              Đổi quà
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
