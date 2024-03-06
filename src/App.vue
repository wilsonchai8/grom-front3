<template>
  <n-notification-provider>
    <n-message-provider>
      <global-message>
        <router-view />
      </global-message>
    </n-message-provider>
  </n-notification-provider>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import globalMessage from '@/components/GlobalMessage.vue'

  export default defineComponent({
    name: 'App',
    components: {
      globalMessage,
    },
  })
</script>
