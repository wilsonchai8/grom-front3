<template>
    <div v-show="check">
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { componentPermissionFun } from '@/utils/common'


export default defineComponent({
    name: 'ComponentPermission',
    props: {
        name: {
            defaut: "",
            type: String
        }
    },
    setup(props) {
        const check = computed(() => {
            return componentPermissionFun(props.name)
        })
        return {
            check,
        }
    }
})
</script>

<style scoped>
</style>
