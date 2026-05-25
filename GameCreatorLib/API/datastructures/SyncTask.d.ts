/**
 * 同步任务工具类
 * 任务类型相同的只能按照顺序执行下去，在当前任务未完成前后面的任务都处于等待状态
 *
 * 使用方式：
 * var taskName = "我的同步任务1";
 * // 第1个同步任务，同类型的任务会等待该任务执行完毕再接着执行
 * new SyncTask(taskName, function () {
 *        // 第1个顺序任务逻辑
 *        xxxxxxxxxxxxx
 *        // 第1个顺序任务执行完毕
 *        SyncTask.taskOver(taskName);
 * });
 * // 第2个同步任务，同类型的任务会等待该任务执行完毕再接着执行
 * new SyncTask(taskName, function () {
 *        // 第2个顺序任务逻辑
 *        xxxxxxxxxxxxx
 *        // 第2个顺序任务执行完毕
 *        SyncTask.taskOver(taskName);
 * });
 * Created by 黑暗之神KDS on 2018-01-01 03:47:27.
 */
declare class SyncTask {
    /**
     * 方法
     */
    func: Function;
    /**
     * 参数
     */
    arg: any[];
    /**
     * this指针
     */
    thisPtr: any;
    /**
     * 同步任务执行 构造函数
     * @param taskName 任务名称
     * @param func 执行的方法 [可选] 默认值=null
     * @param arg 参数 [可选] 默认值=null 回调函数携带的参数
     * @param thisPtr 作用域 [可选] 默认值=null
     * @param isConver [可选] 默认值=false 会否重复的任务覆盖掉
     * @param jumpQuere [可选] 默认值=false 是否插队，插队的话则插到最前方
     */
    constructor(taskName: string, func?: Function, arg?: any[], thisPtr?: any, isConver?: boolean, jumpQuere?: boolean);
    /**
     * 通知某个类型任务完成，直接进行同类型的下一个任务
     * @param taskName 任务名称
     */
    static taskOver(taskName: string): void;
    /**
     * 清除任务
     * @param taskName 任务名称
     */
    static clear(taskName: string): void;
}
