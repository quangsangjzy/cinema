import { useState, useEffect } from "react";
import * as api from "../api/memberApi";
import { useDispatch } from "react-redux";

export default function useMember() {
  const dispatch = useDispatch();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [points, setPoints] = useState(0);
  const [error, setError] = useState(null);
  

  const load = async () => {
    dispatch({ type: "SET_LOADING_BACK_TO_HOME", payload: true });
    try {
      const p = await api.getProfile();
      const o = await api.getOrders();
      const pts = await api.getPoints();
      setProfile(p);
      setOrders(o);
      setPoints(pts);
    } catch (err) {
      setError(err);
    } finally {
       dispatch({ type: "SET_LOADING_BACK_TO_HOME", payload: false });
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { profile, orders, points, error, refetch: load };
}
