<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input-number
        v-model="threshold"
        :min="1"
        :max="1000"
        placeholder="库存阈值"
        style="width: 200px;"
        class="filter-item"
      />
      <el-button
        class="filter-item"
        type="primary"
        icon="Search"
        @click="fetchLowStockMaterials"
      >查询</el-button>
    </div>

    <el-alert
      title="库存预警列表"
      type="warning"
      :closable="false"
      description="以下物资库存低于设定阈值，请及时补充库存"
    />

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading..."
      border
      fit
      highlight-current-row
    >
      <el-table-column label="ID" prop="id" align="center" width="80" />
      <el-table-column label="物资名称" prop="name" align="center" />
      <el-table-column label="规格型号" prop="model" align="center" />
      <el-table-column label="单位" prop="unit" align="center" width="80" />
      <el-table-column label="单价" prop="price" align="center" width="100">
        <template #default="{row}">
          {{ row.price ? `¥${row.price}` : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="库存" prop="stock" align="center" width="100">
        <template #default="{row}">
          <el-tag type="danger">{{ row.stock }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="分类" prop="categoryName" align="center" />
      <el-table-column label="操作" align="center" width="150">
        <template #default="{row}">
          <el-button
            type="success"
            size="small"
            @click="handleStock(row)"
          >入库</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 库存操作对话框 -->
    <el-dialog
      title="库存入库操作"
      v-model="stockDialogVisible"
    >
      <el-form
        ref="stockFormRef"
        :rules="stockRules"
        :model="stockForm"
        label-position="left"
        label-width="120px"
      >
        <el-form-item label="物资名称">
          <span>{{ currentMaterial.name }}</span>
        </el-form-item>
        <el-form-item label="当前库存">
          <span>{{ currentMaterial.stock }}</span>
        </el-form-item>
        <el-form-item label="入库数量" prop="quantity">
          <el-input-number 
            v-model="stockForm.quantity" 
            :min="0.01" 
            :precision="2" 
            style="width: 100%" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="stockDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitStockUpdate">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getLowStockMaterials, updateStock } from '@/api/material'
import { ElMessage } from 'element-plus'

// 列表数据
const list = ref([])
const listLoading = ref(true)
const stockFormRef = ref(null)

// 库存阈值
const threshold = ref(100)

// 库存操作表单
const stockForm = reactive({
  materialId: undefined,
  operation: 'IN',
  quantity: 1
})

// 当前操作的物资
const currentMaterial = reactive({
  id: undefined,
  name: '',
  stock: 0
})

// 库存操作校验规则
const stockRules = {
  quantity: [{ required: true, message: '请输入入库数量', trigger: 'blur' }]
}

// 对话框状态
const stockDialogVisible = ref(false)

// 获取低库存物资列表
const fetchLowStockMaterials = async () => {
  listLoading.value = true
  try {
    const response = await getLowStockMaterials({ threshold: threshold.value })
    list.value = response.data || []
  } catch (error) {
    console.error('获取低库存物资列表失败:', error)
  } finally {
    listLoading.value = false
  }
}

// 库存操作
const handleStock = (row) => {
  Object.assign(currentMaterial, {
    id: row.id,
    name: row.name,
    stock: row.stock
  })
  Object.assign(stockForm, {
    materialId: row.id,
    operation: 'IN',
    quantity: 1
  })
  stockDialogVisible.value = true
  // 下一帧执行，确保DOM更新后再设置焦点
  setTimeout(() => {
    if (stockFormRef.value) {
      stockFormRef.value.clearValidate()
    }
  }, 0)
}

// 提交库存更新
const submitStockUpdate = async () => {
  try {
    await stockFormRef.value.validate()
    const response = await updateStock({
      materialId: stockForm.materialId,
      quantity: stockForm.quantity,
      operation: 'IN'
    })
    if (response.code === 200) {
      stockDialogVisible.value = false
      ElMessage({
        message: '入库成功',
        type: 'success'
      })
      fetchLowStockMaterials()
    }
  } catch (error) {
    console.error('库存操作失败:', error)
  }
}

// 初始化
onMounted(() => {
  fetchLowStockMaterials()
})
</script>

<style scoped>
.app-container {
  min-height: calc(100vh - 140px);
}

.filter-container {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-item {
  margin-right: 10px;
}

.el-alert {
  margin-bottom: 20px;
}

:deep(.el-table) {
  width: 100%;
  margin-bottom: 20px;
}

:deep(.el-button) {
  margin-left: 5px;
}

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