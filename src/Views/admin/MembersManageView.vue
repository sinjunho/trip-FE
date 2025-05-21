<!-- src/views/admin/MembersManageView.vue -->
<template>
  <div class="members-manage-view">
    <div class="container py-4">
      <h1 class="mb-4">회원 관리</h1>

      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>ID</th>
                  <th>이름</th>
                  <th>주소</th>
                  <th>전화번호</th>
                  <th>역할</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in members" :key="member.id">
                  <td>{{ member.id }}</td>
                  <td>{{ member.name }}</td>
                  <td>{{ member.address }}</td>
                  <td>{{ member.tel }}</td>
                  <td>{{ member.role }}</td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary me-1">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import apiClient from "@/api";

const members = ref([]);
const loading = ref(true);

const fetchMembers = async () => {
  try {
    loading.value = true;
    const response = await apiClient.get("/members");
    members.value = response.data.list || [];
  } catch (error) {
    console.error("회원 목록 조회 중 오류 발생:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchMembers();
});
</script>
