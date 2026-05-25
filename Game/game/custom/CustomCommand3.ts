/**
 * 自定义事件命令-战斗相关指令
 * Created by 黑暗之神KDS on 2023-08-16 23:14:37.
 */
module CommandExecute {
    //------------------------------------------------------------------------------------------------------
    //  战斗
    //------------------------------------------------------------------------------------------------------
    /**
     * 战斗参数设定
     */
    export function customCommand_9001(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_9001): void {
        let bool = cp.value == 0 ? true : false;
        switch (cp.paramType) {
            case 0:
                WorldData.deadPlayerActorLeaveParty = bool;
                return;
            case 1:
                Game.player.data.aiMode = bool ? 1 : 0;
                return;
            case 2:
                WorldData.displayBattlerPointBar = bool;
                EventUtils.happen(Game, Game.EVENT_DISPLAY_BATTLER_POINT_BAR_CHANGE);
                return;
            case 3:
                WorldData.displayBattlerPointValue = bool;
                EventUtils.happen(Game, Game.EVENT_DISPLAY_BATTLER_POINT_BAR_CHANGE);
                return;
            case 4:
                WorldData.whenDeadContinue = bool;
                return;
            case 5:
                WorldData.showVigilanceRange = bool;
                EventUtils.happen(Game, Game.EVENT_DISPLAY_VIGILANCE_RANGE_CHANGE);
                return;
        }
    }
    /**
     * 增减战斗者的生命
     */
    export function customCommand_9002(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_9002): void {
        let soc = ProjectClientScene.getSceneObjectBySetting(cp.soType + 1, cp.no, cp.soUseVar, cp.noVarID, trigger);
        if (!soc || !GameBattleHelper.isBattler(soc)) return;
        let battleModule = soc.getModule(6) as SoModule_Battler;
        if (battleModule.isDead) return;
        let value = MathUtils.int(cp.valueUseVar ? Game.player.variable.getVariable(cp.valueVarID) : cp.value);
        let actor = battleModule.actor;
        actor.hp += cp.symbol == 0 ? value : -value;
        actor.hp = Math.max(Math.min(actor.hp, actor.MaxHP), 0);
        if (actor.hp == 0) {
            GameBattle.checkBattlerIsDead(soc, soc);
            GameBattleData.dead(soc, soc);
        }
    }
    /**
     * 增减战斗者的魔法
     */
    export function customCommand_9003(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_9003): void {
        let soc = ProjectClientScene.getSceneObjectBySetting(cp.soType + 1, cp.no, cp.soUseVar, cp.noVarID, trigger);
        if (!soc || !GameBattleHelper.isBattler(soc)) return;
        let battleModule = soc.getModule(6) as SoModule_Battler;
        if (battleModule.isDead) return;
        let value = MathUtils.int(cp.valueUseVar ? Game.player.variable.getVariable(cp.valueVarID) : cp.value);
        let actor = battleModule.actor;
        actor.sp += cp.symbol == 0 ? value : -value;
        actor.sp = Math.max(Math.min(actor.sp, actor.MaxSP), 0);
    }
    
    /**
     * 增减战斗者的状态
     */
    export function customCommand_9004(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_9004): void {
        let soc = ProjectClientScene.getSceneObjectBySetting(cp.soType + 1, cp.no, cp.soUseVar, cp.noVarID, trigger);
        if (!soc || !GameBattleHelper.isBattler(soc)) return;
        let battleModule = soc.getModule(6) as SoModule_Battler;
        if (battleModule.isDead) return;
        let statusID = MathUtils.int(cp.statusUseVar ? Game.player.variable.getVariable(cp.statusIDVarID) : cp.statusID);
        let actor = battleModule.actor;
        if (cp.symbol == 0) {
            GameBattleData.addStatus(soc, statusID, soc, cp.force);
        }
        else if (cp.symbol == 1) {
            GameBattleData.removeStatus(soc, statusID);
        }
        else if (cp.symbol == 2) {
            GameBattleData.removeAllStatus(soc);
        }
        let level = GameBattleHelper.getLevelByActor(actor);
        Game.refreshActorAttribute(actor, level, soc);
        GameBattleData.refreshBattlerActionByStatus(soc);
    }
    /**
     * 显示伤害
     */
    export function customCommand_9005(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_9005): void {
        let soc = ProjectClientScene.getSceneObjectBySetting(cp.soType + 1, cp.no, cp.soUseVar, cp.noVarID, trigger);
        if (!soc) return;
        let battleModule = soc.getModule(6) as SoModule_Battler;
        if (battleModule.isDead) return;
        let value = MathUtils.int(cp.valueUseVar ? Game.player.variable.getVariable(cp.valueVarID) : cp.value);
        if (cp.type <= 2) value = -value;
        GameBattleAction.showDamage(soc, cp.type, value, cp.isCrit, null, true);
    }
    /**
     * 使用技能
     */
    export function customCommand_9006(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_9006): void {
        let soc = ProjectClientScene.getSceneObjectBySetting(cp.soType + 1, cp.no, cp.soUseVar, cp.noVarID, trigger);
        if (!soc || !GameBattleHelper.isBattler(soc)) return;
        let battleModule = soc.getModule(6) as SoModule_Battler;
        if (battleModule.isDead) return;
        let skillID = MathUtils.int(cp.skillUseVar ? CustomCompData.getSuperNumber(cp.skillIDVarID) : cp.skillID);
        let actor = battleModule.actor;
        if (!actor) return;
        let sysSkill = GameData.getModuleData(8, skillID);
        if (!sysSkill) return;
        let useSkill: Module_Skill;
        if (cp.needOwn) {
            useSkill = ArrayUtils.matchAttributes(actor.skills, { id: skillID }, true)[0];
        }
        else {
            useSkill = GameData.newModuleData(8, skillID);
        }
        GameBattleAction.useSkill(soc, useSkill);
    }
    /**
     * 显示模式
     */
    export function customCommand_9007(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_9007): void {
        WorldData.battleMode = cp.mode;
        WorldData.battleAutoHideParty = cp.autoHideParty;
        if (cp.mode == 0) {
            if (cp.autoHideParty) {
                for (var i = 1; i < Game.player.data.party.length; i++) {
                    let battler = ProjectPlayer.getPlayerPartyBattler(i);
                    battler.root.visible = true;
                    battler.through = false;
                }
            }
        }
        else {
            if (cp.autoHideParty) {
                for (var i = 1; i < Game.player.data.party.length; i++) {
                    let battler = ProjectPlayer.getPlayerPartyBattler(i);
                    battler.root.visible = false;
                    battler.through = true;
                }
                ProjectPlayer.changeToNextCtrlActor();
            }
        }
        if (cp.autoUI) {
            if (cp.mode == 0) {
                GameUI.show(18);
            }
            else {
                GameUI.hide(18);
            }
        }
    }
    export function customCommand_9008(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_9008): void {
        // 1. 获取场景对象
        let soc = ProjectClientScene.getSceneObjectBySetting(cp.soType + 1, cp.no, cp.soUseVar, cp.noVarID, trigger);
        
        // 2. 校验
        if (!soc || !GameBattleHelper.isBattler(soc)) return;
        let battleModule = soc.getModule(6) as SoModule_Battler;
        if (battleModule.isDead) return;

        let actor = battleModule.actor;
        
        // 3. 计算要改变的数值
        let value = MathUtils.int(cp.valueUseVar ? Game.player.variable.getVariable(cp.valueVarID) : cp.value);
        let changeValue = cp.symbol == 0 ? value : -value;

        // 4. 确定对应的属性 ID (根据你提供的 ID 表)
        let targetAttrID = 0;
        switch (cp.attrType) {
            case 0: targetAttrID = 2; break;  // 基础攻击
            case 1: targetAttrID = 16; break; // 基础防御
            case 2: targetAttrID = 11; break; // 基础闪避
            case 3: targetAttrID = 15; break; // 基础攻速
            default: return;
        }

        // 5. 安全检查：确保数组存在
        if (!actor.increaseExtendAttributes) {
            actor.increaseExtendAttributes = [];
        }

        // 6. 修改 increaseExtendAttributes
        // 这一步对应你代码里的：if (val) extendAttributesFixed[i] += val;
        let currentVal = actor.increaseExtendAttributes[targetAttrID] || 0;
        actor.increaseExtendAttributes[targetAttrID] = currentVal + changeValue;

        // 7. 【关键】强制刷新战斗者属性
        // 修改数组后，必须调用刷新方法，让你发的那段属性计算代码重新运行一遍
    }





    //------------------------------------------------------------------------------------------------------
    //  角色
    //------------------------------------------------------------------------------------------------------
    /**
     * 增减装备
     */
    export function customCommand_10001(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_10001): void {
        let equipID = p.useVar1 ? Game.player.variable.getVariable(p.equipIDVarID) : p.equipID;
        let num = p.useVar2 ? Game.player.variable.getVariable(p.numVarID) : p.num;
        // 找不到预设装备的话则忽略
        if (!GameData.getModuleData(9, equipID)) return;
        // 浮动装备设定
        if (p.attributeRand && p.equipRandSetting.length > 0 && p.symbol == 0) {
            let equipAttributeNames = ["maxHP", "maxSP", "atk", "def", "mag", "magDef", "dod", "moveSpeed", "hit", "crit", "magCrit", "atkSpeed"];
            // 生成装备
            for (let n = 0; n < num; n++) {
                let newEquip: Module_Equip = GameData.newModuleData(9, equipID, true);
                for (let i = 0; i < p.equipRandSetting.length; i++) {
                    let thisSetting = p.equipRandSetting[i];
                    let thisPer = thisSetting.probability;
                    if (MathUtils.rand(100) < thisPer) {
                        // 全属性变化（已有属性）
                        if (thisSetting.type == 13) {
                            // -- 固定属性
                            for (let s = 0; s < equipAttributeNames.length; s++) {
                                if (thisSetting.usePer) {
                                    let per = (MathUtils.rand(thisSetting.maxValue - thisSetting.minValue) + thisSetting.minValue) / 100;
                                    let newValue = newEquip[equipAttributeNames[s]] * per;
                                    newEquip[equipAttributeNames[s]] = Math.ceil(newValue);
                                }
                                else {
                                    if (newEquip[equipAttributeNames[s]]) {
                                        let newValue = MathUtils.rand(thisSetting.maxFixValue - thisSetting.minFixValue) + thisSetting.minFixValue;
                                        newEquip[equipAttributeNames[s]] += Math.ceil(newValue);
                                    }
                                }
                            }
                            // -- 扩展属性
                            for (let s = 0; s < newEquip.customAttributes.length; s++) {
                                let equipCustomAttribute: DataStructure_customAttribute = newEquip.customAttributes[s];
                                if (thisSetting.usePer) {
                                    let per = (MathUtils.rand(thisSetting.maxValue - thisSetting.minValue) + thisSetting.minValue) / 100;
                                    if (equipCustomAttribute) {
                                        let newValue = equipCustomAttribute.value * per;
                                        equipCustomAttribute.value = Math.ceil(newValue);
                                    }
                                }
                                else {
                                    if (equipCustomAttribute) {
                                        let newValue = MathUtils.rand(thisSetting.maxFixValue - thisSetting.minFixValue) + thisSetting.minFixValue;
                                        equipCustomAttribute.value += Math.ceil(newValue);
                                    }
                                }
                            }
                        }
                        // 单属性变化
                        else {
                            // -- 扩展属性
                            if (thisSetting.type == 12) {
                                let equipCustomAttribute: DataStructure_customAttribute = ArrayUtils.matchAttributes(newEquip.customAttributes, { attribute: thisSetting.extAttribute }, true)[0];
                                if (!equipCustomAttribute) {
                                    equipCustomAttribute = new DataStructure_customAttribute;
                                    equipCustomAttribute.attribute = thisSetting.extAttribute;
                                    equipCustomAttribute.type = 0;
                                    equipCustomAttribute.value = 0;
                                    newEquip.customAttributes.push(equipCustomAttribute);
                                }
                                if (thisSetting.usePer) {
                                    let per = (MathUtils.rand(thisSetting.maxValue - thisSetting.minValue) + thisSetting.minValue) / 100;
                                    let newValue = equipCustomAttribute.value * per;
                                    equipCustomAttribute.value = Math.ceil(newValue);
                                }
                                else {
                                    let newValue = MathUtils.rand(thisSetting.maxFixValue - thisSetting.minFixValue) + thisSetting.minFixValue;
                                    equipCustomAttribute.value += Math.ceil(newValue);
                                }
                            }
                            // -- 固定属性
                            else {
                                if (thisSetting.usePer) {
                                    let per = (MathUtils.rand(thisSetting.maxValue - thisSetting.minValue) + thisSetting.minValue) / 100;
                                    let newValue = newEquip[equipAttributeNames[thisSetting.type]] * per;
                                    newEquip[equipAttributeNames[thisSetting.type]] = Math.ceil(newValue);
                                }
                                else {
                                    let newValue = MathUtils.rand(thisSetting.maxFixValue - thisSetting.minFixValue) + thisSetting.minFixValue;
                                    newEquip[equipAttributeNames[thisSetting.type]] += Math.ceil(newValue);
                                }
                            }
                        }
                    }
                }
                if (p.isSceneItem) {
                    ProjectPlayer.dropMapItemByInstance(newEquip, ProjectPlayer.ctrlActorSceneObject.x, ProjectPlayer.ctrlActorSceneObject.y, true);
                }
                else {
                    ProjectPlayer.addEquipByInstance(newEquip);
                }
            }
        }
        else {
            if (p.symbol == 0 && p.isSceneItem) {
                let newEquip = GameData.newModuleData(9, equipID);
                ProjectPlayer.dropMapItemByInstance(newEquip, ProjectPlayer.ctrlActorSceneObject.x, ProjectPlayer.ctrlActorSceneObject.y, true);
            }
            else {
                ProjectPlayer.changeItemNumber(equipID, p.symbol == 0 ? num : -num, true, true);
            }

        }
    }
    /**
     * 替换队伍角色
     */
    export function customCommand_10002(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_10002): void {
        let actorID: number;
        if (!(cp.type == 0 && cp.isRestoreActor) && (cp.awayType != 1 || cp.type != 1)) {
            actorID = MathUtils.int(cp.useVar ? Game.player.variable.getVariable(cp.actorIDVarID) : cp.actorID);
            if (!GameData.getModuleData(6, actorID)) return;
        }
        let awayActor: DataStructure_inPartyActor;
        if (cp.type == 0) {
            if (cp.isRestoreActor) {
                let restoreActor: DataStructure_inPartyActor = Game.player.data.actorRecords[CustomCompData.getSuperNumber(cp.actorStoreIndex)];
                if (restoreActor) {
                    ProjectPlayer.addPlayerActorByDS(restoreActor, true, false);
                }
            }
            else {
                let lv = MathUtils.int(cp.lvUseVar ? Game.player.variable.getVariable(cp.lvVarID) : cp.lv);
                ProjectPlayer.addPlayerActorByActorID(actorID, lv);
            }
        }
        else if (cp.type == 1) {
            if (Game.player.data.party.length <= 1) return;
            let inPartyIndex: number;
            if (cp.awayType == 0) {
                inPartyIndex = ProjectPlayer.getPlayerActorFirstPositionByActorID(actorID);
            }
            else {
                inPartyIndex = CustomCompData.getSuperNumber(cp.inPartyIndex);
            }
            if (inPartyIndex <= 0 || inPartyIndex >= Game.player.data.party.length) return;
            awayActor = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
            if (!awayActor) return;
            let needchangeToNextCtrlActor = false;
            if (inPartyIndex == Game.player.data.ctrlActorIndex) {
                needchangeToNextCtrlActor = true;
            }
            ProjectPlayer.removePlayerActorByInPartyIndex(inPartyIndex);
            if (needchangeToNextCtrlActor) ProjectPlayer.changeToNextCtrlActor();
        }
        else {
            let playerBattlerModule = Game.player.sceneObject.getModule(6) as SoModule_Battler;
            let newActorDS: DataStructure_inPartyActor;
            if (cp.isRestoreActor) {
                newActorDS = Game.player.data.actorRecords[CustomCompData.getSuperNumber(cp.actorStoreIndex)];
                if (!newActorDS) return;
            }
            else {
                // 获取等级
                let lv = MathUtils.int(cp.lvUseVar ? Game.player.variable.getVariable(cp.lvVarID) : cp.lv);
                // 替换主角的数据
                let newActor: Module_Actor = GameData.newModuleData(6, actorID, true);
                newActorDS = new DataStructure_inPartyActor();
                newActorDS.actor = newActor;
                newActorDS.lv = Math.min(lv, newActor.MaxLv);
            }
            // 替换成新的该队伍数据
            awayActor = ProjectPlayer.getPlayerActorDSByInPartyIndex(0);
            Game.player.data.party[0] = newActorDS;
            playerBattlerModule.actor = newActorDS.actor;
            newActorDS.sceneObjectIndex = Game.player.sceneObject.index;
            GameData.changeModuleDataToCopyMode(newActorDS.actor, 1);
            // 刷新学习的技能
            ProjectPlayer.initPlayerActor(playerBattlerModule.inPartyIndex);
            // 更换行走图
            Game.player.sceneObject.avatarID = newActorDS.actor.avatar;
            Game.player.sceneObject.avatarFrame = 1;
            // 战斗者初始化
            playerBattlerModule.battlerInit(true, !cp.isRestoreActor);
            // 刷新主界面
            let guiMain = GameUI.get(18) as GUI_Main;
            if (guiMain) guiMain.refreshAll();
        }
        // 记录离开的角色
        if (awayActor && cp.isSaveActor) {
            Game.player.data.actorRecords[CustomCompData.getSuperNumber(cp.saveTo)] = awayActor;
        }
    }
    /**
     * 替换角色的技能
     */
    export function customCommand_10003(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_10003): void {
        // 获取角色
        let actor: Module_Actor;
        if (cp.actorCheckType <= 1) {
            let actorDS = ProjectGame.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID,
                cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID,
                cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
            if (!actorDS) return;
            actor = actorDS.actor;
        }
        else {
            actor = ProjectGame.getActorBySceneObjectIndex(cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
        }
        if (!actor) return;
        // 获取对应的场景对象
        let battler = GameBattleHelper.getBattlerByActor(actor);
        if (!battler) return;
        let battlerModule = battler.getModule(6) as SoModule_Battler;
        if (!battlerModule) return;
        let inPartyIndex = battlerModule.inPartyIndex;
        // 获取技能编号
        let skillID = MathUtils.int(cp.skillUseVar ? Game.player.variable.getVariable(cp.skillIDVarID) : cp.skillID);
        // 学习技能
        if (cp.symbol == 0) {
            if (battlerModule.inPartyIndex >= 0) {
                ProjectPlayer.learnSkillBySkillID(battlerModule.inPartyIndex, skillID);
            }
            else {
                Game.actorLearnSkill(actor, skillID);
            }
        }
        // 忘记技能
        else if (cp.symbol == 1) {
            ProjectPlayer.forgetSkillBySkillID(inPartyIndex, skillID);
        }
        // 忘记全部技能
        else if (cp.symbol == 2) {
            ProjectPlayer.forgetAllSkills(inPartyIndex);
        }
        // 随机忘记一个技能
        else if (cp.symbol == 3) {
            let skills = actor.skills.concat();
            for (let i = 0; i < actor.skills.length; i++) {
                let skill = actor.skills[i];
                if (skill) {
                    skills.push(skill);
                }
            }
            let skill = skills[MathUtils.rand(skills.length)];
            if (skill) {
                let skillID = skill.id;
                ProjectPlayer.forgetSkillBySkillID(inPartyIndex, skillID);
            }
        }
        // 替换普通技能
        else if (cp.symbol == 4) {
            Game.actorReplaceAttackSkill(actor, skillID);
        }
    }
    /**
     * 替换角色的装备
     */
    export function customCommand_10004(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_10004): void {
        // 获取角色
        let actor: Module_Actor;
        let actorDS = ProjectGame.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID,
            cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID,
            cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
        if (!actorDS) return;
        actor = actorDS.actor;
        // 获取装备编号
        let equipID = MathUtils.int(cp.equipUseVar ? Game.player.variable.getVariable(cp.equipIDVarID) : cp.equipID);
        // 判断是否是玩家的角色
        let inPartyActorDS: DataStructure_inPartyActor = ProjectPlayer.getPlayerActorDSByActor(actor);
        let inPartyActorIndex = ProjectPlayer.getPlayerActorIndexByActor(actor);
        // 记录卸下的装备
        let takeOffEquip: Module_Equip;
        // 穿戴
        if (cp.symbol == 0) {
            if (inPartyActorDS && cp.fromPlayerPackage) {
                // -- 如果该装备存在于玩家的背包的话则穿戴
                let fromPackageEquip = ProjectPlayer.getItemDS(equipID, true, true);
                if (fromPackageEquip) ProjectPlayer.wearPlayerActorEquip(inPartyActorIndex, fromPackageEquip.equip);
            }
            else {
                // 新建一件装备进行穿戴
                if (GameData.getModuleData(9, equipID)) {
                    let newEquip = GameData.newModuleData(9, equipID);
                    // -- 卸载该部位上的装备（若未卸载成功，则无法穿戴）
                    if (inPartyActorDS) {
                        let takeOffEquip = ProjectPlayer.takeOffPlayerActorEquipByPartID(inPartyActorIndex, newEquip.partID, true);
                        if (!takeOffEquip) return;
                    }
                    let res = Game.wearActorEquip(actor, newEquip);
                    if (res.success) EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_WEAR_PLAYER_ACTOR_EQUIP, [inPartyActorIndex, actorDS, res.takeOffEquip, newEquip]);
                }
            }
        }
        // 卸下/移除
        else if (cp.symbol == 1 || cp.symbol == 3) {
            // 使用部件卸下
            if (cp.usePartID) {
                if (inPartyActorDS && inPartyActorIndex >= 0) takeOffEquip = ProjectPlayer.takeOffPlayerActorEquipByPartID(inPartyActorIndex, cp.partID, true, cp.symbol == 1);
                else takeOffEquip = Game.takeOffActorEquipByPartID(actor, cp.partID);
            }
            // 否则查找该件装备是否已经穿戴上了
            else {
                let thisEquip = Game.getActorEquipByEquipID(actor, equipID);
                if (thisEquip) {
                    let thisEquipPartID = thisEquip.partID;
                    if (inPartyActorDS && inPartyActorIndex >= 0) takeOffEquip = ProjectPlayer.takeOffPlayerActorEquipByPartID(inPartyActorIndex, thisEquipPartID, true, cp.symbol == 1);
                    else takeOffEquip = Game.takeOffActorEquipByPartID(actor, thisEquipPartID);
                }
            }
        }
        // 卸下/移除全部装备
        else if (cp.symbol == 2 || cp.symbol == 4) {
            if (inPartyActorDS && inPartyActorIndex >= 0) ProjectPlayer.takeOffPlayerActorAllEquips(inPartyActorIndex, true, cp.symbol == 2);
            else Game.takeOffActorAllEquips(actor);
        }
        // 刷新属性
        let battler = GameBattleHelper.getBattlerByActor(actor);
        Game.refreshActorAttribute(actor, GameBattleHelper.getLevelByActor(actor), battler);
        // 记录卸下的装备编号
        if (cp.isTakeOffEquipSaveToVar) {
            let takeOffEquipID = takeOffEquip ? takeOffEquip.id : -1;
            Game.player.variable.setVariable(cp.takeOffEquipSaveToVar, takeOffEquipID);
        }
    }
    /**
     * 增减角色属性
     */
    export function customCommand_10005(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_10005): void {
        // 获取角色
        let actor: Module_Actor;
        if (cp.actorCheckType <= 1) {
            let actorDS = ProjectGame.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID,
                cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID,
                cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
            if (!actorDS) return;
            actor = actorDS.actor;
        }
        else {
            actor = ProjectGame.getActorBySceneObjectIndex(cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
        }
        if (!actor) return;
        let value = MathUtils.int(cp.valueUseVar ? Game.player.variable.getVariable(cp.valueVarID) : cp.value);
        // 判断是否是玩家的角色
        let inPartyActorDS: DataStructure_inPartyActor = ProjectPlayer.getPlayerActorDSByActor(actor);
        let inPartyActorIndex = ProjectPlayer.getPlayerActorIndexByActor(actor);
        switch (cp.attributeType) {
            case 0:
                actor.hp += value;
                if (actor.hp <= 0) {
                    if (cp.allowDead) {
                        actor.hp = 0;
                        let battler = GameBattleHelper.getBattlerByActor(actor);
                        GameBattle.checkBattlerIsDead(battler, battler);
                    }
                    else {
                        actor.hp = 1;
                    }
                }
                break;
            case 1:
                actor.sp += value;
                break;
            case 2:
                actor.increaseMaxHP += value;
                break;
            case 3:
                actor.increaseMaxSP += value;
                break;
            case 4:
                actor.increaseSpeed += value;
                break;
            case 5:
                actor.MoveSpeed2 += value;
                break;
            case 6:
                actor.increaseATK += value;
                break;
            case 7:
                actor.increaseDEF += value;
                break;
            case 8:
                actor.increaseMag += value;
                break;
            case 9:
                actor.increaseMagDef += value;
                break;
            case 10:
                actor.increaseDod += value;
                break;
            case 11:
                actor.increaseCRIT += value;
                break;
            case 12:
                actor.increaseMagCrit += value;
                break;
            case 13:
                if (inPartyActorIndex != -1) {
                    ProjectPlayer.increaseExpByIndex(inPartyActorIndex, value);
                }
                break;
            case 14:
                if (inPartyActorIndex != -1) {
                    inPartyActorDS.lv += value;
                    ProjectPlayer.initPlayerActor(inPartyActorIndex);
                    EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_PLAYER_ACTOR_CHANGE_LEVEL, [inPartyActorIndex, inPartyActorDS.lv]);
                    if (value > 0) {
                        let battler = ProjectPlayer.getPlayerPartyBattler(inPartyActorIndex);
                        if (actor.levelUpEvent) CommandPage.startTriggerFragmentEvent(actor.levelUpEvent, battler, battler);
                        let actorClass: Module_Class = GameData.getModuleData(7, actor.class);
                        if (actorClass && actorClass.levelUpEvent) CommandPage.startTriggerFragmentEvent(actorClass.levelUpEvent, battler, battler);
                    }
                }
                break;
            case 15:
                if (inPartyActorIndex != -1) {
                    inPartyActorDS.lv -= value;
                    ProjectPlayer.initPlayerActor(inPartyActorIndex);
                    EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_PLAYER_ACTOR_CHANGE_LEVEL, [inPartyActorIndex, inPartyActorDS.lv]);
                }
                break;
            case 16:
                if (!actor.increaseExtendAttributes[cp.extAttribute]) actor.increaseExtendAttributes[cp.extAttribute] = 0;
                actor.increaseExtendAttributes[cp.extAttribute] += value;
                break;
        }
        // 刷新属性
        let battler = GameBattleHelper.getBattlerByActor(actor);
        Game.refreshActorAttribute(actor, GameBattleHelper.getLevelByActor(actor), battler);
    }
    /**
     * 更改角色的名称
     */
    let changeActorNameInfo: { [actorID: number]: string } = {};
    export function customCommand_10006(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_10006): void {
        // 获取角色
        let actor: Module_Actor;
        let actorDS = ProjectGame.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID,
            cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID,
            null, null, null, null, trigger);
        if (!actorDS) return;
        actor = actorDS.actor;
        if (!actor) return;
        // 更改该角色的名称
        let newName = cp.valueUseVar ? Game.player.variable.getString(cp.valueVarID) : cp.value;
        for (let i = 0; i < Game.player.data.party.length; i++) {
            let inPartyActor = Game.player.data.party[i];
            let actorID = inPartyActor.actor.id;
            if (actorID == actor.id) {
                inPartyActor.actor.name = newName;
            }
        }
        // 记录更改项以便恢复存档时重新需要设置该值
        changeActorNameInfo[actor.id] = newName;
    }
    /**
     * 更改角色的职业
     */
    export function customCommand_10007(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_10007): void {
        // 获取角色
        let actor: Module_Actor;
        let actorDS = ProjectGame.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID,
            cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID,
            null, null, null, null, trigger);
        if (!actorDS) return;
        actor = actorDS.actor;
        if (!actor) return;
        // 更改职业
        let classID = cp.valueUseVar ? Game.player.variable.getVariable(cp.valueVarID) : cp.value;
        actor.class = classID;
        // 清理缓存
        for (let i in actor) {
            if (i.indexOf("_cache") != -1) {
                delete actor[i];
            }
        }
        // 刷新属性
        let battler = GameBattleHelper.getBattlerByActor(actor);
        Game.refreshActorAttribute(actor, actorDS.lv, battler);
    }
    /**
     * 完全恢复
     */
    export function customCommand_10008(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_10008): void {
        let actors: Module_Actor[];
        // 玩家的全体角色
        if (cp.actorCheckType == 2) {
            actors = ProjectPlayer.getPlayerActors();
        }
        // 单个角色
        else {
            let actor: Module_Actor;
            let actorDS = ProjectGame.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID,
                cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID,
                null, null, null, null, trigger);
            if (!actorDS) return;
            actor = actorDS.actor;
            if (!actor) return;
            actors = [actor];
        }
        for (let i = 0; i < actors.length; i++) {
            let actor = actors[i];
            let battler = GameBattleHelper.getBattlerByActor(actor);
            if (!battler) continue;
            let battlerModule = battler.getModule(6) as SoModule_Battler;
            if (battlerModule.isDead) {
                GameBattleData.resuscitate(battler);
            }
            actor.hp = actor.MaxHP;
            actor.sp = actor.MaxSP;
        }
    }
    /**
     * 复活我方角色
     */
    export function customCommand_10009(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_10009): void {
        // 复活指定的我方角色
        if (cp.actorCheckType < 3) {
            let actor: Module_Actor;
            if (cp.actorCheckType <= 1) {
                let actorDS = ProjectGame.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID,
                    cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID,
                    cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
                if (!actorDS) return;
                actor = actorDS.actor;
            }
            else {
                actor = ProjectGame.getActorBySceneObjectIndex(cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
            }
            if (!actor) return;
            let battler = GameBattleHelper.getBattlerByActor(actor);
            if (battler) {
                let battlerModule = battler.getModule(6) as SoModule_Battler;
                if (battlerModule && battlerModule.inPartyIndex >= 0) {
                    GameBattleData.resuscitate(battler);
                }
            }
        }
        // 复活我方全体角色
        else if (cp.actorCheckType == 3) {
            for (let i = 0; i < Game.player.data.party.length; i++) {
                let actorDS = Game.player.data.party[i];
                if (!actorDS) continue;
                let sceneObjectIndex = actorDS.sceneObjectIndex;
                let battler = Game.currentScene.sceneObjects[sceneObjectIndex];
                if (battler) {
                    let battlerModule = battler.getModule(6) as SoModule_Battler;
                    if (battlerModule && battlerModule.inPartyIndex >= 0) {
                        GameBattleData.resuscitate(battler);
                    }
                }
            }
        }
    }
    /**
    * 修改角色的技能
    */
    export function customCommand_10010(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_10010): void {
        // 获取角色
        let actor: Module_Actor;
        if (cp.actorCheckType <= 1) {
            let actorDS = ProjectGame.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID,
                cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID,
                cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
            if (!actorDS) return;
            actor = actorDS.actor;
        }
        else {
            actor = ProjectGame.getActorBySceneObjectIndex(cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
        }
        if (!actor) return;
        // 获取技能编号
        let skillID = MathUtils.int(cp.skillUseVar ? Game.player.variable.getVariable(cp.skillIDVarID) : cp.skillID);
        // 获取角色的技能
        let skills = actor.skills.concat(actor.atkSkill);
        let skill: Module_Skill = ArrayUtils.matchAttributes(skills, { id: skillID }, true)[0];
        // 升级技能
        if (skill) {
            CustomCompData.setData(skill, cp.attributes);
        }
    }
    /**
    * 修改角色的属性
    */
    export function customCommand_10011(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_10011): void {
        // 获取角色
        let actor: Module_Actor;
        if (cp.actorCheckType <= 1) {
            let actorDS = ProjectGame.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID,
                cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID,
                cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
            if (!actorDS) return;
            actor = actorDS.actor;
        }
        else {
            actor = ProjectGame.getActorBySceneObjectIndex(cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
        }
        if (!actor) return;
        //
        let varName: string;
        if (cp.attrInfo.selectMode == 1) {
            let mode = cp.attrInfo.inputModeInfo.mode;
            let constName = cp.attrInfo.inputModeInfo.constName;
            let varNameIndex = cp.attrInfo.inputModeInfo.varNameIndex;
            varName = mode == 0 ? constName : Game.player.variable.getString(varNameIndex);
        }
        else {
            varName = cp.attrInfo.varName;
        }
        if (actor[varName] == undefined) return;
        let count = (oldValue: number, value: number) => {
            if (typeof oldValue != "number" || typeof value != "number") return value;
            let v: number;
            //@ts-ignore
            if (!cp.attrInfo.operationType) v = value;
            //@ts-ignore
            switch (cp.attrInfo.operationType) {
                case 1: v = oldValue + value; break;//加
                case 2: v = oldValue - value; break;//减
                case 3: v = oldValue * value; break;//乘
                case 4: v = oldValue / value; break;//除
                case 5: v = oldValue % value; break;//余
                case 6: v = Math.pow(oldValue, value); break;//幂
            }
            //@ts-ignore
            return cp.attrInfo.isRounded ? MathUtils.int(v) : v;
        }
        if (cp.attrInfo.valueType == 0) {
            let v = cp.attrInfo.value;
            if (v) {
                //object类型
                if (cp.attrInfo.selectMode == 1 && cp.attrInfo.inputModeInfo.typeIndex == 3) {
                    try {
                        v.value = JSON.parse(v.value as any);
                    } catch (e) {
                        (v.value as any) = {};
                    }
                }
                actor[varName] = count(actor[varName], v.value);
            }
        }
        else {
            let v = cp.attrInfo.value;
            if (v && v.value) {
                let varID: number = v.value;
                switch (v.varType) {
                    case 0:
                        actor[varName] = count(actor[varName], Game.player.variable.getVariable(varID));
                        break;
                    case 1:
                        actor[varName] = Game.player.variable.getString(varID);
                        break;
                    case 2:
                        actor[varName] = Game.player.variable.getSwitch(varID);
                        break;
                }
            }
        }
        // 刷新角色属性
        Game.refreshActorAttribute(actor, GameBattleHelper.getLevelByActor(actor), GameBattleHelper.getBattlerByActor(actor));
    }
    //------------------------------------------------------------------------------------------------------
    //  存档
    //------------------------------------------------------------------------------------------------------
    /**
     * 使用SinglePlayerGame需要在非行为编辑器模式下
     */
    if (!Config.BEHAVIOR_EDIT_MODE) {
        SinglePlayerGame.regSaveCustomData("___changeActorName", Callback.New(() => {
            return changeActorNameInfo;
        }, null));
        EventUtils.addEventListener(ClientWorld, ClientWorld.EVENT_INITED, Callback.New(() => {
            EventUtils.addEventListener(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, Callback.New(() => {
                if (GameGate.gateState == GameGate.STATE_3_IN_SCENE_COMPLETE) {
                    let restoryChangeActorNameInfo = SinglePlayerGame.getSaveCustomData("___changeActorName");
                    if (restoryChangeActorNameInfo) {
                        changeActorNameInfo = restoryChangeActorNameInfo;
                        for (let i = 0; i < Game.player.data.party.length; i++) {
                            let actorID = Game.player.data.party[i].actor.id;
                            if (changeActorNameInfo[actorID]) {
                                Game.player.data.party[i].actor.name = changeActorNameInfo[actorID];
                            }
                        }
                    }
                }
            }, null));
        }, null), true);
    }
}