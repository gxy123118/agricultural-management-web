<template>
  <div class="app-wrapper">
    <div class="sidebar-container">
      <div class="logo-container">
        <h1>农资管理系统</h1>
      </div>
      <el-menu
          :default-active="activeMenu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          router
      >
        <el-sub-menu index="/dashboard">
          <template #title>
            <el-icon>
              <HomeFilled/>
            </el-icon>
            <span>首页</span>
          </template>
          <el-menu-item index="/dashboard/index">控制台</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="/user">
          <template #title>
            <el-icon>
              <User/>
            </el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/user/list">用户列表</el-menu-item>
        </el-sub-menu>
        <!-- 在el-menu中添加仓库管理菜单项，放在供应商管理菜单项后面 -->
        <el-sub-menu index="/depot">
          <template #title>
            <el-icon>
              <House/>
            </el-icon>
            <span>仓库管理</span>
          </template>
          <el-menu-item index="/depot/list">仓库列表</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="/supplier">
          <template #title>
            <el-icon>
              <Goods/>
            </el-icon>
            <span>供应商管理</span>
          </template>
          <el-menu-item index="/supplier/list">供应商列表</el-menu-item>
        </el-sub-menu>
        <!-- 在el-menu中添加结算账户管理菜单项 -->
        <el-sub-menu index="/account">
          <template #title>
            <el-icon>
              <Money/>
            </el-icon>
            <span>结算账户管理</span>
          </template>
          <el-menu-item index="/account/list">账户列表</el-menu-item>
        </el-sub-menu>
        <!-- 在el-menu中添加农业管理菜单项 -->
        <el-sub-menu index="/material">
          <template #title>
            <el-icon>
              <Goods/>
            </el-icon>
            <span>农业管理</span>
          </template>
          <el-menu-item index="/material/category">物资分类管理</el-menu-item>
          <el-menu-item index="/material/list">物资信息管理</el-menu-item>
          <el-menu-item index="/material/low-stock">库存预警</el-menu-item>
        </el-sub-menu>
        <!-- 在el-menu中添加农资采购管理菜单项 -->
        <el-sub-menu index="/procurement">
          <template #title>
            <el-icon>
              <ShoppingCart/>
            </el-icon>
            <span>农资采购管理</span>
          </template>
          <el-menu-item index="/procurement/list">采购列表</el-menu-item>
        </el-sub-menu>
        <!-- 修复农资销售管理菜单 -->
        <el-sub-menu index="/sales">
          <template #title>
            <el-icon>
              <Sell/>
            </el-icon>
            <span>农资销售管理</span>
          </template>
          <el-menu-item index="/sales/list">销售列表</el-menu-item>
        </el-sub-menu>

        <!-- 修复财务统计菜单 -->
        <el-sub-menu index="/statistics">
          <template #title>
            <el-icon>
              <TrendCharts/>
            </el-icon>
            <span>财务统计</span>
          </template>
          <el-menu-item index="/statistics/financial">财务统计</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>

    <div class="main-container">
      <div class="navbar">
        <div class="right-menu">
          <el-dropdown>
            <span class="el-dropdown-link">
              {{ userInfo.realName || userInfo.username }}<el-icon class="el-icon--right"><arrow-down/></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <div class="app-main">
        <router-view/>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useUserStore} from '@/store/user'
// 在script setup部分导入所需的图标
import {
  HomeFilled,
  User,
  ArrowDown,
  Goods,
  House,
  Money,
  Box,
  ShoppingCart,
  TrendCharts,
  Sell
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)

const activeMenu = computed(() => {
  return route.path
})

const logout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<!-- 保持template和script部分不变 -->

<style scoped>
.app-wrapper {
  display: flex;
  height: 100vh;
  width: 100%;
}

.sidebar-container {
  width: 220px; /* 稍微宽一点 */
  height: 100%;
  background-color: #304156;
  transition: width 0.28s;
  overflow-y: auto;
  box-shadow: 2px 0 6px rgba(0, 21, 41, .15); /* 添加阴影效果 */
}

.logo-container {
  height: 60px; /* 增加高度 */
  padding: 10px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-container h1 {
  color: #fff;
  font-size: 20px; /* 增大字体 */
  margin: 0;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f0f2f5; /* 设置背景色 */
}

.navbar {
  height: 60px; /* 增加高度 */
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.right-menu {
  margin-left: auto;
}

.app-main {
  flex: 1;
  overflow: auto;
  padding: 20px;
  background-color: #f0f2f5;
}

/* 添加内容容器样式 */
:deep(.app-container) {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  margin-bottom: 20px;
}
</style>