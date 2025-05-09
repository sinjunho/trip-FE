<!-- src/views/HomeView.vue -->
<template>
  <div class="home">
    <section class="title-page">
      <div class="title-page-content">
        <h1>
          지금 <span class="highlight">Enjoy Trip</span>과 함께 <br />
          우리지역의 관광지를 알아보고 <br />
          나만의 여행 계획을 만들어보세요!
        </h1>
        <a href="#popular-cities" class="cta-btn mt-4">여행지 둘러보기 <i class="fas fa-arrow-right ms-2"></i></a>
      </div>
      <div v-if="isLoggedIn" class="contact-form top-rank-container">
        <h3>인기 여행지 TOP 10</h3>
        <ul class="rank-list">
          <li v-for="(attraction, index) in topAttractions" :key="attraction.no" class="rank-item">
            <router-link :to="`/attractions/${attraction.no}`" class="rank-link">
              <span class="rank-number">{{ index + 1 }}</span>
              <span class="rank-title">{{ attraction.title }}</span>
              <span class="rank-region">{{ attraction.sido }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </section>

    <section class="places">
      <h2>우리지역 관광지</h2>
      <div class="place-container">
        <div v-for="place in featuredPlaces" :key="place.id" class="place-card">
          <img :src="place.image" :alt="place.title" />
          <h3>{{ place.title }}</h3>
        </div>
      </div>
    </section>

    <section class="popular-cities" id="popular-cities">
      <h2 class="text-center">인기 도시</h2>
      <div class="cities-container">
        <div v-for="city in popularCities" :key="city.id" class="city-card">
          <img :src="city.image" :alt="city.name" />
          <div class="city-overlay">
            <h3>{{ city.name }}</h3>
            <p>{{ city.attractionCount }}개의 관광 명소</p>
          </div>
        </div>
      </div>
    </section>

    <section class="reviews">
      <h2 class="text-center">여행객 후기</h2>
      <div class="reviews-container">
        <div v-for="review in userReviews" :key="review.id" class="review-card">
          <div class="review-content">{{ review.content }}</div>
          <div class="reviewer">
            <div class="reviewer-img">
              <img :src="review.profileImage" :alt="review.name" />
            </div>
            <div class="reviewer-info">
              <h4>{{ review.name }}</h4>
              <p>{{ review.trip }}</p>
              <div class="stars">
                <i v-for="n in review.stars" :key="n" class="fas fa-star"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="cta">
      <h2>나만의 여행 계획을 만들어보세요</h2>
      <p>Enjoy Trip과 함께라면 여행이 더욱 특별해집니다. 지금 바로 시작해보세요!</p>
      <router-link to="/attractions" class="cta-btn">관광지 둘러보기</router-link>
    </section>
  </div>
</template>

<script setup>
// HomeView.vue의 script 부분
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useMemberStore } from "@/stores/member";
import { useAttractionStore } from "@/stores/attraction";

const router = useRouter();
const memberStore = useMemberStore();
const attractionStore = useAttractionStore();

const isLoggedIn = computed(() => memberStore.isLoggedIn);
const topAttractions = computed(() => attractionStore.topAttractions);

// 인기 관광지 및 데이터 로드
onMounted(async () => {
  try {
    await attractionStore.fetchTopAttractions();
    await attractionStore.fetchRandomAttractions();
  } catch (error) {
    console.error("데이터 로딩 중 오류 발생:", error);
  }
});

const featuredPlaces = ref([
  { id: 1, title: "해변", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e" },
  { id: 2, title: "서울", image: "https://images.unsplash.com/photo-1534274867514-d5b47ef89ed7" },
  { id: 3, title: "리조트", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4" },
]);

const popularCities = ref([
  {
    id: 1,
    name: "서울",
    attractionCount: 63,
    image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451",
  },
  {
    id: 2,
    name: "부산",
    attractionCount: 48,
    image: "https://www.visitbusan.net/uploadImgs/files/hqimgfiles/20200326112404471_thumbL",
  },
  {
    id: 3,
    name: "제주",
    attractionCount: 57,
    image: "https://cdn.visitkorea.or.kr/img/call?cmd=VIEW&id=870e2aa3-ff1f-4b72-af59-88874c9c4efb",
  },
  {
    id: 4,
    name: "경주",
    attractionCount: 42,
    image: "https://cdn.visitkorea.or.kr/img/call?cmd=VIEW&id=ed41a0d7-73a4-4b2a-943d-68d8a252f068",
  },
]);

const userReviews = ref([
  {
    id: 1,
    content:
      "제주도 여행을 Enjoy Trip으로 계획했는데, 정말 좋은 경험이었습니다. 여행 경로 추천이 특히 마음에 들었어요!",
    name: "신준호",
    trip: "제주도 여행",
    stars: 5,
    profileImage: "/img/profile/user1.jpg",
  },
  {
    id: 2,
    content: "부산 여행 코스 추천 덕분에 시간을 효율적으로 사용할 수 있었습니다. 다음에도 꼭 이용할게요!",
    name: "김아윤",
    trip: "부산 여행",
    stars: 4,
    profileImage: "/img/profile/user2.jpg",
  },
  {
    id: 3,
    content:
      "친구들과 서울 여행을 계획하면서 Enjoy Trip을 이용했는데, 숨은 명소들을 많이 발견할 수 있었어요. 감사합니다!",
    name: "전준영",
    trip: "서울 여행",
    stars: 5,
    profileImage: "/img/profile/user3.jpg",
  },
]);
</script>

<style scoped>
/* CSS 스타일을 여기에 추가하세요 (기존 index.css에서 가져오기) */
.title-page {
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
    url("https://cdn.informaticsview.com/news/photo/202408/400_1390_641.jpg") no-repeat center center/cover;
  background-attachment: fixed;
  height: 650px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  text-align: center;
  color: white;
  position: relative;
  padding: 0 80px;
}

/* 나머지 CSS 스타일... */
</style>
