import axios from "axios";
// import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKED_BASE_URL_API, // 🔹 change in prod
  withCredentials: true, // for cookies
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // attach token if needed
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // const message =
    //   error.response?.data?.message || "Something went wrong!";
    // // toast.error(message);
    return Promise.reject(error);
  }
);

export default api;
