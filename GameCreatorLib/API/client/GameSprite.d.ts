/**
 * 游戏精灵类
 * 各种高级显示对象的基类（子类包含Avatar、Animation、各种UI控件等）
 * -- 滤镜叠加实现（即父子级滤镜不会被覆盖而是叠加）
 * -- 色调（R+,B+,G+,GRAY,Rx,Gx,Bx）
 * -- 色相（采用ColorMatrix）
 * Created by 黑暗之神KDS on 2019-02-01 02:34:59.
 */
declare class GameSprite extends Sprite {
    /**
     * 事件：当销毁前派发的事件
     * <code>
     * // 创建对象
     * var sp = new GameSprite();
     * // 监听当销毁时事件
     * sp.once(GameSprite.ON_DISPOSE,this,()=>{
     *   // to do
     * });
     * // 销毁该对象
     * sp.dispose();
     * </code>
     */
    static ON_DISPOSE: string;
    /**
     * 唯一ID
     */
    objectID: number;
    /**
     * 是否已释放
     */
    isDisposed: boolean;
    /**
     * 装载的自定义数据，此外作为List的项显示对象界面时，该变量会记录其对应的UIListItemData
     */
    data: any;
    /**
     * 透明度 最终透明度alpha = opacity * dpOpacity * opacityPer(目前仅用于编辑器内)
     */
    opacity: number;
    /**
     * 旋转度1 最终旋转度rotation = rotation1 + rotation2 默认值=0
     */
    rotation1: number;
    /**
     * 旋转度2 最终旋转度rotation = rotation1 + rotation2 默认值=0
     */
    rotation2: number;
    /**
     * 是否允许使用滤镜（允许使用时材质效果才会生效） 默认值 = true
     */
    filterEnabled: boolean;
    /**
     * 更改色调
     * @param r 红色+ -255~255
     * @param g 绿色+ -255~255
     * @param b 蓝色+ -255~255
     * @param gray 灰度 0-100
     * @param mr [可选] 默认值=1 0~5
     * @param mg [可选] 默认值=1 0~5
     * @param mb [可选] 默认值=1 0~5
     */
    setTonal(r: number, g: number, b: number, gray: number, mr?: number, mg?: number, mb?: number): void;
    /**
     * 获取色调参数：r g b gray mr mg mb
     */
    getTonal(): number[];
    /**
     * 色相 -180~180
     * 内部使用色调滤镜实现
     */
    hue: number;
    /**
     * 模糊度 0~N
     * 内部使用模糊滤镜实现
     */
    blur: number;
    /**
     * 不可用状态，将禁用鼠标响应并且调整为灰度
     */
    disabled: boolean;
    /**
     * 是否继承于指定的对象
     * @param sp 指定的对象
     */
    isInherit(sp: TreeNode): boolean;
    useDPCoord: boolean;
    /**
     * 深度坐标系：水平坐标
     */
    dpX: number;
    /**
     * 深度坐标系：垂直坐标
     */
    dpY: number;
    /**
     * 深度坐标系：深度，该值与相机深度的距离决定实际显示效果，如近大远小
     */
    dpZ: number;
    /**
     * 深度坐标系：高度（像素）
     */
    dpWidth: number;
    /**
     * 深度坐标系：宽度（像素）
     */
    dpHeight: number;
    /**
     * 深度坐标系：透明度，最终透明度会乘以这个值
     */
    dpOpacity: number;
    /**
     * 深度坐标系：水平缩放比例 默认值=1 表示100%
     */
    dpScaleX: number;
    /**
     * 深度坐标系：垂直缩放比例 默认值=1 表示100%
     */
    dpScaleY: number;
    /**
     * 是否使用缩放模式，图片一般更改尺寸，而界面、动画、立绘则一般更改缩放倍率
     */
    useDPCoordScaleMode: boolean;
    /**
     * 显示优先度，用于同深度dpZ时区分显示，越大，显示在越前面
     */
    dpDisplayPriority: number;
    /**
     * 根据【深度坐标】计算并设置【实际坐标】
     * 由项目上层实现
     * 如更改了dpX、dpY、dpWidth、dpHeight，根据当前深度dpZ以及镜头设置实际的x、y、width、height（或scaleX、scaleY）
     */
    dpCoordToRealCoord(): void;
    /**
     * 根据【实际的坐标】转换为【深度坐标】
     * 由项目上层实现
     * 如更改了x、y、width、height后想要获取其对应当前深度下的dpX、dpY、dpWidth、dpHeight（或dpScaleX、dpScaleY）
     * @param calcCoord 是否计算坐标，若计算则会转换并将dpX和dpY设置为转换值
     * @param calcSize 是否计算尺寸，若计算则会转换并将dpWidth和dpHeight设置为转换值(useDPCoordScaleMode模式下则是dpScaleX和dpScaleY)
     * @return [any] 返回 { dpX: number, dpy: number, dpScaleX: number, dpScaleY: number, dpWidth: number, dpHeight: number }
     */
    realCoordToDPCoord(calcCoord: boolean, calcSize: boolean): any;
    /**
     * 用于项目层实现深度坐标系代码用变量：脏标记
     */
    _dpDirty: boolean;
    /**
     * 用于项目层实现深度坐标系代码用变量：相机水平坐标
     */
    _dpCameraX: number;
    /**
     * 用于项目层实现深度坐标系代码用变量：相机垂直坐标
     */
    _dpCameraY: number;
    /**
     * 用于项目层实现深度坐标系代码用变量：相机深度坐标
     */
    _dpCameraZ: number;
    /**
     * 用于项目层实现深度坐标系代码用变量：图片实际尺寸宽度
     */
    _dpTextureWidth: number;
    /**
     * 用于项目层实现深度坐标系代码用变量：图片实际尺寸高度
     */
    _dpTextureHeight: number;
    /**
     * 安装材质数据
     * @param materialData  类型 { materials: MaterialData[] }[]
     * @param resetTime [可选] 默认值=true 是否重置材质数据内的过渡时间
     */
    installMaterialData(materialData: any, resetTime?: boolean): void;
    /**
     * 获取当前拥有的全材质数据，可用于储存，同时可使用 installMaterialData 安装该材质数据
     * @return { materials: MaterialData[] }[]
     */
    getAllMaterialDatas(): any[];
    /**
     * 添加材质，根据材质数据
     * @param material 材质数据
     * @param passage [可选] 默认值=0 所在的通道
     * @return [boolean] 是否成功
     */
    addMaterial(materialData: MaterialData, passage?: number): boolean;
    /**
     * 添加材质到指定的位置上，根据材质数据
     * @param material 材质数据
     * @param index 位置
     * @param passage [可选] 默认值=0 所在的通道
     * @return [boolean] 是否成功
     */
    addMaterialAt(materialData: MaterialData, index: number, passage?: number): boolean;
    /**
     * 添加材质，根据材质ID，材质参数使用默认值
     * @param material 材质数据
     * @param passage [可选] 默认值=0 所在的通道
     * @return [boolean] 是否成功
     */
    addMaterialByID(materialID: number, passage?: number): boolean;
    /**
     * 添加材质，根据材质ID，材质参数使用默认值
     * @param material 材质数据
     * @param index 位置
     * @param passage [可选] 默认值=0 所在的通道
     * @return [boolean] 是否成功
     */
    addMaterialAtByID(materialID: number, index: number, passage?: number): boolean;
    /**
     * 移除材质，根据材质数据，如若该数据已存在里面则会被移除
     * @param materialData 材质数据
     * @param passage [可选] 默认值=0 所在的通道
     * @return [boolean] 是否成功
     */
    removeMaterial(materialData: MaterialData, passage?: number): boolean;
    /**
     * 移除材质，根据材质所在的位置
     * @param index 材质数据所在的位置索引
     * @param passage [可选] 默认值=0 所在的通道
     * @return [boolean] 是否成功
     */
    removeMaterialAt(index: number, passage?: number): boolean;
    /**
     * 移除材质，根据材质ID
     * @param materialID 材质数据ID
     * @param passage [可选] 默认值=0 所在的通道
     * @return [boolean] 是否成功
     */
    removeMaterialByID(materialID: number, passage?: number): boolean;
    /**
     * 获取材质数据，根据ID
     * @param materialID 材质数据ID
     * @param passage [可选] 默认值=0 所在的通道
     * @return [MaterialData] 材质数据
     */
    getMaterialByID(materialID: number, passage?: number): MaterialData;
    /**
     * 获取材质数据，根据位置索引
     * @param index 所在的位置索引
     * @param passage [可选] 默认值=0 所在的通道
     * @return [MaterialData] 材质数据
     */
    getMaterialAt(index: number, passage?: number): MaterialData;
    /**
     * 获取指定通道内的材质数据总数
     * @param passage [可选] 默认值=0 所在的通道
     * @return [number]
     */
    getMaterialLength(passage?: number): number;
    /**
     * 获取材质通道总数
     * @return [number]
     */
    getMaterialPassLength(): number;
    /**
     * 清空所有材质
     */
    clearMaterials(): void;
    /**
     * 清空指定通道里的材质
     * @param passage 所在的通道
     * @param deletePass 删除通道
     */
    clearMaterialsInPass(passage: number, deletePass?: boolean): void;
    /**
     * 更换同一个通道内的材质位置
     * @param material 材质数据
     * @param toIndex 所在的位置索引
     * @param passage [可选] 默认值=0 所在的通道
     * @return [boolean] 是否更换成功
     */
    setMaterialIndex(material: MaterialData, toIndex: number, passage?: number): boolean;
    /**
     * 更换材质位置
     * @param fromIndex 材质所在的原始位置
     * @param toIndex 材质需要更换至的新位置
     * @param passage [可选] 默认值=0 所在的通道
     * @return [boolean] 是否更换成功
     */
    swapMaterialIndex(fromIndex: number, toIndex: number, passage?: number): boolean;
    /**
     * 更换通道顺序，通道顺序影响渲染先后顺序
     * @param passFromIndex 材质通道所在的原始位置
     * @param passToIndex 材质通道需要更换至的新位置
     * @return [boolean] 是否更换成功
     */
    swapMaterialPass(passFromIndex: number, passToIndex: number): boolean;
    /**
     * 设置为指定的GameSprite相同的材质
     * @param gameSprite 指定的参考GameSprite
     * @param cloneMode 是否克隆模式，如果是则表示使用克隆的方式复制材质数据（MaterialData），否则是引用
     */
    setMaterialsByGameSprite(gameSprite: GameSprite, cloneMode: boolean): void;
    /**
     * 调用此函数表示更改了材质，让系统根据最新的材质计算来进行渲染
     * 通常情况下无需主动调用此函数，但如果修改了MaterialData内部的数据的话可调用该函数让对象刷新
     */
    setMaterialDirty(): void;
    /**
     * 调用此函数快速设置传递给shader的值，比直接修改材质后调用setMaterialDirty效率要更高一些，减少了数据的转换计算。
     * 比如需要帧刷只更新少数几个数值时可以调用该函数进行优化计算。
     *
     * 【关于变量名】
     * -- 变量名规格：mu材质编号_变量属性
     *
     * 【关于值】
     * -- number 类型的属性直接设置
     * -- 颜色属性请设置为 [r,g,b] 其中r/g/b取值范围为0~1
     * -- 不支持贴图设置，更改贴图仍然需要
     *
     * 【materialValues参数规格】
     * {
     *    mu2_abc: 1,
     *    mu3_color: [0.5,0.5,1]
     * }
     *
     * @param materialValues 需要更新的材质数据
     * @param passage [可选] 默认值=0 所在的通道
     */
    setMaterialValueFast(materialValues: any, passage?: number): void;
}
