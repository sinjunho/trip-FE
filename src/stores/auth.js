// src/stores/auth.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiClient from "@/api";

export const useAuthStore = defineStore("auth", () => {
  // 로컬 스토리지에서 기존 토큰과 사용자 정보 가져오기
  const token = ref(localStorage.getItem("auth-token") || null);
  const user = ref(JSON.parse(localStorage.getItem("auth-user")) || null);
  const loading = ref(false);
  const error = ref(null);

  // Computed properties
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value && user.value.role === "admin");

  // 사용자 정보 로드
  async function loadUser() {
    if (!token.value) return;

    try {
      loading.value = true;
      const response = await apiClient.get("/members/current");
      user.value = response.data;
      // 로컬 스토리지에 사용자 정보 저장
      localStorage.setItem("auth-user", JSON.stringify(user.value));
    } catch (err) {
      console.error("사용자 정보 로드 실패:", err);
      logout();
    } finally {
      loading.value = false;
    }
  }

  // 로그인
  async function login(credentials) {
    try {
      loading.value = true;
      error.value = null;

      const response = await apiClient.post("/members/login", credentials);

      token.value = response.data.token;
      user.value = response.data.user || response.data;

      // 로컬 스토리지에 인증 정보 저장
      localStorage.setItem("auth-token", token.value);
      localStorage.setItem("auth-user", JSON.stringify(user.value));

      return true;
    } catch (err) {
      error.value = err.response?.data?.message || "로그인에 실패했습니다.";
      return false;
    } finally {
      loading.value = false;
    }
  }

  // 로그아웃
  async function logout() {
    try {
      if (token.value) {
        await apiClient.get("/members/logout");
      }
    } catch (err) {
      console.error("로그아웃 오류:", err);
    } finally {
      // 상태와 로컬 스토리지 초기화
      token.value = null;
      user.value = null;
      localStorage.removeItem("auth-token");
      localStorage.removeItem("auth-user");
    }
  }

  // 회원가입
  async function register(userData) {
    try {
      loading.value = true;
      error.value = null;

      await apiClient.post("/members/register", userData);
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || "회원가입에 실패했습니다.";
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    // state
    user,
    token,
    loading,
    error,
    // getters
    isAuthenticated,
    isAdmin,
    // actions
    loadUser,
    login,
    logout,
    register,
  };
});
