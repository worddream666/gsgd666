/**
 * 动画组件
 * 封装了动画的界面组件
 *
 * 相关事件
 *  EventObject.LOADED 资源加载完成时候事件
 *  GCAnimation.RENDER  动画播放时派发的事件
 *  GCAnimation.PLAY_START 动画播放开始事件
 *  GCAnimation.PLAY_STOP 动画停止时事件
 *  GCAnimation.PLAY_COMPLETED 动画播放完成时事件
 *  GCAnimation.SIGNAL 信号事件
 *
 * 使用方法：
 * var a = new UIAnimation();
 * a.animationID =5;
 * a.playType = 1;
 * stage.addChild(a);
 *
 * // 事件监听示例
 * a.on(EventObject.LOADED,this,this.onLoaded);
 * a.on(GCAnimation.PLAY_COMPLETED,this,this.onLoaded);
 *
 * 关于鼠标事件点击区域：当注册了鼠标事件后，系统会根据当前帧的实际子显示对象自动判断鼠标可响应区域
 *
 * Created by 黑暗之神KDS、feng on 2019-04-03 17:57:13.
 */
declare class UIAnimation extends UIBase {
    /**
     * 使用的动画编号
     */
    animationID: number;
    /**
     * 播放类型 0-不播放 1-播放一次 2-循环播放 默认值=0
     */
    playType: number;
    /**
     * 水平缩放 1表示100% 默认值=1
     */
    scaleNumberX: number;
    /**
     * 垂直缩放 1表示100% 默认值=1
     */
    scaleNumberY: number;
    /**
     * 禁音模式：播放该动画时忽略音效的播放 默认值=false
     */
    silentMode: boolean;
    /**
     * 是否显示命中效果：编辑器中允许对动画层勾选“仅命中时显示”，开启此项将显示包含仅在命中时出现的动画层
     * 在播放动画前设置此项 默认值=false
     */
    showHitEffect: boolean;
    /**
     * 频率：默认值=Config.ANIMATION_FPS
     */
    playFps: number;
    /**
     * 起始帧：播放时从该帧开始播放 默认值=1
     */
    aniFrame: number;
    /**
     * 获取动画元素
     */
    get animation(): GCAnimation;
    /**
     * 构造函数
     * @param showCircleWhenInEditor [可选] 默认值=true 是否显示圆点当在编辑器内显示时
     */
    constructor(showCircleWhenInEditor?: boolean);
}
