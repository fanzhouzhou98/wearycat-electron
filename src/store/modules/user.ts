import { defineStore } from 'pinia';
import { TOKEN_NAME } from '@/config/global';
import { store, usePermissionStore } from '@/store';

const InitUserInfo  =  {
  roles: [],
  userInfo: {
    beeId: '',
    userId: '',
    token: '',
    userid: '',
    loginName: '',
  },
  baseUrl: 'https://t-mendix.oldmutual-chnenergy.com',
};

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem(TOKEN_NAME) || 'main_token', // 默认token不走权限
    userInfo: { ...InitUserInfo },
  }),
  getters: {
    roles: (state) => {
      return state.userInfo?.roles;
    },
  },
  actions: {
    async resetUserInfo() {
      this.userInfo = { ...InitUserInfo };
    },
    async updateUserInfo(userInfo: Record<keyof typeof InitUserInfo['userInfo'], string>) {
      this.userInfo.userInfo = { ...userInfo };
    },
    async setBaseUrl(baseUrl: string) {
      this.userInfo.baseUrl = baseUrl;
    },
    async login(userInfo: Record<string, unknown>) {
      const mockLogin = async (userInfo: Record<string, unknown>) => {
        // 登录请求流程
        console.log(userInfo);
        // const { account, password } = userInfo;
        // if (account !== 'td') {
        //   return {
        //     code: 401,
        //     message: '账号不存在',
        //   };
        // }
        // if (['main_', 'dev_'].indexOf(password) === -1) {
        //   return {
        //     code: 401,
        //     message: '密码错误',
        //   };
        // }
        // const token = {
        //   main_: 'main_token',
        //   dev_: 'dev_token',
        // }[password];
        return {
          code: 200,
          message: '登陆成功',
          data: 'main_token',
        };
      };

      const res = await mockLogin(userInfo);
      if (res.code === 200) {
        this.token = res.data;
      } else {
        throw res;
      }
    },
    async getUserInfo() {
      const mockRemoteUserInfo = async (token: string) => {
        if (token === 'main_token') {
          return {
            name: 'td_main',
            roles: ['all'],
          };
        }
        return {
          name: 'td_dev',
          roles: ['UserIndex', 'DashboardBase', 'login'],
        };
      };

      const res = await mockRemoteUserInfo(this.token);

// 由于类型不匹配，只将 res 中的 roles 赋值给 this.userInfo.roles
// @ts-ignore
this.userInfo.roles = res.roles;
    },
    async logout() {
      localStorage.removeItem(TOKEN_NAME);
      this.token = '';
      this.userInfo = { ...InitUserInfo };
    },
    async removeToken() {
      this.token = '';
    },
  },
  persist: {
    afterRestore: (ctx) => {
      if (ctx.store.roles && ctx.store.roles.length > 0) {
        const permissionStore = usePermissionStore();
        permissionStore.initRoutes(ctx.store.roles);
      }
    },
  },
});

export function getUserStore() {
  return useUserStore(store);
}
