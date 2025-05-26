import apiClient from "./index";

export default {
  // 게시글 목록 조회
  getPlanBoards(params) {
    return apiClient.get("/planboards", { params });
  },

  // 게시글 상세 조회
  getPlanBoardDetail(pboardNo) {
    return apiClient.get(`/planboards/${pboardNo}`);
  },

  // 게시글 작성
  createPlanBoard(planBoardData) {
    return apiClient.post("/planboards", planBoardData);
  },

  // 게시글 수정
  updatePlanBoard(pboardNo, planBoardData) {
    return apiClient.put(`/planboards/${pboardNo}`, planBoardData);
  },

  // 게시글 삭제
  deletePlanBoard(pboardNo) {
    return apiClient.delete(`/planboards/${pboardNo}`);
  },

  // 댓글 목록 조회
  getComments(pboardNo) {
    return apiClient.get(`/planboards/${pboardNo}/comments`);
  },

  // 댓글 작성
  createComment(pboardNo, commentData) {
    return apiClient.post(`/planboards/${pboardNo}/comments`, commentData);
  },

  // 댓글 수정
  updateComment(commentId, commentData) {
    return apiClient.put(`/planboards/comments/${commentId}`, commentData);
  },

  // 댓글 삭제
  deleteComment(commentId) {
    return apiClient.delete(`/planboards/comments/${commentId}`);
  },

  // 좋아요 토글
  toggleLike(pboardNo) {
    return apiClient.post(`/planboards/${pboardNo}/likes`);
  },

  // 인기 태그 목록 조회
  getPopularTags(limit = 10) {
    return apiClient.get(`/planboards/tags/popular`, { params: { limit } });
  },

  // 추천 게시글 목록 조회
  getFeaturedPlanBoards(limit = 6) {
    return apiClient.get(`/planboards/featured`, { params: { limit } });
  },

  // 인기 게시글 목록 조회
  getPopularPlanBoards(limit = 6) {
    return apiClient.get(`/planboards/popular`, { params: { limit } });
  },
};
