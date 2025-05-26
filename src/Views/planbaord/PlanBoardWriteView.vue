<!-- src/views/PlanBoard/PlanBoardWriteView.vue -->
<template>
  <div class="planboard-write-view">
    <div class="container py-4">
      <!-- 헤더 -->
      <div class="page-header">
        <h1 class="page-title">
          <i class="fas fa-pen-fancy me-3"></i>
          {{ isEdit ? "여행 계획 수정" : "여행 계획 공유하기" }}
        </h1>
        <p class="page-subtitle">
          {{ isEdit ? "여행 계획을 수정해보세요" : "나만의 특별한 여행 계획을 다른 여행자들과 공유해보세요!" }}
        </p>
      </div>

      <!-- 진행 단계 표시 -->
      <div class="progress-steps">
        <div class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
          <div class="step-number">1</div>
          <div class="step-label">기본 정보</div>
        </div>
        <div class="step-line" :class="{ completed: currentStep > 1 }"></div>
        <div class="step" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
          <div class="step-number">2</div>
          <div class="step-label">여행 정보</div>
        </div>
        <div class="step-line" :class="{ completed: currentStep > 2 }"></div>
        <div class="step" :class="{ active: currentStep === 3 }">
          <div class="step-number">3</div>
          <div class="step-label">내용 작성</div>
        </div>
      </div>

      <!-- 폼 컨테이너 -->
      <div class="form-container">
        <form @submit.prevent="submitForm">
          <!-- Step 1: 기본 정보 -->
          <div v-if="currentStep === 1" class="form-step">
            <div class="step-content">
              <h3 class="step-title">
                <i class="fas fa-info-circle me-2"></i>
                기본 정보를 입력해주세요
              </h3>

              <div class="row">
                <div class="col-lg-8">
                  <div class="form-group mb-4">
                    <label for="title" class="form-label required">
                      <i class="fas fa-heading me-2"></i>
                      게시글 제목
                    </label>
                    <input
                      type="text"
                      id="title"
                      v-model="formData.title"
                      class="form-control form-control-lg"
                      placeholder="예: 부산 2박 3일 힐링 여행 후기"
                      required
                      maxlength="100"
                    />
                    <div class="form-text">{{ formData.title.length }}/100자</div>
                  </div>

                  <div class="form-group mb-4">
                    <label for="travelTitle" class="form-label required">
                      <i class="fas fa-route me-2"></i>
                      여행 계획 제목
                    </label>
                    <input
                      type="text"
                      id="travelTitle"
                      v-model="formData.travelTitle"
                      class="form-control"
                      placeholder="예: 부산 바다와 함께하는 힐링 여행"
                      required
                      maxlength="50"
                    />
                    <div class="form-text">
                      실제 여행 계획의 제목을 입력해주세요 ({{ formData.travelTitle.length }}/50자)
                    </div>
                  </div>

                  <div class="form-group mb-4">
                    <label for="travelTheme" class="form-label required">
                      <i class="fas fa-palette me-2"></i>
                      여행 테마
                    </label>
                    <select id="travelTheme" v-model="formData.travelTheme" class="form-select" required>
                      <option value="">테마를 선택해주세요</option>
                      <option value="힐링">🧘 힐링</option>
                      <option value="모험">🏔️ 모험</option>
                      <option value="문화">🏛️ 문화</option>
                      <option value="자연">🌿 자연</option>
                      <option value="도시">🏙️ 도시</option>
                      <option value="맛집">🍽️ 맛집</option>
                      <option value="가족">👨‍👩‍👧‍👦 가족</option>
                      <option value="커플">💑 커플</option>
                      <option value="친구">👥 친구</option>
                      <option value="혼자">🧳 혼자</option>
                    </select>
                  </div>

                  <div class="form-group mb-4">
                    <label class="form-label">
                      <i class="fas fa-image me-2"></i>
                      썸네일 이미지
                    </label>
                    <div class="thumbnail-upload">
                      <div v-if="thumbnailPreview" class="thumbnail-preview">
                        <img :src="thumbnailPreview" alt="썸네일 미리보기" />
                        <button type="button" class="remove-thumbnail" @click="removeThumbnail">
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                      <div v-else class="thumbnail-placeholder" @click="triggerThumbnailUpload">
                        <i class="fas fa-camera"></i>
                        <p>클릭하여 썸네일 이미지 업로드</p>
                        <small>권장 크기: 800x600px</small>
                      </div>
                      <input
                        ref="thumbnailInput"
                        type="file"
                        accept="image/*"
                        style="display: none"
                        @change="handleThumbnailUpload"
                      />
                    </div>
                  </div>
                </div>

                <div class="col-lg-4">
                  <div class="writing-tips">
                    <h5><i class="fas fa-lightbulb text-warning me-2"></i>작성 팁</h5>
                    <ul class="tips-list">
                      <li>매력적인 제목으로 여행자들의 관심을 끌어보세요</li>
                      <li>여행 테마를 정확히 선택하면 더 많은 사람들이 찾을 수 있어요</li>
                      <li>썸네일 이미지는 여행의 분위기를 잘 보여주는 사진으로 선택해주세요</li>
                      <li>실제 경험을 바탕으로 한 진솔한 내용이 가장 좋아요</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div class="step-actions">
              <router-link to="/planboard" class="btn btn-outline-secondary">
                <i class="fas fa-times me-2"></i>취소
              </router-link>
              <button type="button" class="btn btn-primary" @click="nextStep" :disabled="!isStep1Valid">
                다음 단계 <i class="fas fa-arrow-right ms-2"></i>
              </button>
            </div>
          </div>

          <!-- Step 2: 여행 정보 -->
          <div v-if="currentStep === 2" class="form-step">
            <div class="step-content">
              <h3 class="step-title">
                <i class="fas fa-map-marked-alt me-2"></i>
                여행 정보를 입력해주세요
              </h3>

              <div class="row">
                <div class="col-md-6">
                  <div class="form-group mb-4">
                    <label for="startDate" class="form-label required">
                      <i class="fas fa-calendar-alt me-2"></i>
                      시작일
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      v-model="formData.startDate"
                      class="form-control"
                      required
                      @change="calculateDuration"
                    />
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="form-group mb-4">
                    <label for="endDate" class="form-label required">
                      <i class="fas fa-calendar-check me-2"></i>
                      종료일
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      v-model="formData.endDate"
                      class="form-control"
                      required
                      :min="formData.startDate"
                      @change="calculateDuration"
                    />
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-8">
                  <div class="form-group mb-4">
                    <label for="destinations" class="form-label required">
                      <i class="fas fa-map-marker-alt me-2"></i>
                      여행 목적지
                    </label>
                    <input
                      type="text"
                      id="destinations"
                      v-model="formData.travelDestinations"
                      class="form-control"
                      placeholder="예: 부산, 해운대, 광안리"
                      required
                      maxlength="100"
                    />
                    <div class="form-text">주요 방문지를 쉼표(,)로 구분하여 입력해주세요</div>
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="form-group mb-4">
                    <label for="participantCount" class="form-label required">
                      <i class="fas fa-users me-2"></i>
                      인원수
                    </label>
                    <select id="participantCount" v-model="formData.participantCount" class="form-select" required>
                      <option value="">인원 선택</option>
                      <option value="1">1명 (혼자)</option>
                      <option value="2">2명 (커플/친구)</option>
                      <option value="3">3명</option>
                      <option value="4">4명</option>
                      <option value="5">5명</option>
                      <option value="6">6명 이상</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="form-group mb-4">
                    <label for="estimatedBudget" class="form-label">
                      <i class="fas fa-won-sign me-2"></i>
                      예상 예산 (1인 기준)
                    </label>
                    <div class="input-group">
                      <input
                        type="number"
                        id="estimatedBudget"
                        v-model="formData.estimatedBudget"
                        class="form-control"
                        placeholder="예: 300000"
                        min="0"
                        step="10000"
                      />
                      <span class="input-group-text">원</span>
                    </div>
                    <div class="form-text">숙박, 교통, 식비, 관광 등 총 예산을 입력해주세요</div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="travel-duration-display">
                    <label class="form-label">
                      <i class="fas fa-clock me-2"></i>
                      여행 기간
                    </label>
                    <div class="duration-card">
                      <div class="duration-number">{{ travelDuration }}</div>
                      <div class="duration-text">일</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 여행 계획 연결 (선택사항) -->
              <div class="form-group mb-4">
                <label class="form-label">
                  <i class="fas fa-link me-2"></i>
                  내 여행 계획 연결 (선택사항)
                </label>
                <div class="plan-selection">
                  <div v-if="userPlans.length === 0" class="no-plans">
                    <p class="text-muted">작성된 여행 계획이 없습니다.</p>
                    <router-link to="/plans/create" class="btn btn-outline-primary btn-sm">
                      <i class="fas fa-plus me-1"></i>여행 계획 만들기
                    </router-link>
                  </div>
                  <div v-else class="plans-grid">
                    <div
                      v-for="plan in userPlans"
                      :key="plan.planId"
                      class="plan-card"
                      :class="{ selected: formData.planId === plan.planId }"
                      @click="selectPlan(plan)"
                    >
                      <div class="plan-info">
                        <h6 class="plan-title">{{ plan.title }}</h6>
                        <p class="plan-dates">{{ formatPlanDate(plan.startDate, plan.endDate) }}</p>
                      </div>
                      <div class="plan-check">
                        <i v-if="formData.planId === plan.planId" class="fas fa-check-circle text-primary"></i>
                        <i v-else class="far fa-circle text-muted"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="step-actions">
              <button type="button" class="btn btn-outline-secondary" @click="prevStep">
                <i class="fas fa-arrow-left me-2"></i>이전 단계
              </button>
              <button type="button" class="btn btn-primary" @click="nextStep" :disabled="!isStep2Valid">
                다음 단계 <i class="fas fa-arrow-right ms-2"></i>
              </button>
            </div>
          </div>

          <!-- Step 3: 내용 작성 -->
          <div v-if="currentStep === 3" class="form-step">
            <div class="step-content">
              <h3 class="step-title">
                <i class="fas fa-edit me-2"></i>
                여행 후기를 작성해주세요
              </h3>

              <div class="row">
                <div class="col-lg-8">
                  <div class="form-group mb-4">
                    <label for="content" class="form-label required">
                      <i class="fas fa-file-alt me-2"></i>
                      내용
                    </label>
                    <div class="content-editor">
                      <div class="editor-toolbar">
                        <button type="button" class="toolbar-btn" @click="insertTemplate('day')" title="일차별 템플릿">
                          <i class="fas fa-calendar-day"></i>
                        </button>
                        <button type="button" class="toolbar-btn" @click="insertTemplate('place')" title="장소 템플릿">
                          <i class="fas fa-map-marker-alt"></i>
                        </button>
                        <button type="button" class="toolbar-btn" @click="insertTemplate('food')" title="맛집 템플릿">
                          <i class="fas fa-utensils"></i>
                        </button>
                        <button type="button" class="toolbar-btn" @click="insertTemplate('tip')" title="팁 템플릿">
                          <i class="fas fa-lightbulb"></i>
                        </button>
                      </div>
                      <textarea
                        id="content"
                        ref="contentTextarea"
                        v-model="formData.content"
                        class="form-control content-textarea"
                        rows="15"
                        placeholder="여행 경험을 자세히 공유해주세요...
  
  예시:
  🌟 1일차 - 부산역 도착 후 해운대 해수욕장
  ✈️ 교통: KTX를 이용해서 3시간 정도 걸렸어요
  🏨 숙소: 해운대 근처 호텔 (1박에 15만원)
  🍽️ 맛집: 해운대 시장의 회센터 추천!
  
  💡 여행 팁:
  - 주말보다 평일에 가면 숙박비가 저렴해요
  - 해운대 근처에 주차하기 어려우니 대중교통 이용 추천"
                        required
                        minlength="100"
                      ></textarea>
                      <div class="content-info">
                        <span class="char-count">{{ formData.content.length }}자</span>
                        <span class="char-guide">(최소 100자 이상)</span>
                      </div>
                    </div>
                  </div>

                  <div class="form-group mb-4">
                    <label class="form-label">
                      <i class="fas fa-tags me-2"></i>
                      태그
                    </label>
                    <div class="tag-input-container">
                      <div class="selected-tags">
                        <span v-for="(tag, index) in formData.tags" :key="index" class="tag-item">
                          #{{ tag }}
                          <button type="button" @click="removeTag(index)" class="tag-remove">
                            <i class="fas fa-times"></i>
                          </button>
                        </span>
                      </div>
                      <input
                        type="text"
                        v-model="tagInput"
                        class="tag-input"
                        placeholder="태그를 입력하고 Enter를 누르세요"
                        @keyup.enter="addTag"
                        @keyup.comma="addTag"
                        maxlength="20"
                      />
                    </div>
                    <div class="form-text">
                      쉼표(,) 또는 Enter로 태그를 구분하세요. 최대 10개까지 추가할 수 있습니다.
                    </div>

                    <!-- 추천 태그 -->
                    <div class="recommended-tags">
                      <small class="text-muted">추천 태그:</small>
                      <button
                        v-for="recTag in getRecommendedTags()"
                        :key="recTag"
                        type="button"
                        class="recommended-tag"
                        @click="addRecommendedTag(recTag)"
                      >
                        #{{ recTag }}
                      </button>
                    </div>
                  </div>

                  <div class="form-group mb-4">
                    <div class="form-check">
                      <input id="isPublic" v-model="formData.isPublic" type="checkbox" class="form-check-input" />
                      <label for="isPublic" class="form-check-label">
                        <i class="fas fa-globe me-2"></i>
                        공개 게시글로 설정 (다른 사용자들이 볼 수 있습니다)
                      </label>
                    </div>
                  </div>
                </div>

                <div class="col-lg-4">
                  <div class="preview-card">
                    <h5><i class="fas fa-eye me-2"></i>미리보기</h5>
                    <div class="preview-content">
                      <div v-if="thumbnailPreview" class="preview-thumbnail">
                        <img :src="thumbnailPreview" alt="썸네일" />
                      </div>
                      <div class="preview-title">{{ formData.title || "제목을 입력해주세요" }}</div>
                      <div class="preview-travel-title">
                        {{ formData.travelTitle || "여행 계획 제목을 입력해주세요" }}
                      </div>
                      <div class="preview-meta">
                        <span v-if="formData.travelTheme">{{ formData.travelTheme }}</span>
                        <span v-if="travelDuration > 0">{{ travelDuration }}일</span>
                        <span v-if="formData.participantCount">{{ formData.participantCount }}명</span>
                      </div>
                      <div class="preview-destinations">
                        {{ formData.travelDestinations || "목적지를 입력해주세요" }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="step-actions">
              <button type="button" class="btn btn-outline-secondary" @click="prevStep">
                <i class="fas fa-arrow-left me-2"></i>이전 단계
              </button>
              <button type="submit" class="btn btn-success" :disabled="!isStep3Valid || isSubmitting">
                <span v-if="isSubmitting">
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  {{ isEdit ? "수정 중..." : "등록 중..." }}
                </span>
                <span v-else>
                  <i class="fas fa-check me-2"></i>
                  {{ isEdit ? "수정 완료" : "게시글 등록" }}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import planboardAPI from "@/api/planboard";
import planAPI from "@/api/plan";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// 인증 확인
if (!authStore.isAuthenticated) {
  router.push("/login?redirect=" + encodeURIComponent(route.fullPath));
}

// 상태 관리
const currentStep = ref(1);
const isSubmitting = ref(false);
const thumbnailPreview = ref("");
const thumbnailInput = ref(null);
const contentTextarea = ref(null);
const tagInput = ref("");
const userPlans = ref([]);

const isEdit = computed(() => !!route.params.pboardNo);
const pboardNo = computed(() => parseInt(route.params.pboardNo));

// 폼 데이터
const formData = ref({
  // 기본 정보
  title: "",
  travelTitle: "",
  travelTheme: "",
  thumbnailImage: "",

  // 여행 정보
  startDate: "",
  endDate: "",
  travelDestinations: "",
  participantCount: "",
  estimatedBudget: null,
  planId: null,

  // 내용
  content: "",
  tags: [],
  isPublic: true,
});

// 계산된 속성
const travelDuration = computed(() => {
  if (!formData.value.startDate || !formData.value.endDate) return 0;

  const start = new Date(formData.value.startDate);
  const end = new Date(formData.value.endDate);
  const diffTime = Math.abs(end - start);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
});

const isStep1Valid = computed(() => {
  return formData.value.title.trim() && formData.value.travelTitle.trim() && formData.value.travelTheme;
});

const isStep2Valid = computed(() => {
  return (
    formData.value.startDate &&
    formData.value.endDate &&
    formData.value.travelDestinations.trim() &&
    formData.value.participantCount
  );
});

const isStep3Valid = computed(() => {
  return formData.value.content.trim().length >= 100;
});

// 메서드
const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const calculateDuration = () => {
  // 종료일이 시작일보다 이전인 경우 조정
  if (formData.value.startDate && formData.value.endDate) {
    const start = new Date(formData.value.startDate);
    const end = new Date(formData.value.endDate);

    if (end < start) {
      formData.value.endDate = formData.value.startDate;
    }
  }
};

const triggerThumbnailUpload = () => {
  thumbnailInput.value?.click();
};

const handleThumbnailUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      // 5MB 제한
      alert("파일 크기는 5MB 이하로 선택해주세요.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      thumbnailPreview.value = e.target.result;
      formData.value.thumbnailImage = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const removeThumbnail = () => {
  thumbnailPreview.value = "";
  formData.value.thumbnailImage = "";
  if (thumbnailInput.value) {
    thumbnailInput.value.value = "";
  }
};

const loadUserPlans = async () => {
  try {
    const response = await planAPI.getUserPlans();
    userPlans.value = response.data || [];
  } catch (error) {
    console.error("사용자 여행 계획 로드 오류:", error);
  }
};

const selectPlan = (plan) => {
  if (formData.value.planId === plan.planId) {
    formData.value.planId = null;
  } else {
    formData.value.planId = plan.planId;
  }
};

const formatPlanDate = (startDate, endDate) => {
  if (!startDate || !endDate) return "";

  const start = new Date(startDate).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
  const end = new Date(endDate).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });

  return `${start} ~ ${end}`;
};

const insertTemplate = (type) => {
  const templates = {
    day: "\n\n🌟 X일차 - 제목\n✈️ 교통: \n🏨 숙소: \n🍽️ 맛집: \n📷 포토스팟: \n\n",
    place: "\n\n📍 장소명: \n⏰ 소요시간: \n💰 비용: \n📝 후기: \n\n",
    food: "\n\n🍽️ 맛집명: \n📍 위치: \n💰 가격: \n⭐ 평점: \n📝 추천메뉴: \n\n",
    tip: "\n\n💡 여행 팁\n- \n- \n- \n\n",
  };

  const template = templates[type];
  const textarea = contentTextarea.value;
  const cursorPosition = textarea.selectionStart;

  formData.value.content =
    formData.value.content.substring(0, cursorPosition) + template + formData.value.content.substring(cursorPosition);

  // 커서 위치 조정
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(cursorPosition + template.length, cursorPosition + template.length);
  }, 0);
};

const addTag = () => {
  const tag = tagInput.value.trim().replace(/[,#]/g, "");

  if (tag && !formData.value.tags.includes(tag) && formData.value.tags.length < 10) {
    formData.value.tags.push(tag);
    tagInput.value = "";
  }
};

const removeTag = (index) => {
  formData.value.tags.splice(index, 1);
};

const addRecommendedTag = (tag) => {
  if (!formData.value.tags.includes(tag) && formData.value.tags.length < 10) {
    formData.value.tags.push(tag);
  }
};

const getRecommendedTags = () => {
  const themeBasedTags = {
    힐링: ["힐링", "휴양", "온천", "스파", "조용한"],
    모험: ["모험", "액티비티", "트레킹", "스릴", "도전"],
    문화: ["문화", "역사", "박물관", "전통", "유적지"],
    자연: ["자연", "등산", "숲", "바다", "풍경"],
    도시: ["도시", "쇼핑", "카페", "야경", "건축"],
    맛집: ["맛집", "현지음식", "맛투어", "별미", "요리"],
    가족: ["가족여행", "아이와함께", "체험", "안전", "편리"],
    커플: ["커플여행", "로맨틱", "데이트", "추억", "사진"],
    친구: ["친구여행", "우정", "재미", "파티", "추억"],
    혼자: ["혼행", "자유", "사색", "힐링", "나만의시간"],
  };

  const baseTags = ["국내여행", "추천", "후기", "정보", "팁"];
  const themeTags = themeBasedTags[formData.value.travelTheme] || [];

  return [...baseTags, ...themeTags].filter((tag) => !formData.value.tags.includes(tag));
};

const loadPostForEdit = async () => {
  if (!isEdit.value) return;

  try {
    const response = await planboardAPI.getPlanBoardDetail(pboardNo.value);
    const post = response.data;

    // 권한 확인
    if (post.userId !== authStore.user?.id && !authStore.isAdmin) {
      alert("수정 권한이 없습니다.");
      router.push("/planboard");
      return;
    }

    // 폼 데이터 설정
    formData.value = {
      title: post.title || "",
      travelTitle: post.travelTitle || "",
      travelTheme: post.travelTheme || "",
      thumbnailImage: post.thumbnailImage || "",
      startDate: post.startDate || "",
      endDate: post.endDate || "",
      travelDestinations: post.travelDestinations || "",
      participantCount: post.participantCount?.toString() || "",
      estimatedBudget: post.estimatedBudget || null,
      planId: post.planId || null,
      content: post.content || "",
      tags: post.tags?.map((tag) => tag.tagName) || [],
      isPublic: post.isPublic !== false,
    };

    // 썸네일 미리보기 설정
    if (post.thumbnailImage) {
      thumbnailPreview.value = post.thumbnailImage;
    }
  } catch (error) {
    console.error("게시글 로드 오류:", error);
    alert("게시글을 불러오는 중 오류가 발생했습니다.");
    router.push("/planboard");
  }
};

const submitForm = async () => {
  try {
    isSubmitting.value = true;

    // 태그 객체 배열로 변환
    const tagsData = formData.value.tags.map((tagName) => ({ tagName }));

    const postData = {
      ...formData.value,
      travelDuration: travelDuration.value,
      tags: tagsData,
      participantCount: parseInt(formData.value.participantCount),
    };

    if (isEdit.value) {
      // 게시글 수정
      await planboardAPI.updatePlanBoard(pboardNo.value, postData);
      alert("게시글이 수정되었습니다.");
      router.push(`/planboard/${pboardNo.value}`);
    } else {
      // 게시글 등록
      const response = await planboardAPI.createPlanBoard(postData);
      alert("게시글이 등록되었습니다!");
      router.push(`/planboard/${response.data.pboardNo}`);
    }
  } catch (error) {
    console.error("게시글 저장 오류:", error);
    alert(isEdit.value ? "게시글 수정에 실패했습니다." : "게시글 등록에 실패했습니다.");
  } finally {
    isSubmitting.value = false;
  }
};

// 라이프사이클
onMounted(async () => {
  await loadUserPlans();

  if (isEdit.value) {
    await loadPostForEdit();
  }
});
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2.5rem 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  text-align: center;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.progress-steps {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.4;
  transition: all 0.3s ease;
}

.step.active,
.step.completed {
  opacity: 1;
}

.step-number {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: #0d6efd;
  color: white;
  transform: scale(1.1);
}

.step.completed .step-number {
  background: #28a745;
  color: white;
}

.step-label {
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
}

.step-line {
  width: 100px;
  height: 3px;
  background: #e9ecef;
  margin: 0 1rem;
  transition: all 0.3s ease;
}

.step-line.completed {
  background: #28a745;
}

.form-container {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.form-step {
  padding: 2.5rem;
}

.step-content {
  margin-bottom: 3rem;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.form-label.required::after {
  content: " *";
  color: #dc3545;
}

.form-label i {
  color: #0d6efd;
  width: 20px;
}

.form-control:focus,
.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.writing-tips {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  border-left: 4px solid #0d6efd;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0 0;
}

.tips-list li {
  padding: 0.5rem 0;
  font-size: 0.9rem;
  color: #555;
  position: relative;
  padding-left: 1.5rem;
}

.tips-list li::before {
  content: "💡";
  position: absolute;
  left: 0;
  top: 0.5rem;
}

.thumbnail-upload {
  border: 2px dashed #dee2e6;
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.3s ease;
}

.thumbnail-upload:hover {
  border-color: #0d6efd;
}

.thumbnail-preview {
  position: relative;
  width: 100%;
  height: 200px;
}

.thumbnail-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-thumbnail {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(220, 53, 69, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.remove-thumbnail:hover {
  background: #dc3545;
}

.thumbnail-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  cursor: pointer;
  color: #6c757d;
  transition: color 0.3s ease;
}

.thumbnail-placeholder:hover {
  color: #0d6efd;
}

.thumbnail-placeholder i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.duration-card {
  background: #e9f0ff;
  border: 2px solid #0d6efd;
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.duration-number {
  font-size: 2rem;
  font-weight: 700;
  color: #0d6efd;
}

.duration-text {
  font-size: 1.2rem;
  color: #0d6efd;
}

.plan-selection {
  border: 1px solid #dee2e6;
  border-radius: 10px;
  padding: 1rem;
}

.no-plans {
  text-align: center;
  padding: 2rem;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.plan-card {
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-card:hover {
  border-color: #0d6efd;
  background: #f8f9fa;
}

.plan-card.selected {
  border-color: #0d6efd;
  background: #e9f0ff;
}

.plan-info {
  flex: 1;
}

.plan-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plan-dates {
  font-size: 0.8rem;
  color: #6c757d;
  margin: 0;
}

.plan-check {
  margin-left: 1rem;
  font-size: 1.2rem;
}

.content-editor {
  border: 1px solid #dee2e6;
  border-radius: 10px;
  overflow: hidden;
}

.editor-toolbar {
  background: #f8f9fa;
  padding: 0.75rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  gap: 0.5rem;
}

.toolbar-btn {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6c757d;
}

.toolbar-btn:hover {
  background: #0d6efd;
  color: white;
  border-color: #0d6efd;
}

.content-textarea {
  border: none;
  border-radius: 0 0 10px 10px;
  resize: vertical;
  min-height: 300px;
}

.content-textarea:focus {
  box-shadow: none;
}

.content-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  font-size: 0.85rem;
}

.char-count {
  font-weight: 600;
  color: #0d6efd;
}

.char-guide {
  color: #6c757d;
}

.tag-input-container {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  min-height: 50px;
}

.tag-input-container:focus-within {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  background: #0d6efd;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tag-remove {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  font-size: 0.8rem;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.tag-remove:hover {
  opacity: 1;
}

.tag-input {
  border: none;
  outline: none;
  flex: 1;
  min-width: 150px;
  padding: 0.25rem;
  font-size: 0.9rem;
}

.recommended-tags {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.recommended-tag {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #6c757d;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.recommended-tag:hover {
  background: #0d6efd;
  color: white;
  border-color: #0d6efd;
}

.preview-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  position: sticky;
  top: 2rem;
}

.preview-card h5 {
  margin-bottom: 1rem;
  color: #333;
}

.preview-content {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-thumbnail {
  width: 100%;
  height: 120px;
  overflow: hidden;
}

.preview-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-title {
  font-size: 1rem;
  font-weight: 600;
  padding: 1rem 1rem 0.5rem;
  color: #333;
}

.preview-travel-title {
  font-size: 0.9rem;
  color: #0d6efd;
  padding: 0 1rem 0.5rem;
  font-weight: 500;
}

.preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0 1rem 0.5rem;
  font-size: 0.8rem;
}

.preview-meta span {
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  color: #495057;
}

.preview-destinations {
  font-size: 0.85rem;
  color: #6c757d;
  padding: 0 1rem 1rem;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 2px solid #f0f0f0;
}

@media (max-width: 768px) {
  .form-step {
    padding: 1.5rem;
  }

  .page-header {
    padding: 2rem 1rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .progress-steps {
    flex-direction: column;
    gap: 1rem;
  }

  .step-line {
    width: 3px;
    height: 30px;
    margin: 0;
  }

  .plans-grid {
    grid-template-columns: 1fr;
  }

  .step-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .step-actions .btn {
    width: 100%;
  }
}
</style>
