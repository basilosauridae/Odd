import Vue from 'vue';
import ElementUI from 'element-ui';
/* 导入公共的样式 && ELEMENT */
import './assets/reset.min.css';
import './assets/common.css';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App3.vue';

Vue.use(ElementUI);
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')


/**
 * 断点续传
 * 让服务端返回已经上传过去的切片
 * 我们前端切成后会根据所有的切片来筛选知道哪些要上传
 * 另外服务端应该知道文件是否是已经上传完毕也就是秒传的 我觉得可以通过文件夹和文件做区分
 * 应该是前端生成hash传递给后端
 * 文件内容跟hash是一一对应的
 * 所以可以保证去重
 */