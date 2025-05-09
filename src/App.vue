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
    <app-loader v-if="isLoading" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import AppLoader from "@/components/common/AppLoader.vue";
import { useAppStore } from "@/stores/app";

const route = useRoute();
const appStore = useAppStore();
const isLoading = computed(() => appStore.isLoading);
</script>

<style>
/* 전역 스타일 */
</style>
