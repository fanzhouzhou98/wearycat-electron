<template>
  <router-view :class="[mode]" />
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useSettingStore } from '@/store';

const store = useSettingStore();

const mode = computed(() => {
  return store.displayMode;
});
</script>
<style lang="less" scoped>
#nprogress .bar {
  background: var(--td-brand-color) !important;
}
/* 隐藏全局滚动条 */
html::-webkit-scrollbar {
  width: 0 !important;
  display: none;
}

/* 禁用页面滚动 */
body {
  overflow: hidden;
}
</style>
