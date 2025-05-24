<!-- src/components/layout/AppHeader.vue -->
<template>
  <header class="app-header">
    <div class="container">
      <div class="logo">
        <router-link to="/">Mr. <span>Route</span></router-link>
      </div>

      <nav>
        <ul>
          <li>
            <router-link :to="{ name: 'attractions' }">관광지 검색</router-link>
          </li>
          <li><router-link :to="{ name: 'board-list' }">여행 커뮤니티</router-link></li>
          <li v-if="isLoggedIn">
            <router-link :to="{ name: 'plans' }">내 여행 계획 보기</router-link>
          </li>
          <!-- 로그인하지 않은 경우 -->
          <template v-if="!isLoggedIn">
            <li>
              <router-link :to="{ name: 'login' }" class="nav-btn nav-login">로그인</router-link>
            </li>
            <li>
              <router-link :to="{ name: 'register' }" class="nav-btn nav-register">회원가입</router-link>
            </li>
          </template>

          <!-- 로그인한 경우 -->
          <template v-else>
            <!-- 관리자인 경우 (여기에 로그 추가) -->
            <li v-if="isAdmin">
              <router-link :to="{ name: 'admin-members' }">회원 관리</router-link>
            </li>

            <!-- 사용자 메뉴 -->
            <li class="user-menu">
              <button class="user-menu-btn" @click="toggleUserMenu">
                {{ userName }} <i class="fas fa-chevron-down"></i>
              </button>

              <div v-show="showUserMenu" class="user-dropdown">
                <router-link :to="{ name: 'mypage' }"><i class="fas fa-user"></i> 마이페이지</router-link>
                <router-link :to="{ name: 'board-write' }"><i class="fas fa-pen"></i> 글 작성하기</router-link>
                <!-- 관리자 메뉴 항목 추가 -->
                <router-link :to="{ name: 'plan-create' }"><i class="fas fa-pen"></i> 여행계획 만들기</router-link>

                <router-link v-if="isAdmin" :to="{ name: 'admin-dashboard' }">
                  <i class="fas fa-cog"></i> 관리자 대시보드
                </router-link>
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
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const showUserMenu = ref(false);

// 로그인 상태와 사용자 정보를 스토어에서 가져옴
const isLoggedIn = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => {
  console.log("현재 사용자 역할:", authStore.user?.role);
  return authStore.isAdmin;
});
const userName = computed(() => authStore.user?.name || "사용자");

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const handleLogout = async () => {
  await authStore.logout();
  showUserMenu.value = false;
  router.push("/");
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

// 디버깅을 위한 watch 추가
watch(
  () => authStore.user,
  (newUser) => {
    if (newUser) {
      console.log("사용자 정보 변경:", newUser);
      console.log("사용자 역할:", newUser.role);
      console.log("관리자 여부:", isAdmin.value);
    }
  },
  { deep: true }
);
</script>

<style scoped>
.app-header {
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 15px 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 24px;
  font-weight: bold;
}

.logo a {
  text-decoration: none;
  color: #333;
}

.logo span {
  color: #0d6efd;
}

nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
}

nav ul li {
  margin-left: 20px;
}

nav ul li a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
}

nav ul li a:hover {
  color: #0d6efd;
}

.nav-btn {
  padding: 8px 15px;
  border-radius: 5px;
  font-weight: 600;
}

.nav-login {
  border: 1px solid #0d6efd;
  color: #0d6efd;
}

.nav-register {
  background-color: #0d6efd;
  color: white !important;
}

.user-menu {
  position: relative;
}

.user-menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 5px;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 180px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 10px 0;
  margin-top: 10px;
  z-index: 1000;
}

.user-dropdown a,
.user-dropdown button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 15px;
  text-decoration: none;
  color: #333;
  border: none;
  background: none;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-dropdown a:hover,
.user-dropdown button:hover {
  background-color: #f8f9fa;
  color: #0d6efd;
}

.user-dropdown i {
  width: 20px;
  margin-right: 8px;
}
</style>
