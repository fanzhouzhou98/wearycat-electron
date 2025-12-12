import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron'
// import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'fs'
import https from 'https'
import http from 'http'
import archiver from 'archiver'
import axios from 'axios'

// const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'logo.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    titleBarStyle: 'hidden',
    frame: false,
    width: 1200,
    height: 800
  })

fs.promises.readdir(path.join(process.env.VITE_PUBLIC, 'rrwebPlayer'))
  .then(files => console.log(files)) // 打印目录中的文件和子目录名
  .catch(err => console.log('Unable to scan directory: ' + err));

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
    win?.webContents.openDevTools()  // 自动打开调试工具
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
  // 添加窗口事件监听
  ipcMain.handle('window-is-maximized', () => win?.isMaximized())

  ipcMain.on('window-control', (_, action) => {
    if (action === 'minimize') win?.minimize()
    if (action === 'maximize') win?.isMaximized()
      ? win?.unmaximize()
      : win?.maximize()
    if (action === 'close') win?.close()
  })

  // 添加下载功能的IPC处理
  ipcMain.handle('download:select-save-path', async (_, defaultFileName) => {
    const result = await dialog.showSaveDialog({
      title: '选择保存路径',
      defaultPath: defaultFileName || 'download',
      filters: [
        { name: '所有文件', extensions: ['*'] }
      ]
    });
    return result;
  });

  ipcMain.handle('download:download-file', async (event, { fileUrl, savePath }) => {
    return new Promise((resolve, reject) => {
      try {
        // 确定使用http还是https模块
        const protocol = fileUrl.startsWith('https') ? https : http;
        
        // 创建请求
        const request = protocol.get(fileUrl, (response) => {
          const totalBytes = parseInt(response.headers['content-length'] || '0');
          let receivedBytes = 0;
          
          // 创建可写流
          const fileStream = fs.createWriteStream(savePath);
          
          response.on('data', (chunk) => {
            receivedBytes += chunk.length;
            const progress = Math.round((receivedBytes / totalBytes) * 100);
            // 发送进度更新
            event.sender.send('download:progress', progress);
            fileStream.write(chunk);
          });
          
          response.on('end', () => {
            fileStream.end();
            resolve({ success: true, filePath: savePath });
          });
        });
        
        request.on('error', (error) => {
          reject(error);
        });
        
        request.end();
      } catch (error) {
        reject(error);
      }
    });
  });

  // 数组转JS文件并压缩下载
  ipcMain.handle('download:array-to-js-zip', async (event, { arrayData, variableName, fileName, savePath }) => {
    return new Promise((resolve, reject) => {
      try {
        // 获取rrwebPlayer目录路径
        const rrwebPlayerDir = path.join(process.env.VITE_PUBLIC, 'rrwebPlayer');
        const jsDir = path.join(rrwebPlayerDir, 'js');

        // 确保js目录存在
        if (!fs.existsSync(jsDir)) {
          fs.mkdirSync(jsDir, { recursive: true });
        }
        
        // 生成JS文件内容
        const jsContent = `var ${variableName} = ${JSON.stringify(arrayData, null, 2)};`;
        
        // 创建JS文件到public/rrwebPlayer/js目录下
        const jsFilePath = path.join(jsDir, fileName);
        fs.writeFileSync(jsFilePath, jsContent, 'utf8');
        
        // 创建压缩包，将整个rrwebPlayer目录压缩
        const output = fs.createWriteStream(savePath);
        const archive = archiver('zip', { 
          zlib: { level: 9 } // 设置压缩级别
        });
        
        output.on('close', () => {
          try {
            console.log(`rrwebPlayer目录已成功压缩到: ${savePath}`);
            
            // 下载成功后删除生成的js文件
            if (fs.existsSync(jsFilePath)) {
              fs.unlinkSync(jsFilePath);
              console.log(`已删除生成的JS文件: ${jsFilePath}`);
            }
            
            resolve({ success: true, filePath: savePath });
          } catch (error) {
            reject(error);
          }
        });
        
        archive.on('error', (error) => {
          reject(error);
        });
        
        archive.pipe(output);
        // 将整个rrwebPlayer目录添加到压缩包中
        archive.directory(rrwebPlayerDir, 'rrwebPlayer');
        archive.finalize();
      } catch (error) {
        reject(error);
      }
    });
  });
}

//axios请求方法
ipcMain.handle('http:get', async (event, { url, config }) => {
  try {
    const response = await axios.get(url, config);
    return response.data;
  } catch (error) {
    console.error('HTTP GET请求失败:', error);
    throw error;
  }
});
ipcMain.handle('http:post', async (event, { url, data, config }) => {
  try {
    console.log('HTTP POST请求参数:', url, data, config);
    const response = await axios.post(url, data, config);
    return response.data;
  } catch (error) {
    console.error('HTTP POST请求失败:', error);
    throw error;
  }
});
ipcMain.handle('http:put', async (event, { url, data, config }) => {
  try {
    const response = await axios.put(url, data, config);
    return response.data;
  } catch (error) {
    console.error('HTTP PUT请求失败:', error);
    throw error;
  }
});
ipcMain.handle('http:delete', async (event, { url, config }) => {
  try {
    const response = await axios.delete(url, config);
    return response.data;
  } catch (error) {
    console.error('HTTP DELETE请求失败:', error);
    throw error;
  }
});
ipcMain.handle('http:request', async (event, config) => {
  try {
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.error('HTTP请求失败:', error);
    throw error;
  }
});


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
Menu.setApplicationMenu(null)
app.whenReady().then(createWindow)
