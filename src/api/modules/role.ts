import { rq } from '../http'

export const comment = '角色列表'

export const req: any = {
  roleList: {
    url: '/admin/user/roles',
    method: 'get',
    comment: '列出所有角色',
  },
  roleAdd: {
    url: '/admin/user/roles',
    method: 'post',
    comment: '添加角色',
    permission: 1,
  },
  roleDelete: {
    url: '/admin/user/roles',
    method: 'delete',
    comment: '删除角色',
    permission: 1,
  },
  roleUpdate: {
    url: '/admin/user/roles',
    method: 'put',
    comment: '编辑角色',
    permission: 1,
  },
}

const roleRq = (k: any, params = {}, data = {}) => {
  return rq(k, req, params, data)
}

export default roleRq
