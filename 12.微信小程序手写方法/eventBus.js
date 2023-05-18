import QLEventBus from './QLeventBus'

const eventBus = new QLEventBus()

export default eventBus

// 一般在模块js文件中引入，应用场景：tabBar图标动态消息提示等