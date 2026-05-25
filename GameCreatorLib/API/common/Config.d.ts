/**
 * 通用配置
 * 游戏的通用配置，用于获取编辑器中一些预设的配置信息
 * Created by 黑暗之神KDS on 2018-05-22 20:26:48.
 */
declare class Config {
    /**
     * 创建工程时会生成游戏项目的唯一SID
     */
    static gameSID: number;
    /**
     * 模板的ID（对应云模板ID）
     * 安装模板时会写入
     */
    static templateID: number;
    /**
     * 模板的版本号（云模板版本号）
     * 安装模板时会写入
     */
    static templateVersionID: number;
    /**
     * 制作模板的作者uid
     */
    static TEMPLETE_USER_UID: number;
    /**
     * 使用F1-F12功能键，关闭此项功能后同时也会禁止浏览器环境下的该按键功能 默认值=true
     * -- F5：重置游戏
     * -- F11：全屏化
     */
    static USE_FN: boolean;
    /**
     * 对齐网格方式
     */
    static gridAlignMode: number;
    /**
     * 是否处于编辑器模式
     * 编辑器也搭载了运行时以便实时预览和重用代码，所以在部分场合下会使用此判定
     */
    static get EDIT_MODE(): boolean;
    /**
     * 是否处于对象行为编辑器模式
     * 行为编辑器中运行了用户编写的代码以便预览实际的效果，所以可以利用此属性来区分运行环境，
     * 以便让游戏或行为编辑器中解决兼容性问题
     */
    static get BEHAVIOR_EDIT_MODE(): boolean;
    /**
     * 游戏发布后的版本，用于区分是否正式版游戏
     */
    static get RELEASE_GAME(): boolean;
    /**
     * 创建工程时的GC版本号
     */
    static get CREATED_GC_VERSION(): number;
    /**
     * 默认分辨率宽度：当前版本是根据窗口大小自动等比缩放
     */
    static get WINDOW_WIDTH(): number;
    /**
     * 默认分辨率高度：当前版本是根据窗口大小自动等比缩放
     */
    static get WINDOW_HEIGHT(): number;
    /**
     * 场景格子大小，比如32像素或48像素
     */
    static get SCENE_GRID_SIZE(): number;
    /**
     * 动画默认播放帧率：新建立的动画在未设定帧率时的默认帧率
     */
    static get ANIMATION_FPS(): number;
    /**
     * 默认字体，新建立的文本会使用该默认字体
     * GC支持同一游戏下不同的字体共存，这里不会影响对于编辑器中各处文本已单独设置好的字体
     */
    static get DEFAULT_FONT(): string;
}
