<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        placeholder="账户名称"
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
      <el-table-column label="账户名称" prop="name" align="center" />
      <el-table-column label="账号" prop="serialNo" align="center" />
      <el-table-column label="初始金额" align="center">
        <template #default="{row}">
          {{ row.initialAmount ? row.initialAmount.toFixed(2) : '0.00' }}
        </template>
      </el-table-column>
      <el-table-column label="当前金额" align="center">
        <template #default="{row}">
          {{ row.currentAmount ? row.currentAmount.toFixed(2) : '0.00' }}
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" align="center" />
      <el-table-column label="默认账户" align="center" width="100">
        <template #default="{row}">
          <el-tag v-if="row.isDefault" type="success">是</el-tag>
          <el-tag v-else type="info">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="280">
        <template #default="{row}">
          <el-button
            type="primary"
            size="small"
            @click="handleUpdate(row)"
          >编辑</el-button>
          <el-button
            v-if="!row.isDefault"
            type="success"
            size="small"
            @click="handleSetDefault(row)"
          >设为默认</el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="listQuery.current"
        v-model:page-size="listQuery.size"
        :total="total"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 添加或修改账户对话框 -->
    <el-dialog
      :title="dialogStatus === 'create' ? '添加账户' : '编辑账户'"
      v-model="dialogFormVisible"
    >
      <el-form
        ref="dataFormRef"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
      >
        <el-form-item label="账户名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入账户名称" />
        </el-form-item>
        <el-form-item label="账号" prop="serialNo">
          <el-input v-model="temp.serialNo" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="初始金额" prop="initialAmount">
          <el-input-number v-model="temp.initialAmount" :precision="2" :step="100" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="当前金额" prop="currentAmount">
          <el-input-number v-model="temp.currentAmount" :precision="2" :step="100" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="默认账户" prop="isDefault">
          <el-switch v-model="temp.isDefault" />
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
import { ref, reactive, onMounted } from 'vue'
import { listAccounts, addAccount, updateAccount, deleteAccount, setDefaultAccount } from '@/api/account'
import { ElMessage, ElMessageBox } from 'element-plus'

// 列表数据
const list = ref([])
const total = ref(0)
const listLoading = ref(true)
const dataFormRef = ref(null)

// 查询参数
const listQuery = reactive({
  current: 1,
  size: 10,
  name: ''
})

// 表单数据
const temp = reactive({
  id: undefined,
  name: '',
  serialNo: '',
  initialAmount: 0,
  currentAmount: 0,
  remark: '',
  isDefault: false
})

// 表单校验规则
const rules = {
  name: [{ required: true, message: '请输入账户名称', trigger: 'blur' }],
  initialAmount: [{ required: true, message: '请输入初始金额', trigger: 'blur' }],
  currentAmount: [{ required: true, message: '请输入当前金额', trigger: 'blur' }]
}

// 对话框状态
const dialogFormVisible = ref(false)
const dialogStatus = ref('')

// 获取账户列表
const getList = async () => {
  listLoading.value = true
  try {
    const response = await listAccounts(listQuery)
    list.value = response.data.records
    total.value = response.data.total
  } catch (error) {
    console.error('获取账户列表失败:', error)
  } finally {
    listLoading.value = false
  }
}

// 搜索
const handleFilter = () => {
  listQuery.current = 1
  getList()
}

// 处理页码变化
const handleSizeChange = (val) => {
  listQuery.size = val
  getList()
}

const handleCurrentChange = (val) => {
  listQuery.current = val
  getList()
}

// 重置表单
const resetTemp = () => {
  Object.assign(temp, {
    id: undefined,
    name: '',
    serialNo: '',
    initialAmount: 0,
    currentAmount: 0,
    remark: '',
    isDefault: false
  })
}

// 添加账户
const handleCreate = () => {
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
    const response = await addAccount(temp)
    if (response.code === 200 && response.data) {
      dialogFormVisible.value = false
      ElMessage({
        message: '添加成功',
        type: 'success'
      })
      getList()
    }
  } catch (error) {
    console.error('添加账户失败:', error)
  }
}

// 编辑账户
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
    const response = await updateAccount(temp)
    if (response.code === 200 && response.data) {
      dialogFormVisible.value = false
      ElMessage({
        message: '更新成功',
        type: 'success'
      })
      getList()
    }
  } catch (error) {
    console.error('更新账户失败:', error)
  }
}

// 设置默认账户
const handleSetDefault = (row) => {
  ElMessageBox.confirm('确认将该账户设为默认账户吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await setDefaultAccount(row.id)
      if (response.code === 200 && response.data) {
        ElMessage({
          message: '设置成功',
          type: 'success'
        })
        getList()
      }
    } catch (error) {
      console.error('设置默认账户失败:', error)
    }
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消设置'
    })
  })
}

// 删除账户
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该账户吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await deleteAccount(row.id)
      if (response.code === 200 && response.data) {
        ElMessage({
          message: '删除成功',
          type: 'success'
        })
        getList()
      }
    } catch (error) {
      console.error('删除账户失败:', error)
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
</style>