import Layout from '@/layouts/index.vue';
import ListIcon from '@/assets/assets-slide-list.svg';

export default [{
	"path": "/utools",
	"name": "utools",
	"component": Layout,
	"redirect": "/utools/generateId",
	"meta": {
		"title": "常用工具",
		"icon": ListIcon
	},
	"children": [
	{
		"path": "generateId",
		"name": "GenerateID",
		"component": ()=>import("@/pages/utools/generateId/index.vue"),
		"meta": {
			"title": "证件生成器"
		}
	},
	{
		"path": "toJson",
		"name": "toJson",
		"component": ()=>import("@/pages/utools/toJson/index.vue"),
		"meta": {
			"title": "JSON格式化"
		}
	},
	{
		"path": "toBase64",
		"name": "toBase64",
		"component": ()=>import("@/pages/utools/toBase64/index.vue"),
		"meta": {
			"title": "base64转换"
		}
	},
	{
    path: 'download',
    name: 'download',
    component: () => import('@/pages/download/index.vue'),
    meta: { title: 'rrweb文件下载' },
  },
]
}]