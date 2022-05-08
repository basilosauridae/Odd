const multiparty = require("multiparty");
// const path = require("path");
const express = require('express')
const fs = require('fs')
const SparkMD5 = require('spark-md5')
const bodyParser = require('body-parser')
const cors = require('cors');
const PORT = '9000'
const app = express()


/**
 * 静态资源代理
 */
app.use(express.static(__dirname));


/**
 * 设置跨域访问
 */
app.use(cors());


app.use(bodyParser.urlencoded({ extended: false, limit: '1024mb' }))


/**
 * API
 */
const uploadDir = `${__dirname}/upload`


function handleMultiparty(req, res, temp) {
    return new Promise((resolve, reject) => {
        /**
         * muultipart设置
         */
        let options = {
            maxFieldsSize: 200 * 1024 * 1024
        }
        /**
         * uploadDir帮我们自动写入文件
         * 所以不是formData这种上传文件的问题 导致不会过滤重复图片
         * 而是mutilpart这个插件有个可选择帮我们写入文件
         */
        !temp ? options.uploadDir = uploadDir : null
        let form = new multiparty.Form(options)
        /**
         * 这个插件不好的的地方就是帮我们自动生成hash
         * 但是不会判断重复的图片
         */
        /**
         * 在 multiparty.parse 的回调中，files 参数保存了 FormData 中文件，
         * fields 参数保存了 FormData 中非文件的字段
         */
        form.parse(req, function (err, fields, files) {
            console.log(fields,'fields');
            console.log(files,'files');
            if (err) {
                res.send({ code: 1, reason: err })
                reject(err)
                return
            }
            resolve({
                fields,
                files
            })
        })
    })
}

/**
 * 基于form-data上传数据
 */

app.post('/single1', async (req, res) => {

    let { files } = await handleMultiparty(req, res)
    let file = files.file[0]
    res.send({
        code: 0,
        originalFilename: file.originalFilename,
        path: file.path.replace(__dirname, `http://127.0.0.1:${PORT}`)
    })
})

/**
 * 基于base64处理文件数据
 */
app.post('/single2', async (req, res) => {

    let { chunk, filename } = req.body
    /**
     * chunk的处理：转化为buffer
     */
    chunk = decodeURIComponent(chunk)
    chunk = chunk.replace(/^data:image\/\w+;base64,/, '')
    chunk = Buffer.from(chunk, 'base64')
    /**
     * 存储文件到服务器,SparkMD5是对上传文件的内容比较 相同表示服务器中已存在 内容生成hash值
     */
    let spark = new SparkMD5.ArrayBuffer(),
        suffix = /\.([0-9a-zA-Z]+)$/.exec(filename)[1], // 匹配后缀
        path;
    /**
     * Appends an array buffer
     */
    spark.append(chunk)
    /**
     * spark-md5以内容来生成hash 文件名改变，内容不变得到的hash都是一样的
     * spark.end()生成hash 
     */
    path = `${uploadDir}/${spark.end()}.${suffix}`
    fs.writeFileSync(path, chunk)
    res.send({
        code: 0,
        originalFilename: filename,
        path: path.replace(__dirname, `http://127.0.0.1:${PORT}`)
    })
})


/**
 * 切片上传&&合并
 */

app.post('/single3', async (req, res) => {
    let { fields, files } = await handleMultiparty(req, res, true)
    let [chunk] = files.chunk
    let [filename] = fields.filename
    console.log(fields, files)
    let hash = /([0-9a-zA-Z]+)_\d+/.exec(filename)[1],
        path = `${uploadDir}/${hash}`
    !fs.existsSync(path) ? fs.mkdirSync(path) : null
    /**
     * 忘记加filename了
     */
    path = `${path}/${filename}`;
    fs.access(path, async (err) => {
        if (!err) {
            res.send({
                code: 0,
                path: path.replace(__dirname, `http://127.0.0.1:${PORT}`)
            })
            return
        }
        // 为了测试出效果，延迟1秒钟
        // await new Promise(resolve => {
        //     setTimeout(_ => {
        //         resolve();
        //     }, 200);
        // });

        // 不存在的再创建   
        let readStream = fs.createReadStream(chunk.path),
            writeStream = fs.createWriteStream(path);
        /**
         * 以流的形式写入文件📃
         */
        readStream.pipe(writeStream)
        readStream.on('end', function () {
            fs.unlinkSync(chunk.path)
            res.send({
                code: 0,
                path: path.replace(__dirname, `http://127.0.0.1:${PORT}`)
            })
        })
    })

})

app.get('/verify', (req, res) => {
    let {
        hash,
        suffix
    } = req.query;
    let path = `${uploadDir}/${hash}`,
        filePath = `${path}.${suffix}`
    /**
     * 文件秒传策略
     */
    console.log("ok")
    console.log('filePath', filePath)
    if (fs.existsSync(filePath)) {
        res.end(
            JSON.stringify({
                code: 0,
                path: `http://127.0.0.1:${PORT}/upload/${hash}.${suffix}`,
                shouldUpload: false
            })
        );
    } else {
        res.end(
            JSON.stringify({
                code: 0,
                shouldUpload: true
            })
        );
    }
})

app.get('/merge', (req, res) => {
    let {
        hash,
    } = req.query;


    let path = `${uploadDir}/${hash}`,
        fileList = fs.readdirSync(path),
        suffix;
    fileList.sort((a, b) => {
        let reg = /_(\d+)/;
        return reg.exec(a)[1] - reg.exec(b)[1];
    }).forEach(item => {
        !suffix ? suffix = /\.([0-9a-zA-Z]+)$/.exec(item)[1] : null;
        fs.appendFileSync(`${uploadDir}/${hash}.${suffix}`, fs.readFileSync(`${path}/${item}`));
        fs.unlinkSync(`${path}/${item}`);
    });
    fs.rmdirSync(path);
    res.send({
        code: 0,
        path: `http://127.0.0.1:${PORT}/upload/${hash}.${suffix}`
    });
});


app.listen(PORT, () => {
    console.log(`app启动在${PORT}`)
})