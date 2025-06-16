<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        placeholder="物资名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter="handleFilter"
      />
      <el-select
        v-model="listQuery.categoryId"
        placeholder="物资分类"
        clearable
        style="width: 200px"
        class="filter-item"
      >
        <el-option
          v-for="item in categoryOptions"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
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
      <el-table-column label="物资名称" prop="name" align="center" />
      <el-table-column label="规格型号" prop="model" align="center" />
      <el-table-column label="标准" prop="standard" align="center" />
      <el-table-column label="颜色" prop="color" align="center" />
      <el-table-column label="单位" prop="unit" align="center" width="80" />
      <el-table-column label="单价" prop="price" align="center" width="100">
        <template #default="{row}">
          {{ row.price ? `¥${row.price}` : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="库存" prop="stock" align="center" width="100">
        <template #default="{row}">
          <el-tag :type="row.stock < 10 ? 'danger' : 'success'">{{ row.stock }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="分类" prop="categoryName" align="center" />
      <el-table-column label="操作" align="center" width="280">
        <template #default="{row}">
          <el-button
            type="primary"
            size="small"
            @click="handleUpdate(row)"
          >编辑</el-button>
          <el-button
            type="success"
            size="small"
            @click="handleStock(row)"
          >库存</el-button>
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

    <!-- 添加或修改物资对话框 -->
    <el-dialog
      :title="dialogStatus === 'create' ? '添加物资' : '编辑物资'"
      v-model="dialogFormVisible"
    >
      <el-form
        ref="dataFormRef"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="120px"
      >
        <el-form-item label="物资名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入物资名称" />
        </el-form-item>
        <el-form-item label="物资分类" prop="categoryId">
          <el-select v-model="temp.categoryId" placeholder="请选择物资分类" style="width: 100%">
            <el-option
              v-for="item in categoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="规格型号" prop="model">
          <el-input v-model="temp.model" placeholder="请输入规格型号" />
        </el-form-item>
        <el-form-item label="标准" prop="standard">
          <el-input v-model="temp.standard" placeholder="请输入标准" />
        </el-form-item>
        <el-form-item label="颜色" prop="color">
          <el-input v-model="temp.color" placeholder="请输入颜色" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="temp.unit" placeholder="请输入单位" />
        </el-form-item>
        <el-form-item label="单价" prop="price">
          <el-input-number v-model="temp.price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="temp.stock" :min="0" :precision="2" style="width: 100%" />
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

    <!-- 库存操作对话框 -->
    <el-dialog
      title="库存操作"
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
        <el-form-item label="操作类型" prop="operation">
          <el-radio-group v-model="stockForm.operation">
            <el-radio label="IN">入库</el-radio>
            <el-radio label="OUT">出库</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="操作数量" prop="quantity">
          <el-input-number 
            v-model="stockForm.quantity" 
            :min="0.01" 
            :max="stockForm.operation === 'OUT' ? currentMaterial.stock : undefined" 
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
import {
  getMaterialPage,
  addMaterial,
  updateMaterial,
  deleteMaterial,
  updateStock
} from '@/api/material'
import { getCategoryTree } from '@/api/material'
import { ElMessage, ElMessageBox } from 'element-plus'

// 列表数据
const list = ref([])
const total = ref(0)
const listLoading = ref(true)
const dataFormRef = ref(null)
const stockFormRef = ref(null)

// 分类选项
const categoryOptions = ref([])

// 查询参数
const listQuery = reactive({
  current: 1,
  size: 10,
  name: '',
  categoryId: undefined
})

// 表单数据
const temp = reactive({
  id: undefined,
  name: '',
  model: '',
  standard: '',
  color: '',
  unit: '',
  price: 0,
  stock: 0,
  categoryId: undefined,
  remark: ''
})

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

// 表单校验规则
const rules = {
  name: [{ required: true, message: '请输入物资名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择物资分类', trigger: 'change' }],
  unit: [{ required: true, message: '请输入单位', trigger: 'blur' }],
  price: [{ required: true, message: '请输入单价', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
}

// 库存操作校验规则
const stockRules = {
  operation: [{ required: true, message: '请选择操作类型', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入操作数量', trigger: 'blur' }]
}

// 对话框状态
const dialogFormVisible = ref(false)
const stockDialogVisible = ref(false)
const dialogStatus = ref('')

// 获取物资列表
const getList = async () => {
  listLoading.value = true
  try {
    const response = await getMaterialPage(listQuery)
    list.value = response.data.records
    total.value = response.data.total
  } catch (error) {
    console.error('获取物资列表失败:', error)
  } finally {
    listLoading.value = false
  }
}

// 获取分类选项
const getCategoryOptions = async () => {
  try {
    const response = await getCategoryTree()
    // 递归提取所有分类
    const extractCategories = (categories, result = []) => {
      categories.forEach(category => {
        result.push({
          id: category.id,
          name: category.name
        })
        if (category.children && category.children.length > 0) {
          extractCategories(category.children, result)
        }
      })
      return result
    }
    categoryOptions.value = extractCategories(response.data || [])
  } catch (error) {
    console.error('获取分类选项失败:', error)
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
    model: '',
    standard: '',
    color: '',
    unit: '',
    price: 0,
    stock: 0,
    categoryId: undefined,
    remark: ''
  })
}

// 添加物资
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
    const response = await addMaterial(temp)
    if (response.code === 200) {
      dialogFormVisible.value = false
      ElMessage({
        message: '添加成功',
        type: 'success'
      })
      getList()
    }
  } catch (error) {
    console.error('添加物资失败:', error)
  }
}

// 编辑物资
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
    const response = await updateMaterial(temp)
    if (response.code === 200) {
      dialogFormVisible.value = false
      ElMessage({
        message: '更新成功',
        type: 'success'
      })
      getList()
    }
  } catch (error) {
    console.error('更新物资失败:', error)
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
      operation: stockForm.operation
    })
    if (response.code === 200) {
      stockDialogVisible.value = false
      ElMessage({
        message: stockForm.operation === 'IN' ? '入库成功' : '出库成功',
        type: 'success'
      })
      getList()
    }
  } catch (error) {
    console.error('库存操作失败:', error)
  }
}

// 删除物资
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该物资吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await deleteMaterial(row.id)
      if (response.code === 200) {
        ElMessage({
          message: '删除成功',
          type: 'success'
        })
        getList()
      }
    } catch (error) {
      console.error('删除物资失败:', error)
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
  getCategoryOptions()
  getList()
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

.pagination-container {
  margin-top: 20px;
  text-align: right;
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