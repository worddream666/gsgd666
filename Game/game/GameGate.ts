/**
 * 游戏大门：用于处理进入游戏、读取存档、更换场景
 * Created by 黑暗之神KDS on 2020-09-11 19:18:46.
 */
/// <reference path="GCAPI.d.ts" />
class GameGate {
    /**
     * 事件：进入场景的状态改变时派发事件，对应 GameGate.STATE_XXX
     * onInSceneStateChange(inNewSceneState:number);
     */
    static EVENT_IN_SCENE_STATE_CHANGE: string = "GameGateEVENT_SCENE_STATE_CHANGE";
    /**
     * 状态：离开场景，开始执行相关准备事件（离开场景时事件、新游戏开始事件、读档开始事件）
     */
    static STATE_0_START_EXECUTE_LEAVE_SCENE_EVENT: number = 0;
    /**
     * 状态：相关准备事件执行完毕，开始加载场景
     */
    static STATE_1_START_LOAD_SCENE: number = 1;
    /**
     * 状态：加载场景完毕，开始执行对应的完成事件（进入场景时事件、新游戏完成事件、读档完成事件）
     */
    static STATE_2_START_EXECUTE_IN_SCENE_EVENT: number = 2;
    /**
     * 状态：场景已进入完毕
     */
    static STATE_3_IN_SCENE_COMPLETE: number = 3;
    /**
     * 状态：玩家可控制阶段开始
     */
    static STATE_4_PLAYER_CONTROL_START: number = 4;
    /**
     * 状态值，对应GameGate.STATE_XXXX
     */
    static gateState: number;
    /**
     * 辅助计算用
     */
    private static bgmSyncTaskName: string = "bgmTask";
    private static bgsSyncTaskName: string = "bgsTask";
    /**
     * 游戏首次进入场景时表示
     */
    static inSceneInited: boolean;
    /**
     * 开始
     */
    static start(): void {
        // 监听进入场景的事件：新游戏、读档、切换场景
        EventUtils.addEventListener(ClientScene, ClientScene.EVENT_IN_NEW_SCENE, Callback.New(GameGate.onInNewScene, GameGate));
        // 初始化GameCreator内核：完成后显示标题界面
        EventUtils.addEventListener(ClientWorld, ClientWorld.EVENT_INITED, Callback.New(GameGate.onWorldInit, this), true);
    }
    /**
     * 世界初始化
     */
    private static onWorldInit() {
        // 键盘初始化
        KeyboardControl.init();
        // 初始化设置
        GUI_Setting.initHotKeySetting();
        // 手柄初始化
        GamepadControl.init();
        // 初始化项目工具类
        ProjectUtils.init();
        // 场景初始化
        ProjectClientScene.init();
        // 移动端屏幕显示
        if (Browser.onMobile) {
            stage.screenMode = ClientWorld.data.screenMode == 0 ? "horizontal" : "vertical";
            stage.setScreenSize(Browser.width, Browser.height);
        }
        // 启动LIST内置按键和焦点功能
        UIList.SINGLE_FOCUS_MODE = Browser.onMobile ? false : WorldData.focusEnabled;
        UIList.KEY_BOARD_ENABLED = WorldData.hotKeyListEnabled;
        // 直接读档的场合
        let onceLoadGame = LocalStorage.getJSON(GUI_SaveFileManager.onceInSceneLoadGameSign);
        if (onceLoadGame && onceLoadGame.id != null && SinglePlayerGame.getSaveInfoByID(onceLoadGame.id)) {
            // 移除一次读档的操作
            LocalStorage.removeItem(GUI_SaveFileManager.onceInSceneLoadGameSign);
            // 读取存档，失败的话调用失败时事件处理
            GUI_SaveFileManager.currentSveFileIndexInfo = SinglePlayerGame.getSaveInfoByID(onceLoadGame.id);
            GUI_SaveFileManager.loadFile(onceLoadGame.id, Callback.New((success: boolean) => {
                if (!success) GameCommand.startCommonCommand(14007);
            }, this));
            return;
        }
        // 启动事件
        GameCommand.startCommonCommand(14001);
    }
    /**
     * 当接收到进入新的场景时事件
     * @param sceneID 场景模型ID
     * @param inNewSceneState 进入场景的方式 0-切换游戏场景 1-新游戏 2-读取存档
     */
    private static onInNewScene(sceneID: number, inNewSceneState: number): void {
        // 如果正处于切换场景中的话忽略掉
        if (this.gateState != null && this.gateState < GameGate.STATE_3_IN_SCENE_COMPLETE) return;
        // 停止可能存在的移动行为
        if (Game.player.sceneObject.stopMove) {
            Game.player.sceneObject.stopMove(true);
        }
        // 清理掉已派发的主角行为
        if (Game.player.sceneObject.clearBehaviors) {
            Game.player.sceneObject.clearBehaviors();
        }
        // 停止控制器
        Controller.stop();
        // 【0】设置游戏之门状态：离开场景，开始执行相关准备事件
        GameGate.gateState = GameGate.STATE_0_START_EXECUTE_LEAVE_SCENE_EVENT;
        EventUtils.happen(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, [inNewSceneState]);
        // 根据state状态来执行相关准备事件（离开场景时事件、新游戏开始事件、读档开始事件）
        let startEvents = [14011, 14003, 14005];
        GameCommand.startCommonCommand(startEvents[inNewSceneState], [], Callback.New(disposeLastScene, this));
        let lastTonal = null;
        // 释放上一个场景
        function disposeLastScene() {
            // 【1】设置游戏之门状态：开始加载场景
            GameGate.gateState = GameGate.STATE_1_START_LOAD_SCENE;
            EventUtils.happen(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, [inNewSceneState]);
            if (Game.currentScene) {
                // 玩家的场景对象移除出来不用销毁
                if (Game.player.sceneObject.inScene) Game.currentScene.removeSceneObject(Game.player.sceneObject);
                // 获取上一个场景
                let lastScene = Game.currentScene;
                // 记录上一个场景的色调
                lastTonal = lastScene.displayObject.getTonal();
                // 移除上一个场景
                Game.layer.sceneLayer.removeChildren();
                // 卸载进入场景前预加载的资源，减少引用计数
                if (inNewSceneState == 0) AssetManager.disposeScene(lastScene.id);
                // 卸载当前场景
                lastScene.dispose();
                Game.currentScene = null;
            }
            loadPlayerAsset();
        }
        // 加载玩家场景对象需要的资源
        function loadPlayerAsset() {
            if (inNewSceneState != 0) AssetManager.preLoadSceneObjectAsset(Game.player.data.sceneObject, Callback.New(loadNewScene, this));
            else loadNewScene.apply(this);
        }
        // 加载新的场景
        function loadNewScene() {
            // 预加载场景资源，增加引用计数
            AssetManager.preLoadSceneAsset(sceneID, Callback.New(() => {
                // 创建场景
                ClientScene.createScene(sceneID, Callback.New((scene: ProjectClientScene) => {
                    // 配置数据加载完毕时：如果场景需要播放的音乐不再是当前音乐则结束掉之前的音乐或者首次进入游戏场景
                    // 渐变停止掉此前的背景音乐和环境音效音效，使用SyncTask类让任务单一执行，直到音乐渐出完毕才会在后面渐入新的音乐
                    if ((scene.bgm && (GameAudio.lastBgmURL != scene.bgm || GameAudio.lastBGMPitch != scene.bgmPitch)) || inNewSceneState != 0) {
                        new SyncTask(GameGate.bgmSyncTaskName, () => {
                            GameAudio.playBGM(GameAudio.lastBgmURL, 0, 9999, true, ClientWorld.data.sceneBGMGradientTime * 1000, GameAudio.lastBGMPitch);
                            Callback.New(SyncTask.taskOver, SyncTask, [GameGate.bgmSyncTaskName]).delayRun(ClientWorld.data.sceneBGMGradientTime * 1000);
                        });
                    }
                    if ((scene.bgs && GameAudio.lastBgsURL != scene.bgs || GameAudio.lastBGSPitch != scene.bgsPitch) || inNewSceneState != 0) {
                        new SyncTask(GameGate.bgsSyncTaskName, () => {
                            GameAudio.playBGS(GameAudio.lastBgsURL, 0, 9999, true, ClientWorld.data.sceneBGSGradientTime * 1000, GameAudio.lastBGSPitch);
                            Callback.New(SyncTask.taskOver, SyncTask, [GameGate.bgsSyncTaskName]).delayRun(ClientWorld.data.sceneBGSGradientTime * 1000);
                        });
                    }
                }, this), Callback.New(onLoadedNewScene, this), true);
            }, this), true, false, true);
        }
        /**
         * 当场景资源加载完毕时
         * @param scene 新的场景
         */
        function onLoadedNewScene(scene: ProjectClientScene) {
            // 记录新的场景
            Game.currentScene = scene;
            // 恢复上个场景的色调
            if (lastTonal) {
                let t = lastTonal;
                Game.currentScene.displayObject.setTonal(t[0], t[1], t[2], t[3], t[4], t[5], t[6]);
            }
            // 非读档模式下：添加预设的场景对象（读档的话会自动恢复场景对象和其自定义属性、独立开关）
            if (inNewSceneState != 2) {
                let sceneObjects: SceneObject[] = scene.getPresetSceneObjectDatas();
                let len = sceneObjects.length;
                for (let i = 0; i < len; i++) {
                    let soObj = sceneObjects[i];
                    if (!soObj) continue;
                    let soc = scene.addSceneObjectFromClone(sceneID, i, false);
                    // 安装对象开关
                    let soSwitchs = SinglePlayerGame.getSceneObjectSwitch(sceneID, i);
                    if (soSwitchs) {
                        soc.installSwitchs(soSwitchs);
                    }
                }
            }
            // 添加玩家场景对象
            let insertNewPostion = inNewSceneState != 2;
            if (!GameGate.inSceneInited) {
                GameGate.addPlayerSceneObject(Game.player.data.sceneObject, false, insertNewPostion);
            }
            else {
                GameGate.addPlayerSceneObject(Game.player.sceneObject, true, insertNewPostion);
            }
            // 场景开始渲染
            Game.currentScene.startRender();
            // 添加到显示列表中
            Game.layer.sceneLayer.addChild(Game.currentScene.displayObject);
            // 背景音乐播放
            if (inNewSceneState != 2) {
                new SyncTask(GameGate.bgmSyncTaskName, (sceneBgm: string, bgmVolume: number, bgmPitch: number) => {
                    if (sceneBgm) {
                        GameAudio.playBGM(sceneBgm, bgmVolume, 9999, true, ClientWorld.data.sceneBGMGradientTime * 1000, bgmPitch);
                    }
                    SyncTask.taskOver(GameGate.bgmSyncTaskName);
                }, [Game.currentScene.bgm, Game.currentScene.bgmVolume, Game.currentScene.bgmPitch]);
                new SyncTask(GameGate.bgsSyncTaskName, (sceneBgs: string, bgsVolume: number, bgsPitch: number) => {
                    if (sceneBgs) {
                        GameAudio.playBGS(sceneBgs, bgsVolume, 9999, true, ClientWorld.data.sceneBGSGradientTime * 1000, bgsPitch);
                    }
                    SyncTask.taskOver(GameGate.bgsSyncTaskName);
                }, [Game.currentScene.bgs, Game.currentScene.bgsVolume, Game.currentScene.bgsPitch]);
            }
            // 如果是从存档恢复的则恢复存档数据
            if (inNewSceneState == 2) {
                SinglePlayerGame.recoveryData();
            }
            startExecuteSceneLoadedEvent.apply(this);
        }
        // 【2】开始执行场景加载完成时事件
        function startExecuteSceneLoadedEvent() {
            GameGate.gateState = GameGate.STATE_2_START_EXECUTE_IN_SCENE_EVENT;
            EventUtils.happen(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, [inNewSceneState]);
            // 进入场景、新的档案-完成、读取档案-完成
            let endEvents = [14010, 14004, 14006];
            GameCommand.startCommonCommand(endEvents[inNewSceneState], [], Callback.New(inSceneComplete, this));
        }
        /**
         * 【3】进入场景完成
         */
        function inSceneComplete() {
            GameGate.gateState = GameGate.STATE_3_IN_SCENE_COMPLETE;
            EventUtils.happen(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, [inNewSceneState]);
            // 游戏首次登入场景时初始化事件（无论通过新游戏还是存档，都会调用，用于进入游戏时自定义初始化用）
            if (!GameGate.inSceneInited) {
                GameGate.inSceneInited = true;
                GameCommand.startCommonCommand(14002);
            }
            // 非读档的情况
            if (inNewSceneState != 2) {
                // 获取进入场景的事件
                let sceneCmdTypeIndex = 0;
                let commandPageInScene = Game.currentScene.customCommandPages[sceneCmdTypeIndex];
                let inSceneCmdLength = commandPageInScene.commands.length;
                // 执行场景进入事件则派发事件
                if (inSceneCmdLength > 0) {
                    // 获取事件触发器：由玩家触发，执行者也是玩家
                    let commandTriggerInScene = Game.player.sceneObject.getCommandTrigger(CommandTrigger.COMMAND_MAIN_TYPE_SCENE, sceneCmdTypeIndex, Game.currentScene, Game.player.sceneObject);
                    // 监听一次事件执行，完毕后启动控制器
                    EventUtils.addEventListener(commandTriggerInScene, CommandTrigger.EVENT_OVER, Callback.New(() => {
                        Controller.start();
                        GameGate.gateState = GameGate.STATE_4_PLAYER_CONTROL_START;
                        EventUtils.happen(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, [inNewSceneState]);
                    }, this, []), true);
                    // 开始执行事件
                    commandPageInScene.startTriggerEvent(commandTriggerInScene);
                }
                // 启动控制器
                else {
                    Controller.start();
                    GameGate.gateState = GameGate.STATE_4_PLAYER_CONTROL_START;
                    EventUtils.happen(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, [inNewSceneState]);
                }
            }
            else {
                GameGate.gateState = GameGate.STATE_4_PLAYER_CONTROL_START;
                EventUtils.happen(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, [inNewSceneState]);
            }
        }
    }
    /**
     * 添加玩家的场景对象
     * @param so 玩家场景对象数据
     * @param isEntity 是否是场景对象实体 
     * @param insertNewPostion 插入到新的空位置上，如普通的切换场景时
     */
    private static addPlayerSceneObject(so: SceneObject, isEntity: boolean = false, insertNewPostion: boolean = true): void {
        if (!Game.currentScene) return;
        if (!isEntity) delete so.player;
        else {
            so.x = Game.player.data.sceneObject.x;
            so.y = Game.player.data.sceneObject.y;
        }
        // 取得空位置
        if (insertNewPostion) {
            let newIndex = ArrayUtils.getNullPosition(Game.currentScene.sceneObjects);
            so.index = newIndex;
        }
        let soc = Game.currentScene.addSceneObject(so, isEntity, true);
        Game.player.sceneObject = soc as any;
        let playerBattlerModule = Game.player.sceneObject.getModule(6) as SoModule_Battler;
        if (playerBattlerModule && playerBattlerModule.inPartyIndex != 0) {
            playerBattlerModule.inPartyIndex = 0;
            playerBattlerModule.actor = Game.player.data.party[0]?.actor;
        }
        // 场景切换时重新刷新装备外观（确保衣服和武器正确显示）
        if (playerBattlerModule) {
            playerBattlerModule.refreshAvatar(false, Game.player.data.party[0]);
            // 确保方向监听已正确设置
            if (!playerBattlerModule._oriListening) {
                playerBattlerModule.so.on(ProjectClientSceneObject.CHANGE_ORI, playerBattlerModule, playerBattlerModule.refreshPartOrderByDirection);
                playerBattlerModule._oriListening = true;
            }
        }
        Game.player.sceneObject.stopMove();
        // 记录场景对象
        soc.player = Game.player;
        // 设置镜头并绑定到当前控制的角色身上
        Game.currentScene.camera.sceneObject = ProjectPlayer.ctrlActorSceneObject;
        Game.currentScene.updateCamera();
    }
}