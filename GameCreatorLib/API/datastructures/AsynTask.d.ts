/**
 * 异步任务工具类
 * 多个任务同时进行，需要等待全部任务执行完毕后才回调
 * 使用方式：
 *  var task = new AsynTask(Callback.New(() => {
 *      // 全部任务结束时的逻辑处理
 *  }, this));
 *  task.execute(任意表达式); // 如 task.execute(1);
 *  task.execute(任意表达式);
 *  task.complete(); // 上面执行了两个任务，下方则需要完成两次complete则算完成
 *  task.complete();
 *  Created by 黑暗之神KDS on 2018-01-01 03:47:27.
 */
declare class AsynTask {
    /**
     * 任务总数
     */
    length: number;
    /**
     * 当前执行的任务数
     */
    currentCount: number;
    /**
     * 异步 构造函数
     * @param onFin 回调方法
     * @param thisPtr 作用域
     */
    constructor(onFin: Callback);
    /**
     * 执行
     * @param code 直接执行代码即可，这里只是追加计数
     */
    execute(code: any): void;
    /**
     * 完成时回调
     */
    complete(): void;
}
