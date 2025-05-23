// src/main.js
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { usePlanStore } from "@/stores/plan";

// 스타일 및 라이브러리
import "./assets/css/main.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
