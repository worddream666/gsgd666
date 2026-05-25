/**
 * 场景对象实体类
 * 所有实际的场景对象实体都继承此类
 * 拥有特性：
 * -- 对象开关（存档时系统会自动记录所有场景的对象开关，同时可以影响到出现条件）
 * -- 添加对象行为（详情参考:[SceneObjectBehaviors]）
 * -- 携带自定义事件：如RPG模板中可能拥有点击事件、碰触事件多种触发事件
 * -- 状态页：根据满足出现条件决定出现的哪一页状态
 * -- 场景对象模块：可安装多个模块，安装后拥有模块的特性
 * Created by 黑暗之神KDS on 2020-02-22 03:47:27.
 */
declare class SceneObjectEntity extends SceneObject {
    /**
     * 事件：当切换状态页前，首次创建时不派发该事件。派发对象 SceneObjectEntity 一般用于全局监听所有场景对象的切换状态页事件
     *       目前仅在服务端使用
     * <code>
     * // 监听状态页更改时
     * EventUtils.addEventListenerFunction(SceneObjectEntity, SceneObjectEntity.EVENT_BEFORE_CHANGE_STATUS_PAGE, (soe: SceneObjectEntity) => {
     *       // to do
     * }, this);
     * </code>
     */
    static EVENT_BEFORE_CHANGE_STATUS_PAGE: string;
    /**
     * 事件：当切换状态页前，首次创建时不派发该事件。派发对象 [Object SceneObjectEntity] 一般用于对某个对象监听切换状态页事件
     *       目前仅在服务端使用
     * <code>
     * // 监听状态页更改时
     * EventUtils.addEventListenerFunction(soe, SceneObjectEntity.EVENT_BEFORE_CHANGE_STATUS_PAGE_FOR_INSTANCE, (soe: SceneObjectEntity) => {
     *       // to do
     * }, this);
     * </code>
     */
    static EVENT_BEFORE_CHANGE_STATUS_PAGE_FOR_INSTANCE: string;
    /**
     * 事件：当切换状态页后，首次创建时不派发该事件。派发对象 SceneObjectEntity 一般用于全局监听所有场景对象的切换状态页事件
     * <code>
     * // 监听玩家的状态页更改时
     * EventUtils.addEventListenerFunction(SceneObjectEntity, SceneObjectEntity.EVENT_CHANGE_STATUS_PAGE, (soe: SceneObjectEntity) => {
     *       // to do
     * }, this);
     * </code>
     */
    static EVENT_CHANGE_STATUS_PAGE: string;
    /**
     * 事件：当切换状态页后，首次创建时不派发该事件。派发对象 [Object SceneObjectEntity] 一般用于对某个对象监听切换状态页事件
     * <code>
     * // 监听玩家的状态页更改时
     * EventUtils.addEventListenerFunction(soe, SceneObjectEntity.EVENT_CHANGE_STATUS_PAGE_FOR_INSTANCE, (soe: SceneObjectEntity) => {
     *       // to do
     * }, this);
     * </code>
     */
    static EVENT_CHANGE_STATUS_PAGE_FOR_INSTANCE: string;
    /**
     * 事件：当附加模块时 派发对象=SceneObjectEntity
     * <code>
     * // 监听玩家添加模块时事件
     * EventUtils.addEventListenerFunction(SceneObjectEntity, SceneObjectEntity.EVENT_ON_ADD_MODULE, (soe:SceneObjectEntity,soModule:SceneObjectModule) => {
     *       // to do
     * }, this);
     * </code>
     */
    static EVENT_ON_ADD_MODULE: string;
    /**
     * 事件：当移除模块时 派发对象=SceneObjectEntity onRemoveModule(soe:SceneObjectEntity,soModule:SceneObjectModule)
     * <code>
     * // 监听玩家移除模块时事件
     * EventUtils.addEventListenerFunction(SceneObjectEntity, SceneObjectEntity.EVENT_ON_REMOVE_MODULE, (soe:SceneObjectEntity,soModule:SceneObjectModule) => {
     *       // to do
     * }, this);
     * </code>
     */
    static EVENT_ON_REMOVE_MODULE: string;
    /**
     * 是否已释放
     */
    isDisposed: boolean;
    /**
     * 是否副本
     */
    get isCopy(): boolean;
    /**
     * 克隆的来源 sceneID=源场景编号 sceneObjectIndex=源对象编号
     */
    get copyFrom(): { sceneID: number, sceneObjectIndex: number };
    /**
     * 是否在场景上 默认值=false
     */
    inScene: boolean;
    /**
     * 当前对应的状态页面索引 0~N
     */
    currentStatusPageIndex: number;
    //------------------------------------------------------------------------------------------------------
    // 对象独有开关
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取对象的开关
     * @param varID 对象开关编号 0-N
     * @return [number] 
     */
    getSwitch(varID: number): number;
    /**
     * 设置对象的开关：存档时系统会自动记录全场景中所有对象的对象开关数据，同时可以影响到出现条件。
     * @param varID 对象开关编号 0-N
     * @param value 开关值 0/1
     */
    setSwitch(varID: number, value: number): void;
    /**
     * 安装开关，一般用于读取数据后一次写入
     */
    installSwitchs(switchs: number[]): void;
    //------------------------------------------------------------------------------------------------------
    // 自定义属性
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取自定义属性名称集
     * @return [string] 
     */
    getCustomAttrs(): string[];
    //------------------------------------------------------------------------------------------------------
    // 对象的行为
    //------------------------------------------------------------------------------------------------------
    /**
    * 行为集，由多个行为组合而成
    */
    protected behaviors: SceneObjectBehaviors[];
    /**
     * 添加一组行为 
     * @param behaviorData 行为数据 [[行为1-ID,参数1,参数2],[行为2-ID,参数1,参数2],....]
     * @param loop 是否循环
     * @param targetSceneObject 参考的目标对象
     * @param onOver 当行为结束时回调
     * @param cover 覆盖旧的行为
     * @param startIndex [可选] 默认值=0 该行为组的开始播放的行为索引，默认0，表示从最开头开始播放
     * @param Immediate [可选] 默认值=true 是否立即刷新，否则会等待下一帧才刷新
     * @param forceStopLastBehavior [可选] 默认值=false 是否强制停止正在执行的行为，由项目层实现，以便当前行为组能够立即执行
     * @param delayFrame [可选] 默认值=0 行为内部的需要等待的帧数
     * @param executor [可选] 默认值=null 执行事件者（也是行为派发者）
     * @return 对象行为处理器
     */
    addBehavior(behaviorData: any[], loop: boolean, targetSceneObject: SceneObject, onOver: Callback, cover: boolean, startIndex?: number, Immediate?: boolean, forceStopLastBehavior?: boolean, delayFrame?: number, executor?: SceneObjectEntity): SceneObjectBehaviors;
    /**
     * 清理行为组，清理后对象不在拥有设定的任何行为
     */
    clearBehaviors(): void;
    //------------------------------------------------------------------------------------------------------
    // 事件
    //------------------------------------------------------------------------------------------------------
    /**
     * 事件触发线：全部触发器 { [triggerLineID: number]: CommandTrigger }
     */
    triggerLines: any;
    /**
    * 事件触发线：单线唯一 { [triggerLineID: string]: CommandTrigger }
    */
    triggerSingleLines: any;
    /**
     * 场景对象事件页 下标=indexType 0~n
     */
    customCommandPages: CommandPage[];
    /**
     * 获取事件触发器:单线事件拿到的是唯一触发器，而多线事件则新生成触发器
     * 同一个触发器表示一条线路执行，所以多线事件新生成触发器则代表一个事件页可以同时执行多次
     * @param mainType 0-场景相关的事件类别 1-场景对象相关的事件类别 2-界面相关的事件类别 3-事件库的事件类别 4-片段事件的事件类别 （对应CommandTrigger.COMMAND_MAIN_TYPE_XXX）
     * @param indexType 对应的小类别 0-N 如：这是一个场景对象的自定义触发类型事件-“点击事件”
     * @param scene 场景
     * @param executor 执行者：当前事件的执行者
     * @return 事件触发器
     */
    getCommandTrigger(mainType: number, indexType: number, scene: Scene, executor: SceneObjectEntity): CommandTrigger;
    //------------------------------------------------------------------------------------------------------
    //  模块
    //------------------------------------------------------------------------------------------------------
    /**
     * 添加模块
     * @param soModule 模块
     * @param sendEvent [可选] 默认值=true 是否添加成功
     * @return [boolean] 是否添加成功
     */
    addModule(soModule: SceneObjectModule, sendEvent?: boolean): boolean;
    /**
     * 添加模块-到指定的位置上
     * @param soModule 模块
     * @param index 指定的位置
     * @param sendEvent [可选] 默认值=true 是否派发事件
     * @return [boolean] 是否添加成功 
     */
    addModuleAt(soModule: SceneObjectModule, index: number, sendEvent?: boolean): boolean;
    /**
     * 添加模块-根据模块编号
     * -- 模块的属性为默认值
     * @param moduleID 模块编号
     * @param sendEvent [可选] 默认值=true 是否派发事件
     * @return [SceneObjectModule] 被添加的模块，如果不成功则返回null
     */
    addModuleByID(moduleID: number, sendEvent?: boolean): SceneObjectModule;
    /**
     * 添加模块-到指定的位置上-根据模块的编号
     * @param moduleID 模块编号
     * @param index 指定的位置
     * @param sendEvent [可选] 默认值=true 是否派发事件
     * @return [SceneObjectModule] 被添加的模块，如果不成功则返回null
     */
    addModuleByIDAt(moduleID: number, index: number, sendEvent?: boolean): SceneObjectModule;
    /**
     * 移除所有模块
     * @param isDispose [可选] 默认值=true 是否销毁模块
     * @param sendEvent [可选] 默认值=true 是否派发事件
     */
    removeAllModules(isDispose?: boolean, sendEvent?: boolean): void;
    /**
     * 移除指定编号的模块
     * @param moduleID 模块的编号
     * @param isDispose [可选] 默认值=true 是否销毁模块
     * @param sendEvent [可选] 默认值=true 是否派发事件
     * @return [SceneObjectModule] 被移除的模块，如果不成功则返回null
     */
    removeModuleByID(moduleID: number, isDispose?: boolean, sendEvent?: boolean): SceneObjectModule;
    /**
     * 移除模块-根据其拥有的模块
     * @param soModule 拥有的模块
     * @param isDispose [可选] 默认值=true 是否销毁模块
     * @param sendEvent [可选] 默认值=true 是否派发事件
     * @return [boolean] 是否移除成功
     */
    removeModule(soModule: SceneObjectModule, isDispose?: boolean, sendEvent?: boolean): boolean;
    /**
     * 移除模块-根据指定的位置
     * @param index 指定的位置
     * @param isDispose [可选] 默认值=true 是否销毁
     * @param sendEvent [可选] 默认值=true 是否派发事件
     * @return [boolean] 是否移除成功
     */
    removeModuleAt(index: number, isDispose?: boolean, sendEvent?: boolean): boolean;
    /**
     * 设置已拥有的模块到指定位置
     * @param soModule 拥有的模块
     * @param toIndex 设置到达指定的位置
     * @return [boolean] 是否成功
     */
    setModuleIndex(soModule: SceneObjectModule, toIndex: number): boolean;
    /**
     * 设置已拥有的模块到指定位置-根据模块编号
     * @param moduleID 已拥有的模块的编号
     * @param toIndex 设置到达指定的位置
     * @return [boolean] 是否成功
     */
    setModuleIndexByID(moduleID: number, toIndex: number): boolean;
    /**
     * 调整模块位置
     * @param fromIndex 模块的原始位置
     * @param toIndex 模块的新位置
     * @return [boolean] 是否成功
     */
    setModuleIndexByIndex(fromIndex: number, toIndex: number): boolean;
    /**
     * 获取已拥有的模块-根据模块编号
     * @param moduleID 模块编号
     * @return [SceneObjectModule] 返回拥有的该模块，如果未拥有则返回null
     */
    getModule(moduleID: number): SceneObjectModule;
    /**
     * 获取已拥有的模块-根据模块名称
     * @param moduleName 模块名称
     * @return [SceneObjectModule] 返回拥有的该模块，如果未拥有则返回null
     */
    getModuleByName(moduleName: string): SceneObjectModule;
    /**
     * 获取已拥有的模块-根据模块位置
     * @param index 模块位置
     * @return [SceneObjectModule] 返回拥有的该模块，如果未拥有则返回null
     */
    getModuleAt(index: number): SceneObjectModule;
    /**
     * 获取已拥有的模块的位置
     * @param soModule 模块
     * @return [number] 已拥有的该模块的位置，如果未拥有则返回-1
     */
    getModuleIndex(soModule: SceneObjectModule): number;
    /**
     * 获取已拥有的模块位置-根据模块的编号
     * @param moduleID 模块编号
     * @return [number] 已拥有的该模块的位置，如果未拥有则返回-1
     */
    getModuleIndexByID(moduleID: number): number;
    /**
     * 获取所有模块的数目
     * @return [number] 模块的数目
     */
    get moduleLength(): number;
}