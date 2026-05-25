/**
 * 过渡数据
 * Created by JayLen on 2020-11-17 21:55:01.
 */
declare class TransData {
    /**
     * 过渡方式：0-均匀过渡 1-缓动过渡 2-曲线过渡 默认值=0
     */
    transType: number;
    /**
     * 循环方式：0-无(一次) 1-循环 2-一次往返-返回时从头过渡 3-一次往返-返回时从尾过渡 4-循环往返-返回时从头过渡 5-循环往返-返回时从尾过渡 默认值=0
     */
    loopType: number;
    /**
     * 时间类别：0-无() 1-帧数 2-秒数 3-可选择单位 默认值=0
     */
    timeType: number;
    /**
     * 时间单位：0-帧数 1-秒数 默认值=1
     */
    timeUnit: number;
    /**
     * 总时间数(帧数或者秒数) 默认值=2
     */
    totalTime: number;
    /**
     * 缓动方式 默认值=0
     */
    tweenType: number;
    /**
     * 缓动方式名称(如backOut) 默认值="bounceIn"
     */
    tweenTypeName: string;
    /**
     * 曲线数据 默认值=[[0, 0, 0, 99, 1, 1, 1, 3], [0, 100, 100]]
     */
    curveData: any[];
    /**
     * 刷新时间(默认16，表示16毫秒，逐帧刷新) 默认值=16
     */
    refreshInterval: number;
    /**
     * 是否循环
     */
    static isLoop(transData: TransData): boolean;
    /**
     * 是否使用帧
     */
    static isUseFrame(transData: TransData): boolean;
    /**
     * 是否使用时间
     */
    static isUseTime(transData: TransData): boolean;
}
