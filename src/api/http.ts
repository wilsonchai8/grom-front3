import request from './axios.config'
import useUserInfoStore from '@/store/modules/user-info'
import _ from 'lodash'

const debounceMessage = _.debounce(function (error_message) {
  window.$globalmessage.warning(error_message)
}, 1000)

export function rq(k: any, module: any, params = {}, data = {}) {
  const args = module[k]
  const successHandler = (res: any) => {
    if (res.status === 200) {
      const data = res.data
      if (data.code !== 0) {
        window.$globalmessage.warning(data.msg)
        return
      } else {
        return res.data
      }
    }
    throw new Error(res.data.msg || '请求失败，未知异常')
  }
  const failHandler = (error: any) => {
    if (error.status === 401) {
      const { data } = error
      if (data.code == 3) {
        const error_message = '用户名或密码错误'
        window.$globalmessage.warning(error_message)
      } else {
        const error_message = '请重新登录！'
        debounceMessage(error_message)
        const userStore = useUserInfoStore()
        userStore.logout().then(() => {
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        })
      }
    } else if (error.status === 403) {
      const error_message = '当前操作没有权限，请刷新后再试'
      debounceMessage(error_message)
    } else {
      let error_message = error.status.toString() + ' ' + error.statusText
      if (error.data.code) {
        error_message = error.data.msg
      }
      window.$globalmessage.error(error_message)
    }
    throw new Error(error.msg || '请求失败，未知异常，错误')
  }
  return request({
    ...args,
    params,
    data,
  }).then(successHandler, failHandler)
}

export default {
  rq,
}
