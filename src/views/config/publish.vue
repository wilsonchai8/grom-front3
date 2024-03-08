<template>
  <n-modal
    v-model:show="showModal"
    preset="card"
    :title="`配置文件 ${title}`"
    size="small"
    class="modal-dialog-wrapper"
    header-style="padding: 10px 20px"
    :bordered="false"
    style="width: 90%"
    :segmented="segmented"
    display-directive="show"
    :close-on-esc="false"
    :closable="false"
    :mask-closable="false"
    :on-after-enter="modalInitial"
  >
    <form-body
      ref="configInfoRef"
      :userdefineColumn="configInfoColumn"
      :userdefineData="configInfoData"
    />
    <diff :oldString="oldConfig.content" :newString="newConfig.content" />
    <div>
      <n-grid x-gap="12" :cols="2">
        <n-gi>
          <n-tag v-if="publishType != 'retrieve'" type="info"> 当前版本 </n-tag>
          <n-divider />
          <form-body
            ref="oldConfigRef"
            :userdefineColumn="currentConfigVersionColumn"
            :userdefineData="oldConfig"
            @onUpdate="oldConfigSelectedCallback"
          />
        </n-gi>
        <n-gi>
          <n-tag
            v-if="publishType != 'retrieve'"
            :type="publishType == 'rollback' ? 'warning' : 'success'"
          >
            {{ publishType == 'rollback' ? '待回滚版本' : '待发布版本' }}</n-tag
          >
          <n-divider />
          <form-body
            ref="newConfigRef"
            :userdefineColumn="toPublishConfigVersionColumn"
            :userdefineData="newConfig"
            @onUpdate="newConfigSelectedCallback"
          />
        </n-gi>
      </n-grid>
    </div>
    <template #footer>
      <div>
        <n-space v-if="publishType == 'retrieve'">
          <n-button type="success" size="small" @click="onRetrieveConfirm">查看发布日志</n-button>
          <n-tag type="success" size="small"> 只显示最近100条日志 </n-tag>
        </n-space>
        <n-space style="float: right">
          <n-button :loading="loading" type="default" size="small" @click="onCancel">取消</n-button>
          <n-button
            v-if="publishType == 'publish'"
            :loading="loading"
            type="primary"
            size="small"
            :disabled="!statusCheck.canPublish(newConfig.status)"
            @click="onPublishConfirm"
            >发布</n-button
          >
          <n-button
            v-else-if="publishType == 'rollback'"
            :loading="loading"
            type="warning"
            size="small"
            :disabled="!statusCheck.canRollback(newConfig.status)"
            @click="onRollbackConfirm"
            >回滚</n-button
          >
        </n-space>
      </div>

      <div v-if="publishType == 'retrieve' && logVisible" class="logClass">
        <n-timeline item-placement="right">
          <n-timeline-item
            v-for="(item, index) in logList"
            line-type="dashed"
            :index="index"
            :content="item.content"
            :time="item.update_time"
            :type="timelineTypeSelector(item.status)"
          >
            <template #default>
              <p
                v-if="statusCheck.canLogDetail(item.status)"
                class="logContentClass"
                @click="logDetailClick(item)"
              >
                {{ item.name }} ({{ item.modifier }})
              </p>
              <p v-else> {{ item.name }} ({{ item.modifier }}) </p>
            </template>
          </n-timeline-item>
        </n-timeline>
      </div>
      <log-detail-info
        ref="moreDetailInfoRef"
        :column="logColumn"
        :data="configVersionLog"
        @click="moreDetailClick"
      />
    </template>
  </n-modal>
</template>

<script lang="ts">
  import globalStore from '@/store/modules/global'
  import diff from './components/diff.vue'
  import logDetailInfo from './components/configDrawer.vue'
  import { onMounted, computed, defineComponent, nextTick, ref, watchEffect } from 'vue'
  import { drag, unDrag } from '@/hooks/useDialogDragger'
  import { useMessage, NInput, NSelect, NTag } from 'naive-ui'
  import configRq from '@/api/modules/1_config'
  import _ from 'lodash'

  export default defineComponent({
    name: 'configDetail',
    props: {
      generalInfo: {
        type: Object,
        default: () => {},
      },
      publishType: {
        type: String,
        default: 'publish',
      },
    },
    components: {
      diff,
      logDetailInfo,
    },
    emits: ['confirm', 'cancel'],
    setup(props, { emit }) {
      const loading = ref(false)
      const useGlobal = globalStore()
      const title = ref('')
      const moreDetailInfoRef = ref(null) as any
      const logVisible = ref(false)
      const logList = ref([]) as any
      const oldConfig = ref({}) as any
      const newConfig = ref({}) as any
      const message = useMessage()
      const configVersionList = ref([])
      const configInfoRef = ref(null) as any
      const configVersionOptions = ref([])
      const showModal = ref(false)
      const header = ref<HTMLElement | null>()
      const editorRef = ref('')
      const configVersionLog = ref({})
      const segmented = {
        content: 'soft',
        footer: 'soft',
      }
      const currentConfigVersionColumn = computed(() => {
        var version = {
          label: '版本号',
          key: 'name',
        } as any
        if (['retrieve'].includes(props.publishType)) {
          version = {
            label: '版本号',
            key: 'name',
            component: NSelect,
            attribute: {
              style: 'width:170px',
              options: configVersionOptions.value,
            },
          }
        }
        return [
          version,
          {
            label: '状态',
            key: 'statusFormat',
          },
          {
            label: '发布时间',
            key: 'publish_time',
          },
          {
            label: '发布人',
            key: 'publisher',
          },
        ]
      })
      const toPublishConfigVersionColumn = computed(() => {
        var version = {
          label: '版本号',
          key: 'name',
        } as any
        if (['rollback', 'retrieve'].includes(props.publishType)) {
          version = {
            label: '版本号',
            key: 'name',
            component: NSelect,
            attribute: {
              'default-value': null,
              style: 'width:170px',
              options: configVersionOptions.value,
            },
          }
        }
        return [
          version,
          {
            label: '状态',
            key: 'statusFormat',
          },
          {
            label: '发布时间',
            key: 'publish_time',
          },
          {
            label: '发布人',
            key: 'publisher',
          },
        ]
      })
      const configInfoColumn = computed(() => {
        return [
          {
            label: '名称',
            key: 'name',
          },
          {
            label: '所属服务',
            key: 'belongto',
          },
          {
            label: '环境',
            key: 'comment',
          },
          {
            label: '环境名称',
            key: 'env',
          },
          {
            label: '环境前缀',
            key: 'prefix',
          },
        ]
      })
      const logColumn = computed(() => {
        return [
          {
            label: '修改人',
            key: 'modifier',
          },
          {
            label: '修改时间',
            key: 'update_time',
          },
        ]
      })
      const configInfoData = ref({}) as any
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
      function onPublishConfirm() {
        configInfoRef.value.$refs.userdefineRef.validate((valid: any) => {
          if (valid) {
            return
          } else {
            loading.value = true
            configRq(
              'generalPublish',
              {},
              {
                general_id: configInfoData.value.id,
                version_id: newConfig.value.id,
              }
            )
              .then(() => {
                message.success('发布成功')
                showModal.value = !showModal.value
                configInfoDataReset()
                emit('confirm')
              })
              .catch(() => {
                modalInitial()
              })
              .finally(() => {
                loading.value = false
              })
          }
        })
      }
      function onRollbackConfirm() {
        configInfoRef.value.$refs.userdefineRef.validate((valid: any) => {
          if (valid) {
            return
          } else {
            loading.value = true
            configRq(
              'generalRollback',
              {},
              {
                general_id: configInfoData.value.id,
                version_id: newConfig.value.id,
              }
            )
              .then(() => {
                message.success('回滚成功')
                showModal.value = !showModal.value
                configInfoDataReset()
                emit('confirm')
              })
              .catch(() => {
                modalInitial()
              })
              .finally(() => {
                loading.value = false
              })
          }
        })
      }
      function onRetrieveConfirm() {
        logVisible.value = !logVisible.value
        const { id } = props.generalInfo
        configRq('generalLogList', { general_id: id }, {}).then(({ payload }) => {
          logList.value = payload.logs
        })
      }
      function onCancel() {
        showModal.value = false
        configInfoDataReset()
        emit('cancel')
      }
      watchEffect(() => {
        if (showModal.value) {
          nextTick(() => {
            if (!header.value) {
              header.value = document.querySelector(
                '.n-modal-container .n-card-header'
              ) as HTMLElement
            }
            drag(header.value)
          })
        } else {
          nextTick(() => {
            if (header.value) {
              unDrag(header.value as HTMLElement)
            }
          })
        }
      })
      function configInfoDataReset() {
        configInfoData.value = {
          name: '',
          env: '',
          belongto: '',
          prefix: '',
        }
        oldConfig.value = { name: '' }
        newConfig.value = { name: '' }
        configVersionList.value = []
        configVersionOptions.value = []
        title.value = ''
        logVisible.value = false
        logList.value = []
        configVersionLog.value = {}
        configInfoRef.value.$refs.userdefineRef.restoreValidation()
      }
      function configInfoEdit(configInfo: any) {
        configInfoData.value = configInfo
      }
      function modalInitial() {
        title.value = { publish: '发布', rollback: '回滚', retrieve: '查看' }[props.publishType]
        const { id } = props.generalInfo
        configInfoData.value = props.generalInfo
        configRq('generalVersionList', { id: id }, {}).then(({ payload }) => {
          configVersionList.value = _.cloneDeep(payload.general_version_list)
          if (props.publishType == 'rollback') {
            rollbackInitial(payload.general_version_list)
          } else if (props.publishType == 'publish') {
            publishInitial(payload.general_version_list)
          } else {
            retrieveInitial(payload.general_version_list)
          }
          newConfig.value.statusFormat = useGlobal.general_status[newConfig.value.status]
          oldConfig.value.statusFormat = useGlobal.general_status[oldConfig.value.status]
        })
      }

      function publishInitial(versionList: any) {
        const maybeNextVersion = versionList[0]
        if (versionList.length <= 1) {
          oldConfig.value = { content: '' }
          newConfig.value = versionList[0]
        } else if (statusCheck.published(maybeNextVersion.status)) {
          oldConfig.value = versionList[0]
          newConfig.value = versionList[0]
        } else {
          oldConfig.value = versionList.find((item: any) => {
            return ['published', 'rollbacked', 'rollback_failed'].includes(item.status)
          })
          newConfig.value = versionList[0]
        }
      }
      function rollbackInitial(versionList: any) {
        versionList.forEach((item: any) => {
          configVersionOptions.value.push({
            label: item.name,
            value: item.name,
          })
        })
        if (versionList.length <= 1) {
          oldConfig.value = versionList[0]
          newConfig.value = versionList[0]
        } else {
          oldConfig.value = versionList[0]
          newConfig.value = versionList[1]
        }
      }
      function retrieveInitial(versionList: any) {
        versionList.forEach((item: any) => {
          configVersionOptions.value.push({
            label: item.name,
            value: item.name,
          })
        })
      }
      const statusCheck = {
        canPublish: (status: any) => {
          return ['modified', 'publish_failed'].includes(status)
        },
        canRollback: (status: any) => {
          return ['published', 'publish_failed', 'rollbacked', 'rollback_failed'].includes(status)
        },
        canLogDetail: (status: any) => {
          return ['modified', 'publish_failed', 'rollback_failed'].includes(status)
        },
        published: (status: any) => {
          return ['published'].includes(status)
        },
      }

      function newConfigSelectedCallback(data: any) {
        const configVersionListCopy = _.cloneDeep(configVersionList.value)
        newConfig.value = configVersionListCopy.find((item: any) => {
          return item.name == data.name
        })
        newConfig.value.statusFormat = useGlobal.general_status[newConfig.value.status]
      }

      function oldConfigSelectedCallback(data: any) {
        const configVersionListCopy = _.cloneDeep(configVersionList.value)
        oldConfig.value = configVersionListCopy.find((item: any) => {
          return item.name == data.name
        })
        oldConfig.value.statusFormat = useGlobal.general_status[oldConfig.value.status]
      }
      function logDetailClick(data: any) {
        configVersionLog.value = {
          title: data.name,
          info: data.info,
          update_time: data.update_time,
          modifier: data.modifier,
        }
        moreDetailInfoRef.value?.toggle()
      }
      function timelineTypeSelector(status: any) {
        return {
          published: 'success',
          rollbacked: 'success',
          publishing: 'warning',
          rollbacking: 'warning',
          publish_failed: 'error',
          rollback_failed: 'error',
        }[status]
      }
      function moreDetailClick() {}
      onMounted(() => {})
      return {
        loading,
        title,
        showModal,
        toggle,
        show,
        close,
        onPublishConfirm,
        onRollbackConfirm,
        onRetrieveConfirm,
        onCancel,
        segmented,
        configInfoRef,
        configInfoColumn,
        configInfoData,
        configInfoEdit,
        editorRef,
        modalInitial,
        oldConfig,
        newConfig,
        currentConfigVersionColumn,
        toPublishConfigVersionColumn,
        statusCheck,
        newConfigSelectedCallback,
        oldConfigSelectedCallback,
        logVisible,
        logList,
        logDetailClick,
        useGlobal,
        moreDetailInfoRef,
        moreDetailClick,
        configVersionLog,
        logColumn,
        timelineTypeSelector,
      }
    },
  })
</script>

<style lang="scss" scoped>
  .logClass {
    overflow: auto;
    margin-top: 20px;
    width: 50%;
    height: 200px;
  }
  .logContentClass {
    color: #34aae9;
    cursor: pointer;
  }
</style>
