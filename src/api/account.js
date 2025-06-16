import request from '@/utils/request'

export function addAccount(data) {
  return request({
    url: '/api/account/add',
    method: 'post',
    data
  })
}

export function updateAccount(data) {
  return request({
    url: '/api/account/update',
    method: 'put',
    data
  })
}

export function deleteAccount(id) {
  return request({
    url: `/api/account/delete/${id}`,
    method: 'delete'
  })
}

export function listAccounts(params) {
  return request({
    url: '/api/account/list',
    method: 'get',
    params
  })
}

export function getDefaultAccount() {
  return request({
    url: '/api/account/default',
    method: 'get'
  })
}

export function setDefaultAccount(id) {
  return request({
    url: `/api/account/setDefault/${id}`,
    method: 'put'
  })
}