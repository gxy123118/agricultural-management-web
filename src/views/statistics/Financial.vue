<template>
  <div class="app-container">
    <div class="filter-container">
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
        @click="getStatistics"
      >查询统计</el-button>
    </div>

    <!-- 概览卡片 -->
    <el-row :gutter="20" class="overview-cards">
      <el-col :span="6">
        <el-card class="overview-card procurement">
          <div class="card-content">
            <div class="card-icon">
              <el-icon><ShoppingCart /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">采购总额</div>
              <div class="card-value">¥{{ formatNumber(procurementStats.totalAmount) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card sales">
          <div class="card-content">
            <div class="card-icon">
              <el-icon><Sell /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">销售总额</div>
              <div class="card-value">¥{{ formatNumber(salesStats.totalAmount) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card profit">
          <div class="card-content">
            <div class="card-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">毛利润</div>
              <div class="card-value">¥{{ formatNumber(salesStats.totalAmount - procurementStats.totalAmount) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card orders">
          <div class="card-content">
            <div class="card-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">总订单数</div>
              <div class="card-value">{{ procurementStats.orderCount + salesStats.orderCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-container">
      <!-- 采购销售趋势对比 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>采购销售趋势对比</span>
            </div>
          </template>
          <div ref="trendChart" style="height: 400px;"></div>
        </el-card>
      </el-col>
      
      <!-- 采购销售占比 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>采购销售金额占比</span>
            </div>
          </template>
          <div ref="pieChart" style="height: 400px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-container">
      <!-- 月度对比 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>月度采购销售对比</span>
            </div>
          </template>
          <div ref="monthlyChart" style="height: 400px;"></div>
        </el-card>
      </el-col>
      
      <!-- 利润分析 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>利润分析</span>
            </div>
          </template>
          <div ref="profitChart" style="height: 400px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { ShoppingCart, Sell, TrendCharts, Document } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getProcurementStatistics } from '@/api/procurement'
import { getSalesStatistics } from '@/api/sales'

// 响应式数据
const dateRange = ref([])
const trendChart = ref(null)
const pieChart = ref(null)
const monthlyChart = ref(null)
const profitChart = ref(null)

const procurementStats = reactive({
  totalAmount: 0,
  orderCount: 0,
  averagePrice: 0
})

const salesStats = reactive({
  totalAmount: 0,
  orderCount: 0,
  averagePrice: 0
})

// 图表实例
let trendChartInstance = null
let pieChartInstance = null
let monthlyChartInstance = null
let profitChartInstance = null

// 方法
const getStatistics = async () => {
  try {
    const params = {}
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }

    // 获取采购统计
    const procurementResponse = await getProcurementStatistics(params)
    console.log('采购统计响应:', procurementResponse)
    if (procurementResponse.code == 200) {
      // 处理BigDecimal类型 - 转换为字符串再转数字
      procurementStats.totalAmount = parseFloat(String(procurementResponse.data.totalAmount)) || 0
      procurementStats.orderCount = parseInt(String(procurementResponse.data.orderCount)) || 0
      procurementStats.averagePrice = parseFloat(String(procurementResponse.data.averagePrice)) || 0
      
      console.log('采购统计更新后:', {
        totalAmount: procurementStats.totalAmount,
        orderCount: procurementStats.orderCount,
        averagePrice: procurementStats.averagePrice
      })
    }

    // 获取销售统计
    const salesResponse = await getSalesStatistics(params)
    console.log('销售统计响应:', salesResponse)
    if (salesResponse.code == 200) {

      // 处理BigDecimal类型 - 转换为字符串再转数字
      salesStats.totalAmount = parseFloat(String(salesResponse.data.totalAmount)) || 0
      salesStats.orderCount = parseInt(String(salesResponse.data.orderCount)) || 0
      salesStats.averagePrice = parseFloat(String(salesResponse.data.averagePrice)) || 0

      console.log('销售统计更新后:', {
        totalAmount: salesStats.totalAmount,
        orderCount: salesStats.orderCount,
        averagePrice: salesStats.averagePrice
      })
    }

    // 强制触发视图更新
    await nextTick()
    updateCharts()
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  }
}

const formatNumber = (num) => {
  if (!num) return '0'
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const initCharts = () => {
  // 趋势对比图
  trendChartInstance = echarts.init(trendChart.value)
  
  // 饼图
  pieChartInstance = echarts.init(pieChart.value)
  
  // 月度对比图
  monthlyChartInstance = echarts.init(monthlyChart.value)
  
  // 利润分析图
  profitChartInstance = echarts.init(profitChart.value)
  
  updateCharts()
}

const updateCharts = () => {
  // 趋势对比图配置
  const trendOption = {
    title: {
      text: '采购销售趋势'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['采购金额', '销售金额']
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '采购金额',
        type: 'line',
        data: [12000, 15000, 18000, 16000, 20000, 22000],
        itemStyle: { color: '#ff6b6b' }
      },
      {
        name: '销售金额',
        type: 'line',
        data: [15000, 18000, 22000, 20000, 25000, 28000],
        itemStyle: { color: '#4ecdc4' }
      }
    ]
  }
  
  // 饼图配置
  const pieOption = {
    title: {
      text: '采购销售占比',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: ¥{c} ({d}%)'
    },
    series: [
      {
        name: '金额',
        type: 'pie',
        radius: '50%',
        data: [
          { value: procurementStats.totalAmount, name: '采购金额', itemStyle: { color: '#ff6b6b' } },
          { value: salesStats.totalAmount, name: '销售金额', itemStyle: { color: '#4ecdc4' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  // 月度对比图配置
  const monthlyOption = {
    title: {
      text: '月度对比'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['采购', '销售', '利润']
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '采购',
        type: 'bar',
        data: [12000, 15000, 18000, 16000, 20000, 22000],
        itemStyle: { color: '#ff6b6b' }
      },
      {
        name: '销售',
        type: 'bar',
        data: [15000, 18000, 22000, 20000, 25000, 28000],
        itemStyle: { color: '#4ecdc4' }
      },
      {
        name: '利润',
        type: 'bar',
        data: [3000, 3000, 4000, 4000, 5000, 6000],
        itemStyle: { color: '#45b7d1' }
      }
    ]
  }
  
  // 利润分析图配置
  const profitOption = {
    title: {
      text: '利润分析'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '利润',
        type: 'line',
        data: [3000, 3000, 4000, 4000, 5000, 6000],
        itemStyle: { color: '#45b7d1' },
        areaStyle: {
          color: 'rgba(69, 183, 209, 0.3)'
        }
      }
    ]
  }
  
  trendChartInstance?.setOption(trendOption)
  pieChartInstance?.setOption(pieOption)
  monthlyChartInstance?.setOption(monthlyOption)
  profitChartInstance?.setOption(profitOption)
}

// 生命周期
onMounted(async () => {
  await getStatistics()
  await nextTick()
  initCharts()
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    trendChartInstance?.resize()
    pieChartInstance?.resize()
    monthlyChartInstance?.resize()
    profitChartInstance?.resize()
  })
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

.overview-cards {
  margin-bottom: 20px;
}

.overview-card {
  height: 120px;
}

.card-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.card-icon {
  font-size: 48px;
  margin-right: 20px;
}

.procurement .card-icon {
  color: #ff6b6b;
}

.sales .card-icon {
  color: #4ecdc4;
}

.profit .card-icon {
  color: #45b7d1;
}

.orders .card-icon {
  color: #96ceb4;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.charts-container {
  margin-bottom: 20px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}
</style>