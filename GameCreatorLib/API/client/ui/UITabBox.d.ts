/**
 * 标签栏组件
 * 用于显示标签栏的一种组件，支持横向排列的标签和纵向排列的标签
 * 在编辑器中的使用方法：如果标签组件中有N个标签的话，那么该组件的子对象放3个即可自动切换显示
 *
 * 相关事件：
 *  EventObject.CHANGE 当改变状态时派发
 *  EventObject.LOADED 加载完成时候事件
 *
 * 使用方式：
 * var a = new UITabBox();
 * a.itemWidth = 100;
 * a.itemHeight = 20;
 * a.itemImage1 = "asset/image/picture/control/tab_unselected.png";
 * a.itemImage2 = "asset/image/picture/control/tab_selected.png";
 * a.items = "标签1,标签2";
 * stage.addChild(a);
 *
 * // 添加两张图片，分别对应两个标签
 * var img1 = new UIBitmap;
 * img1.image = "asset/image/image1.png";
 * a.addChild(img1);
 * img1.y = 20;
 *
 * var img2 = new UIBitmap;
 * img2.image = "asset/image/image2.png";
 * a.addChild(img2);
 * img2.y = 20;
 *
 * // 事件监听示例
 * a.on(EventObject.LOADED,this,this.onLoaded);
 *
 * Created by 黑暗之神KDS on 2019-04-14 22:31:21.
 */
declare class UITabBox extends UIBase {
    /**
     * 选中项 默认值=-1
     */
    selectedIndex: number;
    /**
     * 设置选中项，不派发EventObject.CHANGE事件
     */
    setSelectedForce(v: number): void;
    /**
     * 标签项 逗号隔开
     */
    items: string;
    /**
     * 项总数
     */
    get length(): number;
    /**
     * 标签项选中时的图片样式
     */
    itemImage1: string;
    /**
     * 标签项移入时的图片样式
     */
    itemImage2: string;
    /**
     * 排列为行的模式 默认值=false
     */
    rowMode: boolean;
    /**
     * 标签项长度 默认值=177
     */
    itemWidth: number;
    /**
     * 标签项高度 默认值=71
     */
    itemHeight: number;
    /**
     * 标签项间距 默认值=5
     */
    spacing: number;
    /**
     * 标签水平偏移 默认值=0
     */
    labelDx: number;
    /**
     * 标签垂直偏移 默认值=0
     */
    labelDy: number;
    /**
     * 文本颜色 标签项选中时 默认值="#FFFFFF"
     */
    labelSelectedColor: string;
    /**
     * 文本颜色 标签项未选中时 默认值="#666666"
     */
    labelColor: string;
    /**
     * 文本字体大小 默认值=16
     */
    labelSize: number;
    /**
     * 文本字体，默认是预设的默认字体
     */
    labelFont: string;
    /**
     * 文本字体对齐模式 0-居左 1-居中 2-居右 默认值=1
     */
    labelAlign: number;
    /**
     * 文本字体粗体模式 默认值=false
     */
    labelBold: boolean;
    /**
     * 斜体 默认值=false
     */
    labelItalic: boolean;
    /**
     * 平滑 默认值=false
     */
    smooth: boolean;
    /**
     * 标签项选中时图片的九宫格设置：上边距、右边距、下边距、左边距、是否平铺（1表示平铺）
     * 让素材不再简单拉伸，而是根据九宫格方式进行拉伸 默认值="0,0,0,0,0"
     */
    grid9img1: string;
    /**
     * 标签项移入时图片的九宫格设置：上边距、右边距、下边距、左边距、是否平铺（1表示平铺）
     * 让素材不再简单拉伸，而是根据九宫格方式进行拉伸 默认值="0,0,0,0,0"
     */
    grid9img2: string;
    /**
     * 片段事件内容：当selectedIndex更改时触发
     * 主动调用方式：CommandPage.startTriggerFragmentEvent
     */
    onChangeFragEvent: string;
}
