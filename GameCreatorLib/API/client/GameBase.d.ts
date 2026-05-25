/**
 * 游戏总管理基类
 * 实际游戏会创建具体类继承于该类，方便属性指向上层的自定义类
 * 通常情况下需要使用Game变量来创建该类或其子类的实例：var Game = new GameBase();
 *
 * Created by 黑暗之神KDS on 2018-07-28 20:49:42.
 */
declare class GameBase {
    /**
     * 暂停状态改变事件派发
     * <code>
     * EventUtils.addEventListenerFunction(Game, Game.EVENT_PAUSE_CHANGE, this.onPauseChange, this);
     * </code>
     */
    EVENT_PAUSE_CHANGE: string;
    /**
     * 游戏总层次
     */
    layer: GameLayer;
    /**
     * 当前的场景，默认是[ClientScene]的EMPTY，项目层在实现场景更换时需要设置此值
     */
    currentScene: ClientScene;
    /**
     * 我的玩家对象
     */
    player: ClientPlayer;
    /**
     * 游戏内一个单位帧的时间
     */
    get oneFrame(): number;
    /**
     * 游戏时间戳：游戏启动时到现在的时间
     * -- 读档会恢复存档的游戏时间戳
     * -- 暂停游戏会导致该时间被暂停
     */
    get now(): number;
    /**
     * 游戏帧计数：游戏启动时到现在的帧总数
     * -- 暂停游戏会导致该帧计数被暂停
     */
    get frameCount(): number;
    /**
     * 游戏时间暂停（影响系统是否静止以及上层逻辑可以根据此项来编写静止效果）
     * 系统预设是对于场景效果的禁止，包含如下：
     * -- 场景图层渲染
     * -- 场景对象刷新（暂停期间不再调用场景对象的update函数）
     */
    pause: boolean;
}
