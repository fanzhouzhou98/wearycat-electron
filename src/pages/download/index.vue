<template>
  <div class="download-container">
    <h2 class="page-title">文件下载中心</h2>
    
    <t-tabs v-model:active="activeTab">
      <!-- rrweb文件下载 -->
      <t-tab-panel label="rrweb文件下载" name="rrweb">
        <div class="form-step-container">
          <t-card :title="'rrweb文件下载'" :bordered="false">
            <t-form ref="form" :data="downloadForm" :layout="'inline'" :rules="FORM_RULES" @submit="onSubmit">
              <t-form-item label="流水号" name="idNumber">
                <t-input v-model="downloadForm.fileUrl" placeholder="请输入要下载的rrweb文件的流水号" :maxcharacter="60"></t-input>
              </t-form-item>
              <t-form-item label="token" name="token">
                <t-input v-model="downloadForm.token" placeholder="请输入要下载的rrweb文件的token" :maxcharacter="60"></t-input>
              </t-form-item>
              <t-form-item label="保存路径" name="savePath">
                <t-input v-model="downloadForm.savePath" placeholder="请选择保存路径" />
                <t-button type="primary" @click="selectSavePath" style="margin-left: 10px;">选择路径</t-button>
              </t-form-item>
              <t-form-item>
                <t-space size="small">
                    <t-button type="primary" @click="downloadFile" :loading="downloading">开始下载</t-button>
                </t-space>
              </t-form-item>
            </t-form>
          </t-card>
        </div>
      </t-tab-panel>
      
      <!-- 数组转JS文件压缩下载 -->
      <t-tab-panel label="数组转JS文件压缩下载" name="array">
        <div class="form-step-container">
          <t-card :title="'数组转JS文件压缩下载'" :bordered="false">
            <t-form ref="arrayForm" :data="arrayDownloadForm" :layout="'vertical'" :rules="ARRAY_FORM_RULES">
              <t-form-item label="数组数据" name="arrayData">
                <t-input
                  v-model="arrayDownloadForm.arrayData"
                  type="textarea"
                  placeholder="请输入数组数据，格式如：[1, 2, 3, 'test']"
                  :rows="8"
                  :maxcharacter="10000"
                ></t-input>
              </t-form-item>
              <t-form-item label="变量名称" name="variableName">
                <t-input v-model="arrayDownloadForm.variableName" placeholder="请输入JS文件中的变量名称" :maxcharacter="50"></t-input>
              </t-form-item>
              <t-form-item label="文件名" name="fileName">
                <t-input v-model="arrayDownloadForm.fileName" placeholder="请输入要生成的JS文件名（包含.js后缀）" :maxcharacter="50"></t-input>
              </t-form-item>
              <t-form-item label="保存路径" name="savePath">
                <t-input v-model="arrayDownloadForm.savePath" placeholder="请选择保存路径" />
                <t-button type="primary" @click="selectArraySavePath" style="margin-left: 10px;">选择路径</t-button>
              </t-form-item>
              <t-form-item>
                <t-space size="small">
                    <t-button type="primary" @click="downloadArrayAsJsZip" :loading="arrayDownloading">生成并下载</t-button>
                    <t-button @click="resetArrayForm">重置</t-button>
                </t-space>
              </t-form-item>
            </t-form>
          </t-card>
        </div>
      </t-tab-panel>
    </t-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

// 标签页切换
const activeTab = ref('rrweb');

// rrweb下载表单数据
const downloadForm = reactive({
  fileUrl: '',
  token: '',
  savePath: '',
  fileName: ''
});

// rrweb下载状态
const downloading = ref(false);
const downloadProgress = ref(0);
const downloadStatus = ref<{ title: string; message: string; type: 'success' | 'warning' | 'error' | 'info' } | null>(null);

// 数组转JS文件压缩下载表单
const arrayDownloadForm = reactive({
  arrayData: '',
  variableName: '',
  fileName: '',
  savePath: ''
});

// 数组下载状态
const arrayDownloading = ref(false);

// 进度监听取消函数
let progressUnsubscribe: (() => void) | null = null;

// 选择rrweb保存路径
const selectSavePath = async () => {
  try {
    // 使用暴露的IPC API选择保存路径
    const result = await window.ipcRenderer.download.selectSavePath(downloadForm.fileName || 'download');
    
    if (!result.canceled && result.filePath) {
      downloadForm.savePath = result.filePath;
      // 从文件路径中提取文件名
      if (!downloadForm.fileName) {
        downloadForm.fileName = result.filePath.split('/').pop() || '';
      }
    }
  } catch (error) {
    console.error('选择保存路径失败:', error);
    MessagePlugin.warning('选择保存路径失败');
  }
};

// 下载rrweb文件
const downloadFile = async () => {
  // 表单验证
  if (!downloadForm.fileUrl || !downloadForm.token || !downloadForm.savePath) {
    MessagePlugin.warning('请填写完整信息');
    return;
  }
  
  try {
    downloading.value = true;
    downloadProgress.value = 0;
    downloadStatus.value = null;
    
    const fileUrl = `http://192.168.198.222:8000/api/rrweb/file/${downloadForm.fileUrl}?token=${downloadForm.token}`;
    
    // 使用暴露的IPC API下载文件
    await window.ipcRenderer.download.downloadFile({
      fileUrl,
      savePath: downloadForm.savePath
    });
    
    // 下载完成
    downloading.value = false;
    downloadProgress.value = 100;
    downloadStatus.value = {
      title: '下载成功',
      message: `文件已成功保存到: ${downloadForm.savePath}`,
      type: 'success'
    };
    MessagePlugin.success('文件下载成功');
  } catch (error) {
    downloading.value = false;
    downloadStatus.value = {
      title: '下载失败',
      message: `下载出错: ${(error as Error).message}`,
      type: 'error'
    };
    MessagePlugin.error('文件下载失败');
    console.error('下载错误:', error);
  }
};

// 选择数组保存路径
const selectArraySavePath = async () => {
  try {
    const result = await window.ipcRenderer.download.selectSavePath('array_data.zip');
    if (!result.canceled && result.filePath) {
      arrayDownloadForm.savePath = result.filePath;
    }
  } catch (error) {
    console.error('选择保存路径失败:', error);
    MessagePlugin.warning('选择保存路径失败');
  }
};

// 下载数组为JS文件压缩包
const downloadArrayAsJsZip = async () => {
  if (!arrayDownloadForm.arrayData || !arrayDownloadForm.variableName || 
      !arrayDownloadForm.fileName || !arrayDownloadForm.savePath) {
    MessagePlugin.warning('请填写完整信息');
    return;
  }

  arrayDownloading.value = true;

  try {
    // 解析数组数据
    let arrayData;
    try {
      arrayData = JSON.parse(arrayDownloadForm.arrayData);
      if (!Array.isArray(arrayData)) {
        throw new Error('输入的不是有效的数组格式');
      }
    } catch (error) {
      console.error('数组解析失败:', error);
      MessagePlugin.warning('请输入有效的数组格式');
      return;
    }

    // 调用主进程的下载功能
    const response = await window.ipcRenderer.download.arrayToJsZip({
      arrayData,
      variableName: arrayDownloadForm.variableName,
      fileName: arrayDownloadForm.fileName,
      savePath: arrayDownloadForm.savePath
    });

    if (response.success) {
      MessagePlugin.success('压缩包生成成功');
      console.log('压缩包生成成功', response.filePath);
    } else {
      MessagePlugin.error('压缩包生成失败');
    }
  } catch (error) {
    console.error('压缩包生成失败:', error);
    MessagePlugin.error('压缩包生成失败');
  } finally {
    arrayDownloading.value = false;
  }
};

// 重置数组表单
const resetArrayForm = () => {
  arrayDownloadForm.arrayData = '';
  arrayDownloadForm.variableName = '';
  arrayDownloadForm.fileName = '';
  arrayDownloadForm.savePath = '';
};

// 重置rrweb表单
const resetForm = () => {
  downloadForm.fileUrl = '';
  downloadForm.token = '';
  downloadForm.savePath = '';
  downloadForm.fileName = '';
  downloadProgress.value = 0;
  downloadStatus.value = null;
};

// 组件挂载时添加进度监听
onMounted(() => {
  progressUnsubscribe = window.ipcRenderer.download.onProgress((progress) => {
    downloadProgress.value = progress;
  });
});

// 组件卸载时移除进度监听
onUnmounted(() => {
  if (progressUnsubscribe) {
    progressUnsubscribe();
  }
});

// 进度条格式化
const progressFormat = (percentage: number) => {
  return `${percentage}%`;
};
</script>

<style scoped lang="less">
.download-container {
  padding: 20px;
  
  .page-title {
    font-size: 24px;
    margin-bottom: 20px;
    color: #333;
  }
  
  .download-content {
    max-width: 800px;
  }
  
  .download-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .card-body {
      padding: 20px;
      
      .download-progress {
        margin-top: 20px;
      }
      
      .download-status {
        margin-top: 20px;
      }
    }
  }
}
</style>