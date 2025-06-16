import request from '@/utils/request'

// 物资分类API
export function getCategoryTree() {
  return request({
    url: '/api/material/category/tree',
    method: 'get'
  })
}

export function getChildCategories(parentId) {
  return request({
    url: `/api/material/category/children/${parentId}`,
    method: 'get'
  })
}

export function searchCategories(params) {
  return request({
    url: '/api/material/category/search',
    method: 'get',
    params
  })
}

export function getCategoryDetail(id) {
  return request({
    url: `/api/material/category/detail/${id}`,
    method: 'get'
  })
}

export function addCategory(data) {
  return request({
    url: '/api/material/category/add',
    method: 'post',
    data
  })
}

export function updateCategory(data) {
  return request({
    url: '/api/material/category/update',
    method: 'put',
    data
  })
}

export function deleteCategory(id) {
  return request({
    url: `/api/material/category/delete/${id}`,
    method: 'delete'
  })
}

// 物资信息API
export function getMaterialPage(params) {
  return request({
    url: '/api/material/page',
    method: 'get',
    params
  })
}

export function getMaterialsByCategory(categoryId) {
  return request({
    url: `/api/material/category/${categoryId}`,
    method: 'get'
  })
}

export function getMaterialDetail(id) {
  return request({
    url: `/api/material/detail/${id}`,
    method: 'get'
  })
}

export function getLowStockMaterials(params) {
  return request({
    url: '/api/material/low-stock',
    method: 'get',
    params
  })
}

export function addMaterial(data) {
  return request({
    url: '/api/material/add',
    method: 'post',
    data
  })
}

export function updateMaterial(data) {
  return request({
    url: '/api/material/update',
    method: 'put',
    data
  })
}

export function deleteMaterial(id) {
  return request({
    url: `/api/material/delete/${id}`,
    method: 'delete'
  })
}

export function updateStock(params) {
  return request({
    url: '/api/material/stock/update',
    method: 'post',
    params
  })
}