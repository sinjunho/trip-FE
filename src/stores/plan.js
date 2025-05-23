// src/stores/plan.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import planAPI from "@/api/plan";

export const usePlanStore = defineStore("plan", () => {
  // State
  const currentPlan = ref(null);
  const plans = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // 날씨 정보
  const weatherData = ref({
    current: null,
    forecast: [],
  });

  // 예산 정보
  const budgetData = ref({
    total: 0,
    categories: {},
    expenses: [],
  });

  // 교통 정보
  const transportData = ref({
    routes: [],
    realTimeInfo: {},
  });

  // 메모 및 알림
  const notes = ref([]);
  const alerts = ref([]);

  // Getters
  const todaySchedule = computed(() => {
    if (!currentPlan.value) return [];

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // 오늘 날짜에 해당하는 일정 찾기
    const startDate = new Date(currentPlan.value.startDate);
    const dayDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

    if (dayDiff < 0) return []; // 여행 시작 전

    const dayNumber = dayDiff + 1;
    return currentPlan.value.details
      .filter((detail) => detail.dayNumber === dayNumber)
      .sort((a, b) => {
        if (a.visitTime && b.visitTime) {
          return a.visitTime.localeCompare(b.visitTime);
        }
        return a.orderNo - b.orderNo;
      });
  });

  const remainingBudget = computed(() => {
    const totalExpenses = budgetData.value.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    return budgetData.value.total - totalExpenses;
  });

  const budgetByCategory = computed(() => {
    const categoryTotals = {};

    budgetData.value.expenses.forEach((expense) => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += expense.amount;
    });

    return categoryTotals;
  });

  const weatherAlerts = computed(() => {
    const alerts = [];

    if (weatherData.value.current) {
      // 비 예보
      if (weatherData.value.current.weather.includes("rain")) {
        alerts.push({
          type: "weather",
          severity: "warning",
          icon: "fas fa-umbrella",
          title: "우산 준비",
          description: "오늘 비 예보가 있습니다. 우산을 꼭 챙기세요!",
          actionText: "날씨 상세보기",
          actionClass: "btn-primary",
        });
      }

      // 고온 주의
      if (weatherData.value.current.temp > 30) {
        alerts.push({
          type: "weather",
          severity: "warning",
          icon: "fas fa-sun",
          title: "폭염 주의",
          description: "오늘은 매우 덥습니다. 물을 충분히 마시고 그늘에서 휴식하세요.",
          actionText: "쿨링 스팟 찾기",
          actionClass: "btn-info",
        });
      }
    }

    return alerts;
  });

  const transportAlerts = computed(() => {
    const alerts = [];

    // 교통 정체 확인
    if (transportData.value.realTimeInfo.congestion === "heavy") {
      alerts.push({
        type: "transport",
        severity: "urgent",
        icon: "fas fa-traffic-light",
        title: "교통 정체",
        description: "예정된 경로에 심한 정체가 있습니다. 대체 경로를 확인하세요.",
        actionText: "대체 경로 보기",
        actionClass: "btn-warning",
      });
    }

    return alerts;
  });

  const budgetAlerts = computed(() => {
    const alerts = [];
    const budgetUsagePercent = ((budgetData.value.total - remainingBudget.value) / budgetData.value.total) * 100;

    if (budgetUsagePercent > 80) {
      alerts.push({
        type: "budget",
        severity: "warning",
        icon: "fas fa-exclamation-triangle",
        message: `예산의 ${Math.round(budgetUsagePercent)}%를 사용했습니다`,
      });
    }

    // 카테고리별 초과 확인
    Object.entries(budgetByCategory.value).forEach(([category, amount]) => {
      const categoryBudget = budgetData.value.categories[category] || 0;
      if (categoryBudget > 0 && amount > categoryBudget * 0.8) {
        alerts.push({
          type: "budget",
          severity: "info",
          icon: "fas fa-info-circle",
          message: `${getCategoryName(category)} 예산의 ${Math.round((amount / categoryBudget) * 100)}%를 사용했습니다`,
        });
      }
    });

    return alerts;
  });

  // Actions
  const loadPlanDetail = async (planId) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await planAPI.getPlanDetail(planId);
      currentPlan.value = response.data;

      // 관련 데이터 로드
      await Promise.all([loadWeatherData(), loadBudgetData(planId), loadTransportData(), loadNotes(planId)]);

      return currentPlan.value;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const loadWeatherData = async () => {
    // 실제 구현시 OpenWeather API 호출
    // 현재는 더미 데이터
    weatherData.value = {
      current: {
        temp: 23,
        weather: "sunny",
        humidity: 65,
        windSpeed: 12,
      },
      forecast: [
        { date: new Date(), temp: 23, weather: "sunny" },
        { date: new Date(Date.now() + 86400000), temp: 25, weather: "cloudy" },
        { date: new Date(Date.now() + 172800000), temp: 22, weather: "rain" },
      ],
    };
  };

  const loadBudgetData = async (planId) => {
    const savedBudget = localStorage.getItem(`budget_${planId}`);
    if (savedBudget) {
      const items = JSON.parse(savedBudget);

      // 예산 데이터 구조화
      budgetData.value = {
        total: 1000000, // 기본 예산
        categories: {
          transportation: 200000,
          accommodation: 400000,
          food: 200000,
          activity: 150000,
          shopping: 50000,
        },
        expenses: items.map((item) => ({
          ...item,
          amount: item.amount || 0,
        })),
      };
    }
  };

  const loadTransportData = async () => {
    // 교통 정보 로드
    transportData.value = {
      routes: [],
      realTimeInfo: {
        congestion: "normal",
        delays: [],
      },
    };
  };

  const loadNotes = async (planId) => {
    const savedNotes = localStorage.getItem(`notes_${planId}`);
    if (savedNotes) {
      notes.value = JSON.parse(savedNotes);
    }
  };

  const addExpense = (expense) => {
    budgetData.value.expenses.push({
      ...expense,
      id: Date.now(),
      date: new Date().toISOString(),
    });

    // 로컬 스토리지에 저장
    saveBudgetData();
  };

  const saveBudgetData = () => {
    if (currentPlan.value) {
      localStorage.setItem(`budget_${currentPlan.value.planId}`, JSON.stringify(budgetData.value.expenses));
    }
  };

  const addNote = (note) => {
    notes.value.push({
      ...note,
      id: Date.now(),
      date: new Date().toISOString(),
    });

    // 로컬 스토리지에 저장
    saveNotes();
  };

  const saveNotes = () => {
    if (currentPlan.value) {
      localStorage.setItem(`notes_${currentPlan.value.planId}`, JSON.stringify(notes.value));
    }
  };

  const updateScheduleTime = async (detailId, newTime) => {
    try {
      // API 호출로 일정 시간 업데이트
      // await planAPI.updateDetailTime(detailId, newTime);

      // 로컬 상태 업데이트
      const detail = currentPlan.value.details.find((d) => d.detailId === detailId);
      if (detail) {
        detail.visitTime = newTime;
      }
    } catch (error) {
      console.error("일정 시간 업데이트 실패:", error);
    }
  };

  const getAIRecommendations = async () => {
    // AI 기반 추천 로직
    const recommendations = [];

    // 날씨 기반 추천
    if (weatherData.value.current?.weather === "rain") {
      recommendations.push({
        icon: "fas fa-museum",
        title: "실내 관광지 추천",
        description: "비오는 날 가기 좋은 박물관과 미술관",
        color: "#3498db",
        tag: "날씨",
        priority: 1,
      });
    }

    // 시간대별 추천
    const hour = new Date().getHours();
    if (hour >= 17 && hour < 19) {
      recommendations.push({
        icon: "fas fa-camera",
        title: "황금빛 사진 시간",
        description: "지금이 최고의 사진을 찍을 수 있는 골든아워입니다",
        color: "#f39c12",
        tag: "사진",
        priority: 2,
      });
    }

    // 예산 기반 추천
    if (remainingBudget.value < budgetData.value.total * 0.3) {
      recommendations.push({
        icon: "fas fa-piggy-bank",
        title: "무료 관광지",
        description: "예산을 아낄 수 있는 무료 관광 명소",
        color: "#27ae60",
        tag: "예산",
        priority: 3,
      });
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  };

  // Helper functions
  const getCategoryName = (category) => {
    const names = {
      transportation: "교통",
      accommodation: "숙박",
      food: "식비",
      activity: "관광/액티비티",
      shopping: "쇼핑",
      etc: "기타",
    };
    return names[category] || category;
  };

  return {
    // State
    currentPlan,
    plans,
    loading,
    error,
    weatherData,
    budgetData,
    transportData,
    notes,
    alerts,

    // Getters
    todaySchedule,
    remainingBudget,
    budgetByCategory,
    weatherAlerts,
    transportAlerts,
    budgetAlerts,

    // Actions
    loadPlanDetail,
    loadWeatherData,
    loadBudgetData,
    loadTransportData,
    loadNotes,
    addExpense,
    saveBudgetData,
    addNote,
    saveNotes,
    updateScheduleTime,
    getAIRecommendations,

    // Helpers
    getCategoryName,
  };
});
