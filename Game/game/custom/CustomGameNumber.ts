/**
 * 自定义游戏数值
 * Created by 黑暗之神KDS on 2020-09-16 19:47:24.
 */
module CustomGameNumber {
    /**
     * 场景数值获取
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f1(trigger: CommandTrigger, p: CustomGameNumberParams_1): number {
        // 没有场景的情况下返回0，比如切换场景中的情况
        if (!Game.currentScene) return 0;
        let scene = Game.currentScene;
        if (p.type == 0) return scene.id;
        if (p.type == 1) return p.isGrid ? scene.gridWidth : scene.width;
        if (p.type == 2) return p.isGrid ? scene.gridHeight : scene.height;
        if (p.type == 3) return scene.sceneObjects.length - 1;
        if (p.type == 4) {
            let xGrid = p.dataGridUseVar ? Game.player.variable.getVariable(p.x2) : p.x;
            let yGrid = p.dataGridUseVar ? Game.player.variable.getVariable(p.y2) : p.y;
            if (p.dataGridIndex == 0) {
                ProjectUtils.pointHelper.x = xGrid;
                ProjectUtils.pointHelper.y = yGrid;
                let soc = ProjectClientScene.getSceneObjectBySetting(p.dataLayerSoType, p.dataLayerSoIndex, p.dataLayerSoUseVar, p.dataLayerSoVarID, trigger);
                return p.dynamicObs ? (scene.sceneUtils.isObstacleGrid(ProjectUtils.pointHelper, soc) ? 1 : 0) : (scene.sceneUtils.isFixedObstacleGrid(ProjectUtils.pointHelper) ? 1 : 0);
            }
            else {
                return scene.getDataGridState(p.dataGridIndex, xGrid, yGrid);
            }
        }
        if (p.type == 5) {
            if (p.cameraAttr == 0) return scene.camera.viewPort.x;
            if (p.cameraAttr == 1) return scene.camera.viewPort.y;
            if (p.cameraAttr == 2) return scene.camera.scaleX;
            if (p.cameraAttr == 3) return scene.camera.scaleY;
            if (p.cameraAttr == 4) return scene.camera.rotation;
        }
    }
    /**
     * 场景对象数值
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f2(trigger: CommandTrigger, p: CustomGameNumberParams_2): number {
        // 没有场景的情况下返回0，比如切换场景中的情况
        if (!Game.currentScene) return 0;
        // 获取对象
        let so: ProjectClientSceneObject = p.soType <= 2 ? ProjectClientScene.getSceneObjectBySetting(p.soType, null, null, null, trigger) : Game.currentScene.sceneObjects[Math.max(CustomCompData.getSuperNumber(p.soIndex), 0)];
        if (!(so instanceof ProjectClientSceneObject) && p.type != 13) return 0;
        // 属性
        if (p.type == 0) return so.index;
        if (p.type == 1) return so.modelID;
        if (p.type == 2) {
            if (p.posMode == 0) {
                return so.x;
            }
            else if (p.posMode == 1) {
                return Math.floor(so.x / Config.SCENE_GRID_SIZE);
            }
            else {
                return Game.currentScene.getGlobalPos(so.x, so.y).x;
            }
        }
        if (p.type == 3) {
            if (p.posMode == 0) {
                return so.y;
            }
            else if (p.posMode == 1) {
                return Math.floor(so.y / Config.SCENE_GRID_SIZE);
            }
            else {
                return Game.currentScene.getGlobalPos(so.x, so.y).y;
            }
        }
        if (p.type == 4) return so.avatar.id;
        if (p.type == 5) return so.scale;
        if (p.type == 6) return so.avatarAlpha;
        if (p.type == 7) return so.avatarHue;
        if (p.type == 8) return so.avatarFPS;
        if (p.type == 9) return so.moveSpeed;
        if (p.type == 10) return so.avatar.orientation;
        if (p.type == 11) return so.avatar.actionID;
        if (p.type == 12) return so.avatar.currentFrame;
        if (p.type == 13) {
            //获取设置的名称
            let varName: string;
            if (p.customAttr.selectMode == 1) {
                let mode = p.customAttr.inputModeInfo.mode;
                let constName = p.customAttr.inputModeInfo.constName;
                let varNameIndex = p.customAttr.inputModeInfo.varNameIndex;
                varName = mode == 0 ? constName : Game.player.variable.getString(varNameIndex);
            }
            else {
                varName = p.customAttr.varName;
            }
            if (so[varName] == undefined) return 0;
            //@ts-ignore
            if (p.customAttr.isCustomModule) return so[varName].id;
            //指定界面
            if (p.customAttr.compAttrEnable) {
                // 获取界面
                let ui: GUI_BASE = so[varName];
                if (!ui || !(ui instanceof GUI_BASE)) return 0;
                // 根据组件唯一ID找到该组件
                let comp = ui.compsIDInfo[p.customAttr.compInfo.compID];
                if (!comp) return 0;
                return MathUtils.float(comp[p.customAttr.compInfo.varName]);
            } else {
                return MathUtils.float(so[varName]);
            }
        }
        if (p.type == 14) {
            let soModule = so.getModule(p.soModuleAttr.moduleID);
            if (!soModule) return 0;
            //获取设置的名称
            let varName: string;
            if (p.soModuleAttr.selectMode == 1) {
                let mode = p.soModuleAttr.inputModeInfo.mode;
                let constName = p.soModuleAttr.inputModeInfo.constName;
                let varNameIndex = p.soModuleAttr.inputModeInfo.varNameIndex;
                varName = mode == 0 ? constName : Game.player.variable.getString(varNameIndex);
            }
            else {
                varName = p.soModuleAttr.varName;
            }
            if (soModule[varName] == undefined) return 0;
            //@ts-ignore
            if (p.soModuleAttr.isCustomModule) return soModule[varName].id;
            //指定界面
            if (p.soModuleAttr.compAttrEnable) {
                // 获取界面
                let ui: GUI_BASE = soModule[varName];
                if (!ui || !(ui instanceof GUI_BASE)) return 0;
                // 根据组件唯一ID找到该组件
                let comp = ui.compsIDInfo[p.soModuleAttr.compInfo.compID];
                if (!comp) return 0;
                return MathUtils.float(comp[p.soModuleAttr.compInfo.varName]);
            } else {
                if (soModule[varName] instanceof GCAnimation) return soModule[varName].id;
                else if (soModule[varName] instanceof UIBase) return soModule[varName].guiID;
                else return MathUtils.float(soModule[varName]);
            }
        }
        if (p.type == 15) {
            if (!GameBattleHelper.isBattler(so)) return 0;
            let battleModule = so.getModule(6) as SoModule_Battler;
            if (!battleModule) return 0;
            var actor = battleModule.actor;
            if (!actor) return 0;
            return getActorAttributes(actor, p.actorAttrName, p.actorCustomAttr.varName, p.trend, p.extendAttribute);
        }
    }
    /**
     * 场景对象关系
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f3(trigger: CommandTrigger, p: CustomGameNumberParams_3): number {
        // 没有场景的情况下返回0，比如切换场景中的情况
        if (!Game.currentScene) return 0;
        // 获取对象
        let so1: ProjectClientSceneObject = ProjectClientScene.getSceneObjectBySetting(p.soType1, p.no1, p.useVar1, p.varID1, trigger);
        if (!so1) return 0;
        let so2: ProjectClientSceneObject = ProjectClientScene.getSceneObjectBySetting(p.soType2, p.no2, p.useVar2, p.varID2, trigger);
        if (!so2) return 0;
        // 比较属性
        if (p.type == 0) return GameUtils.getOriByAngle(MathUtils.direction360(so1.x, so1.y, so2.x, so2.y));
        if (p.type == 1) {
            let dis = Point.distance2(so1.x, so1.y, so2.x, so2.y);
            return p.isGrid ? Math.floor(dis / Config.SCENE_GRID_SIZE) : dis;
        }
        if (p.type == 2) return p.isGrid ? Math.floor((so2.x - so1.x) / Config.SCENE_GRID_SIZE) : so2.x - so1.x;
        if (p.type == 3) return p.isGrid ? Math.floor((so2.y - so1.y) / Config.SCENE_GRID_SIZE) : so2.y - so1.y;
        if (p.type == 4) return MathUtils.direction360(so1.x, so1.y, so2.x, so2.y);
    }
    /**
     * 玩家
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f4(trigger: CommandTrigger, p: CustomGameNumberParams_4): number {
        if (p.type == 0) return Game.player.data.gold;
        if (p.type == 1) {
            let itemDS = ProjectPlayer.getItemDS(p.itemID);
            return itemDS ? itemDS.number : 0;
        }
        if (p.type == 2) {
            //获取设置的名称
            let varName: string;
            if (p.playerData.selectMode == 1) {
                let mode = p.playerData.inputModeInfo.mode;
                let constName = p.playerData.inputModeInfo.constName;
                let varNameIndex = p.playerData.inputModeInfo.varNameIndex;
                varName = mode == 0 ? constName : Game.player.variable.getString(varNameIndex);
            }
            else {
                varName = p.playerData.varName;
            }
            if (Game.player.data[varName] == undefined) return 0;
            //@ts-ignore
            if (p.playerData.isCustomModule) return Game.player.data[varName].id;
            return MathUtils.float(Game.player.data[varName]);
        }
        if (p.type == 3) {
            var actorID = p.actorUseVar ? Game.player.variable.getVariable(p.actorIDVarID) : p.actorID;
            return ArrayUtils.matchAttributesD2(Game.player.data.party, "actor", { id: actorID }, false).length;
        }
        if (p.type == 4) {
            if (p.actorCheckType == 0) {
                var actorID = p.actorUseVar ? Game.player.variable.getVariable(p.actorIDVarID) : p.actorID;
                var actorDS = ProjectPlayer.getPlayerActorDSByActorID(actorID);
            }
            else {
                var inPartyIndex = p.actorInPartyIndexVarIDUseVar ? Game.player.variable.getVariable(p.actorInPartyIndexVarID) : p.actorInPartyIndex;
                actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
            }
            if (!actorDS) return 0;
            return getActorAttributes(actorDS.actor, p.actorAttrName, p.actorCustomAttr.varName, p.trend, p.extendAttribute);
        }
        if (p.type == 5) {
            return Game.player.data.party.length;
        }
        if (p.type == 6) return ProjectPlayer.ctrlActorSceneObject.index;
        if (p.type == 7) return ProjectPlayer.ctrlActorBattleModule.actor.id;
    }
    /**
     * 界面
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f5(trigger: CommandTrigger, p: CustomGameNumberParams_5): number {
        // 界面按钮焦点数
        if (p.type == 2) {
            if (!FocusButtonsManager.focus) return -1;
            return FocusButtonsManager.focus.selectedIndex;
        }
        // 获取界面
        let uiID: number;
        if (p.useVarID) {
            uiID = Game.player.variable.getVariable(p.uiIDVarID);
        }
        else {
            uiID = p.type == 1 ? p.uiComp.uiID : p.uiID;
        }
        // 界面ID
        let ui: GUI_BASE = GameUI.get(uiID) as any;
        if (!ui) return 0;
        // 界面本体属性
        if (p.type == 0) {
            return MathUtils.float(ui[p.uiAttrName]);
        }
        // 界面内组件的属性
        else if (p.type == 1) {
            // 根据组件唯一ID找到该组件
            let comp = ui.compsIDInfo[p.uiComp.compID];
            if (!comp) return 0;
            return MathUtils.float(comp[p.uiComp.varName]);
        }
    }
    /**
     * 鼠标
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f6(trigger: CommandTrigger, p: CustomGameNumberParams_6): number {
        if (p.type == 0) return stage.mouseX;
        else if (p.type == 1) return stage.mouseY;
        else if (p.type == 2) {
            let gridX = Game.currentScene ? (p.isGrid ? Math.floor(Game.currentScene.localX / Config.SCENE_GRID_SIZE) : Game.currentScene.localX) : 0;
            let res = Math.min(Math.max(gridX, 0), (p.isGrid ? Game.currentScene.gridWidth : Game.currentScene.width) - 1);
            return res;
        }
        else if (p.type == 3) {
            let gridY = Game.currentScene ? (p.isGrid ? Math.floor(Game.currentScene.localY / Config.SCENE_GRID_SIZE) : Game.currentScene.localY) : 0;
            let res = Math.min(Math.max(gridY, 0), (p.isGrid ? Game.currentScene.gridHeight : Game.currentScene.height) - 1);
            return res;
        }
        else if (p.type == 4) return MouseControl.selectSceneObject && MouseControl.selectSceneObject.inScene ? MouseControl.selectSceneObject.index : -1;
        else if (p.type == 5) return ProjectUtils.mouseWhileValue;
        else if (p.type == 6) return p.pointKeyboard;
        else if (p.type == 7) return ProjectUtils.keyboardEvents.length > 0 ? ProjectUtils.keyboardEvents[ProjectUtils.keyboardEvents.length - 1].keyCode : -1;
        else if (p.type == 8) {
            let keyCode = ProjectUtils.keyboardEvents.length > 0 ? ProjectUtils.keyboardEvents[ProjectUtils.keyboardEvents.length - 1].keyCode : -1;
            if (keyCode == -1) return -1;
            let resultI = -1;
            let min = Number.MAX_VALUE;
            for (var i = 0; i < GUI_Setting.SYSTEM_KEYS.length; i++) {
                let keys: number[] = GUI_Setting.KEY_BOARD[GUI_Setting.SYSTEM_KEYS[i]].keys;
                if (keys) {
                    let idx = keys.indexOf(keyCode);
                    if (idx != -1 && idx < min) {
                        resultI = i;
                        min = idx;
                    }
                }
            }
            return resultI;
        }
    }
    /**
     * 模块 - 数值属性
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f7(trigger: CommandTrigger, p: CustomGameNumberParams_7): number {
        let moduleID = p.modelData.moduleID;
        let dataID: number;
        if (p.modelData.dataIsUseVar) {
            dataID = Game.player.variable.getVariable(p.modelData.dataVarID);
        }
        else {
            dataID = p.modelData.dataID;
        }
        let moduleData = GameData.getModuleData(moduleID, dataID);
        if (!moduleData) return 0;
        //获取设置的名称
        let varName: string;
        if (p.modelData.selectMode == 1) {
            let mode = p.modelData.inputModeInfo.mode;
            let constName = p.modelData.inputModeInfo.constName;
            let varNameIndex = p.modelData.inputModeInfo.varNameIndex;
            varName = mode == 0 ? constName : Game.player.variable.getString(varNameIndex);
        }
        else {
            varName = p.modelData.varName;
        }
        if (moduleData[varName] == undefined) return 0;
        //@ts-ignore
        if (p.modelData.isCustomModule) return moduleData[varName].id;
        return MathUtils.float(moduleData[varName]);
    }
    /**
     * 世界 - 数值属性
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f8(trigger: CommandTrigger, p: CustomGameNumberParams_8): number {
        if (p.type == 0) {
            if (p.presetType == 0) return GameAudio.bgmVolume * 100;
            if (p.presetType == 1) return GameAudio.bgsVolume * 100;
            if (p.presetType == 2) return GameAudio.seVolume * 100;
            if (p.presetType == 3) return GameAudio.tsVolume * 100;
        }
        else {
            //获取设置的名称
            let varName: string;
            if (p.worldData.selectMode == 1) {
                let mode = p.worldData.inputModeInfo.mode;
                let constName = p.worldData.inputModeInfo.constName;
                let varNameIndex = p.worldData.inputModeInfo.varNameIndex;
                varName = mode == 0 ? constName : Game.player.variable.getString(varNameIndex);
            }
            else {
                varName = p.worldData.varName;
            }
            if (WorldData[varName] == undefined) return 0;
            //@ts-ignore
            if (p.worldData.isCustomModule) return WorldData[varName].id;
            return MathUtils.float(WorldData[varName]);
        }
    }
    /**
     * 其他
     */
    export function f9(trigger: CommandTrigger, p: CustomGameNumberParams_9): number {
        switch (p.normalNumber) {
            case 0:
                return !ProjectGame.gameStartTime ? 0 : (Date.now() - ProjectGame.gameStartTime.getTime());
            case 1:
                return !ProjectGame.gameStartTime ? 0 : (Math.floor((Date.now() - ProjectGame.gameStartTime.getTime()) / 1000));
            case 2:
                return !ProjectGame.gameStartTime ? 0 : (Math.floor((Date.now() - ProjectGame.gameStartTime.getTime()) / 60000));
            case 3:
                return !ProjectGame.gameStartTime ? 0 : (Math.floor((Date.now() - ProjectGame.gameStartTime.getTime()) / 3600000));
            case 4:
                return !ProjectGame.gameStartTime ? 0 : (Math.floor((Date.now() - ProjectGame.gameStartTime.getTime()) / 86400000));
            case 5:
                return new Date().getSeconds();
            case 6:
                return new Date().getMinutes();
            case 7:
                return new Date().getHours();
            case 8:
                return new Date().getDay();
            case 9:
                return new Date().getDate();
            case 10:
                return new Date().getMonth() + 1;
            case 11:
                return new Date().getFullYear();
            case 12:
                return GUI_SaveFileManager.currentSveFileIndexInfo ? GUI_SaveFileManager.currentSveFileIndexInfo.id : 0;
            case 13:
                return MathUtils.float(trigger.inputMessage[0]);
            case 14:
                return MathUtils.float(trigger.inputMessage[1]);
            case 15:
                return MathUtils.float(trigger.inputMessage[2]);
            case 16:
                return MathUtils.float(trigger.inputMessage[3]);
            case 17:
                return MathUtils.float(trigger.inputMessage[4]);
            case 18:
                return __fCount;
            case 19:
                return CommandExecute.countDownNowTime;
        }
    }
    /**
     * 作用目标
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数
     */
    export function f10(trigger: CommandTrigger, p: CustomGameNumberParams_10): number {
        let actorDS: DataStructure_inPartyActor;
        switch (p.type1) {
            case 0:
                return GUI_Actor.actorSelectedIndex != null ? GUI_Actor.actorSelectedIndex : 0;
            case 1:
                actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(GUI_Actor.actorSelectedIndex)
                return actorDS ? actorDS.actor.id : 0;
            case 2:
                return GUI_Actor.actorIndex;
            case 3:
                actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(GUI_Actor.actorIndex)
                return actorDS ? actorDS.actor.id : 0;
            case 4:
                actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(GUI_Actor.actorIndex)
                return actorDS ? actorDS.sceneObjectIndex : -1;
        }
        return 0;
    }
    /**
     * 伤害计算
     */
    export let customDamageLogic_actionType: number;
    export let customDamageLogic_skill: Module_Skill;
    export let customDamageLogic_status: Module_Status;
    export function f11(trigger: CommandTrigger, p: CustomGameNumberParams_11): number {
        if (p.type == 0) {
            return MathUtils.int(customDamageLogic_actionType);
        }
        else if (p.type == 1) {
            if (!customDamageLogic_skill) return 0;
            if (p.attributeType == 0) {
                return MathUtils.float(customDamageLogic_skill[p.skill.varName]);
            }
            else {
                let res = Game.slotExtendAttributes(customDamageLogic_skill);
                if (!res) return 0;
                let extValue: number;
                if (p.attributeType == 1) extValue = res.extendAttributesFixed[p.extendAttribute];
                else if (p.attributeType == 2) extValue = res.extendAttributesFixed[p.extendAttribute];
                else if (p.attributeType == 3) extValue = res.extendAttributesFixed[p.extendAttribute];
                let extendAttributeSetting = Game.extendAttributeSettings[p.extendAttribute];
                if (extendAttributeSetting && p.attributeType == 1) {
                    extValue = Math.max(Math.min(extValue, extendAttributeSetting.upperLimit), extendAttributeSetting.lowerLimit);
                    if (extendAttributeSetting.isinteger) extValue = Math.floor(extValue);
                }
                return extValue;
            }
        }
        else if (p.type == 2) {
            if (!customDamageLogic_status) return 0;
            if (p.attributeType == 0) {
                return MathUtils.float(customDamageLogic_status[p.status.varName]);
            }
            else {
                let res = Game.slotExtendAttributes(customDamageLogic_status)
                if (!res) return 0;
                let extValue: number;
                if (p.attributeType == 1) extValue = res.extendAttributesFixed[p.extendAttribute];
                else if (p.attributeType == 2) extValue = res.extendAttributesFixed[p.extendAttribute];
                else if (p.attributeType == 3) extValue = res.extendAttributesFixed[p.extendAttribute];
                let extendAttributeSetting = Game.extendAttributeSettings[p.extendAttribute];
                if (extendAttributeSetting && p.attributeType == 1) {
                    extValue = Math.max(Math.min(extValue, extendAttributeSetting.upperLimit), extendAttributeSetting.lowerLimit);
                    if (extendAttributeSetting.isinteger) extValue = Math.floor(extValue);
                }
                return extValue;
            }
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    export let attributeRes: { MaxHP: number; MaxSP: number; ATK: number; DEF: number; MAG: number; MagDef: number; HIT: number; DOD: number; CRIT: number; MagCrit: number; MoveSpeed: number; AtkSpeed: number; statusAddMaxHP: number; extendAttributes: number[] };
    function getActorAttributes(actor: Module_Actor, attributeIndex: number, actorCustomAttrName: string, trend: boolean, extendAttribute: number): number {
        switch (attributeIndex) {
            case 0:
                return GameBattleHelper.getLevelByActor(actor);
            case 1:
                return actor.growUpEnabled ? actor.currentEXP : 0;
            case 2:
                var lv = GameBattleHelper.getLevelByActor(actor);
                return Game.getLevelUpNeedExp(actor, lv);
            case 3:
                return trend && attributeRes ? attributeRes.MaxHP : actor.MaxHP;
            case 4:
                return trend && attributeRes ? attributeRes.MaxSP : actor.MaxSP;
            case 5:
                return actor.hp;
            case 6:
                return actor.sp;
            case 7:
                return trend && attributeRes ? attributeRes.ATK : actor.ATK;
            case 8:
                return trend && attributeRes ? attributeRes.DEF : actor.DEF;
            case 9:
                return trend && attributeRes ? attributeRes.MAG : actor.MAG;
            case 10:
                return trend && attributeRes ? attributeRes.MagDef : actor.MagDef;
            case 11:
                return trend && attributeRes ? attributeRes.HIT : actor.HIT;
            case 12:
                return trend && attributeRes ? attributeRes.CRIT : actor.CRIT;
            case 13:
                return trend && attributeRes ? attributeRes.MagCrit : actor.MagCrit;
            case 14:
                return trend && attributeRes ? attributeRes.DOD : actor.DOD;
            case 15:
                return trend && attributeRes ? attributeRes.MoveSpeed : actor.MoveSpeed;
            case 16:
                return actor.MoveSpeed2;
            case 17:
                return MathUtils.float(trend && attributeRes ? attributeRes.extendAttributes[extendAttribute] : actor.extendAttributes[extendAttribute]);
            case 18:
                let attrValue = actor[actorCustomAttrName];
                return MathUtils.float(attrValue);
            case 19:
                let battler = GameBattleHelper.getBattlerByActor(actor);
                return battler ? battler.index : -1;
            case 20:
                return actor.id;
            case 21:
                return actor.class;
            case 22:
                let battler2 = GameBattleHelper.getBattlerByActor(actor);
                if (battler2) {
                    let battler2Module = battler2.getModule(6) as SoModule_Battler;
                    return battler2Module.inPartyIndex;
                }
                return -1;
            case 23:
                let battler3 = GameBattleHelper.getBattlerByActor(actor);
                if (battler3) {
                    let battler3Module = battler3.getModule(6) as SoModule_Battler;
                    return MathUtils.int(battler3Module.comboTimes);
                }
                return -1;
            case 24:
                return trend && attributeRes ? attributeRes.AtkSpeed * 0.01 + 1 : actor.AtkSpeed;
        }
    }
}