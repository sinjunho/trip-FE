<!-- src/components/board/CommentSection.vue -->
<template>
  <div class="comment-section">
    <div class="comment-header">
      <h4>댓글 {{ comments.length }}개</h4>
    </div>

    <!-- 댓글 작성 폼 -->
    <div v-if="isLoggedIn" class="comment-form mb-4">
      <div class="card">
        <div class="card-body">
          <div class="mb-3">
            <textarea
              v-model="newComment"
              class="form-control"
              rows="3"
              placeholder="댓글을 입력하세요..."
              :disabled="isSubmitting"
            ></textarea>
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">{{ userName }}님으로 댓글 작성</small>
            <button @click="submitComment" :disabled="!newComment.trim() || isSubmitting" class="btn btn-primary">
              <span v-if="isSubmitting">작성 중...</span>
              <span v-else>댓글 작성</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 로그인 안내 -->
    <div v-else class="comment-login-notice mb-4">
      <div class="alert alert-info text-center">
        <i class="fas fa-info-circle me-2"></i>
        댓글을 작성하려면 <router-link to="/login" class="alert-link">로그인</router-link>이 필요합니다.
      </div>
    </div>

    <!-- 댓글 목록 -->
    <div class="comment-list">
      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">로딩중...</span>
        </div>
      </div>

      <div v-else-if="comments.length === 0" class="no-comments text-center py-4">
        <i class="fas fa-comments fa-3x text-muted mb-3"></i>
        <p class="text-muted">첫 번째 댓글을 작성해보세요!</p>
      </div>

      <div v-else>
        <div
          v-for="comment in comments"
          :key="comment.commentId"
          class="comment-item"
          :class="{ 'reply-comment': comment.depth > 0 }"
        >
          <div v-if="editingComment === comment.commentId" class="edit-form">
            <div class="card border-warning">
              <div class="card-body">
                <div class="mb-3">
                  <textarea v-model="editContent" class="form-control" rows="3" :disabled="isUpdating"></textarea>
                </div>
                <div class="d-flex gap-2">
                  <button
                    @click="updateComment(comment.commentId)"
                    :disabled="isUpdating"
                    class="btn btn-warning btn-sm"
                  >
                    <span v-if="isUpdating">수정 중...</span>
                    <span v-else>수정 완료</span>
                  </button>
                  <button @click="cancelEdit" class="btn btn-secondary btn-sm">취소</button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="comment-card">
            <div class="comment-header d-flex justify-content-between align-items-start">
              <div class="comment-author">
                <div class="author-avatar">
                  <img
                    :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.writer)}&background=random`"
                    :alt="comment.writer"
                    class="rounded-circle"
                  />
                </div>
                <div class="author-info">
                  <span class="author-name">{{ comment.writer }}</span>
                  <span class="comment-date">{{ formatDate(comment.regDate) }}</span>
                </div>
              </div>

              <div v-if="canManageComment(comment)" class="comment-actions">
                <button @click="startEdit(comment)" class="btn btn-sm btn-outline-secondary me-1">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="deleteComment(comment.commentId)" class="btn btn-sm btn-outline-danger">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>

            <div class="comment-content">
              {{ comment.content }}
            </div>

            <!-- 대댓글 작성 버튼 (깊이 0인 댓글에만) -->
            <div v-if="comment.depth === 0 && isLoggedIn" class="comment-reply">
              <button
                v-if="replyingTo !== comment.commentId"
                @click="startReply(comment.commentId)"
                class="btn btn-sm btn-outline-primary"
              >
                <i class="fas fa-reply me-1"></i>답글
              </button>

              <!-- 대댓글 작성 폼 -->
              <div v-else class="reply-form mt-3">
                <div class="card border-primary">
                  <div class="card-body">
                    <div class="mb-3">
                      <textarea
                        v-model="replyContent"
                        class="form-control"
                        rows="2"
                        :placeholder="`${comment.writer}님에게 답글 작성...`"
                        :disabled="isSubmittingReply"
                      ></textarea>
                    </div>
                    <div class="d-flex gap-2">
                      <button
                        @click="submitReply(comment.commentId)"
                        :disabled="!replyContent.trim() || isSubmittingReply"
                        class="btn btn-primary btn-sm"
                      >
                        <span v-if="isSubmittingReply">작성 중...</span>
                        <span v-else>답글 작성</span>
                      </button>
                      <button @click="cancelReply" class="btn btn-secondary btn-sm">취소</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import commentAPI from "@/api/comment";

const props = defineProps({
  boardNo: {
    type: Number,
    required: true,
  },
});

const authStore = useAuthStore();

// 상태 관리
const comments = ref([]);
const loading = ref(false);
const newComment = ref("");
const replyContent = ref("");
const editContent = ref("");
const editingComment = ref(null);
const replyingTo = ref(null);
const isSubmitting = ref(false);
const isSubmittingReply = ref(false);
const isUpdating = ref(false);

// 계산된 속성
const isLoggedIn = computed(() => authStore.isAuthenticated);
const userName = computed(() => authStore.user?.name || "");

// 메서드
const loadComments = async () => {
  try {
    loading.value = true;
    const response = await commentAPI.getCommentsByBoard(props.boardNo);
    comments.value = response.data || [];
  } catch (error) {
    console.error("댓글 로드 오류:", error);
    alert("댓글을 불러오는 중 오류가 발생했습니다.");
  } finally {
    loading.value = false;
  }
};

const submitComment = async () => {
  if (!newComment.value.trim()) return;

  try {
    isSubmitting.value = true;
    await commentAPI.createComment({
      bno: props.boardNo,
      content: newComment.value.trim(),
    });

    newComment.value = "";
    await loadComments();
    alert("댓글이 작성되었습니다.");
  } catch (error) {
    console.error("댓글 작성 오류:", error);
    alert("댓글 작성 중 오류가 발생했습니다.");
  } finally {
    isSubmitting.value = false;
  }
};

const startReply = (commentId) => {
  replyingTo.value = commentId;
  replyContent.value = "";
};

const cancelReply = () => {
  replyingTo.value = null;
  replyContent.value = "";
};

const submitReply = async (parentId) => {
  if (!replyContent.value.trim()) return;

  try {
    isSubmittingReply.value = true;
    await commentAPI.createComment({
      bno: props.boardNo,
      content: replyContent.value.trim(),
      parentId: parentId,
    });

    cancelReply();
    await loadComments();
    alert("답글이 작성되었습니다.");
  } catch (error) {
    console.error("답글 작성 오류:", error);
    alert("답글 작성 중 오류가 발생했습니다.");
  } finally {
    isSubmittingReply.value = false;
  }
};

const startEdit = (comment) => {
  editingComment.value = comment.commentId;
  editContent.value = comment.content;
};

const cancelEdit = () => {
  editingComment.value = null;
  editContent.value = "";
};

const updateComment = async (commentId) => {
  if (!editContent.value.trim()) return;

  try {
    isUpdating.value = true;
    await commentAPI.updateComment(commentId, {
      content: editContent.value.trim(),
    });

    cancelEdit();
    await loadComments();
    alert("댓글이 수정되었습니다.");
  } catch (error) {
    console.error("댓글 수정 오류:", error);
    alert("댓글 수정 중 오류가 발생했습니다.");
  } finally {
    isUpdating.value = false;
  }
};

const deleteComment = async (commentId) => {
  if (!confirm("이 댓글을 삭제하시겠습니까?")) return;

  try {
    await commentAPI.deleteComment(commentId);
    await loadComments();
    alert("댓글이 삭제되었습니다.");
  } catch (error) {
    console.error("댓글 삭제 오류:", error);
    alert("댓글 삭제 중 오류가 발생했습니다.");
  }
};

const canManageComment = (comment) => {
  return authStore.isAuthenticated && (comment.writer === userName.value || authStore.isAdmin);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffMinutes = Math.ceil(diffTime / (1000 * 60));
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

// 컴포넌트 마운트 시 댓글 로드
onMounted(() => {
  loadComments();
});

// expose 메서드 (부모 컴포넌트에서 사용 가능)
defineExpose({
  loadComments,
});
</script>

<style scoped>
.comment-section {
  margin-top: 2rem;
}

.comment-header {
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.comment-header h4 {
  color: #333;
  font-weight: 600;
}

.comment-form .card {
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.comment-login-notice {
  text-align: center;
}

.comment-item {
  margin-bottom: 1.5rem;
}

.reply-comment {
  margin-left: 3rem;
  border-left: 3px solid #0d6efd;
  padding-left: 1rem;
}

.comment-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  transition: box-shadow 0.2s;
}

.comment-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar img {
  width: 36px;
  height: 36px;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.comment-date {
  font-size: 0.8rem;
  color: #6c757d;
}

.comment-actions {
  display: flex;
  gap: 0.25rem;
}

.comment-content {
  color: #333;
  line-height: 1.6;
  margin-bottom: 0.5rem;
  white-space: pre-line;
}

.comment-reply {
  margin-top: 0.75rem;
}

.reply-form {
  animation: slideDown 0.3s ease-out;
}

.edit-form {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.no-comments {
  padding: 3rem 1rem;
}

.no-comments i {
  opacity: 0.5;
}

/* 반응형 */
@media (max-width: 768px) {
  .reply-comment {
    margin-left: 1.5rem;
  }

  .comment-actions {
    flex-direction: column;
    gap: 0.25rem;
  }

  .comment-actions .btn {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }
}
</style>
