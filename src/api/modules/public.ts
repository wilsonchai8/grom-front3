import { rq } from '../http'

export const comment = '公共配置'

export const req: any = {
  publicList: {
    url: '/config/public',
    method: 'get',
    comment: '列出所有公共配置',
  },
  publicAdd: {
    url: '/config/public',
    method: 'post',
    comment: '添加公共配置',
    permission: 1,
  },
  publicDelete: {
    url: '/config/public',
    method: 'delete',
    comment: '删除公共配置',
    permission: 1,
  },
  publicUpdate: {
    url: '/config/public',
    method: 'put',
    comment: '编辑公共配置',
  },
  publicVersionList: {
    url: '/config/publicversion',
    method: 'get',
    comment: '列出所有公共配置',
  },
  publicPublish: {
    url: '/config/public/publish',
    method: 'post',
    comment: '发布公共配置',
    permission: 1,
  },
  publicRollback: {
    url: '/config/public/rollback',
    method: 'post',
    comment: '回滚公共配置',
    permission: 1,
  },
  publicRelatedGeneral: {
    url: '/config/public/related_general',
    method: 'get',
    comment: '查找关联配置',
  },
  publicRelatedGeneralPublish: {
    url: '/config/public/related_general',
    method: 'post',
    comment: '发布关联配置',
    permission: 1,
  },
}

const publicRq = (k: any, params = {}, data = {}) => {
  return rq(k, req, params, data)
}

export default publicRq
