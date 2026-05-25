/**
 * 游戏世界-客户端
 * 拥有特性：
 * -- 自定义世界属性：编辑器支持自定义设置世界属性，在这里通过ClientWorld.data访问
 * -- 访问全局变量（单机版内核表示二周目变量，网络版表示全体玩家公共的变量）
 * -- 单机内核对于事件库、全界面事件的管理
 * Created by 黑暗之神KDS on 2019-06-02 22:49:26.
 */
declare class ClientWorld {
    /**
     * 事件：引擎初始化完毕（仅限于游戏运行时）默认值="ClientMain_EVENT_INITED"
     */
    static EVENT_INITED: string;
    /**
     * 事件：行为编辑器预览端初始化完毕 默认值="BehaviorViewClientWorldInited"
     */
    static EVENT_BEHAVIOR_VIEW_INITED: string;
    /**
     * 世界自定义数据
     */
    static data: typeof WorldData;
    /**
     * 全局变量
     */
    static variable: Variable;
    /**
     * 监听当全局变量的改变时
     * <code>
     * // 监听2号全局数值变量
     * ClientWorld.addListenerVariable(0, 2, Callback.New((type: number, varID: number, value: number) => {
     *    // to do
     * }, this));
     * </code>
     * @param type 0-变量 1-开关 2-字符串
     * @param onChange onChange(type:number,varID:number,value:number|string);
     */
    static addListenerVariable(type: number, varID: number, onChange: Callback): void;
    /**
     * 取消监听：当全局变量改变时
     * <code>
     * // 监听2号全局数值变量
     * var cb = Callback.New((type: number, varID: number, value: number) => {
     *    // to do
     * }, this)
     * // 取消监听
     * ClientWorld.addListenerVariable(0, 2, cb);
     * </code>
     * @param type 0-变量 1-开关 2-字符串
     * @param onChange
     */
    static removeListenerVariable(type: number, varID: number, onChange: Callback): void;
    /**
     * 事件库的事件集
     */
    static commonEventPages: CommandPage[];
    /**
     * 界面自定义事件集 id-CommandPage 0~N
     * 比如界面拥有点击事件、鼠标悬停事件，那么同一个控件支持两个事件页 默认值={}
     */
    static uiCustomCommandPages: {
        [id: string]: CommandPage[];
    };
}
