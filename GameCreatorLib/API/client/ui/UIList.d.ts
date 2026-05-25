/**
 * 列表组件
 * 列表组件是一个支持NxM矩阵式排列的组件，其内部的项（item）是通过创建另一个界面源实现的
 *  -- 项数据基类：UIListItemData （此外系统会自动创建每个界面作为项数据类-ListItem_?，请查阅system/UIRuntime.ts）
 *     项数据类会自动根据控件创建相应的属性，以便填充后自动呈现出该数值或字符串（以及图片地址等）
 *     项数据映射值参考：
 *     UIBitmap -> string-图片地址
 *     UIString -> string-文本
 *     UIVariable -> number-数值变量ID
 *     UIAvatar -> number-行走图ID
 *     UIStandAvatar -> number-立绘ID
 *     UIAnimation -> number-动画ID
 *     UIInput -> string-默认文本
 *     UICheckBox -> boolean-选中状态
 *     UISwitch -> number-开关ID
 *     UITabBox -> string-项（如aa,bb,cc）
 *     UISlider -> number-值
 *     UIGUI -> number-界面ID
 *     UIList -> UIListItemData[]-项数据
 *
 * 相关事件：
 *  EventObject.CHANGE 当改变状态时派发  onChange(state:number) state=0 表示selectedIndex改变，否则是overIndex
 *  EventObject.LOADED 加载完成时候事件
 *  UIList.OPEN_STATE_CHANGE 打开状态发生改变时
 *  UIList.ITEM_CLICK 点击确认项
 *  UIList.EVENT_FOCUS_CHANGE 【EventUtils事件】当焦点更改时派发的事件
 *  UIList.ITEM_CREATE 创建项时
 *
 * 使用方法：
 *  // 列表方式添加数据
 *  var a = new UIList();
 *  a.overImageURL = "asset/image/picture/control/uilistover.png";
 *  a.selectImageURL = "asset/image/picture/control/uilistselect.png";
 *  a.itemModelGUI = 8; // 使用指定的界面ID来创建项，如果需要指定类，请使用 itemModelClass
 *  stage.addChild(a);
 *  var dArr = [];
 *  for(var i=0;i<10;i++){
 *     var d:ListItem_8 = new ListItem_8();
 *     d.pic = "asset/image/a.jpg"; // 假设8号界面存在名为pic的控件
 *     d.txt = "kds"; // 假设8号界面存在名为txt的文本
 *     d.战斗力 = 5; // 假设8号界面存在名为战斗力的数值变量控件，这里绑定5号变量
 *     dArr.push(d);
 *  }
 *  a.items = dArr;
 *
 *  // 树方式添加数据：在设置a.items前就决定好数据的父子节点关系：
 *  var child = new ListItem_8();
 *  child.pic = "asset/image/a.jpg";
 *  child.txt = "kdsChild";
 *  child.战斗力 = 5;
 *  dArr[2].push(child);
 *
 * // 事件监听示例
 * a.on(EventObject.CHANGE,this,this.onChange);
 *
 * Created by 黑暗之神KDS on 2019-07-09 15:04:27.
 */
declare class UIList extends UIRoot {
    /**
     * 事件：当焦点更改时派发的事件 onFocusChange(lastFocus:UIList,currentFocus:UIList);
     * <code>
     * // lastFocus - 表示上次的焦点列表
     * // currentFocus - 表示此次的焦点列表
     * EventUtils.addEventListenerFunction(UIList,UIList.EVENT_FOCUS_CHANGE,(lastFocus:UIList,currentFocus:UIList)=>{
     *    // to do
     * },this);
     * </code>
     */
    static EVENT_FOCUS_CHANGE: string;
    /**
     * 事件：打开状态发生改变时 onChange(ui,data)
     * <code>
     * uiList.on(UIList.OPEN_STATE_CHANGE,this,this.onOpenStateChange);
     * </code>
     */
    static OPEN_STATE_CHANGE: string;
    /**
     * 事件：点击确认项（已选中该项时再点击则派发事件/或ENTER键）
     * <code>
     * uiList.on(UIList.ITEM_CLICK,this,this.onItemClick);
     * </code>
     */
    static ITEM_CLICK: string;
    /**
     * 事件：创建项时 onItemCreate(ui: UIRoot, data: UIListItemData,index:number)
     * <code>
     * uiList.on(UIList.ITEM_CREATE,this,this.onItemCreate);
     * </code>
     */
    static ITEM_CREATE: string;
    /**
     * 按键-向上移动 开启键盘支持后的默认快捷键，支持修改 默认值=[Keyboard.UP]
     */
    static KEY_UP: number[];
    /**
     * 按键-向下移动 开启键盘支持后的默认快捷键，支持修改 默认值=[Keyboard.DOWN]
     */
    static KEY_DOWN: number[];
    /**
     * 按键-向左移动 开启键盘支持后的默认快捷键，支持修改 默认值=[Keyboard.LEFT]
     */
    static KEY_LEFT: number[];
    /**
     * 按键-向右移动 开启键盘支持后的默认快捷键，支持修改 默认值=[Keyboard.RIGHT]
     */
    static KEY_RIGHT: number[];
    /**
     * 按键-确定 开启键盘支持后的默认快捷键，支持修改 默认值=[Keyboard.ENTER, Keyboard.SPACE]
     */
    static KEY_ENTER: number[];
    /**
     * 开启键盘（手柄）支持：仅能操作当前焦点的UIList
     */
    static KEY_BOARD_ENABLED: boolean;
    /**
     * 开启单一焦点系统（焦点在指定的List上才可以操作，否则默认是无法操作的状态）
     * 通过设置UIList.focus来激活指定的列表以便操作
     */
    static SINGLE_FOCUS_MODE: boolean;
    /**
     * 设置List焦点：
     * -- 只有设置了焦点的按键才有效
     * -- 如果是单一焦点系统的话同一时间内只允许一个List启用
     */
    static focus: UIList;
    /**
     * 模拟按键按下：仅能操作当前焦点的UIList
     * @param keyCode 对应键位 KEY_UP/KEY_DOWN/KEY_LEFT/KEY_RIGHT/KEY_ENTER
     */
    static setKeyDown(keyCode: number): void;
    /**
     * 优化模式 默认值=false
     * 不会生成所有的item显示对象，而只生成可见范围内的装载位，在滚动显示时根据当前情况再将数据安装到对应的装载位上
     * -- 如需要启用，请在设置item前设置该参数为true
     * -- 该模式下使用通过索引getItemUI获取的装载位并不是固定的
     */
    optimizationMode: boolean;
    /**
     * 鼠标悬停则作为选中效果（默认是悬停效果）默认值=false
     */
    overSelectMode: boolean;
    /**
     * 创建ITEM时回调 onCreateItem(ui: UIRoot, data: UIListItemData,index:number)
     */
    onCreateItem: Callback;
    /**
     * 子项缩进 默认值=20
     */
    subitemIndentation: number;
    /**
     * 是否允许选择 默认值=true
     */
    selectEnable: boolean;
    /**
     *  列数 默认值=1
     */
    repeatX: number;
    /**
     * 横向间隔 默认值=2
     */
    spaceX: number;
    /**
     * 重向间隔 默认值=20
     */
    spaceY: number;
    /**
     * 项宽度 默认值=200
     */
    itemWidth: number;
    /**
     * 项高度 默认值=50
     */
    itemHeight: number;
    /**
     * 光标悬停时的效果图片
     */
    overImageURL: string;
    /**
     * 光标悬停时的对象：获取对象有利于自己追加一些额外的效果逻辑
     */
    overImage: UIBitmap;
    /**
     * 选中项的效果图片
     */
    selectImageURL: string;
    /**
     * 选中项的效果图片对象：获取对象有利于自己追加一些额外的效果逻辑
     */
    selectedImage: UIBitmap;
    /**
     * 光标在项上面时的效果图片的九宫格 默认值="0,0,0,0,0"
     * 九宫格设置：上边距、右边距、下边距、左边距、是否平铺（1表示平铺）
     * 让素材不再简单拉伸，而是根据九宫格方式进行拉伸
     */
    overImageGrid9: string;
    /**
    * 选中项的效果图片的九宫格 默认值="0,0,0,0,0"
    * 九宫格设置：上边距、右边距、下边距、左边距、是否平铺（1表示平铺）
    * 让素材不再简单拉伸，而是根据九宫格方式进行拉伸
    */
    selectImageGrid9: string;
    /**
     * 选中项时效果图片的透明度 默认值=0.5
     */
    selectedImageAlpha: number;
    /**
     *  光标在项上面时的效果图片的透明度 默认值=0.5
     */
    overImageAlpha: number;
    /**
     * 选中项时效果图片是否在上层显示（盖住项）默认值=true
     */
    selectedImageOnTop: boolean;
    /**
     * 光标在项上面时的效果图片是否在上层显示（盖住项）默认值=true
     */
    overImageOnTop: boolean;
    /**
     * 项的类设定
     */
    itemModelClass: any;
    /**
     * 项对应的界面ID
     */
    itemModelGUI: number;
    /**
     * 所有项数据
     */
    items: UIListItemData[];
    /**
     * 获取全部项对应的显示对象
     * 如果更新了项数据则显示对象也会被替换成新的，若需要记录该显示对象请谨慎使用
     */
    itemSprites: Sprite[];
    /**
     * 列表的数据总个数。
     */
    get length(): number;
    /**
     * 选中项，根据指定的数据
     * @return [UIListItemData]
     */
    selectedItem: UIListItemData;
    /**
     * 选中项，根据索引（即所在数据组的位置，数据组包括未打开的隐藏树节点）默认值=-1
     * @return [number] 
     */
    selectedIndex: number;
    /**
     * 选中项，根据索引，不派发EventObject.CHANGE事件
     * @param v 选中项
     */
    setSelectedIndexForce(v: number): void;
    /**
     * 悬停项，根据索引（即所在数据组的位置，数据组包括未打开的隐藏树节点）默认值=-1
     */
    overIndex: number;
    /**
     * 悬停项，根据索引，不派发EventObject.CHANGE事件
     * @param v 悬停项
     */
    setOverIndexForce(v: number): void;
    /**
     * 滚动到指定行：如果该项显示对象在完全显示中时则忽略滚动
     * @param index 指定的索引
     * @param ignoreAlreadyInVisible [可选] 默认值=true 忽略已
     * @param tween [可选] 默认值=false 是否缓动
     * @param duration [可选] 默认值=0 持续时间
     * @param ease [可选] 默认值=null 缓动方法
     * @param complete [可选] 默认值=null 当缓动完毕时回调
     */
    scrollTo(index: number, ignoreAlreadyInVisible?: boolean, tween?: boolean, duration?: number, ease?: Function, complete?: Callback): void;
    /**
     * 替换数据刷新显示，同时会触发 onCreateItem 函数
     * @param itemData 新数据
     * @param index 需要替换的items索引
     */
    replaceItem(itemData: UIListItemData, index: number): void;
    /**
     * 添加数据
     * @param itemData 新数据
     * @param index [可选] 默认值=-1 插入的位置，-1表示向后插入
     * @return [UIRoot] 数据对应的显示对象
     */
    addItem(itemData: UIListItemData, index?: number): UIRoot;
    /**
     * 移除数据
     * @param itemData 数据，如果该数据不在列表内则忽略 
     * @return [number] 数据所在的位置
     */
    removeItem(itemData: UIListItemData): number;
    /**
     * 移除数据，根据指定的位置
     * @param index 指定的位置
     * @return [UIListItemData] 数据 
     */
    removeItemByIndex(index: number): UIListItemData;
    /**
     * 更换位置
     * @param itemData 数据
     * @param toIndex 需要更换至的位置
     * @return [boolean] 是否更换成功
     */
    setItemIndex(itemData: UIListItemData, toIndex: number): boolean;
    /**
     * 更换位置-根据数据所在的位置
     * @param itemIndex 数据所在的位置
     * @param toIndex 需要更换至的位置
     * @return [boolean] 是否更换成功
     */
    setItemIndexByIndex(itemIndex: number, toIndex: number): boolean;
    /**
     * 获取项的显示对象
     * @param index 索引
     * @return [UIRoot]
     */
    getItemUI(index: number): UIRoot;
}
