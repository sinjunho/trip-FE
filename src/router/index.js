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
      component: () => import("@/views/admin/MembersManageView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/dashboard",
      name: "admin-dashboard",
      component: () => import("@/views/admin/DashboardView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    // 새로 추가되는 관리자 라우트들
    {
      path: "/admin/boards",
      name: "admin-boards",
      component: () => import("@/views/admin/BoardsManageView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },

    {
      path: "/admin/logs",
      name: "admin-logs",
      component: () => import("@/views/admin/SystemLogsView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    // 기존 routes 배열에 다음 라우트들을 추가하세요:

    {
      path: "/planboard",
      name: "planboard-list",
      component: () => import("../Views/planbaord/PlanBoardListView.vue"),
    },
    {
      path: "/planboard/search",
      name: "planboard-search",
      component: () => import("../Views/planbaord/PlanBoardSearchView.vue"),
    },
    {
      path: "/planboard/:pboardNo",
      name: "planboard-detail",
      component: () => import("../Views/planbaord/PlanBoardDetailView.vue"),
    },
    {
      path: "/planboard/write",
      name: "planboard-write",
      component: () => import("../Views/planbaord/PlanBoardWriteView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/planboard/edit/:pboardNo",
      name: "planboard-edit",
      component: () => import("../Views/planbaord/PlanBoardWriteView.vue"),
      meta: { requiresAuth: true },
    },
  ],
  scrollBehavior() {
    // 페이지 전환 시 맨 위로 스크롤
    return { top: 0 };
  },
});

// // 네비게이션 가드 강화
// router.beforeEach(async (to, from, next) => {
//   const authStore = useAuthStore();
//   const isLoggedIn = authStore.isAuthenticated;
//   const isAdmin = authStore.isAdmin;

//   // 로그인이 필요한 페이지 처리
//   if (to.meta.requiresAuth && !isLoggedIn) {
//     next({ name: "login", query: { redirect: to.fullPath } });

//     return;
//   }

//   // 관리자 권한이 필요한 페이지 처리
//   if (to.meta.requiresAdmin) {
//     if (!isLoggedIn) {
//       next({ name: "login", query: { redirect: to.fullPath } });
//       return;
//     }

//     // 사용자 정보가 로드되지 않은 경우 로드 시도
//     if (!authStore.user) {
//       try {
//         await authStore.loadUser();
//       } catch (error) {
//         console.error("사용자 정보 로드 실패:", error);
//         next({ name: "login" });
//         return;
//       }
//     }

//     if (!isAdmin) {
//       alert("관리자 권한이 필요합니다.");
//       next({ name: "home" });
//       return;
//     }
//   }

//   next();
// });
// // 네비게이션 가드 강화
// router.beforeEach(async (to, from, next) => {
//   const authStore = useAuthStore();
//   const isLoggedIn = authStore.isAuthenticated;
//   const isAdmin = authStore.isAdmin;

//   // 로그인이 필요한 페이지 처리
//   if (to.meta.requiresAuth && !isLoggedIn) {
//     next({ name: "login", query: { redirect: to.fullPath } });
//     return;
//   }

//   // 관리자 권한이 필요한 페이지 처리
//   if (to.meta.requiresAdmin) {
//     if (!isLoggedIn) {
//       next({ name: "login", query: { redirect: to.fullPath } });
//       return;
//     }

//     // 사용자 정보가 로드되지 않은 경우 로드 시도
//     if (!authStore.user) {
//       try {
//         await authStore.loadUser();
//       } catch (error) {
//         console.error("사용자 정보 로드 실패:", error);
//         next({ name: "login" });
//         return;
//       }
//     }

//     if (!isAdmin) {
//       alert("관리자 권한이 필요합니다.");
//       next({ name: "home" });
//       return;
//     }
//   }

//   next();
// });
// 네비게이션 가드 설정
// router.beforeEach((to, from, next) => {
//   const isLoggedIn = localStorage.getItem("auth-token") !== null;

//   // 인증이 필요한 페이지 처리
//   if (to.meta.requiresAuth && !isLoggedIn) {
//     next({ name: "login", query: { redirect: to.fullPath } });
//     return;
//   }

//   next();
// });

export default router;
