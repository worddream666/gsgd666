/**
 * 自定义场景对象行为
 * 一个对象可能拥有多层行为，当前总是执行最后层的行为
 * 当行为播放完毕的时候根据循环决定是否重复播放或是清除行为
 * 当处于logicPause状态下时会不在继续执行后面的行为
 * 
 * Created by 黑暗之神KDS on 2019-08-07 13:24:13.
 */
class ProjectSceneObjectBehaviors extends SceneObjectBehaviors {
    /**
     * 执行行为者（可能是执行事件者或触发事件者或者其他指定的对象）
     */
    declare so: ProjectClientSceneObject;
    /**
     * 触发事件者
     */
    declare targetSceneObject: ProjectClientSceneObject;
    /**
     * 执行事件者（派发行为者）
     */
    declare executor: ProjectClientSceneObject;
    /**
     * 需要恢复的移动行为
     */
    needRecoveryMoveInfo: any;
    /**
     * 执行事件页中
     */
    private executeCommandPageFragment: boolean;
    /**
     * [行为编辑器专用]-记录预设的影子
     */
    private soModule_shadow_default: [number, number, number];
    /**
     * 等待动作结束
     */
    protected isWaitingActionOver: boolean;
    /**
     * 逻辑用的暂停标识，比如行为在运动结束前不在执行下一步动作（如配合Game.pause的效果）
     * 实现类可以根据具体的游戏规则重写该属性，以便能够正确的暂停下一步行为执行
     * 如RPG中处于移动中的对象只有等待执行完毕后再继续执行：
     */
    // @ts-ignore
    protected get logicPause(): boolean {
        return (this.executeCommandPageFragment || this.so.isMoving || this.so.isJumping || this.isWaitingActionOver) ? true : false;
    }
    /**
     * 重置：还原到最初始的状态
     * 仅在行为编辑器预览使用，项目层需要实现行为的重置，以便预览时能够正确显示效果
     */
    reset(defSceneObejct: SceneObject): void {
        // 模块初始化：1-影子
        if (this.soModule_shadow_default) {
            this.so.addModuleByID(1);
            let soModuleShadow = this.so.getModule(1) as SoModule_Shadow;
            soModuleShadow.shadowWidth = this.soModule_shadow_default[0];
            soModuleShadow.shadowHeight = this.soModule_shadow_default[1];
            soModuleShadow.shadowAlpha = this.soModule_shadow_default[2];
        }
        else {
            this.so.removeModuleByID(1);
        }
        // 其他初始化
        this.so.stopMove();
        this.so.stopAllAnimation();
        ObjectUtils.clone(defSceneObejct, this.so);
        this.so.scene.camera.sceneObject = this.so;
        this.so.scene.updateCamera();
        this.so.refreshCoordinate();
    }
    /**
     * 构造函数
     * @param so 执行行为的场景对象
     * @param loop 是否循环
     * @param targetSceneObject 事件触发者
     * @param onOver 当行为执行完毕时回调 onOver(soBehavior:SceneObjectBehaviors)
     * @param startIndex [可选] 默认值=0 起始行为索引行 
     * @param executor [可选] 默认值=null 事件执行者（也是行为派发者）
     */
    constructor(so: SceneObjectEntity, loop: boolean, targetSceneObject: SceneObject, onOver: Callback, startIndex: number = 0, executor: SceneObjectEntity = null) {
        super(so, loop, targetSceneObject, onOver, startIndex, executor);
        // 记录模块参数，以便还原：1-影子
        if (Config.BEHAVIOR_EDIT_MODE) {
            let soModule_shadow = this.so.getModule(1) as SoModule_Shadow;
            if (soModule_shadow) this.soModule_shadow_default = [soModule_shadow.shadowWidth, soModule_shadow.shadowHeight, soModule_shadow.shadowAlpha];
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 行为处理
    //------------------------------------------------------------------------------------------------------
    /**
     * 设置行走图
     * 该行为系统内置，由项目层实现
     * @param avatarID 行走图ID
     * @param actID 动作
     * @param frame 帧数
     * @param ori  [可选] 默认值=null 表示面向
     */
    private behavior0(avatarID: number, actID: number, frame: number, ori: number = null): void {
        this.so.avatarID = avatarID;
        this.so.avatarAct = actID;
        this.so.avatarFrame = frame;
        this.so.avatarOri = ori;
    }
    //------------------------------------------------------------------------------------------------------
    // 移动
    //------------------------------------------------------------------------------------------------------
    /** 向下移动一步 2 */
    private behavior1() {
        this.behaviorMoveD(0, 1);
    }
    /** 向左移动一步 4 */
    private behavior2() {
        this.behaviorMoveD(-1, 0);
    }
    /** 向上移动一步 8 */
    private behavior3() {
        this.behaviorMoveD(0, -1);
    }
    /** 向右移动一步 6 */
    private behavior4() {
        this.behaviorMoveD(1, 0);
    }
    /** 向左下移动一步 1 */
    private behavior5() {
        this.behaviorMoveD(-1, 1);
    }
    /** 向右下移动一步 3 */
    private behavior6() {
        this.behaviorMoveD(1, 1);
    }
    /** 向左上移动一步 7 */
    private behavior7() {
        this.behaviorMoveD(-1, -1);
    }
    /** 向右上移动一步 9 */
    private behavior8() {
        this.behaviorMoveD(1, -1);
    }
    /** 随机移动一步 */
    private behavior9() {
        let arr = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        if (!WorldData.moveDir4 && !this.so.behaviorDir4) {
            arr.push([-1, -1], [1, 1], [1, -1], [-1, 1]);
        }
        let dp = arr[MathUtils.rand(arr.length)]
        // 随机移动视为强制忽略无法移动的场合，需要在此次移动结束后恢复原来的状态
        let currentIgnoreCantMove = this.so.ignoreCantMove;
        this.so.ignoreCantMove = true;
        if (!currentIgnoreCantMove) {
            this.behaviors.splice(this.index, 0, [this.behavior37, [1, true, this.so.keepMoveActWhenCollsionObstacleAndIgnoreCantMove]]);
        }
        this.behaviorMoveD(dp[0], dp[1], true, true);
    }
    /** 靠近场景对象 */
    private behavior10(type: number, useVar: number, varID: number, soIndex: number, flip: number = 1) {
        if (Config.BEHAVIOR_EDIT_MODE) return;
        // 获取目标对象
        let targetSceneObject: ProjectClientSceneObject;
        if (type == 0) targetSceneObject = Game.player.sceneObject;
        else if (type == 1) targetSceneObject = this.targetSceneObject;
        else if (type == 2) targetSceneObject = this.executor;
        else {
            if (useVar == 1) {
                soIndex = Game.player.variable.getVariable(varID);
            }
            if (soIndex < 0) return;
            targetSceneObject = this.so.scene.sceneObjects[soIndex];
        }
        // 如果目标对象存在且不是自己的话则开始执行
        if (targetSceneObject && this.so != targetSceneObject) {
            let px = targetSceneObject.x - this.so.x;
            let py = targetSceneObject.y - this.so.y;
            if (Math.abs(px) < Config.SCENE_GRID_SIZE / 2) px = 0;
            if (Math.abs(py) < Config.SCENE_GRID_SIZE / 2) py = 0;
            let dx = px < 0 ? -1 : px == 0 ? 0 : 1;
            let dy = py < 0 ? -1 : py == 0 ? 0 : 1;
            if (ClientWorld.data.moveDir4 || this.so.behaviorDir4) {
                if (Math.abs(dx) == 1 && Math.abs(dy) == 1) {
                    px > py ? dy = 0 : dx = 0;
                }
            }
            this.behaviorMoveD(dx * flip, dy * flip);
        }
    }
    /** 远离玩家移动一步 */
    private behavior11(type: number, useVar: number, varID: number, soIndex: number) {
        this.behavior10(type, useVar, varID, soIndex, -1);
    }
    /** 移动至 */
    private behavior12(useVar: number, x: number, y: number, autoFindRoad: boolean, xVarID: number, yVarID: number, useGrid: boolean, relative: boolean, whenCantMoveRetry: boolean, moveToGridCenter: boolean, ifObstacleHandleMode: number, mode: any) {
        // 使用变量指定坐标的场合
        if (useVar == 1) {
            x = Game.player.variable.getVariable(xVarID);
            y = Game.player.variable.getVariable(yVarID);
            if (Config.BEHAVIOR_EDIT_MODE) return;
        }
        // 相对坐标
        if (relative) {
            if (!useGrid) {
                x += this.so.x;
                y += this.so.y;
            }
            else {
                if (!moveToGridCenter) {
                    x += this.so.x / Config.SCENE_GRID_SIZE;
                    y += this.so.y / Config.SCENE_GRID_SIZE;
                }
                else {
                    x += this.so.posGrid.x;
                    y += this.so.posGrid.y;
                }

            }
        }
        // 根据是否格子坐标计算实际到达的坐标点
        let toP: Point = useGrid ? ((moveToGridCenter || !relative || !useGrid) ? GameUtils.getGridCenter(new Point(x * Config.SCENE_GRID_SIZE, y * Config.SCENE_GRID_SIZE)) : new Point(x * Config.SCENE_GRID_SIZE, y * Config.SCENE_GRID_SIZE)) : new Point(x, y);
        // 忽略范围外
        if (this.so.scene.sceneUtils.isOutside(toP)) {
            return;
        }
        // 行为编辑器模式下直接设置值
        if (this.ignoreProcess) {
            this.so.x = toP.x;
            this.so.y = toP.y;
        }
        else {
            // 移动
            if (mode == null) {
                // 自动寻路
                if (autoFindRoad) {
                    this.so.autoFindRoadMove(toP.x, toP.y, ifObstacleHandleMode, 0, true, whenCantMoveRetry, true, this.so.behaviorDir4);
                }
                // 直接去往
                else {
                    this.so.startMove([[toP.x, toP.y]], Game.oneFrame);
                }
            }
            // 跳跃/设置位置
            else {
                // 等待或忽略的情况:遇到障碍后
                if (ifObstacleHandleMode == 0 || ifObstacleHandleMode == 2) {
                    if (!this.so.through && this.so.scene.sceneUtils.isObstacle(toP, this.so)) {
                        if (ifObstacleHandleMode == 0) this.index--;
                        return;
                    }
                }
                if (mode == 1) this.so.jumpTo(toP.x, toP.y);
                else this.so.setTo(toP.x, toP.y);
            }
        }
    }
    /** 跳跃至坐标 */
    private behavior13(useVar: number, x: number, y: number, xVarID: number, yVarID: number, useGrid: boolean, relative: boolean, ifObstacleHandleMode: number, moveToGridCenter: boolean) {
        this.behavior12(useVar, x, y, false, xVarID, yVarID, useGrid, relative, false, moveToGridCenter, ifObstacleHandleMode, 1);
    }
    /** 设置至坐标 */
    private behavior14(useVar: number, x: number, y: number, xVarID: number, yVarID: number, useGrid: boolean, relative: boolean, ifObstacleHandleMode: number, moveToGridCenter: boolean) {
        this.behavior12(useVar, x, y, false, xVarID, yVarID, useGrid, relative, false, moveToGridCenter, ifObstacleHandleMode, 2);
    }
    /** 等待 */
    private behavior15(useVar: number, waitF: number, waitFVarID: number): void {
        if (useVar) {
            waitF = Game.player.variable.getVariable(waitFVarID);
            if (Config.BEHAVIOR_EDIT_MODE) waitF = 30;
        }
        this.waitFrame(waitF);
    }
    //------------------------------------------------------------------------------------------------------
    // 面向
    //------------------------------------------------------------------------------------------------------
    /** 面向朝下 */
    private behavior16() {
        this.so.avatarOri = 2;
    }
    /** 面向朝左 */
    private behavior17() {
        this.so.avatarOri = 4;
    }
    /** 面向朝上 */
    private behavior18() {
        this.so.avatarOri = 8;
    }
    /** 面向朝右 */
    private behavior19() {
        this.so.avatarOri = 6;
    }
    /** 面向朝左下 */
    private behavior20() {
        this.so.avatarOri = 1;
    }
    /** 面向朝右下 */
    private behavior21() {
        this.so.avatarOri = 3;
    }
    /** 面向朝左上 */
    private behavior22() {
        this.so.avatarOri = 7;
    }
    /** 面向朝右上 */
    private behavior23() {
        this.so.avatarOri = 9;
    }
    /** 随机朝向 */
    private behavior24() {
        let arr = [2, 4, 6, 8];
        if (!WorldData.moveDir4 && !this.so.behaviorDir4) {
            arr.push(1, 3, 7, 9);
        }
        this.so.avatarOri = arr[MathUtils.rand(arr.length)]
    }
    /** 面向指定的场景对象 */
    private behavior25(type: number, useVar: number, soIndexVarID, soIndex: number, isFlip: boolean) {
        if (Config.BEHAVIOR_EDIT_MODE) return;
        // 获取目标对象
        let targetSceneObject: ProjectClientSceneObject;
        if (type == 0) targetSceneObject = Game.player.sceneObject;
        else if (type == 1) targetSceneObject = this.targetSceneObject;
        else if (type == 2) targetSceneObject = this.executor;
        else {
            if (useVar) {
                soIndex = Game.player.variable.getVariable(soIndexVarID);
            }
            if (soIndex < 0) return;
            targetSceneObject = this.so.scene.sceneObjects[soIndex];
        }
        if (!targetSceneObject) return;
        let angle = MathUtils.direction360(this.so.x, this.so.y, targetSceneObject.x, targetSceneObject.y);
        let ori = GameUtils.getOriByAngle(angle);
        this.so.avatarOri = isFlip ? GameUtils.getFlipOri(ori) : ori;
    }
    /** 背向指定的场景对象 */
    private behavior26(type: number, useVar: number, soIndexVarID: number, soIndex: number) {
        this.behavior25(type, useVar, soIndexVarID, soIndex, true);
    }
    /** 使用变量指定面向 */
    private behavior27(oriVarID: number) {
        if (Config.BEHAVIOR_EDIT_MODE) return;
        let ori = Game.player.variable.getVariable(oriVarID);
        this.so.avatarOri = ori;
    }
    //------------------------------------------------------------------------------------------------------
    // 行走图相关
    //------------------------------------------------------------------------------------------------------
    /** 更改体型 */
    private behavior28(useVar: boolean, v: number, varID: number) {
        if (useVar) {
            v = Game.player.variable.getVariable(varID);
            if (Config.BEHAVIOR_EDIT_MODE) v = 1;
        }
        this.so.scale = v;
    }
    /** 更改移动速度 */
    private behavior29(useVar: boolean, v: number, varID: number) {
        if (useVar) {
            v = Game.player.variable.getVariable(varID);
            if (Config.BEHAVIOR_EDIT_MODE) v = 200;
        }
        this.so.moveSpeed = v;
    }
    /** 更改透明度 */
    private behavior30(useVar: boolean, v: number, varID: number) {
        if (useVar) {
            v = Game.player.variable.getVariable(varID);
            if (Config.BEHAVIOR_EDIT_MODE) v = 1;
        }
        this.so.avatarAlpha = v;
    }
    /** 更改色相 */
    private behavior31(useVar: boolean, v: number, varID: number) {
        if (useVar) {
            v = Game.player.variable.getVariable(varID);
            if (Config.BEHAVIOR_EDIT_MODE) v = 0;
        }
        this.so.avatarHue = v;
    }
    /** 更改动作播放帧率 */
    private behavior32(useVar: boolean, v: number, varID: number) {
        if (useVar) {
            v = Game.player.variable.getVariable(varID);
            if (Config.BEHAVIOR_EDIT_MODE) v = 12;
        }
        this.so.avatarFPS = v;
    }
    /** 更改影子 */
    private behavior33(enabled: number, w: number, h: number, alpha: number) {
        if (enabled) {
            let soModule = this.so.getModule(1);
            if (!soModule) soModule = this.so.addModuleByID(1);
            if (soModule) {
                let soModule_shadow = soModule as SoModule_Shadow;
                soModule_shadow.shadowWidth = w;
                soModule_shadow.shadowHeight = h;
                soModule_shadow.shadowAlpha = alpha;
                soModule_shadow.refresh();
            }
        }
        else {
            this.so.removeModuleByID(1);
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 媒体
    //------------------------------------------------------------------------------------------------------
    /** 播放动画 */
    private behavior34(aniID: number, showHitEffect: boolean, loop: boolean, fps: number, useVar: boolean, varID: number, waitOver: boolean) {
        if (useVar) {
            aniID = Game.player.variable.getVariable(varID);
            if (Config.BEHAVIOR_EDIT_MODE) aniID = 0;
        }
        let ani = this.so.playAnimation(aniID, loop, showHitEffect ? true : false, fps);
        if (ani && waitOver) {
            this.isWaitingActionOver = true;
            ani.once(GCAnimation.PLAY_COMPLETED, this, () => {
                this.isWaitingActionOver = false;
                this.update();
            });
        }
    }
    /** 停止动画 */
    private behavior35(useVar: boolean, aniID: number, varID: number) {
        if (useVar && !Config.BEHAVIOR_EDIT_MODE) aniID = Game.player.variable.getVariable(varID);
        this.so.stopAnimation(aniID);
    }
    /** 播放音效 */
    private behavior36(url: string, varID: number, useVar: number) {
        if (this.ignoreProcess) return;
        url = useVar == 1 ? Game.player.variable.getString(varID) : url;
        GameAudio.playSE(url, 1, 1, this.so);
    }
    //------------------------------------------------------------------------------------------------------
    // 状态
    //------------------------------------------------------------------------------------------------------
    /**
     * 忽略不能移动的场合
     * @param v 是否忽略不能移动的场合 0=ON 1=OFF
     * @param keepMoveActWhenCollsionObstacleAndIgnoreCantMove 
     * @param systemRecovery 来自系统恢复还原此前的设置
     */
    private behavior37(v: number, keepMoveActWhenCollsionObstacleAndIgnoreCantMove: boolean, systemRecovery: boolean) {
        this.so.ignoreCantMove = v == 0 ? true : false;
        this.so.keepMoveActWhenCollsionObstacleAndIgnoreCantMove = keepMoveActWhenCollsionObstacleAndIgnoreCantMove;
        if (systemRecovery) {
            this.behaviors.splice(this.index - 1, 1);
            this.index--;
        }
    }
    /** 允许选中 */
    private behavior38(v: number) {
        this.so.selectEnabled = v == 0 ? true : false;
    }
    /** 固定朝向 */
    private behavior39(v: number) {
        this.so.fixOri = v == 0 ? true : false;
    }
    /** 更改显示层次 */
    private behavior40(v: number) {
        this.so.layerLevel = v;
    }
    /** 桥属性 */
    private behavior41(v: number) {
        this.so.bridge = v == 0 ? true : false;
    }
    /** 自动播放动作 */
    private behavior42(v: number) {
        this.so.autoPlayEnable = v == 0 ? true : false;
    }
    /** 移动时自动切换动作 */
    private behavior43(v: number) {
        this.so.moveAutoChangeAction = v == 0 ? true : false;
    }
    /** 穿透 */
    private behavior44(v: number) {
        this.so.through = v == 0 ? true : false;
    }
    /** 限定四方向 */
    private behavior45(v: number) {
        this.so.behaviorDir4 = v == 0 ? true : false;
    }
    //------------------------------------------------------------------------------------------------------
    // 行走图
    //------------------------------------------------------------------------------------------------------
    /** 更改行走图ID */
    private behavior46(useVar: boolean, avatarID: number, avatarIDVarID: number) {
        this.so.avatarID = useVar ? Game.player.variable.getVariable(avatarIDVarID) : avatarID;
    }
    /** 更改动作 */
    private behavior47(useVar: boolean, actionID: number, actionIDVarID: number, once: boolean, waitOver: boolean) {
        let actID = useVar ? Game.player.variable.getVariable(actionIDVarID) : actionID;
        if (once) {
            if (this.so.avatar.hasActionID(actID)) {
                if (waitOver) {
                    this.isWaitingActionOver = true;
                }
                this.so.avatar.currentFrame = this.so.avatar.currentFrame % this.so.avatar.totalFrame;
                this.so.avatar.once(Avatar.ACTION_PLAY_COMPLETED, this, () => {
                    this.so.avatarFrame = this.so.avatar.totalFrame;
                    this.so.autoPlayEnable = false;
                    this.isWaitingActionOver = false;
                });
            }
        }
        this.so.avatarAct = useVar ? Game.player.variable.getVariable(actionIDVarID) : actionID;
    }
    /** 更改帧 */
    private behavior48(useVar: boolean, frame: number, frameVarID: number) {
        this.so.avatarFrame = useVar ? Game.player.variable.getVariable(frameVarID) : frame;
    }
    //------------------------------------------------------------------------------------------------------
    // 其他
    //------------------------------------------------------------------------------------------------------
    /** 事件页：触发者-事件触发者 执行者-自身 */
    private behavior49(feData: string) {
        if (Config.BEHAVIOR_EDIT_MODE) return;
        this.executeCommandPageFragment = true;
        CommandPage.startTriggerFragmentEvent(feData, this.targetSceneObject, this.executor, Callback.New(() => {
            this.executeCommandPageFragment = false;
            this.sceneObjectUpdate();
        }, this));
    }
    /** 编辑器预览 */
    private behavior50(x: number, y: number, avatarID: number, actionID: number, ori: number, usePos: boolean, useAvatarID: boolean, useActionID: boolean, useOri: boolean, isGrid: boolean) {
        if (!Config.BEHAVIOR_EDIT_MODE) return;
        if (usePos) {
            this.so.x = isGrid ? x * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE / 2 : x;
            this.so.y = isGrid ? y * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE / 2 : y;
        }
        if (useAvatarID) {
            this.so.avatarID = avatarID;
        }
        if (useActionID) {
            this.so.avatarAct = actionID;
        }
        if (useOri) {
            let mappings = [8, 2, 4, 6, 7, 1, 9, 3];
            this.so.avatarOri = mappings[ori];
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 内部方法
    //------------------------------------------------------------------------------------------------------
    private behaviorMoveD(dx: number, dy: number, forceIgnoreCantMove: boolean = false, checkObstacle: boolean = false): void {
        if (!this.so.scene) return;
        let toGrid = GameUtils.getGridPostion(new Point(this.so.x, this.so.y));
        toGrid.x += dx;
        toGrid.y += dy;
        // 步进统一进入到格子中心点
        let toP = new Point(toGrid.x * Config.SCENE_GRID_SIZE, toGrid.y * Config.SCENE_GRID_SIZE);
        toP = GameUtils.getGridCenter(toP);
        let hasObs = false;
        // 无需移动的情况
        if (dx == 0 && dy == 0) {
            hasObs = true;
        } else {
            // -- 行为编辑器中需要计算障碍的情况
            if (Config.BEHAVIOR_EDIT_MODE || checkObstacle) {
                if (!this.so.through) {
                    if (this.so.scene.sceneUtils.isObstacleGrid(toGrid, this.so)) {
                        hasObs = true;
                    }
                }
                // -- 需要计算边界
                else {
                    if (this.so.scene.sceneUtils.isOutsideByGrid(toGrid)) {
                        hasObs = true;
                    }
                }
            }
        }
        if (hasObs) {
            // 如果不是忽略无法移动的场合则等待
            if (!this.so.ignoreCantMove && !forceIgnoreCantMove) {
                this.index--;
            }
            return;
        }
        // -- 判断是否允许移动的情况
        if (this.ignoreProcess) {
            if (!this.so.fixOri) this.so.avatarOri = GameUtils.getOriByAngle(MathUtils.direction360(this.so.x, this.so.y, toP.x, toP.y));
            this.so.x = toP.x;
            this.so.y = toP.y;
        }
        else {
            // 移动结束后立即更新一下当前的行为执行者
            this.so.startMove([[toP.x, toP.y]], Game.oneFrame, WorldData.moveToGridCenter, Callback.New(this.sceneObjectUpdate, this));
        }
    }
    /**
     * 刷新场景对象
     */
    private sceneObjectUpdate() {
        this.so.update(Game.now);
    }
}
SceneObjectBehaviors.implClass = ProjectSceneObjectBehaviors;
