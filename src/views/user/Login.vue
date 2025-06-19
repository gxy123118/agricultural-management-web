<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-left">
        <!-- 左侧可以放置一些装饰内容或留空 -->
      </div>
      <div class="login-right">
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          auto-complete="on"
          label-position="left"
        >
          <div class="title-container">
            <h3 class="title">农资管理系统</h3>
          </div>

          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="用户名"
              type="text"
              auto-complete="on"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              placeholder="密码"
              :type="passwordVisible ? 'text' : 'password'"
              auto-complete="on"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
              <template #suffix>
                <el-icon @click="passwordVisible = !passwordVisible">
                  <View v-if="passwordVisible" />
                  <Hide v-else />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-button
            :loading="loading"
            type="primary"
            style="width: 100%; margin-bottom: 30px"
            @click="handleLogin"
          >登录</el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { User, Lock, View, Hide } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)
const passwordVisible = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
    loading.value = true
    const res = await userStore.login(loginForm)
    if (res.code === 200) {
      ElMessage.success('登录成功')
      router.push('/dashboard')
    }
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  width: 100%;
  background-image: url('/image.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-content {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
}

.login-left {
  flex: 1;
  /* 左侧区域，可以添加装饰内容 */
}

.login-right {
  width: 450px;
  padding: 0 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-form {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.title-container {
  margin-bottom: 30px;
  text-align: center;
}

.title {
  font-size: 28px;
  color: #333;
  margin: 0;
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-content {
    flex-direction: column;
    padding: 20px;
  }
  
  .login-left {
    display: none;
  }
  
  .login-right {
    width: 100%;
    padding: 0;
  }
  
  .login-form {
    margin: 0 auto;
  }
}
</style>