/**
 * 游戏手柄控制器
 * Created by 黑暗之神KDS on 2020-03-26 03:50:18.
 */
class GamepadControl {
    /**
     * 辅助计算
     */
    private static lastJoyAngle8: number;
    //------------------------------------------------------------------------------------------------------
    // 启动和停止
    //------------------------------------------------------------------------------------------------------
    static init(): void {
        GCGamepad.pad1.on(GCGamepad.GAMEPAD_LEFT_JOY_DIR4_CHANGE, this, this.onGamepadMenuDirChange, [true]);
        GCGamepad.pad1.on(GCGamepad.GAMEPAD_LEFT_KEY_CHANGE, this, this.onGamepadMenuDirChange, [false]);
        GCGamepad.pad1.on(GCGamepad.GAMEPAD_KEY_DOWN, this, this.onGamepadKeyDown, [EventObject.KEY_DOWN]);
        GCGamepad.pad1.on(GCGamepad.GAMEPAD_KEY_UP, this, this.onGamepadKeyDown, [EventObject.KEY_UP]);
    }
    /**
     * 启动
     */
    static start(): void {
        // 摇杆
        GCGamepad.pad1.on(GCGamepad.GAMEPAD_LEFT_KEY_CHANGE, this, this.onLeftKeyChange);
        os.add_ENTERFRAME(this.update, this);
    }
    /**
     * 停止
     */
    static stop(): void {
        // 按键
        GCGamepad.pad1.off(GCGamepad.GAMEPAD_LEFT_KEY_CHANGE, this, this.onLeftKeyChange);
        os.remove_ENTERFRAME(this.update, this);
    }
    //------------------------------------------------------------------------------------------------------
    // 方向移动
    //------------------------------------------------------------------------------------------------------
    /**
     * 左方向键按键移动
     * @param dir 方向
     */
    private static onLeftKeyChange(dir: number) {
        KeyboardControl.setDirKeyDown(dir);
    }
    /**
     * 更新：处理左摇杆-角色移动
     */
    private static update() {
        if (!Controller.inSceneEnabled) return;
        let joyX = GCGamepad.pad1.leftJoyPoint.x;
        let joyY = GCGamepad.pad1.leftJoyPoint.y;
        // 标准化摇杆值
        let max = Math.max(Math.abs(joyX), Math.abs(joyY));
        if (max != 0) {
            let per = 1 / max;
            joyX *= per;
            joyY *= per;
        }
        if (joyX == 0 && joyY == 0) {
            if (Controller.inputState == 2) {
                Controller.inputState = 0;
                Controller.stopJoy();
            }
            return;
        }
        // 四方向移动：根据角度计算方向
        if (ClientWorld.data.moveDir4) {
            let angle = MathUtils.direction360(0, 0, joyX, joyY);
            let dir = GameUtils.getOriByAngle(angle);
            let dir4 = GameUtils.getAssetOri(dir, 4);
            let offset = KeyboardControl.dirOffsetArr[dir4];
            joyX = offset[0];
            joyY = offset[1];
        }
        let angle: number;
        let toX = ProjectPlayer.ctrlActorSceneObject.x + joyX * Config.SCENE_GRID_SIZE;
        let toY = ProjectPlayer.ctrlActorSceneObject.y + joyY * Config.SCENE_GRID_SIZE;
        // 移动至格子中心点且八方向的情况
        if (WorldData.moveToGridCenter && !WorldData.moveDir4) {
            ProjectUtils.pointHelper.x = joyX;
            ProjectUtils.pointHelper.y = joyY;
            angle = GCGamepad.pad1.getJoyPointAngle(ProjectUtils.pointHelper);
            if (ProjectPlayer.ctrlActorSceneObject.isMoving) {
                let joyAngle8 = GameUtils.getAngleByOri(GameUtils.getOriByAngle(angle));
                if (this.lastJoyAngle8 == joyAngle8) {
                    return;
                }
                this.lastJoyAngle8 = joyAngle8;
                Controller.stopJoy();
            }
        }
        else {
            angle = Math.floor(MathUtils.direction360(ProjectPlayer.ctrlActorSceneObject.x, ProjectPlayer.ctrlActorSceneObject.y, toX, toY));
            if (ClientWorld.data.moveToGridCenter && ProjectPlayer.ctrlActorSceneObject.isMoving) {
                Controller.stopJoy();
                return;
            }
            // 移动至格子中心点，转化为格子中心点
            if (ClientWorld.data.moveToGridCenter) {
                let toP = GameUtils.getGridCenter(new Point(toX, toY));
                toX = toP.x;
                toY = toP.y;
            }
        }
        Controller.inputState = 2;
        Controller.startJoy(angle);
    }
    //------------------------------------------------------------------------------------------------------
    // 手柄通用操作-内部实现
    //------------------------------------------------------------------------------------------------------
    /**
     * 当使用手柄控制菜单方向
     * @param isJoy 
     * @param dir 
     */
    private static onGamepadMenuDirChange(isJoy: boolean, dir: number) {
        ProjectUtils.fromGamePad = true;
        // 在菜单中支持控制（List）
        if (Controller.inSceneEnabled) return;
        // if (!GUI_Manager.inMenu && !GameDialog.isInDialog) return;
        let m = {
            2: GUI_Setting.KEY_BOARD.DOWN.keys[0], 4: GUI_Setting.KEY_BOARD.LEFT.keys[0],
            6: GUI_Setting.KEY_BOARD.RIGHT.keys[0], 8: GUI_Setting.KEY_BOARD.UP.keys[0]
        };
        let transKeyCode = m[dir];
        if (transKeyCode) stage.event(EventObject.KEY_DOWN, [{ keyCode: transKeyCode }]);
    }
    /**
     * 手柄按键-映射成键盘按键功能
     * -- 菜单按键映射菜单按键（头部标识为MENU）
     * -- 非菜单按键映射成非菜单按键
     * @param keyCode 
     */
    private static onGamepadKeyDown(keyboardEventType: string, keyCode: number): void {
        ProjectUtils.fromGamePad = true;
        if (GUI_Setting.IS_INPUT_KEY_MODE) return;
        switch (keyCode) {
            case GCGamepad.leftKeyIndex:
                return this.onGamepadMenuDirChange(true, 4);
            case GCGamepad.rightKeyIndex:
                return this.onGamepadMenuDirChange(true, 6);
            case GCGamepad.downKeyIndex:
                return this.onGamepadMenuDirChange(true, 2);
            case GCGamepad.upKeyIndex:
                return this.onGamepadMenuDirChange(true, 8);
        }
        let mapping = {
            [GUI_Setting.GAMEPAD.X.key]: GUI_Setting.KEY_BOARD.X,
            [GUI_Setting.GAMEPAD.Y.key]: GUI_Setting.KEY_BOARD.Y,
            [GUI_Setting.GAMEPAD.A.key]: GUI_Setting.KEY_BOARD.A,
            [GUI_Setting.GAMEPAD.B.key]: GUI_Setting.KEY_BOARD.B,
            [GUI_Setting.GAMEPAD.L1.key]: GUI_Setting.KEY_BOARD.L1,
            [GUI_Setting.GAMEPAD.L2.key]: GUI_Setting.KEY_BOARD.L2,
            [GUI_Setting.GAMEPAD.R1.key]: GUI_Setting.KEY_BOARD.R1,
            [GUI_Setting.GAMEPAD.R2.key]: GUI_Setting.KEY_BOARD.R2,
            [GUI_Setting.GAMEPAD.BACK.key]: GUI_Setting.KEY_BOARD.BACK,
            [GUI_Setting.GAMEPAD.START.key]: GUI_Setting.KEY_BOARD.START,
            [GCGamepad.leftKeyIndex]: GUI_Setting.KEY_BOARD.LEFT,
            [GCGamepad.rightKeyIndex]: GUI_Setting.KEY_BOARD.RIGHT,
            [GCGamepad.downKeyIndex]: GUI_Setting.KEY_BOARD.DOWN,
            [GCGamepad.upKeyIndex]: GUI_Setting.KEY_BOARD.UP
        }
        let keyboardInfo = mapping[keyCode];
        if (!keyboardInfo) return;
        stage.event(keyboardEventType, [{ keyCode: keyboardInfo.keys[0] }]);
    }
}