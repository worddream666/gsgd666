/**
 * 通用事件管理器
 *
 * 与客户端的EventDispatcher区别是可以支持任意的对象派发和接收事件
 * 但需要注意的是销毁对象时需要调用 EventUtils.clear();，否则使用了该事件管理器
 * 注册事件的对象会永久在这里记录着从而导致内存泄漏（即无用的资源不断堆积导致内存占用过高）。
 *
 * 通用规则：一般格式 EVENT_????? 的事件都使用EventUtils，如CommandTrigger.EVENT_START
 * 使用方法一：
 *  EventUtils.addEventListener(obj,XXX.EVENT_XXX,Callback.New((参数1,参数2)=>{
 *    // 逻辑
 *  },this));
 *
 * 使用方法二：
 *  EventUtils.addEventListenerFunction(obj,XXX.EVENT_XXX,(参数1,参数2)=>{
 *    // 逻辑
 *  },this);
 *
 *  // 在某处满足条件时则：（其中参数可以自定义传递）
 *  EventUtils.happen(obj,XXX.EVENT_XXX,[参数1,参数2]);
 *
 * Created by 黑暗之神KDS on 2017-08-22 20:52:51.
 */
declare class EventUtils {
    /**
     * 注册事件
     * @param obj 事件对象
     * @param type 类型
     * @param callBack 回调
     * @param isOnce [可选] 默认值=false 是否执行一次 默认 false
     */
    static addEventListener(obj: any, type: string, callBack: Callback, isOnce?: boolean): void;
    /**
     * 注册事件-函数和作用域版
     * @param obj 事件对象
     * @param type 类型
     * @param onHappen 回调方法
     * @param thisPtr 回调时作用域
     * @param args [可选] 默认值=null 回调时参数
     * @param isOnce [可选] 默认值=false 是否执行一次
     */
    static addEventListenerFunction(obj: any, type: string, onHappen: Function, thisPtr: any, args?: any[], isOnce?: boolean): void;
    /**
     * 移除事件
     * @param obj 事件对象
     * @param type 类型
     * @param callBack 回调
     */
    static removeEventListener(obj: any, type: string, callBack: Callback): void;
    /**
     * 移除事件-函数和作用域版
     * @param obj 事件对象
     * @param type 类型
     * @param onHappen 回调方法
     * @param thisPtr 回调时作用域
     */
    static removeEventListenerFunction(obj: any, type: string, onHappen: Function, thisPtr: any): void;
    /**
     * 派发事件，若注册时存在参数的话参数优先为注册的参数，再追加这里派发的参数args
     * @param obj 事件对象
     * @param type 类型
     * @param args [可选] 默认值=null 自定义的参数，传递后可以出现在函数回调中
     */
    static happen(obj: any, type: string, args?: any[]): void;
    /**
     * 清空事件
     * @param obj 事件对象
     * @param type [可选] 默认值=null 类型，如果为null表示全部
     */
    static clear(obj: any, type?: string): void;
}
