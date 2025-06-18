import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service = axios.create({
  baseURL: '', // 移除baseURL或设置为空，让请求通过Vite代理
  timeout: 5000 // 请求超时时间
})

service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('satoken') // 改为satoken，与后端配置一致
    if (token) {
      config.headers['satoken'] = token // 使用satoken作为header名称
    }
    return config
  },
  error => {
    // 对请求错误做些什么
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    // 如果返回的状态码不是200，说明接口请求有误
    if (res.code !== 200) {
      // 如果是401未授权，清除token并跳转登录
      if (response.status === 401) {
        localStorage.removeItem('satoken')
        // 这里可以添加跳转到登录页的逻辑
        return Promise.reject(new Error('未授权，请重新登录'))
      }
      ElMessage({
        message: res.message || '请求错误',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error(res.message || '请求错误'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error)
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('satoken')
      ElMessage({
        message: '登录已过期，请重新登录',
        type: 'error',
        duration: 5 * 1000
      })
    } else {
      ElMessage({
        message: error.message,
        type: 'error',
        duration: 5 * 1000
      })
    }
    return Promise.reject(error)
  }
)

export default service