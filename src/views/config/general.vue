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
            <ComponentPermission name="general_add_but">
              <AddButton name="添加配置" @add="onUpdateItem(undefined, 'add')" />
            </ComponentPermission>
          </template>
          <template #top-right>
            <n-button type="success" size="small" @click="onFuzzySearchClick">
              <template #icon>
                <n-icon>
                  <SearchIcon />
                </n-icon>
              </template>
              内容搜索
            </n-button>
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
          <ComponentPermission class="extra-default" name="general_enable_disable_but">
            <n-button :disabled="selectedRows.length == 0" type="success" @click="onPermission(0)"
              >启用</n-button
            >
          </ComponentPermission>
          <ComponentPermission class="extra-default" name="general_enable_disable_but">
            <n-button :disabled="selectedRows.length == 0" type="error" @click="onPermission(1)"
              >禁用</n-button
            >
          </ComponentPermission>
          <!-- <n-button>click</n-button> -->
          <TableFooter :pagination="pagination" :totalCount="totalCount" />
        </div>
      </template>
    </TableBody>
    <fuzzySearchComponent ref="fuzzySearchComponentRef" />
    <configDetail
      :generalInfo="generalInfo"
      :isAdd="isAdd"
      ref="configDetailRef"
      @confirm="onConfigDetailConfirm"
    />
    <configPublish
      :generalInfo="generalInfo"
      :publishType="publishType"
      ref="configPublishRef"
      @confirm="onConfigDetailConfirm"
    />
  </div>
</template>

<script lang="ts">
  import configDetail from './detail.vue'
  import { renderTag } from '@/hooks/form'
  import configPublish from './publish.vue'
  import fuzzySearchComponent from './fuzzySearch.vue'
  import configRq from '@/api/modules/1_config'
  import { Search as SearchIcon } from '@vicons/ionicons5'
  import {
    usePagination,
    useRowKey,
    useTable,
    useTableColumn,
    useTableHeight,
    useRenderAction,
    userDefineAction,
    tableColumnCanClick,
    TableActionModel,
  } from '@/hooks/table'
  import { DataFormType, ModalDialogType } from '@/types/components'
  import { useMessage, DataTableColumn, NInput, NButton, NSelect, useDialog } from 'naive-ui'
  import { defineComponent, onMounted, ref, computed } from 'vue'
  import { componentPermissionFun } from '@/utils/common'
  export default defineComponent({
    name: 'general',
    components: {
      configDetail,
      configPublish,
      SearchIcon,
      fuzzySearchComponent,
    },
    setup() {
      const message = useMessage()
      const generalInfo = ref({})
      const searchInfoRef = ref(null)
      const searchForm = ref<DataFormType | null>(null)
      const pagination = usePagination(doRefresh)
      pagination.pageSize = 20
      const table = useTable()
      const naiveDailog = useDialog()
      const rowKey = useRowKey('id')
      const configDetailRef = ref(null)
      const configPublishRef = ref(null)
      const fuzzySearchComponentRef = ref(null)
      const totalCount = ref(0)
      const isAdd = ref(true)
      const publishType = ref('publish')
      const selectedRows = ref([])
      const searchInfoColumn = computed(() => {
        return [
          {
            label: '名称',
            key: 'name',
            component: NInput,
          },
          {
            label: '所属服务',
            key: 'belongto',
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
          {
            label: '配置状态',
            key: 'isDelete',
            component: NSelect,
            attribute: {
              placeholder: '默认在用',
              options: [
                {
                  label: '只看在用',
                  value: '0',
                },
                {
                  label: '只看禁用',
                  value: '1',
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
      const searchInfoData = ref({
        name: '',
        env: '',
        belongto: '',
        prefix: '',
        isDelete: '0',
      })
      const tableColumns = useTableColumn(
        [
          table.selectionColumn,
          {
            title: '名称',
            key: 'name',
            render: (rowData) => {
              return tableColumnCanClick(
                {
                  onClick: onUpdateItem.bind(null, rowData, 'edit'),
                },
                rowData,
                'name'
              )
            },
          },
          {
            title: '所属服务',
            key: 'belongto',
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
            title: '创建时间',
            key: 'create_time',
            width: 180,
          },
          {
            title: '状态',
            key: 'is_delete',
            render: (rowData) =>
              renderTag(!rowData.is_delete ? '正常' : '禁用', {
                type: !rowData.is_delete ? 'success' : 'error',
                size: 'small',
              }),
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
                  show: componentPermissionFun('general_publish_but'),
                },
                {
                  label: '回滚',
                  type: 'warning',
                  onClick: rollbackClick.bind(null, rowData),
                  show: componentPermissionFun('general_rollback_but'),
                },
                {
                  label: '版本/日志',
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
        configRq(
          'generalList',
          {
            page: pagination.page,
            limit: pagination.pageSize,
            ...searchInfoData.value,
          },
          {}
        ).then(({ payload }) => {
          table.handleSuccess({
            data: payload.general_list,
          })
          pagination.setTotalSize(payload.general_counts || 10)
          totalCount.value = payload.general_counts
        })
      }
      function onSearch() {
        doRefresh()
      }
      function onResetSearch() {
        searchInfoData.value = {
          name: '',
          env: '',
          belongto: '',
          prefix: '',
          isDelete: '0',
        }
      }
      function onUpdateItem(item: any, ct: string) {
        if (ct == 'edit') {
          isAdd.value = false
          generalInfo.value = item
        } else {
          isAdd.value = true
          generalInfo.value = {
            name: '',
            env: '',
            belongto: '',
            prefix: '',
          }
        }
        configDetailRef.value?.toggle()
      }
      function publishClick(data: any) {
        generalInfo.value = data
        publishType.value = 'publish'
        configPublishRef.value?.toggle()
      }
      function rollbackClick(data: any) {
        generalInfo.value = data
        publishType.value = 'rollback'
        configPublishRef.value?.toggle()
      }
      function retrieveClick(data: any) {
        generalInfo.value = data
        publishType.value = 'retrieve'
        configPublishRef.value?.toggle()
      }
      function onPermission(permission: Number) {
        const msg = permission == 0 ? '启用' : '禁用'
        naiveDailog.warning({
          title: '提示',
          content: `确定要${msg}此配置？`,
          positiveText: msg,
          negativeText: '再想想',
          onPositiveClick: () => {
            configRq(
              'generalPermission',
              {},
              { general_ids: selectedRows.value, isDelete: permission }
            ).then(() => {
              message.success(`配置文件已${msg}`)
              selectedRows.value = []
              doRefresh()
            })
          },
        })
      }
      function onFuzzySearchClick() {
        fuzzySearchComponentRef.value?.toggle()
      }
      onMounted(async () => {
        table.tableHeight.value = await useTableHeight()
        doRefresh()
      })
      function onConfigDetailConfirm() {
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
        configDetailRef,
        configPublishRef,
        fuzzySearchComponentRef,
        onUpdateItem,
        totalCount,
        isAdd,
        publishType,
        searchInfoRef,
        searchInfoColumn,
        searchInfoData,
        onConfigDetailConfirm,
        generalInfo,
        publishClick,
        rollbackClick,
        retrieveClick,
        onFuzzySearchClick,
        onPermission,
        selectedRows,
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
