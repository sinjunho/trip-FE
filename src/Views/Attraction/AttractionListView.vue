<!-- src/components/attraction/AttractionMap.vue -->
<template>
  <div class="attraction-map">
    <div class="row">
      <div class="col-md-4">
        <!-- 검색 필터 섹션 -->
        <div class="card mb-3">
          <div class="card-body">
            <h5 class="card-title mb-3">관광지 검색</h5>

            <div class="mb-3">
              <label class="form-label">지역</label>
              <select v-model="searchArea" class="form-select" @change="onAreaChange">
                <option value="">전체 지역</option>
                <option v-for="area in areaList" :key="area.sido_code" :value="area.sido_code">
                  {{ area.sido_name }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">시군구</label>
              <select v-model="searchGugun" class="form-select" :disabled="!searchArea">
                <option value="">전체 시군구</option>
                <option v-for="gugun in gugunList" :key="gugun.gugun_code" :value="gugun.gugun_code">
                  {{ gugun.gugun_name }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">카테고리</label>
              <select v-model="searchContentType" class="form-select">
                <option value="">전체 카테고리</option>
                <option v-for="type in contentTypes" :key="type.content_type_id" :value="type.content_type_id">
                  {{ type.content_type_name }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">키워드</label>
              <div class="input-group">
                <input
                  type="text"
                  v-model="searchKeyword"
                  class="form-control"
                  placeholder="관광지 이름"
                  @keyup.enter="searchAttractions"
                />
                <button class="btn btn-primary" @click="searchAttractions">
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 검색 결과 목록 섹션 -->
        <div class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="card-title mb-0">검색 결과</h5>
              <span v-if="totalCount > 0" class="badge bg-primary">{{ totalCount }}개</span>
            </div>

            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">로딩중...</span>
              </div>
            </div>

            <div v-else-if="attractions.length === 0" class="text-center py-4">
              <p class="text-muted mb-0">검색 결과가 없습니다.</p>
            </div>

            <div v-else class="attraction-list">
              <div
                v-for="attraction in attractions"
                :key="attraction.no"
                class="attraction-item"
                @click="goToAttractionDetail(attraction.no)"
              >
                >
                <div class="attraction-item-img">
                  <img :src="attraction.firstImage1 || '/img/no-image.jpg'" :alt="attraction.title" />
                </div>
                <div class="attraction-item-content">
                  <h6 class="attraction-item-title">{{ attraction.title }}</h6>
                  <p class="attraction-item-location">
                    <i class="fas fa-map-marker-alt text-danger"></i>
                    {{ attraction.sido }} {{ attraction.gugun }}
                  </p>
                  <p v-if="attraction.contentTypeName" class="attraction-item-category">
                    <span class="badge bg-light text-dark">{{ attraction.contentTypeName }}</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- 페이지네이션 -->
            <div v-if="totalPages > 1" class="pagination-container mt-3">
              <nav aria-label="검색 결과 페이지">
                <ul class="pagination pagination-sm justify-content-center">
                  <li :class="['page-item', { disabled: currentPage === 1 }]">
                    <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                      <i class="fas fa-chevron-left"></i>
                    </a>
                  </li>

                  <li v-for="page in displayPages" :key="page" :class="['page-item', { active: page === currentPage }]">
                    <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                  </li>

                  <li :class="['page-item', { disabled: currentPage === totalPages }]">
                    <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                      <i class="fas fa-chevron-right"></i>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-8">
        <!-- 지도 섹션 -->
        <div class="card">
          <div class="card-body p-0">
            <div id="kakao-map" style="height: 650px"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 선택된 관광지 상세 정보 모달 -->
    <div class="modal fade" id="attractionDetailModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">관광지 상세 정보</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="!attractionDetail" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">로딩중...</span>
              </div>
            </div>

            <div v-else>
              <div class="row mb-4">
                <div class="col-md-6">
                  <img
                    :src="attractionDetail.firstImage1 || '/img/no-image.jpg'"
                    class="img-fluid rounded"
                    :alt="attractionDetail.title"
                  />
                </div>
                <div class="col-md-6">
                  <h4>{{ attractionDetail.title }}</h4>
                  <p class="text-muted">
                    <i class="fas fa-map-marker-alt text-danger me-1"></i>
                    {{ attractionDetail.sido }} {{ attractionDetail.gugun }}
                  </p>

                  <div class="attraction-info-list">
                    <div v-if="attractionDetail.contentTypeName" class="attraction-info-item">
                      <div class="info-label"><i class="fas fa-tag me-2"></i> 카테고리</div>
                      <div class="info-value">{{ attractionDetail.contentTypeName }}</div>
                    </div>
                    <div v-if="attractionDetail.tel" class="attraction-info-item">
                      <div class="info-label"><i class="fas fa-phone me-2"></i> 연락처</div>
                      <div class="info-value">{{ attractionDetail.tel }}</div>
                    </div>
                    <div v-if="attractionDetail.addr" class="attraction-info-item">
                      <div class="info-label"><i class="fas fa-map me-2"></i> 주소</div>
                      <div class="info-value">{{ attractionDetail.addr }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="attractionDetail.overview" class="mb-4">
                <h5>개요</h5>
                <p class="mb-0">{{ attractionDetail.overview }}</p>
              </div>

              <div v-if="attractionDetail.homepage" class="mb-4">
                <h5>홈페이지</h5>
                <a :href="attractionDetail.homepage" target="_blank" class="text-primary">
                  {{ attractionDetail.homepage }}
                </a>
              </div>

              <!-- 주변 관광지 표시 -->
              <div v-if="nearbyAttractions.length > 0" class="mb-4">
                <h5>주변 관광지</h5>
                <div class="nearby-attractions">
                  <div v-for="(nearby, index) in nearbyAttractions" :key="nearby.no" class="nearby-attraction-item">
                    <img :src="nearby.firstImage1 || '/img/no-image.jpg'" class="nearby-img" :alt="nearby.title" />
                    <div class="nearby-content">
                      <h6>{{ nearby.title }}</h6>
                      <p class="nearby-distance">{{ formatDistance(nearby.distance) }} 거리</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-center">
                <button v-if="isPlanMode" class="btn btn-primary" @click="addToPlan">
                  <i class="fas fa-plus"></i> 일정에 추가
                </button>
                <button v-else class="btn btn-primary" @click="goToAttrationDetail">
                  <i class="fas fa-info-circle"></i> 상세 정보 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import attractionAPI from "@/api/attraction";

const props = defineProps({
  isPlanMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["select-attraction"]);

const router = useRouter();

// 상태 관리
const areaList = ref([]);
const gugunList = ref([]);
const contentTypes = ref([]);
const attractions = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalCount = ref(0);
const searchArea = ref("");
const searchGugun = ref("");
const searchContentType = ref("");
const searchKeyword = ref("");
const selectedAttraction = ref(null);
const attractionDetail = ref(null);
const nearbyAttractions = ref([]);
let map = null;
let markers = [];
let infowindow = null;

const goToAttractionDetail = (attractionId) => {
  router.push(`/attractions/${attractionId}`);
};

// 계산된 속성
const totalPages = computed(() => {
  return Math.ceil(totalCount.value / itemsPerPage.value);
});

const displayPages = computed(() => {
  const maxPages = 5;
  let startPage = Math.max(1, currentPage.value - Math.floor(maxPages / 2));
  let endPage = startPage + maxPages - 1;

  if (endPage > totalPages.value) {
    endPage = totalPages.value;
    startPage = Math.max(1, endPage - maxPages + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
});

// 지역 및 콘텐츠 타입 목록 로드
const loadCategories = async () => {
  try {
    const [areasResponse, contentTypesResponse] = await Promise.all([
      attractionAPI.getSido(),
      attractionAPI.getContentTypes(),
    ]);

    areaList.value = areasResponse.data;
    contentTypes.value = contentTypesResponse.data;
  } catch (error) {
    console.error("카테고리 로드 중 오류 발생:", error);
  }
};

// 지역 변경 시 시군구 목록 로드
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

// 관광지 검색
const searchAttractions = async () => {
  try {
    loading.value = true;
    currentPage.value = 1;

    const params = {
      areaCode: searchArea.value,
      siGunGuCode: searchGugun.value,
      contentTypeName: searchContentType.value,
      keyword: searchKeyword.value,
      offset: 0,
      limit: itemsPerPage.value,
    };

    const response = await attractionAPI.getAttractions(params);
    attractions.value = response.data;
    totalCount.value = response.data.length; // API가 totalCount를 제공한다면 그 값을 사용

    // 지도에 마커 표시
    updateMapMarkers();
  } catch (error) {
    console.error("관광지 검색 중 오류 발생:", error);
  } finally {
    loading.value = false;
  }
};

// 페이지 변경
const changePage = async (page) => {
  if (page < 1 || page > totalPages.value) return;

  try {
    loading.value = true;
    currentPage.value = page;

    const offset = (page - 1) * itemsPerPage.value;

    const params = {
      areaCode: searchArea.value,
      siGunGuCode: searchGugun.value,
      contentTypeName: searchContentType.value,
      keyword: searchKeyword.value,
      offset: offset,
      limit: itemsPerPage.value,
    };

    const response = await attractionAPI.getAttractions(params);
    attractions.value = response.data;

    // 지도에 마커 표시
    updateMapMarkers();
  } catch (error) {
    console.error("관광지 검색 중 오류 발생:", error);
  } finally {
    loading.value = false;
  }
};

// 지도 초기화
const initializeMap = () => {
  if (typeof kakao === "undefined" || !kakao.maps) {
    console.error("Kakao Maps API가 로드되지 않았습니다.");
    return;
  }

  const mapContainer = document.getElementById("kakao-map");
  const mapOption = {
    center: new kakao.maps.LatLng(36.2683, 127.6358), // 대한민국 중심점
    level: 13,
  };

  map = new kakao.maps.Map(mapContainer, mapOption);

  // 지도 확대/축소 컨트롤러 추가
  const zoomControl = new kakao.maps.ZoomControl();
  map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

  // 지도 타입 컨트롤러 추가
  const mapTypeControl = new kakao.maps.MapTypeControl();
  map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
};

// 지도에 마커 표시
const updateMapMarkers = () => {
  if (!map) return;

  // 기존 마커와 인포윈도우 제거
  markers.forEach((marker) => marker.setMap(null));
  markers = [];

  if (infowindow) {
    infowindow.close();
  }

  // 마커 표시할 관광지가 없으면 리턴
  if (attractions.value.length === 0) return;

  // 지도 범위 설정
  const bounds = new kakao.maps.LatLngBounds();

  // 관광지 마커 추가
  attractions.value.forEach((attraction) => {
    if (!attraction.latitude || !attraction.longitude) return;

    const position = new kakao.maps.LatLng(attraction.latitude, attraction.longitude);

    // 마커 생성
    const marker = new kakao.maps.Marker({
      position: position,
      map: map,
    });

    // 인포윈도우 내용
    const content = `
      <div class="marker-info">
        <div class="marker-title">${attraction.title}</div>
      </div>
    `;

    // 마커 클릭 이벤트
    kakao.maps.event.addListener(marker, "click", () => {
      // 이미 열린 인포윈도우 닫기
      if (infowindow) {
        infowindow.close();
      }

      // 새 인포윈도우 열기
      infowindow = new kakao.maps.InfoWindow({
        content: content,
      });
      infowindow.open(map, marker);

      // 관광지 선택
      selectAttraction(attraction);
    });

    // 마커 배열에 추가
    markers.push(marker);

    // 지도 범위에 추가
    bounds.extend(position);
  });

  // 모든 마커가 보이도록 지도 범위 조정
  if (markers.length > 0) {
    map.setBounds(bounds);
  }
};

// 관광지 선택
const selectAttraction = async (attraction) => {
  selectedAttraction.value = attraction.no;

  // 해당 관광지의 마커 찾기
  const marker = markers.find((m) => {
    const position = m.getPosition();
    return position.getLat() === attraction.latitude && position.getLng() === attraction.longitude;
  });

  // 마커가 있으면 지도 중심 이동
  if (marker) {
    map.setCenter(marker.getPosition());
    map.setLevel(3);

    // 인포윈도우 열기
    if (infowindow) infowindow.close();

    const content = `
      <div class="marker-info">
        <div class="marker-title">${attraction.title}</div>
      </div>
    `;

    infowindow = new kakao.maps.InfoWindow({
      content: content,
    });
    infowindow.open(map, marker);
  }

  // 관광지 상세 정보 로드
  await loadAttractionDetail(attraction.no);

  // 상세 정보 모달 열기
  const modal = new bootstrap.Modal(document.getElementById("attractionDetailModal"));
  modal.show();
};

// 관광지 상세 정보 로드
const loadAttractionDetail = async (attractionNo) => {
  try {
    attractionDetail.value = null;
    nearbyAttractions.value = [];

    const [detailResponse, nearbyResponse] = await Promise.all([
      attractionAPI.getAttractionDetail(attractionNo),
      attractionAPI.getNearbyAttractions(attractionNo),
    ]);

    attractionDetail.value = detailResponse.data;

    // 주변 관광지 결과가 배열인지 확인
    if (Array.isArray(nearbyResponse.data)) {
      nearbyAttractions.value = nearbyResponse.data.slice(0, 5); // 최대 5개만 표시
    }
  } catch (error) {
    console.error("관광지 상세 정보 로드 중 오류 발생:", error);
  }
};

// 거리 포맷
const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else {
    return `${distance.toFixed(1)}km`;
  }
};

// 일정에 추가
const addToPlan = () => {
  if (!attractionDetail.value) return;

  emit("select-attraction", attractionDetail.value);

  // 모달 닫기
  const modal = bootstrap.Modal.getInstance(document.getElementById("attractionDetailModal"));
  modal.hide();
};

// 관광지 상세 페이지로 이동
const goToAttrationDetail = () => {
  if (!attractionDetail.value) return;

  router.push(`/attractions/${attractionDetail.value.no}`);

  // 모달 닫기
  const modal = bootstrap.Modal.getInstance(document.getElementById("attractionDetailModal"));
  modal.hide();
};

// 컴포넌트 마운트 시 초기화
onMounted(async () => {
  await loadCategories();

  // 지도 초기화 (카카오맵 API가 로드된 경우)
  setTimeout(() => {
    initializeMap();
  }, 1000);
});
</script>

<style scoped>
.attraction-list {
  max-height: 450px;
  overflow-y: auto;
}

.attraction-item {
  display: flex;
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: all 0.2s;
}

.attraction-item:hover {
  background-color: #f8f9fa;
}

.attraction-item.active {
  background-color: #e9f0ff;
  border-left: 3px solid #0d6efd;
}

.attraction-item-img {
  width: 70px;
  height: 70px;
  margin-right: 10px;
  overflow: hidden;
  border-radius: 5px;
}

.attraction-item-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.attraction-item-content {
  flex: 1;
}

.attraction-item-title {
  margin-bottom: 5px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
  max-height: 2.6em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.attraction-item-location {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 5px;
}

.attraction-item-category {
  margin-bottom: 0;
}

.attraction-info-list {
  margin-top: 20px;
}

.attraction-info-item {
  display: flex;
  margin-bottom: 10px;
}

.info-label {
  min-width: 100px;
  color: #6c757d;
}

.info-value {
  flex: 1;
}

.nearby-attractions {
  display: flex;
  overflow-x: auto;
  gap: 15px;
  padding: 10px 0;
}

.nearby-attraction-item {
  min-width: 150px;
  max-width: 150px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.nearby-img {
  width: 100%;
  height: 100px;
  object-fit: cover;
}

.nearby-content {
  padding: 10px;
}

.nearby-content h6 {
  font-size: 14px;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nearby-distance {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 0;
}

/* 마커 스타일 (CSS를 head에 추가해야 함) */
.marker-info {
  padding: 5px 10px;
  white-space: nowrap;
}

.marker-title {
  font-weight: bold;
  font-size: 14px;
}
</style>
