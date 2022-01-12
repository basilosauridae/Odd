import axios from 'axios'
import { ElLoading } from 'element-plus'

// 开发环境development:
// export const ip = 'http://localhost:9000'
// export const ip = 'http://192.168.104.49:9000'
// export const ip = 'http://192.168.0.210:9000'
// export const ip = 'http://192.168.104.4:9000'
export const ip = 'http://192.168.0.123:9000'

// 统一配置请求,测试生产环境
/* let ip
if (window.location.origin.indexOf('localhost') > -1) {
  ip = 'http://127.0.0.1:9000'
} else {
  // 280端口的写法(此版本图片显示也需要调整)
  ip = 'http://' + window.location.hostname + ':9000'
} */
export const HTTP_REQUEST = axios.create({
  baseURL: ip,
  responseType: 'json',
  timeout: 100000,
  validateStatus (status) {
    // 200 外的状态码都认定为失败
    return status === 200
  }
})

// 在请求前添加加载框
let loading = null
let requestCount = 0
const showLoading = () => {
  if (requestCount === 0 && !loading) {
    loading = ElLoading.service({
      text: '加载中，稍等片刻',
      background: 'rgba(0, 0, 0, 0.7)',
      spinner: 'el-icon-loading'
    })
  }
  requestCount++
}
const hideLoading = () => {
  requestCount--
  if (requestCount === 0) {
    loading.close()
  }
}

// 统一拦截请求
HTTP_REQUEST.interceptors.request.use(
  (config) => {
    // login页面有自定义弹框,不需要全局的，会冲突
    if (config.url !== '/ai/login') {
      showLoading()
    }
    // 有 token就带上 .common['..']是添加自定义参数写法
    if (sessionStorage.getItem('token')) {
      config.headers.common['x-token'] = sessionStorage.getItem('token')
    }
    return config
  },
  (error) => {
    console.log(error)
    return Promise.reject(error)
  }
)

// 统一拦截响应
HTTP_REQUEST.interceptors.response.use(
  (res) => {
    hideLoading()
    return res
  },
  (error) => {
    hideLoading()
    console.log(error)
    return {
      data: {
        code: 11111,
        data: '网络错误',
        msg: '网络错误'
      }
    }
  }
)
// 导出所有请求
export default {
  HTTP_REQUEST,
  ip
}
