import request from '@/utils/request'

export function addSupplier(data) {
  return request({
    url: '/api/supplier/add',
    method: 'post',
    data
  })
}

export function updateSupplier(data) {
  return request({
    url: '/api/supplier/update',
    method: 'put',
    data
  })
}

export function deleteSupplier(id) {
  return request({
    url: `/api/supplier/delete/${id}`,
    method: 'delete'
  })
}

export function listSuppliers(params) {
  return request({
    url: '/api/supplier/list',
    method: 'get',
    params
  })
}