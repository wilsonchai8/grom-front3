<template>
  <div class="action-items-wrapper">
    <span v-if="appConfig.actionBar.isShowRefresh" class="action-item" @click="onRefrehRoute">
      <n-icon size="18">
        <RefreshIcon />
      </n-icon>
    </span>
    <span v-if="appConfig.actionBar.isShowFullScreen" class="action-item" @click="onScreenFull">
      <n-icon size="18">
        <ExpandIcon />
      </n-icon>
    </span>
    <span class="action-item" @click="onShowSetting">
      <n-icon size="18">
        <SettingIcon />
      </n-icon>
    </span>
    <Setting ref="settingRef" />
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue'
  import { useMessage } from 'naive-ui'
  import screenfull from 'screenfull'
  import { useRoute, useRouter } from 'vue-router'
  import {
    SettingsOutline as SettingIcon,
    Expand as ExpandIcon,
    RefreshOutline as RefreshIcon,
  } from '@vicons/ionicons5'
  import useAppConfigStore from '@/store/modules/app-config'
  import { useDebounceFn } from '@vueuse/core'
  export default defineComponent({
    name: 'ActionItems',
    components: {
      SettingIcon,
      ExpandIcon,
      RefreshIcon,
    },
    setup() {
      const settingRef = ref()
      const appConfig = useAppConfigStore()
      const message = useMessage()
      const router = useRouter()
      const route = useRoute()
      function onScreenFull() {
        if (!screenfull.isEnabled) {
          message.error('当前浏览器不支持全屏操作')
          return false
        }
        screenfull.toggle()
      }
      const fn = useDebounceFn(() => {
        router.replace({ path: '/redirect' + route.path })
      })
      function onRefrehRoute() {
        fn()
      }
      function onShowSetting() {
        settingRef.value.openDrawer()
      }
      return {
        settingRef,
        appConfig,
        onScreenFull,
        onRefrehRoute,
        onShowSetting,
      }
    },
  })
</script>

<style lang="scss" scoped>
  .action-items-wrapper {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    z-index: 1;
    .action-item {
      min-width: 40px;
      display: flex;
      align-items: center;
      &:hover {
        cursor: pointer;
        color: var(--primary-color-hover);
      }
    }
    .badge-action-item {
      cursor: pointer;
      margin-right: 30px;
    }
  }
</style>
<style lang="scss" scoped>
  :deep(.n-input .n-input__border, .n-input .n-input__state-border) {
    border: none;
    border-bottom: 1px solid currentColor;
  }
  :deep(.el-input__inner) {
    border: none !important;
    height: 35px;
    line-height: 35px;
    color: currentColor !important;
    background-color: transparent !important;
  }
</style>
