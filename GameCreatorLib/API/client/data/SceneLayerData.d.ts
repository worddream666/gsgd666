/**
 * 场景图层数据
 * 来自编辑器中预设好的场景中的图层数据
 * Created by 黑暗之神KDS on 2018-11-06 01:08:56.
 */
declare class SceneLayerData {
    /**
     * 名称
     */
    name: string;
    /**
     * 表示对象层标志
     */
    p: boolean;
    /**
     * 偏移x 默认值=0
     */
    dx: number;
    /**
     * 偏移y 默认值=0
     */
    dy: number;
    /**
     * 缩放x 默认值=1
     */
    scaleX: number;
    /**
     * 缩放y 默认值=1
     */
    scaleY: number;
    /**
     * 斜率x 默认值=0
     */
    skewX: number;
    /**
     * 斜率y 默认值=0
     */
    skewY: number;
    /**
     * x方向自动滚动速度 默认值=0
     */
    xMove: number;
    /**
     * y方向自动滚动速度 默认值=0
     */
    yMove: number;
    /**
     * 远景比例X轴 默认值=1.0 表示 100% 普通地图是100%，值越小则移动越慢，多重远景一般通过更改此属性来制作
     */
    prospectsPerX: number;
    /**
     * 远景比例Y轴 默认值=1.0 表示 100% 普通地图是100%，值越小则移动越慢，多重远景一般通过更改此属性来制作
     */
    prospectsPerY: number;
    /**
     * x方向循环 默认值=false
     */
    xLoop: boolean;
    /**
     * y方向循环 默认值=false
     */
    yLoop: boolean;
    /**
     * 透明度 默认值=1
     */
    opacity: number;
    /**
     * 混合模式 null/lighter/blend1-1 （取值范围0~14）
     */
    blendMode: string;
    /**
     * 绘制模式 true=图块层 false=图片层
     */
    drawMode: boolean;
    /**
     * 图块数据 texID负数表示自动元件 默认值=[]
     */
    tileData: { texID: number; x: number; y: number; }[][];
    /**
     * 全景图地址
     */
    img: string;
    /**
     * 全图块数据引用到的图块id集 id负数表示自动元件
     */
    tileTexIDs: { [id: string]: boolean; };
}
