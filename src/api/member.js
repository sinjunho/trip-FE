// src/api/member.js
import apiClient from "./index";

export default {
  // 로그인
  login(credentials) {
    return apiClient.post("/members/login", credentials);
  },

  // 회원가입
  register(userData) {
    return apiClient.post("/members/register", userData);
  },

  // 로그아웃
  logout() {
    return apiClient.get("/members/logout");
  },

  // 회원 정보 조회
  getMemberInfo(id) {
    return apiClient.get(`/members/${id}`);
  },

  // 회원 정보 수정
  updateMember(id, userData) {
    return apiClient.put(`/members/${id}`, userData);
  },

  // 회원 탈퇴
  deleteMember(id, password) {
    return apiClient.delete(`/members/${id}`, { data: { password } });
  },

  // 회원 목록 조회 (관리자용)
  getMembers(params) {
    return apiClient.get("/members", { params });
  },
};
