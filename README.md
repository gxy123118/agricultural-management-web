农资管理系统前端技术文档

1. 项目概述

本项目是一个基于 Vue 3 的农资管理系统前端应用，使用 Vite 作为构建工具。它利用 Element Plus 作为 UI 组件库，Pinia 进行状态管理，并使用 Vue Router 处理路由。

2. 技术栈

- 框架: Vue.js v3.5.13
- 构建工具: Vite v6.2.4
- 路由: Vue Router v4.5.1
- 状态管理: Pinia v3.0.3
- UI 组件库: Element Plus v2.10.2
- HTTP 请求: Axios v1.9.0
- 图表: ECharts v5.6.0

3. 项目结构

.
├── public/                # 静态资源
├── src/
│   ├── api/               # API 请求模块
│   ├── assets/            # 静态资源 (CSS, images)
│   ├── components/        # 公共组件
│   ├── layout/            # 布局组件
│   ├── router/            # 路由配置
│   ├── store/             # 状态管理 (Pinia)
│   ├── utils/             # 工具函数 (request.js)
│   ├── views/             # 页面视图组件
│   ├── App.vue            # 根组件
│   └── main.js            # 应用入口文件
├── .gitignore
├── index.html             # HTML 入口文件
├── package.json           # 项目依赖和脚本
└── vite.config.js         # Vite 配置文件

4. 关键模块分析

4.1. 应用入口 (src/main.js)

应用在 src/main.js 中初始化。它执行以下操作：
- 导入全局 CSS。
- 创建 Vue 应用实例。
- 注册 Vue Router、Pinia 和 Element Plus 插件。
- 将应用挂载到 index.html 中的 #app 元素上。

4.2. 路由管理 (src/router/index.js)

路由配置位于 src/router/index.js。主要特点如下：
- 使用 createRouter 和 createWebHistory 创建路由实例。
- 路由采用懒加载方式导入视图组件，以优化初始加载性能。
- 包含一个全局前置守卫 (beforeEach)，用于实现路由权限控制。在切换路由前，它会检查本地存储中是否存在 token，如果不存在且目标路径不是登录页，则会重定向到登录页。
- 定义了多个模块化路由，如用户管理、物资管理、仓库管理、采购管理、销售管理和财务统计等。

4.3. 状态管理 (src/store)

项目使用 Pinia 进行状态管理。
- src/store/index.js: 创建并导出一个全局的 Pinia 实例。
- src/store/user.js: 定义了一个 user store，用于管理用户信息和认证状态。
  - state: 存储 token 和 userInfo，并从 localStorage 中初始化。
  - actions: 包含 login 和 logout 两个异步 action，分别用于处理用户登录和登出逻辑，并同步更新 localStorage。

4.4. 网络请求 (src/utils/request.js)

网络请求通过 Axios 封装在 src/utils/request.js 中。
- 请求拦截器: 在每个请求发送前，会从 localStorage 中获取 satoken 并添加到请求头中，用于身份验证。
- 响应拦截器: 
  - 对响应数据进行预处理，只返回 data 部分。
  - 统一处理请求错误。如果响应状态码不是 200，会通过 ElMessage 显示错误信息。
  - 特别处理 401 未授权错误，清除本地 token 并提示用户重新登录。

4.5. 构建配置 (vite.config.js)

项目的构建配置在 vite.config.js 中定义。
- 代理: 配置了一个 /api 的代理，将所有匹配的请求转发到 http://localhost:8181，以解决开发过程中的跨域问题。
- 插件: 
  - @vitejs/plugin-vue: 提供 Vue 3 单文件组件支持。
  - vite-plugin-vue-devtools: 集成 Vue DevTools，方便开发调试。
- 别名: 设置了 @ 别名，指向 src 目录，方便模块导入。

5. 启动与构建

- 开发模式: 运行 npm run dev 启动开发服务器。
- 生产构建: 运行 npm run build 将项目打包到 dist 目录。
- 预览构建: 运行 npm run preview 在本地预览生产构建后的应用。
