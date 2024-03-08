<template>
  <div class="main-container">
    <TableBody ref="tableBody">
      <template #header>
        <TableHeader :show-filter="false">
          <template #table-config>
            <ComponentPermission name="env_add_but">
              <AddButton name="添加环境" @add="onUpdateItem(undefined, 'add')" />
            </ComponentPermission>
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
      :title="isAdd ? '环境添加' : '环境编辑'"
      contentHeight="20vh"
      @confirm="onDataFormConfirm"
      @cancel="onDataFormCancel"
    >
      <template #content>
        <form-body
          ref="envInfoRef"
          :userdefineColumn="envInfoColumn"
          :userdefineData="envInfoData"
        ></form-body>
      </template>
    </ModalDialog>
  </div>
</template>

<script lang="ts">
  import { componentPermissionFun } from '@/utils/common'
  import envRq from '@/api/modules/3_env'
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
  import { DataTableColumn, NInput, NSelect, NSwitch, useDialog } from 'naive-ui'
  import { defineComponent, onMounted, ref, nextTick, computed } from 'vue'
  export default defineComponent({
    name: 'EnvList',
    setup() {
      const envlist = ref([])
      const envInfoRef = ref(null)
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
      const envInfoColumn = computed(() => {
        return [
          {
            label: '名称',
            key: 'name',
            rule: {
              required: true,
              trigger: ['blur', 'input'],
              message: '请输入名称',
            },
            component: NInput,
          },
          {
            label: '前缀',
            key: 'prefix',
            component: NInput,
          },
          {
            label: '通知地址',
            key: 'notification',
            component: NInput,
          },
          {
            label: '通知地址token',
            key: 'notification_token',
            component: NInput,
          },
          {
            label: '是否回调',
            key: 'is_callback',
            component: NSwitch,
          },
          {
            label: '回调token',
            key: 'callback_token',
            component: NInput,
          },
        ]
      })
      const envInfoData = ref({
        name: '',
        prefix: '',
        notification: '',
        notification_token: '',
        callback_token: '',
        is_callback: false,
      })
      const tableColumns = useTableColumn(
        [
          {
            title: '名称',
            key: 'name',
          },
          {
            title: '前缀',
            key: 'prefix',
          },
          {
            title: '通知地址',
            key: 'notification',
          },
          {
            title: '通知地址token',
            key: 'notification_token',
          },
          {
            title: '是否回调',
            key: 'is_callback',
            render: (rowData) =>
              renderTag(rowData.is_callback ? '是' : '否', {
                type: rowData.is_callback ? 'success' : 'error',
                size: 'small',
              }),
          },
          {
            title: '回调token',
            key: 'callback_token',
          },
          {
            title: '修改人',
            key: 'modifier',
          },
          {
            title: '修改时间',
            key: 'update_time',
            width: 180,
          },
          {
            title: '操作',
            key: 'actions',
            width: 120,
            render: (rowData) => {
              return useRenderAction([
                {
                  label: '编辑',
                  onClick: onUpdateItem.bind(null, rowData, 'edit'),
                  show: componentPermissionFun('env_edit_but'),
                },
                {
                  label: '删除',
                  type: 'error',
                  onClick() {
                    onDeleteItem(rowData)
                  },
                  show: componentPermissionFun('env_delete_but'),
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
        envRq('envList', { page: pagination.page, limit: pagination.pageSize }, {}).then(
          ({ payload }) => {
            envlist.value = payload.env_list
            table.handleSuccess({
              data: envlist.value,
            })
            pagination.setTotalSize(payload.env_counts || 10)
            totalCount.value = payload.env_counts
          }
        )
      }
      function onSearch() {
        doRefresh()
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
            envInfoData.value = item
            envInfoData.value.is_callback = item.is_callback == 1
          }
        })
      }
      function onDeleteItem(item: any) {
        naiveDailog.warning({
          title: '提示',
          content: '确定要删除此环境？',
          positiveText: '删除',
          negativeText: '再想想',
          onPositiveClick: () => {
            envRq('envDelete', {}, { ...item }).then(() => {
              doRefresh()
            })
          },
        })
      }
      function onDataFormConfirm() {
        envInfoRef.value.$refs.userdefineRef.validate((valid) => {
          if (valid) {
            return
          } else {
            const envdata = envInfoData.value
            let req = null
            if (changeType.value === 'edit') {
              req = envRq('envUpdate', {}, { ...envdata })
            } else {
              req = envRq('envAdd', {}, { ...envdata })
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
                resetEnvInfoData()
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
        resetEnvInfoData()
        envInfoRef.value.$refs.userdefineRef.restoreValidation()
        doRefresh()
      }
      onMounted(async () => {
        table.tableHeight.value = await useTableHeight()
        doRefresh()
      })
      function resetEnvInfoData() {
        envInfoData.value = {
          name: '',
          prefix: '',
          notification: '',
          notification_token: '',
          callback_token: '',
          is_callback: false,
        }
      }
      return {
        ...table,
        rowKey,
        pagination,
        searchForm,
        tableColumns,
        onSearch,
        modalDialog,
        onDataFormConfirm,
        onDataFormCancel,
        onUpdateItem,
        totalArgs,
        totalCount,
        envInfoRef,
        envInfoColumn,
        envInfoData,
        isAdd,
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
