<!-- src/views/MypageView.vue -->
<template>
  <div class="mypage-view">
    <div class="mypage-container">
      <div class="mypage-header">
        <h1>마이페이지</h1>
        <p>회원 정보 관리 및 활동 내역을 확인할 수 있습니다.</p>
      </div>

      <div class="user-info">
        <h2>회원 정보</h2>
        <ul class="info-list">
          <li>
            <i class="fas fa-user"></i>
            <span class="info-label">이름</span>
            <span>{{ user?.name || "-" }}</span>
          </li>
          <li>
            <i class="fas fa-id-card"></i>
            <span class="info-label">아이디</span>
            <span>{{ user?.id || "-" }}</span>
          </li>
          <li>
            <i class="fas fa-home"></i>
            <span class="info-label">주소</span>
            <span>{{ user?.address || "-" }}</span>
          </li>
          <li>
            <i class="fas fa-phone"></i>
            <span class="info-label">전화번호</span>
            <span>{{ user?.tel || "-" }}</span>
          </li>
        </ul>
      </div>

      <div class="form-section">
        <h2>회원 정보 수정</h2>
        <form @submit.prevent="handleUpdateProfile">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group mb-3">
                <label for="name">이름</label>
                <input type="text" id="name" v-model="form.name" class="form-control" required />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group mb-3">
                <label for="tel">전화번호</label>
                <input type="tel" id="tel" v-model="form.tel" class="form-control" required />
              </div>
            </div>
          </div>

          <div class="form-group mb-3">
            <label for="address">주소</label>
            <input type="text" id="address" v-model="form.address" class="form-control" required />
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="form-group mb-3">
                <label for="password">새 비밀번호</label>
                <input type="password" id="password" v-model="form.password" class="form-control" />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group mb-3">
                <label for="passwordConfirm">비밀번호 확인</label>
                <input type="password" id="passwordConfirm" v-model="form.passwordConfirm" class="form-control" />
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-update" :disabled="isSubmitting">정보 수정</button>
        </form>
      </div>

      <div class="form-section">
        <h2>회원 탈퇴</h2>
        <div class="delete-warning">
          <i class="fas fa-exclamation-triangle"></i>
          회원 탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다.
        </div>

        <button @click="showDeleteConfirm = true" class="btn btn-danger">회원 탈퇴</button>

        <!-- 탈퇴 확인 모달 -->
        <div v-if="showDeleteConfirm" class="modal">
          <div class="modal-content">
            <h3>회원 탈퇴 확인</h3>
            <p>정말로 탈퇴하시겠습니까? 모든 정보가 삭제됩니다.</p>

            <form @submit.prevent="handleDeleteAccount">
              <div class="form-group">
                <label for="deletePassword">비밀번호 확인</label>
                <input
                  type="password"
                  id="deletePassword"
                  v-model="deleteForm.password"
                  class="form-control"
                  required
                />
              </div>

              <div class="modal-actions">
                <button type="button" @click="showDeleteConfirm = false" class="btn btn-secondary">취소</button>
                <button type="submit" class="btn btn-danger" :disabled="isDeleting">탈퇴하기</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const user = computed(() => authStore.user);
const isSubmitting = ref(false);
const showDeleteConfirm = ref(false);
const isDeleting = ref(false);

// 폼 데이터
const form = ref({
  name: "",
  address: "",
  tel: "",
  password: "",
  passwordConfirm: "",
});

// 탈퇴 폼
const deleteForm = ref({
  password: "",
});

// 사용자 정보 로드
onMounted(() => {
  if (user.value) {
    form.value.name = user.value.name || "";
    form.value.address = user.value.address || "";
    form.value.tel = user.value.tel || "";
  }
});

// 프로필 업데이트
const handleUpdateProfile = async () => {
  // 비밀번호 확인
  if (form.value.password && form.value.password !== form.value.passwordConfirm) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  try {
    isSubmitting.value = true;

    // 업데이트할 데이터 준비
    const updateData = {
      name: form.value.name,
      address: form.value.address,
      tel: form.value.tel,
    };

    // 비밀번호가 입력된 경우에만 포함
    if (form.value.password) {
      updateData.password = form.value.password;
    }

    // 프로필 업데이트 API 호출
    const success = await authStore.updateProfile(updateData);

    if (success) {
      alert("회원 정보가 성공적으로 업데이트되었습니다.");
      // 비밀번호 필드 초기화
      form.value.password = "";
      form.value.passwordConfirm = "";
    }
  } catch (error) {
    console.error("프로필 업데이트 에러:", error);
    alert("프로필 업데이트 중 오류가 발생했습니다.");
  } finally {
    isSubmitting.value = false;
  }
};

// 회원 탈퇴
const handleDeleteAccount = async () => {
  try {
    isDeleting.value = true;

    const success = await authStore.deleteMember(deleteForm.value.password);

    if (success) {
      alert("회원 탈퇴가 완료되었습니다.");
      router.push("/");
    }
  } catch (error) {
    console.error("회원 탈퇴 에러:", error);
    alert("회원 탈퇴 중 오류가 발생했습니다.");
  } finally {
    isDeleting.value = false;
    showDeleteConfirm.value = false;
  }
};
</script>

<style scoped>
.mypage-view {
  padding: 50px 15px;
  background-color: #f8f9fa;
  min-height: 80vh;
}

.mypage-container {
  max-width: 800px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 40px;
}

.mypage-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.mypage-header h1 {
  color: #0d6efd;
  font-weight: 700;
  margin-bottom: 10px;
  font-size: 2.2rem;
}

.mypage-header::after {
  content: "";
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background-color: #0d6efd;
}

.user-info {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 30px;
  border-left: 4px solid #0d6efd;
}

.user-info h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5rem;
  font-weight: 600;
}

.info-list {
  list-style: none;
  padding: 0;
}

.info-list li {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
}

.info-list li:last-child {
  border-bottom: none;
}

.info-list i {
  width: 30px;
  color: #0d6efd;
  margin-right: 10px;
}

.info-label {
  font-weight: 600;
  color: #495057;
  width: 100px;
}

.form-section {
  margin-top: 40px;
  border-top: 1px solid #e9ecef;
  padding-top: 30px;
}

.form-section h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 20px;
  font-weight: 600;
}

.btn-update {
  background-color: #0d6efd;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-update:hover {
  background-color: #0a58ca;
  transform: translateY(-2px);
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-danger:hover {
  background-color: #bb2d3b;
  transform: translateY(-2px);
}

.delete-warning {
  background-color: #f8d7da;
  color: #842029;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #dc3545;
}

.delete-warning i {
  margin-right: 10px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
}

.modal-content h3 {
  margin-bottom: 15px;
  color: #333;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 15px;
  font-size: 1rem;
  cursor: pointer;
}

@media (max-width: 768px) {
  .mypage-container {
    padding: 20px;
  }

  .info-list li {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-label {
    width: 100%;
    margin-bottom: 5px;
  }

  .info-list i {
    margin-bottom: 5px;
  }
}
</style>
