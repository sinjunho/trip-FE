<!-- src/views/PasswordResetView.vue -->
<template>
  <div class="password-reset-view">
    <div class="auth-container">
      <div class="auth-form">
        <h1>비밀번호 찾기</h1>
        <p class="subtitle">아이디와 등록된 전화번호를 입력하시면 비밀번호를 찾을 수 있습니다.</p>

        <div v-if="error" class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> {{ error }}</div>

        <form @submit.prevent="handlePasswordReset">
          <div class="form-group mb-3">
            <label for="id">아이디</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-user"></i></span>
              <input
                type="text"
                id="id"
                v-model="form.id"
                class="form-control"
                placeholder="아이디를 입력하세요"
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
                v-model="form.tel"
                class="form-control"
                placeholder="전화번호를 입력하세요 (예: 010-1234-5678)"
                required
              />
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-100" :disabled="loading">
            <span v-if="loading">처리 중...</span>
            <span v-else>비밀번호 찾기</span>
          </button>
        </form>

        <div class="text-center mt-3">
          <p>
            <router-link to="/login" class="link-primary">로그인 페이지로 돌아가기</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api";

const router = useRouter();
const form = ref({
  id: "",
  tel: "",
});
const loading = ref(false);
const error = ref(null);
const successMessage = ref(null);

const handlePasswordReset = async () => {
  try {
    loading.value = true;
    error.value = null;

    // API 호출 - 실제 엔드포인트에 맞게 수정
    const response = await apiClient.post("/members/find-password", {
      id: form.value.id,
      tel: form.value.tel,
    });

    // 성공 처리
    successMessage.value = "비밀번호 찾기 요청이 완료되었습니다. 등록된 전화번호로 확인해주세요.";
    alert(successMessage.value);
    router.push("/login");
  } catch (err) {
    error.value = err.response?.data?.message || "비밀번호 찾기에 실패했습니다. 입력한 정보를 확인해주세요.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.password-reset-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
  background-color: #f8f9fa;
}

.auth-container {
  display: flex;
  max-width: 500px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.auth-form {
  flex: 1;
  padding: 2.5rem;
}

.subtitle {
  color: #6c757d;
  margin-bottom: 2rem;
}

.alert {
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 8px;
}

.alert-danger {
  background-color: #f8d7da;
  color: #842029;
  border: 1px solid #f5c2c7;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #495057;
}
</style>
