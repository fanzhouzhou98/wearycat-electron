import { useUserStore } from '@/store';
import { MessagePlugin } from 'tdesign-vue-next';
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
        'User-Agent': window.navigator.userAgent,
        ...config?.headers,
      },
    }
  }
  try {
    const response = await window.ipcRenderer.http.post(url, data, config)
    return response
  } catch (error: any) {
    console.error('HTTP POST请求失败:', error);
    if (error.response.status === 401) {
      // 请求已发送，但服务器响应的状态码不在 2xx 范围内
      console.error('响应数据:', error.response.data);
      console.error('响应状态:', error.response.status);
      console.error('响应头:', error.response.headers);
      MessagePlugin.error('登录过期，请重新登录');
    } else if (error.request) {
      // 请求已发送，但没有收到响应
      console.error('请求数据:', error.request);
    } else {
      // 发送请求时出了点问题
      console.error('错误信息:', error.message);
    }
    throw error;
  }
}
