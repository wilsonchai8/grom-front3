<template>
  <div class="main-container">
    <TableBody ref="tableBody">
      <template #header>
        <TableHeader :show-filter="false">
          <template #top-right>
            <ComponentPermission name="token_add_but">
              <AddButton name="添加token" @add="onUpdateItem(undefined)" />
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
      title="token添加"
      contentHeight="20vh"
      @confirm="onDataFormConfirm"
      @cancel="onDataFormCancel"
    >
      <template #content>
        <form-body
          ref="tokenInfoRef"
          :userdefineColumn="tokenInfoColumn"
          :userdefineData="tokenInfoData"
        ></form-body>
      </template>
    </ModalDialog>
  </div>
</template>

<script lang="ts">
  import tokenRq from '@/api/modules/token'
  import {
    usePagination,
    useRowKey,
    useTable,
    useTableColumn,
    useTableHeight,
    useRenderAction,
    TableActionModel,
  } from '@/hooks/table'
  import { ModalDialogType } from '@/types/components'
  import { DataTableColumn, useDialog, NInput } from 'naive-ui'
  import { defineComponent, onMounted, ref, computed } from 'vue'
  import { componentPermissionFun } from '@/utils/common'
  export default defineComponent({
    name: 'TokenList',
    setup() {
      const pagination = usePagination(doRefresh)
      const tokenInfoRef = ref()
      const modalDialog = ref<ModalDialogType | null>(null)
      pagination.pageSize = 20
      const table = useTable()
      const naiveDailog = useDialog()
      const totalCount = ref(0)
      const rowKey = useRowKey('id')
      const totalArgs = ref()
      const tokenInfoColumn = computed(() => {
        return [
          {
            label: 'token名',
            key: 'tokenname',
            rule: {
              required: true,
              trigger: ['blur', 'input'],
              message: '请输入token名',
            },
            component: NInput,
          },
        ]
      })
      const tokenInfoData = ref({ tokenname: null })
      const tableColumns = useTableColumn(
        [
          {
            title: 'token名',
            key: 'tokenname',
            width: 200,
          },
          {
            title: 'payload',
            key: 'payload',
          },
          {
            title: '操作',
            key: 'actions',
            width: 100,
            render: (rowData) => {
              return useRenderAction([
                {
                  label: '删除',
                  type: 'error',
                  disabled: rowData.status === 0 ? true : false,
                  show: componentPermissionFun('token_delete_but'),
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
      function onDataFormConfirm() {
        tokenInfoRef.value.$refs.userdefineRef.validate((valid: any) => {
          if (valid) {
            return
          } else {
            tokenRq('tokenAdd', {}, { ...tokenInfoData.value }).then(() => {
              modalDialog.value?.toggle()
              naiveDailog.success({
                title: '提示',
                positiveText: '确定',
                content: '添加成功',
              })
              doRefresh()
              resetTokenInfoData()
            })
          }
        })
      }
      function onDataFormCancel() {
        resetTokenInfoData()
        tokenInfoRef.value.$refs.userdefineRef.restoreValidation()
        doRefresh()
      }
      function resetTokenInfoData() {
        tokenInfoData.value = { tokenname: null }
      }
      function doRefresh() {
        tokenRq('tokenList', {}, {}).then(({ payload }) => {
          table.handleSuccess({
            data: payload.token_list,
          })
          totalCount.value = payload.token_counts
          pagination.setTotalSize(payload.token_counts || 10)
        })
      }
      function onUpdateItem() {
        modalDialog.value?.toggle()
      }
      function onDisableItem(item: any) {
        naiveDailog.warning({
          title: '提示',
          content: '确定要删除此token？',
          positiveText: '删除',
          negativeText: '再想想',
          onPositiveClick: () => {
            tokenRq('tokenDelete', { id: item.id }, {}).then(() => {
              doRefresh()
            })
          },
        })
      }
      onMounted(async () => {
        table.tableHeight.value = await useTableHeight()
        doRefresh()
      })
      return {
        ...table,
        rowKey,
        pagination,
        tableColumns,
        onUpdateItem,
        onDataFormConfirm,
        onDataFormCancel,
        tokenInfoColumn,
        tokenInfoData,
        tokenInfoRef,
        modalDialog,
        totalArgs,
        totalCount,
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
