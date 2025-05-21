<!-- src/components/plan/TravelNotes.vue -->
<template>
  <div class="travel-notes-component">
    <div class="card">
      <div class="card-header bg-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0">여행 메모</h5>
        <button class="btn btn-sm btn-primary" @click="addNote"><i class="fas fa-plus"></i> 새 메모</button>
      </div>

      <div class="card-body">
        <div v-if="notes.length === 0" class="text-center py-4">
          <p class="text-muted mb-3">등록된 메모가 없습니다.</p>
          <button class="btn btn-outline-primary" @click="addNote"><i class="fas fa-plus"></i> 첫 메모 작성하기</button>
        </div>

        <div v-else>
          <div class="notes-grid">
            <div
              v-for="(note, index) in notes"
              :key="index"
              class="note-card"
              :class="'note-color-' + note.color"
              @click="editNote(index)"
            >
              <div class="note-header d-flex justify-content-between">
                <h6 class="mb-2">{{ note.title }}</h6>
                <div class="note-actions">
                  <button class="btn btn-sm text-muted btn-action" @click.stop="deleteNote(index)">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <div class="note-content" v-html="formatContent(note.content)"></div>
              <div class="note-footer">
                <small class="text-muted">{{ formatDate(note.date) }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 메모 추가/수정 모달 -->
    <div class="modal fade" id="noteModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editIndex === -1 ? "새 메모 작성" : "메모 수정" }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveNote">
              <div class="mb-3">
                <label for="noteTitle" class="form-label">제목</label>
                <input
                  type="text"
                  id="noteTitle"
                  v-model="currentNote.title"
                  class="form-control"
                  required
                  placeholder="메모 제목"
                />
              </div>

              <div class="mb-3">
                <label for="noteContent" class="form-label">내용</label>
                <textarea
                  id="noteContent"
                  v-model="currentNote.content"
                  class="form-control"
                  rows="6"
                  placeholder="메모 내용 작성..."
                  required
                ></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label">색상</label>
                <div class="note-colors">
                  <div
                    v-for="color in colorOptions"
                    :key="color"
                    class="note-color-option"
                    :class="{ active: currentNote.color === color, ['note-color-' + color]: true }"
                    @click="currentNote.color = color"
                  ></div>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                <button type="submit" class="btn btn-primary">저장</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";

const props = defineProps({
  planId: {
    type: Number,
    required: true,
  },
});

// 상태 관리
const notes = ref([]);
const currentNote = reactive({
  title: "",
  content: "",
  color: "yellow",
  date: null,
});
const editIndex = ref(-1);
const colorOptions = ["yellow", "green", "blue", "pink", "purple"];

// 메모 추가 모달 열기
const addNote = () => {
  editIndex.value = -1;

  // 현재 메모 초기화
  Object.assign(currentNote, {
    title: "",
    content: "",
    color: "yellow",
    date: new Date().toISOString(),
  });

  // 모달 열기
  const modal = new bootstrap.Modal(document.getElementById("noteModal"));
  modal.show();
};

// 메모 수정 모달 열기
const editNote = (index) => {
  editIndex.value = index;

  // 현재 메모에 수정할 메모 복사
  Object.assign(currentNote, JSON.parse(JSON.stringify(notes.value[index])));

  // 모달 열기
  const modal = new bootstrap.Modal(document.getElementById("noteModal"));
  modal.show();
};

// 메모 저장
const saveNote = () => {
  const noteToSave = { ...currentNote, date: new Date().toISOString() };

  if (editIndex.value === -1) {
    // 새 메모 추가
    notes.value.push(noteToSave);
  } else {
    // 기존 메모 수정
    notes.value[editIndex.value] = noteToSave;
  }

  // 로컬 스토리지에 저장
  saveNotesToLocalStorage();

  // 모달 닫기
  const modal = bootstrap.Modal.getInstance(document.getElementById("noteModal"));
  modal.hide();
};

// 메모 삭제
const deleteNote = (index) => {
  if (confirm("이 메모를 삭제하시겠습니까?")) {
    notes.value.splice(index, 1);

    // 로컬 스토리지에 저장
    saveNotesToLocalStorage();
  }
};

// 로컬 스토리지에 메모 저장
const saveNotesToLocalStorage = () => {
  localStorage.setItem(`notes_${props.planId}`, JSON.stringify(notes.value));
};

// 로컬 스토리지에서 메모 로드
const loadNotesFromLocalStorage = () => {
  const savedNotes = localStorage.getItem(`notes_${props.planId}`);
  if (savedNotes) {
    notes.value = JSON.parse(savedNotes);
  }
};

// 날짜 포맷
const formatDate = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);

  // 오늘 날짜인지 확인
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
    // 다른 날짜면 날짜만 표시
    return date.toLocaleDateString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
    });
  }
};

// 메모 내용 포맷 (URL을 링크로 변환)
const formatContent = (content) => {
  if (!content) return "";

  // URL을 감지하여 링크로 변환
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return content
    .replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" class="note-link">${url}</a>`;
    })
    .replace(/\n/g, "<br>");
};

// 컴포넌트 마운트 시 초기화
onMounted(() => {
  // 로컬 스토리지에서 메모 로드
  loadNotesFromLocalStorage();
});
</script>

<style scoped>
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.note-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 15px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-top: 3px solid #ffd700;
}

.note-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.note-color-yellow {
  border-top-color: #ffd700;
  background-color: #fffde7;
}

.note-color-green {
  border-top-color: #4caf50;
  background-color: #e8f5e9;
}

.note-color-blue {
  border-top-color: #2196f3;
  background-color: #e3f2fd;
}

.note-color-pink {
  border-top-color: #e91e63;
  background-color: #fce4ec;
}

.note-color-purple {
  border-top-color: #9c27b0;
  background-color: #f3e5f5;
}

.note-content {
  margin-bottom: 15px;
  font-size: 0.9rem;
  white-space: pre-line;
  max-height: 150px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
}

.note-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 8px;
}

.btn-action {
  width: 24px;
  height: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.btn-action:hover {
  opacity: 1;
}

.note-colors {
  display: flex;
  gap: 10px;
}

.note-color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
  border: 2px solid transparent;
}

.note-color-option:hover {
  transform: scale(1.1);
}

.note-color-option.active {
  border-color: #333;
  transform: scale(1.1);
}

.note-color-yellow.note-color-option {
  background-color: #ffd700;
}

.note-color-green.note-color-option {
  background-color: #4caf50;
}

.note-color-blue.note-color-option {
  background-color: #2196f3;
}

.note-color-pink.note-color-option {
  background-color: #e91e63;
}

.note-color-purple.note-color-option {
  background-color: #9c27b0;
}

.note-link {
  color: #2196f3;
  text-decoration: none;
}

.note-link:hover {
  text-decoration: underline;
}
</style>
