/**
 * 场景的工具类
 * 用于计算障碍、遮罩、桥属性、碰撞检测等
 * 
 * Created by 黑暗之神KDS on 2020-01-24 02:55:52.
 */
class SceneUtils {
    /**
     * 禁止碰撞的信息（根据场景对象的碰撞组）
     */
    static banCollisionMapping: { [sign: string]: boolean };
    /**
     * 格子上的场景对象：初始化时即设置了gridWidth x gridHeight的空数组
     */
    gridSceneObjects: ProjectClientSceneObject[][][] = [];
    /**
     * 场景对象上次所在的格子坐标
     */
    protected lastUpdateObsBridgeGrid: Point[] = [];
    /**
     * 边界的内边界矩形（边界默认为0-mapWidth 0-mapHeight，内边界则需要减去半个格子）
     */
    protected innerBoundaryRect: Rectangle;
    /**
     * 场景
     */
    scene: Scene;
    /**
     * 半格多一像素
     */
    protected halfGridPlus: number;
    //------------------------------------------------------------------------------------------------------
    // 静态方法
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取附近可通行的格子点
     * @param gridP 障碍格子点
     * @param targetP [可选] 默认值=null 参考目标点，会优先选择与该目标点最近的点
     * @return [Point] 
     */
    static getNearThroughGrid(gridP: Point, targetP: Point = null): Point {
        let nearGrid = 5;
        let currentScene = Game.currentScene as ProjectClientScene;
        let n_32_x1: number = gridP.x - nearGrid;
        let n_32_x2: number = gridP.x + nearGrid;
        let n_32_y1: number = gridP.y - nearGrid;
        let n_32_y2: number = gridP.y + nearGrid;
        n_32_x1 = n_32_x1 < 0 ? 0 : n_32_x1
        n_32_y1 = n_32_y1 < 0 ? 0 : n_32_y1
        n_32_x2 = n_32_x2 > Game.currentScene.gridWidth ? Game.currentScene.gridWidth : n_32_x2;
        n_32_y2 = n_32_y2 > Game.currentScene.gridHeight ? Game.currentScene.gridHeight : n_32_y2;
        let findGrid: Point = new Point(-1, -1);
        let helpP: Point = new Point();
        let dis_x: number = 9999;
        let findGrids = [];
        for (let x = n_32_x1; x < n_32_x2; x++) {
            for (let y = n_32_y1; y < n_32_y2; y++) {
                helpP.x = x;
                helpP.y = y;
                // 如果是界外
                if (currentScene.sceneUtils.isOutsideByGrid(helpP)) { continue }
                // 如果是障碍
                if (currentScene.sceneUtils.isObstacleGrid(helpP)) { continue }
                // 当前点与终点的距离
                let n_jin_x32: number = Math.abs(x - gridP.x);
                let n_jin_y32: number = Math.abs(y - gridP.y);
                let dis = n_jin_x32 + n_jin_y32;
                if (targetP) {
                    if (dis <= dis_x) {
                        findGrid.x = x;
                        findGrid.y = y;
                        if (dis_x != dis) findGrids.length = 0;
                        dis_x = dis;
                        findGrids.push(new Point(findGrid.x, findGrid.y));
                    }
                }
                else {
                    if (dis < dis_x) {
                        findGrid.x = x;
                        findGrid.y = y;
                        dis_x = dis;
                    }
                }
            }
        }
        if (targetP) {
            findGrid = new Point(-1, -1);
            dis_x = 9999;
            for (let p in findGrids) {
                let tp = findGrids[p];
                let n_jin_x32: number = Math.abs(tp.x - targetP.x);
                let n_jin_y32: number = Math.abs(tp.y - targetP.y);
                let dis = n_jin_x32 + n_jin_y32;
                if (dis < dis_x) {
                    findGrid = tp;
                    dis_x = dis;
                }
            }
        }
        if (findGrid.x == -1) return null;
        return findGrid;
    }
    /**
     * 计算两点间是否存在障碍 穷举法
     * @param x1 起点x坐标
     * @param y1 起点y坐标
     * @param x2 终点x坐标
     * @param y2 终点y坐标
     * @param scene 场景
     * @param except [可选] 默认值=null 排除在外的对象
     * @param exceptToP [可选] 默认值=false 终点是否排除在外
     * @return [boolean] 
     */
    static twoPointHasObstacle(x1: number, y1: number, x2: number, y2: number, scene: ProjectClientScene, except: ProjectClientSceneObject = null, exceptToP: boolean = false): boolean {
        //遮挡是地图的遮挡
        let p1: Point = new Point(x1, y1);
        let p2: Point = new Point(x2, y2);
        // 计算两点的长度 S
        let step: number = 16;
        let dis: number = Point.distance(p1, p2);
        // ADD一个数组，该数组应包含初始点，每16像素的点，以及终点
        let nArr: Point[] = []; //初始点
        let len: number = Math.floor(dis / step);
        for (let i = 1; i <= len; i++) {
            let newX: number = (p2.x - p1.x) / (dis / step) * i + p1.x;
            let newY: number = (p2.y - p1.y) / (dis / step) * i + p1.y;
            if (exceptToP && newX == x2 && newY == y2) continue;
            let point = new Point(newX, newY);
            if (except) {
                let r = SoModule_CustomCollision.collisionTest(except, true, point, true);
                if (r.length > 0) {
                    return true;
                }
            }
            nArr.push(point);
        }
        if (!exceptToP) nArr.push(new Point(x2, y2)); //终点
        for (let s in nArr) {
            if (scene.sceneUtils.isObstacle(nArr[s], except)) { return true; }
        }
        return false;
    }
    //------------------------------------------------------------------------------------------------------
    // 实例
    //------------------------------------------------------------------------------------------------------
    /**
     * 构造函数
     */
    constructor(scene: Scene) {
        this.scene = scene;
        // 碰撞组数据缓存
        if (SceneUtils.banCollisionMapping == null) {
            SceneUtils.banCollisionMapping = {};
            for (var i = 0; i < WorldData.banCollisionSetting.length; i++) {
                let setting = WorldData.banCollisionSetting[i];
                let collisionSign1 = setting.group1 + "_" + setting.group2;
                let collisionSign2 = setting.group2 + "_" + setting.group1;
                SceneUtils.banCollisionMapping[collisionSign1] = true;
                SceneUtils.banCollisionMapping[collisionSign2] = true;
            }
        }
        this.halfGridPlus = Config.SCENE_GRID_SIZE / 2 + 1;
        // 计算内边界
        this.innerBoundaryRect = new Rectangle(Config.SCENE_GRID_SIZE / 2, Config.SCENE_GRID_SIZE / 2, scene.width - Config.SCENE_GRID_SIZE + 1, scene.height - Config.SCENE_GRID_SIZE + 1);
        // 初始化格子中的场景对象引用
        for (let x = 0; x < scene.gridWidth; x++) {
            let gsx = this.gridSceneObjects[x] = [];
            for (let y = 0; y < scene.gridHeight; y++) {
                gsx[y] = [];
            }
        }
        // 图块障碍和遮罩合并进来
        let maskData = scene.dataLayers[1];
        if (!maskData) maskData = scene.dataLayers[1] = [];
        let obsData = scene.dataLayers[0];
        if (!obsData) obsData = scene.dataLayers[0] = [];
        let bridgeData = scene.dataLayers[2];
        if (!bridgeData) bridgeData = scene.dataLayers[2] = [];
        // 遍历图层
        for (let i = 0; i < scene.LayerDatas.length; i++) {
            let layerData = scene.LayerDatas[i];
            // 忽略对象层
            if (layerData.p) continue;
            // 如果图层是绘制模式且未能偏移或自动移动或修改缩放、远景、斜率的话则计算图块里面预设的障碍和遮罩
            if (layerData.drawMode && layerData.dx == 0 && layerData.dy == 0 && layerData.xMove == 0 && layerData.yMove == 0
                && layerData.scaleX == 1 && layerData.scaleY == 1 && layerData.prospectsPerX == 1 && layerData.prospectsPerY == 1 && layerData.skewX == 0 && layerData.skewY == 0) {
                // 遍历格子
                for (let x = 0; x < scene.gridWidth; x++) {
                    let tileDataW = layerData.tileData[x];
                    if (!tileDataW) continue;
                    for (let y = 0; y < scene.gridHeight; y++) {
                        let layerTileData = tileDataW[y];
                        if (!layerTileData) continue;
                        // 获取图块属性
                        let tileData: TileData | AutoTileData;
                        let isAutoData = false;
                        if (layerTileData.texID < 0) {
                            tileData = AutoTileData.getAutoTileData(-layerTileData.texID);
                            isAutoData = true;
                        }
                        else {
                            tileData = TileData.getTileData(layerTileData.texID);
                        }
                        if (!tileData) continue;
                        let tileGridP: Point = GameUtils.getGridPostion(new Point(layerTileData.x, layerTileData.y));
                        // 障碍合并
                        mergeTileGridData(x, y, tileData, 0, isAutoData, obsData, tileGridP);
                        // 遮罩合并
                        mergeTileGridData(x, y, tileData, 1, isAutoData, maskData, tileGridP);
                        // 桥属性合并
                        mergeTileGridData(x, y, tileData, 2, isAutoData, bridgeData, tileGridP);
                    }
                }
            }
        }
        // 合并图块格子数据
        function mergeTileGridData(x: number, y: number, tileData: TileData | AutoTileData, dataLayerIndex: number, isAutoData: boolean, gridDataFild: number[][], tileGridP: Point) {
            let tileGridDatas = tileData.dataLayers[dataLayerIndex];
            if (tileGridDatas) {
                if (isAutoData) {
                    let gridDataX = gridDataFild[x];
                    if (!gridDataX) gridDataX = gridDataFild[x] = [];
                    gridDataX[y] = 1;
                }
                else {
                    let tileDataMaskX = tileGridDatas[tileGridP.x];
                    if (tileDataMaskX && tileDataMaskX[tileGridP.y]) {
                        let gridDataX = gridDataFild[x];
                        if (!gridDataX) gridDataX = gridDataFild[x] = [];
                        gridDataX[y] = 1;
                    }
                }
            }
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 障碍
    //------------------------------------------------------------------------------------------------------
    /**
     * 是否障碍,实际坐标（含动态障碍）
     * @param p 实际坐标
     * @param except [可选] 默认值=null 忽略计算的对象（如玩家自身）
     * @return [boolean] 
     */
    isObstacle(p: Point, except: ProjectClientSceneObject = null): boolean {
        let map32: Point = GameUtils.getGridPostion(p);
        return this.isObstacleGrid(map32, except);
    }
    /**
     * 是否是障碍格子（含动态障碍）
     * @param gridP 格子坐标 
     * @param except 排除者
     * @param checker 检查者
     * @return [boolean] 
     */
    isObstacleGrid(gridP: Point, except: ProjectClientSceneObject = null, checker: ProjectClientSceneObject = null): boolean {
        if (this.isOutsideByGrid(gridP)) { return true; }
        // 检查是否具备动态穿透属性
        let gridStatus = this.getGridDynamicObsStatus(gridP, except, null, checker);
        if (gridStatus == 1) { return false; }
        else if (gridStatus == 2) { return true; }
        // 检查地图阻碍
        return this.isFixedObstacleGrid(gridP);
    }
    /**
     * 是否存在地图固定障碍（地图或图块设置的障碍）
     * @param gridP 格子坐标
     * @param calcBridge 计算桥属性
     * @return [boolean] 
     */
    isFixedObstacleGrid(gridP: Point, calcBridge: boolean = true): boolean {
        if (!calcBridge) return this.scene.getDataGridState(0, gridP.x, gridP.y) == 1
        return this.scene.getDataGridState(0, gridP.x, gridP.y) == 1 && this.scene.getDataGridState(2, gridP.x, gridP.y) != 1;
    }
    /**
     * 是否存在地图固定桥属性
     * @param gridP 格子坐标
     * @return [boolean] 
     */
    isFixedBridgeGrid(gridP: Point): boolean {
        // 存在障碍设定且不存在地图桥属性的话则视为地图固定障碍
        return this.scene.getDataGridState(2, gridP.x, gridP.y) == 1;
    }
    //------------------------------------------------------------------------------------------------------
    // 遮罩 
    //------------------------------------------------------------------------------------------------------
    /**
     * 是否存在遮罩，根据实际坐标
     * @param p 
     * @return [boolean] 
     */
    isMask(p: Point): boolean {
        let map32: Point = GameUtils.getGridPostion(p);
        return this.isMaskGrid(map32);
    }
    /**
     * 是否存在遮罩，根据格子
     * @param gridP 
     * @return [boolean] 
     */
    isMaskGrid(gridP: Point): boolean {
        return this.scene.getDataGridState(1, gridP.x, gridP.y) == 1;
    }
    //------------------------------------------------------------------------------------------------------
    // 范围
    //------------------------------------------------------------------------------------------------------
    /**
     * 是否在场外
     * @param p 坐标
     * @param innerBoundary 计算内边界
     * @return [boolean] 
     */
    isOutside(p: Point, innerBoundary: boolean = false): boolean {
        if (innerBoundary) {
            if (p.x < this.innerBoundaryRect.x || p.x >= this.innerBoundaryRect.right || p.y < this.innerBoundaryRect.y || p.y >= this.innerBoundaryRect.bottom) { return true; }
        }
        else {
            if (p.x < 0 || p.x >= this.scene.width || p.y < 0 || p.y >= this.scene.height) { return true; }
        }
        return false;
    }
    /**
     * 是否在场外，根据格子
     * @param gridP 格子坐标
     * @return [boolean] 
     */
    isOutsideByGrid(gridP: Point): boolean {
        if (gridP.x < 0 || gridP.x >= this.scene.gridWidth || gridP.y < 0 || gridP.y >= this.scene.gridHeight) { return true }
        return false;
    }
    /**
     * 将坐标限制在场景内
     * @param p 指定坐标
     */
    limitInside(p: Point, innerBoundary: boolean = false): void {
        let wh = Scene.getRealWidth(this.scene);
        wh.width -= 1;
        wh.height -= 1;
        if (!innerBoundary) {
            if (p.x < 0) { p.x = 0; }
            else if (p.x > wh.width) { p.x = wh.width; }
            if (p.y < 0) { p.y = 0; }
            else if (p.y > wh.height) { p.y = wh.height; }
        }
        else {
            if (p.x < this.innerBoundaryRect.x) { p.x = this.innerBoundaryRect.x; }
            else if (p.x >= this.innerBoundaryRect.right) { p.x = this.innerBoundaryRect.right; }
            if (p.y < this.innerBoundaryRect.y) { p.y = this.innerBoundaryRect.y; }
            else if (p.y >= this.innerBoundaryRect.bottom) { p.y = this.innerBoundaryRect.bottom; }
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 格子的动态障碍
    //------------------------------------------------------------------------------------------------------
    /**
     * 检查该格子是否具备动态穿透属性
     * 只包含 ProjectClientSceneObject，因为其他场景对象类未拥有障碍特性
     * -- 只要有桥对象则视为穿透
     * -- 否则只要有障碍物则视为有障碍
     * @param gridP 当前格子
     * @param excepter [可选] 默认值=null 排除在外的对象（比如自己）
     * @param gridSceneObjects [可选] 默认值=null 所在当前格子的场景对象（如有）
     * @param checker [可选] 默认值=null 如果与检查者是穿透关系，则不作为
     * @return [number] 0-无障碍 1-桥属性 2-存在障碍
     */
    getGridDynamicObsStatus(gridP: Point, excepter: ProjectClientSceneObject = null, gridSceneObjects: ProjectClientSceneObject[] = null, checker: ProjectClientSceneObject = null): number {
        // 忽略超过边界的情况
        if (this.isOutsideByGrid(gridP)) return 2;
        // 不存在外部传入进来的在当前格的对象集的话就重新取得一下
        if (!gridSceneObjects) gridSceneObjects = this.gridSceneObjects[gridP.x][gridP.y];
        let len = gridSceneObjects.length;
        for (let i = 0; i < len; i++) {
            let so = gridSceneObjects[i];
            // 忽略需要排除在外的对象（比如自己）
            if (so == excepter) continue;
            // 忽略空对象
            if (so == null) continue;
            // 不在场景上，当做不存在
            if (!so.inScene) continue;
            // 跳跃中的对象忽略掉，当做不存在
            if (so.isJumping) continue;
            // 如果发现一个存在桥属性的人则返回1，表示允许通行
            if (so.bridge) {
                return 1
            }
            // 目标与你是穿透关系的话
            if (checker && this.isBothBanCollision(checker, so)) continue;
            // 目标不是穿透且行走图存在的话：这里设置hasDyncmicObs而非返回，因为后面可能会存在bridge
            if (!so.through) {
                // 目标不是自定义碰撞体的话
                if (!checker || (checker && !checker.through)) {
                    let soCcModule = so.getModule(SoModule_CustomCollision.PLUGIN_SCENEOBJECT_MODULE_ID) as SoModule_CustomCollision;
                    if (soCcModule && soCcModule.isObstacle) {
                        return 0;
                    }
                }
            }
            // 穿透的情况-忽略掉
            else {
                continue;
            }
            // 不存在行走图的话-忽略掉
            if (so.avatarID == 0) continue;
            return 2;
        }
        return 0;
    }
    /**
     * 两个场景对象是否是禁止碰撞
     * @param so1 场景对象1
     * @param so2 场景对象2
     * @return [boolean] 
     */
    isBothBanCollision(so1: ProjectClientSceneObject, so2: ProjectClientSceneObject): boolean {
        let sign = so1.collisionGroup + "_" + so2.collisionGroup;
        if (SceneUtils.banCollisionMapping[sign]) {
            return true;
        }
        return false;
    }

    /**
     * 刷新动态障碍和桥，根据单位场景对象
     * @param soc 障碍对象
     * @param inScene 是否在场景上
     * @return isChange 是否真正更新过坐标
     */
    updateDynamicObsAndBridge(soc: SceneObject, inScene: boolean, posGrid: Point = null): boolean {
        if (Config.EDIT_MODE) return false;
        if (this.isOutside(new Point(soc.x, soc.y))) {
            return false;
        }
        // 获取当前的格子坐标
        let nowGrid;
        if (posGrid != null) {
            nowGrid = new Point(posGrid.x, posGrid.y);
        }
        else {
            let nowP = new Point(soc.x, soc.y);
            nowGrid = GameUtils.getGridPostion(nowP, nowP);
        }
        let lastGrid = this.lastUpdateObsBridgeGrid[soc.index];
        // 忽略已处理过的坐标点
        if (lastGrid && nowGrid.x == lastGrid.x && nowGrid.y == lastGrid.y && inScene) return false;
        // 桥状态更新
        if (lastGrid) {
            let sos: SceneObject[] = this.gridSceneObjects[lastGrid.x][lastGrid.y];
            sos.splice(sos.indexOf(soc), 1);
            delete this.lastUpdateObsBridgeGrid[soc.index];
        }
        if (inScene) {
            let gridSceneObjectsXArr = this.gridSceneObjects[nowGrid.x];
            if (!gridSceneObjectsXArr) return false;
            let sos: SceneObject[] = gridSceneObjectsXArr[nowGrid.y];
            sos.push(soc);
            this.lastUpdateObsBridgeGrid[soc.index] = nowGrid;
            return true;
        }
        return false;
    }
    //------------------------------------------------------------------------------------------------------
    // 碰撞检测
    //------------------------------------------------------------------------------------------------------
    /**
     * 碰撞检测
     * @param checker 检查者
     * @param useGridObstacle 是否使用格子计算障碍模式  
     * @param posP 检查者即将到达的坐标（单位：像素）
     * @param posGridP [可选] 默认值=null 检查者的即将到达的坐标（单位：格子）
     * @param trendP [可选] 默认值=null 检查者移动趋势坐标（单位：像素）
     * @param trendGridP 检查者移动趋势坐标（单位：格子）
     * @return 障碍和碰触信息 isObstacle=是否碰到障碍 touchSceneObjects=碰触到的对象列表（可能包含自己） correctPos 修正坐标
     */
    touchCheck(checker: ProjectClientSceneObject, useGridObstacle: boolean, posP: Point, posGridP: Point = null, trendP: Point = null, trendGridP: Point): { isObstacle: boolean, touchSceneObjects: ProjectClientSceneObject[], alreadyCalcPosRect: boolean } {
        if (!posGridP) posGridP = GameUtils.getGridPostion(posP);
        // 使用格子计算障碍的方式
        if (useGridObstacle) {
            return this.collsionCheckGrid(checker, posP, posGridP, trendP);
        }
        // 使用矩形计算障碍
        else {
            return this.collsionCheckRect(checker, posP, trendP, posGridP);
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 获取数据
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取指定对象的周围的坐标位置
     * @param mode 0-按照指定的对象1的背面顺时针 1-按照对象2相对于对象1最近的方向开始顺时针
     * @param so1 被接近的目标
     * @param so2 接近的目标
     * @param positionSize [可选] 默认值=1 最多需要的位置数目，如3表示最多需要3个位置
     * @param calcWantToGo [可选] 默认值=false 是否计算想达到，如果计算的话想到达的位置也算被占用
     * @param gridSize [可选] 默认值= Config.SCENE_GRID_SIZE 格子尺寸，默认值是系统格子尺寸，如48
     * @param oneStep [可选] 默认值=false 单步
     * @return 获取周围的位置
     */
    static getAroundPositions(mode: number, so1: ProjectClientSceneObject, so2: ProjectClientSceneObject, positionSize: number = 1, calcWantToGo: boolean = true, gridSize: number = Config.SCENE_GRID_SIZE, oneStep: boolean = false): Point[] {
        positionSize = Math.max(Math.min(MathUtils.int(positionSize), 8), 1);
        // 面向偏移的格子 1 2 3 6 9 8 7 4
        let dirOffsetMapping: number[][];
        if (WorldData.battleOriMode == 1 && so2.avatar.oriMode <= 2) {
            dirOffsetMapping = [[-1, 0.2], [-1, 0.2], [1, 0.2], [1, 0], [1, -0.2], [1, -0.2], [-1, -0.2], [-1, 0]];
        }
        else{
            dirOffsetMapping = [[-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0]];
        }

        let antiClockwiseMapping = [null, 0, 1, 2, 7, null, 3, 6, 5, 4];
        // 位置顺序的偏移，比如背后的点，由正背后0，左背后-1,右背后1...等等（逆时针）
        //                 计算到背后的点是2，想要3个位置应该是2,1,3这样的顺序，所以对于数值2来说偏移就是0,-1,1
        // 7  8  9
        // 4 KDS 6
        // 1  2  3
        let offsets = [0, -1, 1, -2, 2, -3, 3, 4];
        let so1X: number, so1Y: number;
        if (!oneStep) {
            so1X = so1.x;
            so1Y = so1.y;
        }
        else {
            let dx: number, dy: number;
            let disX = Math.abs(so1.x - so2.x);
            let disY = Math.abs(so1.y - so2.y);
            if (disX > disY) {
                dy = 0;
                dx = so1.x > so2.x ? 1 : -1;
            }
            else {
                dx = 0;
                dy = so1.y > so2.y ? 1 : -1;
            }
            so1X = so2.x + dx * gridSize;
            so1Y = so2.y + dy * gridSize;
        }
        // 计算起点：so1背后的点
        let startIndex: number, flip: number;
        if (mode == 0) {
            startIndex = antiClockwiseMapping[so1.avatar.orientation];
            flip = -1;
        }
        // 计算起点：so2离so1最近的点
        else if (mode == 1) {
            let angle = MathUtils.direction360(so1X, so1Y, so2.x, so2.y);
            startIndex = antiClockwiseMapping[GameUtils.getOriByAngle(angle)];
            flip = 1;
        }
        // 按照逆时针将dirOffsetMapping连续安排成一个数组
        let newDirOffsetMapping = [];
        for (let i = 0; i < dirOffsetMapping.length; i++) {
            let newDirOffset = dirOffsetMapping[(startIndex + i) % dirOffsetMapping.length];
            newDirOffsetMapping.push(newDirOffset);
        }
        // 遍历可用的位置，超出positionSize后则不再添加位置
        let finalPostions: Point[] = [];
        let sceneObjects: ProjectClientSceneObject[] = Game.currentScene.sceneObjects as any;
        for (let i = 0; i < newDirOffsetMapping.length; i++) {
            let offset = offsets[i];
            offset = (offset + 8) % 8;
            let positionOffset = newDirOffsetMapping[offset];
            let finalPosition = new Point(so1X + gridSize * positionOffset[0] * flip, so1Y + gridSize * positionOffset[1] * flip);
            let finalPositionGrid = GameUtils.getGridPostion(finalPosition);
            // 如果该点存在障碍则忽略
            if (Game.currentScene.sceneUtils.isObstacleGrid(finalPositionGrid, so2)) continue;
            // 如果该点已被占用则忽略
            if (calcWantToGo && so2) {
                let wantToGoExist = false;
                for (let s = 0; s < sceneObjects.length; s++) {
                    let btSo = sceneObjects[s];
                    if (!btSo || btSo == so2) continue;
                    if (btSo.wantToGoGrid && btSo.wantToGoGrid.x == finalPositionGrid.x && btSo.wantToGoGrid.y == finalPositionGrid.y) {
                        wantToGoExist = true;
                        break;
                    }
                }
                if (wantToGoExist) continue;
            }
            if (so2) so2.wantToGoGrid = finalPositionGrid;
            finalPostions.push(finalPosition);
            if (finalPostions.length >= positionSize) break;
        }
        return finalPostions;
    }
    //------------------------------------------------------------------------------------------------------
    // 私有实现
    //------------------------------------------------------------------------------------------------------
    /**
     * 碰撞检测-格子版
     * @param checker 
     * @param posP 
     * @param posGridP [可选] 默认值=null 
     * @param trendP  [可选] 默认值=null 趋势移动点
     * @param calcTrendP [可选] 默认值=true 计算趋势点接触碰撞信息
     */
    private collsionCheckGrid(checker: ProjectClientSceneObject, posP: Point, posGridP: Point = null, trendP: Point = null, calcTrendP: boolean = true) {
        let res: { isObstacle: boolean, touchSceneObjects: ProjectClientSceneObject[], alreadyCalcPosRect: boolean } = { isObstacle: false, touchSceneObjects: [], alreadyCalcPosRect: false };
        // 不允许接触的场合
        if (!checker.touchEnabled) return res;
        // 如果是边界的情况：视为障碍并返回
        if (this.isOutside(posP) || this.isOutsideByGrid(posGridP)) {
            res.isObstacle = true;
            return res;
        }
        // 1.[非自定义碰撞体列表] 获取接触的非自定义碰撞体对象
        // -- 接触者设置为当前格所在的所有对象
        let touchSceneObjects: ProjectClientSceneObject[] = this.gridSceneObjects[posGridP.x][posGridP.y];
        // -- 如果是移动至格子中心点模式下的情况下，目标对象是静止且穿透/无行走图的话则需要与目标近似重叠才视为接触
        if (WorldData.moveToGridCenter) {
            let _touchSceneObjects = [];
            let errorValue = Math.max(checker.moveSpeed / (18 + Config.SCENE_GRID_SIZE), 1);
            for (let i = 0; i < touchSceneObjects.length; i++) {
                let touchSo = touchSceneObjects[i];
                if (touchSo == checker) continue;
                if ((touchSo.through || touchSo.avatarID == 0)) {
                    // 如果目的地无法去到的话对比的是当前位置而非趋势位置
                    let checkPos: Point;
                    if (trendP) {
                        checkPos = new Point(checker.x, checker.y);
                    }
                    else {
                        checkPos = posP;
                    }
                    // 如果该目标对象不在格子中心点的话则无需重叠
                    let standPos = GameUtils.getGridCenterByGrid(touchSo.posGrid);
                    if (!touchSo.isMoving && standPos.x == touchSo.x && standPos.y == touchSo.y) {
                        if (Math.abs(checkPos.x - touchSo.x) < errorValue && Math.abs(checkPos.y - touchSo.y) < errorValue) {
                            if (_touchSceneObjects.indexOf(touchSo) == -1) _touchSceneObjects.push(touchSo);
                        }
                    }
                    else {
                        if (_touchSceneObjects.indexOf(touchSo) == -1) _touchSceneObjects.push(touchSo);
                    }
                }
                else {
                    if (_touchSceneObjects.indexOf(touchSo) == -1) _touchSceneObjects.push(touchSo);
                }
            }
            touchSceneObjects = _touchSceneObjects;
        }
        else {
            touchSceneObjects = this.gridSceneObjects[posGridP.x][posGridP.y];
        }
        // -- 防止改动gridSceneObjects的数据
        touchSceneObjects = touchSceneObjects.concat();
        // -- 追加趋势格的所有对象
        let trendPToGrid: Point;
        let ignoreCheckGrid: boolean = false; // 忽略检查者自身（其他对象正在朝检查者移动时）
        if (calcTrendP) {
            let dGridX = Math.round(trendP.x - posP.x);
            let dGridY = Math.round(trendP.y - posP.y);
            trendPToGrid = new Point(Math.floor((posP.x - dGridX * this.halfGridPlus) / Config.SCENE_GRID_SIZE) + dGridX, Math.floor((posP.y - dGridY * this.halfGridPlus) / Config.SCENE_GRID_SIZE) + dGridY);
            let trendPTouchRes = this.collsionCheckGrid(checker, trendP, trendPToGrid, null, false);
            for (let i = 0; i < trendPTouchRes.touchSceneObjects.length; i++) {
                let trendPTouchSceneObject = trendPTouchRes.touchSceneObjects[i];
                if (touchSceneObjects.indexOf(trendPTouchSceneObject) == -1) touchSceneObjects.push(trendPTouchSceneObject);
            }
            if (trendPTouchRes.isObstacle) res.isObstacle = true;
            // -- 检查者正在移动且目标趋势格不存在障碍时
            if (checker.isMoving && (trendPToGrid.x != posGridP.x || trendPToGrid.y != posGridP.y) && !trendPTouchRes.isObstacle) {
                ignoreCheckGrid = true;
            }
        }
        // -- 非自定义碰撞体加入到 res.touchSceneObjects
        for (let i = 0; i < touchSceneObjects.length; i++) {
            let touchSceneObject = touchSceneObjects[i];
            // 对方是自定义碰撞体-不在此计算（在下方）
            let ccModule = touchSceneObject.getModule(SoModule_CustomCollision.PLUGIN_SCENEOBJECT_MODULE_ID) as SoModule_CustomCollision;
            if (ccModule && ccModule.isObstacle) continue;
            if (res.touchSceneObjects.indexOf(touchSceneObject) == -1) res.touchSceneObjects.push(touchSceneObject);
        }
        // -- 格子中心点的话如果目标正在移动且正远离当前格的话则忽略掉该对象
        if (WorldData.moveToGridCenter) {
            let checkOffsetX = checker.moveTrendInfo.to.x - checker.moveTrendInfo.from.x > 0 ? 1 : -1;
            let checkOffsetY = checker.moveTrendInfo.to.y - checker.moveTrendInfo.from.y > 0 ? 1 : -1;
            let checkGridCenterP: Point = null;
            for (let i = 0; i < res.touchSceneObjects.length; i++) {
                let targetSo = res.touchSceneObjects[i];
                if (targetSo.isMoving) {
                    // 同方向，不同速度时不用排除该对象（该对象视为障碍）
                    if (targetSo.moveTrendInfo && checker.isMoving && checker.moveTrendInfo) {
                        let targetSoOffsetX = targetSo.moveTrendInfo.to.x - targetSo.moveTrendInfo.from.x > 0 ? 1 : -1;
                        let targetSoOffsetY = targetSo.moveTrendInfo.to.y - targetSo.moveTrendInfo.from.y > 0 ? 1 : -1;
                        if (targetSoOffsetX == checkOffsetX && targetSoOffsetY == checkOffsetY && targetSo.moveSpeed != checker.moveSpeed) {
                            continue;
                        }
                    }
                    // 正在远离所在的格子坐标，不视为障碍
                    if (targetSo.moveRealInfo) {
                        if (!targetSo.moveRealInfo.to) {
                            continue;
                        }
                        let gridCenterP = GameUtils.getGridCenterByGrid(targetSo.posGrid);
                        let fromDis = Point.distanceSquare(targetSo.moveRealInfo.from, gridCenterP);
                        let toDis = Point.distanceSquare(targetSo.moveRealInfo.to, gridCenterP);
                        if (toDis > fromDis) {
                            res.touchSceneObjects.splice(i, 1);
                            i--;
                            continue;
                        }
                    }
                    // 检查者确定会离开该格子的话，则忽略掉前往检查者格子的对象以及已在该格子的对象
                    if (ignoreCheckGrid && targetSo.moveTrendInfo) {
                        // -- 已位于该格子的对象
                        if (targetSo.posGrid.x == posGridP.x && targetSo.posGrid.y == posGridP.y) {
                            res.touchSceneObjects.splice(i, 1);
                            i--;
                            continue;
                        }
                        // -- 忽略掉前往检查者格子的对象
                        if (!checkGridCenterP) checkGridCenterP = GameUtils.getGridCenterByGrid(posGridP);
                        let fromDis = Point.distanceSquare(targetSo.moveTrendInfo.from, checkGridCenterP);
                        let toDis = Point.distanceSquare(targetSo.moveTrendInfo.to, checkGridCenterP);
                        if (toDis < fromDis) {
                            res.touchSceneObjects.splice(i, 1);
                            i--;
                            continue;
                        }
                    }
                }
                // 检查者确定会离开该格子的话,则忽略掉前已在该格子未移动的对象
                else if (ignoreCheckGrid) {
                    // -- 已位于该格子的对象
                    if (targetSo.posGrid.x == posGridP.x && targetSo.posGrid.y == posGridP.y) {
                        res.touchSceneObjects.splice(i, 1);
                        i--;
                        continue;
                    }
                }
            }
        }
        // 2.[非自定义碰撞体列表] 获取动态障碍的列表（非自定义碰触体）
        let checkObsSceneObjestArr = res.touchSceneObjects.concat();
        for (let i = 0; i < checkObsSceneObjestArr.length; i++) {
            let checkObsSceneObjest = checkObsSceneObjestArr[i];
            if (checkObsSceneObjest.avatar.id == 0) {
                checkObsSceneObjestArr.splice(i, 1);
                i--;
            }
        }
        let customCollisionArr = SoModule_CustomCollision.collisionTest(checker, false, trendP);
        if (customCollisionArr.length > 0) {
            for (let i = 0; i < customCollisionArr.length; i++) {
                let customCollisionInfo = customCollisionArr[i];
                // 记录为接触目标
                if (res.touchSceneObjects.indexOf(customCollisionInfo.so) == -1) {
                    res.touchSceneObjects.push(customCollisionInfo.so);
                    checkObsSceneObjestArr.push(customCollisionInfo.so);
                }
            }
        }
        // 4.获取固定的桥属性，如果存在则不计算障碍，返回
        let gridFixedBridge: boolean = null;
        if (trendPToGrid) {
            if (this.isFixedBridgeGrid(trendPToGrid)) gridFixedBridge = true;
        }
        else if (this.isFixedBridgeGrid(posGridP)) gridFixedBridge = true;
        if (gridFixedBridge) return res;
        // 5.获取动态的桥属性，如果存在则不计算障碍，返回
        let gridDynamicBridge: boolean = null;
        if (trendPToGrid) {
            if (this.getGridDynamicObsStatus(trendPToGrid) == 1) gridDynamicBridge = true;
        }
        else if (this.getGridDynamicObsStatus(posGridP) == 1) gridDynamicBridge = true;
        if (gridDynamicBridge) return res;
        // 6.判断是否含有动态障碍 和 固定障碍
        if (!checker.through) {
            // --- 动态障碍
            for (let i = 0; i < checkObsSceneObjestArr.length; i++) {
                let targetSo = checkObsSceneObjestArr[i];
                // -- 非自身
                if (targetSo != checker) {
                    // -- 发现目标拥有桥属性则直接返回，视为无障碍
                    if (targetSo.bridge) {
                        res.isObstacle = false;
                        return res;
                    }
                    // -- 目标非穿透属性 且 与检测者不存在禁止碰触的关系
                    if (!targetSo.through && !this.isBothBanCollision(checker, targetSo)) {
                        res.isObstacle = true;
                        return res;
                    }
                }
            }
            // ---- 固定障碍
            if (trendPToGrid) {
                if (this.isFixedObstacleGrid(trendPToGrid, false)) {
                    res.isObstacle = true;
                    return res;
                }
            }
            else if (this.isFixedObstacleGrid(posGridP, false)) {
                res.isObstacle = true;
                return res;
            }
        }
        return res;
    }
    /**
     * 碰撞检测-矩形包围盒版
     * 碰撞为了优化计算按照场景对象原点 + WorldData.sceneObjectCollisionSize-1 计算。
     * @param p 
     * @param trendP 
     * @param checker 
     * @param isObstacle 
     * @param touchSceneObjects 
     */
    private collsionCheckRect(checker: ProjectClientSceneObject, p: Point, trendP: Point, gridP: Point = null) {
        let res = { isObstacle: false, touchSceneObjects: [], alreadyCalcPosRect: false };
        // 不允许接触的场合
        if (!checker.touchEnabled) return res;
        let size = WorldData.sceneObjectCollisionSize;
        let fixedGridRangleOffset = size / 2;
        // 获取实际碰撞矩形尺寸
        if (!gridP) gridP = GameUtils.getGridPostion(p);
        // 边界碰撞的情况
        if (this.isOutside(p, true)) {
            res.isObstacle = true;
            return res;
        }
        // 检测者是否自定义碰撞体
        let checkerCCModule = checker.getModule(SoModule_CustomCollision.PLUGIN_SCENEOBJECT_MODULE_ID) as SoModule_CustomCollision;
        let checkerIsCustomCollision = checkerCCModule != null;
        // 我的矩形包围盒（如果当前步不允许走的话回回退）
        checker.posRect.x = p.x;
        checker.posRect.y = p.y;
        checker.posRect.width = checker.posRect.height = size - 1;
        res.alreadyCalcPosRect = true;
        let pRect = checker.posRect;
        // 获取其所在的周围九个格子，中的玩家对象的RECT是否和与我有交集，有交集则算作碰到
        let targetGrid = new Point;
        let fixRect = new Rectangle(0, 0, Config.SCENE_GRID_SIZE - 1, Config.SCENE_GRID_SIZE - 1);
        let dirOffsetMapping: number[][] = [[0, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0]];
        let hasBridge = false;
        // 如果该格子已是固定桥属性则表示接触到了桥允许走出去
        if (this.isFixedBridgeGrid(gridP)) hasBridge = true;
        else if (this.getGridDynamicObsStatus(gridP, checker, null, checker) == 1) hasBridge = true;
        // 当前格不是桥但再计算趋势格子是否是桥
        else {
            let trendPToGrid = new Point(gridP.x + Math.round(trendP.x - p.x), gridP.y + Math.round(trendP.y - p.y));
            if (!this.isOutsideByGrid(trendPToGrid)) {
                if (this.isFixedBridgeGrid(trendPToGrid)) hasBridge = true;
                else if (this.getGridDynamicObsStatus(trendPToGrid, checker, null, checker) == 1) hasBridge = true;
            }
        }
        // 遍历周围九个格子：查询接触的对象
        for (let i = 0; i < dirOffsetMapping.length; i++) {
            let d = dirOffsetMapping[i];
            targetGrid.x = gridP.x + d[0];
            targetGrid.y = gridP.y + d[1];
            // 格子超出边界的情况下忽略掉
            if (this.isOutsideByGrid(targetGrid)) continue;
            // 获取碰触的场景对象
            let gridSceneObjects = this.gridSceneObjects[targetGrid.x][targetGrid.y];
            let gridSceneObjectsLen = gridSceneObjects.length;
            // 遍历指定格子的所有场景对象
            for (let s = 0; s < gridSceneObjectsLen; s++) {
                let tSo = gridSceneObjects[s];
                // 不是自己的话
                if (tSo != checker) {
                    // 忽略掉跳跃中的对象
                    if (tSo.isJumping) continue;
                    if (tSo.posRect == null) continue;
                    // 自定义碰撞体-不在此计算（在下方）
                    let ccModule = tSo.getModule(SoModule_CustomCollision.PLUGIN_SCENEOBJECT_MODULE_ID) as SoModule_CustomCollision;
                    if (ccModule && ccModule.isObstacle) continue;
                    if (!res.isObstacle) {
                        // 如果checker是自定义碰撞体的话，则检测
                        if (checkerIsCustomCollision) {
                            if (checkerCCModule.collisionTestByNormalTarget(tSo)) {
                                if (res.touchSceneObjects.indexOf(tSo) == -1) res.touchSceneObjects.push(tSo);
                                if (!hasBridge) {
                                    if (tSo.bridge) hasBridge = true;
                                    else if (!checker.through && !tSo.through && tSo.avatar.id != 0) {
                                        if (this.isBothBanCollision(checker, tSo)) continue
                                        let d1 = Point.distanceSquare(tSo.pos, p);
                                        let d2 = Point.distanceSquare(tSo.pos, trendP);
                                        if (Config.SCENE_GRID_SIZE < fixedGridRangleOffset) {
                                            // 碰撞框小于格子的一半的情况下，趋势是远离我的话则不视为障碍
                                            let _toLeft = trendP.x < p.x;
                                            let _toRight = trendP.x > p.x;
                                            let _toTop = trendP.y < p.y;
                                            let _toBottom = trendP.y > p.y;
                                            if (_toLeft) {
                                                // 往左走
                                                if (dirOffsetMapping[i][0] === 1) {
                                                    continue;
                                                }
                                            }
                                            if (_toRight) {
                                                // 往右走
                                                if (dirOffsetMapping[i][0] === -1) {
                                                    continue;
                                                }
                                            }
                                            if (_toTop) {
                                                // 往上走
                                                if (dirOffsetMapping[i][1] === 1) {
                                                    continue;
                                                }
                                            }
                                            if (_toBottom) {
                                                // 往下走
                                                if (dirOffsetMapping[i][1] === -1) {
                                                    continue;
                                                }
                                            }
                                            if ((_toLeft && !_toBottom) || (_toTop && !_toRight)) {
                                                if (d2 > d1) {
                                                    res.isObstacle = true;
                                                }
                                            } else {
                                                if (d2 < d1) {
                                                    res.isObstacle = true;
                                                }
                                            }
                                            continue;
                                        }
                                        if (d2 < d1) {
                                            res.isObstacle = true;
                                        }
                                    }
                                }
                            }
                            continue;
                        }
                        // 检查矩形是否存在交集，存在交集的话添加到接触列表中
                        tSo.posRect.x = tSo.x;
                        tSo.posRect.y = tSo.y;
                        let tRect = tSo.posRect;
                        let jRect = tRect.intersection(pRect);
                        // 碰触到的情况
                        if (jRect && jRect.width > 0 && jRect.height > 0) {
                            if (res.touchSceneObjects.indexOf(tSo) == -1) res.touchSceneObjects.push(tSo);
                            // 没有遇到桥的话还需要判定是否是动态桥或动态障碍
                            if (!hasBridge) {
                                // 该对象有桥属性，表示可以通行
                                if (tSo.bridge) hasBridge = true;
                                // 双方都不是穿透的话则视为障碍（但趋势是远离我的话则不视为障碍）
                                else if (!checker.through && !tSo.through && tSo.avatar.id != 0) {
                                    // -- 禁止碰撞的不再检测
                                    if (this.isBothBanCollision(checker, tSo)) continue;
                                    let d1 = Point.distanceSquare(tSo.pos, p);
                                    let d2 = Point.distanceSquare(tSo.pos, trendP);
                                    if (d2 < d1) {
                                        res.isObstacle = true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            // 检查地图固定障碍：当此前未检测到障碍且当前格并没有遇到桥属性以及检查者非穿透模式的话
            if (!res.isObstacle && !hasBridge && !checker.through) {
                // 如果该格是地图障碍格的话
                if (this.isFixedObstacleGrid(targetGrid, false)) {
                    let targetGridPosX = targetGrid.x * Config.SCENE_GRID_SIZE + fixedGridRangleOffset;
                    let targetGridPosY = targetGrid.y * Config.SCENE_GRID_SIZE + fixedGridRangleOffset;
                    fixRect.x = targetGridPosX;
                    fixRect.y = targetGridPosY;
                    let jRect = fixRect.intersection(pRect);
                    // 碰触到的情况
                    if (jRect && jRect.width > 0 && jRect.height > 0) {
                        if (this.isFixedBridgeGrid(targetGrid)) {
                            hasBridge = true;
                            continue;
                        }
                        // 如果趋势是远离我的话则不视为障碍
                        let d1 = new Point(targetGridPosX, targetGridPosY).distance(p.x, p.y);
                        let d2 = new Point(targetGridPosX, targetGridPosY).distance(trendP.x, trendP.y);
                        if (d2 < d1) {
                            res.isObstacle = true;
                        }
                    }
                }
            }
        }
        // 追加自定义碰撞区域检测（checker与全自定义碰撞区进行检测）
        // -- 获取全部接触者
        let customCollisionArr = SoModule_CustomCollision.collisionTest(checker, false, trendP);
        if (customCollisionArr.length > 0) {
            for (let i = 0; i < customCollisionArr.length; i++) {
                let customCollisionInfo = customCollisionArr[i];
                // 记录为接触目标
                if (res.touchSceneObjects.indexOf(customCollisionInfo.so) == -1) res.touchSceneObjects.push(customCollisionInfo.so);
                // 检查是否是障碍
                if (!hasBridge) {
                    // 该对象有桥属性，表示可以通行，该区域部视为障碍
                    if (customCollisionInfo.so.bridge) hasBridge = true;
                    // 双方都不是穿透的话则视为障碍（但趋势是远离我的话则不视为障碍）
                    else if (!checker.through && !customCollisionInfo.so.through) {
                        // -- 禁止碰撞的不再检测
                        if (this.isBothBanCollision(checker, customCollisionInfo.so)) continue;
                        res.isObstacle = true;
                    }
                }
            }
        }
        if (hasBridge) {
            res.isObstacle = false;
        }
        return res;
    }
}