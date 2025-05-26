<!-- src/components/planboard/PlanBoardTags.vue -->
<template>
  <div class="planboard-tags">
    <div class="tags-container">
      <span
        v-for="tag in displayTags"
        :key="tag.tagId || tag.tagName || tag"
        class="tag-item"
        :class="{
          'tag-clickable': clickable,
          'tag-popular': showUseCount && isPopularTag(tag),
          'tag-selected': isTagSelected(tag),
        }"
        @click="handleTagClick(tag)"
      >
        <i class="fas fa-hashtag tag-icon"></i>
        {{ getTagName(tag) }}
        <span v-if="showUseCount && getTagUseCount(tag)" class="tag-count">
          {{ getTagUseCount(tag) }}
        </span>
        <button
          v-if="removable && !readonly"
          class="tag-remove"
          @click.stop="handleTagRemove(tag)"
          :title="'태그 삭제'"
        >
          <i class="fas fa-times"></i>
        </button>
      </span>

      <!-- 더 많은 태그가 있을 때 표시 -->
      <span v-if="hasMoreTags" class="tag-more" @click="toggleShowAll">
        <i class="fas" :class="showAllTags ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        {{ showAllTags ? "접기" : `+${remainingTagsCount}` }}
      </span>

      <!-- 태그 추가 버튼 (편집 모드일 때) -->
      <button v-if="editable && !readonly" class="tag-add-btn" @click="toggleAddInput" :title="'새 태그 추가'">
        <i class="fas fa-plus"></i>
        태그 추가
      </button>
    </div>

    <!-- 태그 추가 입력창 -->
    <transition name="fade">
      <div v-if="showAddInput && !readonly" class="tag-input-container">
        <div class="input-group">
          <span class="input-group-text">
            <i class="fas fa-hashtag"></i>
          </span>
          <input
            ref="tagInput"
            type="text"
            v-model="newTagName"
            class="form-control"
            placeholder="태그명 입력 (엔터로 추가)"
            @keyup.enter="addTag"
            @keyup.escape="cancelAddTag"
            @input="validateTagInput"
            maxlength="20"
          />
          <button class="btn btn-outline-primary" @click="addTag" :disabled="!isValidTag">추가</button>
          <button class="btn btn-outline-secondary" @click="cancelAddTag">취소</button>
        </div>

        <!-- 입력 유효성 메시지 -->
        <div v-if="validationMessage" class="validation-message" :class="validationMessageClass">
          <i class="fas" :class="isValidTag ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
          {{ validationMessage }}
        </div>

        <!-- 추천 태그 -->
        <div v-if="filteredSuggestedTags.length > 0" class="suggested-tags">
          <div class="suggested-label">
            <i class="fas fa-lightbulb me-1"></i>
            추천 태그:
          </div>
          <div class="suggested-list">
            <span
              v-for="suggestedTag in filteredSuggestedTags"
              :key="suggestedTag"
              class="suggested-tag"
              @click="selectSuggestedTag(suggestedTag)"
            >
              #{{ suggestedTag }}
            </span>
          </div>
        </div>
      </div>
    </transition>

    <!-- 태그 통계 (관리자용) -->
    <div v-if="showStats && tags.length > 0" class="tag-stats">
      <div class="stats-header">
        <i class="fas fa-chart-bar me-1"></i>
        태그 통계
      </div>
      <div class="stats-content">
        <div class="stat-item">
          <span class="stat-label">총 태그 수:</span>
          <span class="stat-value">{{ tags.length }}개</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">평균 사용량:</span>
          <span class="stat-value">{{ averageUseCount.toFixed(1) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">최다 사용:</span>
          <span class="stat-value">{{ maxUseCount }}회</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">인기 태그:</span>
          <span class="stat-value">{{ popularTagsCount }}개</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from "vue";

const props = defineProps({
  tags: {
    type: Array,
    default: () => [],
  },
  maxDisplay: {
    type: Number,
    default: 10,
  },
  clickable: {
    type: Boolean,
    default: false,
  },
  removable: {
    type: Boolean,
    default: false,
  },
  editable: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  showUseCount: {
    type: Boolean,
    default: false,
  },
  showStats: {
    type: Boolean,
    default: false,
  },
  selectedTags: {
    type: Array,
    default: () => [],
  },
  popularThreshold: {
    type: Number,
    default: 1.5, // 평균의 1.5배 이상이면 인기 태그
  },
});

const emit = defineEmits(["tag-click", "tag-remove", "tag-add", "tags-updated"]);

// 상태 관리
const showAllTags = ref(false);
const showAddInput = ref(false);
const newTagName = ref("");
const tagInput = ref(null);

// 추천 태그 목록 (한국 여행 관련)
const suggestedTags = ref([
  "제주도",
  "부산",
  "서울",
  "강릉",
  "여수",
  "경주",
  "전주",
  "춘천",
  "속초",
  "포항",
  "힐링",
  "맛집",
  "카페",
  "바다",
  "산",
  "계곡",
  "온천",
  "축제",
  "야경",
  "일출",
  "혼자여행",
  "커플여행",
  "가족여행",
  "친구여행",
  "효도여행",
  "신혼여행",
  "사진맛집",
  "인스타",
  "핫플레이스",
  "숨은맛집",
  "로컬맛집",
  "전통시장",
  "드라이브",
  "캠핑",
  "펜션",
  "호텔",
  "게스트하우스",
  "민박",
  "리조트",
  "문화체험",
  "역사탐방",
  "자연체험",
  "액티비티",
  "테마파크",
  "박물관",
  "봄여행",
  "여름여행",
  "가을여행",
  "겨울여행",
  "벚꽃",
  "단풍",
  "눈꽃",
]);

// 계산된 속성
const displayTags = computed(() => {
  if (showAllTags.value || props.tags.length <= props.maxDisplay) {
    return props.tags;
  }
  return props.tags.slice(0, props.maxDisplay);
});

const hasMoreTags = computed(() => {
  return props.tags.length > props.maxDisplay;
});

const remainingTagsCount = computed(() => {
  return Math.max(0, props.tags.length - props.maxDisplay);
});

const averageUseCount = computed(() => {
  if (!props.showUseCount || props.tags.length === 0) return 0;
  const total = props.tags.reduce((sum, tag) => sum + getTagUseCount(tag), 0);
  return total / props.tags.length;
});

const maxUseCount = computed(() => {
  if (!props.showUseCount || props.tags.length === 0) return 0;
  return Math.max(...props.tags.map((tag) => getTagUseCount(tag)));
});

const popularTagsCount = computed(() => {
  if (!props.showUseCount) return 0;
  const threshold = averageUseCount.value * props.popularThreshold;
  return props.tags.filter((tag) => getTagUseCount(tag) >= threshold).length;
});

// 입력된 태그명과 관련된 추천 태그 필터링
const filteredSuggestedTags = computed(() => {
  if (!newTagName.value) {
    // 이미 사용된 태그 제외하고 랜덤하게 8개 선택
    const availableTags = suggestedTags.value.filter(
      (tag) => !props.tags.some((existingTag) => getTagName(existingTag) === tag)
    );
    return availableTags.slice(0, 8);
  }

  const input = newTagName.value.toLowerCase().trim();
  const filtered = suggestedTags.value.filter((tag) => {
    const isMatched = tag.toLowerCase().includes(input);
    const isNotUsed = !props.tags.some((existingTag) => getTagName(existingTag) === tag);
    return isMatched && isNotUsed;
  });

  return filtered.slice(0, 6);
});

// 태그 입력 유효성 검사
const isValidTag = computed(() => {
  const tagName = newTagName.value.trim();

  if (!tagName) return false;
  if (tagName.length > 20) return false;
  if (!/^[a-zA-Z0-9가-힣\s-_]+$/.test(tagName)) return false;
  if (props.tags.some((tag) => getTagName(tag) === tagName)) return false;

  return true;
});

const validationMessage = computed(() => {
  const tagName = newTagName.value.trim();

  if (!tagName) return "";

  if (tagName.length > 20) {
    return "태그명은 20자 이내로 입력해주세요";
  }

  if (!/^[a-zA-Z0-9가-힣\s-_]+$/.test(tagName)) {
    return "특수문자는 사용할 수 없습니다 (-, _ 제외)";
  }

  if (props.tags.some((tag) => getTagName(tag) === tagName)) {
    return "이미 존재하는 태그입니다";
  }

  return "사용 가능한 태그명입니다";
});

const validationMessageClass = computed(() => {
  return isValidTag.value ? "text-success" : "text-danger";
});

// 헬퍼 함수들
const getTagName = (tag) => {
  if (typeof tag === "string") return tag;
  return tag.tagName || tag.name || "";
};

const getTagUseCount = (tag) => {
  if (typeof tag === "string") return 0;
  return tag.useCount || 0;
};

const isPopularTag = (tag) => {
  if (!props.showUseCount) return false;
  const threshold = averageUseCount.value * props.popularThreshold;
  return getTagUseCount(tag) >= threshold;
};

const isTagSelected = (tag) => {
  const tagName = getTagName(tag);
  return props.selectedTags.includes(tagName);
};

// 메서드
const handleTagClick = (tag) => {
  if (!props.clickable) return;
  emit("tag-click", getTagName(tag));
};

const handleTagRemove = (tag) => {
  if (!props.removable || props.readonly) return;
  emit("tag-remove", tag);
  emit(
    "tags-updated",
    props.tags.filter((t) => t !== tag)
  );
};

const toggleShowAll = () => {
  showAllTags.value = !showAllTags.value;
};

const toggleAddInput = () => {
  showAddInput.value = !showAddInput.value;
  if (showAddInput.value) {
    nextTick(() => {
      tagInput.value?.focus();
    });
  } else {
    cancelAddTag();
  }
};

const addTag = () => {
  if (!isValidTag.value) return;

  const tagName = newTagName.value.trim();
  emit("tag-add", tagName);

  // 새 태그를 포함한 업데이트된 태그 목록 emit
  const updatedTags = [...props.tags, { tagName, useCount: 1 }];
  emit("tags-updated", updatedTags);

  // 폼 초기화
  newTagName.value = "";
  showAddInput.value = false;
};

const cancelAddTag = () => {
  newTagName.value = "";
  showAddInput.value = false;
};

const selectSuggestedTag = (tagName) => {
  newTagName.value = tagName;
  addTag();
};

const validateTagInput = () => {
  // 실시간 유효성 검사는 computed에서 처리
};

// 태그 입력창이 열릴 때 포커스
watch(showAddInput, async (newVal) => {
  if (newVal) {
    await nextTick();
    tagInput.value?.focus();
  }
});

// 외부에서 태그가 변경될 때 상태 동기화
watch(
  () => props.tags,
  () => {
    if (showAllTags.value && props.tags.length <= props.maxDisplay) {
      showAllTags.value = false;
    }
  },
  { deep: true }
);
</script>

<style scoped>
.planboard-tags {
  width: 100%;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: #f8f9fa;
  color: #495057;
  padding: 0.3rem 0.8rem;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  user-select: none;
  position: relative;
  overflow: hidden;
}

.tag-item::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  transition: left 0.5s;
}

.tag-item:hover::before {
  left: 100%;
}

.tag-item:hover {
  background: #e9ecef;
  border-color: #dee2e6;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tag-clickable {
  cursor: pointer;
}

.tag-clickable:hover {
  background: #007bff;
  color: white;
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

.tag-popular {
  background: linear-gradient(135deg, #ff6b6b, #feca57);
  color: white;
  border-color: transparent;
  font-weight: 600;
  position: relative;
}

.tag-popular::after {
  content: "🔥";
  position: absolute;
  top: -2px;
  right: -2px;
  font-size: 0.6rem;
}

.tag-popular:hover {
  background: linear-gradient(135deg, #ff5252, #ffca28);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 12px rgba(255, 107, 107, 0.4);
}

.tag-selected {
  background: #007bff;
  color: white;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.tag-icon {
  font-size: 0.75rem;
  opacity: 0.8;
}

.tag-count {
  background: rgba(255, 255, 255, 0.3);
  color: inherit;
  padding: 0.1rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  margin-left: 0.25rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.tag-remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: all 0.3s;
  margin-left: 0.25rem;
}

.tag-remove:hover {
  background: rgba(255, 255, 255, 0.3);
  opacity: 1;
  transform: scale(1.2);
  color: #ff4757;
}

.tag-more {
  background: #6c757d;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.tag-more:hover {
  background: #5a6268;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(108, 117, 125, 0.3);
}

.tag-add-btn {
  background: none;
  border: 2px dashed #dee2e6;
  color: #6c757d;
  padding: 0.3rem 0.8rem;
  border-radius: 16px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.tag-add-btn:hover {
  border-color: #007bff;
  color: #007bff;
  background: rgba(0, 123, 255, 0.1);
  transform: translateY(-1px);
}

.tag-input-container {
  margin-top: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 12px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.input-group .btn {
  border-color: #dee2e6;
}

.validation-message {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.suggested-tags {
  margin-top: 1rem;
}

.suggested-label {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.suggested-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.suggested-tag {
  background: white;
  color: #007bff;
  padding: 0.25rem 0.75rem;
  border-radius: 14px;
  font-size: 0.8rem;
  border: 1px solid #007bff;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.suggested-tag:hover {
  background: #007bff;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

.tag-stats {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-header {
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  font-size: 1.1rem;
}

.stats-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stat-label {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
}

.stat-value {
  font-weight: 700;
  color: #007bff;
  font-size: 1rem;
}

/* 애니메이션 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes popularPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.tag-popular {
  animation: popularPulse 3s infinite;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .tags-container {
    gap: 0.35rem;
  }

  .tag-item {
    font-size: 0.8rem;
    padding: 0.25rem 0.65rem;
  }

  .tag-input-container {
    padding: 1rem;
  }

  .input-group {
    flex-direction: column;
    gap: 0.5rem;
  }

  .input-group .form-control,
  .input-group .btn {
    width: 100%;
    border-radius: 6px !important;
  }

  .suggested-list {
    gap: 0.35rem;
  }

  .suggested-tag {
    font-size: 0.75rem;
    padding: 0.2rem 0.6rem;
  }

  .stats-content {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .stat-item {
    padding: 0.6rem;
  }
}

@media (max-width: 480px) {
  .tag-item {
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
  }

  .tag-add-btn {
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
  }

  .tag-input-container {
    padding: 0.75rem;
  }

  .stats-header {
    font-size: 1rem;
  }
}

/* 포커스 스타일 개선 */
.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.25rem rgba(0, 123, 255, 0.25);
}

/* 접근성 개선 */
.tag-item:focus,
.tag-more:focus,
.tag-add-btn:focus,
.suggested-tag:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}
</style>
