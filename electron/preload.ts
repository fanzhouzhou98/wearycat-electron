import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  minimize: () => ipcRenderer.send('window-control', 'minimize'),
  maximize: () => ipcRenderer.send('window-control', 'maximize'),
  close: () => ipcRenderer.send('window-control', 'close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  
  // 下载功能相关API
  download: {
    selectSavePath: (defaultFileName?: string) => ipcRenderer.invoke('download:select-save-path', defaultFileName),
    downloadFile: (params: { fileUrl: string; savePath: string }) => ipcRenderer.invoke('download:download-file', params),
    arrayToJsZip: (params: {
      arrayData: any[];
      variableName: string;
      fileName: string;
      savePath: string;
    }) => ipcRenderer.invoke('download:array-to-js-zip', params),
    onProgress: (listener: (progress: number) => void) => {
      const callback = (_event: Electron.IpcRendererEvent, progress: number) => listener(progress)
      ipcRenderer.on('download:progress', callback)
      return () => ipcRenderer.off('download:progress', callback)
    }
  },
  
  // 网络请求API
  http: {
    get: (url: string, config?: any) => ipcRenderer.invoke('http:get', { url, config }),
    post: (url: string, data?: any, config?: any) => ipcRenderer.invoke('http:post', { url, data, config }),
    put: (url: string, data?: any, config?: any) => ipcRenderer.invoke('http:put', { url, data, config }),
    delete: (url: string, config?: any) => ipcRenderer.invoke('http:delete', { url, config }),
    // 通用请求方法
    request: (config: any) => ipcRenderer.invoke('http:request', config),
  },
  

})
