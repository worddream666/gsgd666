/**
 * 按键控制器
 * -- 移动
 * -- 调查/对话
 * -- 其他
 * 
 * Created by 黑暗之神KDS on 2018-10-08 19:21:25.
 */
class KeyboardControl {
    /**
     * 方向
     */
    private static dir: number = 0;
    /**
     * 最近的按键
     */
    private static lastKeyDown: number;
    /**
     * 是否更改了方向
     */
    private static isChangeDir: boolean = false;
    /**
     * 方向按键储存：DOWN/UP/LEFT/RIGHT
     */
    private static dirKeyDown: boolean[] = [false, false, false, false];
    /**
     * 方向偏移
     */
    static dirOffsetArr: number[][] = [
        null,
        [-1, 1], // 1
        [0, 1],  // 2
        [1, 1],  // 3
        [-1, 0], // 4
        null,    // 5
        [1, 0],  // 6
        [-1, -1],// 7
        [0, -1], // 8
        [1, -1]  // 9
    ];

    /**
     * 辅助计算
     */
    private static clickNpc3Mode: any[] = [
        null,
        [new Point(0, 1), new Point(-1, 0)],   // 1 方向2+4
        [new Point(1, 1), new Point(-1, 1)],   // 2 方向3+1
        [new Point(1, 0), new Point(0, 1)],    // 3 方向6+2
        [new Point(-1, 1), new Point(-1, -1)], // 4 方向1+7
        null,
        [new Point(1, 1), new Point(1, -1)],   // 6 方向3+9
        [new Point(-1, 0), new Point(0, -1)],  // 7 方向4+8
        [new Point(-1, -1), new Point(1, -1)], // 8 方向7+9
        [new Point(0, -1), new Point(1, 0)]    // 9 方向8+6
    ];
    private static lastDx: number;
    private static lastDy: number;
    private static lastJoyAngle: number;
    private static onKeyUpdateCB: Callback;
    /**
     * 游戏按键记录值
     */
    private static gameKeyFunctions: { [gamekey: string]: { functionID: number, eventID: number }[] } = {};
    private static keyboardFunctions: { functionID: number, eventID: number }[][] = [];
    /**
     * 是否已启动
     */
    //------------------------------------------------------------------------------------------------------
    // 启动和停止
    //------------------------------------------------------------------------------------------------------
    /**
     * 初始化
     */
    static init() {
        this.initBattleKeyBoard();
        stage.on(EventObject.KEY_DOWN, this, this.onKeyDown);
        stage.on(EventObject.KEY_UP, this, this.onKeyUp);
        EventUtils.addEventListener(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_CTRL_ACTOR, Callback.New(this.onChangeCtrlActor, this));
    }
    /**
     * 启动
     */
    static start(): void {
        // 按键
        if (!this.onKeyUpdateCB) this.onKeyUpdateCB = Callback.New(this.update, this);
        os.add_ENTERFRAME(this.update, this);
        ProjectPlayer.ctrlActorSceneObject.off(ProjectClientSceneObject.MOVE_OVER, this, this.update);
        ProjectPlayer.ctrlActorSceneObject.on(ProjectClientSceneObject.MOVE_OVER, this, this.update);
    }
    /**
     * 停止
     */
    static stop(): void {
        // 按键
        os.remove_ENTERFRAME(this.update, this);
        if (ProjectPlayer.ctrlActorSceneObject) ProjectPlayer.ctrlActorSceneObject.off(ProjectClientSceneObject.MOVE_OVER, this, this.update);
    }
    /**
     * 当更改控制的角色
     */
    private static onChangeCtrlActor(lastCtrlSo: ProjectClientSceneObject, currentCtrlSo: ProjectClientSceneObject): void {
        if (Controller.ctrlStart) {
            lastCtrlSo.off(ProjectClientSceneObject.MOVE_OVER, this, this.update);
            currentCtrlSo.on(ProjectClientSceneObject.MOVE_OVER, this, this.update);
        }
    }
    /**
     * 初始化战斗按键
     */
    private static initBattleKeyBoard(): void {
        for (let i = 0; i < WorldData.battleKeyboardSetting.length; i++) {
            let btInfo = WorldData.battleKeyboardSetting[i];
            if (btInfo.gameKey < GUI_Setting.SYSTEM_KEYS.length) {
                let gameKey = GUI_Setting.SYSTEM_KEYS[btInfo.gameKey];
                if (!this.gameKeyFunctions[gameKey]) this.gameKeyFunctions[gameKey] = [];
                this.gameKeyFunctions[gameKey].push({ functionID: btInfo.battleFunction, eventID: btInfo.eventID });
            }
            else {
                let keyCode = btInfo.keyCode;
                if (!this.keyboardFunctions[keyCode]) this.keyboardFunctions[keyCode] = [];
                this.keyboardFunctions[keyCode].push({ functionID: btInfo.battleFunction, eventID: btInfo.eventID });
            }
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 功能
    //------------------------------------------------------------------------------------------------------
    /**
     * 设置按键方向根据指定的方向
     * @param dir 方向
     */
    static setDirKeyDown(dir: number): void {
        // 0DOWN/1UP/2LEFT/3RIGHT
        let arr: number[][] = [
            null,
            [0, 2], // 1
            [0], // 2
            [0, 3], // 3
            [2], // 4
            null, // 5
            [3], // 6
            [1, 2], // 7
            [1], // 8
            [1, 3] // 9
        ];
        let dirs = arr[dir]
        this.clearKeyDown();
        for (let i in dirs) {
            this.dirKeyDown[dirs[i]] = true;
        }
        this.updateDir();
    }
    //------------------------------------------------------------------------------------------------------
    // 内部实现-按键
    //------------------------------------------------------------------------------------------------------
    /**
     * 当键盘按下时
     * @param e 
     */
    private static onKeyDown(e: EventObject) {
        // 跳过对话
        if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.A)) {
            if (GameDialog.isInDialog) {
                if (GameDialog.isPlaying) {
                    Callback.CallLaterBeforeRender(GameDialog.showall, GameDialog)
                }
                else {
                    Callback.CallLaterBeforeRender(GameDialog.skip, GameDialog)
                }
                return;
            }
        }
        // 当允许场景控制时
        if (Controller.inSceneEnabled) {
            // 方向按键按下
            this.dirKeyDownTrue(e.keyCode, true);
            // 调查/对话
            if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.A)) {
                Callback.CallLaterBeforeRender(KeyboardControl.tryTriggerSceneObjectClickEvent, KeyboardControl)
            }
            // 执行战斗按键逻辑（系统按键）
            for (let s in GUI_Setting.KEY_BOARD) {
                let keyInfo = GUI_Setting.KEY_BOARD[s];
                if (GUI_Setting.IS_KEY(e.keyCode, keyInfo)) {
                    let gameKeyFunctions = this.gameKeyFunctions[s];
                    this.doGameKeyFunctions(gameKeyFunctions);
                    break;
                }
            }
            // 执行战斗按键逻辑（键盘）
            this.doGameKeyFunctions(this.keyboardFunctions[e.keyCode]);
        }
    }
    /**
     * 当按键弹起时
     * @param e 
     */
    private static onKeyUp(e: EventObject) {
        this.dirKeyDownTrue(e.keyCode, false);
    }
    /**
     * 战斗按键执行
     * @param functions 
     */
    private static doGameKeyFunctions(functions: { functionID: number, eventID: number }[]): void {
        if (!functions) return;
        for (var i = 0; i < functions.length; i++) {
            let functionInfo = functions[i];
            let functionID = functionInfo.functionID;
            // -- 攻击和技能在非战斗模式下无法使用
            if (functionID >= 1 && functionID <= 16) {
                if (WorldData.battleMode != 0) continue;
            }
            if (functionID == 0) {
                ProjectPlayer.changeToNextCtrlActor();
            }
            else if (functionID == 1) {
                GameBattleAction.useSkill(ProjectPlayer.ctrlActorSceneObject, ProjectPlayer.ctrlActorBattleModule.actor.atkSkill);
            }
            else if (functionID == 17) {
                GameCommand.startCommonCommand(functionInfo.eventID, [], null, ProjectPlayer.ctrlActorSceneObject, ProjectPlayer.ctrlActorSceneObject);
            }
            else {
                let activeSkills = GameBattleHelper.getActiveSkills(ProjectPlayer.ctrlActorBattleModule.actor);
                let activeSkill = activeSkills[functionID - 2];
                if (activeSkill) GameBattleAction.useSkill(ProjectPlayer.ctrlActorSceneObject, activeSkill);
            }
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 内部实现-场景对象点击事件
    //------------------------------------------------------------------------------------------------------
    /**
     * 尝试触发场景对象点击事件
     * -- 第一判断：然后按照本这个格子触发
     * -- 第二判断：优先按照方向前一格
     */
    private static tryTriggerSceneObjectClickEvent(): void {
        let d: number = ProjectPlayer.ctrlActorSceneObject.avatarOri;
        if (this.dirOffsetArr[d] == null) return;
        if (!Game.currentScene) return;
        let sceneUtils = Game.currentScene.sceneUtils;
        let playerGridPos = ProjectPlayer.ctrlActorSceneObject.posGrid;
        // 第一判断：然后按照本这个格子触发
        // 本格越界的场合忽略掉
        if (sceneUtils.isOutsideByGrid(playerGridPos)) return;
        // 自定义碰撞区触发
        let customCollisionArr = SoModule_CustomCollision.collisionTest(Game.player.sceneObject, true, null, false);
        if (customCollisionArr.length > 0) {
            for (let i = 0; i < customCollisionArr.length; i++) {
                let ccInfo = customCollisionArr[i];
                if (ccInfo.so.hasCommand[0]) {
                    Controller.startSceneObjectClickEvent(ccInfo.so);
                    return;
                }
            }
        }
        // 本格触发
        let thisGridSos = sceneUtils.gridSceneObjects[ProjectPlayer.ctrlActorSceneObject.posGrid.x][ProjectPlayer.ctrlActorSceneObject.posGrid.y];
        for (let i = 0; i < thisGridSos.length; i++) {
            let so = thisGridSos[i];
            if (so == null || !so.inScene || so == ProjectPlayer.ctrlActorSceneObject || !so.hasCommand[0]) continue;
            Controller.startSceneObjectClickEvent(so);
            return;
        }
        // 我的范围
        let myPosRect = ProjectPlayer.ctrlActorSceneObject.posRect;
        // 碰撞中的对象
        let intersectionMin = Config.SCENE_GRID_SIZE / 4; // 1/4格子大小最低交叉
        let soLen = Game.currentScene.sceneObjects.length;
        for (let i = 0; i < soLen; i++) {
            let so = Game.currentScene.sceneObjects[i];
            // 无对象、玩家自己、无点击事件、不在场上的对象忽略掉
            if (so == null || !so.inScene || so == ProjectPlayer.ctrlActorSceneObject || !so.hasCommand[0]) continue;
            // 判断是否击中
            let intersectionRect = so.posRect.intersection(myPosRect);
            // 交集超过1/4格子时
            if (intersectionRect && intersectionRect.width >= intersectionMin && intersectionRect.height > intersectionMin) {
                Controller.startSceneObjectClickEvent(so);
                return;
            }
        }
        // 向前模拟一格开始碰撞
        let halfGrid = Config.SCENE_GRID_SIZE * Config.SCENE_GRID_SIZE;
        if (WorldData.moveToGridCenter) halfGrid *= 0.75;
        let myPoTest = new Point(ProjectPlayer.ctrlActorSceneObject.x, ProjectPlayer.ctrlActorSceneObject.y);
        myPoTest.x += this.dirOffsetArr[d][0] / 2 * Config.SCENE_GRID_SIZE;
        myPoTest.y += this.dirOffsetArr[d][1] / 2 * Config.SCENE_GRID_SIZE;
        let minTarget: ProjectClientSceneObject = null;
        let minNumber = Number.MAX_VALUE;
        for (let i = 0; i < soLen; i++) {
            let so = Game.currentScene.sceneObjects[i];
            // 无对象、玩家自己、无点击事件、不在场上的对象忽略掉
            if (so == null || !so.inScene || so == ProjectPlayer.ctrlActorSceneObject || !so.hasCommand[0]) continue;
            // 判断是否击中
            let dis2 = Point.distanceSquare2(so.x, so.y, myPoTest.x, myPoTest.y);
            // 交集超过1/4格子时
            if (dis2 <= halfGrid) {
                if (dis2 < minNumber) {
                    minTarget = so
                    minNumber = dis2;
                }
            }
        }
        if (minTarget) Controller.startSceneObjectClickEvent(minTarget);
    }
    //------------------------------------------------------------------------------------------------------
    // 内部实现-方向
    //------------------------------------------------------------------------------------------------------
    /**
     * 刷新：方向键移动人物
     * -- 当面向0时不响应
     * -- 当没有改变按键方向的话，检测未到达目的地就不再请求移动
     */
    private static update(): void {
        if (!Controller.inSceneEnabled) return;
        let toX: number;
        let toY: number;
        // 技能释放中忽略
        if (ProjectPlayer.ctrlActorBattleModule && ProjectPlayer.ctrlActorBattleModule.duringRelease) {
            return;
        }
        // 弹起了所有移动方向按键的情况
        if (this.dir == 0) {
            if (Controller.inputState == 1) {
                Controller.inputState = 0;
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
            }
            return;
        }
        // 计算移动的目的地
        Controller.inputState = 1;
        this.isChangeDir = false;
        let xGrid: number = Math.floor(ProjectPlayer.ctrlActorSceneObject.x / Config.SCENE_GRID_SIZE) + this.dirOffsetArr[this.dir][0];
        let yGrid: number = Math.floor(ProjectPlayer.ctrlActorSceneObject.y / Config.SCENE_GRID_SIZE) + this.dirOffsetArr[this.dir][1];
        if (ClientWorld.data.moveToGridCenter) {
            toX = xGrid;
            toY = yGrid;
        }
        else {
            toX = ProjectPlayer.ctrlActorSceneObject.x + this.dirOffsetArr[this.dir][0] * Config.SCENE_GRID_SIZE * 2;
            toY = ProjectPlayer.ctrlActorSceneObject.y + this.dirOffsetArr[this.dir][1] * Config.SCENE_GRID_SIZE * 2;
        }
        // 不是移动至格子中心点的情况：
        if (!ClientWorld.data.moveToGridCenter) {
            // 变更了目的地的情况允许移动
            if (this.lastDx != this.dirOffsetArr[this.dir][0] || this.lastDy != this.dirOffsetArr[this.dir][1]) {
                this.lastDx = this.dirOffsetArr[this.dir][0];
                this.lastDy = this.dirOffsetArr[this.dir][1];
            }
            // 未变更目的地的情况如果处于移动中则无法再次移动
            else if (ProjectPlayer.ctrlActorSceneObject.isMoving) {
                return;
            }
            this.moveDirect(toX, toY);
        }
        // 移动至格子中心点的情况，如果不处于移动状态才允许继续移动
        else if (!ProjectPlayer.ctrlActorSceneObject.isMoving) {
            this.moveDirectGrid(xGrid, yGrid);
        }
    }
    /**
     * 开启按键后持续移动用的清除
     */
    private static clearKeyDown(): void {
        for (let i in this.dirKeyDown) {
            this.dirKeyDown[i] = false;
        }
        this.dir = 0;
    }
    /**
     * 确定按键按下状态
     * @param keyCode 按键值 
     * @param isDown 是否按下
     * @return [boolean] 
     */
    private static dirKeyDownTrue(keyCode: number, isDown: boolean): boolean {
        if (GUI_Setting.IS_KEY(keyCode, GUI_Setting.KEY_BOARD.DOWN)) { this.lastKeyDown = 0; this.dirKeyDown[0] = isDown; this.updateDir(); return true; }
        else if (GUI_Setting.IS_KEY(keyCode, GUI_Setting.KEY_BOARD.UP)) { this.lastKeyDown = 1; this.dirKeyDown[1] = isDown; this.updateDir(); return true; }
        else if (GUI_Setting.IS_KEY(keyCode, GUI_Setting.KEY_BOARD.LEFT)) { this.lastKeyDown = 2; this.dirKeyDown[2] = isDown; this.updateDir(); return true; }
        else if (GUI_Setting.IS_KEY(keyCode, GUI_Setting.KEY_BOARD.RIGHT)) { this.lastKeyDown = 3; this.dirKeyDown[3] = isDown; this.updateDir(); return true; }
        return false;
    }
    /**
     * 根据按键按下状态刷新方向
     */
    private static updateDir(): void {
        let oldDir: number = this.dir;
        this.dir = 0;
        if (this.leftDown && this.upDown) { this.dir = 7; }
        else if (this.rightDown && this.upDown) { this.dir = 9; }
        else if (this.rightDown && this.downDown) { this.dir = 3; }
        else if (this.leftDown && this.downDown) { this.dir = 1; }
        else if (this.leftDown) { this.dir = 4; }
        else if (this.rightDown) { this.dir = 6; }
        else if (this.downDown) { this.dir = 2; }
        else if (this.upDown) { this.dir = 8; }
        if (ClientWorld.data.moveDir4) {
            if (this.dir == 7) this.dir = this.lastKeyDown == 2 ? 4 : 8;
            if (this.dir == 9) this.dir = this.lastKeyDown == 3 ? 6 : 8;
            if (this.dir == 3) this.dir = this.lastKeyDown == 3 ? 6 : 2;
            if (this.dir == 1) this.dir = this.lastKeyDown == 2 ? 4 : 2;
        }
        this.isChangeDir = this.dir != oldDir;
        // 取消移动结束后触发点击事件（空白事件）
        this.offMoveOverTriggerClickEvent();
    }
    /**
     * 获取左方向键是否按下 
     * @return [boolean] 
     */
    private static get leftDown(): boolean {
        return this.dirKeyDown[2];
    }
    /**
     * 获取右方向键是否按下
     */
    private static get rightDown(): boolean {
        return this.dirKeyDown[3];
    }
    /**
     * 获取下方向键是否按下 
     */
    private static get downDown(): boolean {
        return this.dirKeyDown[0];
    }
    /**
     * 获取上方向键是否按下 
     */
    private static get upDown(): boolean {
        return this.dirKeyDown[1];
    }
    /**
     * 移动至指定的格子中心点
     * @param xGrid 格子坐标点x
     * @param yGrid 格子坐标点y
     */
    static moveDirectGrid(xGrid: number, yGrid: number): void {
        // 无法移动的场合
        if (!GameBattleHelper.canMove(ProjectPlayer.ctrlActorSceneObject)) {
            return;
        }
        if (!ProjectPlayer.ctrlActorSceneObject.fixOri) ProjectPlayer.ctrlActorSceneObject.avatarOri = this.dir;
        ProjectPlayer.ctrlActorSceneObject.ignoreCantMove = true;
        ProjectPlayer.ctrlActorSceneObject.keepMoveActWhenCollsionObstacleAndIgnoreCantMove = true;
        let toX = xGrid * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE / 2;
        let toY = yGrid * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE / 2;
        ProjectPlayer.ctrlActorSceneObject.autoFindRoadMove(toX, toY, 2, Game.oneFrame)
    }
    /**
     * 移动至指定坐标
     * @param x 像素点x
     * @param y 像素点y
     * @param trySingleDir 尝试单方向移动，斜方向可能走不通的情况，变为只移动x或只移动y来尝试滑动
     */
    static moveDirect(x: number, y: number, trySingleDir: boolean = true): boolean {
        // 无法移动的场合
        if (!GameBattleHelper.canMove(ProjectPlayer.ctrlActorSceneObject)) {
            return;
        }
        ProjectPlayer.ctrlActorSceneObject.ignoreCantMove = true;
        ProjectPlayer.ctrlActorSceneObject.keepMoveActWhenCollsionObstacleAndIgnoreCantMove = true;
        if (trySingleDir) {
            if (this.dir != 0 && !ProjectPlayer.ctrlActorSceneObject.fixOri) ProjectPlayer.ctrlActorSceneObject.avatarOri = this.dir;
        }
        let oldX = ProjectPlayer.ctrlActorSceneObject.x;
        let oldY = ProjectPlayer.ctrlActorSceneObject.y;
        ProjectPlayer.ctrlActorSceneObject.startMove([[x, y]], Game.oneFrame)
        // 如果未能移动的话，尝试
        if (ProjectPlayer.ctrlActorSceneObject.x == oldX && ProjectPlayer.ctrlActorSceneObject.y == oldY) {
            // 派发的移动需要在遇到障碍时停止移动。
            if (trySingleDir) {
                // 斜方向的话就尝试
                if (x != ProjectPlayer.ctrlActorSceneObject.x && y != ProjectPlayer.ctrlActorSceneObject.y) {
                    let newX = ProjectPlayer.ctrlActorSceneObject.x;
                    let newY = ProjectPlayer.ctrlActorSceneObject.y + (y - ProjectPlayer.ctrlActorSceneObject.y < 0 ? -Config.SCENE_GRID_SIZE : Config.SCENE_GRID_SIZE);
                    if (!this.moveDirect(newX, newY, false)) {
                        newX = ProjectPlayer.ctrlActorSceneObject.x + (x - ProjectPlayer.ctrlActorSceneObject.x < 0 ? -Config.SCENE_GRID_SIZE : Config.SCENE_GRID_SIZE);
                        newY = ProjectPlayer.ctrlActorSceneObject.y;
                        if (!this.moveDirect(newX, newY, false)) {
                            return false;
                        }
                        else {
                            return true;
                        }
                    }
                    else {
                        return true;
                    }
                }
                // 非斜方向的话看看趋势格子是否存在障碍，如果不存在障碍就使用平滑移动
                else {
                    if (ProjectPlayer.ctrlActorSceneObject.lastTouchObjects.length == 0) {
                        let dx = x - ProjectPlayer.ctrlActorSceneObject.x;
                        let dy = y - ProjectPlayer.ctrlActorSceneObject.y;
                        if (dx != 0) dx = dx < 0 ? -1 : 1;
                        if (dy != 0) dy = dy < 0 ? -1 : 1;
                        // 如果目标点无障碍且我当前未接触任何对象时允许移动
                        let dGridP = new Point(ProjectPlayer.ctrlActorSceneObject.posGrid.x + dx, ProjectPlayer.ctrlActorSceneObject.posGrid.y + dy);
                        if (!Game.currentScene.sceneUtils.isFixedObstacleGrid(dGridP)) {
                            let newToP = GameUtils.getGridCenterByGrid(dGridP);
                            ProjectPlayer.ctrlActorSceneObject.autoFindRoadMove(newToP.x, newToP.y, 0, Game.oneFrame, true, false, true);
                        }
                    }
                }
            }
            return false;
        }
        return true;
    }
    /**
     * 取消移动结束后触发点击事件（空白事件）
     */
    private static offMoveOverTriggerClickEvent(): void {
        let f = GlobalTempData["__listenMoveOver"];
        if (f) {
            ProjectPlayer.ctrlActorSceneObject.off(ProjectClientSceneObject.MOVE_OVER, Game.player, f);
            f = null;
        }
    }

}