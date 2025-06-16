import request from '@/utils/request'

// 创建采购记录
export function createProcurement(data) {
  return request({
    url: '/api/procurement/create',
    method: 'post',
    data
  })
}

// 更新采购记录
export function updateProcurement(id, data) {
  return request({
    url: `/api/procurement/update/${id}`,
    method: 'put',
    data
  })
}

// 删除采购记录
export function deleteProcurement(id) {
  return request({
    url: `/api/procurement/delete/${id}`,
    method: 'delete'
  })
}

// 分页查询采购记录
export function getProcurementPage(params) {
  return request({
    url: '/api/procurement/page',
    method: 'get',
    params
  })
}

// 获取采购记录详情
export function getProcurementDetail(id) {
  return request({
    url: `/api/procurement/detail/${id}`,
    method: 'get'
  })
}

// 获取采购统计
export function getProcurementStatistics(params) {
  return request({
    url: '/api/procurement/statistics',
    method: 'get',
    params
  })
}