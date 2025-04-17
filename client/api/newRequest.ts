import axios from "axios";

const newRequest = axios.create({
  // baseURL: "https://educonnect-unzf.onrender.com/api",
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

newRequest.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("sending request to server with token", config.baseURL);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

newRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    throw error;
  }
);

export default newRequest;
