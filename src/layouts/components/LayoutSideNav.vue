<template>
  <l-side-nav
    v-if="settingStore.showSidebar"
    :show-logo="settingStore.showSidebarLogo"
    :layout="settingStore.layout"
    :is-fixed="settingStore.isSidebarFixed"
    :menu="sideMenu"
    :theme="settingStore.displayMode"
    :is-compact="settingStore.isSidebarCompact"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { usePermissionStore, useSettingStore } from '@/store';
import LSideNav from './SideNav.vue';

const route = useRoute();
const permissionStore = usePermissionStore();
const settingStore = useSettingStore();
const { routers: menuRouters } = storeToRefs(permissionStore);

const sideMenu = computed(() => {
  const { layout, splitMenu } = settingStore;
  let newMenuRouters = menuRouters.value;
  if (layout === 'mix' && splitMenu) {
    newMenuRouters.forEach((menu) => {
      //@ts-ignore
      if (route.path.indexOf(menu.path) === 0) {
        //@ts-ignore
        newMenuRouters = menu.children.map((subMenu) => ({ ...subMenu, path: `${menu.path}/${subMenu.path}` }));
      }
    });
  }
  return newMenuRouters;
});
</script>
