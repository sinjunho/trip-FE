<!-- src/App.vue -->
<template>
  <div class="app">
    <app-header />
    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <app-footer />

    <!-- 챗봇 컴포넌트 추가 -->
    <chatbot />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import Chatbot from "@/components/common/Chatbot.vue";

const authStore = useAuthStore();

onMounted(async () => {
  // 로컬 스토리지에 토큰이 있으면 사용자 정보 로드
  if (authStore.token && !authStore.user) {
    await authStore.loadUser();
  }
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
