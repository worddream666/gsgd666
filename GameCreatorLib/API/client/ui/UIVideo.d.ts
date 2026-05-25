/**
 * 视频显示对象
 * -- 不支持移动端使用
 *
 * 事件：
 * EventObject.LOADED 已加载元数据时触发。
 * EventObject.ERROR 当遇到错误时派发
 * EventObject.COMPLETE 当播放完毕时派发
 *
 * Created by 黑暗之神KDS on 2020-12-24 13:24:59.
 */
declare class UIVideo extends UIBitmap {
    /**
     * 事件：播放开始
     */
    static PLAY_START: string;
    /**
     * 事件：播放停止
     */
    static PLAY_STOP: string;
    /**
     * 事件：播放暂停
     */
    static PLAY_PAUSE: string;
    /**
     * 构造函数
     * @param editorCompMode [可选] 默认值=true 编辑器模式下显示专门的组件样式而非实际的视频
     */
    constructor(editorCompMode?: boolean);
    /**
     * 视频总时间：秒 如果不存在时则返回NaN
     */
    get duration(): number;
    /**
     * 网络状态
     * 0 = NETWORK_EMPTY - 音频/视频尚未初始化
     * 1 = NETWORK_IDLE - 音频/视频是活动的且已选取资源，但并未使用网络
     * 2 = NETWORK_LOADING - 浏览器正在下载数据
     * 3 = NETWORK_NO_SOURCE - 未找到音频/视频来源
     */
    get networkState(): number;
    /**
     * 视频地址
     */
    videoURL: string;
    /**
     * 播放速率 默认值=1 表示100% 
     */
    playbackRate: number;
    /**
     * 音量 默认值=
     */
    volume: number;
    /**
     * 当前视频时间（秒）默认值=0
     */
    currentTime: number;
    /**
     * 播放模式 0-播放 1-停止播放 2-暂停 默认值=0
     */
    playType: number;
    /**
     * 是否正在播放中
     */
    readonly isPlaying: boolean;
    /**
     * 静音
     */
    muted: boolean;
    /**
     * 循环
     */
    loop: boolean;
    /**
     * 播放
     */
    play(): void;
    /**
     * 停止播放
     */
    stop(): void;
    /**
     * 暂停播放
     */
    pause(): void;
    /**
     * 片段事件内容：当视频源加载完毕时
     * 主动调用方式：CommandPage.startTriggerFragmentEvent
     */
    onLoadedFragEvent: string;
    /**
     * 片段事件内容：当发生错误时处理
     * 主动调用方式：CommandPage.startTriggerFragmentEvent
     */
    onErrorFragEvent: string;
    /**
     * 片段事件内容：当播放完成时处理
     * 主动调用方式：CommandPage.startTriggerFragmentEvent
     */
    onCompleteFragEvent: string;
}
