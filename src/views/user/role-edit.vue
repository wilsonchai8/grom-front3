<template>
  <div class="main-container">
    <TableBody ref="tableBody">
      <template #header>
        <n-page-header style="margin-bottom: 10px" @back="handleBack">
          <template #subtitle>
            {{ title }}
          </template>
          <template #extra>
            <form-body
              ref="roleInfoRef"
              :userdefineColumn="roleInfoColumn"
              :userdefineData="roleInfoData"
            ></form-body>
          </template>
        </n-page-header>
      </template>
      <template #default>
        <n-card style="margin-bottom: 16px">
          <n-tabs type="line" animated>
            <n-tab-pane tab="菜单权限" name="menus">
              <n-tree
                block-line
                cascade
                checkable
                :data="menuData"
                :default-expand-all="true"
                :default-checked-keys="menuDefaultCheckedKeys"
                @update:checked-keys="menuUpdateCheckedKeys"
              />
            </n-tab-pane>
            <n-tab-pane tab="组件权限" name="components">
              <n-tree
                block-line
                cascade
                checkable
                :data="componentData"
                :default-expand-all="true"
                :default-checked-keys="componentDefaultCheckedKeys"
                @update:checked-keys="componentUpdateCheckedKeys"
              />
            </n-tab-pane>
            <n-tab-pane tab="请求权限" name="requests">
              <n-tree
                block-line
                cascade
                checkable
                :data="requestData"
                :default-expand-all="true"
                :default-checked-keys="requestDefaultCheckedKeys"
                @update:checked-keys="requestUpdateCheckedKeys"
              />
            </n-tab-pane>
          </n-tabs>
        </n-card>
      </template>
      <template #footer>
        <div class="button-group">
          <n-button type="info" @click="comfirmClick">确定</n-button>
          <n-button @click="cancelClick">取消</n-button>
        </div>
      </template>
    </TableBody>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, computed, onMounted, h } from 'vue'
  import { useMessage, TreeOption, NInput, useDialog } from 'naive-ui'
  import { useRouter, useRoute } from 'vue-router'
  import roleRq from '@/api/modules/role'
  import metaComponents from '@/utils/componentPermission'

  export default defineComponent({
    setup() {
      const title = ref('角色编辑')
      const isAdd = ref(false)
      const roleInfoData = ref({})
      const message = useMessage()
      const menuData = ref([])
      const menuDefaultCheckedKeys = ref([])
      const requestData = ref([])
      const requestDefaultCheckedKeys = ref([])
      const componentData = ref([])
      const componentDefaultCheckedKeys = ref([])
      const router = useRouter()
      const route = useRoute()
      const roleInfoRef = ref()
      const dialog = useDialog()
      const roleInfoColumn = computed(() => {
        return [
          {
            label: '角色名',
            key: 'rolename',
            rule: {
              required: true,
              trigger: ['blur', 'input'],
              message: '字符、数字、-_组成',
              pattern: /^[A-Za-z0-9-_]*$/,
            },
            component: NInput,
          },
          {
            label: '备注',
            key: 'comment',
            component: NInput,
          },
        ]
      })
      function getMenus() {
        const metaRouters = import.meta.glob('@/router/modules/*.ts')
        for (const key in metaRouters) {
          metaRouters[key]().then((mod: any) => {
            const route_info = mod.default[0]
            if (route_info.children) {
              const route_temp = {
                label: route_info.menuName,
                key: route_info.menuUrl,
                parent: true,
                children: [],
              }
              route_info.children.forEach((item: any) => {
                if (item.permission == 1) {
                  route_temp.children.push({
                    label: item.menuName,
                    key: item.menuUrl,
                    total: item,
                  })
                }
              })
              menuData.value.push(route_temp)
            }
          })
        }
      }
      function getRequests() {
        const metaRequests = import.meta.glob('@/api/modules/*.ts')
        for (const key in metaRequests) {
          metaRequests[key]().then((mod: any) => {
            const request_temp: any = {
              label: mod.comment,
              key: mod.comment,
              parent: true,
              children: [],
            }
            Object.keys(mod.req).forEach((k: any) => {
              if (mod.req[k].permission == 1) {
                const key = mod.req[k].url + ':' + mod.req[k].method
                request_temp.children.push({
                  label: mod.req[k].comment,
                  key: key,
                  total: mod.req[k],
                })
              }
            })
            if (request_temp.children.length > 0) {
              requestData.value.push(request_temp)
            }
          })
        }
      }
      function getComponents() {
        metaComponents.forEach((c: any) => {
          const request_temp: any = {
            label: c.comment,
            key: c.comment,
            parent: true,
            children: [],
          }
          c.children.forEach((item: any) => {
            request_temp.children.push({
              label: item.comment,
              key: item.name,
              total: item,
            })
          })
          componentData.value.push(request_temp)
        })
      }
      function menuUpdateCheckedKeys(
        keys: Array<string | number>,
        options: Array<TreeOption | null>,
        meta: {
          node: TreeOption | null
          action: 'check' | 'uncheck'
        }
      ) {
        const data = meta.node.parent ? meta.node.children : [meta.node]
        treeElementModify(data, meta.action, menuDefaultCheckedKeys, 'key')
      }
      function requestUpdateCheckedKeys(
        keys: Array<string | number>,
        options: Array<TreeOption | null>,
        meta: {
          node: TreeOption | null
          action: 'check' | 'uncheck'
        }
      ) {
        const data = meta.node.parent ? meta.node.children : [meta.node]
        treeElementModify(data, meta.action, requestDefaultCheckedKeys, 'key')
      }
      function componentUpdateCheckedKeys(
        keys: Array<string | number>,
        options: Array<TreeOption | null>,
        meta: {
          node: TreeOption | null
          action: 'check' | 'uncheck'
        }
      ) {
        const data = meta.node.parent ? meta.node.children : [meta.node]
        treeElementModify(data, meta.action, componentDefaultCheckedKeys, 'key')
        componentRalatedRequest(meta)
      }
      function componentRalatedRequest(meta: Object) {
        var related_data = [] as any
        const { node, action } = meta
        if (node.parent) {
          related_data = node.children.map((item: any) => {
            return item.total
          })
        } else {
          if (node.total.related_request) {
            related_data = [node.total]
          }
        }
        if (related_data.length > 0) {
          dialog.warning({
            title: '以下按钮绑定了请求权限，是否关联操作？',
            positiveText: '是',
            negativeText: '否',
            onPositiveClick: () => {
              treeElementModify(related_data, action, requestDefaultCheckedKeys, 'related_request')
            },
            onNegativeClick: () => {},
            content: () =>
              h(
                'ul',
                related_data.map((item: any) => {
                  return h('li', item.comment)
                })
              ),
            closable: false,
          })
        }
      }
      function treeElementModify(data, action, defaultCheckedKeys, k) {
        data.forEach((item: any) => {
          if (action == 'check') {
            defaultCheckedKeys.value.push(item[k])
          }
          if (action == 'uncheck' && defaultCheckedKeys.value.includes(item[k])) {
            defaultCheckedKeys.value.splice(defaultCheckedKeys.value.indexOf(item[k]), 1)
          }
        })
      }
      function getRoleInfo() {
        const id = route.query.id
        if (id == '0') {
          title.value = '角色添加'
          isAdd.value = true
        } else {
          roleRq('roleList', { id }, {}).then(({ payload }) => {
            if (payload.role_info == null) {
              message.error('找不到对应的角色')
              router.back()
              return
            } else {
              roleInfoData.value = payload.role_info
              if (roleInfoData.value.routes) {
                roleInfoData.value.routes.split(',').forEach((item: any) => {
                  menuDefaultCheckedKeys.value.push(item)
                })
              }
              if (roleInfoData.value.requests) {
                roleInfoData.value.requests.split(',').forEach((item: any) => {
                  requestDefaultCheckedKeys.value.push(item)
                })
              }
              if (roleInfoData.value.components) {
                roleInfoData.value.components.split(',').forEach((item: any) => {
                  componentDefaultCheckedKeys.value.push(item)
                })
              }
            }
          })
        }
      }
      function comfirmClick() {
        roleInfoRef.value.$refs.userdefineRef.validate((valid: any) => {
          if (valid) {
            message.error(valid[0][0].message)
            return
          }
          const menuDataToPush = menuDefaultCheckedKeys.value.join(',')
          const requestDataToPush = requestDefaultCheckedKeys.value.join(',')
          const componentDataToPush = componentDefaultCheckedKeys.value.join(',')
          if (isAdd.value == true) {
            roleInfoRef.value.$refs.userdefineRef.validate((valid: any) => {
              roleRq(
                'roleAdd',
                {},
                {
                  rolename: roleInfoData.value.rolename,
                  routes: menuDataToPush,
                  requests: requestDataToPush,
                  components: componentDataToPush,
                  comment: roleInfoData.value.comment,
                }
              ).then(({ payload }) => {
                message.success('角色添加成功')
                router.back()
              })
            })
          } else {
            const { id, rolename } = roleInfoData.value
            roleRq(
              'roleUpdate',
              {},
              {
                id: id,
                rolename: rolename,
                routes: menuDataToPush,
                requests: requestDataToPush,
                components: componentDataToPush,
                comment: roleInfoData.value.comment,
              }
            ).then(() => {
              message.success('角色修改成功')
            })
          }
        })
      }
      function cancelClick() {
        router.push('/user/role-list')
      }
      function handleBack() {
        router.back()
      }
      onMounted(() => {
        const id = route.query.id
        if (id) {
          getMenus()
          getRequests()
          getComponents()
          getRoleInfo()
        } else {
          message.warning('找不到对应角色，回到角色列表')
          router.push('/user/role-list')
        }
      })
      return {
        title,
        handleBack,
        menuData,
        menuDefaultCheckedKeys,
        menuUpdateCheckedKeys,
        requestData,
        requestDefaultCheckedKeys,
        requestUpdateCheckedKeys,
        componentData,
        componentDefaultCheckedKeys,
        componentUpdateCheckedKeys,
        comfirmClick,
        cancelClick,
        roleInfoRef,
        roleInfoColumn,
        roleInfoData,
      }
    },
  })
</script>

<style lang="scss" scoped>
  .button-group > * {
    margin-right: 10px;
  }
  .avatar-container {
    position: relative;
    width: 30px;
    height: 30px;
    margin: 0 auto;
    vertical-align: middle;
    .avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
    .avatar-vip {
      border: 2px solid #cece1e;
    }
    .vip {
      position: absolute;
      top: 0;
      right: -9px;
      width: 15px;
      transform: rotate(60deg);
    }
  }
  .gender-container {
    .gender-icon {
      width: 20px;
    }
  }
</style>
