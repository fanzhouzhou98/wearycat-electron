import Layout from '@/layouts/index.vue';

const IFrame = () => import('@/layouts/components/FrameBlank.vue');

export default [
  {
    path: '/frame',
    name: 'Frame',
    component: Layout,
    redirect: '/frame/doc',
    meta: {
      icon: 'internet',
      title: '外部页面',
    },

    children: [
      {
        path: 'doc',
        name: 'Doc',
        component: IFrame,
        meta: {
          frameSrc: '',
          title: '文档（内嵌）',
        },
      },
      {
        path: 'TDesign',
        name: 'TDesign',
        component: IFrame,
        meta: {
          frameSrc: '',
          title: '文档（内嵌）',
        },
      },
      {
        path: 'TDesign2',
        name: 'TDesign2',
        component: IFrame,
        meta: {
          frameSrc: '',
          frameBlank: true,
          title: '文档（外链）',
        },
      },
    ],
  },
];
