<template>
  <div class="plan-list-view">
    <div class="container py-4">
      <h1 class="mb-4">여행 계획 목록</h1>

      <!-- 로딩 상태 표시 -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">로딩중...</span>
        </div>
      </div>

      <!-- 계획 목록이 없을 경우 -->
      <div v-else-if="!plans || plans.length === 0" class="text-center py-5">
        <p class="text-muted">등록된 여행 계획이 없습니다.</p>
        <router-link to="/plans/create" class="btn btn-primary mt-3">
          <i class="fas fa-plus"></i> 새 여행 계획 만들기
        </router-link>
      </div>

      <!-- 계획 목록 표시 -->
      <div v-else class="plan-grid">
        <!-- 계획 카드들이 여기에 표시됩니다 -->
        <div v-for="plan in plans" :key="plan.id" class="plan-card">
          <!-- 여행 계획 카드 내용 -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import planAPI from "@/api/plan"; // 여행 계획 API 가져오기 (이 파일이 존재해야 합니다)

const router = useRouter();
const loading = ref(true); // 로딩 상태를 관리하는 ref 추가
const plans = ref([]); // 여행 계획 목록을 관리하는 ref 추가

// 여행 계획 목록 불러오기
const fetchPlans = async () => {
  try {
    loading.value = true;
    const response = await planAPI.getPlans(); // 여행 계획 API 호출
    plans.value = response.data;
  } catch (error) {
    console.error("여행 계획을 불러오는 중 오류 발생:", error);
    // 오류 처리 로직 추가
  } finally {
    loading.value = false;
  }
};

// 컴포넌트 마운트 시 여행 계획 목록 불러오기
onMounted(() => {
  fetchPlans();
});
</script>

<style scoped>
.plan-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.plan-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}
</style>
