# ✨🤨🎉👺🥰 整理奇怪需求集合

## PC 端获取当前经纬度

- 使用高德地图开发文档
- 唤醒浏览器定位权限

## canvas 画点连线

- Setting.jsx --- 父组件
  DragArea.jsx --- 四个点可拖拽 画点连线
  DragLineArea.jsx --- 两点连线
  DrawRectArea.jsx --- 矩形可拖动
- Setting.vue --- 父组件
  CanvasDisplay.vue --- 子组件 可拖拽 画点连线

## loading 框

## 点击折叠展开收起 `Unfold.vue`

## file-upload 关于上传

el-upload 基于文件流、base64 和断点续传三个方式

## 56 个手写 Javascript 知识

- 分别在浏览器和 nodejs 中实现手写乘法口诀表
- 手写 new 一个实例
- 去重
- 翻转字符串（reverse,二分法，双指针）
- 防抖 debounce
  - 防抖，n秒后再执行，若n秒内被触发，则重新计时      
  - 关注一定时间连续触发的事件，只在最后执行一次
  - 场景：搜索框搜索输入。只需用户最后一次输入完，再发送请求;窗口大小resize。只需窗口调整完成后，计算窗口大小。防止重复渲染。
- 节流 throttle
  -  n 秒内只运行一次，若在 n 秒内重复触发，只有一次生效
  -  在一段连续操作中，函数节流一段时间内只执行一次
  -  场景：滚动加载，加载更多或滚到底部监听；搜索框，搜索联想功能

## 基于 element+vue 封装的一些组件

- tableRecord - 简单的无法修改的 el-table

## 奇怪的 CSS

- 实现圆边角缺一角的边框，右下角叠加圆角直角三角形(且底部有背景图片)
