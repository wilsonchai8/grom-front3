import { defineStore } from 'pinia'
import roleRq from '@/api/modules/5_role'

const useUsersStore = defineStore('users', {
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
            components: [],
            requests: [],
            routes: [],
        }
        const userlist = []
        const rolelist = []
        return {
            userinfo,
            userlist,
            rolelist,
        }
    },
    getters: {
        getRoleOptions: (state) => {
            return state.rolelist.map(item => {
                return {
                    label: item.rolename,
                    value: item.id
                }
            })
        }
    },
    actions: {
        getUserList() {},
        getRoleList() {
            roleRq('roleList').then(({ payload }) => {
                this.rolelist = payload.role_list
            })
        },
    },
    presist: {
        enable: true,
        resetToState: true,
    },
})

export default useUsersStore
