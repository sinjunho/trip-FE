<!-- src/Views/PlanBoard/PlanBoardSearchView.vue -->
<template>
  <div class="planboard-search-view">
    <div class="container py-4">
      <!-- 검색 헤더 -->
      <div class="search-header">
        <h1 class="mb-3">🌍 여행 공유 게시판 검색</h1>
        <p class="text-muted mb-4">다른 여행자들의 특별한 여행 경험을 찾아보세요</p>
      </div>

      <!-- 고급 검색 폼 -->
      <div class="card mb-4">
        <div class="card-header bg-white">
          <h5 class="mb-0"><i class="fas fa-search me-2"></i>상세 검색</h5>
        </div>
        <div class="card-body">
          <form @submit.prevent="searchPlanBoards">
            <div class="row">
              <!-- 검색어 입력 -->
              <div class="col-md-8">
                <div class="mb-3">
                  <label class="form-label">검색어</label>
                  <div class="input-group">
                    <input
                      type="text"
                      v-model="searchForm.keyword"
                      class="form-control form-control-lg"
                      placeholder="여행지, 제목, 내용을 입력하세요..."
                      @keyup.enter="searchPlanBoards"
                    />
                    <button class="btn btn-primary" type="submit" :disabled="loading">
                      <i class="fas fa-search me-1"></i>
                      <span v-if="loading">검색 중...</span>
                      <span v-else>검색</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 검색 타입 -->
              <div class="col-md-4">
                <div class="mb-3">
                  <label class="form-label">검색 범위</label>
                  <select v-model="searchForm.searchType" class="form-select">
                    <option value="all">전체</option>
                    <option value="title">제목만</option>
                    <option value="content">내용만</option>
                    <option value="writer">작성자만</option>
                    <option value="destination">목적지만</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="row">
              <!-- 여행 테마 -->
              <div class="col-md-3">
                <div class="mb-3">
                  <label class="form-label">여행 테마</label>
                  <select v-model="searchForm.travelTheme" class="form-select">
                    <option value="">전체 테마</option>
                    <option value="힐링">힐링</option>
                    <option value="액티비티">액티비티</option>
                    <option value="문화체험">문화체험</option>
                    <option value="맛집탐방">맛집탐방</option>
                    <option value="자연탐방">자연탐방</option>
                    <option value="도시여행">도시여행</option>
                    <option value="혼자여행">혼자여행</option>
                    <option value="가족여행">가족여행</option>
                    <option value="커플여행">커플여행</option>
                    <option value="친구여행">친구여행</option>
                  </select>
                </div>
              </div>

              <!-- 목적지 -->
              <div class="col-md-3">
                <div class="mb-3">
                  <label class="form-label">목적지</label>
                  <input
                    type="text"
                    v-model="searchForm.destination"
                    class="form-control"
                    placeholder="예: 제주도, 부산"
                  />
                </div>
              </div>

              <!-- 정렬 기준 -->
              <div class="col-md-3">
                <div class="mb-3">
                  <label class="form-label">정렬 기준</label>
                  <select v-model="searchForm.sortBy" class="form-select">
                    <option value="latest">최신순</option>
                    <option value="popular">인기순</option>
                    <option value="likes">좋아요순</option>
                  </select>
                </div>
              </div>

              <!-- 추가 옵션 -->
              <div class="col-md-3">
                <div class="mb-3">
                  <label class="form-label">추가 옵션</label>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      v-model="searchForm.onlyFeatured"
                      id="onlyFeatured"
                    />
                    <label class="form-check-label" for="onlyFeatured"> 추천 게시글만 보기 </label>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- 인기 태그 -->
      <div class="popular-tags mb-4" v-if="popularTags.length > 0">
        <h6 class="mb-3"><i class="fas fa-tags me-2"></i>인기 태그</h6>
        <div class="tags-container">
          <button
            v-for="tag in popularTags"
            :key="tag.tagId"
            class="tag-btn"
            :class="{ active: searchForm.tagName === tag.tagName }"
            @click="searchByTag(tag.tagName)"
          >
            #{{ tag.tagName }}
            <span class="tag-count">({{ tag.useCount }})</span>
          </button>
        </div>
      </div>

      <!-- 검색 결과 헤더 -->
      <div class="search-results-header" v-if="searched">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h4 class="mb-1">
              검색 결과
              <span class="text-muted">({{ totalCount }}개)</span>
            </h4>
            <p class="text-muted mb-0" v-if="searchForm.keyword">
              '<strong>{{ searchForm.keyword }}</strong
              >' 검색 결과
            </p>
          </div>
          <div class="d-flex align-items-center gap-3">
            <router-link to="/planboard/write" class="btn btn-success" v-if="isLoggedIn">
              <i class="fas fa-pen me-1"></i>새 글 작성
            </router-link>
            <router-link to="/planboard" class="btn btn-outline-secondary">
              <i class="fas fa-list me-1"></i>전체 목록
            </router-link>
          </div>
        </div>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem">
          <span class="visually-hidden">검색 중...</span>
        </div>
        <p class="mt-3 text-muted">여행 정보를 검색하는 중...</p>
      </div>

      <!-- 검색 결과 없음 -->
      <div v-else-if="searched && (!planBoards || planBoards.length === 0)" class="empty-results">
        <div class="text-center py-5">
          <div class="empty-icon">
            <i class="fas fa-search"></i>
          </div>
          <h3 class="mb-3">검색 결과가 없습니다</h3>
          <p class="text-muted mb-4">다른 검색어를 시도하거나 검색 조건을 변경해보세요.</p>
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-outline-primary" @click="clearSearch">
              <i class="fas fa-times me-1"></i>검색 초기화
            </button>
            <router-link to="/planboard" class="btn btn-primary">
              <i class="fas fa-list me-1"></i>전체 목록 보기
            </router-link>
          </div>
        </div>
      </div>

      <!-- 검색 결과 목록 -->
      <div v-else-if="planBoards && planBoards.length > 0" class="search-results">
        <div class="row">
          <div v-for="planBoard in planBoards" :key="planBoard.pboardNo" class="col-lg-6 col-xl-4 mb-4">
            <div class="planboard-card" @click="goToDetail(planBoard.pboardNo)">
              <!-- 추천 배지 -->
              <div v-if="planBoard.isFeatured" class="featured-badge">
                <i class="fas fa-star"></i>
                추천
              </div>

              <!-- 썸네일 이미지 -->
              <div class="card-image">
                <img
                  :src="planBoard.thumbnailImage || getDefaultImage(planBoard.travelTheme)"
                  :alt="planBoard.title"
                  @error="handleImageError"
                />
                <div class="image-overlay">
                  <div class="travel-info">
                    <span class="travel-theme" v-if="planBoard.travelTheme">
                      {{ planBoard.travelTheme }}
                    </span>
                    <span class="travel-duration" v-if="planBoard.travelDuration">
                      {{ planBoard.travelDuration }}일
                    </span>
                  </div>
                </div>
              </div>

              <!-- 카드 내용 -->
              <div class="card-content">
                <h5 class="card-title">{{ planBoard.title }}</h5>

                <div class="travel-summary" v-if="planBoard.travelTitle">
                  <h6 class="travel-title">
                    <i class="fas fa-route me-1"></i>
                    {{ planBoard.travelTitle }}
                  </h6>
                </div>

                <div class="travel-details">
                  <div class="travel-destination" v-if="planBoard.travelDestinations">
                    <i class="fas fa-map-marker-alt text-danger me-1"></i>
                    {{ planBoard.travelDestinations }}
                  </div>

                  <div class="travel-dates" v-if="planBoard.startDate && planBoard.endDate">
                    <i class="fas fa-calendar-alt text-primary me-1"></i>
                    {{ formatDateRange(planBoard.startDate, planBoard.endDate) }}
                  </div>

                  <div class="travel-participants" v-if="planBoard.participantCount">
                    <i class="fas fa-users text-success me-1"></i>
                    {{ planBoard.participantCount }}명
                  </div>
                </div>

                <!-- 태그 -->
                <div class="card-tags" v-if="planBoard.tagNames">
                  <span
                    v-for="tag in planBoard.tagNames.split(',')"
                    :key="tag"
                    class="tag-small"
                    @click.stop="searchByTag(tag.trim())"
                  >
                    #{{ tag.trim() }}
                  </span>
                </div>

                <!-- 카드 푸터 -->
                <div class="card-footer">
                  <div class="author-info">
                    <img
                      :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        planBoard.writer
                      )}&background=random`"
                      :alt="planBoard.writer"
                      class="author-avatar"
                    />
                    <div class="author-details">
                      <span class="author-name">{{ planBoard.writer }}</span>
                      <span class="post-date">{{ formatDate(planBoard.regDate) }}</span>
                    </div>
                  </div>

                  <div class="card-stats">
                    <span class="stat-item" :class="{ liked: planBoard.isLiked }">
                      <i class="fas fa-heart"></i>
                      {{ planBoard.likeCount }}
                    </span>
                    <span class="stat-item">
                      <i class="fas fa-comment"></i>
                      {{ planBoard.commentCount }}
                    </span>
                    <span class="stat-item">
                      <i class="fas fa-eye"></i>
                      {{ planBoard.viewCnt }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 페이지네이션 -->
        <div v-if="totalPages > 1" class="pagination-section">
          <nav aria-label="검색 결과 페이지네이션">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                  <i class="fas fa-chevron-left"></i>
                </a>
              </li>
              <li v-for="page in displayPages" :key="page" class="page-item" :class="{ active: page === currentPage }">
                <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                  <i class="fas fa-chevron-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <!-- 추천 검색어 (검색 전에만 표시) -->
      <div v-if="!searched" class="recommended-searches">
        <h5 class="mb-3"><i class="fas fa-lightbulb me-2"></i>추천 검색어</h5>
        <div class="recommended-items">
          <button
            v-for="keyword in recommendedKeywords"
            :key="keyword"
            class="btn btn-outline-primary btn-sm me-2 mb-2"
            @click="quickSearch(keyword)"
          >
            {{ keyword }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import planBoardAPI from "@/api/planboard";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 상태 관리
const loading = ref(false);
const searched = ref(false);
const planBoards = ref([]);
const popularTags = ref([]);
const currentPage = ref(1);
const totalCount = ref(0);
const totalPages = ref(0);

// 검색 폼
const searchForm = ref({
  keyword: "",
  searchType: "all",
  travelTheme: "",
  destination: "",
  sortBy: "latest",
  onlyFeatured: false,
  tagName: "",
});

// 추천 검색어
const recommendedKeywords = ref([
  "제주도",
  "부산",
  "서울",
  "경주",
  "강릉",
  "여수",
  "힐링여행",
  "맛집여행",
  "가족여행",
  "혼자여행",
  "커플여행",
]);

// 계산된 속성
const isLoggedIn = computed(() => authStore.isAuthenticated);

const displayPages = computed(() => {
  const pages = [];
  const maxDisplayPages = 5;
  let startPage = Math.max(1, currentPage.value - Math.floor(maxDisplayPages / 2));
  let endPage = Math.min(totalPages.value, startPage + maxDisplayPages - 1);

  if (endPage - startPage + 1 < maxDisplayPages) {
    startPage = Math.max(1, endPage - maxDisplayPages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
});

// 메서드
const searchPlanBoards = async () => {
  if (
    !searchForm.value.keyword &&
    !searchForm.value.travelTheme &&
    !searchForm.value.destination &&
    !searchForm.value.tagName
  ) {
    alert("검색어를 입력하거나 검색 조건을 선택해주세요.");
    return;
  }

  try {
    loading.value = true;
    currentPage.value = 1;

    const params = {
      key: searchForm.value.searchType === "all" ? null : searchForm.value.searchType,
      word: searchForm.value.keyword || null,
      currentPage: currentPage.value,
      travelTheme: searchForm.value.travelTheme || null,
      destination: searchForm.value.destination || null,
      sortBy: searchForm.value.sortBy,
      onlyFeatured: searchForm.value.onlyFeatured,
      tagName: searchForm.value.tagName || null,
    };

    const response = await planBoardAPI.getPlanBoards(params);

    planBoards.value = response.data.list || [];
    totalCount.value = response.data.totalCount || 0;
    totalPages.value = response.data.totalPages || 0;

    searched.value = true;

    // URL 업데이트
    updateURL();
  } catch (error) {
    console.error("검색 중 오류 발생:", error);
    alert("검색 중 오류가 발생했습니다. 다시 시도해주세요.");
  } finally {
    loading.value = false;
  }
};

const loadPopularTags = async () => {
  try {
    const response = await planBoardAPI.getPopularTags(10);
    popularTags.value = response.data || [];
  } catch (error) {
    console.error("인기 태그 로드 중 오류 발생:", error);
  }
};

const searchByTag = (tagName) => {
  searchForm.value.tagName = tagName;
  searchForm.value.keyword = "";
  searchPlanBoards();
};

const quickSearch = (keyword) => {
  searchForm.value.keyword = keyword;
  searchForm.value.searchType = "all";
  searchPlanBoards();
};

const clearSearch = () => {
  searchForm.value = {
    keyword: "",
    searchType: "all",
    travelTheme: "",
    destination: "",
    sortBy: "latest",
    onlyFeatured: false,
    tagName: "",
  };

  planBoards.value = [];
  searched.value = false;
  currentPage.value = 1;
  totalCount.value = 0;
  totalPages.value = 0;

  // URL 초기화
  router.push({ path: "/planboard/search" });
};

const changePage = async (page) => {
  if (page < 1 || page > totalPages.value) return;

  currentPage.value = page;
  await searchPlanBoards();

  // 페이지 상단으로 스크롤
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const goToDetail = (pboardNo) => {
  router.push(`/planboard/${pboardNo}`);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "오늘";
  if (diffDays === 2) return "어제";
  if (diffDays <= 7) return `${diffDays}일 전`;

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return "";

  const start = new Date(startDate);
  const end = new Date(endDate);

  const startStr = start.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
  const endStr = end.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });

  return `${startStr} ~ ${endStr}`;
};

const getDefaultImage = (theme) => {
  const themeImages = {
    힐링: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    액티비티: "https://images.unsplash.com/photo-1551632811-561732d1e306",
    문화체험: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0",
    맛집탐방: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
    자연탐방: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    도시여행: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f",
  };

  return themeImages[theme] || "https://images.unsplash.com/photo-1517154421773-0529f29ea451";
};

const handleImageError = (event) => {
  event.target.src = "https://images.unsplash.com/photo-1517154421773-0529f29ea451";
};

const updateURL = () => {
  const query = {};

  if (searchForm.value.keyword) query.keyword = searchForm.value.keyword;
  if (searchForm.value.searchType !== "all") query.searchType = searchForm.value.searchType;
  if (searchForm.value.travelTheme) query.travelTheme = searchForm.value.travelTheme;
  if (searchForm.value.destination) query.destination = searchForm.value.destination;
  if (searchForm.value.sortBy !== "latest") query.sortBy = searchForm.value.sortBy;
  if (searchForm.value.onlyFeatured) query.onlyFeatured = "true";
  if (searchForm.value.tagName) query.tagName = searchForm.value.tagName;
  if (currentPage.value > 1) query.page = currentPage.value.toString();

  router.push({ path: "/planboard/search", query });
};

const loadFromURL = () => {
  const query = route.query;

  if (query.keyword) searchForm.value.keyword = query.keyword;
  if (query.searchType) searchForm.value.searchType = query.searchType;
  if (query.travelTheme) searchForm.value.travelTheme = query.travelTheme;
  if (query.destination) searchForm.value.destination = query.destination;
  if (query.sortBy) searchForm.value.sortBy = query.sortBy;
  if (query.onlyFeatured) searchForm.value.onlyFeatured = query.onlyFeatured === "true";
  if (query.tagName) searchForm.value.tagName = query.tagName;
  if (query.page) currentPage.value = parseInt(query.page);

  // URL에 검색 조건이 있으면 자동 검색
  if (Object.keys(query).length > 0) {
    searchPlanBoards();
  }
};

// 라이프사이클
onMounted(() => {
  loadPopularTags();
  loadFromURL();
});

// URL 변경 감지
watch(
  () => route.query,
  () => {
    if (route.name === "planboard-search") {
      loadFromURL();
    }
  }
);
</script>

<style scoped>
.planboard-search-view {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 2rem;
}

.search-header {
  text-align: center;
  margin-bottom: 2rem;
}

.search-header h1 {
  color: #333;
  font-weight: 700;
}

.popular-tags {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  color: #495057;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.tag-btn.active {
  background: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.tag-count {
  color: #6c757d;
  font-size: 0.8rem;
  margin-left: 0.25rem;
}

.search-results-header {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.empty-results {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 4rem;
  color: #dee2e6;
  margin-bottom: 1rem;
}

.planboard-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.planboard-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.featured-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.planboard-card:hover .card-image img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 1rem;
}

.travel-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.travel-theme {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.travel-duration {
  background: rgba(13, 110, 253, 0.8);
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.card-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  margin-bottom: 1rem;
  font-weight: 600;
  line-height: 1.3;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
}

.travel-summary {
  margin-bottom: 1rem;
}

.travel-title {
  color: #0d6efd;
  font-size: 0.9rem;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
}

.travel-details {
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #6c757d;
}

.travel-details > div {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.travel-details > div:last-child {
  margin-bottom: 0;
}

.card-tags {
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.tag-small {
  background: #e9f0ff;
  color: #0d6efd;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.tag-small:hover {
  background: #0d6efd;
  color: white;
  transform: translateY(-1px);
}

.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 500;
  font-size: 0.85rem;
  color: #333;
}

.post-date {
  font-size: 0.75rem;
  color: #6c757d;
}

.card-stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: #6c757d;
  transition: color 0.2s ease;
}

.stat-item.liked {
  color: #e74c3c;
}

.stat-item i {
  width: 12px;
}

.pagination-section {
  margin-top: 3rem;
  padding: 2rem 0;
}

.pagination .page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.pagination .page-link {
  color: #0d6efd;
  border-radius: 8px;
  margin: 0 0.25rem;
  padding: 0.5rem 0.75rem;
}

.recommended-searches {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.recommended-items {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .planboard-search-view {
    padding-bottom: 1rem;
  }

  .container {
    padding: 0 1rem;
  }

  .search-header h1 {
    font-size: 1.75rem;
  }

  .search-results-header .d-flex {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch !important;
  }

  .planboard-card {
    margin-bottom: 1.5rem;
  }

  .card-image {
    height: 160px;
  }

  .card-content {
    padding: 1rem;
  }

  .card-title {
    font-size: 1rem;
  }

  .travel-details {
    font-size: 0.8rem;
  }

  .card-stats {
    gap: 0.5rem;
  }

  .stat-item {
    font-size: 0.75rem;
  }

  .tags-container {
    justify-content: center;
  }

  .tag-btn {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }

  .recommended-items .btn {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .search-header h1 {
    font-size: 1.5rem;
  }

  .card-image {
    height: 140px;
  }

  .card-content {
    padding: 0.75rem;
  }

  .card-title {
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
  }

  .travel-details {
    margin-bottom: 0.75rem;
  }

  .card-footer {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .author-info {
    justify-content: center;
  }

  .card-stats {
    justify-content: center;
  }

  .featured-badge {
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.2rem 0.5rem;
    font-size: 0.7rem;
  }

  .travel-info {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
}

/* 커스텀 스크롤바 */
.planboard-search-view::-webkit-scrollbar {
  width: 8px;
}

.planboard-search-view::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.planboard-search-view::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.planboard-search-view::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 애니메이션 효과 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.planboard-card {
  animation: fadeIn 0.6s ease-out;
}

.planboard-card:nth-child(2) {
  animation-delay: 0.1s;
}

.planboard-card:nth-child(3) {
  animation-delay: 0.2s;
}

.planboard-card:nth-child(4) {
  animation-delay: 0.3s;
}

/* 로딩 애니메이션 */
.spinner-border {
  animation: spinner-border 0.75s linear infinite;
}

@keyframes spinner-border {
  to {
    transform: rotate(360deg);
  }
}

/* 포커스 스타일 개선 */
.form-control:focus,
.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

/* 버튼 호버 효과 */
.btn {
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

/* 태그 호버 애니메이션 */
.tag-small {
  position: relative;
  overflow: hidden;
}

.tag-small::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.tag-small:hover::before {
  left: 100%;
}

/* 카드 그라데이션 효과 */
.planboard-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(13, 110, 253, 0.1), rgba(255, 107, 107, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  border-radius: 15px;
}

.planboard-card:hover::before {
  opacity: 1;
}
</style>
