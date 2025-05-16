// src/api/board.js
import apiClient from "./index";

export default {
  // 게시글 목록 조회
  getBoards(params) {
    return apiClient.get("/boards", { params });
  },

  // 게시글 상세 조회
  getBoardDetail(bno) {
    return apiClient.get(`/boards/${bno}`);
  },

  // 게시글 작성
  createBoard(boardData) {
    return apiClient.post("/boards", boardData);
  },

  // 게시글 수정
  updateBoard(bno, boardData) {
    return apiClient.put(`/boards/${bno}`, boardData);
  },

  // 게시글 삭제
  deleteBoard(bno) {
    return apiClient.delete(`/boards/${bno}`);
  },
};
