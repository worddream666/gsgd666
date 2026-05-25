/**
 * 游戏子弹
 * Created by 黑暗之神KDS on 2020-03-23 04:32:22.
 */
class GameBullet extends GCAnimation {
    /**
     * 来源对象
     */
    from: ProjectClientSceneObject;
    /**
     * 目标对象
     */
    targetBattler: ProjectClientSceneObject;
    /**
     * 来源技能
     */
    skill: Module_Skill;
    /**
     * 启动时间
     */
    startTime: number;
    /**
     * 伤害比例 100=100%
     */
    damagePer: number;
    /**
     * 计算辅助
     */
    private updateCount: number = 0;
    private updateAngleInterval: number = MathUtils.rand(4) + 2;
    /**
     * 目的地偏移量/目的地与出发点的相对偏移量（指向方向类技能）
     */
    private toDx: number;
    private toDy: number;
    /**
     * 最大持续时间
     */
    private maxDurationTime: number;
    private startX: number;
    private startY: number;
    /**
     * 剩余可击中目标的个数
     */
    private hitTargetCount: number;
    /**
     * 击中范围（优化计算）
     */
    private hitRange2: number;
    /**
     * 已击中的目标索引记录
     */
    private alreadyHitTarget: boolean[];
    /**
     * 构造函数
     * @param now 游戏时间
     * @param from 来源战斗者
     * @param targetBattler 目标战斗者
     * @param skill 技能
     * @param preAngle[可选] 默认值=null 角度
     * @param damagePer[可选] 默认值=100 伤害比例
     */
    constructor(now: number, from: ProjectClientSceneObject, targetBattler: ProjectClientSceneObject, skill: Module_Skill, preAngle: number = null, damagePer: number = 100) {
        super();
        if (!Game.currentScene) return;
        // 记录数据
        this.startTime = now;
        this.from = from;
        this.targetBattler = targetBattler;
        let fromBattleModule = from.getModule(6) as SoModule_Battler;
        this.skill = skill;
        this.damagePer = damagePer;
        // 生成子弹动画并添加到场景上：根据面向决定初始坐标
        this.id = skill.bulletAnimation;
        this.loop = true;
        let angle: number;
        // 子弹初始位置修正，根据起始点与目的地的角度
        if (targetBattler) {
            angle = MathUtils.direction360(targetBattler.x, targetBattler.y, from.x, from.y);
        }
        // 指向前方方向（手柄模式下指向鼠标方向时也视为指向前方方向）
        else if (this.skill.skillReleaseType == 2 || (ProjectUtils.lastControl == 2 && this.skill.skillReleaseType == 3)) {
            angle = GameUtils.getAngleByOri(GameBattleHelper.getBattlerOri(from)); 
            if (this.skill.bulletRotation) this.rotation = angle;
            angle += 180;
        }
        // 指向鼠标方向
        else if (this.skill.skillReleaseType == 3) {
            if (preAngle) {
                angle = preAngle;
            }
            else {
                if (ProjectPlayer.ctrlActorSceneObject == from) {
                    angle = MathUtils.direction360(from.x, from.y, Game.currentScene.localX, Game.currentScene.localY);
                }
                else if (fromBattleModule.battleAI.myTarget) {
                    angle = MathUtils.direction360(from.x, from.y, fromBattleModule.battleAI.myTarget.x, fromBattleModule.battleAI.myTarget.y);
                }
                else {
                    angle = GameUtils.getAngleByOri(GameBattleHelper.getBattlerOri(from));
                }
            }
            if (this.skill.bulletRotation) this.rotation = angle;
            angle += 180;
        }
        let dx = -Math.sin(angle / 180 * Math.PI) * Config.SCENE_GRID_SIZE / 2;
        let dy = Math.cos(angle / 180 * Math.PI) * Config.SCENE_GRID_SIZE / 2;
        this.x = from.x + dx;
        this.y = from.y + dy - Config.SCENE_GRID_SIZE / 2;
        // 指向方向类的技能
        if (this.skill.skillReleaseType >= 2) {
            if (this.skill.targetType >= 5 && this.skill.targetType >= 6) {
                this.hitTargetCount = MathUtils.int(this.skill.targetNum);
            }
            else if (this.skill.targetType >= 1 && this.skill.targetType >= 2) {
                this.hitTargetCount = 1;
            }
            this.alreadyHitTarget = [];
            this.hitRange2 = Math.pow(this.skill.hitRange, 2);
            this.maxDurationTime = this.skill.distance * 1000 / this.skill.bulletSpeed;
            this.startX = this.x;
            this.startY = this.y;
            let dis = Point.distance2(0, 0, Math.abs(dx), Math.abs(dy));
            let disPer = skill.distance / dis;
            this.toDx = dx * disPer;
            this.toDy = (dy) * disPer;
        }
        // 指向目标的技能
        else {
            // 计算目的地偏移量
            let refObj = targetBattler.avatar.refObjs ? targetBattler.avatar.refObjs[1] : null;
            if (refObj) {
                this.toDx = refObj.x * targetBattler.scale + refObj.width * targetBattler.scale / 2;
                this.toDy = refObj.y * targetBattler.scale + refObj.height * targetBattler.scale / 2;
            }
            else {
                this.toDx = 0;
                this.toDy = 0;
            }
        }
        // 播放
        this.play();
        // 添加到地图的动画高层
        Game.currentScene.animationHighLayer.addChild(this);
    }
    /**
     * 刷新弹幕
     * @param now 
     * @param updateCount 
     * @return isHit=是否命中 targets=命中的目标集 isOver=是否完毕
     */
    update(now: number): { isHit: boolean, targets: ProjectClientSceneObject[], isOver: boolean } {
        if (!Game.currentScene || this.isDisposed) {
            return { isHit: false, targets: [], isOver: true };
        }
        this.updateCount++;
        let speed = this.skill.bulletSpeed;
        let isHit;
        let targets: ProjectClientSceneObject[];
        let isOver;
        // 指向方向的技能
        let dt = now - this.startTime;
        if (this.skill.skillReleaseType >= 2) {
            if (dt >= this.maxDurationTime) {
                this.dispose();
                isOver = true;
            }
            else {
                targets = [];
                let per = dt / this.maxDurationTime;
                this.x = (this.toDx) * per + this.startX;
                this.y = (this.toDy) * per + this.startY;
                let allBattlers = GameBattleAction.getCurrentBattlers();
                for (let i = 0; i < allBattlers.length; i++) {
                    let targetBattler = allBattlers[i];
                    // 忽略掉无法被击中的目标
                    if (!GameBattleHelper.isCanHitBy(targetBattler, this.from)) {
                        continue;
                    }
                    // 已击中的情况
                    if (this.alreadyHitTarget[targetBattler.index]) {
                        continue;
                    }
                    // 目标符合的场合
                    if ((GameBattleHelper.isHostileSkill(this.skill) && GameBattleHelper.isHostileRelationship(this.from, targetBattler)) ||
                        (GameBattleHelper.isFriendlySkill(this.skill) && GameBattleHelper.isFriendlyRelationship(this.from, targetBattler))) {
                        let hitDx = Config.SCENE_GRID_SIZE / 2;
                        let hitDy = -Config.SCENE_GRID_SIZE / 2;
                        // 距离满足
                        let dis2 = Point.distanceSquare2(this.x, this.y, targetBattler.x + hitDx, targetBattler.y + hitDy);
                        if (dis2 <= this.hitRange2) {
                            isHit = true;
                            targets.push(targetBattler);
                            this.alreadyHitTarget[targetBattler.index] = true;
                            if (this.hitTargetCount != null) {
                                this.hitTargetCount--;
                                if (this.hitTargetCount == 0) {
                                    isOver = true;
                                    this.dispose();
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        // 指向目标的技能
        else {
            this.startTime = now;
            let px = speed * dt / 1000;
            let toX = this.targetBattler.x + this.toDx;
            let toY = this.targetBattler.y + this.toDy;
            let dis = Point.distance2(this.x, this.y, toX, toY);
            let per = px / dis;
            this.x = (toX - this.x) * per + this.x;
            this.y = (toY - this.y) * per + this.y;
            // 优化：非每帧都计算子弹朝向
            if (this.skill.bulletRotation && (this.updateCount == 1 || (this.updateCount % this.updateAngleInterval == 0))) {
                let angle = MathUtils.direction360(this.x, this.y, toX, toY);
                this.rotation = angle;
            }
            if (dis <= px) {
                isHit = true;
                // 忽略掉无法被击中的目标
                if (GameBattleHelper.isCanHitBy(this.targetBattler, this.from)) {
                    targets = [this.targetBattler];
                }
                else {
                    targets = [];
                }
                isOver = true;
                Game.currentScene.sceneObjectLayer.removeChild(this);
                this.dispose();
            }
        }
        return { isHit: isHit, targets: targets, isOver: isOver };
    }
}
