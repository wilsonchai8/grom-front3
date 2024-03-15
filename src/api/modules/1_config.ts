import { rq } from '../http'

export const comment = '普通配置'

export const req: any = {
  generalList: {
    url: '/config/general',
    method: 'get',
    comment: '列出所有普通配置',
  },
  generalAdd: {
    url: '/config/general',
    method: 'post',
    comment: '添加普通配置',
    permission: 1,
  },
  generalPermission: {
    url: '/config/general',
    method: 'delete',
    comment: '启用/禁用普通配置',
    permission: 1,
  },
  generalUpdate: {
    url: '/config/general',
    method: 'put',
    comment: '编辑普通配置',
  },
  generalAbandon: {
    url: '/config/general/abandon',
    method: 'post',
    comment: '放弃修改普通配置',
  },
  generalVersionList: {
    url: '/config/generalversion',
    method: 'get',
    comment: '列出普通配置版本',
  },
  generalVersionFuzzy: {
    url: '/config/generalversion',
    method: 'post',
    comment: '模糊搜索普通配置版本',
  },
  generalPublish: {
    url: '/config/general/publish',
    method: 'post',
    comment: '发布普通配置',
    permission: 1,
  },
  generalPublishStop: {
    url: '/config/general/publishstop',
    method: 'post',
    comment: '终止发布普通配置',
  },
  generalRollback: {
    url: '/config/general/rollback',
    method: 'post',
    comment: '回滚普通配置',
    permission: 1,
  },
  generalRollbackStop: {
    url: '/config/general/rollbackstop',
    method: 'post',
    comment: '终止回滚普通配置',
  },
  generalLogList: {
    url: '/config/generallog',
    method: 'get',
    comment: '查看普通配置日志',
  },
  generalRender: {
    url: '/config/general/render',
    method: 'post',
    comment: '渲染普通配置',
    permission: 1,
  },
  generalStatus: {
    url: '/config/general/status',
    method: 'get',
    comment: '获取普通配置状态',
  },
}

const configRq = (k: any, params = {}, data = {}) => {
  return rq(k, req, params, data)
}

export default configRq
