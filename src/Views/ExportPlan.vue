<!-- src/components/plan/ExportPlan.vue -->
<template>
  <div class="export-plan-component">
    <button class="btn btn-outline-primary" @click="openExportModal">
      <i class="fas fa-file-export me-1"></i> 여행 일정 내보내기
    </button>

    <!-- 내보내기 모달 -->
    <div class="modal fade" id="exportModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">여행 일정 내보내기</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="export-options">
              <h6 class="mb-3">내보내기 형식</h6>

              <div class="form-check mb-3">
                <input
                  class="form-check-input"
                  type="radio"
                  name="exportFormat"
                  id="formatPDF"
                  value="pdf"
                  v-model="exportFormat"
                />
                <label class="form-check-label d-flex align-items-center" for="formatPDF">
                  <i class="fas fa-file-pdf text-danger me-2"></i> PDF 문서
                  <span class="badge bg-success ms-2">추천</span>
                </label>
                <small class="text-muted d-block mt-1">상세 일정 및 지도가 포함된 PDF 파일로 저장합니다.</small>
              </div>

              <div class="form-check mb-3">
                <input
                  class="form-check-input"
                  type="radio"
                  name="exportFormat"
                  id="formatImage"
                  value="image"
                  v-model="exportFormat"
                />
                <label class="form-check-label d-flex align-items-center" for="formatImage">
                  <i class="fas fa-image text-primary me-2"></i> 이미지
                </label>
                <small class="text-muted d-block mt-1">일정표를 이미지 파일로 저장합니다.</small>
              </div>

              <div class="form-check mb-3">
                <input
                  class="form-check-input"
                  type="radio"
                  name="exportFormat"
                  id="formatText"
                  value="text"
                  v-model="exportFormat"
                />
                <label class="form-check-label d-flex align-items-center" for="formatText">
                  <i class="fas fa-file-alt text-success me-2"></i> 텍스트 파일
                </label>
                <small class="text-muted d-block mt-1">간단한 텍스트 형식으로 저장합니다.</small>
              </div>

              <div class="form-check mb-3">
                <input
                  class="form-check-input"
                  type="radio"
                  name="exportFormat"
                  id="formatCalendar"
                  value="calendar"
                  v-model="exportFormat"
                />
                <label class="form-check-label d-flex align-items-center" for="formatCalendar">
                  <i class="fas fa-calendar-alt text-info me-2"></i> 캘린더 연동
                </label>
                <small class="text-muted d-block mt-1">Google 캘린더 등에 일정을 추가합니다.</small>
              </div>
            </div>

            <div v-if="exportFormat === 'pdf'" class="pdf-options mt-4">
              <h6 class="mb-3">PDF 옵션</h6>

              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="includeMap" v-model="pdfOptions.includeMap" />
                <label class="form-check-label" for="includeMap"> 지도 포함 </label>
              </div>

              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="includeAttractions"
                  v-model="pdfOptions.includeAttractions"
                />
                <label class="form-check-label" for="includeAttractions"> 관광지 상세 정보 포함 </label>
              </div>

              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="includeTransport"
                  v-model="pdfOptions.includeTransport"
                />
                <label class="form-check-label" for="includeTransport"> 교통 정보 포함 </label>
              </div>

              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="includeBudget" v-model="pdfOptions.includeBudget" />
                <label class="form-check-label" for="includeBudget"> 예산 정보 포함 </label>
              </div>
            </div>

            <div v-if="exportFormat === 'calendar'" class="calendar-options mt-4">
              <h6 class="mb-3">캘린더 옵션</h6>

              <div class="form-group mb-3">
                <label for="calendarType" class="form-label">캘린더 서비스</label>
                <select id="calendarType" v-model="calendarOptions.service" class="form-select">
                  <option value="google">Google 캘린더</option>
                  <option value="outlook">Outlook 캘린더</option>
                  <option value="apple">Apple 캘린더</option>
                </select>
              </div>

              <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                선택한 캘린더 서비스로 이동하여 일정을 추가합니다.
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
            <button type="button" class="btn btn-primary" @click="exportPlan">
              <i class="fas fa-file-export me-1"></i> 내보내기
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const props = defineProps({
  plan: {
    type: Object,
    required: true,
  },
});

// 상태 관리
const exportFormat = ref("pdf");
const pdfOptions = reactive({
  includeMap: true,
  includeAttractions: true,
  includeTransport: false,
  includeBudget: false,
});
const calendarOptions = reactive({
  service: "google",
});

// 내보내기 모달 열기
const openExportModal = () => {
  const modal = new bootstrap.Modal(document.getElementById("exportModal"));
  modal.show();
};

// 여행 계획 내보내기
const exportPlan = async () => {
  switch (exportFormat.value) {
    case "pdf":
      await exportToPDF();
      break;
    case "image":
      await exportToImage();
      break;
    case "text":
      exportToText();
      break;
    case "calendar":
      exportToCalendar();
      break;
  }

  // 모달 닫기
  const modal = bootstrap.Modal.getInstance(document.getElementById("exportModal"));
  modal.hide();
};

// PDF로 내보내기
const exportToPDF = async () => {
  try {
    // PDF 문서 생성
    const doc = new jsPDF();
    let yPos = 10;

    // 제목
    doc.setFontSize(20);
    doc.text(props.plan.title, 105, yPos, { align: "center" });
    yPos += 10;

    // 여행 기간
    doc.setFontSize(12);
    doc.text(`${formatDate(props.plan.startDate)} ~ ${formatDate(props.plan.endDate)}`, 105, yPos, { align: "center" });
    yPos += 10;

    // 구분선
    doc.setDrawColor(200, 200, 200);
    doc.line(10, yPos, 200, yPos);
    yPos += 10;

    // 일차별 일정
    doc.setFontSize(14);

    for (let day = 1; day <= getDayCount(); day++) {
      // 일차 제목
      doc.setFontSize(16);
      doc.setTextColor(0, 102, 204);
      doc.text(`${day}일차 - ${getDayDate(day)}`, 10, yPos);
      yPos += 10;

      // 세부 일정
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);

      const dayDetails = getDayDetails(day);

      if (dayDetails.length === 0) {
        doc.text("일정 없음", 15, yPos);
        yPos += 10;
      } else {
        for (const detail of dayDetails) {
          // 시간 및 제목
          const timeText = detail.visitTime ? formatTime(detail.visitTime) : "";
          const titleText = `${timeText ? timeText + " - " : ""}${detail.title}`;
          doc.text(titleText, 15, yPos);
          yPos += 7;

          // 설명
          if (detail.description) {
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(detail.description, 20, yPos);
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            yPos += 7;
          }

          // 관광지 정보
          if (pdfOptions.includeAttractions && detail.attraction) {
            doc.setFontSize(10);
            doc.setTextColor(50, 50, 50);
            doc.text(`주소: ${detail.attraction.addr || "정보 없음"}`, 20, yPos);
            yPos += 5;

            if (detail.attraction.tel) {
              doc.text(`연락처: ${detail.attraction.tel}`, 20, yPos);
              yPos += 5;
            }

            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
          }

          yPos += 3;
        }
      }

      // 페이지 넘김 체크
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      } else {
        yPos += 10;
      }
    }

    // PDF 저장
    doc.save(`${props.plan.title}.pdf`);
  } catch (error) {
    console.error("PDF 내보내기 중 오류 발생:", error);
    alert("PDF 생성 중 오류가 발생했습니다.");
  }
};

// 이미지로 내보내기
const exportToImage = async () => {
  try {
    // 여행 일정 요약 DOM 요소 선택 (실제 DOM 요소 ID로 변경 필요)
    const element = document.getElementById("planSummary");

    if (!element) {
      throw new Error("일정 요약 요소를 찾을 수 없습니다.");
    }

    // HTML 요소를 캔버스로 변환
    const canvas = await html2canvas(element);

    // 이미지 데이터 URL 생성
    const imageData = canvas.toDataURL("image/png");

    // 이미지 다운로드 링크 생성 및 클릭
    const link = document.createElement("a");
    link.download = `${props.plan.title}.png`;
    link.href = imageData;
    link.click();
  } catch (error) {
    console.error("이미지 내보내기 중 오류 발생:", error);
    alert("이미지 생성 중 오류가 발생했습니다.");
  }
};

// 텍스트로 내보내기
const exportToText = () => {
  try {
    // 텍스트 내용 구성
    let content = `${props.plan.title}\n`;
    content += `${formatDate(props.plan.startDate)} ~ ${formatDate(props.plan.endDate)}\n\n`;

    if (props.plan.description) {
      content += `${props.plan.description}\n\n`;
    }

    // 일차별 일정
    for (let day = 1; day <= getDayCount(); day++) {
      content += `■ ${day}일차 - ${getDayDate(day)}\n`;

      const dayDetails = getDayDetails(day);

      if (dayDetails.length === 0) {
        content += "  - 일정 없음\n";
      } else {
        for (const detail of dayDetails) {
          const timeText = detail.visitTime ? formatTime(detail.visitTime) + " - " : "";
          content += `  - ${timeText}${detail.title}\n`;

          if (detail.description) {
            content += `    ${detail.description}\n`;
          }

          if (detail.attraction) {
            content += `    주소: ${detail.attraction.addr || "정보 없음"}\n`;

            if (detail.attraction.tel) {
              content += `    연락처: ${detail.attraction.tel}\n`;
            }
          }

          content += "\n";
        }
      }

      content += "\n";
    }

    // 텍스트 파일 다운로드
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${props.plan.title}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("텍스트 내보내기 중 오류 발생:", error);
    alert("텍스트 파일 생성 중 오류가 발생했습니다.");
  }
};

// 캘린더로 내보내기
const exportToCalendar = () => {
  try {
    // 캘린더 서비스별 처리
    switch (calendarOptions.service) {
      case "google":
        exportToGoogleCalendar();
        break;
      case "outlook":
        exportToOutlookCalendar();
        break;
      case "apple":
        exportToAppleCalendar();
        break;
    }
  } catch (error) {
    console.error("캘린더 내보내기 중 오류 발생:", error);
    alert("캘린더 내보내기 중 오류가 발생했습니다.");
  }
};

// Google 캘린더로 내보내기
const exportToGoogleCalendar = () => {
  // 일정 정보 구성
  const events = [];

  // 일차별 일정
  for (let day = 1; day <= getDayCount(); day++) {
    const dayDate = getDayDateObject(day);
    const dayDetails = getDayDetails(day);

    for (const detail of dayDetails) {
      let startDate = new Date(dayDate);

      // 시간 설정
      if (detail.visitTime) {
        const [hours, minutes] = detail.visitTime.split(":").map(Number);
        startDate.setHours(hours, minutes);
      }

      // 종료 시간 계산 (소요 시간이 있는 경우)
      let endDate = new Date(startDate);
      if (detail.stayDuration) {
        endDate = new Date(startDate.getTime() + detail.stayDuration * 60000); // 분 단위를 밀리초로 변환
      } else {
        endDate = new Date(startDate.getTime() + 60 * 60000); // 기본 1시간
      }

      // 이벤트 생성
      const event = {
        action: "TEMPLATE",
        text: detail.title,
        dates: `${formatCalendarDate(startDate)}/${formatCalendarDate(endDate)}`,
        details: detail.description || "",
        location: detail.attraction ? detail.attraction.addr : "",
      };

      events.push(event);
    }
  }

  // 첫 번째 이벤트만 처리 (여러 이벤트는 API 제한으로 인해 한 번에 처리 불가)
  if (events.length > 0) {
    const event = events[0];
    const url = `https://calendar.google.com/calendar/render?${Object.entries(event)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&")}`;

    window.open(url, "_blank");
  } else {
    alert("내보낼 일정이 없습니다.");
  }
};

// Outlook 캘린더로 내보내기
const exportToOutlookCalendar = () => {
  alert("Outlook 캘린더 내보내기는 아직 구현되지 않았습니다.");
};

// Apple 캘린더로 내보내기
const exportToAppleCalendar = () => {
  alert("Apple 캘린더 내보내기는 아직 구현되지 않았습니다.");
};

// 일수 계산
const getDayCount = () => {
  if (!props.plan.startDate || !props.plan.endDate) return 0;

  const start = new Date(props.plan.startDate);
  const end = new Date(props.plan.endDate);

  // 날짜 차이 계산 (밀리초 단위)
  const diffTime = Math.abs(end - start);
  // 일 단위로 변환하고 1을 더함 (시작일 포함)
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

// 특정 일차의 날짜 계산
const getDayDate = (day) => {
  if (!props.plan.startDate) return "";

  const start = new Date(props.plan.startDate);
  const dayDate = new Date(start);
  dayDate.setDate(start.getDate() + day - 1);

  return dayDate.toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
};

// 특정 일차의 날짜 객체 반환
const getDayDateObject = (day) => {
  if (!props.plan.startDate) return new Date();

  const start = new Date(props.plan.startDate);
  const dayDate = new Date(start);
  dayDate.setDate(start.getDate() + day - 1);

  return dayDate;
};

// 특정 일차의 세부 일정 가져오기
const getDayDetails = (day) => {
  return props.plan.details
    .filter((detail) => detail.dayNumber === day)
    .sort((a, b) => {
      if (a.visitTime && b.visitTime) {
        return a.visitTime.localeCompare(b.visitTime);
      } else if (a.visitTime) {
        return -1;
      } else if (b.visitTime) {
        return 1;
      } else {
        return a.orderNo - b.orderNo;
      }
    });
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

// 시간 포맷
const formatTime = (timeStr) => {
  if (!timeStr) return "";

  return timeStr.substring(0, 5);
};

// 캘린더 날짜 포맷
const formatCalendarDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}00`;
};
</script>

<style scoped>
/* 내보내기 관련 스타일 */
</style>
