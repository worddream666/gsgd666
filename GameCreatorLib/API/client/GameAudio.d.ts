/**
 * 音频类
 * 支持平滑过渡音量
 * 支持音调（播放速率）
 *
 * Created by 黑暗之神KDS on 2018-07-27 23:29:00.
 */
declare class GameAudio {
    /**
     * 全局背景音乐音量大小 0~1 默认值=1
     */
    static bgmVolume: number;
    /**
     * 全局环境音效音量大小 0~1 默认值=1
     */
    static bgsVolume: number;
    /**
     * 全局音效音量大小 0~1 默认值=1
     */
    static seVolume: number;
    /**
     * 全局语音音量大小 0~1 默认值=1
     */
    static tsVolume: number;
    /**
     * 记录上次播放的背景音乐地址
     */
    static lastBgmURL: string;
    /**
     * 记录上次播放的背景音乐声道对象
     */
    static lastBgmSoundChannel: SoundChannel;
    /**
     * 记录上次播放的背景音乐音调
     */
    static lastBGMPitch: number;
    /**
     * 记录上次播放的背景音乐声音大小
     */
    static lastBGMVolume: number;
    /**
     * 记录上次播放的场景音效地址
     */
    static lastBgsURL: string;
    /**
     * 记录上次播放的场景音效音调
     */
    static lastBGSPitch: number;
    /**
     * 记录上次播放的场景音效声音大小
     */
    static lastBGSVolume: number;
    /**
     * 记录上次播放的场景音效声道对象
     */
    static lastBgsSoundChannel: SoundChannel;
    /**
     * 播放背景音乐： 地址不相等的情况才重新播放，但音量会改变（如果需要重新播放，可以停止BGM后再播放）
     * 全局同一时间内只能播放一首背景音乐，如果需要叠加播放音频，请使用playSE
     * 同地址但音调不一致也会重新播放
     * @param url 背景音乐地址
     * @param volume 声量大小 0~1
     * @param loop [可选] 循环次数 默认值=9999
     * @param isGradient [可选] 是否渐入 默认值=false
     * @param gradientTime [可选] 渐入时间（毫秒） 默认值=1000
     * @param pitch [可选] 播放速率（音调） 默认值=1 范围0-2
     */
    static playBGM(url: string, volume?: number, loop?: number, isGradient?: boolean, gradientTime?: number, pitch?: number): SoundChannel;
    /**
     * 停止播放背景音乐
     * @param isGradient [可选] 默认值=false 是否渐出
     * @param gradientTime [可选] 默认值=1000 渐出时间（毫秒）
     */
    static stopBGM(isGradient?: boolean, gradientTime?: number): void;
    /**
     * 播放环境音效 ： 地址不相等的情况才重新播放，但音量会改变（如果需要重新播放，可以停止BGM后再播放）
     * 全局同一时间内只能播放一首环境音效，如果需要叠加播放音频，请使用playSE
     * 同地址但音调不一致也会重新播放
     * @param url 环境音效地址
     * @param volume 声量大小 0~1
     * @param loop [可选] 循环次数 默认值=9999
     * @param isGradient [可选] 是否渐入 默认值=false
     * @param gradientTime [可选] 渐入时间（毫秒） 默认值=1000
     * @param pitch [可选] 播放速率 默认值=1 范围0-2
     */
    static playBGS(url: string, volume?: number, loop?: number, isGradient?: boolean, gradientTime?: number, pitch?: number): SoundChannel;
    /**
     * 停止播放环境音效
     * @param isGradient [可选] 默认值=false 是否渐出
     * @param gradientTime [可选] 默认值=1000 渐出时间（毫秒）
     */
    static stopBGS(isGradient?: boolean, gradientTime?: number): void;
    /**
     * 播放音效，播放在场景对象身上时则根据当前场景的镜头与目标的距离来变更声音大小
     * @param url 音效地址
     * @param volume [可选] 默认值=1 音量 0~1
     * @param pitch [可选] 播放速率 默认值=1 范围0-2
     * @param soc [可选] 默认值=null 音频绑定在场景对象上
     */
    static playSE(url: string, volume?: number, pitch?: number, soc?: ClientSceneObject): SoundChannel;
    /**
     * 停止SE
     * @param channels [可选] 传入则表示仅停止传入组的音效，否则是全部当前的音效 SoundChannel | SoundChannel[]
     */
    static stopSE(channels?: any): void;
    /**
     * 播放语音，播放在场景对象身上时则根据当前场景的镜头与目标的距离来变更声音大小
     * @param url 语音音效地址
     * @param volume [可选] 默认值=1 音量 0~1
     * @param pitch [可选] 播放速率 默认值=1 范围0-2
     * @param soc [可选] 默认值=null 音频绑定在场景对象上
     */
    static playTS(url: string, volume?: number, pitch?: number, soc?: ClientSceneObject): SoundChannel;
    /**
     * 停止语音
     * @param channels [可选] 默认值=null 传入则表示仅停止传入组的音效，否则是全部当前的音效 SoundChannel | SoundChannel[]
     */
    static stopTS(channels?: any): void;
    /**
     * 设置当失去焦点时是否停止音乐
     * @param isStop 是否停止
     */
    static setBlurStopMusic(isStop: boolean): void;
}
