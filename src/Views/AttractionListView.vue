<!-- src/views/AttractionListView.vue -->
<template>
  <div class="attraction-list-view">
    <div class="container py-4">
      <h1 class="mb-4">관광지 검색</h1>

      <!-- 검색 필터 영역 -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-3 mb-3">
              <label for="contentType" class="form-label">관광지 유형</label>
              <select id="contentType" v-model="searchParams.contentTypeName" class="form-select">
                <option value="">전체</option>
                <option v-for="type in contentTypes" :key="type.content_type_id" :value="type.content_type_id">
                  {{ type.content_type_name }}
                </option>
              </select>
            </div>

            <div class="col-md-3 mb-3">
              <label for="sido" class="form-label">시/도</label>
              <select id="sido" v-model="searchParams.areaCode" class="form-select" @change="resetGugun">
                <option value="">전체</option>
                <option v-for="sido in sidoList" :key="sido.sido_code" :value="sido.sido_code">
                  {{ sido.sido_name }}
                </option>
              </select>
            </div>

            <div class="col-md-3 mb-3">
              <label for="gugun" class="form-label">구/군</label>
              <select
                id="gugun"
                v-model="searchParams.siGunGuCode"
                class="form-select"
                :disabled="!searchParams.areaCode"
              >
                <option value="">전체</option>
                <option v-for="gugun in gugunList" :key="gugun.gugun_code" :value="gugun.gugun_code">
                  {{ gugun.gugun_name }}
                </option>
              </select>
            </div>

            <div class="col-md-3 d-flex align-items-end mb-3">
              <button @click="searchAttractions" class="btn btn-primary w-100">
                <i class="fas fa-search me-2"></i> 검색
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 지도 영역 (선택적) -->
      <div id="map" style="width: 100%; height: 350px" ref="map"></div>
      <!-- <div v-if="showMap" class="mb-4">
        <div class="card">
          <div class="card-body p-0"></div>
        </div>
      </div> -->

      <!-- 결과 필터 및 토글 -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="results-info">
          <span v-if="totalItems > 0">총 {{ totalItems }}개의 결과</span>
        </div>
        <div class="view-toggle">
          <button @click="showMap = !showMap" class="btn btn-outline-secondary btn-sm">
            <i :class="['fas', showMap ? 'fa-list' : 'fa-map-marked-alt']"></i>
            {{ showMap ? "목록 보기" : "지도 보기" }}
          </button>
        </div>
      </div>

      <!-- 관광지 목록 영역 -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">로딩중...</span>
        </div>
      </div>

      <div v-else-if="!attractions || attractions.length === 0" class="text-center py-5">
        <div class="alert alert-info">
          <i class="fas fa-info-circle me-2"></i>
          검색 결과가 없습니다. 다른 검색 조건을 선택해 보세요.
        </div>
      </div>

      <div v-else class="attraction-grid">
        <div v-for="attraction in attractions" :key="attraction.no" class="attraction-card">
          <router-link :to="`/attractions/${attraction.no}`" class="card-link">
            <div class="card h-100">
              <div class="card-img-container">
                <img
                  :src="attraction.firstImage1 || '/img/no-image.jpg'"
                  :alt="attraction.title"
                  class="card-img-top"
                />
              </div>
              <div class="card-body">
                <h5 class="card-title">{{ attraction.title }}</h5>
                <p class="card-text text-muted">{{ attraction.sido }} {{ attraction.gugun }}</p>
                <span class="badge bg-info">{{ attraction.contentTypeName }}</span>
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="totalPages > 0" class="pagination-container d-flex justify-content-center mt-4">
        <nav aria-label="Page navigation">
          <ul class="pagination">
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
</template>

<script setup>
import { ref, computed, onMounted, watch, useTemplateRef } from "vue";
import attractionAPI from "@/api/attraction";

// 상태 관리
const loading = ref(true);
const attractions = ref([]);
const contentTypes = ref([]);
const sidoList = ref([]);
const gugunList = ref([]);
const totalItems = ref(0);
const totalPages = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(12);
const showMap = ref(false);
let mapInstance = null;
let markers = [];

// 검색 파라미터
const searchParams = ref({
  contentTypeName: "",
  areaCode: "",
  siGunGuCode: "",
});

// 지도
const mapContainer = useTemplateRef("map");

const mapOption = {
  center: new window.kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
  level: 3, // 지도의 확대 레벨
};

onMounted(() => {
  // 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
  const map = new window.kakao.maps.Map(mapContainer.value, mapOption);
});

// 계산된 속성
const displayPages = computed(() => {
  const pages = [];
  const maxPages = 5;

  let startPage = Math.max(1, currentPage.value - Math.floor(maxPages / 2));
  let endPage = startPage + maxPages - 1;

  if (endPage > totalPages.value) {
    endPage = totalPages.value;
    startPage = Math.max(1, endPage - maxPages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
});

// 메서드
const loadContentTypes = async () => {
  try {
    const response = await attractionAPI.getContentTypes();
    contentTypes.value = response.data;
  } catch (error) {
    console.error("콘텐츠 타입 목록을 가져오는 중 오류 발생:", error);
  }
};

const loadSido = async () => {
  try {
    const response = await attractionAPI.getSido();
    sidoList.value = response.data;
  } catch (error) {
    console.error("시도 목록을 가져오는 중 오류 발생:", error);
  }
};

const loadGugun = async (sidoCode) => {
  try {
    if (!sidoCode) {
      gugunList.value = [];
      return;
    }

    const response = await attractionAPI.getGugun(sidoCode);
    gugunList.value = response.data;
  } catch (error) {
    console.error("구군 목록을 가져오는 중 오류 발생:", error);
    gugunList.value = [];
  }
};

const resetGugun = () => {
  searchParams.value.siGunGuCode = "";
  if (searchParams.value.areaCode) {
    loadGugun(searchParams.value.areaCode);
  } else {
    gugunList.value = [];
  }
};

const searchAttractions = async () => {
  currentPage.value = 1;
  fetchAttractions();
};

const fetchAttractions = async () => {
  try {
    loading.value = true;

    const params = {
      ...searchParams.value,
      offset: (currentPage.value - 1) * itemsPerPage.value,
      limit: itemsPerPage.value,
    };

    const response = await attractionAPI.getAttractions(params);

    attractions.value = response.data;
    totalItems.value = response.data.length; // API가 총 개수를 반환한다면 조정 필요
    totalPages.value = Math.ceil(totalItems.value / itemsPerPage.value);

    if (showMap.value) {
      updateMap();
    }
  } catch (error) {
    console.error("관광지 목록을 가져오는 중 오류 발생:", error);
    attractions.value = [];
  } finally {
    loading.value = false;
  }
};

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchAttractions();
};

// 지도 관련 함수들
const initMap = () => {
  // 카카오맵 API가 로드되었는지 확인
  if (window.kakao && window.kakao.maps) {
    const container = document.getElementById("map");
    if (!container) return;

    const options = {
      center: new window.kakao.maps.LatLng(36.2683, 127.6358), // 대한민국 중심 좌표
      level: 13,
    };

    mapInstance = new window.kakao.maps.Map(container, options);
  }
};

const updateMap = () => {
  if (!mapInstance || !attractions.value.length) return;

  // 기존 마커 제거
  markers.forEach((marker) => marker.setMap(null));
  markers = [];

  // 새로운 마커 추가
  const bounds = new window.kakao.maps.LatLngBounds();

  attractions.value.forEach((attraction) => {
    if (!attraction.latitude || !attraction.longitude) return;

    const position = new window.kakao.maps.LatLng(attraction.latitude, attraction.longitude);
    const marker = new window.kakao.maps.Marker({
      position: position,
      map: mapInstance,
    });

    // 인포윈도우 생성
    const infowindow = new window.kakao.maps.InfoWindow({
      content: `<div style="padding:5px;font-size:12px;">${attraction.title}</div>`,
    });

    // 마커 클릭 이벤트
    window.kakao.maps.event.addListener(marker, "click", () => {
      infowindow.open(mapInstance, marker);
    });

    markers.push(marker);
    bounds.extend(position);
  });

  // 지도 범위 재설정
  if (markers.length > 0) {
    mapInstance.setBounds(bounds);
  }
};

// 감시자
watch(
  () => searchParams.value.areaCode,
  (newSidoCode) => {
    loadGugun(newSidoCode);
  }
);

watch(
  () => showMap.value,
  (newValue) => {
    if (newValue) {
      // 지도가 표시될 때, DOM이 렌더링될 시간을 주기 위해 약간의 지연 추가
      setTimeout(() => {
        initMap();
        updateMap();
      }, 100);
    }
  }
);

// 컴포넌트 마운트 시 실행
onMounted(async () => {
  // 카카오맵 API 로드
  if (window.kakao && window.kakao.maps) {
    initMap();
  } else {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_API_KEY}&autoload=false`;
    script.onload = () => {
      window.kakao.maps.load(initMap);
    };
    document.head.appendChild(script);
  }

  // 초기 데이터 로드
  await Promise.all([loadContentTypes(), loadSido()]);

  // 랜덤 관광지 로드
  try {
    const response = await attractionAPI.getRandomAttractions();
    attractions.value = response.data;
    totalItems.value = response.data.length;
    totalPages.value = Math.ceil(totalItems.value / itemsPerPage.value);
    loading.value = false;
  } catch (error) {
    console.error("랜덤 관광지를 가져오는 중 오류 발생:", error);
    loading.value = false;
  }
});
</script>

<style scoped>
.attraction-list-view .card {
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  overflow: hidden;
}

.attraction-map {
  width: 100%;
  height: 500px;
  border-radius: 0 0 10px 10px;
}

.attraction-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.attraction-card {
  transition: transform 0.3s ease;
}

.attraction-card:hover {
  transform: translateY(-5px);
}

.card-link {
  text-decoration: none;
  color: inherit;
}

.card-img-container {
  height: 200px;
  overflow: hidden;
}

.card-img-top {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.attraction-card:hover .card-img-top {
  transform: scale(1.05);
}

.card-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination-container .pagination {
  margin-bottom: 0;
}

.pagination .page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.pagination .page-link {
  color: #0d6efd;
}
</style>
