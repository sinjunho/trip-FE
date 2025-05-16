<!-- src/views/RegisterView.vue -->
<template>
  <div class="register-view">
    <div class="auth-container">
      <div class="auth-image d-none d-lg-flex">
        <div class="image-text">
          <h2>환영합니다!</h2>
          <p>회원가입하고 나만의 여행 계획을 만들어보세요. Enjoy Trip과 함께라면 특별한 여행이 기다립니다.</p>
        </div>
      </div>

      <div class="auth-form">
        <h1>회원가입</h1>
        <p class="subtitle">Enjoy Trip 서비스를 이용하기 위한 계정을 만들어보세요</p>

        <div v-if="authStore.error" class="alert alert-danger">
          <i class="fas fa-exclamation-circle"></i> {{ authStore.error }}
        </div>

        <form @submit.prevent="handleRegister">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group mb-3">
                <label for="name">이름</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fas fa-user"></i></span>
                  <input
                    type="text"
                    id="name"
                    v-model="registerForm.name"
                    class="form-control"
                    placeholder="이름을 입력하세요"
                    required
                  />
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group mb-3">
                <label for="id">아이디</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fas fa-id-card"></i></span>
                  <input
                    type="text"
                    id="id"
                    v-model="registerForm.id"
                    class="form-control"
                    placeholder="사용할 아이디를 입력하세요"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="form-group mb-3">
            <label for="password">비밀번호</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-lock"></i></span>
              <input
                type="password"
                id="password"
                v-model="registerForm.password"
                class="form-control"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
          </div>

          <div class="form-group mb-3">
            <label for="passwordConfirm">비밀번호 확인</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-lock"></i></span>
              <input
                type="password"
                id="passwordConfirm"
                v-model="registerForm.passwordConfirm"
                class="form-control"
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
            </div>
            <div v-if="passwordMismatch" class="text-danger mt-1">비밀번호가 일치하지 않습니다.</div>
          </div>

          <div class="form-group mb-3">
            <label for="address">주소</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-home"></i></span>
              <input
                type="text"
                id="address"
                v-model="registerForm.address"
                class="form-control"
                placeholder="주소를 입력하세요"
                required
              />
            </div>
          </div>

          <div class="form-group mb-3">
            <label for="tel">전화번호</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-phone"></i></span>
              <input
                type="tel"
                id="tel"
                v-model="registerForm.tel"
                class="form-control"
                placeholder="전화번호를 입력하세요 (예: 010-1234-5678)"
                required
              />
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-100" :disabled="isSubmitting">
            <span v-if="isSubmitting">회원가입 중...</span>
            <span v-else>회원가입</span>
          </button>
        </form>

        <div class="text-center mt-3">
          <p>
            이미 계정이 있으신가요?
            <router-link to="/login" class="link-primary">로그인</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const isSubmitting = ref(false);

const registerForm = ref({
  name: "",
  id: "",
  password: "",
  passwordConfirm: "",
  address: "",
  tel: "",
});

const passwordMismatch = computed(() => {
  return (
    registerForm.value.password &&
    registerForm.value.passwordConfirm &&
    registerForm.value.password !== registerForm.value.passwordConfirm
  );
});

const handleRegister = async () => {
  // 비밀번호 확인
  if (passwordMismatch.value) {
    return;
  }

  isSubmitting.value = true;

  try {
    // 회원가입 폼에서 passwordConfirm 제외
    const { passwordConfirm, ...userData } = registerForm.value;

    const success = await authStore.register(userData);

    if (success) {
      router.push("/login");
      alert("회원가입이 완료되었습니다. 로그인해주세요.");
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.register-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
  background-color: #f8f9fa;
}

.auth-container {
  display: flex;
  max-width: 1100px;
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
  flex: 0.6;
  background-image: url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e");
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

@media (max-width: 992px) {
  .auth-form {
    padding: 2rem;
  }
}
</style>
