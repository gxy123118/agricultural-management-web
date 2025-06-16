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
      <el-table-column label="客户" prop="organName" align="center" />
      <el-table-column label="经手人" prop="handsPersonName" align="center" />
      <el-table-column label="销售金额" prop="totalPrice" align="center">
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

    <!-- 销售详情对话框 -->
    <el-dialog
      title="销售详情"
      v-model="detailDialogVisible"
      width="800px"
    >
      <div v-if="currentSales.id" class="detail-container">
        <div class="detail-header">
          <div class="detail-item">
            <span class="label">单据编号:</span>
            <span class="value">{{ currentSales.billNo }}</span>
          </div>
          <div class="detail-item">
            <span class="label">客户:</span>
            <span class="value">{{ currentSales.organName }}</span>
          </div>
          <div class="detail-item">
            <span class="label">经手人:</span>
            <span class="value">{{ currentSales.handsPersonName }}</span>
          </div>
          <div class="detail-item">
            <span class="label">销售金额:</span>
            <span class="value">¥{{ currentSales.totalPrice }}</span>
          </div>
          <div class="detail-item">
            <span class="label">单据日期:</span>
            <span class="value">{{ formatDate(currentSales.billTime) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">备注:</span>
            <span class="value">{{ currentSales.remark || '-' }}</span>
          </div>
        </div>
        
        <div class="detail-items">
          <h4>销售明细</h4>
          <el-table :data="currentSales.items" border>
            <el-table-column label="物料名称" prop="materialName" />
            <el-table-column label="数量" prop="eachAmount" />
            <el-table-column label="备注" prop="remark" />
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 添加/编辑销售对话框 -->
    <el-dialog
      :title="dialogStatus === 'create' ? '添加销售' : '编辑销售'"
      v-model="dialogFormVisible"
      width="800px"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="单据编号" prop="billNo">
              <el-input v-model="temp.billNo" placeholder="请输入单据编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户ID" prop="organId">
              <el-input-number v-model="temp.organId" placeholder="请输入客户ID" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="经手人ID" prop="handsPersonId">
              <el-input-number v-model="temp.handsPersonId" placeholder="请输入经手人ID" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="销售金额" prop="totalPrice">
              <el-input-number v-model="temp.totalPrice" placeholder="请输入销售金额" style="width: 100%" :precision="2" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="账户ID" prop="accountId">
              <el-input-number v-model="temp.accountId" placeholder="请输入账户ID" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单据日期" prop="billTime">
              <el-date-picker
                v-model="temp.billTime"
                type="datetime"
                placeholder="请选择单据日期"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="temp.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
        
        <!-- 销售明细 -->
        <el-form-item label="销售明细">
          <el-button type="primary" size="small" @click="addItem">添加明细</el-button>
          <el-table :data="temp.items" border style="margin-top: 10px">
            <el-table-column label="账户ID" width="120">
              <template #default="{row, $index}">
                <el-input-number v-model="row.accountId" placeholder="账户ID" size="small" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column label="出入库项目ID" width="150">
              <template #default="{row, $index}">
                <el-input-number v-model="row.inoutItemId" placeholder="出入库项目ID" size="small" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column label="数量" width="120">
              <template #default="{row, $index}">
                <el-input-number v-model="row.eachAmount" placeholder="数量" size="small" style="width: 100%" :precision="2" />
              </template>
            </el-table-column>
            <el-table-column label="备注">
              <template #default="{row, $index}">
                <el-input v-model="row.remark" placeholder="备注" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{row, $index}">
                <el-button type="danger" size="small" @click="removeItem($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSalesPage, createSales, updateSales, deleteSales, getSalesDetail } from '@/api/sales'

// 响应式数据
const list = ref([])
const total = ref(0)
const listLoading = ref(false)
const dialogFormVisible = ref(false)
const detailDialogVisible = ref(false)
const dialogStatus = ref('')
const dateRange = ref([])

const listQuery = reactive({
  current: 1,
  size: 10,
  billNo: ''
})

const temp = reactive({
  id: undefined,
  type: 'SALES',
  organId: undefined,
  handsPersonId: undefined,
  changeAmount: 0,
  totalPrice: undefined,
  accountId: undefined,
  billNo: '',
  billTime: '',
  remark: '',
  items: []
})

const currentSales = ref({})

const rules = {
  billNo: [{ required: true, message: '请输入单据编号', trigger: 'blur' }],
  organId: [{ required: true, message: '请输入客户ID', trigger: 'blur' }],
  handsPersonId: [{ required: true, message: '请输入经手人ID', trigger: 'blur' }],
  totalPrice: [{ required: true, message: '请输入销售金额', trigger: 'blur' }],
  accountId: [{ required: true, message: '请输入账户ID', trigger: 'blur' }],
  billTime: [{ required: true, message: '请选择单据日期', trigger: 'change' }]
}

// 方法
const getList = async () => {
  listLoading.value = true
  try {
    const params = { ...listQuery }
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    const response = await getSalesPage(params)
    if (response.data.code === 200) {
      list.value = response.data.data.records
      total.value = response.data.data.total
    }
  } catch (error) {
    console.error('获取销售列表失败:', error)
    ElMessage.error('获取销售列表失败')
  } finally {
    listLoading.value = false
  }
}

const handleFilter = () => {
  listQuery.current = 1
  getList()
}

const handleSizeChange = (val) => {
  listQuery.size = val
  getList()
}

const handleCurrentChange = (val) => {
  listQuery.current = val
  getList()
}

const resetTemp = () => {
  Object.assign(temp, {
    id: undefined,
    type: 'SALES',
    organId: undefined,
    handsPersonId: undefined,
    changeAmount: 0,
    totalPrice: undefined,
    accountId: undefined,
    billNo: '',
    billTime: '',
    remark: '',
    items: []
  })
}

const handleCreate = () => {
  resetTemp()
  dialogStatus.value = 'create'
  dialogFormVisible.value = true
}

const handleUpdate = (row) => {
  Object.assign(temp, row)
  temp.items = row.items || []
  dialogStatus.value = 'update'
  dialogFormVisible.value = true
}

const handleDetail = async (row) => {
  try {
    const response = await getSalesDetail(row.id)
    if (response.data.code === 200) {
      currentSales.value = response.data.data
      detailDialogVisible.value = true
    }
  } catch (error) {
    console.error('获取销售详情失败:', error)
    ElMessage.error('获取销售详情失败')
  }
}

const createData = async () => {
  try {
    const response = await createSales(temp)
    if (response.data.code === 200) {
      ElMessage.success('创建成功')
      dialogFormVisible.value = false
      getList()
    }
  } catch (error) {
    console.error('创建销售失败:', error)
    ElMessage.error('创建销售失败')
  }
}

const updateData = async () => {
  try {
    const response = await updateSales(temp.id, temp)
    if (response.data.code === 200) {
      ElMessage.success('更新成功')
      dialogFormVisible.value = false
      getList()
    }
  } catch (error) {
    console.error('更新销售失败:', error)
    ElMessage.error('更新销售失败')
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('此操作将永久删除该销售记录, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await deleteSales(row.id)
      if (response.data.code === 200) {
        ElMessage.success('删除成功')
        getList()
      }
    } catch (error) {
      console.error('删除销售失败:', error)
      ElMessage.error('删除销售失败')
    }
  })
}

const addItem = () => {
  temp.items.push({
    accountId: undefined,
    inoutItemId: undefined,
    eachAmount: 0,
    remark: ''
  })
}

const removeItem = (index) => {
  temp.items.splice(index, 1)
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  getList()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.filter-item {
  margin-right: 10px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.detail-container {
  padding: 20px;
}

.detail-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
}

.detail-item .label {
  font-weight: bold;
  margin-right: 10px;
  min-width: 80px;
}

.detail-items h4 {
  margin-bottom: 10px;
  color: #409eff;
}
</style>