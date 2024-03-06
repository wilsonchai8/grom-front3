<template>
  <div class="main-container">
    <TableBody ref="tableBody">
      <template #header>
        <TableHeader
          :show-filter="true"
          title="查询条件"
          @search="onSearch"
          @reset-search="onResetSearch"
        >
          <template #table-config>
            <AddButton name="添加用户" @add="onUpdateItem(undefined, 'add')" />
          </template>
          <template #search-content>
            <form-body
              ref="searchInfoRef"
              :userdefineColumn="searchInfoColumn"
              :userdefineData="searchInfoData"
            ></form-body>
          </template>
        </TableHeader>
      </template>
      <template #default>
        <n-data-table
          size="small"
          :loading="tableLoading"
          :data="dataList"
          :columns="tableColumns"
          :row-key="rowKey"
          :style="{ height: `${tableHeight}px` }"
          :flex-height="true"
        />
      </template>
      <template #footer>
        <TableFooter :pagination="pagination" :totalCount="totalCount" />
      </template>
    </TableBody>
    <ModalDialog
      ref="modalDialog"
      :totalArgs="totalArgs"
      :title="isAdd ? '用户添加' : '用户编辑'"
      contentHeight="20vh"
      @confirm="onDataFormConfirm"
      @cancel="onDataFormCancel"
    >
      <template #content>
        <form-body
          ref="userInfoRef"
          :userdefineColumn="userInfoColumn"
          :userdefineData="userInfoData"
        ></form-body>
      </template>
    </ModalDialog>
  </div>
</template>

<script lang="ts">
  import { componentPermissionFun } from '@/utils/common'
  import userRq from '@/api/modules/user'
  import { renderTag } from '@/hooks/form'
  import {
    usePagination,
    useRowKey,
    useTable,
    useTableColumn,
    useTableHeight,
    useRenderAction,
    TableActionModel,
  } from '@/hooks/table'
  import { DataFormType, ModalDialogType } from '@/types/components'
  import { DataTableColumn, NInput, NSelect, useDialog, FormItemRule } from 'naive-ui'
  import { defineComponent, onMounted, ref, nextTick, computed } from 'vue'
  import useUsersStore from '@/store/modules/users'
  import md5 from 'js-md5'
  export default defineComponent({
    name: 'UserList',
    setup() {
      const userlist = ref([])
      const userInfoRef = ref(null)
      const searchInfoRef = ref(null)
      const searchForm = ref<DataFormType | null>(null)
      const pagination = usePagination(doRefresh)
      pagination.pageSize = 20
      const table = useTable()
      const naiveDailog = useDialog()
      const rowKey = useRowKey('id')
      const modalDialog = ref<ModalDialogType | null>(null)
      const changeType = ref('edit')
      const totalArgs = ref()
      const totalCount = ref(0)
      const isAdd = ref(true)
      const usersStore = useUsersStore()
      const userInfoColumn = computed(() => {
        var passwordRulePattern = /^$|^[A-Za-z0-9-_~!@#$%^&*]{8,20}$/
        var placeholderMsg = '为空则不修改密码'
        if (isAdd.value) {
          passwordRulePattern = /^[A-Za-z0-9-_~!@#$%^&*]{8,20}$/
          placeholderMsg = '请输入密码'
        }
        return [
          {
            label: '用户名',
            key: 'username',
            rule: {
              required: true,
              trigger: ['blur', 'input'],
              message: '字符、数字、-_@组成，最多20个字符',
              pattern: /^[A-Za-z0-9-_@.]{1,20}$/,
            },
            component: NInput,
          },
          {
            label: '密码',
            key: 'password',
            rule: {
              required: true,
              trigger: ['blur', 'input'],
              pattern: passwordRulePattern,
              message: '字符、数字、-_~!@#$%^&*组成，8-20个字符',
              validator(rule: FormItemRule, value: string) {
                const { pattern } = rule
                return pattern.test(value)
              },
            },
            component: NInput,
            attribute: {
              type: 'password',
              placeholder: placeholderMsg,
            },
          },
          {
            label: '姓名',
            key: 'nickname',
            rule: {
              required: true,
              trigger: ['blur', 'input'],
              message: '请输入姓名',
            },
            component: NInput,
          },
          {
            label: '角色',
            key: 'role_id',
            rule: {
              required: true,
              type: 'integer',
              trigger: ['blur', 'input'],
              message: '请选择角色',
            },
            component: NSelect,
            attribute: {
              options: usersStore.getRoleOptions,
              style: 'width:150px',
            },
          },
          {
            label: '邮箱',
            key: 'email',
            component: NInput,
          },
          {
            label: '其他联系方式',
            key: 'contact',
            component: NInput,
          },
        ]
      })
      const userInfoData = ref({})
      const searchInfoColumn = computed(() => {
        return [
          {
            label: '模糊搜索',
            key: 'fuzzySearch',
            component: NInput,
            attribute: {
              style: 'width:300px',
              placeholder: '请输入，多关键字用 英文逗号 区分',
            },
          },
          {
            label: '用户状态',
            key: 'userStatus',
            component: NSelect,
            attribute: {
              placeholder: '默认在用',
              options: [
                {
                  label: '只看在用',
                  value: '1',
                },
                {
                  label: '只看禁用',
                  value: '0',
                },
                {
                  label: '都看',
                  value: '0,1',
                },
              ],
              style: 'width:150px',
            },
          },
        ]
      })
      const searchInfoData = ref({ userStatus: '1' })
      const tableColumns = useTableColumn(
        [
          table.indexColumn,
          {
            title: '账号',
            key: 'username',
          },
          {
            title: '姓名',
            key: 'nickname',
          },
          {
            title: '角色名',
            key: 'rolename',
          },
          {
            title: '邮箱',
            key: 'email',
          },
          {
            title: '其他联系方式',
            key: 'contact',
          },
          {
            title: '上次登录时间',
            key: 'last_login_time',
            width: 180,
          },
          {
            title: '上次登录IP',
            key: 'lastLoginIp',
          },
          {
            title: '状态',
            key: 'status',
            render: (rowData) =>
              renderTag(!!rowData.status ? '正常' : '禁用', {
                type: !!rowData.status ? 'success' : 'error',
                size: 'small',
              }),
          },
          {
            title: '操作',
            key: 'actions',
            width: 180,
            render: (rowData) => {
              return useRenderAction([
                {
                  label: '编辑',
                  onClick: onUpdateItem.bind(null, rowData, 'edit'),
                  show: componentPermissionFun('user_edit_but'),
                },
                {
                  label: '启用',
                  type: 'success',
                  disabled: rowData.status === 1 ? true : false,
                  show: componentPermissionFun('user_enable_disable_but'),
                  onClick() {
                    onEnableItem(rowData)
                  },
                },
                {
                  label: '禁用',
                  type: 'error',
                  disabled: rowData.status === 0 ? true : false,
                  show: componentPermissionFun('user_enable_disable_but'),
                  onClick() {
                    onDisableItem(rowData)
                  },
                },
              ] as TableActionModel[])
            },
          },
        ],
        {
          align: 'center',
        } as DataTableColumn
      )
      function doRefresh() {
        usersStore.getRoleList()
        userRq(
          'userList',
          {
            page: pagination.page,
            limit: pagination.pageSize,
            conditions: searchInfoData.value.fuzzySearch,
            status: searchInfoData.value.userStatus,
          },
          {}
        ).then(({ payload }) => {
          userlist.value = payload.user_list
          table.handleSuccess({
            data: userlist.value,
          })
          pagination.setTotalSize(payload.user_counts || 10)
          totalCount.value = payload.user_counts
        })
      }
      function onSearch() {
        doRefresh()
      }
      function onResetSearch() {
        searchInfoData.value = {}
      }
      function onUpdateItem(item: any, ct: string) {
        changeType.value = ct
        modalDialog.value?.toggle()
        totalArgs.value = item
        nextTick(() => {
          if (ct == 'add') {
            isAdd.value = true
          } else {
            isAdd.value = false
            userInfoData.value = item
          }
        })
      }
      function onEnableItem(item: any) {
        naiveDailog.warning({
          title: '提示',
          content: '确定要启用此用户？',
          positiveText: '启用',
          negativeText: '再想想',
          onPositiveClick: () => {
            const id = item.id
            const status = 1
            userRq('userDelete', { id, status }, {}).then(() => {
              doRefresh()
            })
          },
        })
      }
      function onDisableItem(item: any) {
        naiveDailog.warning({
          title: '提示',
          content: '确定要禁用此用户？',
          positiveText: '禁用',
          negativeText: '再想想',
          onPositiveClick: () => {
            const id = item.id
            const status = 0
            userRq('userDelete', { id, status }, {}).then(() => {
              doRefresh()
            })
          },
        })
      }
      function onDataFormConfirm(callback: any) {
        userInfoRef.value.$refs.userdefineRef.validate((valid) => {
          if (valid) {
            return
          } else {
            const userdata = userInfoData.value
            userdata.password =
              userdata.password === undefined ? userdata.password : md5(userdata.password)
            let req = null
            if (changeType.value === 'edit') {
              const { id } = callback
              req = userRq('userUpdate', {}, { ...userdata, id })
            } else {
              req = userRq('userAdd', {}, { ...userdata })
            }
            req.then((result) => {
              if (result.code === 0) {
                modalDialog.value?.toggle()
                naiveDailog.success({
                  title: '提示',
                  positiveText: '确定',
                  content: '修改成功',
                })
                doRefresh()
                resetUserInfoData()
              } else {
                naiveDailog.warning({
                  title: '警告',
                  positiveText: '确定',
                  content: result.msg,
                })
              }
            })
          }
        })
      }
      function onDataFormCancel() {
        resetUserInfoData()
        userInfoRef.value.$refs.userdefineRef.restoreValidation()
        doRefresh()
      }
      onMounted(async () => {
        table.tableHeight.value = await useTableHeight()
        doRefresh()
      })
      function resetUserInfoData() {
        userInfoData.value = {
          username: null,
          password: null,
          contact: null,
          email: null,
          nickname: null,
          role_id: null,
        }
      }
      return {
        ...table,
        rowKey,
        pagination,
        searchForm,
        tableColumns,
        // conditionItems,
        onSearch,
        onResetSearch,
        modalDialog,
        onDataFormConfirm,
        onDataFormCancel,
        onUpdateItem,
        totalArgs,
        totalCount,
        userInfoRef,
        userInfoColumn,
        userInfoData,
        isAdd,
        searchInfoRef,
        searchInfoColumn,
        searchInfoData,
      }
    },
  })
</script>

<style lang="scss" scoped>
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
