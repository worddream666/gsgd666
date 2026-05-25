/**
 * 战斗者AI-处理器
 * 
 * Created by 黑暗之神KDS on 2021-01-14 14:26:09.
 */
class GameBattleAI {
    //------------------------------------------------------------------------------------------------------
    // 配置
    //------------------------------------------------------------------------------------------------------
    /**
     * 行动频率，10表示每间隔10帧处理一次
     */
    private static FREQUENCY: number = 15;
    //------------------------------------------------------------------------------------------------------
    // 静态变量
    //------------------------------------------------------------------------------------------------------
    /**
     * 敌人集合
     */
    private static enemys: ProjectClientSceneObject[] = [];
    /**
     * 友军集合（非玩家拥有的角色）
     */
    private static allyBattlers: ProjectClientSceneObject[] = [];
    /**
     * 玩家的战斗者集合
     */
    private static playerBattlers: ProjectClientSceneObject[] = [];
    //------------------------------------------------------------------------------------------------------
    // 实例变量
    //------------------------------------------------------------------------------------------------------
    /**
     * 操作的战斗者
     */
    battler: ProjectClientSceneObject;
    /**
     * 仇恨列表
     */
    hateList: DataStructure_battlerHate[];
    /**
     * 阶段 0-无 1-追击敌人 2-返回
     */
    aiStage: number = 0;
    /**
     * 
     */
    private aiUpdateCount: number = 0;
    /**
     * 仅在指定帧中行动：以便分摊帧计算
     */
    private aiUpdateInFrame: number = MathUtils.rand(GameBattleAI.FREQUENCY);
    /**
     * 我的目标
     */
    myTarget: ProjectClientSceneObject;
    /**
     * 进入战斗的地点
     */
    aiInBattlePoint: Point;
    /**
     * 进入战斗的朝向
     */
    aiInBattleOri: number;
    /**
     * 回到进入战斗的地点时标识
     */
    isInBackToInBattlePoint: boolean;
    /**
     * 警戒层
     */
    private vigilanceRangeLayer: Sprite;
    /**
     * 随机移动相关
     */
    private randomMoveDirection: number = -1;
    private randomMoveSteps: number = 0;
    private randomMoveWaitTime: number = 0;
    /**
     * 出生坐标（随机移动的中心点）
     */
    private birthPoint: Point;
    /**
     * 随机移动最大范围（像素）
     */
    private randomMoveMaxRange: number = 200;
    /**
     * 随机移动状态：0-移动中，1-暂停中
     */
    private randomMoveState: number = 0;
    /**
     * 当前状态的持续时间（毫秒）
     */
    private randomMoveStateTime: number = 0;
    /**
     * 移动持续时间（毫秒）
     */
    private randomMoveDuration: number = 2000;
    /**
     * 暂停持续时间（毫秒）
     */
    private randomMovePauseDuration: number = 2000;
    /**
     * 上次所在位置，用于计算移动卡住后更换方式移动
     */
    private lastPosition: Point = new Point();
    /**
     * 滞留次数
     */
    private cantAtkMoveTimes = 0;
    //------------------------------------------------------------------------------------------------------
    //  静态
    //------------------------------------------------------------------------------------------------------
    /**
     * 开始
     */
    static start(): void {
        os.add_ENTERFRAME(this.update, this);
        EventUtils.addEventListenerFunction(GameBattleData, GameBattleData.EVENT_BATTLER_DEAD, this.onBattlerDead, this);
        EventUtils.addEventListenerFunction(GameBattleData, GameBattleData.EVENT_BATTLER_RESUSCITATE, this.onBattlerResuscitate, this);
        EventUtils.addEventListenerFunction(GameBattleData, GameBattleData.EVENT_BATTLER_IN_BATTLE, this.onBattlerInBattle, this);
    }
    /**
     * 停止
     */
    static stop(): void {
        os.remove_ENTERFRAME(this.update, this);
        EventUtils.removeEventListenerFunction(GameBattleData, GameBattleData.EVENT_BATTLER_DEAD, this.onBattlerDead, this);
        EventUtils.removeEventListenerFunction(GameBattleData, GameBattleData.EVENT_BATTLER_RESUSCITATE, this.onBattlerResuscitate, this);
        EventUtils.removeEventListenerFunction(GameBattleData, GameBattleData.EVENT_BATTLER_IN_BATTLE, this.onBattlerInBattle, this);
    }
    /**
     * 刷新
     * @param now 
     * @param updateCount 
     */
    static update(): void {
        if (Game.pause) return;
        let sceneObjects = Game.currentScene.sceneObjects;
        this.enemys.length = 0;
        this.allyBattlers.length = 0;
        this.playerBattlers.length = 0;
        for (let i = 0; i < sceneObjects.length; i++) {
            let so: ProjectClientSceneObject = sceneObjects[i] as any;
            if (!GameBattleHelper.isBattler(so)) continue;
            let battlerModule = so.getModule(6) as SoModule_Battler;
            if (so.index == 0) { }
            // -- 敌对阵营
            if (battlerModule.camp == 0) {
                if (!battlerModule.isDead) {
                    this.enemys.push(so);
                }
            }
            // -- 我方阵营
            else if (battlerModule.camp == 1) {
                if (!battlerModule.isDead) {
                    this.allyBattlers.push(so);
                }
            }
            else if (battlerModule.camp == -1) {
                this.playerBattlers.push(so);
            }
        }
        // 刷新NPC-AI
        let npcBattlers = this.enemys.concat(this.allyBattlers);
        for (let i = 0; i < npcBattlers.length; i++) {
            let npcBattler = npcBattlers[i];
            this.updateNPCAI(npcBattler);
        }
        // 刷新队友AI（当前控制者除外）
        for (let i = 0; i < Game.player.data.party.length; i++) {
            let teamMember = ProjectPlayer.getPlayerPartyBattler(i);
            if (teamMember != ProjectPlayer.ctrlActorSceneObject) {
                let teamMemberBattleModule = teamMember.getModule(6) as SoModule_Battler;
                if (!teamMemberBattleModule.isDead) {
                    this.updateTeamMemberAI(teamMember);
                }
            }
        }
        // 刷新警戒范围坐标
        this.refreshBattlerVigilanceRangeEffectPosition();
    }
    //------------------------------------------------------------------------------------------------------
    //  实例 - 构造/销毁
    //------------------------------------------------------------------------------------------------------
    /**
     * 构造函数
     */
    constructor(battler: ProjectClientSceneObject) {
        this.battler = battler;
        this.hateList = [];
        // 记录出生坐标（使用场景对象的初始位置）
        this.birthPoint = new Point(battler.x, battler.y);
        let battleModule = battler.getModule(6) as SoModule_Battler;
        // 警戒层初始化：主动攻击的敌人
        if (GameBattleHelper.isEnemyCamp(battler) && battleModule.actor.aiSetting && battleModule.actor.aiType == 0) {
            EventUtils.addEventListenerFunction(Game, Game.EVENT_DISPLAY_VIGILANCE_RANGE_CHANGE, this.refreshVigilanceRange, this);
            this.initVigilanceRangeLayer();
        }
        // 刷新警戒层显示效果
        this.refreshBattlerVigilanceRangeEffect();
    }
    /**
     * 销毁
     */
    dispose(clearBattlerStatus: boolean = true): void {
        if (!this.battler) return;
        if (clearBattlerStatus) {
            // -- 清理来源是该战斗者的状态
            GameBattleData.removeAllBattlerStatusByFromBattler(this.battler);
            // -- 清理自身的状态
            GameBattleData.removeAllStatus(this.battler);
        }
        // -- 清理战斗者的仇恨
        GameBattleData.clearHateList(this.battler, true);
        // -- 刷新进入战斗的状态
        GameBattleData.refreshInBattleState(this.battler);
        // -- 当战斗者更改朝向
        this.battler.off(ProjectClientSceneObject.CHANGE_ORI, this, this.onBattlerChangeOri);
        // -- 清理战斗者的警戒层
        if (this.vigilanceRangeLayer) {
            this.vigilanceRangeLayer.graphics.clear();
            this.vigilanceRangeLayer.removeSelf();
            this.vigilanceRangeLayer = null;
        }
        // -- 清除记录
        this.battler = null;
        // -- 清理事件
        EventUtils.removeEventListenerFunction(Game, Game.EVENT_DISPLAY_VIGILANCE_RANGE_CHANGE, this.refreshVigilanceRange, this);
    }
    /**
     * 清理
     */
    clear(): void {
        this.aiStage = 0;
        this.aiInBattlePoint = null;
        this.battler.eventCompleteContinue();
    }
    //------------------------------------------------------------------------------------------------------
    //  内部实现 - 实例
    //------------------------------------------------------------------------------------------------------
    /**
     * 回到进入战斗的地点
     * -- 离开战斗时
     * -- 超出两种距离时
     */
    backToInBattlePostion(force: boolean = false, aiInBattlePoint: Point = null, waitDuringRelease: boolean = false) {
        if (force) this.aiInBattlePoint = aiInBattlePoint;
        let battler = this.battler;
        if (!battler) return;
        let battleModule = battler.getModule(6) as SoModule_Battler;
        // -- 释放动作中
        if (battleModule.duringRelease) {
            ProjectUtils.nextFrameStartExecute(this.backToInBattlePostion, this, [force, aiInBattlePoint, true]);
            return;
        }
        // -- 如果是waitDuringRelease状态的话，如果仍然处于战斗模式，说明再次进入了战斗，无需返回
        else if (waitDuringRelease && battleModule.inBattle) {
            return;
        }
        if (battleModule.actor.lostTargetBack && (this.aiInBattlePoint && (this.aiInBattlePoint.x != battler.x || this.aiInBattlePoint.y != battler.y))) {
            if (force || GameBattleHelper.canMove(battler)) {
                battleModule.duringRelease = false;
                this.isInBackToInBattlePoint = true;
                battler.autoFindRoadMove(this.aiInBattlePoint.x, this.aiInBattlePoint.y, 1, 0, true, false, true, WorldData.moveDir4);
                let onMoveOver = () => {
                    if (force || this.aiStage == 2) {
                        if (this.aiInBattleOri != null) battler.avatarOri = this.aiInBattleOri;
                        battler.banBehavior = false;
                        this.isInBackToInBattlePoint = false;
                        this.clear();
                        Game.refreshActorAttribute(battleModule.actor, GameBattleHelper.getLevelByActor(battleModule.actor), battler);
                    }
                }
                // -- 监听一次移动完成事件，如果仍然处于返回阶段的话则清空进入战斗的地点
                battler.once(ProjectClientSceneObject.MOVE_OVER, this, onMoveOver);
                if (!battler.isMoving) {
                    battler.off(ProjectClientSceneObject.MOVE_OVER, this, onMoveOver);
                    onMoveOver.apply(this);
                }
            }
        }
        else {
            this.clear();
            battler.banBehavior = false;
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 内部实现 - 静态 AI
    //------------------------------------------------------------------------------------------------------
    /**
     * NPC-AI
     * @param battler NPC
     */
    private static updateNPCAI(battler: ProjectClientSceneObject): void {
        let battleModule = battler.getModule(6) as SoModule_Battler;
        let battlerAI = battleModule.battleAI;
        if (!battlerAI || !battleModule.actor.aiSetting) return;
        // 处于硬直中不允许
        if (GameBattleHelper.isInStiffness(battler)) return;
        // 处于硬直时间不行动
        if (battleModule.stiffnessDelayTime > 0) {
            battleModule.stiffnessDelayTime -= Game.oneFrame;
            return;
        }
        // 仅在其指定帧才计算，以便节约性能消耗
        battlerAI.aiUpdateCount++;
        if (battlerAI.aiUpdateCount % this.FREQUENCY != battlerAI.aiUpdateInFrame) return;
        // 不行动者，不采取任何行动
        if (battleModule.actor.aiType == 2) return;
        // 如果被动模式且没有仇恨列表的话进行随机移动
        if (battleModule.actor.aiType == 1 && battlerAI.hateList.length == 0) {
            if (battlerAI.aiStage == 2) {
                battlerAI.backToInBattlePostion();
            } else {
                // 被动模式且没有仇恨目标时进行随机移动
                this.doRandomMove(battler, battlerAI);
            }
            return;
        }
        // 获取当前敌人的坐标点
        let soPoint = new Point(battler.x, battler.y);
        let btTarget: ProjectClientSceneObject;
        // 当就近或者没有仇恨目标时或就近获取目标的模式
        if (battleModule.actor.aiGetTargetMode == 1 || battlerAI.hateList.length == 0) {
            // 主动搜寻敌人（扇形区域），加入到仇恨列表
            let userScanningAngleRange = GameBattleHelper.getScanningAngleRange(battler, battleModule.actor.vigilanceAngle);
            // 目标群体
            let targetBattlers: ProjectClientSceneObject[];
            if (battleModule.camp == 0) {
                targetBattlers = this.playerBattlers.concat(this.allyBattlers);
            }
            else {
                targetBattlers = this.enemys;
            }
            let maxDis = Number.MAX_VALUE;
            let myTarget = null;
            for (let i = 0; i < targetBattlers.length; i++) {
                let target = targetBattlers[i];
                let targetBattleModule = target.getModule(6) as SoModule_Battler;
                // 忽略死亡的目标
                if (!targetBattleModule || targetBattleModule.isDead) continue;
                // 距离判定以及扫描角度
                let dis = Point.distance(new Point(target.x, target.y), soPoint);
                if (dis < maxDis && dis <= battleModule.actor.aiVigilanceRange && GameBattleHelper.isInScanningAngleRange(target, soPoint, userScanningAngleRange)) {
                    maxDis = dis;
                    myTarget = target;
                    break;
                }
            }
            if (myTarget) {
                // GameBattleData.increaseHate(battler, myTarget, 0);
                btTarget = myTarget; // if (battleModule.actor.aiGetTargetMode == 1)
            }
        }
        // 否则当存在仇恨目标时则获取首个目标
        else if (battlerAI.hateList.length > 0) {
            btTarget = Game.currentScene.sceneObjects[battlerAI.hateList[0].targetIndex];
        }
        // 记录当前的目标
        battlerAI.myTarget = btTarget;
        if (!btTarget) {
            if (battlerAI.aiStage == 2) {
                battlerAI.backToInBattlePostion();
            } else {
                // 如果没有目标且不在战斗状态，进行随机移动
                this.doRandomMove(battler, battlerAI);
            }
            return;
        }
        // 开始做出战斗行为，禁止触发其事件
        battler.eventStartWait(null, false);
        // 设置阶段：追击敌人
        battlerAI.aiStage = 1;
        // 当处于战斗状态时：
        // 记录进入战斗的坐标
        if (!battlerAI.aiInBattlePoint) {
            battlerAI.aiInBattlePoint = new Point(soPoint.x, soPoint.y);
            battlerAI.aiInBattleOri = battler.avatarOri;
        }
        // 获取目标
        let targetPoint = new Point(btTarget.x, btTarget.y);
        // 处理丢失目标的情况
        let lostTarget: boolean = false;
        let dis1 = Point.distance(soPoint, targetPoint);
        if (dis1 >= battleModule.actor.lostTargetRange1) {
            lostTarget = true;
        }
        else {
            let dis2 = Point.distance(battlerAI.aiInBattlePoint, targetPoint);
            if (dis2 >= battleModule.actor.lostTargetRange2) {
                lostTarget = true;
            }
        }
        if (lostTarget) {
            // 将其从仇恨列表中移除
            GameBattleData.removeHateTarget(battler, btTarget);
            GameBattleData.removeHateTarget(btTarget, battler);
            // 仇恨列表为空则返回
            if (battlerAI.hateList.length == 0) {
                battlerAI.aiStage = 2;
                battlerAI.backToInBattlePostion();
            }
            return;
        }
        // 设置回到进入战斗中的位置时标识
        battlerAI.isInBackToInBattlePoint = false;
        // 攻击目标
        this.attackTarget(battler, btTarget, dis1);
    }
    /**
     * 队友-AI
     * @param battler 队友 
     */
    private static updateTeamMemberAI(battler: ProjectClientSceneObject): void {
        let battleModule = battler.getModule(6) as SoModule_Battler;
        let battlerAI = battleModule.battleAI;
        if (!battlerAI) return;
        // 处于硬直中不允许
        if (GameBattleHelper.isInStiffness(battler)) return;
        // 处于硬直后的延迟时间不行动
        if (battleModule.stiffnessDelayTime > 0) {
            battleModule.stiffnessDelayTime -= Game.oneFrame;
            return;
        }
        // 仅在其指定帧才计算，以便节约性能消耗
        battlerAI.aiUpdateCount++;
        if (battlerAI.aiUpdateCount % this.FREQUENCY != battlerAI.aiUpdateInFrame) return;
        // 获取敌人
        // --被动型：没有目标时需要根据自己或玩家遭受攻击后才锁定目标
        if (Game.player.data.aiMode == 0) {
            // 第一目标：获取该战斗者的仇恨列表中的最大仇恨者（表示被攻击后才会出击）
            if (!battlerAI.myTarget) {
                if (battlerAI.hateList.length > 0) {
                    let hateInfo = battlerAI.hateList[0];
                    battlerAI.myTarget = Game.currentScene.sceneObjects[hateInfo.targetIndex];
                }
            }
            // 第二目标：获取控制者仇恨列表中最大仇恨者（表示玩家控制的角色被攻击后才会出击）
            if (!battlerAI.myTarget) {
                if (ProjectPlayer.ctrlActorBattleModule.battleAI.hateList.length > 0) {
                    let hateInfo = ProjectPlayer.ctrlActorBattleModule.battleAI.hateList[0];
                    battlerAI.myTarget = Game.currentScene.sceneObjects[hateInfo.targetIndex];
                }
            }
        }
        // -- 主动型：主动检索附近的敌人进行攻击（在警戒范围内）
        else {
            // 固定警戒范围内获取最近的目标
            if (!battlerAI.myTarget) {
                let vigilanceRange2 = Math.pow(Game.player.data.aiVigilanceRange, 2);
                let minDis2 = Number.MAX_VALUE;
                for (let i = 0; i < this.enemys.length; i++) {
                    let enemy = this.enemys[i];
                    let dis2 = Point.distanceSquare2(battler.x, battler.y, enemy.x, enemy.y);
                    if (dis2 <= minDis2 && dis2 <= vigilanceRange2) {
                        minDis2 = dis2;
                        battlerAI.myTarget = enemy;
                    }
                }
            }
        }
        // 获取当前敌人的坐标点
        let soPoint = new Point(battler.x, battler.y);
        // 获取与主角的距离
        let dis1 = Point.distance(soPoint, new Point(ProjectPlayer.ctrlActorSceneObject.x, ProjectPlayer.ctrlActorSceneObject.y));
        // 脱离战斗的处理：离主角第一距离则脱离战斗，离主角第二距离则瞬移并脱离战斗
        // 离操控者超出更远的距离则瞬移至操控者附近，清理仇恨列表
        if (dis1 >= stage.width) {
            GameBattleAction.stopAction(battler);
            GameBattleData.clearHateList(battler, true);
            let posArr = SceneUtils.getAroundPositions(0, ProjectPlayer.ctrlActorSceneObject, battler);
            if (posArr.length > 0) {
                battler.setTo(posArr[0].x, posArr[0].y);
            }
            else {
                battler.setTo(ProjectPlayer.ctrlActorSceneObject.x, ProjectPlayer.ctrlActorSceneObject.y);
            }
            this.followCtrlActorSceneObject(battler, dis1);
            return;
        }
        // 离操控者超出指定的距离则脱离战斗，清理仇恨列表
        else if (dis1 >= stage.width / 2) {
            GameBattleAction.stopAction(battler);
            GameBattleData.clearHateList(battler, true);
            this.followCtrlActorSceneObject(battler, dis1);
            return;
        }
        // 当存在目标时，发起攻击
        if (battlerAI.myTarget) {
            // 目标的位置
            let targetPoint = new Point(battlerAI.myTarget.x, battlerAI.myTarget.y);
            // 处理丢失目标的情况
            let dis2 = Point.distance(soPoint, targetPoint);
            // 攻击目标
            this.attackTarget(battler, battlerAI.myTarget, dis2);
        }
        // 跟随主角
        else {
            this.followCtrlActorSceneObject(battler, dis1);
        }
    }
    //------------------------------------------------------------------------------------------------------
    //  行动
    //------------------------------------------------------------------------------------------------------
    /**
     * 攻击目标
     * @param so 
     * @param btTarget 
     * @param distance 
     */
    private static attackTarget(so: ProjectClientSceneObject, btTarget: ProjectClientSceneObject, distance: number): void {
        // 移动处理
        let soBattleModule = so.getModule(6) as SoModule_Battler;
        let atkSkill = soBattleModule.actor.atkSkill;
        let conditionExt: boolean;
        if (WorldData.battleOriMode == 1 && so.avatar.oriMode <= 2) {
            conditionExt = Math.abs(so.y - btTarget.y) < Config.SCENE_GRID_SIZE * 0.2 && distance < atkSkill.distance && distance >= (Math.min(atkSkill.distance * 0.5, Config.SCENE_GRID_SIZE * 0.5));
        }
        else {
            conditionExt = true;
        }
        // 如果移动方式非固定或是玩家角色的话且允许移动时
        let canMove = (soBattleModule.actor.moveType != 0 || soBattleModule.camp == -1) && GameBattleHelper.canMove(so);
        if (canMove) {
            // 接近目标：保持攻击距离
            let keepingDis: number = Math.max(Config.SCENE_GRID_SIZE, atkSkill.distance);
            if (distance > keepingDis || !conditionExt) {
                this.moveToTarget(so, btTarget, soBattleModule);
            }
            else if (!soBattleModule.duringRelease) {
                so.stopMove();
            }
        }
        let isFaceToTarget = false;
        
        // 智能选择最佳技能
        let bestSkill = this.smartSelectSkill(so, btTarget);
        
        // 使用智能选择的技能进行攻击
        if (bestSkill && distance < bestSkill.distance && conditionExt) {
            if (!isFaceToTarget) {
                this.faceToTarget(so, btTarget);
                isFaceToTarget = true;
            }
            let useSkillSuccess: boolean = GameBattleAction.useSkill(so, bestSkill, btTarget);
            if (useSkillSuccess) {
                return;
            }
        }
        
        // 如果智能选择失败，回退到普通攻击
        if (distance < atkSkill.distance && conditionExt) {
            if (!isFaceToTarget) {
                this.faceToTarget(so, btTarget);
                isFaceToTarget = true;
            }
            let useAtkSuccess: boolean = GameBattleAction.useSkill(so, atkSkill, btTarget);
            if (useAtkSuccess) {
                return;
            }
        }
        
        // 使用其他可用技能
        for (let i = 0; i < soBattleModule.actor.skills.length; i++) {
            let skill = soBattleModule.actor.skills[i];
            if (skill == bestSkill) continue; // 跳过已经尝试过的技能
            if (!isFaceToTarget) {
                this.faceToTarget(so, btTarget);
                isFaceToTarget = true;
            }
            let target = this.getSkillTarget(so, skill);
            if (target) {
                let useSkillSuccess: boolean = GameBattleAction.useSkill(so, skill, target);
                if (useSkillSuccess) {
                    return;
                }
            }
        }
    }
    /**
     * 指定的战斗者朝向目标对象
     * @param battler 指定的战斗者
     * @param target 目标对象
     */
    private static faceToTarget(battler: ProjectClientSceneObject, target: ProjectClientSceneObject): void {
        let battlerModule = battler.getModule(6) as SoModule_Battler;
        if (!battlerModule.duringRelease && !battler.fixOri) {
            let angle = MathUtils.direction360(battler.x, battler.y, target.x, target.y);
            let ori = GameUtils.getOriByAngle(angle);
            battler.avatarOri = ori;
        }
    }
    /**
     * 跟随控制者
     * @param so 
     * @param distance 
     */
    private static followCtrlActorSceneObject(battler: ProjectClientSceneObject, distance: number): void {
        // 不允许移动的场合
        if (!GameBattleHelper.canMove(battler)) return;
        // 获取跟随的位置，开始自动寻路
        let posArr = SceneUtils.getAroundPositions(0, ProjectPlayer.ctrlActorSceneObject, battler);
        if (posArr.length > 0) {
            battler.autoFindRoadMove(posArr[0].x, posArr[0].y, 1, 0, true, false, true, WorldData.moveDir4);
        }
        else {
            battler.autoFindRoadMove(ProjectPlayer.ctrlActorSceneObject.x, ProjectPlayer.ctrlActorSceneObject.y, 1, 0, true, false, true, WorldData.moveDir4);
        }
    }
    /**
     * 获取一个技能目标，可能为空
     * @param skill 技能
     * @param isHostileSkill 是否作用敌方的技能 
     * @return [ProjectClientSceneObject] 
     */
    private static getSkillTarget(battler: ProjectClientSceneObject, skill: Module_Skill): ProjectClientSceneObject {
        let realTarget: ProjectClientSceneObject;
        let soBattleModule = battler.getModule(6) as SoModule_Battler;
        let currentBattlerActor = soBattleModule.actor;
        // 是否是作用敌人的技能
        let isHostileSkill = GameBattleHelper.isHostileSkill(skill);
        // 获取目标组
        let targetArr: ProjectClientSceneObject[] = [];
        // -- 如果是针对敌方的技能
        if (isHostileSkill) {
            targetArr = soBattleModule.camp == 0 ? this.playerBattlers.concat(this.allyBattlers) : this.enemys;
        }
        // -- 如果是作用自己的技能
        else if (skill.targetType == 0) {
            targetArr = [battler];
        }
        // -- 针对队友的技能
        else {
            targetArr = soBattleModule.camp == 0 ? this.enemys : this.playerBattlers.concat(this.allyBattlers);
        }
        // 找不到目标的情况
        if (targetArr.length == 0) return;
        // 当原技能不自带伤害时根据目标是否存在相关状态而决定使用
        if (!skill.useDamage) {
            // 附加状态的技能，需要确认目标该状态是否拥有该状态或允许继续叠加
            for (let s = 0; s < skill.addStatus.length; s++) {
                let st = skill.addStatus[s];
                let stObj: Module_Status = GameData.getModuleData(10, st);
                if (!stObj) continue;
                for (let i = 0; i < targetArr.length; i++) {
                    realTarget = targetArr[i];
                    // -- 允许叠加状态层的话
                    if (GameBattleHelper.canSuperpositionLayer(realTarget, st)) {
                        // -- 不在距离内则忽略
                        if (!GameBattleHelper.isTwoBattlerInRange(battler, realTarget, skill.distance)) continue;
                        let realActor = (realTarget.getModule(6) as SoModule_Battler).actor;
                        // -- 如果是DOT/HOT 目标HP/SP低于一定数值时则
                        if (stObj.overtime) {
                            // HOT
                            if (stObj.damageType == 3) {
                                let stValue = stObj.damageValue * (stObj.totalDuration == 0 ? 5 : (stObj.totalDuration / stObj.intervalTime));
                                if (realActor.MaxHP - realActor.hp >= stValue || realActor.hp / realActor.MaxHP < 0.5) {
                                    return realTarget;
                                }
                                else continue;
                            }
                            // DOT
                            else if (stObj.damageType == 4) {
                                let stValue = stObj.damageValue * (stObj.totalDuration == 0 ? 5 : (stObj.totalDuration / stObj.intervalTime));
                                if (realActor.MaxSP - realActor.sp >= stValue || realActor.sp / realActor.MaxSP < 0.5) {
                                    return realTarget;
                                }
                                else continue;
                            }
                        }
                        return realTarget;
                    }
                }
            }
            // 如果存在附加状态但无法作用到任何目标的话则视为无目标
            if (skill.addStatus.length > 0) {
                return null;
            }
            // 移除状态的技能，需要确认目标是否拥有该状态
            for (let s = 0; s < skill.removeStatus.length; s++) {
                let st = skill.removeStatus[s];
                for (let i = 0; i < targetArr.length; i++) {
                    realTarget = targetArr[i];
                    if (GameBattleHelper.isIncludeStatus(realTarget, st)) {
                        // -- 不在距离内忽略
                        if (!GameBattleHelper.isTwoBattlerInRange(battler, realTarget, skill.distance)) continue;
                        return realTarget;
                    }
                }
            }
            // 如果存在移除状态但无法作用到任何目标的话则视为无目标
            if (skill.removeStatus.length > 0) {
                return null;
            }
        }
        // 直接恢复类
        if (!isHostileSkill && skill.useDamage) {
            let skillDamage = skill.damageValue;
            // -- 计算技能伤害加成
            if (skill.useAddition) {
                let actorAttributeValue = skill.additionMultipleType == 0 ? currentBattlerActor.ATK : currentBattlerActor.MAG;
                let addDamageValue = skill.additionMultiple / 100 * actorAttributeValue;
                skillDamage += addDamageValue;
            }
            // -- 恢复生命值
            if (skill.damageType == 3) {
                for (let i = 0; i < targetArr.length; i++) {
                    realTarget = targetArr[i];
                    // -- 不在距离内忽略
                    if (!GameBattleHelper.isTwoBattlerInRange(battler, realTarget, skill.distance)) continue;
                    let targetActor = (realTarget.getModule(6) as SoModule_Battler).actor;
                    if (targetActor.MaxHP - targetActor.hp >= skillDamage || targetActor.hp / targetActor.MaxHP < 0.5) {
                        return realTarget;
                    }
                }
                return null;
            }
            // -- 恢复魔法值
            else if (skill.damageType == 4) {
                for (let i = 0; i < targetArr.length; i++) {
                    realTarget = targetArr[i];
                    // -- 不在距离内忽略
                    if (!GameBattleHelper.isTwoBattlerInRange(battler, realTarget, skill.distance)) continue;
                    let targetActor = (realTarget.getModule(6) as SoModule_Battler).actor;
                    if (targetActor.MaxSP - targetActor.sp >= skillDamage || targetActor.sp / targetActor.MaxSP < 0.5) {
                        return realTarget;
                    }
                }
                return null;
            }
        }
        // 目标是敌方的技能：随机找到一个目标
        if (isHostileSkill) {
            // -- 找到一个距离范围内的
            for (let i = 0; i < targetArr.length; i++) {
                let realTarget = targetArr[i];
                // -- 不在距离内忽略
                if (!GameBattleHelper.isTwoBattlerInRange(battler, realTarget, skill.distance)) continue;
                return realTarget;
            }
            return null;
        }
        // 目标是我方的技能：自己
        else {
            return battler;
        }
    }
    /**
     * 移动至目标地
     * @param so 
     * @param btTarget 
     * @param soBattleModule 
     */
    private static moveToTarget(so: ProjectClientSceneObject, btTarget: ProjectClientSceneObject, soBattleModule: SoModule_Battler) {
        // 是否步进
        let stepByStep = soBattleModule.actor.moveType == 2 && soBattleModule.camp != -1;
        // 获取目的地
        let posArr = SceneUtils.getAroundPositions(1, btTarget, so, 1, false, Config.SCENE_GRID_SIZE, stepByStep);
        let moveToDestination: Point;
        if (posArr.length > 0) {
            moveToDestination = posArr[0];
        }
        else {
            moveToDestination = btTarget.pos;
        }
        let isCantAtkMove = soBattleModule.battleAI.lastPosition.x == so.x && soBattleModule.battleAI.lastPosition.y == so.y;
        if (isCantAtkMove) {
            soBattleModule.battleAI.cantAtkMoveTimes++;
            // 滞留次数过多，至少
            if (soBattleModule.battleAI.cantAtkMoveTimes >= 5) {
                let myAroundPosArr = SceneUtils.getAroundPositions(1, so, btTarget);
                if (myAroundPosArr.length > 0) moveToDestination = myAroundPosArr[0];
                soBattleModule.battleAI.cantAtkMoveTimes = 0;
            }
        }
        else {
            soBattleModule.battleAI.cantAtkMoveTimes = 0;
        }
        so.autoFindRoadMove(moveToDestination.x, moveToDestination.y, 1, 0, true, false, true, false);
        soBattleModule.battleAI.lastPosition.x = so.x;
        soBattleModule.battleAI.lastPosition.y = so.y;
    }
    //------------------------------------------------------------------------------------------------------
    //  内部实现 - 静态 - 警戒区域 DEBUG
    //------------------------------------------------------------------------------------------------------
    /**
     * 刷新警戒范围坐标
     */
    private static refreshBattlerVigilanceRangeEffectPosition() {
        for (let i = 0; i < this.enemys.length; i++) {
            let enemy = this.enemys[i];
            if (enemy) {
                let enemyBattleModule = enemy.getModule(6) as SoModule_Battler;
                if (enemyBattleModule && enemyBattleModule.battleAI) {
                    let layer = enemyBattleModule.battleAI.vigilanceRangeLayer;
                    if (layer) {
                        layer.x = enemy.x;
                        layer.y = enemy.y;
                    }
                }
            }
        }
    }
    /**
     * 当战斗者死亡时 - 刷新警戒层显示范围
     * @param battler 战斗者
     */
    private static onBattlerDead(battler: ProjectClientSceneObject): void {
        if (battler) {
            let battleModule = battler.getModule(6) as SoModule_Battler;
            if (battleModule && battleModule.battleAI) {
                battleModule.battleAI.refreshBattlerVigilanceRangeEffect();
            }
        }
    }
    /**
     * 当战斗者复活时
     * @param battler 战斗者
     */
    private static onBattlerResuscitate(battler: ProjectClientSceneObject): void {
        if (battler) {
            let battleModule = battler.getModule(6) as SoModule_Battler;
            if (battleModule && battleModule.battleAI) {
                battleModule.battleAI.refreshBattlerVigilanceRangeEffect();
            }
        }
    }
    /**
     * 当战斗者进入或离开战斗的情况
     */
    private static onBattlerInBattle(isInBattle: boolean, battler: ProjectClientSceneObject): void {
        if (battler) {
            let battleModule = battler.getModule(6) as SoModule_Battler;
            if (battleModule && battleModule.battleAI) {
                battleModule.battleAI.refreshBattlerVigilanceRangeEffect();
            }
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 内部实现 - 实例 - 警戒区域 DEBUG
    //------------------------------------------------------------------------------------------------------
    /**
     * 当战斗者更换朝向时
     */
    private onBattlerChangeOri(): void {
        this.refreshBattlerVigilanceRangeEffect();
    }
    /**
     * 创建警戒DEBUG层
     */
    private initVigilanceRangeLayer(): void {
        if (this.vigilanceRangeLayer || !WorldData.showVigilanceRange) return;
        this.vigilanceRangeLayer = new Sprite();
        Game.currentScene.animationLowLayer.addChildAt(this.vigilanceRangeLayer, 0);
        this.vigilanceRangeLayer.blendMode = "lighter";
        // 监听：战斗者更改朝向事件
        this.battler.on(ProjectClientSceneObject.CHANGE_ORI, this, this.onBattlerChangeOri);
    }
    /**
     * 刷新警戒层显示范围
     */
    private refreshBattlerVigilanceRangeEffect(): void {
        if (!this.vigilanceRangeLayer) return;
        let battlerModule = this.battler.getModule(6) as SoModule_Battler;
        this.vigilanceRangeLayer.graphics.clear();
        // 忽略掉无法产生
        if (battlerModule.isDead || battlerModule.inBattle || !WorldData.showVigilanceRange) return;
        // 如果是非战斗
        let oriAngle = GameUtils.getAngleByOri(GameBattleHelper.getBattlerOri(this.battler)) - 90;
        let halfAngle = Math.floor(battlerModule.actor.vigilanceAngle / 2);
        let color = WorldData.vigilanceColor;
        this.vigilanceRangeLayer.alpha = WorldData.vigilanceAlpha;
        this.vigilanceRangeLayer.graphics.drawPie(0, 0, battlerModule.actor.aiVigilanceRange, oriAngle - halfAngle, oriAngle + halfAngle, color);
    }
    /**
     * 刷新显示/隐藏警戒层
     */
    private refreshVigilanceRange(): void {
        this.initVigilanceRangeLayer();
        if (this.vigilanceRangeLayer) {
            this.vigilanceRangeLayer.visible = WorldData.showVigilanceRange;
            if (WorldData.showVigilanceRange) this.refreshBattlerVigilanceRangeEffect();
        }
    }
    //------------------------------------------------------------------------------------------------------
    //  随机移动
    //------------------------------------------------------------------------------------------------------
    /**
     * 检查目标位置是否在出生范围内
     */
    private static isInBirthRange(battlerAI: GameBattleAI, targetX: number, targetY: number): boolean {
        if (!battlerAI.birthPoint) return true; // 如果没有记录出生点，允许移动
        let distance = Point.distance(new Point(targetX, targetY), battlerAI.birthPoint);
        return distance <= battlerAI.randomMoveMaxRange;
    }
    
    /**
     * 执行随机移动
     * 按顺序完成上下左右四个方向循环（每个方向移动2秒，暂停2秒），循环执行
     * 限制在出生坐标200像素范围内
     */
    private static doRandomMove(battler: ProjectClientSceneObject, battlerAI: GameBattleAI): void {
        let battleModule = battler.getModule(6) as SoModule_Battler;
        
        // 如果正在移动中，更新状态时间并跳过
        if (battler.isMoving) {
            battlerAI.randomMoveStateTime += Game.oneFrame;
            return;
        }
        
        // 初始化方向（从0开始，循环0-3对应上下左右）
        if (battlerAI.randomMoveDirection == -1) {
            battlerAI.randomMoveDirection = 0;
            battlerAI.randomMoveState = 0; // 0-移动中，1-暂停中
            battlerAI.randomMoveStateTime = 0;
        }
        
        // 更新状态时间
        battlerAI.randomMoveStateTime += Game.oneFrame;
        
        // 检查当前状态
        if (battlerAI.randomMoveState == 0) {
            // 移动状态
            if (battlerAI.randomMoveStateTime >= battlerAI.randomMoveDuration) {
                // 移动时间到，切换到暂停状态
                battlerAI.randomMoveState = 1;
                battlerAI.randomMoveStateTime = 0;
                return;
            }
            
            // 计算目标位置
            let targetX = battler.x;
            let targetY = battler.y;
            let gridSize = Config.SCENE_GRID_SIZE;
            
            switch (battlerAI.randomMoveDirection) {
                case 0: // 上
                    targetY -= gridSize;
                    break;
                case 1: // 下
                    targetY += gridSize;
                    break;
                case 2: // 左
                    targetX -= gridSize;
                    break;
                case 3: // 右
                    targetX += gridSize;
                    break;
            }
            
            // 检查目标位置是否在出生范围内
            if (!this.isInBirthRange(battlerAI, targetX, targetY)) {
                // 超出范围，切换到暂停状态
                battlerAI.randomMoveState = 1;
                battlerAI.randomMoveStateTime = 0;
                return;
            }
            
            // 检查目标位置是否可以移动（包括碰撞检测）
            if (GameBattleHelper.canMove(battler)) {
                // 额外检查目标位置是否有其他战斗者阻挡
                if (!this.isPositionBlocked(battler, targetX, targetY)) {
                    // 设置朝向
                    let ori = battlerAI.randomMoveDirection;
                    if (ori == 2) ori = 3;
                    else if (ori == 3) ori = 2;
                    battler.avatarOri = ori;
                    
                    // 移动
                    battler.autoFindRoadMove(targetX, targetY, 1, 0, true, false, true, WorldData.moveDir4);
                } else {
                    // 目标位置被其他怪物阻挡，切换到暂停状态
                    battlerAI.randomMoveState = 1;
                    battlerAI.randomMoveStateTime = 0;
                }
            } else {
                // 无法移动（地形阻挡），切换到暂停状态
                battlerAI.randomMoveState = 1;
                battlerAI.randomMoveStateTime = 0;
            }
        } else {
            // 暂停状态
            if (battlerAI.randomMoveStateTime >= battlerAI.randomMovePauseDuration) {
                // 暂停时间到，切换到下一个方向的移动状态
                battlerAI.randomMoveDirection = (battlerAI.randomMoveDirection + 1) % 4;
                battlerAI.randomMoveState = 0;
                battlerAI.randomMoveStateTime = 0;
            }
        }
    }
    
    /**
     * 检查目标位置是否被其他战斗者阻挡
     */
    private static isPositionBlocked(battler: ProjectClientSceneObject, targetX: number, targetY: number): boolean {
        let scene = Game.currentScene;
        if (!scene) return false;
        
        let gridSize = Config.SCENE_GRID_SIZE;
        let halfGrid = gridSize / 2;
        
        for (let i = 0; i < scene.sceneObjects.length; i++) {
            let other = scene.sceneObjects[i];
            // 跳过 undefined 对象和自己
            if (!other || other == battler) continue;
            
            // 检查是否是战斗者
            let otherBattleModule = other.getModule ? other.getModule(6) as SoModule_Battler : null;
            if (!otherBattleModule) continue;
            
            // 检查位置是否重叠
            let dx = Math.abs(other.x - targetX);
            let dy = Math.abs(other.y - targetY);
            
            if (dx < halfGrid && dy < halfGrid) {
                // 目标位置有其他战斗者
                return true;
            }
        }
        
        return false;
    }
    //------------------------------------------------------------------------------------------------------
    //  智能攻击优化
    //------------------------------------------------------------------------------------------------------
    /**
     * 智能选择攻击技能
     * 优先选择能造成最大伤害或最有效果的技能
     */
    private static smartSelectSkill(battler: ProjectClientSceneObject, btTarget: ProjectClientSceneObject): Module_Skill {
        let battleModule = battler.getModule(6) as SoModule_Battler;
        let atkSkill = battleModule.actor.atkSkill;
        
        // 如果没有技能，返回普通攻击
        if (!battleModule.actor.skills || battleModule.actor.skills.length == 0) {
            return atkSkill;
        }
        
        // 获取目标信息
        let targetBattleModule = btTarget.getModule(6) as SoModule_Battler;
        let targetActor = targetBattleModule.actor;
        
        // 评估每个技能的效果
        let bestSkill = atkSkill;
        let bestScore = this.evaluateSkillEffect(battler, atkSkill, btTarget);
        
        for (let i = 0; i < battleModule.actor.skills.length; i++) {
            let skill = battleModule.actor.skills[i];
            
            // 检查技能是否可用
            if (!this.isSkillAvailable(battler, skill, btTarget)) {
                continue;
            }
            
            // 评估技能效果
            let score = this.evaluateSkillEffect(battler, skill, btTarget);
            
            // 如果是治疗技能，检查是否需要使用
            if (!GameBattleHelper.isHostileSkill(skill)) {
                // 如果队友血量充足，降低治疗技能优先级
                if (targetActor.hp / targetActor.MaxHP > 0.7) {
                    score *= 0.3;
                }
            }
            
            // 更新最佳技能
            if (score > bestScore) {
                bestScore = score;
                bestSkill = skill;
            }
        }
        
        return bestSkill;
    }
    
    /**
     * 评估技能效果分数
     */
    private static evaluateSkillEffect(battler: ProjectClientSceneObject, skill: Module_Skill, target: ProjectClientSceneObject): number {
        let score = 0;
        let battleModule = battler.getModule(6) as SoModule_Battler;
        let targetBattleModule = target.getModule(6) as SoModule_Battler;
        let targetActor = targetBattleModule.actor;
        
        // 基础伤害分数
        if (skill.useDamage) {
            let damage = skill.damageValue;
            if (skill.useAddition) {
                let attrValue = skill.additionMultipleType == 0 ? battleModule.actor.ATK : battleModule.actor.MAG;
                damage += skill.additionMultiple / 100 * attrValue;
            }
            score += damage;
        }
        
        // 状态效果分数
        if (skill.addStatus && skill.addStatus.length > 0) {
            for (let st of skill.addStatus) {
                let stObj = GameData.getModuleData(10, st);
                if (stObj) {
                    // 根据状态类型给予不同分数
                    switch (stObj.damageType) {
                        case 1: // HP伤害
                        case 4: // DOT
                            score += stObj.damageValue * 2;
                            break;
                        case 2: // SP伤害
                            score += stObj.damageValue;
                            break;
                        case 3: // 封印
                        case 5: // 混乱
                        case 6: // 沉默
                            score += 100; // 控制技能加分
                            break;
                    }
                }
            }
        }
        
        // 距离惩罚
        let distance = Point.distance(new Point(battler.x, battler.y), new Point(target.x, target.y));
        if (distance > skill.distance) {
            score *= 0.5; // 超出距离，效果减半
        }
        
        // 消耗惩罚（SP消耗越高，分数越低）
        if (skill.spCost > 0) {
            score *= (1 - skill.spCost / battleModule.actor.MaxSP);
        }
        
        return score;
    }
    
    /**
     * 检查技能是否可用
     */
    private static isSkillAvailable(battler: ProjectClientSceneObject, skill: Module_Skill, target: ProjectClientSceneObject): boolean {
        let battleModule = battler.getModule(6) as SoModule_Battler;
        
        // 检查SP
        if (battleModule.actor.sp < skill.spCost) {
            return false;
        }
        
        // 检查距离
        let distance = Point.distance(new Point(battler.x, battler.y), new Point(target.x, target.y));
        if (distance > skill.distance) {
            return false;
        }
        
        // 检查冷却
        // TODO: 如果有冷却系统，添加冷却检查
        
        return true;
    }
}