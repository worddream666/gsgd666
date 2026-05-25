/**
 * 数组工具类
 * GC内部封装的一些常用数组方法
 * Created by 黑暗之神KDS on 2018-01-01 03:47:27.
 */
declare class ArrayUtils {
    /**
     * 数组内随机打乱排序
     * @param arr 数组
     */
    static randOrder(arr: any[]): void;
    /**
     * 添加数据
     * @param arr 数据组
     * @param index 索引 -1=加入到数组尾端
     * @param arg 添加的数据
     */
    static insert(arr: any[], index: number, ...arg: any[]): number;
    /**
     * 删除数据
     * @param arr 数据组
     * @param index 索引 -1=删除尾端数据
     * @return [any] 被删除的数据对象
     */
    static delete(arr: any[], index: number): any;
    /**
     * 移除数据，返回新的数组
     * @param arr 数据组
     * @param obj 数据对象
     * @return [any]
     */
    static remove(arr: any[], obj: any): any;
    /**
     * 剔除相同的元素，根据子元素属性是否相同，返回新的数组
     * @param arr 原数组
     * @param attrName 属性名称
     * @param ifNullIgnore 是否如果属性为null时不会移除
     * @return [any] 新数组
     */
    static removeSameObjectD2(arr: any[], attrName: string, ifNullIgnore: boolean): any[];
    /**
     * 获取数据
     * @param arr 数据组
     * @param index 索引 -1=尾端数据
     * @return [any]
     */
    static get(arr: any[], index: number): any;
    /**
     * 更改数据中的值
     * @param arr 数据组
     * @param index 索引
     * @param paramValue 参数和值Object
     * @param 实际被更改的对象数组
     */
    static set(arr: any[], index: number, paramValue: any): any[];
    /**
     * 插入数据 找到空值或添加
     * @param arr 数组
     * @param obj 要插入的对象
     * @return [number] 插入到的索引
     */
    static insertToNullPosition(arr: any[], obj: any): number;
    /**
     * 找到一个空的位置
     * @param arr 数组
     * @param startIndex [可选] 默认值=0 索引
     * @return [number] 找到空位置索引
     */
    static getNullPosition(arr: any[], startIndex?: number): number;
    /**
     * 剔除相同的元素
     * @param arr 原数组
     * @return [any] 新数组
     */
    static removeSameObject(arr: any[]): any[];
    /**
     * 匹配数据，如在一组对象的数据中，筛选出对象中含有的某些属性值为多少的对象集合
     * 使用示例：
     * <code>
     * var arr = [{a:6},{a:7},{a:8},{a:6}];
     * var m = ArrayUtils.matchAttributes(arr,{a:6},false); // 返回组中有两个结果 [{a:6},{a:6}]
     * var m = ArrayUtils.matchAttributes(arr,{a:6},false,">"); // 返回组中有两个结果 [{a:7},{a:8}]
     * var m = ArrayUtils.matchAttributes(arr,{a:6},false,"==",true); // 返回组中两个结果,相对于原数组的索引 [0,3]
     * var m = ArrayUtils.matchAttributes(arr,{a:6},true); // 返回组中有1个结果 [{a:6}]
     * </code>
     * @param arr 数组
     * @param matchObj 参数
     * @param onlyOne 是否只匹配一个数据
     * @param symbol [可选] 默认值="==" 对比符号
     * @param indexOfMode [可选] 默认值=false 返回匹配的索引而非返回匹配的对象
     * @return [any] 如果是indexOfMode则返回 number[]，否则返回arr同类型的数据
     */
    static matchAttributes(arr: any, matchData: any, onlyOne: boolean, symbol?: string, indexOfMode?: boolean): any[];
    /**
     * 匹配数据 深度2，用于匹配对象中的对象是否含有该属性
     * 使用示例：
     * <code>
     * var arr = [{a:{b:2}},{a:{b:3},{a:{b:5}},{a:{b:7}}];
     * var m = ArrayUtils.matchAttributesD2(arr,"a",{b:2},false); // 返回 [{a:{b:2}}]
     * </code>
     * @param arr 数组
     * @param attribute 属性
     * @param matchObj 参数
     * @param onlyOne 是否只匹配一个数据
     * @param symbol [可选] 默认值="==" 对比符号
     * @return [any]
     */
    static matchAttributesD2(arr: any, attribute: string, matchData: any, onlyOne: boolean, symbol?: string): any[];
    /**
     * 匹配数据 深度3
     * @param arr 数组
     * @param attribute 属性
     * @param attribute2 属性2
     * @param matchObj 参数
     * @param onlyOne 是否只匹配一个数据
     * @param symbol [可选] 默认值="==" 对比符号
     * @return [any]
     */
    static matchAttributesD3(arr: any, attribute: string, attribute2: string, matchData: any, onlyOne: boolean, symbol?: string): any[];
    /**
     * 获取对象/数组内对象的指定属性的值组成一个新的数组
     * @param arr 原对象/数组
     * @param attributeName 原数组内对象的指定属性名
     * @param ignoreNullChild [可选] 默认值=true 是否忽略掉在arr中为NULL的子对象，以便不会加入到新的数组中
     * @return [any]
     */
    static getChildAttributeToCreateArray(arr: any, attributeName: string, ignoreNullChild?: boolean): any[];
    /**
     * 获取数组中元素出现的个数
     * @param arr 数组
     * @param value 元素
     * @return [number] 出现的个数
     */
    static getElementSize(arr: any[], value: any): number;
    /**
     * 批量装载创建对象
     * @param objCls 对象类
     * @param size 数目
     * @param obj
     * @param arr [可选] 默认值=null 装载至的数组，设置则以该数组为装载对象
     * @return [any]
     */
    static createObjects(objCls: any, size: number, onCreateOne?: (index: number, obj: any) => void, arr?: any[]): any[];
    /**
     * 互换数组中的位置
     * @param arr 数组
     * @param index1 位置1
     * @param index2 位置2
     */
    static swap(arr: any[], index1: number, index2: number): void;
    /**
     * 调整数组中元素位置
     * @param arr 数组
     * @param element 元素
     * @param index 位置
     */
    static setIndex(arr: any[], element: any, index: number): void;
    /**
     * 按照asc排序（忽略大小写）
     * @param arr 数组
     * @param attributeName 属性的名称
     * @param isAsc 是否正序排序
     */
    static sort(arr: any[], attributeName: string, isAsc: boolean): void;
    /**
     * 比较，列出B数组相对于A数组中不同的元素
     * @param aArr A数组
     * @param bArr B数组
     * @param appended 增加的元素列表
     * @param subtract 减少的元素列表
     */
    static compare(aArr: any[], bArr: any[]): {
        appended: any[];
        subtract: any[];
    };
    /**
     * 获取树型结构下全部节点中的子节点列表（含自身节点）
     * @param reeNode 树型结构节点
     * @param childrenAttr [可选] 默认值="children" 如 “children”
     * @param arrayList [可选] 默认值=null 装载数据的数组
     * @param checkIsOpen [可选] 默认值=false 是否需要检查开启状态，如果检查的话则未开启的数据不计入返回列表中
     * @param isOpenAttr [可选] 默认值="isOpen" 开启状态属性名
     * @param ignoreChildrenCondition [可选] 默认值=null 忽略子对象的条件 如 ignoreChildrenCondition(treeNode: any){return treeNode.ignoreChildren;}
     */
    static getTreeNodeArray(treeNode: any, childrenAttr?: string, arrayList?: any[], checkIsOpen?: boolean, isOpenAttr?: string, ignoreChildrenCondition?: Callback): any[];
}
