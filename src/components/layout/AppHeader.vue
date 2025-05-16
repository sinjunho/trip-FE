<!-- src/components/layout/AppHeader.vue -->
<template>
  <header class="app-header">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container">
        <router-link to="/" class="navbar-brand">Enjoy Trip</router-link>

        <div class="navbar-nav ms-auto">
          <router-link to="/" class="nav-link">홈</router-link>
          <router-link to="/login" class="nav-link">로그인</router-link>
          <router-link to="/register" class="nav-link">회원가입</router-link>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
