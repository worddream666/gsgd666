/**
 * 下拉框组件
 * 下拉框是一种点击后可弹出一组选项并允许选择一个的组件
 * 相关事件：
 *  EventObject.CHANGE 当改变状态时派发
 *  EventObject.LOADED 加载完成时候事件
 *  UIComboBox.OPEN 当下拉框打开时派发
 *  UIComboBox.CLOSE 当下拉框关闭时派发
 *
 * 使用方法：
 * var a = new UIComboBox();
 * a.bgSkin = "asset/image/picture/control/tab_selected.png";
 * a.itemLabels = "1,2,3,4,5"
 * stage.addChild(a);
 *
 * // 事件监听示例
 * a.on(EventObject.CHANGE,this,this.onChange);
 * a.on(EventObject.LOADED,this,this.onLoaded);
 *
 * Created by 黑暗之神KDS on 2019-11-11 01:13:31.
 */
declare class UIComboBox extends UIBase {
    /**
    * 事件：当下拉框打开时派发事件
    */
    static OPEN: string;
    /**
     * 事件：当下拉框关闭时派发事件
     */
    static CLOSE: string;
    /**
     * 是否打开中
     */
    isComboBoxOpen: boolean;
    /**
     * 显示框的背景图片路径
     */
    bgSkin: string;
    /**
     * 显示框的背景图片九宫格设置 默认值="0,0,0,0,0"
     * 九宫格设置：上边距、右边距、下边距、左边距、是否平铺（1表示平铺）
     * 让素材不再简单拉伸，而是根据九宫格方式进行拉伸
     */
    bgGrid9: string;
    /**
     * 文本水平对齐 0-居左 1-居中 2-居右 默认值=1
     */
    align: number;
    /**
     * 文本垂直对齐 0-居上 1-居中 2-居下 默认值=1
     */
    valign: number;
    /**
     * 文本是否粗体 默认值=false
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
     * 文本字体，默认值是预设的默认字体
     */
    font: string;
    /**
     * 文本颜色 默认值="#FFFFFF"
     */
    color: string;
    /**
     * 文本字体尺寸 默认值=16
     */
    fontSize: number;
    /**
     * 文本水平方向偏移量 默认值=0
     */
    textDx: number;
    /**
     * 文本垂直方向偏移量 默认值=0
     */
    textDy: number;
    /**
     * 当前选中项 默认值=0
     */
    selectedIndex: number;
    /**
     * 当前选中项，不派发 EventObject.CHANGE 事件
     * @param v 选中项值
     */
    setSelectedForce(V: number): void;
    /**
     * 下拉框列表中的文本选项集，格式：1,2,3,4,5 表示5个选项
     */
    itemLabels: string;
    /**
     * 下拉框列表中的单位选项的高度 默认值=20
     */
    itemHeight: number;
    /**
     * 下拉框列表中同时显示的最大选项数 默认值=5
     */
    displayItemSize: number;
    /**
     * 下拉框列表中滚动条背景图片路径 默认值="asset/image/picture/UI/uicomboboxbg.png"
     */
    listScrollBg: string;
    /**
     * 下拉框列表中滚动轴背景图片路径 默认值="asset/image/picture/UI/uicomboboxslider.png"
     */
    listScrollBar: string;
    /**
     * 下拉框列表的背景颜色 默认值="#FFFFFF"
     */
    listBgColor: string;
    /**
     * 下拉框列表的文本水平对齐 0-居左 1-居中 2-居右 默认值=0
     */
    itemAlign: number;
    /**
     * 下拉框列表的垂直水平对齐 0-居上 1-居中 2-居下 默认值=1
     */
    itemValign: number;
    /**
     * 下拉框列表的文本是否粗体 默认值=false
     */
    itemBold: boolean;
    /**
     * 下拉框列表的文本字体，默认值是预设的默认字体
     */
    itemFont: string; 
    /**
     * 下拉框列表的文本颜色 默认值="#000000"
     */
    itemColor: string;
    /**
     * 下拉框列表的选中时的文本颜色 默认值="#FFFFFF"
     */
    itemOverColor: string;
    /**
     * 下拉框列表的选中时的背景文本颜色 默认值="#000000"
     */
    itemOverBgColor: string;
    /**
     * 下拉框列表的文本字体尺寸 默认值=12
     */
    itemFontSize: number;
    /**
     * 下拉框列表的文本水平方向偏移 默认值=0
     */
    itemTextDx: number;
    /**
     * 下拉框列表的文本垂直方向偏移 默认值=0
     */
    itemTextDy: number;
    /**
     * 片段事件内容：当选中项被更改时触发
     * 主动调用方式：CommandPage.startTriggerFragmentEvent
     */
    onChangeFragEvent: string;
}
