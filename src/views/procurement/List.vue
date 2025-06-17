<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.billNo"
        placeholder="单据编号"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter="handleFilter"
      />
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        class="filter-item"
        style="width: 350px"
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
      <el-table-column label="单据编号" prop="billNo" align="center" />
      <el-table-column label="供应商" prop="organName" align="center" />
      <el-table-column label="经手人" prop="handsPersonName" align="center" />
      <el-table-column label="采购金额" prop="totalPrice" align="center">
        <template #default="{row}">
          {{ row.totalPrice ? `¥${row.totalPrice}` : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="单据日期" prop="billTime" align="center">
        <template #default="{row}">
          {{ formatDate(row.billTime) }}
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" align="center" />
      <el-table-column label="操作" align="center" width="230">
        <template #default="{row}">
          <el-button
            type="primary"
            size="small"
            @click="handleDetail(row)"
          >详情</el-button>
          <el-button
            type="warning"
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

    <!-- 采购详情对话框 -->
    <el-dialog
      title="采购详情"
      v-model="detailDialogVisible"
      width="800px"
    >
      <div v-if="currentProcurement.id" class="detail-container">
        <div class="detail-header">
          <div class="detail-item">
            <span class="label">单据编号:</span>
            <span class="value">{{ currentProcurement.billNo }}</span>
          </div>
          <div class="detail-item">
            <span class="label">供应商:</span>
            <span class="value">{{ currentProcurement.organName }}</span>
          </div>
          <div class="detail-item">
            <span class="label">经手人:</span>
            <span class="value">{{ currentProcurement.handsPersonName }}</span>
          </div>
          <div class="detail-item">
            <span class="label">单据日期:</span>
            <span class="value">{{ formatDate(currentProcurement.billTime) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">采购金额:</span>
            <span class="value">¥{{ currentProcurement.totalPrice }}</span>
          </div>
          <div class="detail-item">
            <span class="label">备注:</span>
            <span class="value">{{ currentProcurement.remark || '-' }}</span>
          </div>
        </div>
        
        <div class="detail-items">
          <h3>采购明细</h3>
          <el-table :data="currentProcurement.items" border>
            <el-table-column label="物资名称" prop="materialName" align="center" />
            <el-table-column label="数量" prop="eachAmount" align="center" />
            <el-table-column label="备注" prop="remark" align="center" />
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 添加或修改采购对话框 -->
    <el-dialog
      :title="dialogStatus === 'create' ? '添加采购记录' : '编辑采购记录'"
      v-model="dialogFormVisible"
      width="800px"
    >
      <el-form
        ref="dataFormRef"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="120px"
      >
        <el-form-item label="单据编号" prop="billNo">
          <el-input v-model="temp.billNo" placeholder="请输入单据编号" />
        </el-form-item>
        <el-form-item label="供应商" prop="organId">
          <el-select v-model="temp.organId" placeholder="请选择供应商" style="width: 100%">
            <el-option
              v-for="item in supplierOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="经手人" prop="handsPersonId">
          <el-select v-model="temp.handsPersonId" placeholder="请选择经手人" style="width: 100%">
            <el-option
              v-for="item in userOptions"
              :key="item.id"
              :label="item.realName || item.username"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="结算账户" prop="accountId">
          <el-select v-model="temp.accountId" placeholder="请选择结算账户" style="width: 100%">
            <el-option
              v-for="item in accountOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="单据日期" prop="billTime">
          <el-date-picker
            v-model="temp.billTime"
            type="datetime"
            placeholder="选择日期时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="采购金额" prop="totalPrice">
          <el-input-number v-model="temp.totalPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="temp.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
        
        <div class="items-container">
          <div class="items-header">
            <h3>采购明细</h3>
            <el-button type="primary" size="small" @click="addItem">添加明细</el-button>
          </div>
          
          <el-table :data="temp.items" border>
            <el-table-column label="物资" align="center">
              <template #default="{row, $index}">
                <el-select v-model="row.inoutItemId" placeholder="选择物资" style="width: 100%">
                  <el-option
                    v-for="item in materialOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="数量" align="center" width="150">
              <template #default="{row}">
                <el-input-number v-model="row.eachAmount" :min="0.01" :precision="2" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column label="备注" align="center">
              <template #default="{row}">
                <el-input v-model="row.remark" placeholder="备注" />
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="100">
              <template #default="{$index}">
                <el-button type="danger" size="small" @click="removeItem($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
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
import { 
  createProcurement, 
  updateProcurement, 
  deleteProcurement, 
  getProcurementPage, 
  getProcurementDetail 
} from '@/api/procurement'
import { listSuppliers } from '@/api/supplier'
import { listUsers } from '@/api/user'
import { listAccounts } from '@/api/account'
import { getMaterialPage } from '@/api/material'
import { ElMessage, ElMessageBox } from 'element-plus'

// 列表数据
const list = ref([])
const total = ref(0)
const listLoading = ref(true)
const dataFormRef = ref(null)

// 日期范围
const dateRange = ref([])

// 查询参数
const listQuery = reactive({
  current: 1,
  size: 10,
  billNo: '',
  startDate: '',
  endDate: ''
})

// 选项数据
const supplierOptions = ref([])
const userOptions = ref([])
const accountOptions = ref([])
const materialOptions = ref([])

// 表单数据
const temp = reactive({
  id: undefined,
  type: 'PROCUREMENT', // 采购类型
  organId: undefined,
  handsPersonId: undefined,
  changeAmount: 0,
  totalPrice: 0,
  accountId: undefined,
  billNo: '',
  billTime: new Date(),
  remark: '',
  items: []
})

// 当前查看的采购记录
const currentProcurement = reactive({
  id: undefined,
  billNo: '',
  organName: '',
  handsPersonName: '',
  totalPrice: 0,
  billTime: '',
  remark: '',
  items: []
})

// 表单校验规则
const rules = {
  billNo: [{ required: true, message: '请输入单据编号', trigger: 'blur' }],
  organId: [{ required: true, message: '请选择供应商', trigger: 'change' }],
  handsPersonId: [{ required: true, message: '请选择经手人', trigger: 'change' }],
  accountId: [{ required: true, message: '请选择结算账户', trigger: 'change' }],
  billTime: [{ required: true, message: '请选择单据日期', trigger: 'change' }],
  totalPrice: [{ required: true, message: '请输入采购金额', trigger: 'blur' }]
}

// 对话框状态
const dialogFormVisible = ref(false)
const detailDialogVisible = ref(false)
const dialogStatus = ref('')

// 监听日期范围变化
const watchDateRange = computed(() => {
  if (dateRange.value && dateRange.value.length === 2) {
    listQuery.startDate = dateRange.value[0]
    listQuery.endDate = dateRange.value[1]
  } else {
    listQuery.startDate = ''
    listQuery.endDate = ''
  }
  return dateRange.value
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 获取采购记录列表
const getList = async () => {
  listLoading.value = true
  try {
    const response = await getProcurementPage(listQuery)
    list.value = response.data.records
    total.value = response.data.total
  } catch (error) {
    console.error('获取采购记录列表失败:', error)
  } finally {
    listLoading.value = false
  }
}

// 获取供应商选项
const getSupplierOptions = async () => {
  try {
    const response = await listSuppliers({ current: 1, size: 100 })
    supplierOptions.value = response.data.records || []
  } catch (error) {
    console.error('获取供应商选项失败:', error)
  }
}

// 获取用户选项
const getUserOptions = async () => {
  try {
    const response = await listUsers({ current: 1, size: 100 })
    userOptions.value = response.data.records || []
  } catch (error) {
    console.error('获取用户选项失败:', error)
  }
}

// 获取账户选项
const getAccountOptions = async () => {
  try {
    const response = await listAccounts({ current: 1, size: 100 })
    accountOptions.value = response.data.records || []
  } catch (error) {
    console.error('获取账户选项失败:', error)
  }
}

// 获取物资选项
const getMaterialOptions = async () => {
  try {
    const response = await getMaterialPage({ current: 1, size: 100 })
    materialOptions.value = response.data.records || []
  } catch (error) {
    console.error('获取物资选项失败:', error)
  }
}

// 搜索
const handleFilter = () => {
  listQuery.current = 1
  // 确保日期范围参数被正确设置
  if (dateRange.value && dateRange.value.length === 2) {
    listQuery.startDate = dateRange.value[0]
    listQuery.endDate = dateRange.value[1]
  } else {
    listQuery.startDate = ''
    listQuery.endDate = ''
  }
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
    type: 'PROCUREMENT',
    organId: undefined,
    handsPersonId: undefined,
    changeAmount: 0,
    totalPrice: 0,
    accountId: undefined,
    billNo: generateBillNo(),
    billTime: new Date(),
    remark: '',
    items: []
  })
}

// 生成单据编号
const generateBillNo = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `CG${year}${month}${day}${random}`
}

// 添加明细项
const addItem = () => {
  temp.items.push({
    accountId: temp.accountId,
    inoutItemId: undefined,
    eachAmount: 1,
    remark: ''
  })
}

// 移除明细项
const removeItem = (index) => {
  temp.items.splice(index, 1)
}

// 添加采购记录
const handleCreate = () => {
  resetTemp()
  addItem() // 默认添加一个明细项
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
    
    // 验证明细项
    if (temp.items.length === 0) {
      ElMessage.warning('请至少添加一个采购明细项')
      return
    }
    
    for (const item of temp.items) {
      if (!item.inoutItemId) {
        ElMessage.warning('请选择采购物资')
        return
      }
      if (!item.eachAmount || item.eachAmount <= 0) {
        ElMessage.warning('请输入有效的采购数量')
        return
      }
    }
    
    const response = await createProcurement(temp)
    if (response.code === 200 && response.data) {
      dialogFormVisible.value = false
      ElMessage({
        message: '添加成功',
        type: 'success'
      })
      getList()
    }
  } catch (error) {
    console.error('添加采购记录失败:', error)
  }
}

// 查看详情
const handleDetail = async (row) => {
  try {
    const response = await getProcurementDetail(row.id)
    if (response.code === 200 && response.data) {
      Object.assign(currentProcurement, response.data)
      detailDialogVisible.value = true
    }
  } catch (error) {
    console.error('获取采购详情失败:', error)
  }
}

// 编辑采购记录
const handleUpdate = async (row) => {
  try {
    const response = await getProcurementDetail(row.id)
    if (response.code === 200 && response.data) {
      Object.assign(temp, response.data)
      dialogStatus.value = 'update'
      dialogFormVisible.value = true
      // 下一帧执行，确保DOM更新后再设置焦点
      setTimeout(() => {
        if (dataFormRef.value) {
          dataFormRef.value.clearValidate()
        }
      }, 0)
    }
  } catch (error) {
    console.error('获取采购详情失败:', error)
  }
}

// 提交更新
const updateData = async () => {
  try {
    await dataFormRef.value.validate()
    
    // 验证明细项
    if (temp.items.length === 0) {
      ElMessage.warning('请至少添加一个采购明细项')
      return
    }
    
    for (const item of temp.items) {
      if (!item.inoutItemId) {
        ElMessage.warning('请选择采购物资')
        return
      }
      if (!item.eachAmount || item.eachAmount <= 0) {
        ElMessage.warning('请输入有效的采购数量')
        return
      }
    }
    
    const response = await updateProcurement(temp.id, temp)
    if (response.code === 200 && response.data) {
      dialogFormVisible.value = false
      ElMessage({
        message: '更新成功',
        type: 'success'
      })
      getList()
    }
  } catch (error) {
    console.error('更新采购记录失败:', error)
  }
}

// 删除采购记录
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该采购记录吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await deleteProcurement(row.id)
      if (response.code === 200 && response.data) {
        ElMessage({
          message: '删除成功',
          type: 'success'
        })
        getList()
      }
    } catch (error) {
      console.error('删除采购记录失败:', error)
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
  getSupplierOptions()
  getUserOptions()
  getAccountOptions()
  getMaterialOptions()
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

/* 详情样式 */
.detail-container {
  padding: 10px;
}

.detail-header {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
}

.detail-item .label {
  font-weight: bold;
  width: 100px;
}

.detail-items {
  margin-top: 20px;
}

.items-container {
  margin-top: 20px;
}

.items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

@media (min-width: 768px) {
  :deep(.el-dialog) {
    width: 800px;
  }
}
</style>