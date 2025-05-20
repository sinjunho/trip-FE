<!-- src/views/PlanCreateView.vue -->
<template>
  <div class="plan-create-view">
    <div class="container py-4">
      <h1 class="mb-4">새 여행 계획 만들기</h1>

      <div class="card mb-4">
        <div class="card-body">
          <form @submit.prevent="savePlan">
            <!-- 기본 정보 입력 -->
            <div class="mb-3">
              <label for="title" class="form-label">여행 제목</label>
              <input
                type="text"
                id="title"
                v-model="plan.title"
                class="form-control"
                placeholder="여행 이름을 입력하세요"
                required
              />
            </div>

            <div class="mb-3">
              <label for="description" class="form-label">여행 설명</label>
              <textarea
                id="description"
                v-model="plan.description"
                class="form-control"
                rows="3"
                placeholder="여행에 대한 설명을 입력하세요"
              ></textarea>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <label for="startDate" class="form-label">시작일</label>
                <input
                  type="date"
                  id="startDate"
                  v-model="plan.startDate"
                  class="form-control"
                  required
                  @change="calculateDays"
                />
              </div>
              <div class="col-md-6">
                <label for="endDate" class="form-label">종료일</label>
                <input
                  type="date"
                  id="endDate"
                  v-model="plan.endDate"
                  class="form-control"
                  required
                  @change="calculateDays"
                />
              </div>
            </div>

            <!-- 일차별 계획 -->
            <div v-if="dayCount > 0" class="mt-4">
              <h3>일차별 계획</h3>

              <div class="day-tabs">
                <ul class="nav nav-tabs mb-3">
                  <li class="nav-item" v-for="day in dayCount" :key="day">
                    <button :class="['nav-link', { active: activeDay === day }]" @click.prevent="activeDay = day">
                      {{ day }}일차
                    </button>
                  </li>
                </ul>
              </div>

              <div class="day-content">
                <div v-for="day in dayCount" :key="day" v-show="activeDay === day">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4>{{ day }}일차 일정</h4>
                    <button type="button" class="btn btn-sm btn-primary" @click="addDetailToDay(day)">
                      <i class="fas fa-plus"></i> 일정 추가
                    </button>
                  </div>

                  <div v-for="(detail, index) in getDayDetails(day)" :key="index" class="card mb-3">
                    <div class="card-body">
                      <div class="row mb-3">
                        <div class="col-md-6">
                          <label class="form-label">장소/제목</label>
                          <div class="input-group">
                            <input
                              type="text"
                              v-model="detail.title"
                              class="form-control"
                              placeholder="방문 장소 또는 일정 제목"
                            />
                            <button
                              type="button"
                              class="btn btn-outline-secondary"
                              @click="openAttractionModal(detail)"
                            >
                              <i class="fas fa-search"></i> 관광지 검색
                            </button>
                          </div>
                        </div>
                        <div class="col-md-3">
                          <label class="form-label">방문 시간</label>
                          <input type="time" v-model="detail.visitTime" class="form-control" />
                        </div>
                        <div class="col-md-3">
                          <label class="form-label">소요 시간(분)</label>
                          <input type="number" v-model="detail.stayDuration" class="form-control" min="0" />
                        </div>
                      </div>

                      <div class="mb-3">
                        <label class="form-label">메모</label>
                        <textarea v-model="detail.description" class="form-control" rows="2"></textarea>
                      </div>

                      <div class="text-end">
                        <button type="button" class="btn btn-sm btn-danger" @click="removeDetail(day, index)">
                          <i class="fas fa-trash"></i> 삭제
                        </button>
                      </div>
                    </div>
                  </div>

                  <div v-if="getDayDetails(day).length === 0" class="alert alert-light text-center">
                    <p class="mb-0">이 날짜에 계획된 일정이 없습니다. '일정 추가' 버튼을 클릭하여 일정을 추가하세요.</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-between mt-4">
              <router-link to="/plans" class="btn btn-secondary"> <i class="fas fa-arrow-left"></i> 취소 </router-link>
              <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> 저장하기</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 관광지 검색 모달 -->
    <div class="modal fade" id="attractionModal" tabindex="-1">
      <!-- 모달 내용 -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import planAPI from "@/api/plan";
import attractionAPI from "@/api/attraction";

const router = useRouter();
const authStore = useAuthStore();

// 로그인 확인
if (!authStore.isAuthenticated) {
  router.push("/login?redirect=/plans/create");
}

// 상태 관리
const plan = ref({
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  details: [],
});

const activeDay = ref(1);
const currentDetail = ref(null);

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

// 날짜 변경 시 일수 재계산
const calculateDays = () => {
  // 종료일이 시작일보다 이전인 경우 조정
  if (plan.value.startDate && plan.value.endDate) {
    const start = new Date(plan.value.startDate);
    const end = new Date(plan.value.endDate);

    if (end < start) {
      plan.value.endDate = plan.value.startDate;
    }
  }

  // 일차별 세부 일정 초기화 (필요한 경우)
  if (dayCount.value > 0) {
    activeDay.value = Math.min(activeDay.value, dayCount.value);
  }
};

// 특정 일차의 세부 일정 가져오기
const getDayDetails = (day) => {
  return plan.value.details.filter((detail) => detail.dayNumber === day).sort((a, b) => a.orderNo - b.orderNo);
};

// 특정 일차에 일정 추가
const addDetailToDay = (day) => {
  const details = getDayDetails(day);
  const newOrderNo = details.length > 0 ? Math.max(...details.map((d) => d.orderNo)) + 1 : 1;

  plan.value.details.push({
    dayNumber: day,
    title: "",
    description: "",
    visitTime: "",
    stayDuration: 60,
    orderNo: newOrderNo,
    attractionId: null,
  });
};

// 일정 삭제
const removeDetail = (day, index) => {
  const dayDetails = getDayDetails(day);
  const detailToRemove = dayDetails[index];

  // details 배열에서 해당 항목 찾아 삭제
  const detailIndex = plan.value.details.findIndex(
    (d) => d.dayNumber === detailToRemove.dayNumber && d.orderNo === detailToRemove.orderNo
  );

  if (detailIndex !== -1) {
    plan.value.details.splice(detailIndex, 1);
  }
};

// 관광지 검색 모달 열기
const openAttractionModal = (detail) => {
  currentDetail.value = detail;
  // 모달 열기 로직
};

// 여행 계획 저장
const savePlan = async () => {
  try {
    const response = await planAPI.createPlan(plan.value);
    alert("여행 계획이 성공적으로 저장되었습니다.");
    router.push(`/plans/${response.data.planId}`);
  } catch (error) {
    console.error("여행 계획 저장 중 오류 발생:", error);
    alert("여행 계획 저장에 실패했습니다.");
  }
};
</script>
