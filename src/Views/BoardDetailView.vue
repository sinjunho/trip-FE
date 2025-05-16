<!-- src/views/BoardDetailView.vue -->
<template>
  <div class="board-detail-view">
    <div class="container py-4">
      <div class="card">
        <div class="card-header bg-white">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h2 class="mb-0">{{ board.title }}</h2>
            <div class="badge bg-primary">조회수: {{ board.viewCnt }}</div>
          </div>
          <div class="d-flex justify-content-between text-muted">
            <div>
              <span class="me-3"><i class="fas fa-user"></i> {{ board.writer }}</span>
            </div>
            <div>
              <span><i class="far fa-clock"></i> {{ formatDate(board.regDate) }}</span>
            </div>
          </div>
        </div>

        <div class="card-body">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">로딩중...</span>
            </div>
          </div>
          <div v-else>
            <!-- 게시글 내용 -->
            <div class="board-content mb-4">
              {{ board.content }}
            </div>

            <!-- 버튼 그룹 -->
            <div class="d-flex justify-content-between mt-4">
              <router-link to="/board" class="btn btn-secondary"> <i class="fas fa-list"></i> 목록 </router-link>

              <div v-if="isAuthor">
                <router-link :to="`/board/edit/${board.bno}`" class="btn btn-primary me-2">
                  <i class="fas fa-edit"></i> 수정
                </router-link>
                <button class="btn btn-danger" @click="confirmDelete"><i class="fas fa-trash"></i> 삭제</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 댓글 기능은 추후 구현 가능 -->
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
const board = ref({});
const loading = ref(true);

// 계산된 속성
const isAuthor = computed(() => {
  return (
    authStore.isAuthenticated &&
    board.value &&
    board.value.writer &&
    (board.value.writer === authStore.user?.name || authStore.isAdmin)
  );
});

// 메서드
const fetchBoardDetail = async () => {
  try {
    loading.value = true;
    const bno = parseInt(route.params.bno);

    if (isNaN(bno)) {
      throw new Error("유효하지 않은 게시글 번호입니다.");
    }

    const response = await boardAPI.getBoardDetail(bno);
    board.value = response.data;
  } catch (error) {
    console.error("게시글 상세 정보를 가져오는 중 오류 발생:", error);
    // 오류 발생 시 목록으로 이동
    router.push("/board");
  } finally {
    loading.value = false;
  }
};

const confirmDelete = () => {
  if (confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
    deleteBoard();
  }
};

const deleteBoard = async () => {
  try {
    loading.value = true;
    const bno = board.value.bno;
    await boardAPI.deleteBoard(bno);
    alert("게시글이 삭제되었습니다.");
    router.push("/board");
  } catch (error) {
    console.error("게시글 삭제 중 오류 발생:", error);
    alert("게시글 삭제에 실패했습니다.");
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 컴포넌트 마운트 시 게시글 상세 정보 불러오기
onMounted(() => {
  fetchBoardDetail();
});
</script>

<style scoped>
.board-detail-view .card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 10px;
  overflow: hidden;
}

.board-detail-view .card-header {
  border-bottom: 1px solid #eee;
  padding: 1.5rem;
}

.board-detail-view .card-body {
  padding: 2rem;
}

.board-content {
  min-height: 300px;
  white-space: pre-line;
}
</style>
