import { rq } from '../http'

export const comment = '环境管理'

export const req: any = {
  envList: {
    url: '/config/env',
    method: 'get',
    comment: '列出所有环境',
  },
  envAdd: {
    url: '/config/env',
    method: 'post',
    comment: '添加环境',
    permission: 1,
  },
  envDelete: {
    url: '/config/env',
    method: 'delete',
    comment: '删除环境',
    permission: 1,
  },
  envUpdate: {
    url: '/config/env',
    method: 'put',
    comment: '编辑环境',
    permission: 1,
  },
}

const envRq = (k: any, params = {}, data = {}) => {
  return rq(k, req, params, data)
}

export default envRq
