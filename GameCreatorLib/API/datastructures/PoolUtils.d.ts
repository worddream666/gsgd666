/**
 * 对象池工具
 * GC内部封装的对象池工具
 * Created by 黑暗之神KDS on 2017-10-25 17:36:38.
 */
declare class PoolUtils {
    /**
     * 构造函数
     * @param cls 需要作为重复使用的对象类
     */
    constructor(cls: any);
    /**
     * 归还对象
     * @param obj 对象
     */
    free(obj: any): void;
    /**
     * 取出对象，没有闲置对象则会新建
     * @return obj 对象
     */
    takeout(): any;
}
