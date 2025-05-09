<!-- src/components/layout/AppHeader.vue -->
<template>
  <header class="app-header">
    <div class="container">
      <div class="logo">
        <router-link to="/">Enjoy <span>Trip</span></router-link>
      </div>

      <nav>
        <ul>
          <li>
            <router-link :to="{ name: 'attractions' }">관광지 검색</router-link>
          </li>
          <li>
            <router-link :to="{ name: 'board-list' }">여행 커뮤니티</router-link>
          </li>

          <!-- 로그인하지 않은 경우 -->
          <template v-if="!authStore.isAuthenticated">
            <li>
              <router-link :to="{ name: 'login' }" class="nav-btn nav-login"> 로그인 </router-link>
            </li>
            <li>
              <router-link :to="{ name: 'register' }" class="nav-btn nav-register"> 회원가입 </router-link>
            </li>
          </template>

          <!-- 로그인한 경우 -->
          <template v-else>
            <!-- 관리자인 경우 -->
            <li v-if="authStore.isAdmin">
              <router-link :to="{ name: 'admin-members' }">회원 관리</router-link>
            </li>

            <!-- 사용자 메뉴 -->
            <li class="user-menu">
              <button class="user-menu-btn" @click="toggleUserMenu">
                {{ authStore.user.name }} <i class="fas fa-chevron-down"></i>
              </button>

              <div v-show="showUserMenu" class="user-dropdown">
                <router-link :to="{ name: 'mypage' }"> <i class="fas fa-user"></i> 마이페이지 </router-link>
                <router-link :to="{ name: 'board-write' }"> <i class="fas fa-pen"></i> 글 작성하기 </router-link>
                <button @click="handleLogout"><i class="fas fa-sign-out-alt"></i> 로그아웃</button>
              </div>
            </li>
          </template>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const showUserMenu = ref(false);

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const handleLogout = async () => {
  await authStore.logout();
  showUserMenu.value = false;
};

// 사용자 메뉴 외부 클릭 시 닫기
const closeUserMenu = (e) => {
  if (!e.target.closest(".user-menu")) {
    showUserMenu.value = false;
  }
};

// 컴포넌트 마운트 시 이벤트 리스너 추가
onMounted(() => {
  document.addEventListener("click", closeUserMenu);
});

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  document.removeEventListener("click", closeUserMenu);
});
</script>

<style scoped>
/* 헤더 스타일 작성 */
</style>
