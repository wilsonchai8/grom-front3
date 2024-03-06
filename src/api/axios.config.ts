import Axios, { AxiosResponse } from 'axios'
import qs from 'qs'

export const CONTENT_TYPE = 'Content-Type'

export const FORM_URLENCODED = 'application/x-www-form-urlencoded; charset=UTF-8'

export const APPLICATION_JSON = 'application/json; charset=UTF-8'

export const TEXT_PLAIN = 'text/plain; charset=UTF-8'

const service = Axios.create({
  baseURL: 'api',
  timeout: 10 * 60 * 1000,
})

service.interceptors.request.use(
  (config) => {
    const permission = config.permission 
    const method = config.method
    const url = config.url
    if (config.method == 'get') {
      config.data = qs.stringify(config.data)
      config.paramsSerializer = function (params) {
        return qs.stringify(params, { arrayFormat: 'comma' })
      }
    }
    config.headers['origin-url'] = `${method}:${url}:${permission}`
    return config
  },
  (error) => {
    return Promise.reject(error.response)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    if (response.status === 200) {
      return response
    } else {
      throw new Error(response.status.toString())
    }
  },
  (error) => {
    if (import.meta.env.MODE === 'development') {
      console.log(error)
    }
    return Promise.reject(error.response)
  }
)

export default service
