/**
 * 游戏内置功能函数
 * 即将会被上层自定义事件取缔而不作为GC2D内核中内置的功能
 * Created by 黑暗之神KDS on 2019-02-04 16:43:35.
 */
declare class GameFunction {
    /**
     * 场景震动:当前帧直接震动，总计震动了t帧
     * @param strength 幅度
     * @param t 帧数
     */
    static shake(strength: number, t: number): void;
    /**
     * 更改场景色调:当前帧直接更改色调，总计更改了t帧
     * @param r 红色
     * @param g 绿色
     * @param b 蓝色
     * @param gray 灰度
     * @param t 时间（帧）
     * @param mr 红色曝光
     * @param mg 绿色曝光
     * @param mb 蓝色曝光
     * @param layer 层次（后期追加的高级特性）
     * @param tCur 当前的T
     */
    static tonal(r: number, g: number, b: number, gray: number, t: number, mr: number, mg: number, mb: number, layer?: number, tCur?: number): void;
    /**
     * 场景镜头移动:当前帧直接开始移动，总计移动了t帧
     * @param type 0-直接坐标 1-锁定对象
     * @param x 指定的坐标x
     * @param y 指定的坐标y
     * @param soIndex 锁定的对象
     * @param tween 缓动
     * @param t 帧数
     * @param tCur 当前的帧数（首次为null）
     */
    static cameraMove(type: number, x: number, y: number, soIndex: number, tween: boolean, t: number, tCur?: number, window_width?: number, window_height?: number): void;
    /**
     * 场景雾图形变更
     * @param url
     * @param sx
     * @param sy
     * @param dx
     * @param dy
     * @param alpha
     * @param blendMode
     */
    static fogSet(url: string, sx: number, sy: number, dx: number, dy: number, alpha: number, blendMode: number): void;
}
