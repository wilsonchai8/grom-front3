<template>
  <div ref="editorform" style="height: 300px" class="ace-editor"></div>
</template>

<script lang="ts">
  import { watch, onMounted, onBeforeUnmount, ref } from 'vue'
  import ace from 'ace-builds'
  export default {
    name: 'CodeEditor',
    emits: ['update:value'],
    props: {
      id: {
        type: Number,
        default: 0,
      },
      value: {
        type: String,
        default: null,
      },
      readonly: {
        type: Boolean,
        default: false,
      },
    },
    setup(props, { emit }) {
      let editor = null as any
      const editorform = ref(null)
      ace.config.set('basePath', '/node_modules/ace-builds/src-min-noconflict')
      let options = {
        mode: 'ace/mode/text',
        tabSize: 2,
        maxLines: 25,
        minLines: 25,
        showPrintMargin: false,
        fontSize: 14,
        readOnly: props.readonly ? props.readonly : false,
      }
      function initialize() {
        if (editor) {
          editor.destroy()
        }
        editor = ace.edit(editorform.value, options)
        editor.setOptions({})
        editor.getSession().setUseWrapMode(true)
        editor.setValue(props.value ? props.value : '')
        editor.clearSelection()
      }
      function getContent() {
        return editor.getValue()
      }
      watch(
        () => props.id,
        () => {
          initialize()
        }
      )
      watch(
        () => props.value,
        (newProps) => {
          const position = editor.getCursorPosition()
          editor.getSession().setValue(newProps)
          editor.clearSelection()
          editor.moveCursorToPosition(position)
        }
      )
      watch(
        () => props.readonly,
        (newValue) => {
          editor.setOptions({ readOnly: newValue })
        }
      )
      onMounted(() => {
        initialize()
      })
      onBeforeUnmount(() => {
        editor.destroy()
      })
      return {
        editorform,
        getContent,
      }
    },
  }
</script>

<style lang="scss" scoped>
  .ace-chaos .ace_meta.ace_tag {
    color: #53a7e6 !important;
  }
  .ace-chaos .ace_string {
    color: #c58854 !important;
  }
  .ace-chaos .ace_keyword {
    color: #e0e0e0 !important;
  }
  .ace-chaos .ace_constant.ace_numeric {
    color: #c5c454 !important;
  }
</style>
