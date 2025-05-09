// src/stores/auth.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import router from "@/router";
import apiClient from "@/api";

export const useAuthStore = defineStore("auth", () => {
  // state
  const user = ref(null);
  const token = ref(localStorage.getItem("auth-token") || null);
  const loading = ref(false);
  const error = ref(null);

  // getters
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value && user.value.role === "admin");
  const getUser = computed(() => user.value);

  // actions
  // 사용자 정보 로드
  async function loadUser() {
    if (!token.value) return;

    try {
      loading.value = true;
      // 토큰이 있으면 현재 사용자 정보 조회
      const response = await apiClient.get("/members/current");
      user.value = response.data;
    } catch (err) {
      error.value = "사용자 정보를 불러오는데 실패했습니다.";
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

      // 토큰이 백엔드에서 반환되는 형식에 따라 코드 조정 필요
      token.value = response.data.token || "";
      user.value = response.data;

      // 로컬 스토리지에 토큰 저장
      localStorage.setItem("auth-token", token.value);

      return true;
    } catch (err) {
      error.value = err.response?.data?.message || "로그인에 실패했습니다.";
      return false;
    } finally {
      loading.value = false;
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

  // 로그아웃
  async function logout() {
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

      // 로컬 스토리지에서 토큰 제거
      localStorage.removeItem("auth-token");
    }
  }

  // 회원 정보 수정
  async function updateProfile(userData) {
    try {
      loading.value = true;
      error.value = null;

      const response = await apiClient.put(`/members/${user.value.id}`, userData);
      user.value = response.data;
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || "프로필 업데이트에 실패했습니다.";
      return false;
    } finally {
      loading.value = false;
    }
  }

  // 회원 탈퇴
  async function deleteMember(password) {
    try {
      loading.value = true;
      error.value = null;

      await apiClient.delete(`/members/${user.value.id}`, {
        data: { password },
      });

      // 상태 초기화
      user.value = null;
      token.value = null;
      localStorage.removeItem("auth-token");

      return true;
    } catch (err) {
      error.value = err.response?.data?.message || "회원 탈퇴에 실패했습니다.";
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
    getUser,
    // actions
    loadUser,
    login,
    register,
    logout,
    updateProfile,
    deleteMember,
  };
});
