<!-- src/components/plan/Budget.vue -->
<template>
  <div class="budget-component">
    <div class="card">
      <div class="card-header bg-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0">여행 예산 관리</h5>
        <div>
          <button class="btn btn-sm btn-outline-primary" @click="addBudgetItem">
            <i class="fas fa-plus"></i> 항목 추가
          </button>
        </div>
      </div>

      <div class="card-body">
        <!-- 비용 요약 -->
        <div class="budget-summary mb-4">
          <div class="row text-center">
            <div class="col-md-4">
              <div class="budget-summary-item">
                <div class="summary-title">총 예산</div>
                <div class="summary-value">{{ formatCurrency(totalBudget) }}</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="budget-summary-item">
                <div class="summary-title">총 지출</div>
                <div class="summary-value">{{ formatCurrency(totalExpense) }}</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="budget-summary-item">
                <div class="summary-title">남은 금액</div>
                <div
                  class="summary-value"
                  :class="{ 'text-success': remainingBudget >= 0, 'text-danger': remainingBudget < 0 }"
                >
                  {{ formatCurrency(remainingBudget) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 비용 카테고리별 분석 -->
        <div class="budget-chart mb-4">
          <canvas id="budgetChart" height="200"></canvas>
        </div>

        <!-- 비용 항목 목록 -->
        <div class="budget-items">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th style="width: 20%">카테고리</th>
                <th style="width: 30%">항목</th>
                <th style="width: 15%">비용</th>
                <th style="width: 20%">날짜</th>
                <th style="width: 15%">관리</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in budgetItems" :key="index">
                <td>
                  <span class="badge" :class="getCategoryClass(item.category)">
                    {{ getCategoryName(item.category) }}
                  </span>
                </td>
                <td>{{ item.title }}</td>
                <td>{{ formatCurrency(item.amount) }}</td>
                <td>{{ formatDate(item.date) }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1" @click="editBudgetItem(index)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteBudgetItem(index)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="budgetItems.length === 0">
                <td colspan="5" class="text-center py-3">
                  <p class="text-muted mb-0">등록된 예산 항목이 없습니다.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 예산 항목 추가/수정 모달 -->
    <div class="modal fade" id="budgetModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editIndex === -1 ? "예산 항목 추가" : "예산 항목 수정" }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveBudgetItem">
              <div class="mb-3">
                <label for="budgetCategory" class="form-label">카테고리</label>
                <select id="budgetCategory" v-model="currentItem.category" class="form-select" required>
                  <option value="transportation">교통</option>
                  <option value="accommodation">숙박</option>
                  <option value="food">식비</option>
                  <option value="activity">관광/액티비티</option>
                  <option value="shopping">쇼핑</option>
                  <option value="etc">기타</option>
                </select>
              </div>

              <div class="mb-3">
                <label for="budgetTitle" class="form-label">항목명</label>
                <input
                  type="text"
                  id="budgetTitle"
                  v-model="currentItem.title"
                  class="form-control"
                  required
                  placeholder="예: 숙소 예약, 버스 티켓 등"
                />
              </div>

              <div class="mb-3">
                <label for="budgetAmount" class="form-label">금액 (원)</label>
                <input
                  type="number"
                  id="budgetAmount"
                  v-model="currentItem.amount"
                  class="form-control"
                  required
                  min="0"
                  step="1000"
                />
              </div>

              <div class="mb-3">
                <label for="budgetDate" class="form-label">날짜</label>
                <input type="date" id="budgetDate" v-model="currentItem.date" class="form-control" required />
              </div>

              <div class="mb-3">
                <label for="budgetNote" class="form-label">메모</label>
                <textarea
                  id="budgetNote"
                  v-model="currentItem.note"
                  class="form-control"
                  rows="3"
                  placeholder="추가 메모 사항 (선택사항)"
                ></textarea>
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
import { ref, reactive, computed, onMounted, watch } from "vue";
import Chart from "chart.js/auto";

const props = defineProps({
  planId: {
    type: Number,
    required: true,
  },
});

// 상태 관리
const budgetItems = ref([]);
const currentItem = reactive({
  category: "transportation",
  title: "",
  amount: 0,
  date: "",
  note: "",
});
const editIndex = ref(-1);
let budgetChart = null;

// 계산된 속성
const totalBudget = computed(() => {
  return budgetItems.value.reduce((sum, item) => sum + item.amount, 0);
});

const totalExpense = computed(() => {
  // 실제 지출은 별도로 관리할 수 있음
  return totalBudget.value; // 현재는 예산과 동일하게 처리
});

const remainingBudget = computed(() => {
  return 0; // 현재는 0으로 설정
});

// 카테고리별 금액 계산
const categoryAmounts = computed(() => {
  const amounts = {
    transportation: 0,
    accommodation: 0,
    food: 0,
    activity: 0,
    shopping: 0,
    etc: 0,
  };

  budgetItems.value.forEach((item) => {
    amounts[item.category] += item.amount;
  });

  return amounts;
});

// 메서드
// 예산 항목 추가 모달 열기
const addBudgetItem = () => {
  editIndex.value = -1;

  // 현재 항목 초기화
  Object.assign(currentItem, {
    category: "transportation",
    title: "",
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    note: "",
  });

  // 모달 열기
  const modal = new bootstrap.Modal(document.getElementById("budgetModal"));
  modal.show();
};

// 예산 항목 수정 모달 열기
const editBudgetItem = (index) => {
  editIndex.value = index;

  // 현재 항목에 수정할 항목 복사
  Object.assign(currentItem, { ...budgetItems.value[index] });

  // 모달 열기
  const modal = new bootstrap.Modal(document.getElementById("budgetModal"));
  modal.show();
};

// 예산 항목 저장
const saveBudgetItem = () => {
  const itemToSave = { ...currentItem };

  if (editIndex.value === -1) {
    // 새 항목 추가
    budgetItems.value.push(itemToSave);
  } else {
    // 기존 항목 수정
    budgetItems.value[editIndex.value] = itemToSave;
  }

  // 로컬 스토리지에 저장
  saveBudgetToLocalStorage();

  // 차트 업데이트
  updateBudgetChart();

  // 모달 닫기
  const modal = bootstrap.Modal.getInstance(document.getElementById("budgetModal"));
  modal.hide();
};

// 예산 항목 삭제
const deleteBudgetItem = (index) => {
  if (confirm("이 예산 항목을 삭제하시겠습니까?")) {
    budgetItems.value.splice(index, 1);

    // 로컬 스토리지에 저장
    saveBudgetToLocalStorage();

    // 차트 업데이트
    updateBudgetChart();
  }
};

// 로컬 스토리지에 예산 저장
const saveBudgetToLocalStorage = () => {
  localStorage.setItem(`budget_${props.planId}`, JSON.stringify(budgetItems.value));
};

// 로컬 스토리지에서 예산 로드
const loadBudgetFromLocalStorage = () => {
  const savedBudget = localStorage.getItem(`budget_${props.planId}`);
  if (savedBudget) {
    budgetItems.value = JSON.parse(savedBudget);
  }
};

// 예산 차트 초기화
const initBudgetChart = () => {
  const ctx = document.getElementById("budgetChart");
  if (!ctx) return;

  if (budgetChart) {
    budgetChart.destroy();
  }

  budgetChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["교통", "숙박", "식비", "관광/액티비티", "쇼핑", "기타"],
      datasets: [
        {
          data: [
            categoryAmounts.value.transportation,
            categoryAmounts.value.accommodation,
            categoryAmounts.value.food,
            categoryAmounts.value.activity,
            categoryAmounts.value.shopping,
            categoryAmounts.value.etc,
          ],
          backgroundColor: ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e", "#e74a3b", "#858796"],
          hoverBackgroundColor: ["#2e59d9", "#17a673", "#2c9faf", "#f4b619", "#e02d1b", "#6e707e"],
          hoverBorderColor: "rgba(234, 236, 244, 1)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              const dataset = tooltipItem.dataset;
              const total = dataset.data.reduce((acc, data) => acc + data, 0);
              const currentValue = dataset.data[tooltipItem.dataIndex];
              const percentage = parseFloat(((currentValue / total) * 100).toFixed(1));

              return `${tooltipItem.label}: ${formatCurrency(currentValue)} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
};

// 예산 차트 업데이트
const updateBudgetChart = () => {
  if (!budgetChart) {
    initBudgetChart();
    return;
  }

  budgetChart.data.datasets[0].data = [
    categoryAmounts.value.transportation,
    categoryAmounts.value.accommodation,
    categoryAmounts.value.food,
    categoryAmounts.value.activity,
    categoryAmounts.value.shopping,
    categoryAmounts.value.etc,
  ];

  budgetChart.update();
};

// 통화 포맷
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// 날짜 포맷
const formatDate = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

// 카테고리명 변환
const getCategoryName = (category) => {
  const categoryNames = {
    transportation: "교통",
    accommodation: "숙박",
    food: "식비",
    activity: "관광/액티비티",
    shopping: "쇼핑",
    etc: "기타",
  };

  return categoryNames[category] || category;
};

// 카테고리별 배지 클래스
const getCategoryClass = (category) => {
  const categoryClasses = {
    transportation: "bg-primary",
    accommodation: "bg-success",
    food: "bg-info",
    activity: "bg-warning",
    shopping: "bg-danger",
    etc: "bg-secondary",
  };

  return categoryClasses[category] || "bg-secondary";
};

// 카테고리 금액이 변경될 때 차트 업데이트
watch(
  categoryAmounts,
  () => {
    updateBudgetChart();
  },
  { deep: true }
);

// 컴포넌트 마운트 시 초기화
onMounted(() => {
  // 로컬 스토리지에서 예산 로드
  loadBudgetFromLocalStorage();

  // 차트 초기화
  setTimeout(() => {
    initBudgetChart();
  }, 500);
});
</script>

<style scoped>
.budget-summary {
  margin-top: 15px;
  margin-bottom: 25px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.budget-summary-item {
  padding: 10px;
}

.summary-title {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.budget-chart {
  height: 250px;
  position: relative;
}

.badge {
  font-size: 0.8rem;
  padding: 0.5em 0.7em;
}
</style>
