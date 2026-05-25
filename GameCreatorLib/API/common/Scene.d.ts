/**
 * 场景-基类
 * 场景上支持摆放场景对象([SceneObject])以及图层([ClientSceneLayer]，仅客户端有图层概念)
 * 所有场景的基类都是该类，拥有该类的基本特性
 * 支持绑定类：不同的场景可以绑定不同的类，以便实现不同的特性，比如A场景是平面RPG场景，B场景是带有物理系统的横版跳跃场景
 * 支持自定义触发类型：比如进入场景的事件、离开场景的事件等等
 *
 * Created by 黑暗之神KDS on 2018-05-21 01:49:13.
 */
declare class Scene {
    /**
     * 唯一编号
     */
    id: number;
    /**
     * 地图宽度（单位：像素）
     */
    width: number;
    /**
     * 地图高度（单位：像素）
     */
    height: number;
    /**
     * 地图名称
     */
    name: string;
    /**
     * 预载入场景时是否加载地图资源：图层涉及到的贴图资源，如果未预加载则会在显示时动态加载
     * 在项目层调用AssetManager.preLoadSceneAsset时根据此配置自动加载地图图层资源
     */
    preloadMapAsset: boolean;
    /**
     * 预载入场景时是否加载全部场景对象资源：行走图、对象身上可能挂载的界面和动画
     * 在项目层调用AssetManager.preLoadSceneAsset时根据此配置自动加载场景中预设的场景对象资源
     */
    preloadSceneObjectAsset: boolean;
    /**
     * 预载入场景时是否加载场景的全部触发事件
     * 在项目层调用AssetManager.preLoadSceneAsset时根据此配置自动加载场景中预设的场景对象资源
     *
     * 当加载场景时会根据事件页中的以下系统事件进行预加载资源
     * -- 对话和选项事件：带有的对话框样式和头像资源
     * -- 设置对象行为事件：行走图资源
     * -- 自定义事件：需要项目层自行追加相关逻辑，比如可以重写AssetManager.preLoadCommandPage以便追加需要预载入的内容
     */
    preloadSceneCommandAsset: boolean;
    /**
     * 数据层数据 [自定义层的索引][格子x轴][格子y轴]
     * 支持自定义添加或移除数据层，相关逻辑实现在项目层
     * 比如可以制作RPG中的障碍层、遮罩层或毒气范围等
     */
    dataLayers: number[][][];
    /**
     * 图层数据，存放着编辑器中预设的图层数据，在创建场景时会根据此项生成图层显示对象
     */
    LayerDatas: SceneLayerData[];
    /**
     * BGM-背景音乐 当进入场景时播放的背景音乐（由项目层实现）
     * 相对地址，如 asset/audio/bgm/abc.mp3
     */
    bgm: string;
    /**
     * BGM-背景音乐音量 0~1
     */
    bgmVolume: number;
    /**
     * BGM-背景音乐音调 0~2 默认1表示正常的音效
     */
    bgmPitch: number;
    /**
     * BGS-环境音效 当进入场景时播放的环境音效（由项目层实现）
     * 相对地址，如 asset/audio/bgs/abc.mp3
     */
    bgs: string;
    /**
     * BGS音量 0~1
     */
    bgsVolume: number;
    /**
     * BGS-音调  0~2 默认1表示正常的音效
     */
    bgsPitch: number;
    /**
     * 场景对象记录列表 [场景对象.index] -> [场景对象]
     * 场景上的全场景对象均存放在该列表中统一管理，每个对象有唯一的index
     * 场景编辑器中预设的对象编号(ID)即对应此处的index，而游戏中动态生成的对象或克隆的对象会根据空位插入。
     * 从场景上移除的克隆对象通常会在该列表中置空
     */
    sceneObjects: SceneObject[];
    /**
     * 场景自定义触发类别 [事件触发类别索引] -> [事件页对象]
     * 比如多数模板都会存在的进入场景事件是一种常用的自定义触发类别
     */
    customCommandPages: CommandPage[];
    /**
     * 格子宽 根据游戏场景中根据预设的[网格像素大小]和实际场景宽度计算尺寸，单位格子像素尺寸参考Config.SCENE_GRID_SIZE
     */
    gridWidth: number;
    /**
     * 格子高 根据游戏场景中根据预设的[网格像素大小]和实际场景高度计算尺寸，单位格子像素尺寸参考Config.SCENE_GRID_SIZE
     */
    gridHeight: number;
    /**
     * 解析，系统在初始化场景时会调用此函数，项目层可以重载此函数以便实现需要的游戏逻辑
     * @param jsonObj 场景数据文件
     * @param gameData 游戏数据
     */
    parse(jsonObj: any, gameData: GameData): void;
    /**
     * 获取数据格子状态
     * @param index 数据层索引
     * @param gridX 格子坐标x
     * @param gridY 格子坐标y
     * @return [number] 该格子的状态
     */
    getDataGridState(index: number, gridX: number, gridY: number): number;
    /**
     * 设置数据格子状态
     * 在游戏运行中可以动态更改格子的状态，更改后的状态不会被存档，只是一种临时状态，
     * 如果需要储存格子状态需要项目层自行实现。（存档支持存入一些自定义的数据 参考：SinglePlayerGame.d.ts）
     * 项目层自行实现数据层的作用。
     * @param index 数据层索引
     * @param gridX 格子坐标x
     * @param gridY 格子坐标y
     * @param state 设置该格子的状态
     */
    setDataGridState(index: number, gridX: number, gridY: number, state: number): void;
    /**
     * 获取以场景格子计算的实际的宽高（按格子计算的标准化宽高）
     * @param scene 场景对象
     * @return width=宽度（像素尺寸） height=高度（像素尺寸）
     */
    static getRealWidth(scene: Scene): { width: number; height: number; };
}
