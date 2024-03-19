<template>
  <n-modal
    v-model:show="showModal"
    preset="card"
    :title="isAdd ? '配置文件 添加' : '配置文件 编辑'"
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
    ></form-body>
    <editor
      ref="editorRef"
      :readonly="isRender"
      :value="isRender ? editorContentRender : editorContent"
    ></editor>
    <n-space>
      <n-tag style="margin-top: 5px" :type="currentVersion.type">
        <span>{{ currentVersion.text }}</span>
      </n-tag>
      <n-tag v-if="isRender" style="margin-top: 5px" type="error">渲染模式，不能编辑</n-tag>
    </n-space>
    <div v-if="!isAdd">
      <n-divider />
      <form-body
        ref="configInfoExtraRef"
        :userdefineColumn="configInfoExtraColumn()"
        :userdefineData="configInfoExtraData"
        @onUpdate="updateCallback"
      />
    </div>
    <template #footer>
      <div style="float: right">
        <n-space>
          <n-button type="default" size="small" @click="onCancel">取消</n-button>
          <n-button
            v-if="!isAdd"
            :disabled="configInfoExtraData.status != 'modified' || isRender"
            type="warning"
            size="small"
            @click="onAbandon"
            >放弃修改</n-button
          >
          <ComponentPermission name="general_render_but">
            <n-button v-if="!isAdd" type="success" size="small" @click="onRender">
              {{ isRender ? '关闭渲染' : '渲染' }}
            </n-button>
          </ComponentPermission>
          <n-button :disabled="isRender" type="primary" size="small" @click="onConfirm"
            >保存</n-button
          >
        </n-space>
      </div>
    </template>
  </n-modal>
</template>

<script lang="ts">
  import globalStore from '@/store/modules/global'
  import editor from './components/editor.vue'
  import { onMounted, computed, defineComponent, nextTick, ref, watchEffect, watch } from 'vue'
  import { drag, unDrag } from '@/hooks/useDialogDragger'
  import { useMessage, NInput, NSelect, NTag, useDialog } from 'naive-ui'
  import configRq from '@/api/modules/1_config'
  import { Base64 } from 'js-base64'
  import _ from 'lodash'

  export default defineComponent({
    name: 'configDetail',
    props: {
      generalInfo: {
        type: Object,
        default: () => {},
      },
      title: {
        type: String,
        default: '配置文件',
      },
      isAdd: {
        type: Boolean,
        default: true,
      },
    },
    components: {
      editor,
    },
    emits: ['confirm', 'cancel'],
    setup(props, { emit }) {
      const useGlobal = globalStore()
      const isRender = ref(false) as any
      const message = useMessage()
      const configInfoRef = ref(null)
      const configInfoExtraRef = ref(null)
      const showModal = ref(false)
      const header = ref<HTMLElement | null>()
      const naiveDailog = useDialog()
      const editorContent = ref('')
      const currentVersion = ref({
        type: '',
        text: '',
      })
      const editorContentRender = ref('')
      const editorRef = ref('')
      const segmented = {
        content: 'soft',
        footer: 'soft',
      }
      const configInfoExtraOptions = ref([])
      function configInfoExtraColumn() {
        return [
          {
            label: '版本号',
            key: 'name',
            component: NSelect,
            attribute: {
              id: 'version',
              style: 'width:180px',
              options: configInfoExtraOptions.value,
              disabled: isRender.value,
            },
          },
          {
            label: '状态',
            key: 'statusString',
          },
          {
            label: '修改时间',
            key: 'update_time',
          },
          {
            label: '修改人',
            key: 'modifier',
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
      }
      const configInfoExtraData = ref({}) as any
      const configVersionList = ref([])
      const configInfoColumn = computed(() => {
        const isDisabled = !props.isAdd
        return [
          {
            label: '名称',
            key: 'name',
            rule: {
              required: true,
              trigger: ['blur', 'input'],
              message: '字符、数字、-_@组成，最多50个字符',
              pattern: /^[A-Za-z0-9-_@.]{1,50}$/,
            },
            attribute: {
              disabled: isDisabled,
            },
            component: NInput,
          },
          {
            label: '所属服务',
            key: 'belongto',
            rule: {
              required: true,
              trigger: ['blur', 'input'],
              message: '字符、数字、-_@组成，最多50个字符',
              pattern: /^[A-Za-z0-9-_@.]{1,50}$/,
            },
            attribute: {
              disabled: isDisabled,
            },
            component: NInput,
          },
          {
            label: '环境',
            key: 'env_id',
            rule: {
              required: true,
              type: 'integer',
              trigger: ['blur', 'input'],
              message: '请选择',
            },
            attribute: {
              style: 'width:180px',
              options: useGlobal.envListSelect,
              disabled: isDisabled,
            },
            component: NSelect,
          },
          {
            label: '环境名',
            key: 'env',
          },
          {
            label: '前缀',
            key: 'prefix',
          },
        ]
      })
      const configInfoData = ref({
        name: '',
        env: '',
        belongto: '',
        prefix: '',
        env_id: null,
      })
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
      async function onConfirm() {
        const previous_content = editorContent.value
        const current_content = editorRef.value.getContent()
        if (!props.isAdd) {
          if (previous_content === current_content) {
            message.warning('文件内容没有变化')
            return
          }
        }
        naiveDailog.warning({
          title: '提示',
          content: '确定要保存此次修改？',
          positiveText: '保存',
          negativeText: '再想想',
          onPositiveClick: () => {
            const msg = props.isAdd == true ? '配置文件添加成功' : '配置文件更新成功'
            configInfoRef.value.$refs.userdefineRef.validate((valid: any) => {
              if (valid) {
                return
              } else {
                const action = props.isAdd == true ? 'generalAdd' : 'generalUpdate'
                configRq(
                  action,
                  {},
                  {
                    content: Base64.encode(current_content),
                    version_id: configInfoExtraData.value.id,
                    ...configInfoData.value,
                  }
                ).then(() => {
                  message.success(msg)
                  editorContent.value = current_content
                  if (props.isAdd) {
                    showModal.value = !showModal.value
                    configInfoDataReset()
                    emit('confirm')
                  }
                })
              }
            })
          },
        })
      }
      function onCancel() {
        showModal.value = false
        configInfoDataReset()
        emit('cancel')
      }
      function onAbandon() {
        naiveDailog.warning({
          title: '提示',
          content: '确定要放弃此次修改？',
          positiveText: '放弃',
          negativeText: '再想想',
          onPositiveClick: () => {
            configRq('generalAbandon', {}, { ...configInfoExtraData.value }).then(() => {
              message.success('配置文件放弃成功')
              showModal.value = !showModal.value
              configInfoDataReset()
            })
          },
        })
      }
      async function _renderGeneral() {
        configRq(
          'generalRender',
          {},
          {
            id: props.generalInfo.id,
            version_id: configInfoExtraData.value.id,
          }
        ).then(({ payload }) => {
          editorContentRender.value = payload.content
        })
        isRender.value = !isRender.value
      }
      function onRender() {
        const previousContent = editorContent.value
        const currentContent = editorRef.value.getContent()
        if (previousContent !== currentContent) {
          message.warning('配置文件内容有改动，请先保存之后再渲染')
          return
        }
        if (!isRender.value) {
          _renderGeneral()
        } else {
          isRender.value = !isRender.value
        }
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
          env_id: null,
        }
        isRender.value = false
        editorContentRender.value = ''
        editorContent.value = ''
        currentVersion.value = { type: '', text: '' }
        configInfoExtraOptions.value = []
        configInfoRef.value.$refs.userdefineRef.restoreValidation()
      }
      function modalInitial() {
        if (!props.isAdd) {
          const { id } = props.generalInfo
          configInfoData.value = props.generalInfo
          configRq('generalVersionList', { id: id }, {}).then(({ payload }) => {
            configVersionList.value = payload.general_version_list
            configVersionList.value.forEach((item: any) => {
              configInfoExtraOptions.value.push({
                label: item.name,
                value: item.name,
              })
            })
            configInfoExtraData.value = _.cloneDeep(configVersionList.value[0])
            configInfoExtraData.value.statusString =
              useGlobal.general_status[configInfoExtraData.value.status]
            editorContent.value = configInfoExtraData.value.content
            getCurrentVersionPublished()
          })
        }
      }
      function updateCallback(data: any) {
        const configVersionListCopy = _.cloneDeep(configVersionList.value)
        const target = configVersionListCopy.find((item: any) => {
          return data.name == item.name
        }) as any
        configInfoExtraData.value = target
        configInfoExtraData.value.statusString =
          useGlobal.general_status[configInfoExtraData.value.status]
        editorContent.value = target.content
        getCurrentVersionPublished()
      }
      watch(
        () => configInfoData.value.env_id,
        (newVal) => {
          if (newVal == null) {
            configInfoData.value.env = ''
            configInfoData.value.prefix = ''
          } else {
            const targetEnv = useGlobal.envListSelect.find((item: any) => {
              return item.value == newVal
            })
            configInfoData.value.prefix = targetEnv.other.prefix
            configInfoData.value.env = targetEnv.other.name
          }
        }
      )
      function getCurrentVersionPublished() {
        const onlineVersion = configVersionList.value.find((item: any, index: any) => {
          return item.is_publish
        })
        if (configInfoExtraData.value.is_publish === 0) {
          currentVersion.value.type = 'primary'
          currentVersion.value.text = '未发布版本'
        } else if (onlineVersion && onlineVersion.id === configInfoExtraData.value.id) {
          currentVersion.value.type = 'success'
          currentVersion.value.text = '线上版本'
        } else {
          currentVersion.value.type = 'warning'
          currentVersion.value.text = '历史版本'
        }
      }

      onMounted(() => {})
      return {
        showModal,
        toggle,
        show,
        close,
        onConfirm,
        onCancel,
        onAbandon,
        onRender,
        editorContentRender,
        segmented,
        configInfoRef,
        configInfoExtraRef,
        configInfoColumn,
        configInfoData,
        editorContent,
        editorRef,
        modalInitial,
        configInfoExtraColumn,
        configInfoExtraData,
        updateCallback,
        isRender,
        currentVersion,
      }
    },
  })
</script>
