import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/user/Login.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard/index',
    children: [
      {
        path: 'index',
        name: 'DashboardIndex',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'dashboard' }
      }
    ]
  },
  {
    path: '/user',
    component: () => import('@/layout/index.vue'),
    redirect: '/user/list',
    name: 'User',
    meta: { title: '用户管理', icon: 'user' },
    children: [
      {
        path: 'list',
        name: 'UserList',
        component: () => import('@/views/user/List.vue'),
        meta: { title: '用户列表' }
      }
    ]
  },
  // 在现有路由配置中添加农业管理模块路由
  {
    path: '/material',
    component: () => import('@/layout/index.vue'),
    redirect: '/material/category',
    name: 'Material',
    meta: { title: '农业管理', icon: 'goods' },
    children: [
      {
        path: 'category',
        name: 'MaterialCategory',
        component: () => import('@/views/material/Category.vue'),
        meta: { title: '物资分类管理' }
      },
      {
        path: 'list',
        name: 'MaterialList',
        component: () => import('@/views/material/List.vue'),
        meta: { title: '物资信息管理' }
      },
      {
        path: 'low-stock',
        name: 'LowStock',
        component: () => import('@/views/material/LowStock.vue'),
        meta: { title: '库存预警' }
      }
    ]
  },
  {
    path: '/depot',
    component: () => import('@/layout/index.vue'),
    redirect: '/depot/list',
    children: [
      {
        path: 'list',
        name: 'DepotList',
        component: () => import('@/views/depot/List.vue'),
        meta: { title: '仓库管理' }
      }
    ]
  },
  // 在现有路由配置中添加结算账户管理路由
  {
    path: '/account',
    component: () => import('@/layout/index.vue'),
    redirect: '/account/list',
    children: [
      {
        path: 'list',
        name: 'AccountList',
        component: () => import('@/views/account/List.vue'),
        meta: { title: '结算账户管理' }
      }
    ]
  },
  {
    path: '/supplier',
    component: () => import('@/layout/index.vue'),
    redirect: '/supplier/list',
    children: [
      {
        path: 'list',
        name: 'SupplierList',
        component: () => import('@/views/supplier/List.vue'),
        meta: { title: '供应商管理' }
      }
    ]
  },
  // 在现有路由配置中添加农资采购管理路由
  {
    path: '/procurement',
    component: () => import('@/layout/index.vue'),
    redirect: '/procurement/list',
    children: [
      {
        path: 'list',
        name: 'ProcurementList',
        component: () => import('@/views/procurement/List.vue'),
        meta: { title: '采购管理' }
      }
    ]
  },
  // 修复销售管理路由
  {
    path: '/sales',
    component: () => import('@/layout/index.vue'),
    redirect: '/sales/list',
    name: 'Sales',
    meta: { title: '农资销售管理', icon: 'sell' },
    children: [
      {
        path: 'list',
        name: 'SalesList',
        component: () => import('@/views/sales/List.vue'),
        meta: { title: '销售列表' }
      }
    ]
  },
  // 修复统计路由
  {
    path: '/statistics',
    component: () => import('@/layout/index.vue'),
    redirect: '/statistics/financial',
    name: 'Statistics',
    meta: { title: '财务统计', icon: 'chart' },
    children: [
      {
        path: 'financial',
        name: 'FinancialStatistics',
        component: () => import('@/views/statistics/Financial.vue'),
        meta: { title: '财务统计' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router