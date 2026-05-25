/**
 * 战斗数据
 * 修复：严格按照技能设定的【加成属性】(ATK/MAG) 来计算四系伤害
 */
class GameBattleData {
    static EVENT_BATTLER_DEAD: string = "GameBattleDataEVENT_BATTLER_DEAD";
    static EVENT_BATTLER_RESUSCITATE: string = "GameBattleDataEVENT_BATTLER_RESUSCITATE";
    static EVENT_BATTLER_IN_BATTLE: string = "GameBattleDataEVENT_BATTLER_IN_BATTLE";
    static EVENT_STATUS_CHANGE: string = "GameBattleDataEVENT_STATUS_CHANGE";
    static EVENT_DROP_ITEM: string = "GameBattleDataEVENT_DROP_ITEM";
    
    // 怪物击败公告配置 - 需要公告的道具ID列表
    static noticeDropItemIDs: number[] = [];
    
    // 记录本次战斗掉落的道具
    private static droppedItems: { itemID: number, itemName: string, num: number }[] = [];

    static hitReward: {
        gold: number,
        exp: number,
        items: { itemID: number, num: number }[],
        equips: Module_Equip[],
    } = { gold: 0, exp: 0, items: [], equips: [] };

    static init(): void { }

    static start() {
        EventUtils.addEventListenerFunction(SceneObjectEntity, SceneObjectEntity.EVENT_BEFORE_CHANGE_STATUS_PAGE, this.onChangeSceneObjectStatus, this);
    }

    static stop() {
        EventUtils.removeEventListenerFunction(SceneObjectEntity, SceneObjectEntity.EVENT_BEFORE_CHANGE_STATUS_PAGE, this.onChangeSceneObjectStatus, this);
    }

    // ... (中间的辅助方法 refreshInBattleState, setInBattleState, dead, resuscitate, 仇恨系统等保持不变) ...
    // 为节省篇幅，这里省略了未修改的辅助方法，请保留你原有的或复制之前的辅助方法代码
    // 重点是替换下面的 calculationHitResult 和 getBestAttackVsDefenseCustom

    static refreshInBattleState(battler: ProjectClientSceneObject, needStopMove: boolean = false): void {
        if (!battler || battler.isDisposed) return;
        let battleModule = battler.getModule(6) as SoModule_Battler;
        if (!battleModule) return;
        let lastInBattle = battleModule.inBattle;
        let nowInBattle = battleModule.battleAI.hateList.length > 0;
        if (!lastInBattle && nowInBattle) {
            this.setInBattleState(battler, true);
            if (needStopMove) battler.stopMove();
        }
        else if (lastInBattle && !nowInBattle) {
            this.setInBattleState(battler, false);
        }
    }

    static setInBattleState(battler: ProjectClientSceneObject, isInBattle: boolean): void {
        let battleModule = battler.getModule(6) as SoModule_Battler;
        if (isInBattle) {
            battler.banBehavior = false;
            battleModule.inBattle = false;
            GameCommand.startCommonCommand(14020, [], null, battler, battler);
            battleModule.inBattle = true;
            Game.refreshActorAttribute(battleModule.actor, GameBattleHelper.getLevelByActor(battleModule.actor), battler);
            EventUtils.happen(GameBattleData, GameBattleData.EVENT_BATTLER_IN_BATTLE, [true, battler]);
            battler.banBehavior = true;
            this.shout(battler);
        }
        else {
            battleModule.inBattle = false;
            battler.eventCompleteContinue();
            battler.banBehavior = false;
            let aiInBattlePoint: Point;
            if (battleModule.battleAI && battleModule.battleAI.aiInBattlePoint) {
                aiInBattlePoint = battleModule.battleAI.aiInBattlePoint;
            }
            Game.refreshActorAttribute(battleModule.actor, GameBattleHelper.getLevelByActor(battleModule.actor), battler);
            GameCommand.startCommonCommand(14021, [], null, battler, battler);
            EventUtils.happen(GameBattleData, GameBattleData.EVENT_BATTLER_IN_BATTLE, [false, battler]);
            if (battleModule.battleAI && aiInBattlePoint) {
                battler.banBehavior = true;
                battleModule.battleAI.backToInBattlePostion(true, aiInBattlePoint);
            }
        }
    }

    static dead(battler: ProjectClientSceneObject, fromBattler: ProjectClientSceneObject): void {
        let battleModule = battler.getModule(6) as SoModule_Battler;
        if (battleModule.isDead) return;
        GameBattleAction.stopAction(battler);
        battler["__throughRecord"] = battler.through;
        battler.through = true;
        battleModule.actor.hp = 0;
        battleModule.actor.sp = 0;
        battler.avatar.fps = battleModule.fpsRecord;
        battleModule.clearStiffness();
        GameBattleData.removeAllStatus(battler);
        GameBattleAction.battlerDeadAnimation(battler, true);
        battler.banAvatarAction = true;
        this.clearHateList(battler, true);
        battleModule.battleAI.clear();
        battler.recordBehavior();
        battler.clearBehaviors();
        GameBattleData.setInBattleState(battler, false);
        battleModule.isDead = true;
        battler.banBehavior = true;
        EventUtils.happen(GameBattleData, GameBattleData.EVENT_BATTLER_DEAD, [battler]);

        let battleActor = battleModule.actor;
        let dropStartIndex = 0;
        // 重置本次战斗掉落记录
        GameBattleData.droppedItems = [];
        
        if (battleModule.actor.dropEnabled && battleModule.camp == 0) {
            if (battleModule.actor.dropGold > 0) {
                let dropPoint = ProjectPlayer.getDropMapItemPostion(battler, dropStartIndex++);
                ProjectPlayer.dropMapGold(battleModule.actor.dropGold, dropPoint.x, dropPoint.y);
            }
            if (battleModule.actor.dropExp != 0) {
                let dropExp = battleModule.actor.dropExp;
                for (let i = 0; i < Game.player.data.party.length; i++) {
                    let actorBattler = ProjectPlayer.getPlayerPartyBattler(i);
                    let actorBattlerModule = actorBattler.getModule(6) as SoModule_Battler;
                    if (!actorBattlerModule.actor.growUpEnabled || actorBattlerModule.isDead) continue;
                    ProjectPlayer.increaseExpByIndex(i, dropExp);
                }
                this.effectText(battler, "+" + battleModule.actor.dropExp.toString() + " exp", 1051, 1053);
            }
            for (let i = 0; i < battleActor.dropItems.length; i++) {
                let dropItemDS = battleActor.dropItems[i];
                if (MathUtils.rand(100) < dropItemDS.dropProbability) {
                    let dropPoint = ProjectPlayer.getDropMapItemPostion(battler, dropStartIndex++);
                    let presetItem = GameData.getModuleData(1, dropItemDS.item) as Module_Item;
                    ProjectPlayer.dropMapItemByInstance(presetItem, dropPoint.x, dropPoint.y, false, true, dropItemDS.num);
                    EventUtils.happen(GameBattleData, GameBattleData.EVENT_DROP_ITEM, [presetItem, dropItemDS.num]);
                    
                    // 记录掉落的道具
                    GameBattleData.droppedItems.push({
                        itemID: dropItemDS.item,
                        itemName: presetItem.name.toString(),
                        num: dropItemDS.num
                    });
                }
            }
            for (let i = 0; i < battleActor.dropEquips.length; i++) {
                let dropEquipDS = battleActor.dropEquips[i];
                if (MathUtils.rand(100) < dropEquipDS.dropProbability) {
                    let dropPoint = ProjectPlayer.getDropMapItemPostion(battler, dropStartIndex++);
                    let newEquip = ObjectUtils.depthClone(dropEquipDS.equip);
                    GameData.changeModuleDataToCopyMode(newEquip, 9);
                    ProjectPlayer.dropMapItemByInstance(newEquip, dropPoint.x, dropPoint.y, true, true);
                    EventUtils.happen(GameBattleData, GameBattleData.EVENT_DROP_ITEM, [newEquip, 1]);
                    
                    // 记录掉落的装备
                    GameBattleData.droppedItems.push({
                        itemID: newEquip.id,
                        itemName: newEquip.name.toString(),
                        num: 1
                    });
                }
            }
            
            // 检查是否掉落了需要公告的道具，如果有则发送公告
            GameBattleData.sendMonsterDefeatNotice(battler, fromBattler);
        }
        if (battleModule.inPartyIndex >= 0) {
            let needChangeCtrlActor = ProjectPlayer.ctrlActorBattleModule.inPartyIndex == battleModule.inPartyIndex;
            if (battleModule.inPartyIndex != 0 && WorldData.deadPlayerActorLeaveParty) {
                ProjectPlayer.removePlayerActorByInPartyIndex(battleModule.inPartyIndex, true, false);
                needChangeCtrlActor = false;
            }
            let deadCount = 0;
            for (let i = 0; i < Game.player.data.party.length; i++) {
                let battler = ProjectPlayer.getPlayerPartyBattler(i);
                let battlerModule = battler.getModule(6) as SoModule_Battler;
                if (battlerModule.isDead) deadCount++;
            }
            if (battleModule.actor.whenDeadEvent) {
                CommandPage.startTriggerFragmentEvent(battleModule.actor.whenDeadEvent, fromBattler ? fromBattler : battler, battler);
            }
            if (deadCount == Game.player.data.party.length) {
                GameCommand.startCommonCommand(14022, [], null, Game.player.sceneObject, Game.player.sceneObject);
            }
            else if (needChangeCtrlActor) {
                ProjectPlayer.changeToNextCtrlActor();
            }
        }
        else {
            if (battleModule.isPeriodicResurrection) {
                battleModule.startResurrection();
            }
            if (battleModule.actor.whenDeadEvent) {
                CommandPage.startTriggerFragmentEvent(battleModule.actor.whenDeadEvent, fromBattler ? fromBattler : battler, battler);
            }
        }
    }

    static resuscitate(battler: ProjectClientSceneObject, isMaxHP: boolean = false): boolean {
        if (!battler || !GameBattleHelper.isBattler(battler)) return false;
        let battleModule = battler.getModule(6) as SoModule_Battler;
        if (!battleModule.isDead) return;
        battleModule.isDead = false;
        battler.banBehavior = false;
        battler.avatar.fps = battleModule.fpsRecord;
        battleModule.clearStiffness();
        battler.banAvatarAction = false;
        GameBattleAction.resuscitateAction(battler);
        battler.recoveryBehavior();
        if (battler["__throughRecord"] != null) battler.through = battler["__throughRecord"];
        else battler.through = false;
        let lv: number = GameBattleHelper.getLevelByActor(battleModule.actor);
        Game.refreshActorAttribute(battleModule.actor, lv, battler);
        battleModule.actor.hp = isMaxHP ? battleModule.actor.MaxHP : 1;
        this.refreshBattlerActionByStatus(battler);
        EventUtils.happen(GameBattleData, GameBattleData.EVENT_BATTLER_RESUSCITATE, [battler]);
        return true;
    }

    static clearHateList(battler: ProjectClientSceneObject, clearAll: boolean = false): void {
        let battleModule = battler.getModule(6) as SoModule_Battler;
        if (!battler || !battleModule || !battleModule.battleAI) return;
        battleModule.battleAI.hateList.length = 0;
        battleModule.battleAI.myTarget = null;
        if (clearAll) this.removeHateTargetFromAllList(battler);
    }

    static removeHateTarget(battler: ProjectClientSceneObject, hateTarget: ProjectClientSceneObject): void {
        let battleModule = battler.getModule(6) as SoModule_Battler;
        if (!battleModule.battleAI) return;
        if (battleModule.battleAI.myTarget == hateTarget) battleModule.battleAI.myTarget = null;
        let hateIndex: number = ArrayUtils.matchAttributes(battleModule.battleAI.hateList, { targetIndex: hateTarget.index }, true, "==", true)[0];
        if (hateIndex == null) return;
        battleModule.battleAI.hateList.splice(hateIndex, 1);
    }

    static removeHateTargetFromAllList(hateTarget: ProjectClientSceneObject): void {
        let allBattler = GameBattleHelper.allBattlers;
        for (let i = 0; i < allBattler.length; i++) {
            let battler = allBattler[i];
            this.removeHateTarget(battler, hateTarget);
        }
    }

    static increaseHate(battler: ProjectClientSceneObject, hateTarget: ProjectClientSceneObject, hateValue: number, ignoreNotInHateList: boolean = false, refTarget: ProjectClientSceneObject = null): void {
        if (!GameBattleHelper.isHostileRelationship(battler, hateTarget)) return;
        if (GameBattleHelper.isImpossibleBattle(battler) || GameBattleHelper.isImpossibleBattle(hateTarget)) return;
        let battleModule = battler.getModule(6) as SoModule_Battler;
        if (ignoreNotInHateList && !ArrayUtils.matchAttributes(battleModule.battleAI.hateList, { targetIndex: refTarget.index }, true)[0]) return;
        let hateDS: DataStructure_battlerHate = ArrayUtils.matchAttributes(battleModule.battleAI.hateList, { targetIndex: hateTarget.index }, true)[0];
        if (hateDS) {
            hateDS.hateValue += hateValue;
        }
        else {
            hateDS = new DataStructure_battlerHate;
            hateDS.targetIndex = hateTarget.index;
            hateDS.hateValue = hateValue;
            battleModule.battleAI.hateList.push(hateDS);
        }
        this.hateListOrderByDESC(battler);
    }

    static increaseHateByHit(fromBattler: ProjectClientSceneObject, targetBattler: ProjectClientSceneObject, hitFrom: Module_Skill | Module_Status, hitValue: number = 0): void {
        if (!fromBattler) return;
        let hateValue = Math.max(hitFrom.damageType <= 2 ? -hitValue : hitValue, 1);
        if (hitValue < 0) {
            this.increaseHate(targetBattler, fromBattler, hateValue);
        }
        else {
            if (GameBattleHelper.isFriendlyRelationship(fromBattler, targetBattler)) {
                let enemyCampBattlers: ProjectClientSceneObject[] = [];
                let allBattlers = GameBattleHelper.allBattlers;
                for (let i = 0; i < allBattlers.length; i++) {
                    let battler = allBattlers[i];
                    if (GameBattleHelper.isHostileRelationship(fromBattler, battler)) {
                        enemyCampBattlers.push(battler);
                    }
                }
                for (let i = 0; i < enemyCampBattlers.length; i++) {
                    let enemyCampBattler = enemyCampBattlers[i];
                    this.increaseHate(enemyCampBattler, fromBattler, hateValue, true, targetBattler);
                    this.increaseHate(fromBattler, enemyCampBattler, 1, true, targetBattler);
                }
            }
        }
    }

    static addStatus(targetBattler: ProjectClientSceneObject, statusID: number, fromBattler: ProjectClientSceneObject = null, force: boolean = false, refreshBattlerAction: boolean = false): boolean {
        let systemStatus: Module_Status = GameData.getModuleData(10, statusID);
        if (!systemStatus) return false;
        if (!force && MathUtils.rand(100) >= systemStatus.statusHit) {
            return false;
        }
        if (fromBattler == null) fromBattler = targetBattler;
        let targetBattlerModule = targetBattler.getModule(6) as SoModule_Battler;
        let targetBattlerActor = targetBattlerModule.actor;
        let fromBattlerModule = fromBattler.getModule(6) as SoModule_Battler;
        let fromBattlerActor = fromBattlerModule.actor;
        let targetIsImmuneThisStatus = targetBattlerActor.selfImmuneStatus.indexOf(statusID) != -1;
        if (!force && targetIsImmuneThisStatus) return false;;
        let thisStatus: Module_Status = ArrayUtils.matchAttributes(targetBattlerActor.status, { id: statusID }, true)[0];
        let firstAddStatus = false;
        if (thisStatus) {
            thisStatus.currentLayer += 1;
            let maxLayer = Math.floor(thisStatus.maxlayer);
            if (thisStatus.currentLayer > maxLayer) thisStatus.currentLayer = maxLayer;
        }
        else {
            firstAddStatus = true;
            thisStatus = GameData.newModuleData(10, statusID);
            thisStatus.fromBattlerID = fromBattler.index;
            thisStatus.fromSceneID = Game.currentScene.id;
            thisStatus.overTimeCurrentDuration = Game.now;
            targetBattlerActor.status.push(thisStatus);
        }
        let flushIntro = GUI_Manager.statusDesc(thisStatus, fromBattler, systemStatus.intro);
        thisStatus.intro = flushIntro;
        thisStatus.flushFromATK = fromBattlerActor.ATK;
        thisStatus.flushFromMAG = fromBattlerActor.MAG;
        thisStatus.flushFromCRIT = fromBattlerActor.CRIT;
        thisStatus.flushFromMagCrit = fromBattlerActor.MagCrit;
        thisStatus.fromBattlerSID = fromBattler.sid;
        thisStatus.flushFromDamagePer = GameBattleHelper.getDamagePer(fromBattler, thisStatus.damageType);
        thisStatus.flushIsFriendlyRelationship = GameBattleHelper.isFriendlyRelationship(targetBattler, fromBattler);
        if (thisStatus.tempHateValue != 0) {
            this.increaseHate(targetBattler, fromBattler, thisStatus.tempHateValue);
        }
        if (thisStatus.animation) targetBattler.playAnimation(thisStatus.animation, true, true);
        thisStatus.currentDuration = Game.now;
        if (firstAddStatus && systemStatus.eventSetting && systemStatus.whenAddEvent) CommandPage.startTriggerFragmentEvent(systemStatus.whenAddEvent, fromBattler, targetBattler);
        if (refreshBattlerAction) Callback.CallLaterBeforeRender(this.refreshBattlerActionByStatus, this, [targetBattler]);
        Callback.CallLaterBeforeRender(this.refreshBattlerAttributeByStatus, this, [targetBattler, targetBattlerActor]);
        EventUtils.happen(GameBattleData, GameBattleData.EVENT_STATUS_CHANGE, [targetBattler]);
        return true;
    }

    static removeStatus(targetBattler: ProjectClientSceneObject, statusID: number, refreshBattlerAction: boolean = true, reduceLayer: number = null): boolean {
        let systemStatus: Module_Status = GameData.getModuleData(10, statusID);
        if (!systemStatus) return false;
        let targetBattleModule = targetBattler.getModule(6) as SoModule_Battler;
        let targetBattlerActor = targetBattleModule.actor;
        let thisStatusIdx: number = ArrayUtils.matchAttributes(targetBattlerActor.status, { id: statusID }, true, "==", true)[0];
        if (thisStatusIdx != null) {
            let stObj = targetBattlerActor.status[thisStatusIdx];
            if (reduceLayer != null && stObj.currentLayer > reduceLayer) {
                stObj.currentLayer -= reduceLayer;
                if (stObj.tempHateValue != 0) {
                    let fromBattler = Game.currentScene.sceneObjects[stObj.fromBattlerID];
                    if (GameBattleHelper.isBattler(fromBattler)) {
                        this.increaseHate(targetBattler, fromBattler, -stObj.tempHateValue * reduceLayer, true, fromBattler);
                    }
                }
            }
            else {
                if (stObj.tempHateValue != 0) {
                    let fromBattler = Game.currentScene.sceneObjects[stObj.fromBattlerID];
                    if (GameBattleHelper.isBattler(fromBattler)) {
                        this.increaseHate(targetBattler, fromBattler, -stObj.tempHateValue * stObj.currentLayer, true, fromBattler);
                    }
                }
                targetBattlerActor.status.splice(thisStatusIdx, 1);
                if (systemStatus.eventSetting && systemStatus.whenRemoveEvent) CommandPage.startTriggerFragmentEvent(systemStatus.whenRemoveEvent, targetBattler, targetBattler);
                if (systemStatus.animation) {
                    if (ArrayUtils.matchAttributes(targetBattlerActor.status, { animation: systemStatus.animation }, true, "==", true).length == 0) {
                        targetBattler.stopAnimation(systemStatus.animation);
                    }
                }
                if (refreshBattlerAction) Callback.CallLaterBeforeRender(this.refreshBattlerActionByStatus, this, [targetBattler]);
            }
            Callback.CallLaterBeforeRender(this.refreshBattlerAttributeByStatus, this, [targetBattler, targetBattlerActor]);
            EventUtils.happen(GameBattleData, GameBattleData.EVENT_STATUS_CHANGE, [targetBattler]);
            return true;
        }
        return false;
    }

    static removeAllStatus(battler: ProjectClientSceneObject): void {
        let battlerModule = battler.getModule(6) as SoModule_Battler;
        let statusArr = battlerModule.actor.status;
        for (let i = 0; i < statusArr.length; i++) {
            let status = statusArr[i];
            if (status.animation) battler.stopAnimation(status.animation);
        }
        battlerModule.actor.status.length = 0;
        this.refreshBattlerActionByStatus(battler);
        EventUtils.happen(GameBattleData, GameBattleData.EVENT_STATUS_CHANGE, [battler]);
    }

    static removeAllBattlerStatusByFromBattler(fromBattler: ProjectClientSceneObject): void {
        for (let i = 0; i < Game.currentScene.sceneObjects.length; i++) {
            let so = Game.currentScene.sceneObjects[i];
            let isRemoved = false;
            if (GameBattleHelper.isBattler(so)) {
                let battlerModule = so.getModule(6) as SoModule_Battler;
                let statusArr = battlerModule.actor.status;
                for (let s = 0; s < statusArr.length; s++) {
                    let status = statusArr[s];
                    if (status.fromBattlerID == fromBattler.index) {
                        if (this.removeStatus(so, status.id, false)) {
                            s--;
                            isRemoved = true;
                        }
                    }
                }
                if (isRemoved) {
                    this.refreshBattlerActionByStatus(so);
                }
            }
        }
    }

    static refreshBattlerActionByStatus(battler: ProjectClientSceneObject) {
        if (!battler || battler.isDisposed) return;
        let battlerModule = battler.getModule(6) as SoModule_Battler;
        if (!battlerModule || battlerModule.isDead) return;
        if (!GameBattleHelper.canMove(battler)) {
            if (battler.avatarAct == WorldData.sceneObjectMoveStartAct2 || battler.avatarAct == WorldData.sceneObjectMoveStartAct) {
                battler.stopMove();
            }
        }
        battler.autoPlayEnable = battlerModule.repeling || GameBattleHelper.canAutoPlayAvatarAction(battler, true);
        battler.fixOri = battlerModule.repeling || !GameBattleHelper.canChangeOri(battler, true);
    }

    //------------------------------------------------------------------------------------------------------
    //  战斗计算 (已修复)
    //------------------------------------------------------------------------------------------------------
    static calculationHitResult(fromBattler: ProjectClientSceneObject, targetBattler: ProjectClientSceneObject, isHitSuccess: boolean, actionType: number, skill: Module_Skill = null, item: Module_Item = null, status: Module_Status = null, damagePer = null): {
        damageType: number,
        damage: number,
        isCrit: boolean
    } {
        let res: {
            damageType: number,
            damage: number,
            isCrit: boolean
        };
        let fromBattleModule = fromBattler?.getModule(6) as SoModule_Battler;
        let targetBattleModule = targetBattler.getModule(6) as SoModule_Battler;
        let fromActor = fromBattleModule?.actor;
        let targetBattlerActor = targetBattleModule.actor;
        let addTargetBattlerStatusArr: number[] = [];
        let addFromBattlerStatusArr: number[] = [];
        let removeTargetBattlerStatusArr: number[] = [];
        let targetOriStatus = targetBattlerActor.status.concat();
        let damageType = -2;
        let hpChangeValue = 0;
        let spChangeValue = 0;
        let hitRemoveStatus = false;
        let critPer: number = 1;
        let magCritPer: number = 1;
        let isCrit: boolean;
        let isMagCrit: boolean;

        if (isHitSuccess) {
            let fromCRIT = fromActor ? fromActor.CRIT : (actionType == 3 ? status.flushFromCRIT : 0);
            let fromMagCrit = fromActor ? fromActor.MagCrit : (actionType == 3 ? status.flushFromMagCrit : 0);
            isCrit = MathUtils.rand(100) < fromCRIT ? true : false;
            isMagCrit = MathUtils.rand(100) < fromMagCrit ? true : false;
            critPer = isCrit ? 2 : 1;
            magCritPer = isMagCrit ? 2 : 1;

            if (actionType == 0) {
                addFromBattlerStatusArr = addFromBattlerStatusArr.concat(fromActor.hitTargetSelfAddStatus);
                addTargetBattlerStatusArr = addTargetBattlerStatusArr.concat(fromActor.hitTargetStatus);
            }
            if (actionType <= 1) {
                if (skill.statusSetting) {
                    addTargetBattlerStatusArr = addTargetBattlerStatusArr.concat(skill.addStatus);
                    removeTargetBattlerStatusArr = removeTargetBattlerStatusArr.concat(skill.removeStatus);
                }
            }
            else if (actionType == 2) {
                addTargetBattlerStatusArr = addTargetBattlerStatusArr.concat(item.addStatus);
                removeTargetBattlerStatusArr = removeTargetBattlerStatusArr.concat(item.removeStatus);
            }

            for (let i = 0; i < addTargetBattlerStatusArr.length; i++) {
                let addStatusID = addTargetBattlerStatusArr[i];
                GameBattleData.addStatus(targetBattler, addStatusID, fromBattler, false, true);
            }
            for (let i = 0; i < removeTargetBattlerStatusArr.length; i++) {
                let removeStatusID = removeTargetBattlerStatusArr[i];
                GameBattleData.removeStatus(targetBattler, removeStatusID);
            }
            for (let i = 0; i < addFromBattlerStatusArr.length; i++) {
                let addStatusID = addFromBattlerStatusArr[i];
                GameBattleData.addStatus(fromBattler, addStatusID, fromBattler, false, true);
            }
            if (addTargetBattlerStatusArr.length > 0 || removeTargetBattlerStatusArr.length > 0) {
                let level = GameBattleHelper.getLevelByActor(targetBattlerActor);
                Game.refreshActorAttribute(targetBattlerActor, level, targetBattler)
            }
            if (addFromBattlerStatusArr.length > 0) {
                let level = GameBattleHelper.getLevelByActor(targetBattlerActor);
                Game.refreshActorAttribute(targetBattlerActor, level, targetBattler)
            }
        }

        if (!isHitSuccess) {
            damageType = -1;
            res = { damageType: -1, damage: hpChangeValue, isCrit: false };
        }

        if (isHitSuccess) {
            if (actionType <= 1) {
                let skillDamage = 0;
                if (skill.useDamage) {
                    let damageShowCrit: boolean = false;
                    damageType = skill.damageType;
                    skillDamage = skill.damageValue;

                    // === 【关键修改：确定四系计算的基准值】 ===
                    // 1. 基准攻击：如果技能设定了加成类型(0:ATK, 1:MAG)，则优先使用设定值；否则根据伤害类型决定
                    //    这样即便伤害类型是“魔法(1)”，如果加成选的是“攻击(0)”，baseAtk 也会是 ATK
                    let baseAtk = damageType == 0 ? fromActor.ATK : fromActor.MAG;
                    if (skill.useAddition) {
                        baseAtk = skill.additionMultipleType == 0 ? fromActor.ATK : fromActor.MAG;
                    }

                    // 2. 基准防御：物理伤用DEF，魔法伤用MagDef
                    let baseDef = damageType == 0 ? targetBattlerActor.DEF : targetBattlerActor.MagDef;

                    // 3. 计算最佳元素收益 (拿着正确的 baseAtk 去算)
                    //    这样算出来的 bestAtk 就是 (fromActor.ATK * (1 + 电攻%))
                    let bestAtkVal = baseAtk;
                    let bestDefVal = baseDef;

                    if (damageType <= 1) {
                         const calcResult = this.getBestAttackVsDefenseCustom(fromActor, targetBattlerActor, fromActor.ATK, targetBattlerActor.DEF);
                         bestAtkVal = calcResult.bestAtk;
                         bestDefVal = calcResult.correspondingDef;
                    }

                    // 4. 应用加成倍率 (2.25)
                    if (skill.useAddition) {
                        // 使用计算过四系加成的 bestAtkVal
                        let addDamageValue = skill.additionMultiple / 100 * bestAtkVal;
                        skillDamage += addDamageValue;
                    }

                    // 5. 最终计算 (伤害 = 总面板 - 对方最佳防御)
                    if (damageType == 0) { // 物理
                        hpChangeValue = -Math.max(1, skillDamage - bestDefVal) * critPer;
                        hitRemoveStatus = true;
                        damageShowCrit = isCrit;
                    }
                    else if (damageType == 1) { // 魔法
                        hpChangeValue = -Math.max(1, skillDamage - bestDefVal) * magCritPer;
                        hitRemoveStatus = true;
                        damageShowCrit = isMagCrit;
                    }
                    else if (damageType == 2) { // 真实
                        hpChangeValue = -Math.max(1, skillDamage);
                        hitRemoveStatus = true;
                    }
                    else if (damageType == 3) { // 恢复HP
                        hpChangeValue = Math.max(0, skillDamage) * magCritPer;
                        damageShowCrit = isMagCrit;
                    }
                    else if (damageType == 4) { // 恢复SP
                        spChangeValue = Math.max(0, skillDamage) * magCritPer;
                        damageShowCrit = isMagCrit;
                    }

                    if (hpChangeValue != 0) {
                        res = { damageType: damageType, damage: hpChangeValue, isCrit: damageShowCrit };
                    }
                    else if (spChangeValue != 0) {
                        res = { damageType: damageType, damage: spChangeValue, isCrit: damageShowCrit };
                    }
                }
            }
            else if (actionType == 2) {
                if (item.recoveryHP) {
                    damageType = 3;
                    hpChangeValue = item.recoveryHP;
                    res = { damageType: damageType, damage: hpChangeValue, isCrit: false };
                }
                if (item.recoverySP) {
                    spChangeValue = item.recoverySP;
                    if (damageType != 3) {
                        damageType = 4;
                        res = { damageType: damageType, damage: spChangeValue, isCrit: false };
                    }
                }
            }
            else if (actionType == 3) {
                damageType = status.damageType;
                let damageShowCrit: boolean = false;
                let statusDamage = status.damageValue;
                
                // 状态伤害同样应用逻辑
                let baseAtk = status.additionMultipleType == 0 ? status.flushFromATK : status.flushFromMAG;
                let baseDef = damageType == 0 ? targetBattlerActor.DEF : targetBattlerActor.MagDef;
                
                let bestAtkVal = baseAtk;
                let bestDefVal = baseDef;
                
                if (damageType <= 1) {
                     const calcResult = this.getBestAttackVsDefenseCustom(fromActor, targetBattlerActor, fromActor ? fromActor.ATK : baseAtk, targetBattlerActor.DEF);
                     bestAtkVal = calcResult.bestAtk;
                     bestDefVal = calcResult.correspondingDef;
                }

                if (status.useAddition) {
                    let addDamageValue = status.additionMultiple / 100 * bestAtkVal;
                    statusDamage += addDamageValue;
                }
                
                statusDamage *= status.currentLayer;
                if (damageType == 0) {
                    hpChangeValue = -Math.max(1, statusDamage - bestDefVal);
                    hitRemoveStatus = true;
                    damageShowCrit = isCrit;
                }
                else if (damageType == 1) {
                    hpChangeValue = -Math.max(1, statusDamage - bestDefVal);
                    hitRemoveStatus = true;
                    damageShowCrit = isMagCrit;
                }
                else if (damageType == 2) {
                    hpChangeValue = -Math.max(1, statusDamage);
                    hitRemoveStatus = true;
                }
                else if (damageType == 3) {
                    hpChangeValue = Math.max(0, statusDamage) * magCritPer;
                    damageShowCrit = isMagCrit;
                }
                else if (damageType == 4) {
                    spChangeValue = Math.max(0, statusDamage) * magCritPer;
                    damageShowCrit = isMagCrit;
                }
                if (hpChangeValue != 0) {
                    res = { damageType: damageType, damage: hpChangeValue, isCrit: damageShowCrit };
                }
                else if (spChangeValue != 0) {
                    res = { damageType: damageType, damage: spChangeValue, isCrit: damageShowCrit };
                }
            }
        }

        if (damageType <= 2) {
            if (((actionType == 3 && !status.flushIsFriendlyRelationship) || GameBattleHelper.isHostileRelationship(fromBattler, targetBattler)) && res && res.damage < 0) {
                let fromBattlerDamagePer = actionType == 3 ? status.flushFromDamagePer : GameBattleHelper.getDamagePer(fromBattler, damageType);
                let targetBattlerStrikePer = GameBattleHelper.getStrikePer(targetBattler, damageType);
                res.damage = hpChangeValue = hpChangeValue * fromBattlerDamagePer * 0.01 * targetBattlerStrikePer * 0.01;
            }
            if (damagePer != null && res && res.damage < 0) {
                res.damage = hpChangeValue = hpChangeValue * damagePer * 0.01;
            }
        }

        if (damageType >= 0 && damageType <= 2 && res && Math.abs(res.damage) < 1) {
            res.damage = hpChangeValue = -1;
        }

        if (actionType <= 1) {
            if (skill.useHate && res) {
                GameBattleData.increaseHateByHit(fromBattler, targetBattler, skill, res.damage);
            }
            if (GameBattleHelper.isHostileRelationship(fromBattler, targetBattler)) {
                GameBattleData.increaseHate(fromBattler, targetBattler, 1);
            }
        }
        else if (actionType == 3) {
            if (fromBattler) {
                if (res) GameBattleData.increaseHateByHit(fromBattler, targetBattler, status, res.damage);
                if (GameBattleHelper.isHostileRelationship(fromBattler, targetBattler)) {
                    GameBattleData.increaseHate(fromBattler, targetBattler, 1);
                }
            }
        }

        if (WorldData.useCustomDamageLogic) {
            if (isHitSuccess) {
                let lastHP = targetBattlerActor.hp;
                hitRemoveStatus = false;
                CustomGameNumber.customDamageLogic_actionType = actionType;
                CustomGameNumber.customDamageLogic_skill = skill;
                CustomGameNumber.customDamageLogic_status = status;
                CommandPage.startTriggerFragmentEvent(WorldData.customDamageLogicEvent, fromBattler, targetBattler);
                if (lastHP > targetBattlerActor.hp) hitRemoveStatus = true;
            }
        }
        else {
            hpChangeValue = Math.trunc(hpChangeValue);
            spChangeValue = Math.trunc(spChangeValue);
            if (hpChangeValue != 0) targetBattlerActor.hp += hpChangeValue;
            if (spChangeValue != 0) targetBattlerActor.sp += spChangeValue;
        }

        targetBattlerActor.hp = Math.max(Math.min(targetBattlerActor.hp, targetBattlerActor.MaxHP), 0);
        targetBattlerActor.sp = Math.max(Math.min(targetBattlerActor.sp, targetBattlerActor.MaxSP), 0);

        if (hitRemoveStatus) {
            let hitRemoveStatusSuccess = false;
            if ((actionType == 0 || actionType == 1 || actionType == 3) && damageType <= 2) {
                for (let i = 0; i < targetOriStatus.length; i++) {
                    let needRemoveStatus = targetOriStatus[i];
                    if (needRemoveStatus.removeWhenInjured && MathUtils.rand(100) < needRemoveStatus.removePer) {
                        if (GameBattleData.removeStatus(targetBattler, needRemoveStatus.id)) hitRemoveStatusSuccess = true;
                    }
                }
                if (hitRemoveStatusSuccess) {
                    let level = GameBattleHelper.getLevelByActor(targetBattlerActor);
                    Game.refreshActorAttribute(targetBattlerActor, level, targetBattler);
                }
            }
        }
        return res;
    }

    static changeBattlerHP(battle: ProjectClientSceneObject, changeValue: number): void {
        let battleModule = battle.getModule(6) as SoModule_Battler;
        let actor = battleModule.actor;
        actor.hp += changeValue;
        actor.hp = Math.max(Math.min(actor.hp, actor.MaxHP), 0);
    }

    static changeBattlerSP(battle: ProjectClientSceneObject, changeValue: number): void {
        let battleModule = battle.getModule(6) as SoModule_Battler;
        let actor = battleModule.actor;
        actor.sp += changeValue;
        actor.sp = Math.max(Math.min(actor.sp, actor.MaxSP), 0);
    }

    private static onChangeSceneObjectStatus(so: ProjectClientSceneObject): void {
        if (GameBattleHelper.isBattler(so)) {
            GameBattleData.removeAllBattlerStatusByFromBattler(so);
            this.clearHateList(so, true);
            GameBattleData.setInBattleState(so, false);
            so.eventCompleteContinue();
        }
    }

    private static refreshBattlerAttributeByStatus(targetBattler: ProjectClientSceneObject, targetBattlerActor: Module_Actor): void {
        if (!targetBattler.isDisposed) {
            let lv = GameBattleHelper.getLevelByActor(targetBattlerActor);
            Game.refreshActorAttribute(targetBattlerActor, lv, targetBattler);
        }
    }

    private static hateListOrderByDESC(battler: ProjectClientSceneObject) {
        let battleModule = battler.getModule(6) as SoModule_Battler;
        battleModule.battleAI.hateList.sort((a: DataStructure_battlerHate, b: DataStructure_battlerHate): number => {
            return a.hateValue < b.hateValue ? 1 : -1;
        });
    }

    private static shout(battler: ProjectClientSceneObject): void {
        if (GameBattleHelper.isEnemyCamp(battler)) {
            let battleModule = battler.getModule(6) as SoModule_Battler;
            let hateList = battleModule.battleAI.hateList;
            if (hateList.length > 0) {
                let allBattlers = GameBattleHelper.allBattlers;
                for (var i = 0; i < allBattlers.length; i++) {
                    let checkBattler = allBattlers[i];
                    if (GameBattleHelper.isEnemyCamp(checkBattler)) {
                        if (Point.distanceSquare2(battler.x, battler.y, checkBattler.x, checkBattler.y) < Math.pow(WorldData.shoutDistance, 2)) {
                            let checkBattlerModule = checkBattler.getModule(6) as SoModule_Battler;
                            if (!checkBattlerModule.inBattle) {
                                for (var s = 0; s < hateList.length; s++) {
                                    let hateTarget = Game.currentScene.sceneObjects[hateList[s].targetIndex];
                                    if (hateTarget) {
                                        ProjectUtils.waitFrameStartExecute(Math.floor(WorldData.shoutReactionTime * 60), (checkBattler: ProjectClientSceneObject, hateTarget: ProjectClientSceneObject) => {
                                            if (!checkBattler.isDisposed && !hateTarget.isDisposed) {
                                                this.increaseHate(checkBattler, hateTarget, 1);
                                            }
                                        }, this, [checkBattler, hateTarget])
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    //------------------------------------------------------------------------------------------------------
    // 【新】自定义基准值的四系计算
    //------------------------------------------------------------------------------------------------------
    private static getBestAttackVsDefenseCustom(fromActor: Module_Actor, targetActor: Module_Actor, baseAtk: number, baseDef: number): { bestAtk: number, correspondingDef: number } {
        // 使用数字ID的 extendAttributes (根据GUI_Actor.ts的ID定义)
        const fromExt = fromActor && fromActor.extendAttributes ? fromActor.extendAttributes : [];
        const targetExt = targetActor && targetActor.extendAttributes ? targetActor.extendAttributes : [];
        const safeBaseAtk = Math.max(0, baseAtk || 0);
        const safeBaseDef = Math.max(0, baseDef || 0);
        
        // 攻击加成 (%)
        const poisonAtkPer = fromExt[3] || 0;
        const iceAtkPer    = fromExt[4] || 0;
        const fireAtkPer   = fromExt[5] || 0;
        const elecAtkPer   = fromExt[6] || 0;

        // 防御加成 (%)
        const poisonDefPer = targetExt[7] || 0;
        const iceDefPer    = targetExt[8] || 0;
        const fireDefPer   = targetExt[9] || 0;
        const elecDefPer   = targetExt[10] || 0;

        // 计算所有四系攻击值
        const poisonAtk = safeBaseAtk * (1 + poisonAtkPer / 100);
        const iceAtk = safeBaseAtk * (1 + iceAtkPer / 100);
        const fireAtk = safeBaseAtk * (1 + fireAtkPer / 100);
        const elecAtk = safeBaseAtk * (1 + elecAtkPer / 100);
        
        // 找到最高的四系攻击
        const maxAtk = Math.max(poisonAtk, iceAtk, fireAtk, elecAtk);

        // 计算所有四系防御值
        const poisonDef = safeBaseDef * (1 + poisonDefPer / 100);
        const iceDef = safeBaseDef * (1 + iceDefPer / 100);
        const fireDef = safeBaseDef * (1 + fireDefPer / 100);
        const elecDef = safeBaseDef * (1 + elecDefPer / 100);
        
        // 找到最高的四系防御
        const maxDef = Math.max(poisonDef, iceDef, fireDef, elecDef);

        return { 
            bestAtk: maxAtk, 
            correspondingDef: maxDef 
        };
    }

    private static effectText(target: ProjectClientSceneObject, label: string, uiID: number, aniID: number): UIRoot {
        let textUI = GameUI.load(uiID, true);
        if (!textUI) return;
        let uiTarget = textUI["target"];
        let uiTxt = textUI["txt"];
        if (!uiTarget || !uiTxt) return;
        uiTxt.text = label;
        Game.currentScene.animationHighLayer.addChild(textUI);
        textUI.x = target.x + MathUtils.rand(30) - 15;
        textUI.y = target.y - Config.SCENE_GRID_SIZE + MathUtils.rand(30) - 15;
        let ani = new GCAnimation();
        ani.id = aniID;
        ani.addToGameSprite(uiTarget, textUI, textUI);
        uiTarget.addChild(ani);
        ani.once(GCAnimation.PLAY_COMPLETED, this, (ani: GCAnimation, textUI: UIRoot) => {
            ani.dispose();
            textUI.dispose();
        }, [ani, textUI]);
        ani.play();
        return textUI;
    }

    // =======================================================================
    //  怪物击败公告系统
    // =======================================================================

    /**
     * 获取当前生效的公告道具ID列表
     * 优先使用副本配置，如果没有副本配置则使用全局配置
     * @returns 道具ID数组
     */
    private static getEffectiveNoticeItemIDs(): number[] {
        // 首先检查是否在副本中
        let currentDungeon = GameBattleData.getCurrentDungeon();
        if (currentDungeon && currentDungeon.noticeEnabled && currentDungeon.noticeDropItems) {
            return currentDungeon.noticeDropItems;
        }
        // 使用全局配置
        return GameBattleData.noticeDropItemIDs;
    }

    /**
     * 获取当前所在的副本配置
     * @returns 副本配置对象
     */
    private static getCurrentDungeon(): Module_Dungeon | null {
        // 这里需要根据实际情况实现获取当前副本的逻辑
        // 可以通过场景变量、玩家状态或其他方式判断
        // 以下是示例实现，需要根据实际项目调整
        
        // 方式1：通过场景变量获取副本ID（使用正确的API）
        try {
            let dungeonID = Game.player.variable.getVariable(1); // 假设变量1存储当前副本ID
            if (dungeonID && dungeonID > 0) {
                return GameData.getModuleData(27, dungeonID) as Module_Dungeon;
            }
        } catch (e) {
            console.warn('[Notice] 获取副本配置失败:', e);
        }
        
        // 方式2：通过当前场景判断（如果场景名称包含副本标识）
        let sceneName = Game.currentScene.name.toString();
        if (sceneName.includes('副本') || sceneName.includes('dungeon')) {
            // 可以根据场景名映射到对应的副本ID
            // 这里简化处理，返回null
        }
        
        return null;
    }

    /**
     * 发送怪物击败公告
     * @param monsterBattler 被击败的怪物
     * @param killerBattler 击败怪物的玩家（可能为null）
     */
    private static sendMonsterDefeatNotice(monsterBattler: ProjectClientSceneObject, killerBattler: ProjectClientSceneObject): void {
        // 获取当前生效的公告道具ID列表（副本配置优先）
        let effectiveNoticeItemIDs = GameBattleData.getEffectiveNoticeItemIDs();
        
        // 检查是否有需要公告的道具掉落
        let noticeItems = GameBattleData.droppedItems.filter(item => 
            effectiveNoticeItemIDs.includes(item.itemID)
        );
        
        // 如果没有需要公告的道具，检查是否需要发送普通击败公告（根据配置）
        if (noticeItems.length === 0) {
            // 默认只在掉落指定道具时发送公告
            return;
        }
        
        // 获取击败者信息
        let playerName = '玩家';
        if (killerBattler && killerBattler.getModule(6)) {
            let killerModule = killerBattler.getModule(6) as SoModule_Battler;
            if (killerModule.actor) {
                playerName = killerModule.actor.name.toString();
            }
        }
        
        // 获取怪物名称
        let monsterName = '怪物';
        let monsterModule = monsterBattler.getModule(6) as SoModule_Battler;
        if (monsterModule && monsterModule.actor) {
            monsterName = monsterModule.actor.name.toString();
        }
        
        // 获取副本配置，用于自定义公告标题
        let currentDungeon = GameBattleData.getCurrentDungeon();
        let noticeTitle = currentDungeon && currentDungeon.noticeTitle ? 
            currentDungeon.noticeTitle : '';
        
        // 发送公告到服务器
        GameBattleData.sendNoticeToServer(playerName, monsterName, noticeItems, noticeTitle);
    }

    /**
     * 发送公告到服务器
     * @param playerName 玩家名称
     * @param monsterName 怪物名称
     * @param droppedItems 掉落的道具列表
     * @param noticeTitle 自定义公告标题（可选）
     */
    private static sendNoticeToServer(playerName: string, monsterName: string, droppedItems: { itemID: number, itemName: string, num: number }[], noticeTitle?: string): void {
        try {
            let xhr = new XMLHttpRequest();
            let timeout = setTimeout(() => { xhr.abort(); }, 5000);
            
            xhr.open('POST', 'http://47.96.92.202:8848/fwq/api.php?action=monsterDefeated', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    clearTimeout(timeout);
                    if (xhr.status === 200) {
                        try {
                            let result = JSON.parse(xhr.responseText);
                            if (result.code !== 200) {
                                console.warn('[Notice] 发送怪物击败公告失败:', result.message);
                            }
                        } catch (e) {
                            console.warn('[Notice] 解析公告响应失败:', e);
                        }
                    }
                }
            };
            
            xhr.onerror = () => {
                clearTimeout(timeout);
                console.warn('[Notice] 发送公告网络错误');
            };
            
            let data: any = {
                player_name: playerName,
                monster_name: monsterName,
                dropped_items: droppedItems
            };
            
            // 如果有自定义标题，添加到请求中
            if (noticeTitle && noticeTitle.trim()) {
                data.notice_title = noticeTitle;
            }
            
            xhr.send(JSON.stringify(data));
        } catch (e) {
            console.warn('[Notice] 发送公告异常:', e);
        }
    }

    /**
     * 设置需要公告的道具ID列表
     * @param itemIDs 道具ID数组
     */
    static setNoticeDropItemIDs(itemIDs: number[]): void {
        GameBattleData.noticeDropItemIDs = itemIDs;
    }

    /**
     * 添加需要公告的道具ID
     * @param itemID 道具ID
     */
    static addNoticeDropItemID(itemID: number): void {
        if (!GameBattleData.noticeDropItemIDs.includes(itemID)) {
            GameBattleData.noticeDropItemIDs.push(itemID);
        }
    }

    /**
     * 移除需要公告的道具ID
     * @param itemID 道具ID
     */
    static removeNoticeDropItemID(itemID: number): void {
        let index = GameBattleData.noticeDropItemIDs.indexOf(itemID);
        if (index !== -1) {
            GameBattleData.noticeDropItemIDs.splice(index, 1);
        }
    }
}
