/**
 * 游戏客户端指令处理
 * 主要功能：
 * -- 用于配合自定义指令的制作
 * -- 触发事件：场景事件、场景对象事件、界面事件、独立的事件库事件（而片段事件的触发参考[CommandPage]）
 * -- 提交玩家的输入
 *
 * Created by 黑暗之神KDS on 2019-01-12 08:01:14.
 */
declare class GameCommand {
    /**
     * 指令状态：继续
     */
    static COMMAND_STATE_CONTINUE: number;
    /**
     * 指令状态：终止
     */
    static COMMAND_STATE_STOP: number;
    /**
     * 指令状态：需要玩家输入
     */
    static COMMAND_STATE_NEED_INPUT: number;
    /**
     * 是否玩家输入中
     */
    static isNeedPlayerInput: boolean;
    /**
     * 当前需要输入的触发线ID
     */
    static inputTriggerLine: number;
    /**
     * 启动
     * 一般自定义指令返回COMMAND_STATE_STOP后可以主动调用start重新启动
     * 比如网络内核中为了优化，事件中的等待支持了客户端等待，其实现就是先COMMAND_STATE_STOP，然后等待N帧后调用此方法继续执行事件
     * @param triggerLineID [可选] 默认值=null 触发线：当存在时则仅停止该触发线的事件执行，否则停止全部
     */
    static start(triggerLineID?: number): void;
    /**
     * [场景-事件] 主动开始触发该事件
     * @param indexType 事件类别，0~N 对应自定义的场景中的事件类别
     * @param inputMessage [可选] 默认值=null 玩家输入值（等同调用事件时传递的参数）
     * @param onCommandExecuteOver [可选] 默认值=null 当指令执行完毕时回调
     * @return 是否触发执行成功
     */
    static startSceneCommand(indexType: number, inputMessage?: any[], onCommandExecuteOver?: Callback): boolean;
    /**
     * [场景对象-事件] 主动开始新触发该事件
     * @param sceneObjectIndex 场景对象索引（sceneObject.index）
     * @param indexType 事件类别，0~N 对应自定义的场景对象中的事件类别
     * @param inputMessage [可选] 默认值=null 玩家输入值（等同调用事件时传递的参数）
     * @param onCommandExecuteOver [可选] 默认值=null 当指令执行完毕时回调
     * @param triggerSceneObject [可选] 默认值=null 触发事件的对象，null则表示玩家的场景对象作为触发事件者
     * @return 是否触发执行成功
     */
    static startSceneObjectCommand(sceneObjectIndex: number, indexType: number, inputMessage?: any[], onCommandExecuteOver?: Callback, triggerSceneObject?: ClientSceneObject): boolean;
    /**
     * [界面-事件] 主动开始执行
     * @param comp 组件，比如界面中的某个按钮
     * @param indexType 子事件类别，0~N 对应UI的对象中的事件类别
     * @param inputMessage [可选] 默认值=null 玩家输入值（等同调用事件时传递的参数）
     * @param onCommandExecuteOver [可选] 默认值=null 当指令执行完毕时回调
     * @return 是否触发执行成功
     */
    static startUICommand(comp: UIBase, indexType: number, inputMessage?: any[], onCommandExecuteOver?: Callback): boolean;
    /**
     * [独立事件-事件库事件] 主动开始执行
     * 独立事件会启动一条单独的触发线独立运作，并支持跨场景，直到其执行完毕。
     * @param id 事件库事件的ID
     * @param inputMessage [可选] 默认值=null 玩家输入值（等同调用事件时传递的参数）
     * @param onCommandExecuteOver [可选] 默认值=null 当指令执行完毕时回调
     * @param triggerSceneObject [可选] 默认值=null 触发事件者，如果为null则表示玩家的场景对象
     * @param executorSceneObject [可选] 默认值=null 执行事件者，如果为null则表示玩家的场景对象
     */
    static startCommonCommand(id: number, inputMessage?: any[], onCommandExecuteOver?: Callback, triggerSceneObject?: ClientSceneObject, executorSceneObject?: ClientSceneObject): void;
    /**
     * 输入信息并继续执行下去，事件页的等待玩家输入，将接收到输入的参数。
     * 可以制作如输入名字、密码、QTE系统等等
     * 事件页制作流程：
     *  -- 比如通过调用脚本的方式：inputMessageAndContinueExecute([123]);
     *  -- 事件：等待玩家输入
     *  -- 事件：可以通过变量赋值=玩家输入值  或  文本中显示玩家输入值等等来接收
     * @param inputMessage [可选] 默认值=null 输入的信息
     * @param force [可选] 默认值=false 是否强制模式（非强制模式只有客户端判定需要输入时才发送）
     * @param delayFrame [可选] 默认值=1 延迟多少帧发送
     * @param triggerLineID [可选] 默认值=-1 表示将信息提交到指定的触发器线上，-1表示默认是GameCommand.inputTriggerLine,即当前系统等待玩家输入的触发线
     */
    static inputMessageAndContinueExecute(inputMessage?: any[], force?: boolean, delayFrame?: number, triggerLineID?: number): void;
}
