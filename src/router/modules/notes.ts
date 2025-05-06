import Layout from '@/layouts/index.vue';
import DashboardIcon from '@/assets/assets-slide-dashboard.svg';

export default [
  {
    path: '/notes',
    component: Layout,
    redirect: '/notes/notesBsase',
    name: 'notes',
    meta: { title: '笔记收藏', icon: DashboardIcon },
    children: [
      {
        path: 'notesBsase',
        name: 'notesBsase',
        component: () => import('@/pages/notes/index.vue'),
        meta: { title: '笔记' },
      }
    ],
  },
];
