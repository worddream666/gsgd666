/**
 * 回调方法
 * 一般用于各种回调函数中为了携带执行域和参数
 * 【使用方法】：
 * Callback.New(this.xxx,this,[1,2,3]);
 * Created by 黑暗之神KDS on 2018-01-01 03:47:27.
 */
declare class Callback {
    /**
     * 空的单一实例，一般用于必须回调中的空实现
     */
    static EMPTY: Callback;
    /**
     * 调用者执行域
     */
    caller: any;
    /**
     * 回调方法
     */
    callbackFunc: Function;
    /**
     * 回调参数
     */
    args: any[];
    /**
     * 运行
     * @param addArgs [可选] 默认值=null 追加的参数
     */
    run(): any;
    /**
     * 运行追加额外的参数 追加的参数在回调时总是在后面
     * @param addArgs  追加的参数
     */
    runWith(addArgs: any[]): any;
    /**
     * 延迟执行
     * @param delay 延迟的ms数
     * @param delayFunc [可选] 默认值=null 延迟使用的函数，默认setTimeout，可更换,如setFrameout
     * @param args [可选] 默认值=null 参数
     * @return [Callback]
     */
    delayRun(delay: number, delayFunc?: Function, args?: any[]): Callback;
    /**
     * 延迟执行，但会覆盖掉之前的延迟
     * @param delay 延迟的ms数
     * @param delayFunc [可选] 默认值=null 延迟使用的函数，默认setTimeout，可更换,如setFrameout
     * @param clearDelayFunc [可选] 默认值=null 清理的延迟函数，默认 clearTimeout，可更换,如setFrameout
     * @param args [可选] 默认值=null 参数
     * @return [Callback]
     */
    delayRunConver(delay: number, delayFunc?: Function, clearDelayFunc?: Function, args?: any[]): Callback;
    /**
     * 停止延期
     * @param clearDelayFunc [可选] 默认值=null 清理的延迟函数，默认 clearTimeout，可更换
     */
    stopDelay(clearDelayFunc?: Function): void;
    /**
     * 新建回调对象，同new CallBack
     * @param callbackFunc 回调方法
     * @param caller 执行域
     * @param args [可选] 默认值=null 携带的参数
     * @return [Callback]
     */
    static New(callbackFunc: Function, caller: any, args?: any[]): Callback;
    /**
     * 延迟到下一帧执行，保证相同的方法和作用域只能执行一次，可用于优化效率
     * 相同的方法和作用域调用此方法，只有第一次生效，其中args参数会替换成最近一次调用的参数
     * 该方法可能在下一次渲染前也可能在下一帧渲染后执行，如果必须确定在下次渲染前就要执行可使用CallLaterBeforeRender
     * 内部使用setTimeout-0ms实现
     * @param func 执行的方法
     * @param caller 作用域
     * @param args [可选] 默认值=null 附带的参数
     * @param delay [可选] 默认值=0 延迟的ms
     */
    static CallLater(func: Function, caller: any, args?: any[], delay?: number): void;
    /**
     * 延迟到下一次渲染时执行，保证相同的方法和作用域只能执行一次，可用于优化效率
     * 相同的方法和作用域调用此方法，只有第一次生效，其中args参数会替换成最近一次调用的参数
     * @param func 执行的方法
     * @param caller 作用域
     * @param args [可选] 默认值=null 附带的参数
     * @param inRenderImmediatelyExecute [可选] 默认值=false 已处于render中执行的环境下，确保在当前渲染时执行而非到下一帧
     */
    static CallLaterBeforeRender(func: Function, caller: any, args?: any[], inRenderImmediatelyExecute?: boolean): void;
}
