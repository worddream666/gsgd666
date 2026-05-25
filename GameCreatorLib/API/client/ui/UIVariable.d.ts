/**
 * 显示变量组件
 * 可以选定一个变量绑定后即显示该变量的组件，当变量改变时该组件的文本会自动更新
 * 相关事件
 * EventObject.CHANGE 文本改变时
 *
 * [变量系统]在显示时会同步显示数值变量
 *
 * 使用方式：
 * var a = new UIVariable();
 * a.varMode = 0; // 数值变量模式
 * a.varID = 2; // 绑定2号玩家数值变量
 * stage.addChild(a);
 * 
 * var a = new UIVariable();
 * a.varMode = 1; // 二周目数值变量模式
 * a.varID = 2; // 绑定2号二周目数值变量
 * stage.addChild(a);
 *
 * // 事件监听示例
 * a.on(EventObject.CHANGE,this,this.onChange);
 *
 * Created by 黑暗之神KDS on 2018-10-12 14:02:26.
 */
declare class UIVariable extends UIString {
    /**
     * 变量模式 0-数值变量 1-二周目变量
     */
    varMode: number;
    /**
     * 数值变量ID
     */
    varID: string;
}
