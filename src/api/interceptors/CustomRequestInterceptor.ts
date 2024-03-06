import { useUserInfoStoreContext } from '@/store/modules/user-info'
import { AxiosRequestConfig } from 'axios'

export default function (config: AxiosRequestConfig) {
  const useStore = useUserInfoStoreContext()
  if (config) {
    if (!config.headers) {
      config.headers = {}
    }
    if (!config.headers['Auth']) {
      config.headers['Auth'] = useStore.userinfo.auth
    }
  }
  return config
}
