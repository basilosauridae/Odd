<template>
	<div id="app">
		<el-upload
			drag
			:auto-upload="false"
			action
			:show-file-list="false"
			list-type="picture-card"
			:on-change="changeFile"
		>
			<i class="el-icon-upload"></i>
			<div class="el-upload_text">
				将文件拖拽到此处，或
				<em>点击上传</em>
			</div>
		</el-upload>
		<div class="uploadImg" v-if="img">
			<img :src="img" alt="" />
		</div>
	</div>
</template>

<script>
/**
 * 自定义上传:auto-upload="false"手动上传
 * 基于base64上传
 * 小图片可以转成base64
 */
import axios from "axios";
import qs from "qs";
import { fileParse } from "./util";
export default {
	name: "App2",
	components: {},
	data() {
		return {
			img: null,
		};
	},
	methods: {
		async changeFile(file) {
			file = file.raw;
			let result = await fileParse(file, "base64")
			/**
			 * application/x-www-form-urlencoded
			 * 这个请求头需要key=value字符串类型
			 */
			result = await axios.post(
				"http://127.0.0.1:9000/single2",
				qs.stringify({ chunk: result, filename: file.name }),//qs这个方法为了把对象解析成x-www-form-urlencoded
				{
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
				}
			);
			if (result.code === 0) {
				this.img = result.path;
			}
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
