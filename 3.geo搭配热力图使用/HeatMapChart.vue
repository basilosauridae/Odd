<template>
  <div class="chartBox" ref="heatMap" id="heatMap"></div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》';
// import { Chart } from '@antv/g2'
export default {
  // import引入的组件需要注入到对象中才能使用
  components: {},
  props: {
    chartsData: {
      type: Array
    }
  },
  data () {
    return {
      chart: null,
      dataList: [],
      heatMap: {
        type: 4,
        firstFrom: 0,
        firstTo: 0,
        secondFrom: 0,
        secondTo: 0,
        thirdFrom: 0,
        thirdTo: 0,
        fourthFrom: 0,
        fourthTo: 0,
        fifthFrom: 0,
        fifthTo: ''
      }
    }
  },
  // 监听属性 类似于data概念
  computed: {
  },
  // 监控data中的数据变化
  watch: {
    chartsData: {
      handler (newVal, oldVal) {
        this.dataList = this.chartsData.map(item => {
          return [item.bodyX, item.bodyY, item.dataInCount]
        })
        // this.dataList = this.chartsData
        console.log(this.dataList, 'this.dataList')
        this.drawChart()
      },
      deep: true
    }
  },
  // 方法集合
  methods: {
    initChart () {
      this.chart = this.$echarts.init(document.getElementById('heatMap'))
    },
    async getClassSetting () {
      const { data: res } = await this.$http.get('/cafe/sys/list', { params: { configId: 4 } })
      this.heatMap = res.data
    },
    drawChart () {
      const geoMapName = 'geoMap' + Math.round(Math.random() * 1E10)
      const features = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {
            name: geoMapName
          },
          geometry: {
            type: 'MultiPolygon',
            coordinates: [
              [
                [
                  [0, 0],
                  [1, 0],
                  [1, 1],
                  [0, 1]
                ]
              ]
            ]
          }
        }]
      }
      this.$echarts.registerMap(geoMapName, features)
      const option = {
        title: {
          show: false
        },
        geo: {
          map: geoMapName,
          aspectScale: 1, // 宽高比
          left: 0,
          top: 0,
          right: 100,
          bottom: 0,
          boundingCoords: [
            // 定位左上角经纬度
            [0, 0],
            // 定位右下角经纬度
            [1, 1]
          ],
          itemStyle: {
            opacity: 0
          },
          silent: true
        },
        /* 热力图右侧颜色取值范围: */
        visualMap: {
          type: 'piecewise', // 设置热力值图例改为一段一段的
          splitNumber: 5,
          top: 20,
          right: 0,
          // selectedMode: 'none',
          pieces: [
            { gt: Number(this.heatMap.fourthFrom) }, // (201, +]
            { gte: Number(this.heatMap.thirdFrom), lte: Number(this.heatMap.thirdTo) }, // (51, 200]
            { gte: Number(this.heatMap.secondFrom), lte: Number(this.heatMap.secondTo) }, // (11, 50]
            { gte: Number(this.heatMap.firstFrom), lte: Number(this.heatMap.firstTo) } // [1,10]
          ],
          inRange: {
            color: ['#59C01B', '#EBE579', '#EF7537', '#E63B33']
          },
          textStyle: {
            color: '#fff'
          }
        },
        series: [{
          type: 'heatmap',
          coordinateSystem: 'geo',
          maxOpacity: 0.8,
          data: this.dataList
        }]
      }
      this.chart.setOption(option, true)
    },
    resizeHandler () {
      this.chart.resize()
    }
    // initChart () {
    //   const heatMapChart = this.$refs.heatMap
    //   this.chart = new Chart({
    //     container: heatMapChart,
    //     autoFit: true,
    //     padding: [15, 40]
    //   })
    // },
    // drawChart () {
    //   this.chart.data(this.dataList)
    //   this.chart.scale({
    //     tmp: { nice: true }
    //   })
    //   this.chart.tooltip(false)
    //   this.chart.axis(false)
    //   this.chart.legend({
    //     offset: 10
    //   })
    //   this.chart.heatmap()
    //     .position('bodyX*bodyY')
    //     .color('dataInCount', '#2690F2-#59C01B-#EBE579-#EF7537-#E63B33')
    //   this.chart.render()
    // }
  },
  // 生命周期 - 创建完成（可以访问当前this实例）
  created () {
    this.getClassSetting()
  },
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted () {
    this.initChart()
    window.addEventListener('resize', () => this.resizeHandler())
    // this.drawChart()
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
  beforeDestroy () {
    window.removeEventListener('resize', () => this.resizeHandler())
  },
  // 生命周期 - 销毁完成
  destroyed () {},
  // 如果页面有keep-alive缓存功能，这个函数会触发
  activated () {}
}
</script>
<style lang='less' scoped>
//@import url(); 引入公共css类
.chartBox{
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
