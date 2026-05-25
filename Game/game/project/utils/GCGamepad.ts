/**
 * 游戏手柄类
 *   该类适配了XBOX类、PS5的手柄
 * Created by 黑暗之神KDS on 2020-03-20 01:49:30.
 */
class GCGamepad extends EventDispatcher {
    //------------------------------------------------------------------------------------------------------
    // 事件
    //------------------------------------------------------------------------------------------------------
    /**
     * 事件：按键按下 onGamepadKeyDown(key:number) key对应GCGamepad的键位映射类别 如pad.xKey
     */
    static GAMEPAD_KEY_DOWN: string = "GCGamepad1";
    /**
     * 事件：按键弹起 onGamepadKeyUp(key:number) key对应GCGamepad的键位映射类别 如pad.xKey
     */
    static GAMEPAD_KEY_UP: string = "GCGamepad2";
    /**
     * 事件：摇杆改变 onGamepadJoyChange(isLeft:boolean,joyX:number,joyY:number,isFirstChange:boolean)
     */
    static GAMEPAD_JOY_CHANGE: string = "GCGamepad3";
    /**
     * 事件：方向键改变 onGamepadLeftKeyChange(dir:number) dir=0、1-8(5除外) 以小键盘5为中心的数字面向，0表示未按下
     */
    static GAMEPAD_LEFT_KEY_CHANGE: string = "GCGamepad4";
    /**
     * 事件：摇杆四方向 onGamepadLeftJoyDir4Change(dir:number) dir=2下 4左 6右 8上 0-无
     */
    static GAMEPAD_LEFT_JOY_DIR4_CHANGE: string = "GCGamepad5";
    /**
     * 事件：摇杆四方向 onGamepadRightJoyDir4Change(dir:number) dir=2下 4左 6右 8上 0-无
     */
    static GAMEPAD_RIGHT_JOY_DIR4_CHANGE: string = "GCGamepad6";
    /**
     * 键位名称
     */
    static keyNames: any = ["A", "B", "X", "Y", "LB", "RB", "LT", "RT", "BACK", "START", "LEFT_JOY_DOWN", "RIGHT_JOY_DOWN"]
    /**
     * 键位所在的keyMappings索引（该键位值默认为XBOX-360键位，而传统手柄键位通常在abxy上有一些差别）
     */
    static xKeyIndex: number = 2;
    static yKeyIndex: number = 3;
    static aKeyIndex: number = 0;
    static bKeyIndex: number = 1;
    static LBKeyIndex: number = 4;
    static LTKeyIndex: number = 6;
    static RBKeyIndex: number = 5;
    static RTKeyIndex: number = 7;
    static backKeyIndex: number = 8;
    static startKeyIndex: number = 9;
    static leftJoyDownKeyIndex: number = 10;
    static rightJoyDownKeyIndex: number = 11;
    static leftKeyIndex: number = 14;
    static rightKeyIndex: number = 15;
    static upKeyIndex: number = 12
    static downKeyIndex: number = 13;
    //------------------------------------------------------------------------------------------------------
    // 静态方法
    //------------------------------------------------------------------------------------------------------
    private static pads: GCGamepad[] = [];
    private static firstContinuityDelayTime: number = 500;
    private static continuityDelayTime: number = 30;
    /**
     * 获取游戏手柄
     * @param index 手柄索引
     * @return [GamePad] 
     */
    static getPad(index: number): GCGamepad {
        let pad = GCGamepad.pads[index];
        if (!pad) pad = GCGamepad.pads[index] = new GCGamepad(index);
        return pad;
    }
    /**
     * 常用手柄1
     */
    static get pad1(): GCGamepad {
        return this.getPad(0);
    }
    /**
     * 常用手柄2
     */
    static get pad2(): GCGamepad {
        return this.getPad(1);
    }
    /**
     * 常用手柄3
     */
    static get pad3(): GCGamepad {
        return this.getPad(2);
    }
    /**
     * 常用手柄4
     */
    static get pad4(): GCGamepad {
        return this.getPad(3);
    }
    //------------------------------------------------------------------------------------------------------
    // 实例属性
    //------------------------------------------------------------------------------------------------------
    /**
     * 索引，用于获取游戏手柄中可用的手柄
     */
    private index: number;

    //------------------------------------------------------------------------------------------------------
    // 键位映射
    //------------------------------------------------------------------------------------------------------
    /**
     * 键位映射：左摇杆
     */
    private leftJoy1: number = 0;
    private leftJoy2: number = 1;
    /**
     * 键位映射：左方向键
     */
    private leftKey: number = 9;
    /**
     * 键位映射：右摇杆
     */
    private rightJoy1: number = 2;
    private rightJoy2: number = 3
    /**
     * 键位映射：按键 aKey、bKey、xKey、yKey、LBKey、LTKey、RBKey、RTKey、backKey、startKey、leftJoyDownKey、rightJoyDownKey
     * 储存值是代表原生gamepad的buttons中的位置，比如3代表pad.buttons[3]，默认代表xKey
     */
    keyMappings = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    /**
     * 根据键位获取索引
     * @param keyCode 键位值
     */
    getKeyIndex(keyCode: number) {
        return this.keyMappings.indexOf(MathUtils.int(keyCode));
    }
    /**
     * 键位
     */
    xKey: number = 2;
    yKey: number = 3;
    aKey: number = 0;
    bKey: number = 1;
    LBKey: number = 4;
    LTKey: number = 6;
    RBKey: number = 5;
    RTKey: number = 7;
    backKey: number = 8;
    startKey: number = 9;
    leftJoyDownKey: number = 10;
    rightJoyDownKey: number = 11;
    /**
     * 键位默认值：摇杆未摇动的默认值
     */
    joyDefValue = 0.003921627998352051;
    /**
     * 方向键位应：
     */
    dirKeyMapping = {
        "1": 7, "-1": 8, "-0.7142857313156128": 9, "-0.4285714030265808": 6, "-0.1428571343421936": 3, "0.14285719394683838": 2, "0.4285714626312256": 1, "0.7142857313156128": 4
    }
    //------------------------------------------------------------------------------------------------------
    // 当前键位记录
    //------------------------------------------------------------------------------------------------------
    /**
     * 左摇杆点
     */
    leftJoyPoint: Point = new Point();
    /**
     * 右摇杆点
     */
    rightJoyPoint: Point = new Point();
    /**
     * 获取指定摇杆点的角度 0~360
     * @param 指定的摇杆点 如leftJoyPoint/rightJoyPoint
     */
    getJoyPointAngle(joyPoint: Point): number {
        // 270~360  x越大越靠近270，y越大，越靠近360
        if (joyPoint.x <= 0 && joyPoint.y <= 0) {
            return (joyPoint.x - joyPoint.y) * 45 + 315;
        }
        else if (joyPoint.x <= 0 && joyPoint.y >= 0) {
            return (-joyPoint.x - joyPoint.y) * 45 + 225;
        }
        else if (joyPoint.x >= 0 && joyPoint.y <= 0) {
            return (joyPoint.x + joyPoint.y) * 45 + 45;
        }
        else if (joyPoint.x >= 0 && joyPoint.y >= 0) {
            return (-joyPoint.x + joyPoint.y) * 45 + 135;
        }
        return 0;
    }
    /**
     * 左方向键 1-8（不包含5） 对应小键盘面向
     */
    leftKeyDir: number = 0;
    /**
     * 普通按键
     */
    private buttons: any = [false, false, false, false, false, false, false, false, false, false, false, false];
    //------------------------------------------------------------------------------------------------------
    // 辅助计算
    //------------------------------------------------------------------------------------------------------
    private tempPoint: Point = new Point();
    private leftJoyStartTime: number;
    private leftJoyFirstChangeTimes: boolean;
    private rightJoyStartTime: number;
    private rightJoyFirstChangeTimes: boolean;
    private leftKeyStartTime: number;
    private leftKeyFirstChangeTimes: boolean;
    private lastDir4Info: { lastMenuJoyTime: number, lastMenuClick: number, lastJoy: number[] }[] = [
        { lastMenuJoyTime: 0, lastMenuClick: null, lastJoy: [0, 0] },
        { lastMenuJoyTime: 0, lastMenuClick: null, lastJoy: [0, 0] }
    ];
    /**
     * 构造函数
     * @param index 
     */
    constructor(index: number) {
        super();
        this.index = index;
        os.add_ENTERFRAME(this.update, this);
    }
    /**
     * 销毁
     */
    dispose() {
        this.offAll();
        os.remove_ENTERFRAME(this.update, this);
    }
    /**
     * 刷新
     */
    private update() {
        // 获取可用的手柄
        if (!navigator.getGamepads) return;
        let gamepads = navigator.getGamepads();
        if (!gamepads || gamepads.length == 0) return;
        let pad: Gamepad;
        for (let i = 0, index = 0; i < gamepads.length; i++) {
            pad = gamepads[i];
            if (!pad || pad.id.indexOf("Unknown") != -1) continue;
            if (index == this.index) break;
            index++;
        }
        if (!pad) return;
        let now = new Date().getTime();
        // 左摇杆：状态不同则派发事件或连续按键间隔连续派发事件
        this.getJoyValue(pad, this.leftJoy1, this.leftJoy2, this.tempPoint);
        if (this.tempPoint.x != this.leftJoyPoint.x || this.tempPoint.y != this.leftJoyPoint.y) {
            this.leftJoyPoint.x = this.tempPoint.x;
            this.leftJoyPoint.y = this.tempPoint.y;
            this.leftJoyStartTime = now;
            this.leftJoyFirstChangeTimes = true;
            this.onGamepadJoyChange(true, this.leftJoyPoint.x, this.leftJoyPoint.y);
            this.event(GCGamepad.GAMEPAD_JOY_CHANGE, [true, this.leftJoyPoint.x, this.leftJoyPoint.y, true]);
        }
        else {
            if (((this.leftJoyFirstChangeTimes && now - this.leftJoyStartTime > GCGamepad.firstContinuityDelayTime) ||
                (!this.leftJoyFirstChangeTimes && now - this.leftJoyStartTime > GCGamepad.continuityDelayTime)) &&
                (this.leftJoyPoint.x != 0 || this.leftJoyPoint.y != 0)) {
                this.leftJoyStartTime = now;
                this.leftJoyFirstChangeTimes = false;
                this.onGamepadJoyChange(true, this.leftJoyPoint.x, this.leftJoyPoint.y);
                this.event(GCGamepad.GAMEPAD_JOY_CHANGE, [true, this.leftJoyPoint.x, this.leftJoyPoint.y, false]);
            }
        }
        // 右摇杆
        this.getJoyValue(pad, this.rightJoy1, this.rightJoy2, this.tempPoint);
        if (this.tempPoint.x != this.rightJoyPoint.x || this.tempPoint.y != this.rightJoyPoint.y) {
            this.rightJoyPoint.x = this.tempPoint.x;
            this.rightJoyPoint.y = this.tempPoint.y;
            this.rightJoyStartTime = now;
            this.rightJoyFirstChangeTimes = true;
            this.event(GCGamepad.GAMEPAD_JOY_CHANGE, [false, this.rightJoyPoint.x, this.rightJoyPoint.y, true]);
        }
        else {
            if (((this.rightJoyFirstChangeTimes && now - this.rightJoyStartTime > GCGamepad.firstContinuityDelayTime) ||
                (!this.rightJoyFirstChangeTimes && now - this.rightJoyStartTime > GCGamepad.continuityDelayTime)) &&
                (this.rightJoyPoint.x != 0 || this.rightJoyPoint.y != 0)) {
                this.rightJoyStartTime = now;
                this.rightJoyFirstChangeTimes = false;
                this.onGamepadJoyChange(false, this.rightJoyPoint.x, this.rightJoyPoint.y);
                this.event(GCGamepad.GAMEPAD_JOY_CHANGE, [false, this.rightJoyPoint.x, this.rightJoyPoint.y, false]);
            }
        }
        // 左方向键
        let leftKeyDir = this.getDirectionKey(pad, this.leftKey);
        if (leftKeyDir != this.leftKeyDir) {
            this.leftKeyDir = leftKeyDir;
            this.leftKeyStartTime = now;
            this.leftKeyFirstChangeTimes = true;
            this.event(GCGamepad.GAMEPAD_LEFT_KEY_CHANGE, [leftKeyDir]);
        }
        else {
            if (((this.leftKeyFirstChangeTimes && now - this.leftKeyStartTime > GCGamepad.firstContinuityDelayTime) ||
                (!this.leftKeyFirstChangeTimes && now - this.leftKeyStartTime > GCGamepad.continuityDelayTime)) &&
                (this.leftKeyDir != 0)) {
                this.leftKeyStartTime = now;
                this.leftKeyFirstChangeTimes = false;
                this.event(GCGamepad.GAMEPAD_LEFT_KEY_CHANGE, [leftKeyDir]);
            }
        }
        // 普通键位
        for (let s in pad.buttons) {
            let padpressed = pad.buttons[s].pressed
            if (padpressed != this.buttons[s]) {
                this.buttons[s] = padpressed;
                if (padpressed) this.event(GCGamepad.GAMEPAD_KEY_DOWN, [s]);
                else this.event(GCGamepad.GAMEPAD_KEY_UP, [s]);
            }
        }
    }
    /**
     * 获取摇杆数值
     * @param pad 原生摇杆
     * @param joy1Index 摇杆映射索引1 
     * @param joy2Index 摇杆映射索引2
     * @param p 储存的点
     */
    private getJoyValue(pad: Gamepad, joy1Index: number, joy2Index: number, p: Point) {
        let joyValue1 = pad.axes[joy1Index];
        let joyValue2 = pad.axes[joy2Index];
        if (joyValue1 != this.joyDefValue || joyValue2 != this.joyDefValue) {
            let joyX = parseFloat(joyValue1.toFixed(2));
            let joyY = parseFloat(joyValue2.toFixed(2));
            if (Math.abs(joyX) <= 0.3) joyX = 0;
            if (Math.abs(joyY) <= 0.3) joyY = 0;
            p.x = joyX;
            p.y = joyY;
        }
        else {
            p.x = 0;
            p.y = 0;
        }
    }
    /**
     * 获取方向键，转为1-8面向表示
     * @param pad 原生摇杆
     * @param keyIndex 
     * @return [number] 
     */
    private getDirectionKey(pad: Gamepad, keyIndex: number): number {
        let dir = this.dirKeyMapping[pad.axes[this.leftKey]];
        if (dir == null) dir = 0;
        return dir;
    }
    /**
     * 当摇杆更改时，派发摇杆的方向事件（转换为方向键功能作用派发）
     * @param isleft 是否左摇杆
     * @param joyX 摇杆x值
     * @param joyY 摇杆y值
     */
    private onGamepadJoyChange(isleft: boolean, joyX: number, joyY: number) {
        if (isleft) {
            if (!this.hasListener(GCGamepad.GAMEPAD_LEFT_JOY_DIR4_CHANGE)) return;
        }
        else {
            if (!this.hasListener(GCGamepad.GAMEPAD_RIGHT_JOY_DIR4_CHANGE)) return;
        }
        let helpInfo = this.lastDir4Info[isleft ? 0 : 1];
        let GAMEPAD_JOY_DIR4_CHANGE = isleft ? GCGamepad.GAMEPAD_LEFT_JOY_DIR4_CHANGE : GCGamepad.GAMEPAD_RIGHT_JOY_DIR4_CHANGE;
        let lastJoyX = helpInfo.lastJoy[0];
        let lastJoyY = helpInfo.lastJoy[1];
        helpInfo.lastJoy = [joyX, joyY];
        let p = 0.8;
        if (Math.abs(joyX) < p && Math.abs(joyY) < p) {
            helpInfo.lastJoy = [0, 0];
            helpInfo.lastMenuJoyTime = 0;
            if (lastJoyX != 0 || lastJoyY != 0) {
                this.event(GAMEPAD_JOY_DIR4_CHANGE, [0]);
            }
            return;
        }
        let now = new Date().getTime();
        let menuClick: number;
        if (Math.abs(joyX) > Math.abs(joyY)) {
            if (Math.abs(joyX) < p) return;
            if (joyX < 0) menuClick = 4;
            else menuClick = 6;
        }
        else {
            if (Math.abs(joyY) < p) return;
            if (joyY < 0) menuClick = 8;
            else menuClick = 2;
        }
        // 如果摇杆值完全相同则允许（连续按键）
        if ((lastJoyX == joyX && lastJoyY == joyY) || (helpInfo.lastMenuClick != menuClick && now - helpInfo.lastMenuJoyTime > 150)
            || (helpInfo.lastMenuClick == menuClick && now - helpInfo.lastMenuJoyTime > 300)) {
        }
        // 摇杆值未完全相同，但相同功能键短期内不再派发 if (now - this.lastMenuJoyTime < this.menuJoyInterval)
        else {
            return;
        }
        // 记录上次派发按键的时间
        helpInfo.lastMenuJoyTime = now;
        helpInfo.lastMenuClick = menuClick;
        helpInfo.lastJoy = [joyX, joyY];
        this.event(GAMEPAD_JOY_DIR4_CHANGE, [helpInfo.lastMenuClick]);
    }
}

