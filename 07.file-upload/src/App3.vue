<template>
	<div id="app">
		<div class="form">
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
			<!-- PROGRESS -->
			<div class="el-progress">
				<el-progress :percentage="total"></el-progress>
			</div>

			<div class="progress">
				<span>上传进度：{{ total | totalText }}%</span>
				<el-link type="primary" v-if="total > 0 && total < 100" @click="handleBtn">{{
					btn | btnText
				}}</el-link>
			</div>

			<!-- VIDEO -->
			<div class="uploadImg" v-if="video">
				<video :src="video" controls />
			</div>
		</div>
	</div>
</template>

<script>
import axios from "axios";
import { fileParse } from "./util";
import * as SparkMD5 from "spark-md5";
/**
 * 如何处理断点续传
 * 服务器记已经上传过的切片
 * 肯定是在上传成功后的回调增加进度条 服务器告诉我们上传成功没
 */
export default {
	name: "App3",
	components: {},
	data() {
		return {
			total: 0,
			video: null,
			btn: false,
		};
	},
	filters: {
		btnText(btn) {
			return btn ? "继续" : "暂停";
		},
		totalText(total) {
			return total > 100 ? 100 : total;
		},
	},
	methods: {
		async changeFile(file) {
			/**
			 * 清空操作
			 */
			this.total = 0;
			this.suffix = "";
			this.video = null;

			/**
			 * 文件切片处理
			 * 一种是按大小来切 最后一偏可能不是等量的
			 * 一种是按数量来切 保证等量
			 */
			file = file.raw;
			console.log(file);
			console.log(file.size);
			console.log(file.slice(0, 100));
			console.log(file.slice(0, 10000000));

			let buffer = await fileParse(file, "buffer"),
				/**
				 * 解析为BUFFER数据
				 * 我们会把文件切片处理：把一个文件分割成为好几个部分（固定数量/固定大小）
				 * 每一个切片有自己的部分数据和自己的名字
				 * HASH_1.mp4
				 * HASH_2.mp4
				 */
				spark = new SparkMD5.ArrayBuffer(),
				hash,
				suffix;
			console.log(buffer);
			spark.append(buffer);
			hash = spark.end();
			suffix = /\.([0-9a-zA-Z]+)$/.exec(file.name)[1];
			/**
			 * 前端根据文件内容生成hash
			 */
			/**
			 * 根据数量来切
			 * 切成100个切片
			 */
			let partList = [],
				partsize = file.size / 100;
			let cur = 0;
			console.log(file,'fls');
			for (let i = 0; i < 100; i++) {
				let item = {
					chunk: file.slice(cur, cur + partsize),
					filename: `${hash}_${i}.${suffix}`,
				};
				cur += partsize;
				partList.push(item);
			}
			this.partList = partList;
			this.hash = hash;
			this.suffix = suffix;
			this.sendRequest();
		},
		async sendRequest() {
			/**
			 * 根据100个切片创造100个请求（集合）
			 */
			let requestList = [];
			this.partList.forEach((item, index) => {
				let fn = () => {
					let formData = new FormData();
					formData.append("chunk", item.chunk);
					formData.append("filename", item.filename);
					return axios
						.post("http://127.0.0.1:9000/single3", formData, {
							headers: { Content_type: "multipart/form-data" },
						})
						.then((result) => {
							/**
							 * 以数量控制进度
							 * 如果是size就以size为主
							 */
							console.log(result);
							if (result.data.code === 0) {
								this.total += 1;
								/**
								 * 传完的切片我们把它移除掉
								 * 这种是保证页面不刷新情况的所作的demo
								 * 利用闭包保存index
								 */
								this.partList.splice(index, 1);
							}
						});
				};
				requestList.push(fn);
			});
			/**
			 * 传递：并行/串行
			 * 并行就是一起发送 前端for循环发生就行 Pormise.all自带for循环可用它处理
			 * 串行就是等上一个请求完成后就发送下一个请求
			 */
			let i = 0;
			let complete = async () => {
				let result = await axios.get("http://127.0.0.1:9000/merge", {
					params: {
						hash: this.hash,
					},
				});
				if (result.data.code === 0) {
					this.video = result.data.path;
				}
			};
			let send = async () => {
				/**
				 * 递归终止条件
				 */
				/**
				 * 取消上传
				 */
				if (this.abort) {
					return;
				}
				if (i >= requestList.length) {
					/**
					 * 传完了
					 */
					complete();
					return;
				}
				await requestList[i]();
				console.log( 'i',i );
				i++;
				send();
			};

			const res = await this.verify();
			if (res.data.shouldUpload) {
				send();
			}
		},
		async verify() {
			let result = await axios.get("http://127.0.0.1:9000/verify", {
				params: {
					hash: this.hash,
					suffix: this.suffix,
				},
			});
			console.log( 'result',result );
			if (result.data.code === 0) {
				if (!result.data.shouldUpload) {
					this.total = 100;
					this.video = result.data.path;
				}
			}
			return result;
		},
		handleBtn() {
			/**
			 * 触发按钮事件
			 * btn为true代表暂停上传 文案显示是继续
			 */
			if (this.btn) {
				/**
				 * 断点续传
				 */
				this.btn = false;
				this.abort = false;
				this.sendRequest();
				return;
			}
			/**
			 * 暂停上传
			 */
			this.btn = true;
			this.abort = true;
		},
	},
};
</script>
