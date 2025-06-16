<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>欢迎使用农业管理系统</span>
            </div>
          </template>
          <div class="welcome-content">
            <h2>您好，{{ userInfo.realName || userInfo.username }}</h2>
            <p>欢迎登录农业管理系统，您可以在左侧菜单中选择功能模块进行操作。</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-content {
  padding: 20px;
  text-align: center;
}
</style>