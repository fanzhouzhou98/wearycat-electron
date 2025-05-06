<template>
  <t-row :gutter="[16, 16]">
    <t-col v-for="(item, index) in PANE_LIST" :key="item.title" :xs="6" :xl="3">
      <t-card
        :title="item.title"
        :style="{ height: '168px' }"
        :class="{ 'dashboard-item': true, 'dashboard-item--main-color': index == 0 }"
      >
        <div class="dashboard-item-top">
          <span :style="{ fontSize: `${resizeTime * 36}px` }">{{ item.number }}</span>
        </div>
        <div class="dashboard-item-left">
          <div
            v-if="index === 0"
            id="moneyContainer"
            class="dashboard-chart-container"
            :style="{ width: `${resizeTime * 120}px`, height: `${resizeTime * 66}px` }"
          ></div>
          <div
            v-else-if="index === 1"
            id="refundContainer"
            class="dashboard-chart-container"
            :style="{ width: `${resizeTime * 120}px`, height: `${resizeTime * 42}px` }"
          ></div>
          <span v-else-if="index === 2" :style="{ marginTop: `-24px` }">
            <usergroup-icon />
          </span>
          <span v-else :style="{ marginTop: '-24px' }">
            <file-icon />
          </span>
        </div>
        <template #footer>
          <div class="dashboard-item-bottom">
            <div class="dashboard-item-block">
              自从上周以来
              <trend
                class="dashboard-item-trend"
                :type="item.upTrend ? 'up' : 'down'"
                :is-reverse-color="index === 0"
                :describe="item.upTrend || item.downTrend"
              />
            </div>
            <t-icon name="chevron-right" />
          </div>
        </template>
      </t-card>
    </t-col>
  </t-row>
</template>

<script lang="ts">
export default {
  name: 'DashboardBase',
};
</script>

<script setup lang="ts">
import { onMounted, watch, ref, onUnmounted } from 'vue';

import { UsergroupIcon, FileIcon } from 'tdesign-icons-vue-next';
import { useSettingStore } from '@/store';
//@ts-ignore
import { changeChartsTheme } from '@/utils/color';

// 导入样式
import Trend from '@/components/trend/index.vue';

import { PANE_LIST } from '../constants';

const store = useSettingStore();
const resizeTime = ref(1);

onMounted(() => {
});

onUnmounted(() => {
});

watch(
  () => store.brandTheme,
  () => {
  },
);
</script>

<style lang="less" scoped>
.dashboard-item {
  padding: 8px;

  :deep(.t-card__footer) {
    padding-top: 0;
  }

  :deep(.t-card__title) {
    font-size: 14px;
    font-weight: 500;
  }

  :deep(.t-card__body) {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1;
    position: relative;
  }

  &:hover {
    cursor: pointer;
  }

  &-top {
    display: flex;
    flex-direction: row;
    align-items: flex-start;

    > span {
      display: inline-block;
      color: var(--td-text-color-primary);
      font-size: 36px;
      line-height: 44px;
    }
  }

  &-bottom {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    > .t-icon {
      cursor: pointer;
    }
  }

  &-block {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 22px;
    color: var(--td-text-color-placeholder);
  }

  &-trend {
    margin-left: 8px;
  }

  &-left {
    position: absolute;
    top: 0;
    right: 32px;

    > span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      background: var(--td-brand-color-1);
      border-radius: 50%;

      .t-icon {
        font-size: 24px;
        color: var(--td-brand-color);
      }
    }
  }

  // 针对第一个卡片需要反色处理
  &--main-color {
    background: var(--td-brand-color);
    color: var(--td-text-color-primary);

    :deep(.t-card__title),
    .dashboard-item-top span,
    .dashboard-item-bottom {
      color: var(--td-text-color-anti);
    }

    .dashboard-item-block {
      color: var(--td-text-color-anti);
      opacity: 0.6;
    }

    .dashboard-item-bottom {
      color: var(--td-text-color-anti);
    }
  }
}
</style>
