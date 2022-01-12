<!--  -->
<template>
<div class="heatMapBox flex-column">
  <div class="storeTit">热力图</div>
  <div class="storeBody flex-column">
    <div class="flex-row-mid titBox">
      <div class="flex-row-mid marginR30">
        <div class="labelText marginR5">选择日期:</div>
        <el-date-picker
          v-model="date"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期">
        </el-date-picker>
      </div>
      <div class="flex-row-mid marginR30">
        <div class="labelText marginR5">选择时间:</div>]
        <el-time-picker
          is-range
          v-model="time"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          placeholder="选择时间范围"
          value-format="HH:mm:00"
          format="HH:mm"
          >
        </el-time-picker>
      </div>
      <div class="btnBox serachBtn" @click="searchResult">查询</div>
    </div>
    <div class="contentBox">
      <div class="chartBox" :style="{backgroundImage:'url('+floorDisplayUrl+')'}">
        <heat-map :chartsData="heatMapData"></heat-map>
      </div>
    </div>
  </div>
</div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》';
import heatMap from '../components/HeatMapChart'
import { urlPre } from '../utils/request'
export default {
  // import引入的组件需要注入到对象中才能使用
  components: {
    heatMap
  },
  data () {
    return {
      date: '',
      time: ['08:00:00', '19:00:00'],
      heatMapData: [],
      floorDisplayUrl: ''
    }
  },
  // 监听属性 类似于data概念
  computed: {},
  // 监控data中的数据变化
  watch: {},
  // 方法集合
  methods: {
    async searchResult () {
      if (this.date === '') {
        this.$message({
          message: '请选择时间',
          type: 'warning'
        })
        return
      }
      const postData = {
        startTime: this.date + ' ' + this.time[0],
        endTime: this.date + ' ' + this.time[1]
        // startTime: null,
        // endTime: null
      }
      const { data: res } = await this.$http.post('/cafe/screen/heatMap', postData)
      this.heatMapData = res.data
    },
    async getFloorImage () {
      const { data: res } = await this.$http.get('/cafe/sys/list', { params: { configId: 3 } })
      this.floorDisplayUrl = urlPre + '/' + res.data.floorPlan
    }
  },
  // 生命周期 - 创建完成（可以访问当前this实例）
  created () {
    this.getFloorImage()
    console.log(urlPre, 'urlPre')
  },
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted () {
  },
  // 生命周期 - 创建之前
  beforeCreate () {},
  // 生命周期 - 挂载之前
  beforeMount () {},
  // 生命周期 - 更新之前
  beforeUpdate () {},
  // 生命周期 - 更新之后
  updated () {},
  // 生命周期 - 销毁之前
  beforeDestroy () {},
  // 生命周期 - 销毁完成
  destroyed () {},
  // 如果页面有keep-alive缓存功能，这个函数会触发
  activated () {}
}
</script>
<style lang='less' scoped>
//@import url(); 引入公共css类
.heatMapBox{
  width: 100%;
  height: 100%;
  background-image: url('../assets/img/storeBg.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.storeTit{
  text-align: center;
  color: #fff;
  height: 40px;
  line-height: 40px;
  font-size: 20px;
}
.storeBody{
  flex: 1;
  padding: 20px 160px;
}
/deep/.el-range-input{
  background: #052124;
}
.labelText{
  color:#fff
}
.marginR30{
  margin-right: 30px;
}
.marginR5{
  margin-right: 10px;
}
.titBox{
  margin-bottom: 20px;
}
.contentBox{
  flex: 1;
  padding: 20px 0;
}
.chartBox{
  width: 100%;
  height: 100%;
  background-size: calc(100% - 120px) 100%;
  background-repeat: no-repeat;
}
</style>
