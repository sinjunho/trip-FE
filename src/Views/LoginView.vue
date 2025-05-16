<!-- src/views/LoginView.vue -->
<template>
  <div class="login-view">
    <div class="auth-container">
      <div class="auth-form">
        <h1>로그인</h1>
        <p class="subtitle">Enjoy Trip 서비스를 이용하기 위해 로그인하세요</p>

        <div v-if="authStore.error" class="alert alert-danger">
          <i class="fas fa-exclamation-circle"></i> {{ authStore.error }}
        </div>

        <form @submit.prevent="handleLogin">
          <div class="form-group mb-3">
            <label for="id">아이디</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-user"></i></span>
              <input
                type="text"
                id="id"
                v-model="loginForm.id"
                class="form-control"
                placeholder="아이디를 입력하세요"
                required
              />
            </div>
          </div>

          <div class="form-group mb-3">
            <label for="password">비밀번호</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-lock"></i></span>
              <input
                type="password"
                id="password"
                v-model="loginForm.password"
                class="form-control"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
          </div>

          <div class="d-flex justify-content-between mb-3">
            <div class="form-check">
              <input type="checkbox" id="remember-me" v-model="loginForm.rememberMe" class="form-check-input" />
              <label for="remember-me" class="form-check-label">아이디 기억하기</label>
            </div>
            <router-link to="/password-reset" class="link-primary"> 비밀번호 찾기 </router-link>
          </div>

          <button type="submit" class="btn btn-primary w-100" :disabled="authStore.loading">
            <span v-if="authStore.loading">로그인 중...</span>
            <span v-else>로그인</span>
          </button>
        </form>

        <div class="text-center my-3">또는</div>

        <div class="social-login">
          <button class="btn btn-outline-secondary w-100 mb-2">
            <i class="fab fa-google me-2"></i> Google로 로그인
          </button>
          <button class="btn btn-warning w-100"><i class="fas fa-comment me-2"></i> Kakao로 로그인</button>
        </div>

        <div class="text-center mt-3">
          <p>
            계정이 없으신가요?
            <router-link to="/register" class="link-primary">회원가입</router-link>
          </p>
        </div>
      </div>

      <div class="auth-image d-none d-lg-flex">
        <div class="image-text">
          <h2>어서오세요!</h2>
          <p>로그인하여 Enjoy Trip에서 제공하는 다양한 여행 정보와 맞춤형 서비스를 이용해보세요.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loginForm = ref({
  id: "",
  password: "",
  rememberMe: false,
});

const handleLogin = async () => {
  const success = await authStore.login({
    id: loginForm.value.id,
    password: loginForm.value.password,
  });

  if (success) {
    // rememberMe가 체크되어 있으면 아이디 저장
    if (loginForm.value.rememberMe) {
      localStorage.setItem("remembered-id", loginForm.value.id);
    } else {
      localStorage.removeItem("remembered-id");
    }

    // 리다이렉트 처리
    const redirectPath = route.query.redirect || "/";
    router.push(redirectPath);
  }
};

// 저장된 아이디가 있으면 불러오기
const rememberedId = localStorage.getItem("remembered-id");
if (rememberedId) {
  loginForm.value.id = rememberedId;
  loginForm.value.rememberMe = true;
}
</script>

<style scoped>
.login-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
  background-color: #f8f9fa;
}

.auth-container {
  display: flex;
  max-width: 1000px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.auth-form {
  flex: 1;
  padding: 3rem;
}

.auth-image {
  flex: 1;
  background-image: url("https://images.unsplash.com/photo-1517154421773-0529f29ea451");
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-image::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4));
}

.image-text {
  position: relative;
  color: white;
  text-align: center;
  z-index: 1;
}

.subtitle {
  color: #6c757d;
  margin-bottom: 2rem;
}

.social-login {
  margin-top: 1rem;
}

@media (max-width: 992px) {
  .auth-form {
    padding: 2rem;
  }
}
</style>
