import { useRoute, createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import uniq from 'lodash/uniq';

// 自动导入modules文件夹下所有ts文件
import baseModules from './modules/base';
import componentsModules from './modules/components';
// import iframeModules from './modules/iframe';
// import othersModules from './modules/others';
import notesModules from './modules/notes';

// 路由暂存
let routeModuleList: Array<RouteRecordRaw> = [];

routeModuleList.push(...baseModules);
routeModuleList.push(...notesModules);
routeModuleList.push(...componentsModules);
// routeModuleList.push(...iframeModules);
// routeModuleList.push(...othersModules);

// 关于单层路由，meta 中设置 { single: true } 即可为单层路由，{ hidden: true } 即可在侧边栏隐藏该路由

// 存放动态路由
export const asyncRouterList: Array<RouteRecordRaw> = [...routeModuleList];

// 存放固定的路由
const defaultRouterList: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/login/index.vue'),
  },
  {
    path: '/',
    redirect: '/dashboard/base',
  },
  {
    path: '/:w+',
    name: '404Page',
    redirect: '/result/404',
  },
];

export const allRoutes = [...defaultRouterList, ...asyncRouterList];

export const getRoutesExpanded = () => {
// 显式指定 expandedRoutes 数组的类型为字符串数组
const expandedRoutes: string[] = [];

  allRoutes.forEach((item) => {
    if (item.meta && item.meta.expanded) {
      expandedRoutes.push(item.path);
    }
    if (item.children && item.children.length > 0) {
      item.children
        .filter((child) => child.meta && child.meta.expanded)
        .forEach((child: RouteRecordRaw) => {
          expandedRoutes.push(item.path);
          expandedRoutes.push(`${item.path}/${child.path}`);
        });
    }
  });
  return uniq(expandedRoutes);
};

export const getActive = (maxLevel = 3): string => {
  const route = useRoute();
  if (!route?.path) {
    return '';
  }
  return route.path
    .split('/')
    .filter((_item: string, index: number) => index <= maxLevel && index > 0)
    .map((item: string) => `/${item}`)
    .join('');
};

const router = createRouter({
  history: createWebHashHistory(),
  routes: allRoutes,
  scrollBehavior() {
    return {
      el: '#app',
      top: 0,
      behavior: 'smooth',
    };
  },
});

export default router;
