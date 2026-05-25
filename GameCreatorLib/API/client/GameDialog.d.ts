/**
 * 游戏对话框
 * 特性：
 * -- 目前一旦加载对话框样式后不再释放而是一直缓存着
 * -- 对话与选项均通过此类实现
 * -- 可通过监听事件等方式编写对话框的插件，如制作AVG游戏的快进、跳过、历史对话记录等
 *
 * Created by 黑暗之神KDS on 2019-01-09 15:06:50.
 */
declare class GameDialog extends Sprite {
    /**
     * 事件：当对话框出现时 回调参数：是否选项、文本内容、选项内容（若是选项的话）、名称、头像路径
     * <code>
     * // isOption = 是否选项
     * // content = 文本内容
     * // options = 选项内容（若是选项的话）
     * // name = 名称
     * // head = 头像 图片路径string/立绘ID:number/动画ID:number
     * // expression = 表情ID（如有，立绘模式下可选择表情）
     * // audioURL = 语音字符串（如有） 格式：音频地址,音量0-1,音调0-2
     * // speed = 文字播放速度 0-5 极慢-立即显示
     * EventUtils.addEventListenerFunction(GameDialog,GameDialog.EVENT_DIALOG_START,(isOption:boolean,content:string,options:string[],name:string,head:string|number,expression:number,audioURL:string,speed:number)=> {
     *   // to do
     * },this);
     * </code>
     */
    static EVENT_DIALOG_START: string;
    /**
     * 事件：当对话框出现后
     * onAfterDialogStart(isOption:boolean);
     */
    static EVENT_AFTER_DIALOG_START: string;
    /**
     * 事件：当对话文本播放结束时
     * <code>
     * // gameDialog = 当前的对话框显示对象 fromAutoPlaySkipSign:boolean = 是否来自文本播放时出现的[跳过本次对话]
     * EventUtils.addEventListenerFunction(GameDialog,GameDialog.EVENT_DIALOG_END,(gameDialog:GameDialog,fromAutoPlaySkipSign:boolean)=> {
     *   // to do
     * },this);
     * </code>
     */
    static EVENT_DIALOG_END: string;
    /**
     * 事件：当对话框关闭时
     * <code>
     * // gameDialog = 当前的对话框显示对象
     * EventUtils.addEventListenerFunction(GameDialog,GameDialog.EVENT_DIALOG_CLOSE,(gameDialog:GameDialog)=> {
     *   // to do
     * },this);
     * </code>
     */
    static EVENT_DIALOG_CLOSE: string;
    /**
     * 事件：当文本框文本播放时 回调参数：当前文字
     * <code>
     * // word = 当前的文字
     * EventUtils.addEventListenerFunction(GameDialog,GameDialog.EVENT_DIALOG_WORD_PLAY,(word:string)=> {
     *   // to do
     * },this);
     * </code>
     */
    static EVENT_DIALOG_WORD_PLAY: string;
    /**
     * 事件：当文本播放完成时 isAuto 表示是否来自自动播放
     * <code>
     * EventUtils.addEventListenerFunction(GameDialog,GameDialog.EVENT_DIALOG_WORD_PLAY_COMPLETE,Callback.New(isAuto:boolean)=> {
     *   // to do
     * },this);
     * </code>
     */
    static EVENT_DIALOG_WORD_PLAY_COMPLETE: string;
    /**
     * 事件：当语音播放完毕时派发（如果该次对话的语音未播放完成时，玩家手动跳过了该次对话的话则不会抛出该事件）
     * <code>
     * // success = 是否播放成功
     * // audioURL = 语音字符串（如有） 格式：音频地址,音量0-1,音调0-2
     * EventUtils.addEventListenerFunction(GameDialog,GameDialog.EVENT_TS_PLAY_COMPLETE,(success:boolean,audioURL:string)=> {
     *   // to do
     * },this);
     * </code>
     */
    static EVENT_TS_PLAY_COMPLETE: string;
    /**
     * 事件：当播放文本时遇到等待时间（帧数）时抛出事件 frameCount=等待的帧数
     * EventUtils.addEventListenerFunction(GameDialog,GameDialog.EVENT_DIALOG_TEXT_WAIT_TIME,(frameCount:number)=> {
     *   // to do
     * },this);
     */
    static EVENT_DIALOG_TEXT_WAIT_TIME: string;
    /**
     * 事件：当播放文本时遇到等待玩家操作时以及玩家操作完毕后抛出该事件 state=0表示等待玩家操作 state=1表示玩家操作完毕
     * EventUtils.addEventListenerFunction(GameDialog,GameDialog.EVENT_WAIT_PALYER_OPERATION,(state:number)=> {
     *   // to do
     * },this);
     */
    static EVENT_WAIT_PALYER_OPERATION: string;
    /**
     * 事件：恢复存档时的对话前调用
     * EventUtils.addEventListenerFunction(GameDialog,GameDialog.EVENT_BEFORE_RECOVERY_DIALOG,(success:boolean,audioURL:string)=> {
     *   // to do
     * },this);
     */
    static EVENT_BEFORE_RECOVERY_DIALOG: string;
    /**
     * 允许用户操快速显示当前文本（空格键/鼠标左键点击）默认=true
     */
    static dialogTextShowAllEnabled: boolean;
    /**
     * 允许用户操作-跳过文本（当文本已完全显示时）默认=true
     */
    static dialogTextSkipEnabled: boolean;
    /**
     * 当前文本对应的指令唯一标识
     */
    static fromCommandID: string;
    /**
     * 功能：立即显示全文本，当处于文本播放时则会立即显示至全文本
     * @param waitPlayerClickEnabled 默认值=true 若有「等待玩家操作」时，只显示到下一个「等待玩家操作」的地方
     * @param checkDialogTextShowAllEnabled 默认值=true 检查dialogTextShowAllEnabled设置，若禁止showAll时则此处失效
     */
    static showall(waitPlayerClickEnabled?: boolean, checkDialogTextShowAllEnabled?: boolean): void;
    /**
     * 功能：立刻跳过当前文本
     * @param force[可选] 默认值=false 当dialogTextSkipEnabled=false的时候也可以跳过
     * @return [boolean] 成功跳过
     */
    static skip(force?: boolean): boolean;
    /**
     * 功能：立刻跳过「等待玩家操作」
     * 当监听到EVENT_WAIT_PALYER_OPERATION事件时可通过此功能跳过等待
     * @return [boolean] 成功跳过
     */
    static skipWaitPlayerOperation(): boolean;
    /**
     * 停止对话，停止后其所在的触发线也处于停止中
     */
    static stop(): void;
    /**
     * 是否显示对话中
     */
    static get isInDialog(): boolean;
    /**
     * 是否播放中
     */
    static get isPlaying(): boolean;
    /**
     * 最近使用的对话框
     */
    static lastDialog: GameDialog;
    /**
     * 选项列表
     */
    get optionList(): UIList;
    /**
     * 获取当前的选项按钮（需要选项存在且正处于显示时）
     */
    get optionUIs(): UIButton[];
    /**
     * 选项文本
     */
    get optionTexts(): UIString[];
    /**
     * 头像
     */
    get dialogHeadBox(): UIBitmap | UIStandAvatar | UIAnimation | UIRoot;
    /**
     * 对话框背景图
     */
    get dialogBox(): UIBitmap;
    /**
     * 名字文本
     */
    get nameText(): UIString;
    /**
     * 文本文字组：根据不同的颜色、换行等情况切分的多段文本（拥有材质的话则逐字拆分）默认值=[]
     */
    get playTextLabels(): UIString[];
    /**
     * 跳过标志
     */
    get skipAni(): GCAnimation;
    /**
    * 唯一ID
    */
    get id(): number;
}
