import Layout from '@/layouts/index.vue';
import DashboardIcon from '@/assets/assets-slide-detail.svg';

export default [
  {
    path: '/dashboard',
    component: Layout,
    redirect: '/dashboard/base',
    name: 'dashboard',
    meta: { title: '待办', icon: DashboardIcon },
    children: [
      {
        path: 'base',
        name: 'DashboardBase',
        component: () => import('@/pages/dashboard/base/index.vue'),
        meta: { title: '待办事项' },
      }
    ],
  },
];
