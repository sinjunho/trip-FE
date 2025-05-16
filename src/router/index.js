// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

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
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/RegisterView.vue"),
    },
    {
      path: "/mypage",
      name: "mypage",
      component: () => import("../views/MyPageView.vue"),
      meta: { requiresAuth: true },
    },
    // 관광지 관련 라우트
    {
      path: "/attractions",
      name: "attractions",
      component: () => import("../views/AttractionListView.vue"),
    },
    {
      path: "/attractions/:id",
      name: "attraction-detail",
      component: () => import("../views/AttractionDetailView.vue"),
    },
    // 게시판 관련 라우트
    {
      path: "/board",
      name: "board-list",
      component: () => import("../views/BoardListView.vue"),
    },
    {
      path: "/board/:bno",
      name: "board-detail",
      component: () => import("../views/BoardDetailView.vue"),
    },
    {
      path: "/board/write",
      name: "board-write",
      component: () => import("../views/BoardWriteView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/board/edit/:bno",
      name: "board-edit",
      component: () => import("../views/BoardWriteView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
  scrollBehavior() {
    // 페이지 전환 시 맨 위로 스크롤
    return { top: 0 };
  },
});

// 네비게이션 가드 설정
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem("auth-token") !== null;

  // 인증이 필요한 페이지 처리
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: "login", query: { redirect: to.fullPath } });
    return;
  }

  next();
});

export default router;
