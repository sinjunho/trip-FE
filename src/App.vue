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
    <app-loader v-if="loading" />
  </div>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import AppHeader from "@/components/layout/AppHeader.vue";
// import AppFooter from "@/components/layout/AppFooter.vue";
// import AppLoader from "@/components/common/AppLoader.vue";

const authStore = useAuthStore();
const loading = computed(() => authStore.loading);

onMounted(async () => {
  // 토큰이 있으면 사용자 정보 로드
  if (authStore.token && !authStore.user) {
    await authStore.loadUser();
  }
});
</script>
