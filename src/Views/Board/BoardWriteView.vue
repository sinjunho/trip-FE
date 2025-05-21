<!-- src/views/BoardWriteView.vue -->
<template>
  <div class="board-write-view">
    <div class="container py-4">
      <h1 class="mb-4">{{ isEdit ? "게시글 수정" : "게시글 작성" }}</h1>

      <div class="card">
        <div class="card-body">
          <form @submit.prevent="submitForm">
            <div class="mb-3">
              <label for="title" class="form-label">제목</label>
              <input
                type="text"
                class="form-control"
                id="title"
                v-model="boardForm.title"
                placeholder="제목을 입력하세요"
                required
              />
            </div>

            <div class="mb-3">
              <label for="content" class="form-label">내용</label>
              <textarea
                class="form-control"
                id="content"
                v-model="boardForm.content"
                rows="10"
                placeholder="내용을 입력하세요"
                required
              ></textarea>
            </div>

            <div class="d-flex justify-content-between">
              <router-link to="/board" class="btn btn-secondary"> <i class="fas fa-times"></i> 취소 </router-link>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <i class="fas fa-save"></i> {{ isEdit ? "수정하기" : "등록하기" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import boardAPI from "@/api/board";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// 상태 관리
const boardForm = ref({
  title: "",
  content: "",
});
const isSubmitting = ref(false);
const isEdit = computed(() => !!route.params.bno);

// 권한 체크
if (!authStore.isAuthenticated) {
  alert("로그인이 필요한 서비스입니다.");
  router.push("/login");
}

// 수정 모드일 경우 데이터 불러오기
const fetchBoardDetail = async () => {
  if (!isEdit.value) return;

  try {
    const bno = parseInt(route.params.bno);
    const response = await boardAPI.getBoardDetail(bno);
    const board = response.data;

    // 작성자만 수정 가능
    if (board.writer !== authStore.user?.name && !authStore.isAdmin) {
      alert("수정 권한이 없습니다.");
      router.push(`/board/${bno}`);
      return;
    }

    boardForm.value = {
      title: board.title,
      content: board.content,
    };
  } catch (error) {
    console.error("게시글 정보를 불러오는 중 오류 발생:", error);
    router.push("/board");
  }
};

// 폼 제출 처리
const submitForm = async () => {
  try {
    isSubmitting.value = true;

    if (isEdit.value) {
      // 게시글 수정
      const bno = parseInt(route.params.bno);
      await boardAPI.updateBoard(bno, boardForm.value);
      alert("게시글이 수정되었습니다.");
      router.push(`/board/${bno}`);
    } else {
      // 게시글 등록
      const response = await boardAPI.createBoard(boardForm.value);
      alert("게시글이 등록되었습니다.");
      router.push("/board");
    }
  } catch (error) {
    console.error("게시글 저장 중 오류 발생:", error);
    alert(isEdit.value ? "게시글 수정에 실패했습니다." : "게시글 등록에 실패했습니다.");
  } finally {
    isSubmitting.value = false;
  }
};

// 컴포넌트 마운트 시 실행
onMounted(() => {
  if (isEdit.value) {
    fetchBoardDetail();
  }
});
</script>

<style scoped>
.board-write-view .card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 10px;
  overflow: hidden;
}

.board-write-view .form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.board-write-view textarea {
  resize: vertical;
  min-height: 300px;
}
</style>
