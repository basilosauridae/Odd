import React, {useEffect, useCallback, useState} from "react";
import {
    message,
} from 'antd'
import {Link, withRouter} from 'react-router-dom';
import './index.less'
import canvasConfig from "./canvasConfig";

let canvas, context;

const DragArea = (props) => {

    let { canvasLinePos, zIndex } = props;

    const [canvasW, canvasH] = [canvasConfig.width, canvasConfig.height];

    const [drawLineStartObj, setDrawLineStartObj] = useState({x:-1, y:-1});
    const [drawLineStopObj, setDrawLineStopObj] = useState({x:-1, y:-1});

    const [isLineLock, setIsLineLock] = useState(false);

    useEffect(() => {
        drawCanvas();
    }, [props]);

    const drawCanvas = useCallback(() => {
        canvas = document.getElementById('canvasLine')
        context = canvas.getContext('2d')
        drawCanvasLine();
        canvas.onmousedown = clickPoint;
        canvas.onmouseup = stopDragging;
        canvas.onmousemove = dragMouse;
        // canvas.onmouseout = stopDragging;
    })

    function drawCanvasLine() {
        let [sx, sy, ex, ey] = [
            canvasLinePos[0].x,
            canvasLinePos[0].y,
            canvasLinePos[1].x,
            canvasLinePos[1].y,
        ];

        drawLine(sx, sy, ex, ey);
    }

    function drawLine(sx, sy, ex, ey) {
        clearCanvas();

        context.font="14px Microsoft Yahei";
        context.fillStyle="#FFF64B";
        context.lineWidth = 1;
        context.strokeStyle = "#FFF64B";
        const offsetDistance = 30;

        if(sx<ex) {
            context.fillText("外",(sx + ex)*1/2,(sy + ey)*1/2 + offsetDistance);
            context.fillText("内",(sx + ex)*1/2,(sy + ey)*1/2 - offsetDistance);
        }else {
            context.fillText("外",(sx + ex)*1/2,(sy + ey)*1/2 - offsetDistance);
            context.fillText("内",(sx + ex)*1/2,(sy + ey)*1/2 + offsetDistance);
        }

        context.moveTo(sx,sy);
        context.lineTo(ex,ey);

        // console.log('sx', sx, 'sy', sy);
        // context.strokeRect(sx, sy, ex-sx, ey-sy);
        context.stroke();
    }

    // Canvas点击事件
    function clickPoint(e) {
        // 屏幕事件
        console.log('click');
        // let ev = window.event || ev;
        // 判断屏幕，减去屏幕中的偏移量
        //offsetLeft会受父级的position属性影响,同理offsetTop也会
        // let clientX = ev.clientX - this.offsetLeft;
        // let clientY = ev.clientY - this.offsetTop;

        let clientX = e.layerX;
        let clientY = e.layerY;

        //确定点的初始位置
        if(!isLineLock){

            let clickPointerObj = {
                x: clientX,
                y: clientY
            }
            setDrawLineStartObj(clickPointerObj);
        }
        setIsLineLock(!isLineLock);
    }

    function dragMouse(e) {
        if(isLineLock){
            // let endX = e.pageX-canvas.offsetLeft;
            // let endY = e.pageY-canvas.offsetTop;
            let endX = e.layerX;
            let endY = e.layerY;
            drawF(endX,endY);
        }
    }

    // 停止拖动事件
    function stopDragging() {
        let pointArr = [drawLineStartObj, drawLineStopObj];
        props.saveCanvasLinePosition(pointArr);
    }


    function drawF(ex,ey){
        // let c=document.getElementById("canvas");
        // let ctx=c.getContext("2d");

        let sx = drawLineStartObj.x;
        let sy = drawLineStartObj.y

        drawLine(sx, sy, ex, ey);

        let newStopObj = {
            x: ex,
            y: ey
        }
        setDrawLineStopObj(newStopObj);

        let pointArr = [drawLineStartObj, newStopObj];
        props.saveCanvasLinePosition(pointArr);
    }
    function clearCanvas() {
        // context.clearRect(0, 0, canvas.width, canvas.height);

        let c=document.getElementById("canvasLine");
        let cxt=c.getContext("2d");
        c.height=c.height;
    }

    return (
        <canvas id="canvasLine" className="canvasLine" width={canvasW} height={canvasH}
                style={{background: `transparent`, zIndex: zIndex}}/>
    );
}

export default withRouter(DragArea);