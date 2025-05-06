import { createApp } from 'vue';
import TDesign from 'tdesign-vue-next';
import 'tdesign-vue-next/es/style/index.css';

import { store } from './store';
import router from './router';
import '@/style/index.less';
import './permission';
import App from './App.vue';
const webApp = createApp(App);

webApp.use(TDesign);
webApp.use(store);
webApp.use(router);

webApp.mount('#app');
