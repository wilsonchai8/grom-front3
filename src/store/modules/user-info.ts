import { defineStore } from 'pinia'
import { UserState } from '../types'
import store from '../pinia'
import Cookies from 'js-cookie'

const useUserInfoStore = defineStore('user-info', {
    state: () => {
        const userinfo = {
            id: 0,
            role_id: 0,
            auth: '',
            username: '',
            nickname: '',
            rolename: '',
            contact: '',
            email: '',
            status: true,
            super: true,
            components: '',
            requests: '',
            routes: '',
        }
        return {
            userinfo,
        }
    },
    getters: {
        getUserStaticRoutes() {
            const modules: any = import.meta.globEager('@/router/modules/*.ts')
            const modules_routes: any = []
            Object.keys(modules).forEach((it) => {
                const sub_modules = modules[it].default
                Object.keys(sub_modules).forEach((k) => {
                    modules_routes.push(sub_modules[k])
                })
            })
            return modules_routes
        }
    },
    actions: {
        saveUser(login_data: UserState) {
            Object.keys(login_data).forEach((k: any) => {
                this.userinfo[k] = login_data[k]
            })
            this.setCookies()
        },
        setCookies() {
            Object.keys(this.userinfo).forEach((k: any) => {
                Cookies.set(k, this.userinfo[k])
            })
        },
        cleanCookies() {
            Object.keys(this.userinfo).forEach((k: any) => {
                Cookies.remove(k)
            })
        },
        isAuthExpire() {
            return !this.userinfo.auth
        },
        logout() {
            return new Promise<void>((resolve) => {
                this.$reset()
                this.cleanCookies()
                localStorage.clear()
                sessionStorage.clear()
                resolve()
            })
        },
    },
    presist: {
        enable: true,
        resetToState: true,
    },
})

export default useUserInfoStore

export function useUserInfoStoreContext() {
    return useUserInfoStore(store)
}
