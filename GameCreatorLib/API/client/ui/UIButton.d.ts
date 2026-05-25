/**
 * 按钮组件
 * 拥有三种状态的按钮组件（正常状态、按下时、鼠标悬停时）
 * 相关事件
 *  EventObject.LOADED 资源加载完成时候事件
 *
 * 使用方法：
 * var a = new UIButton();
 * a.image1 = "asset/image/picture/control/btn_normal.png";
 * a.image2 = "asset/image/picture/control/btn_over.png";
 * a.image3 = "asset/image/picture/control/btn_click.png";
 * a.width = 200;
 * a.height = 100;
 * stage.addChild(a);
 *
 * // 事件监听示例
 * a.on(EventObject.LOADED,this,this.onLoaded);
 *
 * Created by 黑暗之神KDS on 2018-10-12 14:00:10.
 */
declare class UIButton extends UIBase {
    /**
     * 正常状态下图片路径 mouse_out
     */
    image1: string;
    /**
     * 鼠标悬停时图片路径 mouse_over
     */
    image2: string;
    /**
     * 鼠标按下时图片路径 mouse_down
     */
    image3: string;
    /**
     * 正常状态下图片的九宫格设置：上边距、右边距、下边距、左边距、是否平铺（1表示平铺）
     * 让素材不再简单拉伸，而是根据九宫格方式进行拉伸 默认值="0,0,0,0,0"
     */
    grid9img1: string;
    /**
     * 鼠标移入时图片的九宫格设置：上边距、右边距、下边距、左边距、是否平铺（1表示平铺）
     * 让素材不再简单拉伸，而是根据九宫格方式进行拉伸 默认值="0,0,0,0,0"
     */
    grid9img2: string;
    /**
     * 鼠标点击时图片的九宫格设置：上边距、右边距、下边距、左边距、是否平铺（1表示平铺）
     * 让素材不再简单拉伸，而是根据九宫格方式进行拉伸 默认值="0,0,0,0,0"
     */
    grid9img3: string;
    /**
     * 按钮上显示的文本
     */
    label: string;
    /**
     * 文本水平对齐方式 0-居左 1-居中 2-居右 默认值=1
     */
    align: number;
    /**
     * 文本垂直对齐方式 0-居上 1-居中 2-居下 默认值=1
     */
    valign: number;
    /**
     * 文本粗体 默认值=false
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
     * 文本颜色 默认值="#999999"
     */
    color: string;
    /**
     * 鼠标悬停时文本颜色 默认值="#999999"
     */
    overColor: string;
    /**
     * 鼠标点击时文本颜色 默认值="#999999"
     */
    clickColor: string;
    /**
     * 文本字体大小 默认值=16
     */
    fontSize: number;
    /**
     * 文本水平偏移量，默认值=0
     */
    textDx: number;
    /**
     * 文本垂直偏移量，默认值=0
     */
    textDy: number;
}