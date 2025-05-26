<!-- src/views/plan/PlanCreateView.vue -->
<template>
  <div class="plan-create-view">
    <!-- 상단 진행 단계 표시 -->
    <div class="progress-steps">
      <div class="container">
        <div class="steps-container">
          <div class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
            <div class="step-number">1</div>
            <div class="step-title">기본 정보</div>
          </div>
          <div class="step-line" :class="{ completed: currentStep > 1 }"></div>
          <div class="step" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
            <div class="step-number">2</div>
            <div class="step-title">여행지 선택</div>
          </div>
          <div class="step-line" :class="{ completed: currentStep > 2 }"></div>
          <div class="step" :class="{ active: currentStep === 3 }">
            <div class="step-number">3</div>
            <div class="step-title">일정 완성</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 1: 기본 정보 입력 -->
    <PlanBasicInfoStep
      v-if="currentStep === 1"
      v-model="planData"
      @next="handleStep1Next"
      @cancel="handleCancel"
    />

    <!-- Step 2: 여행지 선택 -->
    <PlanLocationSelectStep
      v-if="currentStep === 2"
      :plan-data="planData"
      @previous="currentStep = 1"
      @next="handleStep2Next"
    />

    <!-- Step 3: 일정 완성 -->
    <PlanScheduleStep
      v-if="currentStep === 3"
      :plan-data="planData"
      :selected-attractions="selectedAttractions"
      @previous="currentStep = 2"
      @save="handlePlanSave"
      @draft-save="handleDraftSave"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import PlanBasicInfoStep from '@/components/plan/create/PlanBasicInfoStep.vue'
import PlanLocationSelectStep from '@/components/plan/create/PlanLocationSelectStep.vue'
import PlanScheduleStep from '@/components/plan/create/PlanScheduleStep.vue'

const router = useRouter()
const authStore = useAuthStore()

// 인증 확인
if (!authStore.isAuthenticated) {
  router.push('/login?redirect=/plans/create')
}

// 상태 관리
const currentStep = ref(1)

// 여행 계획 데이터
const planData = ref({
  title: '',
  description: '',
  startDate: '',
  endDate: ''
})

// 선택된 관광지 데이터
const selectedAttractions = ref([])

// 메서드
const handleStep1Next = (data) => {
  console.log('Step 1 완료:', data)
  planData.value = { ...data }
  currentStep.value = 2
}

const handleStep2Next = (data) => {
  console.log('Step 2 완료:', data)
  selectedAttractions.value = data.selectedAttractions || []
  currentStep.value = 3
}

const handleCancel = () => {
  if (confirm('작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?')) {
    router.push('/plans')
  }
}

const handlePlanSave = (result) => {
  console.log('여행 계획 저장 완료:', result)
  alert(result.message)
  router.push(`/plans/${result.planId}`)
}

const handleDraftSave = () => {
  console.log('임시저장 완료')
}

// 라이프사이클
onMounted(() => {
  console.log('PlanCreateView 마운트됨')
})
</script>

<style scoped>
.progress-steps {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  margin-bottom: 2rem;
}

.steps-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 600px;
  margin: 0 auto;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.6;
  transition: all 0.3s;
}

.step.active,
.step.completed {
  opacity: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 0.5rem;
  transition: all 0.3s;
}

.step.active .step-number {
  background: white;
  color: #667eea;
  transform: scale(1.1);
}

.step.completed .step-number {
  background: #28a745;
  color: white;
}

.step-title {
  font-size: 0.9rem;
  text-align: center;
}

.step-line {
  width: 100px;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 1rem;
  transition: all 0.3s;
}

.step-line.completed {
  background: #28a745;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .progress-steps {
    padding: 1.5rem 0;
  }
  
  .steps-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .step-line {
    width: 2px;
    height: 30px;
    margin: 0;
  }
}

@media (max-width: 480px) {
  .progress-steps {
    padding: 1rem 0;
  }
  
  .step-number {
    width: 35px;
    height: 35px;
    font-size: 0.9rem;
  }
  
  .step-title {
    font-size: 0.8rem;
  }
}
</style>