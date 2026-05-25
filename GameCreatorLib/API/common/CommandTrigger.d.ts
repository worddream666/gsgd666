/**
 * 事件触发器
 * 触发器用于触发事件，总是绑定在场景对象身上的，并且由某个对象触发并由某个对象执行（即触发者和执行者）
 * 触发器的主种类分为：场景的触发器、场景对象的触发器、界面控件的触发器、事件库触发器（独立）、独立事件片段触发器
 * 支持同一时间内多个触发器同时执行事件
 * 支持自定义触发器，比如场景的进入事件、界面控件的点击事件等
 * 支持暂停执行事件以及暂停等待的时间推进
 * 支持多线模式：不用等待该事件执行完毕也仍然可以再次执行该事件
 * 支持接收玩家的自定义参数输入（如制作等待玩家输入名字、等待玩家输入密码、QTE等功能）
 * 跨场景执行：部分触发器可以跨场景执行，并不会因为更换场景而终止，满足以下条件即可：
 *   -- 触发者和执行者都是玩家的场景对象（如界面控件的点击事件）
 * 读档后会恢复全部正在执行的事件（如读档前A事件执行到第3行，那么读档后A事件从第4行开始执行）
 *
 * 相关类：[Command]、[CommandPage]、[CommandTrigger]
 *
 * Created by 黑暗之神KDS on 2018-10-11 20:48:57.
 */
declare class CommandTrigger {
    /**
     * 执行开始事件：当触发器开始执行时派发的一个事件（Event）
     * <code>
     * // trigger = [CommandTrigger] 触发器
     * EventUtils.addEventListenerFunction(trigger, CommandTrigger.EVENT_START, ()=>{
     *       // to do
     * }, this);
     * </code>
     */
    static EVENT_START: string;
    /**
     * 执行结束事件：当触发器执行结束时派发的一个事件（Event）
     * <code>
     * // trigger = [CommandTrigger] 触发器
     * EventUtils.addEventListenerFunction(trigger, CommandTrigger.EVENT_OVER, ()=>{
     *       // to do
     * }, this);
     * </code>
     */
    static EVENT_OVER: string;
    /**
     * 该触发器此前派发的对象行为事件执行完毕时事件：（同指令中的[等待行为结束]）
     * <code>
     * // trigger = [CommandTrigger] 触发器
     * EventUtils.addEventListenerFunction(trigger, CommandTrigger.EVENT_BEHAVIOR_OVER, ()=>{
     *       // to do
     * }, this);
     * </code>
     */
    static EVENT_BEHAVIOR_OVER: string;
    /**
     * 枚举-事件主类别：场景相关的事件类别 默认值=0
     */
    static COMMAND_MAIN_TYPE_SCENE: number;
    /**
     * 枚举-事件主类别：场景对象相关的事件类别 默认值=1
     */
    static COMMAND_MAIN_TYPE_SCENE_OBJECT: number;
    /**
     * 枚举-事件主类别：界面相关的事件类别 默认值=2
     */
    static COMMAND_MAIN_TYPE_UI: number;
    /**
     * 枚举-事件主类别：独立的事件库事件的事件类别 默认值=3
     */
    static COMMAND_MAIN_TYPE_CALL_COMMON_EVENT: number;
    /**
     * 枚举-事件主类别：片段事件的事件类别 默认值=4
     */
    static COMMAND_MAIN_TYPE_FRAGMENT_EVENT: number;
    /**
     * 唯一ID，触发线（TriggerLineID）对应的就是触发器的ID
     */
    id: number;
    /**
     * 触发器主类型 对应CommandTrigger::COMMAND_MAIN_TYPE_XXXXX
     * 如：这是一个场景对象相关的事件
     */
    mainType: number;
    /**
     * 触发器子类型 主类型下的子类型
     * 如：这是一个场景对象的“点击事件”
     */
    indexType: number;
    /**
     * 记录对应事件来源
     * 0-场景：无
     * 1-场景对象：对象index
     * 2-界面：sid唯一随机ID
     * 3-事件库：事件库事件的ID
     * 4-事件页片段：sid唯一随机ID
     */
    from: any;
    /**
     * 是否多线模式：表示该触发器是每次生成的一个新触发器，独立运行
     * 比如：界面中控件的点击事件是一个每次点击都会执行一个循环事件-在10秒内每秒增加1号数值变量20点，
     *       则玩家点击N次，每次事件需要10秒才能执行结束。
     *       如果开启了多线模式：无需等待上一个10秒事件，启动一个新的10秒事件（会同时执行）
     *       如果关闭了多线模式：需要等待上一个10秒事件执行完毕，才能生效，否则此次点击忽略。
     */
    multiline: boolean;
    /**
     * 所在的场景，此处一般指当前游戏场景
     */
    scene: ClientScene;
    /**
     * 触发事件的场景对象（事件触发者）
     * 如RPG游戏中，玩家点击NPC时，玩家的场景对象是触发者
     */
    trigger: SceneObjectEntity;
    /**
     * 执行事件的目标（事件执行者）
     * 如RPG游戏中，玩家点击NPC时，NPC是执行者
     */
    executor: SceneObjectEntity;
    /**
     * 暂停指令继续推进：暂停执行标记，表示事件暂时停止执行
     * 同时指令停止了指令的索引推进，停留在当前行，如果继续执行的话，仍然是当前行指令执行，
     * 所以一般情况下可以调用offset方法偏移指令行，也可以通过玩家提交输入的信息来区分同一个指令下的不同状态
     */
    pause: boolean;
    /**
     * 是否暂停【等待】指令继续执行（在等待中也会暂停，而恢复后会等待剩余的时间/帧数）
     * 一般用于制作需要主动暂停某些事件，比如RPG模板中场景中的某些事件遇到Game.pause时暂停了，
     * 以便打开战斗场景进入“另一个空间”战斗结束后恢复暂停。
     */
    delayPause: boolean;
    /**
     * 中断执行标记，表示事件指令该作用域中断了，返回到上一层作用域继续执行（如若已经是顶层则事件指令执行完毕）
     * 如系统指令-[中断指令执行]则设置该参数为true，表示当前层的事件后续不再执行
     */
    cmdReturn: boolean;
    /**
     * 玩家提交输入值 默认值=[]
     * 一般配合系统指令-[等待玩家输入]一并使用（当然自定义的等待同样有效）
     * 客户端通过[GameCommand]的inputMessageAndContinueExecute方法来提交玩家的输入信息
     * 比如制作等待玩家鼠标点击屏幕，然后通过提交鼠标位置信息给事件接收，以便获取信息后执行逻辑 
     */
    inputMessage: any[];
    /**
     * 获取触发事件的玩家，单机版只有当前的唯一玩家
     * @return [Player]
     */
    get triggerPlayer(): Player;
    /**
     * 偏移指令行
     * @param value 偏移量时
     */
    offset(value: number): void;
    /**
     * 等待指定帧数后继续执行指令
     * @param frame 等待的帧数
     */
    waitFrame(frame: number): void;
    /**
     * 等待指定时间后继续执行
     * @param time 等待的时间，单位：毫秒
     */
    waitTime(time: number): void;
    /**
     * 添加对象行为组
     * 对象身上每次添加对象行为组时都会新增一层行为，只有当这一层执行完毕后才会回到上一层继续执行
     * 比如A对象默认行为是123，在执行完1时添加了新的行为组456，此时执行完456后回到第一层继续执行23，所以总顺序应是：1-4-5-6-2-3
     * @param targetSo 目标对象（行为执行者）
     * @param behaviorData 行为数据 [[行为1-ID,参数1,参数2],[行为2-ID,参数1,参数2],....]
     * 由于行为是自定义的，具体行为的作用请参考游戏的模板高级制作者可以在：GameCreator编辑器菜单-自定义编辑器-自定义行为中配合脚本来编辑行为
     *
     * @param loop 是否循环，一旦循环执行则会无限在该层循环，除非再添加一层新的行为组
     * @param targetSceneObject 事件触发者
     * @param cover 是否覆盖，一旦覆盖则将此前的行为组清空（连同其默认的行为）
     * @param startIndex [可选] 默认值=0 该行为组的开始播放的行为索引，默认0，表示从最开头开始播放
     * @param Immediate [可选] 默认值=true 是否立即刷新，否则会等待下一帧才刷新
     * @param forceStopLastBehavior [可选] 默认值=false 是否强制停止正在执行的行为，由项目层实现，以便当前行为组能够立即执行
     * @param delayFrame [可选] 默认值=0 行为内部的需要等待的帧数
     * @param executor [可选] 默认值=null 执行事件者（也是行为派发者）
     */
    addBehavior(targetSo: SceneObjectEntity, behaviorData: any[], loop: boolean, targetSceneObject: SceneObject, cover: boolean, startIndex?: number, Immediate?: boolean, forceStopLastBehavior?: boolean, delayFrame?: number, executor?: SceneObjectEntity): void;
    /**
     * 该触发器是否还有派发出去仍未执行完毕的行为
     * 一个触发器可以同时派发多个对象行为事件，比如让A执行123，让B执行456，
     * 当所有派发出去的行为执行完毕后该属性才返回false（或者当前没有派发任何对象行为的事件）。
     */
    get hasBehavior(): boolean;
    /**
     * 调用事件库事件时追加层级，在当前的触发器中追加执行指定的事件库的事件，在事件库事件执行完毕后会回到原来的事件中继续接着执行
     * 一般用于在指令执行中追加调用事件库的事件
     * @param commonEventID 事件库的事件ID
     */
    addCommonEventCommandPageLayer(commonEventID: number): void;
    /**
     * 追加片段事件层级，在当前的触发器中追加执行片段事件，在该片段事件执行完毕后会回到原来的事件中继续接着执行
     * 一般用于在指令执行中追加事件片段
     * @param feData 片段事件数据
     */
    addFragmentEventCommandPageLayer(feData: string): void;
}
