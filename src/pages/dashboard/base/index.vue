<template>
  <div>
    <!-- 顶部 card  -->
    <top-panel class="row-container" />
  </div>
</template>

<script lang="ts">
export default {
  name: 'DashboardBase',
};
</script>

<script setup lang="ts">
import TopPanel from './components/TopPanel.vue';
</script>

<style scoped>
.row-container:not(:last-child) {
  margin-bottom: 16px;
}
:deep() .t-card__body {
  padding-top: 0;
}
</style>
