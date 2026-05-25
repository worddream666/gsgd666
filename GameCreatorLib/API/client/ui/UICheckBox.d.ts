/**
 * 复选框组件
 * 复选框是一种拥有选中或未选中状态的基础控件
 * 相关事件：
 *  EventObject.CHANGE 当selected改变状态时派发
 *  EventObject.LOADED 加载完成时候事件
 *
 * 使用方法：
 * var a = new UICheckBox();
 * a.image1 = "asset/image/picture/control/check_unselected.png";
 * a.image2 = "asset/image/picture/control/check_selected.png";
 * a.width  = 100;
 * a.height = 100;
 * a.selected = true;
 * stage.addChild(a);
 *
 * // 事件监听示例
 * a.on(EventObject.CHANGE,this,this.onChange);
 * a.on(EventObject.LOADED,this,this.onLoaded);
 *
 * Created by 黑暗之神KDS on 2019-04-14 21:41:10.
 */
declare class UICheckBox extends UIBase {
    /**
     * 更改选中状态
     */
    selected: boolean;
    /**
     * 更改选中状态，不派发EventObject.CHANGE事件
     * @param v
     */
    setSelectedForce(v: boolean): void;
    /**
     * 未选中效果图片路径 即selected=false时
     */
    image1: string;
    /**
     * 选中时效果图片路径 即selected=true时
     */
    image2: string;
    /**
     * 未选中状态下图片的九宫格设置：上边距、右边距、下边距、左边距、是否平铺（1表示平铺）
     * 让素材不再简单拉伸，而是根据九宫格方式进行拉伸 默认值="0,0,0,0,0"
     */
    grid9img1: string;
    /**
     * 选中状态下图片的九宫格设置：上边距、右边距、下边距、左边距、是否平铺（1表示平铺）
     * 让素材不再简单拉伸，而是根据九宫格方式进行拉伸  默认值="0,0,0,0,0"
     */
    grid9img2: string;
    /**
     * 片段事件内容：当selected更改时触发
     * 主动调用方式：CommandPage.startTriggerFragmentEvent
     */
    onChangeFragEvent: string;
}
