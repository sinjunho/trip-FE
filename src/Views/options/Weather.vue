<!-- src/components/plan/Weather.vue -->
<template>
  <div class="weather-component">
    <div class="card">
      <div class="card-header bg-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0">여행 기간 날씨</h5>
        <button @click="refreshWeather" class="btn btn-sm btn-outline-primary">
          <i class="fas fa-sync-alt"></i> 새로고침
        </button>
      </div>

      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">로딩중...</span>
          </div>
        </div>

        <div v-else-if="error" class="alert alert-warning">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ error }}
        </div>

        <div v-else-if="!weatherData || weatherData.length === 0" class="text-center py-4">
          <p class="text-muted mb-0">날씨 정보를 불러올 수 없습니다.</p>
        </div>

        <div v-else class="weather-forecast">
          <div class="weather-location mb-3">
            <i class="fas fa-map-marker-alt text-danger me-2"></i>
            <span class="location-name">{{ location }}</span>
          </div>

          <div class="weather-items">
            <div v-for="(item, index) in weatherData" :key="index" class="weather-item">
              <div class="weather-date">{{ formatWeatherDate(item.date) }}</div>
              <div class="weather-icon">
                <img :src="getWeatherIcon(item.icon)" :alt="item.description" />
              </div>
              <div class="weather-temp">{{ Math.round(item.temp) }}°C</div>
              <div class="weather-desc">{{ item.description }}</div>
              <div class="weather-details">
                <div class="weather-detail-item">
                  <i class="fas fa-tint text-primary"></i>
                  {{ item.humidity }}%
                </div>
                <div class="weather-detail-item">
                  <i class="fas fa-wind text-info"></i>
                  {{ item.windSpeed }}m/s
                </div>
              </div>
            </div>
          </div>

          <div class="weather-tip mt-3">
            <div class="alert alert-info">
              <i class="fas fa-info-circle me-2"></i>
              <span v-html="weatherTip"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";

const props = defineProps({
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: "서울",
  },
});

// 상태 관리
const weatherData = ref([]);
const loading = ref(false);
const error = ref(null);
const OPENWEATHER_API_KEY = "YOUR_OPENWEATHER_API_KEY"; // 실제 API 키로 교체 필요

// 날씨 상황에 따른 팁
const weatherTip = computed(() => {
  if (!weatherData.value || weatherData.value.length === 0) {
    return "날씨 정보가 없습니다.";
  }

  // 첫 날 날씨 기준으로 팁 제공
  const firstDay = weatherData.value[0];

  if (firstDay.description.includes("비")) {
    return "여행 기간에 <strong>비 소식</strong>이 있습니다. 우산이나 우비를 준비하세요.";
  } else if (firstDay.description.includes("눈")) {
    return "여행 기간에 <strong>눈 소식</strong>이 있습니다. 따뜻한 옷과 방한용품을 준비하세요.";
  } else if (firstDay.temp > 28) {
    return "여행 기간이 <strong>매우 덥습니다</strong>. 자외선 차단제와 선글라스, 모자를 준비하세요.";
  } else if (firstDay.temp < 5) {
    return "여행 기간이 <strong>춥습니다</strong>. 따뜻한 옷을 챙기고 핫팩을 준비하세요.";
  } else {
    return "여행 기간의 날씨가 <strong>쾌적할 것으로 예상</strong>됩니다. 즐거운 여행 되세요!";
  }
});

// 메서드
// 위치 이름으로 위도/경도 조회
const getCoordinates = async (locationName) => {
  try {
    const response = await axios.get(`https://api.openweathermap.org/geo/1.0/direct`, {
      params: {
        q: locationName,
        limit: 1,
        appid: OPENWEATHER_API_KEY,
      },
    });

    if (response.data.length === 0) {
      throw new Error("해당 위치를 찾을 수 없습니다.");
    }

    const location = response.data[0];
    return {
      lat: location.lat,
      lon: location.lon,
    };
  } catch (error) {
    console.error("위치 정보 조회 중 오류 발생:", error);
    throw error;
  }
};

// 날씨 정보 조회
const fetchWeather = async () => {
  try {
    loading.value = true;
    error.value = null;

    // 위도/경도 조회
    const { lat, lon } = await getCoordinates(props.location);

    // OpenWeather API 호출
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
      params: {
        lat: lat,
        lon: lon,
        units: "metric",
        appid: OPENWEATHER_API_KEY,
      },
    });

    // 데이터 가공
    const forecastData = response.data.list;
    const processedData = [];
    const uniqueDates = new Set();

    // 시작일과 종료일 기준으로 필터링
    const startDateObj = new Date(props.startDate);
    const endDateObj = new Date(props.endDate);

    forecastData.forEach((forecast) => {
      const forecastDate = new Date(forecast.dt * 1000);
      const dateStr = forecastDate.toISOString().split("T")[0];

      // 이미 처리한 날짜인지 확인 (1일 1개 데이터만 사용)
      if (uniqueDates.has(dateStr)) return;

      // 여행 기간 내 날짜인지 확인
      if (forecastDate >= startDateObj && forecastDate <= endDateObj) {
        uniqueDates.add(dateStr);

        processedData.push({
          date: dateStr,
          temp: forecast.main.temp,
          humidity: forecast.main.humidity,
          description: forecast.weather[0].description,
          icon: forecast.weather[0].icon,
          windSpeed: forecast.wind.speed,
        });
      }
    });

    weatherData.value = processedData;
  } catch (error) {
    console.error("날씨 정보 조회 중 오류 발생:", error);
    error.value = "날씨 정보를 불러오는 중 오류가 발생했습니다.";
  } finally {
    loading.value = false;
  }
};

// 날씨 정보 새로고침
const refreshWeather = () => {
  fetchWeather();
};

// 날짜 포맷
const formatWeatherDate = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
};

// 날씨 아이콘 URL 반환
const getWeatherIcon = (iconCode) => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

// props 변경 시 날씨 정보 다시 조회
watch([() => props.startDate, () => props.endDate, () => props.location], () => {
  fetchWeather();
});

// 컴포넌트 마운트 시 날씨 정보 조회
onMounted(() => {
  fetchWeather();
});
</script>

<style scoped>
.weather-location {
  font-size: 1.1rem;
  font-weight: 600;
}

.location-name {
  font-weight: 600;
}

.weather-items {
  display: flex;
  overflow-x: auto;
  gap: 15px;
  padding: 10px 0;
}

.weather-item {
  min-width: 120px;
  text-align: center;
  padding: 15px 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.weather-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.weather-date {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 10px;
}

.weather-icon {
  margin-bottom: 5px;
}

.weather-icon img {
  width: 50px;
  height: 50px;
}

.weather-temp {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.weather-desc {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 10px;
}

.weather-details {
  display: flex;
  justify-content: center;
  gap: 10px;
  font-size: 0.8rem;
  color: #6c757d;
}

.weather-detail-item {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
