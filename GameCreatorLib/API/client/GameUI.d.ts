/**
 * 界面管理器
 * 特性：
 *   -- 通过系统创建的界面，同编号的界面只有一个
 *      比如通过GameUI.show(1)创建1号界面，第二次调用仍然是这个界面
 *      通过事件可视化打开的界面同GameUI.show
 *      如果需要新建多个相同的界面，可使用GameUI.load(1,true);表示以克隆的形式创建1
 * 相同ID的界面只存在一个，如额外需要创建界面 可以 new GUI_XXX
 * Created by 黑暗之神KDS on 2018-10-12 13:40:11.
 */
declare class GameUI {
    /**
     * 事件：当打开系统组界面时派发的事件 onOpenUI(uiID:number) uiID=界面编号
     * <code>
     *  EventUtils.addEventListenerFunction(GameUI,GameUI.EVENT_OPEN_SYSTEM_UI,(uiID:number)=>{
     *    // to do
     *  },this);
     * </code>
     */
    static EVENT_OPEN_SYSTEM_UI: string;
    /**
     * 事件：关闭系统组界面时派发的事件 onCloseUI(uiID:number)
     * <code>
     *  EventUtils.addEventListenerFunction(GameUI,GameUI.EVENT_CLOSE_SYSTEM_UI,(uiID:number)=>{
     *    // to do
     *  },this);
     * </code>
     */
    static EVENT_CLOSE_SYSTEM_UI: string;
    /**
     * 事件：创建界面时派发的事件，无论创建的是系统组界面还是副本
     * <code>
     *  EventUtils.addEventListenerFunction(GameUI,GameUI.EVENT_CREATE_UI,(ui: GUI_BASE)=> {
     *    // to do
     *  },this);
     * </code>
     */
    static EVENT_CREATE_UI: string;
    /**
     * 是否已打开
     * @param uiID 系统组界面ID
     * @return [boolean]
     */
    static isOpened(uiID: number): boolean;
    /**
     * 加载界面
     * @param id 界面ID
     * @param copy [可选] 默认值=false 是否是克隆界面 false=属于系统组的界面（会保存在系统组列表里） true=属于自行新建的界面
     * @return [GUI_BASE]
     */
    static load(id: number, copy?: boolean): GUI_BASE;
    /**
     * 获取已存在的系统组界面（包含此前打开过后关闭掉的，释放掉的话则不再该列表内）
     * @return { [uiID: number]: GUI_BASE }
     */
    static getAllSystemGroupUIs(): any;
    /**
     * 获取系统组列表中指定编号的界面，如果系统组未开启过该界面则获取为null
     * @param id 界面编号
     * @return 系统组的该界面
     */
    static get(id: number): GUI_BASE;
    /**
     * 释放系统组列表中指定编号的界面
     * @param id 界面编号
     */
    static dispose(id: number): void;
    /**
     * 显示系统组列表中指定编号的界面，如果该界面在系统组列表中找不到则会创建并加入到系统组列表中，如果存在则直接返回该界面
     * @param id 界面编号
     * @return [GUI_BASE]
     */
    static show(id: number): GUI_BASE;
    /**
     * 隐藏系统组列表中指定编号的界面，如果该界面在系统组列表中找不到则忽略
     * @param id 界面编号
     */
    static hide(id: number): void;
    /**
     * 隐藏全部系统组列表的界面
     */
    static hideAll(): void;
    /**
     * 获取其全部子组件对象
     * @param keyValueMode 是否包含 keyValue 格式的，有则返回值中的keyValue存在值
     * @param conditionFunc [可选] 默认值=null  条件方法，通过条件筛选需要的组件，不存在方法或返回true都视为需要该组件 conditionFunc(uiComp:Sprite)
     * @return { arr: UIBase[], keyValue: { [compID: string]: UIBase } }
     */
    static getAllCompChildren(ui: GUI_BASE, keyValueMode: boolean, conditionFunc?: Function): any;
}
