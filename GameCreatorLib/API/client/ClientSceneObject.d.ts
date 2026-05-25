/**
 * 场景对象-客户端基类
 * 实际在游戏画面中出现的场景对象类，所有客户端场景对象实现类都继承于该类
 *
 * 【内部的显示层次】
 * -- 动画层：底层 animationLowLayer 使用playAnimation播放的动画比目标效果层更低的层次会添加到这里
 * -- 自定义底层（预设中比行走图低的层，包括行走图） customLayer
 * -- 动画层：高层 animationHighLayer 使用playAnimation播放的动画比目标效果层更高的层次会添加到这里
 * -- 自定义高层（预设中比行走图更高的层次）customHighLayer
 *
 * Created by 黑暗之神KDS on 2018-07-24 02:06:28.
 */
declare class ClientSceneObject extends SceneObjectEntity {
    /**
     * 水平坐标
     */
    protected _x: number;
    /**
     * 垂直坐标
     */
    protected _y: number;
    /**
     * 所属的玩家
     */
    player: ClientPlayer;
    /**
     * 显示对象的根容器，在场景上的场景对象实际上是将该容器添加到场景的显示容器（displayObject）上
     */
    root: GameSprite;
    /**
     * 影子，默认是添加在场景的影子层上，以便比所有对象低
     */
    shadow: GameSprite;
    /**
     * 底层动画层 使用playAnimation播放的动画比目标效果层更低的层次会添加到这里
     */
    animationLowLayer: GameSprite;
    /**
     * 行走图
     */
    avatar: Avatar;
    /**
     * 行走图容器，装载行走图的父节点
     */
    avatarContainer: GameSprite;
    /**
     * 自定义层 预设中比行走图低的层，包括行走图（avatar）
     */
    customLayer: GameSprite;
    /**
     * 高层动画层 使用playAnimation播放的动画比目标效果层更高的层次会添加到这里
     */
    animationHighLayer: GameSprite;
    /**
     * 模型对象预设高层（预设中比行走图更高的层次）
     */
    customHighLayer: GameSprite;
    /**
     * 最高层系统UI层
     */
    systemUILayer: GameSprite;
    /**
     * 所在的场景，在添加到场景时会设置此值，移除时并不会被置空
     */
    scene: ClientScene;
    /**
     * 【编辑器预览用】拖拽对象锁定
     */
    lockDrag: boolean;
    /**
     * 【编辑器预览用】删除对象锁定
     */
    lockDelete: boolean;
    /**
     * 【编辑器预览用】按键移动对象锁定
     */
    lockKeyMove: boolean;
    /**
     * 构造函数
     * @param soData [可选] 默认值=null 场景对象数据
     * @param scene [可选] 默认值=null 场景
     */
    constructor(soData?: SceneObject, scene?: ClientScene);
    /**
     * 释放
     */
    dispose(): void;
    //------------------------------------------------------------------------------------------------------
    // 渲染和刷新
    //------------------------------------------------------------------------------------------------------
    /**
     * 绘制影子，比如当需要缩放影子时调用此函数
     * @param scalePer [可选] 默认值=1.0 缩放率
     */
    drawShadow(scalePer?: number): void;
    /**
     * 刷新影子，更新影子坐标，refreshCoordinate会调用此函数以便更新影子坐标
     */
    protected updateShadow(): void;
    /**
     * 停止渲染，Game.pause 时会自动调用场景中对象的此函数
     * 停止行走图的播放以及所有动画的播放
     * @param stopCurrentFrame [可选] 默认值=false 是否停止在当前帧 true=当前帧 false=初始设定帧
     */
    stopRender(stopCurrentFrame?: boolean): void;
    /**
     * 恢复渲染，Game.pause 时会自动调用场景中对象的此函数
     * 恢复行走图的播放以及所有动画的播放
     * @param continueCurrentFrame [可选] 默认值=false 行走图是否从当前帧开始恢复播放 true=当前帧 false=初始设定帧
     */
    recoveryRender(continueCurrentFrame?: boolean): void;
    /**
     * 进入新的坐标后应调用此函数
     * -- 场景中添加了场景对象后调用了该函数
     * -- 该函数调用了updateShadow，子类重写可实现更多功能
     */
    refreshCoordinate(): void;
    /**
     * 刷新：场景会调用所有场景上面的场景对象的该函数，执行逻辑应由子类实现，该类下此函数无任何代码实现
     * @param nowTime 游戏时间戳（Game.pause会暂停游戏时间戳）
     */
    update(nowTime: number): void;
    //------------------------------------------------------------------------------------------------------
    // 功能和行为
    //------------------------------------------------------------------------------------------------------
    /**
     * 根据动作索引播放动作
     * @return [number]
     */
    actionIndex: number;
    //------------------------------------------------------------------------------------------------------
    // 动画
    //------------------------------------------------------------------------------------------------------
    /**
     * 播放动画，目标对象是行走图
     *
     * @param aniID 动画编号，指定的是动画编辑器预设的编号
     * @param loop 是否循环播放
     * @param isHit 是否显示被击中的效果，动画编辑器支持动画层仅命中时显示，如果设置为true即表示该动画所有层均显示
     * @param fps [可选] 默认值=null 帧率，如果无则使用Config.ANIMATION_FPS
     * @param superposition [可选] 默认值=false 叠加，默认不叠加，即同一个ID播放会重新播放该动画，停止该动画无法使用ID来停止而必须传入Animation对象
     * @param ignoreReplay  [可选] 默认值=false 忽略而非重头播放。默认重头播放，即非叠加时同一个ID播放会重新播放该动画
     * @return [GCAnimation]
     */
    playAnimation(aniID: number, loop: boolean, isHit: boolean, fps?: number, superposition?: boolean, ignoreReplay?: boolean): GCAnimation;
    /**
     * 停止动画
     * @param aniID 动画编号/对象 number | [GCAnimation]
     */
    stopAnimation(aniID: any): void;
    /**
     * 停止所有动画
     */
    stopAllAnimation(): void;
    /**
     * 动画集合
     */
    get animations(): Animation[];
    //------------------------------------------------------------------------------------------------------
    // 显示对象事件，其内部实质是this.root的事件
    //------------------------------------------------------------------------------------------------------
    /**
     * 检查 EventDispatcher 对象是否为特定事件类型注册了任何侦听器。
     * @param	type 事件的类型。
     * @return 如果指定类型的侦听器已注册，则值为 true；否则，值为 false。
     */
    hasListener(type: string): boolean;
    /**
     * 派发事件。
     * @param type	事件类型。
     * @param data	（可选）回调数据。<b>注意：</b>如果是需要传递多个参数 p1,p2,p3,...可以使用数组结构如：[p1,p2,p3,...] ；如果需要回调单个参数 p 是一个数组，则需要使用结构如：[p]，其他的单个参数 p ，可以直接传入参数 p。
     * @return 此事件类型是否有侦听者，如果有侦听者则值为 true，否则值为 false。
     */
    event(type: string, data?: any): boolean;
    /**
     * 使用 EventDispatcher 对象注册指定类型的事件侦听器对象，以使侦听器能够接收事件通知。
     * @param type		事件的类型。
     * @param caller	事件侦听函数的执行域。a
     * @param listener	事件侦听函数。
     * @param args		（可选）事件侦听函数的回调参数。
     * @return 此 EventDispatcher 对象。a
     */
    on(type: string, caller: any, listener: Function, args?: Array<any>): ClientSceneObject;
    /**
     * 使用 EventDispatcher 对象注册指定类型的事件侦听器对象，以使侦听器能够接收事件通知，此侦听事件响应一次后自动移除。
     * @param type		事件的类型。
     * @param caller	事件侦听函数的执行域。
     * @param listener	事件侦听函数。
     * @param args		（可选）事件侦听函数的回调参数。
     * @return 此 EventDispatcher 对象。
     */
    once(type: string, caller: any, listener: Function, args?: Array<any>): ClientSceneObject;
    /**
    * 从 EventDispatcher 对象中删除侦听器。
    * @param type		事件的类型。
    * @param caller	事件侦听函数的执行域。
    * @param listener	事件侦听函数。
    * @param onceOnly	（可选）如果值为 true ,则只移除通过 once 方法添加的侦听器。
    * @return 此 EventDispatcher 对象。
    */
    off(type: string, caller: any, listener: Function, onceOnly?: boolean): ClientSceneObject;
    /**
     * 从 EventDispatcher 对象中删除指定事件类型的所有侦听器。
     * @param type	（可选）事件类型，如果值为 null，则移除本对象所有类型的侦听器。
     * @return 此 EventDispatcher 对象。
     */
    offAll(type?: string): ClientSceneObject;
}
