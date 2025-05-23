<!-- src/views/AttractionListView.vue -->
<template>
  <div class="attraction-map-view">
    <!-- 검색 패널 토글 버튼 -->
    <button
      class="search-panel-toggle"
      :class="{ active: showSearchPanel }"
      :style="{ left: showSearchPanel ? '440px' : '20px' }"
      @click="toggleSearchPanel"
    >
      <i class="fas fa-search"></i>
      <span>검색</span>
    </button>

    <!-- 현재 위치 버튼 - 활성 상태 클래스 추가 -->
    <button
      class="current-location-btn"
      :class="{ active: showRadiusSearch }"
      :style="{ left: showSearchPanel ? '440px' : '20px' }"
      @click="getCurrentLocation"
      :disabled="loadingLocation"
    >
      <i class="fas fa-crosshairs" v-if="!loadingLocation"></i>
      <i class="fas fa-spinner fa-spin" v-else></i>
    </button>

    <!-- 지도 컨트롤 버튼들 -->
    <div class="map-controls">
      <button class="control-btn" @click="changeMapType" :title="mapTypeTitle">
        <i :class="mapTypeIcon"></i>
      </button>
      <button class="control-btn" @click="toggleTrafficInfo" :class="{ active: showTraffic }" title="교통정보">
        <i class="fas fa-car"></i>
      </button>
      <button class="control-btn" @click="toggleRoadview" :class="{ active: showRoadview }" title="로드뷰">
        <i class="fas fa-street-view"></i>
      </button>
    </div>

    <!-- 검색 패널 -->
    <div class="search-panel" :class="{ 'panel-open': showSearchPanel }">
      <div class="search-panel-header">
        <h3>관광지 검색</h3>
        <button class="close-panel" @click="showSearchPanel = false">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="search-panel-content">
        <!-- 1. 키워드 검색 (최우선) -->
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

        <!-- 2. 카테고리 선택 -->
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

        <!-- 3. 지역 선택 -->
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

        <!-- 4. 시군구 선택 (지역 선택 후 활성화) -->
        <div class="search-section gugun-section" v-if="searchArea" v-show="searchArea">
          <label class="search-label">
            <i class="fas fa-building"></i>
            시군구
            <span v-if="!searchArea" class="helper-text">(지역을 먼저 선택하세요)</span>
          </label>
          <select v-model="searchGugun" class="search-select" :disabled="!searchArea">
            <option value="">전체 시군구</option>
            <option v-for="gugun in gugunList" :key="gugun.gugun_code" :value="gugun.gugun_code">
              {{ gugun.gugun_name }}
            </option>
          </select>
        </div>

        <!-- 5. 반경 검색 (현재 위치 기반) -->
        <div class="search-section" v-if="currentPosition && showRadiusSearch">
          <label class="search-label">
            <i class="fas fa-compass"></i>
            현재 위치 기준 반경 검색
          </label>
          <div class="radius-slider-container">
            <!-- 슬라이더 컨트롤 -->
            <div class="slider-wrapper">
              <div class="slider-labels">
                <span class="slider-label-min">1km</span>
                <span class="slider-label-current">{{ formatDistance(searchRadius) }}</span>
                <span class="slider-label-max">20km</span>
              </div>

              <input
                type="range"
                v-model="searchRadius"
                class="radius-slider"
                min="1000"
                max="20000"
                step="1000"
                @input="onSliderChange"
                @change="searchByRadiusSlider"
              />

              <!-- 슬라이더 눈금 표시 -->
              <div class="slider-ticks">
                <div class="tick" v-for="i in 20" :key="i"></div>
              </div>
            </div>

            <!-- 검색 상태 및 컨트롤 -->
            <div class="slider-controls">
              <button
                class="radius-search-btn"
                @click="searchByRadiusSlider"
                :disabled="loadingRadius"
                :class="{ loading: loadingRadius }"
              >
                <i v-if="!loadingRadius" class="fas fa-search"></i>
                <i v-else class="fas fa-spinner fa-spin"></i>
                <span v-if="!loadingRadius">검색</span>
                <span v-else>검색중...</span>
              </button>

              <button
                class="radius-auto-btn"
                @click="toggleAutoSearch"
                :class="{ active: autoSearch }"
                title="실시간 검색"
              >
                <i class="fas fa-sync"></i>
                <span>자동</span>
              </button>

              <button class="radius-clear-btn" @click="clearRadiusSearch" title="반경 검색 초기화">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <!-- 검색 결과 요약 -->
            <div v-if="radiusSearchResults" class="radius-results-summary">
              <div class="results-info">
                <i class="fas fa-map-marker-alt"></i>
                <span>{{ formatDistance(searchRadius) }} 반경 내 {{ radiusSearchResults.count }}개 발견</span>
              </div>
              <div class="results-distance">
                <small>가장 가까운 곳: {{ radiusSearchResults.nearest }}m</small>
              </div>
            </div>
          </div>
        </div>

        <!-- 검색 결과 목록 (확대된 영역) -->
        <div class="search-results expanded">
          <div class="results-header">
            <h4>
              <i class="fas fa-list"></i>
              검색 결과
            </h4>
            <div class="result-info">
              <span v-if="totalCount > 0" class="result-count">{{ totalCount }}개</span>
              <select v-model="itemsPerPage" class="items-per-page" @change="changeItemsPerPage">
                <option value="10">10개씩</option>
                <option value="20">20개씩</option>
                <option value="50">50개씩</option>
              </select>
            </div>
          </div>

          <div v-if="loading" class="loading-container">
            <div class="spinner"></div>
            <p>검색중...</p>
          </div>

          <div v-else-if="attractions.length === 0" class="no-results">
            <div class="no-results-icon">
              <i class="fas fa-search"></i>
            </div>
            <p>검색 결과가 없습니다.</p>
            <small>다른 키워드나 조건으로 다시 검색해보세요.</small>
          </div>

          <div v-else class="attraction-list">
            <div
              v-for="attraction in attractions"
              :key="attraction.no"
              class="attraction-item"
              :class="{ active: selectedAttraction === attraction.no }"
              @click="selectAttraction(attraction)"
            >
              <div class="attraction-image">
                <img :src="attraction.firstImage1 || '/img/no-image.jpg'" :alt="attraction.title" />
                <div class="view-count">
                  <i class="fas fa-eye"></i>
                  {{ attraction.viewCnt || 0 }}
                </div>
              </div>
              <div class="attraction-info">
                <h5 class="attraction-title">{{ attraction.title }}</h5>
                <p class="attraction-location">
                  <i class="fas fa-map-marker-alt"></i>
                  {{ attraction.sido }} {{ attraction.gugun }}
                </p>
                <p v-if="attraction.contentTypeName" class="attraction-category">
                  {{ attraction.contentTypeName }}
                </p>
                <div v-if="currentPosition && attraction.latitude" class="attraction-distance">
                  <i class="fas fa-route"></i>
                  {{ calculateDistance(attraction) }}
                </div>
              </div>
            </div>
          </div>

          <!-- 페이지네이션 -->
          <div v-if="totalPages > 1" class="pagination">
            <button class="page-btn" :disabled="currentPage === 1" @click="changePage(1)">
              <i class="fas fa-angle-double-left"></i>
            </button>

            <button class="page-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
              <i class="fas fa-chevron-left"></i>
            </button>

            <div class="page-numbers">
              <button
                v-for="page in displayPages"
                :key="page"
                class="page-btn"
                :class="{ active: page === currentPage }"
                @click="changePage(page)"
              >
                {{ page }}
              </button>
            </div>

            <button class="page-btn" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
              <i class="fas fa-chevron-right"></i>
            </button>

            <button class="page-btn" :disabled="currentPage === totalPages" @click="changePage(totalPages)">
              <i class="fas fa-angle-double-right"></i>
            </button>
          </div>

          <!-- 페이지 정보 -->
          <div class="page-info-text">
            {{ currentPage }} / {{ totalPages }} 페이지 ({{ (currentPage - 1) * itemsPerPage + 1 }} -
            {{ Math.min(currentPage * itemsPerPage, totalCount) }} / {{ totalCount }}개)
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
          <button class="action-btn" @click="showDirections" title="길찾기">
            <i class="fas fa-directions"></i>
          </button>
          <button class="action-btn" @click="showRoadviewForAttraction" title="로드뷰">
            <i class="fas fa-street-view"></i>
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

          <p v-if="currentPosition && attractionDetail.latitude" class="detail-distance">
            <i class="fas fa-route"></i>
            현재 위치에서 {{ calculateDistance(attractionDetail) }}
          </p>
        </div>

        <div class="detail-actions">
          <router-link :to="`/attractions/${attractionDetail.no}`" class="detail-btn primary"> 상세 정보 </router-link>
          <button v-if="isPlanMode" class="detail-btn secondary" @click="addToPlan">일정 추가</button>
        </div>
      </div>
    </div>

    <!-- 로드뷰 컨테이너 -->
    <div v-if="showRoadview" class="roadview-container">
      <div class="roadview-header">
        <h4>로드뷰</h4>
        <button class="close-roadview" @click="toggleRoadview">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div id="roadview" class="roadview-content"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
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
const showSearchPanel = ref(true);
const areaList = ref([]);
const gugunList = ref([]);
const contentTypes = ref([]);
const attractions = ref([]);
const loading = ref(false);
const loadingLocation = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(20);
const totalCount = ref(0);
const searchArea = ref("");
const searchGugun = ref("");
const searchContentType = ref("");
const searchKeyword = ref("");
const searchRadius = ref(5000); // 기본값 5km
const loadingRadius = ref(false);
const selectedAttraction = ref(null);
const attractionDetail = ref(null);
const currentPosition = ref(null);
const autoSearch = ref(false); // 자동 검색 여부
const radiusSearchResults = ref(null); // 검색 결과 요약
let sliderTimeout = null; // 디바운싱용

// 지도 관련 상태
const mapType = ref("ROADMAP"); // ROADMAP, SKYVIEW, HYBRID
const showTraffic = ref(false);
const showRoadview = ref(false);
const showRadiusSearch = ref(false); // 반경 검색 표시 여부 (토글)

let map = null;
let markers = [];
let infowindow = null;
let roadviewClient = null;
let roadview = null;

// 계산된 속성
const totalPages = computed(() => {
  return Math.ceil(totalCount.value / itemsPerPage.value);
});

const displayPages = computed(() => {
  const maxDisplayPages = 5;
  let startPage = Math.max(1, currentPage.value - Math.floor(maxDisplayPages / 2));
  let endPage = Math.min(totalPages.value, startPage + maxDisplayPages - 1);

  if (endPage - startPage + 1 < maxDisplayPages) {
    startPage = Math.max(1, endPage - maxDisplayPages + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
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
const toggleSearchPanel = () => {
  showSearchPanel.value = !showSearchPanel.value;
};

// 현재 위치 정보 창 띄우기 (토글)
const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert("위치 서비스를 지원하지 않는 브라우저입니다.");
    return;
  }

  // 이미 위치 정보가 있는 경우 토글만 수행
  if (currentPosition.value) {
    showRadiusSearch.value = !showRadiusSearch.value;
    return;
  }

  // 위치 정보가 없는 경우에만 위치 가져오기
  loadingLocation.value = true;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      currentPosition.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      if (map) {
        const moveLatLon = new kakao.maps.LatLng(currentPosition.value.lat, currentPosition.value.lng);
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

      // 위치 정보를 가져온 후 반경 검색 섹션 표시
      showRadiusSearch.value = true;
      loadingLocation.value = false;
    },
    (error) => {
      console.error("위치 정보를 가져올 수 없습니다:", error);
      alert("위치 정보를 가져올 수 없습니다.");
      loadingLocation.value = false;
    }
  );
};

// 거리 포맷팅 함수
const formatDistance = (meters) => {
  if (!meters) return "5km";
  const km = meters / 1000;
  return km % 1 === 0 ? `${km}km` : `${km.toFixed(1)}km`;
};

// 슬라이더 값 변경 시 (실시간)
const onSliderChange = () => {
  if (autoSearch.value) {
    // 디바운싱: 500ms 후에 검색 실행
    if (sliderTimeout) {
      clearTimeout(sliderTimeout);
    }
    sliderTimeout = setTimeout(() => {
      searchByRadiusSlider();
    }, 500);
  }
};

// 자동 검색 토글
const toggleAutoSearch = () => {
  autoSearch.value = !autoSearch.value;
  if (autoSearch.value) {
    searchByRadiusSlider(); // 자동 검색 활성화 시 즉시 검색
  }
};

// 슬라이더 기반 반경 검색
const searchByRadiusSlider = async () => {
  if (!currentPosition.value || !searchRadius.value) return;

  try {
    loadingRadius.value = true;
    radiusSearchResults.value = null;

    // 전체 관광지를 가져와서 클라이언트에서 거리 필터링
    const response = await attractionAPI.getAttractions({ limit: 5000 });
    const allAttractions = response.data;

    const radiusInKm = parseInt(searchRadius.value) / 1000;
    const nearbyAttractions = [];
    const distances = [];

    allAttractions.forEach((attraction) => {
      if (!attraction.latitude || !attraction.longitude) return;

      const distance = calculateDistanceFromPosition(
        currentPosition.value.lat,
        currentPosition.value.lng,
        attraction.latitude,
        attraction.longitude
      );

      if (distance <= radiusInKm) {
        nearbyAttractions.push(attraction);
        distances.push(distance * 1000); // 미터로 변환
      }
    });

    // 거리순으로 정렬
    nearbyAttractions.sort((a, b) => {
      const distanceA = calculateDistanceFromPosition(
        currentPosition.value.lat,
        currentPosition.value.lng,
        a.latitude,
        a.longitude
      );
      const distanceB = calculateDistanceFromPosition(
        currentPosition.value.lat,
        currentPosition.value.lng,
        b.latitude,
        b.longitude
      );
      return distanceA - distanceB;
    });

    // 검색 결과 업데이트
    attractions.value = nearbyAttractions.slice(0, itemsPerPage.value);
    totalCount.value = nearbyAttractions.length;
    currentPage.value = 1;

    // 결과 요약 생성
    radiusSearchResults.value = {
      count: nearbyAttractions.length,
      nearest: distances.length > 0 ? Math.round(Math.min(...distances)) : 0,
    };

    // 검색 조건 초기화 (반경 검색 모드로 전환)
    searchArea.value = "";
    searchGugun.value = "";
    searchContentType.value = "";
    searchKeyword.value = "";

    updateMapMarkers();

    // 현재 위치 중심으로 지도 이동
    if (map && currentPosition.value) {
      const moveLatLon = new kakao.maps.LatLng(currentPosition.value.lat, currentPosition.value.lng);
      map.setCenter(moveLatLon);

      // 반경에 맞는 적절한 지도 레벨 설정
      let mapLevel = 8;
      if (radiusInKm <= 2) mapLevel = 6;
      else if (radiusInKm <= 5) mapLevel = 7;
      else if (radiusInKm <= 10) mapLevel = 8;
      else if (radiusInKm <= 15) mapLevel = 9;
      else mapLevel = 10;

      map.setLevel(mapLevel);
    }
  } catch (error) {
    console.error("반경 검색 중 오류 발생:", error);
    radiusSearchResults.value = null;
  } finally {
    loadingRadius.value = false;
  }
};

// 반경 검색 초기화
const clearRadiusSearch = () => {
  searchRadius.value = 5000;
  radiusSearchResults.value = null;
  autoSearch.value = false;

  // 기본 검색으로 되돌리기
  searchAttractions();
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

const toggleRoadview = () => {
  showRoadview.value = !showRoadview.value;

  if (showRoadview.value) {
    setTimeout(() => {
      initRoadview();
    }, 100);
  }
};

const initRoadview = () => {
  if (!kakao.maps.Roadview) return;

  const roadviewContainer = document.getElementById("roadview");
  roadview = new kakao.maps.Roadview(roadviewContainer);
  roadviewClient = new kakao.maps.RoadviewClient();

  if (currentPosition.value) {
    const position = new kakao.maps.LatLng(currentPosition.value.lat, currentPosition.value.lng);
    roadviewClient.getNearestPanoId(position, 50, (panoId) => {
      if (panoId) {
        roadview.setPanoId(panoId, position);
      }
    });
  }
};

const showRoadviewForAttraction = () => {
  if (!attractionDetail.value || !attractionDetail.value.latitude) return;

  showRoadview.value = true;
  setTimeout(() => {
    initRoadview();
    const position = new kakao.maps.LatLng(attractionDetail.value.latitude, attractionDetail.value.longitude);
    roadviewClient.getNearestPanoId(position, 50, (panoId) => {
      if (panoId) {
        roadview.setPanoId(panoId, position);
      } else {
        alert("해당 위치의 로드뷰를 찾을 수 없습니다.");
      }
    });
  }, 100);
};

const showDirections = () => {
  if (!attractionDetail.value || !currentPosition.value) {
    alert("현재 위치 정보가 필요합니다.");
    return;
  }

  const url = `https://map.kakao.com/link/to/${encodeURIComponent(attractionDetail.value.title)},${
    attractionDetail.value.latitude
  },${attractionDetail.value.longitude}`;
  window.open(url, "_blank");
};

const calculateDistance = (attraction) => {
  if (!currentPosition.value || !attraction.latitude || !attraction.longitude) return "";

  const distance = calculateDistanceFromPosition(
    currentPosition.value.lat,
    currentPosition.value.lng,
    attraction.latitude,
    attraction.longitude
  );

  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else {
    return `${distance.toFixed(1)}km`;
  }
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
    console.error("카테고리 로드 중 오류 발생:", error);
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

const searchAttractions = async () => {
  try {
    loading.value = true;
    currentPage.value = 1;

    // 검색 조건이 하나도 없으면 경고
    if (!searchKeyword.value && !searchArea.value && !searchContentType.value) {
      alert("검색 조건을 입력해주세요.");
      loading.value = false;
      return;
    }

    const params = {
      keyword: searchKeyword.value.trim(),
      areaCode: searchArea.value,
      siGunGuCode: searchGugun.value,
      contentTypeName: searchContentType.value,
      offset: 0,
      limit: itemsPerPage.value,
    };

    console.log("검색 파라미터:", params);

    // 키워드 검색 API 호출
    const response = await attractionAPI.searchAttractions(params);

    console.log("검색 응답:", response.data);

    if (response.data.attractions) {
      attractions.value = response.data.attractions;
      totalCount.value = response.data.totalCount || 0;
    } else {
      // 기존 API 응답 형식과 호환
      attractions.value = response.data;
      totalCount.value = response.data.length;
    }

    // 검색 결과가 없을 때 처리
    if (attractions.value.length === 0) {
      console.log("검색 결과 없음");
      // no-results 상태가 template에서 자동으로 표시됨
    }

    updateMapMarkers();
  } catch (error) {
    console.error("관광지 검색 중 오류 발생:", error);

    // 에러 메시지 표시
    if (error.response?.status === 404) {
      attractions.value = [];
      totalCount.value = 0;
    } else {
      alert("검색 중 오류가 발생했습니다.");
    }
  } finally {
    loading.value = false;
  }
};

const searchByRadius = async () => {
  if (!currentPosition.value || !searchRadius.value) return;

  try {
    loading.value = true;

    // 전체 관광지를 가져와서 클라이언트에서 거리 필터링
    const response = await attractionAPI.getAttractions({ limit: 5000 });
    const allAttractions = response.data;

    const radiusInKm = parseInt(searchRadius.value) / 1000;
    const nearbyAttractions = allAttractions.filter((attraction) => {
      if (!attraction.latitude || !attraction.longitude) return false;

      const distance = calculateDistanceFromPosition(
        currentPosition.value.lat,
        currentPosition.value.lng,
        attraction.latitude,
        attraction.longitude
      );

      return distance <= radiusInKm;
    });

    // 거리순으로 정렬
    nearbyAttractions.sort((a, b) => {
      const distanceA = calculateDistanceFromPosition(
        currentPosition.value.lat,
        currentPosition.value.lng,
        a.latitude,
        a.longitude
      );
      const distanceB = calculateDistanceFromPosition(
        currentPosition.value.lat,
        currentPosition.value.lng,
        b.latitude,
        b.longitude
      );
      return distanceA - distanceB;
    });

    attractions.value = nearbyAttractions.slice(0, itemsPerPage.value);
    totalCount.value = nearbyAttractions.length;
    currentPage.value = 1;

    // 검색 조건 초기화 (반경 검색 모드로 전환)
    searchArea.value = "";
    searchGugun.value = "";
    searchContentType.value = "";
    searchKeyword.value = "";

    updateMapMarkers();

    // 현재 위치 중심으로 지도 이동
    if (map && currentPosition.value) {
      const moveLatLon = new kakao.maps.LatLng(currentPosition.value.lat, currentPosition.value.lng);
      map.setCenter(moveLatLon);
      map.setLevel(8); // 반경에 맞는 적절한 레벨
    }
  } catch (error) {
    console.error("반경 검색 중 오류 발생:", error);
  } finally {
    loading.value = false;
  }
};

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 현재 위치 기준 거리 계산 함수 (일관성을 위해 별도 함수로 분리)
const calculateDistanceFromPosition = (lat1, lon1, lat2, lon2) => {
  return getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);
};

const changeItemsPerPage = () => {
  currentPage.value = 1;
  searchAttractions();
};

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

    updateMapMarkers();
  } catch (error) {
    console.error("페이지 변경 중 오류 발생:", error);
  } finally {
    loading.value = false;
  }
};

const initializeMap = () => {
  if (typeof kakao === "undefined" || !kakao.maps) {
    console.error("Kakao Maps API가 로드되지 않았습니다.");
    return;
  }

  const mapContainer = document.getElementById("kakao-map");
  const mapOption = {
    center: new kakao.maps.LatLng(36.2683, 127.6358), // 대한민국 중심점
    level: 10, // 지도 확대/축소 레벨 (1~14, 숫자가 클수록 더 넓은 지역)
  };

  map = new kakao.maps.Map(mapContainer, mapOption);

  // 지도 컨트롤 추가
  const zoomControl = new kakao.maps.ZoomControl();
  map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
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

const selectAttraction = async (attraction) => {
  selectedAttraction.value = attraction.no;

  const marker = markers.find((m) => {
    const position = m.getPosition();
    return (
      Math.abs(position.getLat() - attraction.latitude) < 0.0001 &&
      Math.abs(position.getLng() - attraction.longitude) < 0.0001
    );
  });

  if (marker) {
    map.setCenter(marker.getPosition());
    map.setLevel(3);
  }

  try {
    const response = await attractionAPI.getAttractionDetail(attraction.no);
    attractionDetail.value = response.data;
  } catch (error) {
    console.error("관광지 상세 정보 로드 중 오류 발생:", error);
    attractionDetail.value = attraction;
  }
};

const closeDetail = () => {
  attractionDetail.value = null;
  selectedAttraction.value = null;
};

const addToPlan = () => {
  if (!attractionDetail.value) return;
  emit("select-attraction", attractionDetail.value);
  closeDetail();
};

onMounted(async () => {
  await loadCategories();

  // 지도 초기화
  setTimeout(async () => {
    initializeMap();

    // 초기 랜덤 관광지 로드
    try {
      const response = await attractionAPI.getRandomAttractions(20); // 20개 랜덤 관광지
      attractions.value = response.data;
      totalCount.value = response.data.length;

      // 지도에 마커 표시
      updateMapMarkers();

      console.log("초기 랜덤 관광지 로드 완료:", attractions.value.length + "개");
    } catch (error) {
      console.error("초기 관광지 로드 중 오류 발생:", error);
    }
  }, 1000);
});

onUnmounted(() => {
  if (roadview) {
    roadview = null;
  }
  if (roadviewClient) {
    roadviewClient = null;
  }
});
</script>

<style scoped>
/* 전체 컨테이너 - 스크롤바 완전 제거 */
html,
body {
  margin: 0;
  padding: 0;
  overflow: hidden; /* body 스크롤바 제거 */
}

.attraction-map-view {
  position: fixed; /* absolute에서 fixed로 변경 */
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden; /* 스크롤바 완전 차단 */
  padding-top: 80px; /* 헤더 높이만큼 패딩 */
  box-sizing: border-box;
}

/* 기본 버튼 스타일 */
.search-panel-toggle,
.current-location-btn,
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

/* 검색 패널 토글 버튼 */
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
}

/* 반경 슬라이더 컨테이너 */
.radius-slider-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e9ecef;
}

/* 슬라이더 래퍼 */
.slider-wrapper {
  position: relative;
  margin-bottom: 16px;
}

/* 슬라이더 라벨 */
.slider-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #6c757d;
}

.slider-label-current {
  font-weight: 600;
  color: #0d6efd;
  font-size: 14px;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #0d6efd;
}

/* 슬라이더 스타일 */
.radius-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #dee2e6;
  outline: none;
  margin: 8px 0;
  position: relative;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}

/* 슬라이더 트랙 (Webkit) */
.radius-slider::-webkit-slider-track {
  width: 100%;
  height: 6px;
  background: linear-gradient(to right, #28a745 0%, #ffc107 50%, #dc3545 100%);
  border-radius: 3px;
}

/* 슬라이더 썸 (Webkit) */
.radius-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #0d6efd;
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.radius-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
}

/* 슬라이더 트랙 (Firefox) */
.radius-slider::-moz-range-track {
  width: 100%;
  height: 6px;
  background: linear-gradient(to right, #28a745 0%, #ffc107 50%, #dc3545 100%);
  border-radius: 3px;
  border: none;
}

/* 슬라이더 썸 (Firefox) */
.radius-slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #0d6efd;
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

/* 슬라이더 눈금 */
.slider-ticks {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  margin-top: -4px;
}

.tick {
  width: 1px;
  height: 8px;
  background: #adb5bd;
  opacity: 0.5;
}

.tick:nth-child(5n) {
  height: 12px;
  background: #6c757d;
  opacity: 0.8;
}

/* 슬라이더 컨트롤 버튼들 */
.slider-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.radius-search-btn,
.radius-auto-btn,
.radius-clear-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.radius-search-btn {
  background: #0d6efd;
  color: white;
  flex: 1;
}

.radius-search-btn:hover:not(:disabled) {
  background: #0b5ed7;
  transform: translateY(-1px);
}

.radius-search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.radius-search-btn.loading {
  background: #6c757d;
}

.radius-auto-btn {
  background: white;
  color: #6c757d;
  border: 1px solid #dee2e6;
  min-width: 60px;
}

.radius-auto-btn:hover {
  background: #f8f9fa;
  border-color: #0d6efd;
  color: #0d6efd;
}

.radius-auto-btn.active {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.radius-clear-btn {
  background: #dc3545;
  color: white;
  min-width: 40px;
  justify-content: center;
}

.radius-clear-btn:hover {
  background: #bb2d3b;
  transform: translateY(-1px);
}

/* 검색 결과 요약 */
.radius-results-summary {
  margin-top: 12px;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border-left: 3px solid #0d6efd;
}

.results-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.results-info i {
  color: #0d6efd;
}

.results-distance {
  font-size: 11px;
  color: #6c757d;
}

/* 애니메이션 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.radius-slider-container {
  animation: slideIn 0.3s ease-out;
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .slider-controls {
    flex-direction: column;
  }

  .radius-search-btn {
    width: 100%;
  }

  .radius-auto-btn,
  .radius-clear-btn {
    min-width: auto;
    flex: 1;
  }

  .slider-labels {
    font-size: 11px;
  }

  .slider-label-current {
    font-size: 12px;
  }
}

/* 현재 위치 버튼 */
.current-location-btn {
  top: 150px;
  left: 20px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #666;
  transition: left 0.3s ease;
}

.current-location-btn:hover {
  background: #f8f9fa;
  color: #0d6efd;
}

.current-location-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 현재 위치 버튼 활성 상태 */
.current-location-btn.active {
  background: #0d6efd;
  color: white;
}

.current-location-btn.active:hover {
  background: #0b5ed7;
}

/* 지도 컨트롤 버튼들 */
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
  position: relative;
}

.control-btn:hover {
  background: #f8f9fa;
  color: #0d6efd;
}

.control-btn.active {
  background: #0d6efd;
  color: white;
}

/* 검색 패널 - 스크롤바 제거 */
.search-panel {
  position: fixed;
  top: 65px; /* 헤더 높이에 맞춤 */
  left: -420px;
  width: 420px;
  height: calc(100vh - 65px); /* 전체 높이에서 헤더 높이 제외 */
  background: white;
  z-index: 1001;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease;
  overflow: hidden; /* 패널 자체의 스크롤바 제거 */
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

/* 검색 패널 컨텐츠 - 내부 스크롤만 허용 */
.search-panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden; /* 외부 스크롤 차단 */
}

/* 검색 섹션 */
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

.helper-text {
  font-size: 11px;
  color: #6c757d;
  font-weight: normal;
  margin-left: 4px;
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

.search-select:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
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

/* 반경 검색 */
.radius-search {
  display: flex;
  gap: 8px;
}

.radius-btn {
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.3s;
  white-space: nowrap;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.radius-btn:hover:not(:disabled) {
  background: #218838;
}

.radius-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 검색 결과 - 내부 스크롤 적용 */
.search-results {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #fafafa;
  overflow: hidden; /* 외부 스크롤 차단 */
}

.search-results.expanded {
  min-height: 400px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.results-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.results-header h4 i {
  color: #0d6efd;
}

.result-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-count {
  background: #0d6efd;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.items-per-page {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  background: white;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  flex: 1;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #0d6efd;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #6c757d;
  text-align: center;
  flex: 1;
  background: white;
  margin: 8px;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
}

.no-results-icon {
  font-size: 2rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-results p {
  margin: 0 0 8px 0;
  font-weight: 500;
}

.no-results small {
  font-size: 12px;
  opacity: 0.8;
}

/* 관광지 목록 - 내부 스크롤만 허용 */
.attraction-list {
  flex: 1;
  overflow-y: auto; /* 목록 내부 스크롤만 허용 */
  overflow-x: hidden; /* 가로 스크롤 차단 */
  padding: 8px;
  min-height: 0;
}

.attraction-item {
  display: flex;
  padding: 12px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 8px;
  border: 1px solid #eee;
}

.attraction-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #0d6efd;
}

.attraction-item.active {
  background: #e9f0ff;
  border-color: #0d6efd;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.2);
}

.attraction-image {
  width: 70px;
  height: 70px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.attraction-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.view-count {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 10px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.attraction-info {
  margin-left: 12px;
  flex: 1;
  min-width: 0;
}

.attraction-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attraction-location {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 4px;
}

.attraction-location i {
  color: #dc3545;
}

.attraction-category {
  margin: 0 0 4px 0;
  font-size: 11px;
  color: #0d6efd;
  background: #e9f0ff;
  padding: 2px 6px;
  border-radius: 10px;
  display: inline-block;
  font-weight: 500;
}

.attraction-distance {
  margin: 0;
  font-size: 11px;
  color: #28a745;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

.page-btn {
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 36px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

.page-btn:hover:not(:disabled):not(.active) {
  background: #f8f9fa;
  border-color: #0d6efd;
  color: #0d6efd;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8f9fa;
}

.page-btn.active {
  background: #0d6efd;
  color: white;
  border-color: #0d6efd;
  font-weight: 600;
}

.page-numbers {
  display: flex;
  gap: 2px;
}

.page-info-text {
  text-align: center;
  font-size: 11px;
  color: #6c757d;
  padding: 8px 20px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

/* 지도 컨테이너 - 스크롤바 완전 제거 */
.map-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden !important; /* 강제로 스크롤바 제거 */
}

/* 카카오맵 자체 스크롤바 제거 */
#kakao-map {
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
}

/* 상세 정보 카드 */
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

.detail-distance {
  color: #28a745 !important;
  font-weight: 500;
}

.detail-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.detail-btn {
  flex: 1;
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

.detail-btn.secondary {
  background: #6c757d;
  color: white;
}

.detail-btn.secondary:hover {
  background: #5a6268;
}

/* 로드뷰 컨테이너 */
.roadview-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80vw;
  height: 60vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 1003;
  overflow: hidden;
}

.roadview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.roadview-header h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.close-roadview {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.close-roadview:hover {
  background: #e9ecef;
}

.roadview-content {
  width: 100%;
  height: calc(100% - 60px);
}

/* 반응형 - 스크롤바 제거 유지 */
@media (max-width: 1024px) {
  .search-panel {
    width: 380px;
    left: -380px;
  }

  .detail-card {
    width: 320px;
  }

  .roadview-container {
    width: 90vw;
    height: 70vh;
  }
}

@media (max-width: 768px) {
  .attraction-map-view {
    padding-top: 60px;
  }

  .search-panel {
    width: 100vw;
    left: -100vw;
    top: 60px;
    height: calc(100vh - 60px);
  }

  .detail-card {
    width: calc(100vw - 20px);
    bottom: 10px;
    right: 10px;
    left: 10px;
  }

  .map-controls {
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
  }

  .current-location-btn {
    left: 10px !important;
    top: 120px;
  }

  .search-panel-toggle {
    left: 10px !important;
    top: 65px;
  }

  .roadview-container {
    width: 95vw;
    height: 80vh;
  }

  .search-section {
    padding: 10px 15px;
  }

  .attraction-list {
    padding: 6px;
  }
}

@media (max-width: 480px) {
  .search-panel-content {
    padding: 0;
  }

  .search-section {
    padding: 8px 12px;
  }

  .detail-card-content {
    padding: 12px;
  }

  .attraction-list {
    padding: 4px;
  }

  .search-panel-toggle {
    padding: 10px 12px;
    font-size: 14px;
  }

  .current-location-btn {
    width: 44px;
    height: 44px;
    top: 120px;
  }

  .control-btn {
    width: 44px;
    height: 44px;
    font-size: 14px;
  }

  .page-btn {
    padding: 4px 6px;
    min-width: 32px;
    height: 28px;
    font-size: 12px;
  }

  .detail-card {
    max-height: 70vh;
  }
}

/* 커스텀 스크롤바 - 내부 컨텐츠만 */
.attraction-list::-webkit-scrollbar,
.detail-card::-webkit-scrollbar {
  width: 6px;
}

.attraction-list::-webkit-scrollbar-track,
.detail-card::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.attraction-list::-webkit-scrollbar-thumb,
.detail-card::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.attraction-list::-webkit-scrollbar-thumb:hover,
.detail-card::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 전역 스크롤바 숨김 */
* {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

*::-webkit-scrollbar {
  width: 0px;
  background: transparent; /* Chrome/Safari/Webkit */
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

.attraction-item {
  animation: fadeIn 0.3s ease-out;
}

.detail-card {
  animation: fadeIn 0.4s ease-out;
}

.roadview-container {
  animation: fadeIn 0.3s ease-out;
}

/* 포커스 스타일 개선 */
.search-input:focus,
.search-select:focus,
.items-per-page:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

/* 툴팁 스타일 */
.control-btn::after {
  content: attr(title);
  position: absolute;
  bottom: 50%;
  right: 60px;
  transform: translateY(50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  z-index: 1000;
}

.control-btn:hover::after {
  opacity: 1;
}
</style>
