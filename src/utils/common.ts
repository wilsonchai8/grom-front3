import useUserInfoStore from '@/store/modules/user-info'

export const componentPermissionFun = (componentName: any) => {
    const userStore = useUserInfoStore()
    if(userStore.userinfo.super == false) {
        return userStore.userinfo.components.includes(componentName)
    } else {
        return true
    }
}
