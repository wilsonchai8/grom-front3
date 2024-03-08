import { defineStore } from 'pinia'
import userRq from '@/api/modules/4_user'
import roleRq from '@/api/modules/5_role'
import envRq from '@/api/modules/3_env'
import configRq from '@/api/modules/1_config'

const globalStore = defineStore('global-info', {
    state: () => {
        return {
            user_counts: 0 as Number,
            user_list: [] as any,
            role_counts: 0 as Number,
            role_list: [] as any,
            env_counts: 0 as Number,
            env_list: [] as any,
            general_status: [] as any,
        }
    },
    getters: {
        userListSelect(state) {
            const ret = [] as any
            state.user_list.forEach((item: any) => {
                ret.push({
                    label: item.username,
                    value: item.username,
                })
            })
            return ret
        },
        roleListSelect(state) {
            const ret = [] as any
            state.role_list.forEach((item: any) => {
                ret.push({
                    label: item.rolename,
                    value: item.id,
                })
            })
            return ret
        },
        envListSelect(state) {
            const ret = [] as any
            state.env_list.forEach((item: any) => {
                ret.push({
                    label: item.name,
                    value: item.id,
                    other: item,
                })
            })
            return ret
        },
    },
    actions: {
        initUserList() {
            return new Promise<void>((resolve) => {
                userRq('userList', {}, {}).then(({ payload }) => {
                    this.user_counts = payload.user_count
                    this.user_list = payload.user_list
                    resolve(payload)
                })
            })
        },
        initRoleList() {
            return new Promise<void>((resolve) => {
                roleRq('roleList', {}, {}).then(({ payload }) => {
                    this.role_counts = payload.role_counts
                    this.role_list = payload.role_list
                    resolve(payload)
                })
            })
        },
        initEnvList() {
            return new Promise<void>((resolve) => {
                envRq('envList', {}, {}).then(({ payload }) => {
                    this.env_counts = payload.env_counts
                    this.env_list = payload.env_list
                    resolve(payload)
                })
            })
        },
        initGeneralStatus() {
            return new Promise<void>((resolve) => {
                configRq('generalStatus', {}, {}).then(({ payload }) => {
                    this.general_status = payload.general_status
                    resolve(payload)
                })
            })
        },
        globalInit() {
            this.initUserList()
            this.initRoleList()
            this.initEnvList()
            this.initGeneralStatus()
        },
    },
})

export default globalStore
