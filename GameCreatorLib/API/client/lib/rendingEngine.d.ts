/**
 * 系统
 * 使用该类让渲染引擎初始化以及一些常用的函数（如发布后的窗口操作）
 * Created by 黑暗之神KDS on 2017-01-16 16:04:32.
 */
declare class os {
    /**
     * 默认字体
     */
    static defaultFamily: string;
    /**
     * 系统初始化
     * @param [可选]stageWidth 舞台宽 默认是页面大小 默认值=0
     * @param [可选]stageHeight 舞台高 默认是页面大小 默认值=0
     * @isWebGL [可选]是否webgl模式，默认true
     * @is3D [可选]是否3D模式 目前暂未支持
     */
    static init(stageWidth?: number, stageHeight?: number, isWebGL?: boolean, is3D?: boolean): void;
    /**
     * 获取canvas元素对象
     * 必须在os初始化后才能够获得
     */
    static get canvas(): HTMLCanvasElement;
    /**
     * 支持的贴图最大尺寸
     */
    static get MAX_TEXTURE_SIZE(): number;
    /**
     * 当min_filter时自动（默认是LINEAR）
     */
    static minFilterAuto: boolean;
    /**
     * 当max_filter时自动（默认根据配置）
     */
    static maxFilterAuto: boolean;
    /**
     * 添加帧循环，让函数逐帧执行（帧刷）
     * <code>
     * var i =0;
     * os.add_ENTERFRAME(() => {
     *   trace(++i);
     * }, this);
     * </code>
     * @param onHappen onHappen(arg1,arg2,...)
     * @param thisPtr 作用域
     * @param args [可选]参数集合 默认值=null
     */
    static add_ENTERFRAME(onHappen: Function, thisPtr: any, args?: any[]): void;
    /**
     * 移除帧循环
     * 比如添加帧刷后一定概率移除掉帧刷
     * <code>
     * function gameUpdate(){
     *    if(Math.random()<0.2){
     *       os.remove_ENTERFRAME(gameUpdate, this);
     *    }
     * }
     * os.add_ENTERFRAME(gameUpdate, this);
     * </code>
     * @param onHappen 利用add_ENTERFRAME注册的回调方法
     * @param thisPtr 作用域
     */
    static remove_ENTERFRAME(onHappen: Function, thisPtr: any): void;
    /**
     * 当前鼠标样式 如 os.setCursor("wait");
     * 比如游戏中需要更换鼠标样式可以使用该方法更换，支持自定义的图片和.cur格式光标文件（cur格式支持偏移中心点）
     * url 自定义图片 如 os.setCursor("url('icon.png'),pointer"); os.setCursor("url('icon.png'),default");
     * default	默认光标（通常是一个箭头）
     * auto	默认。浏览器设置的光标。
     * crosshair	光标呈现为十字线。
     * pointer	光标呈现为指示链接的指针（一只手）
     * move	此光标指示某对象可被移动。
     * e-resize	此光标指示矩形框的边缘可被向右（东）移动。
     * ne-resize	此光标指示矩形框的边缘可被向上及向右移动（北/东）。
     * nw-resize	此光标指示矩形框的边缘可被向上及向左移动（北/西）。
     * n-resize	此光标指示矩形框的边缘可被向上（北）移动。
     * se-resize	此光标指示矩形框的边缘可被向下及向右移动（南/东）。
     * sw-resize	此光标指示矩形框的边缘可被向下及向左移动（南/西）。
     * s-resize	此光标指示矩形框的边缘可被向下移动（南）。
     * w-resize	此光标指示矩形框的边缘可被向左移动（西）。
     * text	此光标指示文本。
     * wait	此光标指示程序正忙（通常是一只表或沙漏）。
     * help	此光标指示可用的帮助（通常是一个问号或一个气球）。
     */
    static setCursor(style: string): void;
    /**
     * 恢复更改前的记录光标
     */
    static restoreCursor(): void;
    /**
     * 获取操作系统
     * @return Mac/Unix/Linux/Win2000/WinXP/Win2003/WinVista/Win7/Win10/Android/iPhone/other
     */
    static detectOS(): string;
    /**
     * 获取所在平台
     *  0-GameCreator Web GC-网站平台
     *  1-GameCreator App GC-APP
     *  2-PC 电脑端
     *  3-Web/Mobile phone Web 普通网页端（包括移动版）
     *  4-Android APK（安卓APP）
     * @return
     */
    static get platform(): number;
    /**
     * 【仅PC端和Android端】设置全屏或取消全屏，发布后支持
     */
    static fullscreen: boolean;
    /**
     * 【仅PC端】设置窗口尺寸（单位：像素），发布后支持
     * @param width 宽度
     * @param height 高度
     */
    static resizeTo(width: number, height: number): void;
    /**
     * 【仅PC端】设置窗口位置（单位：像素），发布后支持
     * @param x 水平坐标
     * @param y 垂直坐标
     */
    static moveTo(x: number, y: number): void;
    /**
     * 【仅PC端】设置是否允许更改窗口尺寸，发布后支持
     * @param resizable 是否允许
     */
    static setResizable(resizable: boolean): void;
    /**
     * 【仅PC端】设置是否允许窗口显示在最前方，发布后支持
     * @param alwaysOnTop 是否允许
     */
    static setAlwaysOnTop(alwaysOnTop: boolean): void;
    /**
     * 【仅PC端】最大化窗口，发布后支持
     */
    static maximize(): void;
    /**
     * 【仅PC端和Android端】最小化窗口，发布后支持
     */
    static minimize(): void;
    /**
     * 【仅PC端】还原窗口（用于最大化或最小化后调用可还原），发布后支持
     */
    static restore(): void;
    /**
     * 【仅PC端和Android端】关闭当前窗口，在编辑器中也可以关闭
     */
    static closeWindow(): void;
    /**
     * 是否在GC环境中
     */
    static inGC(): boolean;
    /**
     * 显示FPS，必须在引擎初始化之后才生效
     */
    static showFPS(): void;
    /**
     * 隐藏FPS，必须在引擎初始化之后才生效
     */
    static hideFPS(): void;
    /**
     * 设备震动（目前仅支持安卓设备）
     * @param time (number | number[]) number类型表示震动持续时间 number[]类型表示自定义交替的震动、暂停、震动
     */
    static shake(time: number | number[]): void
    /**
     * 设备横屏显示
     */
    static horizontalScreen: boolean;
    /**
     * 设备允许常亮（目前仅支持安卓设备）
     */
    static insomnia: boolean;

}
/**
 * 【顶级变量】安全环境内的parent，不会因跨域问题导致报错
 */
declare var gcParent: Window;
/**
 * 【顶级变量】安全环境内的top，不会因跨域问题导致报错
 */
declare var gcTop: Window;
/**
 * 【顶级变量】舞台
 */
declare var stage: Stage;
/**
 * 图像绘制
 * 系统根据绘制命令来渲染图像，一次命令会产生一次渲染绘制（drawcall）。
 * 渲染次数对性能影响较大，一般整个游戏每帧全局渲染次数控制在1000以内会较为合适
 * Created by 黑暗之神KDS on 2017-01-01 16:04:32.
 */
declare class Graphics {
    /**
     * 销毁该对象
     */
    dispose(): void;
    /**
     * 清空全部绘制命令。
     */
    clear(): void;
    /**
     * 绘制整张贴图
     * @param tex 贴图
     * @param x [可选] 默认值=0 X轴偏移量
     * @param y [可选] 默认值=0 Y轴偏移量
     * @param width [可选] 默认值=0 宽度 默认根据贴图宽度
     * @param height [可选] 默认值=0 高度 默认根据贴图高度
     * @param m [可选] 默认值=null 矩阵信息
     * @param alpha [可选] 默认值=1 透明度
     */
    drawTexture(tex: Texture, x?: number, y?: number, width?: number, height?: number, m?: Matrix, alpha?: number): void;
    /**
     * 填充贴图，可裁剪只显示贴图的一部分
     * @param tex 贴图
     * @param x X轴偏移量
     * @param y Y轴偏移量
     * @param width [可选] 默认值=0 宽度 默认根据贴图宽度
     * @param height [可选] 默认值=0 高度 默认根据贴图高度
     * @param type [可选] 默认值="repeat" 填充类型 repeat|repeat-x|repeat-y|no-repeat 表示平铺的循环方式
     * @param offset [可选] 默认值=null 贴图取样的偏移量，如只绘制贴图中间的部分，则该值不是0,0点
     */
    fillTexture(tex: Texture, x: number, y: number, width?: number, height?: number, type?: string, offset?: Point): void;
    /**
     * 绘制文本
     * @param text 文本内容
     * @param x X轴偏移量
     * @param y Y轴偏移量
     * @param font 字号和字体 如"20px 宋体"
     * @param color 文本颜色 如"#FFFF00"
     * @param textAlign 对齐方式 "left"，"center"，"right"
     */
    fillText(text: string, x: number, y: number, font: string, color: string, textAlign: string): void;
    /**
     * 绘制线
     * @param fromX X轴开始位置
     * @param fromY Y轴开始位置
     * @param toX X轴结束位置
     * @param toY Y轴结束位置
     * @param lineColor 颜色
     * @param lineWidth [可选] 默认值=1 线条宽度
     */
    drawLine(fromX: number, fromY: number, toX: number, toY: number, lineColor: string, lineWidth?: number): void;
    /**
     * 绘制一系列线段
     * @param x 开始绘制的X轴位置
     * @param y 开始绘制的Y轴位置
     * @param points 线段的点集合 格式:[x1,y1,x2,y2,x3,y3...]
     * @param lineColor 线段颜色
     * @param lineWidth [可选] 默认值=1
     */
    drawLines(x: number, y: number, points: number[], lineColor: string, lineWidth?: number): void;
    /**
     * 绘制一系列曲线
     * @param x 开始绘制的 X 轴位置
     * @param y 开始绘制的 Y 轴位置
     * @param points 线段的点集合，格式[startx,starty,ctrx,ctry,startx,starty...]
     * @param lineColor 线段颜色，或者填充绘图的渐变对象
     * @param lineWidth [可选] 默认值=1
     */
    drawCurves(x: number, y: number, points: number[], lineColor: string, lineWidth?: number): void;
    /**
     * 绘制矩形
     * @param x 开始绘制的 X 轴位置
     * @param y 开始绘制的 Y 轴位置
     * @param width 矩形宽度
     * @param height 矩形高度
     * @param fillColor 填充颜色
     * @param lineColor [可选] 默认值=null 边框颜色
     * @param lineWidth [可选] 默认值=1 边框宽度
     */
    drawRect(x: number, y: number, width: number, height: number, fillColor: any, lineColor?: string, lineWidth?: number): void;
    /**
     * 绘制圆形
     * @param x 圆点X 轴位置
     * @param y 圆点Y 轴位置
     * @param radius 半径
     * @param fillColor 填充颜色，或者填充绘图的渐变对象
     * @param lineColor [可选] 默认值=null 边框颜色
     * @param lineWidth [可选] 默认值=1 边框宽度
     */
    drawCircle(x: number, y: number, radius: number, fillColor: string, lineColor?: string, lineWidth?: number): void;
    /**
     * 绘制扇形
     * <code>
     * var sp = new Sprite();
     * sp.graphics.drawPie(0,0,30,-90,90,"#FF0000");
     * stage.addChild(sp);
     * sp.x = 500;
     * sp.y = 500;
     * </code>
     * @param x 开始绘制的 X 轴位置
     * @param y 开始绘制的 Y 轴位置
     * @param radius 扇形半径
     * @param startAngle 开始角度 -90度在12点方向，90度在6点钟方向，按照顺时针开始绘制
     * @param endAngle 结束角度
     * @param fillColor 填充颜色
     * @param lineColor [可选] 默认值=null 边框颜色
     * @param lineWidth [可选] 默认值=1 边框宽度
     */
    drawPie(x: number, y: number, radius: number, startAngle: number, endAngle: number, fillColor: string, lineColor?: string, lineWidth?: number): void;
    /**
     * 绘制多边形
     * <code>
     * var sp = new Sprite();
     * sp.graphics.drawPoly(0,0,[100,100,200,200,100,300,50,250],"#FF0000");
     * stage.addChild(sp);
     * sp.x = 300;
     * sp.y = 300;
     * </code>
     * @param x 开始绘制的 X 轴位置
     * @param y 开始绘制的 Y 轴位置
     * @param points 多边形的点集合 格式[x1,y1,x2,y2...]
     * @param fillColor 填充颜色
     * @param lineColor [可选] 默认值=null 边框颜色
     * @param lineWidth [可选] 默认值=1 边框宽度
     */
    drawPoly(x: number, y: number, points: number[], fillColor: any, lineColor?: string, lineWidth?: number): void;
}
/**
 * 矩阵
 * 2D变换：表示一个转换矩阵，它确定如何将点从一个坐标空间映射到另一个坐标空间。您可以对一个显示对象执行不同的图形转换，方法是设置 Matrix 对象的属性，
 * 将该 Matrix 对象应用于 Transform 对象的 matrix 属性，然后应用该 Transform 对象作为显示对象的 transform 属性。这些转换函数包括平移（x 和 y 重新定位）、旋转、缩放和倾斜
 * a c tx
 * b d ty
 * 平移：tx、ty
 * 缩放：a(scaleX)、d(scaleY)
 * 旋转: q表示弧度
 * cos(q) -sin(q) tx
 * sin(q) cos(q)  ty
 * Created by 黑暗之神KDS on 2017-01-01 16:04:32.
 */
declare class Matrix {
    /**
     * 空矩阵：
     * 1 0 0
     * 0 1 0
     */
    static EMPTY: Matrix;
    /**
     * 临时用的矩阵辅助体，不用创建实例而是可以重复使用该实例作为辅助计算的
     */
    static TEMP: Matrix;
    /**
     * 缩放或旋转图像时影响像素沿 x 轴定位的值。
     */
    a: number;
    /**
     * 旋转或倾斜图像时影响像素沿 y 轴定位的值。
     */
    b: number;
    /**
     * 旋转或倾斜图像时影响像素沿 x 轴定位的值。
     */
    c: number;
    /**
     * 缩放或旋转图像时影响像素沿 y 轴定位的值。
     */
    d: number;
    /**
     * 沿 x 轴平移每个点的距离。
     */
    tx: number;
    /**
     * 沿 y 轴平移每个点的距离。
     */
    ty: number;
    /**
     * 构造函数
     * @param a [可选] 默认值=1 缩放或旋转图像时影响像素沿 x 轴定位的值。
     * @param b [可选] 默认值=0 旋转或倾斜图像时影响像素沿 y 轴定位的值。
     * @param c [可选] 默认值=0 旋转或倾斜图像时影响像素沿 x 轴定位的值。
     * @param d [可选] 默认值=1 缩放或旋转图像时影响像素沿 y 轴定位的值。
     * @param tx [可选] 默认值=0 沿 x 轴平移每个点的距离。
     * @param ty [可选] 默认值=0 沿 y 轴平移每个点的距离。
     */
    constructor(a?: number, b?: number, c?: number, d?: number, tx?: number, ty?: number);
    /**
     * 将本矩阵设置为单位矩阵。
     * @return 返回当前矩形。
     */
    identity(): Matrix;
    /**
     * 设置位置：直接设置tx、ty。
     * @param	x 沿 x 轴平移每个点的距离。
     * @param	y 沿 y 轴平移每个点的距离。
     * @return	返回对象本身
     */
    setTranslate(x: number, y: number): Matrix;
    /**
     * 平移位置：在原来的tx、ty基础上增加值。
     * @param	x 沿 x 轴向右移动的量（以像素为单位）。
     * @param	y 沿 y 轴向下移动的量（以像素为单位）。
     * @return 返回此矩形对象。
     */
    translate(x: number, y: number): Matrix;
    /**
     * 对矩阵应用缩放转换。
     * @param	x 用于沿 x 轴缩放对象的乘数。1=100%
     * @param	y 用于沿 y 轴缩放对象的乘数。1=100%
     */
    scale(x: number, y: number): void;
    /**
     * 对矩阵应用旋转。
     * @param	angle 以弧度为单位的旋转角度。
     */
    rotate(angle: number): void;
    /**
     * 对矩阵应用倾斜转换。
     * @param	x 沿着 X 轴的 2D 倾斜弧度。
     * @param	y 沿着 Y 轴的 2D 倾斜弧度。
     * @return 当前 Matrix 对象。
     */
    skew(x: number, y: number): Matrix;
    /**
     * 将矩阵对象表示的几何转换应用于指定点。
     * @param	out 用来设定输出结果的点。
     * @return	返回out
     */
    transformPoint(out: Point): Point;
    /**
     * 执行原始矩阵的逆转换。
     * @return 当前矩阵对象。
     */
    invert(): Matrix;
    /**
     * 将矩阵对象的成员设置为指定值。
     * @param	a 缩放或旋转图像时影响像素沿 x 轴定位的值。
     * @param	b 旋转或倾斜图像时影响像素沿 y 轴定位的值。
     * @param	c 旋转或倾斜图像时影响像素沿 x 轴定位的值。
     * @param	d 缩放或旋转图像时影响像素沿 y 轴定位的值。
     * @param	tx 沿 x 轴平移每个点的距离。
     * @param	ty 沿 y 轴平移每个点的距离。
     * @return 当前矩阵对象。
     */
    setTo(a: number, b: number, c: number, d: number, tx: number, ty: number): Matrix;
    /**
     * 将指定矩阵与当前矩阵连接，从而将这两个矩阵的几何效果有效地结合在一起。
     * @param	matrix 要连接到源矩阵的矩阵。
     * @return 当前矩阵。
     */
    concat(matrix: Matrix): Matrix;
    /**
     * 返回此 Matrix 对象的副本。
     * @return 与原始实例具有完全相同的属性的新 Matrix 实例。
     */
    clone(): Matrix;
    /**
     * 返回列出该 Matrix 对象属性的文本值。
     * @return 一个字符串，它包含 Matrix 对象的属性值：a、b、c、d、tx 和 ty。
     */
    toString(): string;
    /**
     * 销毁此对象。
     */
    destroy(): void;
}
/**
 * Sprite 显示对象精灵
 * 显示对象的基类，支持显示图片和事件响应
 * 支持通用鼠标事件：
 * EventObject.RIGHT_MOUSE_UP 鼠标右键弹起
 * EventObject.RIGHT_MOUSE_DOWN 鼠标右键按下
 * EventObject.RIGHT_CLICK 鼠标右键点击
 * EventObject.CLICK 鼠标左键点击
 * EventObject.DOUBLE_CLICK 鼠标左键双击
 * EventObject.MOUSE_DOWN 鼠标左键按下
 * EventObject.MOUSE_UP 鼠标左键弹起
 * EventObject.MOUSE_WHEEL 鼠标滚轮
 * EventObject.DRAG_START 鼠标拖拽开始
 * EventObject.DRAG_MOVE 鼠标拖拽移动中
 * EventObject.DRAG_END 鼠标拖拽移动结束
 *
 * // 事件监听示例
 * var sp = new Sprite();
 * sp.on(EventObject.CLICK,this,this.onClick);
 * Created by 黑暗之神KDS on 2017-01-01 16:04:32.
 */
declare class Sprite extends TreeNode {
    /**
     * 销毁
     */
    dispose(): void;
    /**
     * 相对父容器的水平方向坐标
     */
    x: number;
    /**
     * 相对父容器的垂直方向坐标
     */
    y: number;
    /**
     * 宽度，用于鼠标检测
     */
    width: number;
    /**
     * 高度，用于鼠标检测
     */
    height: number;
    /**
     * 是否存在鼠标事件
     */
    get hasMouseEvent(): boolean;
    /**
     * 获取本对象在父容器坐标系的矩形显示区域，计算量较大，尽量少用
     * @return 矩形区域
     */
    getBounds(): Rectangle;
    /**
     * 获取本对象在自己坐标系的矩形显示区域，计算量较大，尽量少用
     * @return 矩形区域
     */
    getSelfBounds(): Rectangle;
    /**
     * X轴缩放值
     */
    scaleX: number;
    /**
     * Y轴缩放值
     */
    scaleY: number;
    /**
     * 旋转角度
     */
    rotation: number;
    /**
     * 水平倾斜角度
     */
    skewX: number;
    /**
     * 垂直倾斜角度
     */
    skewY: number;
    /**
     * 对象的矩阵信息。通过设置矩阵可以实现节点旋转，缩放，位移效果。
     */
    transform: Matrix;
    /**
     * 轴心点的位置X，以轴心点进行缩放、旋转
     */
    pivotX: number;
    /**
     * 轴心点的位置Y，以轴心点进行缩放、旋转
     */
    pivotY: number;
    /**
     * 透明度
     */
    alpha: number;
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 合成模式 null/lighter/blend1-1 (lighter=加法 数字可以更改，参考地图图层自定义混合模式)
     */
    blendMode: string;
    /**
     * 绘制对象
     */
    graphics: Graphics;
    /**
     * 显示对象的滚动矩形范围，具有裁剪效果
     */
    scrollRect: Rectangle;
    /**
     * 把本地坐标转换为全局坐标
     * @param point 本地坐标点
     * @return [Point] 转换后的全局坐标
     */
    localToGlobal(point: Point): Point;
    /**
     * 把全局坐标转换为本地坐标
     * @param point 全局坐标点
     * @return [Point] 转换后的坐标的点
     */
    globalToLocal(point: Point): Point;
    /**
     * 父节点
     */
    parent: TreeNode;
    /**
     * 若该对象在舞台上则返回舞台，否则返回null
     * @return [Stage]
     */
    get stage(): Stage;
    /**
     * 可以设置一个Rectangle区域作为点击区域，设置后则以该区域作为鼠标事件检测
     * 支持类型：HitArea | Rectangle
     */
    hitArea: any;
    /**
     * 遮罩，可以设置一个对象(支持位图和矢量图)，根据对象形状进行遮罩显示，支持像素级遮罩
     * 遮罩对象坐标系是相对遮罩对象本身的，即以该对象的0,0点为准
     */
    mask: Sprite;
    /**
     * 是否接受鼠标事件
     * 默认为false，如果监听鼠标事件，则会自动设置本对象及父节点的属性 mouseEnable 的值都为 true（如果父节点手动设置为false，则不会更改）
     */
    mouseEnabled: boolean;
    /**
     * 开始拖动此对象
     * @param area [可选] 默认值=null 拖动限定的区域范围内
     */
    startDrag(area?: Rectangle): void;
    /**
     * 停止拖动此对象
     */
    stopDrag(): void;
    /**
     * 检测某个点是否在此对象内
     * @param	x 全局x坐标
     * @param	y 全局y坐标。
     * @return  表示是否在对象内
     */
    hitTestPoint(x: number, y: number): boolean;
    /**
     * 获得相对于stage的全局X轴缩放值（会叠加父亲节点的缩放值）。
     */
    get globalScaleX(): number;
    /**
     * 获得相对于stage的全局Y轴缩放值（会叠加父亲节点的缩放值）。
     */
    get globalScaleY(): number;
    /**
     * 返回鼠标在此对象坐标系上的 X 轴坐标信息。
     */
    get mouseX(): number;
    /**
     * 返回鼠标在此对象坐标系上的 Y 轴坐标信息。
     */
    get mouseY(): number;
    /**
     * 设置坐标位置。相当于分别设置x和y属性。
     * @param	x			X轴坐标。
     * @param	y			Y轴坐标。
     * @param 	speedMode	（可选）是否极速模式，正常是调用this.x=value进行赋值，极速模式直接调用内部函数处理，
     * 如果未重写x,y属性，建议设置为急速模式性能更高。
     * @return	返回对象本身。
     */
    pos(x: number, y: number, speedMode?: boolean): Sprite;
}
/**
 * 鼠标点击区域
 * 可以设置绘制一系列矢量图作为点击区域和非点击区域（目前只支持圆形，矩形，多边形）
 * Created by 黑暗之神KDS on 2017-01-01 16:04:32.
 */
declare class HitArea {
    /**
     * 是否击中Graphic
     * @param x x坐标
     * @param y y坐标
     * @param graphic 图形源
     * @return [boolean]
     */
    static isHitGraphic(x: number, y: number, graphic: Graphics): boolean;
    /**
     * 坐标是否在多边形内
     * @param x x坐标
     * @param y y坐标
     * @param areaPoints 格式 [x1,y1,x2,y2...]
     * @return [boolean]
     */
    static ptInPolygon(x: number, y: number, areaPoints: number[]): boolean;
    /**
     * 是否包含某个点
     * @param x x坐标
     * @param y y坐标
     * @return 是否点击到
     */
    isHit(x: number, y: number): boolean;
    /**
     * 检测对象是否包含指定的点。
     * @param	x	点的 X 轴坐标值（水平位置）。
     * @param	y	点的 Y 轴坐标值（垂直位置）。
     * @return	如果包含指定的点，则值为 true；否则为 false。
     */
    contains(x: number, y: number): boolean;
    /**
     * 可点击区域，可以设置绘制一系列矢量图作为点击区域（支持圆形，矩形，多边形）
     */
    hit: Graphics;
    /**
     * 不可点击区域，可以设置绘制一系列矢量图作为非点击区域（支持圆形，矩形，多边形）
     */
    unHit: Graphics;
}
/**
 * 舞台类
 * 只有一个舞台，可通过stage来访问
 * 支持事件：
 * EventObject.KEY_DOWN 按键按下
 * EventObject.KEY_UP 按键弹起
 * EventObject.RESIZE 当窗口尺寸改变时
 * EventObject.FULL_SCREEN_CHANGE 当全屏改变时
 * EventObject.FOCUS_CHANGE 当焦点改变时
 * EventObject.FOCUS 当产生焦点时
 * EventObject.BLUR 当失去焦点时
 * EventObject.RENDER 每帧渲染时
 * EventObject.AFTER_RENDER 每帧渲染完毕后
 * // 事件监听示例
 * stage.on(EventObject.CLICK,this,this.onClick);
 *
 * Created by 黑暗之神KDS on 2017-01-01 16:04:32.
 */
declare class Stage extends Sprite {
    /**
     * 当前宽度
     */
    width: number;
    /**
     * 当前高度
     */
    height: number;
    /**
    * 设置屏幕大小，场景会根据屏幕大小进行适配。可以动态调用此方法，来更改游戏显示的大小
    * @param	screenWidth		屏幕宽度。
    * @param	screenHeight	屏幕高度。
    */
    setScreenSize(screenWidth: number, screenHeight: number): void;
    /**
     * 缩放模式。默认值为 "noscale"
     * 取值范围：
     * "noscale" ：不缩放
     * "exactfit" ：全屏不等比缩放
     * "showall" ：最小比例缩放
     * "noborder" ：最大比例缩放
     * "full" ：不缩放，stage的宽高等于屏幕宽高
     * "fixedwidth" ：宽度不变，高度根据屏幕比缩放
     * "fixedheight" ：高度不变，宽度根据屏幕比缩放
     * "fixedauto" ：根据宽高比，自动选择使用fixedwidth或fixedheight
     */
    scaleMode: string;
    /**
     * 水平对齐方式。默认值为"left"
     * 取值范围：
     * "left" ：居左对齐
     * "center" ：居中对齐
     * "right" ：居右对齐
     */
    alignH: string;
    /**
     * 垂直对齐方式。默认值为"top"
     * 取值范围：
     * "top" ：居顶部对齐
     * "middle" ：居中对齐
     * "bottom" ：居底部对齐
     */
    alignV: string;
    /**
     * 舞台的背景颜色，默认为黑色
     */
    bgColor: string;
    /**
     * 鼠标在 Stage 上的 X 轴坐标
     */
    get mouseX(): number;
    /**
     * 鼠标在 Stage 上的 Y 轴坐标。
     */
    get mouseY(): number;
    /**
     * 当前视窗由缩放模式导致的 X 轴缩放系数。
     */
    get clientScaleX(): number;
    /**
     * 当前视窗由缩放模式导致的 Y 轴缩放系数。
     */
    get clientScaleY(): number;
    /**
     * 场景布局类型。
     * 取值范围：
     * "none" ：不更改屏幕
     * "horizontal" ：自动横屏
     * "vertical" ：自动竖屏
     */
    screenMode: string;
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 是否开启全屏，用户点击后进入全屏
     * 兼容性提示：部分浏览器不允许点击进入全屏，比如Iphone等。
     */
    fullScreenEnabled: boolean;
    /**
     * 退出全屏模式
     */
    exitFullscreen(): void;
}
/**
 * 节点类
 * 显示对象的基类，拥有父子节点的特性，树结构
 * 支持事件：
 * EventObject.DISPLAY 加入到显示列表中时（即该对象加入stage的显示列表里，从不需要被渲染到需要渲染的状态改变时触发）
 * EventObject.UNDISPLAY 从显示列表中移除时（即该对象从stage的显示列表移除时，从需要被渲染到不需要渲染的状态改变时触发）
 * EventObject.REMOVED 从父节点中移除时触发（无需在显示列表中）
 * EventObject.ADDED 加入到某个节点时触发（无需在显示列表中）
 *
 * Created by 黑暗之神KDS on 2017-01-01 16:04:32.
 */
declare class TreeNode extends EventDispatcher {
    /**
     * 节点名称
     */
    name: string;
    /**
     * 是否已经销毁。对象销毁后不能再使用
     */
    get disposed(): boolean;
    /**
     * 销毁此对象。destroy对象默认会把自己从父节点移除，并且清理自身引用关系，等待js自动垃圾回收机制回收。destroy后不能再使用。
     * destroy时会移除自身的事情监听，自身的timer监听，移除子对象及从父节点移除自己。
     */
    dispose(): void;
    /**
     * 添加子节点。
     * @param	node 节点对象
     * @return	返回添加的节点
     */
    addChild(node: TreeNode): TreeNode;
    /**
     * 批量增加子节点
     * @param	...args 无数子节点。
     */
    addChildren(...args: any[]): void;
    /**
     * 添加子节点到指定的索引位置。
     * @param	node 节点对象。
     * @param	index 索引位置。
     * @return	返回添加的节点。
     */
    addChildAt(node: TreeNode, index: number): TreeNode;
    /**
     * 根据子节点对象，获取子节点的索引位置。
     * @param	node 子节点。
     * @return	子节点所在的索引位置。
     */
    getChildIndex(node: TreeNode): number;
    /**
     * 根据子节点的名字，获取子节点对象。
     * @param	name 子节点的名字。
     * @return	节点对象。
     */
    getChildByName(name: string): TreeNode;
    /**
     * 根据子节点的索引位置，获取子节点对象。
     * @param	index 索引位置
     * @return	子节点
     */
    getChildAt(index: number): TreeNode;
    /**
     * 设置子节点的索引位置。
     * @param	node 子节点。
     * @param	index 新的索引。
     * @return	返回子节点本身。
     */
    setChildIndex(node: TreeNode, index: number): TreeNode;
    /**
     * 删除子节点。
     * @param	node 子节点
     * @return	被删除的节点
     */
    removeChild(node: TreeNode): TreeNode;
    /**
     * 从父容器删除自己，如已经被删除不会抛出异常。
     * @return 当前节点（ TreeNode ）对象。
     */
    removeSelf(): TreeNode;
    /**
     * 根据子节点名字删除对应的子节点对象，如果找不到不会抛出异常。
     * @param	name 对象名字。
     * @return 查找到的节点（ TreeNode ）对象。
     */
    removeChildByName(name: string): TreeNode;
    /**
     * 根据子节点索引位置，删除对应的子节点对象。
     * @param	index 节点索引位置。
     * @return	被删除的节点。
     */
    removeChildAt(index: number): TreeNode;
    /**
     * 删除指定索引区间的所有子对象。
     * @param	beginIndex 开始索引。默认值=0
     * @param	endIndex 结束索引。默认值=0x7fffffff
     * @return 当前节点对象。
     */
    removeChildren(beginIndex?: number, endIndex?: number): TreeNode;
    /**
     * 子对象数量。
     */
    get numChildren(): number;
    /**
     * 父节点
     */
    parent: TreeNode;
    /**
     * 当前容器是否包含指定的 TreeNode 节点对象 。
     * @param	node  指定的 TreeNode 节点对象 。
     * @return	一个布尔值表示是否包含指定的 TreeNode 节点对象 。
     */
    contains(node: TreeNode): boolean;
}
/**
 * 事件对象
 * 当发生事件后回调中带有此类实例
 * 同时用于常用的事件类别储存，如EventObject.MOUSE_DOWN
 *
 * Created by 黑暗之神KDS on 2017-01-01 16:04:32.
 */
declare class EventObject {
    /**
     * 定义 mousedown 事件对象的 type 属性值 鼠标左键按下时事件
     */
    static MOUSE_DOWN: string;
    /**
     * 定义 mouseup 事件对象的 type 属性值 鼠标左键弹起时事件
     */
    static MOUSE_UP: string;
    /**
     * 定义 click 事件对象的 type 属性值 鼠标点击时事件
     */
    static CLICK: string;
    /**
     * 定义 rightmousedown 事件对象的 type 属性值 鼠标右键按下时事件
     */
    static RIGHT_MOUSE_DOWN: string;
    /**
     * 定义 rightmouseup 事件对象的 type 属性值 鼠标右键弹起时事件
     */
    static RIGHT_MOUSE_UP: string;
    /**
     * 定义 rightclick 事件对象的 type 属性值 鼠标右键点击时事件
     */
    static RIGHT_CLICK: string;
    /**
     * 定义 mousemove 事件对象的 type 属性值 鼠标移动时事件
     */
    static MOUSE_MOVE: string;
    /**
     * 定义 mouseover 事件对象的 type 属性值 鼠标进入悬停时事件
     */
    static MOUSE_OVER: string;
    /**
     * 定义 mouseout 事件对象的 type 属性值 鼠标移除悬停时事件
     */
    static MOUSE_OUT: string;
    /**
     * 定义 mousewheel 事件对象的 type 属性值 鼠标滚轮事件
     */
    static MOUSE_WHEEL: string;
    /**
     * 定义 doubleclick 事件对象的 type 属性值 鼠标左键双击事件
     */
    static DOUBLE_CLICK: string;
    /**
     * 定义 change 事件对象的 type 属性值 状态更改事件
     */
    static CHANGE: string;
    /**
     * 定义 resize 事件对象的 type 属性值 重置尺寸时事件
     */
    static RESIZE: string;
    /**
     * 定义 added 事件对象的 type 属性值 添加到父节点时触发
     */
    static ADDED: string;
    /**
     * 定义 removed 事件对象的 type 属性值 从父节点移除时触发
     */
    static REMOVED: string;
    /**
     * 定义 display 事件对象的 type 属性值 加入到显示列表中时添加
     */
    static DISPLAY: string;
    /**
     * 定义 undisplay 事件对象的 type 属性值 从显示列表中移除时添加
     */
    static UNDISPLAY: string;
    /**
     * 定义 error 事件对象的 type 属性值 发生错误时事件
     */
    static ERROR: string;
    /**
     * 定义 complete 事件对象的 type 属性值 完成事件
     */
    static COMPLETE: string;
    /**
     * 定义 loaded 事件对象的 type 属性值 加载完毕事件
     */
    static LOADED: string;
    /**
     * 定义 progress 事件对象的 type 属性值 加载过程中事件
     */
    static PROGRESS: string;
    /**
     * 定义 input 事件对象的 type 属性值 输入事件
     */
    static INPUT: string;
    /**
     * 每帧渲染前派发
     * 定义 render 事件对象的 type 属性值 渲染时事件
     */
    static RENDER: string;
    /**
     * 每帧渲染后派发
     */
    static AFTER_RENDER: string;
    /**
     * 定义 keydown 事件对象的 type 属性值 按键按下
     */
    static KEY_DOWN: string;
    /**
     * 定义 keypress 事件对象的 type 属性值 按键按下一次(字母区分大小写)
     */
    static KEY_PRESS: string;
    /**
     * 定义 keyup 事件对象的 type 属性值 按键弹起
     */
    static KEY_UP: string;
    /**
     * 定义 dragstart 事件对象的 type 属性值 拖拽开始
     */
    static DRAG_START: string;
    /**
     * 定义 dragmove 事件对象的 type 属性值 拖拽移动中
     */
    static DRAG_MOVE: string;
    /**
     * 定义 dragend 事件对象的 type 属性值 拖拽结束
     */
    static DRAG_END: string;
    /**
     * 定义 enter 事件对象的 type 属性值 输入框输入回车键时
     */
    static ENTER: string;
    /**
     * 定义 blur 事件对象的 type 属性值 失去焦点事件
     */
    static BLUR: string;
    /**
     * 定义 focus 事件对象的 type 属性值 获得焦点事件
     */
    static FOCUS: string;
    /**
     * 定义 focuschange 事件对象的 type 属性值 失去焦点或者获取焦点时事件
     */
    static FOCUS_CHANGE: string;
    /**
     * 浏览器全屏更改时触发
     */
    static FULL_SCREEN_CHANGE: string;
    /**
     * 显卡设备丢失时触发
     */
    static DEVICE_LOST: string;
    /**
     * 事件类型。
     */
    type: string;
    /**
     * 原生浏览器事件
     */
    nativeEvent: any;
    /**
     * 事件目标触发对象
     */
    target: Sprite;
    /**
     * 事件当前冒泡对象
     */
    currentTarget: Sprite;
    /**
     * 分配给触摸点的唯一标识号（作为 int）
     */
    touchId: number;
    /**
     * 键盘值
     */
    keyCode: number;
    /**
     * 滚轮滑动增量
     */
    delta: number;
    /**
     * 阻止对事件流中当前节点的后续节点中的所有事件侦听器进行处理。此方法不会影响当前节点 (currentTarget) 中的任何事件侦听器。
     */
    stopPropagation(): void;
    /**
     * 触摸点列表。
     */
    get touches(): Array<any>;
    /**
     * 表示 Alt 键是处于活动状态 (true) 还是非活动状态 (false)。
     */
    get altKey(): boolean;
    /**
     * 表示 Ctrl 键是处于活动状态 (true) 还是非活动状态 (false)。
     */
    get ctrlKey(): boolean;
    /**
     * 表示 Shift 键是处于活动状态 (true) 还是非活动状态 (false)。
     */
    get shiftKey(): boolean;
    /**
     * 包含按下或释放的键的字符代码值。字符代码值为英文键盘值。
     */
    get charCode(): boolean;
    /**
     * 表示键在键盘上的位置。这对于区分在键盘上多次出现的键非常有用。
     * 例如，您可以根据此属性的值来区分左 Shift 键和右 Shift 键，或者是数字键和小键盘。
     */
    get keyLocation(): number;
    /**
     * 鼠标在 Stage 上的 X 轴坐标（绝对坐标）
     */
    get stageX(): number;
    /**
     * 鼠标在 Stage 上的 Y 轴坐标（绝对坐标）
     */
    get stageY(): number;
}
/**
 * 事件调度器
 * 可调度事件的所有类的基类。
 *
 * Created by 黑暗之神KDS on 2017-01-01 16:04:32.
 */
declare class EventDispatcher {
    /**
     * 检查 EventDispatcher 对象是否为特定事件类型注册了任何侦听器。
     * @param	type 事件的类型。
     * @return 如果指定类型的侦听器已注册，则值为 true；否则，值为 false。
     */
    hasListener(type: string): boolean;
    /**
     * 派发事件。
     * @param type	事件类型。
     * @param data	（可选）回调数据。默认值=null 注意：如果是需要传递多个参数 p1,p2,p3,...可以使用数组结构如：[p1,p2,p3,...] ；如果需要回调单个参数 p 是一个数组，则需要使用结构如：[p]，其他的单个参数 p ，可以直接传入参数 p。
     * @return 此事件类型是否有侦听者，如果有侦听者则值为 true，否则值为 false。
     */
    event(type: string, data?: any): boolean;
    /**
     * 使用 EventDispatcher 对象注册指定类型的事件侦听器对象，以使侦听器能够接收事件通知。
     * @param type		事件的类型。
     * @param caller	事件侦听函数的执行域。
     * @param listener	事件侦听函数。
     * @param args		（可选）事件侦听函数的回调参数。默认值=null
     * @return 此 EventDispatcher 对象。
     */
    on(type: string, caller: any, listener: Function, args?: Array<any>): EventDispatcher;
    /**
     * 使用 EventDispatcher 对象注册指定类型的事件侦听器对象，以使侦听器能够接收事件通知，此侦听事件响应一次后自动移除。
     * @param type		事件的类型。
     * @param caller	事件侦听函数的执行域。
     * @param listener	事件侦听函数。
     * @param args		（可选）事件侦听函数的回调参数。默认值=null
     * @return 此 EventDispatcher 对象。
     */
    once(type: string, caller: any, listener: Function, args?: Array<any>): EventDispatcher;
    /**
    * 从 EventDispatcher 对象中删除侦听器。
    * @param type		事件的类型。
    * @param caller	事件侦听函数的执行域。
    * @param listener	事件侦听函数。
    * @param onceOnly	（可选）如果值为 true ,则只移除通过 once 方法添加的侦听器。默认值=false
    * @return 此 EventDispatcher 对象。
    */
    off(type: string, caller: any, listener: Function, onceOnly?: boolean): EventDispatcher;
    /**
     * 从 EventDispatcher 对象中删除指定事件类型的所有侦听器。
     * @param type	（可选）事件类型，如果值为 null，则移除本对象所有类型的侦听器。默认值=null
     * @return 此 EventDispatcher 对象。
     */
    offAll(type?: string): EventDispatcher;
    /**
     * 检测指定事件类型是否是鼠标事件。
     * @param	type 事件的类型。
     * @return	如果是鼠标事件，则值为 true;否则，值为 false。
     */
    isMouseEvent(type: string): boolean;
}
/**
 * 键盘按键常用值
 * 属性是一些常数，这些常数表示控制游戏时最常用的键。
 *
 * Created by 黑暗之神KDS on 2017-01-01 16:04:32.
 */
declare class Keyboard {
    /**
     * 获取键位对应的按键名称。
     * @param keyCode 按键值
     */
    static getKeyName(keyCode: number): string;
    /**
     * 与 0 的键控代码值(48)关联的常数
     */
    static NUMBER_0: number;
    /**
     * 与 1 的键控代码值(49)关联的常数
     */
    static NUMBER_1: number;
    /**
     * 与 2 的键控代码值(50)关联的常数
     */
    static NUMBER_2: number;
    /**
     * 与 3 的键控代码值(51)关联的常数
     */
    static NUMBER_3: number;
    /**
     * 与 4 的键控代码值(52)关联的常数
     */
    static NUMBER_4: number;
    /**
     * 与 5 的键控代码值(53)关联的常数
     */
    static NUMBER_5: number;
    /**
     * 与 6 的键控代码值(54)关联的常数
     */
    static NUMBER_6: number;
    /**
     * 与 7 的键控代码值(55)关联的常数
     */
    static NUMBER_7: number;
    /**
     * 与 8 的键控代码值(56)关联的常数
     */
    static NUMBER_8: number;
    /**
     * 与 9 的键控代码值(57)关联的常数
     */
    static NUMBER_9: number;
    /**
     * 与 A 键的键控代码值(65)关联的常数
     */
    static A: number;
    /**
     * 与 B 键的键控代码值(66)关联的常数
     */
    static B: number;
    /**
     * 与 C 键的键控代码值(67)关联的常数
     */
    static C: number;
    /**
     * 与 D 键的键控代码值(68)关联的常数
     */
    static D: number;
    /**
     * 与 E 键的键控代码值(69)关联的常数
     */
    static E: number;
    /**
     * 与 F 键的键控代码值(70)关联的常数
     */
    static F: number;
    /**
     * 与 G 键的键控代码值(71)关联的常数
     */
    static G: number;
    /**
     * 与 H 键的键控代码值(72)关联的常数
     */
    static H: number;
    /**
     * 与 I 键的键控代码值(73)关联的常数
     */
    static I: number;
    /**
     * 与 J 键的键控代码值(74)关联的常数
     */
    static J: number;
    /**
     * 与 K 键的键控代码值(75)关联的常数
     */
    static K: number;
    /**
     * 与 L 键的键控代码值(76)关联的常数
     */
    static L: number;
    /**
     * 与 M 键的键控代码值(77)关联的常数
     */
    static M: number;
    /**
     * 与 N 键的键控代码值(78)关联的常数。
     */
    static N: number;
    /**
     * 与 O 键的键控代码值(79)关联的常数。
     */
    static O: number;
    /**
     * 与 P 键的键控代码值(80)关联的常数。
     */
    static P: number;
    /**
     * 与 Q 键的键控代码值(81)关联的常数。
     */
    static Q: number;
    /**
     * 与 R 键的键控代码值(82)关联的常数。
     */
    static R: number;
    /**
     * 与 S 键的键控代码值(83)关联的常数。
     */
    static S: number;
    /**
     * 与 T 键的键控代码值(84)关联的常数。
     */
    static T: number;
    /**
     * 与 U 键的键控代码值(85)关联的常数。
     */
    static U: number;
    /**
     * 与 V 键的键控代码值(86)关联的常数。
     */
    static V: number;
    /**
     * 与 W 键的键控代码值(87)关联的常数。
     */
    static W: number;
    /**
     * 与 X 键的键控代码值(88)关联的常数。
     */
    static X: number;
    /**
     * 与 Y 键的键控代码值(89)关联的常数。
     */
    static Y: number;
    /**
     * 与 Z 键的键控代码值(90)关联的常数。
     */
    static Z: number;
    /**
     * 与 F1 的键控代码值(112)关联的常数。
     */
    static F1: number;
    /**
     * 与 F2 的键控代码值(113)关联的常数。
     */
    static F2: number;
    /**
     * 与 F3 的键控代码值(114)关联的常数。
     */
    static F3: number;
    /**
     * 与 F4 的键控代码值(115)关联的常数。
     */
    static F4: number;
    /**
     * 与 F5 的键控代码值(116)关联的常数。
     */
    static F5: number;
    /**
     * 与 F6 的键控代码值(117)关联的常数。
     */
    static F6: number;
    /**
     * 与 F7 的键控代码值(118)关联的常数。
     */
    static F7: number;
    /**
     * 与 F8 的键控代码值(119)关联的常数。
     */
    static F8: number;
    /**
     * 与 F9 的键控代码值(120)关联的常数。
     */
    static F9: number;
    /**
     * 与 F10 的键控代码值(121)关联的常数。
     */
    static F10: number;
    /**
     * 与 F11 的键控代码值(122)关联的常数。
     */
    static F11: number;
    /**
     * 与 F12 的键控代码值(123)关联的常数。
     */
    static F12: number;
    /**
     * 与 F13 的键控代码值(124)关联的常数。
     */
    static F13: number;
    /**
     * 与 F14 的键控代码值(125)关联的常数。
     */
    static F14: number;
    /**
     * 与 F15 的键控代码值(126)关联的常数。
     */
    static F15: number;
    /**
     * 与数字键盘的伪键控代码(21)关联的常数。
     */
    static NUMPAD: number;
    /**
     * 与数字键盘上的数字 0 的键控代码值(96)关联的常数。
     */
    static NUMPAD_0: number;
    /**
     * 与数字键盘上的数字 1 的键控代码值(97)关联的常数。
     */
    static NUMPAD_1: number;
    /**
     * 与数字键盘上的数字 2 的键控代码值(98)关联的常数。
     */
    static NUMPAD_2: number;
    /**
     * 与数字键盘上的数字 3 的键控代码值(99)关联的常数。
     */
    static NUMPAD_3: number;
    /**
     * 与数字键盘上的数字 4 的键控代码值(100)关联的常数。
     */
    static NUMPAD_4: number;
    /**
     * 与数字键盘上的数字 5 的键控代码值(101)关联的常数。
     */
    static NUMPAD_5: number;
    /**
     * 与数字键盘上的数字 6 的键控代码值(102)关联的常数。
     */
    static NUMPAD_6: number;
    /**
     * 与数字键盘上的数字 7 的键控代码值(103)关联的常数。
     */
    static NUMPAD_7: number;
    /**
     * 与数字键盘上的数字 8 的键控代码值(104)关联的常数。
     */
    static NUMPAD_8: number;
    /**
     * 与数字键盘上的数字 9 的键控代码值(105)关联的常数。
     */
    static NUMPAD_9: number;
    /**
     * 与数字键盘上的加号(+)的键控代码值(107)关联的常数。
     */
    static NUMPAD_ADD: number;
    /**
     * 与数字键盘上的小数点(.)的键控代码值(110)关联的常数。
     */
    static NUMPAD_DECIMAL: number;
    /**
     * 与数字键盘上的除号(/)的键控代码值(111)关联的常数。
     */
    static NUMPAD_DIVIDE: number;
    /**
     * 与数字键盘上的 Enter 的键控代码值(108)关联的常数。
     */
    static NUMPAD_ENTER: number;
    /**
     * 与数字键盘上的乘号(*)的键控代码值(106)关联的常数。
     */
    static NUMPAD_MULTIPLY: number;
    /**
     * 与数字键盘上的减号(-)的键控代码值(109)关联的常数。
     */
    static NUMPAD_SUBTRACT: number;
    /**
     * 与 ; 键的键控代码值(186)关联的常数。
     */
    static SEMICOLON: number;
    /**
     * 与=键的键控代码值(187)关联的常数。
     */
    static EQUAL: number;
    /**
     * 与 F15 的键控代码值(188)关联的常数。
     */
    static COMMA: number;
    /**
     * 与 - 键的键控代码值(189)关联的常数。
     */
    static MINUS: number;
    /**
     * 与 . 键的键控代码值(190)关联的常数。
     */
    static PERIOD: number;
    /**
     * 与 / 键的键控代码值(191)关联的常数。
     */
    static SLASH: number;
    /**
     * 与 ` 键的键控代码值(192)关联的常数。
     */
    static BACKQUOTE: number;
    /**
     * 与 [ 键的键控代码值(219)关联的常数。
     */
    static LEFTBRACKET: number;
    /**
     * 与 \ 键的键控代码值(220)关联的常数。
     */
    static BACKSLASH: number;
    /**
     * 与 ] 键的键控代码值(221)关联的常数。
     */
    static RIGHTBRACKET: number;
    /**
     * 与 ' 键的键控代码值(222)关联的常数。
     */
    static QUOTE: number;
    /**
     * 与 Alternate(Option)键的键控代码值(18)关联的常数。
     */
    static ALTERNATE: number;
    /**
     *  与 Backspace 的键控代码值(8)关联的常数。
     */
    static BACKSPACE: number;
    /**
     * 与 Caps Lock 的键控代码值(20)关联的常数。
     */
    static CAPS_LOCK: number;
    /**
     * 与 Mac 命令键(15)关联的常数。
     */
    static COMMAND: number;
    /**
     * 与 Ctrl 的键控代码值(17)关联的常数。
     */
    static CONTROL: number;
    /**
     * 与 Delete 的键控代码值(46)关联的常数。
     */
    static DELETE: number;
    /**
     * 与 Enter 的键控代码值(13)关联的常数。
     */
    static ENTER: number;
    /**
     * 与 Esc 的键控代码值(27)关联的常数。
     */
    static ESCAPE: number;
    /**
     * 与 Page Up 的键控代码值(33)关联的常数。
     */
    static PAGE_UP: number;
    /**
     * 与 Page Down 的键控代码值(34)关联的常数。
     */
    static PAGE_DOWN: number;
    /**
     * 与 End 的键控代码值(35)关联的常数。
     */
    static END: number;
    /**
     * 与 Home 的键控代码值(36)关联的常数。
     */
    static HOME: number;
    /**
     * 与向左箭头键的键控代码值(37)关联的常数。
     */
    static LEFT: number;
    /**
     * 与向上箭头键的键控代码值(38)关联的常数。
     */
    static UP: number;
    /**
     * 与向右箭头键的键控代码值(39)关联的常数。
     */
    static RIGHT: number;
    /**
     * 与向下箭头键的键控代码值(40)关联的常数。
     */
    static DOWN: number;
    /**
     * 与 Shift 的键控代码值(16)关联的常数。
     */
    static SHIFT: number;
    /**
     * 与空格键的键控代码值(32)关联的常数。
     */
    static SPACE: number;
    /**
     * 与 Tab 的键控代码值(9)关联的常数。
     */
    static TAB: number;
    /**
     * 与 Insert 的键控代码值(45)关联的常数。
     */
    static INSERT: number;
}
/**
 * 滤镜基类
 * 主要用于判断是否是滤镜
 *
 * Created by 黑暗之神KDS on 2017-01-01 16:04:32.
 */
declare class Filter {
}
/**
 * 模糊滤镜
 * 用于模糊显示对象用
 * Created by 黑暗之神KDS on 2017-01-01 16:04:32.
 */
declare class BlurFilter extends Filter {
    /**
     * 模糊滤镜的强度(值越大，越不清晰） 如strength=4
     */
    strength: number;
    /**
     * 模糊滤镜
     * @param	strength	模糊滤镜的强度值 默认值=4
     */
    constructor(strength?: number);
}
/**
 * 颜色滤镜
 * 使用 ColorFilter 类可以将 4 x 5 矩阵转换应用于输入图像上的每个像素的 RGBA 颜色和 Alpha 值，
 * 以生成具有一组新的 RGBA 颜色和 Alpha 值的结果。该类允许饱和度更改、色相旋转、亮度转 Alpha 以及各种其他效果。
 * 您可以将滤镜应用于任何显示对象（即，从 Sprite 类继承的对象）。
 * 注意：对于 RGBA 值，最高有效字节代表红色通道值，其后的有效字节分别代表绿色、蓝色和 Alpha 通道值。
 *
 * 利用此颜色矩阵可以制作：色相、明暗、灰度、色调等效果
 * // 默认值
 * 1,0,0,0,0,
 * 0,1,0,0,0,
 * 0,0,1,0,0,
 * 0,0,0,1,0
 * // 原理
 * a[0]  a[1]  a[2]  a[3]  a[4]
 * a[5]  a[6]  a[7]  a[8]  a[9]
 * a[10] a[11] a[12] a[13] a[14]
 * a[15] a[16] a[17] a[18] a[19]
 *
 * redResult   = (a[0]  * srcR) + (a[1]  * srcG) + (a[2]  * srcB) + (a[3]  * srcA) + a[4]
 * greenResult = (a[5]  * srcR) + (a[6]  * srcG) + (a[7]  * srcB) + (a[8]  * srcA) + a[9]
 * blueResult  = (a[10] * srcR) + (a[11] * srcG) + (a[12] * srcB) + (a[13] * srcA) + a[14]
 * alphaResult = (a[15] * srcR) + (a[16] * srcG) + (a[17] * srcB) + (a[18] * srcA) + a[19]
 *
 * Created by 黑暗之神KDS on 2017-01-01 16:04:32.
 */
declare class ColorFilter extends Filter {
    /**
     * 构造函数 默认值=4
     */
    constructor(mat?: Array<any>);
}
/**
 * 发光滤镜
 * 也可以当成阴影滤使用
 *
 * Created by 黑暗之神KDS on 2017-01-01 16:04:32.
 */
declare class GlowFilter extends Filter {
    /**
     * 创建发光滤镜
     * @param	color	滤镜的颜色
     * @param	blur	边缘模糊的大小 默认值=4
     * @param	offX	X轴方向的偏移 默认值=6
     * @param	offY	Y轴方向的偏移 默认值=6
     */
    constructor(color: string, blur?: number, offX?: number, offY?: number);
    /**
     * X轴方向的偏移
     */
    offY: number;
    /**
     * Y轴方向的偏移
     */
    offX: number;
    /**
     * 获取数组形式的颜色格式 [R,G,B,A] 范围0~1
     * @return [Array]
     */
    getColor(): Array<any>;
    /**
     * 模糊程度
     */
    blur: number;
}
/**
 * 色相滤镜
 * 颜色旋转滤镜，整体颜色旋转
 * Created by 黑暗之神KDS on 2017-01-01 16:04:32.
 */
declare class HueFilter extends ColorFilter {
    /**
     * 我的颜色矩阵 5x4
     */
    colorMat: number[];
    /**
     * 构造函数
     * -180~180
     * -1~-120 normal -> green
     * -121~-180
     * @param hue 取值范围-180~180，0表示没有色相旋转 默认值=0
     */
    constructor(hue?: number);
}
/**
 * 声道
 * 用来控制程序中的声音。每个声音均分配给一个声道，
 * 而且应用程序可以具有混合在一起的多个声道。
 * 包含控制声音的播放、暂停、停止、音量的方法，
 * 以及获取声音的播放状态、总时间、当前播放时间、总循环次数、播放地址等信息的方法。
 * 支持事件：EventObject.COMPLETE
 * Created by 黑暗之神KDS on 2017-01-01 16:04:32.
 */
declare class SoundChannel extends EventDispatcher {
    /**
     * 声音地址。
     */
    url: string;
    /**
     * 循环次数。
     */
    loops: number;
    /**
     * 开始时间。
     */
    startTime: number;
    /**
     * 表示声音是否已暂停。
     */
    isStopped: boolean;
    /**
     * 音量范围从 0（静音）至 1（最大音量）。
     */
    volume: number;
    /**
     * 获取当前播放时间。
     */
    get position(): number;
    /**
     * 获取总时间。
     */
    get duration(): number;
    /**
     * 播放。
     */
    play(): void;
    /**
     * 停止。
     */
    stop(): void;
    /**
     * 暂停。
     */
    pause(): void;
    /**
     * 继续播放。
     */
    resume(): void;
}
/**
 * 请求
 * 通过封装 HTML XMLHttpRequest 对象提供了对 HTTP 协议的完全的访问，包括做出 POST 和 HEAD 请求以及普通的 GET 请求的能力。
 * 只提供以异步的形式返回 Web 服务器的响应，并且能够以文本或者二进制的形式返回内容。
 * 注意：建议每次请求都使用新的 HttpRequest 对象，因为每次调用该对象的send方法时，都会清空之前设置的数据，并重置 HTTP 请求的状态，
 * 这会导致之前还未返回响应的请求被重置，从而得不到之前请求的响应结果。
 * 支持事件
 * EventObject.COMPLETE 加载完成事件 onComplete(content:any)
 * EventObject.PROGRESS 加载过程事件（一般大文件才有） onProgress(progress:number)
 * EventObject.ERROR 加载错误事件
 *
 * // 代码示例：
 * var ur = new HttpRequest();
 * ur.send("http://www.gamecreator.com.cn");
 * ur.on(EventObject.COMPLETE, this, (content:string) => {
 *      // to do
 * });
 * ur.on(EventObject.PROGRESS, this, (progress:number) => {
 *      // 进度 0~1
 *      trace("进度=",progress)
 * });
 * ur.on(EventObject.ERROR, this, (error:string) => {
 *      // to do
 *      trace(error);
 * });
 *
 * Created by 黑暗之神KDS on 2017-01-01 16:04:32.
 */
declare class HttpRequest extends EventDispatcher {
    /**
     * 请求服务器
     * @param params {url:string,data:{xxx:yyy},method:"post",responseType:"json",gcToken:null} method="post/get" responseType="json/text"
     * @param succeed succeed(res)
     * @param failed failed()
     */
    static requestServer(params: any, succeed: Function, failed: Function): void;
    /**
     * 发送 HTTP 请求。
     * @param	url				请求的地址。大多数浏览器实施了一个同源安全策略，并且要求这个 URL 与包含脚本的文本具有相同的主机名和端口。
     * @param	data			(default = null)发送的数据。如 "{ mode: 6, act: 5 }" 或 "act=5&mode=6"
     * @param	method			(default = "get")用于请求的 HTTP 方法。值包括 "get"、"post"、"head"。
     * @param	responseType	(default = "text")Web 服务器的响应类型，可设置为 "text"、"json"、"xml"、"arraybuffer"。
     * @param	headers			(default = null) HTTP 请求的头部信息。参数形如key-value数组：key是头部的名称，不应该包括空白、冒号或换行；value是头部的值，不应该包括换行。比如["Content-Type", "application/json"]。
     */
    send(url: string, data?: any, method?: string, responseType?: string, headers?: Array<any>): void;
    /**
     * 请求的地址。
     */
    get url(): string;
    /**
     * 返回的数据。
     */
    get data(): any;
    /**
     * 本对象所封装的原生 XMLHttpRequest 引用。
     */
    get http(): XMLHttpRequest;
}
/**
 * 浏览器缓存
 * 用于没有时间限制的数据存储,类似网页的永久cookies，清空缓存或更换浏览器都会失效
 * 储存和读取都是同步的，所以可以代码上下行操作
 * == 使用方式 ==
 * var a = {b:123,c:456,d:"gamecreator"};
 * // 缓存
 * LocalStorage.setJSON("myKey",a);
 * // 读取缓存
 * LocalStorage.getJSON("myKey",b);
 *
 * Created by 黑暗之神KDS on 2017-01-01 16:04:32.
 */
declare class LocalStorage {
    /**
     *  数据列表。
     */
    static items: any;
    /**
     * 表示是否支持LocalStorage。
     */
    static support: boolean;
    /**
     * 存储指定键名和键值，字符串类型。
     * @param key 键名。
     * @param value 键值。
     */
    static setItem(key: string, value: string): void;
    /**
     * 获取指定键名的值。
     * @param key 键名。
     * @return 字符串型值。
     */
    static getItem(key: string): string;
    /**
     * 存储指定键名及其对应的 Object 类型值。
     * @param key 键名。
     * @param value 键值。是 Object 类型，此致会被转化为 JSON 字符串存储。
     */
    static setJSON(key: string, value: any): void;
    /**
     * 获取指定键名对应的Object 类型值。
     * @param key 键名。
     * @return Object 类型值
     */
    static getJSON(key: string): any;
    /**
     * 删除指定键名的信息。
     * @param key 键名。
     */
    static removeItem(key: string): void;
    /**
     * 清除本地存储信息。
     */
    static clear(): void;
}
/**
 * 贴图源
 * 纹理处理类
 *
 * == 使用方式 ==
 * // 加载整张图片使用
 * AssetManager.loadImage("asset/image/xxx.png", Callback.New((tex: Texture) => {
 *      var img = new UIBitmap();
 *      img.texture = tex;
 *      stage.addChild(img);
 * }, this));
 *
 * // 加载作为贴图使用
 * AssetManager.loadImage("asset/image/animation/2.png", Callback.New((tex: Texture) => {
 *      var g = new Graphics();
 *      // 取样从图中的256,256中取得128x128尺寸的切图，并显示在50,50的地方
 *      g.fillTexture(tex, 50, 50, 128, 128, "repeat", new Point(-256, -256));
 *      var sp = new Sprite();
 *      sp.graphics = g;
 *      stage.addChild(sp);
 * }, this));
 *
 * Created by 黑暗之神KDS on 2017-01-01 16:04:32.
 */
declare class Texture extends EventDispatcher {
    /**
     * 默认 UV 信息
     */
    static DEF_UV: Array<any>;
    /**
     * 颠倒的 UV 信息
     */
    static INV_UV: Array<any>;
    /**
     * 图片地址
     */
    url: string;
    /**
     * 表示资源是否已释放
     */
    get disposed(): boolean;
    /**
     * 销毁纹理
     */
    dispose(): void;
    /**
     * 实际宽度。
     */
    width: number;
    /**
     * 实际高度。
     */
    height: number;
    /**
     * 获取Texture上的某个区域的像素点
     * @param	x
     * @param	y
     * @param	width
     * @param	height
     * @return  返回像素点集合
     */
    getPixels(x: number, y: number, width: number, height: number): Array<any>;
}
/**
 * 浏览器状态
 * 是浏览器代理类。封装浏览器及原生 js 提供的一些功能。
 *
 * Created by 黑暗之神KDS on 2017-01-01 16:04:32.
 */
declare class Browser {
    /**
     * 浏览器信息
     */
    static userAgent: string;
    /**
     * 是否在 ios 设备
     */
    static onIOS: boolean;
    /**
     * 是否在移动设备
     */
    static onMobile: boolean;
    /**
     * 是否在 iphone设备
     */
    static onIPhone: boolean;
    /**
     * 是否在 ipad 设备
     */
    static onIPad: boolean;
    /**
     * 是否在 andriod设备
     */
    static onAndriod: boolean;
    /**
     * 是否在 andriod设备
     */
    static onAndroid: boolean;
    /**
     * 是否在 Windows Phone 设备
     */
    static onWP: boolean;
    /**
     * 是否在 QQ 浏览器
     */
    static onQQBrowser: boolean;
    /**
     * 是否在移动端 QQ 或 QQ 浏览器
     */
    static onMQQBrowser: boolean;
    /**
     * 是否在移动端 Safari
     */
    static onSafari: boolean;
    /**
     * 是否在IE浏览器内
     */
    static onIE: boolean;
    /**
     * 微信内
     */
    static onWeiXin: boolean;
    /**
     * 是否在 PC 端
     */
    static onPC: boolean;
    /**
     * 是否在 PC 端
     */
    static onMac: boolean;
    /**
     * 表示是否是 HTTP 协议
     */
    static httpProtocol: boolean;
    /**
     * 音频是否启用
     */
    static webAudioEnabled: boolean;
    /**
     * 音频播放类别
     */
    static soundType: string;
    /**
     * 是否开启触摸
     */
    static enableTouch: boolean;
    /**
     * 获取浏览器当前时间戳，单位为毫秒。
     */
    static now(): number;
    /**
     * 浏览器窗口可视宽度。
     * 通过分析浏览器信息获得。浏览器多个属性值优先级为：window.innerWidth(包含滚动条宽度) > document.body.clientWidth(不包含滚动条宽度)，如果前者为0或为空，则选择后者。
     */
    static get clientWidth(): number;
    /**
     * 浏览器窗口可视高度。
     * 通过分析浏览器信息获得。浏览器多个属性值优先级为：window.innerHeight(包含滚动条高度) > document.body.clientHeight(不包含滚动条高度) > document.documentElement.clientHeight(不包含滚动条高度)，如果前者为0或为空，则选择后者。
     */
    static get clientHeight(): number;
    /**
     * 浏览器窗口物理宽度。考虑了设备像素比。
     */
    static get width(): number;
    /**
     * 浏览器窗口物理高度。考虑了设备像素比。
     */
    static get height(): number;
    /**
     * 设备像素比。
     */
    static get pixelRatio(): number;
    /**
     * 画布容器，用来盛放画布的容器。方便对画布进行控制
     */
    static container: any;
}
/**
 * 数据字典
 * 可用于非字符串作为键的键值对（类似对象的内存地址作为键）
 * 普通的键值对都是字符串储存键，比如{a:123}，中的a是字符串"a"，而如果想要使用对象作为键的话可使用此类
 * 使用原生JS中的Map实现
 *
 * Created by 黑暗之神KDS on 2017-01-01 16:04:32.
 */
declare class Dictionary {
    /**
     * 获取所有的子元素列表。
     */
    get values(): Array<any>;
    /**
     * 获取所有的子元素键名列表。
     */
    get keys(): Array<any>;
    /**
     * 给指定的键名设置值。
     * @param	key 键名。
     * @param	value 值。
     */
    set(key: any, value: any): void;
    /**
     * 获取指定对象的键名索引。
     * @param	key 键名对象。
     * @return 键名索引。
     */
    indexOf(key: any): number;
    /**
     * 返回指定键名的值。
     * @param	key 键名对象。
     * @return 指定键名的值。
     */
    get(key: any): any;
    /**
     * 移除指定键名的值。
     * @param	key 键名对象。
     * @return 是否成功移除。
     */
    remove(key: any): boolean;
    /**
     * 清除此对象的键名列表和键值列表。
     */
    clear(): void;
}
/**
 * 缓动函数
 * 定义了缓动函数，以便实现[Tween]中的缓动效果，使用Tween方式的相关代码可以参考Tween
 * == 相关代码 ==
 * // 获取线性过渡中在100~1000中的50%时的状态值
 * var totalTime = 1000;
 * var currentTime = 500; // 即进行到了50%的程度，同时该值也可以大于totalTime，即超过100%
 * var start = 100;
 * var end = 1000;
 * var v = Ease.linearNone(currentTime,start,end-start,totalTime);
 * alert(v); // 550，即（1000-100）*(500/1000) + 100 = 550
 *
 * Created by 黑暗之神KDS on 2017-01-01 16:04:32.
 */
declare class Ease {
    /**
     * 定义无加速持续运动。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static linearNone(t: number, b: number, c: number, d: number): number;
    /**
     * 定义无加速持续运动。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static linearIn(t: number, b: number, c: number, d: number): number;
    /**
     * 定义无加速持续运动。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static linearInOut(t: number, b: number, c: number, d: number): number;
    /**
     * 定义无加速持续运动。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static linearOut(t: number, b: number, c: number, d: number): number;
    /**
     * 方法以零速率开始运动，然后在执行时加快运动速度。
     * 它的运动是类似一个球落向地板又弹起后，几次逐渐减小的回弹运动。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static bounceIn(t: number, b: number, c: number, d: number): number;
    /**
     * 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * 它的运动是类似一个球落向地板又弹起后，几次逐渐减小的回弹运动。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static bounceInOut(t: number, b: number, c: number, d: number): number;
    /**
     * 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * 它的运动是类似一个球落向地板又弹起后，几次逐渐减小的回弹运动。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static bounceOut(t: number, b: number, c: number, d: number): number;
    /**
     * 开始时往后运动，然后反向朝目标移动。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @param	s 指定过冲量，此处数值越大，过冲越大。
     * @return 指定时间的插补属性的值。
     */
    static backIn(t: number, b: number, c: number, d: number, s?: number): number;
    /**
     * 开始运动时是向后跟踪，再倒转方向并朝目标移动，稍微过冲目标，然后再次倒转方向，回来朝目标移动。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @param	s 指定过冲量，此处数值越大，过冲越大。
     * @return 指定时间的插补属性的值。
     */
    static backInOut(t: number, b: number, c: number, d: number, s?: number): number;
    /**
     * 开始运动时是朝目标移动，稍微过冲，再倒转方向回来朝着目标。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @param	s 指定过冲量，此处数值越大，过冲越大。
     * @return 指定时间的插补属性的值。
     */
    static backOut(t: number, b: number, c: number, d: number, s?: number): number;
    /**
     * 方法以零速率开始运动，然后在执行时加快运动速度。
     * 其中的运动由按照指数方式衰减的正弦波来定义。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @param	a 指定正弦波的幅度。
     * @param	p 指定正弦波的周期。
     * @return 指定时间的插补属性的值。
     */
    static elasticIn(t: number, b: number, c: number, d: number, a?: number, p?: number): number;
    /**
     * 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * 其中的运动由按照指数方式衰减的正弦波来定义。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @param	a 指定正弦波的幅度。
     * @param	p 指定正弦波的周期。
     * @return 指定时间的插补属性的值。
     */
    static elasticInOut(t: number, b: number, c: number, d: number, a?: number, p?: number): number;
    /**
     * 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * 其中的运动由按照指数方式衰减的正弦波来定义。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @param	a 指定正弦波的幅度。
     * @param	p 指定正弦波的周期。
     * @return 指定时间的插补属性的值。
     */
    static elasticOut(t: number, b: number, c: number, d: number, a?: number, p?: number): number;
    /**
     * 以零速率开始运动，然后在执行时加快运动速度。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static strongIn(t: number, b: number, c: number, d: number): number;
    /**
     * 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static strongInOut(t: number, b: number, c: number, d: number): number;
    /**
     * 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static strongOut(t: number, b: number, c: number, d: number): number;
    /**
     * 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * Sine 缓动方程中的运动加速度小于 Quad 方程中的运动加速度。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static sineInOut(t: number, b: number, c: number, d: number): number;
    /**
     * 以零速率开始运动，然后在执行时加快运动速度。
     * Sine 缓动方程中的运动加速度小于 Quad 方程中的运动加速度。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static sineIn(t: number, b: number, c: number, d: number): number;
    /**
     * 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * Sine 缓动方程中的运动加速度小于 Quad 方程中的运动加速度。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static sineOut(t: number, b: number, c: number, d: number): number;
    /**
     * 以零速率开始运动，然后在执行时加快运动速度。
     * Quint 缓动方程的运动加速大于 Quart 缓动方程。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static quintIn(t: number, b: number, c: number, d: number): number;
    /**
     * 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * Quint 缓动方程的运动加速大于 Quart 缓动方程。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static quintInOut(t: number, b: number, c: number, d: number): number;
    /**
     * 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * Quint 缓动方程的运动加速大于 Quart 缓动方程。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static quintOut(t: number, b: number, c: number, d: number): number;
    /**
     * 方法以零速率开始运动，然后在执行时加快运动速度。
     * Quart 缓动方程的运动加速大于 Cubic 缓动方程。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static quartIn(t: number, b: number, c: number, d: number): number;
    /**
     * 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * Quart 缓动方程的运动加速大于 Cubic 缓动方程。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static quartInOut(t: number, b: number, c: number, d: number): number;
    /**
     * 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * Quart 缓动方程的运动加速大于 Cubic 缓动方程。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static quartOut(t: number, b: number, c: number, d: number): number;
    /**
     * 方法以零速率开始运动，然后在执行时加快运动速度。
     * Cubic 缓动方程的运动加速大于 Quad 缓动方程。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static cubicIn(t: number, b: number, c: number, d: number): number;
    /**
     * 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * Cubic 缓动方程的运动加速大于 Quad 缓动方程。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static cubicInOut(t: number, b: number, c: number, d: number): number;
    /**
     * 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * Cubic 缓动方程的运动加速大于 Quad 缓动方程。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static cubicOut(t: number, b: number, c: number, d: number): number;
    /**
     * 方法以零速率开始运动，然后在执行时加快运动速度。
     * Quad 缓动方程中的运动加速度等于 100% 缓动的时间轴补间的运动加速度，并且显著小于 Cubic 缓动方程中的运动加速度。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static quadIn(t: number, b: number, c: number, d: number): number;
    /**
     * 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * Quad 缓动方程中的运动加速度等于 100% 缓动的时间轴补间的运动加速度，并且显著小于 Cubic 缓动方程中的运动加速度。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static quadInOut(t: number, b: number, c: number, d: number): number;
    /**
     * 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * Quad 缓动方程中的运动加速度等于 100% 缓动的时间轴补间的运动加速度，并且显著小于 Cubic 缓动方程中的运动加速度。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static quadOut(t: number, b: number, c: number, d: number): number;
    /**
     * 方法以零速率开始运动，然后在执行时加快运动速度。
     * 其中每个时间间隔是剩余距离减去一个固定比例部分。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static expoIn(t: number, b: number, c: number, d: number): number;
    /**
     * 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * 其中每个时间间隔是剩余距离减去一个固定比例部分。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static expoInOut(t: number, b: number, c: number, d: number): number;
    /**
     * 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * 其中每个时间间隔是剩余距离减去一个固定比例部分。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static expoOut(t: number, b: number, c: number, d: number): number;
    /**
     * 方法以零速率开始运动，然后在执行时加快运动速度。
     * 缓动方程的运动加速会产生突然的速率变化。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static circIn(t: number, b: number, c: number, d: number): number;
    /**
     * 开始运动时速率为零，先对运动进行加速，再减速直到速率为零。
     * 缓动方程的运动加速会产生突然的速率变化。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static circInOut(t: number, b: number, c: number, d: number): number;
    /**
     * 以较快速度开始运动，然后在执行时减慢运动速度，直至速率为零。
     * 缓动方程的运动加速会产生突然的速率变化。
     * @param	t 指定当前时间，介于 0 和持续时间之间（包括二者）。
     * @param	b 指定动画属性的初始值。
     * @param	c 指定动画属性的更改总计。
     * @param	d 指定运动的持续时间。
     * @return 指定时间的插补属性的值。
     */
    static circOut(t: number, b: number, c: number, d: number): number;
}
/**
 * 缓动类
 * 使用此类能够实现对目标对象属性的渐变。一般配合[Ease]使用
 *
 * Created by 黑暗之神KDS on 2017-01-01 16:04:32.
 */
declare class Tween {
    /**
     * 更新回调，缓动数值发生变化时，回调变化的值
     */
    update: Callback;
    /**
     * 缓动对象的props属性到目标值。
     * @param	target 目标对象(即将更改属性值的对象)。
     * @param	props 变化的属性列表，比如
     * @param	duration 花费的时间，单位毫秒。
     * @param	ease 缓动类型，默认为匀速运动。默认值=null
     * @param	complete 结束回调函数。默认值=null
     * @param	delay 延迟执行时间。默认值=0
     * @param	coverBefore 是否覆盖之前的缓动。默认值=false
     * @return	返回Tween对象。
     */
    static to(target: any, props: any, duration: number, ease?: Function, complete?: Callback, delay?: number, coverBefore?: boolean): Tween;
    /**
     * 从props属性，缓动到当前状态。
     * @param	target 目标对象(即将更改属性值的对象)。
     * @param	props 变化的属性列表，比如
     * @param	duration 花费的时间，单位毫秒。
     * @param	ease 缓动类型，默认为匀速运动。默认值=null
     * @param	complete 结束回调函数。默认值=null
     * @param	delay 延迟执行时间。默认值=0
     * @param	coverBefore 是否覆盖之前的缓动。默认值=false
     * @return	返回Tween对象。
     */
    static from(target: any, props: any, duration: number, ease?: Function, complete?: Callback, delay?: number, coverBefore?: boolean): Tween;
    /**
     * 缓动对象的props属性到目标值。
     * @param	target 目标对象(即将更改属性值的对象)。
     * @param	props 变化的属性列表，比如
     * @param	duration 花费的时间，单位毫秒。
     * @param	ease 缓动类型，默认为匀速运动。默认值=null
     * @param	complete 结束回调函数。默认值=null
     * @param	delay 延迟执行时间。默认值=0
     * @param	coverBefore 是否覆盖之前的缓动。默认值=false
     * @return	返回Tween对象。
     */
    to(target: any, props: any, duration: number, ease?: Function, complete?: Callback, delay?: number, coverBefore?: boolean): Tween;
    /**
     * 从props属性，缓动到当前状态。
     * @param	target 目标对象(即将更改属性值的对象)。
     * @param	props 变化的属性列表，比如
     * @param	duration 花费的时间，单位毫秒。
     * @param	ease 缓动类型，默认为匀速运动。默认值=null
     * @param	complete 结束回调函数。默认值=null
     * @param	delay 延迟执行时间。默认值=0
     * @param	coverBefore 是否覆盖之前的缓动。默认值=0
     * @return	返回Tween对象。
     */
    from(target: any, props: any, duration: number, ease?: Function, complete?: Callback, delay?: number, coverBefore?: boolean): Tween;
    /**
     * 设置当前执行比例
     */
    progress: number;
    /**
     * 立即结束缓动并到终点。
     */
    complete(): void;
    /**
     * 暂停缓动，可以通过resume或restart重新开始。
     */
    pause(): void;
    /**
     * 设置开始时间。
     * @param	startTime 开始时间。
     */
    setStartTime(startTime: number): void;
    /**
     * 清理指定目标对象上的所有缓动。
     * @param	target 目标对象。
     */
    static clearAll(target: any): void;
    /**
     * 清理某个缓动。
     * @param	tween 缓动对象。
     */
    static clear(tween: Tween): void;
    /**
     * 停止并清理当前缓动。
     */
    clear(): void;
    /**
     * 重新开始暂停的缓动。
     */
    restart(): void;
    /**
     * 恢复暂停的缓动。
     */
    resume(): void;
}
