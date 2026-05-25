/**
 * 可输入文本组件
 * 可输入文本是一个用于让用户输入文本的组件
 * 相关事件：
 * EventObject.ENTER 按下ENTER键时
 * EventObject.INPUT 输入文本时
 * EventObject.CHANGE 文本改变时
 * EventObject.FOCUS 产生焦点时
 * EventObject.BLUR 失去焦点时
 *
 * 使用方法：
 * var a = new UIInput();
 * a.color = "#FF0000"
 * a.text = "请输入"
 * stage.addChild(a);
 *
 * // 事件监听示例
 * a.on(EventObject.ENTER,this,this.onInput);
 *
 * Created by 黑暗之神KDS on 2019-04-14 17:43:32.
 */
declare class UIInput extends UIString {
    /**
     * 文本输入模式 0-文本模式 1-密码模式 2-数字模式 3-多行文本 默认值=0
     */
    inputMode: number;
    /**
     * 限制输入字符串 如0-9A-Za-z 则表示只能输入数字和字母（正则表达式）
     */
    restrict: string;
    /**
     * 用于产生焦点或失去焦点
     */
    focus: boolean;
    /**
     * 最大可输入字符数 默认值=99999
     */
    maxChars: number;
    /**
     * 选中全部文字
     */
    select(): void;
    /**
     * 选中指定索引区间内的文字
     * @param startIndex 起始索引
     * @param endIndex 结束索引
     */
    setSelection(startIndex: number, endIndex: number): void;
    /**
     * 片段事件内容：当输入文本时触发
     * 主动调用方式：CommandPage.startTriggerFragmentEvent
     */
    onInputFragEvent: string;
    /**
     * 片段事件内容：当按下回车时确定时触发
     * 主动调用方式：CommandPage.startTriggerFragmentEvent
     */
    onEnterFragEvent: string;
}
