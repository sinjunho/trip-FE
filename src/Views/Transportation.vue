<!-- src/components/plan/Transportation.vue -->
<template>
  <div class="transportation-component">
    <div class="card">
      <div class="card-header bg-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0">교통 정보</h5>
      </div>

      <div class="card-body">
        <!-- 교통 수단 선택 탭 -->
        <ul class="nav nav-tabs mb-3">
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'public' }" @click="activeTab = 'public'">
              <i class="fas fa-bus me-1"></i> 대중교통
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'car' }" @click="activeTab = 'car'">
              <i class="fas fa-car me-1"></i> 자동차
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'taxi' }" @click="activeTab = 'taxi'">
              <i class="fas fa-taxi me-1"></i> 택시
            </button>
          </li>
        </ul>

        <!-- 출발지/도착지 입력 -->
        <div class="route-input mb-4">
          <div class="row">
            <div class="col-md-5">
              <div class="form-group">
                <label for="origin" class="form-label">출발지</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fas fa-map-marker-alt text-danger"></i></span>
                  <input type="text" id="origin" v-model="origin" class="form-control" placeholder="출발 위치 입력" />
                </div>
              </div>
            </div>
            <div class="col-md-2 text-center d-flex align-items-center justify-content-center">
              <button class="btn btn-outline-secondary btn-sm mt-4 exchange-btn" @click="exchangeLocations">
                <i class="fas fa-exchange-alt"></i>
              </button>
            </div>
            <div class="col-md-5">
              <div class="form-group">
                <label for="destination" class="form-label">도착지</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fas fa-map-marker-alt text-primary"></i></span>
                  <input
                    type="text"
                    id="destination"
                    v-model="destination"
                    class="form-control"
                    placeholder="도착 위치 입력"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-center mt-3">
            <button class="btn btn-primary" @click="searchRoute"><i class="fas fa-search me-1"></i> 경로 찾기</button>
          </div>
        </div>

        <!-- 로딩 상태 -->
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">로딩중...</span>
          </div>
        </div>

        <!-- 대중교통 탭 내용 -->
        <div v-else-if="activeTab === 'public' && routes.length > 0" class="tab-content">
          <div class="route-list">
            <div v-for="(route, index) in routes" :key="index" class="route-item card mb-3">
              <div class="card-body">
                <div class="route-header d-flex justify-content-between align-items-center mb-2">
                  <h6 class="mb-0">경로 {{ index + 1 }}</h6>
                  <div class="route-summary">
                    <span class="badge bg-primary me-2">{{ route.duration }}</span>
                    <span class="badge bg-secondary">{{ route.distance }}</span>
                  </div>
                </div>

                <div class="route-steps">
                  <div v-for="(step, stepIndex) in route.steps" :key="stepIndex" class="route-step">
                    <div class="step-icon" :class="getTransportClass(step.mode)">
                      <i :class="getTransportIcon(step.mode)"></i>
                    </div>
                    <div class="step-content">
                      <div class="step-info">{{ step.instruction }}</div>
                      <div class="step-detail text-muted">
                        <small>{{ step.duration }} · {{ step.distance }}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 자동차 탭 내용 -->
        <div v-else-if="activeTab === 'car' && carRoute" class="tab-content">
          <div class="car-route card mb-3">
            <div class="card-body">
              <div class="route-header d-flex justify-content-between align-items-center mb-3">
                <h6 class="mb-0">최적 경로</h6>
                <div class="route-summary">
                  <span class="badge bg-primary me-2">{{ carRoute.duration }}</span>
                  <span class="badge bg-secondary">{{ carRoute.distance }}</span>
                </div>
              </div>

              <div class="car-route-overview mb-3">
                <div id="route-map" style="height: 300px"></div>
              </div>

              <div class="route-steps">
                <div v-for="(step, stepIndex) in carRoute.steps" :key="stepIndex" class="route-step">
                  <div class="step-icon icon-car">
                    <i class="fas fa-arrow-alt-circle-right"></i>
                  </div>
                  <div class="step-content">
                    <div class="step-info">{{ step.instruction }}</div>
                    <div class="step-detail text-muted">
                      <small>{{ step.duration }} · {{ step.distance }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-body">
              <h6 class="card-title mb-3">주행 정보</h6>

              <div class="row">
                <div class="col-md-4">
                  <div class="info-item">
                    <div class="info-label">예상 거리</div>
                    <div class="info-value">{{ carRoute.distance }}</div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="info-item">
                    <div class="info-label">예상 시간</div>
                    <div class="info-value">{{ carRoute.duration }}</div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="info-item">
                    <div class="info-label">예상 주유비</div>
                    <div class="info-value">{{ calculateFuelCost() }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 택시 탭 내용 -->
        <div v-else-if="activeTab === 'taxi' && taxiInfo" class="tab-content">
          <div class="card mb-3">
            <div class="card-body">
              <h6 class="card-title mb-3">택시 요금 정보</h6>

              <div class="row">
                <div class="col-md-4">
                  <div class="info-item">
                    <div class="info-label">예상 거리</div>
                    <div class="info-value">{{ taxiInfo.distance }}</div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="info-item">
                    <div class="info-label">예상 시간</div>
                    <div class="info-value">{{ taxiInfo.duration }}</div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="info-item">
                    <div class="info-label">예상 요금</div>
                    <div class="info-value">{{ taxiInfo.fare }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card mb-3">
            <div class="card-body">
              <h6 class="card-title mb-3">택시 앱 바로가기</h6>

              <div class="taxi-apps d-flex flex-wrap gap-3">
                <a href="#" class="taxi-app-link" @click.prevent="openTaxiApp('kakao')">
                  <img src="/img/kakao-taxi.png" alt="카카오 택시" class="taxi-app-icon" />
                  <span>카카오 택시</span>
                </a>
                <a href="#" class="taxi-app-link" @click.prevent="openTaxiApp('tmap')">
                  <img src="/img/tmap-taxi.png" alt="T맵 택시" class="taxi-app-icon" />
                  <span>T맵 택시</span>
                </a>
                <a href="#" class="taxi-app-link" @click.prevent="openTaxiApp('uber')">
                  <img src="/img/uber.png" alt="우버" class="taxi-app-icon" />
                  <span>우버</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- 검색 결과 없음 -->
        <div v-else-if="searched && !loading" class="no-results text-center py-4">
          <p class="text-muted mb-3">검색된 경로가 없습니다.</p>
          <p>출발지와 목적지를 다시 확인하고 검색해주세요.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import axios from "axios";

// 상태 관리
const activeTab = ref("public");
const origin = ref("");
const destination = ref("");
const loading = ref(false);
const searched = ref(false);
const routes = ref([]);
const carRoute = ref(null);
const taxiInfo = ref(null);
let routeMap = null;

// 출발지/도착지 교환
const exchangeLocations = () => {
  const temp = origin.value;
  origin.value = destination.value;
  destination.value = temp;
};

// 경로 검색
const searchRoute = async () => {
  if (!origin.value || !destination.value) {
    alert("출발지와 도착지를 모두 입력해주세요.");
    return;
  }

  loading.value = true;
  searched.value = true;

  try {
    if (activeTab.value === "public") {
      await searchPublicTransportRoute();
    } else if (activeTab.value === "car") {
      await searchCarRoute();
    } else if (activeTab.value === "taxi") {
      await searchTaxiInfo();
    }
  } catch (error) {
    console.error("경로 검색 중 오류 발생:", error);
  } finally {
    loading.value = false;
  }
};

// 대중교통 경로 검색
const searchPublicTransportRoute = async () => {
  // 실제 API 호출로 대체 필요
  // 여기서는 더미 데이터 사용

  // 잠시 딜레이 (실제 API 호출 시간 시뮬레이션)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  routes.value = [
    {
      duration: "1시간 20분",
      distance: "15.2km",
      steps: [
        {
          mode: "walk",
          instruction: "강남역 2번 출구로 나가서 300m 직진",
          duration: "5분",
          distance: "300m",
        },
        {
          mode: "subway",
          instruction: "2호선 강남역에서 홍대입구역까지 이동",
          duration: "30분",
          distance: "12km",
        },
        {
          mode: "bus",
          instruction: "홍대입구역에서 7016번 버스 탑승",
          duration: "15분",
          distance: "2.5km",
        },
        {
          mode: "walk",
          instruction: "상수역 3번 출구에서 목적지까지 도보 이동",
          duration: "10분",
          distance: "400m",
        },
      ],
    },
    {
      duration: "1시간 10분",
      distance: "16.5km",
      steps: [
        {
          mode: "walk",
          instruction: "강남역 7번 출구로 나가서 200m 직진",
          duration: "3분",
          distance: "200m",
        },
        {
          mode: "bus",
          instruction: "463번 버스 탑승 후 신촌역에서 하차",
          duration: "45분",
          distance: "15km",
        },
        {
          mode: "walk",
          instruction: "신촌역에서 목적지까지 도보 이동",
          duration: "22분",
          distance: "1.3km",
        },
      ],
    },
  ];
};

// 자동차 경로 검색
const searchCarRoute = async () => {
  // 실제 API 호출로 대체 필요
  // 여기서는 더미 데이터 사용

  // 잠시 딜레이 (실제 API 호출 시간 시뮬레이션)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  carRoute.value = {
    duration: "35분",
    distance: "12.5km",
    steps: [
      {
        instruction: "강남대로를 따라 북쪽으로 500m 이동",
        duration: "2분",
        distance: "500m",
      },
      {
        instruction: "강남대로에서 좌회전하여 봉은사로로 진입",
        duration: "5분",
        distance: "1.2km",
      },
      {
        instruction: "봉은사로에서 우회전하여 테헤란로로 진입",
        duration: "8분",
        distance: "2.3km",
      },
      {
        instruction: "테헤란로를 따라 직진",
        duration: "15분",
        distance: "7km",
      },
      {
        instruction: "테헤란로에서 우회전하여 도착지로 진입",
        duration: "5분",
        distance: "1.5km",
      },
    ],
  };

  // 지도 업데이트
  setTimeout(() => {
    initializeRouteMap();
  }, 100);
};

// 택시 정보 검색
const searchTaxiInfo = async () => {
  // 실제 API 호출로 대체 필요
  // 여기서는 더미 데이터 사용

  // 잠시 딜레이 (실제 API 호출 시간 시뮬레이션)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  taxiInfo.value = {
    duration: "35분",
    distance: "12.5km",
    fare: "약 18,000원",
  };
};

// 지도 초기화
const initializeRouteMap = () => {
  if (!kakao || !kakao.maps) return;

  const mapContainer = document.getElementById("route-map");
  if (!mapContainer) return;

  const mapOption = {
    center: new kakao.maps.LatLng(37.5662952, 126.9779451), // 서울 중심
    level: 7,
  };

  routeMap = new kakao.maps.Map(mapContainer, mapOption);

  // 출발지, 도착지 마커 및 경로선 추가
  // (실제 구현 시 좌표 데이터 필요)
};

// 주유비 계산
const calculateFuelCost = () => {
  // 더미 데이터
  return "약 15,000원";
};

// 택시 앱 열기
const openTaxiApp = (appName) => {
  switch (appName) {
    case "kakao":
      window.open("https://taxi.kakao.com/", "_blank");
      break;
    case "tmap":
      window.open("https://www.tmap.co.kr/", "_blank");
      break;
    case "uber":
      window.open("https://www.uber.com/kr/ko/", "_blank");
      break;
  }
};

// 이동 수단별 아이콘 클래스 반환
const getTransportIcon = (mode) => {
  const icons = {
    walk: "fas fa-walking",
    subway: "fas fa-subway",
    bus: "fas fa-bus",
    train: "fas fa-train",
    car: "fas fa-car",
  };

  return icons[mode] || "fas fa-arrow-right";
};

// 이동 수단별 스타일 클래스 반환
const getTransportClass = (mode) => {
  const classes = {
    walk: "icon-walk",
    subway: "icon-subway",
    bus: "icon-bus",
    train: "icon-train",
    car: "icon-car",
  };

  return classes[mode] || "";
};

// 탭 변경 시 결과 초기화
watch(activeTab, () => {
  searched.value = false;
});

// 컴포넌트 마운트 시 초기화
onMounted(() => {
  // 사용자 위치 가져오기
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      // 현재 위치를 좌표를 이용해 주소로 변환하는 API 호출 필요
      // 여기서는 더미 데이터 사용
      origin.value = "현재 위치";
    });
  }
});
</script>

<style scoped>
.exchange-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.route-item {
  cursor: pointer;
  transition: transform 0.2s;
}

.route-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.route-steps {
  margin-top: 15px;
}

.route-step {
  display: flex;
  margin-bottom: 15px;
}

.step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e9ecef;
  color: #495057;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
}

.icon-walk {
  background-color: #e3f2fd;
  color: #0d6efd;
}

.icon-subway {
  background-color: #e8f5e9;
  color: #4caf50;
}

.icon-bus {
  background-color: #fff3e0;
  color: #ff9800;
}

.icon-car {
  background-color: #ede7f6;
  color: #673ab7;
}

.step-content {
  flex: 1;
}

.step-info {
  font-weight: 500;
  margin-bottom: 3px;
}

.info-item {
  margin-bottom: 15px;
}

.info-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 3px;
}

.info-value {
  font-weight: 600;
  font-size: 1.1rem;
}

.taxi-apps {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.taxi-app-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #495057;
  transition: transform 0.2s;
}

.taxi-app-link:hover {
  transform: translateY(-3px);
}

.taxi-app-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  margin-bottom: 5px;
}
</style>
