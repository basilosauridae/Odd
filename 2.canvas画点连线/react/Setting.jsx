import React, {useCallback, useEffect, useState} from 'react'
import {
    Layout,
    Input,
    InputNumber,
    Switch,
    Button,
    Row,
    Col,
    message,
    Image
    // Radio
} from 'antd'

import {Link, withRouter} from 'react-router-dom';
import './index.less'
import Loading from '@/components/Loading'
import graphics from '../../assets/images/Graphics@2x.png'
import returnIcon from '../../assets/images/return@2x.png'
import cameraNormal from '../../assets/images/camera_normal@2x.png'
// import cameraSelected from '../../assets/images/camera_Selected@2x.png'
import cameraInactivated from '../../assets/images/camera_inactivated@2x.png'
import cameraAdd from '../../assets/images/add_camera@2x.png'
import DragArea from "./DragArea";
// import DrawLineArea from "./DrawLineArea";
// import DrawRectArea from "./DrawRectArea";

import {getSettingConfig, setSettingConfig, getCameralist, addCamera, updateCamera,
    deleteCamera, getCameraPicture, setCameraScreenshotPosition, setCameraOpenClose} from '@/api/setting'
import closeIcon from "../../assets/images/close@2x.png";
import canvasConfig from "./canvasConfig";

const { TextArea } = Input;
const [canvasW, canvasH] = [canvasConfig.width, canvasConfig.height];

const Setting = (props) => {

    const [cameraList, setCameraList] = useState([])

    const [configId, setConfigId] = useState('')
    const [hintMessage, setHintMessage] = useState('当前人数已超过最大接待数量,请在门外等候!')
    const [peopleNumber, setPeopleNumber] = useState(0)
    const [threshold, setThreshold] = useState(0.4)
    const [initNumber, setInitNumber] = useState(0)
    const [isMaskWearing, setIsMaskWearing] = useState(true)
    const [popBoxShow, setPopBoxShow] = useState(false)
    const [promptBoxShow, setPromptBoxShow] = useState(false)
    const [originalSettingObj, setOriginalSettingObj] = useState({})

    const [cameraId, setCameraId] = useState('')
    const [cameraName, setCameraName] = useState('')
    const [streamAddress, setStreamAddress] = useState('');
    const [isCameraAdd, setIsCameraAdd] = useState(true);
    const [isCameraClose, setIsCameraClose] = useState(true);
    const [currentCloseOrDeleteCameraId, setCurrentCloseOrDeleteCameraId] = useState(true);
    const [isCurrentCameraClose, setIsCurrentCameraClose] = useState(false);

    const [screenshotCameraId, setScreenshotCameraId] = useState('');
    const [screenshotCameraName, setScreenshotCameraName] = useState('');

    const [screenshotPic, setScreenshotPic] = useState('');
    const [screenshotPos, setScreenshotPos] = useState([]);
    const [canvasLinePos, setCanvasLinePos] = useState([]);
    const [canvasRectPos, setCanvasRectPos] = useState([]);

    const [canvasOption, setCanvasOption] = useState(3);
    const [canvasZIndex, setCanvasZIndex] = useState({'drag': 3000, 'line':2000, 'rect': 1000});
    // const [canvasZIndex, setCanvasZIndex] = useState({'line':1000, 'rect': 2000});

    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        getSettingConfigF();
        getCameralistF();
    }, [getCameralistF, getSettingConfigF])

    const getSettingConfigF = useCallback(() => {
        setIsLoading(true);
        getSettingConfig().then((resp)=> {
            setIsLoading(false)

            if(resp.code === 10000) {
                setConfigId(resp.data.configId);
                setPeopleNumber(resp.data.peopleAlarmNum);
                setHintMessage(resp.data.warning);
                setIsMaskWearing(resp.data.ifDetectMask === 1);
                setInitNumber(resp.data.initNumber);
                setThreshold(resp.data.threshold);

                //保存对比值
                let saveObj = {
                    initNumber: resp.data.initNumber,
                    threshold: resp.data.threshold
                };

                setOriginalSettingObj(saveObj);
            }
        },error => {
            // debugger;
            setIsLoading(false);
            console.log('error', error);
        });
    })

    const getCameralistF = useCallback(() => {
        setIsLoading(true);
        getCameralist().then(resp => {
            setIsLoading(false);
            if(resp.code === 10000) {
                setCameraList(resp.data.list);
            }
        },error => {
            // debugger;
            setIsLoading(false);
            console.log('error', error);
        });
    })

    const handlePeopleNumberChange = (value) => {
        setPeopleNumber(value);
    }
    const handleIsMaskWearingChange = (checked) => {// eslint-disable-line no-unused-vars
        setIsMaskWearing(checked); 
    }
    const handleInitNumberChange = (value) => {// eslint-disable-line no-unused-vars
        setInitNumber(value);
    }
    const handleThresholdChange = (value) => {// eslint-disable-line no-unused-vars
        setThreshold(value);
    }
    const handleHintMessageChange = (item) => {
        setHintMessage(item.target.value);
    }
    const handleCameraNameChange = (item) => {
        setCameraName(item.target.value);
    }
    const handleStreamAddressChange = (item) => {
        setStreamAddress(item.target.value);
    }

    function showEditPopBox(item) {
        setPopBoxShow(true);
        setIsCameraAdd(false);
        setCameraId(item.cameraId);
        setCameraName(item.name);
        setStreamAddress(item.streamUrl);
    }

    function showAddPopBox() {
        setPopBoxShow(true);
        setIsCameraAdd(true);
        setCameraName('');
        setStreamAddress('');
    }

    function closePopBox() {
        setPopBoxShow(false);
    }

    function closePromptBox() {
        setPromptBoxShow(false);
    }

    function getCameraScreenshotF(item) {

        setScreenshotPic('');
        setScreenshotCameraId(item.cameraId);
        setScreenshotCameraName(item.name);
        setIsCurrentCameraClose(item.needLiveStream === 0);

        // let newPosArr = [item.mapA1,item.mapB1,item.mapA2,item.mapB2,
        //     item.mapA3,item.mapB3,item.mapA4,item.mapB4];
        //
        // setScreenshotPos(newPosArr);
        let lineObj = [{
            x: item.x1 * canvasW,
            y: item.y1 * canvasH,
        },{
            x: item.x2 * canvasW,
            y: item.y2 * canvasH,
        }];
        setCanvasLinePos(lineObj);

        let rectObj = [{
            x: item.mapA1 * canvasW,
            y: item.mapB1 * canvasH,
        },{
            x: item.mapA2 * canvasW,
            y: item.mapB2 * canvasH,
        }];
        setCanvasRectPos(rectObj);

        let params = {
            "cameraId": item.cameraId
        }
        setIsLoading(true);
        getCameraPicture(params).then((resp) => {
            setIsLoading(false);

            if(resp.code === 10000) {
                setScreenshotPic(resp.data);
            }else {
                message.error(resp.msg + '，请稍等再试', 3);
            }
        },error => {
            // debugger;
            setIsLoading(false);
            console.log('error', error);
        });
    }

    const showPromptBox = (item, flag) => {
        setIsCurrentCameraClose(item.needLiveStream === 0);
        setIsCameraClose(flag === 'close');
        setPromptBoxShow(true);
        setCurrentCloseOrDeleteCameraId(item.cameraId);
    }

    const setCameraOpenCloseF = () => {
        setPromptBoxShow(false);
        setScreenshotPic('');
        let params = {
            'cameraId': currentCloseOrDeleteCameraId
        }
        setCameraOpenClose(params).then(resp => {
            getCameralistF();
            if(resp.code !== 10000) {
                message.error("摄像头开关设置失败！");
            }else {
                message.success("摄像头开关设置成功！");
            }
        });
    }

    function editCamera() {
        if(isCameraAdd) {
            addCameraF();
        }else {
            updateCameraF();
        }
        setPopBoxShow(false);
    }

    function addCameraF() {
        let params = {
            "name": cameraName,
            "streamUrl": streamAddress
        };
        setIsLoading(true);
        addCamera(params).then(resp => {
            setIsLoading(false);
            // console.log(resp);
            // debugger;

            if(resp.code === 10000) {
                getCameralist().then(resp => {
                    if(resp.code === 10000) {
                        setCameraList(resp.data.list);
                    }
                });
            }
        },error => {
            // debugger;
            setIsLoading(false);
            console.log('error', error);
        });
    }

    function updateCameraF() {
        let params = {
            "cameraId": cameraId,
            "name": cameraName,
            "streamUrl": streamAddress,
        };

        setIsLoading(true);
        updateCamera(params).then((resp) => {
            setIsLoading(false);

            if(resp.code === 10000) {
                getCameralist().then(resp => {
                    if(resp.code === 10000) {
                        setCameraList(resp.data.list);
                    }
                });
            }
        },error => {
            // debugger;
            setIsLoading(false);
            console.log('error', error);
        });
    }

    function deleteCameraF() {
        setPromptBoxShow(false);
        let params = {
            "cameraId": currentCloseOrDeleteCameraId,
        };

        deleteCamera(params).then((resp) => {
            if(resp.code === 10000) {
                getCameralist().then(resp => {
                    if(resp.code === 10000) {
                        setCameraList(resp.data.list);
                    }
                });
            }
        });
    }

    const saveScreenshotPosition = (pointArr) => {

        let newPointArr = [];
        for(let i=0; i<pointArr.length; i++){
            newPointArr.push(parseFloat((pointArr[i].x / canvasW).toFixed(2)));
            newPointArr.push(parseFloat((pointArr[i].y / canvasH).toFixed(2)));
        }

        setScreenshotPos(newPointArr);
    }

    const saveCanvasLinePosition = (linePointArr) => {// eslint-disable-line no-unused-vars
        // console.log('linePointArr', linePointArr);
        setCanvasLinePos(linePointArr);
    }

    const saveCanvasRectPosition = (RectPointArr) => {// eslint-disable-line no-unused-vars
        // console.log('RectPointArr', RectPointArr);
        setCanvasRectPos(RectPointArr);
    }

    function updateCameraScreenshotPos() {

        let params = {};
        params["cameraId"] = screenshotCameraId;

        //之前四个点拖动的坐标
        params["mapA1"] = screenshotPos[0];
        params["mapB1"] = screenshotPos[1];
        params["mapA2"] = screenshotPos[2];
        params["mapB2"] = screenshotPos[3];
        params["mapA3"] = screenshotPos[4];
        params["mapB3"] = screenshotPos[5];
        params["mapA4"] = screenshotPos[6];
        params["mapB4"] = screenshotPos[7];

        //矩形参数
        // params["mapA1"] = canvasRectPos[0].x / canvasW;
        // params["mapB1"] = canvasRectPos[0].y / canvasH;
        // params["mapA2"] = canvasRectPos[1].x / canvasW;
        // params["mapB2"] = canvasRectPos[1].y / canvasH;

        //直线
        // params["x1"] = canvasLinePos[0].x / canvasW;
        // params["y1"] = canvasLinePos[0].y / canvasH;
        // params["x2"] = canvasLinePos[1].x / canvasW;
        // params["y2"] = canvasLinePos[1].y / canvasH;

        console.log('params', params);

        setCameraScreenshotPosition(params).then((resp) => {
            if(resp.code === 10000) {
                message.success('Position is saved successful！', 3);
                getCameralistF();
            }
        });
    }

    function updateSettingConfig() {

        let params = {
            "configId": configId,
            "peopleAlarmNum": peopleNumber,
            "ifDetectMask": isMaskWearing ? 1 : 2,
            "warning": hintMessage
            // "threshold": threshold,
            // "initNumber": initNumber
        };

        if(threshold !== originalSettingObj.threshold) {
            Object.assign(params, {threshold})
        }
        if(initNumber !== originalSettingObj.initNumber) {
            Object.assign(params, {initNumber})
        }

        console.log('params', params);

        setSettingConfig(params).then((resp) => {
            if(resp.code === 10000) {
                message.success('Setting config is saved successful！', 5);
                getSettingConfigF();
            }
        });
    }

    const onCanvasOptionChange = e => {
        let val = e.target.value;
        let newIndexObj;
        if(val === 1) {
            newIndexObj = {'drag': 3000, 'line':2000, 'rect': 1000}
        }else

        if(val === 2) {
            // newIndexObj = {'drag': 2000, 'line':3000, 'rect': 1000}
            newIndexObj = {'line':2000, 'rect': 1000}
        }else {
            // newIndexObj = {'drag': 1000, 'line':2000, 'rect': 3000}
            newIndexObj = {'line':1000, 'rect': 2000}
        }
        setCanvasZIndex(newIndexObj);
        setCanvasOption(e.target.value);
    };


    return (
        <Layout className='index animated fadeIn'>
            <div className="setting">
                {/*<div className="logo"></div>*/}
                <div className="container">
                    <div className="top">
                        <Image style={{visibility: "hidden"}} />
                        <Image className="middle" src={graphics} />
                        <Link to="/index"><Image src={returnIcon} /></Link>
                    </div>
                    <div className="content">
                        <article>
                            <Row>
                                <Col span={6}>
                                    人数告警设置：
                                </Col>
                                <Col span={18}>
                                    <InputNumber onChange={handlePeopleNumberChange} value={peopleNumber} min={0} max={100000} />&nbsp;人
                                </Col>
                            </Row>
                            {/* <Row>
                                <Col span={6}>
                                    阈值：
                                </Col>
                                <Col span={18}>
                                    <InputNumber onChange={handleThresholdChange} value={threshold} min={0} max={1} step={0.1} />
                                    （*注：数值在0~1之间）
                                </Col>
                            </Row> */}
                           {/*  <Row>
                                <Col span={6}>
                                    初始人数设置：
                                </Col>
                                <Col span={18}>
                                    <InputNumber onChange={handleInitNumberChange} value={initNumber} min={0} max={peopleNumber} />&nbsp;人
                                </Col>
                            </Row> */}
                            {/*<Row>*/}
                            {/*    <Col span={6}>*/}
                            {/*        是否检查佩戴口罩：*/}
                            {/*    </Col>*/}
                            {/*    <Col span={18}>*/}
                            {/*        <Switch onChange={handleIsMaskWearingChange} checked={isMaskWearing} />*/}
                            {/*    </Col>*/}
                            {/*</Row>*/}
                            <Row>
                                <Col span={6}>
                                    告警提示：
                                </Col>
                                <Col span={18}>
                                    <TextArea onChange={handleHintMessageChange} value={hintMessage} rows={4} />
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6}>
                                    摄像头流地址：
                                </Col>
                                <Col span={18}>
                                    {
                                        cameraList.map((item, index) => {
                                            return (
                                                <div className="camera-add" key={index}>
                                                    <Switch className="switch-btn" onChange={() => showPromptBox(item, 'close')} checked={item.needLiveStream === 1} />
                                                    {
                                                        item.needLiveStream === 0 &&
                                                        <div className="edit-btn" onClick={() => showEditPopBox(item)}></div>
                                                    }
                                                    <div className="close-btn" onClick={() => showPromptBox(item, 'delete')}></div>
                                                    <img key={index} onClick={() => getCameraScreenshotF(item)} title={"点击配置电子围栏"}
                                                         src={ item.needLiveStream === 1 ? cameraNormal : cameraInactivated }/>
                                                    <span>{item.name}</span>
                                                </div>
                                            )
                                        })
                                    }
                                    <div className="camera-add" onClick={showAddPopBox}>
                                        <img src={cameraAdd}/>
                                        <span>添加摄像头</span>
                                    </div>
                                </Col>
                            </Row>
                        </article>
                        <article>
                            <div className="title">{screenshotCameraName}电子围栏监测区域配置</div>
                            {/* { isCurrentCameraClose && screenshotPic && */}
                                {/* <Radio.Group onChange={onCanvasOptionChange} value={canvasOption}> */}
                                    {/* <Radio value={1}>拖动</Radio> */}
                                    {/* <Radio value={3}>画矩形</Radio> */}
                                    {/* <Radio value={2}>画线</Radio> */}
                                {/* </Radio.Group> } */}
                            { isCurrentCameraClose && screenshotPic &&
                                <Button type="primary" size="small" style={{float: 'right'}} onClick={updateCameraScreenshotPos}>
                                    保存
                                </Button> }
                            <div style={{position: 'relative'}}>
                                <div className="drag-area">
                                    { (screenshotPic ? true : false) && <Image className="drag-area-bg" src={`data:image/gif;base64,${screenshotPic}`}/> }
                                    { screenshotPic &&
                                        <DragArea
                                            pictrue={screenshotPic}
                                            screenshotPos={screenshotPos}
                                            isCurrentCameraClose={isCurrentCameraClose}
                                            saveScreenshotPosition={saveScreenshotPosition}
                                            zIndex={canvasZIndex.drag}/>
                                    }
                                    {/* { screenshotPic &&
                                        <DrawLineArea
                                            canvasLinePos={canvasLinePos}
                                            saveCanvasLinePosition={saveCanvasLinePosition}
                                            zIndex={canvasZIndex.line} /> } */}
                                    {/*  { screenshotPic &&
                                        <DrawRectArea
                                            canvasRectPos={canvasRectPos}
                                            saveCanvasRectPosition={saveCanvasRectPosition}
                                            zIndex={canvasZIndex.rect} /> } */}
                                </div>
                            </div>
                        </article>
                    </div>
                    <div style={{marginTop: '-10vh', textAlign: 'center'}}>
                        <Button type="primary" onClick={updateSettingConfig}>
                            保存配置
                        </Button>
                    </div>
                </div>

                {popBoxShow &&
                <div className="pop-box">
                    <div className="add-area">
                        <span className="title">{isCameraAdd ? "添加" : "修改"}摄像头</span>
                        <Row>
                            <Col span={5}>摄像头名称</Col>
                            <img className="close-icon" src={closeIcon} onClick={closePopBox} />
                            <Col span={19}>
                                <Input value={cameraName} onChange={handleCameraNameChange} placeholder="" />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={5}>流地址</Col>
                            <Col span={19}>
                                <Input value={streamAddress} onChange={handleStreamAddressChange} placeholder="" />
                            </Col>
                        </Row>
                        <Row style={{marginTop: '4rem', textAlign:'center'}}>
                            <Col span={24}>
                                <Button type="primary" size={'big'} onClick={editCamera} style={{margin: 'auto'}}>
                                    {isCameraAdd ? "添加" : "修改"}
                                </Button>
                            </Col>

                        </Row>
                    </div>
                </div>
                }

                { promptBoxShow &&
                <div className="pop-box">
                    <div className="add-area">
                        <span className="title">{isCameraClose ? isCurrentCameraClose ? "打开" : "关闭" : "删除"}摄像头</span>
                        <img className="close-icon" src={closeIcon} onClick={closePromptBox} />
                        <Row>
                            <Col span={24} style={{textAlign: 'center', marginTop: '5rem'}}>
                                    <span>
                                        {
                                            isCameraClose ?
                                                isCurrentCameraClose ? '确认要打开此摄像头视屏流分析吗？' : '确认要停止此摄像头视屏流分析吗'
                                                :
                                                '确认要删除此摄像头吗？'
                                        }
                                    </span>
                            </Col>
                        </Row>
                        <Row style={{marginTop: '6rem', textAlign:'center'}}>
                            <Col span={12}>
                                <Button className="cancel-btn" size={'big'} onClick={closePromptBox} style={{margin: 'auto'}}>
                                    取消
                                </Button>
                            </Col>
                            <Col span={12}>
                                <Button type="primary" size={'big'} onClick={ isCameraClose ? setCameraOpenCloseF : deleteCameraF}
                                        style={{margin: 'auto'}}>
                                    确认
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </div>
                }

                { isLoading && <Loading /> }
            </div>
        </Layout>
    )
};
export default withRouter(Setting)
