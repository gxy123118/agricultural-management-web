import request from '@/utils/request'

export function addDepot(data) {
  return request({
    url: '/api/depot/add',
    method: 'post',
    data
  })
}

export function updateDepot(data) {
  return request({
    url: '/api/depot/update',
    method: 'put',
    data
  })
}

export function deleteDepot(id) {
  return request({
    url: `/api/depot/delete/${id}`,
    method: 'delete'
  })
}

export function listDepots(params) {
  return request({
    url: '/api/depot/list',
    method: 'get',
    params
  })
}

export function getAllDepots() {
  return request({
    url: '/api/depot/all',
    method: 'get'
  })
}

export function setDefaultDepot(id) {
  return request({
    url: `/api/depot/setDefault/${id}`,
    method: 'put'
  })
}