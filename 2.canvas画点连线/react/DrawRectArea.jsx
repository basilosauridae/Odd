import React, {useEffect, useCallback, useState} from "react";
import {
    message,
} from 'antd'
import {Link, withRouter} from 'react-router-dom';
import './index.less'
import canvasConfig from "./canvasConfig";

let canvas, context;

const DragArea = (props) => {
    let { canvasRectPos, zIndex } = props;

    const [canvasW, canvasH] = [canvasConfig.width, canvasConfig.height];

    const [drawRectStartObj, setDrawRectStartObj] = useState({x:-1, y:-1});
    const [drawRectStopObj, setDrawRectStopObj] = useState({x:-1, y:-1});
    const [isRectLock, setIsRectLock] = useState(false);

    useEffect(() => {
        drawCanvas();
    }, [drawCanvas, props]);

    const drawCanvas = useCallback(() => {
        canvas = document.getElementById('canvasRect')
        context = canvas.getContext('2d')
        drawCanvasRect();
        canvas.onmousedown = clickPoint;
        canvas.onmouseup = stopDragging;
        canvas.onmousemove = dragMouse;
        // canvas.onmouseout = stopDragging;
    });

    function drawCanvasRect() {
        let [sx, sy, ex, ey] = [
            canvasRectPos[0].x,
            canvasRectPos[0].y,
            canvasRectPos[1].x,
            canvasRectPos[1].y,
        ];

        drawRect(sx, sy, ex, ey);
    }

    function drawRect(sx, sy, ex, ey) {
        clearCanvas();
        context.font="14px Microsoft Yahei";
        context.fillStyle="rgb(24,217,253, 0.2)";
        context.lineWidth = 1;
        context.strokeStyle = "#18D9FD";
        context.setLineDash([6, 3])


        context.strokeRect(sx, sy, ex-sx, ey-sy);
        context.fillRect(sx, sy, ex-sx, ey-sy);
        context.stroke();
    }

    // Canvas点击事件
    function clickPoint(e) {
        // 屏幕事件
        console.log('click111');
        // let ev = window.event || ev;
        // 判断屏幕，减去屏幕中的偏移量
        //offsetLeft会受父级的position属性影响,同理offsetTop也会
        let clientX = e.layerX;
        let clientY = e.layerY;


        //确定点的初始位置
        if(!isRectLock){

            let clickPointerObj = {
                x: clientX,
                y: clientY
            }
            setDrawRectStartObj(clickPointerObj);
        }
        setIsRectLock(!isRectLock);
    }

    function dragMouse(e) {

        if(isRectLock){
            let endX = e.layerX;
            let endY = e.layerY;
            drawF(endX,endY);
        }
    }

    // 停止拖动事件
    function stopDragging() {
        let pointArr = [drawRectStartObj, drawRectStopObj];
        props.saveCanvasRectPosition(pointArr);
    }


    function drawF(ex,ey){

        let sx = drawRectStartObj.x;
        let sy = drawRectStartObj.y;

        drawRect(sx, sy, ex, ey);

        let newStopObj = {
            x: ex,
            y: ey
        }
        setDrawRectStopObj(newStopObj);
        let pointArr = [drawRectStartObj, newStopObj];
        props.saveCanvasRectPosition(pointArr);
    }

    function clearCanvas() {
        // context.clearRect(0, 0, canvas.width, canvas.height);

        let c=document.getElementById("canvasRect");
        let cxt=c.getContext("2d");
        c.height=c.height;
    }

    return (
        <canvas id="canvasRect" className="canvasRect" width={canvasW} height={canvasH}
            style={{background: `transparent`, zIndex: zIndex}}/>
    );
}

export default withRouter(DragArea);