<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="searchQuery"
        placeholder="分类名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter="handleSearch"
      />
      <el-button
        class="filter-item"
        type="primary"
        icon="Search"
        @click="handleSearch"
      >搜索</el-button>
      <el-button
        class="filter-item"
        type="primary"
        icon="Plus"
        @click="handleCreate"
      >添加</el-button>
    </div>

    <el-row :gutter="20">
      <el-col :span="8">
        <div class="category-tree-container">
          <h3>物资分类树</h3>
          <el-tree
            ref="treeRef"
            :data="categoryTree"
            :props="defaultProps"
            node-key="id"
            highlight-current
            default-expand-all
            @node-click="handleNodeClick"
          />
        </div>
      </el-col>
      <el-col :span="16">
        <div class="category-list-container">
          <h3>{{ currentParentName ? `${currentParentName}的子分类` : '所有分类' }}</h3>
          <el-table
            v-loading="listLoading"
            :data="categoryList"
            element-loading-text="Loading..."
            border
            fit
            highlight-current-row
          >
            <el-table-column label="ID" prop="id" align="center" width="80" />
            <el-table-column label="分类名称" prop="name" align="center" />
            <el-table-column label="上级分类" prop="parentName" align="center" />
            <el-table-column label="排序" prop="sort" align="center" width="80" />
            <el-table-column label="备注" prop="remark" align="center" />
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
        </div>
      </el-col>
    </el-row>

    <!-- 添加或修改分类对话框 -->
    <el-dialog
      :title="dialogStatus === 'create' ? '添加分类' : '编辑分类'"
      v-model="dialogFormVisible"
    >
      <el-form
        ref="dataFormRef"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="120px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="上级分类" prop="parentId">
          <el-select v-model="temp.parentId" placeholder="请选择上级分类" style="width: 100%">
            <el-option :value="0" label="无 (顶级分类)" />
            <el-option
              v-for="item in allCategories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="temp.sort" placeholder="请输入排序号" />
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
import {
  getCategoryTree,
  getChildCategories,
  searchCategories,
  addCategory,
  updateCategory,
  deleteCategory
} from '@/api/material'
import { ElMessage, ElMessageBox } from 'element-plus'

// 分类树数据
const categoryTree = ref([])
const defaultProps = {
  children: 'children',
  label: 'name'
}

// 分类列表数据
const categoryList = ref([])
const allCategories = ref([])
const listLoading = ref(false)
const currentParentId = ref(0)
const currentParentName = ref('')
const searchQuery = ref('')
const treeRef = ref(null)
const dataFormRef = ref(null)

// 表单数据
const temp = reactive({
  id: undefined,
  name: '',
  parentId: 0,
  sort: '',
  remark: ''
})

// 表单校验规则
const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

// 对话框状态
const dialogFormVisible = ref(false)
const dialogStatus = ref('')

// 获取分类树
const fetchCategoryTree = async () => {
  try {
    const response = await getCategoryTree()
    categoryTree.value = response.data || []
    // 提取所有分类用于选择上级分类
    extractAllCategories(categoryTree.value)
  } catch (error) {
    console.error('获取分类树失败:', error)
  }
}

// 提取所有分类
const extractAllCategories = (categories, result = []) => {
  categories.forEach(category => {
    result.push({
      id: category.id,
      name: category.name
    })
    if (category.children && category.children.length > 0) {
      extractAllCategories(category.children, result)
    }
  })
  allCategories.value = result
}

// 获取子分类列表
const fetchChildCategories = async (parentId = 0) => {
  listLoading.value = true
  try {
    if (parentId === 0) {
      // 获取顶级分类
      const response = await searchCategories({ name: '' })
      categoryList.value = response.data.filter(item => !item.parentId || item.parentId === 0) || []
    } else {
      // 获取指定父分类的子分类
      const response = await getChildCategories(parentId)
      categoryList.value = response.data || []
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  } finally {
    listLoading.value = false
  }
}

// 搜索分类
const handleSearch = async () => {
  listLoading.value = true
  try {
    const response = await searchCategories({ name: searchQuery.value })
    categoryList.value = response.data || []
    currentParentId.value = 0
    currentParentName.value = searchQuery.value ? `搜索: ${searchQuery.value}` : ''
  } catch (error) {
    console.error('搜索分类失败:', error)
  } finally {
    listLoading.value = false
  }
}

// 点击树节点
const handleNodeClick = (data) => {
  currentParentId.value = data.id
  currentParentName.value = data.name
  fetchChildCategories(data.id)
}

// 重置表单
const resetTemp = () => {
  Object.assign(temp, {
    id: undefined,
    name: '',
    parentId: currentParentId.value,
    sort: '',
    remark: ''
  })
}

// 添加分类
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
    const response = await addCategory(temp)
    if (response.code === 200) {
      dialogFormVisible.value = false
      ElMessage({
        message: '添加成功',
        type: 'success'
      })
      // 刷新数据
      fetchCategoryTree()
      fetchChildCategories(currentParentId.value)
    }
  } catch (error) {
    console.error('添加分类失败:', error)
  }
}

// 编辑分类
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
    const response = await updateCategory(temp)
    if (response.code === 200) {
      dialogFormVisible.value = false
      ElMessage({
        message: '更新成功',
        type: 'success'
      })
      // 刷新数据
      fetchCategoryTree()
      fetchChildCategories(currentParentId.value)
    }
  } catch (error) {
    console.error('更新分类失败:', error)
  }
}

// 删除分类
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该分类吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await deleteCategory(row.id)
      if (response.code === 200) {
        ElMessage({
          message: '删除成功',
          type: 'success'
        })
        // 刷新数据
        fetchCategoryTree()
        fetchChildCategories(currentParentId.value)
      }
    } catch (error) {
      console.error('删除分类失败:', error)
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
  fetchCategoryTree()
  fetchChildCategories(0)
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

.category-tree-container,
.category-list-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.category-tree-container h3,
.category-list-container h3 {
  margin-top: 0;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-tree) {
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