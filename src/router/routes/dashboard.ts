const dashboardRoute = [
  {
    menuUrl: '/dashboard',
    menuName: 'Dashborad',
    routeName: 'dashborad',
    isSingle: true,
    parentPath: '',
    children: [
      {
        parentPath: '/dashboard',
        menuUrl: '/dashboard/overview',
        menuName: '控制台',
        routeName: 'home',
        icon: 'dashboard',
        affix: true,
      },
    ],
  },
]
export default dashboardRoute
