<template>
	<div id="app">
		<!-- 
      action：存放的是文件上传到服务器的接口地址
     -->
		<el-upload
			drag
			action="/single1"
			:show-file-list="false"
			:on-success="handleSuccess"
			:before-upload="beforeUpload"
		>
			<i class="el-icon-upload"></i>
			<div class="el-upload_text">
				将文件拖拽到此处，或
				<em>点击上传</em>
			</div>
		</el-upload>
		<!-- img预览 -->
		<div class="uploadImg" v-if="img">
			<img :src="img" alt="" />
		</div>
		<!-- <input
			type="file"
			id="avatar"
			name="avatar"
			accept="image/png, image/jpeg"
			@change="handleChange"
		/> -->
	</div>
</template>

<script>
/**
 * 文件上传有两套方案：
 * 1.基于文件流（formdata） 把文件处理成文件流传给服务器  <====element-ui默认基于formdata这种形式 multipart/form-data ❌不是application/multipart/form-data 哈哈哈哈哈哈 别弄混了
 * 2.客户端要把文件转化为BASE64传给服务端 application/x-www-form-urlencoded
 */
import axios from "axios";
export default {
	name: "App",
	components: {},
	data() {
		return {
			img: null,
		};
	},
	methods: {
		async changeFile() {
			const form = new FormData();
			form.append("name", "vnues");
			await axios.post("http://127.0.0.1:9000/single1", form, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			})
		},
		handleSuccess(result) {
			console.log(result);
			if (result.code === 0) {
				this.img = result.path;
			}
		},
		beforeUpload(file) {
			/**
			 * 格式校验,上传之前
			 */
			let { type, size } = file;
			if (!/(png|gif|jpeg|jpg)/i.test(type)) {
				this.$message("文件格式不正确");
				return;
			}
			if (size > 200 * 2024 * 1024) {
				this.$message("文件过大，只能上传小于200M");
				return;
			}
		},
		handleChange(e) {
			console.log(e.target.files);
			/**
			 * 也就是我们需要把文件流放入formData对象中传入给表单
			 * 我去 我一开始以为经过input选择后返回的file就是个formdata类型
			 */
			console.log(e.target.files[0] instanceof File); // true
			console.log(e.target.files[0] instanceof FormData); // false
		},
	},
};
</script>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}
</style>
