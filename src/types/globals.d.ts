// 通用声明

// Vue
declare module '*.vue' {
  import { DefineComponent } from 'vue';

  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare type ClassName = { [className: string]: any } | ClassName[] | string;

declare module '*.svg' {
  const CONTENT: string;
  export default CONTENT;
}

declare type Recordable<T = any> = Record<string, T>;

// Electron IPC 类型定义
declare interface Window {
  ipcRenderer: {
    on(channel: string, listener: (...args: any[]) => void): void;
    off(channel: string, listener?: (...args: any[]) => void): void;
    send(channel: string, ...args: any[]): void;
    invoke(channel: string, ...args: any[]): Promise<any>;
    minimize(): void;
    maximize(): void;
    close(): void;
    isMaximized(): Promise<boolean>;
    download: {
      selectSavePath(defaultFileName?: string): Promise<{
        canceled: boolean;
        filePath?: string;
      }>;
      downloadFile(params: {
        fileUrl: string;
        savePath: string;
      }): Promise<{
        success: boolean;
        filePath: string;
      }>;
      arrayToJsZip(params: {
        arrayData: any[];
        variableName: string;
        fileName: string;
        savePath: string;
      }): Promise<{
        success: boolean;
        filePath: string;
      }>;
      onProgress(listener: (progress: number) => void): () => void;
    };
    http: {
      get(url: string, config?: any): Promise<any>;
      post(url: string, data?: any, config?: any): Promise<any>;
      put(url: string, data?: any, config?: any): Promise<any>;
      delete(url: string, config?: any): Promise<any>;
      request(config: any): Promise<any>;
    };
  };
}
