<template>
  <div class="mainBox">
    <div class="tabsBox">
      <el-tabs
        v-model="currentTabId"
        @tab-click="handleClick"
      >
        <el-tab-pane
          v-for="(item,idx) in tagArr"
          :key="idx"
          :label="item.name"
          :name="item.id"
        />
      </el-tabs>
    </div>
    <div
      v-if="contenShow.main"
      class="contentBox"
    >
      <div class="deviceListBox">
        <div class="titLine flex-row-between-mid">
          <div class="flex-row-mid">
            <i class="iconfont icon-caidan_liucheng" />
            <span>设备列表</span>
          </div>
          <el-checkbox
            v-model="checkAll"
            :indeterminate="isIndeterminate"
            @change="handleCheckAllChange"
          >
            全选
          </el-checkbox>
        </div>
        <ul class="deviceList">
          <el-checkbox-group
            v-model="deviceSel"
            @change="batchCheck"
          >
            <li
              v-for="item in deviceList"
              :key="item.id"
              :class="deviceSel.includes(item.id) ? 'activeLi' : 'unactiveLi'"
              class="itemLine flex-row-mid"
            >
              <el-checkbox
                :label="item.id"
                :disabled="deviceId === item.id"
              >
                {{}}
              </el-checkbox>
              <div
                class="stateBox flex-row-between-mid"
                @click="isActive(item.id)"
              >
                <div>
                  {{ item.name }}
                </div>
                <img
                  v-if="item.state === '1'"
                  src="@/assets/img/offlinedot.png"
                  draggable="false"
                >
                <img
                  v-else-if="item.state === '0'"
                  src="@/assets/img/onlinedot.png"
                  draggable="false"
                >
              </div>
            </li>
          </el-checkbox-group>
        </ul>
      </div>
      <div class="formListBox">
        <div class="titLine flex-row-between-mid">
          <div>
            <i class="iconfont icon-caidan_liucheng" />
            <span>设置</span>
          </div>
          <div v-show="batch">
            <el-button
              type="primary"
              size="small"
              @click="resetForm"
            >
              重置
            </el-button>
            <el-button
              type="primary"
              size="small"
              @click="saveForm"
            >
              保存
            </el-button>
          </div>
        </div>
        <el-scrollbar>
          <ul class="formList">
            <li
              v-for="item in formHead.conf"
              v-show="item.isBatch || batch"
              :key="item.type"
              class="formItemLine"
            >
              <div class="itemTit">
                {{ item.name }}
              </div>
              <div
                v-if="item.type === 'Boolean'"
                class="formContentBox switchLineBox"
              >
                <el-switch
                  v-show="batch"
                  v-model="formData[item.fieldKey]"
                  :active-value="true"
                  :inactive-value="false"
                />
                <div
                  v-show="!batch"
                  class="flex-row-mid"
                >
                  <div>当前选中摄像头状态：</div>
                  <div class="openColor stateStyle">
                    已开启：{{ aiState.onLine }}
                  </div>
                  <div class="closeColor stateStyle">
                    已关闭：{{ aiState.offLine }}
                  </div>
                </div>
              </div>
              <div
                v-else-if="item.type === 'TimePicker'"
                class="formContentBox"
              >
                <div
                  v-for="(timeBox, index) in formData[item.fieldKey]"
                  :key="index"
                >
                  <div>
                    <el-radio-group
                      v-model="timeBox.type"
                      @change="changeEvent($event, item.fieldKey, index)"
                    >
                      <!-- $event和el-radio-button中label值有关 -->
                      <el-radio-button label="day">
                        每日
                      </el-radio-button>
                      <el-radio-button label="week">
                        每周
                      </el-radio-button>
                      <el-radio-button label="month">
                        每月
                      </el-radio-button>
                    </el-radio-group>
                  </div>
                  <div
                    v-for="(col, idx) in timeBox.data"
                    :key="idx"
                    class="flex-row-mid timeBox"
                  >
                    <el-select
                      v-if="timeBox.type === 'week'"
                      v-model="col.value"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option
                        label="周一"
                        :value="1"
                      />
                      <el-option
                        label="周二"
                        :value="2"
                      />
                      <el-option
                        label="周三"
                        :value="3"
                      />
                      <el-option
                        label="周四"
                        :value="4"
                      />
                      <el-option
                        label="周五"
                        :value="5"
                      />
                      <el-option
                        label="周六"
                        :value="6"
                      />
                      <el-option
                        label="周日"
                        :value="7"
                      />
                    </el-select>
                    <el-select
                      v-if="timeBox.type === 'month'"
                      v-model="col.value"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option
                        v-for="days in 31"
                        :key="days"
                        :label="days + '号'"
                        :value="days"
                      />
                    </el-select>

                    <el-time-picker
                      v-model="col.time"
                      is-range
                      range-separator="-"
                      format="HH:mm:ss"
                      value-format="HH:mm:ss"
                      start-placeholder="开始时间"
                      end-placeholder="结束时间"
                      placeholder="选择时间范围"
                    />
                    <div
                      class="delIcon"
                      @click="delItem(item.fieldKey, index, idx)"
                    >
                      <img
                        src="@/assets/img/delete.png"
                        draggable="false"
                      >
                    </div>
                  </div>
                  <div
                    class="addItemBox"
                    @click="addItem(item.fieldKey, index)"
                  >
                    +
                  </div>
                </div>
              </div>
              <div
                v-else-if="item.type === 'Double'"
                class="formContentBox"
              >
                <el-input-number
                  v-model="formData[item.fieldKey]"
                  :step="0.1"
                  :precision="1"
                  :controls="true"
                  controls-position="right"
                />
                <span class="unit">{{ item.unit }}</span>
              </div>
              <div
                v-else-if="item.type === 'Position'"
                class="formContentBox"
              >
                <div
                  v-show="formData.area.polygon.length>1"
                  class="flex-row-mid radioBox"
                >
                  <el-radio-group
                    v-model="drawSet.drawIndex"
                    size="small"
                  >
                    <el-radio-button
                      v-for="(points,idx) in formData.area.polygon"
                      :key="idx"
                      :label="idx"
                    >
                      {{ points.lineName }}
                    </el-radio-button>
                  </el-radio-group>
                  <div
                    style="margin-left: 10px; color: #48cfad;font-size: 14px;"
                  >
                    <i class="el-icon-info" />
                    当前选中区域为绿色框
                  </div>
                </div>
                <div class="flex-row-mid">
                  <el-button
                    type="primary"
                    size="small"
                    @click="getDeviceScreen"
                  >
                    获取图片
                  </el-button>
                  <el-button
                    type="primary"
                    size="small"
                    @click="clearPoints(item.fieldKey)"
                  >
                    清除选区
                  </el-button>
                  <el-button
                    :type="!drawSet.isDraw? 'primary':'success'"
                    size="small"
                    @click="drawSwitch"
                  >
                    {{ !drawSet.isDraw ? '新增/编辑选取' : '确定' }}
                  </el-button>
                </div>
                <div
                  v-loading="imgUrl ==''"
                  element-loading-background="rgba(0, 0, 0, 0.4)"
                  class="imgBox"
                >
                  <el-image
                    v-show="imgUrl !==''"
                    :src="'data:image/jpg;base64,'+imgUrl"
                    draggable="false"
                  />
                  <div
                    class="canvasBox"
                  >
                    <CanvasDisplayVue
                      v-if="imgUrl !==''"
                      :draw-set="drawSet"
                      :point-data="formData[item.fieldKey].polygon"
                    />
                  </div>
                </div>
              </div>
              <el-button
                v-if="item.type !== 'Boolean' && item.type !=='Position'"
                v-show="!batch"
                type="primary"
                size="small"
                @click.prevent="saveItem(item.type)"
              >
                保存
              </el-button>
              <div
                v-else
                v-show="!batch"
              >
                <el-button
                  v-show="aiState.onLine !== deviceList.length"
                  type="primary"
                  size="small"
                  @click.prevent="openAll"
                >
                  全部开启
                </el-button>
                <el-button
                  v-show="aiState.onLine === deviceList.length"
                  type="primary"
                  size="small"
                  @click.prevent="closeAll"
                >
                  全部关闭
                </el-button>
              </div>
            </li>
          </ul>
        </el-scrollbar>
      </div>
    </div>
    <div
      v-if="contenShow.empty"
      class="emptyBox"
    >
      <el-empty
        :image-size="200"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { reqAiCloseAll, reqAiOpenAll, reqDeviceScreen, reqFormData, reqFormHead, reqList, reqSaveConfig, reqSaveDevices, reqTab } from '@/api/aiManage'
import { defineComponent, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import CanvasDisplayVue from '@/components/CanvasDisplay.vue'
import * as _ from 'lodash'
import { ElMessage } from 'element-plus'
import { queryDeviceList } from './index'

export default defineComponent({
  name: 'AiSetting',
  components: {
    CanvasDisplayVue
  },
  setup (props) {
    const router = useRoute()
    const currentTabId = ref<any>('')
    const tagArr = ref<never[]>([])
    const deviceSel = ref<any>([])
    const deviceId = ref<string>('')
    const checkAll = ref<boolean>(false)
    const isIndeterminate = ref<boolean>(false)
    const contenShow = reactive({
      main: true,
      empty: false
    })
    const getTab = async () => {
      const { data: res } = await reqTab()
      if (!router.query.modelId) {
        currentTabId.value = res.result[0].id
      } else {
        currentTabId.value = router.query.modelId
      }
      tagArr.value = res.result
      await getDeviceList(currentTabId.value)
      getFormHead(currentTabId.value)
    }
    const handleClick = async (tab:object) => {
      await getDeviceList(currentTabId.value)
      getFormHead(currentTabId.value)
      deviceSel.value = []
      batch.value = true
    }
    const deviceList = ref<queryDeviceList[]>([])
    const AllId = ref([])
    const getDeviceList = async (val:string|number) => {
      const { data: res } = await reqList(val)
      if (res.code === 200 && res.success) {
        deviceList.value = res.result
        AllId.value = res.result.map((item:any) => item.id)
        deviceId.value = res.result[0].id
        await isActive(deviceId.value)
        contenShow.main = true
        contenShow.empty = false
      } else {
        contenShow.main = false
        contenShow.empty = true
      }
    }
    const isActive = async (val:string) => {
      deviceId.value = val
      if (batch.value) {
        deviceSel.value.splice(deviceSel.value.length - 1, 1, val)
        await getFormData()
        getDeviceScreen()
      } else {
        if (!deviceSel.value.includes(val)) {
          deviceSel.value.push(val)
        }
      }
      checkAll.value = deviceSel.value.length === deviceList.value.length
      isIndeterminate.value = !checkAll.value
      drawSet.isDraw = false
      drawSet.drawIndex = 0
    }
    const handleCheckAllChange = (val:[any]) => {
      deviceSel.value = val ? AllId.value : []
      isIndeterminate.value = false
      batch.value = !checkAll.value
      formData.timeRange[0].data = []
      formData.fps = 0
      if (!val) {
        isActive(deviceId.value)
      }
    }
    const aiState = reactive({
      onLine: 0,
      offLine: 0
    })
    watch(deviceSel,
      (newVal) => {
        Object.assign(aiState, {
          onLine: 0,
          offLine: 0
        })
        newVal.forEach((element:any) => {
          deviceList.value.forEach(item => {
            if (item.id === element) {
              if (item.state === '0') {
                aiState.onLine += 1
              } else if (item.state === '1') {
                aiState.offLine += 1
              }
            }
          })
        })
      },
      { deep: true }
    )
    const changeSel = () => {
      console.log(111)
    }
    const batch = ref<boolean>(true)
    const batchCheck = (val:[any]) => {
      checkAll.value = val.length === deviceList.value.length
      isIndeterminate.value = val.length > 0 && val.length < deviceList.value.length
      if (deviceSel.value.length > 1) {
        batch.value = false
        formData.timeRange[0].data = []
        formData.fps = 0
      } else if (deviceSel.value.length === 0) {
        checkAll.value = false
      } else {
        batch.value = true
        isActive(deviceSel.value[0])
      }
    }

    const formHead = reactive({
      conf: [],
      id: ''
    })
    const formData = reactive<any>({})
    /* 获取表头 */
    const checkData = reactive<any>({})

    const getFormHead = async (val:string|number) => {
      const { data: res } = await reqFormHead(val)
      Object.assign(formHead, res.result)
    }
    const getFormData = async () => {
      const postData = {
        deviceId: deviceId.value,
        id: currentTabId.value
      }
      const { data: res } = await reqFormData(postData)
      Object.assign(formData, res.result)
      Object.assign(checkData, _.cloneDeep(res.result))
    }

    const changeEvent = (val:string, target:any, index:number) => {
      console.log(val, target, index)
      if (val === checkData[target][index].type) {
        Object.assign(formData[target][index], _.cloneDeep(checkData[target][index]))
      } else {
        formData[target][index].data = []
        formData[target][index].value = ''
      }
    }
    const delItem = (target:any, index:number, item:number) => {
      formData[target][index].data.splice(item, 1)
    }
    const addItem = (target:any, index:number) => {
      const item = {
        time: [],
        value: ''
      }
      formData[target][index].data.push(item)
    }
    const imgUrl = ref('')
    /* 获取设备截图 */
    const getDeviceScreen = async () => {
      imgUrl.value = ''
      const { data: res } = await reqDeviceScreen(deviceId.value)
      if (res.code === 4444) {
        ElMessage.error('超时错误')
        imgUrl.value = ''
      } else if (res.result == null) {
        imgUrl.value = ''
      } else {
        imgUrl.value = res.result.image
      }
    }

    const clearPoints = (val:any) => {
      formData[val].polygon[drawSet.drawIndex].point = []
    }

    const resetForm = () => {
      getDeviceList(currentTabId.value)
      getFormHead(currentTabId.value)
    }
    const saveForm = async () => {
      const postData = {
        id: currentTabId.value,
        cameraId: deviceId.value,
        image: imgUrl.value,
        switch: ''
      }
      if (formData.area.polygon.length !== 0) {
        formData.area.isFull = false
      } else {
        formData.area.isFull = true
      }
      Object.assign(postData, formData)
      const { data: res } = await reqSaveConfig(postData)
      if (res.code === 200 && res.success) {
        ElMessage.success('保存成功')
        const index = deviceList.value.findIndex(item => item.id === postData.cameraId)
        deviceList.value[index].state = Number(!postData.switch).toString()
      } else {
        console.log(res)
      }
    }
    const openAll = async () => {
      const postData = {
        id: currentTabId.value,
        deviceIds: deviceSel.value
      }
      const { data: res } = await reqAiOpenAll(postData)
      if (res.code === 200 && res.success) {
        postData.deviceIds.forEach((element:any) => {
          deviceList.value.forEach(item => {
            if (item.id === element) {
              item.state = '0'
            }
          })
        })
        ElMessage.success('操作成功')
      }
    }
    const closeAll = async () => {
      const postData = {
        id: currentTabId.value,
        deviceIds: deviceSel.value
      }
      const { data: res } = await reqAiCloseAll(postData)
      if (res.code === 200 && res.success) {
        postData.deviceIds.forEach((element:any) => {
          deviceList.value.forEach(item => {
            if (item.id === element) {
              item.state = '1'
            }
          })
        })
        ElMessage.success('操作成功')
      }
    }
    const saveItem = (val:string) => {
      if (val === 'TimePicker') {
        const postData = {
          id: currentTabId.value,
          deviceIds: deviceSel.value,
          timeRange: []
        }
        Object.assign(postData.timeRange, formData.timeRange)
        saveDevices(postData)
      } else if (val === 'Double') {
        const postData = {
          id: currentTabId.value,
          deviceIds: deviceSel.value,
          fps: formData.fps
        }
        saveDevices(postData)
      }
    }
    const saveDevices = async (val:object) => {
      const { data: res } = await reqSaveDevices(val)
      console.log(res)
    }

    const drawSet = reactive({
      isDraw: false,
      drawIndex: 0
    })
    const drawSwitch = () => {
      drawSet.isDraw = !drawSet.isDraw
    }
    onMounted(() => {
      getTab()
    })
    return {
      currentTabId,
      tagArr,
      contenShow,
      checkAll,
      AllId,
      isIndeterminate,
      handleCheckAllChange,
      changeSel,
      handleClick,
      deviceList,
      deviceSel,
      deviceId,
      aiState,
      isActive,
      batchCheck,
      formHead,
      batch,
      formData,
      changeEvent,
      delItem,
      addItem,
      getDeviceScreen,
      imgUrl,
      clearPoints,
      resetForm,
      saveForm,
      openAll,
      closeAll,
      saveItem,
      drawSet,
      drawSwitch
    }
  }
})
</script>
<style lang="less" scoped>
.mainBox{
  width: 100%;
  height: 100%;
  position: relative;
  background: #fff;
  border-radius: 10px;
  padding: 0 20px 20px 20px;
  display: grid;
  grid-template-rows: 74px calc(100% - 74px);
  color: #54617A;
}
.tabsBox{
  :deep(.el-tabs__item){
    color: #54617A;
    margin: 10px 0;
  }
  :deep(.is-active){
    color: #2A84DC;
  }
}
.contentBox{
  /*display:grid网格布局
  grid-template-columns属性定义每一列的列宽，grid-template-rows属性定义每一行的行高
  网格布局提供了fr关键字（fraction 的缩写，意为"片段"）。1fr也表示360px
  */
  display: grid;
  grid-template-columns: 360px 1fr;
  grid-template-rows: 100%;
  .titLine{
    font-size: 16px;
    height: 50px;
    i{
      margin-right: 10px;
      font-size: 20px;
    }
  }
  .deviceListBox{
    display: grid;
    grid-template-rows: auto 1fr;
    .deviceList{
      margin-top: 20px;
      .itemLine{
        background: #F2F5F7;
        padding: 20px;
        overflow: hidden;
        border-radius: 4px;
        margin-bottom: 10px;
        font-size: 16px;
        .stateBox{
          cursor: pointer;
          flex: 3;
          img{
            vertical-align: middle;
          }
        }
      }
    }
  }
  .formListBox{
    display: flex;
    flex-direction: column;
    margin-left: 20px;
    .el-scrollbar{
      margin-top: 20px;
      height: 100%;
    }
    .formList{
      width: 100%;
      height: 100%;
      text-align: left;
      background: #F2F5F7;
      border-radius: 4px;
      padding: 20px;
      box-sizing: border-box;
      .formItemLine{
        margin-bottom: 20px;
        display: flex;
      }
      .el-button{
        align-self: flex-start;
      }
      .switchLineBox{
        height: 40px;
      }
      .formContentBox{
        flex: 10;
        .unit{
          margin-left: 10px;
        }
      }
      .timeBox{
        margin: 10px 0;
        .el-select{
          margin-right: 10px;
          width: 100px;
        }
      }
      .itemTit{
        margin-right: 20px;
        width: 180px;
      }
      .imgBox{
        width: 600px;
        height: 400px;
        position: relative;
        .canvasBox{
          width: 100%;
          height: 100%;
          position: relative;
          z-index: 20;
          margin-top: 10px;
        }
        .el-image{
          width: 100%;
          height: 100%;
          z-index: 10;
          position: absolute;
        }
      }
    }
  }
}
.activeLi{
  border: 1px solid #2A84DC;
  color: #2A84DC;
}
.unactiveLi{
  border: 1px solid #ccc;
  color: #54617A;
}
.delIcon{
  width: 20px;
  height: 20px;
  margin-left: 10px;
  cursor: pointer;
  img{
    width:100%;
    height: 100%;
  }
}
.addItemBox{
  width: 210px;
  height: 40px;
  border: 1px dashed #1CAFD4;
  border-radius: 4px;
  line-height: 40px;
  text-align: center;
  font-size: 20px;
  font-weight: bolder;
  color: #1CAFD4;
  background: RGBA(28, 175, 212, 0.2);
  cursor: pointer;
  margin-top: 10px;
}
.openColor{
  color: #20D8B2;
}
.closeColor{
  color: #EB5153;
}
.noSetColor{
  color: #8098AE;
}
.stateStyle{
  margin-right: 10px;
  border-right: 1px solid #8098AE;
  padding-right: 10px;
}
.stateStyle:last-of-type{
  margin-right: 10px;
  border-right: none;
  padding-right: 10px;
}
.emptyBox{
  width: 100%;
  height: 100%;
  position: absolute;
  .el-empty{
    width: 100%;
    height: 100%;
  }
}
.radioBox{
  margin-bottom: 10px;
  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner){
    background: #48cfad;
    border-color: #48cfad;
  }
}
</style>
