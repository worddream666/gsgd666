/**
 * 事件页
 * 包含该事件页下的所有指令行（[Command]）
 * 相关类：[Command]、[CommandPage]、[CommandTrigger]
 *
 * Created by 黑暗之神KDS on 2018-10-09 16:37:07.
 */
declare class CommandPage {
    /**
     * 唯一ID
     */
    id: number;
    /**
     * 指令对象集合 默认值=[]
     */
    commands: Command[];
    /**
     * 开始触发事件（首次）如果已在执行中则会自动忽略
     * @param trigger 事件触发器
     * @param playerInput [可选] 默认值=[] 玩家提交的自定义输入信息
     */
    startTriggerEvent(trigger: CommandTrigger, playerInput?: any[]): void;
    /**
     * 执行事件，一般用于制作自定义指令时中途暂停了事件执行后恢复事件执行
     * @param trigger 事件触发器
     * @param playerInput [可选] 默认值=[] 玩家提交的自定义输入信息
     */
    static executeEvent(trigger: CommandTrigger, playerInput?: any[]): void;
    /**
     * 开始执行片段事件
     * 该片段事件事件会启动一条单独的触发线独立运作，并支持跨场景（必须触发者是玩家的场景对象），直到其执行完毕。
     * @param feData 片段事件数据
     * @param trigger 触发者-场景对象
     * @param execute 执行者-场景对象
     * @param onCommandExecuteOver [可选] 默认值=null 当指令执行完毕时回调
     * @return [CommandTrigger] 触发器
     */
    static startTriggerFragmentEvent(feData: string, trigger: SceneObjectEntity, execute: SceneObjectEntity, onCommandExecuteOver?: Callback): CommandTrigger;
}
