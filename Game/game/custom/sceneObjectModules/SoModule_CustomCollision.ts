/**
 * 场景对象模块-自定义碰撞
 * Created by Karson.DS on 2025-03-19 07:21:23.
 */
class SoModule_CustomCollision extends SceneObjectModule_4 {
    /**
     * 自定义碰撞的模块编号
     */
    static PLUGIN_SCENEOBJECT_MODULE_ID: number = 4;
    /**
     * 障碍合集
     */
    private static arr: SoModule_CustomCollision[] = [];
    /**
     * 记录是否处于DEBUG绘制
     */
    private static DEBUG_DRAW: boolean;
    /**
     * 范围
     */
    private rangeRect: Rectangle;
    private rangeRectPoints: number[][];
    private radiusCenterPoint: Point;
    private radius2: number;
    private customShapePoints: number[][];
    private recordMyPoint: Point;
    // debug
    private debug_recordCameraScale: number;
    private debug_recordThrough: boolean;
    private debug_recordBridge: boolean;
    /**
     * 构造函数
     * @param installCB 用于安装模块的属性值
     */
    constructor(installCB: Callback) {
        super(installCB);
        this.init();
        SoModule_CustomCollision.arr.push(this);
    }
    /**
     * 当移除模块时执行的函数
     */
    onRemoved(): void {
        os.remove_ENTERFRAME(this.onDebugUpdate, this);
        EventUtils.removeEventListenerFunction(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, this.init, this);
        SoModule_CustomCollision.arr.splice(SoModule_CustomCollision.arr.indexOf(this), 1);
        if (SoModule_CustomCollision.DEBUG_DRAW) {
            this.so.root.graphics.clear();
        }
    }
    /**
     * 刷新：通常在改变了属性需要调用此函数统一刷新效果
     */
    refresh(): void {

    }
    /**
     * 是否视为障碍
     */
    get isObstacle() {
        return !this.so.through;
    }
    //------------------------------------------------------------------------------------------------------
    //  碰撞检测
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取 target 与当前场景的所有自定义碰撞体的-碰撞检测
     * @param target 目标对象
     * @param onlyOne 碰撞成功一个后就返回
     * @param designatedPoint [可选] 指定的坐标，如果存在则使用该坐标而非target的坐标
     * @param onlyCheckObs [可选] 只检测障碍
     * @param conditionFunction [可选] 检查条件，满足条件才加入列表
     * @returns 
     */
    static collisionTest(target: ProjectClientSceneObject, onlyOne: boolean, designatedPoint: Point = null, onlyCheckObs: boolean = false,
        conditionFunction: (so: ProjectClientSceneObject, collision: SoModule_CustomCollision) => boolean = null)
        : { so: ProjectClientSceneObject, collision: SoModule_CustomCollision }[] {
        // 
        let targetCustomCollision = target.getModule(SoModule_CustomCollision.PLUGIN_SCENEOBJECT_MODULE_ID) as SoModule_CustomCollision;
        if (targetCustomCollision) targetCustomCollision.refreshRange(designatedPoint);
        let arr: { so: ProjectClientSceneObject, collision: SoModule_CustomCollision }[] = [];
        for (let i = 0; i < SoModule_CustomCollision.arr.length; i++) {
            let cc = SoModule_CustomCollision.arr[i];
            if (cc.so == target) continue;
            if (onlyCheckObs && !cc.isObstacle) continue;
            cc.refreshRange();
            if (cc.isInRange(target, targetCustomCollision, designatedPoint)) {
                if (conditionFunction) {
                    let isAddToList = conditionFunction.apply(this, [cc.so, cc]);
                    if (!isAddToList) continue;
                }
                arr.push({ so: cc.so, collision: cc });
                if (onlyOne) break;
            }
        }
        return arr;
    }
    /**
     * 碰撞测试-与普通对象（无自定义碰撞）
     */
    collisionTestByNormalTarget(target: ProjectClientSceneObject): boolean {
        this.refreshRange();
        if (target.avatarID != 0 && this.isInRange(target, null)) {
            return true;
        }
        return false;
    }
    //------------------------------------------------------------------------------------------------------
    //  
    //------------------------------------------------------------------------------------------------------
    /**
     * 初始化
     */
    private init(): void {
        if (GameGate.gateState < GameGate.STATE_4_PLAYER_CONTROL_START) {
            EventUtils.addEventListenerFunction(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, this.init, this, null, true);
        }
        else {
            this.onUpdateStart();
        }
        this.refreshRange();
    }
    /**
     * 帧刷开始
     */
    private onUpdateStart(): void {
        if (SoModule_CustomCollision.DEBUG_DRAW == null) SoModule_CustomCollision.DEBUG_DRAW = WorldData.rectObsDebug && os.inGC() && !Config.RELEASE_GAME;
        if (SoModule_CustomCollision.DEBUG_DRAW) os.add_ENTERFRAME(this.onDebugUpdate, this);
    }
    /**
     * 刷新（DEBUG-帧刷）
     */
    private onDebugUpdate(): void {
        if (!Game.currentScene) return;
        let forceRefreshRange = false;
        if (Game.currentScene.camera.scaleX != this.debug_recordCameraScale) {
            this.debug_recordCameraScale = Game.currentScene.camera.scaleX;
            forceRefreshRange = true;
        }
        if (this.so.through != this.debug_recordThrough) {
            this.debug_recordThrough = this.so.through;
            forceRefreshRange = true;
        }
        if (this.so.bridge != this.debug_recordBridge) {
            this.debug_recordBridge = this.so.bridge;
            forceRefreshRange = true;
        }
        if (forceRefreshRange) this.refreshRange(null, true);
    }
    /**
     * 判断是否在范围内
     * @param designatedPoint [可选]指定的坐标，如果存在则使用该坐标而非target的坐标
     * @return [boolean] 
     */
    isInRange(target: ProjectClientSceneObject, targetCustomCollision: SoModule_CustomCollision, designatedPoint: Point = null): boolean {
        let targetCollisionType: number;
        let targetCollisionRangeRect: Rectangle;
        let targetCollisionRectPoints: number[][];
        let targetX = designatedPoint ? designatedPoint.x : target.x;
        let targetY = designatedPoint ? designatedPoint.y : target.y;
        if (!targetCustomCollision || targetCustomCollision.type == 1) {
            targetCollisionType = 0;
            let rectX = Math.floor(targetX - WorldData.sceneObjectCollisionSize * 0.5);
            let rectY = Math.floor(targetY - WorldData.sceneObjectCollisionSize * 0.5);
            let tr = targetCollisionRangeRect = new Rectangle(rectX, rectY, WorldData.sceneObjectCollisionSize, WorldData.sceneObjectCollisionSize);
            targetCollisionRectPoints = [[tr.x, tr.y], [tr.right, tr.y], [tr.right, tr.bottom], [tr.x, tr.bottom]];
        }
        else {
            targetCollisionType = targetCustomCollision.type;
            if (targetCustomCollision.type == 0) {
                targetCollisionRangeRect = targetCustomCollision.rangeRect;
                targetCollisionRectPoints = targetCustomCollision.rangeRectPoints;
            }
        }
        // -- 矩形
        if (this.type == 0) {
            // ---- 目标矩形与我的矩形-碰撞
            if (targetCollisionType == 0) {
                return this.rangeRect.intersects(targetCollisionRangeRect);
            }
            // ---- 目标的多边形与我的矩形-碰撞
            else if (targetCollisionType == 2) {
                return ProjectUtils.polygonsIntersectTest(targetCustomCollision.customShapePoints, this.rangeRectPoints);
            }
        }
        // -- 圆形：只与目标点距离判定
        else if (this.type == 1) {
            return Point.distanceSquare2(targetX, targetY, this.radiusCenterPoint.x, this.radiusCenterPoint.y) <= this.radius2;
        }
        // -- 自定义形状
        else if (this.type == 2) {
            // ---- 目标矩形与我的多边形-碰撞
            if (targetCollisionType == 0) {
                let r = ProjectUtils.polygonsIntersectTest(targetCollisionRectPoints, this.customShapePoints);
                return r;
            }
            // ---- 目标多边形与我的多边形-碰撞
            else if (targetCollisionType == 2) {
                return ProjectUtils.polygonsIntersectTest(targetCustomCollision.customShapePoints, this.customShapePoints);
            }
        }
        return false;
    }
    /**
     * 刷新范围区域
     * @param designatedPoint [可选]指定的坐标，如果存在则使用该坐标而非target的坐标
     */
    private refreshRange(designatedPoint: Point = null, force: boolean = false) {
        let px = designatedPoint ? designatedPoint.x : this.so.x;
        let py = designatedPoint ? designatedPoint.y : this.so.y;
        // 未改变坐标时不刷新
        if (!force && this.recordMyPoint && this.recordMyPoint.x == px && this.recordMyPoint.y == py) return;
        if (!this.recordMyPoint) this.recordMyPoint = new Point(px, py);
        else {
            this.recordMyPoint.x = px;
            this.recordMyPoint.y = py;
        }
        // -- 矩形
        if (this.type == 0) {
            let w = this.width;
            let h = this.height;
            let myRectX = px + this.offsetX;
            let myRectY = py + this.offsetY;
            if (!this.rangeRect) this.rangeRect = new Rectangle;
            this.rangeRect.x = myRectX;
            this.rangeRect.y = myRectY;
            this.rangeRect.width = w;
            this.rangeRect.height = h;
            this.rangeRectPoints = [[this.rangeRect.x, this.rangeRect.y], [this.rangeRect.right, this.rangeRect.y], [this.rangeRect.right, this.rangeRect.bottom], [this.rangeRect.x, this.rangeRect.bottom]];
            // debug display
            if (SoModule_CustomCollision.DEBUG_DRAW) {
                this.so.root.graphics.clear();
                let r = this.rangeRect;
                this.so.root.graphics.drawLines(0, 0, [r.x - px, r.y - py, r.right - px, r.y - py, r.right - px, r.bottom - py, r.x - px, r.bottom - py, r.x - px, r.y - py], ProjectClientScene.getDebugColorBySceneObject(this.so), 2);
            }
        }
        // -- 圆形
        else if (this.type == 1) {
            let r = this.radius;
            this.radius2 = r * r;
            if (!this.radiusCenterPoint) this.radiusCenterPoint = new Point;
            this.radiusCenterPoint.x = px;
            this.radiusCenterPoint.y = py;
            if (SoModule_CustomCollision.DEBUG_DRAW) {
                this.so.root.graphics.clear();
                this.so.root.graphics.drawCircle(0, 0, Math.floor(this.radius), null, ProjectClientScene.getDebugColorBySceneObject(this.so), 1);
            }
        }
        // -- 自定义形状
        else if (this.type == 2) {
            this.customShapePoints = [[px, py]];
            let debugArr: number[];
            if (SoModule_CustomCollision.DEBUG_DRAW) debugArr = [0, 0]
            for (let i = 0; i < this.pointArr.length; i++) {
                let point = this.pointArr[i];
                let p = [px + point.x, py + point.y];
                this.customShapePoints.push(p);
                if (SoModule_CustomCollision.DEBUG_DRAW) debugArr.push(point.x, point.y);
            }
            // debug display
            if (SoModule_CustomCollision.DEBUG_DRAW) {
                debugArr.push(0, 0);
                this.so.root.graphics.clear();
                this.so.root.graphics.drawLines(0, 0, debugArr, ProjectClientScene.getDebugColorBySceneObject(this.so), 2);
            }
        }
        return false;
    }
}