<template>
  <result title="浏览器不兼容" type="ie" tip="抱歉，您正在使用的浏览器版本过低，无法打开当前网页。">
    <div class="result-slot-container">
      <t-button class="result-button" @click="() => $router.push('/')">返回首页</t-button>
      <div class="recommend-container">
        <div>推荐以下主流浏览器</div>
        <div class="recommend-browser">
          <div>
            <thumbnail class="browser-icon" url="https://tdesign.gtimg.com/starter/result-page/chorme.png" />
            <div>Chrome</div>
          </div>
          <div>
            <thumbnail class="browser-icon" url="https://tdesign.gtimg.com/starter/result-page/qq-browser.png" />
            <div>QQ Browser</div>
          </div>
        </div>
      </div>
    </div>
  </result>
</template>
<script lang="ts">
export default {
  name: 'ResultBrowserIncompatible',
};
</script>
<script setup lang="ts">
import Result from '@/components/result/index.vue';
import Thumbnail from '@/components/thumbnail/index.vue';
</script>

<style lang="less" scoped>
.result-slot-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  color: var(--td-text-color-secondary);
  height: calc(75vh - 254px);
  min-height: 156px;
}

.recommend-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 48px;
  width: 640px;
  background: var(--td-bg-color-container);
  box-shadow: 0px 1px 2px var(--td-shadow-1);
  border-radius: 3px;
}

.recommend-browser {
  display: flex;

  > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 70px;
  }

  > div + div {
    margin-left: 40px;
  }
}

.browser-icon {
  width: 36.67px;
  height: 36.67px;
}
</style>
