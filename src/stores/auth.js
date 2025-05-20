// src/stores/auth.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiClient from "@/api";

export const useAuthStore = defineStore("auth", () => {
  // 상태
  const user = ref(null);
  const token = ref(localStorage.getItem("auth-token") || null);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value && user.value.role === "admin");

  // Actions
  // 사용자 정보 로드
  const loadUser = async () => {
    if (!token.value) return;

    try {
      loading.value = true;
      error.value = null;

      // 현재 토큰으로 사용자 정보 가져오기
      const response = await apiClient.get("/members/current");
      user.value = response.data;
      console.log("사용자 정보 로드됨:", user.value);

      return user.value;
    } catch (err) {
      console.error("사용자 정보 로드 실패:", err);
      error.value = "사용자 정보를 불러오는데 실패했습니다.";
      logout();
      return null;
    } finally {
      loading.value = false;
    }
  };

  // 로그인
  async function login(credentials) {
    try {
      loading.value = true;
      error.value = null;

      console.log("로그인 시도:", credentials.id);
      const response = await apiClient.post("/members/login", credentials);

      console.log("로그인 응답:", response.data);

      // 토큰 저장
      token.value = response.data.token || "";
      localStorage.setItem("auth-token", token.value);

      // 사용자 정보 저장
      user.value = response.data.user || response.data;

      console.log("로그인 성공 - 사용자:", user.value);
      return true;
    } catch (err) {
      console.error("로그인 실패:", err);
      error.value = err.response?.data?.message || "로그인에 실패했습니다.";
      return false;
    } finally {
      loading.value = false;
    }
  }

  // 로그아웃
  const logout = async () => {
    try {
      if (token.value) {
        // 백엔드에 로그아웃 요청 (선택적)
        await apiClient.get("/members/logout");
      }
    } catch (err) {
      console.error("로그아웃 처리 중 오류:", err);
    } finally {
      // 상태 초기화
      user.value = null;
      token.value = null;
      localStorage.removeItem("auth-token");
    }
  };

  return {
    // 상태
    user,
    token,
    loading,
    error,
    // Getters
    isAuthenticated,
    isAdmin,
    // Actions
    loadUser,
    login,
    logout,
  };
});
