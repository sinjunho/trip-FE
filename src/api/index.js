// src/api/index.js
import axios from "axios";

// 기본 API 클라이언트 설정
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 - 인증 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 오류 처리 및 로깅
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 오류 처리 (인증 만료)
    if (error.response && error.response.status === 401) {
      // 인증 만료 처리 로직
      localStorage.removeItem("auth-token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
