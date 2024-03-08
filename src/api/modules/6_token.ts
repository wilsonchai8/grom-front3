import { rq } from '../http'

export const comment = 'token列表'

export const req: any = {
  tokenList: {
    url: '/admin/user/token',
    method: 'get',
    comment: '列出所有token',
  },
  tokenAdd: {
    url: '/admin/user/token',
    method: 'post',
    comment: '添加token',
    permission: 1,
  },
  tokenDelete: {
    url: '/admin/user/token',
    method: 'delete',
    comment: '删除token',
    permission: 1,
  },
}

const tokenRq = (k: any, params = {}, data = {}) => {
  return rq(k, req, params, data)
}

export default tokenRq
