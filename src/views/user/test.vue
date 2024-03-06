<template>
  <div>
    <n-form :model="data">
      <n-form-item path="name" :rule="rule">
        <n-input v-model:value="data.name" />
      </n-form-item>
    </n-form>
    {{table.tableHeight}}
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue'
  import { NInput, NForm, NFormItem } from 'naive-ui'
  import { useTable, useTableHeight } from '@/hooks/table'
  export default defineComponent({
    name: 'test',
    components: {},
    setup() {
      const table = useTable()
      onMounted(async () => {
        table.tableHeight.value = await useTableHeight()
      })
      return {
        table,
        data: ref({
          name: '',
        }),
        rule: {
          required: true,
          trigger: ['blur', 'input'],
          pattern: /^$|^[a-z]{6,8}$/,
          message: 'not satisfy',
          validator(rule: any, value: any) {
            const { pattern } = rule
            return pattern.test(value)
          },
        },
      }
    },
  })
</script>
<style lang="scss" scoped></style>
