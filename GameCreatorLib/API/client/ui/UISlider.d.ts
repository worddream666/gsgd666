/**
 * 滑块组件
 * 用于指定一个范围min和max，在min和max之间滑动取得一个值的组件
 * 相关事件：
 *  EventObject.CHANGE 当改变value值时派发
 *  EventObject.LOADED 资源加载完成时候事件
 *
 * 使用方式：
 * var a = new UISlider();
 * a.image1 = "asset/image/picture/control/slider_bg.png";
 * a.image2 = "asset/image/picture/control/slider_block.png";
 * a.image3 = "asset/image/picture/control/slider_bgfill.png";
 * a.value = 45;
 * stage.addChild(a);
 *
 * // 事件监听示例
 * a.on(EventObject.CHANGE,this,this.onChange);
 *
 * Created by 黑暗之神KDS on 2018-10-12 14:00:10.
 */
declare class UISlider extends UIBase {
    /**
     * 背景图
     */
    image1: string;
    /**
     * 滑块图
     */
    image2: string;
    /**
     * 滑块填充图
     */
    image3: string;
    /**
     * 横向模式 默认值=true
     */
    transverseMode: boolean;
    /**
     * 最小值 默认值=0
     */
    min: number;
    /**
     * 最大值 默认值=100
     */
    max: number;
    /**
     * 设置和获取当前值 默认值=50
     */
    value: number;
    /**
     * 设置当前值，该函数不派发EventObject.CHANGE事件
     * @param value 值
     */
    setValueForce(value: number): void;
    /**
     * 步进值 默认值=1
     */
    step: number;
    /**
     * 背景图片九宫格设置：上边距、右边距、下边距、左边距、是否平铺（1表示平铺）
     * 让素材不再简单拉伸，而是根据九宫格方式进行拉伸 默认值="0,0,0,0,0"
     */
    bgGrid9: string;
    /**
     * 滑块图片九宫格设置：上边距、右边距、下边距、左边距、是否平铺（1表示平铺）
     * 让素材不再简单拉伸，而是根据九宫格方式进行拉伸 默认值="0,0,0,0,0"
     */
    blockGrid9: string;
    /**
     * 滑块填充图九宫格设置：上边距、右边距、下边距、左边距、是否平铺（1表示平铺）
     * 让素材不再简单拉伸，而是根据九宫格方式进行拉伸 默认值="0,0,0,0,0"
     */
    blockFillGrid9: string;
    /**
     * 显示模式：0-仅显示滑块 1-填充模式 2-显示滑块的填充模式 默认值=2
     */
    blockFillMode: number;
    /**
     * 是否绑定数值变量
     */
    isBindingVarID: boolean;
    /**
     * 设置绑定数值变量的编号
     */
    bindingVarID: number;
}
