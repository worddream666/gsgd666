/**
 * 对象工具类
 * GC内部封装的对象的常用函数
 * Created by 黑暗之神KDS on 2018-07-24 02:09:40.
 */
declare class ObjectUtils {
    /**
     * 获取唯一ID：程序启动后该值从0开始自动累加，保证每次ID唯一，但不适合储存
     */
    static getInstanceID(): number;
    /**
     * 获取随机唯一ID：适合储存，基本上不会遇到同样的ID值
     */
    static getRandID(): string;
    /**
     * 将A的属性克隆给B（直接设置）
     * <code>
     * // 内部实现
     * for (var i in form) {
     *     to[i] = form[i];
     * }
     * </code>
     * @param a 对象A-数据源
     * @param b 对象B-被赋值的对象
     */
    static clone(form: any, to: any): void;
    /**
     * 将A的属性克隆给B，仅对于B存在的属性才克隆
     * <code>
     * // 内部实现
     * for (var i in to) {
     *    to[i] = form[i];
     * }
     * </code>
     * @param a 对象A-数据源
     * @param b 对象B-被赋值的对象
     */
    static cloneExcludeNonExistentAttribute(form: any, to: any): void;
    /**
     * 深度克隆属性
     * @param o 需要克隆的对象，能够被JSON化的数据
     */
    static depthClone<T>(o: T): T;
    /**
     * 判断两个对象是否不同 遍历a的属性是否与b相同
     * @param a 对象A
     * @param b 对象B
     * @return 是否相同
     */
    static same(a: any, b: any): boolean;
    /**
     * 判断两个对象是否不同 遍历a的属性是否与b相同 深度对比
     * @param a 对象A
     * @param b 对象B
     * @return 是否相同
     */
    static depthSame(a: any, b: any): boolean;
    /**
     * 赋值，将B的值赋值给A，不变更类型
     * -- B中存在的属性才会被赋值
     * -- 保持A的类型不变（这样可保留该类型下的方法）
     * @param a对象
     * @param b对象
     */
    static assignment(a: any, b: any): void;
    /**
     * 重定义get/set
     * @param target 目标对象
     * @param defineContent {x:function(v){code}}
     */
    static reDefineGetSet(target: string, defineContent: any): void;
    /**
     * 映射指定类事件相关方法，将types替换成指定对象的方法
     * @param clsName 类对象
     * @param types 需要替换的类型集合
     * @param toObjName 指定替换至的对象名
     */
    static redefinedEventFunc(clsName: string, types: string[], toObjName: string): void;
    /**
    * 将form的属性克隆给to,排除form中的Function
    * @param form 
    * @param to 
    */
    static cloneExcludeFunction(form: any, to: any): void;
}
