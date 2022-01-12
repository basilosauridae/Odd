<template>
  <div
    ref="draggleBox"
    class="draggleBox"
  >
    <canvas
      ref="myCanvas"
      class="canvasBg"
      :width="600"
      :height="400"
      @mousedown="clickPoint($event)"
      @mouseup="mouseUp($event)"
      @mousemove="mouseMove($event)"
      @mouseleave="mouseLeave()"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive, ref, watch } from 'vue'

export default defineComponent({
  name: 'Canvas',
  props: {
    drawSet: {
      type: Object,
      default: (): any => {
        return {}
      }
    },
    pointData: {
      type: Array,
      default: (): any => {
        return []
      }
    }
  },
  setup (props) {
    const draggleBox = ref<any>(null)
    const myCanvas = ref<any>(null)
    const ctxOption = reactive<any>({
      ctx: null,
      stop: false
    })
    const canvasObj = reactive({
      width: 600,
      height: 400
    })
    const { pointData, drawSet } = reactive<any>(props)
    watch(drawSet,
      (newVal) => {
        drawPolygon(false)
      },
      {
        deep: true
      }
    )
    watch(pointData,
      (newVal) => {
        drawPolygon(false)
      },
      {
        deep: true
      }
    )
    const clear = () => {
      ctxOption.ctx.clearRect(0, 0, ctxOption.ctx.canvas.width, ctxOption.ctx.canvas.height)
    }
    const drawPolygon = (param:any) => {
      clear()
      // 清除画布，准备绘制
      ctxOption.ctx.lineJoin = 'round'
      ctxOption.ctx.lineWidth = 3
      // 遍历坐标点
      pointData.forEach((element:any, idx:number) => {
        if (idx === drawSet.drawIndex) {
          ctxOption.ctx.strokeStyle = '#48cfad'
        } else {
          ctxOption.ctx.strokeStyle = '#409eff'
        }
        ctxOption.ctx.beginPath()
        element.point.forEach((item:any, index:number) => {
          const canvasX = item.x * canvasObj.width
          const canvasY = item.y * canvasObj.height
          if (index < 1) {
            ctxOption.ctx.moveTo(canvasX, canvasY)
          } else {
            ctxOption.ctx.lineTo(canvasX, canvasY)
          }
        })
        if (param && idx === drawSet.drawIndex) {
          ctxOption.ctx.lineTo(param.x, param.y)
        }
        ctxOption.ctx.closePath()
        ctxOption.ctx.stroke()
      })
    }
    const clickPoint = (e:any) => {
      if (drawSet.isDraw) {
        const pointX = Number((e.offsetX / canvasObj.width).toFixed(2))
        const pointY = Number((e.offsetY / canvasObj.height).toFixed(2))
        const point:any = {
          x: pointX,
          y: pointY
        }
        pointData[drawSet.drawIndex].point.push(point)
      }
    }
    const mouseUp = (e:any) => {
      if (drawSet.isDraw) {
        drawPolygon(false)
      }
    }
    const mouseMove = (e:any) => {
      if (drawSet.isDraw) {
        const pointX = e.offsetX
        const pointY = e.offsetY
        drawPolygon({ x: pointX, y: pointY })
      }
    }
    const mouseLeave = () => {
      if (drawSet.isDraw) {
        drawPolygon(false)
      }
    }
    onMounted(() => {
      ctxOption.ctx = myCanvas.value.getContext('2d')
      drawPolygon(false)
    })
    return {
      draggleBox,
      myCanvas,
      canvasObj,
      clickPoint,
      mouseUp,
      mouseLeave,
      mouseMove,
      clear
    }
  }
})
</script>
<style lang="less" scoped>
.draggleBox{
  width: 100%;
  height: 100%;
  z-index: 40;
}
.canvasBg{
  background-size: 100% 100%;
  width: 600px;
  height: 400px;
  z-index: 100;
  position: relative;
}
</style>
