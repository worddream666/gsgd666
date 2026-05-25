/**
 * 战斗相关辅助计算类
 * Created by 黑暗之神KDS on 2021-01-14 13:52:47.
 */
class GameBattleHelper {
    //------------------------------------------------------------------------------------------------------
    // 获取
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取等级根据角色数据
     * 因为战斗者区分玩家拥有的角色和非玩家拥有的角色，储存等级的地方不一样
     * @param actor 角色数据 
     * @return [number] 等级
     */
    static getLevelByActor(actor: Module_Actor): number {
        // -- 如果是玩家拥有的角色时则从玩家队伍的该角色中获取等级
        let playerActorDS: DataStructure_inPartyActor = ArrayUtils.matchAttributes(Game.player.data.party, { actor: actor }, true)[0];
        if (playerActorDS) {
            return playerActorDS.lv;
        }
        let battler = this.getBattlerByActor(actor);
        if (battler) return (battler.getModule(6) as SoModule_Battler).level;
        return 1;
    }
    /**
     * 获取所有战斗者
     * @return [ProjectClientSceneObject] 
     */
    static get allBattlers(): ProjectClientSceneObject[] {
        let arr = [];
        for (let i = 0; i < Game.currentScene.sceneObjects.length; i++) {
            let so = Game.currentScene.sceneObjects[i];
            if (GameBattleHelper.isBattler(so)) {
                arr.push(so);
            }
        }
        return arr;
    }
    /**
     * 获取指定战斗者，根据角色数据
     * @param actor 角色数据
     */
    static getBattlerByActor(actor: Module_Actor): ProjectClientSceneObject {
        for (let i = 0; i < Game.currentScene.sceneObjects.length; i++) {
            let so = Game.currentScene.sceneObjects[i];
            if (so) {
                let battleModule = so.getModule(6) as SoModule_Battler;
                if (battleModule && battleModule.actor == actor) {
                    return so;
                }
            }
        }
        return null;
    }
    /**
     * 获取战斗者朝向
     * @param battler 
     * @returns 
     */
    static getBattlerOri(battler: ProjectClientSceneObject): number {
        return WorldData.battleOriMode == 1 ? GameUtils.getAssetOri(battler.avatarOri, Math.max(battler.avatar.oriMode, 2)) : battler.avatarOri;
    }
    //------------------------------------------------------------------------------------------------------
    // 判定
    //------------------------------------------------------------------------------------------------------
    /**
     * 是否战斗者
     * @param so 场景对象
     * @return [boolean]  
     */
    static isBattler(so: ProjectClientSceneObject): boolean {
        if (!so) return false;
        let battleModule = so.getModule(6) as SoModule_Battler;
        return battleModule && battleModule.actor != null;
    }
    /**
     * 是否玩家阵营
     * @param so 场景对象
     * @return [boolean] 
     */
    static isPlayerCamp(so: ProjectClientSceneObject): boolean {
        if (!so) return false;
        return this.isBattler(so) && ((so.getModule(6) as SoModule_Battler).camp == 1 || (so.getModule(6) as SoModule_Battler).camp == -1);
    }
    /**
     * 是否敌对阵营
     * @param so 场景对象
     * @return [boolean] 
     */
    static isEnemyCamp(so: ProjectClientSceneObject): boolean {
        if (!so) return false;
        let battleModule = so.getModule(6) as SoModule_Battler;
        return this.isBattler(so) && battleModule.camp == 0 && battleModule.inPartyIndex < 0;
    }
    /**
     * 是否属于玩家队伍
     * @param so 场景对象
     * @return [boolean] 
     */
    static isInPlayerParty(so: ProjectClientSceneObject): boolean {
        if (!so) return false;
        let battleModule = so.getModule(6) as SoModule_Battler;
        return this.isPlayerCamp(so) && ProjectPlayer.getPlayerActorIndexByActor(battleModule.actor) >= 0;
    }
    /**
     * 两个战斗者之间是否队友关系
     * @param so1 战斗者1
     * @param so2 战斗者2
     * @return [boolean] 
     */
    static isFriendlyRelationship(so1: ProjectClientSceneObject, so2: ProjectClientSceneObject): boolean {
        if (!so1 || !so2) return false;
        let battleModule1 = so1.getModule(6) as SoModule_Battler;
        let battleModule2 = so2.getModule(6) as SoModule_Battler;
        return this.isBattler(so1) && this.isBattler(so2) && battleModule1.camp == battleModule2.camp;
    }
    /**
     * 两个战斗者之间是否敌对关系
     * @param so1 战斗者1
     * @param so2 战斗者2
     * @return [boolean] 
     */
    static isHostileRelationship(so1: ProjectClientSceneObject, so2: ProjectClientSceneObject): boolean {
        if (!so1 || !so2) return false;
        let battleModule1 = so1.getModule(6) as SoModule_Battler;
        let battleModule2 = so2.getModule(6) as SoModule_Battler;
        return this.isBattler(so1) && this.isBattler(so2) && ((battleModule1.camp == 0 && battleModule2.camp != 0) || (battleModule1.camp != 0 && battleModule2.camp == 0));
    }
    /**
     * 指定对象是否处于硬直中
     * @param so 对象
     * @return [boolean] 
     */
    static isInStiffness(so: ProjectClientSceneObject): boolean {
        if (!so) return false;
        let battleModule = so.getModule(6) as SoModule_Battler;
        if (battleModule.repeling || battleModule.beHiting || battleModule.inSprint || battleModule.inBlockAttack) {
            return true;
        }
        return false;
    }
    /**
     * 指定对象是否已无法战斗
     * @param so 检查目标
     * @return [boolean] 
     */
    static isImpossibleBattle(so: ProjectClientSceneObject): boolean {
        if (!so || so.isDisposed) return true;
        if (!GameBattleHelper.isBattler(so)) return true;
        let battleModule = so.getModule(6) as SoModule_Battler;
        return battleModule.isDead;
    }
    //------------------------------------------------------------------------------------------------------
    // 技能
    //------------------------------------------------------------------------------------------------------
    /**
     * 是否是作用敌人的技能
     * @param skill 技能
     * @return [boolean] 
     */
    static isHostileSkill(skill: Module_Skill): boolean {
        return skill.skillType <= 1 && (skill.targetType == 2 || skill.targetType == 4 || skill.targetType == 6);
    }
    /**
     * 是否是作用我方的技能
     * @param skill 技能
     * @return [boolean] 
     */
    static isFriendlySkill(skill: Module_Skill): boolean {
        return skill.skillType <= 1 && !this.isHostileSkill(skill);
    }
    /**
     * 获取主动技能
     * @return [Module_Skill] 
     */
    static getActiveSkills(actor: Module_Actor): Module_Skill[] {
        let skills = [];
        for (let i = 0; i < actor.skills.length; i++) {
            let skill = actor.skills[i];
            if (!skill || skill.skillType != 2) {
                skills.push(skill);
            }
        }
        return skills;
    }
    //------------------------------------------------------------------------------------------------------
    // 状态
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取战斗者的状态
     * @param battler 战斗者
     * @param statusID 状态编号
     * @return [boolean] 
     */
    static getBattlerStatus(battler: ProjectClientSceneObject, statusID: number): Module_Status {
        let battleModule = battler.getModule(6) as SoModule_Battler;
        if (!battleModule) return null;
        return ArrayUtils.matchAttributes(battleModule.actor.status, { id: statusID }, true)[0];
    }
    /**
     * 检查战斗者是否包含指定的状态
     * @param battler 战斗者
     * @param statusID 状态编号
     * @return [boolean] 
     */
    static isIncludeStatus(battler: ProjectClientSceneObject, statusID: number): boolean {
        let battleModule = battler.getModule(6) as SoModule_Battler;
        if (!battleModule) return false;
        return ArrayUtils.matchAttributes(battleModule.actor.status, { id: statusID }, true).length == 1;
    }
    /**
     * 检查战斗者是否允许叠加状态，如果已拥有且最大层的话则不允许
     * @param battler 战斗者
     * @param statusID 状态编号
     * @return [boolean] 
     */
    static canSuperpositionLayer(battler: ProjectClientSceneObject, statusID: number): boolean {
        let battleModule = battler.getModule(6) as SoModule_Battler;
        if (!battleModule) return false;
        let status: Module_Status = ArrayUtils.matchAttributes(battleModule.actor.status, { id: statusID }, true)[0];
        if (status && status.currentLayer >= status.maxlayer) return false;
        return true;
    }
    //------------------------------------------------------------------------------------------------------
    // 是否允许行动
    //------------------------------------------------------------------------------------------------------
    /**
     * 是否允许移动
     * @param battler 战斗者
     * @return [boolean] 
     */
    static canMove(battler: ProjectClientSceneObject): boolean {
        // 非战斗者不允许
        if (!GameBattleHelper.isBattler(battler)) return battler?.moveSpeed > 0;
        let battleModule = battler.getModule(6) as SoModule_Battler;
        // 死亡的话则不允许
        if (battleModule.isDead) return false;
        // 释放中不允许移动
        if (battleModule.duringRelease) return false;
        // 移动速度不足不允许移动
        if (battler.moveSpeed <= 0) return false;
        // 处于硬直中不允许
        if (GameBattleHelper.isInStiffness(battler)) return false;
        // 存在无法移动的状态则不允许
        return ArrayUtils.matchAttributes(battleModule.actor.status, { cantMove: true }, true).length == 0;
    }
    /**
     * 是否允许使用技能
     * @param battler 战斗者
     * @return [boolean] 
     */
    static canUseSkill(battler: ProjectClientSceneObject, isAtkSkill: boolean): boolean {
        // 非战斗者不允许
        if (!GameBattleHelper.isBattler(battler)) return false;
        let battleModule = battler.getModule(6) as SoModule_Battler;
        // 已死亡的话则不允许
        if (battleModule.isDead) return false;
        // 释放中不允许使用技能
        if (battleModule.duringRelease) return false;
        // 处于硬直中不允许
        if (GameBattleHelper.isInStiffness(battler)) return false;
        // 存在使用技能的状态则不允许
        if (!isAtkSkill && ArrayUtils.matchAttributes(battleModule.actor.status, { cantUseSkill: true }, true).length == 1) return false;
        else if (isAtkSkill && ArrayUtils.matchAttributes(battleModule.actor.status, { cantAtk: true }, true).length == 1) return false;
        return true;
    }
    /**
     * 是否允许使用技能
     * @param battler 战斗者
     * @param skill 技能
     * @param checkUseSkillCommconCondition [可选] 默认值=true 检查使用技能的通用条件
     * @param recordTargets [可选] 默认值=null 记录目标
     * @param firstTarget [可选] 默认值=null 优先参考目标
     * @return [boolean] 
     */
    static canUseOneSkill(battler: ProjectClientSceneObject, skill: Module_Skill, checkUseSkillCommconCondition: boolean = true, recordTargets: ProjectClientSceneObject[] = null, firstTarget: ProjectClientSceneObject = null): boolean {
        // 非战斗者不允许
        if (!GameBattleHelper.isBattler(battler)) return false;
        let battleModule = battler.getModule(6) as SoModule_Battler;
        // 检查通用技能条件
        let isAtkSkill = skill == battleModule.actor.atkSkill;
        if (checkUseSkillCommconCondition) {
            if (!this.canUseSkill(battler, isAtkSkill)) return false;
        }
        // 未检查通用技能条件的话需要单独判断硬直
        else if (GameBattleHelper.isInStiffness(battler)) {
            return false;
        }
        // 被动技能不允许
        if (skill.skillType == 2) return false;
        // 使用条件
        if ((battleModule.inBattle && skill.useCondition == 2) || (!battleModule.inBattle && skill.useCondition == 1)) return false;
        if (skill.useCondition == 3 && !GameBattleHelper.getBattlerStatus(battler, skill.conditionStatus)) return false;
        // 技能未冷却、不足的消耗情况不允许使用
        if (!this.isSkillCooled(skill) || skill.costSP > battleModule.actor.sp || skill.costHP >= battleModule.actor.hp) return false;
        return true;
    }
    /**
     * 技能是否已冷却
     * @param skill 
     * @return [boolean] 
     */
    static isSkillCooled(skill: Module_Skill): boolean {
        if (skill.currentCD == 0) return true;
        return Game.now - skill.currentCD >= skill.totalCD * 1000;
    }
    /**
     * 状态是否超时
     * @param status 
     * @return [boolean] 
     */
    static isStatusOverTime(status: Module_Status): boolean {
        if (status.totalDuration == 0 || status.currentDuration == 0) return false;
        return Game.now - status.currentDuration >= status.totalDuration * 1000;
    }
    /**
     * 是否允许自动播放动作
     * @param battler 战斗者 
     * @param ignoreAutoPlayEnable 忽略已处于autoPlayEnable状态
     */
    static canAutoPlayAvatarAction(battler: ProjectClientSceneObject, ignoreAutoPlayEnable: boolean = false): boolean {
        // 本身未开启播放的话则不允许播放
        if (!ignoreAutoPlayEnable && !battler.autoPlayEnable) return false;
        if (GameBattleHelper.isBattler(battler)) {
            let battleModule = battler.getModule(6) as SoModule_Battler;
            // 战斗者已死亡的话不允许
            if (battleModule.isDead) return false;
            // 存在无法自动播放动作的状态则不允许
            return ArrayUtils.matchAttributes(battleModule.actor.status, { cantAutoPlay: true }, true).length == 0;
        }
        return true;
    }
    /**
     * 是否允许更改朝向
     * @param battler 战斗者 
     * @param ignoreFixOri 忽略已处于fixOri状态
     * @return [boolean] 
     */
    static canChangeOri(battler: ProjectClientSceneObject, ignoreFixOri: boolean = false): boolean {
        if (!ignoreFixOri && battler.fixOri) return false;
        if (GameBattleHelper.isBattler(battler)) {
            let battleModule = battler.getModule(6) as SoModule_Battler;
            // 战斗者已死亡的话不允许
            if (battleModule.isDead) return false;
            // 存在禁止更改朝向的状态时则不允许
            return ArrayUtils.matchAttributes(battleModule.actor.status, { cantChangeOri: true }, true).length == 0;
        }
        return true;
    }
    /**
     * 是否允许作为目标
     * @return [boolean] 
     */
    static isCanHitBy(targetBattler: ProjectClientSceneObject, fromBattler: ProjectClientSceneObject, fromStatus: Module_Status = null): boolean {
        // 非战斗着不允许
        if (!GameBattleHelper.isBattler(targetBattler)) return false;
        let targetBattleModule = targetBattler.getModule(6) as SoModule_Battler;
        // 目标已死亡的情况
        if (targetBattleModule.isDead) {
            return false;
        }
        // 同阵营的话直接允许
        if ((fromBattler && GameBattleHelper.isFriendlyRelationship(targetBattler, fromBattler)) ||
            (fromStatus && fromStatus.flushIsFriendlyRelationship)) {
            return true;
        }
        // 无法被击中的情况
        if (ArrayUtils.matchAttributes(targetBattleModule.actor.status, { cantBeHit: true }, true).length == 1) {
            return false;
        }
        // 其他情况：允许
        return true;
    }
    //------------------------------------------------------------------------------------------------------
    // 获取战斗者
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取技能作用目标
     * @param battler 战斗者 
     * @param skill 技能
     * @param firstTarget 优先参考目标
     * @param disPer 距离比例（如果存在则乘上该比例，比如在发出攻击后允许更长一些的距离）
     * @return [ProjectClientSceneObject] 
     */
    static getSkillTargets(battler: ProjectClientSceneObject, skill: Module_Skill, firstTarget: ProjectClientSceneObject = null, disPer: number = null): ProjectClientSceneObject[] {
        // 自己的情况则返回自己
        if (skill.targetType == 0) {
            if (this.isCanHitBy(battler, battler)) {
                return [battler];
            }
            else {
                return [];
            }
        }
        // 不在场景上
        if (!Game.currentScene) return [];
        // 指向前方方向的技能
        if (skill.skillReleaseType >= 2) return [];
        // 获取使用者的坐标点
        let battlePoint = new Point(battler.x, battler.y);
        // 获取使用者的扫描角度
        let userScanningAngleRange = this.getScanningAngleRange(battler, skill.scanAngle);
        // 遍历战斗者
        let targets: ProjectClientSceneObject[] = [];
        // -- 我方周围目标默认包含自己
        if (skill.skillReleaseType == 1 && (skill.targetType == 1 || skill.targetType == 3 || skill.targetType == 5)) {
            if (this.isCanHitBy(battler, battler)) {
                targets.push(battler);
            }
            // 单体的情况：已完成
            if (skill.targetType == 1 && targets.length == 1) return targets;
        }
        let sceneObjects = Game.currentScene.sceneObjects;
        let soLen = Game.currentScene.sceneObjects.length;
        for (let i = 0; i < soLen; i++) {
            let target: ProjectClientSceneObject = sceneObjects[i] as any;
            // 忽略不存在的目标或非战斗者
            if (!this.isBattler(target)) continue;
            let targetBattleModule = target.getModule(6) as SoModule_Battler;
            // 忽略死亡目标
            if (targetBattleModule.isDead) continue;
            // 忽略计算自己
            if (target == battler) continue;
            // 无法被作用为目标
            if (!this.isCanHitBy(target, battler)) continue;
            // 目标群体：根据技能类别列举可作用的目标：我方或敌方
            if ((this.isHostileSkill(skill) && GameBattleHelper.isHostileRelationship(battler, target)) ||
                (!this.isHostileSkill(skill) && GameBattleHelper.isFriendlyRelationship(battler, target))) {
                // 距离以外的不计算在内
                let targetPoint = new Point(target.x, target.y);
                let dis = Point.distance(battlePoint, targetPoint);
                let skillDistance = skill.distance;
                if (disPer != null) skillDistance *= disPer;
                if (skillDistance < dis) continue;
                // 作用类型-锥形区域/周围一圈内区域
                if ((skill.skillReleaseType == 0 && this.isInScanningAngleRange(target, battlePoint, userScanningAngleRange)) ||
                    skill.skillReleaseType == 1) {
                    targets.push(target);
                }
            }
        }
        // 如果非全体技能需要减少目标，根据距离远近剔除掉
        if (!(skill.targetType == 3 || skill.targetType == 4)) {
            let targetNum = MathUtils.int((skill.targetType == 5 || skill.targetType == 6) ? skill.targetNum : 1);
            targets.sort((target1: ProjectClientSceneObject, target2: ProjectClientSceneObject) => {
                let dis1 = Point.distanceSquare2(battler.x, battler.y, target1.x, target1.y);
                let dis2 = Point.distanceSquare2(battler.x, battler.y, target2.x, target2.y);
                return dis1 < dis2 ? -1 : 1;
            });
            // 如果有首选目标的话则优先排到前面
            if (firstTarget) {
                let idx = targets.indexOf(firstTarget);
                if (idx != -1) {
                    targets.splice(idx, 1);
                    targets.unshift(firstTarget);
                }
            }
            if (targets.length > targetNum) targets.length = targetNum;
        }
        return targets;
    }
    /**
     * 获取角色的扫描角度范围（扇形角度）
     * @param so 场景对象
     * @param range [可选] 默认值=90 扇形角度
     * @return 起始角度和终点角度（0~360度欧拉角）
     */
    static getScanningAngleRange(so: ProjectClientSceneObject, rangeAngle: number): { start: number, end: number } {
        let dir = GameBattleHelper.getBattlerOri(so);
        let angle = GameUtils.getAngleByOri(dir);
        return { start: angle - rangeAngle / 2, end: angle + rangeAngle / 2 };
    }
    /**
     * 判断目标是否在扫描范围内
     * @param target 目标对象
     * @param scanningPoint 扫描中心点
     * @param scanningRange 扫描角度范围（起点-终点，从左向右计算，end角度必须大于start角度） 
     * @return [boolean] 
     */
    static isInScanningAngleRange(target: ProjectClientSceneObject, scanningPoint: Point, scanningRange: { start: number, end: number }): boolean {
        let targetAngle = MathUtils.direction360(scanningPoint.x, scanningPoint.y, target.x, target.y);
        return MathUtils.inAngleRange(scanningRange.end, scanningRange.start, targetAngle);
    }
    //------------------------------------------------------------------------------------------------------
    // 算法
    //------------------------------------------------------------------------------------------------------
    /**
    * 两个战斗者之间的距离是否低于指定的距离
    * @param battler1 战斗者1
    * @param battler2 战斗者2
    */
    static isTwoBattlerInRange(battler1: ProjectClientSceneObject, battler2: ProjectClientSceneObject, distance: number) {
        return Point.distanceSquare2(battler1.x, battler1.y, battler2.x, battler2.y) <= Math.pow(distance, 2);
    }
    //------------------------------------------------------------------------------------------------------
    //  特殊效果
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取战斗者的反伤信息（遭受近战攻击后的反伤）
     * @param fromBattler 攻击者
     * @param targetBattler 受击者
     * @param damageType 伤害类别 0-物理伤害 1-魔法伤害 2-真实伤害
     * @return [number] 反伤百分比（对比自己的普通攻击伤害） null=无反伤
     */
    static getReturnAttackDamagePer(fromBattler: ProjectClientSceneObject, targetBattler: ProjectClientSceneObject, damageType: number): number {
        let fromBattleModule = fromBattler.getModule(6) as SoModule_Battler;
        let fromBattleSkill = fromBattleModule.actor.skills.concat(fromBattleModule.actor.atkSkill);
        let fromBattleClass: Module_Class = GameData.getModuleData(7, fromBattleModule.actor.class);
        // -- 攻击者拥有免疫反伤的能力时不会遭受反伤
        if (fromBattleModule.actor.specialAbility) {
            if (ArrayUtils.matchAttributes(fromBattleModule.actor.specialBattleEffect, { type: 1, reflectCondition: 0 }, true).length == 1 ||
                ArrayUtils.matchAttributes(fromBattleModule.actor.specialBattleEffect, { type: 1, reflectCondition: damageType + 1 }, true).length == 1) {
                return null;
            }
        }
        if (fromBattleClass.specialAbility) {
            if (ArrayUtils.matchAttributes(fromBattleClass.specialBattleEffect, { type: 1, reflectCondition: 0 }, true).length == 1 ||
                ArrayUtils.matchAttributes(fromBattleClass.specialBattleEffect, { type: 1, reflectCondition: damageType + 1 }, true).length == 1) {
                return null;
            }
        }
        for (let i = 0; i < fromBattleSkill.length; i++) {
            let skill = fromBattleSkill[i];
            if (skill && skill.specialAbility) {
                // -- 拥有全伤害免疫反弹或对应伤害免疫
                if (ArrayUtils.matchAttributes(skill.specialBattleEffect, { type: 1, reflectCondition: 0 }, true).length == 1 ||
                    ArrayUtils.matchAttributes(skill.specialBattleEffect, { type: 1, reflectCondition: damageType + 1 }, true).length == 1) {
                    return null;
                }
            }
        }
        for (let i = 0; i < fromBattleModule.actor.status.length; i++) {
            let status = fromBattleModule.actor.status[i];
            if (status.specialAbility) {
                // -- 拥有全伤害免疫反弹或对应伤害免疫
                if (ArrayUtils.matchAttributes(status.specialBattleEffect, { type: 1, reflectCondition: 0 }, true).length == 1 ||
                    ArrayUtils.matchAttributes(status.specialBattleEffect, { type: 1, reflectCondition: damageType + 1 }, true).length == 1) {
                    return null;
                }
            }
        }
        for (let i = 0; i < fromBattleModule.actor.equips.length; i++) {
            let equip = fromBattleModule.actor.equips[i];
            if (equip.specialAbility) {
                // -- 拥有全伤害免疫反弹或对应伤害免疫
                if (ArrayUtils.matchAttributes(equip.specialBattleEffect, { type: 1, reflectCondition: 0 }, true).length == 1 ||
                    ArrayUtils.matchAttributes(equip.specialBattleEffect, { type: 1, reflectCondition: damageType + 1 }, true).length == 1) {
                    return null;
                }
            }
        }
        // -- 尝试触发反伤（根据伤害高低排序后逐一尝试触发）
        let specialBattleEffects: DataStructure_specialBattleEffect[] = this.getSpecialBattleEffects(targetBattler, 0);
        if (specialBattleEffects.length == 0) {
            return null;
        }
        // -- 按照反弹伤害百分比排序，找到其中一个进行反弹（允许叠加）
        specialBattleEffects.sort((a, b) => { return a.returnDamagePer > b.returnDamagePer ? -1 : 1 });
        let returnDamagePer = 0;
        for (let i = 0; i < specialBattleEffects.length; i++) {
            let effect = specialBattleEffects[i];
            // -- 伤害类别不匹配的话忽略
            if (effect.reflectCondition != 0 && effect.reflectCondition != damageType + 1) continue;
            if (MathUtils.rand(100) < effect.returnPer) {
                returnDamagePer += effect.returnDamagePer
            }
        }
        return returnDamagePer == 0 ? null : returnDamagePer;
    }
    /**
     * 获取吸血百分比
     * @param fromBattler 战斗者
     * @param suckCondition 限定类别 0-物理伤害 1-魔法伤害 2-真实伤害
     * @param isHP 是否生命值，否则就是魔法值
     * @return [number] 
     */
    static getSuckPer(fromBattler: ProjectClientSceneObject, suckCondition: number, isHP: boolean): number {
        let type = isHP ? 2 : 3;
        let specialBattleEffects: DataStructure_specialBattleEffect[] = this.getSpecialBattleEffects(fromBattler, type);
        specialBattleEffects = ArrayUtils.matchAttributes(specialBattleEffects, { suckCondition: suckCondition }, false);
        if (specialBattleEffects.length == 0) return null;
        let suckPer = 0;
        for (let i = 0; i < specialBattleEffects.length; i++) {
            suckPer += specialBattleEffects[i].suckPer;
        }
        return suckPer;
    }
    /**
     * 获取伤害加成数值
     * @param fromBattler 战斗者
     * @param suckCondition 限定类别 0-物理伤害 1-魔法伤害 2-真实伤害
     */
    static getDamagePer(fromBattler: ProjectClientSceneObject, damageType: number): number {
        let specialBattleEffects: DataStructure_specialBattleEffect[] = this.getSpecialBattleEffects(fromBattler, 4);
        let damagePer = 100;
        for (let i = 0; i < specialBattleEffects.length; i++) {
            let effect = specialBattleEffects[i];
            // -- 非对应伤害类别的话忽略掉
            if (effect.reflectCondition != 0 && effect.reflectCondition != damageType + 1) continue;
            damagePer *= effect.damagePer * 0.01;
        }
        return damagePer;
    }
    /**
     * 获取减少伤害数值
     * @param fromBattler 战斗者
     * @param suckCondition 限定类别 0-物理伤害 1-魔法伤害 2-真实伤害
     */
    static getStrikePer(fromBattler: ProjectClientSceneObject, damageType: number): number {
        let specialBattleEffects: DataStructure_specialBattleEffect[] = this.getSpecialBattleEffects(fromBattler, 5);
        let strikePer = 100;
        for (let i = 0; i < specialBattleEffects.length; i++) {
            let effect = specialBattleEffects[i];
            // -- 非对应伤害类别的话忽略掉
            if (effect.reflectCondition != 0 && effect.reflectCondition != damageType + 1) continue;
            strikePer *= effect.strikePer * 0.01;
        }
        return strikePer;
    }
    /**
     * 元素伤害有效度
     * @param fromBattler 来自战斗者
     * @param elementType 元素类别
     * @return [number] 
     */
    static getElementEffectivenessPer(fromBattler: ProjectClientSceneObject, elementType: number): number {
        let specialBattleEffects: DataStructure_specialBattleEffect[] = this.getSpecialBattleEffects(fromBattler, 6);
        let v = 100;
        for (let i = 0; i < specialBattleEffects.length; i++) {
            if (specialBattleEffects[i].elementType == elementType) {
                v *= specialBattleEffects[i].effectiveness * 0.01;
            }
        }
        return v;
    }
    /**
     * 击退效果
     * @param fromBattler 攻击者
     * @param targetBattler 受击者
     * @param actionType 0-普通攻击 1-使用技能 2-使用道具 3-状态
     * @param skill [可选] 默认值=null 使用的技能
     * @param status [可选] 默认值=null 使用的状态
     * @return 
     */
    static getRepelValue(fromBattler: ProjectClientSceneObject, targetBattler: ProjectClientSceneObject, actionType: number, skill: Module_Skill = null, status: Module_Status = null): {
        speed: number, value: number
    } {
        let targetBattleModule = targetBattler.getModule(6) as SoModule_Battler;
        // 目标拥有免疫击退或免疫硬直时不会遭受击退
        if (this.getSpecialBattleEffects(targetBattler, 8).length > 0 || this.getSpecialBattleEffects(targetBattler, 9).length > 0) {
            return null;
        }
        let specialBattleEffects: DataStructure_specialBattleEffect[];
        // 普通攻击击退的情况
        if (actionType == 0) {
            specialBattleEffects = this.getSpecialBattleEffects(fromBattler, 7);
        }
        // 当前技能
        else if (actionType == 1) {
            specialBattleEffects = this.getSpecialBattleEffectsByOneElement(skill, 7);
        }
        // 当前状态
        else if (actionType == 3) {
            specialBattleEffects = this.getSpecialBattleEffectsByOneElement(status, 7);
        }
        else return null;
        specialBattleEffects.sort((a: DataStructure_specialBattleEffect, b: DataStructure_specialBattleEffect) => {
            return a.repelValue > b.repelValue ? -1 : 1;
        });
        if (specialBattleEffects.length == 0) return null;
        for (let i = 0; i < specialBattleEffects.length; i++) {
            let effect = specialBattleEffects[i];
            // -- 不匹配的条件忽略掉
            if (actionType == 0 && effect.repelCondition != 0) continue;
            if (actionType != 0 && effect.repelCondition == 0) continue;
            // -- 伤害类别不匹配的话忽略
            if (MathUtils.rand(100) < effect.repelPer) {
                return { speed: effect.repelSpeed, value: effect.repelValue }
            }
        }
        return null;//specialBattleEffects[0].repelValue;
    }
    /**
     * 是否免疫硬直
     */
    static isImmunityStiffness(targetBattler: ProjectClientSceneObject): boolean {
        return this.getSpecialBattleEffects(targetBattler, 9).length > 0;
    }
    /**
     * 冲刺效果
     * @param fromBattler 攻击者
     * @param skill 技能
     * @return 
     */
    static getSprintValue(skill: Module_Skill): {
        speed: number, value: number
    } {
        if (!skill.specialAbility) return null;
        let specialBattleEffect = ArrayUtils.matchAttributes(skill.specialBattleEffect, { type: 10 }, true)[0];
        if (!specialBattleEffect) return null;
        return { speed: specialBattleEffect.sprintSpeed, value: specialBattleEffect.sprintDistance }
    }
    /**
     * 格挡效果
     * @param fromBattler 攻击者
     * @param skill 技能
     * @return 
     */
    static getBlockAttackValue(skill: Module_Skill): { blockAttackAnimation: number, blockAttackMode: number, blockAttackEvent: string } {
        if (!skill.specialAbility) return null;
        let specialBattleEffect: DataStructure_specialBattleEffect = ArrayUtils.matchAttributes(skill.specialBattleEffect, { type: 11 }, true)[0];
        if (!specialBattleEffect) return null;
        return { blockAttackAnimation: specialBattleEffect.blockAttackAnimation, blockAttackMode: specialBattleEffect.blockAttackMode, blockAttackEvent: specialBattleEffect.blockAttackEvent };
    }
    /**
     * 获取指定类型的特殊效果集合，根据战斗者拥有的技能和状态集内附带的特殊效果
     * @param battler 战斗者
     * @param specialType 类别
     */
    private static getSpecialBattleEffects(battler: ProjectClientSceneObject, specialType: number, fromBattleClass: Module_Class = null, fromBattleActor: Module_Actor = null): DataStructure_specialBattleEffect[] {
        let battleModule = battler.getModule(6) as SoModule_Battler;
        if (!fromBattleActor) fromBattleActor = battleModule.actor;
        if (!fromBattleClass) fromBattleClass = GameData.getModuleData(7, fromBattleActor.class);
        let specialBattleEffects: DataStructure_specialBattleEffect[] = [];
        // actor
        if (fromBattleActor && fromBattleActor.specialAbility) {
            specialBattleEffects = specialBattleEffects.concat(ArrayUtils.matchAttributes(fromBattleActor.specialBattleEffect, { type: specialType }, false));
        }
        // class
        if (fromBattleClass && fromBattleClass.specialAbility) {
            specialBattleEffects = specialBattleEffects.concat(ArrayUtils.matchAttributes(fromBattleClass.specialBattleEffect, { type: specialType }, false));
        }
        // equip
        let fromBattleEquips = fromBattleActor.equips;
        for (let i = 0; i < fromBattleEquips.length; i++) {
            let equip = fromBattleEquips[i];
            if (!equip || !equip.specialAbility) continue;
            specialBattleEffects = specialBattleEffects.concat(ArrayUtils.matchAttributes(equip.specialBattleEffect, { type: specialType }, false));
        }
        // skill
        let fromBattleSkills = battleModule.actor.skills.concat(battleModule.actor.atkSkill);
        for (let i = 0; i < fromBattleSkills.length; i++) {
            let skill = fromBattleSkills[i];
            if (!skill || !skill.specialAbility) continue;
            specialBattleEffects = specialBattleEffects.concat(ArrayUtils.matchAttributes(skill.specialBattleEffect, { type: specialType }, false));
        }
        // status
        for (let i = 0; i < fromBattleActor.status.length; i++) {
            let status = fromBattleActor.status[i];
            if (!status.specialAbility) continue;
            specialBattleEffects = specialBattleEffects.concat(ArrayUtils.matchAttributes(status.specialBattleEffect, { type: specialType }, false));
        }
        return specialBattleEffects;
    }
    /**
     * 获取指定元素的特殊
     * @param element 元素
     * @param specialType 类别
     */
    private static getSpecialBattleEffectsByOneElement(element: Module_Skill | Module_Status, specialType: number) {
        let specialBattleEffects: DataStructure_specialBattleEffect[] = [];
        if (!element || !element.specialAbility) return specialBattleEffects;
        specialBattleEffects = specialBattleEffects.concat(ArrayUtils.matchAttributes(element.specialBattleEffect, { type: specialType }, false));
        return specialBattleEffects;
    }
}