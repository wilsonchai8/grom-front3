export default [
    {
        name: 'general-list',
        comment: '普通配置',
        children: [
            {
                name: 'general_add_but',
                comment: '添加普通配置按钮',
                related_request: '/config/general:post',
            },
            {
                name: 'general_enable_disable_but',
                comment: '启用/禁用普通配置按钮',
                related_request: '/config/general:delete',
            },
            {
                name: 'general_publish_but',
                comment: '发布普通配置按钮',
                related_request: '/config/general/publish:post',
            },
            {
                name: 'general_rollback_but',
                comment: '回滚普通配置按钮',
                related_request: '/config/general/rollback:post',
            },
            {
                name: 'general_render_but',
                comment: '渲染普通配置按钮',
                related_request: '/config/general/render:post',
            },
        ]
    },
    {
        name: 'public-list',
        comment: '公共配置列表',
        children: [
            {
                name: 'public_add_but',
                comment: '添加公共配置按钮',
                related_request: '/config/public:post',
            },
            {
                name: 'public_delete_but',
                comment: '删除公共配置按钮',
                related_request: '/config/public:delete',
            },
            {
                name: 'public_publish_but',
                comment: '发布公共配置按钮',
                related_request: '/config/public/publish:post',
            },
            {
                name: 'public_rollback_but',
                comment: '回滚公共配置按钮',
                related_request: '/config/public/rollback:post',
            },
            {
                name: 'public_related_general_publish_but',
                comment: '发布关联配置按钮',
                related_request: '/config/public/related_general:post',
            },
        ]
    },
    {
        name: '环境-list',
        comment: '环境列表',
        children: [
            {
                name: 'env_add_but',
                comment: '添加环境按钮',
                related_request: '/config/env:post',
            },
            {
                name: 'env_edit_but',
                comment: '编辑环境按钮',
                related_request: '/config/env:put',
            },
            {
                name: 'env_delete_but',
                comment: '删除环境按钮',
                related_request: '/config/env:delete',
            },
        ]
    },
    {
        name: 'user-list',
        comment: '用户列表',
        children: [
            {
                name: 'user_add_but',
                comment: '添加用户按钮',
                related_request: '/admin/user/users:post',
            },
            {
                name: 'user_edit_but',
                comment: '编辑用户按钮',
                related_request: '/admin/user/users:put',
            },
            {
                name: 'user_enable_disable_but',
                comment: '启用/禁用用户按钮',
                related_request: '/admin/user/users:delete',
            },
        ]
    },
    {
        name: 'role-list',
        comment: '角色列表',
        children: [
            {
                name: 'role_add_but',
                comment: '添加角色按钮',
                related_request: '/admin/user/roles:post',
            },
            {
                name: 'role_edit_but',
                comment: '编辑角色按钮',
                related_request: '/admin/user/roles:put',
            },
            {
                name: 'role_delete_but',
                comment: '删除角色按钮',
                related_request: '/admin/user/roles:delete',
            },
        ]
    },
    {
        name: 'token-list',
        comment: 'token列表',
        children: [
            {
                name: 'token_add_but',
                comment: '添加token按钮',
                related_request: '/admin/user/token:post',
            },
            {
                name: 'token_delete_but',
                comment: '删除token按钮',
                related_request: '/admin/user/token:delete',
            },
        ]
    },
]
