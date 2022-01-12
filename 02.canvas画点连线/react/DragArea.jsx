import React, {useEffect, useCallback, useState} from "react";
import {
    message,
} from 'antd'
import {Link, withRouter} from 'react-router-dom';
import './index.less'
import canvasConfig from "./canvasConfig";

let canvas, context;

const DragArea = (props) => {

    let { screenshotPos, pictrue, isCurrentCameraClose, zIndex } = props;

    let bgImg = pictrue;
    bgImg = bgImg.replace(/\s/g, encodeURIComponent(' '));

    const [circleRadius, lineWidth, lineColor] = [20, 5, 'yellow'];

    const [canvasW, canvasH] = [canvasConfig.width, canvasConfig.height];

    const [messageLock, setMessageLock] = useState(false);

    let newPoints = {
        rect1: [
            { x: parseInt(screenshotPos[0]*canvasW), y: parseInt(screenshotPos[1]*canvasH), isSelected: false },
            { x: parseInt(screenshotPos[2]*canvasW), y: parseInt(screenshotPos[3]*canvasH), isSelected: false },
            { x: parseInt(screenshotPos[4]*canvasW), y: parseInt(screenshotPos[5]*canvasH), isSelected: false },
            { x: parseInt(screenshotPos[6]*canvasW), y: parseInt(screenshotPos[7]*canvasH), isSelected: false },
        ]
    }

    if(isNaN(newPoints.rect1[0].x)) {
        newPoints = {
            rect1: [
                { x: 170, y: 60, isSelected: false },
                { x: 550, y: 60, isSelected: false },
                { x: 550, y: 350, isSelected: false },
                { x: 170, y: 350, isSelected: false },
            ]
        }
    }

    useEffect(() => {
        drawCanvasRect();
    }, [drawCanvasRect, props])

    const drawCanvasRect = useCallback(() => {
        canvas = document.getElementById('canvas')
        context = canvas.getContext('2d')
        drawRects();
        canvas.onmousedown = clickPoint;
        canvas.onmouseup = stopDragging;
        canvas.onmousemove = dragCircle;
        canvas.onmouseout = stopDragging;
    })


    // 画点连线
    const drawRect = (Array) => {

        // 设置线的样式
        context.setLineDash([lineWidth*2, lineWidth])
        // 设置连线点样式
        context.lineJoin  = 'round'
        context.beginPath()

        // 遍历坐标点
        for (let i = 0; i < Array.length; i++) {
            const ele = Array[i];
            //画点
            if(i === 2) {
                context.arc(ele.x, ele.y, circleRadius, -80.1, 2*Math.PI);
            }else {
                context.arc(ele.x, ele.y, circleRadius, 0, 2*Math.PI);
            }

            //画线
            if (i < 1) {
                context.moveTo(ele.x, ele.y);
            } else {
                context.lineTo(ele.x, ele.y);
            }
        }

        context.lineWidth = lineWidth;
        context.strokeStyle = lineColor;

        context.closePath();
        context.stroke();
    }

    // 画图
    const drawRects = () => {
        // 清除画布，准备绘制
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawRect(newPoints.rect1)
    }

    // 遍历元素在哪一个圆上
    let  selectObject = {}
    function circle(Array, clientX, clientY) {

        for (let i = 0; i < Array.length; i++) {
            const ele = Array[i];
            // Math.abs返回绝对值
            // Math.sqrt返回一个数的平方根
            // Math.pow幂函数运算
            // console.log(ele.x,ele.y,'p1')
            // console.log(clientX,clientY,'P2,点击所在圆的圆心位置')
            let line = Math.abs(Math.sqrt(Math.pow((ele.x - clientX), 2) + Math.pow((ele.y - clientY), 2)))
            // console.log(line,'line')

            // 判断点击的位置在哪一个圆里面 点到圆心的距离小于半径
            if (line - circleRadius < 0) {
                isDragging = true
                ele.isSelected = true
                // console.log('⚪内',isDragging)
                selectObject = Array[i]
                // console.log(selectObject,'123')
            } else {
                ele.isSelected = false
                // console.log('⚪外',isDragging)
                // console.log(selectObject,'456')
            }
        }
    }

    // Canvas点击事件
    // 遍历所有的坐标点
    function clickPoint(e) {
        // console.log(e)
        if(!isCurrentCameraClose) {
            if(messageLock) return;
            setMessageLock(true);
            message.info("请先关闭该摄像头的视屏流分析，才能拖动电子围栏进行设置。", 3);
            setTimeout(()=>{
                setMessageLock(false);
            },3000)
        }
        // 屏幕事件
        let ev = window.event || ev;
        // console.log(ev===e,ev.offsetX,ev.offsetY)
        // console.log(ev.clientX,ev.clientY)
        // 判断屏幕，减去屏幕中的偏移量
        //offsetLeft会受父级的position属性影响,同理offsetTop也会,this指向canvas实例
        // let clientX = ev.clientX - this.offsetLeft;
        // let clientY = ev.clientY - this.offsetTop;

        let clientX = ev.offsetX
        let clientY = ev.offsetY
        // console.log(clientX,'clientX')
        // console.log(clientY,'clientY')
        circle(newPoints.rect1, clientX, clientY)
    }

    let isDragging = false
    function dragCircle(e) {
        // 判断是否可以拖动
        if (isDragging === true && isCurrentCameraClose) {
            // console.log('可以拖动')
            // 取得画布上被点击的点
            //offsetLeft会受父级的position属性影响,同理offsetTop也会
            // let clickX = e.pageX - canvas.offsetLeft;
            // let clickY = e.pageY - canvas.offsetTop;
            // console.log(clickX,clickX,'画圆')
            
            let clickX = e.offsetX;
            let clickY = e.offsetY;
            selectObject.x = clickX;
            selectObject.y = clickY;
            drawRects()
        }
    }

    // 停止拖动事件
    function stopDragging() {
        isDragging = false
        // 鼠标结束时的坐标
        let pointArr = newPoints.rect1

        // console.log(pointArr,'停止拖动事件 给Array赋值')
        props.saveScreenshotPosition(pointArr)

    }

    return (
        <canvas id="canvas" width={canvasW} height={canvasH}
                style={
                    {background: `url(data:image/gif;base64,${bgImg})`,
                     opacity: bgImg ? 1 : 0, 
                     zIndex: zIndex,
                     boxSizing:"border-box"
                    }
                }/>
    );
}

export default withRouter(DragArea);
