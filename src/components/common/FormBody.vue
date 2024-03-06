<template>
  <n-form :model="userdefineData" label-placement="left" ref="userdefineRef">
    <n-form-item
      v-for="(item, index) of userdefineColumn"
      :key="index"
      :label="item.label"
      v-bind="item.options"
      :rule="item.rule"
      :path="item.key"
    >
      <div v-if="item.component">
        <userdefineComponent
          v-model:value="userdefineData[item.key]"
          :component="item.component"
          :attribute="item.attribute"
          @update:value="onUpdateCallback"
          @blur="onBlurCallback"
        />
      </div>
      <div v-else>
        <n-tag :bordered="false" :type="item.type">
          {{ userdefineData[item.key] }}
        </n-tag>
      </div>
    </n-form-item>
  </n-form>
</template>

<script lang="ts">
  import { defineComponent, h } from 'vue'

  export default defineComponent({
    name: 'FormBody',
    components: {
      userdefineComponent: {
        render(vm: any) {
          return h(vm.$attrs.component, vm.$attrs.attribute)
        },
      },
    } as any,
    props: {
      userdefineColumn: {
        type: Array,
        default: () => [],
      } as any,
      userdefineData: {
        type: Object,
        default: () => {},
      },
    },
    emits: ['onUpdate', 'onBlur'],
    setup(props, { emit }) {
      function onUpdateCallback() {
        emit('onUpdate', props.userdefineData)
      }
      function onBlurCallback() {
        emit('onBlur', props.userdefineData)
      }
      return {
        onUpdateCallback,
        onBlurCallback,
      }
    },
  })
</script>

<style lang="scss" scoped>
  .n-form-item {
    display: inline-flex;
    margin-bottom: 15px;
    margin-right: 10px;
  }
</style>
