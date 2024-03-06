<template>
  <div class="box-wrapper">
    <div id="firstCard" class="flex">
      <n-card class="box-card personal-box" :content-style="{ padding: '10px' }">
        <div class="info-wrapper">
          <div class="avatar-wrapper">
            <div class="avatar" :class="{ 'avatar-touch': touched, 'avatar-end': uploaded }">
              <n-avatar :size="96.5" color="#62B1D8" round>
                <h1 style="font-size: 150%; font-family: verdana">{{ userinfo.nickname }}</h1>
              </n-avatar>
            </div>
          </div>
          <div class="des-wrapper">
            {{ userinfo.username }}
          </div>
          <div class>
            <n-space>
              <n-tag type="info" size="small">待续</n-tag>
            </n-space>
          </div>
        </div>
      </n-card>
      <n-card
        class="flex-1 ml-2 box-card wating-box"
        :content-style="{ padding: '10px' }"
        :header-style="{ padding: '10px' }"
      >
        <template #header>
          <span class="text-sm">基本信息</span>
        </template>
        <template #header-extra>
          <n-space>
            <n-button v-if="isEdit" type="error" @click="abandonClick" text>
              <template #icon>
                <n-icon>
                  <abandon-icon />
                </n-icon>
              </template>
            </n-button>
            <n-button v-if="isEdit" type="success" @click="confirmClick" text>
              <template #icon>
                <n-icon>
                  <confirm-icon />
                </n-icon>
              </template>
            </n-button>
            <n-button v-if="!isEdit" type="primary" @click="editClick" text>
              <template #icon>
                <n-icon>
                  <edit-icon />
                </n-icon>
              </template>
            </n-button>
          </n-space>
        </template>
        <n-descriptions
          label-style="background-color: #DBE2E5; width:120px"
          label-placement="left"
          :column="2"
          bordered
        >
          <n-descriptions-item
            v-for="(item, index) of baseInfoColumn"
            :key="index"
            :label="item.title"
          >
            <form-body
              v-if="isEdit"
              ref="baseinfoRef"
              :userdefineColumn="[item]"
              :userdefineData="baseInfo"
            />
            <span v-else>{{ baseInfo[item.key] }} </span>
          </n-descriptions-item>
        </n-descriptions>
      </n-card>
    </div>
    <div>
      <n-card
        title="功能导航"
        class="box-card flex-sub"
        :header-style="{ padding: '10px' }"
        :content-style="{ padding: '10px' }"
        :style="{ height: `${secondCardHeight}px` }"
      >
        <n-grid
          class="mt-4 mb-4"
          :y-gap="15"
          :x-gap="15"
          cols="2 s:2 m:3 l:6 xl:6 2xl:6"
          responsive="screen"
        >
          <n-grid-item v-for="(item, index) of fastActions" :key="index">
            <n-card @click="fastActionClick(item)">
              <div class="flex flex-col items-center justify-center">
                <n-icon>
                  <template #default>
                    <svg-icon prefix="iconfont" :name="item.icon" :style="{ color: item.color }" />
                  </template>
                </n-icon>
                <span class="mt-1">{{ item.title }}</span>
              </div>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-card>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, h, onMounted, computed } from 'vue'
  import { useDialog, NInput, NTag, NForm, NFormItem, useMessage, FormItemRule } from 'naive-ui'
  import {
    CloseOutline as AbandonIcon,
    CheckmarkOutline as ConfirmIcon,
    CreateOutline as EditIcon,
  } from '@vicons/ionicons5'
  import { useTable, useTableHeight } from '@/hooks/table'
  import useUserInfoStore from '@/store/modules/user-info'
  import permissionStore from '@/store/modules/permission'
  import userRq from '@/api/modules/user'
  import { useRouter } from 'vue-router'
  import { random } from 'lodash-es'
  import md5 from 'js-md5'
  export default defineComponent({
    name: 'Overview',
    components: {
      AbandonIcon,
      EditIcon,
      ConfirmIcon,
      baseInfoInput: {
        render(vm: any) {
          const { isEdit, value, password } = vm.$attrs
          if (isEdit) {
            return h(NInput, { type: password ? 'password' : 'text' }, {})
          } else {
            return value
          }
        },
      },
    },
    setup() {
      const router = useRouter()
      const baseInfo = ref({})
      const message = useMessage()
      const isEdit = ref(false)
      const touched = ref(false)
      const uploaded = ref(false)
      const userStore = useUserInfoStore()
      const permissionUseStore = permissionStore()
      const naiveDailog = useDialog()
      const baseinfoRef = ref()
      const avatarTouchStart = () => {
        touched.value = true
      }
      const baseInfoColumn = computed(() => {
        return [
          {
            title: '账户',
            key: 'username',
          },
          {
            title: '密码',
            key: 'password',
            component: NInput,
            attribute: {
              type: 'password',
            },
            rule: {
              required: true,
              trigger: ['blur', 'input'],
              pattern: /^$|^[A-Za-z0-9-_~!@#$%^&*]{8,20}$/,
              message: '字符、数字、-_~!@#$%^&*组成，8-20个字符',
              validator: custom_validate,
            },
          },
          {
            title: '姓名',
            key: 'nickname',
          },
          {
            title: '角色',
            key: 'rolename',
          },
          {
            title: '邮箱',
            key: 'email',
            component: NInput,
            rule: {
              required: true,
              trigger: ['blur', 'input'],
              message: '字符、数字、-_@组成，最多50个字符',
              pattern: /^$|^[A-Za-z0-9-_@.]{1,50}$/,
              validator: custom_validate,
            },
          },
          {
            title: '其他联系方式',
            key: 'contact',
            component: NInput,
            rule: {
              required: true,
              trigger: ['blur', 'input', 'change'],
              message: '字符、数字、-_@组成，最多50个字符',
              pattern: /^$|^[A-Za-z0-9-_@.]{1,50}$/,
              validator: custom_validate,
            },
          },
        ]
      })
      function custom_validate(rule: FormItemRule, value: string) {
        const { pattern } = rule
        return pattern.test(value)
      }
      function abandonClick() {
        naiveDailog.warning({
          title: '提示',
          content: '确定要放弃？',
          positiveText: '放弃',
          negativeText: '再想想',
          onPositiveClick: () => {
            isEdit.value = false
            initBaseInfo()
          },
        })
      }
      function asyncBaseinfoCheck() {
        return new Promise((resolve) => {
          var commit = true
          baseinfoRef.value.forEach((item: any) => {
            item.$refs.userdefineRef
              .validate((valid: any) => {
                if (valid) {
                  commit = false
                }
              })
              .then(() => {
                resolve(commit)
              })
          })
        })
      }
      function confirmClick() {
        asyncBaseinfoCheck().then((res) => {
          if (res) {
            naiveDailog.warning({
              title: '提示',
              content: '确定要修改？',
              positiveText: '确定',
              negativeText: '再想想',
              onPositiveClick: () => {
                isEdit.value = false
                const password = md5(baseInfo.value.password)
                baseInfo.value.password = ''
                userStore.userinfo.email = baseInfo.value.email
                userStore.userinfo.contact = baseInfo.value.contact
                userRq(
                  'userSelfUpdate',
                  {},
                  {
                    id: userStore.userinfo.id,
                    email: baseInfo.value.email,
                    contact: baseInfo.value.contact,
                    password: password,
                  }
                ).then(() => {
                  message.success('更新成功')
                })
              },
            })
          }
        })
      }
      function editClick() {
        isEdit.value = true
      }
      function initBaseInfo() {
        baseInfo.value.username = userStore.userinfo.username
        baseInfo.value.password = ''
        baseInfo.value.nickname = userStore.userinfo.nickname
        baseInfo.value.rolename = userStore.userinfo.rolename
        baseInfo.value.email = userStore.userinfo.email
        baseInfo.value.contact = userStore.userinfo.contact
      }
      const COLORS = ['#67C23A', '#E6A23C', '#F56C6C', '#409EFF']
      const fastActions = computed(() => {
        const result = [] as any
        permissionUseStore.userDefineRoutes.forEach((item: any) => {
          if (item.children) {
            item.children.forEach((piece: any) => {
              result.push({
                title: piece.menuName,
                icon: piece.icon,
                path: piece.menuUrl,
                color: COLORS[random(0, COLORS.length)],
              })
            })
          }
        })
        return result
      })
      const fastActionClick = ({ path = '/' }) => {
        router.push(path)
      }
      const secondCardHeight = ref()
      const table = useTable()
      onMounted(async () => {
        const mainHeight = await useTableHeight()
        const firstCardheight = document.querySelector('#firstCard')?.clientHeight || 0
        secondCardHeight.value = mainHeight - firstCardheight + 20
        initBaseInfo()
      })
      return {
        ...table,
        touched,
        uploaded,
        userinfo: userStore.userinfo,
        baseInfo,
        avatarTouchStart,
        isEdit,
        abandonClick,
        confirmClick,
        editClick,
        fastActions,
        fastActionClick,
        baseInfoColumn,
        baseinfoRef,
        secondCardHeight,
      }
    },
  })
</script>
<style lang="scss" scoped>
  .el-tag--dark + .el-tag--dark {
    margin-left: 10px;
    margin-top: 10px;
  }
  .box-wrapper {
    .personal-box {
      width: 30%;
      .info-wrapper {
        text-align: center;
        .avatar-wrapper {
          display: inline-block;
          width: 6rem;
          height: 6rem;
          margin-top: 20px;
          position: relative;
          .avatar {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            transform-origin: bottom;
            transform: rotate(0deg);
            z-index: 1;
            transition: all 0.5s ease-in-out;
            & > img {
              width: 100%;
              height: 100%;
              border-radius: 50%;
              border: 2px solid rgb(245, 241, 7);
            }
          }
          .avatar-touch {
            transform: rotate(180deg);
          }
          .avatar-end {
            transform: rotate(0deg);
          }
          .camera-layer {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.6);
            border-radius: 50%;
          }
        }
        .des-wrapper {
          width: 70%;
          margin: 0 auto;
          font-size: 14px;
          padding: 15px;
        }
        .text-wrapper {
          font-size: 0.8rem;
          margin-top: 10px;
          width: 50%;
          margin: 0 auto;
          .label {
            display: inline-block;
            width: 40%;
            text-align: right;
          }
          .value {
            display: inline-block;
            width: 60%;
            text-align: left;
          }
        }
        .text-wrapper + .text-wrapper {
          margin-top: 15px;
        }
      }
    }
    .message-wrapper {
      border-bottom: 1px solid #f5f5f5;
      padding-bottom: 10px;
      .notify {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }
      .message-title {
        font-size: 1rem;
      }
      .content {
        font-size: 0.8rem;
        margin-top: 10px;
        line-height: 1rem;
      }
    }
    .message-wrapper + .message-wrapper {
      margin-top: 10px;
    }
    .wating-box {
      width: 30%;
      .wating-item {
        padding: 10px;
        border-bottom: 1px solid #f5f5f5;
      }
    }
  }
</style>
