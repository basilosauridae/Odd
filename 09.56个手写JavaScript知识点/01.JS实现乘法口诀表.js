/* for ( let i = 1 ; i <= 9 ; i++ ) {
    for ( let j = 1 ; j<=i ; j++ ) {
        document.write(`${i}*${j}=${i*j}&nbsp;&nbsp;&nbsp`)
    }
    document.write('<br/>')
} */
// 以上是在html类型文件中书写 js文件在node环境中是没有document这个对象的

// 解决方法有两个
// 1.引入jsdom库
// 2.使用process.stdout.write()的node输出原生方法：一下好玩的例子-在node中输出彩色
/* [0,1,4,7].forEach(font => {
    for (let color = 0; color <= 107; color++) {
        const style = `${font};${color}`
        const changeStyle = input =>  `\x1b[${style}m${input}\x1b[0m`
        process.stdout.write(changeStyle(` ${style} `))
    }
    console.log('\n-----------------------')
}) */
// 3.\t是js中的空格符，\n是js中的换行符
for ( let i = 1 ; i <= 9 ; i++ ) {
    for ( let j = 1 ; j<=i ; j++ ) {
        process.stdout.write(`${i}*${j}=${i*j}\t`)
    }
    process.stdout.write('\n')
}