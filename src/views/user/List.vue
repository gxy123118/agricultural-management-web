<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.username"
        placeholder="用户名"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter="handleFilter"
      />
      <el-button
        class="filter-item"
        type="primary"
        icon="Search"
        @click="handleFilter"
      >搜索</el-button>
      <el-button
        class="filter-item"
        type="primary"
        icon="Plus"
        @click="handleCreate"
      >添加</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading..."
      border
      fit
      highlight-current-row
    >
      <el-table-column label="ID" prop="id" align="center" width="80" />
      <el-table-column label="用户名" prop="username" align="center" />
      <el-table-column label="真实姓名" prop="realName" align="center" />
      <el-table-column label="电话" prop="phone" align="center" />
      <el-table-column label="邮箱" prop="email" align="center" />
      <el-table-column label="角色" prop="roleName" align="center" />
      <el-table-column label="备注" prop="remark" align="center" />
      <el-table-column label="操作" align="center" width="230">
        <template #default="{row}">
          <el-button
            v-if="isAdmin"
            type="primary"
            size="small"
            @click="handleUpdate(row)"
          >编辑</el-button>
          <el-button
            v-if="isAdmin"
            type="danger"
            size="small"
            @click="handleDelete(row)"
          >删除</el-button>
          <span v-else class="permission-tip">无操作权限</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="listQuery.pageNum"
        v-model:page-size="listQuery.pageSize"
        :total="total"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 添加或修改用户对话框 -->
    <el-dialog
      :title="dialogStatus === 'create' ? '添加用户' : '编辑用户'"
      v-model="dialogFormVisible"
    >
      <el-form
        ref="dataFormRef"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="temp.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogStatus === 'create'">
          <el-input v-model="temp.password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="temp.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="temp.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="temp.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="temp.roleId" placeholder="请选择角色">
            <el-option label="管理员" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="temp.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { listUsers, addUser, updateUser, deleteUser } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'

// 获取用户store
const userStore = useUserStore()

// 判断当前用户是否为管理员
const isAdmin = computed(() => {
  return userStore.userInfo && userStore.userInfo.roleId === 1
})

// 列表数据
const list = ref([])
const total = ref(0)
const listLoading = ref(true)
const dataFormRef = ref(null)

// 查询参数
const listQuery = reactive({
  pageNum: 1,
  pageSize: 10,
  username: ''
})

// 表单数据
const temp = reactive({
  id: undefined,
  username: '',
  password: '',
  realName: '',
  phone: '',
  email: '',
  roleId: undefined,
  remark: ''
})

// 表单校验规则
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }]
}

// 对话框状态
const dialogFormVisible = ref(false)
const dialogStatus = ref('')

// 获取用户列表
const getList = async () => {
  listLoading.value = true
  try {
    const response = await listUsers(listQuery)
    list.value = response.data.records
    total.value = response.data.total
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    listLoading.value = false
  }
}

// 搜索
const handleFilter = () => {
  listQuery.pageNum = 1
  getList()
}

// 处理页码变化
const handleSizeChange = (val) => {
  listQuery.pageSize = val
  getList()
}

const handleCurrentChange = (val) => {
  listQuery.pageNum = val
  getList()
}

// 重置表单
const resetTemp = () => {
  Object.assign(temp, {
    id: undefined,
    username: '',
    password: '',
    realName: '',
    phone: '',
    email: '',
    roleId: undefined,
    remark: ''
  })
}

// 添加用户
const handleCreate = () => {
  // 检查权限
  if (!isAdmin.value) {
    ElMessage({
      message: '只有超级管理员才能添加用户',
      type: 'warning'
    })
    return
  }
  
  resetTemp()
  dialogStatus.value = 'create'
  dialogFormVisible.value = true
  // 下一帧执行，确保DOM更新后再设置焦点
  setTimeout(() => {
    if (dataFormRef.value) {
      dataFormRef.value.clearValidate()
    }
  }, 0)
}

// 提交添加
const createData = async () => {
  try {
    await dataFormRef.value.validate()
    const response = await addUser(temp)
    if (response.code === 200 && response.data) {
      dialogFormVisible.value = false
      ElMessage({
        message: '添加成功',
        type: 'success'
      })
      getList()
    }
  } catch (error) {
    console.error('添加用户失败:', error)
  }
}

// 编辑用户
const handleUpdate = (row) => {
  Object.assign(temp, { ...row })
  dialogStatus.value = 'update'
  dialogFormVisible.value = true
  // 下一帧执行，确保DOM更新后再设置焦点
  setTimeout(() => {
    if (dataFormRef.value) {
      dataFormRef.value.clearValidate()
    }
  }, 0)
}

// 提交更新
const updateData = async () => {
  try {
    await dataFormRef.value.validate()
    const response = await updateUser(temp)
    if (response.code === 200 && response.data) {
      dialogFormVisible.value = false
      ElMessage({
        message: '更新成功',
        type: 'success'
      })
      getList()
    }
  } catch (error) {
    console.error('更新用户失败:', error)
  }
}

// 删除用户
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该用户吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await deleteUser(row.id)
      if (response.code === 200 && response.data) {
        ElMessage({
          message: '删除成功',
          type: 'success'
        })
        getList()
      }
    } catch (error) {
      console.error('删除用户失败:', error)
    }
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消删除'
    })
  })
}

// 初始化
onMounted(() => {
  getList()
})
</script>

<!-- 在<style>标签中添加以下样式 -->
<style scoped>
.app-container {
  min-height: calc(100vh - 140px); /* 减去navbar和padding的高度 */
}

.filter-container {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px; /* 添加间距 */
}

.filter-item {
  margin-right: 10px;
}

/* 表格样式优化 */
:deep(.el-table) {
  width: 100%;
  margin-bottom: 20px;
}

:deep(.el-button) {
  margin-left: 5px;
}

/* 权限提示样式 */
.permission-tip {
  color: #909399;
  font-size: 14px;
}
</style>