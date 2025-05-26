<!-- src/components/planboard/PlanBoardComment.vue -->
<template>
    <div class="plan-board-comment">
      <!-- 댓글 작성 폼 -->
      <div v-if="showCommentForm" class="comment-form mb-4">
        <div class="card">
          <div class="card-header bg-light">
            <h6 class="mb-0">
              <i class="fas fa-comment-alt me-2"></i>
              {{ isReply ? '답글 작성' : '댓글 작성' }}
            </h6>
          </div>
          <div class="card-body">
            <form @submit.prevent="submitComment">
              <div class="mb-3">
                <textarea
                  v-model="newComment.content"
                  class="form-control"
                  rows="4"
                  :placeholder="isReply ? '답글을 입력하세요...' : '댓글을 입력하세요...'"
                  required
                ></textarea>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">
                  <i class="fas fa-info-circle me-1"></i>
                  따뜻하고 건설적인 댓글을 작성해주세요.
                </small>
                <div>
                  <button 
                    v-if="isReply || isEdit" 
                    type="button" 
                    class="btn btn-outline-secondary me-2" 
                    @click="cancelComment"
                  >
                    취소
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                    <span v-if="isSubmitting">
                      <span class="spinner-border spinner-border-sm me-2"></span>
                      {{ isEdit ? '수정 중...' : '작성 중...' }}
                    </span>
                    <span v-else>
                      <i class="fas fa-paper-plane me-2"></i>
                      {{ isEdit ? '수정하기' : '댓글 작성' }}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
  
      <!-- 댓글 목록 -->
      <div class="comments-section">
        <!-- 로딩 상태 -->
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">댓글을 불러오는 중...</span>
          </div>
        </div>
  
        <!-- 댓글이 없는 경우 -->
        <div v-else-if="comments.length === 0" class="no-comments text-center py-5">
          <i class="fas fa-comment-slash text-muted mb-3" style="font-size: 3rem;"></i>
          <p class="text-muted mb-0">아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
        </div>
  
        <!-- 댓글 목록 -->
        <div v-else class="comments-list">
          <div
            v-for="comment in comments"
            :key="comment.commentId"
            class="comment-item"
            :class="{ 'reply-comment': comment.parentCommentId }"
          >
            <!-- 댓글 내용 -->
            <div class="comment-content">
              <div class="comment-header">
                <div class="comment-author">
                  <div class="author-avatar">
                    <img
                      :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.writer)}&background=random`"
                      :alt="comment.writer"
                      class="avatar-img"
                    />
                  </div>
                  <div class="author-info">
                    <span class="author-name">{{ comment.writer }}</span>
                    <span class="comment-date">{{ formatDate(comment.regDate) }}</span>
                    <span v-if="comment.updateDate && comment.updateDate !== comment.regDate" class="edited-mark">
                      (수정됨)
                    </span>
                  </div>
                </div>
                <div class="comment-actions">
                  <div class="dropdown">
                    <button
                      class="btn btn-sm btn-link text-muted dropdown-toggle"
                      type="button"
                      :id="`commentDropdown${comment.commentId}`"
                      data-bs-toggle="dropdown"
                    >
                      <i class="fas fa-ellipsis-h"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                      <li v-if="!comment.parentCommentId">
                        <a class="dropdown-item" href="#" @click.prevent="startReply(comment)">
                          <i class="fas fa-reply me-2"></i>답글 작성
                        </a>
                      </li>
                      <li v-if="canEditComment(comment)">
                        <a class="dropdown-item" href="#" @click.prevent="startEdit(comment)">
                          <i class="fas fa-edit me-2"></i>수정
                        </a>
                      </li>
                      <li v-if="canDeleteComment(comment)">
                        <hr class="dropdown-divider" />
                        <a class="dropdown-item text-danger" href="#" @click.prevent="deleteComment(comment)">
                          <i class="fas fa-trash me-2"></i>삭제
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
  
              <!-- 댓글 텍스트 (수정 모드가 아닌 경우) -->
              <div v-if="editingCommentId !== comment.commentId" class="comment-text">
                <p class="mb-0">{{ comment.content }}</p>
              </div>
  
              <!-- 댓글 수정 폼 -->
              <div v-else class="comment-edit-form mt-2">
                <form @submit.prevent="updateComment(comment)">
                  <div class="mb-2">
                    <textarea
                      v-model="editContent"
                      class="form-control"
                      rows="3"
                      required
                    ></textarea>
                  </div>
                  <div class="d-flex justify-content-end">
                    <button type="button" class="btn btn-sm btn-outline-secondary me-2" @click="cancelEdit">
                      취소
                    </button>
                    <button type="submit" class="btn btn-sm btn-primary" :disabled="isSubmitting">
                      <span v-if="isSubmitting">수정 중...</span>
                      <span v-else>수정하기</span>
                    </button>
                  </div>
                </form>
              </div>
  
              <!-- 답글 작성 폼 (해당 댓글에 대한 답글인 경우) -->
              <div v-if="replyingToCommentId === comment.commentId" class="reply-form mt-3">
                <form @submit.prevent="submitReply(comment)">
                  <div class="mb-2">
                    <textarea
                      v-model="replyContent"
                      class="form-control"
                      rows="3"
                      placeholder="답글을 입력하세요..."
                      required
                    ></textarea>
                  </div>
                  <div class="d-flex justify-content-end">
                    <button type="button" class="btn btn-sm btn-outline-secondary me-2" @click="cancelReply">
                      취소
                    </button>
                    <button type="submit" class="btn btn-sm btn-primary" :disabled="isSubmitting">
                      <span v-if="isSubmitting">답글 작성 중...</span>
                      <span v-else>답글 작성</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
  
            <!-- 대댓글 목록 -->
            <div v-if="comment.replies && comment.replies.length > 0" class="replies-section">
              <div
                v-for="reply in comment.replies"
                :key="reply.commentId"
                class="comment-item reply-comment"
              >
                <div class="comment-content">
                  <div class="comment-header">
                    <div class="comment-author">
                      <div class="author-avatar">
                        <img
                          :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(reply.writer)}&background=random`"
                          :alt="reply.writer"
                          class="avatar-img"
                        />
                      </div>
                      <div class="author-info">
                        <span class="author-name">{{ reply.writer }}</span>
                        <span class="comment-date">{{ formatDate(reply.regDate) }}</span>
                        <span v-if="reply.updateDate && reply.updateDate !== reply.regDate" class="edited-mark">
                          (수정됨)
                        </span>
                      </div>
                    </div>
                    <div class="comment-actions">
                      <div class="dropdown">
                        <button
                          class="btn btn-sm btn-link text-muted dropdown-toggle"
                          type="button"
                          :id="`replyDropdown${reply.commentId}`"
                          data-bs-toggle="dropdown"
                        >
                          <i class="fas fa-ellipsis-h"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                          <li v-if="canEditComment(reply)">
                            <a class="dropdown-item" href="#" @click.prevent="startEdit(reply)">
                              <i class="fas fa-edit me-2"></i>수정
                            </a>
                          </li>
                          <li v-if="canDeleteComment(reply)">
                            <hr class="dropdown-divider" />
                            <a class="dropdown-item text-danger" href="#" @click.prevent="deleteComment(reply)">
                              <i class="fas fa-trash me-2"></i>삭제
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
  
                  <!-- 답글 텍스트 -->
                  <div v-if="editingCommentId !== reply.commentId" class="comment-text">
                    <p class="mb-0">{{ reply.content }}</p>
                  </div>
  
                  <!-- 답글 수정 폼 -->
                  <div v-else class="comment-edit-form mt-2">
                    <form @submit.prevent="updateComment(reply)">
                      <div class="mb-2">
                        <textarea
                          v-model="editContent"
                          class="form-control"
                          rows="3"
                          required
                        ></textarea>
                      </div>
                      <div class="d-flex justify-content-end">
                        <button type="button" class="btn btn-sm btn-outline-secondary me-2" @click="cancelEdit">
                          취소
                        </button>
                        <button type="submit" class="btn btn-sm btn-primary" :disabled="isSubmitting">
                          <span v-if="isSubmitting">수정 중...</span>
                          <span v-else">수정하기</span>
                        </button>
                      </div>
                    </form>
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
  import { ref, computed, onMounted, watch } from "vue";
  import { useAuthStore } from "@/stores/auth";
  import planboardAPI from "@/api/planboard";
  
  const props = defineProps({
    pboardNo: {
      type: Number,
      required: true,
    },
    showCommentForm: {
      type: Boolean,
      default: true,
    },
    isReply: {
      type: Boolean,
      default: false,
    },
    parentCommentId: {
      type: Number,
      default: null,
    },
  });
  
  const emit = defineEmits(['comment-added', 'comment-updated', 'comment-deleted']);
  
  const authStore = useAuthStore();
  
  // 상태 관리
  const comments = ref([]);
  const loading = ref(false);
  const isSubmitting = ref(false);
  
  // 댓글 작성/수정 관련
  const newComment = ref({
    content: "",
  });
  const isEdit = ref(false);
  const editingCommentId = ref(null);
  const editContent = ref("");
  
  // 답글 관련
  const replyingToCommentId = ref(null);
  const replyContent = ref("");
  
  // 계산된 속성
  const isLoggedIn = computed(() => authStore.isAuthenticated);
  const currentUser = computed(() => authStore.user);
  
  // 메서드
  const loadComments = async () => {
    try {
      loading.value = true;
      const response = await planboardAPI.getComments(props.pboardNo);
      comments.value = response.data || [];
    } catch (error) {
      console.error("댓글 목록 조회 중 오류 발생:", error);
      comments.value = [];
    } finally {
      loading.value = false;
    }
  };
  
  const submitComment = async () => {
    if (!isLoggedIn.value) {
      alert("댓글을 작성하려면 로그인이 필요합니다.");
      return;
    }
  
    if (!newComment.value.content.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }
  
    try {
      isSubmitting.value = true;
  
      const commentData = {
        content: newComment.value.content.trim(),
        parentCommentId: props.parentCommentId,
      };
  
      if (isEdit.value && editingCommentId.value) {
        // 댓글 수정
        await planboardAPI.updateComment(editingCommentId.value, commentData);
        emit('comment-updated');
      } else {
        // 댓글 작성
        await planboardAPI.createComment(props.pboardNo, commentData);
        emit('comment-added');
      }
  
      // 폼 초기화
      newComment.value.content = "";
      isEdit.value = false;
      editingCommentId.value = null;
  
      // 댓글 목록 새로고침
      await loadComments();
  
    } catch (error) {
      console.error("댓글 작성/수정 중 오류 발생:", error);
      alert(isEdit.value ? "댓글 수정에 실패했습니다." : "댓글 작성에 실패했습니다.");
    } finally {
      isSubmitting.value = false;
    }
  };
  
  const startReply = (comment) => {
    replyingToCommentId.value = comment.commentId;
    replyContent.value = "";
  };
  
  const submitReply = async (parentComment) => {
    if (!isLoggedIn.value) {
      alert("답글을 작성하려면 로그인이 필요합니다.");
      return;
    }
  
    if (!replyContent.value.trim()) {
      alert("답글 내용을 입력해주세요.");
      return;
    }
  
    try {
      isSubmitting.value = true;
  
      const replyData = {
        content: replyContent.value.trim(),
        parentCommentId: parentComment.commentId,
      };
  
      await planboardAPI.createComment(props.pboardNo, replyData);
      
      // 폼 초기화
      replyContent.value = "";
      replyingToCommentId.value = null;
  
      // 댓글 목록 새로고침
      await loadComments();
      emit('comment-added');
  
    } catch (error) {
      console.error("답글 작성 중 오류 발생:", error);
      alert("답글 작성에 실패했습니다.");
    } finally {
      isSubmitting.value = false;
    }
  };
  
  const cancelReply = () => {
    replyingToCommentId.value = null;
    replyContent.value = "";
  };
  
  const startEdit = (comment) => {
    editingCommentId.value = comment.commentId;
    editContent.value = comment.content;
  };
  
  const updateComment = async (comment) => {
    if (!editContent.value.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }
  
    try {
      isSubmitting.value = true;
  
      const updateData = {
        content: editContent.value.trim(),
      };
  
      await planboardAPI.updateComment(comment.commentId, updateData);
      
      // 편집 상태 해제
      editingCommentId.value = null;
      editContent.value = "";
  
      // 댓글 목록 새로고침
      await loadComments();
      emit('comment-updated');
  
    } catch (error) {
      console.error("댓글 수정 중 오류 발생:", error);
      alert("댓글 수정에 실패했습니다.");
    } finally {
      isSubmitting.value = false;
    }
  };
  
  const cancelEdit = () => {
    editingCommentId.value = null;
    editContent.value = "";
  };
  
  const deleteComment = async (comment) => {
    if (!confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      return;
    }
  
    try {
      await planboardAPI.deleteComment(comment.commentId);
      
      // 댓글 목록 새로고침
      await loadComments();
      emit('comment-deleted');
      
      alert("댓글이 삭제되었습니다.");
  
    } catch (error) {
      console.error("댓글 삭제 중 오류 발생:", error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };
  
  const cancelComment = () => {
    newComment.value.content = "";
    isEdit.value = false;
    editingCommentId.value = null;
  };
  
  const canEditComment = (comment) => {
    if (!isLoggedIn.value) return false;
    return comment.userId === currentUser.value?.id || authStore.isAdmin;
  };
  
  const canDeleteComment = (comment) => {
    if (!isLoggedIn.value) return false;
    return comment.userId === currentUser.value?.id || authStore.isAdmin;
  };
  
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
  
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
    if (diffDays === 1) {
      return "오늘 " + date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 2) {
      return "어제 " + date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays <= 7) {
      return `${diffDays - 1}일 전`;
    } else {
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    }
  };
  
  // 라이프사이클
  onMounted(() => {
    loadComments();
  });
  
  // props 변경 감지
  watch(() => props.pboardNo, () => {
    if (props.pboardNo) {
      loadComments();
    }
  });
  </script>
  
  <style scoped>
  .comment-item {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #eee;
  }
  
  .comment-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
  
  .reply-comment {
    margin-left: 3rem;
    margin-top: 1rem;
    padding-left: 1rem;
    border-left: 3px solid #e9ecef;
    background-color: #f8f9fa;
    border-radius: 0 8px 8px 0;
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
  }
  
  .author-avatar {
    margin-right: 0.75rem;
  }
  
  .avatar-img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
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
    margin-top: 0.1rem;
  }
  
  .edited-mark {
    font-size: 0.75rem;
    color: #6c757d;
    font-style: italic;
    margin-left: 0.5rem;
  }
  
  .comment-text {
    line-height: 1.6;
    color: #333;
  }
  
  .comment-text p {
    white-space: pre-wrap;
    word-break: break-word;
  }
  
  .comment-actions .dropdown-toggle {
    border: none;
    background: none;
    padding: 0.25rem;
  }
  
  .comment-actions .dropdown-toggle:hover {
    background-color: #f8f9fa;
    border-radius: 4px;
  }
  
  .comment-form .card {
    border: 1px solid #dee2e6;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .comment-edit-form,
  .reply-form {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #e9ecef;
  }
  
  .replies-section {
    margin-top: 1rem;
  }
  
  .no-comments {
    background-color: #f8f9fa;
    border-radius: 12px;
    padding: 2rem;
    margin: 1rem 0;
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .reply-comment {
      margin-left: 1.5rem;
    }
  
    .avatar-img {
      width: 35px;
      height: 35px;
    }
  
    .comment-header {
      flex-direction: column;
      align-items: flex-start;
    }
  
    .comment-actions {
      margin-top: 0.5rem;
      align-self: flex-end;
    }
  }
  
  /* 애니메이션 */
  .comment-item {
    transition: all 0.3s ease;
  }
  
  .comment-item:hover {
    background-color: rgba(0, 123, 255, 0.02);
    border-radius: 8px;
    padding: 1rem;
    margin: 0 -1rem 1.5rem -1rem;
  }
  
  .reply-comment:hover {
    background-color: rgba(0, 123, 255, 0.05);
  }
  </style>