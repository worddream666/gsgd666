/**
 *  GameBattleAction.ts (v22 - 移除日志版本)
 *
 *  1. [核心优化] 引入UI对象池 (DamageNumberManager) 来管理伤害/治疗数字的UI实例，
 *     通过复用UI对象，极大地减少了高频战斗中创建和销毁UI的开销，从根本上解决卡顿问题。
 *  2. [优化] 在部分高频函数中缓存战斗者模块(SoModule_Battler)的引用，避免重复调用getModule。
 *  3. [移除] 移除所有日志系统，减少性能开销。
 *  4. [兼容] 继承v17的名称获取修正，确保稳定性。
 */

/**
 * [新增] DamageNumberManager (UI对象池)
 * 伤害数字UI对象池管理器，用于复用伤害UI，避免频繁创建和销毁。
 */
class DamageNumberManager {
    private static _instance: DamageNumberManager;
    // UI对象池, key为UI_ID, value为对应UI实例数组
    private _pool: Map<number, any[]> = new Map();

    public static get instance(): DamageNumberManager {
        if (!this._instance) {
            this._instance = new DamageNumberManager();
        }
        return this._instance;
    }

    /**
     * 从池中获取一个UI实例
     * @param uiID UI资源的ID
     */
    public get(uiID: number): any {
        let pool = this._pool.get(uiID);
        if (pool && pool.length > 0) {
            const ui = pool.pop();
            ui.visible = true; // 重新激活时设为可见
            return ui;
        }

        // 如果池为空，则创建一个新的UI实例
        const newUI = GameUI.load(uiID, true);
        if (newUI) {
            // 为新创建的UI附加一个属性来记录它的uiID，方便回收
            (newUI as any)._uiID = uiID;
        } else {
             console.warn(`[DamageNumberManager] 无法加载UI资源 (ID: ${uiID})。`);
        }
        return newUI;
    }

    /**
     * 将UI实例归还到池中
     * @param ui 要回收的UI实例
     */
    public reclaim(ui: any): void {
        if (!ui) return;
        
        // 从舞台移除并设为不可见
        ui.removeSelf();
        ui.visible = false;
        
        const uiID = (ui as any)._uiID;
        if (uiID === undefined) {
            // 如果没有_uiID，则直接销毁，避免污染对象池
            ui.dispose();
            console.warn(`[DamageNumberManager] 回收了一个没有_uiID属性的UI，已直接销毁。`);
            return;
        }

        if (!this._pool.has(uiID)) {
            this._pool.set(uiID, []);
        }
        this._pool.get(uiID)!.push(ui);
    }
}


class GameBattleAction {
    private static readonly MAX_DAMAGE_DISPLAYS_PER_FRAME: number = 12;
    static EVENT_ACTION_RELEASE_ACTION_START: string = "GameBattleActionEVENT_ACTION_RELEASE_ACTION_START";
    static EVENT_ACTION_RELEASE_ACTION_OVER: string = "GameBattleActionEVENT_ACTION_RELEASE_ACTION_OVER";
    static EVENT_ACTION_USE_SKILL: string = "GameBattleActionEVENT_ACTION_USE_SKILL";
    static EVENT_ACTION_RELEASE_SKILL: string = "GameBattleActionEVENT_ACTION_RELEASE_SKILL";
    static EVENT_ACTION_RELEASE_BULLET_START: string = "GameBattleActionEVENT_ACTION_RELEASE_BULLET_START";
    static EVENT_ACTION_RELEASE_BULLET_OVER: string = "GameBattleActionEVENT_ACTION_RELEASE_BULLET_OVER";
    static EVENT_ACTION_HIT_TARGET: string = "GameBattleActionEVENT_ACTION_HIT_TARGET";
    private static bullets: GameBullet[] = [];
    private static battlersCache: ProjectClientSceneObject[] = [];
    private static battlersCacheFrame: number = -1;
    private static damageDisplayQueue: { targetBattler: ProjectClientSceneObject, damageType: number, damage: number, isCrit: boolean, onFin: Callback, forceShow: boolean }[] = [];
    protected static mustActionCompleteTask = "mustActionCompleteTask";

    // -- 辅助函数：安全获取战斗单位名称
    private static _getBattlerName(battlerModule: SoModule_Battler | null | undefined, defaultName: string = '未知'): string {
        return battlerModule?.actor?.name ?? defaultName;
    }

    static start(): void {
        os.add_ENTERFRAME(this.update, this);
    }

    static stop(): void {
        let allBattlers = GameBattleHelper.allBattlers;
        for (let i = 0; i < allBattlers.length; i++) {
            this.stopAction(allBattlers[i]);
        }
        for (let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].dispose();
        }
        this.bullets = [];
        this.battlersCache.length = 0;
        this.battlersCacheFrame = -1;
        while (this.damageDisplayQueue.length > 0) {
            const damageInfo = this.damageDisplayQueue.shift();
            if (damageInfo && damageInfo.onFin) damageInfo.onFin.run();
        }
        os.remove_ENTERFRAME(this.update, this);
    }

    static getCurrentBattlers(): ProjectClientSceneObject[] {
        if (this.battlersCacheFrame === Game.frameCount) {
            return this.battlersCache;
        }
        this.battlersCacheFrame = Game.frameCount;
        this.battlersCache.length = 0;
        if (!Game.currentScene) return this.battlersCache;
        const sceneObjects = Game.currentScene.sceneObjects;
        for (let i = 0; i < sceneObjects.length; i++) {
            const sceneObject = sceneObjects[i] as ProjectClientSceneObject;
            if (GameBattleHelper.isBattler(sceneObject)) {
                this.battlersCache.push(sceneObject);
            }
        }
        return this.battlersCache;
    }
    
    static stopAction(battler: ProjectClientSceneObject): void {
        let battleModule = battler.getModule(6) as SoModule_Battler;
        if (!battleModule.isDead) {
            battler.stopMove();
        }
    }
    
    static useSkill(fromBattler: ProjectClientSceneObject, skill: Module_Skill, firstTarget: ProjectClientSceneObject = null): boolean {
        // ... 此函数内部代码与之前版本相同，无需改动 ...
        if (!fromBattler || !skill) return false;
        if (!GameBattleHelper.canUseOneSkill(fromBattler, skill, true, null, firstTarget)) return false;
        let useMouse: boolean = false;
        if (fromBattler == ProjectPlayer.ctrlActorSceneObject) {
            if (ProjectUtils.lastControl <= 1) useMouse = true;
        }
        if (GameUI.get(12) && skill.skillReleaseType == 3) {
            skill.skillReleaseType = 2;
        }
        let fromBattleModule = fromBattler.getModule(6) as SoModule_Battler;
        fromBattleModule.actor.sp -= skill.costSP;
        fromBattleModule.actor.hp -= skill.costHP;
        skill.currentCD = Game.now;
        let doUseSkill = () => {
            if (GameBattleHelper.isImpossibleBattle(fromBattler)) return;
            let isSprint = this.sprint(fromBattler, skill);
            let blockAttackInfo = this.blockAttack(fromBattler, skill);
            fromBattleModule.blockAttackInfo = blockAttackInfo;
            let releaseActionID: number;
            let releaseFrame: number;
            let releaseFPS: number;
            let damagePer: number;
            if (skill.useAction2 && skill.multiActions.length > 0) {
                let actionArr = [{ id: skill.releaseActionID, frame: skill.releaseFrame, fps: skill.actionFPS, damagePer: 100 }];
                for (let i = 0; i < skill.multiActions.length; i++) {
                    let actInfo = skill.multiActions[i];
                    actionArr.push({ id: actInfo.actionID, frame: actInfo.releaseFrame, fps: actInfo.fps, damagePer: actInfo.damagePer })
                }
                let actionInfo: typeof actionArr[0];
                if (skill.mulActionMode == 0) {
                    fromBattleModule.comboInit();
                    if (fromBattleModule.comboTimes >= actionArr.length) fromBattleModule.comboTimes = 0;
                    actionInfo = actionArr[fromBattleModule.comboTimes];
                    fromBattleModule.comboTimes++;
                    fromBattleModule.comboTime = Game.now;
                } else {
                    actionInfo = actionArr[MathUtils.rand(actionArr.length)];
                }
                releaseActionID = actionInfo.id;
                releaseFrame = actionInfo.frame;
                releaseFPS = actionInfo.fps;
                damagePer = actionInfo.damagePer;
            } else {
                releaseActionID = skill.releaseActionID;
                releaseFrame = skill.releaseFrame;
                releaseFPS = skill.actionFPS;
                damagePer = 100;
            }
            if (!isSprint) fromBattler.stopMove();
            let angle = null;
            if (skill.skillType == 1 && (skill.skillReleaseType == 3 && ProjectUtils.lastControl != 2)) {
                if (ProjectPlayer.ctrlActorSceneObject == fromBattler) {
                    if (!useMouse) {
                        angle = GameUtils.getAngleByOri(GameBattleHelper.getBattlerOri(fromBattler));
                    } else {
                        angle = MathUtils.direction360(fromBattler.x, fromBattler.y, Game.currentScene.localX, Game.currentScene.localY);
                    }
                } else if (fromBattleModule.battleAI.myTarget) {
                    angle = MathUtils.direction360(fromBattler.x, fromBattler.y, fromBattleModule.battleAI.myTarget.x, fromBattleModule.battleAI.myTarget.y);
                } else {
                    angle = GameUtils.getAngleByOri(GameBattleHelper.getBattlerOri(fromBattler));
                }
                let ori = GameUtils.getOriByAngle(angle);
                fromBattler.avatarOri = ori;
            }
            if (blockAttackInfo && !fromBattler.avatar.hasActionID(releaseActionID)) {
                fromBattleModule.inBlockAttack = false;
            }
            if (skill.releaseAnimation) fromBattler.playAnimation(skill.releaseAnimation, false, true);
            GameBattleAction.releaseAction(fromBattler, releaseActionID, releaseFrame, 1, () => {
                this.releaseSkill(fromBattler, skill, angle, firstTarget, damagePer);
            }, releaseFPS);
        }
        EventUtils.happen(GameBattleAction, GameBattleAction.EVENT_ACTION_USE_SKILL, [fromBattler, skill, firstTarget]);
        if (skill.eventSetting && skill.releaseEvent) CommandPage.startTriggerFragmentEvent(skill.releaseEvent, fromBattler, fromBattler, Callback.New(doUseSkill, this));
        else doUseSkill.apply(this);
        return true;
    }

    private static releaseSkill(fromBattler: ProjectClientSceneObject, skill: Module_Skill, angle: number, firstTarget: ProjectClientSceneObject = null, damagePer: number = 100) {
        // ... 此函数内部代码与之前版本相同，无需改动 ...
        if (GameBattleHelper.isImpossibleBattle(fromBattler)) return;
        let targets: ProjectClientSceneObject[] = [];
        if (skill.skillReleaseType < 2) {
            targets = GameBattleHelper.getSkillTargets(fromBattler, skill, firstTarget, 1.20);
        }
        if (skill.skillType == 0) {
            for (let i = 0; i < targets.length; i++) {
                this.hitTarget(fromBattler, targets[i], 1, skill, null, null, damagePer);
            }
        } else if (skill.skillType == 1) {
            if (skill.skillReleaseType >= 2) {
                this.releaseBullet(fromBattler, skill, null, angle, damagePer);
            } else {
                for (let i = 0; i < targets.length; i++) {
                    this.releaseBullet(fromBattler, skill, targets[i], angle, damagePer);
                }
            }
        }
        EventUtils.happen(GameBattleAction, GameBattleAction.EVENT_ACTION_RELEASE_SKILL, [fromBattler, skill, angle, firstTarget, damagePer]);
    }
    
    private static releaseBullet(fromBattler: ProjectClientSceneObject, skill: Module_Skill, targetBattler: ProjectClientSceneObject = null, angle: number = null, damagePer: number = 100) {
        // ... 此函数内部代码与之前版本相同，无需改动 ...
        let bullet = new GameBullet(Game.now, fromBattler, targetBattler, skill, angle, damagePer);
        this.bullets.push(bullet);
        EventUtils.happen(GameBattleAction, GameBattleAction.EVENT_ACTION_RELEASE_BULLET_START, [fromBattler, skill, targetBattler, angle, damagePer, bullet]);
    }
    
    static hitTarget(fromBattler: ProjectClientSceneObject, targetBattler: ProjectClientSceneObject, actionType: number, skill: Module_Skill = null, item: Module_Item = null, status: Module_Status = null, damagePer: number = 100): void {
        if (actionType != 3 && GameBattleHelper.isImpossibleBattle(fromBattler)) return;
        if (GameBattleHelper.isImpossibleBattle(targetBattler)) return;

        // -- 优化：缓存战斗模块，避免在函数内重复获取
        const fromBattleModule = fromBattler?.getModule(6) as SoModule_Battler;
        const targetBattleModule = targetBattler.getModule(6) as SoModule_Battler;

        if (actionType == 1 && fromBattleModule.actor.atkSkill == skill) actionType = 0;

        const fromActor = fromBattleModule?.actor;
        const targetActor = targetBattleModule.actor;
        let isHitSuccess = true;
        let hitAniID = 0;
        let showTargetHurtAnimation = false;
        
        if (actionType <= 1) {
            let fromHit: number, targetDod: number;
            if (skill.hitType == 0) fromHit = skill.hit;
            else fromHit = fromActor.HIT;
            if (skill.dodType == 0) targetDod = 0;
            else targetDod = targetActor.DOD;
            isHitSuccess = MathUtils.rand(100) < (fromHit - targetDod);

            if (!isHitSuccess) {
                // 闪避，不做任何处理
            }
        }
        
        if (actionType == 0) {
            hitAniID = skill.hitAnimation;
            showTargetHurtAnimation = true;
        } else if (actionType == 1) {
            hitAniID = skill.hitAnimation;
            showTargetHurtAnimation = GameBattleHelper.isHostileRelationship(fromBattler, targetBattler);
        } else if (actionType == 2) {
            isHitSuccess = true;
            hitAniID = item.useAnimation;
        } else if (actionType == 3) {
            showTargetHurtAnimation = false;
        }
        
        // ... 此函数中间部分代码与之前版本相同，无需改动 ...
        if (actionType <= 1 && GameBattleHelper.isHostileRelationship(fromBattler, targetBattler) && targetBattleModule.inBlockAttack) {
            if (targetBattleModule.blockAttackMode == 1) {
                let angle = MathUtils.direction360(targetBattler.x, targetBattler.y, fromBattler.x, fromBattler.y);
                let ori = WorldData.battleOriMode == 1 ? GameUtils.getAssetOri(GameUtils.getOriByAngle(angle), Math.max(targetBattler.avatar.oriMode, 2)) : GameUtils.getOriByAngle(angle);
                let targetBattlerOri = GameBattleHelper.getBattlerOri(targetBattler);
                if (targetBattlerOri == ori) {
                    isHitSuccess = false;
                    targetBattler.playAnimation(targetBattleModule.blockAttackAnimation, false, true);
                    CommandPage.startTriggerFragmentEvent(targetBattleModule.blockAttackInfo.blockAttackEvent, fromBattler, targetBattler);
                }
            } else {
                isHitSuccess = false;
                targetBattler.playAnimation(targetBattleModule.blockAttackAnimation, false, true);
                CommandPage.startTriggerFragmentEvent(targetBattleModule.blockAttackInfo.blockAttackEvent, fromBattler, targetBattler);
            }
        }
        
        let isCanHitBy = GameBattleHelper.isCanHitBy(targetBattler, fromBattler, status);
        
        let callNextStep = () => {
            if (isCanHitBy) this.hitResult(fromBattler, targetBattler, isHitSuccess, actionType, skill, item, status, damagePer);
        }
        
        let callHitEvent = () => {
            EventUtils.happen(GameBattleAction, GameBattleAction.EVENT_ACTION_HIT_TARGET, [isHitSuccess, fromBattler, targetBattler, actionType, skill, item, status, damagePer]);
            if (actionType <= 1 && isHitSuccess && skill.eventSetting && skill.hitEvent) CommandPage.startTriggerFragmentEvent(skill.hitEvent, fromBattler, targetBattler, Callback.New(callNextStep, this));
            else if (actionType == 2 && item.callEvent) CommandPage.startTriggerFragmentEvent(item.callEvent, fromBattler, targetBattler, Callback.New(callNextStep, this));
            else callNextStep.apply(this);
        }
        
        if (isCanHitBy && showTargetHurtAnimation) {
            if (hitAniID) targetBattler.playAnimation(hitAniID, false, isHitSuccess, null, true);
            if (!targetBattleModule.duringRelease && isHitSuccess && actionType <= 1 && skill.useDamage && skill.damageType <= 2) {
                if (!GameBattleHelper.isInStiffness(targetBattler)) {
                    let hasStiffness = false;
                    let repelInfo = GameBattleHelper.getRepelValue(fromBattler, targetBattler, actionType, skill, status);
                    if (repelInfo != null) {
                        GameBattleAction.readyRepel(fromBattler, targetBattler, repelInfo.value, repelInfo.speed);
                        hasStiffness = true;
                        targetBattleModule.stiffnessDelayTime = 500;
                    }
                    if (WorldData.hitEffect) {
                        if (WorldData.hitEffectTarget == 0 || (WorldData.hitEffectTarget == 1 && !GameBattleHelper.isInPlayerParty(targetBattler)) || (WorldData.hitEffectTarget == 2 && skill.hitEffect)) {
                            if (!GameBattleHelper.isImmunityStiffness(targetBattler)) {
                                if (!hasStiffness) targetBattler.stopMove();
                                let hitAnimationEnabled = WorldData.hitEffectMode <= 1;
                                let hitActionEnabled = WorldData.hitEffectMode == 0 || WorldData.hitEffectMode == 2;
                                if (hitAnimationEnabled || hitActionEnabled) {
                                    targetBattleModule.beHiting = true;
                                    if (!hasStiffness) targetBattleModule.stiffnessDelayTime = 500;
                                }
                                if (hitAnimationEnabled) {
                                    let hitAni = targetBattler.playAnimation(WorldData.hitAnimation, false, isHitSuccess, null, true);
                                    if (hitAni) {
                                        hitAni.once(GCAnimation.PLAY_COMPLETED, this, () => {
                                            targetBattleModule.beHiting = false;
                                        });
                                    }
                                }
                                if (hitActionEnabled && targetBattler.avatar.hasActionID(10)) {
                                    GameBattleAction.releaseAction(targetBattler, 10, 999, 1, () => {
                                        targetBattleModule.beHiting = false;
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
        
        callHitEvent.apply(this);
    }
    
    static hitResult(fromBattler: ProjectClientSceneObject, targetBattler: ProjectClientSceneObject, isHitSuccess: boolean, actionType: number, skill: Module_Skill = null, item: Module_Item = null, status: Module_Status = null, damagePer: number = 100): void {
        if (actionType != 3 && GameBattleHelper.isImpossibleBattle(fromBattler)) return;
        if (GameBattleHelper.isImpossibleBattle(targetBattler)) return;

        let isCheckFromBattler = false;
        let res = GameBattleData.calculationHitResult(fromBattler, targetBattler, isHitSuccess, actionType, skill, item, status, damagePer);
        if (res) {
            if (isHitSuccess) {
                // 日志已移除，直接处理伤害显示
            }
            
            // ... 此函数后面部分代码与之前版本相同，无需改动 ...
            if (!WorldData.useCustomDamageLogic) {
                if (fromBattler == ProjectPlayer.ctrlActorSceneObject || targetBattler == ProjectPlayer.ctrlActorSceneObject) {
                    this.showDamage(targetBattler, res.damageType, res.damage, res.isCrit);
                }
                if (actionType != 2 && fromBattler) {
                    let hpValue: number = 0;
                    let suckCondition: number = null;
                    if (res.damageType >= 0 && res.damageType <= 2) suckCondition = res.damageType;
                    if (suckCondition != null) {
                        let suckHP = GameBattleHelper.getSuckPer(fromBattler, suckCondition, true);
                        if (suckHP != null) {
                            hpValue += MathUtils.int(-res.damage * suckHP * 0.01);
                        }
                        let suckSP = GameBattleHelper.getSuckPer(fromBattler, suckCondition, false);
                        if (suckSP != null) {
                            let spValue = MathUtils.int(-res.damage * suckSP * 0.01);
                            if (spValue != 0) {
                                GameBattleData.changeBattlerSP(fromBattler, spValue);
                            }
                        }
                    }
                    let damageType: number = null;
                    if (skill) damageType = skill.damageType;
                    else if (status) damageType = status.damageType;
                    if (damageType != null) {
                        let returnDmagePer = GameBattleHelper.getReturnAttackDamagePer(fromBattler, targetBattler, damageType);
                        if (returnDmagePer != null) {
                            let returnDamage = MathUtils.int(res.damage * returnDmagePer * 0.01);
                            if (returnDamage != 0) {
                                hpValue += returnDamage;
                                isCheckFromBattler = true;
                            }
                        }
                    }
                    if (hpValue != 0) {
                        GameBattleData.changeBattlerHP(fromBattler, hpValue);
                    }
                }
            }
            GameBattleData.refreshInBattleState(targetBattler, true);
            this.hitResultSpecialEffectHandle(fromBattler, targetBattler);
        }
        if (actionType == 3 && status) {
            if (status.whenOvertimeEvent) CommandPage.startTriggerFragmentEvent(status.whenOvertimeEvent, fromBattler ? fromBattler : targetBattler, targetBattler);
        }
        GameBattle.checkBattlerIsDead(targetBattler, fromBattler);
        if (isCheckFromBattler && fromBattler) GameBattle.checkBattlerIsDead(fromBattler, targetBattler);
    }
    
    private static hitResultSpecialEffectHandle(fromBattler: ProjectClientSceneObject, targetBattler: ProjectClientSceneObject): void {
        this.repel(targetBattler);
    }
    
    /**
     * -- 优化：showDamage函数已重构，使用DamageNumberManager对象池来管理UI实例
     */
    static showDamage(targetBattler: ProjectClientSceneObject, damageType: number, damage: number = 0, isCrit: boolean = false, onFin: Callback = null, forceShow: boolean = false): void {
        this.damageDisplayQueue.push({ targetBattler, damageType, damage, isCrit, onFin, forceShow });
    }

    private static processDamageDisplayQueue(): void {
        let processCount = 0;
        while (processCount < this.MAX_DAMAGE_DISPLAYS_PER_FRAME && this.damageDisplayQueue.length > 0) {
            const damageInfo = this.damageDisplayQueue.shift();
            if (damageInfo) {
                this.renderDamage(damageInfo.targetBattler, damageInfo.damageType, damageInfo.damage, damageInfo.isCrit, damageInfo.onFin, damageInfo.forceShow);
            }
            processCount++;
        }
    }

    private static renderDamage(targetBattler: ProjectClientSceneObject, damageType: number, damage: number = 0, isCrit: boolean = false, onFin: Callback = null, forceShow: boolean = false): void {
        if (!Game.currentScene || !targetBattler || targetBattler.isDisposed) {
            onFin && onFin.run();
            return;
        }
        
        const isPlayerCamp = GameBattleHelper.isPlayerCamp(targetBattler);
        if (!forceShow) {
            if (isPlayerCamp) {
                if (WorldData.showDamageType == 0 || WorldData.showDamageType == 3) {
                    onFin && onFin.run();
                    return;
                }
            } else {
                if (WorldData.showDamageType == 0 || WorldData.showDamageType == 2) {
                    onFin && onFin.run();
                    return;
                }
            }
        }
        
        let uiID: number;
        switch (damageType) {
            case -2: uiID = 0; break;
            case -1: uiID = (targetBattler.getModule(6) as SoModule_Battler).inBlockAttack ? 1047 : isPlayerCamp ? 1056 : 1041; break;
            default: uiID = (isPlayerCamp ? 1057 : 1042) + damageType; break;
        }

        if (uiID != 0) {
            // -- 优化：从对象池获取UI实例，而不是每次都创建
            const damageUI = DamageNumberManager.instance.get(uiID);

            if (!damageUI) {
                onFin && onFin.run();
                return;
            }

            // 初始化UI
            damageUI.x = targetBattler.x;
            damageUI.y = targetBattler.y;
            Game.currentScene.animationHighLayer.addChild(damageUI);

            const targetUI = damageUI["target"] || damageUI.getChildAt(0);
            if (targetUI) {
                if (damageType >= 0) {
                    let damageLabel: UIString = damageUI["damage"];
                    if (damageLabel && damageLabel instanceof UIString) {
                        damageLabel.text = (damage > 0 ? "+" : "") + damage.toFixed(2);
                    }
                }

                // -- 优化：动画实例如果可以，也建议池化，但目前仅池化UI本身
                const damageAni = new GCAnimation();
                damageAni.target = targetUI;
                damageAni.id = (isCrit ? 1049 : 1046) + MathUtils.rand(3);

                damageAni.once(GCAnimation.PLAY_COMPLETED, this, () => {
                    damageAni.dispose();
                    // -- 优化：不再销毁UI，而是将其归还到对象池
                    DamageNumberManager.instance.reclaim(damageUI);
                    onFin && onFin.run();
                });
                
                damageAni.play();
                return; // 提前返回
            } else {
                 // 如果没找到targetUI，也要回收damageUI
                DamageNumberManager.instance.reclaim(damageUI);
            }
        }
        
        onFin && onFin.run();
    }
    
    // ... 此处往后的所有代码与之前版本相同，无需改动 ...
    static battlerDeadAnimation(battler: ProjectClientSceneObject, playMode: boolean): void {
        GameBattleAction.syncTaskPlayAction(GameBattleAction.mustActionCompleteTask, battler, 7, true, playMode, 1, 1034, 1035);
    }
    
    static resuscitateAction(battler: ProjectClientSceneObject): void {
        GameBattleAction.syncTaskPlayAction(GameBattleAction.mustActionCompleteTask, battler, 1, false, false, 2, 1034, 1035);
    }
    
    static releaseAction(battler: ProjectClientSceneObject, actionID: number, releaseFrame: number, whenCompleteActionID: number, onRelease: Function, releaseFPS: number = null): void {
        let battlerModule = battler.getModule(6) as SoModule_Battler;
        battlerModule.duringRelease = true;
        let avatar = battler.avatar;
        let hasAtkAction = avatar.hasActionID(actionID);
        if (hasAtkAction) {
            let isReleaseAction = false;
            let onRender = () => {
                if (avatar.currentFrame >= releaseFrame || battlerModule.isDead) {
                    //@ts-ignore
                    avatar.off(Avatar.RENDER, avatar, arguments.callee);
                    EventUtils.happen(GameBattleAction, GameBattleAction.EVENT_ACTION_RELEASE_ACTION_OVER, [battler]);
                    onRelease && onRelease();
                    isReleaseAction = true;
                }
            }
            avatar.once(Avatar.ACTION_PLAY_COMPLETED, this, () => {
                if (battler.isDisposed) return;
                battlerModule.duringRelease = false;
                avatar.off(Avatar.RENDER, avatar, onRender);
                if (battler.avatarAct != actionID) return;
                if (!GameBattleHelper.isBattler(battler) || battlerModule.isDead) return;
                if (releaseFPS) avatar.fps = battlerModule.fpsRecord;
                battler.avatarAct = whenCompleteActionID;
                if (!isReleaseAction) {
                    EventUtils.happen(GameBattleAction, GameBattleAction.EVENT_ACTION_RELEASE_ACTION_OVER, [battler]);
                    onRelease && onRelease();
                }
                if (battler == ProjectPlayer.ctrlActorSceneObject && Browser.onMobile) {
                    Controller.clearJoy();
                }
            });
            avatar.on(Avatar.RENDER, avatar, onRender);
            avatar.currentFrame = 1;
            battler.avatarAct = actionID;
            if (releaseFPS) avatar.fps = releaseFPS;
            EventUtils.happen(GameBattleAction, GameBattleAction.EVENT_ACTION_RELEASE_ACTION_START, [battler, actionID, releaseFrame, whenCompleteActionID, releaseFPS]);
        } else {
            battlerModule.duringRelease = false;
            onRelease && onRelease();
        }
    }

    static syncTaskPlayAction(taskGroup: string, battler: ProjectClientSceneObject, actionID: number, isStopLastFrame: boolean, playMode: boolean, animationMode: number, playAnimationID: number, loopAnimationID: number): void {
        let taskName = taskGroup + "_" + battler.index;
        new SyncTask(taskName, () => {
            if (playMode) {
                let doPlayAct = () => {
                    if (!battler.isDisposed) {
                        if (battler.avatar.hasActionID(actionID)) {
                            if (isStopLastFrame) {
                                battler.autoPlayEnable = true;
                                battler.avatar.currentFrame = battler.avatar.currentFrame % battler.avatar.totalFrame;
                                let lastCurrentStatusPageIndex = battler.currentStatusPageIndex;
                                battler.avatar.once(Avatar.ACTION_PLAY_COMPLETED, this, (battler: ProjectClientSceneObject, lastCurrentStatusPageIndex: number) => {
                                    if (battler.currentStatusPageIndex == lastCurrentStatusPageIndex) {
                                        battler.avatarFrame = battler.avatar.totalFrame;
                                        battler.autoPlayEnable = false;
                                    }
                                    SyncTask.taskOver(taskName);
                                }, [battler, lastCurrentStatusPageIndex]);
                            } else {
                                battler.autoPlayEnable = true;
                            }
                            battler.avatarAct = actionID;
                            battler.avatarFrame = 1;
                            if (animationMode == 2) {
                                battler.stopAnimation(playAnimationID);
                                battler.stopAnimation(loopAnimationID);
                            }
                            if (!isStopLastFrame) {
                                SyncTask.taskOver(taskName);
                            }
                            return;
                        } else if (animationMode == 1) {
                            let actionAnimation = battler.playAnimation(playAnimationID, false, true);
                            if (loopAnimationID > 0) {
                                actionAnimation.once(GCAnimation.PLAY_COMPLETED, this, () => {
                                    battler.playAnimation(loopAnimationID, true, true);
                                    SyncTask.taskOver(taskName);
                                });
                                return;
                            }
                        }
                    }
                    if (animationMode == 2) {
                        battler.stopAnimation(playAnimationID);
                        battler.stopAnimation(loopAnimationID);
                    }
                    SyncTask.taskOver(taskName);
                }
                if (battler.avatar.isLoading) {
                    battler.avatar.once(EventObject.LOADED, this, doPlayAct);
                } else {
                    doPlayAct.apply(this);
                }
            } else {
                let doSetActionLastFrame = () => {
                    if (!battler.isDisposed) {
                        if (battler.avatar.hasActionID(actionID)) {
                            battler.avatarAct = actionID;
                            battler.avatarFrame = isStopLastFrame ? battler.avatar.totalFrame : 1;
                            battler.autoPlayEnable = isStopLastFrame ? false : true;
                        } else if (animationMode == 1) {
                            battler.playAnimation(loopAnimationID, true, true);
                        }
                        if (animationMode == 2) {
                            battler.stopAnimation(playAnimationID);
                            battler.stopAnimation(loopAnimationID);
                        }
                    }
                    SyncTask.taskOver(taskName);
                }
                if (battler.avatar.isLoading) {
                    battler.avatar.once(EventObject.LOADED, this, doSetActionLastFrame);
                } else {
                    doSetActionLastFrame.apply(this);
                }
            }
        });
    }

    static readyRepel(fromBattler: ProjectClientSceneObject, targetBattler: ProjectClientSceneObject, dis: number, speed: number): void {
        if (speed <= 0 || dis <= 0) return;
        let targetBattlerModule = targetBattler.getModule(6) as SoModule_Battler;
        targetBattlerModule.readyRepel = true;
        targetBattlerModule.readyRepelingValue = dis;
        targetBattlerModule.readyRepelingSpeed = speed;
        targetBattlerModule.readyRepelingFrom = fromBattler;
    }
    
    static repel(targetBattler: ProjectClientSceneObject): void {
        let targetBattlerModule = targetBattler.getModule(6) as SoModule_Battler;
        if (!targetBattlerModule.readyRepel || targetBattlerModule.repeling) return;
        targetBattlerModule.readyRepel = false;
        let speed = targetBattlerModule.readyRepelingSpeed;
        let dis = targetBattlerModule.readyRepelingValue;
        let fromBattler = targetBattlerModule.readyRepelingFrom;
        if (speed <= 0 || dis <= 0) return;
        targetBattlerModule.repeling = true;
        GameBattleData.refreshBattlerActionByStatus(targetBattler);
        let angle = MathUtils.direction360(fromBattler.x, fromBattler.y, targetBattler.x, targetBattler.y);
        let radian = MathUtils.angle2Radian(angle);
        let toX = Math.sin(radian) * dis + targetBattler.x;
        let toY = -Math.cos(radian) * dis + targetBattler.y;
        let movePath = [[toX, toY]];
        let oldMoveAutoChangeAction = targetBattler.moveAutoChangeAction;
        targetBattler.moveAutoChangeAction = false;
        targetBattler.moveSpeed = speed;
        let startFrame = Game.frameCount;
        let oldOri = targetBattler.avatarOri;
        let isOver = false;
        let onOver = () => {
            if (isOver) return;
            isOver = true;
            let targetBattlerModule = targetBattler.getModule(6) as SoModule_Battler;
            targetBattler.off(ProjectClientSceneObject.COLLISION, this, onOver);
            if (targetBattlerModule) {
                targetBattlerModule.repeling = false;
                targetBattler.moveAutoChangeAction = oldMoveAutoChangeAction;
                GameBattleData.refreshBattlerActionByStatus(targetBattler);
                let level = GameBattleHelper.getLevelByActor(targetBattlerModule.actor);
                Game.refreshActorAttribute(targetBattlerModule.actor, level, targetBattler);
                if (startFrame == Game.frameCount) {
                    Callback.CallLaterBeforeRender(() => {
                        targetBattler.stopMove(true);
                        targetBattler.avatarOri = oldOri;
                    }, this)
                }
            }
        }
        targetBattler.once(ProjectClientSceneObject.COLLISION, this, onOver);
        targetBattler.startMove(movePath, 0, false, Callback.New(onOver, this));
        let overFrame = Math.floor((dis / speed + 0.5) * 60);
        ProjectUtils.waitFrameStartExecute(overFrame, onOver, this);
    }
    
    static sprint(fromBattler: ProjectClientSceneObject, skill: Module_Skill): boolean {
        let sprintInfo = GameBattleHelper.getSprintValue(skill);
        if (sprintInfo) {
            let fromBattlerModule = fromBattler.getModule(6) as SoModule_Battler;
            fromBattlerModule.inSprint = true;
            let ori = GameBattleHelper.getBattlerOri(fromBattler);
            let angle = GameUtils.getAngleByOri(ori);
            let radian = MathUtils.angle2Radian(angle);
            let toX = Math.sin(radian) * sprintInfo.value + fromBattler.x;
            let toY = -Math.cos(radian) * sprintInfo.value + fromBattler.y;
            let movePath = [[toX, toY]];
            let oldMoveAutoChangeAction = fromBattler.moveAutoChangeAction;
            fromBattler.moveAutoChangeAction = false;
            fromBattler.moveSpeed = sprintInfo.speed;
            let isOver = false;
            let onOver = () => {
                if (isOver) return;
                isOver = true;
                let fromBattlerModule = fromBattler.getModule(6) as SoModule_Battler;
                fromBattler.off(ProjectClientSceneObject.COLLISION, this, onOver);
                if (fromBattlerModule) {
                    fromBattlerModule.inSprint = false;
                    fromBattler.moveAutoChangeAction = oldMoveAutoChangeAction;
                    GameBattleData.refreshBattlerActionByStatus(fromBattler);
                    let level = GameBattleHelper.getLevelByActor(fromBattlerModule.actor);
                    Game.refreshActorAttribute(fromBattlerModule.actor, level, fromBattler);
                }
            }
            fromBattler.once(ProjectClientSceneObject.COLLISION, this, onOver);
            fromBattler.startMove(movePath, 0, false, Callback.New(onOver, this));
            let overFrame = Math.floor((sprintInfo.value / sprintInfo.speed + 0.5) * 60);
            ProjectUtils.waitFrameStartExecute(overFrame, onOver, this);
            return true;
        }
        return false;
    }
    
    static blockAttack(fromBattler: ProjectClientSceneObject, skill: Module_Skill): { blockAttackAnimation: number, blockAttackMode: number, blockAttackEvent: string } {
        let blockAttackInfo = GameBattleHelper.getBlockAttackValue(skill);
        if (blockAttackInfo) {
            let fromBattlerModule = fromBattler.getModule(6) as SoModule_Battler;
            fromBattlerModule.inBlockAttack = true;
            fromBattlerModule.blockAttackMode = blockAttackInfo.blockAttackMode;
            fromBattlerModule.blockAttackAnimation = blockAttackInfo.blockAttackAnimation;
            fromBattler.avatar.once(Avatar.ACTION_PLAY_COMPLETED, this, () => {
                fromBattlerModule.inBlockAttack = false;
            });
            return blockAttackInfo;
        }
        return null;
    }
    
    private static update() {
        if (Game.pause) return;
        let now = Game.now;
        this.processDamageDisplayQueue();
        this.updateBullets(now);
    }
    
    private static updateBullets(now: number): void {
        for (let i = 0; i < this.bullets.length; i++) {
            let bullet = this.bullets[i];
            let bulletState = bullet.update(now);
            if (bulletState.isHit) {
                for (let s in bulletState.targets) {
                    let target = bulletState.targets[s];
                    EventUtils.happen(GameBattleAction, GameBattleAction.EVENT_ACTION_RELEASE_BULLET_OVER, [bullet, target]);
                    this.hitTarget(bullet.from, target, 1, bullet.skill, null, null, bullet.damagePer);
                }
            }
            if (bulletState.isOver) {
                this.bullets.splice(i, 1);
                i--;
            }
        }
    }
}
