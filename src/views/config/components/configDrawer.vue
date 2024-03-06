<template>
  <n-drawer
    v-model:show="showActive"
    :placement="placement"
    :on-mask-click="onMaskClick"
    width="50%"
  >
    <n-drawer-content :title="data.title">
      <editor :readonly="true" :value="data.info"></editor>
      <form-body ref="configInfoRef" :userdefineColumn="column" :userdefineData="data" />
    </n-drawer-content>
  </n-drawer>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue'
  import type { DrawerPlacement } from 'naive-ui'
  import editor from './editor.vue'

  export default defineComponent({
    name: 'moreLogDetailInfo',
    props: {
      column: {
        type: Object,
        default: () => {},
      },
      data: {
        type: Object,
        default: () => {},
      },
    },
    components: {
      editor,
    },
    setup(props, { emit }) {
      const showActive = ref(false)
      const placement = ref<DrawerPlacement>('right')
      function toggle() {
        showActive.value = !showActive.value
        return Promise.resolve(showActive.value)
      }
      function onMaskClick() {
        emit('onMaskClickCallback')
      }
      return {
        placement,
        toggle,
        showActive,
        onMaskClick,
      }
    },
  })
</script>
