import { rq } from '../http'

export const comment = '用户列表'

export const req: any = {
  userList: {
    url: '/admin/user/users',
    method: 'get',
    comment: '列出所有用户',
  },
  userAdd: {
    url: '/admin/user/users',
    method: 'post',
    comment: '添加用户',
    permission: 1,
  },
  userUpdate: {
    url: '/admin/user/users',
    method: 'put',
    comment: '编辑用户',
    permission: 1,
  },
  userDelete: {
    url: '/admin/user/users',
    method: 'delete',
    comment: '启用/禁用用户',
    permission: 1,
  },
  userSelfUpdate: {
    url: '/admin/user/userself',
    method: 'put',
    comment: '用户更新基础资料',
  },
}

const userRq = (k: any, params = {}, data = {}) => {
  return rq(k, req, params, data)
}

export default userRq
