import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/api/user/login',
    method: 'post',
    data
  })
}

export function addUser(data) {
  return request({
    url: '/api/user/add',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: '/api/user/update',
    method: 'put',
    data
  })
}

export function deleteUser(id) {
  return request({
    url: `/api/user/delete/${id}`,
    method: 'delete'
  })
}

export function listUsers(params) {
  return request({
    url: '/api/user/list',
    method: 'get',
    params
  })
}