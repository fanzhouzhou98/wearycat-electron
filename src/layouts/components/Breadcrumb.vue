<template>
  <t-breadcrumb :max-item-width="'150'" class="tdesign-breadcrumb">
    <t-breadcrumbItem v-for="item in crumbs" :key="item.to" :to="item.to">
      {{ item.title }}
    </t-breadcrumbItem>
  </t-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

// 定义 crumbs 类型，假设其元素为包含 path、to、title 属性的对象
type BreadcrumbItem = {
  path: string;
  to: string;
  title: string;
};
const crumbs = computed<BreadcrumbItem[]>(() => {
  const route = useRoute();

  const pathArray = route.path.split('/');
  pathArray.shift();

  const breadcrumbs = pathArray.reduce((breadcrumbArray, path, idx) => {
    // 如果路由下有hiddenBreadcrumb或当前遍历到参数则隐藏
    if (route.matched[idx]?.meta?.hiddenBreadcrumb || Object.values(route.params).includes(path)) {
      return breadcrumbArray;
    }
    //@ts-ignore
    breadcrumbArray.push({
      path,
      //@ts-ignore
      to: breadcrumbArray[idx - 1] ? `/${breadcrumbArray[idx - 1].path}/${path}` : `/${path}`,
      title: route.matched[idx]?.meta?.title ?? path,
    });
    return breadcrumbArray;
  }, []);
  return breadcrumbs;
});
</script>
<style scoped>
.tdesign-breadcrumb {
  margin-bottom: 24px;
}
</style>
