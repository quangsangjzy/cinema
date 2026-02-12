import React from "react";

export default function HistoryTable({ orders = [] }) {
  if (!orders || orders.length === 0) {
    return <div className="history-table"><div className="history-empty">Chưa có giao dịch nào.</div></div>;
  }

  return (
    <div className="history-table">
      <h2 className="font-weight-bold">Lịch sử</h2>
      <table>
        <thead>
          <tr>
            <th>Ngày</th>
            <th>Phim</th>
            <th>Rạp</th>
            <th>Ghế</th>
            <th>Tổng tiền</th>
            <th>Điểm</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{new Date(o.date).toLocaleDateString()}</td>
              <td>{o.movie}</td>
              <td>{o.theater}</td>
              <td>{o.seats.join(", ")}</td>
              <td>{o.amount.toLocaleString()} VND</td>
              <td>{o.pointsEarned}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
