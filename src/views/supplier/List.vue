<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.supplier"
        placeholder="供应商名称"
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
    > <el-table-column label="ID" prop="id" align="center" width="80" />
      <el-table-column label="供应商名称" prop="name" align="center" />  
      <el-table-column label="联系人" prop="contact" align="center" />
      <el-table-column label="电话" prop="phone" align="center" />
      <el-table-column label="描述" prop="remark" align="center" />
      <el-table-column label="地址" prop="address" align="center" />
      <el-table-column label="操作" align="center" width="230">
        <template #default="{row}">
          <el-button
            type="primary"
            size="small"
            @click="handleUpdate(row)"
          >编辑</el-button>
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

    <!-- 添加或修改供应商对话框 -->
    <el-dialog
      :title="dialogStatus === 'create' ? '添加供应商' : '编辑供应商'"
      v-model="dialogFormVisible"
    >
      <el-form
        ref="dataFormRef"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="120px"
      >
        <el-form-item label="供应商名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入供应商名称" />
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="temp.contact" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="temp.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="temp.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="描述" prop="remark">
          <el-input v-model="temp.remark" type="textarea" placeholder="请输入描述" />
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
import { listSuppliers, addSupplier, updateSupplier, deleteSupplier } from '@/api/supplier'
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
  supplier: ''
})

// 表单数据
const temp = reactive({
  id: undefined,
  name: '',
  contact: '',
  phone: '',
  remark: '',
  address: '',
  sort: 0
})

// 表单校验规则
const rules = {
  name: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入电话', trigger: 'blur' }]
}

// 对话框状态
const dialogFormVisible = ref(false)
const dialogStatus = ref('')

// 获取供应商列表
const getList = async () => {
  listLoading.value = true
  try {
    const response = await listSuppliers(listQuery)
    list.value = response.data.records
    total.value = response.data.total
  } catch (error) {
    console.error('获取供应商列表失败:', error)
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
    contact: '',
    phone: '',
    remark: '',
    address: '',
    sort: 0
  })
}

// 添加供应商
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
    const response = await addSupplier(temp)
    if (response.code === 200 && response.data) {
      dialogFormVisible.value = false
      ElMessage({
        message: '添加成功',
        type: 'success'
      })
      getList()
    }
  } catch (error) {
    console.error('添加供应商失败:', error)
  }
}

// 编辑供应商
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
    const response = await updateSupplier(temp)
    if (response.code === 200 && response.data) {
      dialogFormVisible.value = false
      ElMessage({
        message: '更新成功',
        type: 'success'
      })
      getList()
    }
  } catch (error) {
    console.error('更新供应商失败:', error)
  }
}

// 删除供应商
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该供应商吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await deleteSupplier(row.id)
      if (response.code === 200 && response.data) {
        ElMessage({
          message: '删除成功',
          type: 'success'
        })
        getList()
      }
    } catch (error) {
      console.error('删除供应商失败:', error)
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

/* 表单样式优化 */
:deep(.el-dialog) {
  max-width: 90%;
  margin: 0 auto;
}

@media (min-width: 768px) {
  :deep(.el-dialog) {
    width: 700px;
  }
}
</style>