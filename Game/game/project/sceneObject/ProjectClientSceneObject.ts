/**
 * 场景对象绑定类示例
 * Created by 黑暗之神KDS on 2020-09-08 17:00:01.
 */
class ProjectClientSceneObject extends SceneObjectCommon {
    /**
     * 面向
     */
    static CHANGE_ORI: string = "so_1CHANGE_ORI";
    /**
     * 移动开始事件 onMoveStart(fromAutoRetry:boolean) fromAutoRetry=是否来自自动重试的移动
     */
    static MOVE_START: string = "so_1MOVE_START";
    /**
     * 移动结束事件
     */
    static MOVE_OVER: string = "so_1MOVE_OVER";
    /**
     * 跳跃开始事件
     */
    static JUMP_START: string = "so_1JUMP_START";
    /**
     * 跳跃结束事件
     */
    static JUMP_OVER: string = "so_1JUMP_OVER";
    /**
     * 碰撞事件 onCollision(touchRes:{ isObstacle: boolean, touchSceneObjects: ProjectClientSceneObject[] })
     */
    static COLLISION: string = "so_1COLLISION";
    /**
     * 碰触事件 onTouch(toucher:ProjectClientSceneObject)
     */
    static TOUCH: string = "so_TOUCH";
    /**
     * 离开碰触事件 onTouch(awayer:ProjectClientSceneObject)
     */
    static AWAY_TOUCH: string = "so_AWAY_TOUCH";
    //------------------------------------------------------------------------------------------------------
    // RPG通用属性
    //------------------------------------------------------------------------------------------------------
    /**
     * 唯一ID
     */
    sid: number = ObjectUtils.getInstanceID();
    /**
     * 所属的场景
     */
    declare scene: ProjectClientScene;
    /**
     * 行为状态：是否处于跳跃中
     */
    isJumping: boolean;
    /**
     * 当前所在的坐标点，Point版
     */
    pos: Point = new Point();
    /**
     * 当前所在的格子位置，通过refreshCoordinate刷新计算而来的缓存数据
     */
    posGrid: Point = new Point(-1, -1);
    /**
     * 当前所在位置的矩形数据
     */
    posRect: Rectangle = new Rectangle();
    /**
     * 想要到达的点（如用于SceneUtils.getAroundPositions计算）
     */
    wantToGoGrid: Point;
    /**
     * 已经保存记录的移动路径信息（如通过命令临时记录使用）
     */
    recordMoveRoadInfo: any;
    /**
     * 禁止行为
     */
    banBehavior: boolean;
    /**
     * 禁止动作
     */
    banAvatarAction: boolean;
    /**
     * 事件开始等待的状态记录（需要进入存档）
     */
    protected eventStartWaitInfo: any;
    /**
     * 行为集，由多个行为组合而成，重写变量属性以便类别指向项目层的 ProjectSceneObjectBehaviors
     */
    protected behaviors: ProjectSceneObjectBehaviors[] = [];
    /**
     * 重试自动寻路标识
     */
    protected needRetryAutoFindRoadMoveSign: any;
    /**
     * 我的上一次接触者列表
     */
    protected myLastTouchObjects: ProjectClientSceneObject[] = [];
    /**
     * 是否来自恢复存档数据
     */
    isFromRecorySaveData: boolean;
    /**
     * 恢复存档时的帧记录，以便在当前不会新触发事件
     */
    protected fromRecorySaveDataGameFrame: number;
    /**
     * 禁止发送下一个移动开始事件
     */
    protected stopSendNextMoveStartEvent: boolean;
    /**
     * 禁止发送下一个移动结束事件
     */
    protected stopSendNextMoveOverEvent: boolean;
    /**
     * 记录的行为
     */
    protected _recordBehaviors: ProjectSceneObjectBehaviors[];
    //------------------------------------------------------------------------------------------------------
    // 辅助计算
    //------------------------------------------------------------------------------------------------------
    protected tempGridPosHelper: Point = new Point();
    /**
     * 上一次移动的趋势，由from位置移动至to位置（像素坐标）
     */
    moveTrendInfo: { from: Point, to: Point };
    /**
     * 上一次实际移动的信息，由from位置移动至to位置（像素坐标）
     */
    moveRealInfo: { from: Point, to: Point }
    //------------------------------------------------------------------------------------------------------
    // 构造
    //------------------------------------------------------------------------------------------------------
    /**
     * 构造函数
     * @param soData 场景对象数据
     * @param scene 所属场景
     */
    constructor(soData: SceneObject, scene: ClientScene) {
        super(soData, scene);
        if (!this.root) return;
        // Debug-显示碰撞盒
        if (WorldData.rectObsDebug && os.inGC() && !Config.RELEASE_GAME) {
            let size = WorldData.sceneObjectCollisionSize;
            let rect = new Rectangle(-size / 2, -size / 2, size - 1, size - 1);
            this.root.graphics.drawLines(0, 0, [rect.x, rect.y, rect.right, rect.y, rect.right, rect.bottom, rect.x, rect.bottom, rect.x, rect.y], "#FF0000", 1);
        }
        // Debug-显示碰撞盒
        if (WorldData.rectObsDebug && os.inGC() && !Config.RELEASE_GAME) {
            let size = WorldData.sceneObjectCollisionSize;
            let rect = new Rectangle(-size / 2, -size / 2, size - 1, size - 1);
            this.root.graphics.drawLines(0, 0, [rect.x, rect.y, rect.right, rect.y, rect.right, rect.bottom, rect.x, rect.bottom, rect.x, rect.y], "#FF0000", 1);
        }
        // 已进入场景完毕的情况下直接执行初始化函数
        if (GameGate.gateState >= GameGate.STATE_3_IN_SCENE_COMPLETE) {
            this.init();
        }
        // 否则等待进入完毕后再执行
        else {
            EventUtils.addEventListenerFunction(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, this.initState3, this);
        }
    }
    /**
     * 等待进入完毕后再执行初始化
     */
    private initState3(): void {
        if (GameGate.gateState == GameGate.STATE_3_IN_SCENE_COMPLETE) {
            this.init();
            EventUtils.removeEventListenerFunction(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, this.initState3, this);
        }
    }
    /**
     * 释放函数
     */
    dispose() {
        if (!this.isDisposed) {
            EventUtils.removeEventListenerFunction(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, this.initState3, this);
            EventUtils.removeEventListenerFunction(Game, Game.EVENT_PAUSE_CHANGE, this.onGamePauseChangeHandle, this);
            EventUtils.removeEventListenerFunction(Game, Game.EVENT_PAUSE_CHANGE, this.onStausPageChange, this);
        }
        super.dispose();
    }
    /**
     * 获取需要存档的自定义数据
     */
    getSaveData(): any {
        let o: any = { myLastTouchObjects: [], moveState: null, recordMoveRoadInfo: this.recordMoveRoadInfo, eventStartWaitInfo: this.eventStartWaitInfo };
        // 追加记录我当前的已接触者列表 myLastTouchObjects
        for (let i = 0; i < this.myLastTouchObjects.length; i++) {
            let myLastTouchSo = this.myLastTouchObjects[i];
            if (myLastTouchSo) o.myLastTouchObjects[i] = myLastTouchSo.index;
        }
        // 追加记录当前的移动状态
        o.moveState = this.getRecordMoveState();
        // 记录跳跃状态
        if (this.isJumping) {
            o.jumpState = {
                jumpTo: [this.jumpToPoint.x, this.jumpToPoint.y],
                currentJumpFrame: this.currentJumpFrame
            };
        }
        return o;
    }
    /**
     * 恢复需要存档的自定义数据
     */
    retorySaveData(o: any) {
        this.isFromRecorySaveData = true;
        // 恢复时的这一帧不再触发碰触事件
        this.fromRecorySaveDataGameFrame = __fCount;
        Callback.CallLaterBeforeRender(() => { this.isFromRecorySaveData = false; }, this);
        // 恢复我当前的已接触者列表 myLastTouchObjects
        for (let i = 0; i < o.myLastTouchObjects.length; i++) {
            let myLastTouchSoIndex = o.myLastTouchObjects[i];
            if (myLastTouchSoIndex != null) {
                let myLastTouchSo = Game.currentScene.sceneObjects[myLastTouchSoIndex];
                if (myLastTouchSo) this.myLastTouchObjects.push(myLastTouchSo);
            }
        }
        // 恢复移动状态
        this.restoryMove(o.moveState, true);
        // 恢复记录移动的记录
        this.recordMoveRoadInfo = o.recordMoveRoadInfo;
        // 恢复记录的正在的事件触发状态
        this.eventStartWaitInfo = o.eventStartWaitInfo;
        // 恢复跳跃状态
        if (o.jumpState) {
            this.jumpTo(o.jumpState.jumpTo[0], o.jumpState.jumpTo[1], o.jumpState.currentJumpFrame);
        }
        // 恢复触发器执行
        this.onGamePauseChangeHandle();
    }
    //------------------------------------------------------------------------------------------------------
    // 刷新
    //------------------------------------------------------------------------------------------------------
    /**
     * 刷新：场景会调用所有场景上的场景对象的该函数
     * @param nowTime 游戏时间戳（Game.pause会暂停游戏时间戳）
     */
    update(nowTime: number): void {
        // 处于移动中时刷新坐标
        if (this.isMoving) this.updateCoordinate(nowTime);
        // 刷新行为
        this.updateBehavior();
        // 刷新并行事件
        this.parallelEventUpdate();
    }
    //------------------------------------------------------------------------------------------------------
    // 行为
    //------------------------------------------------------------------------------------------------------
    /**
     * 添加一组行为
     * @param behaviorData 行为数据
     * @param loop 是否循环
     * @param targetSceneObject 目标对象
     * @param onOver 当行为结束时回调
     * @param cover 覆盖旧的行为
     * @param startIndex [可选] 默认值=0 行为起始索引
     * @param Immediate [可选] 默认值=true 是否立即执行，否则等待帧刷
     * @param forceStopLastBehavior  [可选] 默认值=false 是否强制停止此前正在执行的行为
     * @param delayFrame [可选] 默认值=0 行为内部的需要等待的帧数
     * @return 对象行为处理器
     */
    addBehavior(behaviorData: any[], loop: boolean, targetSceneObject: ProjectClientSceneObject, onOver: Callback, cover: boolean, startIndex: number = 0, Immediate: boolean = true, forceStopLastBehavior: boolean = false, delayFrame: number = 0, executor: SceneObjectEntity = null) {
        // 设置对象行为前的处理
        GameCommand.startCommonCommand(14016, [], null, this, this);
        // 新建一层行为，当该层行为结束时，通知并直接立刻继续执行上一层的行为
        let soBehavior: ProjectSceneObjectBehaviors = new ProjectSceneObjectBehaviors(this, loop, targetSceneObject as any, Callback.New((onOver: Callback, soBehavior: ProjectSceneObjectBehaviors) => {
            GameCommand.startCommonCommand(14017, [], null, this, this);
            let idx = this.behaviors.indexOf(soBehavior);
            if (idx != -1) this.behaviors.splice(idx, 1);
            onOver && onOver.run();
            this.updateBehavior();
        }, this, [onOver]), startIndex, executor);
        soBehavior.setBehaviors(behaviorData, delayFrame);
        // 如果是forceStopLastBehavior需要立刻停止行为执行
        if (forceStopLastBehavior) {
            this.stopBehavior(true);
        }
        // 覆盖模式下清空原行为
        if (cover) this.behaviors.length = 0;
        this.behaviors.push(soBehavior);
        // 立即执行行为，否则会在下一帧update时调用
        if (Immediate) this.updateBehavior();
        return soBehavior;
    }
    /**
     * 停止当前的行为，但不会清空行为列表，如果存在后续行为指令会继续执行。
     * 如果还想要清空行为列表，可以调用 clearBehaviors
     * @param force 强制停止，不必因移动至中心点而必须移动下一个最近的中心点才停止
     */
    stopBehavior(force: boolean = false) {
        if (this._isMoving) {
            this.stopMove(force);
        }
    }
    /**
     * 获取当前的行为层
     */
    getBehaviorLayer(): number {
        return this.behaviors.length;
    }
    /**
     * 记录行为
     */
    recordBehavior(): void {
        this._recordBehaviors = this.behaviors.concat();
    }
    /**
     * 恢复行为
     */
    recoveryBehavior(): void {
        if (this._recordBehaviors) {
            this.behaviors = this._recordBehaviors;
            this._recordBehaviors = null;
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 移动、跳跃、设置坐标
    //------------------------------------------------------------------------------------------------------
    /**
     * 直接设置坐标
     * @param x 
     * @param y 
     * @param stopMove [可选] 默认值=true 需要停止移动
     * @param integer [可选] 默认值=true 取整
     * @param alreadySetTempPosHelper [可选] 默认值=false [优化项]表示已计算过格子辅助体，无需重新计算
     * @param alreadySetRect [可选] 默认值=false [优化项]表示已计算过矩形范围，无需重新计算
     * @pparam clacTouchEvent [可选] 默认值=true 是否计算碰触事件
     */
    setTo(x: number, y: number, stopMove: boolean = true, integer: boolean = true, alreadySetTempPosHelper: boolean = false, alreadySetRect: boolean = false, clacTouchEvent: boolean = true) {
        if (this.isJumping) return;
        // 需要停止移动的场合
        if (stopMove) this.isMoving = false;
        // 取整进行设置坐标
        if (integer) {
            x = Math.floor(x);
            y = Math.floor(y);
        }
        this._x = x;
        this._y = y;
        this.root.pos(x, y);
        // 进入新的坐标后进行一些刷新
        this.refreshCoordinate(alreadySetTempPosHelper, alreadySetRect, clacTouchEvent);
    }
    /**
     * 自动寻路方式的移动
     * @param toX 目的地像素坐标x
     * @param toY 目的地像素坐标y
     * @param ifObstacleHandleMode [可选] 默认值=0 当目的地是障碍的处理场合 0忽略当前移动指令 1在目的地附近找到可通行点 2强行视为空地进行移动 
     * @param costTime [可选] 默认值=0 已花费的时间，移动根据当前时间与初始时间计算障碍
     * @param useAstar [可选] 默认值=true 使用Astar寻路，根据周围障碍信息进行寻路
     * @param whenCantMoveRetry [可选] 默认值=true 当无法移动的时候重试（下一帧重试）
     * @param useGridObstacle [可选] 默认值=true 使用格子障碍，关闭此项将使用矩形碰撞计算障碍
     * @param forceDir4 [可选] 默认值=false 是否强制四方向
     * @param fromAutoRetry [可选] 默认值=false 是否来自自动重试
     */
    autoFindRoadMove(toX: number, toY: number, ifObstacleHandleMode: number = 0, costTime: number = 0, useAstar: boolean = true, whenCantMoveRetry: boolean = false, useGridObstacle: boolean = true, forceDir4: boolean = false, fromAutoRetry: boolean = false) {
        // 跳跃中不允许移动
        if (this.isJumping) return;
        // 获取目的地
        let currentScene = Game.currentScene as ProjectClientScene;
        let realLineArr: number[][];
        let toP: Point = new Point(toX, toY);
        // 限制在屏幕范围内
        currentScene.sceneUtils.limitInside(toP);
        // 限制在格子中心点
        if (ClientWorld.data.moveToGridCenter) {
            GameUtils.getGridCenter(toP, toP);
        }
        // 忽略掉同位置
        if (toP.x == this.x && toP.y == this.y) return;
        // 如果是移动至格子中心且正处于移动中时，确保到达最近的格子中心后再启动移动
        if (ClientWorld.data.moveToGridCenter && this.isMoving) {
            return;
        }
        // 四方向寻路
        let moveDir4 = forceDir4 ? true : WorldData.moveDir4;
        // 清理重试
        this.clearRetryAutoFindRoadMove();
        // 如果我是可穿透事件的话直接两点
        if (this.through && !moveDir4) {
            realLineArr = [[toP.x, toP.y]];
        }
        else {
            // 如果是障碍点则优先选择就近的点 || currentScene.sceneUtils.isObstacle(new Point(so.x,so.y), so)
            if (ifObstacleHandleMode != 2) {
                // 目的地是障碍点的情况
                if (currentScene.sceneUtils.isObstacle(toP, this)) {
                    // 忽略当前移动指令：如果需要重试，则下一帧重试
                    if (ifObstacleHandleMode == 0) {
                        if (whenCantMoveRetry) this.retryAutoFindRoadMove(toX, toY, ifObstacleHandleMode, costTime, useAstar, whenCantMoveRetry, useGridObstacle);
                        return;
                    }
                    // 在目的地附近找到可通行点
                    let gridP = GameUtils.getGridPostion(toP);
                    let myGridP = GameUtils.getGridPostion(new Point(this.x, this.y));
                    gridP = SceneUtils.getNearThroughGrid(gridP, myGridP);
                    // 无法找到的情况：如果需要重试，则下一帧重试
                    if (!gridP) {
                        if (whenCantMoveRetry) this.retryAutoFindRoadMove(toX, toY, ifObstacleHandleMode, costTime, useAstar, whenCantMoveRetry, useGridObstacle);
                        return;
                    }
                    // 目的地改为最近的替代格中心点
                    gridP.x *= Config.SCENE_GRID_SIZE;
                    gridP.y *= Config.SCENE_GRID_SIZE;
                    toP = GameUtils.getGridCenter(gridP, toP);
                }
            }
            // 计算A星寻路：目的地强行视为空地或不视为空地时计算两者的寻路
            if (useAstar && (SceneUtils.twoPointHasObstacle(this.x, this.y, toP.x, toP.y, Game.currentScene as ProjectClientScene, this, ifObstacleHandleMode == 2) || moveDir4)) {
                realLineArr = AstarUtils.moveTo(this.x, this.y, toP.x, toP.y, Game.currentScene.gridWidth, Game.currentScene.gridHeight, Game.currentScene, moveDir4, ifObstacleHandleMode == 2, false, this);
                // 如果有参考点，且参考点可能无法通行的话，尝试直接走到人脸上
                if (!realLineArr || realLineArr.length === 0) {
                    realLineArr = AstarUtils.moveTo(this.x, this.y, toX, toY, Game.currentScene.gridWidth, Game.currentScene.gridHeight, Game.currentScene, moveDir4, true);
                    // 把最后一个点去掉
                    if (realLineArr && realLineArr.length > 0) {
                        realLineArr.pop();
                    }
                }
                if (!realLineArr) {
                    if (whenCantMoveRetry) {
                        this.retryAutoFindRoadMove(toX, toY, ifObstacleHandleMode, costTime, useAstar, whenCantMoveRetry, useGridObstacle);
                    }
                    return;
                }
            }
            else {
                realLineArr = [[toP.x, toP.y]]
            }
        }
        // 移动
        if (whenCantMoveRetry) {
            this.off(ProjectClientSceneObject.COLLISION, this, this.retryAutoFindRoadMove);
            this.once(ProjectClientSceneObject.COLLISION, this, this.retryAutoFindRoadMove, [toX, toY, ifObstacleHandleMode, costTime, useAstar, whenCantMoveRetry, useGridObstacle])
        }
        this.doStartMove(realLineArr, costTime, useGridObstacle, fromAutoRetry);
    }
    /**
     * 开始移动（此处不会预先计算障碍，纯粹根据指定的路径移动，但在移动过程中会判定障碍）
     * @param movePath 移动路径，首个坐标无需包含自己的坐标点
     * @param costTime [可选] 默认值=0 当前移动已花费的时间（客户端出现时可能其已在移动中途）
     * @param useGridObstacle [可选] 默认值=false 开启此项则使用格子计算障碍，否则使用矩形计算（A星计算移动则需要开启此项，通常按键可以使用矩形计算）
     * @param onMoveOver [可选] 默认值=null 当移动结束时回调，一般为无关紧要的事务处理，如果特别重要，可以自行加入到存档的自定义数据中，以便读档恢复该回调事件
     */
    startMove(movePath: number[][], costTime: number = 0, useGridObstacle: boolean = false, onMoveOver: Callback = null): void {
        if (this.isJumping) return;
        this.onMoveOver = onMoveOver;
        this.clearRetryAutoFindRoadMove();
        this.doStartMove.apply(this, arguments);
    }
    /**
     * 停止移动
     * @param force 强制停止，不必因移动至中心点而必须移动下一个最近的中心点才停止
     */
    stopMove(force: boolean = false) {
        this.stopSendNextMoveStartEvent = false;
        this.stopSendNextMoveOverEvent = false;
        // 如果是移动至格子中心的话需要重新规划路径，到达下一个最近的格子后才能够停止
        if (!Config.BEHAVIOR_EDIT_MODE && !force && WorldData.moveToGridCenter && this.isMoving) {
            let currentRoad = this.roadsArr[this.nowRoad + 1];
            let newToP: Point = new Point;
            let offsetX = Math.abs(currentRoad.x - this.x);
            let offsetY = Math.abs(currentRoad.y - this.y);
            // 坐标刚好
            if (offsetX == 0 && offsetX == offsetY) {
                this.isMoving = false;
                this.clearRetryAutoFindRoadMove();
                return;
            }
            // Y方向移动
            else if (offsetY > offsetX) {
                newToP.x = this.x;
                let trend = (currentRoad.y - this.y);
                let currentGridY = Math.floor(this.y / Config.SCENE_GRID_SIZE);
                let currentGridCenterY = currentGridY * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE / 2;
                if (trend < 0) {
                    if (this.y > currentGridCenterY) {
                        newToP.y = currentGridCenterY;
                    }
                    else {
                        newToP.y = currentGridCenterY - Config.SCENE_GRID_SIZE;
                    }
                }
                else {
                    if (this.y < currentGridCenterY) {
                        newToP.y = currentGridCenterY;
                    }
                    else {
                        newToP.y = currentGridCenterY + Config.SCENE_GRID_SIZE;
                    }
                }
            }
            // X方向移动
            else {
                newToP.y = this.y;
                let trend = (currentRoad.x - this.x) / (Math.abs(currentRoad.x - this.x));
                let currentGridX = Math.floor(this.x / Config.SCENE_GRID_SIZE);
                let currentGridCenterX = currentGridX * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE / 2;
                if (trend < 0) {
                    if (this.x > currentGridCenterX) {
                        newToP.x = currentGridCenterX;
                    }
                    else {
                        newToP.x = currentGridCenterX - Config.SCENE_GRID_SIZE;
                    }
                }
                else {
                    if (this.x < currentGridCenterX) {
                        newToP.x = currentGridCenterX;
                    }
                    else {
                        newToP.x = currentGridCenterX + Config.SCENE_GRID_SIZE;
                    }
                }
            }
            // 如果目的地存在障碍
            if (Game.currentScene.sceneUtils.isObstacle(newToP, this)) {
                this.isMoving = false;
                this.clearRetryAutoFindRoadMove();
                let thisGrid = GameUtils.getGridCenterByGrid(this.posGrid);
                this.setTo(thisGrid.x, thisGrid.y);
                return;
            }
            // 重新规划路径，至少需要走到下一个格子中心点，而非立即停止移动后转向
            this.updateCoordinate(Game.now);
            this.isMoving = false;
            this.clearRetryAutoFindRoadMove();
            this.stopSendNextMoveStartEvent = true;
            this.stopSendNextMoveOverEvent = true;
            this.startMove([[newToP.x, newToP.y]], 0, false, null);
        }
        else {
            this.isMoving = false;
            this.clearRetryAutoFindRoadMove();
        }
    }
    /**
     * 跳跃至
     * @param x 
     * @param y 
     * @param costFrame 已经花费的游戏帧数
     */
    jumpTo(x: number, y: number, costFrame: number = 0) {
        if (this.isJumping) return;
        this.isMoving = false;
        this.isJumping = true;
        this.jumpToPoint = new Point(x, y);
        this.event(ProjectClientSceneObject.JUMP_START);
        let oldX = this.x;
        let oldY = this.y;
        let toJumpUpY = -ClientWorld.data.jumpHeight;
        let toJumpDownY = 0;
        let oldJumpY = this.jumpY;
        this.currentJumpFrame = costFrame;
        // 计算需要修改的朝向
        if (!this.fixOri) {
            if (this.x != x || this.y != y) {
                let dir = GameUtils.getOriByAngle(MathUtils.direction360(this.x, this.y, x, y));
                this.avatarOri = dir;
            }
        }
        // 计算需要花费的游戏帧数
        let frameTotal = Math.ceil(ClientWorld.data.jumpTimeCost * 1000 / Game.oneFrame);
        let frameHalf = frameTotal / 2;
        os.add_ENTERFRAME(() => {
            if (this.isDisposed) {
                // @ts-ignore
                os.remove_ENTERFRAME(arguments.callee, this);
                return;
            }
            if (Game.pause) return;
            this.currentJumpFrame++;
            // 已经结束的情况
            if (this.currentJumpFrame > frameTotal) {
                // @ts-ignore
                os.remove_ENTERFRAME(arguments.callee, this);
                this.isJumping = false;
                if (this.inScene) {
                    this.refreshCoordinate();
                    this.event(ProjectClientSceneObject.JUMP_OVER);
                }
                return;
            }
            // 位置偏移
            let per1 = this.currentJumpFrame / frameTotal;
            let func1 = Ease.linearNone;
            this.x = func1(per1, oldX, x - oldX, 1);
            this.y = func1(per1, oldY, y - oldY, 1);
            // 高度偏移
            let per2, func2, toJumpY;
            if (this.currentJumpFrame <= frameHalf) {
                per2 = this.currentJumpFrame / frameHalf;
                func2 = Ease.quintOut;
                toJumpY = toJumpUpY;
            }
            else {
                per2 = (this.currentJumpFrame - frameHalf) / frameHalf;
                func2 = Ease.quintIn;
                toJumpY = toJumpDownY;
                oldJumpY = toJumpUpY;
            }
            let jumpY = func2(per2, oldJumpY, toJumpY - oldJumpY, 1);
            this.jumpY = jumpY;
        }, this);
    }
    /**
     * 记录移动状态
     */
    getRecordMoveState() {
        if (!this._isMoving) return null;
        return {
            useGridObstacle: this.useGridObstacle,
            roadsArr: ObjectUtils.depthClone(this.roadsArr),
            roadMax: this.roadMax,
            nowRoad: this.nowRoad,
            nowRoadStartDate: this.nowRoadStartDate,
            nowRoadTime: this.nowRoadTime,
            thisRoadS: this.thisRoadS,
            recordNow: Game.now,
            moveSpeed: this.moveSpeed
        }
    }
    /**
     * 恢复移动状态
     * @param force 强行恢复，无论当前是否正处于移动状态中
     */
    restoryMove(recordMoveStateInfo: any, force: boolean = false) {
        if (!recordMoveStateInfo) return;
        if (force || !this._isMoving) {
            this.useGridObstacle = recordMoveStateInfo.useGridObstacle;
            this.roadsArr = recordMoveStateInfo.roadsArr;
            this.nowRoad = recordMoveStateInfo.nowRoad;
            this.nowRoadStartDate = recordMoveStateInfo.nowRoadStartDate + (Game.now - recordMoveStateInfo.recordNow);
            this.nowRoadTime = recordMoveStateInfo.nowRoadTime;
            this.thisRoadS = recordMoveStateInfo.thisRoadS;
            // 恢复行动时如果移动速度已改变的话，重头开始
            if (this.moveSpeed != recordMoveStateInfo.moveSpeed) {
                // 重新按照剩余的路线触发
                let t = Game.now - this.nowRoadStartDate;
                let s = t * recordMoveStateInfo.moveSpeed;
                let roadArr = [];
                for (let i = this.nowRoad + 1; i < this.roadsArr.length; i++) {
                    let p = this.roadsArr[i];
                    roadArr.push([p.x, p.y]);
                }
                this.startMove(roadArr, 0, this.useGridObstacle);
            }
            else {
                for (let rs in this.roadsArr) {
                    let pointClone = this.roadsArr[rs];
                    this.roadsArr[rs] = new Point(pointClone.x, pointClone.y);
                }
                this.changeMoveAction(true);
                this._isMoving = true;
            }
        }
    }
    /**
     * 进入新的坐标后进行一些刷新
     * -- 位置改变时
     * -- 新出现时
     * @param alreadySetTempPosHelper [优化项]表示已计算过格子辅助体，无需重新计算
     * @param alreadySetRect [优化项]表示已计算过矩形范围，无需重新计算
     * @param clacTouchEvent [可选] 默认值=true 是否计算碰触事件模式
     * @param triggerEvent [可选] 默认值=true 触发碰触事件
     */
    refreshCoordinate(alreadySetTempPosHelper: boolean = false, alreadySetRect: boolean = false, clacTouchEvent: boolean = true, triggerEvent: boolean = true) {
        if (!this.inScene) return;
        let scene: ProjectClientScene = this.scene as any;
        if (!scene || scene.isDisposed) return;

        // 相机锁定自己的情况，则需要刷新相机位置
        if (scene.camera.sceneObject == this) {
            scene.updateCamera();
        }
        // 刷新影子位置
        this.updateShadow();
        // 记录坐标
        this.pos.x = this.x;
        this.pos.y = this.y;
        // 计算所属格子
        if (!alreadySetTempPosHelper) GameUtils.getGridPostion(this.pos, this.tempGridPosHelper);
        // 计算矩形范围
        if (!alreadySetRect) {
            this.posRect.x = this.x;
            this.posRect.y = this.y;
            this.posRect.width = this.posRect.height = WorldData.sceneObjectCollisionSize - 1;
        }
        // 当进入到一个新的格子时
        if (this.posGrid.x != this.tempGridPosHelper.x || this.posGrid.y != this.tempGridPosHelper.y) {
            this.posGrid.x = this.tempGridPosHelper.x;
            this.posGrid.y = this.tempGridPosHelper.y;
            // 刷新动态障碍格数据
            scene.sceneUtils.updateDynamicObsAndBridge(this, true, this.posGrid);
            // 刷新遮罩效果，如果处于遮罩格子中则半透明显示
            this.root.alpha = scene.sceneUtils.isMaskGrid(this.posGrid) ? 0.5 : 1;
        }
        // 如果需要计算碰触事件的话
        if (clacTouchEvent) {
            // 取得碰撞列表
            let touchRes = scene.sceneUtils.touchCheck(this, false, this.pos, this.tempGridPosHelper, this.pos, this.tempGridPosHelper);
            // 允许计算被接触者的碰触事件
            this.touchEventHandle(touchRes, triggerEvent);
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 事件
    //------------------------------------------------------------------------------------------------------
    /**
     * 是否已处于事件等待中
     * @return [boolean] 
     */
    get isEventStartWait(): boolean {
        return this.eventStartWaitInfo ? true : false;
    }
    /**
     * 事件开始时等待处理（当前对象是执行者身份）
     * @param trigger 触发者
     * @param faceToTrigger 面向触发者
     * @param 是否等待成功
     */
    eventStartWait(trigger: ProjectClientSceneObject, faceToTrigger: boolean = true): boolean {
        if (this.eventStartWaitInfo) return false;
        if (this.fixOri) faceToTrigger = false;
        this.eventStartWaitInfo = {
            faceToTrigger: faceToTrigger,
            oldOri: this.avatar.orientation,
            moveState: this.getRecordMoveState()
        };
        // 锁定行为层
        this.lockBehaviorLayer = this.getBehaviorLayer();
        // 停止移动
        if (this.isMoving) this.stopMove(true);
        // 面向触发者
        if (faceToTrigger) {
            this.addBehavior([[25, 1]], false, trigger, null, false);
            // 监听一次更改面向的行为，如果在事件执行中又让他更改了面向则不恢复
            this.once(ProjectClientSceneObject.CHANGE_ORI, this, this.onExecuteWaitEventChangeOri);
            // 监听移动指令，如果中途存在移动的话则不再恢复此前的移动
            this.once(ProjectClientSceneObject.MOVE_START, this, this.onExecuteWaitEventNewMove);
        }
        return true;
    }
    /**
     * 事件结束时恢复
     * @return 是否恢复成功
     */
    eventCompleteContinue(): boolean {
        if (!this.eventStartWaitInfo) return false;
        this.off(ProjectClientSceneObject.CHANGE_ORI, this, this.onExecuteWaitEventChangeOri);
        this.off(ProjectClientSceneObject.MOVE_START, this, this.onExecuteWaitEventNewMove);
        this.lockBehaviorLayer = 0;
        if (this.eventStartWaitInfo.faceToTrigger) this.avatarOri = this.eventStartWaitInfo.oldOri;
        this.restoryMove(this.eventStartWaitInfo.moveState, true);
        this.eventStartWaitInfo = null;
        return true;
    }
    //------------------------------------------------------------------------------------------------------
    // 其他
    //------------------------------------------------------------------------------------------------------
    /**
     * 清除我接触的对象记录
     * @param targetSo [可选] 默认值=null 指定的接触过的对象，如果为null则清理全部
     */
    clearMyTouchRecord(targetSo: ProjectClientSceneObject = null): void {
        if (targetSo) {
            ArrayUtils.remove(this.myLastTouchObjects, targetSo);
        }
        else {
            this.myLastTouchObjects.length = 0;
        }
    }
    /**
     * 清理所有人接触我的记录
     */
    clearTouchMeRecord(): void {
        for (let i = 0; i < Game.currentScene.sceneObjects.length; i++) {
            let targetSo = Game.currentScene.sceneObjects[i];
            if (targetSo instanceof ProjectClientSceneObject) targetSo.clearMyTouchRecord(this);
        }
    }
    /**
     * 是否允许接触
     */
    get touchEnabled(): boolean {
        return this.inScene && this.scene.sceneObjects[this.index] == this && !this.isJumping;
    }
    /**
     * 获取接触者列表
     */
    get lastTouchObjects() {
        return this.myLastTouchObjects;
    }
    /**
     * 判断指定对象是否在我的接触者列表中
     */
    isInMyTouchList(targetSo: ProjectClientSceneObject): boolean {
        return this.myLastTouchObjects.indexOf(targetSo) != -1;
    }
    //------------------------------------------------------------------------------------------------------
    // 内部实现-移动、跳跃、设置坐标
    //------------------------------------------------------------------------------------------------------
    protected useGridObstacle: boolean;
    protected _isMoving: boolean
    protected roadsArr: Point[]; //当前路程数组（全，不抽离）A-B-C-D
    protected roadMax: number; //总段：路段总数0-1-2-3 == 4段
    protected nowRoad: number; //当前所在的路段：如果是0表示0-1，如果是1表示1-2
    protected nowRoadStartDate: number; //当前所在路段起点的游戏时间t（比如1-2中1在2014-3-22 23:21:55 789毫秒）
    protected nowRoadTime: number; //当前所在路段到下一个路段的相对时间段t0（比如1-2应该花费1379ms）
    protected onMoveOver: Callback; // 当移动结束时回调，新的移动请求会覆盖旧的
    protected thisRoadS: number; // 当前路段的距离
    protected jumpToPoint: Point; // 跳跃至的位置
    protected currentJumpFrame: number; // 当前跳跃帧
    /**
     * 开始移动（此处不会预先计算障碍，纯粹根据指定的路径移动，但在移动过程中会判定障碍）
     */
    private doStartMove(movePath: number[][], costTime: number = 0, useGridObstacle: boolean = false, fromAutoRetry: boolean = false): void {
        // 转为Point数组
        let roadsArr: Point[] = [new Point(this.x, this.y)];
        for (let i in movePath) {
            roadsArr.push(new Point(movePath[i][0], movePath[i][1]));
        }
        let lastPoint = roadsArr[roadsArr.length - 1];
        // 目的地与当前相同则忽略
        if (roadsArr.length == 2 && lastPoint.x == this.x && lastPoint.y == this.y) {
            return;
        }
        // 记录是否开启格子计算障碍模式
        this.useGridObstacle = useGridObstacle;
        // 获取当前时间
        let now = Game.now;
        // 刷新一次坐标，因为可能有不足1帧未能结算的移动
        if (this._isMoving) this.updateCoordinate(now);
        // 如果路径㛮则开始移动
        this.roadMax = roadsArr.length;
        if (movePath && this.roadMax > 1) {
            // 记录起步时间（同时减去已移动过的时间）
            this.nowRoadStartDate = now;
            this.nowRoadStartDate -= costTime
            // 储存可用的路径数组
            this.roadsArr = roadsArr;
            // 允许移动标识：标识开启
            this.isMoving = true;
            // 抛出事件
            if (!this.stopSendNextMoveStartEvent) {
                this.event(ProjectClientSceneObject.MOVE_START, [fromAutoRetry]);
            }
            this.stopSendNextMoveStartEvent = false;
        }
    }
    /**
     * 更改移动状态
     */
    public get isMoving(): boolean { return this._isMoving; }
    public set isMoving(isMove: boolean) {
        // 改变移动状态后的初始化:移动开始
        if (isMove) {
            this.changeMoveAction(true);
            //初始化当前路段的信息
            this.nowRoad = 0;
            this.nowRoadTime = 0;
            this._isMoving = isMove;
            let now = Game.now;
            // 立即刷新坐标
            this.updateCoordinate(now);
        }
        // 改变移动状态后的初始化:移动停止
        else {
            this.changeMoveAction(false);
            this._isMoving = false;
        }
    }
    /**
     * 更改移动时动作
     */
    protected changeMoveAction(isMove: boolean) {
        // 战斗释放动作中不允许改变
        if ((this.getModule(6) as SoModule_Battler)?.duringRelease) {
            return;
        }
        if (isMove) {
            // 当开启了自动变更移动时动作的话
            if (this.moveAutoChangeAction) {
                // 设置为行走动作
                let moveAct = WorldData.sceneObjectMoveStartAct;
                // 如果开启了奔跑模式的话，满足条件则播放奔跑动作（速度必须大于设定值，且该对象拥有奔跑动作）
                if (WorldData.useSceneObjectMoveStartAct2 && this.moveSpeed >= WorldData.sceneObjectMoveStartAct2Speed &&
                    ArrayUtils.matchAttributes(this.avatar.actionList, { id: WorldData.sceneObjectMoveStartAct2 }, true)[0]) {
                    moveAct = WorldData.sceneObjectMoveStartAct2;
                }
                if (this.avatar.hasActionID(moveAct)) this.avatarAct = moveAct;
            }
        }
        else {
            // 当开启了自动变更移动时动作的话
            if (this.moveAutoChangeAction) {
                if (this.avatarAct == WorldData.sceneObjectMoveStartAct || this.avatarAct == WorldData.sceneObjectMoveStartAct2) this.avatarAct = 1;
            }
        }
    }
    /**
     * 刷新坐标
     * @param _nowTime 当前游戏时间戳
     */
    protected updateCoordinate(_nowTime: number): void {
        let per: number;
        let isChangeDir: boolean = false;
        let isMoveOver: boolean = false;
        // 获取当前路段需要花费的时间段（nowRoadTime，新路段需要计算）
        let thisRoadP: Point = this.roadsArr[this.nowRoad];
        let nextRoadP: Point = this.roadsArr[this.nowRoad + 1];
        // 相同坐标的路段剔除掉
        if (thisRoadP.x == nextRoadP.x && thisRoadP.y == nextRoadP.y) {
            this.nowRoad++;
            this.updateCoordinate(_nowTime);
            return;
        }
        if (this.nowRoadTime == 0) {
            let thisRoadS: number = this.thisRoadS = thisRoadP.distance(nextRoadP.x, nextRoadP.y);
            this.nowRoadTime = Math.max(thisRoadS * 1000 / this.moveSpeed, Game.oneFrame + 1);
            isChangeDir = true;
        }
        // 大于当前路段终点的时间时
        let nowRoadEndDate: number = this.nowRoadStartDate + this.nowRoadTime;
        if (_nowTime > nowRoadEndDate) {
            // 当路段未走完的情况：下一个路段
            this.nowRoad++
            if (this.nowRoad < this.roadMax - 1) {
                this.nowRoadStartDate += this.nowRoadTime;
                this.nowRoadTime = 0
                this.updateCoordinate(_nowTime)
                return
            }
            // 当路段已到达最终的情况
            else {
                per = 1;
                this.isMoving = false;
                isMoveOver = true;
            }
        }
        else {
            per = (_nowTime - this.nowRoadStartDate) / this.nowRoadTime
        }
        // 如果需要改变朝向的话，不是固定朝向模式时则改变
        if (isChangeDir && !this.fixOri) {
            let dir = GameUtils.getOriByAngle(MathUtils.direction360(this.x, this.y, nextRoadP.x, nextRoadP.y));
            this.avatarOri = dir;
        }
        // 计算当前路段
        let nowP: Point = Point.interpolate(nextRoadP, thisRoadP, per);
        // let nowPClone = new Point(nowP.x,nowP.y);
        // 是否移动过
        let isMoved = this.x != nowP.x || this.y != nowP.y;
        // 计算移动趋势
        let trendP = new Point(nowP.x, nowP.y);
        let dx = nextRoadP.x - thisRoadP.x;
        let dy = nextRoadP.y - thisRoadP.y;
        let absDx = Math.abs(dx);
        let absDy = Math.abs(dy);
        if (absDx > absDy) {
            trendP.x += dx < 0 ? -1 : 1;
            trendP.y += (nextRoadP.y - thisRoadP.y) * 1 / absDx;
        }
        else {
            trendP.x += (nextRoadP.x - thisRoadP.x) * 1 / absDy;
            trendP.y += dy < 0 ? -1 : 1;
        }
        let moveFrom = new Point(this.x, this.y);
        this.moveTrendInfo = { from: moveFrom, to: trendP };
        if (!this.moveRealInfo) this.moveRealInfo = { from: moveFrom, to: null };
        else this.moveRealInfo.from = moveFrom;
        // 计算格子坐标
        GameUtils.getGridPostion(nowP, this.tempGridPosHelper);
        // 如果是最终路段的话，强行使用矩形障碍计算
        // 使用矩形障碍的情况下记录当前位置矩形，以便还原
        let lastRectX: number, lastRectY: number;
        if (!this.useGridObstacle) {
            lastRectX = this.posRect.x;
            lastRectY = this.posRect.y;
        }
        // 碰触检测
        let touchRes = this.scene.sceneUtils.touchCheck(this, this.useGridObstacle, nowP, this.tempGridPosHelper, trendP, null);
        // 碰到障碍的情况
        if (touchRes.isObstacle) {
            // 还原碰撞矩形，因为此路不通，内部设置的值失效了
            if (touchRes.alreadyCalcPosRect) {
                this.posRect.x = lastRectX;
                this.posRect.y = lastRectY;
            }
            // 忽略无法移动的场合
            if (this.ignoreCantMove) {
                if (this.keepMoveActWhenCollsionObstacleAndIgnoreCantMove) {
                    this._isMoving = false;
                }
                else {
                    this.isMoving = false;
                }
            }
            // 等待一游戏帧
            else {
                this.nowRoadStartDate += Game.oneFrame;
            }
            // 碰触事件处理
            if (isMoved) {
                let myLastX = this.x;
                let myLastY = this.y;
                let hasTouchEvent = this.touchEventHandle(touchRes);
                // 如果已触发事件的话就再尝试计算碰触，因为可能由于触发的事件让周围的对方发生了位置变更，我的目的地又被允许了
                // 还必须保证我也还在原来的位置上，否则可能属于被传送掉了，无需设置到该坐标上
                if (hasTouchEvent && myLastX == this.x && myLastY == this.y && this._isMoving) {
                    let touchResAgain = this.scene.sceneUtils.touchCheck(this, this.useGridObstacle, nowP, this.tempGridPosHelper, trendP, null);
                    if (!touchResAgain.isObstacle) {
                        this.setTo(nowP.x, nowP.y, false, true, true, touchRes.alreadyCalcPosRect, false);
                    }
                }
            }
            // 抛出碰触事件
            this.event(ProjectClientSceneObject.COLLISION, [touchRes]);
        }
        // 未碰到障碍的话直接设置值
        else {
            // 此次设置坐标不计算碰触，因为这里已经计算过了，直接执行碰触事件即可
            this.setTo(nowP.x, nowP.y, false, true, true, touchRes.alreadyCalcPosRect, false);
            // 碰触事件处理
            if (isMoved) this.touchEventHandle(touchRes);
        }
        // 如果移动结束的话抛出移动结束事件
        if (isMoveOver) {
            if (this.onMoveOver) this.onMoveOver.run();
            // 抛出移动至终点事件
            if (!this.stopSendNextMoveOverEvent) {
                this.event(ProjectClientSceneObject.MOVE_OVER);
            }
            this.stopSendNextMoveOverEvent = false;
        }
        this.moveRealInfo.to = new Point(this.x, this.y);
    }
    /**
     * 跳跃时更改的属性值
     */
    protected get jumpY() {
        return this.avatar ? this.avatar.y : 0;
    }
    protected set jumpY(v) {
        if (this.isDisposed) return;
        this.avatar.y = v;
    }
    //------------------------------------------------------------------------------------------------------
    // 事件命令执行
    //------------------------------------------------------------------------------------------------------
    /**
     * 碰触事件处理，碰触是相互的，执行了对方的碰触事件也会执行自己的碰触事件
     * @param touchRes 我的碰触信息
     * @param triggerEvent 是否触发碰触事件
     * @return 是否触发过事件
     */
    protected touchEventHandle(touchRes: { isObstacle: boolean, touchSceneObjects: ProjectClientSceneObject[] }, triggerEvent: boolean = true): boolean {
        // 恢复存档时当前不会触发事件
        if (this.isFromRecorySaveData && this.fromRecorySaveDataGameFrame == __fCount) return false;
        let hasTouchEvent = false;
        for (let t in touchRes.touchSceneObjects) {
            let targetSo = touchRes.touchSceneObjects[t];
            if (!targetSo || targetSo == this) continue;
            // 执行对方的碰触事件：如果对方不允许重复碰触的话，对方已在我上一次的碰触列表中则不会执行他的碰触事件
            let canExecuteTargetTouchEvent = true;
            if (!targetSo.repeatedTouchEnabled) {
                let index = this.myLastTouchObjects.indexOf(targetSo);
                if (index != -1) {
                    canExecuteTargetTouchEvent = false;
                }
                index = targetSo.myLastTouchObjects.indexOf(this);
                if (index != -1) {
                    canExecuteTargetTouchEvent = false;
                }
            }
            if (canExecuteTargetTouchEvent && triggerEvent) {
                let hasTouchTargetEvent = Controller.startSceneObjectTouchEvent(this, targetSo);
                if (hasTouchTargetEvent) hasTouchEvent = true;
            }
            // 执行我的碰触事件：如果我不允许重复碰触的话，我已经在对方的碰触列表中则不会执行我的碰触事件
            let canExecuteMyTouchEvent = true;
            if (!this.repeatedTouchEnabled) {
                let index = targetSo.myLastTouchObjects.indexOf(this);
                if (index != -1) {
                    canExecuteMyTouchEvent = false;
                }
            }
            if (canExecuteMyTouchEvent && triggerEvent) {
                let hasTouchMyEvent = Controller.startSceneObjectTouchEvent(targetSo, this);
                if (hasTouchMyEvent) hasTouchEvent = true;
            }
            // 如果我并不在对方的碰撞记录列表中则加上
            if (targetSo.myLastTouchObjects.indexOf(this) == -1) {
                targetSo.myLastTouchObjects.push(this);
            }
        }
        // 对比列表，将旧列表中不再接触的人也清理掉我的接触记录
        let subtractList: ProjectClientSceneObject[] = ArrayUtils.compare(touchRes.touchSceneObjects, this.myLastTouchObjects).subtract;
        for (let i = 0; i < subtractList.length; i++) {
            let subtractSo = subtractList[i];
            // 离开事件：由this离开了subtractSo，所以这属于双方都【被离开】了
            if (subtractSo != this) {
                // 如果对方还存在我的接触列表的话，就离开
                if (subtractSo.isInMyTouchList(this)) {
                    subtractSo.clearMyTouchRecord(this);
                    if (triggerEvent) {
                        let hasTouchTargetOutEvent = Controller.startSceneObjectTouchOutEvent(this, subtractSo);
                        if (hasTouchTargetOutEvent) hasTouchEvent = true;
                    }
                }
                if (triggerEvent) {
                    let hasTouchMyOutEvent = Controller.startSceneObjectTouchOutEvent(subtractSo, this);
                    if (hasTouchMyOutEvent) hasTouchEvent = true;
                }
            }
        }
        // 记录新的列表
        this.myLastTouchObjects = touchRes.touchSceneObjects;
        return hasTouchEvent;
    }
    /**
     * 并行事件处理
     */
    protected parallelEventUpdate() {
        if (Config.BEHAVIOR_EDIT_MODE) return;
        // 未在场景上或未能真正场景完成时忽略执行
        if (!this.inScene || GameGate.gateState < GameGate.STATE_3_IN_SCENE_COMPLETE) return;
        // 如果存在并行事件则运行并行事件（并行事件是该模板自定义的事件类别之一）
        let updateCmdPage = this.customCommandPages[2];
        if (updateCmdPage && updateCmdPage.commands.length != 0) {
            let updateTrigger = this.getCommandTrigger(1, 2, Game.currentScene, this);
            if (updateTrigger) {
                updateCmdPage.startTriggerEvent(updateTrigger);
            }
        }
    }
    /**
     * 执行出现事件
     */
    protected appearEventHandle() {
        // 调用「出现事件」前的处理
        GameCommand.startCommonCommand(14015, [], null, this, this);
        if (this.hasCommand[3]) {
            GameCommand.startSceneObjectCommand(this.index, 3, null, null, this);
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 内部实现-初始化和事件监听
    //------------------------------------------------------------------------------------------------------
    /**
     * 初始化
     */
    protected init() {
        // 刷新位置
        this.refreshCoordinate(false, false, true, false);
        // 监听状态页更改时事件执行 onStausPageChange(false)
        EventUtils.addEventListenerFunction(this, SceneObjectEntity.EVENT_CHANGE_STATUS_PAGE_FOR_INSTANCE, this.onStausPageChange, this, [false]);
        // 监听游戏暂停事件
        EventUtils.addEventListenerFunction(Game, Game.EVENT_PAUSE_CHANGE, this.onGamePauseChangeHandle, this);
        // 开始执行当前状态页的默认行为和出现事件
        if (this.inScene && this.scene && this.scene.sceneObjects[this.index] == this) {
            this.onStausPageChange(true);
        }
        else {
            this.once(EventObject.ADDED, this, () => {
                this.onStausPageChange(true);
            });
        }
    }
    /**
     * 当状态页改变时
     * @param isFirst 首次出现时
     */
    protected onStausPageChange(isFirst: boolean) {
        // 如果未出现在场景上的话则忽略
        if (!this.inScene) return;
        // Debug-显示碰撞盒
        if (WorldData.rectObsDebug && os.inGC() && !Config.RELEASE_GAME) {
            let ccModule = this.getModule(SoModule_CustomCollision.PLUGIN_SCENEOBJECT_MODULE_ID) as SoModule_CustomCollision;
            if (!(ccModule && ccModule.isObstacle) && this.avatarID != 0) {
                let size = WorldData.sceneObjectCollisionSize;
                let rect = new Rectangle(-size / 2, -size / 2, size - 1, size - 1);
                this.root.graphics.clear();
                this.root.graphics.drawLines(0, 0, [rect.x, rect.y, rect.right, rect.y, rect.right, rect.bottom, rect.x, rect.bottom, rect.x, rect.y], ProjectClientScene.getDebugColorBySceneObject(this), 1);
            }
        }
        // 暂停的话等待取消暂停后执行
        if (Game.pause) {
            EventUtils.addEventListenerFunction(Game, Game.EVENT_PAUSE_CHANGE, this.onStausPageChange, this, [], true);
            return;
        }
        // 非恢复存档时
        if (!this.isFromRecorySaveData) {
            // 清理接触者列表
            if (!isFirst) {
                this.clearMyTouchRecord();
                this.clearTouchMeRecord();
            }
            // 执行默认行为
            this.startDefBehavior();
            // 执行初始化事件
            Callback.CallLaterBeforeRender(this.appearEventHandle, this)
            // 碰触计算
            if (!isFirst) {
                Callback.CallLaterBeforeRender(this.refreshCoordinate, this)
            }
        }
        // 战斗者初始化
        let battleModule = this.getModule(6) as SoModule_Battler;
        if (battleModule) {
            battleModule.battlerInit(true, !this.isFromRecorySaveData);
        }
    }
    /**
     * 当状态页更改前
     */
    protected onBeforeStausPageChange(): void {
        // 如果是战斗者则清理仇恨和战斗标志
        if (GameBattleHelper.isBattler(this)) {
            GameBattleData.clearHateList(this, true);
            GameBattleData.setInBattleState(this, false);
            this.eventCompleteContinue();
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 内部实现-行为
    //------------------------------------------------------------------------------------------------------
    /**
     * 开始执行默认行为
     */
    protected startDefBehavior() {
        // 不是恢复存档数据的话才添加默认行为，否则已经被恢复了
        this.stopBehavior();
        this.clearBehaviors();
        let beData = SceneObjectBehaviors.toBehaviorData(this.defBehavior);
        if (beData.behaviorData.length > 0) {
            this.addBehavior(beData.behaviorData, beData.loop, this, null, beData.cover, 0, false, beData.forceStopLastBehavior, 0, this);
        }
    }
    /**
     * 刷新行为
     */
    protected updateBehavior() {
        // 处于行为编辑器中时忽略
        if (Config.BEHAVIOR_EDIT_MODE) return;
        // 游戏暂停时不执行
        if (Game.pause) return;
        // 禁止行为的话
        if (this.banBehavior) return;
        // 未能真正进入场景或场景不存在时不执行
        if (!this.inScene || GameGate.gateState < GameGate.STATE_3_IN_SCENE_COMPLETE || Game.currentScene.sceneObjects[this.index] != this) return;
        // 存在行为的话则执行
        if (this.behaviors.length > 0) {
            let layer = this.behaviors.length - 1;
            // 锁定层以下的话不允许执行
            if (layer < this.lockBehaviorLayer) return;
            let newestBehavior = this.behaviors[this.behaviors.length - 1];
            newestBehavior.update();
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 内部实现-重试自动寻路
    //------------------------------------------------------------------------------------------------------
    /**
     * 重试自动寻路
     */
    protected retryAutoFindRoadMove(toX: number, toY: number, ifObstacleHandleMode: number = 0, costTime: number = 0, useAstar: boolean = true, whenCantMoveRetry: boolean = false, useGridObstacle: boolean = true, touchRes: any = null) {
        if (touchRes && !touchRes.isObstacle) return;
        this.clearRetryAutoFindRoadMove(false);
        this.needRetryAutoFindRoadMoveSign = setFrameout(() => {
            if (this.isDisposed || !this.inScene) return;
            this.autoFindRoadMove(toX, toY, ifObstacleHandleMode, costTime, useAstar, whenCantMoveRetry, useGridObstacle, false, true);
        }, 16);
    }
    /**
     * 清理重试自动寻路的状态
     */
    protected clearRetryAutoFindRoadMove(offCollisionEvent: boolean = true) {
        if (Game.player.sceneObject == this)
            this.off(ProjectClientSceneObject.COLLISION, this, this.retryAutoFindRoadMove);
        if (this.needRetryAutoFindRoadMoveSign) clearFrameout(this.needRetryAutoFindRoadMoveSign);
        this.needRetryAutoFindRoadMoveSign = null;
    }
    //------------------------------------------------------------------------------------------------------
    // 内部实现-其他
    //------------------------------------------------------------------------------------------------------
    /**
     * 当系统事件被执行时
     * @param mode 0-对话框显示时 1-对话选择框显示时 2-其他（如更换场景）
     */
    protected onSystemCommandStart(mode: number) {
        if (this == Game.player.sceneObject) this.stopMove();
    }
    /**
     * 当执行等待事件时更改了面向
     */
    private onExecuteWaitEventChangeOri() {
        if (this.eventStartWaitInfo) this.eventStartWaitInfo.faceToTrigger = false;
    }
    /**
     * 当执行等待事件时重新执行了新的移动指令
     */
    private onExecuteWaitEventNewMove() {
        if (this.eventStartWaitInfo) {
            this.eventStartWaitInfo.moveState = null;
        }
    }
    /**
     * 当游戏暂停状态改变时处理
     */
    private onGamePauseChangeHandle() {
        // 暂停/恢复全部场景相关的触发器
        for (let i in this.triggerLines) {
            let trigger: CommandTrigger = this.triggerLines[i];
            if (trigger && trigger.mainType == CommandTrigger.COMMAND_MAIN_TYPE_SCENE_OBJECT) trigger.delayPause = Game.pause;
        }
    }
}
// 重写属性
ObjectUtils.reDefineGetSet("ProjectClientSceneObject.prototype", {
    avatarOri: function (v: number) {
        if (this.avatar) {
            if (this.avatar.orientation != v) this.avatar.orientation = v;
            this.event(ProjectClientSceneObject.CHANGE_ORI);
        }
    },
    avatarAct: function (v: number) {
        if (this.avatar && this.avatar.actionID != v) {
            if (!this.banAvatarAction) {
                this.avatar.actionID = v;
            }
        }
    }
});