// src/api/auth.js
import apiClient from "./index";

export default {
  login(credentials) {
    return apiClient.post("/members/login", credentials);
  },

  register(userData) {
    return apiClient.post("/members/register", userData);
  },

  logout() {
    // JWT는 클라이언트에서 토큰을 제거함으로써 로그아웃 처리
    localStorage.removeItem("auth-token");
    return Promise.resolve();
  },

  getCurrentUser() {
    return apiClient.get("/members/current");
  },
};

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth-token");
    console.log(`API 요청: ${config.method.toUpperCase()} ${config.url}`);
    console.log("요청 헤더:", config.headers);

    if (token) {
      console.log("인증 토큰이 요청에 포함됨:", token.substring(0, 20) + "...");
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log("인증 토큰 없음 - 권한이 필요한 작업은 실패할 수 있음");
    }

    return config;
  },
  (error) => {
    console.error("API 요청 인터셉터 에러:", error);
    return Promise.reject(error);
  }
);
