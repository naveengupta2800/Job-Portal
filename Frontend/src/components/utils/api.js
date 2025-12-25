import axios from "axios";

/*
  VITE_API_URL
  Local:    http://localhost:8000
  Deployed: https://your-backend.vercel.app
*/

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // cookies / sessions ke liye
  headers: {
    "Content-Type": "application/json",
  },
});

/* OPTIONAL: error handling (safe hai, rakh sakta hai) */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("API Error:", error.response.data);
    } else {
      console.error("Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
