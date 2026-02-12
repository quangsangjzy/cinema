import { useEffect, useState } from "react";
import * as api from "../api/memberApi";

export default function useMember({ enabled = true, user = null } = {}) {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    // Nếu chưa đăng nhập hoặc hook bị tắt -> không gọi API.
    if (!enabled || !user?.taiKhoan) {
      setProfile(null);
      setOrders([]);
      setPoints(0);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const o = await api.getOrders(user);
      const p = await api.getProfile(user, o);
      const pts = api.getPoints(o);
      setProfile(p);
      setOrders(o);
      setPoints(pts);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, user?.taiKhoan]);

  return { profile, orders, points, loading, error, refetch: load };
}
