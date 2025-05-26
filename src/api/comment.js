// src/api/comment.js
import apiClient from "./index";

export default {
  // 게시글별 댓글 목록 조회
  getCommentsByBoard(bno) {
    return apiClient.get(`/comments/board/${bno}`);
  },

  // 댓글 작성
  createComment(commentData) {
    return apiClient.post("/comments", commentData);
  },

  // 댓글 수정
  updateComment(commentId, commentData) {
    return apiClient.put(`/comments/${commentId}`, commentData);
  },

  // 댓글 삭제
  deleteComment(commentId) {
    return apiClient.delete(`/comments/${commentId}`);
  },
};
