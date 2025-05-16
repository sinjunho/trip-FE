// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import AttractionListView from "@/components/AttractionList.vue";
import PasswordResetView from "@/views/PasswordResetView.vue"; //
import { useAuthStore } from "@/stores/auth";
import MypageView from "@/views/MypageView.vue"; //

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/register",
      name: "register",
      component: RegisterView,
    },
    {
      path: "/attractions",
      name: "attractions",
      component: AttractionListView,
    },
    {
      path: "/password-reset",
      name: "password-reset",
      component: PasswordResetView,
    },
    //마이페이지
    {
      path: "/mypage",
      name: "mypage",
      component: MypageView,
      meta: { requiresAuth: true }, // 인증이 필요한 페이지
    },
  ],
});

// 라우터 가드
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // 접근 제한 페이지 설정
  const authRequired = to.matched.some((record) => record.meta.requiresAuth);
  const adminRequired = to.matched.some((record) => record.meta.requiresAdmin);

  if (authRequired && !authStore.isAuthenticated) {
    // 인증이 필요한 페이지인데 로그인되지 않은 경우
    next({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  } else if (adminRequired && !authStore.isAdmin) {
    // 관리자 권한이 필요한 페이지인데 관리자가 아닌 경우
    next({ path: "/" });
  } else {
    next();
  }
});

export default router;
