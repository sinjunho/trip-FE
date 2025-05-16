// src/stores/auth.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(localStorage.getItem("token"));
  const loading = ref(false);
  const error = ref(null);

  const isLoggedIn = computed(() => !!token.value);

  const login = async (credentials) => {
    loading.value = true;
    error.value = null;

    try {
      // TODO: 실제 API 호출로 대체
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error("로그인에 실패했습니다.");
      }

      const data = await response.json();
      token.value = data.token;
      user.value = data.user;
      localStorage.setItem("token", data.token);

      return true;
    } catch (err) {
      error.value = err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };

  const register = async (userData) => {
    loading.value = true;
    error.value = null;

    try {
      // TODO: 실제 API 호출로 대체
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("회원가입에 실패했습니다.");
      }

      return true;
    } catch (err) {
      error.value = err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem("token");
  };

  return {
    user,
    token,
    loading,
    error,
    isLoggedIn,
    login,
    register,
    logout,
  };
});
