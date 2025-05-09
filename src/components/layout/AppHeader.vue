<!-- src/components/layout/AppHeader.vue -->
<template>
  <header>
    <div class="logo">
      <router-link to="/">Enjoy <span>Trip</span></router-link>
    </div>
    <nav>
      <ul>
        <template v-if="!isLoggedIn">
          <li class="nav-signup">
            <router-link to="/signup" class="mx-3">회원가입</router-link>
          </li>
          <li class="nav-login">
            <router-link to="/login" class="mx-3">로그인</router-link>
          </li>
        </template>
        <template v-else>
          <li v-if="isAdmin">
            <router-link to="/admin/members" class="mx-3">멤버목록</router-link>
          </li>
          <li>
            <router-link to="/board" class="mx-3">게시판</router-link>
          </li>
          <li>
            <router-link to="/attractions" class="mx-3">여행지 정보</router-link>
          </li>
          <li class="nav-user-info">
            <router-link to="/mypage" class="mx-3">마이페이지</router-link>
          </li>
          <li class="nav-logout">
            <a href="#" @click.prevent="logout" class="mx-3">로그아웃</a>
          </li>
        </template>
      </ul>
    </nav>
  </header>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useMemberStore } from "@/stores/member";

const router = useRouter();
const memberStore = useMemberStore();

const isLoggedIn = computed(() => memberStore.isLoggedIn);
const isAdmin = computed(() => memberStore.currentUser?.role === "admin");

const logout = async () => {
  await memberStore.logout();
  router.push("/");
};
</script>

<style scoped>
/* 헤더 스타일 */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 50px;
  background-color: #fff;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

/* 나머지 스타일... */
</style>
