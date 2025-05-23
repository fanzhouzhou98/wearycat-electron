import { defineStore } from 'pinia';
import keys from 'lodash/keys';
import { COLOR_TOKEN, LIGHT_CHART_COLORS, DARK_CHART_COLORS, TColorSeries } from '@/config/color';
import STYLE_CONFIG from '@/config/style';
import { store } from '@/store';

const state = {
  ...STYLE_CONFIG,
  showSettingPanel: false,
  colorList: COLOR_TOKEN,
  chartColors: LIGHT_CHART_COLORS,
};

export type TState = typeof state;

export const useSettingStore = defineStore('setting', {
  state: () => state,
  getters: {
    showSidebar: (state) => state.layout !== 'top',
    showSidebarLogo: (state) => state.layout === 'side',
    showHeaderLogo: (state) => state.layout !== 'side',
    displayMode: (state): 'dark' | 'light' => {
      if (state.mode === 'auto') {
        const media = window.matchMedia('(prefers-color-scheme:dark)');
        if (media.matches) {
          return 'dark';
        }
        return 'light';
      }
      return state.mode as 'dark' | 'light';
    },
  },
  actions: {
    async changeMode(mode: 'dark' | 'light' | 'auto') {
      let theme = mode;

      if (mode === 'auto') {
        const media = window.matchMedia('(prefers-color-scheme:dark)');
        if (media.matches) {
          theme = 'dark';
        } else {
          theme = 'light';
        }
      }
      const isDarkMode = theme === 'dark';

      document.documentElement.setAttribute('theme-mode', isDarkMode ? 'dark' : '');

      this.chartColors = isDarkMode ? DARK_CHART_COLORS : LIGHT_CHART_COLORS;
    },
    changeBrandTheme(brandTheme: string) {
      document.documentElement.setAttribute('theme-color', brandTheme);
    },
    addColor(payload: TColorSeries) {
      this.colorList = { ...this.colorList, ...payload };
    },
    updateConfig(payload: Partial<TState>) {
      for (const key in payload) {
        //@ts-ignore
        if (payload[key] !== undefined) {
          //@ts-ignore
          this[key] = payload[key];
        }
        if (key === 'mode') {
          //@ts-ignore
          this.changeMode(payload[key]);
        }
        if (key === 'brandTheme') {
          //@ts-ignore
          this.changeBrandTheme(payload[key]);
        }
      }
    },
  },
  persist: {
    paths: [...keys(STYLE_CONFIG), 'colorList', 'chartColors'],
  },
});

export function getSettingStore() {
  return useSettingStore(store);
}
