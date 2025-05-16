-- src/views/BoardListView.vue -->
<template>
  <div class="board-list-view">
    <div class="container py-4">
      <h1 class="mb-4">커뮤니티 게시판</h1>

      <div class="d-flex justify-content-between mb-3">
        <div class="search-container">
          <div class="input-group">
            <select v-model="searchKey" class="form-select" style="max-width: 120px">
              <option value="1">제목</option>
              <option value="2">작성자</option>
            </select>
            <input
              type="text"
              v-model="searchWord"
              class="form-control"
              placeholder="검색어 입력"
              @keyup.enter="searchBoards"
            />
            <button class="btn btn-primary" @click="searchBoards"><i class="fas fa-search"></i> 검색</button>
          </div>
        </div>

        <router-link v-if="authStore.isAuthenticated" to="/board/write" class="btn btn-success">
          <i class="fas fa-pen"></i> 글쓰기
        </router-link>
      </div>

      <div class="board-table-container">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">로딩중...</span>
          </div>
        </div>

        <div v-else-if="!boardList || boardList.length === 0" class="text-center py-5">
          <p class="text-muted">게시글이 없습니다.</p>
        </div>

        <table v-else class="table table-hover">
          <thead class="table-light">
            <tr>
              <th style="width: 10%">번호</th>
              <th style="width: 50%">제목</th>
              <th style="width: 15%">작성자</th>
              <th style="width: 15%">작성일</th>
              <th style="width: 10%">조회수</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="board in boardList" :key="board.bno" @click="goToDetail(board.bno)" style="cursor: pointer">
              <td>{{ board.bno }}</td>
              <td>{{ board.title }}</td>
              <td>{{ board.writer }}</td>
              <td>{{ formatDate(board.regDate) }}</td>
              <td>{{ board.viewCnt }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="totalPages > 0" class="pagination-container d-flex justify-content-center mt-4">
        <nav aria-label="Page navigation">
          <ul class="pagination">
            <li :class="['page-item', { disabled: currentPage === 1 }]">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                <i class="fas fa-chevron-left"></i>
              </a>
            </li>

            <li v-for="page in displayPages" :key="page" :class="['page-item', { active: page === currentPage }]">
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
            </li>

            <li :class="['page-item', { disabled: currentPage === totalPages }]">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                <i class="fas fa-chevron-right"></i>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import boardAPI from "@/api/board";

const router = useRouter();
const authStore = useAuthStore();

// 상태 관리
const loading = ref(true);
const boardList = ref([]);
const searchKey = ref("1"); // 기본값: 제목으로 검색
const searchWord = ref("");
const currentPage = ref(1);
const totalItems = ref(0);
const totalPages = ref(0);
const itemsPerPage = ref(10);

// 계산된 속성
const displayPages = computed(() => {
  // 페이지네이션에 표시할 페이지 범위 계산
  const pages = [];
  const maxPages = 5; // 표시할 최대 페이지 수

  let startPage = Math.max(1, currentPage.value - Math.floor(maxPages / 2));
  let endPage = startPage + maxPages - 1;

  if (endPage > totalPages.value) {
    endPage = totalPages.value;
    startPage = Math.max(1, endPage - maxPages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
});

// 메서드
const fetchBoards = async () => {
  try {
    loading.value = true;

    const params = {
      key: searchKey.value === "" ? null : searchKey.value,
      word: searchWord.value === "" ? null : searchWord.value,
      currentPage: currentPage.value,
    };

    const response = await boardAPI.getBoards(params);
    const data = response.data;

    // 응답 데이터 구조에 맞게 할당
    boardList.value = data.list || [];
    totalItems.value = data.totalItems || 0;
    totalPages.value = data.totalPages || 0;
    currentPage.value = data.condition?.currentPage || 1;
    itemsPerPage.value = data.condition?.itemsPerPage || 10;
  } catch (error) {
    console.error("게시글 목록을 가져오는 중 오류 발생:", error);
  } finally {
    loading.value = false;
  }
};

const searchBoards = () => {
  currentPage.value = 1; // 검색 시 첫 페이지로 이동
  fetchBoards();
};

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchBoards();
};

const goToDetail = (bno) => {
  router.push(`/board/${bno}`);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);

  // 날짜가 오늘인지 확인
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday) {
    // 오늘이면 시간만 표시
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    // 다른 날짜면 년-월-일 표시
    return date
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\. /g, "-")
      .replace(".", "");
  }
};

// 컴포넌트 마운트 시 게시글 목록 불러오기
onMounted(() => {
  fetchBoards();
});
</script>

<style scoped>
.board-table-container {
  min-height: 400px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.table {
  margin-bottom: 0;
}

.table thead th {
  font-weight: 600;
  text-align: center;
}

.table tbody td {
  text-align: center;
  vertical-align: middle;
}

.table tbody td:nth-child(2) {
  text-align: left;
}

.pagination-container .pagination {
  margin-bottom: 0;
}

.pagination .page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.pagination .page-link {
  color: #0d6efd;
}
</style>
