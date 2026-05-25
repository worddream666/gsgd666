/**
 * 数学工具类
 * GC内部封装的常用的一些数学相关的函数
 * Created by 黑暗之神KDS on 2017-08-22 20:52:51.
 */
declare class MathUtils {
    /**
     * 角度转弧度。
     * @param	angle 角度值。
     * @return	返回弧度值。
     */
    static angle2Radian(angle: number): number;
    /**
     * 弧度转换为角度。
     * @param	radian 弧度值。
     * @return	返回角度值。
     */
    static radian2Angle(radian: number): number;
    /**
     * 返回0~n-1的正整数
     * @param n
     * @return [number]
     */
    static rand(n: number): number;
    /**
     * 获取两点之间的角度 0-360
     * @param x1 起点x
     * @param y1 起点y
     * @param x2 终点x
     * @param y2 终点y
     * @return [number] 终点相对于起点的角度
     */
    static direction360(x1: number, y1: number, x2: number, y2: number): number;
    /**
     * 固定整数位，未满则补充0
     * 如 fixIntDigit(2,3)  -->  003
     * @param s 数值 string | number
     * @param fixDigit [可选] 默认值=4 固定的位数
     * @return [string]
     */
    static fixIntDigit(s: any, fixDigit?: number): string;
    /**
     * 强制转化为整数
     * @param v 对于不符合要求的参数则转为0
     */
    static int(v: any): number;
    /**
     * 转化为浮点数
     * @param v 对于不符合要求的参数则转为0
     */
    static float(v: any): number;
    /**
     * 判断是否在度数范围内
     * @param limitMax 上限 -360~360
     * @param limitMin 下线 -360~360
     * @param angle 指定的角度
     * @return [boolean]
     */
    static inAngleRange(limitMax: number, limitMin: number, angle: number): boolean;
    /**
     * 判断一个数是否是2的n次幂
     * @param x 一个数
     * @return [boolean]
     */
    static isPowerOfTwo(x: number): boolean;
    /**
     * 获取离x最近的一个2的次幂数
     * @param x
     * @return [number]
     */
    static nextHighestPowerOfTwo(x: number): number;
    /**
     * 计算获取二次贝塞尔曲线上的某个点具体位置
     * @param startX 起点x
     * @param startY 起点y
     * @param CtrlX 控制点x
     * @param CtrlY 控制点y
     * @param endX 终点x
     * @param endY 终点y
     * @param t 0~1 表示起点到终点间某个点的位置信息 0表示起点，1表示终点，0.5则表示起点-终点的一半
     * @param resultPoint [可选] 默认值=null 如存在则将数据装入到该点中
     * @return 计算点的具体位置
     */
    static getBezierPoint2(startX: number, startY: number, CtrlX: number, CtrlY: number, endX: number, endY: number, t: number, resultPoint?: Point): Point;
}
