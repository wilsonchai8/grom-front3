import { rq } from './http'

export const comment = '登录管理'

export const req: any = {
  login: {
    url: '/admin/auth',
    method: 'post',
    comment: '用户登录',
  },
  refresh: {
    url: '/admin/auth',
    method: 'get',
    comment: '用户刷新',
  },
}

const loginRq = (k: any, params = {}, data = {}) => {
  return rq(k, req, params, data)
}

export default loginRq
