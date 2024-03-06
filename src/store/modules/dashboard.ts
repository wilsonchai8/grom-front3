import { defineStore } from 'pinia'

const useDashboardStore = defineStore('dashboard-info', {
  state: () => {
    return {
      count: 0,
      message: '登录失败',
    }
  },
  getters: {},
  actions: {
  },
  presist: {
    enable: true,
    resetToState: true,
  },
})

export default useDashboardStore
