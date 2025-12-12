<template>
  <div class="download-container">
    <h2 class="page-title">回溯数据下载</h2>
      <!-- 数组转JS文件压缩下载 -->
        <div class="form-step-container">
          <t-card :title="'投保回溯数据压缩下载'" :bordered="false">
            <t-form ref="arrayForm" :data="arrayDownloadForm" :layout="'vertical'">
              <t-form-item label="流水号" name="">
                <t-input v-model="arrayDownloadForm.tradeNo" placeholder="请输入流水号" :maxcharacter="50"/>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive} from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { postRequest } from '@/utils/nativeRequest';
// rrweb下载表单数据
const downloadForm = reactive({
  fileUrl: '',
  token: '',
  savePath: '',
  fileName: ''
});

// rrweb下载状态
const downloadProgress = ref(0);
const downloadStatus = ref<{ title: string; message: string; type: 'success' | 'warning' | 'error' | 'info' } | null>(null);

// 数组转JS文件压缩下载表单
const arrayDownloadForm = reactive({
  arrayData: '',
  tradeNo: 'HB2025dhhnuy0000020934',
  fileName: '',
  savePath: ''
});

// 数组下载状态
const arrayDownloading = ref(false);


// 选择数组保存路径
const selectArraySavePath = async (arrayData: any[]) => {
  try {
    let tradeNo = arrayDownloadForm.tradeNo?.replace(/\s+/g, '')
    if (!tradeNo) {
      MessagePlugin.warning('请填写流水号');
      return;
    }
    const result = await window.ipcRenderer.download.selectSavePath(`${tradeNo}-video.zip`);
    if (!result.canceled && result.filePath) {
      arrayDownloadForm.savePath = result.filePath;
      await arrayToJsZip(arrayData, result.filePath)
    }
  } catch (error) {
    console.error('选择保存路径失败:', error);
    MessagePlugin.warning('选择保存路径失败');
  }
};
// 下载数组为JS文件压缩包
const downloadArrayAsJsZip = async () => {
  let tradeNo = arrayDownloadForm.tradeNo?.replace(/\s+/g, '')
  if (!tradeNo) {
    MessagePlugin.warning('请填写流水号');
    return;
  }
  arrayDownloading.value = true;
  let data = await postRequest('https://t-mendix.oldmutual-chnenergy.com/product/backend/trade-service/trade/rwebData/getData', {
    tradeNo: tradeNo,
    subId: tradeNo
}).catch((error) => {
  console.error('下载数组数据失败:', error);
  arrayDownloading.value = false;
  MessagePlugin.warning('下载数组数据失败');
});
if (data.code === 1) {
  console.log(data);
  let arrayData: any[] = []
  if (data.result.data) {
    arrayData.push(JSON.parse(data.result.data))
  }
  if (data.result.videoList?.length > 1) {
    let subIdArr: string[] = data.result.videoList.filter((id: string) => {
      return id !== tradeNo
    })
    for (let subId of subIdArr) {
      let subData = await postRequest('https://t-mendix.oldmutual-chnenergy.com/product/backend/trade-service/trade/rwebData/getData', {
        tradeNo: tradeNo,
        subId: subId
      }).catch((error) => {
        console.error('下载子数组数据失败:', error);
        arrayDownloading.value = false;
        MessagePlugin.warning('下载子数组数据失败');
      });
      if (subData.code === 1) {
        arrayData.push(JSON.parse(subData.result.data))
      }
    }
  }
  arrayDownloading.value = false;
  await selectArraySavePath(arrayData)
  } else {
    if (data.code === 401) {
      MessagePlugin.warning('登录过期，请重新登录');
      return;
    }
    MessagePlugin.error(data.message || '下载rrweb数据失败');
  }
};
const arrayToJsZip = async (arrayData: any[], savePath: string) => {
      // 调用主进程的下载功能
    const response = await window.ipcRenderer.download.arrayToJsZip({
      arrayData,
      variableName: 'videoData',
      fileName: 'video.js',
      savePath: savePath
    });
    if (response.success) {
      MessagePlugin.success('数据下载生成成功');
      console.log('压缩包生成成功', response.filePath);
    } else {
      MessagePlugin.error('压缩包生成失败');
    }
}
// 重置数组表单
const resetArrayForm = () => {
  arrayDownloadForm.tradeNo = ''
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