/**
 * 场景-项目层实现类
 * Created by 黑暗之神KDS on 2020-09-08 17:10:24.
 */
class ProjectClientScene extends ClientScene {
    /**
     * 场景对象列表：场景上全部的场景对象
     * 重写，如果确保场景上只有ClientSceneObject_1的话则可以如此使用，方便代码调用
     */
    declare sceneObjects: ProjectClientSceneObject[];
    /**
     * 场景工具
     */
    sceneUtils: SceneUtils;
    /**
     * DEBUG层
     */
    debugLayer: ClientSceneLayer;
    static debugColor(mode: number): string { return ["#FF0000", "#FFFF00", "#00FF00"][mode]; }; // 0-障碍 1-穿透 2-桥属性
    static getDebugColorBySceneObject(target: ProjectClientSceneObject) { // 获取DEBUG绘制颜色-根据场景对象（穿透/桥属性）
        let debugColorMode = target.bridge ? 2 : (target.through ? 1 : 0);
        let deubugColor = ProjectClientScene.debugColor(debugColorMode);
        return deubugColor;
    }
    /**
     * 辅助场景集合，克隆其内的场景对象需要预先创建该场景
     */
    private static sceneHelpers: { [sceneID: number]: ClientScene } = {};
    private static sceneHelperLoadings: { [sceneID: number]: boolean } = {};
    //------------------------------------------------------------------------------------------------------
    // 静态函数
    //------------------------------------------------------------------------------------------------------
    /**
     * 初始化
     */
    static init() {
        // 注册自定义储存信息
        SinglePlayerGame.regSaveCustomData("Scene", Callback.New(this.getSaveData, this));
        // 恢复数据
        EventUtils.addEventListener(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, Callback.New(this.onInSceneStateChange, this));
    }
    /**
     * 根据设定获取场景对象
     * @param soType 类别：0-玩家的场景对象 1-触发者 2-执行者 3-指定编号
     * @param soIndex 指定的编号
     * @param pointSoMode [可选] 默认值=0 指定场景对象编号的模式 0-常量 1-变量
     * @param soIndexVarID [可选] 默认值=0 使用的变量ID
     * @param trigger [可选] 默认值=null 触发器，如在事件执行时调用该函数则可传递触发器过来使用，以便判定触发者、执行者
     */
    static getSceneObjectBySetting(soType: number, soIndex: number, pointSoMode: number = 0, soIndexVarID: number = 0, trigger: CommandTrigger = null) {
        let so: ProjectClientSceneObject;
        if (soType == 0) {
            so = Game.player.sceneObject;
        }
        else if (soType == 1) {
            so = trigger ? trigger.trigger as any : Game.player.sceneObject;
        }
        else if (soType == 2) {
            so = trigger ? trigger.executor as any : Game.player.sceneObject;
        }
        else if (soType == 3) {
            if (!Game.currentScene) return null;
            if (pointSoMode == 1) {
                soIndex = Game.player.variable.getVariable(soIndexVarID);
            }
            so = soIndex < 0 ? null : Game.currentScene.sceneObjects[soIndex];
        }
        return so;
    }
    /**
     * 获取辅助场景，如用于克隆里面的场景对象使用，并不会实际作为游戏场景使用
     * 已存在的话同步回调
     * @param sceneID 场景ID
     * @param onFin 完成时回调 onFin(scene:ClientScene,isSync)
     */
    static createSceneHelper(sceneID: number, onFin: Callback) {
        // 已存在缓存的场景则直接同步返回
        let scene = ProjectClientScene.sceneHelpers[sceneID];
        if (scene) {
            onFin.runWith([scene, true]);
            return;
        }
        // 如果已存在加载中的场景则监听一次加载完成事件后回调
        if (ProjectClientScene.sceneHelperLoadings[sceneID]) {
            EventUtils.addEventListener(ProjectClientScene, "____createSceneHelper", onFin, true);
            return;
        }
        ProjectClientScene.sceneHelperLoadings[sceneID] = true;
        ClientScene.createScene(sceneID, Callback.New((scene: ClientScene) => {
            ProjectClientScene.sceneHelpers[scene.id] = scene;
            delete ProjectClientScene.sceneHelperLoadings[sceneID];
            onFin.runWith([scene, false]);
            EventUtils.happen(ProjectClientScene, "____createSceneHelper", [scene, false]);
        }, this));
    }
    /**
     * 销毁辅助场景
     * @param sceneID 场景ID
     */
    static disposeSceneHelper(sceneID: number): boolean {
        let scene = ProjectClientScene.sceneHelpers[sceneID];
        if (scene) {
            scene.dispose();
            delete ProjectClientScene.sceneHelpers[sceneID]
            return true;
        }
        return false;
    }
    //------------------------------------------------------------------------------------------------------
    // 实例
    //------------------------------------------------------------------------------------------------------
    /**
     * 构造函数
     */
    constructor() {
        super();
    }
    /**
     * 当场景解析时函数：由系统调用
     * @param jsonObj 解析数据
     * @param gameData 游戏数据
     */
    parse(jsonObj: any, gameData: GameData): void {
        super.parse(jsonObj, gameData);
        // 创建场景工具
        this.sceneUtils = new SceneUtils(this);
    }
    /**
     * 当渲染时：每帧执行的逻辑
     */
    onRender() {
        super.onRender.apply(this, arguments);
        this.debugRender();
    }
    //------------------------------------------------------------------------------------------------------
    // 场景对象
    //------------------------------------------------------------------------------------------------------
    /**
     * 添加显示对象
     * @param soData 场景对象数据
     * @param isSoc [可选] 默认值=false 是否是实际的对象而非数据
     * @param useModelClass [可选] 默认值=false 是否使用场景对象模型的实现类
     * @return [ClientSceneObject] 添加的场景对象实例
     */
    addSceneObject(soData: SceneObject, isSoc: boolean = false, useModelClass: boolean = false): ClientSceneObject {
        let soc: ClientSceneObject = super.addSceneObject.apply(this, arguments);
        if (soc) {
            // 动态障碍和桥数据更新
            this.sceneUtils.updateDynamicObsAndBridge(soc, true);
        }
        return soc;
    }
    /**
     * 移除显示对象
     * @param so 显示对象
     * @return [ClientSceneObject] 
     */
    removeSceneObject(so: SceneObject, removeFromList: boolean = true): ClientSceneObject {
        let soc = super.removeSceneObject.apply(this, arguments);
        if (soc instanceof ProjectClientSceneObject) {
            let pSo: ProjectClientSceneObject = soc;
            // 清理其接触过的对象记录
            pSo.clearMyTouchRecord();
            pSo.clearTouchMeRecord();
            // 动态障碍和桥数据更新
            this.sceneUtils.updateDynamicObsAndBridge(soc, false);
        }
        return soc;
    }
    //------------------------------------------------------------------------------------------------------
    // 私有
    //------------------------------------------------------------------------------------------------------
    /**
     * DEBUG显示障碍数据
     */
    private debugRender() {
        if (WorldData.gridObsDebug && os.inGC() && !Config.RELEASE_GAME) {
            if (!this.debugLayer) {
                this.debugLayer = new ClientSceneLayer(this);
                this.addLayer(this.debugLayer);
                this.debugLayer.alpha = 0.7;
            }
            this.debugLayer.graphics.clear();
            let obstacleData = this.dataLayers[0];
            let bridgeData = this.dataLayers[2];
            for (let x = 0; x < this.gridWidth; x++) {
                for (let y = 0; y < this.gridHeight; y++) {
                    let gridStatus = this.sceneUtils.getGridDynamicObsStatus(new Point(x, y));
                    if (gridStatus == 1 || (bridgeData[x] && bridgeData[x][y])) {
                        this.debugLayer.graphics.drawRect(x * Config.SCENE_GRID_SIZE, y * Config.SCENE_GRID_SIZE, Config.SCENE_GRID_SIZE, Config.SCENE_GRID_SIZE, ProjectClientScene.debugColor(2));
                        continue;
                    }
                    if (gridStatus == 2 && obstacleData[x] && obstacleData[x][y]) {
                        this.debugLayer.graphics.drawRect(x * Config.SCENE_GRID_SIZE, y * Config.SCENE_GRID_SIZE, Config.SCENE_GRID_SIZE, Config.SCENE_GRID_SIZE, "#FF00FF");
                    }
                    if (gridStatus == 2) {
                        this.debugLayer.graphics.drawRect(x * Config.SCENE_GRID_SIZE, y * Config.SCENE_GRID_SIZE, Config.SCENE_GRID_SIZE, Config.SCENE_GRID_SIZE, "#FF6600");
                    }
                    else if (obstacleData[x] && obstacleData[x][y]) {
                        this.debugLayer.graphics.drawRect(x * Config.SCENE_GRID_SIZE, y * Config.SCENE_GRID_SIZE, Config.SCENE_GRID_SIZE, Config.SCENE_GRID_SIZE, "#FF0000");
                    }
                }
            }
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 私有-静态
    //------------------------------------------------------------------------------------------------------
    /** 是否恢复了需要玩家等待的的事件（即无法操控） */
    private static hasRetoryWaitEvent: boolean;
    /**
     * 当场景状态改变时
     */
    private static onInSceneStateChange(inNewSceneState: number) {
        // 读档的情况
        if (inNewSceneState == 2) {
            // 如果状态是加载场景的话：在恢复数据SinglePlayerGame.recoveryData之前进行一些处理
            if (GameGate.gateState == GameGate.STATE_1_START_LOAD_SCENE) {
                this.beforeRetorySaveData();
            }
            else if (GameGate.gateState == GameGate.STATE_2_START_EXECUTE_IN_SCENE_EVENT) {
                this.retorySceneObjectSaveData();
            }
            else if (GameGate.gateState == GameGate.STATE_3_IN_SCENE_COMPLETE) {
                this.retorySceneSaveData();
            }
        }
    }
    /**
     * 获取追加的自定义存档数据
     * -- 场景对象数据
     */
    private static getSaveData() {
        if (!Game.currentScene || Game.currentScene == ClientScene.EMPTY) return;
        let soCustomDatas = [];
        for (let i in Game.currentScene.sceneObjects) {
            let so = Game.currentScene.sceneObjects[i];
            if (!so || !(so instanceof ProjectClientSceneObject)) continue;
            if (so.getSaveData) soCustomDatas[i] = so.getSaveData();
        }
        return soCustomDatas;
    }
    /**
     * 恢复数据前的处理
     */
    private static beforeRetorySaveData() {
        // 监听触发器恢复事件：监听需要玩家操作等待的事件：进入场景事件、场景对象点击事件、需要等待的场景对象碰触事件
        EventUtils.addEventListener(SinglePlayerGame, SinglePlayerGame.EVENT_RECOVER_TRIGGER, Callback.New((trigger: CommandTrigger) => {
            // 场景
            if ((trigger.mainType == CommandTrigger.COMMAND_MAIN_TYPE_SCENE && trigger.indexType == 0) || // 进入场景事件
                (trigger.mainType == CommandTrigger.COMMAND_MAIN_TYPE_SCENE_OBJECT && trigger.indexType == 0) || // 场景对象点击事件
                (trigger.mainType == CommandTrigger.COMMAND_MAIN_TYPE_SCENE_OBJECT && trigger.indexType == 1 && // 需要等待的场景对象碰触事件
                    trigger.trigger == Game.player.sceneObject && (trigger.executor as ProjectClientSceneObject).waitTouchEvent)) {
                ProjectClientScene.hasRetoryWaitEvent = true;
                EventUtils.addEventListener(trigger, CommandTrigger.EVENT_OVER, Callback.New((trigger: CommandTrigger) => {
                    if (trigger.executor != Game.player.sceneObject) (trigger.executor as ProjectClientSceneObject).eventCompleteContinue();
                    Controller.start();
                }, this, [trigger]), true);
            }
        }, this));
    }
    /**
     * 恢复场景对象数据
     */
    private static retorySceneObjectSaveData() {
        // 恢复场景对象数据
        let soCustomDatas = SinglePlayerGame.getSaveCustomData("Scene");
        for (let i in soCustomDatas) {
            let soData = soCustomDatas[i];
            let so: ProjectClientSceneObject = Game.currentScene.sceneObjects[i];
            if (so && soData && so.retorySaveData) so.retorySaveData(soData);
        }
    }
    /**
     * 恢复场景数据
     */
    private static retorySceneSaveData() {
        // 如果未恢复让玩家无法控制的事件时则允许控制
        if (!ProjectClientScene.hasRetoryWaitEvent) {
            Controller.start();
        }
    }
}