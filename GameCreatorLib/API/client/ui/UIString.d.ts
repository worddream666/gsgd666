/**
 * 文本组件
 * 显示文本的组件，支持绑定玩家字符串变量
 *
 * 相关事件
 * EventObject.CHANGE 文本改变时
 * [变量系统]在显示时会自动同步显示字符串变量
 *
 * 使用方法：
 * var a = new UIString();
 * a.text = "kds"; // 固定的文本
 * a.text = "$6"; // 绑定6号玩家字符串变量
 * a.text = "@6"; // 绑定6号二周目字符串变量
 * stage.addChild(a);
 *
 * // 事件监听示例
 * a.on(EventObject.CHANGE,this,this.onChange);
 *
 * Created by 黑暗之神KDS on 2018-10-12 14:01:57.
 */
declare class UIString extends UIBase {
    /**
     * 文本内容 $6 表示使用6号玩家字符串变量 @6 表示使用6号二周目字符串变量
     */
    text: string;
    /**
     * 设置文本（不派发EventObject.CHANGE事件）
     * @param v 文本内容 $6 表示使用6号玩家字符串变量 @6 表示使用6号二周目字符串变量
     */
    setTextForce(v: string): void;
    /**
     * 字体大小 默认值=16
     */
    fontSize: number;
    /**
     * 字体颜色 默认值="#000000"
     */
    color: string;
    /**
     * 粗体 默认值=false
     */
    bold: boolean;
    /**
     * 斜体 默认值=false
     */
    italic: boolean;
    /**
     * 平滑 默认值=false
     */
    smooth: boolean;
    /**
     * 行间距 默认值=0
     */
    leading: number;
    /**
     * 字间距 默认值=0
     */
    letterSpacing: number;
    /**
     * 字体，默认是预设的默认字体
     */
    font: string;
    /**
     * 是否自动换行 默认值=true
     */
    wordWrap: boolean;
    /**
     * 文本超出时处理方式 0-显示 1-隐藏 默认值=0
     */
    overflow: number;
    /**
     * 横向对齐方式 0-左对齐 1-中对齐 2-右对齐 默认值=0
     */
    align: number;
    /**
     * 垂直对齐方式 0-上对齐 1-中对齐 2-右对齐 默认值=0
     */
    valign: number;
    /**
     * 是否开启阴影
     */
    shadowEnabled: boolean;
    /**
     * 阴影颜色 默认值="#000000"
     */
    shadowColor: string;
    /**
     * 阴影水平偏移量（像素）默认值=1
     */
    shadowDx: number;
    /**
     * 阴影垂直偏移量（像素）默认值=1
     */
    shadowDy: number;
    /**
     * 描边像素尺寸：如果效果不理想可以使用大号字体和粗体的配合，或者尝试别的字体 默认值=0
     */
    stroke: number;
    /**
     * 描边颜色，当描边像素尺寸不为0时显示 默认值="#000000"
     */
    strokeColor: string;
    /**
     * 获取实际文本内容宽度
     */
    get textWidth(): number;
    /**
     * 获取实际文本内容高度
     */
    get textHeight(): number;
    /**
    * 获取实际文本内容长度
    */
    get textLength(): number;
    /**
     * 片段事件内容：当更改文本时触发
     * 主动调用方式：CommandPage.startTriggerFragmentEvent
     */
    onChangeFragEvent: string;
}
