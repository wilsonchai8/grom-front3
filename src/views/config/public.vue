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
            <ComponentPermission name="public_add_but">
              <AddButton name="添加公共配置" @add="onUpdateItem(undefined, 'add')" />
            </ComponentPermission>
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
          :checked-row-keys="selectedRows"
          @update:checked-row-keys="handleCheck"
        />
      </template>
      <template #footer>
        <div style="display: flex">
          <ComponentPermission class="extra-default" name="public_delete_but">
            <n-button :disabled="selectedRows.length == 0" type="error" @click="onDelete()"
              >删除</n-button
            >
          </ComponentPermission>

          <TableFooter :pagination="pagination" :totalCount="totalCount" />
        </div>
      </template>
    </TableBody>
    <relatedGeneral ref="relatedGeneralRef" :publicInfo="publicInfo" />
    <publicDetail
      ref="publicInfoRef"
      :publicInfo="publicInfo"
      :isAdd="isAdd"
      :isPublish="isPublish"
      @confirm="onPublicInfoConfirm"
    />
  </div>
</template>

<script lang="ts">
  import publicDetail from './publicInfo.vue'
  import { componentPermissionFun } from '@/utils/common'
  import publicRq from '@/api/modules/public'
  import relatedGeneral from './relatedGeneral.vue'
  import { Search as SearchIcon } from '@vicons/ionicons5'
  import {
    usePagination,
    useRowKey,
    useTable,
    useTableColumn,
    useTableHeight,
    useRenderAction,
    tableColumnCanClick,
    TableActionModel,
  } from '@/hooks/table'
  import { DataFormType, ModalDialogType } from '@/types/components'
  import { useMessage, DataTableColumn, NInput, NSelect, useDialog } from 'naive-ui'
  import { defineComponent, onMounted, ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  export default defineComponent({
    name: 'general',
    components: {
      publicDetail,
      SearchIcon,
      relatedGeneral,
    },
    setup() {
      const message = useMessage()
      const generalInfo = ref({})
      const publicInfo = ref({})
      const searchInfoRef = ref(null)
      const relatedGeneralRef = ref(null)
      const searchForm = ref<DataFormType | null>(null)
      const pagination = usePagination(doRefresh)
      pagination.pageSize = 20
      const table = useTable()
      const naiveDailog = useDialog()
      const rowKey = useRowKey('id')
      const publicInfoRef = ref(null)
      const totalCount = ref(0)
      const isAdd = ref(true)
      const isPublish = ref(false)
      const selectedRows = ref([])
      const searchInfoColumn = computed(() => {
        return [
          {
            label: 'key',
            key: 'key',
            component: NInput,
          },
          {
            label: 'value',
            key: 'value',
            component: NInput,
          },
          {
            label: '环境',
            key: 'env',
            component: NInput,
          },
          {
            label: '前缀',
            key: 'prefix',
            component: NInput,
          },
        ]
      })
      const searchInfoData = ref({
        key: '',
        value: '',
        env: '',
        prefix: '',
      })
      const tableColumns = useTableColumn(
        [
          table.selectionColumn,
          {
            title: 'key',
            key: 'k',
            render: (rowData: any) => {
              return tableColumnCanClick(
                {
                  onClick: onUpdateItem.bind(null, rowData, 'edit'),
                },
                rowData,
                'k'
              )
            },
          },
          {
            title: '环境',
            key: 'env',
          },
          {
            title: '前缀',
            key: 'prefix',
          },
          {
            title: '创建人',
            key: 'creator',
          },
          {
            title: '创建时间',
            key: 'create_time',
            width: 180,
          },
          {
            title: '操作',
            key: 'actions',
            width: 240,
            render: (rowData) => {
              return useRenderAction([
                {
                  label: '发布',
                  onClick: publishClick.bind(null, rowData),
                  show: componentPermissionFun('public_publish_but'),
                },
                {
                  label: '回滚',
                  type: 'warning',
                  onClick: publishClick.bind(null, rowData),
                  show: componentPermissionFun('public_rollback_but'),
                },
                {
                  label: '查看关联配置',
                  type: 'success',
                  onClick: retrieveClick.bind(null, rowData),
                },
              ] as TableActionModel[])
            },
          },
        ],
        {
          align: 'center',
        } as DataTableColumn
      )
      function handleCheck(rowKeys: any) {
        selectedRows.value = rowKeys
      }
      function doRefresh() {
        publicRq(
          'publicList',
          {
            page: pagination.page,
            limit: pagination.pageSize,
            ...searchInfoData.value,
          },
          {}
        ).then(({ payload }) => {
          table.handleSuccess({
            data: payload.public_item_list,
          })
          pagination.setTotalSize(payload.public_item_counts || 10)
          totalCount.value = payload.public_item_counts
        })
      }
      function onSearch() {
        doRefresh()
      }
      function onResetSearch() {
        searchInfoData.value = {
          key: '',
          value: '',
          env: '',
          prefix: '',
        }
      }
      function onUpdateItem(item: any, ct: string) {
        isPublish.value = false
        if (ct == 'add') {
          isAdd.value = true
          publicInfo.value = {
            env: '',
            prefix: '',
          }
        } else {
          isAdd.value = false
          publicInfo.value = item
        }
        publicInfoRef.value?.toggle()
      }
      function publishClick(data: any) {
        isAdd.value = false
        publicInfo.value = data
        isPublish.value = true
        publicInfoRef.value?.toggle()
      }
      function retrieveClick(data: any) {
        publicInfo.value = data
        relatedGeneralRef.value?.toggle()
      }
      function onDelete() {
        naiveDailog.warning({
          title: '提示',
          content: '确定要删除这些配置？',
          positiveText: '删除',
          negativeText: '再想想',
          onPositiveClick: () => {
            publicRq('publicDelete', {}, { public_item_ids: selectedRows.value }).then(() => {
              message.success('配置文件已删除')
              selectedRows.value = []
              doRefresh()
            })
          },
        })
      }
      onMounted(async () => {
        table.tableHeight.value = await useTableHeight()
        doRefresh()
      })
      function onPublicInfoConfirm() {
        doRefresh()
      }
      return {
        ...table,
        rowKey,
        pagination,
        searchForm,
        tableColumns,
        handleCheck,
        onSearch,
        onResetSearch,
        publicInfoRef,
        onUpdateItem,
        totalCount,
        isAdd,
        isPublish,
        searchInfoRef,
        searchInfoColumn,
        searchInfoData,
        onPublicInfoConfirm,
        generalInfo,
        publishClick,
        onDelete,
        selectedRows,
        publicInfo,
        retrieveClick,
        relatedGeneralRef,
      }
    },
  })
</script>

<style lang="scss" scoped>
  .extra-default {
    margin-top: 8px;
    margin-right: 5px;
  }
</style>
