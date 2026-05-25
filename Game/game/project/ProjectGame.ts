/**
 * 项目层游戏管理器实现类
 * Modified: 装备属性动态计算 (基础 + 基础*百分比)
 */
class ProjectGame extends GameBase {
    //------------------------------------------------------------------------------------------------------
    // 事件：角色
    //------------------------------------------------------------------------------------------------------
    EVENT_LEARN_SKILL: string = "GameEVENT_LEARN_SKILL";
    EVENT_FORGET_SKILL: string = "GameEVENT_FORGET_SKILL";
    EVENT_REPLACE_ATTACK_SKILL: string = "GameEVENT_REPLACE_ATTACK_SKILL";
    EVENT_WEAR_ACTOR_EQUIP: string = "GameEVENT_WEAR_ACTOR_EQUIP";
    EVENT_TAKE_OFF_ACTOR_EQUIP: string = "GameEVENT_TAKE_OFF_ACTOR_EQUIP";
    //------------------------------------------------------------------------------------------------------
    // 事件：其他
    //------------------------------------------------------------------------------------------------------
    EVENT_DISPLAY_BATTLER_POINT_BAR_CHANGE: string = "GameEVENT_DISPLAY_BATTLER_POINT_BAR_CHANGE";
    EVENT_DISPLAY_BATTLER_POINT_VALUE_CHANGE: string = "GameEVENT_DISPLAY_BATTLER_POINT_VALUE_CHANGE";
    EVENT_DISPLAY_VIGILANCE_RANGE_CHANGE: string = "GameEVENT_DISPLAY_VIGILANCE_RANGE_CHANGE";

    static gameStartTime: Date;
    private static gamePauseStartTime: Date;
    static inited: boolean;

    declare currentScene: ProjectClientScene;
    declare player: ProjectPlayer;
    private toNewSceneRecordPlayerBattles: ProjectClientSceneObject[];
    extendAttributeSettings: DataStructure_customAttributeSetting[] = [];

    constructor() {
        super();
        EventUtils.addEventListenerFunction(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, this.onInSceneStateChange, this);
    }

    init() {
        this.player = new ProjectPlayer();
        EventUtils.addEventListenerFunction(Game, Game.EVENT_PAUSE_CHANGE, this.onPauseChange, this);
        EventUtils.addEventListenerFunction(Game, Game.EVENT_WEAR_ACTOR_EQUIP, this.onWearActorEquip, this);
        EventUtils.addEventListenerFunction(Game, Game.EVENT_TAKE_OFF_ACTOR_EQUIP, this.onTakeOffActorEquip, this);

        // 初始化云存档系统：恢复登录状态
        GUI_SaveFileManager.init();
    }

    get gameTime(): number {
        let gameStartTime: Date;
        if (ProjectGame.gamePauseStartTime) {
            let dTime = Date.now() - ProjectGame.gamePauseStartTime.getTime();
            gameStartTime = new Date(ProjectGame.gameStartTime.getTime() + dTime);
        }
        else {
            gameStartTime = ProjectGame.gameStartTime;
        }
        return new Date().getTime() - gameStartTime.getTime();
    }

    // ... (保留 getPlayerActorByCheckType, getActorBySceneObjectIndex 等辅助方法) ...
    static getPlayerActorByCheckType(actorCheckType: number, actorIDUseVar: number, actorID: number, actorIDVarID: number,
        actorInPartyIndexVarIDUseVar: number, actorInPartyIndex: number, actorInPartyIndexVarID: number,
        soType: number, soIndexUseVar: number, soIndex: number, soIndexVarID: number, trigger: CommandTrigger): DataStructure_inPartyActor {
        if (actorCheckType == 0) {
            var pActorID = MathUtils.int(actorIDUseVar ? Game.player.variable.getVariable(actorIDVarID) : actorID);
            return ProjectPlayer.getPlayerActorDSByActorID(pActorID);
        }
        else if (actorCheckType == 1) {
            var pActorInPartyIndex = MathUtils.int(actorInPartyIndexVarIDUseVar ? Game.player.variable.getVariable(actorInPartyIndexVarID) : actorInPartyIndex);
            return ProjectPlayer.getPlayerActorDSByInPartyIndex(pActorInPartyIndex);
        }
        else if (actorCheckType == 2) {
            var soc = ProjectClientScene.getSceneObjectBySetting(soType + 1, soIndex, soIndexUseVar, soIndexVarID, trigger);
            if (GameBattleHelper.isBattler(soc)) {
                let battlerModule = soc.getModule(6) as SoModule_Battler;
                var inPlayerActorIndex = ProjectPlayer.getPlayerActorIndexByActor(battlerModule.actor);
                return ProjectPlayer.getPlayerActorDSByInPartyIndex(inPlayerActorIndex);
            }
        }
    }

    static getActorBySceneObjectIndex(soType: number, soIndexUseVar: number, soIndex: number, soIndexVarID: number, trigger: CommandTrigger): Module_Actor {
        var soc = ProjectClientScene.getSceneObjectBySetting(soType + 1, soIndex, soIndexUseVar, soIndexVarID, trigger);
        if (GameBattleHelper.isBattler(soc)) {
            let socBattleModule = soc.getModule(6) as SoModule_Battler;
            return socBattleModule.actor;
        }
        return null;
    }

    // ... (保留技能和装备的 Get/Wear/TakeOff 方法) ...
    getActorSkillBySkillID(actor: Module_Actor, skillID: number): Module_Skill {
        return ArrayUtils.matchAttributes(actor.skills, { id: skillID }, true)[0];
    }
    actorLearnSkill(actor: Module_Actor, skillID: number, happenEvent: boolean = true): Module_Skill {
        let skill = this.getActorSkillBySkillID(actor, skillID);
        if (skill || !GameData.getModuleData(8, skillID)) return;
        let newSkill = GameData.newModuleData(8, skillID);
        newSkill.level = 1;
        if (newSkill.skillType == 2) actor.skills.push(newSkill);
        else actor.skills[ArrayUtils.getNullPosition(actor.skills)] = newSkill;
        if (happenEvent) EventUtils.happen(Game, Game.EVENT_LEARN_SKILL, [actor, newSkill]);
        return newSkill;
    }
    actorForgetSkill(actor: Module_Actor, skillID: number, happenEvent: boolean = true): Module_Skill {
        let skill = this.getActorSkillBySkillID(actor, skillID);
        if (!skill || !GameData.getModuleData(8, skillID)) return;
        if (skill.skillType == 2) actor.skills.splice(actor.skills.indexOf(skill), 1);
        else actor.skills[actor.skills.indexOf(skill)] = null;
        if (happenEvent) EventUtils.happen(Game, Game.EVENT_FORGET_SKILL, [actor, skill]);
        return skill;
    }
    actorForgetAllSkills(actor: Module_Actor, happenEvent: boolean = true): Module_Skill[] {
        let forgetSkills = actor.skills.concat();
        actor.skills.length = 0;
        for (let i = 0; i < forgetSkills.length; i++) {
            if (happenEvent) EventUtils.happen(Game, Game.EVENT_FORGET_SKILL, [actor, forgetSkills[i]]);
        }
        return forgetSkills;
    }
    actorReplaceAttackSkill(actor: Module_Actor, skillID: number, happenEvent: boolean = true): Module_Skill[] {
        if (!GameData.getModuleData(8, skillID)) return;
        let newSkill = GameData.newModuleData(8, skillID);
        actor.atkSkill = newSkill;
        if (happenEvent) EventUtils.happen(Game, Game.EVENT_REPLACE_ATTACK_SKILL, [actor, newSkill]);
        return newSkill;
    }
    getActorEquipByPartID(actor: Module_Actor, partID: number): Module_Equip {
        return ArrayUtils.matchAttributes(actor.equips, { partID: partID }, true)[0];
    }
    getActorEquipByEquipID(actor: Module_Actor, equipID: number): Module_Equip {
        return ArrayUtils.matchAttributes(actor.equips, { id: equipID }, true)[0];
    }
    wearActorEquip(actor: Module_Actor, newEquip: Module_Equip, happenEvent: boolean = true): { success: boolean, takeOffEquip: Module_Equip } {
        if (newEquip) {
            let takeOffEquip = this.takeOffActorEquipByPartID(actor, newEquip.partID);
            actor.equips.push(newEquip);
            if (happenEvent) EventUtils.happen(Game, Game.EVENT_WEAR_ACTOR_EQUIP, [actor, newEquip.partID, takeOffEquip, newEquip]);
            return { success: true, takeOffEquip: takeOffEquip };
        }
    }
    takeOffActorEquipByPartID(actor: Module_Actor, partID: number, happenEvent: boolean = true): Module_Equip {
        let idx = ArrayUtils.matchAttributes(actor.equips, { partID: partID }, true, "==", true)[0];
        if (idx == null) return null;
        if (ArrayUtils.getNullPosition(Game.player.data.package) >= Game.player.data.packageCapacity) return null;
        let takeOffEquip = actor.equips.splice(idx, 1)[0];
        if (takeOffEquip && happenEvent) EventUtils.happen(Game, Game.EVENT_TAKE_OFF_ACTOR_EQUIP, [actor, partID, takeOffEquip]);
        return takeOffEquip;
    }
    takeOffActorAllEquips(actor: Module_Actor, happenEvent: boolean = true): Module_Equip[] {
        let takeOffEquipArr = actor.equips.concat();
        actor.equips.length = 0;
        for (let i = 0; i < takeOffEquipArr.length; i++) {
            let takeOffEquip = takeOffEquipArr[i];
            if (happenEvent) EventUtils.happen(Game, Game.EVENT_TAKE_OFF_ACTOR_EQUIP, [actor, takeOffEquip.partID, takeOffEquip]);
        }
        return takeOffEquipArr;
    }

    //------------------------------------------------------------------------------------------------------
    // 角色的属性 - 核心计算逻辑
    //------------------------------------------------------------------------------------------------------
    
    getLevelUpNeedExp(actor: Module_Actor, lv: number): number {
        return Math.floor(this.getGrowValueByLv(actor, "needEXPGrow", lv));
    }

    /**
     * 刷新角色属性
     */
    refreshActorAttribute(actor: Module_Actor, lv: number, battler: ProjectClientSceneObject): void {
        if (!actor?.atkSkill) return;

        // 计算属性 (包含装备的特殊计算)
        let res = this.clacActorAttribute(actor, lv, 0, 0, null, 0, null, battler);

        if (res) {
            actor.extendAttributes = res.extendAttributes;
            const getExt = (id: number) => { return Math.floor(res.extendAttributes[id] || 0); };

            // 基础属性映射
            actor.MaxHP = getExt(1);
            if (res.statusAddMaxHP > 0) actor.MaxHP += Math.floor(res.statusAddMaxHP);
            actor.MaxSP = getExt(24);
            actor.ATK = getExt(2);
            actor.DEF = getExt(16);
            actor.DOD = getExt(11);
            actor.MoveSpeed = getExt(12);
            actor.HIT = getExt(13);
            actor.CRIT = getExt(14);

            // 攻速
            let atkSpeedVal = getExt(15);
            actor.AtkSpeed = atkSpeedVal > 0 ? (atkSpeedVal * 0.01) : 1;

            // 兜底赋值
            actor.MAG = Math.floor(res.MAG);
            actor.MagDef = Math.floor(res.MagDef);
            actor.MagCrit = Math.floor(res.MagCrit);

            // 刷新动作帧 - 攻速越快，FPS越高，动作越快
            let sysAtkSkill: Module_Skill = GameData.getModuleData(8, actor.atkSkill.id);
            if (sysAtkSkill) {
                // 攻速 100 = 正常速度，攻速 150 = 1.5倍速度，攻速 80 = 0.8倍速度
                let atkSpeedRatio = (atkSpeedVal || 100) / 100;
                actor.atkSkill.actionFPS = Math.floor(sysAtkSkill.actionFPS * atkSpeedRatio);
                if (actor.atkSkill.useAction2) {
                    for (var i = 0; i < actor.atkSkill.multiActions.length; i++) {
                        let ma = actor.atkSkill.multiActions[i];
                        ma.fps = Math.floor(sysAtkSkill.multiActions[i].fps * atkSpeedRatio);
                    }
                }
            }
        }

        let battleModule = battler.getModule(6) as SoModule_Battler;
        if (!(battleModule.inBattle || battleModule.inPartyIndex >= 0 || (battleModule.battleAI && battleModule.battleAI.isInBackToInBattlePoint))) {
            actor.MoveSpeed = actor.MoveSpeed2;
        }
        battler.moveSpeed = actor.MoveSpeed;

        if (actor.hp > actor.MaxHP) actor.hp = actor.MaxHP;
        if (actor.sp > actor.MaxSP) actor.sp = actor.MaxSP;
    }

    /**
     * 计算角色属性
     * Modified: 装备属性特殊计算逻辑 (Base + Base * %)
     */
    clacActorAttribute(actor: Module_Actor, lv: number, previewChangeMode: number = 0,
        previewChangeEquipIndex: number = 0, previewChangeEquip: Module_Equip = null,
        previewChangeSkillIndex: number = 0, previewChangeSkill: Module_Skill = null, battler: ProjectClientSceneObject = null) {

        let systemActor = GameData.getModuleData(6, actor.id) as Module_Actor;
        if (!systemActor) return;
        let actorClass: Module_Class = GameData.getModuleData(7, actor.class);

        // 初始化拓展属性
        let extendAttributesFixed: number[] = [];
        let extendAttributesAdditionPercentage: number[] = [];
        let extendAttributesMultiplicationPercentage: number[] = [];
        let extendAttributeLen = GameData.getLength(14);

        for (let i = 1; i <= extendAttributeLen; i++) {
            extendAttributesFixed[i] = 0;
            extendAttributesAdditionPercentage[i] = 0;
            extendAttributesMultiplicationPercentage[i] = 1;
        }

        // 1. 角色自身/职业
        if (actorClass && actorClass.isCustomAttribute) {
            for (let i = 0; i < actorClass.customAttributes.length; i++) {
                let ca = actorClass.customAttributes[i];
                extendAttributesFixed[ca.attribute] = Math.floor(this.getGrowValueByLv(actor, "", lv, actorClass, ca));
            }
        }
        this.slotExtendAttributes(actor, extendAttributesFixed, extendAttributesAdditionPercentage, extendAttributesMultiplicationPercentage);

        for (let i = 1; i <= actor.increaseExtendAttributes.length; i++) {
            let val = actor.increaseExtendAttributes[i];
            if (val) extendAttributesFixed[i] += val;
        }

        // 2. 装备加成 (核心修改逻辑)
        let equipPartsLength = GameData.getLength(19);
        
        // 第一步：收集所有装备的基础属性总和
        let totalBaseAtk = 0;  // 总基础攻击 (ID 2)
        let totalBaseDef = 0;  // 总基础防御 (ID 16)
        let totalBaseHp = 0;   // 总基础生命 (ID 1)
        let totalBaseDodge = 0; // 总基础闪避 (ID 11)
        let totalBaseMove = 0; // 总基础移速 (ID 12)
        let totalBaseHit = 0;  // 总基础命中 (ID 13)
        let totalBaseCrit = 0; // 总基础暴击 (ID 14)
        let totalBaseSpd = 0;  // 总基础攻速 (ID 15)
        
        // 四系属性百分比总和
        let totalEleAtkPercent = [0, 0, 0, 0]; // 索引0-3对应属性3-6
        let totalEleDefPercent = [0, 0, 0, 0]; // 索引0-3对应属性7-10
        
        // 化合属性百分比总和
        let totalCombinePercentHp = 0;    // ID 17 -> 基础生命
        let totalCombinePercentDodge = 0; // ID 18 -> 基础闪避
        let totalCombinePercentMove = 0;  // ID 19 -> 基础移速
        let totalCombinePercentHit = 0;   // ID 20 -> 基础命中
        let totalCombinePercentCrit = 0;  // ID 21 -> 基础暴击
        let totalCombinePercentSpd = 0;   // ID 22 -> 基础攻速
        
        // 第一次遍历：收集所有数据
        for (let i = 1; i <= equipPartsLength; i++) {
            let equip: Module_Equip;
            if (previewChangeMode == 2 && previewChangeEquipIndex == i) equip = previewChangeEquip;
            else equip = Game.getActorEquipByPartID(actor, i);
            
            if (equip && equip.customAttributes) {
                for (let ca of equip.customAttributes) {
                    if (ca.attribute === 1) totalBaseHp += ca.value;      // 基础生命
                    if (ca.attribute === 2) totalBaseAtk += ca.value;      // 基础攻击
                    if (ca.attribute === 11) totalBaseDodge += ca.value;   // 基础闪避
                    if (ca.attribute === 12) totalBaseMove += ca.value;    // 基础移速
                    if (ca.attribute === 13) totalBaseHit += ca.value;     // 基础命中
                    if (ca.attribute === 14) totalBaseCrit += ca.value;    // 基础暴击
                    if (ca.attribute === 15) totalBaseSpd += ca.value;     // 基础攻速
                    if (ca.attribute === 16) totalBaseDef += ca.value;     // 基础防御
                    
                    // 收集四系攻击百分比
                    if (ca.attribute >= 3 && ca.attribute <= 6) {
                        totalEleAtkPercent[ca.attribute - 3] += ca.value;
                    }
                    // 收集四系防御百分比
                    else if (ca.attribute >= 7 && ca.attribute <= 10) {
                        totalEleDefPercent[ca.attribute - 7] += ca.value;
                    }
                    // 收集化合属性百分比
                    else if (ca.attribute === 17) totalCombinePercentHp += ca.value;
                    else if (ca.attribute === 18) totalCombinePercentDodge += ca.value;
                    else if (ca.attribute === 19) totalCombinePercentMove += ca.value;
                    else if (ca.attribute === 20) totalCombinePercentHit += ca.value;
                    else if (ca.attribute === 21) totalCombinePercentCrit += ca.value;
                    else if (ca.attribute === 22) totalCombinePercentSpd += ca.value;
                }
            }
        }
        
        // 第二步：四系攻击 = 总基础攻击 + (总基础攻击 × 百分比总和)
        for (let i = 0; i < 4; i++) {
            // 基础攻击直接加到四系攻击上
            let val = totalBaseAtk;
            // 加上百分比加成
            if (totalEleAtkPercent[i] > 0) {
                val += totalBaseAtk * (totalEleAtkPercent[i] / 100);
            }
            extendAttributesFixed[3 + i] += val;
        }
        
        // 第三步：四系防御 = 总基础防御 + (总基础防御 × 百分比总和)
        for (let i = 0; i < 4; i++) {
            // 基础防御直接加到四系防御上
            let val = totalBaseDef;
            // 加上百分比加成
            if (totalEleDefPercent[i] > 0) {
                val += totalBaseDef * (totalEleDefPercent[i] / 100);
            }
            extendAttributesFixed[7 + i] += val;
        }
        
        // 第四步：化合属性 = 对应基础属性 × 百分比总和
        if (totalCombinePercentHp > 0) {
            let val = totalBaseHp * (totalCombinePercentHp / 100);
            extendAttributesFixed[1] += val;
        }
        if (totalCombinePercentDodge > 0) {
            let val = totalBaseDodge * (totalCombinePercentDodge / 100);
            extendAttributesFixed[11] += val;
        }
        if (totalCombinePercentMove > 0) {
            let val = totalBaseMove * (totalCombinePercentMove / 100);
            extendAttributesFixed[12] += val;
        }
        if (totalCombinePercentHit > 0) {
            let val = totalBaseHit * (totalCombinePercentHit / 100);
            extendAttributesFixed[13] += val;
        }
        if (totalCombinePercentCrit > 0) {
            let val = totalBaseCrit * (totalCombinePercentCrit / 100);
            extendAttributesFixed[14] += val;
        }
        if (totalCombinePercentSpd > 0) {
            let val = totalBaseSpd * (totalCombinePercentSpd / 100);
            extendAttributesFixed[15] += val;
        }
        
        // 第五步：处理其他普通属性（包括基础属性本身）
        for (let i = 1; i <= equipPartsLength; i++) {
            let equip: Module_Equip;
            if (previewChangeMode == 2 && previewChangeEquipIndex == i) equip = previewChangeEquip;
            else equip = Game.getActorEquipByPartID(actor, i);

            if (equip) {
                if (equip.isCustomAttribute && equip.customAttributes) {
                    for (let ca of equip.customAttributes) {
                        // 只处理普通属性（跳过已经处理过的四系属性和化合属性）
                        // 四系属性: 3-10
                        // 化合属性: 17-22
                        if ((ca.attribute >= 3 && ca.attribute <= 10) === false && (ca.attribute >= 17 && ca.attribute <= 22) === false) {
                            if (ca.type == 0) extendAttributesFixed[ca.attribute] += ca.value;
                            else if (ca.type == 1) extendAttributesAdditionPercentage[ca.attribute] += ca.value;
                            else if (ca.type == 2) extendAttributesMultiplicationPercentage[ca.attribute] *= ca.value * 0.01;
                        }
                    }
                }
            }
        }

        // 3. 技能加成
        let actorSkills = [actor.atkSkill].concat(actor.skills);
        for (let i = 0; i < actorSkills.length; i++) {
            let skill = (previewChangeMode == 1 && previewChangeSkillIndex == i) ? previewChangeSkill : actorSkills[i];
            if (skill && skill.passiveAttribute) {
                this.slotExtendAttributes(skill, extendAttributesFixed, extendAttributesAdditionPercentage, extendAttributesMultiplicationPercentage);
            }
        }

        // 4. 状态加成
        for (let i = 0; i < actor.status.length; i++) {
            let status = actor.status[i];
            if (status.isCustomAttribute) {
                for (let l = 0; l < status.currentLayer; l++) {
                    this.slotExtendAttributes(status, extendAttributesFixed, extendAttributesAdditionPercentage, extendAttributesMultiplicationPercentage);
                }
            }
        }

        // 最终汇总
        let finalExtendAttributes: number[] = [];
        for (let i = 1; i <= extendAttributeLen; i++) {
            let val = extendAttributesFixed[i];
            val *= (1 + extendAttributesAdditionPercentage[i] * 0.01);
            val *= extendAttributesMultiplicationPercentage[i];

            let setting = this.extendAttributeSettings[i];
            if (setting) {
                val = Math.max(Math.min(val, setting.upperLimit), setting.lowerLimit);
                if (setting.isinteger) val = Math.floor(val);
            }
            finalExtendAttributes[i] = val;
        }

        return {
            MaxHP: 0, MaxSP: 0, ATK: 0, DEF: 0, MAG: 0, MagDef: 0, HIT: 0, DOD: 0, CRIT: 0, MagCrit: 0, MoveSpeed: 0, AtkSpeed: 0,
            statusAddMaxHP: 0,
            extendAttributes: finalExtendAttributes
        }
    }

    // ... (保留 slotExtendAttributes, getGrowValueByLv, getActorInitAttirubte 以及所有私有事件回调) ...
    getGrowValueByLv(actor: Module_Actor, growAttrName: string, lv: number, actorClass: Module_Class = null, customAttribute: DataStructure_customAttributeGrow = null): number {
        if (!actorClass) actorClass = GameData.getModuleData(7, actor.class);
        if (!actorClass) return 0;
        let growData: any[];
        if (customAttribute) {
            let cacheGrowName = "__extCache_" + customAttribute.attribute;
            growData = actor[cacheGrowName];
            if (!actor[cacheGrowName]) growData = actor[cacheGrowName] = GameUtils.getCurveData(customAttribute.value);
        }
        else {
            let cacheGrowName = growAttrName + "_cache";
            growData = actor[cacheGrowName];
            if (!actor[cacheGrowName]) growData = actor[cacheGrowName] = GameUtils.getCurveData(actorClass[growAttrName]);
        }
        let per = lv == 0 ? 0 : (lv - 1) / (actor.MaxLv - 1);
        return GameUtils.getBezierPoint2ByGroupValue(growData, per);
    }

    slotExtendAttributes(element: Module_Actor | Module_Skill | Module_Equip | Module_Status, extendAttributesFixed: number[] = null, extendAttributesAdditionPercentage: number[] = null, extendAttributesMultiplicationPercentage: number[] = null): any {
        if (!element.isCustomAttribute) return;
        if (!extendAttributesFixed) { /* init */ }
        for (let i = 0; i < element.customAttributes.length; i++) {
            let customAttribute = element.customAttributes[i];
            if (customAttribute.type == 0) extendAttributesFixed[customAttribute.attribute] += customAttribute.value;
            else if (customAttribute.type == 1) extendAttributesAdditionPercentage[customAttribute.attribute] += customAttribute.value;
            else if (customAttribute.type == 2) extendAttributesMultiplicationPercentage[customAttribute.attribute] *= customAttribute.value * 0.01;
        }
        return { extendAttributesFixed, extendAttributesAdditionPercentage, extendAttributesMultiplicationPercentage }
    }


    private getActorInitAttirubte(actor: Module_Actor, attrName: string): number {
        let cacheInitName = `__init_${attrName}`;
        let initValue = actor.initAttrs[cacheInitName];
        if (initValue == null) actor.initAttrs[cacheInitName] = initValue = actor[attrName];
        return initValue;
    }

    private onInSceneStateChange(inNewSceneState: number) {
        if (GameGate.gateState == GameGate.STATE_0_START_EXECUTE_LEAVE_SCENE_EVENT) {
            if (inNewSceneState == 1) { ProjectGame.gameStartTime = new Date(); ProjectPlayer.init(); this.initExtendAttributeSetting(); }
            else if (inNewSceneState == 2) { ProjectGame.gameStartTime = new Date((Date.now() - GUI_SaveFileManager.currentSveFileIndexInfo.indexInfo.gameTime)); }
        }
        else if (GameGate.gateState == GameGate.STATE_1_START_LOAD_SCENE) {
            if (inNewSceneState == 0) {
                this.toNewSceneRecordPlayerBattles = [];
                for (let i = 1; i < Game.player.data.party.length; i++) {
                    let battler = ProjectPlayer.getPlayerPartyBattler(i);
                    Game.currentScene.removeSceneObject(battler);
                    this.toNewSceneRecordPlayerBattles[i] = battler;
                }
                if (ProjectPlayer.ctrlActorSceneObject != Game.player.sceneObject) {
                    for (var i in ProjectPlayer.ctrlActorSceneObject.triggerSingleLines) { let myTrigger = ProjectPlayer.ctrlActorSceneObject.triggerSingleLines[i]; if (myTrigger.mainType == CommandTrigger.COMMAND_MAIN_TYPE_SCENE || myTrigger.trigger != ProjectPlayer.ctrlActorSceneObject || myTrigger.executor != ProjectPlayer.ctrlActorSceneObject) { EventUtils.happen(myTrigger, CommandTrigger.EVENT_OVER); myTrigger.dispose(); delete ProjectPlayer.ctrlActorSceneObject.triggerSingleLines[i]; } }
                    for (var i in ProjectPlayer.ctrlActorSceneObject.triggerLines) { let myTrigger = ProjectPlayer.ctrlActorSceneObject.triggerLines[i]; if (myTrigger.mainType == CommandTrigger.COMMAND_MAIN_TYPE_SCENE || myTrigger.trigger != ProjectPlayer.ctrlActorSceneObject || myTrigger.executor != ProjectPlayer.ctrlActorSceneObject) { if (!myTrigger.isDisposed) EventUtils.happen(myTrigger, CommandTrigger.EVENT_OVER); myTrigger.dispose(); } }
                }
            }
        }
        else if (GameGate.gateState == GameGate.STATE_3_IN_SCENE_COMPLETE) {
            if (inNewSceneState == 1) {
                if (Game.player.data.party.length == 0) {
                    console.warn('[ProjectGame] 队伍为空，尝试添加默认角色');
                    try {
                        if (ProjectPlayer && ProjectPlayer.addPlayerActorByActorID) {
                            ProjectPlayer.addPlayerActorByActorID(1001, 1, false);
                        }
                    } catch (e) {
                        console.error('[ProjectGame] 添加默认角色失败:', e);
                        throw ("can not find party");
                    }
                    if (Game.player.data.party.length == 0) throw ("can not find party");
                }
                let playerBattleModule = Game.player.sceneObject.getModule(6) as SoModule_Battler;
                let firstActorDS = Game.player.data.party[0];
                firstActorDS.sceneObjectIndex = Game.player.sceneObject.index;
                ProjectPlayer.initPlayerActor(0, true);
                if (!playerBattleModule) {
                    playerBattleModule = new SoModule_Battler(null, Game.player.sceneObject);
                    playerBattleModule.id = 6;
                    playerBattleModule.pointBar = GameUI.load(1023, true) as GUI_1023;
                    Game.player.sceneObject.addModule(playerBattleModule);
                    playerBattleModule.actor = firstActorDS.actor;
                    playerBattleModule.isDead = false;
                    playerBattleModule.showPointBar = true;
                    playerBattleModule.pointBarOffsetY = 0;
                    playerBattleModule.camp = -1;
                    playerBattleModule.inPartyIndex = 0;
                    playerBattleModule.battlerInit(true, true);
                } else {
                    playerBattleModule.actor = firstActorDS.actor;
                    Game.refreshActorAttribute(playerBattleModule.actor, firstActorDS.lv, Game.player.sceneObject);
                    playerBattleModule.inPartyIndex = 0;
                    playerBattleModule.camp = -1;
                    playerBattleModule.setPointFullState();
                }
                GameData.changeModuleDataToCopyMode(firstActorDS.actor, 1);
                for (let i = 1; i < Game.player.data.party.length; i++) {
                    let actorDS = Game.player.data.party[i];
                    if (actorDS == null) continue;
                    GameData.changeModuleDataToCopyMode(actorDS.actor, 1);
                    ProjectPlayer.createBattlerByActor(i);
                }
                let guiMain = GameUI.get(18) as GUI_Main;
                if (guiMain) guiMain.refreshAll();
                ProjectGame.inited = true;
            }
            else if (inNewSceneState == 2) {
                for (let i = 0; i < Game.player.data.party.length; i++) {
                    let actorDS = Game.player.data.party[i];
                    GameData.changeModuleDataToCopyMode(actorDS.actor, 1);
                    let battler: ProjectClientSceneObject = Game.currentScene.sceneObjects[actorDS.sceneObjectIndex];
                    let battlerModule = battler?.getModule(6) as SoModule_Battler;
                    if (!battler || battlerModule.inPartyIndex != i) {
                        let hasBattler = false;
                        for (let s = 0; s < Game.currentScene.sceneObjects.length; s++) {
                            let so = Game.currentScene.sceneObjects[s];
                            if (so && GameBattleHelper.isBattler(so)) {
                                let soInPartyIndex = (so.getModule(6) as SoModule_Battler).inPartyIndex;
                                if (soInPartyIndex == i) { hasBattler = true; battler = so; }
                            }
                        }
                        if (!hasBattler) throw ("Unable to find teammate's scene object");
                    }
                    actorDS.sceneObjectIndex = battler.index;
                    battlerModule.inPartyIndex = i;
                    battlerModule.actor = actorDS.actor;
                    GameBattleData.refreshBattlerActionByStatus(battler);
                }
                ProjectGame.inited = true;
            }
            else {
                for (let i = 0; i < Game.player.data.party.length; i++) {
                    let actorDS = Game.player.data.party[i];
                    let battler: ProjectClientSceneObject;
                    if (i == 0) { battler = Game.player.sceneObject; actorDS.sceneObjectIndex = battler.index; }
                    else {
                        battler = this.toNewSceneRecordPlayerBattles[i];
                        battler.x = Game.player.sceneObject.x;
                        battler.y = Game.player.sceneObject.y;
                        Game.currentScene.addSceneObject(battler, true);
                        actorDS.sceneObjectIndex = battler.index;
                        battler.eventCompleteContinue();
                    }
                    let battlerModule = battler.getModule(6) as SoModule_Battler;
                    battlerModule.battlerInit(false, false);
                    if (WorldData.battleMode != 0 && i != 0 && WorldData.battleAutoHideParty) { battler.root.visible = false; battler.through = true; }
                }
            }
        }
    }
    private onPauseChange() { if (Game.pause) { ProjectGame.gamePauseStartTime = new Date(); } else { if (ProjectGame.gamePauseStartTime) { let dTime = Date.now() - ProjectGame.gamePauseStartTime.getTime(); ProjectGame.gameStartTime = new Date(ProjectGame.gameStartTime.getTime() + dTime); ProjectGame.gamePauseStartTime = null; } } }
    private onWearActorEquip(actor, partID, takeOffEquip, newEquip) { Callback.CallLaterBeforeRender(Game.doWearActorEquip, Game, [actor, partID, takeOffEquip, newEquip]); }
    private doWearActorEquip(actor, partID, takeOffEquip, newEquip) { let battler = GameBattleHelper.getBattlerByActor(actor); if (battler) { let m = battler.getModule(6) as SoModule_Battler; if (takeOffEquip) m.takeOffEquipHandle(takeOffEquip); if (newEquip) m.wearEquipHandle(newEquip); } }
    private onTakeOffActorEquip(actor, partID, takeOffEquip) { Callback.CallLaterBeforeRender(Game.doTakeOffActorEquip, Game, [actor, partID, takeOffEquip]); }
    private doTakeOffActorEquip(actor, partID, takeOffEquip) { let battler = GameBattleHelper.getBattlerByActor(actor); if (battler) { let m = battler.getModule(6) as SoModule_Battler; if (takeOffEquip) m.takeOffEquipHandle(takeOffEquip); } }
    private initExtendAttributeSetting(): void { for (let i = 0; i < WorldData.extendsAttributeSetting.length; i++) { let s = WorldData.extendsAttributeSetting[i]; this.extendAttributeSettings[s.attribute] = s; } }

}
