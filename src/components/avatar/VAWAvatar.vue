<template>
  <div class="vaw-avatar-container">
    <n-dropdown trigger="hover" :options="options" size="large" @select="handleSelect">
      <div class="action-wrapper">
        <div class="avatar">
          <n-avatar color="#62B1D8" round> {{ userStore.userinfo.nickname }} </n-avatar>
        </div>
        <span class="nick-name">
          <n-icon class="tip">
            <CaretDownSharp />
          </n-icon>
        </span>
      </div>
    </n-dropdown>
  </div>
</template>

<script lang="ts">
  import { NIcon, useDialog } from 'naive-ui'
  import { defineComponent, h } from 'vue'
  import { Menu, LogInOutline, CaretDownSharp } from '@vicons/ionicons5'
  import useUserInfoStore from '@/store/modules/user-info'
  import { useRouter } from 'vue-router'

  export default defineComponent({
    name: 'VAWAvatar',
    components: { CaretDownSharp },
    setup() {
      const userStore = useUserInfoStore()
      const router = useRouter()
      const options = [
        {
          label: '退出登录',
          key: 'logout',
          icon: () =>
            h(NIcon, null, {
              default: () => h(LogInOutline),
            }),
        },
      ]
      const dialog = useDialog()
      function logout() {
        dialog.warning({
          title: '提示',
          content: '是否要退出当前账号？',
          positiveText: '退出',
          negativeText: '再想想',
          onPositiveClick: () => {
            userStore.logout().then(() => {
              window.location.reload()
            })
          },
        })
      }
      function handleSelect(key: string) {
        switch (key) {
          case 'logout':
            logout()
            break
        }
      }
      return {
        userStore,
        options,
        handleSelect,
      }
    },
  })
</script>

<style lang="scss" scoped>
  .vaw-avatar-container {
    .action-wrapper {
      display: flex;
      align-items: center;
      .avatar {
        width: calc(#{$logoHeight} - 15px);
        height: calc(#{$logoHeight} - 15px);
        display: flex;
        align-items: center;
        & > img {
          border: 1px solid #f6f6f6;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }
      }
      .nick-name {
        margin: 0 5px;
        .tip {
          transform: rotate(0);
          transition: transform $transitionTime;
          margin-left: 2px;
        }
      }
    }
  }
  .vaw-avatar-container:hover {
    cursor: pointer;
    color: var(--primary-color);
    .nick-name .tip {
      transform: rotate(180deg);
      transition: transform $transitionTime;
    }
  }
</style>
