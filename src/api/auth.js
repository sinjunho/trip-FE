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
