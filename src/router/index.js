// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";

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
      component: () => import("../Views/member/LoginView.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../Views/member/RegisterView.vue"),
    },
    {
      path: "/mypage",
      name: "mypage",
      component: () => import("../Views/member/MypageView.vue"),
      meta: { requiresAuth: true },
    },
    // 관광지 관련 라우트
    {
      path: "/attractions",
      name: "attractions",
      component: () => import("../Views/Attraction/AttractionListView.vue"),
    },
    {
      path: "/attractions/:id",
      name: "attraction-detail",
      component: () => import("../Views/Attraction/AttractionDetailView.vue"),
    },
    // 게시판 관련 라우트
    {
      path: "/board",
      name: "board-list",
      component: () => import("../Views/Board/BoardListView.vue"),
    },
    {
      path: "/board/:bno",
      name: "board-detail",
      component: () => import("../Views/Board/BoardDetailView.vue"),
    },
    {
      path: "/board/write",
      name: "board-write",
      component: () => import("../Views/Board/BoardWriteView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/board/edit/:bno",
      name: "board-edit",
      component: () => import("../Views/Board/BoardWriteView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../Views/options/NotFoundView.vue"),
    },
    {
      path: "/plans",
      name: "plans",
      component: () => import("../Views/plan/PlanListView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/plans/create",
      name: "plan-create",
      component: () => import("@/views/plan/PlanCreateView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/plans/:id",
      name: "plan-detail",
      component: () => import("@/views/plan/PlanDetailView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/plans/:id/edit",
      name: "plan-edit",
      component: () => import("@/views/plan/PlanEditView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/plans/share/:id",
      name: "plan-share",
      component: () => import("@/views/plan/PlanShareView.vue"),
    },
    {
      path: "/admin/members",
      name: "admin-members",
      component: () => import("../views/admin/MembersManageView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/dashboard",
      name: "admin-dashboard",
      component: () => import("../views/admin/DashboardView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
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
