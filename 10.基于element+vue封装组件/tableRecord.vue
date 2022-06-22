<template>
  <el-table
    :data="tableData"
    :header-cell-style="{
      'background-color': '#f5f7fa',
    }"
    :cell-style="{
      'border':'1px solid transparent',
      'padding':'5px 0px'
    }"
    fit
  >
    <el-table-column
      type="index"
      width="50"
      align="center"
    >
    </el-table-column>
    <el-table-column
      align="center"
      v-for="(item, index) in tableHeader"
      :key="index"
      :prop="item.prop"
      :label="item.label"
      :width="item.width"
      :show-overflow-tooltip="true"
    >
    </el-table-column>
    <slot name="back"></slot>
  </el-table>
</template>

<script>
export default {
  name: 'NoBorderTable',
  props: {
    tableData: {
      type: Array,
      required: true
    },
    tableHeader: {
      type: Array,
      required: true
    }
  }
}
</script>

<style lang='scss' scoped>
.el-table::before {
  z-index: inherit;
}
.el-table--fit {
  border-bottom: 1px solid #dfe6ec;
}
</style>
