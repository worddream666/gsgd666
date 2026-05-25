/**
 * 项目层工具类
 * Created by 黑暗之神KDS on 2020-09-13 22:48:37.
 */
class ProjectUtils {
    // 最近的鼠标滚动值
    static mouseWhileValue: number = 0;
    /**
     * 回调函数辅助者：重用实例
     */
    static callbackHelper: Callback = new Callback;
    /**
     * 点辅助者：重用实例
     */
    static pointHelper: Point = new Point;
    /**
     * 矩形辅助者：重用实例
     */
    static rectangleHelper: Rectangle = new Rectangle;
    /**
     * 当前按键的事件对象
     */
    static keyboardEvent: EventObject;
    static keyboardEvents: { keyCode: number }[] = [];
    /**
     * 最近的操控方式 0-鼠标 1-按键 2-手柄
     */
    static lastControl: number = 0;
    /**
     * 当前按键来自手柄
     */
    static fromGamePad: boolean;
    /**
     * 矩形对象池
     */
    private static rectanglePool: PoolUtils = new PoolUtils(Rectangle);
    //------------------------------------------------------------------------------------------------------
    // 初始化
    //------------------------------------------------------------------------------------------------------
    static init() {
        // 鼠标滚动值
        stage.on(EventObject.MOUSE_WHEEL, this, (e: EventObject) => { ProjectUtils.mouseWhileValue = e.delta; });
        // 鼠标移动
        stage.on(EventObject.MOUSE_MOVE, this, (e: EventObject) => { ProjectUtils.lastControl = 0; });
        // 注册键盘点击事件
        stage.on(EventObject.KEY_DOWN, this, (e: EventObject) => { ProjectUtils.lastControl = ProjectUtils.fromGamePad ? 2 : 1; ProjectUtils.fromGamePad = false; this.keyboardEvent = e; if (ArrayUtils.matchAttributes(this.keyboardEvents, { keyCode: e.keyCode }, true).length == 0) { this.keyboardEvents.push({ keyCode: e.keyCode } as any); } });
        // 注册键盘弹起事件
        stage.on(EventObject.KEY_UP, this, (e: EventObject) => { ArrayUtils.remove(this.keyboardEvents, ArrayUtils.matchAttributes(this.keyboardEvents, { keyCode: e.keyCode }, true)[0]); this.keyboardEvent = null; });
    }
    //------------------------------------------------------------------------------------------------------
    // Rectangle
    //------------------------------------------------------------------------------------------------------
    /**
     * 创建Rectangle
     */
    static takeoutRect(): Rectangle {
        return ProjectUtils.rectanglePool.takeout();
    }
    /**
     * 返还Rectangle
     * @param rect 
     */
    static freeRect(rect: Rectangle): void {
        ProjectUtils.rectanglePool.free(rect);
    }
    //------------------------------------------------------------------------------------------------------
    // 时间
    //------------------------------------------------------------------------------------------------------
    /**
     * 格式化日期
     * @param fmt 格式化字符串规格 如    
     * @param date 
     * @return [String] 
     */
    static dateFormat(fmt: string, date: Date): string {
        let ret;
        const opt = {
            "Y+": date.getFullYear().toString(),        // 年
            "m+": (date.getMonth() + 1).toString(),     // 月
            "d+": date.getDate().toString(),            // 日
            "H+": date.getHours().toString(),           // 时
            "M+": date.getMinutes().toString(),         // 分
            "S+": date.getSeconds().toString()          // 秒
        };
        for (let k in opt) {
            ret = new RegExp("(" + k + ")").exec(fmt);
            if (ret) {
                fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
            };
        };
        return fmt;
    }
    /**
     * 格式化计时器
     * @param time 时间段（毫秒）
     * @return [string] 
     */
    static timerFormat(time: number): string {
        let S = 1000;
        let M = S * 60;
        let H = M * 60;
        let hTotal = Math.floor(time / H);
        let hStr = MathUtils.fixIntDigit(hTotal, 2);
        time -= H * hTotal;
        let mTotal = Math.floor(time / M);
        let mStr = MathUtils.fixIntDigit(mTotal, 2);
        time -= M * mTotal;
        let sTotal = Math.floor(time / S);
        let sStr = MathUtils.fixIntDigit(sTotal, 2);
        return hStr + ":" + mStr + ":" + sStr;
    }
    //------------------------------------------------------------------------------------------------------
    // 工具类
    //------------------------------------------------------------------------------------------------------
    /**
     * 下一帧开始时执行
     * @param Func 函数
     * @param thisPtr 作用域
     * @param args 参数
     */
    static nextFrameStartExecute(Func: Function, thisPtr: any, args: any[] = null): void {
        os.add_ENTERFRAME(() => {
            Func.apply(thisPtr, args);
            // @ts-ignore
            os.remove_ENTERFRAME(arguments.callee, this);
        }, this, args);
    }
    /**
     * 指定帧开始执行（受暂停影响）
     * @param frameCount 
     * @param Func 函数
     * @param thisPtr 作用域
     * @param args[可选] 默认值=null 
     */
    static waitFrameStartExecute(frameCount: number, Func: Function, thisPtr: any, args: any[] = null): void {
        os.add_ENTERFRAME(() => {
            if (Game.pause) return;
            frameCount--;
            if (frameCount <= 0) {
                Func.apply(thisPtr, args);
                // @ts-ignore
                os.remove_ENTERFRAME(arguments.callee, this);
            }
        }, this, args);
    }
    /**
     * 确定概率
     * @param arr 概率组
     * @param perAttributeName 数组内属性名
     * @param luckeyValue 幸运值加成 0~1
     * @return [number] 
     */
    static determineProbability(arr: any, perAttributeName: string, luckeyValue: number = 0): number {
        let perCount = 0;
        let perArr = [];
        for (var i = 0; i < arr.length; i++) {
            let obj = arr[i];
            if (obj) {
                perCount += obj[perAttributeName];
                perArr[i] = perCount;
            }
        }
        let luckValue = luckeyValue * perCount * 0.5;
        let rd = MathUtils.rand(perCount - luckValue) + luckValue;
        let ruleID: number = 0;
        for (var i = 0; i < perArr.length; i++) {
            let per = perArr[i];
            if (per && rd < per) {
                ruleID = i;
                break;
            }
        }
        return ruleID;
    }
    /**
     * 根据模块数据的概率设置获取具体的数据ID
     * @param moduleID 模块
     * @param perAttributeName 模块数据的概率属性名称
     * @param luckeyValue[可选] 默认值=0 幸运加成 0~1
     * @return [number] 
     */
    static determineProbabilityByModule(moduleID: number, perAttributeName: string, luckeyValue: number = 0): number {
        let len = GameData.getLength(moduleID, 1);
        let arr = [];
        for (var i = 1; i <= len; i++) {
            arr.push(GameData.getModuleData(moduleID, i));
        }
        let moduleDataIndex = ProjectUtils.determineProbability(arr, perAttributeName, luckeyValue);
        return moduleDataIndex + 1;
    }
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 元素组索引移动
     * 根据相对的方位和距离计算
     * @param groupElements 元素组信息
     * @param currentIndex 索引
     * @param moveDir 2=下 4=左 6=右 8=上
     * @param fuzzySearch [可选] 默认值=false 模糊搜索，如果启用则在相对方位还会搜索临近的两个方向
     */
    static groupElementsMoveIndex(groupElements: { x: number, y: number }[], currentIndex: number, moveDir: number, limitSecondAxis: number = 50): number {
        let currentElement = currentIndex == -1 ? { x: 0, y: 0 } : groupElements[currentIndex];
        // 对应移动方向允许的方位
        let allowOris: number[] = {
            2: [1, 2, 3], // 下方向
            4: [1, 4, 7], // 左方向
            6: [3, 6, 9], // 右方向
            8: [7, 8, 9]  // 上方向
        }[moveDir];
        if (!allowOris) return null;
        // 获取第二轴参考
        let secondAxisName: string = (moveDir == 4 || moveDir == 6) ? "y" : "x";
        // 遍历所有节点
        let minDis = Number.MAX_VALUE;
        let minIndex: number = null;
        for (let i = 0; i < groupElements.length; i++) {
            let targetEle = groupElements[i];
            if (i == currentIndex) continue;
            let angle = MathUtils.direction360(currentElement.x, currentElement.y, targetEle.x, targetEle.y);
            let ori = GameUtils.getOriByAngle(angle);
            // -- 去除方位不对的节点
            if (allowOris.indexOf(ori) == -1) continue;
            // -- 获取第二轴的距离
            let secondAxisDistance = Math.abs(targetEle[secondAxisName] - currentElement[secondAxisName]);
            if (secondAxisDistance > limitSecondAxis) continue;
            // -- 获取最短的距离
            let dis2 = Point.distanceSquare2(currentElement.x, currentElement.y, targetEle.x, targetEle.y);
            if (dis2 < minDis) {
                minDis = dis2;
                minIndex = i;
            }
        }
        return minIndex;
    }
    //------------------------------------------------------------------------------------------------------
    //  
    //------------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------------
    // 碰撞检测 - 辅助计算
    //------------------------------------------------------------------------------------------------------
    /**
     * 测试多边形相交，检测到任意相交就返回
     * @param polygon1 多边形1
     * @param polygon2 多边形2
     * @returns 
     */
    static polygonsIntersectTest(polygon1: number[][], polygon2: number[][]): boolean {
        let result = false;
        // 将多边形1中的每条边与多边形2中的每条边都进行检查
        let p1Len = polygon1.length;
        let p2Len = polygon2.length;
        for (let i = 0; i < p1Len; i++) {
            let p1 = polygon1[i];
            let p2 = polygon1[(i + 1) % p1Len];
            for (let j = 0; j < p2Len; j++) {
                let q1 = polygon2[j];
                let q2 = polygon2[(j + 1) % p2Len];
                // 如果两条线段相交，则返回true
                if (this.isLinesIntersect(p1, p2, q1, q2)) {
                    result = true;
                    return result;
                }
            }
        }
        // 包含关系：多边形A包含多边形B或相反
        for (let i = 0; i < p1Len; i++) {
            let p1 = polygon1[i];
            if (this.isPointInsidePolygon(p1, polygon2)) {
                result = true;
                return result;
            }
        }
        for (let i = 0; i < p2Len; i++) {
            let p1 = polygon2[i];
            if (this.isPointInsidePolygon(p1, polygon1)) {
                result = true;
                return result;
            }
        }
        // 如果所有线段都不相交，则返回false
        return result;
    }
    /**
     * 两条线是否相交
     * @param p1 线段1起点 如[0,0]
     * @param p2 线段1终点
     * @param q1 线段2起点
     * @param q2 线段2终点
     * @return [boolean] 
     */
    static isLinesIntersect(p1: number[], p2: number[], q1: number[], q2: number[]): boolean {
        if (this.linesIntersectInfo(p1, p2, q1, q2)) {
            return true;
        }
        return false;
    }
    /**
     * 两条线相交返回相交点的比例（0~1）
     * @param p1 线段1起点 如[0,0]
     * @param p2 线段1终点
     * @param q1 线段2起点
     * @param q2 线段2终点
     * @return p1Per=线段1中的点的比例（0~1） p2Per=线段2中的点的比例（0~1）
     */
    static linesIntersectInfo(p1: number[], p2: number[], q1: number[], q2: number[], offsetY: number = 0): { p1Per: number, p2Per: number } {
        let q11 = q1[1] + offsetY;
        let q21 = q2[1] + offsetY;
        const dx1 = p2[0] - p1[0];
        const dy1 = p2[1] - p1[1];
        const dx2 = q2[0] - q1[0];
        const dy2 = q21 - q11;
        const denominator = dx1 * dy2 - dy1 * dx2;
        if (denominator === 0) {
            return null; // 线段平行，不相交
        }
        const t1 = ((q1[0] - p1[0]) * dy2 - (q11 - p1[1]) * dx2) / denominator;
        const t2 = ((q1[0] - p1[0]) * dy1 - (q11 - p1[1]) * dx1) / denominator;
        let res = t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1;
        if (res) {
            return { p1Per: t1, p2Per: t2 };
        }
        return null;
    }
    /**
     * 判断点是否在多边形内
     * @param point 
     * @param polygon 
     * @return [boolean] 
     */
    static isPointInsidePolygon(point: number[], polygon: number[][]): boolean {
        const points = polygon;
        let inside = false;
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            const intersect = ((points[i][1] > point[1]) != (points[j][1] > point[1]))
                && (point[0] < (points[j][0] - points[i][0]) * (point[1] - points[i][1]) / (points[j][1] - points[i][1]) + points[i][0]);
            if (intersect) {
                inside = !inside;
            }
        }
        return inside;
    }
}