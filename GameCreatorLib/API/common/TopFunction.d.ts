/**
 * 【顶级函数】-输出
 */
declare function trace(...arg: any[]): any;
/**
 * 【顶级函数】：延迟n帧后执行
 * @param func 执行的方法
 * @param frame 延迟的帧数
 * @return [string] 标识
 */
declare function setFrameout(func: Function, frame: number, ...arg: any[]): string;
/**
 * 【顶级函数】：清理延迟n帧执行的函数
 * @param sign 由setFrameout返回值产生的标识
 */
declare function clearFrameout(sign: string): void;
/**
 * 当前游戏帧
 */
declare var __fCount: number;
