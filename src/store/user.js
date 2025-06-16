import { defineStore } from 'pinia'
import { login as loginApi } from '@/api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')
  }),
  actions: {
    // 登录
    async login(userInfo) {
      try {
        const response = await loginApi(userInfo)
        if (response.data) {
          this.token = response.data.token || 'mock-token'
          this.userInfo = response.data
          localStorage.setItem('token', this.token)
          localStorage.setItem('userInfo', JSON.stringify(response.data))
        }
        return response
      } catch (error) {
        return Promise.reject(error)
      }
    },
    // 登出
    logout() {
      this.token = ''
      this.userInfo = {}
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }
})