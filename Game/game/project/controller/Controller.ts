/**
 * 游戏总控制器
 * -- 管理其他控制器
 * -- 场景对象的操作
 * -- 场景对象相关事件触发
 * -- 进入场景事件完毕后才会开启控制器
 * 
 * Created by 黑暗之神KDS on 2018-10-07 16:18:25.
 */
class Controller {
    /** 控制器开启事件 */
    static EVENT_CONTROLLER_START: string = "ControllerEVENT_CONTROLLER_START";
    /** 控制器关闭事件 */
    static EVENT_CONTROLLER_STOP: string = "ControllerEVENT_CONTROLLER_STOP";
    /** 点击事件的命令 true=开始 false=结束 */
    static EVENT_SCENE_OBJECT_CLICK_COMMAND: string = "GameCommand_EVENT_SCENE_OBJECT_CLICK_COMMAND";
    /** 碰触事件的命令 true=开始 false=结束 */
    static EVENT_SCENE_OBJECT_TOUCH_COMMAND: string = "GameCommand_EVENT_SCENE_OBJECT_TOUCH_COMMAND";
    /** 控制器启动状态 */
    static ctrlStart: boolean;
    /** 控制可用状态：点击事件执行中 */
    private static ENABLED_COMMAND_SCENE_OBJECT_CLICK_EXECUTE: number = 0;
    /** 控制可用状态：碰触事件执行中 */
    private static ENABLED_COMMAND_SCENE_OBJECT_TOUCH_EXECUTE: number = 1;
    /** 控制可用状态是否可控，需要条件全满足才可控制 */
    private static enabledMapping = {
        0: true,
        1: true
    }
    /** 等待碰触事件开始的状态 */
    private static waitTouchEventStart: boolean;
    /** 需要等待的碰触事件执行中计数 */
    private static needWaitTouchExcuteCount: number = 0;
    /**
     * 当前方向键输入状态：0-无 1-键盘输入 2-手柄输入 3-虚拟按键 4-其他
     */
    static inputState: number = 0;
    /**
     * 启动控制器
     */
    static start(): void {
        // 调用一次清理
        this.stop();
        // 控制器启动状态
        Controller.ctrlStart = true;
        // 监听场景对象点击事件和场景进入事件的执行，以便禁止玩家控制
        this.startEvent();
        // 鼠标控制器启动
        MouseControl.start();
        // 键盘控制器启动
        KeyboardControl.start();
        // 手柄控制器启动
        GamepadControl.start();
        // 战斗处理器启动
        GameBattle.start();
        // 其他初始化
        Controller.waitTouchEventStart = false;
        Controller.needWaitTouchExcuteCount = 0;
        // 派发事件
        EventUtils.happen(Controller, Controller.EVENT_CONTROLLER_START);
    }
    /**
     * 停止控制
     */
    static stop(): void {
        // 控制器关闭状态
        Controller.ctrlStart = false;
        // 取消监听相关事件
        this.clearEvent();
        // 鼠标控制器关闭
        MouseControl.stop();
        // 键盘控制器关闭
        KeyboardControl.stop();
        // 手柄控制器关闭
        GamepadControl.stop();
        // 战斗处理器启动
        GameBattle.stop();
    }
    //------------------------------------------------------------------------------------------------------
    // 控制器是否有效
    //------------------------------------------------------------------------------------------------------
    /**
     * 在场景中是否可控制
     */
    static get inSceneEnabled() {
        // 暂停、禁用操作、控制关闭时无法控制
        if (Game.pause || !WorldData.playCtrlEnabled || !Controller.ctrlStart) return false;
        // 检测是否未满足全部可控状态，未满足则无法控制
        for (let i in Controller.enabledMapping) {
            if (!Controller.enabledMapping[i]) return false;
        }
        if (Controller.needWaitTouchExcuteCount > 0) return false;
        return true;
    }
    /**
     * 是否玩家触发事件中（点击事件、碰触事件）
     */
    static get isPlayerTriggerEvent() {
        for (let i in Controller.enabledMapping) {
            if (!Controller.enabledMapping[i]) return true;
        }
        return false;
    }
    //------------------------------------------------------------------------------------------------------
    //  移动：根据方位
    //------------------------------------------------------------------------------------------------------
    private static lastJoyAngle: number;
    private static lastMoveSpeed: number;
    /**
     * 摇杆移动
     * @param dirAngle 角度
     * @param recordAngle [可选] 默认值=true 记录角度，以便拒绝小规模角度偏移导致不断触发移动
     * @param tryTimes [可选] 默认值=-1 尝试次数（当遇到障碍的时候系统会自动尝试更换角度来移动，比如碰到NPC、撞墙等，以便平滑）
     * @param oriAngle [可选] 默认值=null 原始发出的角度
     */
    static startJoy(dirAngle: number, recordAngle: boolean = true, tryTimes: number = -1, oriAngle: number = null): void {
        ProjectUtils.lastControl = 2;
        // 禁止控制的情况
        if (!Controller.ctrlStart || !Controller.inSceneEnabled) return;
        // 中心点模式
        if (WorldData.moveToGridCenter) {
            if (!ProjectPlayer.ctrlActorSceneObject.isMoving) {
                let dir = GameUtils.getOriByAngle(dirAngle);
                let offset = KeyboardControl.dirOffsetArr[dir];
                let xGrid: number = Math.floor(ProjectPlayer.ctrlActorSceneObject.x / Config.SCENE_GRID_SIZE) + offset[0];
                let yGrid: number = Math.floor(ProjectPlayer.ctrlActorSceneObject.y / Config.SCENE_GRID_SIZE) + offset[1];
                if (!Game.currentScene.sceneUtils.isOutsideByGrid(new Point(xGrid, yGrid))) {
                    KeyboardControl.moveDirectGrid(xGrid, yGrid);
                }
            }
            return;
        }
        // 无法移动的场合
        if (!GameBattleHelper.canMove(ProjectPlayer.ctrlActorSceneObject)) {
            this.lastJoyAngle = null;
            Callback.New(this.startJoy, Controller, [dirAngle, recordAngle, tryTimes, oriAngle]).delayRun(1, setFrameout);
            return;
        }
        // 与上一个角度比较接近的情况则忽略掉
        if (recordAngle && this.lastMoveSpeed == ProjectPlayer.ctrlActorSceneObject.moveSpeed) {
            let nearAngle = 5;
            if (this.lastJoyAngle != null) {
                if (MathUtils.inAngleRange(0 - nearAngle, 0 + nearAngle, dirAngle) && MathUtils.inAngleRange(0 - nearAngle, 0 + nearAngle, this.lastJoyAngle)) {
                    return;
                }
                else if (Math.abs(dirAngle - this.lastJoyAngle) <= nearAngle * 2) {
                    return;
                }
            }
            this.lastJoyAngle = dirAngle;
        }
        this.lastMoveSpeed = ProjectPlayer.ctrlActorSceneObject.moveSpeed;
        // 给一个趋势开始运动：已知玩家位置，朝向目标的角度，固定给出的半径R，求目标点位置
        let currentX = ProjectPlayer.ctrlActorSceneObject.x;
        let currentY = ProjectPlayer.ctrlActorSceneObject.y;
        let R = 1000000;
        let radian = dirAngle * Math.PI / 180;
        let targetX = Math.sin(radian) * R + currentX;
        let targetY = -Math.cos(radian) * R + currentY;
        ProjectPlayer.ctrlActorSceneObject.off(ProjectClientSceneObject.COLLISION, this, this.onJoyCollision)
        ProjectPlayer.ctrlActorSceneObject.on(ProjectClientSceneObject.COLLISION, this, this.onJoyCollision, [dirAngle, tryTimes, oriAngle]);
        let lastX = ProjectPlayer.ctrlActorSceneObject.x;
        let lastY = ProjectPlayer.ctrlActorSceneObject.y;
        ProjectPlayer.ctrlActorSceneObject.startMove([[targetX, targetY]], Game.oneFrame);
        // 未能移动的情况则尝试更换角度进行移动
        if (lastX == ProjectPlayer.ctrlActorSceneObject.x && lastY == ProjectPlayer.ctrlActorSceneObject.y) {
            ProjectPlayer.ctrlActorSceneObject.setTo(lastX, lastY);
            if (oriAngle == null) oriAngle = dirAngle;
            if (tryTimes == -1) {
                tryTimes = 2;
            }
            else {
                if (tryTimes <= 0) return;
                tryTimes--;
            }
            dirAngle = this.getCollisionAutoTryAngle(oriAngle, tryTimes);
            this.startJoy(dirAngle % 360, false, tryTimes, oriAngle);
        }
        // 成功移动的情况下，重置，重新正常移动
        else {
            this.lastJoyAngle = dirAngle;
            ProjectPlayer.ctrlActorSceneObject.stopMove();
            ProjectPlayer.ctrlActorSceneObject.setTo(lastX, lastY);
            ProjectPlayer.ctrlActorSceneObject.startMove([[targetX, targetY]]);
        }
    }
    /**
     * 停止摇杆
     */
    static stopJoy(): void {
        if (!GameBattleHelper.canMove(ProjectPlayer.ctrlActorSceneObject)) {
            Callback.New(this.stopJoy, Controller, []).delayRun(1, setFrameout);
            return;
        }
        this.lastJoyAngle = null;
        // 不是移动至格子中心点的话立即停止移动
        if (!ClientWorld.data.moveToGridCenter) {
            ProjectPlayer.ctrlActorSceneObject.stopMove();
        }
        else {
            // 如果已在中心点的话则允许停止
            let pCenter = GameUtils.getGridCenter(ProjectPlayer.ctrlActorSceneObject.pos);
            if (ProjectPlayer.ctrlActorSceneObject.x == pCenter.x && ProjectPlayer.ctrlActorSceneObject.y == pCenter.y) {
                ProjectPlayer.ctrlActorSceneObject.stopMove();
            }
        }
        ProjectPlayer.ctrlActorSceneObject.off(ProjectClientSceneObject.COLLISION, this, this.onJoyCollision)
    }
    /**
     * 清理摇杆（移动端用）
     */
    static clearJoy(): void {
        this.lastJoyAngle = null;
        GUI_VirtualKeyboard.refresh();
    }
    //------------------------------------------------------------------------------------------------------
    // 点击事件：触发者=玩家的对象 执行者=被点击的对象
    // -- 玩家鼠标点击对象时候如果在远处则会移动到对象身边再触发，如果对象也在移动中，此时会进入自动追逐状态，追逐完成则触发
    // -- 玩家通过键位会对当前朝向方向的对象进行触发点击事件
    //------------------------------------------------------------------------------------------------------
    /**
     * 开始触发场景对象的点击事件
     * @param target 目标对象
     * @param playerFaceToTarget [可选] 默认值=false 是否执行事件时玩家面向对象
     */
    static startSceneObjectClickEvent(target: ProjectClientSceneObject, playerFaceToTarget: boolean = false) {
        // 如果处于暂停阶段的话忽略
        if (Game.pause) return;
        if (target) {
            // 不在场景上或处于跳跃中则忽略
            if (!target.inScene || target.scene != Game.currentScene || target.isJumping) return;
            // 存在点击事件的话
            if (target.hasCommand[0]) {
                // 执行该事件时需要执行者等待，未能成功等待时说明有其他需要等待的事件正在执行，则忽略该事件
                let bool = target.eventStartWait(ProjectPlayer.ctrlActorSceneObject);
                if (!bool) return;
                // 玩家停止移动
                ProjectPlayer.ctrlActorSceneObject.stopMove();
                // 面向目标
                if (playerFaceToTarget && !ProjectPlayer.ctrlActorSceneObject.fixOri) {
                    let dis = Point.distance2(ProjectPlayer.ctrlActorSceneObject.x, ProjectPlayer.ctrlActorSceneObject.y, target.x, target.y);
                    let gridDis = Math.floor(dis / Config.SCENE_GRID_SIZE);
                    if (gridDis >= 1) ProjectPlayer.ctrlActorSceneObject.addBehavior([[25, 2]], false, ProjectPlayer.ctrlActorSceneObject, null, false, 0, true, false, 0, target);
                }
                // 不允许控制：来源-点击事件
                EventUtils.happen(Controller, Controller.EVENT_SCENE_OBJECT_CLICK_COMMAND, [true]);
                // 调用「点击事件」前的处理
                GameCommand.startCommonCommand(14012, [], Callback.New(() => {
                    // 执行点击事件
                    GameCommand.startSceneObjectCommand(target.index, 0, null, Callback.New((target: ProjectClientSceneObject) => {
                        target.eventCompleteContinue();
                        // 恢复控制：来源-点击事件
                        EventUtils.happen(Controller, Controller.EVENT_SCENE_OBJECT_CLICK_COMMAND, [false]);
                    }, this, [target]), ProjectPlayer.ctrlActorSceneObject);
                }, this), ProjectPlayer.ctrlActorSceneObject, target);
            }
        }
    }
    /**
     * 移动至目标场景对象附近后出发点击事件
     * @param targetSceneObject 目标场景对象
     */
    static moveToNearTargetSceneObjectAndTriggerClickEvent(targetSceneObject: ProjectClientSceneObject) {
        // 无事件则忽略
        if (!targetSceneObject.hasCommand[0]) return;
        // 清理移动至目标场景对象附近后出发点击事件的命令
        Controller.clearNearTargetSceneObjectAndTriggerClickEvent();
        // 如果已距离1.5个格子以下则直接开始执行
        if (targetSceneObject.clickEventNoDistance || Point.distanceSquare(targetSceneObject.pos, Game.player.sceneObject.pos) <= Math.pow(Config.SCENE_GRID_SIZE * 1.5, 2)) {
            Controller.startSceneObjectClickEvent(targetSceneObject, true);
        }
        // 否则移动至其附近
        else {
            // 监听移动结束后再尝试触发点击事件
            ProjectPlayer.ctrlActorSceneObject.once(ProjectClientSceneObject.MOVE_OVER, Controller, Controller.moveToNearTargetSceneObjectAndTriggerClickEvent, [targetSceneObject]);
            // 移动至目标对象附近（如果遇到障碍则自动重试）
            ProjectPlayer.ctrlActorSceneObject.autoFindRoadMove(targetSceneObject.x, targetSceneObject.y, 1, 0, true, true, true);
            // 如果目标出现了新的移动则清理掉（而非自动重试的话）
            ProjectPlayer.ctrlActorSceneObject.on(ProjectClientSceneObject.MOVE_START, Controller, this.clearNearTargetSceneObjectAndTriggerClickEvent);
        }
    }
    /**
     * 清理移动至目标场景对象附近后出发点击事件的命令
     * @param fromAutoRetry [可选] 默认值=false 来自自动重试
     */
    static clearNearTargetSceneObjectAndTriggerClickEvent(fromAutoRetry: boolean = false) {
        if (fromAutoRetry) return;
        ProjectPlayer.ctrlActorSceneObject.off(ProjectClientSceneObject.MOVE_START, Controller, Controller.clearNearTargetSceneObjectAndTriggerClickEvent);
        ProjectPlayer.ctrlActorSceneObject.off(ProjectClientSceneObject.MOVE_OVER, Controller, Controller.moveToNearTargetSceneObjectAndTriggerClickEvent);
    }
    //------------------------------------------------------------------------------------------------------
    // 碰触事件：触发者=主动碰触别人的对象 执行者=被碰触的对象
    // -- 由A对象主动碰到B对象，触发B对象的碰触事件（只有被触发的对象才会执行触发事件）
    //------------------------------------------------------------------------------------------------------
    /**
     * 开始触发碰触事件
     * @param trigger 碰触者
     * @param executor 执行者
     * @param onCommandExecuteOver [可选] 默认值=null 执行事件完成后回调
     * @return [boolean] 是否成功
     */
    static startSceneObjectTouchEvent(trigger: ProjectClientSceneObject, executor: ProjectClientSceneObject, onCommandExecuteOver: Callback = null): boolean {
        // 如果还未真正登陆场景则忽略（即预先摆放接触的对象不会触发碰触事件）
        if (GameGate.gateState < GameGate.STATE_4_PLAYER_CONTROL_START) {
            Callback.New(Controller.startSceneObjectTouchEvent, Controller, [trigger, executor, onCommandExecuteOver]).delayRun(0);
            return false;
        }
        // 如果处于暂停阶段的话监听游戏暂停状态改变后再重新开始
        if (Game.pause) {
            EventUtils.addEventListener(Game, Game.EVENT_PAUSE_CHANGE, Callback.New(Controller.startSceneObjectTouchEvent, this, [trigger, executor, onCommandExecuteOver]), true);
            return false;
        }
        // 不在场景上时忽略
        if (!executor.inScene || !trigger.inScene || trigger.scene != Game.currentScene || executor.scene != Game.currentScene || !trigger.root.visible || !executor.root.visible) return false;
        // 跳跃中时忽略
        if (executor.isJumping || trigger.isJumping) return false;
        // 派发碰触事件
        executor.event(ProjectClientSceneObject.TOUCH, [trigger]);
        // 不允许非玩家以外的对象执行时则忽略
        if (executor.onlyPlayerTouch && trigger != ProjectPlayer.ctrlActorSceneObject) return false;
        // 如果需要玩家等待的场合
        if (executor.waitTouchEvent && trigger == ProjectPlayer.ctrlActorSceneObject) {
            // 测试执行者是否已经处于事件等待中
            if (executor.isEventStartWait) {
                return false;
            }
            // 调用「碰触事件」前的处理
            GameCommand.startCommonCommand(14013, [], null, trigger, executor);
            // 执行者身上未有碰触事件的话则不执行其身上的碰触事件
            if (!executor.hasCommand[1]) return false;
            // 执行该事件时需要执行者等待，未能成功等待时说明有其他需要等待的事件正在执行，则忽略该事件
            let bool = executor.eventStartWait(trigger);
            if (!bool) return false;
            // 玩家停止移动
            if (!Controller.waitTouchEventStart) {
                trigger.stopMove();
            }
            // 不允许控制：来源-碰触事件
            EventUtils.happen(Controller, Controller.EVENT_SCENE_OBJECT_TOUCH_COMMAND, [true]);
            Controller.waitTouchEventStart = true;
            Controller.needWaitTouchExcuteCount++;
            // 执行完毕后处理
            let touchCompleteCallback = Callback.New(() => {
                executor.eventCompleteContinue();
                // 恢复控制：来源-碰触事件
                Controller.needWaitTouchExcuteCount--;
                EventUtils.happen(Controller, Controller.EVENT_SCENE_OBJECT_TOUCH_COMMAND, [false]);
                Controller.waitTouchEventStart = false;
                onCommandExecuteOver && onCommandExecuteOver.run();
            }, this);
            // 执行碰触事件
            let touchEventSuccess = GameCommand.startSceneObjectCommand(executor.index, 1, null, touchCompleteCallback, trigger);
            if (!touchEventSuccess) touchCompleteCallback.run();
            return touchEventSuccess;
        }
        else {
            // 调用「碰触事件」前的处理
            GameCommand.startCommonCommand(14013, [], null, trigger, executor);
            // 执行者身上未有碰触事件的话则不执行其身上的碰触事件
            if (!executor.hasCommand[1]) return false;
            return GameCommand.startSceneObjectCommand(executor.index, 1, null, onCommandExecuteOver, trigger);
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 离开碰触的事件
    //------------------------------------------------------------------------------------------------------
    /**
     * 开始离开碰触的事件：当已碰触该对象的对象不再碰触该对象时触发
     * @param trigger 触发者
     * @param executor 执行者
     * @param onCommandExecuteOver [可选] 默认值=null 当执行完成时回调
     * @return [boolean] 是否执行成功
     */
    static startSceneObjectTouchOutEvent(trigger: ProjectClientSceneObject, executor: ProjectClientSceneObject, onCommandExecuteOver: Callback = null): boolean {
        // 如果处于暂停阶段的话监听游戏暂停状态改变后再重新开始
        if (Game.pause) {
            EventUtils.addEventListener(Game, Game.EVENT_PAUSE_CHANGE, Callback.New(Controller.startSceneObjectTouchEvent, this, [trigger, executor, onCommandExecuteOver]), true);
            return false;
        }
        // 不在场景上时忽略
        if (!executor.inScene || !trigger.inScene || trigger.scene != Game.currentScene || executor.scene != Game.currentScene || !trigger.root.visible || !executor.root.visible) return false;
        // 派发碰触事件
        executor.event(ProjectClientSceneObject.AWAY_TOUCH, [trigger]);
        // 不允许非玩家以外的对象执行时则忽略
        if (executor.onlyPlayerTouch && trigger != ProjectPlayer.ctrlActorSceneObject) return false;
        // 离开离开碰触的事件
        GameCommand.startCommonCommand(14014, [], null, trigger, executor);
        // 没有事件时忽略
        if (!executor.hasCommand[4]) return false;
        return GameCommand.startSceneObjectCommand(executor.index, 4, null, onCommandExecuteOver, trigger);
    }
    //------------------------------------------------------------------------------------------------------
    // 内部-事件
    //------------------------------------------------------------------------------------------------------
    /**
     * 开始事件
     */
    private static startEvent() {
        this.clearEvent();
        EventUtils.addEventListener(Controller, Controller.EVENT_SCENE_OBJECT_CLICK_COMMAND, Callback.New(this.onCommandStart, this, [Controller.ENABLED_COMMAND_SCENE_OBJECT_CLICK_EXECUTE]));
        EventUtils.addEventListener(Controller, Controller.EVENT_SCENE_OBJECT_TOUCH_COMMAND, Callback.New(this.onCommandStart, this, [Controller.ENABLED_COMMAND_SCENE_OBJECT_TOUCH_EXECUTE]));
    }
    /**
     * 清理事件
     */
    private static clearEvent() {
        EventUtils.happen(Controller, Controller.EVENT_SCENE_OBJECT_CLICK_COMMAND, [false]);
        EventUtils.happen(Controller, Controller.EVENT_SCENE_OBJECT_TOUCH_COMMAND, [false]);
    }
    //------------------------------------------------------------------------------------------------------
    // 内部
    //------------------------------------------------------------------------------------------------------
    /**
     * 当命令开始时
     * @param enabledID 命令编号
     * @param isStart 是否开始
     */
    private static onCommandStart(enabledID: number, isStart: boolean) {
        Controller.enabledMapping[enabledID] = !isStart;
    }
    /**
     * 当摇杆操作时发生了碰撞
     * @param dirAngle 当前角度
     * @param tryTimes 尝试的次数
     * @param oriAngle 最初操作的原始角度
     */
    private static onJoyCollision(dirAngle: number, tryTimes: number, oriAngle: number) {
        // 尝试改变角度
        if (oriAngle == null) oriAngle = dirAngle;
        if (tryTimes == -1) {
            tryTimes = 2;
        }
        else {
            if (tryTimes <= 0) return;
            tryTimes--;
        }
        dirAngle = this.getCollisionAutoTryAngle(oriAngle, tryTimes);
        this.startJoy(dirAngle % 360, false, tryTimes, oriAngle);
    }
    /**
     * 获取碰撞后自动尝试的角度
     * -- 当fromAngle角度接近四方向的角度则返回四方向
     * @param fromAngle 参考角度
     * @param tryTimes 尝试的次数 2、1
     * @return [number] 
     */
    private static getCollisionAutoTryAngle(fromAngle: number, tryTimes: number): number {
        // 判断是否接近四方向的角度
        let nearAngle = 22;
        if (fromAngle > 360 - nearAngle || fromAngle < 0 + nearAngle) {
            return 0;
        }
        else if (Math.abs(90 - fromAngle) <= nearAngle) {
            return 90;
        }
        else if (Math.abs(180 - fromAngle) <= nearAngle) {
            return 180;
        }
        else if (Math.abs(270 - fromAngle) <= nearAngle) {
            return 270;
        }
        // 否则根据接近度尝试两次
        if (fromAngle >= 315) {
            if (tryTimes == 2) return 0;
            else if (tryTimes == 1) return 270;
        }
        else if (fromAngle >= 270) {
            if (tryTimes == 2) return 270;
            else if (tryTimes == 1) return 0;
        }
        else if (fromAngle >= 225) {
            if (tryTimes == 2) return 270;
            else if (tryTimes == 1) return 180;
        }
        else if (fromAngle >= 180) {
            if (tryTimes == 2) return 180;
            else if (tryTimes == 1) return 270;
        }
        else if (fromAngle >= 135) {
            if (tryTimes == 2) return 180;
            else if (tryTimes == 1) return 90;
        }
        else if (fromAngle >= 90) {
            if (tryTimes == 2) return 90;
            else if (tryTimes == 1) return 180;
        }
        else if (fromAngle >= 45) {
            if (tryTimes == 2) return 90;
            else if (tryTimes == 1) return 0;
        }
        else if (fromAngle >= 0) {
            if (tryTimes == 2) return 0;
            else if (tryTimes == 1) return 90;
        }
        return fromAngle;
    }
}