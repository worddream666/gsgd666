/**
 * 虚拟键盘
 * Created by 黑暗之神KDS on 2022-03-11 20:28:26.
 */
class GUI_VirtualKeyboard extends GUI_12 {
    /**
     * 事件：摇杆四方向 onVirtualKeyboardDir4Change(dir:number) dir=2下 4左 6右 8上 0-无
     */
    static VIRTUALKEYBOARD_DIR4_CHANGE: string = "VIRTUALKEYBOARD_DIR4_CHANGE";
    /**
     * 单例
     */
    static self: GUI_VirtualKeyboard;
    //------------------------------------------------------------------------------------------------------
    //  
    //------------------------------------------------------------------------------------------------------
    /**
     * 刷新，如果摇杆按下中则直接派发
     */
    static refresh(): void {
        let virtualKeyboardUI = GameUI.get(12) as GUI_VirtualKeyboard;
        if (virtualKeyboardUI && virtualKeyboardUI.touchId != null) {
            Controller.startJoy(virtualKeyboardUI.lastAngle);
        }
    }
    //------------------------------------------------------------------------------------------------------
    //  实例
    //------------------------------------------------------------------------------------------------------
    /**
     * 摇杆中心点
     */
    private rockerCenterPoint = new Point;
    /**
     * 记录上次的方向键值
     */
    private lastMenuDir: number = 0;
    /**
     * 摇杆半径
     */
    private rockerR: number;
    private touchId: number;
    private lastAngle: number;
    /**
     * 开始进入到游戏内容区域外标识
     */
    private startWindowMouseUpToStopDragRokered: boolean;
    /**
     * 移动端-可视区域外仍然可操作相关参数
     */
    private lockRockerMouseX: number;
    private lockRockerMouseY: number;
    private startClientX: number;
    private startClientY: number;
    private startRockerBgMouseX: number;
    private startRockerBgMouseY: number;

    constructor() {
        super();
        GUI_VirtualKeyboard.self = this;
        this.init();
    }
    /**
     * 初始化
     */
    private init(): void {
        if (!this.rocker || !this.rockerBg) return;
        // 初始化参数
        this.rockerCenterPoint = new Point(Math.floor(this.rockerBg.width / 2), Math.floor(this.rockerBg.height / 2));
        this.rockerR = this.rockerBg.width / 2;
        this.stopDragRocker(null);
        // 初始化事件
        this.rocker.on(EventObject.MOUSE_DOWN, this, this.startDragRocker);
        this.rockerBg.on(EventObject.MOUSE_DOWN, this, this.startDragRocker);
        // 监听方向键改变
        this.on(GUI_VirtualKeyboard.VIRTUALKEYBOARD_DIR4_CHANGE, this, this.onVirtualKeyboardMenuDirChange);
        // 保持该界面最前方显示
        EventUtils.addEventListenerFunction(GameUI, GameUI.EVENT_OPEN_SYSTEM_UI, (uiID: number) => {
            if (uiID != 12) {
                if (this.stage) GameUI.show(12);
            }
        }, this);
        EventUtils.addEventListenerFunction(GameDialog, GameDialog.EVENT_DIALOG_START, (isOption: boolean, content: string, options: string[], name: string, head: string | number, expression: number, audioURL: string, speed: number) => {
            if (this.stage) GameUI.show(12);
        }, this);
    }
    /**
     * 开始拖拽摇杆
     * @param e 
     */
    private startDragRocker(e: EventObject) {
        this.stopDragRocker(null);
        this.touchId = e.touchId;
        stage.on(EventObject.MOUSE_UP, this, this.stopDragRocker);
        if (!this.isUseTouch) stage.on(EventObject.MOUSE_MOVE, this, this.updateRocker);
        else this.startBeyondBoundariesHandle(e);
        this.updateRocker(e);
    }
    /**
     * 停止拖拽摇杆
     * @param e 
     */
    private stopDragRocker(e: EventObject) {
        if (this.isDisposed) return;
        if (e && e.touchId != this.touchId) return;
        this.touchId = null;
        this.endBeyondBoundariesHandle();
        stage.off(EventObject.MOUSE_MOVE, this, this.updateRocker);
        stage.off(EventObject.MOUSE_UP, this, this.stopDragRocker);
        this.rocker.x = this.rockerCenterPoint.x;
        this.rocker.y = this.rockerCenterPoint.y;
        Controller.stopJoy();
        if (this.lastMenuDir != 0) {
            this.lastMenuDir = 0;
            this.event(GUI_VirtualKeyboard.VIRTUALKEYBOARD_DIR4_CHANGE, [0]);
        }
    }
    /**
     * 更新摇杆
     */
    private updateRocker(e: EventObject) {
        if (this.isDisposed) return;
        if (e && e.touchId != this.touchId) return;
        // 限制在圆形范围内
        let localMouseX = this.lockRockerMouseX != null ? this.lockRockerMouseX : this.rockerBg.mouseX;
        let localMouseY = this.lockRockerMouseY != null ? this.lockRockerMouseY : this.rockerBg.mouseY;
        let dis = Point.distance2(this.rockerCenterPoint.x, this.rockerCenterPoint.y, localMouseX, localMouseY);
        let per = this.rockerR / dis;
        if (per > 1) per = 1;
        let currentP = Point.interpolate2(localMouseX, localMouseY, this.rockerCenterPoint.x, this.rockerCenterPoint.y, per);
        this.rocker.x = currentP[0];
        this.rocker.y = currentP[1];
        // 距离过小则忽略
        if (dis < this.rockerR * 0.4) return;
        // 获取方位角度
        let angle = MathUtils.direction360(this.rockerCenterPoint.x, this.rockerCenterPoint.y, localMouseX, localMouseY);
        // 四方向移动：根据角度计算方向
        if (ClientWorld.data.moveDir4) {
            angle = GameUtils.getAngleByOri(GameUtils.getAssetOri(GameUtils.getOriByAngle(angle), 4));
        }
        // 四方向
        let menuDir: number;
        if (angle <= 45 || angle >= 315) {
            menuDir = 8;
        }
        else if (angle >= 45 && angle <= 135) {
            menuDir = 6;
        }
        else if (angle >= 135 && angle <= 225) {
            menuDir = 2;
        }
        else if (angle >= 225 && angle <= 315) {
            menuDir = 4;
        }
        if (this.lastMenuDir != menuDir) {
            this.lastMenuDir = menuDir;
            this.event(GUI_VirtualKeyboard.VIRTUALKEYBOARD_DIR4_CHANGE, [menuDir]);
        }
        this.lastAngle = angle;
        Controller.startJoy(angle);
    }
    private onVirtualKeyboardMenuDirChange(dir: number) {
        // 在菜单中支持控制（List）
        if (Controller.inSceneEnabled) return;
        let m = {
            2: GUI_Setting.KEY_BOARD.DOWN.keys[0], 4: GUI_Setting.KEY_BOARD.LEFT.keys[0],
            6: GUI_Setting.KEY_BOARD.RIGHT.keys[0], 8: GUI_Setting.KEY_BOARD.UP.keys[0]
        };
        let transKeyCode = m[dir];
        if (transKeyCode) stage.event(EventObject.KEY_DOWN, [{ keyCode: transKeyCode }]);
    }
    //------------------------------------------------------------------------------------------------------
    // 用于修正摇杆超出游戏区域边界外后的处理：mouseup后仍然可以归位
    //------------------------------------------------------------------------------------------------------
    private startBeyondBoundariesHandle(ev: EventObject) {
        let e = ev.nativeEvent;
        this.startClientX = this.getClientX(e, this.touchId);
        this.startClientY = this.getClientY(e, this.touchId);
        this.startRockerBgMouseX = this.rockerBg.mouseX;
        this.startRockerBgMouseY = this.rockerBg.mouseY;
        this.endBeyondBoundariesHandle();
        document.addEventListener(this.mouseMoveType, this.doCheckBeyondBoundaries)
    }
    private endBeyondBoundariesHandle() {
        this.startWindowMouseUpToStopDragRokered = false;
        document.removeEventListener(this.mouseUpType, this.doWindowMouseUpToStopDragRoker)
        document.removeEventListener(this.mouseMoveType, this.doCheckBeyondBoundaries)
    }
    private doCheckBeyondBoundaries(e) {
        let _this: GUI_VirtualKeyboard = GUI_VirtualKeyboard.self;
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier == _this.touchId) {
                let winW = window.innerWidth;
                let winH = window.innerHeight;
                let per = GameUtils.getAutoFitSizePre(new Rectangle(0, 0, stage.width, stage.height), new Rectangle(0, 0, winW, winH));
                let stageW = per * stage.width;
                let stageH = per * stage.height;
                let clientX = Browser.onPC ? e.clientX : e.changedTouches[_this.touchId]?.clientX;
                let clientY = Browser.onPC ? e.clientY : e.changedTouches[_this.touchId]?.clientY;
                let gameClientX = _this.getClientX(e, _this.touchId);
                let gameClientY = _this.getClientY(e, _this.touchId);
                _this.lockRockerMouseX = _this.startRockerBgMouseX + (gameClientX - _this.startClientX)
                _this.lockRockerMouseY = _this.startRockerBgMouseY + (gameClientY - _this.startClientY)
                _this.updateRocker({ touchId: _this.touchId } as any);
                if (winW > stageW) {
                    let eW = (winW - stageW) / 2;
                    if (clientX <= eW || clientX >= eW + stageW) {
                        _this.startWindowMouseUpToStopDragRoker();
                    }
                }
                if (winH > stageH) {
                    let eH = (winH - stageH) / 2;
                    if (clientY <= eH || clientY >= eH + stageH) {
                        _this.startWindowMouseUpToStopDragRoker();
                    }
                }
            }
        }
    }
    private startWindowMouseUpToStopDragRoker(): void {
        let _this: GUI_VirtualKeyboard = GUI_VirtualKeyboard.self;
        if (_this.startWindowMouseUpToStopDragRokered) {
            return;
        }
        _this.startWindowMouseUpToStopDragRokered = true;
        document.addEventListener(this.mouseUpType, _this.doWindowMouseUpToStopDragRoker)
    }
    private doWindowMouseUpToStopDragRoker(e): void {
        let _this: GUI_VirtualKeyboard = GUI_VirtualKeyboard.self;
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier == _this.touchId) {
                _this.stopDragRocker(null);
                _this.endBeyondBoundariesHandle();
                _this.startWindowMouseUpToStopDragRokered = false;
                document.removeEventListener(this.mouseUpType, _this.doWindowMouseUpToStopDragRoker)
                _this.lockRockerMouseX = null;
                _this.lockRockerMouseY = null;
            }
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    private get mouseMoveType(): string {
        return Browser.onPC ? `mousemove` : `touchmove`;
    }
    private get mouseUpType(): string {
        return Browser.onPC ? `mouseup` : `touchend`;
    }
    /**
     * 获取ClientX
     */
    private getClientX(nativeE, touchId: number) {
        let isOri = (!this.isNativeAPP && stage.screenMode == `horizontal` && stage.width > stage.height);
        let oClientX: number;
        if (isOri) {
            oClientX = Browser.onPC ? nativeE.clientY : this.getChangedTouches(nativeE, touchId)?.clientY;
        }
        else {
            oClientX = Browser.onPC ? nativeE.clientX : this.getChangedTouches(nativeE, touchId)?.clientX;
        }
        oClientX = oClientX * Browser.pixelRatio / stage.clientScaleX;
        return oClientX;
    }
    /**
     * 获取touchObject根据touchID
     * @param touchId 
     */
    private getClientY(nativeE, touchId: number) {
        let isOri = (!this.isNativeAPP && stage.screenMode == `horizontal` && stage.width > stage.height);
        let oClientY: number;
        if (isOri) {
            oClientY = Browser.onPC ? nativeE.clientX : this.getChangedTouches(nativeE, touchId)?.clientX;
            oClientY = stage.height / stage.clientScaleY - oClientY
        }
        else {
            oClientY = Browser.onPC ? nativeE.clientY : this.getChangedTouches(nativeE, touchId)?.clientY;
        }
        oClientY = oClientY * Browser.pixelRatio / stage.clientScaleY;
        return oClientY;
    }
    /**
     * 获取touchObject根据touchID
     * @param touchId 
     */
    private getChangedTouches(nativeE, touchId: number) {
        for (let i = 0; i < nativeE.changedTouches.length; i++) {
            const touch = nativeE.changedTouches[i];
            if (touch.identifier == touchId) {
                return touch
            }
        }
        return null;
    }
    /**
     * 是否使用触碰实现
     */
    private get isUseTouch(): boolean {
        return !Browser.onPC && typeof document != "undefined";
    }
    private get isNativeAPP(): boolean {
        return [0, 2, 3].indexOf(os.platform) == -1;
    }
}