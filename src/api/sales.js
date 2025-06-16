import request from '@/utils/request'

// 创建销售记录
export function createSales(data) {
  return request({
    url: '/api/sales/create',
    method: 'post',
    data
  })
}

// 更新销售记录
export function updateSales(id, data) {
  return request({
    url: `/api/sales/update/${id}`,
    method: 'put',
    data
  })
}

// 删除销售记录
export function deleteSales(id) {
  return request({
    url: `/api/sales/delete/${id}`,
    method: 'delete'
  })
}

// 分页查询销售记录
export function getSalesPage(params) {
  return request({
    url: '/api/sales/page',
    method: 'get',
    params
  })
}

// 获取销售记录详情
export function getSalesDetail(id) {
  return request({
    url: `/api/sales/detail/${id}`,
    method: 'get'
  })
}

// 获取销售统计
export function getSalesStatistics(params) {
  return request({
    url: '/api/sales/statistics',
    method: 'get',
    params
  })
}