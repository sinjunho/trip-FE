<!-- src/views/NotFoundView.vue -->
<template>
  <div class="not-found-view">
    <div class="container text-center py-5">
      <div class="error-content">
        <h1 class="error-title">404</h1>
        <h2 class="mb-4">페이지를 찾을 수 없습니다</h2>
        <p class="mb-4">요청하신 페이지를 찾을 수 없습니다. 페이지가 삭제되었거나 주소가 변경되었을 수 있습니다.</p>
        <router-link to="/" class="btn btn-primary"> <i class="fas fa-home me-2"></i> 메인으로 돌아가기 </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// 스크립트 필요 없음
</script>

<style scoped>
.not-found-view {
  padding: 3rem 0;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-title {
  font-size: 8rem;
  font-weight: 700;
  color: #0d6efd;
  line-height: 1;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
}

.error-content {
  max-width: 600px;
  margin: 0 auto;
}
</style>
