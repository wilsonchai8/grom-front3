import { RouteRecordRaw } from 'vue-router'
import { defineStore } from 'pinia'
import useUserInfoStore from './user-info'
import router from '@/router'
import { findRootPathRoute, generatorRoutes, mapTwoLevelRouter } from '../help'
import { constantRoutes } from '@/router/routes/constants'
import dashboardRoute from '@/router/routes/dashboard'
import loginRq from '@/api/login'

const usePermissionStore = defineStore('permission-route', {
  state: () => {
    return {
      permissionRoutes: [] as RouteRecordRaw[],
      userDefineRoutes: [],
    }
  },
  getters: {
    getPermissionSideBar(state) {
      return state.permissionRoutes.filter((it) => {
        return it.meta && !it.meta.hidden
      })
    },
    getPermissionSplitTabs(state) {
      return state.permissionRoutes.filter((it) => {
        return it.meta && !it.meta.hidden && it.children && it.children.length > 0
      })
    },
  },
  actions: {
    async getRoutes() {
      const userStore = useUserInfoStore()
      var all_routes = dashboardRoute
      await loginRq('refresh', { id: userStore.userinfo.id }).then(({ payload }) => {
        userStore.saveUser(payload)
      })
      if (userStore.userinfo.super == true) {
        const modules_routes = userStore.getUserStaticRoutes
        all_routes = all_routes.concat(modules_routes)
      } else {
        const userPermissionRoute = userStore.userinfo.routes.split(',')
        const userRoutesFinal = [] as any
        if (userPermissionRoute) {
          userStore.getUserStaticRoutes.forEach((item: any) => {
            const parent = item
            const children = [] as any
            item.children.forEach((route: any) => {
              if (route.permission != 1 || userPermissionRoute.includes(route.menuUrl)) {
                children.push(route)
              }
            })
            if (children.length > 0) {
              parent.children = children
              userRoutesFinal.push(parent)
            }
          })
        }
        all_routes = all_routes.concat(userRoutesFinal)
      }
      this.userDefineRoutes = all_routes
      return generatorRoutes(all_routes)
    },
    async initPermissionRoute() {
      // 加载路由
      const accessRoutes = await this.getRoutes()
      const mapRoutes = mapTwoLevelRouter(accessRoutes)
      mapRoutes.forEach((it: any) => {
        router.addRoute(it)
      })
      // 配置 `/` 路由的默认跳转地址
      router.addRoute({
        path: '/',
        redirect: findRootPathRoute(accessRoutes),
        meta: {
          hidden: true,
        },
      })
      // 这个路由一定要放在最后
      router.addRoute({
        path: '/:pathMatch(.*)*',
        redirect: '/404',
        meta: {
          hidden: true,
        },
      })
      this.permissionRoutes = [...constantRoutes, ...accessRoutes]
    },
    isEmptyPermissionRoute() {
      return !this.permissionRoutes || this.permissionRoutes.length === 0
    },
    reset() {
      this.$reset()
    },
  },
})

export default usePermissionStore
