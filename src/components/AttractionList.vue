<!-- src/components/AttractionList.vue -->
<template>
  <div class="attraction-list">
    <h2>여행지 목록</h2>

    <div class="search-container">
      <select v-model="contentType">
        <option value="">컨텐츠 선택</option>
        <option v-for="type in contentTypes" :key="type.content_type_id" :value="type.content_type_id">
          {{ type.content_type_name }}
        </option>
      </select>

      <select v-model="sido">
        <option value="">시/도 선택</option>
        <option v-for="item in sidoList" :key="item.sido_code" :value="item.sido_code">
          {{ item.sido_name }}
        </option>
      </select>

      <select v-model="gugun">
        <option value="">구/군 선택</option>
        <option v-for="item in gugunList" :key="item.gugun_code" :value="item.gugun_code">
          {{ item.gugun_name }}
        </option>
      </select>

      <button @click="searchAttractions">검색</button>
    </div>

    <div class="attractions-grid">
      <div v-for="attraction in attractions" :key="attraction.no" class="attraction-card">
        <img :src="attraction.firstImage1 || '/img/no-image.jpg'" alt="attraction image" />
        <h3>{{ attraction.title }}</h3>
        <p>{{ attraction.sido }} {{ attraction.gugun }}</p>
        <router-link :to="`/attractions/${attraction.no}`" class="detail-link">상세보기</router-link>
      </div>
    </div>

    <div class="pagination">
      <!-- 페이지네이션 UI -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import apiClient from "@/api";

const contentTypes = ref([]);
const sidoList = ref([]);
const gugunList = ref([]);
const attractions = ref([]);

const contentType = ref("");
const sido = ref("");
const gugun = ref("");
const currentPage = ref(1);

onMounted(async () => {
  try {
    const [contentTypesRes, sidoRes] = await Promise.all([
      apiClient.get("/attractions/content-types"),
      apiClient.get("/attractions/sido"),
    ]);

    contentTypes.value = contentTypesRes.data;
    sidoList.value = sidoRes.data;
  } catch (error) {
    console.error("데이터 로딩 실패:", error);
  }
});

watch(sido, async (newSido) => {
  if (newSido) {
    try {
      const response = await apiClient.get(`/attractions/gugun/${newSido}`);
      gugunList.value = response.data;
    } catch (error) {
      console.error("구군 데이터 로딩 실패:", error);
    }
  } else {
    gugunList.value = [];
  }
});

async function searchAttractions() {
  try {
    const response = await apiClient.get("/attractions", {
      params: {
        contentTypeName: contentType.value,
        areaCode: sido.value,
        siGunGuCode: gugun.value,
        offset: (currentPage.value - 1) * 10,
        limit: 10,
      },
    });
    attractions.value = response.data;
  } catch (error) {
    console.error("여행지 검색 실패:", error);
  }
}
</script>

<style scoped>
/* 스타일 작성 */
</style>
