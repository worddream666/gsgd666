/**
 * 客户端游戏场景
 * 场景一般由地图图像和场景上的对象（[ClientSceneObject]）组成
 * -- 图层支持：图块图层和图片图层，可自定义，支持无限层
 * -- 场景对象支持：添加场景对象在场景上
 * -- 镜头控制 Camera
 *
 * 【新建场景】 ps:利用相机以及当前的场景还可以很方便的制作小地图
 *  // 方法一：创建一个5号场景（不包含场景中预摆放的对象），一个实例仅允许设置一次id
 *  var s = new ClientScene();
 *  s.id = 5;
 *  s.startRender();
 *  stage.addChild(s.displayObject); // 游戏显示层参考 GameLayer.d.ts
 *
 *  // 方法二：通过ClientScene.createScene来创建场景，无需指定场景的绑定类，系统根据预设自动新建该场景的绑定类
 *  ClientScene.createScene(sceneModelID, null, Callback.New(()=>{}, this), true);
 *
 * 【其他事件】
 *  EventObject.LOADED 地图全部图层资源加载完毕时 如 scene.on(EventObject.LOADED,this,()=>{});
 *
 * 【层次】总层次可参考 [GameLayer]
 * 以下是引擎默认的游戏显示层次参考：
 * -- 场景层 sceneLayer
 *     - 编辑器预设的自定义底层（比对象层更低的图层）
 *     - 影子层 shadowLayer
 *     - 动画层-底层 animationLowLayer
 *     - 对象层-底层 sceneObjectLowLayer 同时开启了[子对象根据Y值自动更换层次]
 *     - 对象层-中层 sceneObjectLayer 同时开启了[子对象根据Y值自动更换层次]
 *     - 编辑器预设的自定义高层 （比对象层更高的图层）
 *     - 对象层-高层 sceneObjectHighLayer 同时开启了[子对象根据Y值自动更换层次]
 *     - 动画层-高层 animationHighLayer
 *     - 雾层 fogLayer
 *     - 天气层 weaterLayer
 * -- 图片层 imageLayer
 * -- UI层 uiLayer
 *
 * Created by 黑暗之神KDS on 2018-07-22 17:29:13.
 */
declare class ClientScene extends Scene {
    /**
     * 事件：基础数据加载完毕（可用于快速切入场景，而后再加载动态相关资源）回调参数：onBaseDataLoaded(scene:ClientScene) 默认值="ClientScene_BASE_DATA_LOADED"
     * 监听基础资源加载完毕示例：
     * <code>
     *  var s = new ClientScene();
     *  s.id = 5;
     *  s.on(ClientScene.BASE_DATA_LOADED)
     *  s.startRender(ClientScene.BASE_DATA_LOADED,this,(s:ClientScene)=>{
     *      // to do
     *  });
     *  stage.addChild(s.displayObject);
     * </code>
     */
    static BASE_DATA_LOADED: string;
    /**
     * 事件：进入新的场景 onInNewScene(sceneID:number,state:number) state:0-切换场景 1-新游戏 2-读取存档
     * 监听来自切换场景事件、新游戏、读取存档的事件，以便项目层实现更换场景的效果 默认值="ClientSceneEVENT_IN_NEW_SCENE"
     * <code>
     *  // sceneModelID = 场景模型ID，对应编辑器的场景ID（如果是网络版可能是副本场景，但模型来源仍然是预设的场景）
     *  EventUtils.addEventListenerFunction(ClientScene, ClientScene.EVENT_IN_NEW_SCENE, (sceneModelID: number, state: number)=>{
     *    // to do
     *  }, this);
     * </code>
     */
    static EVENT_IN_NEW_SCENE: string;
    /**
     * 空的场景，游戏启动时则为空场景状态，可用于判定
     */
    static EMPTY: ClientScene;
    /**
     * 创建场景，会根据预设的实现类来创建对应的实例场景
     * @param sceneID 场景ID
     * @param onBaseDataLoaded [可选] 默认值=null 当基础数据加载完毕时回调 onBaseDataLoaded(scene)
     * @param onLoaded [可选] 默认值=null onLoaded(scene)
     * @param syncCallbackWhenAssetExist [可选] 默认值=false 当资源存在时同步回调，否则需要等待一帧（异步回调）
     * @return [ClientScene]
     */
    static createScene(sceneID: number, onBaseDataLoaded?: Callback, onLoaded?: Callback, syncCallbackWhenAssetExist?: boolean): void;
    /**
     * 是否已卸载
     */
    isDisposed: boolean;
    /**
     * 支持暂停（支持Game.pause效果，暂停后场景停止渲染）
     */
    mapSupportPause: boolean;
    /**
     * 场景对象列表：场景上全部的场景对象 [场景对象.index] -> [场景对象]
     */
    sceneObjects: ClientSceneObject[];
    /**
     * 预先设定的图层显示对象集合(来自地图编辑器中预设)
     */
    settingLayers: ClientSceneLayer[];
    /**
     * 场景的显示对象（根容器）
     */
    displayObject: GameSprite;
    /**
     * 影子层
     */
    shadowLayer: ClientSceneLayer;
    /**
     * 动画层：底层
     */
    animationLowLayer: ClientSceneLayer;
    /**
     * 对象层：底层
     */
    sceneObjectLowLayer: ClientSceneLayer;
    /**
     * 对象层：中间层
     */
    sceneObjectLayer: ClientSceneLayer;
    /**
     * 场景对象：最高层
     */
    sceneObjectHighLayer: ClientSceneLayer;
    /**
     * 动画层：高层
     */
    animationHighLayer: ClientSceneLayer;
    /**
     * 雾层
     */
    fogLayer: ClientSceneLayer;
    /**
     * 天气层
     */
    weaterLayer: ClientSceneLayer;
    /**
     * 场景的镜头
     */
    camera: Camera;
    /**
     * 释放当前的场景
     */
    dispose(): void;
    //------------------------------------------------------------------------------------------------------
    //  图层
    //------------------------------------------------------------------------------------------------------
    /**
     * 添加图层
     * @param layer 图层对象
     */
    addLayer(layer: ClientSceneLayer): void;
    /**
     * 添加图层到指定层
     * @param layer 图层对象
     * @param index 指定层索引
     */
    addLayerAt(layer: ClientSceneLayer, index: number): void;
    /**
     * 移除图层
     * @param layer 图层对象
     */
    removeLayer(layer: ClientSceneLayer): void;
    /**
     * 指定移除某一层的图层
     * @param index 指定层索引
     */
    removeLayerAt(index: number): void;
    /**
     * 设置图层到指定的层，该层必须已经在场景上
     * @param layer 图层
     * @param index 指定的层索引
     */
    setLayerIndex(layer: ClientSceneLayer, index: number): void;
    /**
     * 获取当前的图层总数
     * @return [number] 
     */
    getLayerLength(): number;
    /**
     * 获取层，根据实际层次索引
     * @param index 层次索引
     * @return 图层
     */
    getLayer(index: number): ClientSceneLayer;
    /**
     * 获取层，根据预设层次
     * @param id 对应地图层预览中的序号
     */
    getLayerByPreset(id: number): ClientSceneLayer;
    /**
     * 获取层根据名称
     * @param name 图层的名称
     * @return [ClientSceneLayer]
     */
    getLayerByName(name: string): ClientSceneLayer;
    //------------------------------------------------------------------------------------------------------
    //  场景对象
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取场景预设的场景对象数据（不包含出生点）
     * @return 场景对象数据集
     */
    getPresetSceneObjectDatas(): SceneObject[];
    /**
     * 场景对象添加到场景上
     * 由于对象涉及了参数默认值、状态页、预设的对象模块，通常情况下是使用 addNewSceneObject/addSceneObjectFromClone 来创建对象
     * 通常在当前场景上则用于添加已存在的实体对象进来。
     * 示例：
     * <code>
     * // soc = [object ClientSceneObject]
     * Game.currentScene.addChild(soc,true,true);
     * </code>
     * @param soData 场景对象数据（可以是纯数据SceneObject或实体对象）
     * @param isEntity [可选] 默认值=false 是否是实体对象而非数据，如果是数据则会根据数据重新创建一个实体对象
     * @param useModelClass [可选] 默认值=false 是否使用场景对象模型的实现类，项目层通常该值为true
     * @param className [可选] 默认值=false 如果存在则根据className创建实例
     * @return [ClientSceneObject] 添加的场景对象实例
     */
    addSceneObject(soData: SceneObject, isEntity?: boolean, useModelClass?: boolean, className?: string): ClientSceneObject;
    /**
     * 从场景上移除场景对象
     * @param so 场景对象数据，保证场景对象的index是你需要移除的那个即可
     * @param removeFromList [可选] 默认值=false 是否从列表中移除
     * @return [ClientSceneObject] 移除的场景对象实例
     */
    removeSceneObject(so: SceneObject, removeFromList?: boolean): ClientSceneObject;
    /**
     * 添加新对象，以默认值生成新的对象，同时也可以追加修改属性（presetSceneObjectData）
     * @param modelID 模型ID
     * @param presetSceneObjectData [可选] 默认值=null 预设数据，以便生成时使用该数据作为参考，如 {x:500,y:500} className可根据className创建实例
     * @return [ClientSceneObject]
     */
    addNewSceneObject(modelID: number, presetSceneObjectData?: any): ClientSceneObject;
    /**
     * 克隆并添加场景对象
     * 从指定的预设好的场景中指定一个对象为克隆源，然后复制这个对象到当前的场景上。
     * 优先使用fromSceneObjectindex位置存放场景对象，如果该位置已存在对象，则自动计算空位置插入到（this.sceneObjects）
     * 如果来源一个非当前场景，必须在克隆之前有预加载过该场景或创建过该场景：
     *  -- 预加载场景资源 AssetManager.preLoadSceneAsset 或 创建场景 ClientScene.createScene
     * @param fromSceneID 来源的场景ID
     * @param fromSceneObjectindex 来源场景中的场景对象ID
     * @param isCopy [可选] 默认值=true 是否克隆（用于记录这个对象来自克隆）
     * @param presetSceneObjectData [可选] 默认值=null 预设的数据（SceneObject属性），如修改x,y等，在最初即赋值。
     * @return [ClientSceneObject] 场景对象实例，如果没有找到模型的话创建失败返回null
     */
    addSceneObjectFromClone(fromSceneID: number, fromSceneObjectindex: number, isCopy?: boolean, presetSceneObjectData?: any): ClientSceneObject;
    //------------------------------------------------------------------------------------------------------
    //  通常
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取鼠标X所在的场景位置（单位：像素）
     */
    get localX(): number;
    /**
     * 获取鼠标Y所在的场景位置（单位：像素）
     */
    get localY(): number;
    /**
     * 获取鼠标绝对位置（相对于舞台）（单位：像素）
     */
    get globalPos(): Point;
    /**
     * 获取绝对鼠标位置（相对于舞台）根据指定的场景位置
     * @param localX 场景的坐标x（单位：像素）
     * @param localY 场景的坐标y（单位：像素）
     * @return [Point]
     */
    getGlobalPos(localX: number, localY: number): Point;
    /**
     * 立刻刷新镜头（默认情况下场景会逐帧刷新镜头，如绑定的场景对象在移动时）
     */
    updateCamera(): void;
    /**
     * 开始渲染，场景如果未调用的话则处于静止状态，运动的图层等都不播放
     */
    startRender(): void;
    /**
     * 停止渲染
     * @param LayerMoveToZero [可选] 默认值=false 是否图层移动归零，是的话就归零，否则推进移动一帧
     */
    stopRender(LayerMoveToZero?: boolean): void;
    /**
     * 渲染：当Game.pause时则不处理刷新（update）
     * 支持子类重写该方法以便编写专有的游戏逻辑
     * 当前方法功能：
     * -- 刷新镜头
     * -- 刷新图层
     * -- 刷新场景对象（update）
     */
    protected onRender(): void;
    //------------------------------------------------------------------------------------------------------
    //  事件
    //------------------------------------------------------------------------------------------------------
    /**
     * 检查场景是否为特定事件类型注册了任何侦听器
     * @param	type 事件的类型。
     * @return 如果指定类型的侦听器已注册，则值为 true；否则，值为 false。
     */
    hasListener(type: string): boolean;
    /**
     * 场景派发事件
     * @param type	事件类型。
     * @param data	[可选] 默认值=null 回调数据。如果是需要传递多个参数 p1,p2,p3,...可以使用数组结构如：[p1,p2,p3,...] ；如果需要回调单个参数 p 是一个数组，则需要使用结构如：[p]，其他的单个参数 p ，可以直接传入参数 p。
     * @return 此事件类型是否有侦听者，如果有侦听者则值为 true，否则值为 false。
     */
    event(type: string, data?: any): boolean;
    /**
     * 使用场景注册指定类型的事件侦听器对象，以使侦听器能够接收事件通知
     * @param type		事件的类型。
     * @param caller	事件侦听函数的执行域。a
     * @param listener	事件侦听函数。
     * @param args		[可选] 默认值=null 事件侦听函数的回调参数。
     * @return 此场景对象。
     */
    on(type: string, caller: any, listener: Function, args?: Array<any>): ClientScene;
    /**
     * 使用场景注册指定类型的事件侦听器对象，以使侦听器能够接收事件通知，此侦听事件响应一次后自动移除
     * @param type		事件的类型。
     * @param caller	事件侦听函数的执行域。
     * @param listener	事件侦听函数。
     * @param args		[可选] 默认值=null 事件侦听函数的回调参数。
     * @return 此场景对象。
     */
    once(type: string, caller: any, listener: Function, args?: Array<any>): ClientScene;
    /**
    * 从场景中删除侦听器
    * @param type		事件的类型。
    * @param caller	事件侦听函数的执行域。
    * @param listener	事件侦听函数。
    * @param onceOnly	[可选] 默认值=false 如果值为 true ,则只移除通过 once 方法添加的侦听器。
    * @return 此场景对象。
    */
    off(type: string, caller: any, listener: Function, onceOnly?: boolean): ClientScene;
    /**
     * 从场景中删除指定事件类型的所有侦听器
     * @param type	[可选] 默认值=null 事件类型，如果值为 null，则移除本对象所有类型的侦听器。
     * @return 此场景对象。
     */
    offAll(type?: string): ClientScene;
}
