/**
 * 该文件为GameCreator编辑器自动生成的代码，请勿修改
 */
/**
 * 场景对象模块基类
 */
class SceneObjectModule {
    static moduleClassArr:(typeof SceneObjectModule)[] = [];
    id: number; // 模块ID
    name: string; // 模块名称
    so: ProjectClientSceneObject; // 场景对象实例
    isDisposed:boolean; // 是否已被销毁
    /**
     * 构造函数
     * @param installCB 用于安装模块的属性值
     */
    constructor(installCB: Callback) {
        installCB && installCB.runWith([this]);
    }
    /**
     * 当移除模块时执行的函数
     */
    onRemoved():void {
        
    }
    /**
     * 刷新：通常在改变了属性需要调用此函数统一刷新效果
     */
    refresh():void {
        
    }
    /**
     * 当卸载模块时执行的函数
     */
    dispose():void {
        this.so = null;
        this.name = null;
        this.isDisposed = true;
    }
}
/**
 * 场景对象公共类，任何场景对象都继承该类
 */
class SceneObjectCommon extends ClientSceneObject {
    selectEnabled: boolean; // = true; 允许光标选中
    through: boolean; // = false; 穿透
    bridge: boolean; // = false; 桥属性
    fixOri: boolean; // = false; 固定朝向
    ignoreCantMove: boolean; // = false; 忽略无法移动的场合
    moveAutoChangeAction: boolean; // = true; 移动时更换动作
    lockBehaviorLayer: number; // = 0; 执行点击事件中
    keepMoveActWhenCollsionObstacleAndIgnoreCantMove: boolean; // = false; 当碰到障碍时且处于忽略无法移动的场合时保持移动动作
    behaviorDir4: boolean; // = false; 行为四方向限定
    repeatedTouchEnabled: boolean; // = false; 允许重复接触
    onlyPlayerTouch: boolean; // = true; 仅允许玩家触发碰触事件
    waitTouchEvent: boolean; // = true; 碰触事件执行时等待
    clickEventNoDistance: boolean; // = false; 点击事件-无视距离
    moveSpeed: number; // = 150; 移动速度
    defBehavior: string; // = ""; 默认行为
    collisionGroup: number; // = 0; 碰撞组
    constructor(soData: SceneObject, scene: ClientScene) {
        super(soData,scene);
    }
}
/**
 * 场景对象模型：影子（极简）
 */
class SceneObjectModule_1 extends SceneObjectModule {
    shadowWidth: number; // = 30; 影子宽度
    shadowHeight: number; // = 15; 影子高度
    shadowAlpha: number; // = 0.5; 影子透明度
    constructor(installCB: Callback) {
        super(installCB);
    }
}
SceneObjectModule.moduleClassArr[1]=SceneObjectModule_1;
/**
 * 场景对象模型：行走图材质
 */
class SceneObjectModule_2 extends SceneObjectModule {
    materialData: { materials: MaterialData[] }[];
    constructor(installCB: Callback) {
        super(installCB);
    }
}
SceneObjectModule.moduleClassArr[2]=SceneObjectModule_2;
/**
 * 场景对象模型：动画
 */
class SceneObjectModule_3 extends SceneObjectModule {
    ani: GCAnimation;
    constructor(installCB: Callback) {
        super(installCB);
    }
}
SceneObjectModule.moduleClassArr[3]=SceneObjectModule_3;
/**
 * 场景对象模型：自定义碰撞
 */
class SceneObjectModule_4 extends SceneObjectModule {
    type: number; // = 0; 范围形状
    color: string; // = "#ff0000"; 颜色
    opacity: number; // = 0.5; 不透明度
    layer: number; // = 0; 层次
    hideAvatar: boolean; // = false; 隐藏行走图
    alwaysDisplayColor: boolean; // = true; 始终显示范围区域
    width: number; // = 48; 宽度
    height: number; // = 48; 高度
    offsetX: number; // = -24; 偏移X
    offsetY: number; // = -24; 偏移Y
    radius: number; // = 24; 半径
    pointArr: DataStructure_point[]; // = [];
    constructor(installCB: Callback) {
        super(installCB);
    }
}
SceneObjectModule.moduleClassArr[4]=SceneObjectModule_4;
/**
 * 场景对象模型：光影
 */
class SceneObjectModule_5 extends SceneObjectModule {
    type: number; // = 0; 类别
    shadowType: number; // = 0; 阴影类型
    shadowStyle: number; // = 0; 阴影样式
    shadowImage: string; // = "asset/image/animation/shadow/shadow1.png";
    shadowOffsetX: number; // = 0; 阴影偏移X
    shadowOffsetY: number; // = 0; 阴影偏移Y
    shadowOpacity: number; // = 0.5; 不透明度
    shadowRotation: number; // = 45; 旋转度
    shadowScale: number; // = 2; 高度
    shadowMinScale: number; // = 0.5; 阴影最小值
    shadowMaxScale: number; // = 5; 阴影最大值
    shadowOpacityFactor: number; // = 3; 不透明度因子
    shadowScaleFactor: number; // = 2; 高度因子
    lightStyleType: number; // = 1; 灯光样式
    lightImage: string; // = "asset/image/animation/light/light2.png"; 灯光图片
    lightAnimation: number; // = 14001; 灯光动画
    lightAnimationScaleX: number; // = 1; 灯光缩放X
    lightAnimationScaleY: number; // = 1; 灯光缩放Y
    lightAnimationRotation: number; // = 0; 灯光旋转度
    lightOpacity: number; // = 1; 灯光不透明度
    lightBlendMode: number; // = 1; 混合模式
    lightBrighten: boolean; // = true; 照亮周围
    lightRange: number; // = 500; 照亮范围
    showLightRange: boolean; // = true; 显示光照范围
    lightShineEnable: boolean; // = false; 闪耀
    lightShineValue: number; // = 0.25; 闪耀幅度
    lightShineTransition: string; // = ""; 闪耀过渡
    groupID: number; // = 1; 分组
    constructor(installCB: Callback) {
        super(installCB);
    }
}
SceneObjectModule.moduleClassArr[5]=SceneObjectModule_5;
/**
 * 场景对象模型：战斗者
 */
class SceneObjectModule_6 extends SceneObjectModule {
    actor: Module_Actor; // = 0; 角色
    inPartyIndex: number; // = -1;
    isDead: boolean; // = false;
    camp: number; // = 0; 阵营
    showPointBar: boolean; // = true; 显示血条
    pointBarOffsetY: number; // = 0; 血条垂直偏移量
    isPeriodicResurrection: boolean; // = false; 自动复活
    periodicResurrectionTime: number; // = 5; 复活时间
    startResurrectionTime: number; // = 0; 记录复活的开始时间
    level: number; // = 1; 等级
    avatarDisplay: number; // = 0; 行走图显示
    pointBar: GUI_1023;
    constructor(installCB: Callback) {
        super(installCB);
    }
}
SceneObjectModule.moduleClassArr[6]=SceneObjectModule_6;
/**
 * 场景对象模型：小地图颜色标识
 */
class SceneObjectModule_7 extends SceneObjectModule {
    enable: boolean; // = true; 可用
    mode: number; // = 0;
    color: string; // = "";
    size: number; // = 1; 体型大小
    icon: string; // = ""; 图标
    constructor(installCB: Callback) {
        super(installCB);
    }
}
SceneObjectModule.moduleClassArr[7]=SceneObjectModule_7;
/**
 * 场景对象模型：任务
 */
class SceneObjectModule_8 extends SceneObjectModule {
    ownMissions: DataStructure_missionAccept[]; // = [];
    constructor(installCB: Callback) {
        super(installCB);
    }
}
SceneObjectModule.moduleClassArr[8]=SceneObjectModule_8;
/**
 * 场景对象模型：任务指示器
 */
class SceneObjectModule_9 extends SceneObjectModule {
    y: number; // = 0;
    x: number; // = 0;
    constructor(installCB: Callback) {
        super(installCB);
    }
}
SceneObjectModule.moduleClassArr[9]=SceneObjectModule_9;
/**
 * 场景对象模型：
 */
class SceneObjectModule_10 extends SceneObjectModule {
    constructor(installCB: Callback) {
        super(installCB);
    }
}
SceneObjectModule.moduleClassArr[10]=SceneObjectModule_10;
/**
 * 场景对象模型：
 */
class SceneObjectModule_11 extends SceneObjectModule {
    constructor(installCB: Callback) {
        super(installCB);
    }
}
SceneObjectModule.moduleClassArr[11]=SceneObjectModule_11;
/**
 * 场景对象模型：显示名称
 */
class SceneObjectModule_12 extends SceneObjectModule {
    color: string; // = "#c78e43"; 颜色
    x: number; // = 0; 水平偏移量
    y: number; // = 0; 垂直偏移量
    字体大小: number; // = 18;
    nameUI: GUI_15023;
    constructor(installCB: Callback) {
        super(installCB);
    }
}
SceneObjectModule.moduleClassArr[12]=SceneObjectModule_12;
