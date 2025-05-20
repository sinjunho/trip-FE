<!-- src/views/PlanShareView.vue -->
<template>
  <div class="plan-share-view">
    <div class="container py-4">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">로딩중...</span>
        </div>
      </div>

      <div v-else-if="error" class="alert alert-danger text-center">
        <i class="fas fa-exclamation-circle me-2"></i>
        {{ error }}
      </div>

      <div v-else>
        <!-- 헤더 섹션 -->
        <div class="card mb-4">
          <div class="card-body">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
              <div>
                <h1 class="mb-2">{{ plan.title }}</h1>
                <p class="text-muted">{{ formatDate(plan.startDate) }} ~ {{ formatDate(plan.endDate) }}</p>
                <p class="mb-0">{{ plan.description }}</p>
              </div>
              <div class="action-buttons mt-3 mt-md-0">
                <button class="btn btn-outline-primary" @click="copyShareLink">
                  <i class="fas fa-share-alt"></i> 공유하기
                </button>
                <button v-if="!isLoggedIn" class="btn btn-outline-primary ms-2" @click="goToLogin">
                  <i class="fas fa-sign-in-alt"></i> 로그인
                </button>
                <button v-else-if="isCopyPossible" class="btn btn-outline-success ms-2" @click="copyPlan">
                  <i class="fas fa-copy"></i> 내 계획으로 복사
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 여행 일정 개요 섹션 -->
        <div class="row mb-4">
          <div class="col-md-8">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title mb-4">여행 일정 개요</h5>

                <div class="timeline">
                  <div
                    v-for="day in dayCount"
                    :key="day"
                    class="timeline-item"
                    :class="{ 'timeline-item-active': selectedDay === day }"
                    @click="selectedDay = day"
                  >
                    <div class="timeline-date">
                      <span class="timeline-day">{{ day }}일차</span>
                      <span class="timeline-full-date">{{ getDayDate(day) }}</span>
                    </div>
                    <div class="timeline-content">
                      <div v-if="getDayDetails(day).length === 0" class="text-muted">일정 없음</div>
                      <div v-else>
                        <div v-for="(detail, index) in getDayDetails(day)" :key="index" class="timeline-item-brief">
                          <i class="fas fa-map-marker-alt text-danger me-2"></i>
                          {{ detail.title }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <!-- 여행 정보 카드 -->
            <div class="card mb-3">
              <div class="card-body">
                <h5 class="card-title mb-3">여행 정보</h5>
                <ul class="list-group list-group-flush">
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span><i class="fas fa-calendar me-2"></i> 기간</span>
                    <span class="badge bg-primary rounded-pill">{{ dayCount }}일</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span><i class="fas fa-map-marked-alt me-2"></i> 방문 장소</span>
                    <span class="badge bg-primary rounded-pill">{{ totalPlaces }}곳</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span><i class="fas fa-user me-2"></i> 작성자</span>
                    <span>{{ plan.userId }}</span>
                  </li>
                  <!-- PlanShareView.vue 계속 -->
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span><i class="far fa-calendar-alt me-2"></i> 작성일</span>
                    <span>{{ formatDate(plan.createdAt) }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- 메모 카드 -->
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h5 class="card-title mb-0">여행 팁</h5>
                </div>
                <div class="tips-container">
                  <div class="tip-item">
                    <i class="fas fa-plane text-primary me-2"></i>
                    항공권은 최소 2개월 전에 예약하는 것이 좋습니다.
                  </div>
                  <div class="tip-item">
                    <i class="fas fa-bed text-primary me-2"></i>
                    숙소는 교통이 편리한 곳으로 선택하세요.
                  </div>
                  <div class="tip-item">
                    <i class="fas fa-umbrella-beach text-primary me-2"></i>
                    방문 시기에 맞는 복장과 준비물을 챙기세요.
                  </div>
                  <div class="tip-item">
                    <i class="fas fa-credit-card text-primary me-2"></i>
                    현지 화폐와 카드 사용 가능 여부를 미리 확인하세요.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 선택된 일차 상세 정보 -->
        <div class="card mb-4">
          <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0">{{ selectedDay }}일차 상세 일정 ({{ getDayDate(selectedDay) }})</h5>
            <div class="btn-group">
              <button class="btn btn-sm btn-outline-secondary" :disabled="selectedDay === 1" @click="selectedDay--">
                <i class="fas fa-chevron-left"></i> 이전 일차
              </button>
              <button
                class="btn btn-sm btn-outline-secondary"
                :disabled="selectedDay === dayCount"
                @click="selectedDay++"
              >
                다음 일차 <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
          <div class="card-body">
            <div v-if="getDayDetails(selectedDay).length === 0" class="text-center py-4">
              <p class="text-muted mb-3">이 날짜에 계획된 일정이 없습니다.</p>
            </div>
            <div v-else>
              <div class="day-detail-timeline">
                <div v-for="(detail, index) in getDayDetails(selectedDay)" :key="index" class="day-detail-item">
                  <div class="day-detail-time">
                    {{ formatTime(detail.visitTime) }}
                    <div class="day-detail-duration text-muted">
                      {{ formatDuration(detail.stayDuration) }}
                    </div>
                  </div>
                  <div class="day-detail-content">
                    <h5>{{ detail.title }}</h5>
                    <p v-if="detail.description" class="mb-2">{{ detail.description }}</p>

                    <div v-if="detail.attractionId && detail.attraction" class="attraction-info">
                      <div class="card mb-3">
                        <div class="row g-0">
                          <div class="col-md-4">
                            <img
                              :src="detail.attraction.firstImage1 || '/img/no-image.jpg'"
                              class="img-fluid rounded-start"
                              :alt="detail.attraction.title"
                            />
                          </div>
                          <div class="col-md-8">
                            <div class="card-body">
                              <h5 class="card-title">{{ detail.attraction.title }}</h5>
                              <p class="card-text">
                                <small class="text-muted">
                                  <i class="fas fa-map-marker-alt"></i>
                                  {{ detail.attraction.sido }} {{ detail.attraction.gugun }}
                                </small>
                              </p>
                              <p class="card-text attraction-overview">
                                {{ detail.attraction.overview }}
                              </p>
                              <router-link
                                :to="`/attractions/${detail.attraction.no}`"
                                class="btn btn-sm btn-outline-primary"
                              >
                                상세 정보 보기
                              </router-link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 지도 섹션 -->
        <div class="card mb-4">
          <div class="card-header bg-white">
            <h5 class="mb-0">{{ selectedDay }}일차 경로</h5>
          </div>
          <div class="card-body p-0">
            <div id="map" style="height: 400px"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import planAPI from "@/api/plan";
import attractionAPI from "@/api/attraction";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const planId = parseInt(route.params.id);
const loading = ref(true);
const error = ref(null);
const plan = ref({
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  details: [],
});
const selectedDay = ref(1);
let map = null;
let markers = [];

// 인증 상태 확인
const isLoggedIn = computed(() => authStore.isAuthenticated);

// 계획 복사 가능 여부 (로그인 상태이고 자신의 계획이 아닌 경우)
const isCopyPossible = computed(() => {
  return isLoggedIn.value && plan.value.userId !== authStore.user?.id;
});

// 일수 계산
const dayCount = computed(() => {
  if (!plan.value.startDate || !plan.value.endDate) return 0;

  const start = new Date(plan.value.startDate);
  const end = new Date(plan.value.endDate);

  // 날짜 차이 계산 (밀리초 단위)
  const diffTime = Math.abs(end - start);
  // 일 단위로 변환하고 1을 더함 (시작일 포함)
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
});

// 총 방문 장소 수
const totalPlaces = computed(() => {
  return plan.value.details.filter((detail) => !!detail.title).length;
});

// 여행 계획 상세 정보 조회
const fetchPlanDetail = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await planAPI.getSharedPlan(planId);
    plan.value = response.data;

    // 관광지 정보 로드
    await loadAttractionDetails();
  } catch (error) {
    console.error("여행 계획 상세 정보 조회 중 오류 발생:", error);
    error.value = "여행 계획을 불러올 수 없습니다. 잘못된 링크이거나 삭제된 계획일 수 있습니다.";
  } finally {
    loading.value = false;
  }
};

// 관광지 정보 로드
const loadAttractionDetails = async () => {
  try {
    const attractionIds = plan.value.details
      .filter((detail) => detail.attractionId)
      .map((detail) => detail.attractionId);

    if (attractionIds.length === 0) return;

    const promises = attractionIds.map((id) => attractionAPI.getAttractionDetail(id));
    const responses = await Promise.all(promises);

    responses.forEach((response) => {
      const attraction = response.data;
      plan.value.details.forEach((detail) => {
        if (detail.attractionId === attraction.no) {
          detail.attraction = attraction;
        }
      });
    });
  } catch (error) {
    console.error("관광지 정보 로드 중 오류 발생:", error);
  }
};

// 특정 일차의 세부 일정 가져오기
const getDayDetails = (day) => {
  return plan.value.details
    .filter((detail) => detail.dayNumber === day)
    .sort((a, b) => {
      if (a.visitTime && b.visitTime) {
        return a.visitTime.localeCompare(b.visitTime);
      } else if (a.visitTime) {
        return -1;
      } else if (b.visitTime) {
        return 1;
      } else {
        return a.orderNo - b.orderNo;
      }
    });
};

// 날짜 포맷
const formatDate = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

// 특정 일차의 날짜 계산
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

// 시간 포맷
const formatTime = (timeStr) => {
  if (!timeStr) return "";

  return timeStr.substring(0, 5);
};

// 소요 시간 포맷
const formatDuration = (minutes) => {
  if (!minutes) return "";

  if (minutes < 60) {
    return `${minutes}분`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}시간`;
    } else {
      return `${hours}시간 ${remainingMinutes}분`;
    }
  }
};

// 공유 링크 복사
const copyShareLink = () => {
  const shareLink = window.location.href;

  navigator.clipboard
    .writeText(shareLink)
    .then(() => {
      alert("공유 링크가 클립보드에 복사되었습니다.");
    })
    .catch(() => {
      // 클립보드 API가 지원되지 않는 경우 fallback
      const tempInput = document.createElement("input");
      tempInput.value = shareLink;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      alert("공유 링크가 클립보드에 복사되었습니다.");
    });
};

// 로그인 페이지로 이동
const goToLogin = () => {
  router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`);
};

// 내 계획으로 복사
const copyPlan = async () => {
  try {
    if (!confirm("이 여행 계획을 내 계획으로 복사하시겠습니까?")) {
      return;
    }

    // 복사할 계획 준비
    const newPlan = {
      title: `${plan.value.title} (복사본)`,
      description: plan.value.description,
      startDate: plan.value.startDate,
      endDate: plan.value.endDate,
      details: plan.value.details.map((detail) => ({
        dayNumber: detail.dayNumber,
        attractionId: detail.attractionId,
        title: detail.title,
        description: detail.description,
        visitTime: detail.visitTime,
        stayDuration: detail.stayDuration,
        orderNo: detail.orderNo,
      })),
    };

    const response = await planAPI.createPlan(newPlan);
    alert("여행 계획이 내 계획으로 복사되었습니다.");
    router.push(`/plans/${response.data.planId}`);
  } catch (error) {
    console.error("여행 계획 복사 중 오류 발생:", error);
    alert("여행 계획 복사에 실패했습니다.");
  }
};

// 지도 초기화
const initializeMap = () => {
  if (!kakao || !kakao.maps) return;

  const mapContainer = document.getElementById("map");
  const mapOption = {
    center: new kakao.maps.LatLng(33.450701, 126.570667),
    level: 7,
  };

  map = new kakao.maps.Map(mapContainer, mapOption);
};

// 지도에 마커 표시
const updateMapMarkers = () => {
  if (!map) return;

  // 기존 마커 제거
  markers.forEach((marker) => marker.setMap(null));
  markers = [];

  // 선택된 일차의 세부 일정 가져오기
  const dayDetails = getDayDetails(selectedDay.value);

  // 관광지가 있는 일정만 필터링
  const locations = dayDetails
    .filter((detail) => detail.attraction && detail.attraction.latitude && detail.attraction.longitude)
    .map((detail, index) => ({
      title: detail.title,
      lat: detail.attraction.latitude,
      lng: detail.attraction.longitude,
      order: index + 1,
    }));

  if (locations.length === 0) return;

  // 마커 생성
  const bounds = new kakao.maps.LatLngBounds();

  locations.forEach((location) => {
    const position = new kakao.maps.LatLng(location.lat, location.lng);

    // 마커 생성
    const marker = new kakao.maps.Marker({
      position: position,
      map: map,
    });

    // 인포윈도우 생성
    const content = `
      <div style="padding:5px; width:150px; text-align:center; font-size:12px;">
        <strong>${location.order}. ${location.title}</strong>
      </div>
    `;

    const infowindow = new kakao.maps.InfoWindow({
      content: content,
      removable: true,
    });

    // 마커 클릭 시 인포윈도우 표시
    kakao.maps.event.addListener(marker, "click", function () {
      infowindow.open(map, marker);
    });

    // 배열에 마커 추가
    markers.push(marker);

    // 지도 범위에 포함
    bounds.extend(position);
  });

  // 경로선 그리기
  if (locations.length > 1) {
    const linePath = locations.map((location) => new kakao.maps.LatLng(location.lat, location.lng));

    const polyline = new kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 3,
      strokeColor: "#5882FA",
      strokeOpacity: 0.7,
      strokeStyle: "solid",
    });

    polyline.setMap(map);
  }

  // 지도 범위 설정
  map.setBounds(bounds);
};

// 선택된 일자가 변경될 때 지도 업데이트
watch(selectedDay, () => {
  setTimeout(() => {
    updateMapMarkers();
  }, 100);
});

// 컴포넌트 마운트 시 여행 계획 상세 정보 불러오기
onMounted(async () => {
  await fetchPlanDetail();

  // 지도 초기화 (카카오맵 API가 로드된 경우)
  setTimeout(() => {
    initializeMap();
    updateMapMarkers();
  }, 1000);
});
</script>

<style scoped>
/* PlanDetailView와 동일한 스타일 적용 */
.timeline {
  position: relative;
  margin: 0 0 30px 0;
}

.timeline-item {
  position: relative;
  padding: 12px 0;
  border-left: 2px solid #e9ecef;
  padding-left: 20px;
  margin-left: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.timeline-item:hover {
  background-color: #f8f9fa;
}

.timeline-item-active {
  border-left: 2px solid #0d6efd;
  background-color: #e9f0ff;
}

.timeline-date {
  margin-bottom: 5px;
}

.timeline-day {
  font-weight: bold;
  margin-right: 10px;
}

.timeline-full-date {
  color: #6c757d;
  font-size: 0.9rem;
}

.timeline-item-brief {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 3px 0;
}

.day-detail-timeline {
  position: relative;
}

.day-detail-item {
  display: flex;
  margin-bottom: 30px;
  position: relative;
}

.day-detail-item:not(:last-child)::after {
  content: "";
  position: absolute;
  top: 30px;
  left: 80px;
  height: calc(100% + 30px);
  border-left: 2px dashed #e9ecef;
}

.day-detail-time {
  min-width: 80px;
  font-weight: bold;
  text-align: center;
  padding-top: 5px;
}

.day-detail-duration {
  font-size: 0.8rem;
  font-weight: normal;
}

.day-detail-content {
  flex: 1;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-left: 20px;
  position: relative;
}

.day-detail-content::before {
  content: "";
  position: absolute;
  top: 15px;
  left: -10px;
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-right: 10px solid #f8f9fa;
}

.attraction-overview {
  max-height: 4.5em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* 여행 팁 스타일 */
.tips-container {
  margin-top: 10px;
}

.tip-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
}

.tip-item:last-child {
  border-bottom: none;
}
</style>
