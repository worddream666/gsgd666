/**
 * 针对游戏相关的常用工具方法
 * 关于朝向
 *  --朝向可参考以5为中心的小键盘数字：
 *    1-左下 2-下 3-右下 4-左 6-右 7-左上 8-上 9-右上
 *
 * Created by 黑暗之神KDS on 2018-08-08 21:12:53.
 */
declare class GameUtils {
    /**
     * 获取实际资源的面向，由于实际资源未必有指定的面向，这里会做为映射
     * 如只有四方向的行走图，获取右上方向的话则映射为方向右
     * @param ori 面向
     * @param oriMode [可选] 默认值=8 面向模式1/2/3/5/8
     * @return [number] 替换映射后的面向
     */
    static getAssetOri(ori: number, oriMode?: number): number;
    /**
     * 根据0-360角度获取对应的面向
     * @param angle 角度 0-360
     * @return [number] 返回面向 1/2/3/4/6/7/8/9
     */
    static getOriByAngle(angle: number): number;
    /**
     * 根据面向获取0-360度
     * @param ori 面向 1/2/3/4/6/7/8/9
     * @return [number] 角度 0-360
     */
    static getAngleByOri(ori: number): number;
    /**
     * 获取相反的面向
     * @param ori 面向 1/2/3/4/6/7/8/9
     * @return 返回与ori相反的面向，如2的反方向是8
     */
    static getFlipOri(ori: number): number;
    /**
     * [实际坐标]->[格子坐标]
     * @param p 实际坐标
     * @param helpP [可选] 默认值=null 如果存在则使用该对象来自装载而非创建新的Point对象
     * @return [Point] 格子坐标
     */
    static getGridPostion(p: Point, helpP?: Point): Point;
    /**
     * [实际坐标]->[实际坐标中心点]
     * @param p 实际坐标
     * @param helpP [可选] 默认值=null 如果存在则使用该对象来自装载而非创建新的Point对象
     * @return [Point]
     */
    static getGridCenter(p: Point, helpP?: Point): Point;
    /**
     * [格子坐标] -> [实际坐标中心点]
     * @param gridP 格子坐标
     * @param helpP [可选] 默认值=null 如果存在则使用该对象来自装载而非创建新的Point对象
     * @return [Point]
     */
    static getGridCenterByGrid(gridP: Point, helpP?: Point): Point;
    /**
     * 查询临近的同状态路径，如GameCreator编辑器中油漆桶则使用了该方法
     * @param mapData 图数据
     * @param gridX 起点格子
     * @param gridY 起点格子
     * @param width 总宽度
     * @param height 总高度
     * @param attributes 判断格子状态相同的属性集，即与mapData数据中的有一种属性不同的话也视为不同的状态 null 则表示直接对比
     * @param limit 默认值=100 限制搜索仅在周围limit距离的正方形范围内
     * @return [Point]
     */
    static getSameStateGrid(mapData: any[][], gridX: number, gridY: number, width: number, height: number, attributes: string[], limit?: number): Point[];
    /**
     * 获取两个格子之间的补间格子
     * @param grid1 起点格
     * @param grid2 终点格
     * @param per [可选] 默认值=0.1 每次遍历的比例，如果0.1表示起点格到终点格切分10次后返回不重复的中间格
     * @return [Point]
     */
    static getMendingGrids(grid1: Point, grid2: Point, per?: number): Point[];
    /**
     * 获取最小等比适配比例 canvasRect.width/rect.width 与 canvasRect.height/rect.height的最小值
     * @param rect
     * @param canvasRect 画布矩形
     */
    static getAutoFitSizePre(rect: Rectangle, canvasRect: Rectangle): number;
    /**
     * 判断是否继承于某个节点（节点系统中需要有parent属性来指向父节点）
     * @param node 节点
     * @param parentNode 疑似父节点
     * @return 是否是真正的父节点
     */
    static isInheritNode(node: any, parentNode: any): boolean;
    /**
     * 根据特定字符串$n来获取n，不符合的返回0
     * @param value 特殊格式：如$6
     * @return 变量ID：如6
     */
    static getVarID(value: string): number;
    /**
    * 根据特定字符串@n来获取n，不符合的返回0
    * @param value 特殊格式：如@6
    * @return 变量ID：如6
    */
    static getGlobalVarID(value: string): number;
    /**
     * 检查是否合法的变量名
     * @param varName 变量名称
     * @return [boolean] 是否合法
     */
    static isLegalVarName(varName: string): boolean;
    /**
     * 获取曲线数据，根据字符串格式的数据
     * 返回格式：[[0,0,startY,maxLength,maxHeight],[type,startX,startY,endX,endY,ctrlX,ctrlY],[type,startX,startY,endX,endY,ctrlX,ctrlY],...]
     *           maxLength=最大长度（仅供参考） maxHeight=最大高度 起点x始终位于0，终点x始终位于100  type=0-线性线段 1-二次贝塞尔曲线片段(拥有ctrlX,ctrlY)
     * @param curveStrData 曲线数据
     * @return groupValue
     */
    static getCurveData(curveStrData: string): any[];
    /**
     * 根据曲线数据获取其中某个点的值
     * 曲线数据的格式：[[0,0,startY,maxLength,maxHeight],[type,startX,startY,endX,endY,ctrlX,ctrlY],[type,startX,startY,endX,endY,ctrlX,ctrlY],...]
     *                         maxLength=最大长度（仅供参考） maxHeight=最大高度 起点x始终位于0，终点x始终位于100  type=0-线性线段 1-二次贝塞尔曲线片段(拥有ctrlX,ctrlY)
     * @param groupValue 曲线数据
     * @param x 0~1 0表示曲线头，1表示曲线尾 假设该曲线是只有一段线性曲线，值范围是0-5000，则0.5的值是2500
     * @return value 值
     */
    static getBezierPoint2ByGroupValue(groupValue: any[], x: number): number;
    /**
     * 根据字符串格式的数据,获取过渡组件Object类型数据
     * @param transData 字符串格式数据
     */
    static getTransData(transDataStr: string): TransData;
    /**
     * 根据传入的参数x,获取过渡对应的值
     * @param transData 过渡数据
     * @param x 范围 0-1
     */
    static getValueByTransData(transData: TransData, x: number): number;
}
/**
 * 点对象
 * 表示二维坐标系的x,y，用于辅助计算
 * Created by 黑暗之神KDS on 2018-06-03 16:11:45.
 */
declare class Point {
    /**
     * 水平坐标
     */
    x: number;
    /**
     * 垂直坐标
     */
    y: number;
    /**
     * 构造函数
     * @param x [可选] 默认值=0 水平坐标
     * @param y [可选] 默认值=0 垂直坐标
     */
    constructor(x?: number, y?: number);
    /**
     * 一次设置水平和垂直坐标
     * @param x 水平坐标
     * @param y 垂直坐标
     * @return [Point] 当前对象
     */
    setTo(x: number, y: number): Point;
    /**
     * 计算当前点和指定点(x，y)的距离。
     * @param	x 指定点的水平坐标。
     * @param	y 指定点的垂直坐标。
     * @return	返回当前点和指定点之间的距离。
     */
    distance(x: number, y: number): number;
    /**
     * 返回字符串形式的值显示：x,y
     * @return [string]
     */
    toString(): string;
    /**
     * 返回from-to两点中间的点
     * @param to 目标点
     * @param from 起点
     * @param per 所在from-to的比例 0~1，0则等于from，1则等于to
     * @return [Point]
     */
    static interpolate(to: Point, from: Point, per: number): Point;
    /**
     * 返回from-to两点中间的点
     * @param toX 目标点x
     * @param toY 目标点y
     * @param fromX 起点x
     * @param fromY 起点y
     * @param per 所在from-to的比例 0~1，0则等于from，1则等于to
     * @return [number]
     */
    static interpolate2(toX: number, toY: number, fromX: number, fromY: number, per: number): number[];
    /**
     * 返回from-to两点中间的距离
     * @param from 起点
     * @param to 终点
     * @return [number]
     */
    static distance(from: Point, to: Point): number;
    /**
     * 返回from-to两点中间的距离
     * @param fromX 起点X
     * @param fromY 起点Y
     * @param toX 到达点X
     * @param toY 到达点Y
     * @return [number]
     */
    static distance2(fromX: number, fromY: number, toX: number, toY: number): number;
    /**
     * 距离的平方
     * 有时候为了优化计算，只是比较两个距离的长度而不需要具体值，可以调用此函数，比distance减少了开方的计算
     * @param p1 起点
     * @param p2 终点
     * @return [number] 起点-终点距离的平方
     */
    static distanceSquare(p1: Point, p2: Point): number;
    /**
     * 距离的平方
     * 有时候为了优化计算，只是比较两个距离的长度而不需要具体值，可以调用此函数，比distance减少了开方的计算
     * @param ax 起点x
     * @param ay 起点y
     * @param bx 终点x
     * @param by 终点y
     * @return [number] 起点-终点距离的平方
     */
    static distanceSquare2(ax: number, ay: number, bx: number, by: number): number;
}
/**
 * 矩形对象
 * 根据x、y、width、height确定一个矩形，用于辅助计算
 * Created by 黑暗之神KDS on 2018-08-08 21:12:53.
 */
declare class Rectangle {
    /**
     * 矩形左上角的坐标x
     */
    x: number;
    /**
     * 矩形左上角的坐标y
     */
    y: number;
    /**
     * 矩形宽度
     */
    width: number;
    /**
     * 矩形高度
     */
    height: number;
    /**
     * 构造函数
     * @param x [可选] 默认值=0
     * @param y [可选] 默认值=0
     * @param width [可选] 默认值=0
     * @param height [可选] 默认值=0
     */
    constructor(x?: number, y?: number, width?: number, height?: number);
    /**
     * 右边坐标x（即x+width的值）
     */
    get right(): number;
    /**
     * 底部坐标y（即y+height的值）
     */
    get bottom(): number;
    /**
     * 一次设置指定的值
     * @param x x轴的值
     * @param y y轴的值
     * @param width 宽度
     * @param height 高度
     * @return [Rectangle]
     */
    setTo(x: number, y: number, width: number, height: number): Rectangle;
    /**
     * 是否包含指定的点
     * @param x 指定点的x坐标
     * @param y	指定点的y坐标
     * @return	是否包含 true=包含 false=不包含
     */
    contains(x: number, y: number): boolean;
    /**
     * 是否相交与另一个指定的矩形相交
     * @param	rect 指定的矩形
     * @return	是否相交 true=相交 false=不相交
     */
    intersects(rect: Rectangle): boolean;
    /**
     * 获取与指定矩形相交的区域
     * @param rect 指定的矩形
     * @param out [可选] 默认值=null 如果传入此参数的话则将返回值返回到该对象中以便减少开销
     * @return [Rectangle] 相交的区域
     */
    intersection(rect: Rectangle, out?: Rectangle): Rectangle;
    /**
     * 通过填充两个矩形之间的水平和垂直空间，将这两个矩形组合在一起以创建一个新的 Rectangle 对象
     * 注意：union() 方法忽略高度或宽度值为 0 的矩形，如：var rect2:Rectangle = new Rectangle(300,300,50,0);
     * @param source 要添加到此 Rectangle 对象的 Rectangle 对象。
     * @param out [可选] 默认值=null 如果传入此参数的话则将返回值返回到该对象中以便减少开销
     * @return 充当两个矩形的联合的新 Rectangle 对象。
     */
    union(source: Rectangle, out?: Rectangle): Rectangle;
    /**
     * 返回一个克隆的该对象
     * @param out [可选] 默认值=null 如果传入此参数的话则将返回值返回到该对象中以便减少开销
     * @return [Rectangle]
     */
    clone(out?: Rectangle): Rectangle;
    /**
     * 返回字符串形式的值显示：x,y,width,height
     * @return [string]
     */
    toString(): string;
    /**
     * 是否与指定的矩形相等
     * @param	rect 指定的矩形
     * @return	是否相等 true=相等 false=不相等
     */
    equals(rect: Rectangle): boolean;
    /**
     * 确定此 Rectangle 对象是否为空
     * @return 如果 Rectangle 对象的宽度或高度小于等于 0，则返回 true 值，否则返回 false
     */
    isEmpty(): boolean;
}
