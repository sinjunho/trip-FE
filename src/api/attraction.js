// src/api/attraction.js
import apiClient from "./index";

export default {
  // 키워드 검색 함수 추가
  searchAttractions(params) {
    return apiClient.get("/attractions/search", { params });
  },

  // 관광지 목록 조회
  getAttractions(params) {
    return apiClient.get("/attractions", { params });
  },

  // 관광지 상세 조회
  getAttractionDetail(id) {
    return apiClient.get(`/attractions/${id}`);
  },

  // 랜덤 관광지 조회
  getRandomAttractions(count = 6) {
    return apiClient.get("/attractions/random", { params: { count } });
  },

  // 인기 관광지 조회
  getTopAttractions() {
    return apiClient.get("/attractions/rank");
  },

  // 관광지 주변 정보 조회
  getNearbyAttractions(id) {
    return apiClient.get(`/attractions/near/${id}`);
  },

  // 콘텐츠 타입 조회
  getContentTypes() {
    return apiClient.get("/attractions/content-types");
  },

  // 시도 목록 조회
  getSido() {
    return apiClient.get("/attractions/sido");
  },

  // 구군 목록 조회
  getGugun(code) {
    return apiClient.get(`/attractions/gugun/${code}`);
  },
};
export const getTopAttractions = () => {
  return apiClient.get("/attractions/rank");
};
