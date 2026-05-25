/**
 * 组件基类
 * 所有组件的基类，不单独实例化出来
 * Created by 黑暗之神KDS on 2018-10-12 14:31:34.
 */
declare class UIBase extends GameSprite {
    /**
     * 事件：组件构造初始化时派发的事件
     * 利用此事件可以监听所有组件初始化，以便可以追加逻辑
     * <code>
     * EventUtils.addEventListenerFunction(UIBase, UIBase.EVENT_COMPONENT_CONSTRUCTOR_INIT, (uiComp: UIBase)=>{
     *   // to do
     * }, this);
     * </code>
     */
    static EVENT_COMPONENT_CONSTRUCTOR_INIT: string;
    /**
     * 事件：由于出现条件导致的出现或消失（visible变更）
     * <code>
     * ui.on(UIBase.ON_VISIBLE_CHANGE,this,func);
     * </code>
     */
    static ON_VISIBLE_CHANGE: string;
    /**
     * 唯一ID：由系统随机生成
     */
    id: string;
    /**
     * 预设控件的所属界面根容器，比如2号界面中的预设控件中的该属性就是2号界面本身
     */
    guiRoot: UIRoot;
    /**
     * 是否存在自定义的触发事件 索引为自定义界面触发事件类别
     */
    hasCommand: boolean[];
    /**
     * 组件类型名称 如UIButton
     */
    className: string;
    /**
     * 提交玩家输入信息 数据类型：any[] | Callback
     * 用于装载提交的玩家输入值，以便事件页接收（等待玩家提交信息），可以是固定的数组数据或是回调函数中返回数组数据
     * 比如该控件拥有点击事件，并且点击后以带参数的形式提交，提交后事件页中将接收的到输入值
     */
    commandInputMessage: any;
    /**
     * 释放
     */
    dispose(): void;
}
