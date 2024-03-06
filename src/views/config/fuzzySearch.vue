<template>
  <n-modal
    v-model:show="showModal"
    preset="card"
    title="配置文件 模糊搜索"
    size="small"
    class="modal-dialog-wrapper"
    header-style="padding: 10px 20px"
    :bordered="false"
    style="width: 70%"
    :segmented="segmented"
    display-directive="show"
    :close-on-esc="false"
    :mask-closable="false"
    :on-after-enter="modalInitial"
  >
    <form-body
      ref="fuzzySearchRef"
      :userdefineColumn="fuzzySearchColumn"
      :userdefineData="fuzzySearchData"
      @onUpdate="fuzzyDataChange"
    ></form-body>

    <TableBody ref="tableBody">
      <template #default>
        <n-data-table
          size="small"
          :loading="tableLoading"
          :data="dataList"
          :columns="tableColumns"
          :row-key="rowKey"
          :style="{ height: '450px' }"
          :flex-height="true"
        />
      </template>
    </TableBody>
    <configVersionInfo
      ref="configDetailRef"
      :column="configDetailColumn"
      :data="configDetailData"
    />
  </n-modal>
</template>

<script lang="ts">
  import configVersionInfo from './components/configDrawer.vue'
  import { onMounted, computed, defineComponent, nextTick, ref, watchEffect } from 'vue'
  import { useMessage, NInput, NSelect, NTag, useDialog, DataTableColumn } from 'naive-ui'
  import configRq from '@/api/modules/config'
  import _ from 'lodash'

  import {
    usePagination,
    useRowKey,
    useTable,
    useTableColumn,
    useRenderAction,
    tableColumnCanClick,
    TableActionModel,
  } from '@/hooks/table'

  export default defineComponent({
    name: 'fuzzySearch',
    props: {},
    components: {
      configVersionInfo,
    },
    emits: ['confirm', 'cancel'],
    setup(props, { emit }) {
      const message = useMessage()
      const fuzzySearchRef = ref(null)
      const showModal = ref(false)
      const table = useTable()
      const header = ref<HTMLElement | null>()
      const naiveDailog = useDialog()
      const editorContent = ref('')
      const editorRef = ref('')
      const rowKey = useRowKey('id')
      const segmented = {
        content: 'soft',
        footer: 'soft',
      }
      const pagination = usePagination(doRefresh)
      pagination.pageSize = 10
      const totalCount = ref(0)
      const configInfoExtraOptions = ref([])
      const configInfoExtraData = ref({})
      const configVersionList = ref([])
      const configDetailRef = ref(null)
      const configDetailData = ref({})
      const configDetailColumn = computed(() => {
        return [
          {
            label: '修改人',
            key: 'modifier',
          },
          {
            label: '修改时间',
            key: 'update_time',
          },
          {
            label: '发布人',
            key: 'publisher',
          },
          {
            label: '发布时间',
            key: 'publish_time',
          },
        ]
      })
      const tableColumns = useTableColumn(
        [
          {
            title: '名称',
            key: 'name',
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
            title: '版本',
            key: 'version',
          },
          {
            title: '操作',
            key: 'actions',
            width: 100,
            render: (rowData) => {
              return useRenderAction([
                {
                  label: '详情',
                  onClick: configDetailClick.bind(null, rowData),
                },
              ] as TableActionModel[])
            },
          },
        ],
        {
          align: 'center',
        } as DataTableColumn
      )
      const fuzzySearchColumn = computed(() => {
        return [
          {
            label: '搜索',
            key: 'condition',
            component: NInput,
          },
        ]
      })
      const fuzzySearchData = ref({})
      function toggle() {
        showModal.value = !showModal.value
        return Promise.resolve(showModal.value)
      }
      function show() {
        showModal.value = true
        return Promise.resolve(true)
      }
      function close() {
        showModal.value = false
        return Promise.resolve(false)
      }
      function modalInitial() {}
      function doRefresh() {}
      const fuzzyDataChange = _.debounce(() => {
        configRq(
          'generalVersionFuzzy',
          {},
          {
            page: pagination.page,
            limit: pagination.pageSize,
            ...fuzzySearchData.value,
          }
        ).then(({ payload }) => {
          table.handleSuccess({
            data: payload.general_version_list,
          })
          pagination.setTotalSize(payload.general_version_counts || 10)
          totalCount.value = payload.general_version_counts
        })
      }, 1000)
      function configDetailClick(data: any) {
        configDetailData.value = {
          title: data.version,
          info: data.content,
          ...data,
        }
        configDetailRef.value?.toggle()
      }
      onMounted(async () => {
        table.handleSuccess({
          data: [],
        })
      })
      return {
        ...table,
        showModal,
        toggle,
        show,
        close,
        segmented,
        fuzzySearchRef,
        fuzzySearchColumn,
        fuzzySearchData,
        editorContent,
        editorRef,
        modalInitial,
        configInfoExtraData,
        tableColumns,
        rowKey,
        pagination,
        totalCount,
        fuzzyDataChange,
        configDetailClick,
        configDetailRef,
        configDetailColumn,
        configDetailData,
      }
    },
  })
</script>
