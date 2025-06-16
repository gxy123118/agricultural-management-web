import request from '@/utils/request'

export function addCustomer(data) {
  return request({
    url: '/api/customer/add',
    method: 'post',
    data
  })
}

export function updateCustomer(data) {
  return request({
    url: '/api/customer/update',
    method: 'put',
    data
  })
}

export function deleteCustomer(id) {
  return request({
    url: `/api/customer/delete/${id}`,
    method: 'delete'
  })
}

export function listCustomers(params) {
  return request({
    url: '/api/customer/list',
    method: 'get',
    params
  })
}