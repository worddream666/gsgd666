/**
 * 该文件为GameCreator编辑器自动生成的代码，请勿修改
 */
/**
* 自定义指令 1-预加载资源
*/
class CustomCommandParams_1 {
    preloadAssets: DataStructure_preloadAsset[]; // = [];
    isShowLoadingUI: boolean; // = false; 显示加载界面
    bindingUI: { uiID: number, compName:string, compID:string, varName:string }; // 加载组件
}
/**
* 自定义指令 2-等待玩家输入文本
*/
class CustomCommandParams_2 {
    inputUI: number; // = 8; 弹出的界面
    defText: string; // = ""; 默认文本
    useVar: number; // = 0; 使用变量指定
    defTextVarID: number; // = 1; 默认文本
}
/**
* 自定义指令 3-按键事件
*/
class CustomCommandParams_3 {
    type: number; // = 0; 生命周期
    isMulKey: number; // = 0;
    recordListen: boolean; // = false; 记录监听
    key: number; // = 0; 按键
    systemKey: number; // = 0; 系统按键
    evType: number; // = 0; 类别
    evType2: number; // = 0; 类别
    keys: number[]; // = [];
    systemKeys: number[]; // = [];
    CTRL: boolean; // = false;
    SHIFT: boolean; // = false;
    ALT: boolean; // = false;
    eventPage: string; // = ""; 执行
    recordListenVar: number; // = 1; 记录至
}
/**
* 自定义指令 4-鼠标事件
*/
class CustomCommandParams_4 {
    type: number; // = 0; 生命周期
    mouseType: number; // = 0; 鼠标
    eventPage: string; // = ""; 执行
    onlyInScene: boolean; // = false; 仅限于场景上使用
    recordListen: boolean; // = false; 记录监听
    recordListenVar: number; // = 1; 记录至
}
/**
* 自定义指令 5-设置界面属性
*/
class CustomCommandParams_5 {
    uiID: number; // = 0; 界面
    useVar: number; // = 0; 使用变量
    uiIDvarID: number; // = 0; 界面
    type: number; // = 0;
    compName: string; // = ""; 组件名
    compAttrName: string; // = ""; 组件属性名
    compAttrValue: string; // = ""; 设置为
    compNameUseVar: number; // = 0; 使用变量
    compAttrNameUseVar: number; // = 0; 使用变量
    compNameVarID: number; // = 0; 组件名
    compAttrNameVarID: number; // = 0; 组件属性名
    compAttrValueUseVar: number; // = 0; 使用变量
    compAttrValueVarID1: number; // = 0; 设置为
    compAttrValueVarID2: number; // = 0; 设置为
    compAttrValueVarID3: number; // = 0; 设置为
    uiAttrName: string; // = ""; 界面属性名
    uiAttrValue: string; // = ""; 设置为
    uiAttrNameUseVar: number; // = 0; 使用变量
    uiAttrValueUseVar: number; // = 0; 使用变量
    uiAttrNameVarID: number; // = 0; 界面属性名
    uiAttrValueVarID1: number; // = 0; 设置为
    uiAttrValueVarID2: number; // = 0; 设置为
    uiAttrValueVarID3: number; // = 0; 设置为
}
/**
* 自定义指令 6-设置按钮焦点
*/
class CustomCommandParams_6 {
    uiID: number; // = 1; 界面
    uiIDVarID: number; // = 1; 界面
    useVar: number; // = 0;
    isAutoFocus: boolean; // = false; 自动焦点模式
    isAddButton: boolean; // = false; 追加按钮
    isExcludeButton: boolean; // = false; 排除按钮
    useCache: boolean; // = true; 使用缓存
    autoFocusType: number; // = 0;
    autoFocusParentCompName: string; // = ""; 组件名称
    addButtons: string[]; // = [];
    excludeButtons: string[]; // = [];
    selEffectUI: number; // = 1008; 皮肤
    useFocusAnimation: boolean; // = true; 使用焦点皮肤动画
    setSelectedIndex: boolean; // = false; 设置焦点索引
    selectedIndex: number; // = 0; 索引
    shortcutKeyExit: boolean; // = false; 允许使用快捷键退出当前焦点
    whenExitBackLastFocus: boolean; // = false; 当退出时选中上一次的焦点
    whenExitEvent: string; // = ""; 执行事件
}
/**
* 自定义指令 7-关闭界面焦点
*/
class CustomCommandParams_7 {
    focusType: number; // = 0;
}
/**
* 自定义指令 8-取消按键事件
*/
class CustomCommandParams_8 {
    recordListenVar: number; // = 1; 指定监听按键的标识
}
/**
* 自定义指令 9-取消鼠标事件
*/
class CustomCommandParams_9 {
    recordListenVar: number; // = 1; 指定监听按键的标识
}
/**
* 自定义指令 10-模拟按键
*/
class CustomCommandParams_10 {
    isMulKey: number; // = 0;
    key: number; // = 0; 按键
    systemKey: number; // = 0; 系统按键
    evType: number; // = 0; 类别
    interval: number; // = 200; 间隔
    CTRL: boolean; // = false;
    SHIFT: boolean; // = false;
    ALT: boolean; // = false;
}
/**
* 自定义指令 11-提交信息
*/
class CustomCommandParams_11 {
    messages: DataStructure_inputMessage[]; // = [];
}
/**
* 自定义指令 12-设置列表焦点
*/
class CustomCommandParams_12 {
    list: { uiID: number, compName:string, compID:string, varName:string }; // 激活列表
}
/**
* 自定义指令 13-计时器
*/
class CustomCommandParams_13 {
    type: number; // = 0;
    minute: number; // = 0; 分钟
    second: number; // = 0; 秒钟
}
/**
* 自定义指令 14-打开副本界面
*/
class CustomCommandParams_14 {
    dungeonID: number; // = 0;
}
/**
* 自定义指令 1001-设置地图网格数据
*/
class CustomCommandParams_1001 {
    x: number; // = 0; 格子坐标x
    y: number; // = 0; 格子坐标y
    useVar: number; // = 0; 使用变量指定
    xVarID: number; // = 0; 格子坐标x
    yVarID: number; // = 0; 格子坐标y
    layer: number; // = 0; 网格层
    on: number; // = 0; 开启
    value: number; // = 0; 值
}
/**
* 自定义指令 1002-绘制图块
*/
class CustomCommandParams_1002 {
    x: number; // = 0; 格子坐标x
    y: number; // = 0; 格子坐标y
    useVar: number; // = 0; 使用变量指定
    xVarID: number; // = 0; 格子坐标x
    yVarID: number; // = 0; 格子坐标y
    tileID: number; // = 1; 图块源
    sourceX: number; // = 0; 图源格子坐标x
    sourceY: number; // = 0; 图源格子坐标y
    layer: number; // = 1; 图层
    layerVarID: number; // = 1; 图层
    layerUseVar: number; // = 0; 使用变量
}
/**
* 自定义指令 1003-绘制自动元件
*/
class CustomCommandParams_1003 {
    x: number; // = 0; 格子坐标x
    y: number; // = 0; 格子坐标y
    useVar: number; // = 0; 使用变量指定
    xVarID: number; // = 0; 格子坐标x
    yVarID: number; // = 0; 格子坐标y
    autoTileID: number; // = 0; 自动元件
    layer: number; // = 1; 图层
    layerVarID: number; // = 1; 图层
    layerUseVar: number; // = 0; 使用变量
}
/**
* 自定义指令 1004-清除图块
*/
class CustomCommandParams_1004 {
    type: number; // = 0;
    layer: number; // = 1; 图层
    layerVarID: number; // = 1; 图层
    layerUseVar: number; // = 0; 使用变量
    x: number; // = 0; 格子坐标x
    y: number; // = 0; 格子坐标y
    useVar: number; // = 0; 使用变量指定
    xVarID: number; // = 0; 格子坐标x
    yVarID: number; // = 0; 格子坐标y
}
/**
* 自定义指令 1005-设置图层属性
*/
class CustomCommandParams_1005 {
    layerID: number; // = 1; 图层编号
    layerVarID: number; // = 1; 图层编号
    offsetEnabled: boolean; // = false; 偏移
    scaleEnabled: boolean; // = false; 缩放
    autoMoveEnabled: boolean; // = false; 自动滚动
    alphaEnabled: boolean; // = false; 透明度
    visibleEnabled: boolean; // = false; 设置可见
    layerUseVar: number; // = 0; 使用变量
    dx: number; // = 0; 水平偏移
    dxVarID: number; // = 1; 水平偏移
    dy: number; // = 0; 垂直偏移
    dyVarID: number; // = 1; 垂直偏移
    dxUseVar: number; // = 0; 使用变量
    dyUseVar: number; // = 0; 使用变量
    scaleX: number; // = 1; 水平缩放
    scaleXVarID: number; // = 1; 水平缩放
    scaleXUseVar: number; // = 0; 使用变量
    scaleY: number; // = 1; 垂直缩放
    scaleYVarID: number; // = 1; 垂直缩放
    scaleYUseVar: number; // = 0; 使用变量
    xMove: number; // = 0; 水平滚动
    xMoveVarID: number; // = 1; 水平滚动
    yMove: number; // = 0; 垂直滚动
    yMoveVarID: number; // = 1; 垂直滚动
    xMoveUseVar: number; // = 0; 使用变量
    yMoveUseVar: number; // = 0; 使用变量
    alpha: number; // = 1; 透明度
    alphaVarID: number; // = 1; 透明度
    alphaUseVar: number; // = 0; 使用变量
    visible: number; // = 0; 设置为
    visibleVarID: number; // = 1; 设置为
    visibleUseVar: number; // = 0; 使用变量
}
/**
* 自定义指令 1006-显示场景动画
*/
class CustomCommandParams_1006 {
    useType: number; // = 0; 使用场合
    aniID: number; // = 1; 动画
    aniUseVar: number; // = 0;
    aniIDVarID: number; // = 1; 动画
    soType: number; // = 2; 对象
    useVar: number; // = 0; 使用变量指定
    soIndex: number; // = 0; 编号
    soIndexVarID: number; // = 1; 编号
    x: number; // = 0;
    y: number; // = 0;
    posUseVar: number; // = 0; 使用变量指定
    isGrid: boolean; // = true; 格子坐标
    xVarID: number; // = 1; x
    yVarID: number; // = 1; y
    layer: number; // = 1; 显示层级
}
/**
* 自定义指令 1007-缩放场景镜头
*/
class CustomCommandParams_1007 {
    useScaleX: boolean; // = false; 横向缩放
    useScaleY: boolean; // = false; 垂直缩放
    scaleX: number; // = 1; sx
    scaleY: number; // = 1; sy
    scaleXUseVar: number; // = 0;
    scaleYUseVar: number; // = 0;
    scaleX2: number; // = 0; sx
    scaleY2: number; // = 0; sy
    trans: string; // = ""; 过渡
    useTrans: boolean; // = false; 时间过渡
    time: number; // = 30; 帧数
}
/**
* 自定义指令 1008-旋转场景镜头
*/
class CustomCommandParams_1008 {
    rotation: number; // = 0; 旋转度
    rotationVarID: number; // = 0; 旋转度
    useVar: number; // = 0;
    trans: string; // = ""; 过渡
    useTrans: boolean; // = false; 时间过渡
    time: number; // = 30; 帧数
}
/**
* 自定义指令 2001-增减金币
*/
class CustomCommandParams_2001 {
    symbol: number; // = 0; 操作
    gold: number; // = 0; 金币
    useVar: number; // = 0; 使用变量
    goldVarID: number; // = 0; 金币
}
/**
* 自定义指令 2002-增减道具
*/
class CustomCommandParams_2002 {
    symbol: number; // = 0; 操作
    itemID: number; // = 1; 道具
    useVar1: number; // = 0; 使用变量
    itemIDVarID: number; // = 1; 道具
    useVar2: number; // = 0; 使用变量
    num: number; // = 1; 数目
    numVarID: number; // = 1; 数目
    isSceneItem: boolean; // = false; 掉落在地上
}
/**
* 自定义指令 2003-克隆对象
*/
class CustomCommandParams_2003 {
    sceneID: number; // = 0; 选择场景
    useVar: number; // = 0; 使用变量指定
    no: number; // = 0; 对象编号
    noVarID: number; // = 0; 对象编号
    newSoIndex: number; // = 0; 生成的对象编号储存至
    newSoExecuteEvent: string; // = ""; 生成的对象执行事件
    waitEventComplete: boolean; // = false; 等待事件执行完毕
    x: number; // = 0; x
    y: number; // = 0; y
    posUseVar: number; // = 0; 使用变量指定
    xVarID: number; // = 0; x
    yVarID: number; // = 0; y
    isGrid: boolean; // = true; 格子坐标
}
/**
* 自定义指令 2004-销毁克隆的对象
*/
class CustomCommandParams_2004 {
    soType: number; // = 1; 对象
    useVar: number; // = 0; 使用变量指定
    no: number; // = 0; 对象编号
    noVarID: number; // = 0; 对象编号
}
/**
* 自定义指令 2005-暂时移除对象
*/
class CustomCommandParams_2005 {
    useVar: number; // = 0; 使用变量指定
    no: number; // = 0; 对象编号
    noVarID: number; // = 0; 对象编号
    soType: number; // = 1; 对象
}
/**
* 自定义指令 2006-停止移动
*/
class CustomCommandParams_2006 {
    soType: number; // = 2; 对象
    useVar: number; // = 0; 使用变量指定
    no: number; // = 0; 对象编号
    noVarID: number; // = 0; 对象编号
}
/**
* 自定义指令 2007-记录移动路径
*/
class CustomCommandParams_2007 {
    soType: number; // = 2; 对象
    useVar: number; // = 0; 使用变量指定
    no: number; // = 0; 对象编号
    noVarID: number; // = 0; 对象编号
}
/**
* 自定义指令 2008-恢复移动路径
*/
class CustomCommandParams_2008 {
    soType: number; // = 2; 对象
    useVar: number; // = 0; 使用变量指定
    no: number; // = 0; 对象编号
    noVarID: number; // = 0; 对象编号
}
/**
* 自定义指令 2009-设置场景对象的属性
*/
class CustomCommandParams_2009 {
    attributeData: CustomCompData; // 属性
    useVar: number; // = 0; 使用变量指定
    no: number; // = 0; 对象编号
    noVarID: number; // = 1; 对象编号
    soType: number; // = 2; 对象
}
/**
* 自定义指令 2010-
*/
class CustomCommandParams_2010 {
}
/**
* 自定义指令 2011-修改行走图部件
*/
class CustomCommandParams_2011 {
    partID: number; // = 0; 部位
    useVar: number; // = 0; 使用变量指定
    no: number; // = 0; 对象编号
    noVarID: number; // = 1; 对象编号
    newPartUseVar: number; // = 0; 使用变量
    newPart: number; // = 1; 新部件
    newPartVarID: number; // = 1; 新部件
    soType: number; // = 2; 对象
}
/**
* 自定义指令 2012-打开商店
*/
class CustomCommandParams_2012 {
    goodsList: DataStructure_shopItem[]; // = [];
    nameWhenInfinite: string; // = "∞"; 无限数量时的代称
    enableSell: boolean; // = true; 是否允许出售
    discount: number; // = 0.5; 售价折扣
}
/**
* 自定义指令 2013-清除对象行为
*/
class CustomCommandParams_2013 {
    useVar: number; // = 0; 使用变量指定
    no: number; // = 0; 对象编号
    noVarID: number; // = 1; 对象编号
    soType: number; // = 2; 对象
}
/**
* 自定义指令 3001-显示图片
*/
class CustomCommandParams_3001 {
    passageID: number; // = 1; 编号
    passageIDVar: number; // = 1; 编号
    image: string; // = ""; 图片
    imageVar: number; // = 1; 图片
    dpX: number; // = 0; x
    dpXVar: number; // = 1; x
    dpY: number; // = 0; y
    dpYVar: number; // = 1; y
    dpZ: number; // = 100; z
    dpZVar: number; // = 1; z
    dpWidth: number; // = 100; 宽度
    dpWidthVar: number; // = 1; 宽度
    dpHeight: number; // = 100; 高度
    dpHeightVar: number; // = 1; 高度
    rotation: number; // = 0; 旋转度
    rotationVar: number; // = 1; 旋转度
    opacity: number; // = 1; 透明度
    opacityVar: number; // = 1; 透明度
    flip: boolean; // = false; 水平翻转
    pivotType: number; // = 0; 轴心点
    blendMode: number; // = 0; 混合模式
    refImageEnabled: boolean; // = false; 模拟参考图
    higher: boolean; // = false; 高级设定
    refImage: string; // = ""; 参考图
    imageUseVar: boolean; // = false; 图片地址使用变量
    posUseVar: boolean; // = false; 坐标使用变量
    sizeUseVar: boolean; // = false; 尺寸使用变量
    zUseVar: boolean; // = false; 深度使用变量
    opacityUseVar: boolean; // = false; 透明度使用变量
    rotationUseVar: boolean; // = false; 旋转度使用变量
    passageIDUseVar: boolean; // = false; 编号使用变量
}
/**
* 自定义指令 3002-移动图片
*/
class CustomCommandParams_3002 {
    passageID: number; // = 1; 编号
    passageIDVar: number; // = 1; 编号
    timeType: number; // = 1; 变更方式
    time: number; // = 30; 持续帧数
    trans: string; // = ""; 过渡
    dpX: number; // = 0; x
    dpXVar: number; // = 1; x
    dpY: number; // = 0; y
    dpYVar: number; // = 1; y
    dpZ: number; // = 100; z
    dpZVar: number; // = 1; z
    dpWidth: number; // = 100; 宽度
    dpWidthVar: number; // = 1; 宽度
    dpHeight: number; // = 100; 高度
    dpHeightVar: number; // = 1; 高度
    rotation: number; // = 0; 旋转度
    rotationVar: number; // = 1; 旋转度
    opacity: number; // = 1; 透明度
    opacityVar: number; // = 1; 透明度
    flip: boolean; // = false; 水平翻转
    pivotType: number; // = 0; 轴心点
    blendMode: number; // = 0; 混合模式
    refImageEnabled: boolean; // = false; 模拟参考图
    higher: boolean; // = false; 高级设定
    refImage: string; // = ""; 参考图
    posUseVar: boolean; // = false; 坐标使用变量
    sizeUseVar: boolean; // = false; 尺寸使用变量
    zUseVar: boolean; // = false; 深度使用变量
    opacityUseVar: boolean; // = false; 透明度使用变量
    rotationUseVar: boolean; // = false; 旋转度使用变量
    passageIDUseVar: boolean; // = false; 编号使用变量
}
/**
* 自定义指令 3003-设置图像层镜头
*/
class CustomCommandParams_3003 {
    timeType: number; // = 1; 变更方式
    time: number; // = 30; 持续帧数
    trans: string; // = ""; 过渡
    cameraX: number; // = 0; x
    cameraXVar: number; // = 1; x
    cameraY: number; // = 0; y
    cameraYVar: number; // = 1; y
    cameraZ: number; // = 0; z
    cameraZVar: number; // = 1; z
    cameraRotation: number; // = 0; 旋转度
    cameraRotationVar: number; // = 1; 旋转度
    higher: boolean; // = false; 高级设定
    xUseVar: boolean; // = false; 相机水平坐标使用变量
    yUseVar: boolean; // = false; 相机垂直坐标使用变量
    zUseVar: boolean; // = false; 相机深度坐标使用变量
    roUseVar: boolean; // = false; 相机旋转度使用变量
}
/**
* 自定义指令 3004-显示动画
*/
class CustomCommandParams_3004 {
    passageID: number; // = 1; 编号
    passageIDVar: number; // = 1; 编号
    animation: number; // = 1; 动画
    animationVar: number; // = 1; 动画
    dpX: number; // = 0; x
    dpXVar: number; // = 1; x
    dpY: number; // = 0; y
    dpYVar: number; // = 1; y
    dpZ: number; // = 100; z
    dpZVar: number; // = 1; z
    dpScaleX: number; // = 1; 水平缩放
    dpScaleXVar: number; // = 1; 水平缩放
    dpScaleY: number; // = 1; 垂直缩放
    dpScaleYVar: number; // = 1; 垂直缩放
    rotation: number; // = 0; 旋转度
    rotationVar: number; // = 1; 旋转度
    opacity: number; // = 1; 透明度
    opacityVar: number; // = 1; 透明度
    playType: number; // = 2; 播放模式
    silentMode: boolean; // = false; 静音模式
    showHitEffect: boolean; // = true; 命中模式
    playFps: number; // = 20; 帧率
    aniFrame: number; // = 1; 起始帧
    aniFrameVar: number; // = 1; 起始帧
    refObjectEnabled: boolean; // = false; 模拟参考动画
    higher: boolean; // = false; 高级设定
    refObject: number; // = 1; 参考动画
    objectUseVar: boolean; // = false; 动画使用变量
    posUseVar: boolean; // = false; 坐标使用变量
    sizeUseVar: boolean; // = false; 缩放使用变量
    zUseVar: boolean; // = false; 深度使用变量
    opacityUseVar: boolean; // = false; 透明度使用变量
    rotationUseVar: boolean; // = false; 旋转度使用变量
    passageIDUseVar: boolean; // = false; 编号使用变量
    aniFrameUseVar: boolean; // = false; 起始帧使用变量
}
/**
* 自定义指令 3005-移动动画
*/
class CustomCommandParams_3005 {
    passageID: number; // = 1; 编号
    passageIDVar: number; // = 1; 编号
    timeType: number; // = 1; 变更方式
    trans: string; // = ""; 过渡
    time: number; // = 30; 持续帧数
    dpX: number; // = 0; x
    dpXVar: number; // = 1; x
    dpY: number; // = 0; y
    dpYVar: number; // = 1; y
    dpZ: number; // = 100; z
    dpZVar: number; // = 1; z
    dpScaleX: number; // = 1; 水平缩放
    dpScaleXVar: number; // = 1; 水平缩放
    dpScaleY: number; // = 1; 垂直缩放
    dpScaleYVar: number; // = 1; 垂直缩放
    rotation: number; // = 0; 旋转度
    rotationVar: number; // = 1; 旋转度
    opacity: number; // = 1; 透明度
    opacityVar: number; // = 1; 透明度
    changeFrame: boolean; // = false; 设置帧
    aniFrame: number; // = 1; 帧
    aniFrameVar: number; // = 1; 帧
    refObjectEnabled: boolean; // = false; 模拟参考动画
    higher: boolean; // = false; 高级设定
    refObject: number; // = 0; 参考动画
    posUseVar: boolean; // = false; 坐标使用变量
    sizeUseVar: boolean; // = false; 尺寸使用变量
    zUseVar: boolean; // = false; 深度使用变量
    opacityUseVar: boolean; // = false; 透明度使用变量
    rotationUseVar: boolean; // = false; 旋转度使用变量
    frameUseVar: boolean; // = false; 设置帧使用变量
    passageIDUseVar: boolean; // = false; 编号使用变量
}
/**
* 自定义指令 3006-显示立绘
*/
class CustomCommandParams_3006 {
    passageID: number; // = 1; 编号
    passageIDVar: number; // = 1; 编号
    standAvatar: number; // = 1; 立绘
    standAvatarVar: number; // = 1; 立绘
    expression: number; // = 1; 表情
    expressionVar: number; // = 1; 表情
    dpX: number; // = 0; x
    dpXVar: number; // = 1; x
    dpY: number; // = 0; y
    dpYVar: number; // = 1; y
    dpZ: number; // = 100; z
    dpZVar: number; // = 1; z
    dpScaleX: number; // = 1; 水平缩放
    dpScaleXVar: number; // = 1; 水平缩放
    dpScaleY: number; // = 1; 垂直缩放
    dpScaleYVar: number; // = 1; 垂直缩放
    rotation: number; // = 0; 旋转度
    rotationVar: number; // = 1; 旋转度
    opacity: number; // = 1; 透明度
    opacityVar: number; // = 1; 透明度
    playType: number; // = 1; 播放模式
    avatarFPS: number; // = 20; 帧率
    avatarFrame: number; // = 1; 起始帧
    avatarFrameVar: number; // = 1; 起始帧
    refObjectEnabled: boolean; // = false; 模拟参考立绘
    higher: boolean; // = false; 高级设定
    refObject: number; // = 1; 参考立绘
    objectUseVar: boolean; // = false; 立绘使用变量
    posUseVar: boolean; // = false; 坐标使用变量
    sizeUseVar: boolean; // = false; 缩放使用变量
    zUseVar: boolean; // = false; 深度使用变量
    opacityUseVar: boolean; // = false; 透明度使用变量
    rotationUseVar: boolean; // = false; 旋转度使用变量
    passageIDUseVar: boolean; // = false; 编号使用变量
    frameUseVar: boolean; // = false; 起始帧使用变量
    expressionUseVar: boolean; // = false; 表情使用变量
}
/**
* 自定义指令 3007-移动立绘
*/
class CustomCommandParams_3007 {
    passageID: number; // = 1; 编号
    passageIDVar: number; // = 1; 编号
    timeType: number; // = 1; 变更方式
    time: number; // = 30; 持续帧数
    trans: string; // = ""; 过渡
    dpX: number; // = 0; x
    dpXVar: number; // = 1; x
    dpY: number; // = 0; y
    dpYVar: number; // = 1; y
    dpZ: number; // = 100; z
    dpZVar: number; // = 1; z
    dpScaleX: number; // = 1; 水平缩放
    dpScaleXVar: number; // = 1; 水平缩放
    dpScaleY: number; // = 1; 垂直缩放
    dpScaleYVar: number; // = 1; 垂直缩放
    rotation: number; // = 0; 旋转度
    rotationVar: number; // = 1; 旋转度
    opacity: number; // = 1; 透明度
    opacityVar: number; // = 1; 透明度
    changeExpression: boolean; // = false; 设置表情
    expression: number; // = 1; 表情
    expressionVar: number; // = 1; 表情
    changeFrame: boolean; // = false; 设置帧
    avatarFrame: number; // = 1; 帧
    avatarFrameVar: number; // = 1; 帧
    refObjectEnabled: boolean; // = false; 模拟参考立绘
    higher: boolean; // = false; 高级设定
    refObject: number; // = 0; 参考立绘
    posUseVar: boolean; // = false; 坐标使用变量
    sizeUseVar: boolean; // = false; 尺寸使用变量
    zUseVar: boolean; // = false; 深度使用变量
    opacityUseVar: boolean; // = false; 透明度使用变量
    rotationUseVar: boolean; // = false; 旋转度使用变量
    passageIDUseVar: boolean; // = false; 编号使用变量
    expressionUseVar: boolean; // = false; 表情使用变量
    frameUseVar: boolean; // = false; 起始帧使用变量
}
/**
* 自定义指令 3008-消除图像
*/
class CustomCommandParams_3008 {
    passageIDUseVar: boolean; // = false; 使用变量指定编号
    passageID: number; // = 1; 编号
    passageIDVar: number; // = 1; 编号
}
/**
* 自定义指令 3009-自动旋转
*/
class CustomCommandParams_3009 {
    passageIDUseVar: boolean; // = false; 使用变量指定编号
    passageID: number; // = 1; 编号
    passageIDVar: number; // = 1; 编号
    rotation: number; // = 5; 每帧旋转度
}
/**
* 自定义指令 3010-显示界面
*/
class CustomCommandParams_3010 {
    showType: number; // = 0; 层级
    passageID: number; // = 1; 编号
    passageIDVar: number; // = 1; 编号
    uiID: number; // = 1; 界面
    uiVar: number; // = 1; 界面
    setAttr: boolean; // = true; 设置属性
    dpX: number; // = 0; x
    dpXVar: number; // = 1; x
    dpY: number; // = 0; y
    dpYVar: number; // = 1; y
    dpZ: number; // = 100; z
    dpZVar: number; // = 1; z
    dpScaleX: number; // = 1; 水平缩放
    dpScaleXVar: number; // = 1; 水平缩放
    dpScaleY: number; // = 1; 垂直缩放
    dpScaleYVar: number; // = 1; 垂直缩放
    rotation: number; // = 0; 旋转度
    rotationVar: number; // = 1; 旋转度
    opacity: number; // = 1; 透明度
    opacityVar: number; // = 1; 透明度
    refObjectEnabled: boolean; // = false; 模拟参考界面
    higher: boolean; // = false; 高级设定
    refObject: number; // = 1; 参考界面
    objectUseVar: boolean; // = false; 界面使用变量
    posUseVar: boolean; // = false; 坐标使用变量
    sizeUseVar: boolean; // = false; 缩放使用变量
    zUseVar: boolean; // = false; 深度使用变量
    opacityUseVar: boolean; // = false; 透明度使用变量
    rotationUseVar: boolean; // = false; 旋转度使用变量
    passageIDUseVar: boolean; // = false; 编号使用变量
}
/**
* 自定义指令 3011-移动界面
*/
class CustomCommandParams_3011 {
    showType: number; // = 0; 层级
    passageID: number; // = 1; 编号
    passageIDVar: number; // = 1; 编号
    uiID: number; // = 1; 界面
    uiVar: number; // = 1; 界面
    timeType: number; // = 1; 变更方式
    time: number; // = 30; 持续帧数
    trans: string; // = ""; 过渡
    dpX: number; // = 0; x
    dpXVar: number; // = 1; x
    dpY: number; // = 0; y
    dpYVar: number; // = 1; y
    dpZ: number; // = 100; z
    dpZVar: number; // = 1; z
    dpScaleX: number; // = 1; 水平缩放
    dpScaleXVar: number; // = 1; 水平缩放
    dpScaleY: number; // = 1; 垂直缩放
    dpScaleYVar: number; // = 1; 垂直缩放
    rotation: number; // = 0; 旋转度
    rotationVar: number; // = 1; 旋转度
    opacity: number; // = 1; 透明度
    opacityVar: number; // = 1; 透明度
    refObjectEnabled: boolean; // = false; 模拟参考界面
    higher: boolean; // = false; 高级设定
    refObject: number; // = 0; 参考界面
    posUseVar: boolean; // = false; 坐标使用变量
    sizeUseVar: boolean; // = false; 尺寸使用变量
    zUseVar: boolean; // = false; 深度使用变量
    opacityUseVar: boolean; // = false; 透明度使用变量
    rotationUseVar: boolean; // = false; 旋转度使用变量
    passageIDUseVar: boolean; // = false; 编号使用变量
    objectUseVar: boolean; // = false; 界面使用变量
}
/**
* 自定义指令 3012-关闭界面
*/
class CustomCommandParams_3012 {
    showType: number; // = 0; 层级
    passageID: number; // = 1; 编号
    passageIDVar: number; // = 1; 编号
    uiID: number; // = 1; 界面
    uiVar: number; // = 1; 界面
    passageIDUseVar: boolean; // = false; 编号使用变量
    objectUseVar: boolean; // = false; 界面使用变量
}
/**
* 自定义指令 3013-移动界面内的元件
*/
class CustomCommandParams_3013 {
    changeUIAttr: any; // 修改界面元件
}
/**
* 自定义指令 3014-添加材质
*/
class CustomCommandParams_3014 {
    targetType: number; // = 0; 目标类型
    passageIDUseVar: boolean; // = false; 使用变量指定编号
    passageID: number; // = 1; 编号
    passageIDVar: number; // = 1; 编号
    objectUseVar: boolean; // = false; 界面使用变量
    uiID: number; // = 1; 界面
    uiVar: number; // = 1; 界面
    materialData: { materials: MaterialData[] }[]; // 材质
}
/**
* 自定义指令 3015-更改材质
*/
class CustomCommandParams_3015 {
    targetType: number; // = 0; 目标类型
    passageIDUseVar: boolean; // = false; 使用变量指定编号
    passageID: number; // = 1; 编号
    passageIDVar: number; // = 1; 编号
    objectUseVar: boolean; // = false; 界面使用变量
    uiID: number; // = 1; 界面
    uiVar: number; // = 1; 界面
    materialData: { materials: MaterialData[] }[]; // 材质
}
/**
* 自定义指令 3016-删除材质
*/
class CustomCommandParams_3016 {
    targetType: number; // = 0; 目标类型
    passageIDUseVar: boolean; // = false; 使用变量指定编号
    passageID: number; // = 1; 编号
    passageIDVar: number; // = 1; 编号
    objectUseVar: boolean; // = false; 界面使用变量
    uiID: number; // = 1; 界面
    uiVar: number; // = 1; 界面
    clearType: number; // = 0; 删除方式
    materialID: number; // = 1; 材质
    materialPassage: number; // = 0; 材质通道
}
/**
* 自定义指令 3017-
*/
class CustomCommandParams_3017 {
}
/**
* 自定义指令 3018-显示视频
*/
class CustomCommandParams_3018 {
    passageID: number; // = 1; 编号
    passageIDVar: number; // = 1; 编号
    video: string; // = ""; 视频
    videoVar: number; // = 1; 视频
    dpX: number; // = 0; x
    dpXVar: number; // = 1; x
    dpY: number; // = 0; y
    dpYVar: number; // = 1; y
    dpZ: number; // = 100; z
    dpZVar: number; // = 1; z
    dpWidth: number; // = 100; 宽度
    dpWidthVar: number; // = 1; 宽度
    dpHeight: number; // = 100; 高度
    dpHeightVar: number; // = 1; 高度
    rotation: number; // = 0; 旋转度
    rotationVar: number; // = 1; 旋转度
    opacity: number; // = 1; 透明度
    opacityVar: number; // = 1; 透明度
    playType: number; // = 0; 播放模式
    flip: boolean; // = false; 水平翻转
    muted: boolean; // = false; 静音模式
    loop: boolean; // = false; 循环播放
    volume: number; // = 1; 音量
    currentTime: number; // = 0; 起始时间
    currentTimeVar: number; // = 1; 起始时间
    playbackRate: number; // = 1; 播放速率
    blendMode: number; // = 0; 混合模式
    higher: boolean; // = false; 高级设定
    objectUseVar: boolean; // = false; 视频使用变量
    posUseVar: boolean; // = false; 坐标使用变量
    sizeUseVar: boolean; // = false; 尺寸使用变量
    zUseVar: boolean; // = false; 深度使用变量
    opacityUseVar: boolean; // = false; 透明度使用变量
    rotationUseVar: boolean; // = false; 旋转度使用变量
    passageIDUseVar: boolean; // = false; 编号使用变量
    currentTimeUseVar: boolean; // = false; 起始时间使用变量
}
/**
* 自定义指令 3019-移动视频
*/
class CustomCommandParams_3019 {
    passageID: number; // = 1; 编号
    passageIDVar: number; // = 1; 编号
    timeType: number; // = 1; 变更方式
    time: number; // = 30; 持续帧数
    trans: string; // = ""; 过渡
    dpX: number; // = 0; x
    dpXVar: number; // = 1; x
    dpY: number; // = 0; y
    dpYVar: number; // = 1; y
    dpZ: number; // = 100; z
    dpZVar: number; // = 1; z
    dpWidth: number; // = 100; 宽度
    dpWidthVar: number; // = 1; 宽度
    dpHeight: number; // = 100; 高度
    dpHeightVar: number; // = 1; 高度
    rotation: number; // = 0; 旋转度
    rotationVar: number; // = 1; 旋转度
    opacity: number; // = 1; 透明度
    opacityVar: number; // = 1; 透明度
    playType: number; // = 0; 播放模式
    flip: boolean; // = false; 水平翻转
    muted: boolean; // = false; 静音模式
    loop: boolean; // = false; 循环播放
    volume: number; // = 1; 音量
    changeStartTime: boolean; // = false; 更改起始时间
    currentTime: number; // = 0; 起始时间
    currentTimeVar: number; // = 1; 起始时间
    playbackRate: number; // = 1; 播放速率
    blendMode: number; // = 0; 混合模式
    higher: boolean; // = false; 高级设定
    posUseVar: boolean; // = false; 坐标使用变量
    sizeUseVar: boolean; // = false; 尺寸使用变量
    zUseVar: boolean; // = false; 深度使用变量
    opacityUseVar: boolean; // = false; 透明度使用变量
    rotationUseVar: boolean; // = false; 旋转度使用变量
    passageIDUseVar: boolean; // = false; 编号使用变量
    currentTimeUseVar: boolean; // = false; 起始时间使用变量
}
/**
* 自定义指令 3020-等待关闭界面
*/
class CustomCommandParams_3020 {
    useVar: number; // = 0; 类别
    uiID: number; // = 1; 界面
    uiVar: number; // = 1; 界面
}
/**
* 自定义指令 3021-等待视频播放完成
*/
class CustomCommandParams_3021 {
    passageID: number; // = 1; 编号
    passageIDVar: number; // = 1; 编号
    varType: number; // = 0; 模式
}
/**
* 自定义指令 4001-允许玩家控制
*/
class CustomCommandParams_4001 {
}
/**
* 自定义指令 4002-禁止玩家控制
*/
class CustomCommandParams_4002 {
}
/**
* 自定义指令 4003-允许使用菜单
*/
class CustomCommandParams_4003 {
}
/**
* 自定义指令 4004-禁止使用菜单
*/
class CustomCommandParams_4004 {
}
/**
* 自定义指令 4005-开始游戏
*/
class CustomCommandParams_4005 {
}
/**
* 自定义指令 4006-存档
*/
class CustomCommandParams_4006 {
    saveType: number; // = 0; 档案类别
    saveID: number; // = 1; 编号
    silenceMode: boolean; // = false; 静默执行
}
/**
* 自定义指令 4007-设置全局音量
*/
class CustomCommandParams_4007 {
    type: number; // = 0; 类别
    volume: number; // = 100; 音量
    useVar: number; // = 0; 使用变量
    volumeVarID: number; // = 1; 音量
}
/**
* 自定义指令 4008-返回标题界面
*/
class CustomCommandParams_4008 {
}
/**
* 自定义指令 4009-暂停游戏
*/
class CustomCommandParams_4009 {
}
/**
* 自定义指令 4010-恢复游戏
*/
class CustomCommandParams_4010 {
}
/**
* 自定义指令 4011-关闭窗口
*/
class CustomCommandParams_4011 {
}
/**
* 自定义指令 4012-设置对话音效
*/
class CustomCommandParams_4012 {
    dialogSE: number; // = 0;
}
/**
* 自定义指令 4013-设置世界属性
*/
class CustomCommandParams_4013 {
    worldData: CustomCompData; // 世界设定
}
/**
* 自定义指令 4014-设置玩家属性
*/
class CustomCommandParams_4014 {
    playerData: CustomCompData; // 玩家设定
}
/**
* 自定义指令 5001-播放背景音乐
*/
class CustomCommandParams_5001 {
    bgm: string; // = ""; 选择
    bgmVarID: number; // = 1; 选择
    fadeInTime: number; // = 0; 淡入效果
    fadeInTimeVarID: number; // = 1; 淡入效果
    advanceSetting: boolean; // = false; 高级设置
    bgmUseVar: boolean; // = false; 音乐地址使用变量
    fadeInTimeUseVar: boolean; // = false; 淡入效果使用变量
}
/**
* 自定义指令 5002-停止背景音乐
*/
class CustomCommandParams_5002 {
    fadeOutTime: number; // = 0; 淡出效果
    fadeOutTimeVarID: number; // = 1; 淡出效果
    fadeOutTimeUseVar: boolean; // = false; 使用变量
}
/**
* 自定义指令 5003-播放环境声效
*/
class CustomCommandParams_5003 {
    bgs: string; // = ""; 选择
    bgsVarID: number; // = 1; 选择
    fadeInTime: number; // = 0; 淡入效果
    fadeInTimeVarID: number; // = 1; 淡入效果
    advanceSetting: boolean; // = false; 高级设置
    bgsUseVar: boolean; // = false; 音乐地址使用变量
    fadeInTimeUseVar: boolean; // = false; 淡入效果使用变量
}
/**
* 自定义指令 5004-停止环境声效
*/
class CustomCommandParams_5004 {
    fadeOutTime: number; // = 0; 淡出效果
    fadeOutTimeVarID: number; // = 1; 淡出效果
    fadeOutTimeUseVar: boolean; // = false; 使用变量
}
/**
* 自定义指令 5005-播放音效
*/
class CustomCommandParams_5005 {
    se: string; // = ""; 选择
    seVarID: number; // = 1; 选择
    systemSEType: number; // = 1; 选择
    systemSE: boolean; // = false; 系统音效
    seUseVar: boolean; // = false; 使用变量
    nearBigFarSmall: boolean; // = false; 近大远小
}
/**
* 自定义指令 5006-停止音效
*/
class CustomCommandParams_5006 {
}
/**
* 自定义指令 5007-播放语音
*/
class CustomCommandParams_5007 {
    ts: string; // = ""; 选择
    tsVarID: number; // = 1; 选择
    tsUseVar: boolean; // = false; 使用变量
    nearBigFarSmall: boolean; // = false; 近大远小
}
/**
* 自定义指令 5008-停止语音
*/
class CustomCommandParams_5008 {
}
/**
* 自定义指令 8001-增减场景对象的模块
*/
class CustomCommandParams_8001 {
    soType: number; // = 2; 对象
    no: number; // = 0; 对象编号
    noVarID: number; // = 1; 对象编号
    soUseVar: number; // = 0; 使用变量指定
    symbol: number; // = 0; 操作
    value: number; // = 0; 模块
    valueVarID: number; // = 1; 模块
    valueUseVar: number; // = 0; 使用变量指定
}
/**
* 自定义指令 8002-修改场景对象模块属性
*/
class CustomCommandParams_8002 {
    useVar: number; // = 0; 使用变量指定
    no: number; // = 0; 对象编号
    noVarID: number; // = 1; 对象编号
    soType: number; // = 2; 对象
    attr: CustomCompData; // 属性
}
/**
* 自定义指令 9001-战斗参数设定
*/
class CustomCommandParams_9001 {
    paramType: number; // = 0; 参数选择
    value: number; // = 0;
}
/**
* 自定义指令 9002-增减战斗者的生命值
*/
class CustomCommandParams_9002 {
    soType: number; // = 1; 对象
    no: number; // = 0; 对象编号
    noVarID: number; // = 1; 对象编号
    soUseVar: number; // = 0; 使用变量指定
    symbol: number; // = 0; 操作
    value: number; // = 0; 值
    valueVarID: number; // = 1; 值
    valueUseVar: number; // = 0; 使用变量指定
}
/**
* 自定义指令 9003-增减战斗者的魔法值
*/
class CustomCommandParams_9003 {
    soType: number; // = 1; 对象
    no: number; // = 0; 对象编号
    noVarID: number; // = 1; 对象编号
    soUseVar: number; // = 0; 使用变量指定
    symbol: number; // = 0; 操作
    value: number; // = 0; 值
    valueVarID: number; // = 1; 值
    valueUseVar: number; // = 0; 使用变量指定
}
/**
* 自定义指令 9004-增减战斗者的状态
*/
class CustomCommandParams_9004 {
    soType: number; // = 1; 对象
    no: number; // = 0; 对象编号
    noVarID: number; // = 1; 对象编号
    soUseVar: number; // = 0; 使用变量指定
    symbol: number; // = 0; 操作
    statusID: number; // = 1; 状态
    statusIDVarID: number; // = 1; 状态
    statusUseVar: number; // = 0; 使用变量
    force: boolean; // = true; 强制附加
}
/**
* 自定义指令 9005-显示伤害
*/
class CustomCommandParams_9005 {
    soType: number; // = 1; 对象
    no: number; // = 0; 对象编号
    noVarID: number; // = 1; 对象编号
    soUseVar: number; // = 0; 使用变量指定
    type: number; // = 0; 类别
    value: number; // = 1; 显示值
    valueVarID: number; // = 1; 显示值
    valueUseVar: number; // = 0; 使用变量
    isCrit: boolean; // = false; 暴击效果
}
/**
* 自定义指令 9006-使用技能
*/
class CustomCommandParams_9006 {
    soType: number; // = 1; 对象
    no: number; // = 0; 对象编号
    noVarID: number; // = 1; 对象编号
    soUseVar: number; // = 0; 使用变量指定
    skillID: number; // = 1; 技能
    skillIDVarID: any; // 技能
    skillUseVar: number; // = 0; 使用变量
    needOwn: boolean; // = true; 需要拥有该技能
}
/**
* 自定义指令 9007-战斗模式设置
*/
class CustomCommandParams_9007 {
    mode: number; // = 0;
    autoUI: boolean; // = true; 自动开启或关闭战斗主界面
    autoHideParty: boolean; // = true; 自动显示/隐藏队友
}
/**
* 自定义指令 9008-增减战斗者基础属性
*/
class CustomCommandParams_9008 {
    soType: number; // = 1; 对象
    no: number; // = 0; 对象编号
    noVarID: number; // = 1; 对象编号
    soUseVar: number; // = 0; 使用变量指定
    symbol: number; // = 0; 操作
    value: number; // = 0; 值
    valueVarID: number; // = 1; 值
    valueUseVar: number; // = 0; 使用变量指定
    attrType: number; // = 0; 基础属性
}
/**
* 自定义指令 9009-
*/
class CustomCommandParams_9009 {
}
/**
* 自定义指令 9010-
*/
class CustomCommandParams_9010 {
}
/**
* 自定义指令 10001-增减装备
*/
class CustomCommandParams_10001 {
    symbol: number; // = 0; 操作
    equipID: number; // = 1; 装备
    useVar1: number; // = 0; 使用变量
    equipIDVarID: number; // = 1; 装备
    useVar2: number; // = 0; 使用变量
    num: number; // = 1; 数目
    numVarID: number; // = 1; 数目
    attributeRand: boolean; // = false; 属性浮动
    isSceneItem: boolean; // = false; 掉落在地上
    equipRandSetting: DataStructure_equipRand[]; // = [];
}
/**
* 自定义指令 10002-替换队伍角色
*/
class CustomCommandParams_10002 {
    type: number; // = 0; 操作类别
    saveTo: any; // 仓库编号
    isSaveActor: boolean; // = false; 储存离开的角色
    isRestoreActor: boolean; // = false; 来自储存仓库
    actorStoreIndex: any; // 仓库编号
    awayType: number; // = 0; 查找角色
    actorID: number; // = 1; 角色
    actorIDVarID: number; // = 1; 角色
    useVar: number; // = 0; 使用变量
    lv: number; // = 1; 等级
    lvVarID: number; // = 1; 等级
    lvUseVar: number; // = 0; 使用变量
    inPartyIndex: any; // 位置
}
/**
* 自定义指令 10003-替换角色的技能
*/
class CustomCommandParams_10003 {
    actorCheckType: number; // = 0; 查找角色方式
    actorID: number; // = 1; 角色
    actorIDVarID: number; // = 1; 角色
    useVar: number; // = 0; 使用变量
    actorInPartyIndex: number; // = 0; 所在队伍位置
    actorInPartyIndexVarID: number; // = 1; 所在队伍位置
    actorInPartyIndexVarIDUseVar: number; // = 0; 使用变量
    soType: number; // = 1; 对象
    no: number; // = 0; 对象编号
    noVarID: number; // = 1; 对象编号
    soUseVar: number; // = 0; 使用变量指定
    symbol: number; // = 0; 操作
    skillID: number; // = 1; 技能
    skillIDVarID: number; // = 1; 技能
    skillUseVar: number; // = 0; 使用变量
}
/**
* 自定义指令 10004-替换角色的装备
*/
class CustomCommandParams_10004 {
    actorCheckType: number; // = 0; 查找角色方式
    actorID: number; // = 1; 角色
    actorIDVarID: number; // = 1; 角色
    useVar: number; // = 0; 使用变量
    actorInPartyIndex: number; // = 0; 所在队伍位置
    actorInPartyIndexVarID: number; // = 1; 所在队伍位置
    actorInPartyIndexVarIDUseVar: number; // = 0; 使用变量
    soType: number; // = 1; 对象
    no: number; // = 0; 对象编号
    noVarID: number; // = 1; 对象编号
    soUseVar: number; // = 0; 使用变量指定
    symbol: number; // = 0; 操作
    fromPlayerPackage: boolean; // = true; 从玩家背包中穿戴
    usePartID: boolean; // = true; 使用部位
    partID: number; // = 1; 部位
    equipID: number; // = 1; 装备
    equipIDVarID: number; // = 1; 装备
    equipUseVar: number; // = 0; 使用变量
    takeOffEquipSaveToVar: number; // = 1; 储存至
    isTakeOffEquipSaveToVar: boolean; // = false; 卸下的装备编号储存至数值变量
}
/**
* 自定义指令 10005-增减角色的属性
*/
class CustomCommandParams_10005 {
    actorCheckType: number; // = 0; 查找角色方式
    actorID: number; // = 1; 角色
    actorIDVarID: number; // = 1; 角色
    useVar: number; // = 0; 使用变量
    actorInPartyIndex: number; // = 0; 所在队伍位置
    actorInPartyIndexVarID: number; // = 1; 所在队伍位置
    actorInPartyIndexVarIDUseVar: number; // = 0; 使用变量
    soType: number; // = 1; 对象
    no: number; // = 0; 对象编号
    noVarID: number; // = 1; 对象编号
    soUseVar: number; // = 0; 使用变量指定
    attributeType: number; // = 0; 操作
    allowDead: boolean; // = false; 允许死亡
    extAttribute: number; // = 1;
    value: number; // = 1; 值
    valueVarID: number; // = 1; 值
    valueUseVar: number; // = 0; 使用变量
}
/**
* 自定义指令 10006-更改角色的名称
*/
class CustomCommandParams_10006 {
    actorCheckType: number; // = 0; 查找角色方式
    actorID: number; // = 1; 角色
    actorIDVarID: number; // = 1; 角色
    useVar: number; // = 0; 使用变量
    actorInPartyIndex: number; // = 0; 所在队伍位置
    actorInPartyIndexVarID: number; // = 1; 所在队伍位置
    actorInPartyIndexVarIDUseVar: number; // = 0; 使用变量
    value: string; // = ""; 值
    valueVarID: number; // = 1; 值
    valueUseVar: number; // = 0; 使用变量
}
/**
* 自定义指令 10007-更改角色的职业
*/
class CustomCommandParams_10007 {
    actorCheckType: number; // = 0; 查找角色方式
    actorID: number; // = 1; 角色
    actorIDVarID: number; // = 1; 角色
    useVar: number; // = 0; 使用变量
    actorInPartyIndex: number; // = 0; 所在队伍位置
    actorInPartyIndexVarID: number; // = 1; 所在队伍位置
    actorInPartyIndexVarIDUseVar: number; // = 0; 使用变量
    value: number; // = 1; 值
    valueVarID: number; // = 1; 值
    valueUseVar: number; // = 0; 使用变量
}
/**
* 自定义指令 10008-完全恢复
*/
class CustomCommandParams_10008 {
    actorCheckType: number; // = 0; 查找角色方式
    actorID: number; // = 1; 角色
    actorIDVarID: number; // = 1; 角色
    useVar: number; // = 0; 使用变量
    actorInPartyIndex: number; // = 0; 所在玩家队伍位置
    actorInPartyIndexVarID: number; // = 1; 所在玩家队伍位置
    actorInPartyIndexVarIDUseVar: number; // = 0; 使用变量
}
/**
* 自定义指令 10009-复活我方角色
*/
class CustomCommandParams_10009 {
    actorCheckType: number; // = 0; 查找角色方式
    actorID: number; // = 1; 角色
    actorIDVarID: number; // = 1; 角色
    useVar: number; // = 0; 使用变量
    actorInPartyIndex: number; // = 0; 所在队伍位置
    actorInPartyIndexVarID: number; // = 1; 所在队伍位置
    actorInPartyIndexVarIDUseVar: number; // = 0; 使用变量
    soType: number; // = 1; 对象
    no: number; // = 0; 对象编号
    noVarID: number; // = 1; 对象编号
    soUseVar: number; // = 0; 使用变量指定
}
/**
* 自定义指令 10010-修改角色的技能
*/
class CustomCommandParams_10010 {
    actorCheckType: number; // = 0; 查找角色方式
    actorID: number; // = 1; 角色
    actorIDVarID: number; // = 1; 角色
    useVar: number; // = 0; 使用变量
    actorInPartyIndex: number; // = 0; 所在队伍位置
    actorInPartyIndexVarID: number; // = 1; 所在队伍位置
    actorInPartyIndexVarIDUseVar: number; // = 0; 使用变量
    soType: number; // = 1; 对象
    no: number; // = 0; 对象编号
    noVarID: number; // = 1; 对象编号
    soUseVar: number; // = 0; 使用变量指定
    skillID: number; // = 1; 技能
    skillIDVarID: number; // = 1; 技能
    skillUseVar: number; // = 0; 使用变量
    attributes: CustomCompData; // 操作
}
/**
* 自定义指令 10011-修改角色的属性
*/
class CustomCommandParams_10011 {
    actorCheckType: number; // = 0; 查找角色方式
    actorID: number; // = 1; 角色
    actorIDVarID: number; // = 1; 角色
    useVar: number; // = 0; 使用变量
    actorInPartyIndex: number; // = 0; 所在队伍位置
    actorInPartyIndexVarID: number; // = 1; 所在队伍位置
    actorInPartyIndexVarIDUseVar: number; // = 0; 使用变量
    soType: number; // = 1; 对象
    no: number; // = 0; 对象编号
    noVarID: number; // = 1; 对象编号
    soUseVar: number; // = 0; 使用变量指定
    attrInfo: CustomCompData; // 属性
}
/**
* 自定义指令 14001-Clound_消耗点数
*/
class CustomCommandParams_14001 {
    cost: number; // = 1; 减少
}
/**
* 自定义指令 15001-新增任务
*/
class CustomCommandParams_15001 {
    mission: Module_任务; // = 0; 任务
}
/**
* 自定义指令 15002-完成任务
*/
class CustomCommandParams_15002 {
    mission: Module_任务; // = 0; 任务
}
/**
* 自定义指令 15003-删除任务
*/
class CustomCommandParams_15003 {
    mission: Module_任务; // = 0; 任务
}
/**
* 自定义指令 15004-修改任务描述
*/
class CustomCommandParams_15004 {
    mission: Module_任务; // = 0; 任务
    missionText: string; // = ""; 描述
}
/**
* 自定义指令 15005-更改小地图缩放
*/
class CustomCommandParams_15005 {
    mimiMapScale: number; // = 0; 小地图缩放
    useVar: boolean; // = false; 使用变量
    mimiMapScale1: number; // = 0; 小地图缩放
}
/**
* 自定义指令 15006-小地图操作
*/
class CustomCommandParams_15006 {
    op: number; // = 0; 操作
}
/**
* 自定义指令 15007-获得物品
*/
class CustomCommandParams_15007 {
    items: DataStructure_Lmkrt_GetItem[]; // = [];
    isSceneItem: boolean; // = false; 掉落在地上
}
/**
* 自定义指令 15008-强化装备
*/
class CustomCommandParams_15008 {
    equipRandSetting: DataStructure_1559_equipRand[]; // = [];
}
/**
* 自定义指令 15009-范围内敌人计数
*/
class CustomCommandParams_15009 {
    soType: number; // = 1; 对象
    no: number; // = 0; 对象编号
    noVarID: number; // = 1; 对象编号
    soUseVar: number; // = 0; 使用变量指定
    range: number; // = 0; 范围
    rangeVar: number; // = 0; 范围
    rangeUseVar: boolean; // = false; 变量
    resultVarID: number; // = 0; 结果存储变量
}
/**
* 自定义指令 15010-创建数组
*/
class CustomCommandParams_15010 {
    operation: number; // = 0; 操作
    arrType: number; // = 0; 数组类型
    useDefault: number; // = 0; 高级默认值
    len: number; // = 0; 数组长度
    defaultValueNum: number; // = 0; 默认数值
    defaultValueNum1: number; // = 0; 默认数值
    useVarDefaultValue: boolean; // = false; 使用变量
    defaultValueStr: string; // = ""; 默认字符串
    defaultValueStr1: number; // = 0; 默认字符串
    useVarDefaultLen: boolean; // = false; 使用变量
    len1: number; // = 0; 数组长度
    end: number; // = 0; 结束值
    useVarEnd: boolean; // = false; 使用变量
    end1: number; // = 0; 结束值
    start: number; // = 0; 开始值
    useVarDefaultRangeStart: boolean; // = false; 使用变量
    start1: number; // = 0; 开始值
    step: number; // = 0; 步数
    useVarStep: boolean; // = false; 使用变量
    step1: number; // = 0; 步数
    x_2d: number; // = 0; x(宽度)
    y_2d: number; // = 0; y(高度)
    useVar2d_x: boolean; // = false; 使用变量
    useVar2d_y: boolean; // = false; 使用变量
    x_2d1: number; // = 0; x(宽度)
    y_2d1: number; // = 0; y(高度)
    valueNum2d: number; // = 0; 默认数值
    valueNum2d1: number; // = 0; 默认数值
    useVar2dValue: boolean; // = false; 使用变量
    valueStr2d: string; // = ""; 默认字符串
    valueStr2d1: number; // = 0; 默认字符串
    arrayID2: number; // = 0; 从此数组中创建
    sChar: string; // = ""; 分割字符串
    useVar: boolean; // = false; 使用变量
    sChar1: number; // = 0; 分割字符串
    str: string; // = ""; 字符串
    useVar2: boolean; // = false; 使用变量
    str1: number; // = 0; 字符串
    arrayID3: number; // = 0; 数组3
    arrayID4: number; // = 0; 数组4
    sourceArray: number; // = 0; 源数组
    arrayID: number; // = 0; 创建数组到此id
    cover: boolean; // = true; 覆盖原有ID
    toPos: boolean; // = false; 输出到位置
    toPosUseVar: boolean; // = true; 使用变量
    arrayIDToPos: number; // = 0; 创建数组到此位置
    arrayIDToPos1: number; // = 0; 创建数组到此位置
}
/**
* 自定义指令 15011-显示网页弹窗
*/
class CustomCommandParams_15011 {
    webUrl: string; // = ""; 网页地址
    webWidth: number; // = 0; 网页宽度
    webMarginLeft: number; // = 0; 左右边距
    webMarginTop: number; // = 0; 上下边距
}
/**
* 自定义指令 15012-新增任务描述
*/
class CustomCommandParams_15012 {
    mission: Module_任务; // = 0; 任务
    missionText: string; // = ""; 描述
}
/**
* 自定义指令 15013-新增可接受任务
*/
class CustomCommandParams_15013 {
    id: number; // = 0; 对象编号
    mission: Module_任务; // = 0; 任务
}
/**
* 自定义指令 15014-删除可接受任务
*/
class CustomCommandParams_15014 {
    id: number; // = 0; 对象编号
    mission: Module_任务; // = 0; 任务
}
/**
* 自定义指令 15015-任务失败
*/
class CustomCommandParams_15015 {
    mission: Module_任务; // = 0; 任务
}
/**
* 自定义指令 15016-更改任务步骤状态
*/
class CustomCommandParams_15016 {
    mission: Module_任务; // = 0; 任务
    step: number; // = 0; 步骤编号
    cpt: boolean; // = false; 完成
}
/**
* 自定义指令 15017-
*/
class CustomCommandParams_15017 {
}
/**
* 自定义指令 15018-拖拽界面设定
*/
class CustomCommandParams_15018 {
    uiID: number; // = 0; 界面
    compName: string; // = ""; 允许拖拽的组件名
}
/**
* 自定义指令 15019-广播控制
*/
class CustomCommandParams_15019 {
    operateType: number; // = 0; 系统总开关
    groupSettings: DataStructure_Ltrwp_GroupState[]; // = [];
}
/**
* 自定义指令 15020-发送即时广播
*/
class CustomCommandParams_15020 {
    content: string; // = ""; 广播内容
}
/**
* 自定义指令 15021-打印数组
*/
class CustomCommandParams_15021 {
    arrayID: number; // = 0; 需要打印的数组id
}
/**
* 自定义指令 15022-删除数组
*/
class CustomCommandParams_15022 {
    deleteId: number; // = 0; 删除数组ID
    all: boolean; // = false; 完全清除
}
/**
* 自定义指令 15023-数组操作(新版)
*/
class CustomCommandParams_15023 {
    ptype: number; // = 0; 数组类型
    operate: number; // = 0; 操作
    arrayID: number; // = 0; 数组ID
    element: number; // = 0; 元素
    UsedVar: boolean; // = false; 使用变量
    elementVar: number; // = 0; 元素
    index: number; // = 0; 索引
    indexVar: number; // = 0; 索引
    UsedVar1: boolean; // = false; 使用变量
    fromIndex: number; // = 0; 从索引
    length: number; // = 0; 长度
    fromIndexVar: number; // = 0; 从索引
    lengthVar: number; // = 0; 长度
    elementStr: string; // = ""; 元素
    elementStrVar: number; // = 0; 元素
    toPosArrayId: boolean; // = false; 从位置获取数组ID
    arrayID1: number; // = 0; 数组ID
    structName: string; // = ""; 键名
    structName1: number; // = 0; 键名
    UsedVar3: boolean; // = false; 使用变量
    value2dNum: number; // = 0; 数值
    value2dNum1: number; // = 0; 数值
    value2dStr: string; // = ""; 字符串
    value2dStr1: number; // = 0; 字符串
    x_2d: number; // = 0; X
    x_2d1: number; // = 0; X
    y_2d: number; // = 0; Y
    y_2d1: number; // = 0; Y
    elements: DataStructure_批量数字[]; // = [];
    elementsStr: DataStructure_批量字符串[]; // = [];
    resultX: number; // = 0; X输出到
    resultY: number; // = 0; X输出到
    result: number; // = 0; 元素结果输出到
    operateResult: number; // = 0; 操作结果输出到
    indexResult: number; // = 0; 数值结果输出到
    toPos: boolean; // = false; 输出到位置
    toPos2: boolean; // = false; 输出到位置
    resultPos: number; // = 0; 元素输出到
    toUseVar: boolean; // = false; 使用变量
    resultPosVar: number; // = 0; 元素输出到
    toIndexResult: number; // = 0; 数值结果输出到
    toUseVar1: boolean; // = false; 使用变量
    toIndexResultVar: number; // = 0; 数值结果输出到
    boolResult: number; // = 0; 是否结果
    resultStr: number; // = 0; 元素结果输出到
}
/**
* 自定义指令 15024-设置好感度
*/
class CustomCommandParams_15024 {
    fromActorType: number; // = 0; 角色A来源类型
    fromActorId: number; // = 0; 角色A的ID
    fromActorVarId: number; // = 0; 角色A的ID
    toActorType: number; // = 0; 角色B来源类型
    toActorId: number; // = 0; 角色B的ID
    toActorVarId: number; // = 0; 角色B的ID
    operation: number; // = 0; 操作类型
    isMutual: boolean; // = false; 是否双向操作
    valueType: number; // = 0; 数值类型
    value: number; // = 0; 数值
    valueVarId: number; // = 0; 数值
}
/**
* 自定义指令 15025-获取好感度
*/
class CustomCommandParams_15025 {
    fromActorType: number; // = 0; 角色A来源类型
    fromActorId: number; // = 0; 角色A的ID
    fromActorVarId: number; // = 0; 角色A的ID
    toActorType: number; // = 0; 角色B来源类型
    toActorId: number; // = 0; 角色B的ID
    toActorVarId: number; // = 0; 角色B的ID
    resultVarId: number; // = 0; 存储结果
}
/**
* 自定义指令 15026-自动战斗
*/
class CustomCommandParams_15026 {
    AutoBattleAI: number; // = 0; 开还是关
}
/**
* 自定义指令 15027-自动拾取
*/
class CustomCommandParams_15027 {
    action: number; // = 0; 类型
    radius: number; // = 0; 拾取范围
    radiusVarID: number; // = 0; 拾取范围
    radiusUseVar: boolean; // = false; 变量
    duration: number; // = 0; 吸附时间ms
    durationVarID: number; // = 0; 吸附时间ms
    durationUseVar: boolean; // = false; 变量
}
/**
* 自定义指令 15028-显示FPS
*/
class CustomCommandParams_15028 {
}
/**
* 自定义指令 15029-关闭显示FPS
*/
class CustomCommandParams_15029 {
}
/**
* 自定义指令 15030-完成成就
*/
class CustomCommandParams_15030 {
    achievementId: number; // = 0; 成就
}
/**
* 自定义指令 15031-显示成就
*/
class CustomCommandParams_15031 {
    achievementId: number; // = 0; 成就
}
/**
* 自定义指令 15032-用户登录
*/
class CustomCommandParams_15032 {
    username: number; // = 0; 用户名
    password: number; // = 0; 密码
}
/**
* 自定义指令 15033-用户登出
*/
class CustomCommandParams_15033 {
}
/**
* 自定义指令 15034-手动上传数据
*/
class CustomCommandParams_15034 {
}
/**
* 自定义指令 15035-显示聊天界面
*/
class CustomCommandParams_15035 {
}
/**
* 自定义指令 15036-显示排行榜界面
*/
class CustomCommandParams_15036 {
}
/**
* 自定义指令 15037-
*/
class CustomCommandParams_15037 {
}
/**
* 自定义指令 15038-
*/
class CustomCommandParams_15038 {
}
/**
* 自定义指令 15039-
*/
class CustomCommandParams_15039 {
}
/**
* 自定义指令 15040-
*/
class CustomCommandParams_15040 {
}
