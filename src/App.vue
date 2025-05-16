<!-- src/App.vue -->
<template>
  <div class="app">
    <app-header />

    <main>
      <router-view />
    </main>

    <app-footer />
  </div>
</template>

<script setup>
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
</script>

<style>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
</style>
