/**
 * 客户端玩家类
 * 每个玩家只有唯一的玩家类实例，可能是该类或其子类的实例（单机版有且只有一个玩家，所以只有一个实例）
 * 单机版内核直接监听本地变量的改变
 * 网络版内核的监听是通过RPC请求服务器监听变量，服务器每次发现变量改变后会同步给该玩家的客户端
 *   -- 没有权限监听其他玩家的变量
 *
 * Created by 黑暗之神KDS on 2019-06-03 18:56:43.
 */
declare class ClientPlayer extends Player {
    /**
     * 构造函数
     * @param isMyPlayer [可选] 默认值=false 是否是我的玩家（网络内核会存在其他的玩家）
     */
    constructor(isMyPlayer?: boolean);
    /**
     * 监听玩家变量
     * 单机版内核：直接监听本地变量的改变
     * 网络版内核：该变量首次监听时会与服务器-该编号的变量同步，其他非首次的监听直接来自客户端缓存
     * <code>
     * // 示例：监听我的玩家的10号数值变量，由于确定是数值变量，所以这里回调使用value:number确定是数值类型
     * Game.player.addListenerPlayerVariable(0,10,Callback.New((typeID:number,varID:number,value:number)=>{
     *    // to do
     * },this))
     * </code>
     * @param type 0-变量 1-开关 2-字符串
     * @param varID 变量ID
     * @param onChange 当变量改变时回调 onChange(typeID:number,varID:number,value:number|string)
     * @param isOnce [可选] 默认值=false 是否只监听一次
     * @param immediatelyCallback [可选] 默认值=true 是否当前立刻回调一次，否则在下次该变量的值更改时才收到回调事件
     */
    addListenerPlayerVariable(type: number, varID: number, onChange: Callback, isOnce?: boolean, immediatelyCallback?: boolean): void;
    /**
     * 取消监听玩家变量
     * 单机版内核：直接取消监听本地变量的改变
     * 网络版内核：当所有监听该编号的变量都取消了的话则通知服务器-取消该编号变量的监听同步，当该变量改变时将不会发送给客户端同步消息
     * @param type 0-变量 1-开关 2-字符串
     * @param varID 变量ID
     * @param onChange 当变量改变时的回调，必须传入监听玩家变量时的这个回调才能够取消
     */
    removeListenerPlayerVariable(type: number, varID: number, onChange: Callback): void;
}
