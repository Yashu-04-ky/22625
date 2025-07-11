import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api",
});

instance.interceptors.request.use((req) => {
  console.log("🚀 Outgoing request to:", req.url, "with data:", req.data);
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = token;
  return req;
});

instance.interceptors.response.use(
  (res) => {
    console.log("✅ Response:", res);
    return res;
  },
  (err) => {
    console.error("❌ Error:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default instance;
