<!-- src/views/admin/DashboardView.vue -->
<template>
  <div class="admin-dashboard-view">
    <div class="container py-4">
      <h1 class="mb-4">관리자 대시보드</h1>

      <div class="row">
        <div class="col-md-4 mb-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">회원 현황</h5>
              <p class="card-text display-4">{{ stats.memberCount }}</p>
              <router-link :to="{ name: 'admin-members' }" class="btn btn-primary">회원 관리</router-link>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">게시글 현황</h5>
              <p class="card-text display-4">{{ stats.boardCount }}</p>
              <router-link :to="{ name: 'board-list' }" class="btn btn-primary">게시판 바로가기</router-link>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">여행 계획 현황</h5>
              <p class="card-text display-4">{{ stats.planCount }}</p>
              <router-link :to="{ name: 'plans' }" class="btn btn-primary">여행 계획 보기</router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- 추가적인 관리자 기능들 -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const stats = ref({
  memberCount: 0,
  boardCount: 0,
  planCount: 0,
});

// 실제로는 API 호출을 통해 통계 데이터를 가져와야 합니다
onMounted(() => {
  // 예시 데이터
  stats.value = {
    memberCount: 65,
    boardCount: 128,
    planCount: 47,
  };
});
</script>
