<template>
  <n-modal
    v-model:show="showModal"
    preset="card"
    title="关联配置文件"
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
    :on-after-leave="dataReset"
  >
    <form-body
      ref="relatedRef"
      :userdefineColumn="relatedColumn"
      :userdefineData="relatedData"
      @onUpdate="updateCallback"
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
  import globalStore from '@/store/modules/global'
  import configVersionInfo from './components/configDrawer.vue'
  import { onMounted, computed, defineComponent, nextTick, ref, watchEffect, h } from 'vue'
  import { componentPermissionFun } from '@/utils/common'
  import {
    useMessage,
    NInput,
    NSelect,
    NButton,
    NTag,
    NIcon,
    NPopover,
    useDialog,
    DataTableColumn,
  } from 'naive-ui'
  import publicRq from '@/api/modules/public'
  import _ from 'lodash'
  import {
    usePagination,
    useRowKey,
    useTable,
    useTableColumn,
    userDefineAction,
    userDefineActionModel,
  } from '@/hooks/table'

  export default defineComponent({
    name: 'relatedGeneral',
    props: {
      publicInfo: {
        type: Object,
        default: () => {},
      },
    },
    components: {
      configVersionInfo,
    },
    emits: ['confirm', 'cancel'],
    setup(props, { emit }) {
      const message = useMessage()
      const relatedRef = ref(null)
      const showModal = ref(false)
      const table = useTable()
      const editorContent = ref('')
      const editorRef = ref('')
      const rowKey = useRowKey('id')
      const publicVersionList = ref([])
      const publicInfoExtraOptions = ref([])
      const currentPublicItem = ref()
      const useGlobal = globalStore()
      const segmented = {
        content: 'soft',
        footer: 'soft',
      }
      const pagination = usePagination(doRefresh)
      const totalCount = ref(0)
      const configInfoExtraOptions = ref([])
      const configInfoExtraData = ref({})
      const configVersionList = ref([])
      const configDetailRef = ref(null)
      const configDetailData = ref({})
      const relatedGeneralPublishStatus = ref({})
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
            width: 200,
            render: (rowData) => {
              const info = rowData ? rowData.status : ''
              const is_show = rowData && rowData.general_version_id != null
              const result =
                rowData.msg == null ? useGlobal.general_status[rowData.status] : rowData.msg
              const msg =
                '普通配置发布状态：' +
                '\n  发布时间：' +
                rowData.related_general_update_time +
                '\n  发布结果：' +
                result
              return userDefineAction([
                {
                  label: '详情',
                  component: NButton,
                  attribute: {
                    type: 'primary',
                    size: 'tiny',
                    secondary: true,
                    round: true,
                    onClick: configDetailClick.bind(null, rowData),
                  },
                },
                {
                  label: '发布',
                  component: NButton,
                  show: componentPermissionFun('public_related_general_publish_but'),
                  pop: true,
                  popText: '是否重新发布该普通配置？',
                  onPopPositiveClick: configPublishClick.bind(null, rowData),
                  attribute: {
                    type: 'success',
                    size: 'tiny',
                    secondary: true,
                    round: true,
                  },
                },
                {
                  label: msg,
                  component: NPopover,
                  show: is_show,
                  attribute: {
                    trigger: 'hover',
                    placement: 'right-end',
                  },
                  slot: {
                    trigger: () => {
                      return h(
                        NIcon,
                        {
                          class: 'iconfont icon-zoomin',
                          size: '12',
                          color: '#0e7a0d',
                          // onClick: relatedGeneralPublishClick.bind(null, rowData),
                        },
                        {}
                      )
                    },
                  },
                },
              ] as userDefineActionModel[])
            },
          },
        ],
        {
          align: 'center',
        } as DataTableColumn
      )
      const relatedColumn = computed(() => {
        return [
          {
            label: '版本',
            key: 'version',
            component: NSelect,
            attribute: {
              style: 'width:180px',
              options: publicInfoExtraOptions.value,
            },
          },
          {
            label: 'key',
            key: 'k',
          },
          {
            label: 'value',
            key: 'v',
          },
        ]
      })
      const relatedData = ref({ version: null })
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
      function doRefresh() {}
      function modalInitial() {
        const { id } = props.publicInfo
        publicRq('publicVersionList', { id: id }, {}).then(({ payload }) => {
          publicVersionList.value = payload.public_item_version_list
          publicVersionList.value.forEach((item: any) => {
            publicInfoExtraOptions.value.push({
              label: item.name,
              value: item.name,
            })
          })
        })
      }
      function configDetailClick(data: any) {
        configDetailData.value = {
          title: data.version,
          info: data.content,
          ...data,
        }
        configDetailRef.value?.toggle()
      }
      function configPublishClick(data: any) {
        const related_general_list = [
          {
            general_id: data.general_id,
            version_id: data.version_id,
          },
        ]
        publicRq(
          'publicRelatedGeneralPublish',
          {},
          {
            public_item_version_id: currentPublicItem.value.id,
            related_general_list: related_general_list,
          }
        ).then(() => {
          message.success('下发任务成功')
        })
      }
      function relatedGeneralPublishClick(data: any) {
        relatedGeneralPublishStatus.value = data.status
      }
      function updateCallback(data: any) {
        currentPublicItem.value = publicVersionList.value.find((item) => {
          return item.name == data.version
        })
        const payload_args = {
          ...currentPublicItem.value,
          env_id: props.publicInfo.env_id,
          k: props.publicInfo.k,
        }
        relatedData.value = payload_args
        publicRq('publicRelatedGeneral', { ...payload_args }, {}).then(({ payload }) => {
          table.handleSuccess({
            data: payload.related_general,
          })
        })
      }
      function dataReset() {
        publicVersionList.value = []
        publicInfoExtraOptions.value = []
        currentPublicItem.value = []
        relatedData.value = { version: null }
        table.dataList.value = []
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
        relatedRef,
        relatedColumn,
        relatedData,
        editorContent,
        editorRef,
        modalInitial,
        configInfoExtraData,
        tableColumns,
        rowKey,
        pagination,
        totalCount,
        configDetailClick,
        configPublishClick,
        configDetailRef,
        configDetailColumn,
        configDetailData,
        updateCallback,
        dataReset,
      }
    },
  })
</script>
