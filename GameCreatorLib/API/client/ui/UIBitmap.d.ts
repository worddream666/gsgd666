/**
 * 图片组件
 * 用于显示一张图片用的组件，支持绑定玩家字符串变量（字符串变量存放地址）
 * 相关事件
 *  EventObject.LOADED 资源加载完成时候事件
 *  EventObject.CHANGE 当image图像改变时事件
 *
 * 使用方法：
 * var a = new UIBitmap();
 * a.image = "asset/image/xxx.jpg"; // 加载固定图片
 * a.image = "$5"; // 绑定5号玩家字符串变量的图片地址
 * stage.addChild(a);
 *
 * // 事件监听示例
 * a.on(EventObject.LOADED,this,this.onLoaded);
 * a.on(EventObject.CHANGE,this,this.onChange);
 *
 * [变量系统]在显示时会自动注册请求同步显示服务器玩家变量
 * Created by 黑暗之神KDS on 2018-10-12 14:02:39.
 */
declare class UIBitmap extends UIBase {
    /**
     * 图片地址，支持玩家字符串变量，比如$5 表示使用5号玩家字符串变量
     * <code>
     * var img = new UIBitmap();
     * img.image = "$5";
     * Game.layer.uiLayer.addChild(img);
     * </code>
     */
    image: string;
    /**
     * 设置图片地址（不派发EventObject.CHANGE事件）
     * @param image 图片地址，支持玩家字符串变量，比如$5 表示使用5号玩家字符串变量
     */
    setImageForce(image: string): void;
    /**
     * 图片源，可通过图源设置图片样式
     * 如果手动设置的该属性，卸载该组件时系统不会卸载该贴图，如有需要，可手动卸载
     */
    texture: Texture;
    /**
     * 九宫格设置：上边距、右边距、下边距、左边距、是否平铺（1表示平铺）
     * 让素材不再简单拉伸，而是根据九宫格方式进行拉伸 默认值=0,0,0,0,0
     */
    grid9: string;
    /**
     * 水平翻转 默认值=false
     */
    flip: boolean;
    /**
     * 平铺 默认值=false
     */
    isTile: boolean;
    /**
     * 原点对齐模式 0-原点 1-中心点 默认值=0
     */
    pivotType: number;
}
