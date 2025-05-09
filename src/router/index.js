// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import HomeView from "@/views/HomeView.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
// 기타 뷰 컴포넌트 import...

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    meta: { title: "홈" },
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { title: "로그인", guest: true },
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView,
    meta: { title: "회원가입", guest: true },
  },
  {
    path: "/mypage",
    name: "mypage",
    component: () => import("@/views/MyPageView.vue"),
    meta: { title: "마이페이지", requiresAuth: true },
  },
  {
    path: "/attractions",
    name: "attractions",
    component: () => import("@/views/AttractionView.vue"),
    meta: { title: "관광지 검색" },
  },
  {
    path: "/attractions/:id",
    name: "attraction-detail",
    component: () => import("@/views/AttractionDetailView.vue"),
    meta: { title: "관광지 상세" },
  },
  {
    path: "/board",
    name: "board-list",
    component: () => import("@/views/BoardListView.vue"),
    meta: { title: "게시판" },
  },
  {
    path: "/board/write",
    name: "board-write",
    component: () => import("@/views/BoardWriteView.vue"),
    meta: { title: "게시글 작성", requiresAuth: true },
  },
  {
    path: "/board/:id",
    name: "board-detail",
    component: () => import("@/views/BoardDetailView.vue"),
    meta: { title: "게시글 상세" },
  },
  {
    path: "/admin/members",
    name: "admin-members",
    component: () => import("@/views/admin/MemberListView.vue"),
    meta: { title: "회원 관리", requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/NotFoundView.vue"),
    meta: { title: "페이지를 찾을 수 없습니다" },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// 네비게이션 가드 설정
router.beforeEach(async (to, from, next) => {
  // 페이지 제목 설정
  document.title = `${to.meta.title} | Enjoy Trip` || "Enjoy Trip";

  const authStore = useAuthStore();

  // 사용자 정보가 없지만 토큰이 있는 경우 사용자 정보 로드
  if (!authStore.user && authStore.token) {
    await authStore.loadUser();
  }

  // 인증이 필요한 페이지에 접근했을 때
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // 로그인 페이지로 리다이렉트
    return next({ name: "login", query: { redirect: to.fullPath } });
  }

  // 관리자 권한이 필요한 페이지에 접근했을 때
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    // 권한 없음 메시지와 함께 홈으로 리다이렉트
    alert("관리자 권한이 필요합니다.");
    return next({ name: "home" });
  }

  // 이미 로그인된 사용자가 로그인/회원가입 페이지에 접근했을 때
  if (to.meta.guest && authStore.isAuthenticated) {
    return next({ name: "home" });
  }

  next();
});

export default router;
