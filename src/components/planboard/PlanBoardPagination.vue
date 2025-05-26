<!-- src/components/PlanBoard/PlanBoardPagination.vue -->
<template>
  <div class="planboard-pagination">
    <!-- 페이지 정보 -->
    <div class="pagination-info">
      <span class="info-text">
        전체 {{ totalItems.toLocaleString() }}개 중 {{ startItem }}-{{ endItem }}번째 표시
      </span>
    </div>

    <!-- 페이지네이션 -->
    <nav aria-label="게시글 페이지네이션" class="pagination-nav">
      <ul class="pagination justify-content-center">
        <!-- 첫 페이지 -->
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button
            class="page-link page-first"
            @click="changePage(1)"
            :disabled="currentPage === 1"
            aria-label="첫 페이지"
          >
            <i class="fas fa-angle-double-left"></i>
          </button>
        </li>

        <!-- 이전 페이지 -->
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button
            class="page-link page-prev"
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            aria-label="이전 페이지"
          >
            <i class="fas fa-angle-left"></i>
          </button>
        </li>

        <!-- 페이지 번호들 -->
        <li
          v-for="page in displayPages"
          :key="page"
          class="page-item"
          :class="{
            active: page === currentPage,
            'page-ellipsis': page === '...',
          }"
        >
          <button
            v-if="page !== '...'"
            class="page-link page-number"
            @click="changePage(page)"
            :aria-label="`${page}페이지`"
            :aria-current="page === currentPage ? 'page' : null"
          >
            {{ page }}
          </button>
          <span v-else class="page-link page-ellipsis-span">
            <i class="fas fa-ellipsis-h"></i>
          </span>
        </li>

        <!-- 다음 페이지 -->
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button
            class="page-link page-next"
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            aria-label="다음 페이지"
          >
            <i class="fas fa-angle-right"></i>
          </button>
        </li>

        <!-- 마지막 페이지 -->
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button
            class="page-link page-last"
            @click="changePage(totalPages)"
            :disabled="currentPage === totalPages"
            aria-label="마지막 페이지"
          >
            <i class="fas fa-angle-double-right"></i>
          </button>
        </li>
      </ul>
    </nav>

    <!-- 페이지 직접 이동 -->
    <div class="page-jump" v-if="totalPages > 10">
      <div class="input-group input-group-sm">
        <input
          type="number"
          v-model="jumpPage"
          class="form-control"
          :min="1"
          :max="totalPages"
          placeholder="페이지"
          @keyup.enter="handlePageJump"
        />
        <button class="btn btn-outline-secondary" @click="handlePageJump" :disabled="!isValidJumpPage">이동</button>
      </div>
      <small class="text-muted mt-1"> 1-{{ totalPages }} 페이지 </small>
    </div>

    <!-- 페이지 크기 선택 (선택적) -->
    <div v-if="showPageSizeSelector" class="page-size-selector">
      <label class="form-label">페이지당 항목 수:</label>
      <select v-model="selectedPageSize" class="form-select form-select-sm" @change="handlePageSizeChange">
        <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}개</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
    default: 1,
  },
  totalPages: {
    type: Number,
    required: true,
    default: 1,
  },
  totalItems: {
    type: Number,
    required: true,
    default: 0,
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
  maxDisplayPages: {
    type: Number,
    default: 5,
  },
  showPageSizeSelector: {
    type: Boolean,
    default: false,
  },
  pageSizeOptions: {
    type: Array,
    default: () => [5, 10, 20, 50],
  },
});

const emit = defineEmits(["page-change", "page-size-change"]);

// 상태 관리
const jumpPage = ref("");
const selectedPageSize = ref(props.itemsPerPage);

// 계산된 속성
const startItem = computed(() => {
  if (props.totalItems === 0) return 0;
  return (props.currentPage - 1) * props.itemsPerPage + 1;
});

const endItem = computed(() => {
  const end = props.currentPage * props.itemsPerPage;
  return Math.min(end, props.totalItems);
});

const displayPages = computed(() => {
  const pages = [];
  const maxPages = props.maxDisplayPages;
  const current = props.currentPage;
  const total = props.totalPages;

  if (total <= maxPages) {
    // 전체 페이지가 표시할 최대 페이지 수보다 적으면 모두 표시
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // 복잡한 페이지네이션 로직
    let startPage = Math.max(1, current - Math.floor(maxPages / 2));
    let endPage = Math.min(total, startPage + maxPages - 1);

    // 끝에서 시작 페이지 조정
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    // 첫 페이지와 시작 페이지 사이에 간격이 있으면 생략 표시
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("...");
      }
    }

    // 메인 페이지 번호들
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // 끝 페이지와 마지막 페이지 사이에 간격이 있으면 생략 표시
    if (endPage < total) {
      if (endPage < total - 1) {
        pages.push("...");
      }
      pages.push(total);
    }
  }

  return pages;
});

const isValidJumpPage = computed(() => {
  const page = parseInt(jumpPage.value);
  return !isNaN(page) && page >= 1 && page <= props.totalPages;
});

// 메서드
const changePage = (page) => {
  if (page < 1 || page > props.totalPages || page === props.currentPage) {
    return;
  }
  emit("page-change", page);
};

const handlePageJump = () => {
  if (!isValidJumpPage.value) {
    alert(`1부터 ${props.totalPages}까지의 페이지 번호를 입력해주세요.`);
    return;
  }

  const page = parseInt(jumpPage.value);
  changePage(page);
  jumpPage.value = "";
};

const handlePageSizeChange = () => {
  emit("page-size-change", selectedPageSize.value);
};

// props 변경 감지
watch(
  () => props.itemsPerPage,
  (newSize) => {
    selectedPageSize.value = newSize;
  }
);
</script>

<style scoped>
.planboard-pagination {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
}

.pagination-info {
  text-align: center;
}

.info-text {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

.pagination-nav {
  flex: 1;
}

.pagination {
  margin-bottom: 0;
  gap: 0.25rem;
}

.page-item {
  margin: 0;
}

.page-link {
  border: 1px solid #dee2e6;
  color: #6c757d;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  background: white;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.page-link:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #adb5bd;
  color: #495057;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-link:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  z-index: 3;
}

.page-item.active .page-link {
  background: #007bff;
  border-color: #007bff;
  color: white;
  font-weight: 600;
  transform: scale(1.05);
  box-shadow: 0 3px 6px rgba(0, 123, 255, 0.3);
}

.page-item.disabled .page-link {
  color: #6c757d;
  background: #fff;
  border-color: #dee2e6;
  opacity: 0.5;
  cursor: not-allowed;
}

.page-first,
.page-last {
  font-weight: 600;
}

.page-prev,
.page-next {
  font-size: 0.9rem;
}

.page-ellipsis-span {
  cursor: default;
  background: transparent;
  border: none;
  color: #6c757d;
}

.page-ellipsis-span:hover {
  background: transparent;
  border: none;
  color: #6c757d;
  transform: none;
  box-shadow: none;
}

.page-jump {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.page-jump .input-group {
  width: 120px;
}

.page-jump .form-control {
  text-align: center;
  font-size: 0.9rem;
}

.page-jump .btn {
  font-size: 0.9rem;
  white-space: nowrap;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-size-selector .form-label {
  margin-bottom: 0;
  font-size: 0.9rem;
  color: #6c757d;
  white-space: nowrap;
}

.page-size-selector .form-select {
  width: auto;
  min-width: 80px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .planboard-pagination {
    gap: 0.75rem;
    padding: 1.5rem 0;
  }

  .pagination {
    gap: 0.1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .page-link {
    padding: 0.4rem 0.6rem;
    min-width: 36px;
    height: 36px;
    font-size: 0.85rem;
  }

  .page-jump {
    order: -1;
  }

  .page-size-selector {
    flex-direction: column;
    text-align: center;
    gap: 0.25rem;
  }

  .info-text {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .planboard-pagination {
    padding: 1rem 0;
  }

  .pagination {
    gap: 0.05rem;
  }

  .page-link {
    padding: 0.3rem 0.5rem;
    min-width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }

  /* 모바일에서는 일부 페이지 번호 숨기기 */
  .page-item:not(.active):not(.disabled) .page-number {
    display: none;
  }

  .page-item.active .page-number,
  .page-item .page-first,
  .page-item .page-prev,
  .page-item .page-next,
  .page-item .page-last,
  .page-item .page-ellipsis-span {
    display: flex;
  }

  /* 현재 페이지 근처 페이지들만 표시 */
  .page-item.nearby .page-number {
    display: flex;
  }
}

/* 다크 모드 지원 (선택적) */
@media (prefers-color-scheme: dark) {
  .page-link {
    background: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
  }

  .page-link:hover:not(:disabled) {
    background: #4a5568;
    border-color: #718096;
    color: #f7fafc;
  }

  .page-item.active .page-link {
    background: #3182ce;
    border-color: #3182ce;
  }

  .page-item.disabled .page-link {
    background: #2d3748;
    border-color: #4a5568;
    color: #718096;
  }

  .info-text {
    color: #a0aec0;
  }
}

/* 애니메이션 */
@keyframes pageChange {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.page-item.active .page-link {
  animation: pageChange 0.3s ease;
}

/* 호버 효과 개선 */
.page-link:not(.page-ellipsis-span):not(:disabled) {
  position: relative;
  overflow: hidden;
}

.page-link:not(.page-ellipsis-span):not(:disabled)::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(0, 123, 255, 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

.page-link:not(.page-ellipsis-span):not(:disabled):hover::before {
  width: 100%;
  height: 100%;
}

/* 포커스 스타일 개선 */
.page-link:focus-visible {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* 접근성 개선 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 로딩 상태 */
.pagination.loading {
  opacity: 0.6;
  pointer-events: none;
}

.pagination.loading .page-link {
  cursor: wait;
}

/* 커스텀 툴팁 */
.page-link[title] {
  position: relative;
}

.page-link[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 1000;
  margin-bottom: 0.25rem;
}

.page-link[title]:hover::before {
  content: "";
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid #333;
  z-index: 1000;
}
</style>
