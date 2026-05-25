/**
 * 动画 显示对象
 * -- 支持绑定目标，可以区分动画层添加到目标层的上方或下方
 * -- 目标效果支持叠加
 *
 * 使用方法：
 * var a = new GCAnimation();
 * a.id = 5;
 * stage.addChild(a);
 *
 * 绑定目标,由于可以区分添加到目标层的上方或下方，需要有lowLayer和highLayer
 * var a = new GCAnimation();
 * a.id = 5;
 * a.addToGameSprite(target,lowLayer,highLayer);
 *
 * 相关事件
 *  EventObject.LOADED 资源加载完成时候事件
 *  GCAnimation.RENDER  动画播放时派发的事件
 *  GCAnimation.PLAY_START 动画播放开始事件
 *  GCAnimation.PLAY_STOP 动画停止时事件
 *  GCAnimation.PLAY_COMPLETED 动画播放完成时事件
 *  GCAnimation.SIGNAL 信号事件
 *
 * 关于鼠标事件点击区域：当注册了鼠标事件后，系统会根据当前帧的实际子显示对象自动判断鼠标可响应区域
 *
 * Created by 黑暗之神KDS、feng on 2019-02-22 11:36:06.
 */
declare class GCAnimation extends GameSprite {
    /**
     * 事件：执行 onRender 时派发的事件
     * <code>
     * var ani = new GCAnimation();
     * ani.id = 1;
     * ani.on(GCAnimation.RENDER,this,()=>{
     *     // to do
     * });
     * </code>
     */
    static RENDER: string;
    /**
     * 事件：动画播放开始事件
     * <code>
     * var ani = new GCAnimation();
     * ani.id = 1;
     * ani.on(GCAnimation.PLAY_START,this,()=>{
     *     // to do
     * });
     * </code>
     */
    static PLAY_START: string;
    /**
     * 事件：动画停止时事件
     * <code>
     * var ani = new GCAnimation();
     * ani.id = 1;
     * ani.on(GCAnimation.PLAY_STOP,this,()=>{
     *     // to do
     * });
     * </code>
     */
    static PLAY_STOP: string;
    /**
     * 事件：动画播放完成事件，非循环播放的动画播放完毕后派发
     * <code>
     * var ani = new GCAnimation();
     * ani.id = 1;
     * ani.on(GCAnimation.PLAY_COMPLETED,this,()=>{
     *     // to do
     * });
     * </code>
     */
    static PLAY_COMPLETED: string;
    /**
     * 事件：信号事件
     * 动画编辑器中可以自定义信号，设定经过哪个关键帧后抛出
     * <code>
     * var ani = new GCAnimation();
     * ani.id = 1;
     * ani.on(GCAnimation.SIGNAL,this,(signalID:number)=>{
     *     // to do
     * });
     * </code>
     */
    static SIGNAL: string;
    /**
     * 动画ID
     */
    id: number;
    /**
     * 是否同步加载，当资源存在时，当前帧则立刻显示
     * 为了确保能够监听到EventObject.LOADED事件，建议在设置id之前监听该事件
     */
    syncLoadWhenAssetExist: boolean;
    /**
     * 预渲染：开启此项保证在派发EventObject.LOADED前预先渲染一次以便保证此后能够立即呈现画面，不会因为资源较大而首次渲染卡顿一下
     *        预渲染会消耗一定的性能，可以选择在动画资源较大较多的情况下使用此项，开启此项会有额外的性能和内存开销
     */
    prerender: boolean;
    /**
     * 频率，默认值=Config.ANIMATION_FPS
     */
    fps: number;
    /**
     * 禁音模式：播放该动画时忽略音效的播放 默认值=false
     */
    silentMode: boolean;
    /**
     * 绑定场景对象，会根据该对象与镜头中心点的距离影响声音更大
     */
    sceneObject: ClientSceneObject;
    /**
     * 水平偏移量，如果存在的话则水平偏移offsetX像素
     */
    offsetX: number;
    /**
     * 垂直偏移量，如果存在的话则水平偏移offsetY像素
     */
    offsetY: number;
    /**
     * 预设层：比目标层更低的层次
     */
    preAnimationLowLayers: GameSprite[];
    /**
     * 预设层：比目标层更高的层次
     */
    preAnimationHighLayers: GameSprite[];
    /**
     * 是否显示命中效果：编辑器中允许对动画层勾选“仅命中时显示”，开启此项将显示包含仅在命中时出现的动画层
     * 在播放动画前设置此项
     */
    showHitEffect: boolean;
    /**
     * 当前帧：获取和设置当前帧
     */
    currentFrame: number;
    /**
     * 当前播放的动画是否循环 默认值=false
     */
    loop: boolean;
    /**
     * 是否正在播放中
     */
    get isPlaying(): boolean;
    /**
     * 获取是否处于加载中
     */
    get isLoading(): boolean;
    /**
     * 目标对象：动画的目标效果的作用目标。
     * 如果需要一部分动画层在目标下方，一部分动画层在目标上方，则可以使用 addToGameSprite 方法
     */
    target: GameSprite;
    /**
     * 动画总帧数
     */
    get totalFrame(): number;
    /**
     * 是否是粒子动画
     */
    get isParticle(): boolean;
    /**
     * 辅助体
     */
    get refObjs(): {
        [id: number]: Helper[];
    }
    /**
     * 添加到显示对象，同时可以将一部分动画层在目标下方显示，一部分动画层在目标上方显示，并支持目标效果
     * @param target 目标对象
     * @param lowLayer 动画底层（动画编辑器中低于目标层的显示层次会添加到这里）
     * @param highLayer 动画高层（动画编辑器中高于目标层的显示层次会添加到这里）
     */
    addToGameSprite(target: GameSprite, lowLayer: Sprite, highLayer: Sprite): void;
    /**
     * 移除动画绑定，addToGameSprite后可使用该函数进行清理
     */
    removeFromGameSprite(): void;
    /**
     * 跳转某帧进行播放，越界会自动取模（如帧长度10，播放13则是播放3）
     * @frame [可选] 默认值=1 跳转到指定的帧数 单位：帧 默认从头开始
     */
    gotoAndPlay(frame?: number): void;
    /**
     * 在当前帧数开始播放
     */
    play(): void;
    /**
     * 停止动画
     * @param frame [可选] 默认值=1 帧动画的情况指定停留的帧数
     */
    stop(frame?: number): void;
}
