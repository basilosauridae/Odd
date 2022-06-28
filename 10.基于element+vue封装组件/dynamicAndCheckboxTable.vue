<template>
  <div class="tableContainer">
    <div class="btnList">
      <el-button
        type="primary"
        size="mini"
        icon="el-icon-plus"
        :class="{ is_edit: isEdit }"
        :disabled="addDisabled"
        @click="addColumn"
      >添加</el-button>
      <el-button
        type="danger"
        :disabled="isDelete"
        size="mini"
        icon="el-icon-delete"
        :class="{ is_edit: isEdit }"
        @click="deleteColumn"
      >删除</el-button>
      <el-button
        type="primary"
        size="mini"
        icon="el-icon-bottom"
        :class="{ is_edit: isEdit }"
        :style="showStyle"
        :loading="loading"
        @click="clickUpload"
      >导入</el-button>
      <el-button
        v-if="isDownload"
        type="primary"
        size="mini"
        :loading="loading"
        @click="downloadExel"
      >导出excel</el-button>
      <!-- 文件选择框 -->
      <input ref="excel-upload-input" class="excel-upload-input" type="file" accept=".xlsx,xls" @change="handleClick">
    </div>
    <el-table
      ref="goodsDetailTable"
      :data="isPagination? tableData.slice(
        (tablePagParaDict.currentPage - 1) * tablePagParaDict.pageSize,
        tablePagParaDict.currentPage * tablePagParaDict.pageSize
      ):tableData"
      fit
      highlight-current-row
      style="width: 100%;"
      class="tableLimit"
      :header-cell-style="{
        background:'#f4f6f9',
        color:'#2e2e2e',
        fontSize:'13px',
        fontWeight:'600',
        padding:'7px 0px'
      }"
      :cell-style="{
        'padding':'7px 0px',
        'height':'46px',
        'align-text':'center',
      }"
    >
      <el-table-column
        width="60"
        fixed="left"
        align="center"
      >
        <template slot="header">
          <el-checkbox v-if="!tableData.length" class="no" :checked="false"></el-checkbox>
          <el-checkbox
            v-else-if="tableData.every(r=>r.checked)"
            class="every"
            checked
            @change="rowSelection('cancelAll')"
          >
          </el-checkbox>
          <el-checkbox
            v-else
            class="some"
            :indeterminate="tableData.some(r=>r.checked)"
            :value="tableData.every(r=>r.checked)"
            @change="rowSelection('checkAll')"
          >
          </el-checkbox>
        </template>
        <template slot-scope="{row}">
          <el-checkbox :class="{'is-checked' :row.checked}" :value="row.checked" @change="rowSelection('check',row)"></el-checkbox>
          <span class="row-serial-no">{{ tableData.indexOf(row)+1 }}</span>
        </template>
      </el-table-column>

      <el-table-column
        v-for="item in tableHeader"
        :key="item.prop"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
        :min-width="item.minWidth"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          <div v-if="item.type==='select'">
            <a style="color:red;font-size:18px;">*</a>
            <el-select
              class="select"
              :value="scope.row[item.prop]"
              filterable
              :remote="!item.noRemote?true:false"
              clearable
              reserve-keyword
              :remote-method="remoteMethod"
              :disabled="isEdit"
              @change="(value)=>select(value,scope.$index,item.prop)"
              @focus="focus(item.prop)"
            >
              <el-option
                v-for="i in options"
                :key="i.value"
                :label="i.label"
                :value="i.value"
                :disabled="i.disabled"
              >
              </el-option>
            </el-select>
          </div>
          <div v-else-if="item.type==='selectOption'">
            <a style="color:red;font-size:18px;">*</a>
            <el-select
              :value="scope.row[item.prop]"
              filterable
              remote
              clearable
              reserve-keyword
              :remote-method="remoteMethod"
              :disabled="isEdit"
              popper-class="addSparePart"
              @change="(value)=>select(value,scope.$index,item.prop)"
              @focus="focus(item.prop)"
            >
              <el-option
                v-for="i in options"
                :key="i.value"
                :label="i.label"
                :value="i.value"
                :disabled="i.disabled"
              >
                <div>{{ i.spare_type }}</div>
                <div style="color:#8492a6;">
                  <span>编号：{{ i.spare_type_no }}</span>
                  <span style="margin-left:15px;">规格：{{ i.spare_type_size }}</span>
                  <span style="margin-left:15px;">单位：{{ i.spare_type_unit }}</span>
                </div>
              </el-option>
            </el-select>
          </div>
          <div v-else-if="item.type==='number'">
            <a style="color:red;font-size:18px;">*</a>
            <el-input-number
              v-model="scope.row[item.prop]"
              style="width:80%"
              controls-position="right"
              size="small"
              :min="item.min!=1?item.min:1"
              :precision="0"
              :disabled="isEdit&&!isEditAllotNum"
              @change="(currentValue,oldValue)=>changeQuantity(currentValue,oldValue,scope)"
            ></el-input-number>
          </div>
          <div v-else-if="item.type==='input'">
            <a style="color:red;font-size:18px;">*</a>
            <el-input
              type="textarea"
              autosize
              maxlength="30"
              show-word-limit
              style="width:90%"
              :value="scope.row[item.prop]"
              :disabled="isEdit"
              @input="(currentValue,oldValue)=>changeInput(currentValue,oldValue,scope)"
            >
            </el-input>
          </div>
          <div v-else-if="item.type==='checkbox'">
            <el-checkbox
              class="choice"
              :value="scope.row[item.prop]"
            ></el-checkbox>
          </div>
          <div v-else>
            <a v-show="item.required" style="color:red;font-size:18px;">*</a>
            <span>{{ scope.row[item.prop] }}</span>
          </div>
        </template>
      </el-table-column>
      <slot name="back"></slot>
    </el-table>
    <!-- 添加分页器 -->
    <div class="pagination">
      <el-pagination
        v-if="isPagination&&tableData.length>tablePagParaDict.pageSize"
        background
        layout="total,sizes,prev, pager, next,jumper"
        :page-sizes="tablePagParaDict.pageSizes"
        :page-size="tablePagParaDict.pageSize"
        :total="tableData.length"
        :current-page="tablePagParaDict.currentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
// import XLSX from 'xlsx'
export default {
  name: 'DynamicAndCheckboxTable',
  props: {
    isPagination: {
      type: Boolean,
      default: false
    },
    isDelete: {
      type: Boolean,
      required: true
    },
    isEdit: {
      type: Boolean
    },
    isEditAllotNum: {
      type: Boolean,
      default: false
    },
    addDisabled: {
      type: Boolean
    },
    tableData: {
      type: Array,
      required: true
    },
    tableHeader: {
      type: Array,
      required: true
    },
    options: {
      type: Array,
      default: () => {
        return []
      }
    },
    isImport: {
      type: Boolean,
      default: false
    },
    isDownload: {
      type: Boolean,
      default: false
    },
    excelDownData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 父传子配置的校验函数
    beforeUpload: {
      type: Function,
      default: () => {

      }
    },
    // 父传子配置的成功函数
    onSuccess: {
      type: Function,
      default: () => {

      }
    },
    tablePagParaDict: {
      type: Object,
      default: () => {
        return {
          pageSize: 20,
          currentPage: 1,
          pageSizes: [10, 20, 30, 50]
        }
      }
    }
  },
  data() {
    return {
      loading: false,
      excelData: {
        header: null,
        results: null
      }

    }
  },
  computed: {
    showStyle() {
      if (!this.isImport) {
        return {
          display: 'none'
        }
      } else {
        return {
          display: 'inline-block'
        }
      }
    }
  },
  mounted() {
    // this.rowSelection()
  },
  methods: {
    // rowSelection(action, row) {
    //   const rows = this.tableData
    //   if (action === 'checkAll') {
    //     rows.forEach(r => { r.checked = true })
    //   } else if (action === 'cancelAll') {
    //     rows.forEach(r => { r.checked = false })
    //   } else if (action === 'check') {
    //     const result = !row.checked
    //     rows.forEach(r => {
    //       if (r === row) {
    //         r.checked = result
    //       }
    //     })
    //   }
    //   this.$emit('onCheck', rows)
    // },
    remoteMethod(query) {
      this.$emit('remoteMethod', query)
    },
    select(value, index, prop) {
      this.$emit('select', value, index, prop)
    },
    addColumn() {
      this.$emit('handleTableData', 'addColumn')
    },
    deleteColumn() {
      this.$emit('handleTableData', 'deleteColumn')
    },
    changeQuantity(currentValue, oldValue, scope) {
      this.$emit('changeQuantity', currentValue, oldValue, scope)
    },
    changeInput(currentValue, oldValue, scope) {
      console.log('changeInput')
      this.$emit('changeInput', currentValue, oldValue, scope)
    },
    focus(prop) {
      this.$emit('focus', prop)
    },
    generateData({ header, results }) {
      this.excelData.header = header
      this.excelData.results = results
      this.onSuccess && this.onSuccess(this.excelData)
    },
    clickUpload() {
      this.$refs['excel-upload-input'].click()
    },
    handleClick(e) {
      const files = e.target.files
      const rawFile = files[0]
      if (!rawFile) return
      this.upload(rawFile)
    },
    upload(rawFile) {
      console.log(rawFile)
      this.$refs['excel-upload-input'].value = null
      if (!this.isExcel(rawFile)) {
        this.$message.error('仅支持上传.xlsx,.xls文件')
        return false
      }
      if (!this.beforeUpload) {
        this.readerData(rawFile)
        return
      }
      const before = this.beforeUpload(rawFile)
      if (before) {
        this.readerData(rawFile)
      }
    },
    // 开始读excel
    readerData(rawFile) {
      this.loading = true
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => {
          const data = e.target.result
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const header = this.getHeaderRow(worksheet)
          const results = XLSX.utils.sheet_to_json(worksheet)
          this.generateData({ header, results })
          this.loading = false // 关闭加载状态, 读完了

          resolve()
        }
        reader.readAsArrayBuffer(rawFile)
      })
    },
    // 如果使用 FileSaver.js 就不要同时使用以下函数
    saveAs(obj, fileName) { // 当然可以自定义简单的下载文件实现方式
      var tmpa = document.createElement('a')
      tmpa.download = fileName || '下载'
      tmpa.href = URL.createObjectURL(obj) // 绑定a标签
      tmpa.click() // 模拟点击实现下载
      setTimeout(function() { // 延时释放
        URL.revokeObjectURL(obj) // 用URL.revokeObjectURL()来释放这个object URL
      }, 100)
    },
    // 这里的数据是用来定义导出的格式类型
    // const wopts = { bookType: 'csv', bookSST: false, type: 'binary' };//ods格式
    // const wopts = { bookType: 'ods', bookSST: false, type: 'binary' };//ods格式
    // const wopts = { bookType: 'xlsb', bookSST: false, type: 'binary' };//xlsb格式
    // const wopts = { bookType: 'fods', bookSST: false, type: 'binary' };//fods格式
    // const wopts = { bookType: 'biff2', bookSST: false, type: 'binary' };//xls格式
    // 创建一个worksheet,创建过程中设置表头
    createWs(data, fields, titles) {
      const ws = XLSX.utils.json_to_sheet(
        data,
        {
          header: fields
        }
      )
      const range = XLSX.utils.decode_range(ws['!ref'])

      for (let c = range.s.c; c <= range.e.c; c++) {
        const header = XLSX.utils.encode_col(c) + '1'
        ws[header].v = titles[ ws[header].v ]
      }
      console.log(ws)
      return ws
    },

    downloadExel() {
      console.log(this.excelDownData)
      const ws = this.createWs(this.excelDownData.fieldData, this.excelDownData.fields, this.excelDownData.fileHeader)
      const wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' }
      const wb = { SheetNames: ['Sheet1'], Sheets: {}, Props: {}}
      wb.Sheets['Sheet1'] = ws// 通过json_to_sheet转成单页(Sheet)数据
      this.saveAs(new Blob([this.s2ab(XLSX.write(wb, wopts))], { type: 'application/octet-stream' }), `${this.excelDownData.fieldName}` + '.' + (wopts.bookType === 'biff2' ? 'xls' : wopts.bookType))
    },
    s2ab(s) {
      if (typeof ArrayBuffer !== 'undefined') {
        var buf = new ArrayBuffer(s.length)
        var view = new Uint8Array(buf)
        for (var i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF
        return buf
      } else {
        const buf = new Array(s.length)
        for (let i = 0; i !== s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF
        return buf
      }
    },
    getHeaderRow(sheet) {
      const headers = []
      const range = XLSX.utils.decode_range(sheet['!ref'])
      let C
      const R = range.s.r
      /* start in the first row */
      for (C = range.s.c; C <= range.e.c; ++C) {
        const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })]
        let hdr = 'UNKNOWN ' + C
        if (cell && cell.t) hdr = XLSX.utils.format_cell(cell)
        headers.push(hdr)
      }
      return headers
    },
    handleSizeChange(pageSize) {
      this.$emit('handleSizeChange', pageSize)
    },
    handleCurrentChange(currentPage) {
      this.$emit('handleCurrentChange', currentPage)
    },
    isExcel(file) {
      return /\.(xlsx|xls|csv)$/.test(file.name)
    }
  }
}
</script>

<style  scoped lang='scss'>
  /* 可选 & 不可选 */
  .el-table__body .row-serial-no { display:block; }
  .el-table__body .is-checked+.row-serial-no { display:none; }
  .el-table__body .el-checkbox .is-checked  { display:block!important; }
  .el-table__body .el-checkbox:not(.is-checked) { display:none; }
  .el-table__body .hover-row :hover .el-checkbox{display:block;}
  .el-table__body .hover-row :hover .row-serial-no{display:none!important;}
  .tableContainer{
    padding: 10px;
    .btnList{
      margin-bottom: 10px;
    }
  }
  ::v-deep .el-table {
    .el-input__inner{
      height: 30px;
    }
  }
  .is_edit{
    display: none;
  }
  .addSparePart .el-select-dropdown__item{
    height: 50px;
    line-height: 23px;
  }
  .excel-upload-input {
    display: none;
    z-index: -9999;
  }
  .pagination{
    margin-top: 20px;
    display: flex;
    flex-direction: row-reverse;
  }
  ::v-deep .el-input-number.is-controls-right .el-input__inner{
    padding: 0px;
  }
  .choice{
    display: block !important;
  }
  ::v-deep .select .el-input .is-reverse{
    margin-top: -7px !important;
  }
</style>
