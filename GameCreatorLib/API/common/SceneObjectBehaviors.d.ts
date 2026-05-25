/**
 * 对象行为处理器-基类
 * 实现了对象行为的框架，具体行为应配合自定义行为编辑器和子类实现实际作用效果，必须设置implClass以便行为编辑器支持
 * 对象的行为层概念：每添加一组行为即作为新的一层，只有该层执行完毕才会回到上一层继续执行行为（循环的行为无法回到上一层）
 * 需要主动调用update才会执行行为，利用此特性可以制作比如进入战斗后不执行默认的行为，离开战斗后继续执行行为的逻辑
 * 关于自定义行为的制作：
 * 1.可视化制作行为界面：GC编辑器-菜单-自定义编辑器-自定义行为
 * 2.项目层继承此类实现具体行为：比如6号自定义行为，拥有两个参数
 *   private behavior6(a:number,b:number):void{
 *       // 行为实现
 *   }
 *
 * Created by 黑暗之神KDS on 2020-02-20 05:34:43.
 */
declare class SceneObjectBehaviors {
    /**
     * 当前行为层索引变更时派发 EventUtils.happen(this, SceneObjectBehaviors.EVENT_INDEX_CHANGE, [v]);
     * 比如该对象当前的行为组有5个行为，执行完第2个行为后开始执行第3个行为前派发此事件
     * <code>
     * // behavior是SceneObjectBehaviors子类实例
     * // newIndex是新的索引
     * EventUtils.addEventListenerFunction(behavior,SceneObjectBehaviors.EVENT_INDEX_CHANGE,(newIndex:number)=>{
     *   // 逻辑
     * },this);
     * </code>
     */
    static EVENT_INDEX_CHANGE: string;
    /**
     * 实现类，即子类，目前用于行为编辑器能够正确的找到实现类以便实时预览项目层编写的自定义行为
     */
    static implClass: typeof SceneObjectBehaviors;
    /**
     * 执行行为者（可能是执行事件者或触发事件者或者其他指定的对象）
     */
    so: SceneObjectEntity;
    /**
     * 触发事件者
     */
    targetSceneObject: SceneObjectEntity;
    /**
     * 执行事件者（派发行为者）
     */
    executor: SceneObjectEntity;
    /**
     * 行为 对应的方法 对应的参数 默认值=[]
     */
    protected behaviors: [Function, any[]][];
    /**
     * 行为数据：记录原始行为数据，如[[行为1-ID,参数1,参数2],[行为2-ID,参数1,参数2],....]
     */
    protected behaviorData: any;
    /**
     * 当前行为的索引，更改时会派发事件 SceneObjectBehaviors.EVENT_INDEX_CHANGE
     */
    index: number;
    /**
     * 是否循环
     */
    loop: boolean;
    /**
     * [编辑器预览用]是否忽略过程（表示直接跳转到最终结果而不播放过程）
     * 比如行为是从A点移动到B点，而由于行为编辑器中编辑模式下忽略过程直接显示结果的，
     * 所以行为的实现中可以根据ignoreProcess来实现，即：
     * 当ignoreProcess=true时，由A点平滑移动到B点，有播放效果。
     * 当ignoreProcess=false时，直接出现在B点，忽略过程。
     */
    ignoreProcess: boolean;
    /**
     * 逻辑用的暂停标识，比如行为在运动结束前不在执行下一步动作（如配合Game.pause的效果）
     * 实现类可以根据具体的游戏规则重写该属性，以便能够正确的暂停下一步行为执行
     * 如RPG中处于移动中的对象只有等待执行完毕后再继续执行：
     * <code>
     * // 重载为get方法
     * protected get logicPause(): boolean {
     *    return this.so.isMoving ? true : false;
     * }
     * </code>
     */
    protected logicPause: boolean;
    /**
     * 数据转换：将字符串格式的数据转为可使用格式，通常自定义属性中的行为数据需要使用该方法转换后使用
     * @return targetSceneObjectIndex 0-对象 -2玩家 -1当前对象 0-N 指定对象编号
     *         behaviorData 行为数据
     *         loop 是否循环
     *         cover 是否覆盖行为
     *         forceStopLastBehavior 是否强行停止正在执行的行为
     */
    static toBehaviorData(behaviorStr: string): {
        targetSceneObjectIndex: number;
        behaviorData: any[];
        loop: boolean;
        cover: boolean;
        forceStopLastBehavior: boolean;
    };
    /**
     * 构造函数
     * @param so 执行行为的场景对象
     * @param loop 是否循环
     * @param targetSceneObject 事件触发者
     * @param onOver 当行为执行完毕时回调 onOver(soBehavior:SceneObjectBehaviors)
     * @param startIndex [可选] 默认值=0 起始行为索引行
     * @param executor [可选] 默认值=null 事件执行者（也是行为派发者）
     */
    constructor(so: SceneObjectEntity, loop: boolean, targetSceneObject: SceneObject, onOver: Callback, startIndex?: number, executor?: SceneObjectEntity);
    /**
     * 释放函数，当不再使用时调用此函数以便销毁
     */
    dispose(): void;
    /**
     * 设置行为数据并且解析，会将以前的行为全部清空
     * 比如添加3号行为
     * @param behaviorData 行为数据 [[行为1-ID,参数1,参数2],[行为2-ID,参数1,参数2],....]
     * @param delayFrame [可选] 默认值=0 行为内部的需要等待的帧数
     */
    setBehaviors(behaviorData: any[], delayFrame?: number): void;
    /**
     * [编辑器预览用]重置：还原到最初始的状态
     * 仅在行为编辑器预览使用，项目层需要实现行为的重置，以便预览时能够正确显示效果
     * @param defSceneObejct 默认的场景对象
     */
    reset(defSceneObejct: SceneObject): void;
    /**
     * 等待指定帧数后继续执行
     * 如果已处于等待帧的情况下时：当调用update行为的时候会推进一帧
     * @param frame 等待的帧数
     */
    waitFrame(frame: number): void;
    /**
     * 更新行为，需要主动调用该函数才会执行行为，一般情况下每帧调用此函数以便更新对象的行为
     * 利用此特性可以制作一些效果，比如：
     * -- 进入战斗后不执行默认的行为，离开战斗后继续执行行为的逻辑
     * -- 全局暂停时不执行该函数以便停止推进行为
     * @return [boolean] 是否播放结束
     */
    update(): boolean;
}
