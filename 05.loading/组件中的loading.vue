<template>
<div class="mainBox" v-loading="loadingShow" element-loading-background="rgba(0, 0, 0, 0.2)">
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>设备配置</span>
      </div>
    </template>
    <el-tabs v-model="activeName" type="border-card">
      <el-tab-pane label="摄像头" name="camera">
        <div class="topBox flex-row-between-mid">
          <div><span>摄像头数量:</span><span>{{tableData.length}}</span>/{{totalNum}}</div>
          <el-button type="primary" @click="methods.addCamera" :disabled="tableData.length === totalNum">添加摄像头</el-button>
        </div>
        <div class="contentBox">
          <el-table
            :data="tableData"
            >
            <el-table-column
              prop="cameraAlias"
              label="设备名称"
              width="200">
            </el-table-column>
            <el-table-column
              prop="cameraUrl"
              label="视频流地址"
              width="400">
            </el-table-column>
            <el-table-column
              prop="cameraSn"
              label="设备SN号"
              width="150"
            >
            </el-table-column>
            <el-table-column label="检测类型" width="600">
              <template #default="scope">
                <span class="marR10" v-for="(item,index) in scope.row.detectionList" :key="index">{{methods.ability(item)}}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <div class="tableBtnBox">
                  <el-button icon="el-icon-picture-outline" class="photoBtn" circle @click="methods.getImg(scope.row)"></el-button>
                  <el-button icon="el-icon-edit" class="editBtn" circle @click="methods.handleEdit(scope.row)"></el-button>
                  <el-button icon="el-icon-close" class="delBtn" circle @click="methods.clickdelBtn(scope.row)"></el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="AIS设备" name="AIS">
        <component :is="currentComponent"></component>
      </el-tab-pane>
    </el-tabs>

  </el-card>
</div>

<el-dialog
  custom-class="delDialog"
  title="删除摄像头"
  v-model="delVisible"
  width="20%">
  <span>确定要删除摄像头 <span style="color:red">{{delcameraAlias}}</span> 吗</span>
  <template #footer>
    <span class="dialog-footer">
      <el-button @click="delVisible = false" size="medium">取 消</el-button>
      <el-button
        type="success"
        size="medium"
        v-loading.fullscreen.lock="fullscreenLoading"
        @click="methods.del(delId),delVisible = false"
      >确 定</el-button>
    </span>
  </template>
</el-dialog>
<el-dialog
  :title="dialogTitle"
  v-model="dialogVisible"
  @close="methods.resetForm"
  :append-to-body="true"
  destroy-on-close
  :close-on-click-modal="false"
  custom-class="addDialog"
  width="40%"
  >
  <!-- 为什么需要append-to-body，before-close，close-on-click-modal -->
  <div class="modalBody">
    <el-form label-width="100px" :rules="rules" :model="form" ref="formBox">
      <el-form-item label="设备名称" prop="cameraAlias">
        <el-input v-model.trim="form.cameraAlias" placeholder="请输入名称"></el-input>
      </el-form-item>
      <el-form-item label="流地址" prop="cameraUrl">
        <el-input v-model.trim="form.cameraUrl" placeholder="请输入地址"></el-input>
      </el-form-item>
      <el-form-item label="设备SN号" prop="cameraSn">
        <el-input v-model.trim="form.cameraSn" placeholder="请输入SN号"></el-input>
      </el-form-item>
      <el-form-item label="检测类型" prop="detectionList">
        <el-checkbox-group v-model="form.detectionList">
          <el-checkbox :label="1" :checked="form.detectionList.includes(1)" name="type">驾驶舱人数</el-checkbox>
          <el-checkbox :label="2" :checked="form.detectionList.includes(2)" name="type">人数统计</el-checkbox>
          <el-checkbox :label="3" :checked="form.detectionList.includes(3)" name="type">甲板救生衣</el-checkbox>
          <el-checkbox :label="4" :checked="form.detectionList.includes(4)" name="type">人证合一</el-checkbox>
          <el-checkbox :label="5" :checked="form.detectionList.includes(5)" name="type">烟火检测</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
  </div>
  <template #footer>
    <span class="dialog-footer">
      <el-button @click="methods.resetForm">取 消</el-button>
      <el-button
        v-show="saveBtn"
        type="primary"
        v-loading.fullscreen.lock="fullscreenLoading"
        @click="methods.saveValidate('save')"
      >确 定</el-button>
      <el-button
        v-show="!saveBtn"
        type="primary"
        v-loading.fullscreen.lock="fullscreenLoading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
        element-loading-text="处理中，请稍后"
        element-loading-spinner="el-icon-loading"
        @click="methods.saveValidate('update')"
      >确 定</el-button>
    </span>
  </template>
</el-dialog>
<el-dialog
  custom-class="imgDialog"
  title="预览"
  :append-to-body="true"
  v-model="dialogVisible2"
  width="55%"
  >
  <div class="modalBody">
    <el-image :src="imgUrl+currentImg"></el-image>
  </div>
</el-dialog>
</template>

<script>
import { getDeviceInfo, updateCameraInfo, delDevice, saveCameraInfo, getUrlImg } from '@/api/monitorDeviceSetting'
import { reactive, readonly, ref } from '@vue/reactivity'
import { onMounted, defineAsyncComponent } from '@vue/runtime-core'
import { ElMessage } from 'element-plus'
export default {
  components: {
    AIS: defineAsyncComponent(() => import('@/components/commonComponent/AIS.vue'))
  },
  setup () {
    const fullscreenLoading = ref(false)
    const currentComponent = ref('AIS')
    const activeName = ref('camera')
    const loadingShow = ref(false)
    const dialogVisible = ref(false)
    const dialogVisible2 = ref(false)
    const delVisible = ref(false)
    const delId = ref(null)
    const dialogTitle = ref('')
    const delcameraAlias = ref('')
    const popover = ref([])
    const imgUrl = ref('data:image/png;base64,')
    const currentImg = ref('')
    const saveBtn = ref(false)
    const totalNum = ref(4)
    const tableData = ref([])
    const formBox = ref(null)
    const form = reactive({
      cameraAlias: '',
      cameraUrl: '',
      detectionList: [],
      cameraSn: ''
    })
    const rules = readonly({
      cameraAlias: [
        { required: true, message: '请输入名称', trigger: 'blur' }
      ],
      cameraUrl: [
        { required: true, message: '请输入地址', trigger: 'blur' }
      ],
      detectionList: [
        { type: 'array', required: true, message: '请至少选择一项', trigger: 'change' }
      ],
      cameraSn: [
        { required: true, message: '请输入SN号', trigger: 'blur' }
      ]
    })
    const methods = {
      getList: async () => {
        const { data: res } = await getDeviceInfo()
        if (res.code === 0 && res.data != null) {
          tableData.value = res.data
        } else {
          tableData.value = []
        }
      },
      ability: (val) => {
        if (val === 1) {
          return '驾驶舱人数'
        } else if (val === 2) {
          return '人数统计'
        } else if (val === 3) {
          return '甲板救生衣'
        } else if (val === 4) {
          return '人证合一'
        } else {
          return '烟火检测'
        }
      },
      addCamera: () => {
        dialogTitle.value = '新增摄像头'
        dialogVisible.value = true
        saveBtn.value = true
        // formBox.value.resetFields()
      },
      handleEdit: (params) => {
        dialogTitle.value = '编辑摄像头'
        dialogVisible.value = true
        saveBtn.value = false // 编辑时 数据改变 false 启用更新方法
        Object.assign(form, params)
      },
      update: async () => {
        fullscreenLoading.value = true
        const { data: res } = await updateCameraInfo(form)
        if (res.code === 0) {
          ElMessage.success({
            message: '保存成功',
            type: 'success'
          })
          methods.getList()
          dialogVisible.value = false
        } else {
          ElMessage.error({
            message: '保存失败'
          })
          dialogVisible.value = false
        }
        fullscreenLoading.value = false
      },
      saveValidate: (flag) => {
        formBox.value.validate((valid) => {
          if (valid) {
            flag === 'save' ? methods.save() : methods.update()
          } else {
            console.log('error submit!!')
            return false
          }
        })
      },
      resetForm: () => {
        formBox.value.resetFields()
        Object.assign(form, {
          cameraAlias: '',
          cameraUrl: '',
          detectionList: [],
          cameraSn: ''
        })
        dialogVisible.value = false
      },
      save: async () => {
        fullscreenLoading.value = true
        const params = form
        const { data: res } = await saveCameraInfo(params)
        if (res.code === 0) {
          ElMessage.success({
            message: '保存成功',
            type: 'success'
          })
          methods.getList()
          dialogVisible.value = false
        } else {
          ElMessage.error({
            message: '保存失败'
          })
          dialogVisible.value = false
        }
        fullscreenLoading.value = false
      },
      clickdelBtn: function (camera) {
        delVisible.value = true
        delId.value = camera.cameraId
        delcameraAlias.value = camera.cameraAlias
      },
      del: async (params) => {
        delVisible.value = true
        fullscreenLoading.value = true
        const { data: res } = await delDevice(params)
        if (res.code === 0) {
          ElMessage.success({
            message: '删除成功',
            type: 'success'
          })
          methods.getList()
        } else {
          ElMessage.error({
            message: '删除失败'
          })
        }
        fullscreenLoading.value = false
      },
      getImg: async (val) => {
        loadingShow.value = true
        const { data: res } = await getUrlImg(val.cameraId, val.cameraUrl)
        if (res.code === 0) {
          dialogVisible2.value = true
          currentImg.value = res.data
          loadingShow.value = false
        } else {
          ElMessage.error({
            message: res.msg
          })
          loadingShow.value = false
        }
      }
    }
    onMounted(() => {
      methods.getList()
    })
    return {
      fullscreenLoading,
      currentComponent,
      activeName,
      loadingShow,
      formBox,
      dialogVisible,
      dialogVisible2,
      popover,
      currentImg,
      imgUrl,
      saveBtn,
      totalNum,
      tableData,
      form,
      rules,
      methods,
      delVisible,
      delId,
      delcameraAlias,
      dialogTitle
    }
  }
}
</script>

<style lang="less" scoped>
.mainBox{
  width: 100%;
  height: 100%;
  background: #EFF3F6;
}
:deep(.el-card__header){
  text-align: left;
}
.topBox{
  width: 100%;
  padding: 0 10px;
  height: 60px;
  background-color:#EFF3F6 ;
}
.contentBox{
  width: 100%;
  height: calc(100% - 60px);
}
.marR10{
  margin-right: 10px;
}
.modalBody{
  width: 100%;
}
.halfBox{
  width: 50%;
}
.formLeft{
  .el-checkbox-group{
    text-align: left;
  }
}
.tableBtnBox{
  .el-button{
    width: 32px;
    height: 32px;
    font-size: 16px;
    padding: 0;
    min-height: auto;
  }
  .photoBtn{
    color: #48CFAD;
    border: 1px solid #48CFAD;
  }
  .editBtn{
    color: #1991EB;
    border: 1px solid #1991EB;
  }
  .delBtn{
    color: #ED5565;
    border: 1px solid #ED5565;
  }
}
</style>
<style lang='less'>
  .delDialog {
    .el-dialog__header{
      background:#ED5565;
      text-align: left;
      padding:12px 20px;
    .el-dialog__title{
      color: #fff;
    }
    .el-dialog__close{
      color:#fff;
      position: relative;
      top: -3px;
    }
   }
   .el-dialog__body{
    padding: 35px 20px;
    font-size: 18px;
   }
   .el-dialog__footer{
    padding:10px 20px;
    background-color: #eff3f6;
    .el-button--default{
      float: left;
    }
   }
  }
  .addDialog{
    .el-dialog__header{
    background:#1991EB;
    text-align: left;
    padding: 16px;
    .el-dialog__title{
      color: #fff;
    }
    .el-dialog__close{
      color:#fff;
    }
   }
    .el-dialog__body{
    font-size: 18px;
    text-align: left;
    // padding: 14px 20px;
    .el-form-item__label{
      text-align: left;
    }
   }
    .el-dialog__footer{
    padding:10px 20px;
    background-color: #eff3f6;
    .el-button--default{
      float: left;
    }
   }
  }
  .imgDialog{
  .el-dialog__header{
    background: #1991EB;
    .el-dialog__title{
      color: #fff;
    }
    .el-dialog__close{
      color: #fff;
    }
  }
  .el-dialog__body{
    padding: 0;
  }
   .el-image {
      display: contents;
    }
  }

</style>
