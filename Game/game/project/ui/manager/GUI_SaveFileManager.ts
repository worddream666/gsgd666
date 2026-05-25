/**
 * 档案管理 - 本地存档版
 * 修改: 移除云存档同步功能，仅保留本地存档
 * 服务器仅用于登录账号和角色名唯一性检查
 * Created by 黑暗之神KDS on 2020-09-15 17:17:25.
 */

/** 标准化回调：支持普通函数和 Callback 对象 */
function normCB(cb: any): any {
    if (typeof cb === 'function' && typeof (cb as any).runWith !== 'function') {
        let fn = cb;
        return { runWith: (args: any[]) => fn.apply(null, args), run: () => fn() };
    }
    return cb;
}

class GUI_SaveFileManager {
    /**
     * 当前档案的目录信息
     */
    static currentSveFileIndexInfo: { indexInfo: SaveFileListCustomData, id: number, now: number };
    /**
     * 游戏内读档重启方式直接进入档案的标识符
     */
    static onceInSceneLoadGameSign = "gc_rpg_greenFeather_" + window.location.href;
    /**
     * 已读档后的自定义数据
     */
    private static currentSaveFileCustomData: any;
    /**
     * 是否读档中
     */
    private static isLoading: boolean = false;
    /**
     * 当前登录用户的token（仅用于角色名验证，不用于存档同步）
     */
    private static currentToken: string = "";
    /**
     * 自动存档槽位（隐藏，不显示在UI中）
     */
    static readonly AUTO_SAVE_SLOT = 0;
    /**
     * 自动存档定时器
     */
    private static _autoSaveTimer: number = null;

    /**
     * 设置用户登录状态（token仅用于角色名唯一性检查）
     * @param token 用户token
     */
    static setUserToken(token: string) {
        GUI_SaveFileManager.currentToken = token;
    }

    /**
     * 获取当前用户token
     */
    static getUserToken(): string {
        return GUI_SaveFileManager.currentToken;
    }

    /**
     * 初始化自动存档（页面关闭时保存 + 每60秒定时保存本地）
     */
    static initAutoSave() {
        window.addEventListener('beforeunload', () => {
            GUI_SaveFileManager.autoSave();
        });
        if (GUI_SaveFileManager._autoSaveTimer !== null) {
            clearInterval(GUI_SaveFileManager._autoSaveTimer);
        }
        GUI_SaveFileManager._autoSaveTimer = setInterval(() => {
            if (GameGate.STATE_3_IN_SCENE_COMPLETE < 3) return;
            if (!Game || !Game.player) return;
            try {
                SinglePlayerGame.saveGame(GUI_SaveFileManager.AUTO_SAVE_SLOT, Callback.New((success: boolean) => {
                    if (success) {
                        console.log("[存档] 本地自动存档完成 (slot 0)");
                    }
                }, this), this.getCustomSaveIndexInfo());
            } catch (e) {
            }
        }, 60000);
        console.log("[存档] 本地自动存档已启动 (beforeunload + 60s定时)");
    }
    /**
     * 停止自动存档
     */
    static stopAutoSave() {
        if (GUI_SaveFileManager._autoSaveTimer !== null) {
            clearInterval(GUI_SaveFileManager._autoSaveTimer);
            GUI_SaveFileManager._autoSaveTimer = null;
        }
    }
    /**
     * 执行自动存档（静默保存到slot 0，仅本地）
     * 用于beforeunload场景（无法等待异步）
     */
    static autoSave() {
        if (GameGate.STATE_3_IN_SCENE_COMPLETE < 3) return;
        if (!Game || !Game.player) return;
        try {
            SinglePlayerGame.saveGame(GUI_SaveFileManager.AUTO_SAVE_SLOT, Callback.New((success: boolean) => {
                if (success) {
                    console.log("[存档] 自动存档完成 (slot 0)");
                }
            }, this), this.getCustomSaveIndexInfo());
        } catch (e) {
            // 静默失败，不影响游戏
        }
    }

    /**
     * 读取浏览器localStorage字符串值（兼容引擎LocalStorage.getJSON和原生localStorage）
     */
    private static readLocalStr(key: string): string {
        let v = '';
        try { v = LocalStorage.getJSON(key) || ''; } catch (e) {}
        if (!v) { try { v = window.localStorage.getItem(key) || ''; } catch (e) {} }
        return v;
    }

    /**
     * 通过可能的key列表读取存档数据（先尝试JSON解析，再回退到原生localStorage原始字符串）
     */
    private static readSaveDataByKeys(relativePath: string): any {
        const keys = GUI_SaveFileManager._getWebSaveKeys(relativePath);
        for (let k = 0; k < keys.length; k++) {
            let d: any = LocalStorage.getJSON(keys[k]);
            if (d) return d;
        }
        // 引擎存档使用 LocalStorage.setItem() 存入原始字符串，不是JSON格式
        for (let k = 0; k < keys.length; k++) {
            try {
                const raw = window.localStorage.getItem(keys[k]);
                if (raw) return raw;
            } catch (e) {}
        }
        return null;
    }

    /**
     * 初始化：从本地恢复登录状态（在游戏启动时调用）
     * @param onFin 完成后回调(success:boolean)
     */
    static init(onFin: Callback = null) {
        onFin = normCB(onFin);
        // 同步读取本地存储
        let savedToken = GUI_SaveFileManager.currentToken || GUI_SaveFileManager.readLocalStr('mk_token');
        let savedCharName = GUI_SaveFileManager.readLocalStr('mk_charactername');
        let savedUsername = GUI_SaveFileManager.readLocalStr('mk_username');

        // 立即同步设置游戏变量
        if (savedToken) {
            GUI_SaveFileManager.setUserToken(savedToken);
            try { GameVariable.setNumber(14003, savedToken); } catch (e) {}
        }
        if (savedCharName) {
            try { GameVariable.setString(14002, savedCharName); } catch (e) {}
        }
        if (savedUsername) {
            try { GameVariable.setString(14004, savedUsername); } catch (e) {}
        }

        // 扫描localStorage已有存档，立即填充saveIDs
        if (typeof SinglePlayerGame !== 'undefined') {
            for (let si = 1; si <= 5; si++) {
                let sd: any = GUI_SaveFileManager.readSaveDataByKeys("savedata/gamedata" + si + ".gcdata");
                if (sd) {
                    GUI_SaveFileManager.ensureSaveIDEntry(si, sd);
                }
            }
        }

        console.log("[存档] 初始化完成，使用纯本地存档模式");

        // 轮询设置 Game.player.variable（引擎实例变量，创建较晚）
        let pc = 0;
        let poller = setInterval(function() {
            if (Game && Game.player && Game.player.variable) {
                try {
                    if (savedCharName) Game.player.variable.setString(14002, savedCharName);
                    if (savedToken) Game.player.variable.setString(14003, savedToken);
                    if (savedUsername) Game.player.variable.setString(14004, savedUsername);
                } catch (e) {}
                clearInterval(poller);
            }
            pc++;
            if (pc >= 30) clearInterval(poller);
        }, 200);

        onFin && onFin.runWith([true]);
    }
    //------------------------------------------------------------------------------------------------------
    // 存档和读档
    //------------------------------------------------------------------------------------------------------
    /**
     * 初始化档案列表
     * @param list 档案列表组件
     */
    static initSaveFileList(list: UIList, saveMode: boolean = false) {
        // 标准化list
        GUI_Manager.standardList(list);
        list.on(EventObject.DISPLAY, this, GUI_SaveFileManager.onSaveFileListDisplay, [list, saveMode]);
        list.on(UIList.ITEM_CREATE, this, GUI_SaveFileManager.onCreateSaveFileItem, [saveMode]);
        list.on(UIList.ITEM_CLICK, this, GUI_SaveFileManager.onListItemClick, [list, saveMode]);
        stage.on(EventObject.KEY_DOWN, list, GUI_SaveFileManager.onKeyDown, [list]);
    }
    /**
     * 存档（纯本地）
     * @param id 档案ID
     * @param executeEvent [可选] 默认值=true 是否执行「存档完毕事件」
     * @param onFin [可选] 默认值=null 存档完毕后回调
     * @param waitEventCompleteCallback [可选] 默认值=true 存档完毕后回调是否等待「存档完毕事件」执行完成后回调
     */
    static saveFile(id: number, executeEvent: boolean = true, onFin: Callback = null, waitEventCompleteCallback: boolean = true) {
        if (GameGate.STATE_3_IN_SCENE_COMPLETE < 3) {
            onFin && onFin.run();
            return;
        }
        // -- 储存到本地
        SinglePlayerGame.saveGame(id, Callback.New((success: boolean) => {
            if (executeEvent) {
                if (onFin && !waitEventCompleteCallback) onFin.run();
                if (success) {
                    let saveUI: GUI_5 = GameUI.get(5) as any;
                    if (saveUI) GUI_SaveFileManager.refreshSaveFileItem(saveUI.list);
                    // 刷新当前档案的目录信息
                    let currentSveFileIndexInfo = ArrayUtils.matchAttributes(SinglePlayerGame.getSaveInfo(), { id: id }, true, "==")[0];
                    if (currentSveFileIndexInfo) GUI_SaveFileManager.currentSveFileIndexInfo = currentSveFileIndexInfo;

                    // 储存档案-成功
                    GameCommand.startCommonCommand(14008, [], Callback.New((onFin: Callback) => {
                        onFin && onFin.run();
                    }, this, [waitEventCompleteCallback ? onFin : null]));
                }
                else {
                    // 储存档案-失败
                    GameCommand.startCommonCommand(14009, [], Callback.New((onFin: Callback) => {
                        onFin && onFin.run();
                    }, this, [waitEventCompleteCallback ? onFin : null]));
                }
            }
            else {
                if (onFin) onFin.run();
            }
        }, this), this.getCustomSaveIndexInfo());
    }

    /** 生成存档文件所有可能的localStorage key（短key+URL前缀长key） */
    static _getWebSaveKeys(relativePath: string): string[] {
        const keys = [relativePath];
        try {
            const href = window.location.href.split("?")[0];
            if (href) {
                keys.push(href + "/" + relativePath);
                if (typeof Config !== 'undefined' && (Config as any).gameSID) {
                    keys.push(href + "/" + (Config as any).gameSID + "/" + relativePath);
                }
            }
        } catch (e) {}
        return keys;
    }
    /** 写入存档到所有可能的localStorage key */
    static _setSaveDataToAllKeys(relativePath: string, data: any) {
        const keys = GUI_SaveFileManager._getWebSaveKeys(relativePath);
        for (let ki = 0; ki < keys.length; ki++) {
            LocalStorage.setJSON(keys[ki], data);
        }
    }

    /** 确保存档ID在SinglePlayerGame.saveIDs中存在，让引擎能识别 */
    static ensureSaveIDEntry(slotId: number, parsedSaveData: any) {
        try {
            if (typeof SinglePlayerGame === 'undefined' || !(SinglePlayerGame as any).saveIDs) return;
            const idxInfo: any = parsedSaveData && parsedSaveData[15] ? parsedSaveData[15] : { screenshotImg: '', mapName: '', gameTime: 0 };
            if (typeof ArrayUtils !== 'undefined') {
                const existing = ArrayUtils.matchAttributes((SinglePlayerGame as any).saveIDs, { id: slotId }, true)[0];
                if (!existing) {
                    (SinglePlayerGame as any).saveIDs.push({ id: slotId, indexInfo: idxInfo, now: Date.now() });
                } else {
                    if (idxInfo) existing.indexInfo = idxInfo;
                    existing.now = Date.now();
                }
            } else {
                let found = -1;
                const saveIDs: any[] = (SinglePlayerGame as any).saveIDs;
                for (let i = 0; i < saveIDs.length; i++) {
                    if (saveIDs[i].id === slotId) { found = i; break; }
                }
                if (found === -1) {
                    saveIDs.push({ id: slotId, indexInfo: idxInfo, now: Date.now() });
                } else {
                    if (idxInfo) saveIDs[found].indexInfo = idxInfo;
                    saveIDs[found].now = Date.now();
                }
            }
        } catch (e) {
            console.log("[存档] 更新saveID条目失败:", e);
        }
    }

    /**
     * 读档（纯本地）
     * @param id 档案编号
     * @param onFin [可选] 默认值=null 读档完毕后回调
     */
    static loadFile(id: number, onFin: Callback = null) {
        // 读取中的情况不再能够读取
        if (GUI_SaveFileManager.isLoading) return;
        GUI_SaveFileManager.isLoading = true;
        // 读取存档时清理下玩家输入状态
        GameCommand.isNeedPlayerInput = false;

        // 内部读档逻辑（从本地存储读取）
        const internalLoad = () => {
            // 如果已在游戏内的话则进行一次性重启读档
            if (Game.currentScene != ClientScene.EMPTY) {
                if (SinglePlayerGame.getSaveInfoByID(id) == null) {
                    GUI_SaveFileManager.isLoading = false;
                    return;
                }
                // 直接读档的场合
                LocalStorage.setJSON(GUI_SaveFileManager.onceInSceneLoadGameSign, { id: id });
                window.location.reload();
                return;
            }
            // 读取存档，失败的话调用失败时事件处理
            SinglePlayerGame.loadGame(id, Callback.New((success: boolean, customData: any) => {
                if (success) {
                    EventUtils.addEventListener(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, Callback.New(() => {
                        if (GameGate.gateState == GameGate.STATE_3_IN_SCENE_COMPLETE) {
                            GUI_SaveFileManager.isLoading = false;
                            GUI_SaveFileManager.executeLoadSceneScaleCommand();
                            // 通知聊天系统读档完成，重新加载数据
                            GUI_SaveFileManager._notifySaveLoaded();
                        }
                    }, this));
                }
                else {
                    GameCommand.startCommonCommand(14007);
                    GUI_SaveFileManager.isLoading = false;
                }
                GUI_SaveFileManager.currentSaveFileCustomData = customData;
                if (onFin) onFin.runWith([success]);
            }, this));
        };

        // 纯本地模式：直接从本地读取，不与服务器交互
        internalLoad();
    }

    /**
     * 读档成功后执行场景缩放指令
     */
    static executeLoadSceneScaleCommand() {
        try {
            // 检查场景是否已加载
            if (!Game) {
                console.log("[读档后] Game 对象未定义，跳过镜头缩放");
                return;
            }
            if (!Game.currentScene) {
                console.log("[读档后] Game.currentScene 未定义，跳过镜头缩放");
                return;
            }
            if (!Game.currentScene.camera) {
                console.log("[读档后] Game.currentScene.camera 未定义，跳过镜头缩放");
                return;
            }
            
            // 输出当前camera状态
            console.log("[读档后] 当前镜头状态 - scaleX:", Game.currentScene.camera.scaleX, ", scaleY:", Game.currentScene.camera.scaleY);
            
            // 延迟执行缩放指令，确保场景完全渲染
            setTimeout(() => {
                try {
                    console.log("[读档后] 开始执行场景缩放指令...");
                    
                    // 场景镜头缩放参数
                    const params = {
                        useScaleX: true,        // 启用横向缩放
                        useScaleY: true,        // 启用垂直缩放
                        scaleX: 1,              // 目标缩放 X 值（1 = 100%，1倍缩放）
                        scaleY: 1,              // 目标缩放 Y 值（1 = 100%，1倍缩放）
                        scaleXUseVar: 0,        // 不使用变量
                        scaleYUseVar: 0,        // 不使用变量
                        scaleX2: 0,             // 备用缩放 X 值（使用变量时生效）
                        scaleY2: 0,             // 备用缩放 Y 值（使用变量时生效）
                        trans: "",              // 缓动类型
                        useTrans: false,        // 不使用时间过渡
                        time: 30                // 过渡帧数（useTrans=true时生效）
                    };
                    
                    // 优先尝试调用自定义指令执行函数
                    if (typeof CommandExecute !== 'undefined' && typeof CommandExecute.customCommand_1007 === 'function') {
                        console.log("[读档后] 调用 CommandExecute.customCommand_1007，参数:", params);
                        CommandExecute.customCommand_1007(null, null, null, null, [], params);
                        console.log("[读档后] 场景缩放指令执行完成（通过CommandExecute.customCommand_1007）");
                    } else {
                        console.log("[读档后] CommandExecute.customCommand_1007 不可用，使用降级方案");
                        // 降级方案：直接设置camera属性
                        if (params.useScaleX) {
                            const sx = params.scaleXUseVar == 1 ? Game.player.variable.getVariable(params.scaleX2) : params.scaleX;
                            console.log("[读档后] 设置 camera.scaleX =", sx);
                            Game.currentScene.camera.scaleX = sx;
                        }
                        if (params.useScaleY) {
                            const sy = params.scaleYUseVar == 1 ? Game.player.variable.getVariable(params.scaleY2) : params.scaleY;
                            console.log("[读档后] 设置 camera.scaleY =", sy);
                            Game.currentScene.camera.scaleY = sy;
                        }
                        console.log("[读档后] 场景缩放指令执行完成（通过直接设置camera属性）");
                    }
                    
                    // 输出执行后的camera状态
                    console.log("[读档后] 执行后镜头状态 - scaleX:", Game.currentScene.camera.scaleX, ", scaleY:", Game.currentScene.camera.scaleY);
                    console.log("[读档后] 镜头缩放已成功应用");
                } catch (e) {
                    console.error("[读档后] 延迟执行场景缩放指令失败:", e);
                }
            }, 500);
            
        } catch (e) {
            console.error("[读档后] 场景缩放指令执行失败:", e);
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 私有函数-档案界面显示处理
    //------------------------------------------------------------------------------------------------------
    /**
     * 当档案列表所属的界面显示时
     * 纯本地模式：直接从本地读取存档列表
     * @param list 列表
     */
    private static onSaveFileListDisplay(list: UIList, saveMode: boolean = false) {
        UIList.focus = list;
        // 纯本地模式：直接刷新本地存档列表
        this.refreshSaveFileItem(list);
    }
    /**
     * 当列表项显示对象点击时
     * @param saveMode 
     */
    private static onListItemClick(list: UIList, saveMode: boolean) {
        // 未选中任何项的话忽略
        let selectedIndex = list.selectedIndex;
        if (selectedIndex < 0) return;
        // 防御性检查：确保list和selectedItem存在
        if (!list || !list.selectedItem) return;
        // 存档
        if (saveMode) {
            GUI_SaveFileManager.saveFile(selectedIndex + 1);
        }
        else {
            // 不存在档案数据的话则忽略
            let saveFileData: { indexInfo: SaveFileListCustomData, id: number, now: number } = list.selectedItem.data;
            if (!saveFileData) return;
            // 读取存档，失败的话调用失败时事件处理
            GUI_SaveFileManager.currentSveFileIndexInfo = saveFileData;
            GUI_SaveFileManager.loadFile(selectedIndex + 1)
        }
    }
    /**
     * 当每创建一个档案项时回调函数
     * @param saveMode 存档模式
     * @param ui 档案项界面
     * @param data 档案项数据
     * @param index 档案项索引
     */
    private static onCreateSaveFileItem(saveMode: boolean, ui: GUI_1001, data: ListItem_1001, index: number) {
        let saveFileData: { indexInfo: SaveFileListCustomData, id: number, now: number } = data.data;
        // 如果没有档案数据则删除按钮和缩略图都隐藏
        if (ui.screenshotImg) ui.screenshotImg.visible = (saveFileData ? true : false);
        if (ui.delBtn) {
            ui.delBtn.on(EventObject.MOUSE_DOWN, this, (e: EventObject) => { e.stopPropagation(); });
            ui.delBtn.on(EventObject.MOUSE_UP, this, (e: EventObject) => { e.stopPropagation(); });
            if (saveFileData) {
                ui.texts.visible = true;
                ui.delBtn.visible = true;
                ui.delBtn.commandInputMessage = [saveFileData.id];
            }
            else {
                ui.texts.visible = false;
                ui.delBtn.visible = false;
            }
        }
    }
    /**
     * 刷新存档数据显示（纯本地）
     * @param list 档案列表组件 
     */
    static refreshSaveFileItem(list: UIList) {
        if (!list) return;
        let saveInfo = SinglePlayerGame.getSaveInfo();
        let items = [];
        for (let i = 1; i <= WorldData.saveFileMax; i++) {
            let saveFile: { indexInfo: SaveFileListCustomData, id: number, now: number } = ArrayUtils.matchAttributes(saveInfo, { id: i }, true)[0];
            let itemData = new ListItem_1001();
            itemData.no = i.toString();
            // 存在档案数据的情况
            if (saveFile) {
                itemData.data = saveFile;
                // 防御性修复：indexInfo可能为null（引擎内部空存档条目的初始化问题）
                if (!saveFile.indexInfo) {
                    saveFile.indexInfo = new SaveFileListCustomData();
                    saveFile.indexInfo.screenshotImg = "";
                    saveFile.indexInfo.mapName = "";
                    saveFile.indexInfo.gameTime = 0;
                }
                itemData.screenshotImg = saveFile.indexInfo.screenshotImg;
                //@ts-ignore
                var info = GameData.parseTemplateLanguage({ key: saveFile.indexInfo.mapName });
                itemData.mapName = info.key;
                itemData.gameTimeStr = ProjectUtils.timerFormat(saveFile.indexInfo.gameTime);
                itemData.dateStr = ProjectUtils.dateFormat("YYYY-mm-dd HH:MM", new Date(saveFile.now));
            }
            else {
                itemData.screenshotImg = "";
                itemData.mapName = "";
                itemData.gameTimeStr = "";
                itemData.dateStr = "";
            }
            items.push(itemData);
        }
        list.items = items;
    }

    //------------------------------------------------------------------------------------------------------
    // 私有函数-获取存档相关数据
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取自定义档案目录数据
     * -- 截图
     * -- 场景名称
     * -- 游戏时间
     */
    private static getCustomSaveIndexInfo() {
        // -- 游戏截图：隐藏界面后截图，先全屏再缩放后截一次
        let per = 0.25;
        Game.layer.uiLayer.alpha = 0;
        let fullScreenTex = AssetManager.drawToTexture(Game.layer, stage.width, stage.height);
        Game.layer.uiLayer.alpha = 1;
        let screenRoot = new GameSprite();
        let screenBitmap = new UIBitmap;
        screenBitmap.texture = fullScreenTex;
        screenRoot.addChild(screenBitmap);
        screenBitmap.scaleX = screenBitmap.scaleY = per;
        let smallScreenTex = AssetManager.drawToTexture(screenRoot, MathUtils.int(stage.width * per), MathUtils.int(stage.height * per));
        fullScreenTex.dispose();
        let smallScreenTexBase64 = AssetManager.textureToBase64(smallScreenTex);
        smallScreenTex.dispose();
        let customSaveIndexInfo = new SaveFileListCustomData;
        customSaveIndexInfo.screenshotImg = smallScreenTexBase64;
        customSaveIndexInfo.gameTime = Game.gameTime;
        customSaveIndexInfo.mapName = Game.currentScene.name;
        return customSaveIndexInfo;
    }
    /**
     * 当按键按下时
     * @param list 
     * @param e 
     */
    private static onKeyDown(list: UIList, e: EventObject): void {
        if (list.stage && UIList.focus == list) {
            if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.X)) {
                let ui: GUI_1001 = list.getItemUI(list.selectedIndex) as GUI_1001;
                let uiComp = ui.delBtn;
                // 触发删除按钮的点击事件
                GameCommand.startUICommand(uiComp, 0, uiComp.commandInputMessage);
            }
        }
    }
    /**
     * 通知外部系统读档完成
     * 通过多种方式通知聊天界面和排行榜界面刷新数据
     */
    private static _notifySaveLoaded() {
        console.log("[存档] 读档完成，通知外部系统刷新数据");
        
        try {
            // 方式1: 发送CustomEvent事件
            window.dispatchEvent(new CustomEvent('mk_game_loaded', { detail: { type: 'SAVE_LOADED' } }));
            console.log("[存档] 已发送 mk_game_loaded 事件");
        } catch (e) {
            console.log('[存档] 发送 mk_game_loaded 事件失败:', e);
        }
        
        try {
            // 方式2: 通过window.postMessage发送消息（适用于iframe场景）
            window.postMessage({ type: 'SAVE_LOADED' }, '*');
            console.log("[存档] 已发送 postMessage SAVE_LOADED");
        } catch (e) {
            console.log('[存档] 发送 postMessage 失败:', e);
        }
        
        try {
            // 方式3: 直接调用聊天界面的刷新函数（如果存在）
            if (typeof window.refreshChat === 'function') {
                window.refreshChat();
                console.log("[存档] 已直接调用 refreshChat()");
            }
        } catch (e) {
            console.log('[存档] 调用 refreshChat() 失败:', e);
        }
        
        try {
            // 方式4: 直接调用排行榜刷新函数（如果存在）
            if (typeof window.refreshRanking === 'function') {
                window.refreshRanking();
                console.log("[存档] 已直接调用 refreshRanking()");
            }
        } catch (e) {
            console.log('[存档] 调用 refreshRanking() 失败:', e);
        }
        
        // 通知游戏数据更新
        try {
            window.dispatchEvent(new CustomEvent('mk_game_stats_update', { detail: { type: 'GAME_STATS_UPDATE' } }));
        } catch (e) {}
    }
}

/**
 * 档案目录追加的自定义数据
 * 档案目录使用GC-LifeData，是一种全局数据，在游戏启动时会自动读取
 * 该模板追加了一些自定义的档案目录数据，以便在读档前即可查看档案的一些缩略资料（目录）
 * 
 * Created by 黑暗之神KDS on 2020-09-15 13:09:31.
 */

class SaveFileListCustomData {
    /**
     * 截图：base64字符串，Web版游戏本存在存档容量限定，所以缩略截图尽可能小
     */
    screenshotImg: string;
    /**
     * 地图名
     */
    mapName: string;
    /**
     * 总游戏时间（毫秒）
     */
    gameTime: number;
}