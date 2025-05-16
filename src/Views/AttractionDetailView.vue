<!-- src/views/AttractionDetailView.vue -->
<template>
  <div class="attraction-detail-view">
    <div class="container py-4">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">로딩중...</span>
        </div>
      </div>

      <div v-else-if="!attraction" class="text-center py-5">
        <div class="alert alert-warning">
          <i class="fas fa-exclamation-triangle me-2"></i> 관광지 정보를 찾을 수 없습니다.
        </div>
        <router-link to="/attractions" class="btn btn-primary mt-3">
          <i class="fas fa-arrow-left me-2"></i> 목록으로 돌아가기
        </router-link>
      </div>

      <div v-else>
        <!-- 관광지 상세 정보 -->
        <div class="row">
          <div class="col-lg-8">
            <!-- 이미지 섹션 -->
            <div class="attraction-image-container mb-4">
              <img :src="attraction.firstImage1 || '/img/no-image.jpg'" alt="관광지 이미지" class="attraction-image" />
            </div>

            <!-- 기본 정보 섹션 -->
            <div class="card mb-4">
              <div class="card-header bg-white">
                <h2 class="mb-0">{{ attraction.title }}</h2>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <h5 class="text-muted"><i class="fas fa-map-marker-alt me-2"></i> 위치</h5>
                    <p>{{ attraction.addr }}</p>
                  </div>

                  <div class="col-md-6 mb-3">
                    <h5 class="text-muted"><i class="fas fa-tag me-2"></i> 유형</h5>
                    <p>{{ attraction.contentTypeName }}</p>
                  </div>

                  <div class="col-md-6 mb-3">
                    <h5 class="text-muted"><i class="fas fa-phone me-2"></i> 연락처</h5>
                    <p>{{ attraction.tel || "정보 없음" }}</p>
                  </div>

                  <div class="col-md-6 mb-3">
                    <h5 class="text-muted"><i class="fas fa-globe me-2"></i> 홈페이지</h5>
                    <p v-if="attraction.homepage">
                      <a :href="attraction.homepage" target="_blank" rel="noopener noreferrer">
                        바로가기 <i class="fas fa-external-link-alt ms-1"></i>
                      </a>
                    </p>
                    <p v-else>정보 없음</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 상세 설명 섹션 -->
            <div class="card mb-4">
              <div class="card-header bg-white">
                <h3 class="mb-0">상세 설명</h3>
              </div>
              <div class="card-body">
                <div v-if="attraction.overview" v-html="attraction.overview"></div>
                <div v-else class="text-muted">상세 설명이 없습니다.</div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <!-- 지도 섹션 -->
            <div class="card mb-4">
              <div class="card-header bg-white">
                <h3 class="mb-0">위치 정보</h3>
              </div>
              <div class="card-body p-0">
                <div id="map" class="attraction-map"></div>
              </div>
            </div>

            <!-- 주변 관광지 섹션 -->
            <div class="card" v-if="nearbyAttractions && nearbyAttractions.length > 0">
              <div class="card-header bg-white">
                <h3 class="mb-0">주변 관광지</h3>
              </div>
              <div class="card-body p-0">
                <ul class="list-group list-group-flush">
                  <li v-for="item in nearbyAttractions" :key="item.no" class="list-group-item">
                    <router-link :to="`/attractions/${item.no}`" class="d-flex align-items-center text-decoration-none">
                      <div class="nearby-attraction-img">
                        <img :src="item.firstImage1 || '/img/no-image.jpg'" alt="관광지 이미지" />
                      </div>
                      <div class="ms-3">
                        <h5 class="mb-1">{{ item.title }}</h5>
                        <p class="mb-0 text-muted small">{{ item.addr }}</p>
                      </div>
                    </router-link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 돌아가기 버튼 -->
        <div class="mt-4">
          <router-link to="/attractions" class="btn btn-secondary">
            <i class="fas fa-arrow-left me-2"></i> 목록으로 돌아가기
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import attractionAPI from "@/api/attraction";

const route = useRoute();
const loading = ref(true);
const attraction = ref(null);
const nearbyAttractions = ref([]);
let mapInstance = null;

// 관광지 상세 정보 가져오기
const fetchAttractionDetail = async () => {
  try {
    loading.value = true;
    const attractionId = parseInt(route.params.id);

    if (isNaN(attractionId)) {
      throw new Error("유효하지 않은 관광지 ID입니다.");
    }

    const response = await attractionAPI.getAttractionDetail(attractionId);
    attraction.value = response.data;

    // 주변 관광지 정보 가져오기
    fetchNearbyAttractions(attractionId);

    // 지도 초기화
    setTimeout(() => {
      initMap();
    }, 500);
  } catch (error) {
    console.error("관광지 상세 정보를 가져오는 중 오류 발생:", error);
  } finally {
    loading.value = false;
  }
};

// 주변 관광지 정보 가져오기
const fetchNearbyAttractions = async (attractionId) => {
  try {
    const response = await attractionAPI.getNearbyAttractions(attractionId);
    nearbyAttractions.value = response.data.slice(0, 5); // 최대 5개만 표시
  } catch (error) {
    console.error("주변 관광지 정보를 가져오는 중 오류 발생:", error);
    nearbyAttractions.value = [];
  }
};

// 지도 초기화
const initMap = () => {
  if (!attraction.value || !attraction.value.latitude || !attraction.value.longitude) return;

  // 카카오맵 API가 로드되었는지 확인
  if (window.kakao && window.kakao.maps) {
    const container = document.getElementById("map");
    const options = {
      center: new window.kakao.maps.LatLng(attraction.value.latitude, attraction.value.longitude),
      level: 3,
    };

    mapInstance = new window.kakao.maps.Map(container, options);

    // 마커 생성
    const markerPosition = new window.kakao.maps.LatLng(attraction.value.latitude, attraction.value.longitude);
    const marker = new window.kakao.maps.Marker({
      position: markerPosition,
    });

    // 마커 지도에 표시
    marker.setMap(mapInstance);

    // 인포윈도우 생성
    const iwContent = `<div style="padding:5px;font-size:12px;">${attraction.value.title}</div>`;
    const infowindow = new window.kakao.maps.InfoWindow({
      content: iwContent,
    });

    // 인포윈도우 표시
    infowindow.open(mapInstance, marker);
  } else {
    // 카카오맵 API가 로드되지 않았을 경우, 로드 후 재시도
    console.log("카카오맵 API를 로드하는 중입니다...");
    setTimeout(initMap, 500);
  }
};

// 컴포넌트 마운트 시 실행
onMounted(() => {
  // 카카오맵 API 로드
  if (!window.kakao || !window.kakao.maps) {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_API_KEY}&autoload=false`;
    script.onload = () => {
      window.kakao.maps.load(() => {
        fetchAttractionDetail();
      });
    };
    document.head.appendChild(script);
  } else {
    fetchAttractionDetail();
  }
});

// 컴포넌트 언마운트 시 정리
onUnmounted(() => {
  // 필요한 정리 작업이 있다면 여기에 추가
  mapInstance = null;
});
</script>

<style scoped>
.attraction-detail-view .card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 20px;
}

.attraction-detail-view .card-header {
  border-bottom: 1px solid #eee;
  padding: 1rem 1.5rem;
}

.attraction-image-container {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  height: 400px;
}

.attraction-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.attraction-map {
  width: 100%;
  height: 300px;
  border-radius: 0 0 10px 10px;
}

.nearby-attraction-img {
  width: 60px;
  height: 60px;
  border-radius: 5px;
  overflow: hidden;
  flex-shrink: 0;
}

.nearby-attraction-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.list-group-item {
  transition: background-color 0.2s;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}
</style>
