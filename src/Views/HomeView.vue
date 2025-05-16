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
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isLoggedIn);

// 임시 데이터 (실제로는 store에서 가져와야 함)
const topAttractions = ref([]);

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
    image: "https://images.unsplash.com/photo-1534274867514-d5b47ef89ed7",
  },
  {
    id: 3,
    name: "제주",
    attractionCount: 57,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  },
  {
    id: 4,
    name: "경주",
    attractionCount: 42,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
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
    profileImage: "https://ui-avatars.com/api/?name=신준호&background=random",
  },
  {
    id: 2,
    content: "부산 여행 코스 추천 덕분에 시간을 효율적으로 사용할 수 있었습니다. 다음에도 꼭 이용할게요!",
    name: "신규원",
    trip: "부산 여행",
    stars: 4,
    profileImage: "https://ui-avatars.com/api/?name=신규원&background=random",
  },
  {
    id: 3,
    content:
      "친구들과 서울 여행을 계획하면서 Enjoy Trip을 이용했는데, 숨은 명소들을 많이 발견할 수 있었어요. 감사합니다!",
    name: "전준영",
    trip: "서울 여행",
    stars: 5,
    profileImage: "https://ui-avatars.com/api/?name=전준영&background=random",
  },
]);
</script>

<style scoped>
.home {
  width: 100%;
}

.title-page {
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
    url("https://images.unsplash.com/photo-1517154421773-0529f29ea451") no-repeat center center/cover;
  background-attachment: fixed;
  height: 850px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  position: relative;
  padding: 0 80px;
}

.title-page-content h1 {
  font-size: 3rem;
  font-weight: bold;
  line-height: 1.3;
}

.highlight {
  color: #007bff;
}

.cta-btn {
  display: inline-block;
  padding: 12px 30px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.cta-btn:hover {
  background-color: #0056b3;
  color: white;
  text-decoration: none;
}

.places {
  padding: 80px 0;
  background-color: #f8f9fa;
}

.places h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
}

.place-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.place-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.place-card:hover {
  transform: translateY(-5px);
}

.place-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.place-card h3 {
  padding: 20px;
  text-align: center;
  font-size: 1.5rem;
}

.popular-cities {
  padding: 80px 0;
}

.popular-cities h2 {
  font-size: 2.5rem;
  margin-bottom: 3rem;
}

.cities-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.city-card {
  position: relative;
  height: 300px;
  overflow: hidden;
  border-radius: 10px;
  cursor: pointer;
}

.city-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.city-card:hover img {
  transform: scale(1.1);
}

.city-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 20px;
}

.reviews {
  padding: 80px 0;
  background-color: #f8f9fa;
}

.reviews h2 {
  font-size: 2.5rem;
  margin-bottom: 3rem;
}

.reviews-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.review-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.review-content {
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.reviewer {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.reviewer-img img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.reviewer-info h4 {
  margin: 0;
  font-size: 1.1rem;
}

.reviewer-info p {
  margin: 0.25rem 0;
  color: #6c757d;
}

.stars {
  color: #ffc107;
}

.cta {
  padding: 80px 0;
  text-align: center;
  background-color: #007bff;
  color: white;
}

.cta h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.cta .cta-btn {
  background-color: white;
  color: #007bff;
  margin-top: 2rem;
}

.cta .cta-btn:hover {
  background-color: #f8f9fa;
}

.top-rank-container {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin-left: auto;
}

.rank-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rank-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.rank-item:last-child {
  border-bottom: none;
}

.rank-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
  transition: color 0.3s;
}

.rank-link:hover {
  color: #007bff;
}

.rank-number {
  font-weight: bold;
  margin-right: 1rem;
  color: #007bff;
}

.rank-title {
  flex: 1;
}

.rank-region {
  color: #6c757d;
  font-size: 0.9rem;
}
</style>
