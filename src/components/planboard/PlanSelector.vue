<!-- src/components/planboard/PlanSelector.vue - 수정된 버전 -->
<template>
  <div class="plan-selector">
    <div class="card">
      <div class="card-header bg-primary bg-gradient text-white">
        <h5 class="mb-0">
          <i class="fas fa-route me-2"></i>
          내 여행 계획 선택
        </h5>
      </div>
      <div class="card-body">
        <!-- 로딩 중 표시 -->
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">로딩 중...</span>
          </div>
          <p class="mt-2 text-muted">여행 계획을 불러오는 중입니다...</p>
        </div>

        <!-- 여행 계획이 없는 경우 -->
        <div v-else-if="myPlans.length === 0" class="text-center py-4">
          <div class="empty-plans">
            <i class="fas fa-map fa-3x text-muted mb-3"></i>
            <h6 class="text-muted">등록된 여행 계획이 없습니다.</h6>
            <p class="text-muted small">여행 계획을 먼저 작성한 후 공유해보세요!</p>
            <router-link to="/plans/create" class="btn btn-primary mt-2">
              <i class="fas fa-plus me-2"></i>여행 계획 만들기
            </router-link>
          </div>
        </div>

        <!-- 특정 계획이 자동 선택된 경우 안내 -->
        <div v-else-if="autoSelectedPlan" class="auto-selected-notice alert alert-success">
          <div class="d-flex align-items-center">
            <i class="fas fa-check-circle me-2"></i>
            <div>
              <strong>"{{ autoSelectedPlan.title }}" 계획이 자동으로 선택되었습니다.</strong>
              <p class="mb-0 small">다른 계획을 선택하려면 아래에서 변경할 수 있습니다.</p>
            </div>
          </div>
        </div>

        <!-- 여행 계획 목록 -->
        <div v-if="myPlans.length > 0" class="plans-list">
          <div
            v-for="plan in myPlans"
            :key="plan.planId"
            class="plan-item"
            :class="{
              selected: selectedPlanId === plan.planId,
              'auto-selected': autoSelectedPlan && autoSelectedPlan.planId === plan.planId,
            }"
            @click="selectPlan(plan)"
          >
            <div class="plan-info">
              <div class="plan-title">
                {{ plan.title }}
                <span v-if="autoSelectedPlan && autoSelectedPlan.planId === plan.planId" class="auto-badge">
                  자동 선택됨
                </span>
              </div>
              <div class="plan-dates">
                {{ formatDate(plan.startDate) }} ~ {{ formatDate(plan.endDate) }}
                <span class="ms-2 badge bg-info">{{ calculateDays(plan.startDate, plan.endDate) }}일</span>
              </div>
              <div class="plan-meta">
                <span v-if="plan.destinations && plan.destinations.length > 0" class="plan-destinations">
                  <i class="fas fa-map-marker-alt text-danger me-1"></i>
                  {{ formatDestinations(plan.destinations) }}
                </span>
                <span class="plan-attractions-count">
                  <i class="fas fa-map-pin text-primary me-1"></i>
                  관광지 {{ plan.details ? plan.details.length : 0 }}개
                </span>
              </div>
            </div>
            <div class="plan-select">
              <button
                class="btn btn-sm"
                :class="selectedPlanId === plan.planId ? 'btn-success' : 'btn-outline-primary'"
              >
                <i :class="selectedPlanId === plan.planId ? 'fas fa-check' : 'fas fa-arrow-right'"></i>
                {{ selectedPlanId === plan.planId ? "선택됨" : "선택" }}
              </button>
            </div>
          </div>
        </div>

        <!-- 선택된 여행 계획 정보 -->
        <div v-if="selectedPlan && !autoSelectedPlan" class="selected-plan-details mt-4">
          <div class="card">
            <div class="card-header bg-light">
              <h6 class="mb-0">
                <i class="fas fa-info-circle me-2"></i>
                선택된 여행 계획 정보
              </h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-bold">여행 제목</label>
                    <div>{{ selectedPlan.title }}</div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold">여행 기간</label>
                    <div>
                      {{ formatDate(selectedPlan.startDate) }} ~ {{ formatDate(selectedPlan.endDate) }} ({{
                        calculateDays(selectedPlan.startDate, selectedPlan.endDate)
                      }}일)
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-bold">관광지 수</label>
                    <div>{{ selectedPlan.details ? selectedPlan.details.length : 0 }}개</div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold">여행 설명</label>
                    <div>{{ selectedPlan.description || "설명 없음" }}</div>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-end">
                <button class="btn btn-outline-secondary me-2" @click="cancelSelection">
                  <i class="fas fa-times me-1"></i>선택 취소
                </button>
                <button class="btn btn-primary" @click="confirmSelection">
                  <i class="fas fa-check me-1"></i>이 계획으로 작성하기
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 자동 선택된 계획의 확인 버튼 -->
        <div v-else-if="autoSelectedPlan" class="auto-selected-actions mt-3">
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-outline-secondary" @click="showOtherPlans">
              <i class="fas fa-exchange-alt me-1"></i>다른 계획 선택
            </button>
            <button class="btn btn-success btn-lg" @click="confirmAutoSelection">
              <i class="fas fa-check me-1"></i>이 계획으로 작성하기
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import planAPI from "@/api/plan";

const route = useRoute();

const props = defineProps({
  initialPlanId: {
    type: Number,
    default: null,
  },
  autoSelectPlanId: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(["plan-selected", "selection-cancelled"]);

// 상태 관리
const loading = ref(true);
const myPlans = ref([]);
const selectedPlanId = ref(props.initialPlanId || props.autoSelectPlanId);
const selectedPlan = ref(null);
const autoSelectedPlan = ref(null);
const showAllPlans = ref(false);
const authStore = useAuthStore();

// 메서드
const loadMyPlans = async () => {
  try {
    loading.value = true;
    const response = await planAPI.getUserPlans();
    myPlans.value = response.data || [];

    // 쿼리 파라미터나 props에서 planId 확인
    const targetPlanId =
      props.autoSelectPlanId || (route.query.planId ? parseInt(route.query.planId) : null) || props.initialPlanId;

    if (targetPlanId) {
      const targetPlan = myPlans.value.find((p) => p.planId === targetPlanId);
      if (targetPlan) {
        // 자동 선택 로직
        if (props.autoSelectPlanId || route.query.planId) {
          await autoSelectPlan(targetPlan);
        } else {
          await selectPlan(targetPlan);
        }
      }
    }
  } catch (error) {
    console.error("여행 계획 로드 오류:", error);
    myPlans.value = [];
  } finally {
    loading.value = false;
  }
};

const autoSelectPlan = async (plan) => {
  try {
    loading.value = true;
    selectedPlanId.value = plan.planId;

    // 상세 정보 로드
    const response = await planAPI.getPlanDetail(plan.planId);
    autoSelectedPlan.value = response.data;
    selectedPlan.value = response.data;

    // 부모 컴포넌트에 자동으로 선택됨을 알림
    emit("plan-selected", response.data);
  } catch (error) {
    console.error("여행 계획 자동 선택 오류:", error);
    autoSelectedPlan.value = plan;
    selectedPlan.value = plan;
    emit("plan-selected", plan);
  } finally {
    loading.value = false;
  }
};

const selectPlan = async (plan) => {
  try {
    loading.value = true;
    selectedPlanId.value = plan.planId;

    // 상세 정보 로드
    const response = await planAPI.getPlanDetail(plan.planId);
    selectedPlan.value = response.data;

    // 자동 선택 상태 해제
    autoSelectedPlan.value = null;
  } catch (error) {
    console.error("여행 계획 상세 로드 오류:", error);
    selectedPlan.value = plan;
  } finally {
    loading.value = false;
  }
};

const cancelSelection = () => {
  selectedPlanId.value = null;
  selectedPlan.value = null;
  autoSelectedPlan.value = null;
  emit("selection-cancelled");
};

const confirmSelection = () => {
  if (selectedPlan.value) {
    emit("plan-selected", selectedPlan.value);
  }
};

const confirmAutoSelection = () => {
  if (autoSelectedPlan.value) {
    emit("plan-selected", autoSelectedPlan.value);
  }
};

const showOtherPlans = () => {
  autoSelectedPlan.value = null;
  showAllPlans.value = true;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

const formatDestinations = (destinations) => {
  if (!destinations || !Array.isArray(destinations)) return "목적지 정보 없음";

  return destinations.slice(0, 3).join(", ") + (destinations.length > 3 ? "..." : "");
};

// 컴포넌트 초기화
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await loadMyPlans();
  } else {
    loading.value = false;
  }
});
</script>

<style scoped>
.plan-selector {
  margin-bottom: 1.5rem;
}

.plans-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
}

.plan-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  cursor: pointer;
  transition: all 0.2s ease;
}

.plan-item:last-child {
  border-bottom: none;
}

.plan-item:hover {
  background-color: #f8f9fa;
}

.plan-item.selected {
  background-color: #e8f4ff;
  border-left: 4px solid #0d6efd;
}

.plan-item.auto-selected {
  background-color: #d1edff;
  border-left: 4px solid #28a745;
  box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2);
}

.plan-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #343a40;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.auto-badge {
  font-size: 0.7rem;
  background: #28a745;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
}

.plan-dates {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.plan-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #6c757d;
}

.plan-destinations {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plan-select {
  flex-shrink: 0;
}

.empty-plans {
  padding: 2rem;
}

.auto-selected-notice {
  border-left: 4px solid #28a745;
  background-color: #d4edda;
  border-color: #c3e6cb;
}

.auto-selected-actions {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

/* 커스텀 스크롤바 */
.plans-list::-webkit-scrollbar {
  width: 6px;
}

.plans-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.plans-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.plans-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 반응형 */
@media (max-width: 768px) {
  .plan-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .plan-select {
    align-self: flex-end;
  }

  .auto-selected-actions .d-flex {
    flex-direction: column;
    gap: 0.75rem;
  }

  .auto-selected-actions .btn {
    width: 100%;
  }
}
</style>
