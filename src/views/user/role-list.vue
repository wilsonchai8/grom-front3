<template>
    <div class="main-container">
        <TableBody ref="tableBody">
            <template #header>
                <TableHeader :show-filter="false">
                    <template #top-right>
                        <ComponentPermission name="role_add_but">
                            <AddButton name="添加角色" @add="onUpdateItem(undefined, 'add')" />
                        </ComponentPermission>
                    </template>
                </TableHeader>
            </template>
            <template #default>
                <n-data-table
                    size="small"
                    :loading="tableLoading"
                    :data="dataList"
                    :columns="tableColumns"
                    :row-key="rowKey"
                    :style="{ height: `${tableHeight}px` }"
                    :flex-height="true"
                />
            </template>
            <template #footer>
                <TableFooter :pagination="pagination" :totalCount="totalCount"/>
            </template>
        </TableBody>
    </div>
</template>

<script lang="ts">
import roleRq from '@/api/modules/5_role'
import {
    usePagination,
    useRowKey,
    useTable,
    useTableColumn,
    useTableHeight,
    useRenderAction,
    TableActionModel,
} from '@/hooks/table'
import { useRouter } from 'vue-router'
import {
    DataTableColumn,
    useDialog,
} from 'naive-ui'
import { defineComponent, onMounted, ref, nextTick } from 'vue'
import { componentPermissionFun } from '@/utils/common'
export default defineComponent({
    name: 'TaskList',
    setup() {
        const pagination = usePagination(doRefresh)
        pagination.pageSize = 20
        const table = useTable()
        const naiveDailog = useDialog()
        const rowKey = useRowKey('id')
        const changeType = ref('edit')
        const totalArgs = ref()
        const totalCount = ref(0)
        const router = useRouter()
        const tableColumns = useTableColumn(
            [
                table.indexColumn,
                {
                    title: '角色名',
                    key: 'rolename',
                },
                {
                    title: '备注',
                    key: 'comment',
                },
                {
                    title: '操作',
                    key: 'actions',
                    width: 180,
                    render: (rowData) => {
                        return useRenderAction([
                            {
                                label: '编辑',
                                onClick: onUpdateItem.bind(null, rowData, 'edit'),
                                show: componentPermissionFun('role_edit_but'),
                            },
                            {
                                label: '删除',
                                type: 'error',
                                disabled: rowData.status === 0 ? true : false,
                                show: componentPermissionFun('role_delete_but'),
                                onClick() {
                                    onDisableItem(rowData)
                                },
                            },
                        ] as TableActionModel[])
                    },
                },
            ],
            {
                align: 'center',
            } as DataTableColumn
        )
        function doRefresh() {
            roleRq('roleList', {}, {}).then(({ payload }) => {
                table.handleSuccess({
                    data: payload.role_list,
                })
                totalCount.value = payload.role_counts
                pagination.setTotalSize(payload.role_counts || 10)
            })
        }
        function onUpdateItem(item: any, ct: string) {
            changeType.value = ct
            totalArgs.value = item
            nextTick(() => {
                if (ct == 'add') {
                    router.push({path: '/user/role-edit', query: { id: 0}})
                } else {
                    router.push({path: '/user/role-edit', query: { id: item.id}})
                }
            })
        }
        function onDisableItem(item: any) {
            naiveDailog.warning({
                title: '提示',
                content: '确定要删除此角色？',
                positiveText: '删除',
                negativeText: '再想想',
                onPositiveClick: () => {
                    roleRq('roleDelete', {id: item.id}, {}).then(() => {
                        doRefresh()
                    })
                },
            })
        }
        onMounted(async () => {
            table.tableHeight.value = await useTableHeight()
            doRefresh()
        })
        return {
            ...table,
            rowKey,
            pagination,
            tableColumns,
            onUpdateItem,
            totalCount,
        }
    },
})
</script>

<style lang="scss" scoped>
.avatar-container {
position: relative;
width: 30px;
height: 30px;
margin: 0 auto;
vertical-align: middle;
.avatar {
width: 100%;
height: 100%;
border-radius: 50%;
}
.avatar-vip {
border: 2px solid #cece1e;
}
.vip {
position: absolute;
top: 0;
right: -9px;
width: 15px;
transform: rotate(60deg);
}
}
.gender-container {
.gender-icon {
width: 20px;
}
}
</style>
