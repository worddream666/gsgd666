/**
 * 该文件为GameCreator编辑器自动生成的代码，请勿修改
 */
/**
 * 材质数据基类
 */
class MaterialData {
    id: number; // 材质编号
    enable: boolean;//是否启用
    ____timeInfo: {[varName:string]: number} = {}; // 储存过渡的当前时间/帧信息，若同一个材质数据需要重置时间复用，可修改该属性后再重新添加材质
}
/**
 * 材质1-色调变更
 */
class MaterialData1 extends MaterialData {
    id: number = 1;
    r: number = 0; // 红 
    g: number = 0; // 绿 
    b: number = 0; // 蓝 
    gray: number = 0; // 灰度 
    mr: number = 1; // 红曝光 
    mg: number = 1; // 绿曝光 
    mb: number = 1; // 蓝曝光 
    useTime: boolean = false; // 时间过渡 
    time: string = ""; // 时间设定 
}
/**
 * 材质2-色相
 */
class MaterialData2 extends MaterialData {
    id: number = 2;
    hue: number = 0; // 色相 
}
/**
 * 材质3-模糊
 */
class MaterialData3 extends MaterialData {
    id: number = 3;
    strength: number = 0; // 强度 
    useTime: boolean = false; // 时间过渡 
    time: string = ""; // 时间设定 
}
/**
 * 材质4-外发光
 */
class MaterialData4 extends MaterialData {
    id: number = 4;
    color: string = "#00FF00"; // 颜色 
    blur: number = 2; // 模糊度 
    offsetX: number = 0; // 水平偏移 
    offsetY: number = 0; // 垂直偏移 
}
/**
 * 材质5-滚筒
 */
class MaterialData5 extends MaterialData {
    id: number = 5;
    useTrans: boolean = false; // 曲率过渡 
    sigma: number = 0.2; // 曲率 
    trans: string = ""; // 曲率过渡 
    aspect: number = 1.7; // 纵横比 
}
/**
 * 材质6-色彩滚筒
 */
class MaterialData6 extends MaterialData {
    id: number = 6;
    useTrans: boolean = false; // 时间过渡 
    time: number = 0; // 时间 
    trans: string = ""; // 时间过渡 
    useTrans1: boolean = false; // 曲率过渡 
    sigma: number = 0.2; // 曲率 
    trans1: string = ""; // 曲率过渡 
    useTrans2: boolean = false; // 强度过渡 
    strength: number = 0.02; // 强度 
    trans2: string = ""; // 强度过渡 
    aspect: number = 1.7; // 纵横比 
}
/**
 * 材质7-正片叠底
 */
class MaterialData7 extends MaterialData {
    id: number = 7;
    tex2: string = ""; // 纹理贴图 
    useTrans: boolean = false; // 时间过渡 
    time: number = 1; // 时间 
    trans: string = ""; // 时间过渡 
}
/**
 * 材质8-辉光
 */
class MaterialData8 extends MaterialData {
    id: number = 8;
    useTrans: boolean = false; // 时间过渡 
    time: number = 0; // 时间 
    trans: string = ""; // 时间过渡 
    zoom: number = 0.5; // 缩放 
    multiplier: number = 0.5; // 倍数 
    centerX: number = 0.5; // 中心点X 
    centerY: number = 0.5; // 中心点Y 
}
/**
 * 材质9-滤色
 */
class MaterialData9 extends MaterialData {
    id: number = 9;
    tex2: string = ""; // 纹理贴图 
    useTrans: boolean = false; // 时间过渡 
    time: number = 0; // 时间 
    trans: string = ""; // 时间过渡 
}
/**
 * 材质10-淡入淡出
 */
class MaterialData10 extends MaterialData {
    id: number = 10;
    mask: string = ""; // 遮罩贴图 
    useTrans: boolean = false; // 时间过渡 
    time: number = 0; // 时间 
    trans: string = ""; // 时间过渡 
    vagueness: number = 0.25; // 模糊 
    invertMask: number = 0; // 反转遮罩 
}
/**
 * 材质11-混合添加
 */
class MaterialData11 extends MaterialData {
    id: number = 11;
    tex2: string = ""; // 纹理贴图 
    useTrans: boolean = false; // 时间过渡 
    time: number = 0; // 时间 
    trans: string = ""; // 时间过渡 
    colorMulR: number = 1; // 色彩倍增r 
    colorMulG: number = 1; // 色彩倍增g 
    colorMulB: number = 1; // 色彩倍增b 
    colorMulA: number = 1; // 色彩倍增a 
    colorAddR: number = 0; // 色彩偏移r 
    colorAddG: number = 0; // 色彩偏移g 
    colorAddB: number = 0; // 色彩偏移b 
    colorAddA: number = 0; // 色彩偏移a 
    invertMask: number = 0; // 反转遮罩 
    alphaFactor: number = 0; // a系数 
}
/**
 * 材质12-马赛克
 */
class MaterialData12 extends MaterialData {
    id: number = 12;
    useTrans: boolean; // 时间过渡 
    trans: string = "false"; // 时间过渡 
    pixelSize: number = 64; // 像素尺寸 
}
/**
 * 材质13-波浪
 */
class MaterialData13 extends MaterialData {
    id: number = 13;
    t: string = ""; // 时间过渡 
    amplitude: number = 0.3; // 振幅 
    angularVelocity: number = 10; // 角速度 
    speed: number = 10; // 速度 速度为5的整数倍即可完成波浪的无缝循环
}
/**
 * 材质14-花屏闪烁
 */
class MaterialData14 extends MaterialData {
    id: number = 14;
    t: string = ""; // 时间过渡 
    timeScale: number = 1; // 花屏速度 
}
/**
 * 材质15-热浪扭曲
 */
class MaterialData15 extends MaterialData {
    id: number = 15;
    tex2: string = ""; // 纹理贴图 
    uvScale: number = 1; // UV缩放比 
    noiseTimeScale: number = 1; // 噪间缩放 
    t: string = ""; // 时间过渡 
}
/**
 * 材质16-溶解
 */
class MaterialData16 extends MaterialData {
    id: number = 16;
    tex2: string = ""; // 纹理贴图 
    t: string = ""; // 时间过渡 
    dissolveSpeed: number = 1; // 溶解速度 
    edgeWidth: number = 1; // 边缘宽度 
    edgeColorR: number = 1; // 边缘颜色r 
    edgeColorG: number = 1; // 边缘颜色g 
    edgeColorB: number = 1; // 边缘颜色b 
    edgeColorA: number = 1; // 边缘颜色a 
    startTime: number = 0; // 开始时间 
}
/**
 * 材质17-扫描翻页
 */
class MaterialData17 extends MaterialData {
    id: number = 17;
    lineColorR: number = 0; // 线条颜色r 
    lineColorG: number = 0; // 线条颜色g 
    lineColorB: number = 0; // 线条颜色b 
    lineColorA: number = 0; // 线条颜色a 
    lineWidth: number = 0.1; // 线条宽度 
    rangeX: string = ""; // X过渡 
}
/**
 * 材质18-图像滚动
 */
class MaterialData18 extends MaterialData {
    id: number = 18;
    xSpeed: number = 1; // 水平滚动速度 单位：像素
    ySpeed: number = 0; // 垂直滚动速度 单位：像素
}
/**
 * 材质19-富文本
 */
class MaterialData19 extends MaterialData {
    id: number = 19;
}
/**
 * 材质20-富文本淡入淡出
 */
class MaterialData20 extends MaterialData {
    id: number = 20;
    speed: number = 1; //  
}
/**
 * 材质21-富文本淡入淡出2
 */
class MaterialData21 extends MaterialData {
    id: number = 21;
    speed: number = 1; //  
    startTime: number; //  
}
/**
 * 材质22-富文本震动
 */
class MaterialData22 extends MaterialData {
    id: number = 22;
    frequency: number = 1; //  
}
/**
 * 材质23-富文本上下颠倒
 */
class MaterialData23 extends MaterialData {
    id: number = 23;
}
/**
 * 材质24-富文本缩放
 */
class MaterialData24 extends MaterialData {
    id: number = 24;
}
/**
 * 材质25-富文本马赛克
 */
class MaterialData25 extends MaterialData {
    id: number = 25;
    pixelSize: number = 0.1; // 像素尺寸 
    w: number; //  
    h: number; //  
}
/**
 * 材质26-扫光
 */
class MaterialData26 extends MaterialData {
    id: number = 26;
    timeConfig: string = ""; // 时间过渡 
    color: string = "#00FF00"; // 颜色 
    strength: number = 0.5; // 叠加强度 
    pixelWidth: number = 100; // 光带大小（像素） 
    angleDeg: number = 45; // 角度 
    pixelFeather: number = 50; // 羽化程度（像素） 
}
/**
 * 材质27-双流光运动
 */
class MaterialData27 extends MaterialData {
    id: number = 27;
    trans: string = ""; // 时间过渡 
    lineWidth: number = 3; // 边框像素宽度 
    speed: number = 2; // 流动速度 
    color: string = ""; // 颜色 
    tail: number = 0.4; // 拖尾长度 
}
