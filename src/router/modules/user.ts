const user_routes = [
  {
    menuUrl: '/user',
    menuName: '用户管理',
    iconPrefix: 'iconfont',
    icon: 'team',
    children: [
      {
        parentPath: '/user',
        menuUrl: '/user/user-list',
        menuName: '用户列表',
        icon: 'user',
        permission: 1,
      },
      {
        parentPath: '/user',
        menuUrl: '/user/role-list',
        menuName: '角色列表',
        icon: 'detail',
        permission: 1,
      },
      {
        parentPath: '/user',
        menuUrl: '/user/token-list',
        menuName: 'token列表',
        icon: 'key',
        permission: 1,
      },
      {
        parentPath: '/user',
        menuUrl: '/user/role-edit',
        menuName: '角色编辑',
        icon: 'detail',
        hidden: true,
        permission: 1,
      },
      {
        parentPath: '/user',
        menuUrl: '/user/test',
        menuName: '测试',
        icon: 'detail',
        hidden: true,
      },
    ],
  },
]

export default user_routes
