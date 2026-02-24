import axios from "axios";
import { BASE_URL } from "../constants/config";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

axiosClient.interceptors.request.use((config) => {
  const user = localStorage.getItem("user");
  if (user) {
    const { accessToken } = JSON.parse(user);
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default axiosClient;