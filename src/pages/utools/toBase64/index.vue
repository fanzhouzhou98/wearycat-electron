<template>
  <div class="result-success">
    <t-icon class="result-success-icon" name="error-circle" />
    <div class="result-success-title">功能开发中</div>
    <div class="result-success-describe">功能开发中，功能开发中，功能开发中，功能开发中，</div>
    <div>
    </div>
  </div>
</template>
<script lang="ts">
export default {
  name: 'ResultFail',
};
</script>
<style lang="less" scoped>
.result-success {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 75vh;
  &-icon {
    font-size: 64px;
    color: var(--td-text-color-secondary);
  }

  &-title {
    margin-top: 16px;
    font-size: 20px;
    color: var(--td-text-color-primary);
    text-align: center;
    line-height: 22px;
    font-weight: 500;
  }

  &-describe {
    margin: 8px 0 32px;
    font-size: 14px;
    color: var(--td-text-color-secondary);
    line-height: 22px;
  }
}
</style>
