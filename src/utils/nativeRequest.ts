import { useUserStore } from '@/store';
export const postRequest = async (url: string, data?: any, config?: any) => {
  const userStore = useUserStore();
  if (userStore.userInfo.userInfo) {
    config = {
      ...config,
      headers: {
        'Content-Type': 'application/json',
        'beeid': userStore.userInfo.userInfo.beeId,
        'loginid': userStore.userInfo.userInfo.userId,
        'token': userStore.userInfo.userInfo.beeId,
        'userid': userStore.userInfo.userInfo.userId,
        ...config?.headers,
      },
    }
  }
  return await window.ipcRenderer.http.post( url, data, config )
}
