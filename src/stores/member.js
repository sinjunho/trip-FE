// src/stores/member.js
import { defineStore } from "pinia";
import axios from "axios";

export const useMemberStore = defineStore("member", {
  state: () => ({
    currentUser: null,
    isLoggedIn: false,
  }),

  actions: {
    async login(id, password) {
      try {
        const response = await axios.post("/api/members/login", { id, password });
        this.currentUser = response.data;
        this.isLoggedIn = true;
        return true;
      } catch (error) {
        console.error("로그인 실패:", error);
        return false;
      }
    },

    logout() {
      this.currentUser = null;
      this.isLoggedIn = false;
    },
  },
});
