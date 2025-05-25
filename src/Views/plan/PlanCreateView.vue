<!-- src/views/PlanCreateView.vue -->
<template>
  <div class="plan-create-view">
    <!-- 상단 진행 단계 표시 -->
    <div class="progress-steps">
      <div class="container">
        <div class="steps-container">
          <div class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
            <div class="step-number">1</div>
            <div class="step-title">기본 정보</div>
          </div>
          <div class="step-line" :class="{ completed: currentStep > 1 }"></div>
          <div class="step" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
            <div class="step-number">2</div>
            <div class="step-title">여행지 선택</div>
          </div>
          <div class="step-line" :class="{ completed: currentStep > 2 }"></div>
          <div class="step" :class="{ active: currentStep === 3 }">
            <div class="step-number">3</div>
            <div class="step-title">일정 완성</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 1: 기본 정보 입력 -->
    <div v-if="currentStep === 1" class="container py-4">
      <div class="step-content">
        <div class="card">
          <div class="card-header bg-white">
            <h2 class="mb-0">📝 여행 기본 정보를 입력해주세요</h2>
            <p class="text-muted mb-0">여행의 기본 정보를 설정해보세요</p>
          </div>
          <div class="card-body" style="display: flex;">
            <div class="col-md-8">
                  <div class="mb-4">
                    <label class="form-label"><i class="fas fa-calendar-alt me-2"></i>여행 기간</label>
                    <DateRangePicker
                      :start-date="plan.startDate"
                      :end-date="plan.endDate"
                      @update:start-date="plan.startDate = $event"
                      @update:end-date="plan.endDate = $event"
                      @dates-changed="onDatesChanged"
                    />
                  </div>
                </div>
            <form @submit.prevent="nextStep">
              <div class="row" style="display: flex; width: 950px; margin-top: 3.4%;" >
                <div class="col-md-4">
                  <div class="travel-tips">
                    <h5><i class="fas fa-lightbulb text-warning me-2"></i>여행 계획 팁</h5>
                    <ul class="tips-list">
                      <li>구체적인 제목을 지으면 나중에 찾기 쉬워요</li>
                      <li>여행 기간은 너무 빡빡하지 않게 계획하세요</li>
                      <li>날씨와 계절을 고려해주세요</li>
                      <li>교통편 예약도 미리 확인해보세요</li>
                    </ul>
                  </div>
                  <br />
                  <div class="mb-4" style="margin-top: 100px;">
                    <label for="title" class="form-label"> <i class="fas fa-plane me-2"></i>여행 제목 </label>
                    <input
                      type="text"
                      id="title"
                      v-model="plan.title"
                      class="form-control form-control-lg"
                      placeholder="예: 부산 바다 여행"
                      required
                    />
                  </div>

                  <div class="mb-4">
                    <label for="description" class="form-label">
                      <i class="fas fa-comment-alt me-2"></i>여행 설명
                    </label>
                    <textarea
                      id="description"
                      v-model="plan.description"
                      class="form-control"
                      rows="4"
                      placeholder="어떤 여행인지 간단히 설명해주세요"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-between mt-4" style="width: 300px; ">
                <router-link to="/plans" class="btn btn-outline-secondary">
                  <i class="fas fa-arrow-left me-2"></i>취소
                </router-link>
                <button type="button" class="btn btn-primary" @click="goToNextStep" :disabled="!isStep1Valid">
                  다음 단계 <i class="fas fa-arrow-right ms-2"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: 여행지 선택 (전체화면 지도) -->
    <div v-if="currentStep === 2" class="map-selection-view">
      <!-- 검색 패널 토글 버튼 -->
      <button class="search-panel-toggle" :class="{ active: showSearchPanel }" @click="toggleSearchPanel">
        <i class="fas fa-search"></i>
        <span>검색</span>
      </button>

      <!-- 하단 네비게이션 -->
      <div class="bottom-navigation">
        <button class="step-back-btn" @click="currentStep = 1"><i class="fas fa-arrow-left me-2"></i>이전 단계</button>
        <div class="selected-count">
          선택된 여행지: <span class="count">{{ selectedAttractions.length }}</span
          >개
        </div>
        <button class="step-next-btn" @click="nextStep" :disabled="selectedAttractions.length === 0">
          다음 단계 <i class="fas fa-arrow-right ms-2"></i>
        </button>
      </div>

      
  <!-- 검색 결과 네비게이션 패널 -->
  <div class="search-results-nav" :class="{ show: attractions.length > 0, collapsed: searchResultsCollapsed }">
    <div class="search-results-header" @click="toggleSearchResults">
      <div class="header-content">
        <h5>
          <i class="fas fa-search me-2"></i>
          검색 결과 ({{ totalCount }}개)
        </h5>
        <div class="header-actions">
          <button class="toggle-search-results" :class="{ collapsed: searchResultsCollapsed }">
            <i class="fas fa-chevron-up"></i>
          </button>
          <button class="close-search-results" @click.stop="clearSearchResults">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="search-results-content" :class="{ collapsed: searchResultsCollapsed }">
      <div class="search-results-list">
        <div
          v-for="(attraction, index) in attractions"
          :key="attraction.no"
          class="search-result-item"
          :class="{ selected: selectedAttractions.some((s) => s.no === attraction.no) }"
          @click="selectSearchResult(attraction)"
        >
          <img :src="attraction.firstImage1 || '/img/no-image.jpg'" :alt="attraction.title" class="result-thumb" />
          <div class="result-info">
            <h6 class="result-title">{{ attraction.title }}</h6>
            <p class="result-location">
              <i class="fas fa-map-marker-alt text-danger me-1"></i>
              {{ attraction.sido }} {{ attraction.gugun }}
            </p>
            <div class="result-category" v-if="attraction.contentTypeName">
              {{ attraction.contentTypeName }}
            </div>
          </div>
          <div class="result-actions">
            <button
              v-if="!selectedAttractions.some((s) => s.no === attraction.no)"
              class="btn btn-sm btn-primary add-btn"
              @click.stop="addAttractionToSelection(attraction)"
            >
              <i class="fas fa-plus"></i>
            </button>
            <button v-else class="btn btn-sm btn-success added-btn" disabled>
              <i class="fas fa-check"></i>
            </button>
          </div>
        </div>
      </div>
<!-- 검색 결과 페이지네이션 -->
<div v-if="searchTotalPages > 1" class="search-pagination">
  <button
    class="page-btn"
    :disabled="searchCurrentPage === 1 || searchLoading"
    @click="changeSearchPage(searchCurrentPage - 1)"
  >
    <i class="fas fa-chevron-left"></i>
  </button>

  <span class="page-info"> {{ searchCurrentPage }} / {{ searchTotalPages }} </span>

  <button
    class="page-btn"
    :disabled="searchCurrentPage === searchTotalPages || searchLoading"
    @click="changeSearchPage(searchCurrentPage + 1)"
  >
    <i class="fas fa-chevron-right"></i>
  </button>
</div>

    </div>
  </div>

      <!-- 지도 컨트롤 버튼들 -->
      <div class="map-controls">
        <button class="control-btn" @click="changeMapType" :title="mapTypeTitle">
          <i :class="mapTypeIcon"></i>
        </button>
        <button class="control-btn" @click="toggleTrafficInfo" :class="{ active: showTraffic }" title="교통정보">
          <i class="fas fa-car"></i>
        </button>
      </div>

      <!-- 검색 패널 -->
      <div class="search-panel" :class="{ 'panel-open': showSearchPanel }">
        <div class="search-panel-header">
          <h3>여행지 검색 및 선택</h3>
          <button class="close-panel" @click="showSearchPanel = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="search-panel-content">
          <!-- 현재 위치 버튼 -->
          <div class="search-section">
            <label class="search-label">
              <i class="fas fa-crosshairs"></i>
              내 위치
            </label>
            <button class="current-location-btn-panel" @click="getCurrentLocation" :disabled="loadingLocation">
              <i class="fas fa-crosshairs me-2" v-if="!loadingLocation"></i>
              <i class="fas fa-spinner fa-spin me-2" v-else></i>
              <span v-if="!loadingLocation">현재 위치로 이동</span>
              <span v-else>위치 확인 중...</span>
            </button>
          </div>

          <!-- 키워드 검색 -->
          <div class="search-section priority">
            <label class="search-label">
              <i class="fas fa-search"></i>
              키워드 검색
            </label>
            <div class="search-input-group">
              <input
                type="text"
                v-model="searchKeyword"
                class="search-input"
                placeholder="관광지 이름을 입력하세요"
                @keyup.enter="searchAttractions"
              />
              <button class="search-btn" @click="searchAttractions">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>

          <!-- 카테고리 선택 -->
          <div class="search-section">
            <label class="search-label">
              <i class="fas fa-tags"></i>
              카테고리
            </label>
            <select v-model="searchContentType" class="search-select">
              <option value="">전체 카테고리</option>
              <option v-for="type in contentTypes" :key="type.content_type_id" :value="type.content_type_id">
                {{ type.content_type_name }}
              </option>
            </select>
          </div>

          <!-- 지역 선택 -->
          <div class="search-section">
            <label class="search-label">
              <i class="fas fa-map-marker-alt"></i>
              지역 선택
            </label>
            <select v-model="searchArea" class="search-select" @change="onAreaChange">
              <option value="">전체 지역</option>
              <option v-for="area in areaList" :key="area.sido_code" :value="area.sido_code">
                {{ area.sido_name }}
              </option>
            </select>
          </div>

          <!-- 시군구 선택 -->
          <div class="search-section" v-if="searchArea">
            <label class="search-label">
              <i class="fas fa-building"></i>
              시군구
            </label>
            <select v-model="searchGugun" class="search-select" :disabled="!searchArea">
              <option value="">전체 시군구</option>
              <option v-for="gugun in gugunList" :key="gugun.gugun_code" :value="gugun.gugun_code">
                {{ gugun.gugun_name }}
              </option>
            </select>
          </div>

          <!-- 인기 관광지 -->
          <div class="search-section">
            <label class="search-label">
              <i class="fas fa-fire text-danger"></i>
              인기 관광지
            </label>
            <div v-if="loadingPopular" class="text-center py-3">
              <div class="spinner-border spinner-border-sm text-primary"></div>
            </div>
            <div v-else class="popular-list">
              <div
                v-for="attraction in popularAttractions.slice(0, 5)"
                :key="attraction.no"
                class="popular-item"
                @click="addAttractionToSelection(attraction)"
              >
                <img
                  :src="attraction.firstImage1 || '/img/no-image.jpg'"
                  :alt="attraction.title"
                  class="popular-thumb"
                />
                <div class="popular-info">
                  <h6 class="mb-1">{{ attraction.title }}</h6>
                  <p class="mb-0 text-muted small">{{ attraction.sido }}</p>
                </div>
                <button class="btn btn-sm btn-outline-primary">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- 선택된 관광지 목록 -->
          <div class="search-section" v-if="selectedAttractions.length > 0">
            <label class="search-label">
              <i class="fas fa-check-circle text-success"></i>
              선택된 관광지 ({{ selectedAttractions.length }}개)
            </label>
            <div class="selected-list">
              <div v-for="(attraction, index) in selectedAttractions" :key="attraction.no" class="selected-item">
                <img
                  :src="attraction.firstImage1 || '/img/no-image.jpg'"
                  :alt="attraction.title"
                  class="selected-thumb"
                />
                <div class="selected-info">
                  <h6 class="mb-1">{{ attraction.title }}</h6>
                  <p class="mb-0 text-muted small">{{ attraction.sido }}</p>
                </div>
                <div class="selected-actions">
                  <select v-model="attraction.assignedDay" class="form-select form-select-sm" style="width: 80px">
                    <option value="">일차</option>
                    <option v-for="day in dayCount" :key="day" :value="day">{{ day }}일</option>
                  </select>
                  <button class="btn btn-sm btn-outline-danger ms-2" @click="removeAttraction(index)">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 지도 영역 -->
      <div id="kakao-map" class="map-container"></div>

      <!-- 선택된 관광지 상세 정보 카드 -->
      <div v-if="attractionDetail" class="detail-card">
        <div class="detail-card-header">
          <h4>{{ attractionDetail.title }}</h4>
          <div class="detail-actions-header">
            <button class="action-btn" @click="addAttractionToSelection(attractionDetail)" title="여행지 추가">
              <i class="fas fa-plus"></i>
            </button>
            <button class="close-detail" @click="closeDetail">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div class="detail-card-content">
          <img
            :src="attractionDetail.firstImage1 || '/img/no-image.jpg'"
            :alt="attractionDetail.title"
            class="detail-image"
          />

          <div class="detail-info">
            <p class="detail-location">
              <i class="fas fa-map-marker-alt"></i>
              {{ attractionDetail.sido }} {{ attractionDetail.gugun }}
            </p>

            <p v-if="attractionDetail.addr" class="detail-address">
              <i class="fas fa-home"></i>
              {{ attractionDetail.addr }}
            </p>

            <p v-if="attractionDetail.tel" class="detail-phone">
              <i class="fas fa-phone"></i>
              {{ attractionDetail.tel }}
            </p>
          </div>

          <div class="detail-actions">
            <button class="detail-btn primary" @click="addAttractionToSelection(attractionDetail)">여행지 추가</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 3: 일정 완성 -->
    <div v-if="currentStep === 3" class="container py-4">
      <div class="step-content">
        <div class="card">
          <div class="card-header bg-white">
            <h2 class="mb-0">📅 일정을 완성해주세요</h2>
            <p class="text-muted mb-0">선택한 관광지들을 일차별로 정리하고 세부 시간을 설정하세요</p>
          </div>
          <div class="card-body">
            <!-- 일차별 탭 -->
            <ul class="nav nav-tabs mb-4">
              <li class="nav-item" v-for="day in dayCount" :key="day">
                <button class="nav-link" :class="{ active: activeDay === day }" @click="activeDay = day">
                  {{ day }}일차
                  <span v-if="getDayAttractions(day).length > 0" class="badge bg-primary ms-2">
                    {{ getDayAttractions(day).length }}
                  </span>
                </button>
              </li>
            </ul>

            <!-- 각 일차별 내용 -->
            <div v-for="day in dayCount" :key="day" v-show="activeDay === day">
              <div class="day-header mb-3">
                <h4>{{ day }}일차 - {{ getDayDate(day) }}</h4>
                <button class="btn btn-sm btn-primary" @click="addManualAttraction(day)">
                  <i class="fas fa-plus me-1"></i>직접 추가
                </button>
              </div>

              <div class="day-attractions">
                <draggable
                  :list="getDayAttractions(day)"
                  group="attractions"
                  @end="updateOrder"
                  item-key="no"
                  class="attraction-list"
                  handle=".drag-handle"
                >
                  <template #item="{ element: attraction, index }">
                    <div class="attraction-schedule-item">
                      <div class="drag-handle">
                        <i class="fas fa-grip-vertical"></i>
                      </div>
                      <div class="schedule-content">
                        <div class="row align-items-center">
                          <div class="col-md-3">
                            <img
                              :src="attraction.firstImage1 || '/img/no-image.jpg'"
                              :alt="attraction.title"
                              class="schedule-thumb"
                            />
                          </div>
                          <div class="col-md-5">
                            <h6 class="mb-1">{{ attraction.title }}</h6>
                            <p class="mb-1 text-muted small">
                              <i class="fas fa-map-marker-alt text-danger me-1"></i>
                              {{ attraction.sido }} {{ attraction.gugun }}
                            </p>
                            <div class="form-group">
                              <label class="form-label small">메모</label>
                              <input
                                type="text"
                                v-model="attraction.memo"
                                class="form-control form-control-sm"
                                placeholder="메모를 입력하세요"
                              />
                            </div>
                          </div>
                          <div class="col-md-2">
                            <label class="form-label small">방문 시간</label>
                            <input type="time" v-model="attraction.visitTime" class="form-control form-control-sm" />
                          </div>
                          <div class="col-md-1">
                            <label class="form-label small">소요시간</label>
                            <select v-model="attraction.duration" class="form-select form-select-sm">
                              <option value="30">30분</option>
                              <option value="60">1시간</option>
                              <option value="90">1.5시간</option>
                              <option value="120">2시간</option>
                              <option value="180">3시간</option>
                              <option value="240">4시간</option>
                            </select>
                          </div>
                          <div class="col-md-1">
                            <button class="btn btn-sm btn-outline-danger" @click="removeFromDay(day, index)">
                              <i class="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </draggable>

                <div v-if="getDayAttractions(day).length === 0" class="empty-day">
                  <i class="fas fa-calendar-plus text-muted"></i>
                  <p class="text-muted">이 날에는 아직 계획된 일정이 없습니다.</p>
                  <p class="text-muted small">위에서 선택한 관광지를 드래그하거나 직접 추가해보세요.</p>
                </div>
              </div>
            </div>

            <!-- 미배정 관광지 -->
            <div v-if="unassignedAttractions.length > 0" class="mt-4">
              <h5 class="mb-3">
                <i class="fas fa-question-circle text-warning me-2"></i>
                일차가 정해지지 않은 관광지
              </h5>
              <div class="unassigned-attractions">
                <div
                  v-for="attraction in unassignedAttractions"
                  :key="attraction.no"
                  class="unassigned-item"
                  draggable="true"
                  @dragstart="startDrag(attraction)"
                >
                  <img
                    :src="attraction.firstImage1 || '/img/no-image.jpg'"
                    :alt="attraction.title"
                    class="unassigned-thumb"
                  />
                  <div class="unassigned-info">
                    <h6 class="mb-1">{{ attraction.title }}</h6>
                    <p class="mb-0 text-muted small">{{ attraction.sido }}</p>
                  </div>
                  <select
                    v-model="attraction.assignedDay"
                    class="form-select form-select-sm"
                    style="width: auto"
                    @change="assignToDay(attraction)"
                  >
                    <option value="">일차 선택</option>
                    <option v-for="day in dayCount" :key="day" :value="day">{{ day }}일차</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-between mt-4">
          <button class="btn btn-outline-secondary" @click="currentStep = 2">
            <i class="fas fa-arrow-left me-2"></i>이전 단계
          </button>
          <button class="btn btn-success" @click="savePlan" :disabled="isSaving">
            <span v-if="isSaving">
              <span class="spinner-border spinner-border-sm me-2"></span>
              저장 중...
            </span>
            <span v-else> <i class="fas fa-save me-2"></i>여행 계획 저장 </span>
          </button>
        </div>
      </div>
    </div>

    <!-- 직접 추가 모달 -->
    <div class="modal fade" id="manualAddModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">직접 장소 추가</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addManualPlace">
              <div class="mb-3">
                <label class="form-label">장소명</label>
                <input
                  type="text"
                  v-model="manualPlace.title"
                  class="form-control"
                  placeholder="방문할 장소명을 입력하세요"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">주소</label>
                <input type="text" v-model="manualPlace.address" class="form-control" placeholder="주소를 입력하세요" />
              </div>
              <div class="mb-3">
                <label class="form-label">메모</label>
                <textarea
                  v-model="manualPlace.memo"
                  class="form-control"
                  rows="3"
                  placeholder="메모를 입력하세요"
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
            <button type="button" class="btn btn-primary" @click="addManualPlace">추가</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import planAPI from "@/api/plan";
import attractionAPI from "@/api/attraction";
import draggable from "vuedraggable";
import DateRangePicker from "@/components/common/DateRangePicker.vue";

const router = useRouter();
const authStore = useAuthStore();

// 인증 확인
if (!authStore.isAuthenticated) {
  router.push("/login?redirect=/plans/create");
}

// 상태 관리
const currentStep = ref(1);
const plan = ref({
  title: "",
  description: "",
  startDate: "",
  endDate: "",
});

// 지도 관련 상태
const showSearchPanel = ref(true);
const selectedAttractions = ref([]);
const popularAttractions = ref([]);
const areaList = ref([]);
const gugunList = ref([]);
const contentTypes = ref([]);
const searchArea = ref("");
const searchGugun = ref("");
const searchContentType = ref("");
const searchKeyword = ref("");
const attractionDetail = ref(null);
const loadingLocation = ref(false);
const loadingPopular = ref(false);

// 상태 관리

const attractions = ref([]);
const loading = ref(false);

const currentPage = ref(1);
const itemsPerPage = ref(20);
const totalCount = ref(0);



// 검색 결과 관련 상태
const searchResults = ref([]);
const searchCurrentPage = ref(1);
const searchTotalPages = computed(() => totalCount.value ? Math.ceil(totalCount.value / searchItemsPerPage.value) : 1);

const totalPages = computed(() => Math.ceil(totalCount.value / itemsPerPage.value));
const searchItemsPerPage = ref(10);
const searchLoading = ref(false);
const searchResultsCollapsed = ref(false); // 검색 결과 패널 접힘 상



// 지도 관련 상태

const showRoadview = ref(false);
const showRadiusSearch = ref(false); // 반경 검색 표시 여부 (토글)

let infowindow = null;
let roadviewClient = null;
let roadview = null;
const mapType = ref("ROADMAP");
const showTraffic = ref(false);

const activeDay = ref(1);
const isSaving = ref(false);

const manualPlace = ref({
  title: "",
  address: "",
  memo: "",
  targetDay: 1,
});

let map = null;
let markers = [];
let currentPosition = null;

const handleDatesChanged = (dates) => {
  // 날짜가 변경되어도 다음 단계로 자동 이동하지 않음
  // 필요한 경우 여기서 날짜 관련 로직 처리
  console.log("날짜가 변경되었습니다:", dates);

  // 날짜 변경 시 dayCount 업데이트를 위해 호출
  calculateDays();
};

// 계산된 속성
const dayCount = computed(() => {
  if (!plan.value.startDate || !plan.value.endDate) return 0;
  const start = new Date(plan.value.startDate);
  const end = new Date(plan.value.endDate);
  const diffTime = Math.abs(end - start);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
});

const isStep1Valid = computed(() => {
  return plan.value.title && plan.value.startDate && plan.value.endDate && dayCount.value > 0;
});

const unassignedAttractions = computed(() => {
  return selectedAttractions.value.filter((attr) => !attr.assignedDay);
});

const mapTypeTitle = computed(() => {
  switch (mapType.value) {
    case "ROADMAP":
      return "위성지도";
    case "SKYVIEW":
      return "하이브리드";
    case "HYBRID":
      return "일반지도";
    default:
      return "지도 변경";
  }
});

const mapTypeIcon = computed(() => {
  switch (mapType.value) {
    case "ROADMAP":
      return "fas fa-satellite";
    case "SKYVIEW":
      return "fas fa-layer-group";
    case "HYBRID":
      return "fas fa-map";
    default:
      return "fas fa-map";
  }
});

// 메서드
const calculateDays = () => {
  if (plan.value.startDate && plan.value.endDate) {
    const start = new Date(plan.value.startDate);
    const end = new Date(plan.value.endDate);

    if (end < start) {
      plan.value.endDate = plan.value.startDate;
    }
  }
};

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++;

    if (currentStep.value === 2) {
      setTimeout(() => {
        initializeMap();
        loadCategories();
        loadPopularAttractions();
      }, 100);
    }
  }
};

// 명시적인 다음 단계 이동 함수
const goToNextStep = () => {
  // 필요한 유효성 검사
  if (!isStep1Valid.value) {
    return;
  }

  // 다음 단계로 이동
  nextStep();
};

const toggleSearchPanel = () => {
  showSearchPanel.value = !showSearchPanel.value;
};

const changeMapType = () => {
  if (!map) return;

  switch (mapType.value) {
    case "ROADMAP":
      map.setMapTypeId(kakao.maps.MapTypeId.SKYVIEW);
      mapType.value = "SKYVIEW";
      break;
    case "SKYVIEW":
      map.setMapTypeId(kakao.maps.MapTypeId.HYBRID);
      mapType.value = "HYBRID";
      break;
    case "HYBRID":
      map.setMapTypeId(kakao.maps.MapTypeId.ROADMAP);
      mapType.value = "ROADMAP";
      break;
  }
};

const toggleTrafficInfo = () => {
  if (!map) return;

  showTraffic.value = !showTraffic.value;

  if (showTraffic.value) {
    map.addOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC);
  } else {
    map.removeOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC);
  }
};

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert("위치 서비스를 지원하지 않는 브라우저입니다.");
    return;
  }

  loadingLocation.value = true;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      currentPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      if (map) {
        const moveLatLon = new kakao.maps.LatLng(currentPosition.lat, currentPosition.lng);
        map.setCenter(moveLatLon);
        map.setLevel(5);

        // 현재 위치 마커 추가
        const imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";
        const imageSize = new kakao.maps.Size(24, 35);
        const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

        new kakao.maps.Marker({
          map: map,
          position: moveLatLon,
          image: markerImage,
        });
      }

      loadingLocation.value = false;
    },
    (error) => {
      console.error("위치 정보를 가져올 수 없습니다:", error);
      alert("위치 정보를 가져올 수 없습니다.");
      loadingLocation.value = false;
    }
  );
};

const initializeMap = () => {
  if (!window.kakao || !window.kakao.maps) return;

  const mapContainer = document.getElementById("kakao-map");
  const mapOption = {
    center: new window.kakao.maps.LatLng(36.2683, 127.6358),
    level: 10,
  };

  map = new window.kakao.maps.Map(mapContainer, mapOption);

  // 지도 컨트롤 추가
  const zoomControl = new kakao.maps.ZoomControl();
  map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

  // 지도 클릭 이벤트 - 주변 관광지 검색
  window.kakao.maps.event.addListener(map, "click", function (mouseEvent) {
    const latlng = mouseEvent.latLng;
    searchNearbyAttractions(latlng.getLat(), latlng.getLng());
  });

  // 초기 인기 관광지 표시
  loadRandomAttractions();
};

const loadCategories = async () => {
  try {
    const [areasResponse, contentTypesResponse] = await Promise.all([
      attractionAPI.getSido(),
      attractionAPI.getContentTypes(),
    ]);

    areaList.value = areasResponse.data;
    contentTypes.value = contentTypesResponse.data;
  } catch (error) {
    console.error("카테고리 로드 오류:", error);
  }
};

const onAreaChange = async () => {
  if (!searchArea.value) {
    gugunList.value = [];
    searchGugun.value = "";
    return;
  }

  try {
    const response = await attractionAPI.getGugun(searchArea.value);
    gugunList.value = response.data;
    searchGugun.value = "";
  } catch (error) {
    console.error("시군구 목록 로드 중 오류 발생:", error);
  }
};

const loadPopularAttractions = async () => {
  try {
    loadingPopular.value = true;
    const response = await attractionAPI.getTopAttractions();
    popularAttractions.value = response.data.slice(0, 10);
  } catch (error) {
    console.error("인기 관광지 로드 오류:", error);
  } finally {
    loadingPopular.value = false;
  }
};

const loadRandomAttractions = async () => {
  try {
    const response = await attractionAPI.getRandomAttractions(20);
    const attractions = response.data;

    // 지도에 마커 표시
    updateMapMarkers(attractions);
  } catch (error) {
    console.error("관광지 로드 오류:", error);
  }
};

const searchAttractions = async () => {
  try {
    searchLoading.value = true;

    if (!searchKeyword.value && !searchArea.value && !searchContentType.value) {
      alert("검색 조건을 입력해주세요.");
      searchLoading.value = false;
      return;
    }

    const offset = (searchCurrentPage.value - 1) * searchItemsPerPage.value;

    const params = {
      keyword: searchKeyword.value.trim(),
      areaCode: searchArea.value,
      siGunGuCode: searchGugun.value,
      contentTypeName: searchContentType.value,
      offset: offset,
      limit: searchItemsPerPage.value,
    };

    const response = await attractionAPI.searchAttractions(params);

    if (response.data.attractions) {
      attractions.value = response.data.attractions;
      totalCount.value = response.data.totalCount || 0;
    } else {
      attractions.value = response.data;
      totalCount.value = response.data.length;
    }

    updateMapMarkers();
  } catch (error) {
    console.error("관광지 검색 중 오류 발생:", error);
    if (error.response?.status === 404) {
      attractions.value = [];
      totalCount.value = 0;
    } else {
      alert("검색 중 오류가 발생했습니다.");
    }
  } finally {
    searchLoading.value = false;
  }
};


const changeSearchPage = async (page) => {
  if (page < 1 || page > searchTotalPages.value || searchLoading.value) return;

  searchCurrentPage.value = page;
  await searchAttractions();
};
// 검색 조건 바뀌면 1페이지부터 재검색
watch([searchKeyword, searchArea, searchGugun, searchContentType], () => {
  searchCurrentPage.value = 1;
  searchAttractions();
});

const selectSearchResult = (attraction) => {
  // 지도 중심 이동 및 상세 정보 표시
  selectAttraction(attraction);
};

const clearSearchResults = () => {
  searchResults.value = [];
  searchCurrentPage.value = 1;
  searchTotalPages.value = 0;
  searchResultsCollapsed.value = false; // 패널 상태 초기화

  // 기본 관광지 다시 로드
  loadRandomAttractions();
};

const toggleSearchResults = () => {
  searchResultsCollapsed.value = !searchResultsCollapsed.value;
};

const searchNearbyAttractions = async (lat, lng) => {
  try {
    const response = await attractionAPI.getRandomAttractions(100);
    const nearbyAttractions = response.data.filter((attraction) => {
      if (!attraction.latitude || !attraction.longitude) return false;

      const distance = calculateDistance(lat, lng, attraction.latitude, attraction.longitude);
      return distance < 10; // 10km 이내
    });

    if (nearbyAttractions.length > 0) {
      const closest = nearbyAttractions.slice(0, 10);

      // 검색 결과로 설정
      searchResults.value = closest;
      searchCurrentPage.value = 1;
      searchTotalPages.value = 1;

      updateMapMarkers(closest);

      if (closest.length > 0) {
        // 첫 번째 관광지 상세 정보 표시
        selectAttraction(closest[0]);
      }
    } else {
      searchResults.value = [];
    }
  } catch (error) {
    console.error("주변 관광지 검색 오류:", error);
  }
};

const updateMapMarkers = () => {
  if (!map) return;

  // 기존 마커 정리
  markers.forEach((marker) => marker.setMap(null));
  markers = [];

  if (infowindow) {
    infowindow.close();
  }

  if (attractions.value.length === 0) return;

  const bounds = new kakao.maps.LatLngBounds();

  attractions.value.forEach((attraction) => {
    if (!attraction.latitude || !attraction.longitude) return;

    const position = new kakao.maps.LatLng(attraction.latitude, attraction.longitude);

    const marker = new kakao.maps.Marker({
      position: position,
      map: map,
    });

    // 마커 클릭 이벤트
    kakao.maps.event.addListener(marker, "click", () => {
      selectAttraction(attraction);
    });

    markers.push(marker);
    bounds.extend(position);
  });

  if (markers.length > 0) {
    map.setBounds(bounds);
  }
};


// 전역 함수로 등록 (인포윈도우에서 호출)
window.selectAttractionFromMap = (attractionNo) => {
  const markerData = markers.find((m) => m.attraction.no === attractionNo);
  if (markerData) {
    selectAttraction(markerData.attraction);
  }
};

const selectAttraction = async (attraction) => {
  try {
    const response = await attractionAPI.getAttractionDetail(attraction.no);
    attractionDetail.value = response.data;

    // 지도 중심 이동
    if (map && attraction.latitude && attraction.longitude) {
      const position = new window.kakao.maps.LatLng(attraction.latitude, attraction.longitude);
      map.setCenter(position);
      map.setLevel(3);
    }
  } catch (error) {
    console.error("관광지 상세 정보 로드 중 오류 발생:", error);
    attractionDetail.value = attraction;
  }
};

const closeDetail = () => {
  attractionDetail.value = null;
};

const addAttractionToSelection = (attraction) => {
  // 이미 선택된 관광지인지 확인
  if (selectedAttractions.value.find((item) => item.no === attraction.no)) {
    alert("이미 선택된 관광지입니다.");
    return;
  }

  // 추가 정보 설정
  const enhancedAttraction = {
    ...attraction,
    id: attraction.no,
    assignedDay: "",
    visitTime: "",
    duration: 60,
    memo: "",
    order: 0,
  };

  selectedAttractions.value.push(enhancedAttraction);

  // 지도 마커 업데이트 (선택된 관광지 표시)
  updateMapMarkers(markers.map((m) => m.attraction));

  // 상세 카드 닫기
  closeDetail();

  alert(`${attraction.title}이(가) 여행지 목록에 추가되었습니다!`);
};

const removeAttraction = (index) => {
  const removed = selectedAttractions.value.splice(index, 1)[0];

  // 지도 마커 업데이트
  updateMapMarkers(markers.map((m) => m.attraction));

  alert(`${removed.title}이(가) 여행지 목록에서 제거되었습니다.`);
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // 지구 반지름 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getDayDate = (day) => {
  if (!plan.value.startDate) return "";

  const start = new Date(plan.value.startDate);
  const dayDate = new Date(start);
  dayDate.setDate(start.getDate() + day - 1);

  return dayDate.toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
};

const getDayAttractions = (day) => {
  return selectedAttractions.value.filter((attr) => attr.assignedDay === day);
};

const assignToDay = (attraction) => {
  if (attraction.assignedDay) {
    attraction.order = getDayAttractions(attraction.assignedDay).length;
  }
};

const addManualAttraction = (day) => {
  manualPlace.value.targetDay = day;
  const modal = new bootstrap.Modal(document.getElementById("manualAddModal"));
  modal.show();
};

const addManualPlace = () => {
  if (!manualPlace.value.title) {
    alert("장소명을 입력해주세요.");
    return;
  }

  const newPlace = {
    no: Date.now(),
    id: Date.now(),
    title: manualPlace.value.title,
    addr: manualPlace.value.address,
    sido: "직접입력",
    gugun: "",
    firstImage1: "",
    assignedDay: manualPlace.value.targetDay,
    visitTime: "",
    duration: 60,
    memo: manualPlace.value.memo,
    order: getDayAttractions(manualPlace.value.targetDay).length,
    isManual: true,
  };

  selectedAttractions.value.push(newPlace);

  // 모달 초기화 및 닫기
  manualPlace.value = { title: "", address: "", memo: "", targetDay: 1 };
  const modal = bootstrap.Modal.getInstance(document.getElementById("manualAddModal"));
  modal.hide();
};

const removeFromDay = (day, index) => {
  const dayAttractions = getDayAttractions(day);
  const attraction = dayAttractions[index];

  const globalIndex = selectedAttractions.value.findIndex((item) => item.no === attraction.no);
  if (globalIndex !== -1) {
    selectedAttractions.value.splice(globalIndex, 1);
  }
};

const updateOrder = (event) => {
  selectedAttractions.value.forEach((attraction, index) => {
    if (attraction.assignedDay) {
      const dayAttractions = getDayAttractions(attraction.assignedDay);
      const dayIndex = dayAttractions.findIndex((item) => item.no === attraction.no);
      if (dayIndex !== -1) {
        attraction.order = dayIndex;
      }
    }
  });
};

const startDrag = (attraction) => {
  // 드래그 시작
};

const savePlan = async () => {
  try {
    isSaving.value = true;

    const planData = {
      title: plan.value.title,
      description: plan.value.description,
      startDate: plan.value.startDate,
      endDate: plan.value.endDate,
      details: [],
    };

    selectedAttractions.value.forEach((attraction) => {
      if (attraction.assignedDay) {
        planData.details.push({
          dayNumber: attraction.assignedDay,
          attractionId: attraction.isManual ? null : attraction.no,
          title: attraction.title,
          description: attraction.memo || "",
          visitTime: attraction.visitTime || "",
          stayDuration: attraction.duration || 60,
          orderNo: attraction.order || 0,
        });
      }
    });

    const response = await planAPI.createPlan(planData);

    alert("여행 계획이 성공적으로 저장되었습니다! 🎉");
    router.push(`/plans/${response.data.planId}`);
  } catch (error) {
    console.error("여행 계획 저장 오류:", error);
    alert("여행 계획 저장에 실패했습니다. 다시 시도해주세요.");
  } finally {
    isSaving.value = false;
  }
};

// 라이프사이클
onMounted(() => {
  // 오늘 날짜를 기본값으로 설정
  const today = new Date();
  plan.value.startDate = today.toISOString().split("T")[0];

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  plan.value.endDate = tomorrow.toISOString().split("T")[0];
});
</script>

<style scoped>
.progress-steps {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  margin-bottom: 2rem;
}

.steps-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 600px;
  margin: 0 auto;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.6;
  transition: all 0.3s;
}

.step.active,
.step.completed {
  opacity: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 0.5rem;
  transition: all 0.3s;
}

.step.active .step-number {
  background: white;
  color: #667eea;
  transform: scale(1.1);
}

.step.completed .step-number {
  background: #28a745;
  color: white;
}

.step-title {
  font-size: 0.9rem;
  text-align: center;
}

.step-line {
  width: 100px;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 1rem;
  transition: all 0.3s;
}

.step-line.completed {
  background: #28a745;
}

/* Step 1 스타일 */
.travel-tips {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  border-left: 4px solid #667eea;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0 0;
}

.tips-list li {
  padding: 0.5rem 0;
  font-size: 0.9rem;
  color: #666;
}

.tips-list li:before {
  content: "💡";
  margin-right: 0.5rem;
}

/* Step 2 지도 스타일 */
.map-selection-view {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  padding-top: 80px;
  padding-bottom: 80px; /* 하단 네비게이션 공간 확보 */
  box-sizing: border-box;
  overflow: hidden;
}

.bottom-navigation {
  background: rgba(255, 255, 255, 0.8); /* 흰색, 80% 불투명 */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 15px 20px;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1003;
  border-top: 1px solid #eee;
}

.selected-count {
  font-weight: 500;
  color: #333;
  background: #f8f9fa;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #dee2e6;
}

.selected-count .count {
  color: #0d6efd;
  font-weight: 600;
}

.step-back-btn,
.step-next-btn {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.step-back-btn {
  color: #6c757d;
}

.step-back-btn:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
  transform: translateY(-1px);
}

.step-next-btn {
  background: #0d6efd;
  color: white;
  border-color: #0d6efd;
}

.step-next-btn:disabled {
  background: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.step-next-btn:hover:not(:disabled) {
  background: #0b5ed7;
  border-color: #0b5ed7;
  transform: translateY(-1px);
}

.search-panel-toggle,
.control-btn {
  position: fixed;
  background: white;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1002;
}

.search-panel-toggle {
  top: 90px;
  left: 20px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: left 0.3s ease;
}

.search-panel-toggle:hover {
  background: #f8f9fa;
  transform: translateY(-1px);
}

.search-panel-toggle.active {
  background: #0d6efd;
  color: white;
  left: 440px;
}

.current-location-btn-panel {
  width: 100%;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 15px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.current-location-btn-panel:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
}

/* 검색 결과 네비게이션 패널 */
.search-results-nav {
  background: rgba(255, 255, 255, 0.85); /* 흰색, 85% 불투명 */
  position: fixed;
  bottom: 80px; /* 하단 네비게이션 위 */
  left: 20px;
  right: 20px;
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  max-height: 50vh;
  display: flex;
  flex-direction: column;
  transform: translateY(100%);
  opacity: 0;
  transition: all 0.3s ease;
  overflow: hidden;
}

.search-results-nav.show {
  background: rgba(255, 255, 255, 0.7); /* 흰색, 70% 불투명 */
  transform: translateY(0);
  opacity: 1;
}

.search-results-nav.collapsed {
  max-height: 60px; /* 헤더만 보이는 높이 */
}

.search-results-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
  flex-shrink: 0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-results-header:hover {
  background: #e9ecef;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h5 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  flex: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-search-results {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #666;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.toggle-search-results:hover {
  background: #dee2e6;
  color: #333;
}

.toggle-search-results.collapsed {
  transform: rotate(180deg);
}

.toggle-search-results i {
  transition: transform 0.3s ease;
}

.close-search-results {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #666;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.close-search-results:hover {
  background: #dee2e6;
  color: #333;
}

.search-results-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
}

.search-results-content.collapsed {
  height: 0;
  opacity: 0;
}

.search-results-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  max-height: calc(50vh - 120px);
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.search-result-item:hover {
  background: #f8f9fa;
  border-color: #0d6efd;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-result-item.selected {
  background: #e9f0ff;
  border-color: #0d6efd;
}

.result-thumb {
  width: 60px;
  height: 45px;
  object-fit: cover;
  border-radius: 6px;
  margin-right: 12px;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-title {
  margin: 0 0 4px 0;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-location {
  margin: 0 0 4px 0;
  font-size: 0.8rem;
  color: #6c757d;
  display: flex;
  align-items: center;
}

.result-category {
  font-size: 0.75rem;
  color: #0d6efd;
  background: #e9f0ff;
  padding: 2px 6px;
  border-radius: 10px;
  display: inline-block;
  font-weight: 500;
}

.result-actions {
  margin-left: 12px;
  flex-shrink: 0;
}

.add-btn {
  min-width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.add-btn:hover {
  transform: scale(1.05);
}

.added-btn {
  min-width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  opacity: 0.8;
}

.search-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

.page-btn {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 28px;
}

.page-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #0d6efd;
  color: #0d6efd;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8f9fa;
}

.page-info {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
  min-width: 60px;
  text-align: center;
}

.map-controls {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1002;
}

.control-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #666;
}

.control-btn:hover {
  background: #f8f9fa;
  color: #0d6efd;
}

.control-btn.active {
  background: #0d6efd;
  color: white;
}

.search-panel {
  position: fixed;
  top: 65px;
  left: -420px;
  width: 420px;
  height: calc(100vh - 65px);
  background: white;
  z-index: 1001;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-panel.panel-open {
  left: 0;
}

.search-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
  flex-shrink: 0;
}

.search-panel-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.close-panel {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #666;
}

.close-panel:hover {
  background: #e9ecef;
  color: #333;
}

.search-panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
}

.search-section {
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.search-section.priority {
  background: #f8f9fa;
  border-bottom: 2px solid #0d6efd;
}

.search-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.search-label i {
  color: #0d6efd;
  width: 16px;
}

.search-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
  background: white;
}

.search-select:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.1);
}

.search-input-group {
  display: flex;
  gap: 8px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.1);
}

.search-btn {
  background: #0d6efd;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.3s;
  font-size: 14px;
}

.search-btn:hover {
  background: #0056b3;
}

.popular-list,
.selected-list {
  max-height: 200px;
  overflow-y: auto;
}

.popular-item,
.selected-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.popular-item:hover {
  background: #f8f9fa;
  border-color: #0d6efd;
}

.popular-thumb,
.selected-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 8px;
}

.popular-info,
.selected-info {
  flex: 1;
}

.popular-info h6,
.selected-info h6 {
  margin: 0 0 2px 0;
  font-size: 0.85rem;
}

.selected-actions {
  display: flex;
  align-items: center;
}

.map-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 95%;
  height: 95%;
  overflow: hidden;
}

#kakao-map {
  width: 100%;
  height: 100%;
}

.detail-card {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  max-height: 80vh;
  overflow-y: auto;
}

.detail-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.detail-card-header h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-actions-header {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-btn {
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  color: #666;
}

.action-btn:hover {
  background: #f8f9fa;
  border-color: #0d6efd;
  color: #0d6efd;
}

.close-detail {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #666;
}

.close-detail:hover {
  background: #e9ecef;
  color: #333;
}

.detail-card-content {
  padding: 16px;
}

.detail-image {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 12px;
}

.detail-info p {
  margin: 0 0 8px 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-info i {
  width: 16px;
  color: #6c757d;
}

.detail-actions {
  margin-top: 16px;
}

.detail-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s;
}

.detail-btn.primary {
  background: #0d6efd;
  color: white;
}

.detail-btn.primary:hover {
  background: #0056b3;
}

/* Step 3 스타일 */
.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #eee;
}

.attraction-list {
  min-height: 100px;
}

.attraction-schedule-item {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.attraction-schedule-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.drag-handle {
  margin-right: 1rem;
  color: #999;
  cursor: move;
  padding: 0.5rem;
}

.schedule-content {
  flex: 1;
}

.schedule-thumb {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.empty-day {
  text-align: center;
  padding: 3rem;
  color: #999;
  border: 2px dashed #ddd;
  border-radius: 10px;
}

.empty-day i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.unassigned-attractions {
  background: #fff3cd;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #ffeaa7;
}

.unassigned-item {
  display: flex;
  align-items: center;
  background: white;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  border: 1px solid #dee2e6;
}

.unassigned-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 0.75rem;
}

.unassigned-info {
  flex: 1;
}

.unassigned-info h6 {
  margin: 0 0 0.25rem 0;
  font-size: 0.85rem;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .search-panel {
    width: 380px;
    left: -380px;
  }

  .search-panel-toggle.active {
    left: 380px;
  }

  .detail-card {
    width: 320px;
  }
}

@media (max-width: 768px) {
  .map-selection-view {
    padding-top: 60px;
    padding-bottom: 70px; /* 모바일에서 하단 네비게이션 공간 */
  }

  .bottom-navigation {
    flex-direction: column;
    gap: 10px;
    padding: 10px 15px;
  }

  .selected-count {
    order: -1; /* 맨 위로 이동 */
    margin-bottom: 5px;
  }

  .step-back-btn,
  .step-next-btn {
    padding: 8px 16px;
    font-size: 14px;
    flex: 1;
    max-width: 150px;
  }

  .search-panel {
    width: 100vw;
    left: -100vw;
    top: 60px;
    height: calc(100vh - 130px); /* 하단 네비게이션 공간 확보 */
  }

  .search-panel.panel-open {
    left: 0;
  }

  .search-panel-toggle.active {
    left: calc(100vw - 100px);
  }

  .detail-card {
    width: calc(100vw - 20px);
    bottom: 90px; /* 하단 네비게이션 위로 */
    right: 10px;
    left: 10px;
  }

  .search-results-nav {
    left: 10px;
    right: 10px;
    bottom: 90px; /* 모바일에서 하단 네비게이션 위 */
    max-height: 40vh;
  }

  .search-results-list {
    max-height: calc(40vh - 100px);
  }

  .map-controls {
    right: 10px;
    top: 40%;
  }

  .search-panel-toggle {
    background: rgba(255, 255, 255, 0.7); /* 흰색, 70% 불투명 */
    left: 10px;
    top: 70px;
  }

  .steps-container {
    flex-direction: column;
    gap: 1rem;
  }

  .step-line {
    width: 2px;
    height: 30px;
    margin: 0;
  }
}

@media (max-width: 480px) {
  .bottom-navigation {
    padding: 8px 10px;
  }

  .step-back-btn,
  .step-next-btn {
    padding: 8px 12px;
    font-size: 13px;
  }

  .selected-count {
    font-size: 13px;
    padding: 6px 12px;
  }

  .search-results-nav {
    left: 5px;
    right: 5px;
    bottom: 70px;
    max-height: 35vh;
  }

  .search-results-header {
    padding: 12px 15px;
  }

  .search-results-header h5 {
    font-size: 0.9rem;
  }

  .search-results-list {
    padding: 8px;
    max-height: calc(35vh - 90px);
  }

  .search-result-item {
    padding: 10px;
  }

  .result-thumb {
    width: 50px;
    height: 38px;
    margin-right: 10px;
  }

  .result-title {
    font-size: 0.85rem;
  }

  .result-location {
    font-size: 0.75rem;
  }

  .search-panel-content {
    padding: 0;
  }

  .search-section {
    padding: 8px 12px;
  }

  .detail-card-content {
    padding: 12px;
  }

  .search-panel-toggle {
    padding: 10px 12px;
    font-size: 14px;
  }

  .control-btn {
    width: 44px;
    height: 44px;
    font-size: 14px;
  }

  .detail-card {
    max-height: 60vh; /* 하단 네비게이션 고려 */
    bottom: 70px;
  }
}

/* 커스텀 스크롤바 */
.search-panel-content::-webkit-scrollbar,
.detail-card::-webkit-scrollbar,
.popular-list::-webkit-scrollbar,
.selected-list::-webkit-scrollbar {
  width: 6px;
}

.search-panel-content::-webkit-scrollbar-track,
.detail-card::-webkit-scrollbar-track,
.popular-list::-webkit-scrollbar-track,
.selected-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.search-panel-content::-webkit-scrollbar-thumb,
.detail-card::-webkit-scrollbar-thumb,
.popular-list::-webkit-scrollbar-thumb,
.selected-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.search-panel-content::-webkit-scrollbar-thumb:hover,
.detail-card::-webkit-scrollbar-thumb:hover,
.popular-list::-webkit-scrollbar-thumb:hover,
.selected-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 애니메이션 효과 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-card {
  animation: fadeIn 0.4s ease-out;
}

.search-panel.panel-open {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

/* 포커스 스타일 개선 */
.search-input:focus,
.search-select:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

/* 선택된 관광지 강조 */
.selected-item {
  background: #e9f0ff;
  border-color: #0d6efd;
}

/* 로딩 상태 */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* 지도 마커 호버 효과 */
.map-container .marker:hover {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* 검색 결과 하이라이트 */
.popular-item.selected {
  background: #e9f0ff;
  border-color: #0d6efd;
}

/* 상태별 색상 */
.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.text-warning {
  color: #ffc107 !important;
}

.text-info {
  color: #17a2b8 !important;
}

.text-primary {
  color: #0d6efd !important;
}

/* 버튼 상태 */
.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* 카드 호버 효과 */
.card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

/* 입력 필드 검증 */
.form-control:invalid {
  border-color: #dc3545;
}

.form-control:valid {
  border-color: #28a745;
}
</style>
