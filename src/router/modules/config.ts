const config_routes = [
    {
        menuUrl: '/config',
        menuName: '配置文件管理',
        iconPrefix: 'iconfont',
        icon: 'file-text',
        children: [
            {
                parentPath: '/config',
                menuUrl: '/config/general',
                menuName: '普通配置',
                icon: 'edit-square',
            },
            {
                parentPath: '/config',
                menuUrl: '/config/public',
                menuName: '公共配置',
                icon: 'expend',
                permission: 1,
            },
            {
                parentPath: '/config',
                menuUrl: '/config/env',
                menuName: '环境管理',
                icon: 'sever',
                permission: 1,
            },
        ],
    },
]

export default config_routes
