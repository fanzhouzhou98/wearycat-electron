import { MessagePlugin } from 'tdesign-vue-next';
//@ts-ignore
import NProgress from 'nprogress'; // progress bar
import 'nprogress/nprogress.css'; // progress bar style

import { getPermissionStore, getUserStore } from '@/store';
import router from '@/router';

NProgress.configure({ showSpinner: false });

router.beforeEach(async (to, from, next) => {
  console.log(to, from);
  NProgress.start();

  const userStore = getUserStore();
  const permissionStore = getPermissionStore();
  const { whiteListRouters } = permissionStore;

  const { token } = userStore;
  if (token) {
    if (to.path === '/login') {
      next();
      return;
    }

    const { roles } = userStore;

    if (roles && roles.length > 0) {
      next();
    } else {
      try {
        await userStore.getUserInfo();

        const { roles } = userStore;

        await permissionStore.initRoutes(roles);
        //@ts-ignore
        if (router.hasRoute(to.name)) {
          next();
        } else {
          next(`/`);
        }
      } catch (error) {
        //@ts-ignore
        MessagePlugin.error(error);
        next({
          path: '/login',
          query: { redirect: encodeURIComponent(to.fullPath) },
        });
        NProgress.done();
      }
    }
  } else {
    /* white list router */
    if (whiteListRouters.indexOf(to.path) !== -1) {
      next();
    } else {
      next({
        path: '/login',
        query: { redirect: encodeURIComponent(to.fullPath) },
      });
    }
    NProgress.done();
  }
});

router.afterEach((to) => {
  if (to.path === '/login') {
    const userStore = getUserStore();
    const permissionStore = getPermissionStore();

    userStore.logout();
    permissionStore.restore();
  }
  NProgress.done();
});
