<template>
  <div>
    <code-diff
      :new-string="newString"
      :old-string="oldString"
      output-format="side-by-side"
      maxHeight="300px"
      language="plaintext"
      :noDiffLineFeed="true"
    />
  </div>
</template>

<script lang="ts">
  import { CodeDiff } from 'v-code-diff'
  export default {
    name: 'editorDiff',
    components: {
      CodeDiff,
    },
    emits: ['update:value'],
    props: {
      oldString: {
        type: String,
        default: '',
      },
      newString: {
        type: String,
        default: '',
      },
    },
    setup() {
      return {}
    },
  }
</script>

<style lang="scss" scoped></style>
