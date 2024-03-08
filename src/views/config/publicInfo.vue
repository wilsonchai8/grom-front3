<template>
  <n-modal
    v-model:show="showModal"
    preset="card"
    :title="isAdd ? '公共配置 添加' : '公共配置 编辑'"
    size="small"
    class="modal-dialog-wrapper"
    header-style="padding: 10px 20px"
    :bordered="false"
    style="width: 50%"
    :segmented="segmented"
    display-directive="show"
    :close-on-esc="false"
    :closable="false"
    :mask-closable="false"
    :on-after-enter="modalInitial"
  >
    <form-body
      ref="publicBaseInfoRef"
      :userdefineColumn="publicBaseInfoColumn"
      :userdefineData="publicBaseInfoData"
    ></form-body>
    <n-divider />
    <div style="text-align: center">
      <form-body
        ref="publicPayloadRef"
        :userdefineColumn="publicPayloadColumn"
        :userdefineData="publicPayloadData"
      ></form-body>
    </div>
    <div v-if="!isAdd">
      <n-divider />
      <form-body
        ref="configInfoExtraRef"
        :userdefineColumn="publicInfoExtraColumn"
        :userdefineData="publicInfoExtraData"
        @onUpdate="updateCallback"
      />
    </div>
    <template #footer>
      <div style="float: right">
        <n-space>
          <n-button type="default" size="small" @click="onCancel">取消</n-button>
          <n-button v-if="!isPublish" type="primary" size="small" @click="onConfirm">确定</n-button>
          <n-button v-if="isPublish" :disabled="publicInfoExtraData.status != 'modified'" type="success" size="small" @click="onPublish">发布</n-button>
          <n-button v-if="isPublish" :disabled="publicInfoExtraData.status != 'published'" type="warning" size="small" @click="onRollback">回滚</n-button>
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
  import publicRq from '@/api/modules/2_public'
  import { Base64 } from 'js-base64'
  import _ from 'lodash'

  export default defineComponent({
    name: 'publicInfo',
    props: {
      publicInfo: {
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
      isPublish: {
        type: Boolean,
        default: false,
      },
    },
    components: {
      editor,
    },
    emits: ['confirm', 'cancel'],
    setup(props, { emit }) {
      const useGlobal = globalStore()
      const message = useMessage()
      const publicBaseInfoRef = ref(null)
      const publicPayloadRef = ref(null)
      const showModal = ref(false)
      const header = ref<HTMLElement | null>()
      const publicPayloadData = ref({ key: '', value: '' })
      const segmented = {
        content: 'soft',
        footer: 'soft',
      }
      const publicPayloadColumn = computed(() => {
        return [
          {
            label: 'key',
            key: 'key',
            component: NInput,
            rule: {
              required: true,
              trigger: ['blur', 'input'],
              message: 'key',
            },
            attribute: {
              disabled: !props.isAdd,
              style: 'width:220px',
              placeholder: 'key',
            },
          },
          {
            label: 'value',
            key: 'value',
            component: NInput,
            rule: {
              required: true,
              trigger: ['blur', 'input'],
              message: 'value',
            },
            attribute: {
              disabled: props.isPublish,
              style: 'width:220px',
              placeholder: 'value',
            },
          },
        ]
      })
      const publicInfoExtraColumn = computed(() => {
        const isDisabled = props.isAdd
        return [
          {
            label: '版本号',
            key: 'name',
            component: NSelect,
            attribute: {
              disabled: isDisabled,
              style: 'width:180px',
              options: publicInfoExtraOptions.value,
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
      })
      const publicInfoExtraOptions = ref([])
      const publicInfoExtraData = ref({}) as any
      const publicVersionList = ref([])
      const publicBaseInfoColumn = computed(() => {
        const isDisabled = !props.isAdd
        return [
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
            label: '前缀',
            key: 'prefix',
          },
        ]
      })
      const publicBaseInfoData = ref({
        env: '',
        prefix: '',
        env_id: null,
      }) as any
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
      function onConfirm() {
        publicBaseInfoRef.value.$refs.userdefineRef.validate((valid: any) => {
          if (valid) {
            return
          } else {
            const action = props.isAdd == true ? 'publicAdd' : 'publicUpdate'
            publicRq(
              action,
              {},
              {
                id: publicInfoExtraData.value.id,
                version_id: publicInfoExtraData.value.id,
                key: Base64.encode(publicPayloadData.value.key),
                value: Base64.encode(publicPayloadData.value.value),
                ...publicBaseInfoData.value,
              }
            ).then(() => {
              const msg = props.isAdd == true ? '公共配置添加成功' : '公共配置更新成功'
              message.success(msg)
              showModal.value = !showModal.value
              publicBaseInfoDataReset()
              emit('confirm')
            })
          }
        })
      }
      function onCancel() {
        showModal.value = false
        publicBaseInfoDataReset()
        emit('cancel')
      }
      function onPublish() {
        const id = publicBaseInfoData.value.id
        const version_id = publicInfoExtraData.value.id
        publicRq(
          'publicPublish',
          {},
          {
            id: id,
            version_id: version_id,
          }
        ).then(() => {
          message.success('公共配置发布成功')
          showModal.value = false
          publicBaseInfoDataReset()
        })
      }
      function onRollback() {
        const id = publicBaseInfoData.value.id
        const version_id = publicInfoExtraData.value.id
        publicRq(
          'publicRollback',
          {},
          {
            id: id,
            version_id: version_id,
          }
        ).then(() => {
          message.success('公共配置回滚成功')
          showModal.value = false
          publicBaseInfoDataReset()
        })
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
      function publicBaseInfoDataReset() {
        publicBaseInfoData.value = {
          env: '',
          prefix: '',
          env_id: null,
        }
        publicPayloadData.value = { key: '', value: '' }
        publicInfoExtraOptions.value = []
        publicBaseInfoRef.value.$refs.userdefineRef.restoreValidation()
        publicPayloadRef.value.$refs.userdefineRef.restoreValidation()
      }
      function modalInitial() {
        if (!props.isAdd) {
          publicBaseInfoData.value = props.publicInfo
          const { id } = props.publicInfo
          publicRq('publicVersionList', { id: id }, {}).then(({ payload }) => {
            publicVersionList.value = payload.public_item_version_list
            publicVersionList.value.forEach((item: any) => {
              publicInfoExtraOptions.value.push({
                label: item.name,
                value: item.name,
              })
            })

            publicInfoExtraData.value = _.cloneDeep(publicVersionList.value[0])
            publicInfoExtraData.value.statusString =
              useGlobal.general_status[publicInfoExtraData.value.status]
            publicPayloadData.value.key = props.publicInfo.k
            publicPayloadData.value.value = publicInfoExtraData.value.v
          })
        }
      }
      function updateCallback(data: any) {
        const publicVersionListCopy = _.cloneDeep(publicVersionList.value)
        const target = publicVersionListCopy.find((item: any) => {
          return data.name == item.name
        }) as any
        publicInfoExtraData.value = target
        publicInfoExtraData.value.statusString = useGlobal.general_status[publicInfoExtraData.value.status]
        publicPayloadData.value.value = target.v
      }
      watch(
        () => publicBaseInfoData.value.env_id,
        (newVal) => {
          if (newVal == null) {
            publicBaseInfoData.value.prefix = ''
          } else {
            const targetEnv = useGlobal.envListSelect.find((item: any) => {
              return item.value == newVal
            })
            publicBaseInfoData.value.prefix = targetEnv.other.prefix
          }
        }
      )
      onMounted(() => {})
      return {
        showModal,
        toggle,
        show,
        close,
        onPublish,
        onConfirm,
        onCancel,
        onRollback,
        segmented,
        publicBaseInfoRef,
        publicPayloadRef,
        publicBaseInfoColumn,
        publicBaseInfoData,
        publicPayloadColumn,
        publicPayloadData,
        modalInitial,
        publicInfoExtraColumn,
        publicInfoExtraData,
        updateCallback,
      }
    },
  })
</script>
