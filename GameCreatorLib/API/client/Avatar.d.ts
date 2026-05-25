/**
 * 行走图显示对象
 * 通过动作、部位、方向、帧来显示当前的图像
 * -- 支持的方向：1方向、2方向、3方向、4方向、5方向、8方向，其中1、3、5方向素材会自动水平翻转以便节约素材使用
 * -- 支持辅助体，以便项目层可视化制作动画击中点、不同方向弹道发射点等辅助用的数据
 * -- 支持换部件（换装）
 * -- 支持的通用事件：EventObject.LOADED
 * -- 方向系统参考小键盘以5为中心面向其他数字的方向： 1-左下 2-下 3-右下 4-左 6-右 7-左上 8-上 9-右上
 *    7 8 9
 *    4 5 6
 *    1 2 3
 *
 * 使用方式：
 * var a = new Avatar();
 * a.id = 5;
 *
 * 相关事件
 *  EventObject.LOADED 资源加载完成时候事件
 *  Avatar.ACTION_PLAY_COMPLETED 动作播放完毕时
 *  Avatar.CHANGE_ACTION 更改动作时 参数1：更改前的动作ID  参数2：更改后的动作ID
 *  Avatar.RENDER 当确实到达了新的一帧后派发，本体如果没有实际的帧则不派发
 *
 * Created by 黑暗之神KDS on 2018-12-06 01:05:11.
 */
declare class Avatar extends GameSprite {
    /**
     * 事件：动作播放完毕事件，每当该动作播放完一次则抛出此事件，只有最后一帧确实按照帧率播放完毕了才抛出事件
     * <code>
     * var a = new Avatar();
     * a.id = 5;
     * a.on(Avatar.ACTION_PLAY_COMPLETED,this,()=>{
     *     // to do
     * });
     * </code>
     */
    static ACTION_PLAY_COMPLETED: string;
    /**
     * 事件：每当更换动作时派发
     * onChangeAction(lastActID:number,nowActID:number); lastActID=更改前的动作ID nowActID=更改后的动作ID
     * <code>
     * var a = new Avatar();
     * a.id = 5;
     * a.on(Avatar.CHANGE_ACTION,this,(lastActID:number,nowActID:number)=>{
     *     // to do
     * });
     * a.actionID = 2;
     * </code>
     */
    static CHANGE_ACTION: string;
    /**
     * 事件：执行 onRender 时派发，当到达了新的一帧后派发该事件
     * <code>
     * var a = new Avatar();
     * a.id = 5;
     * a.on(Avatar.RENDER,this,()=>{
     *     // to do
     * });
     * </code>
     */
    static RENDER: string;
    /**
     * AVATAR唯一ID，对应编辑器中的预设制作数据ID，设置后当资源载入完毕后会抛出EventObject.LOADED
     * <code>
     * var a = new Avatar();
     * a.on(EventObject.LOADED,this,()=>{
     *     // to do
     * });
     * a.id = 5;
     * </code>
     */
    id: number;
    /**
     * 同步加载，当资源存在时，当前帧则立刻显示，默认为true
     * 为了确保能够监听到EventObject.LOADED事件，建议在设置id之前监听该事件
     */
    syncLoadWhenAssetExist: boolean;
    /**
     * 预渲染：开启此项保证在派发EventObject.LOADED前预先渲染一次以便保证此后能够立即呈现画面，不会因为资源较大而首次渲染卡顿一下
     *        预渲染会消耗一定的性能，可以选择在行走图资源较大较多的情况下使用此项，开启此项会有额外的性能和内存开销
     */
    prerender: boolean;
    /**
     * 方向模式 1 2 3 4 5 8 其中1、3、5会自动镜像翻转，来自编辑器中预设
     */
    get oriMode(): number;
    /**
     * 获取是否处于播放中
     */
    get isPlaying(): boolean;
    /**
     * 获取是否处于加载中，设置id后如果资源未能加载完成则该状态为true
     */
    get isLoading(): boolean;
    /**
     * 帧率：每秒播放的帧数，比如fps=12则表示每秒播放12帧
     */
    fps: number;
    /**
     * 固定朝向，开启此项后忽略更换朝向的请求，即设置orientation无效
     */
    fixedOrientation: boolean;
    /**
     * 辅助体 id => Helper 默认值={}
     * 可以使用编辑器预设的各种辅助体信息来制作项目层的一些逻辑
     */
    refObjs: {
        [id: number]: Helper;
    };
    /**
     * 辅助体模式 
     * 0-统一模式 该模式下的辅助体统一为一个 
     * 1-逐帧模式 该模式下的辅助体每一帧都是单独存在的
     */
    helperType: number;
    /**
     * 使用到的全部图集，AvatarFrameImage中的index即对应该数组的位置 默认值=[]
     */
    picUrls: string[];
    /**
     * 当前的帧图（如有）
     */
    currentFrameImage: AvatarFrameImage;
    /**
     * 设置和获取当前帧：例如1则表示第一帧
     */
    currentFrame: number;
    /**
     * 总帧数（根据当前动作-方向来计算）
     */
    get totalFrame(): number;
    /**
     * 根节点：部件可以使用此项获得自己的根节点，根节点的该属性是根节点自身
     */
    topAvatar: Avatar;
    /**
     * 设置朝向，参考小键盘方向，以5为中心面向其他数字的方向：1-左下 2-下 3-右下 4-左 6-右 7-左上 8-上 9-右上
     * 设置一个无效的朝向将忽略此次更改
     * 7 8 9
     * 4 5 6
     * 1 2 3
     */
    orientation: number;
    /**
     * 设置动作，根据索引，设置一个无效的动作将忽略此次更改
     * @param index 动作索引
     */
    actionIndex: number;
    /**
     * 设置动作，根据动作ID，设置一个无效的动作将忽略此次更改
     * @param id 动作ID
     */
    actionID: number;
    /**
     * 获取动作列表，必须加载完成才能够获取
     */
    get actionList(): AvatarAction[];
    /**
     * 根据自身中线对齐模式，启用后部件在该行走图因方向自动水平翻转时根据该行走图的中线对齐而非各自的中线
     */
    selfCenterlineAlignMode: boolean;
    /**
     * 强制水平翻转
     */
    forceFlip: boolean;
    /**
     * 是否存在动作
     * @param actionID 存在的动作ID
     * @return [boolean]
     */
    hasActionID(actionID: number): boolean;
    /**
     * 添加部位，根据部件对象，如果该部位已存在则忽略
     * 需要该行走图加载完毕后才允许使用
     * 添加进来的部件无需手动卸载
     * @param partID 部位ID
     * @param part 部件
     * @param partIndex [可选] 默认值=-1 插入的位置，默认值-1表示自动插入至最上层
     * @return [boolean] 是否添加成功
     */
    addPartByAvatar(partID: number, part: Avatar, partIndex?: number): boolean;
    /**
     * 添加部位：根据指定的部件对应的数据库ID，如果该部位已存在则忽略
     * 需要该行走图加载完毕后才允许使用
     * 添加进来的部件无需手动卸载
     * @param partID 部位ID
     * @param avatarID 部件对应的数据库ID
     * @param partIndex [可选] 默认值=-1 插入的位置，默认值-1表示自动插入至最上层
     * @return [boolean] 是否添加成功
     */
    addPartByID(partID: number, avatarID: number, partIndex?: number): boolean;
    /**
     * 移除部位：根据指定的部位ID
     * 需要该行走图加载完毕后才允许使用
     * 可选择是否卸载的参数，「如果未选择自动卸载则需要手动卸载」
     * @param partID 部位ID
     * @param disposeOldPart [可选] 默认值=true 是否卸载旧部件，如果设置为false则要自行手动卸载
     * @return [Avatar] 部件
     */
    removePartByPartID(partID: number, disposeOldPart?: boolean): Avatar;
    /**
     * 移除部位：根据部件对象
     * 需要该行走图加载完毕后才允许使用
     * 可选择是否卸载的参数，「如果未选择自动卸载则需要手动卸载」
     * @param part 部件
     * @param disposeOldPart [可选] 默认值=true 是否卸载旧部件，如果设置为false则要自行手动卸载
     * @return [boolean] 是否移除成功
     */
    removePartByAvatar(part: Avatar, disposeOldPart?: boolean): boolean;
    /**
     * 更换部位：根据新的部件和部位ID
     * 需要该行走图加载完毕后才允许使用
     * 新部件会自动继承原部件的设定（如位置、缩放、色调、透明度等设定）
     * 原部件会自动卸载
     * @param newPart 新的部件
     * @param partID 部位ID
     * @return [boolean]
     */
    changePartByAvatar(newPart: Avatar, partID: number): boolean;
    /**
     * 更换部位：根据新的部件对应的数据库ID和部位ID
     * 需要该行走图加载完毕后才允许使用
     * 新部件会自动继承原部件的设定（如位置、缩放、色调、透明度等设定）
     * 原部件会自动卸载
     * @param newAvatarID 新的部件对应的数据库ID
     * @param partID 部位ID
     * @return [boolean]
     */
    changePartByAvatarID(newAvatarID: number, partID: number): boolean;
    /**
     * 获取部位：根据部位ID
     * 需要该行走图加载完毕后才允许使用
     * @param partID 部位ID
     * @return [Avatar] 部件
     */
    getPartByPartID(partID: number): Avatar;
    /**
     * 根据部件所在的位置索引获取部件
     * 需要该行走图加载完毕后才允许使用
     * @param partIndex 部件所在的索引（索引范围0~PartLength-1）
     * @return [Avatar] 部件
     */
    getPartAt(partIndex: number): Avatar;
    /**
     * 根据部位对应的数据库ID获取部件
     * 需要该行走图加载完毕后才允许使用
     * @param avatarID 部件对应的数据库ID
     * @return [Avatar] 部件，不存在则返回null
     */
    getPartByID(avatarID: number): Avatar;
    /**
     * 根据部件获取所在的索引
     * 需要该行走图加载完毕后才允许使用
     * @param avatar 部件
     * @return [number] 索引范围0~PartLength-1，不存在则返回-1
     */
    getPartIndex(avatar: Avatar): number;
    /**
     * 返回部位的个数（包含本体，如果只有本体则返回1）
     * 需要该行走图加载完毕后才允许使用
     */
    get PartLength(): number;
    /**
     * 跳转某帧进行播放，越界会自动取模（如帧长度10，播放13则是播放3）
     * @frame [可选] 跳转的帧数，默认帧=1，1表示第一帧
     */
    gotoAndPlay(frame?: number): void;
    /**
     * 在当前帧数开始播放
     */
    play(): void;
    /**
     * 停止播放
     * @param frame [可选] 默认值=0 指定停留的帧数
     */
    stop(frame?: number): void;
    /**
     * 像素级点击碰触检测
     * @param stageX 相对舞台的坐标x
     * @param stageY 相对舞台的坐标y
     * @return [boolean] 是否点击中
     */
    hitTestPoint(stageX: number, stageY: number): boolean;
    /**
     * 渲染（通常情况下无需主动调用）
     * @chancelai autoPlay [可选] 默认值=true 自动推进播放
     * @chancelai useMapping [可选] 默认值=true 表示遇到没有的朝向和帧使用映射值
     * @chancelai playFrame [可选] 默认值=null 指定播放帧
     * @chancelai sendEvent [可选] 默认值=true 派发事件
     * @chancelai forceRender [可选] 默认值=false 强制渲染，表示无论是否处于等待间隔中都将进行渲染
     */
    onRender(autoPlay: boolean, useMapping: boolean, playFrame: number, sendEvent: boolean, forceRender: boolean): boolean;
}
