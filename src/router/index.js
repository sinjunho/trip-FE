// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import AttractionView from "../views/AttractionView.vue";
import BoardView from "../views/BoardView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/attractions",
    name: "attractions",
    component: AttractionView,
  },
  {
    path: "/board",
    name: "board",
    component: BoardView,
  },
  // 다른 라우트들...
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
