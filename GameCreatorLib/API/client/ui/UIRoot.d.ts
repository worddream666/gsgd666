/**
 * 容器组件
 * 一般用于装载子显示对象，并可以裁剪区域，只显示一部分内容
 *
 * 相关事件
 *  EventObject.LOADED 加载完成时候事件，仅作为界面本身（根容器）时派发
 *
 * 使用方式：
 * var a = new UIRoot();
 * a.addChild(b);
 *
 * Created by 黑暗之神KDS on 2018-10-12 16:31:59.
 */
declare class UIRoot extends UIBase {
    /**
    * 事件：当界面滚动时派发的事件 SCROLL(isVertical);
    * isVertical true为纵向，false为横向
    */
    static SCROLL: string;
    /**
     * 是否限制区域内显示 默认值=false
     */
    enabledLimitView: boolean;
    /**
    * 滚动条显示模式 0-不显示 1-显示 2-自动显示 3-仅显示竖滚动条 4-仅显示横滚动条 默认值=2
    */
    scrollShowType: number;
    /**
     * 滚动条宽度 默认值=16
     */
    scrollWidth: number;
    /**
    * 垂直滚动条背景皮肤
    */
    vScrollBg: string;
    /**
     * 垂直滚动条皮肤
     */
    vScrollBar: string;
    /**
     * 横向滚动条背景皮肤
     */
    hScrollBg: string;
    /**
    * 横向滚动条皮肤
    */
    hScrollBar: string;
    /**
     * 用鼠标或手滑动容器内区域可以滚动内部的内容区域（需要开启限制显示在区域内并实际内部内容尺寸已超出显示区域）
     * 0=仅移动端启用此效果,1=始终启用此效果,2=无 默认值=0
     */
    slowmotionType: number;
    /**
     * 垂直方向滚动值(0~100)
     */
    vScrollValue: number;
    /**
     * 水平方向滚动值(0~100)
     */
    hScrollValue: number;
    /**
     * 刷新滚动条根据内容区域大小，如果更改了容器内子对象的尺寸
     * 则需要调用此方法重新计算以便刷新滚动条。
     */
    refresh(): void;
}
/**
 * 界面实现类基类
 * 用于生成的界面类（GUI_XX）继承于此类
 * 以便在初始化的时候就可以调用内部的控件
 * Created by 黑暗之神KDS on 2018-10-11 04:35:33.
 */
declare class GUI_BASE extends UIRoot {
    /**
     * 预渲染：开启此项保证在派发EventObject.LOADED前预先渲染一次以便保证此后能够立即呈现画面，不会因为资源较大而首次渲染卡顿一下
     *        预渲染会消耗一定的性能，可以选择在界面资源较多的情况下使用此项，开启此项会有额外的性能和内存开销
     */
    prerender: boolean;
    /**
     * 界面ID
     */
    guiID: number;
    /**
     * 根据其下组件的唯一ID找到该组件 compsIDInfo[comp.id] = comp; 默认值={}
     * 界面编辑器预先设置好的组件才会存入该属性内，如果自己动态移除加入的可以自行管理该列表
     */
    compsIDInfo: any;
    /**
     * 是否存在界面本体事件
     */
    hasRootCommand: boolean[];
    /**
     * 构造函数
     * @param guiID 界面ID
     */
    constructor(guiID: number);
}
