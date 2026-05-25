/**
 * 界面组件中的项数据基类
 * 对应UIList中项所绑定的数据，每个项显示对象都会对应一个项数据（该类或其子类的实例）
 * 使用方式可参考[UIList]
 *
 * Created by 黑暗之神KDS on 2019-07-09 15:04:42.
 */
declare class UIListItemData {
    /**
     * 任意附加的数据
     */
    data: any;
    /**
     * 提取储存数据
     * @param includeData [可选] 默认值=false 是否包含自定义附加的数据，请保证该数据可以JSON化
     */
    getSaveData(includeData?: boolean): any;
    /**
     * 还原储存数据
     * @param saveData
     */
    static recoverySaveData(saveData: any): UIListItemData;
    /**
     * 是否处于打开状态（树节点的情况）
     */
    isOpen: boolean;
    /**
     * 获取父节点
     */
    get parent(): UIListItemData;
    /**
     * 添加节点
     * @param item 节点数据对象
     */
    addChild(item: UIListItemData): void;
    /**
     * 添加节点到指定索引中
     * @param item 节点数据对象
     * @param index 插入所在索引
     */
    addChildAt(item: UIListItemData, index: number): void;
    /**
     * 移除节点
     * @param item 节点数据对象
     */
    removeChild(item: UIListItemData): void;
    /**
     * 移除节点至指定索引中
     * @param index 节点所在的索引
     */
    removeChildAt(index: number): void;
    /**
     * 移除所有节点
     */
    removeAll(): void;
    /**
     * 获取节点根据索引
     * @param index 节点所在的索引
     * @return [UIListItemData]
     */
    getChildAt(index: number): UIListItemData;
    /**
     * 获取节点索引
     * @param item 节点数据对象
     */
    getChildIndex(item: UIListItemData): number;
    /**
     * 子节点总数
     */
    get numChildren(): number;
    /**
     * 子节点列表
     */
    get children(): UIListItemData[];
    /**
     * 是否继承于指定节点
     */
    isInherit(data: UIListItemData): boolean;
    /**
     * 获取树型结构下全部节点中的子节点列表（含自身节点）
     * @param arr [可选] 默认值=null 指定的数组用于装载获取的结果数据
     */
    getList(arr?: UIListItemData[]): UIListItemData[];
    /**
     * 获取树形结构的根节点
     * @return [UIListItemData]
     */
    get root(): UIListItemData;
    /**
     * 获取所在树的深度
     * @return [number]
     */
    get depth(): number;
    /**
     * 是否是隐藏节点（即父系节点可能被关闭了）
     */
    get isHideNode(): boolean;
    /**
     * 优化模式变量：数据所在位置（列表刷新排列位置时设置）
     */
    x: number;
    /**
     * 优化模式变量：数据所在位置（列表刷新排列位置时设置）
     */
    y: number;
    /**
     * 优化模式变量：是否显示（可见范围外则不显示）
     */
    visible: boolean;
    /**
     * 自定义尺寸，开启后需要设置width和height来决定宽和高
     */
    customSize: boolean;
    /**
     * 自定义尺寸-宽
     */
    width: number;
    /**
     * 自定义尺寸-高
     */
    height: number;
}
