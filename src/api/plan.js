// src/api/plan.js
import apiClient from "./index";

export default {
  // 여행 계획 생성
  createPlan(planData) {
    return apiClient.post("/plans", planData);
  },

  // 사용자의 여행 계획 목록 조회
  getUserPlans() {
    return apiClient.get("/plans");
  },

  // 여행 계획 상세 조회
  getPlanDetail(planId) {
    return apiClient.get(`/plans/${planId}`);
  },

  // 여행 계획 수정
  updatePlan(planId, planData) {
    return apiClient.put(`/plans/${planId}`, planData);
  },

  // 여행 계획 삭제
  deletePlan(planId) {
    return apiClient.delete(`/plans/${planId}`);
  },

  // 여행 계획 공유
  sharePlan(planId, email) {
    return apiClient.post(`/plans/${planId}/share`, { email });
  },

  // 공유된 여행 계획 조회
  getSharedPlan(planId) {
    return apiClient.get(`/plans/share/${planId}`);
  },

  // 여행 계획 복사
  copyPlan(planId) {
    return apiClient.post(`/plans/${planId}/copy`);
  },

  // 여행 계획에 사용자 초대
  inviteUser(planId, email) {
    return apiClient.post(`/plans/${planId}/invite`, { email });
  },

  // 여행 계획에 댓글 추가
  addComment(planId, comment) {
    return apiClient.post(`/plans/${planId}/comments`, { content: comment });
  },

  // 여행 계획 댓글 조회
  getComments(planId) {
    return apiClient.get(`/plans/${planId}/comments`);
  },
};
