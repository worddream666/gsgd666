/**
 * 资源管理器
 * 采用引用计数方式缓存资源，一旦引用计数为0时则会自动释放实际的资源
 * 基础资源包含：Image资源、Audio资源、JSON资源、Text资源、ArrayBuffer资源
 *
 *【系统规则】
 * -- 高级显示对象包含多种基础资源，在创建这些高级显示对象会根据内部关联到基础资源自动增加引用，而释放对象时会减少引用，高级显示对象包含：
 *    -- Avatar/StandAvatar 行走图/立绘
 *    -- GCAnimation 动画
 *    -- ClientScene 客户端场景
 *    -- ClientSceneObject 客户端场景对象
 *    -- UIxxx 各种界面组件（包括整体界面 GUI_XXX）
 *    -- 由项目层自行增加的高级显示对象等等
 *
 * -- 预加载高级资源，如果未设置自动释放的话，需要手动释放，否则会一直引用这些资源导致无法被自动释放。
 *    根据编辑器预设的配置进行载入相关的基础资源，而卸载也是根据编辑器预设的配置进行卸载相关的基础资源（与实际用到的场景动态更换了内部的资源无关）。
 *    主要用于预占用资源，以便在此期间不会被系统自动释放掉，比如设计在进入游戏场景前预载入一些资源，到进入下一个场景前再释放，以便在该场景内不会被系统自动释放掉
 *    预加载接口包含--预加载高级资源（每个高级资源包含若干的基础资源）：自行加载的需要自行卸载
 *    -- 预加载场景 preLoadSceneAsset                 ==> 卸载场景 disposeScene
 *    -- 预加载场景对象 preLoadSceneObjectAsset       ==> 卸载场景对象 disposeSceneObject
 *    -- 预加载行走图资源 preLoadAvatarAsset          ==> 卸载行走图资源 disposeAvatarAsset
 *    -- 预加载立绘资源 preLoadStandAvatarAsset       ==> 卸载立绘资源 disposeStandAvatarAsset
 *    -- 预加载动画资源 preLoadAnimationAsset         ==> 卸载动画资源 disposeAnimationAsset
 *    -- 预加载界面资源 preLoadUIAsset                ==> 卸载界面资源 disposeUIAsset
 *    -- 预加载对话框资源 preLoadDialog               ==> 卸载对话框资源 disposeDialog
 *    -- 预加载事件页中涉及的资源 preLoadCommandPage   ==> 卸载事件页中涉及的资源 disposeCommandPage
 *
 * -- 预加载接口包含--预加载基础资源：自行加载的需要自行卸载
 *    -- 加载图片（解析为Object） loadImage                     ==> 释放图片 disposeImage
 *    -- 加载Json文件（解析为Object） loadJson                  ==> 释放Json文件 disposeJson
 *    -- 加载文本文件（解析为字符串） loadText                   ==> 释放文本文件 disposeText
 *    -- 加载原始文件（解析为ArrayBuffer） loadFileArrayBuffer  ==> 释放原始文件 disposeFileArrayBuffer
 *    -- 加载音频 loadAudio                                   ==> 卸载音频 disposeAudio
 *
 * -- 图像系统中使用到的资源
 *    -- 「显示图片/动画/立绘」：通道被覆盖时上一个占用通道的资源会被释放（减少引用），新资源会增加引用，如显示3号动画在1号通道里，然后再显示2号立绘在1号通道里，此前的3号动画就会被释放
 *       为了防止常用的图片显示等效果被中途系统自动将图片卸载了，可以预加载这些图片先占用引用。
 *       比如场景相关事件可勾选场景的“预加载事件页中涉及的资源”，以保证在该场景中执行这些图片效果中途不会被系统卸载，同时切换场景后会自动释放掉这些资源
 *      （如果新场景仍然用到了这些资源又会再次被引用到而导致不会被系统卸载）。
 *    -- 「消除」：将当前指定通道的资源释放掉，比如当前使用了3号动画，则3号动画引用减1，如果全局没有任何用到了3号动画时（此时引用为0）则会被系统实际回收，
 *                下次未预加载就直接使用时可能会由于动态加载该资源导致一小段时间未能显示出来（因为处于加载中，需要一点时间）。
 *
 * -- 对话框中使用到的头像资源
 *    -- 在每次对话启动时会创建头像资源（引用+1），然后停止对话时会释放掉头像资源（引用-1），此时如果全局未有任何引用的话会被系统实际回收，
 *       若不想在某段期间内被系统实际回收，可以提前预加载这些头像资源。
 *
 * 【总结】
 *    -- 自行创建的对象需要自行销毁（gameObject.dispose）
 *    -- 自行预加载的资源需要自行销毁（AssetManager.disposeXXX）
 *
 * 【示例1：自行创建的高级对象，自行销毁】
 *    // 创建一个3号行走图实例，系统识别为引用了3号行走图相关的一些基础资源（引用+1）
 *    var a = new Avatar;
 *    a.id = 3;
 *    // 释放掉这个实例，只有调用释放后这些被增加引用的基础资源才会减少引用，以便让系统自动回收资源（引用-1）
 *    a.dispose();
 *
 *    // 创建2号界面
 *    var b = new GUI_2;
 *    // 卸载2号界面
 *    b.dispose();
 *
 * 【示例2：预加载资源，在一定期间内不会被系统释放，当使用完毕后再手动卸载】
 *    // 预加载3号行走图（引用+1） 此时3号行走图的引用=1
 *    AssetManager.preLoadAvatarAsset(3, Callback.New(()=>{
 *       // 使用行走图（引用+1） 此时3号行走图的引用=2
 *       var a = new Avatar;
 *       a.id = 3;
 *       // 60秒后
 *       setTimeout(()=>{
 *          // 卸载行走图（引用-1） 此时3号行走图的引用=1
 *          a.dispose();
 *          // 卸载掉预加载的3号行走图占用（引用-1） 此时3号行走图的引用=0 系统会自动回收
 *          AssetManager.disposeAvatarAsset(3);
 *       },60*1000);
 *    }));
 *
 *
 *
 * Created by 黑暗之神KDS on 2018-08-08 16:28:46.
 */
declare class AssetManager {
    /**
     * 全部资源引用计数 url(资源地址):引用计数 默认值={}
     */
    static assetCountMap: {
        [url: string]: number;
    };
    /**
     * 释放资源的间隔ms（当引用计数为0时会延迟清理资源，因为最近可能还会频繁用到） 默认值=6000ms（60秒）
     */
    static disposeInterval: number;
    /**
     * 预加载加载场景资源，如果autoDispose为false的话则需要手动卸载：AssetManager::disposeScene
     * -- 场景的相关JSON文件
     * -- 如勾选预载地图资源：预载入地图资源：图层的图片、图块的图片、BGM、BGS
     * -- 如勾选预载全场景对象资源：预载入全场景对象资源（仅单机版可用）
     * -- 如勾选预载场景事件涉及的资源：预载入场景触发的事件页中的资源 参考 preLoadCommandPage 方法（仅单机版可用）
     * -- 预设的自定义预加载资源列表
     * @param id 场景ID
     * @param complete [可选] 默认值=null
     * @param syncCallbackWhenAssetExist [可选] 默认值=false 当资源存在时同步回调，否则需要等待一帧（异步回调）
     * @param autoDispose [可选] 默认值=false 是否自动释放资源（加载后会在延迟一段时间后自动释放，用于减少引用计数）
     * @param prerender [可选] 默认值=false 是否预渲染图片资源，保证完成回调后使用时不会因为渲染而卡顿，一般资源较大时可以尝试开启此项，开启此项会有额外的性能和内存开销
     */
    static preLoadSceneAsset(id: number, complete?: Callback, syncCallbackWhenAssetExist?: boolean, autoDispose?: boolean, prerender?: boolean): void;
    /**
     * 预加载场景对象资源，如果autoDispose为false的话则需要手动卸载：AssetManager::disposeSceneObject
     * -- 根据自定义显示对象层（行走图、界面、动画）来加载其下所有资源
     * @param so 场景对象数据
     * @param complete [可选] 默认值=null
     * @param syncCallbackWhenAssetExist [可选] 默认值=false 当资源存在时同步回调，否则需要等待一帧（异步回调）
     * @param autoDispose [可选] 默认值=false 是否自动释放资源（加载后会在延迟一段时间后自动释放，用于减少引用计数）
     * @param prerender [可选] 默认值=false 是否预渲染图片资源，保证完成回调后使用时不会因为渲染而卡顿，一般资源较大时可以尝试开启此项，开启此项会有额外的性能和内存开销
     */
    static preLoadSceneObjectAsset(so: SceneObject, complete?: Callback, syncCallbackWhenAssetExist?: boolean, autoDispose?: boolean, prerender?: boolean): void;
    /**
     * 预加载行走图数据，如果autoDispose为false的话则需要手动卸载： AssetManager::disposeAvatarAsset
     * @param id 行走图ID
     * @param complete [可选] 默认值=null
     * @param syncCallbackWhenAssetExist [可选] 默认值=false 当资源存在时同步回调，否则需要等待一帧（异步回调）
     * @param autoDispose [可选] 默认值=true 是否自动释放资源（加载后会在延迟一段时间后自动释放，用于减少引用计数）
     * @param isStandAvatar [可选] 默认值=false 是否是立绘资源
     * @param prerender [可选] 默认值=false 是否预渲染图片资源，保证完成回调后使用时不会因为渲染而卡顿，一般资源较大时可以尝试开启此项，开启此项会有额外的性能和内存开销
     */
    static preLoadAvatarAsset(id: number, complete?: Callback, syncCallbackWhenAssetExist?: boolean, autoDispose?: boolean, prerender?: boolean): void;
    /**
     * 预加载立绘数据，如果autoDispose为false的话则需要手动卸载： AssetManager::disposeStandAvatarAsset
     * @param id 立绘资源ID
     * @param complete [可选] 默认值=null
     * @param syncCallbackWhenAssetExist [可选] 默认值=false 当资源存在时同步回调，否则需要等待一帧（异步回调）
     * @param autoDispose [可选] 默认值=false 是否自动释放资源（加载后会在延迟一段时间后自动释放，用于减少引用计数）
     * @param prerender [可选] 默认值=false 是否预渲染图片资源，保证完成回调后使用时不会因为渲染而卡顿，一般资源较大时可以尝试开启此项，开启此项会有额外的性能和内存开销
     */
    static preLoadStandAvatarAsset(id: number, complete?: Callback, syncCallbackWhenAssetExist?: boolean, autoDispose?: boolean, prerender?: boolean): void;
    /**
     * 预加载界面，如果autoDispose为false的话则需要手动卸载：AssetManager::disposeUIAsset
     * @param id 界面ID
     * @param complete [可选] 默认值=null
     * @param syncCallbackWhenAssetExist [可选] 默认值=false 当资源存在时同步回调，否则需要等待一帧（异步回调）
     * @param autoDispose [可选] 默认值=false 是否自动释放资源（加载后会在延迟一段时间后自动释放，用于减少引用计数）
     * @param prerender [可选] 默认值=false 是否预渲染图片资源，保证完成回调后使用时不会因为渲染而卡顿，一般资源较大时可以尝试开启此项，开启此项会有额外的性能和内存开销
     */
    static preLoadUIAsset(id: number, complete?: Callback, syncCallbackWhenAssetExist?: boolean, autoDispose?: boolean, prerender?: boolean): void;
    /**
     * 预加载动画，如果autoDispose为false的话则需要手动卸载：AssetManager::disposeAnimationAsset
     * @param id 动画ID
     * @param complete [可选] 默认值=null
     * @param syncCallbackWhenAssetExist [可选] 默认值=false 当资源存在时同步回调，否则需要等待一帧（异步回调）
     * @param autoDispose [可选] 默认值=false 是否自动释放资源（加载后会在延迟一段时间后自动释放，用于减少引用计数）
     * @param prerender [可选] 默认值=false 是否预渲染图片资源，保证完成回调后使用时不会因为渲染而卡顿，一般资源较大时可以尝试开启此项，开启此项会有额外的性能和内存开销
     */
    static preLoadAnimationAsset(id: number, complete?: Callback, syncCallbackWhenAssetExist?: boolean, autoDispose?: boolean, prerender?: boolean): void;
    /**
    * 预加载事件页中包含的资源，如果autoDispose为false的话则需要手动卸载：AssetManager::disposeCommandPage
    * （目前仅单机版可用，网络版事件是在服务端执行的，客户端无法获取事件的数据）
    * （仅支持系统内核的事件，如果有需要加载到自定义指令中的资源支持重写来扩展该方法）
    * -- 对话和选项事件：带有的对话框样式和头像资源
    * -- 设置对象行为事件：行走图资源
    * -- 图像系统事件：图片、动画、界面、立绘、音效、对话框样式
    * -- 音频事件：BGM-背景音乐、BGS-环境音效、SE-音效
    * -- 界面事件: 界面
    * -- 自定义事件：需要项目层自行追加相关逻辑，比如可以重写此方法以追加逻辑
    *
    * @param commandPage 事件页数据
    * @param complete [可选] 默认值=null 完成时回调
    * @param syncCallbackWhenAssetExist [可选] 默认值=false 当资源存在时同步回调，否则需要等待一帧（异步回调）
    * @param autoDispose [可选] 默认值=false 是否自动释放资源（加载后会在延迟一段时间后自动释放，用于减少引用计数）
    */
    static preLoadCommandPage(commandPage: CommandPage, complete?: Callback, syncCallbackWhenAssetExist?: boolean, autoDispose?: boolean): void;
    /**
    * 预加载对话框样式的相关资源，如果autoDispose为false的话则需要手动卸载：AssetManager::disposeDialog
    * @param id 对话框样式ID
    * @param complete [可选] 默认值=null 完成时回调
    * @param syncCallbackWhenAssetExist [可选] 默认值=false 当资源存在时同步回调，否则需要等待一帧（异步回调）
    * @param autoDispose [可选] 默认值=false 是否自动释放资源（加载后会在延迟一段时间后自动释放，用于减少引用计数）
    */
    static preLoadDialog(id: number, complete?: Callback, syncCallbackWhenAssetExist?: boolean, autoDispose?: boolean): void;
    /**
     * 预加载所有在编辑器中预设的字体（来自设置中的「文件字体导入管理」）
     * @param complete [可选] 默认值=null 加载完成回调
     * @param syncCallbackWhenAssetExist [可选] 默认值=false 当资源存在时同步回调，否则需要等待一帧（异步回调）
     */
    static preloadFonts(complete?: Callback, syncCallbackWhenAssetExist?: boolean): void;
    /**
     * 预加载指定的字体文件
     * @param fontUrl 如 asset/xxx.ttf
     * @param complete [可选] 默认值=null 加载完成回调
     * @param syncCallbackWhenAssetExist [可选] 默认值=false 当资源存在时同步回调，否则需要等待一帧（异步回调）
     */
    static preloadFont(fontUrl: string, complete?: Callback, syncCallbackWhenAssetExist?: boolean): void;
    /**
     * 批量加载高级资源
     * @param onFin 当加载完成时回调
     * @param onProgress [可选] 默认值=null 加载进度回调 onProgress(current:number,count:number); 当前加载数,加载总数
     * @param images [可选] 默认值=[] 需要加载的图片路径集
     * @param scenes [可选] 默认值=[] 需要加载的场景ID集
     * @param avatars [可选] 默认值=[] 需要加载的行走图ID集
     * @param standAvatars [可选] 默认值=[] 需要加载的立绘ID集
     * @param animations [可选] 默认值=[] 需要加载的动画ID集
     * @param uis  [可选] 默认值=[] 需要加载的UI集
     * @param jsons [可选] 默认值=[] 需要加载的JSON集
     * @param audios [可选] 默认值=[] 需要加载的音频集
     * @param dialogs [可选] 默认值=[] 需要加载的对话框样式
     * @param syncCallbackWhenAssetExist [可选] 默认值=false 当资源存在时同步回调，否则需要等待一帧（异步回调）
     * @param autoDispose [可选] 默认值=false 是否自动释放资源（加载后会在延迟一段时间后自动释放，用于减少引用计数）
     * @param prerender [可选] 默认值=false 是否预渲染图片资源，保证完成回调后使用时不会因为渲染而卡顿，一般资源较大时可以尝试开启此项
     */
    static batchPreLoadAsset(onFin: Callback, onProgress: Callback, images: string[], scenes: number[], avatars: number[], standAvatars: number[], animations?: number[], uis?: number[], jsons?: string[], audios?: string[], dialogs?: number[], syncCallbackWhenAssetExist?: boolean, autoDispose?: boolean, prerender?: boolean): void;
    /**
     * 批量卸载高级资源
     * @param images [可选] 默认值=[] 需要卸载的图片路径集
     * @param scenes [可选] 默认值=[] 需要卸载的场景ID集
     * @param avatars [可选] 默认值=[] 需要卸载的行走图ID集
     * @param standAvatars [可选] 默认值=[] 需要卸载的立绘ID集
     * @param animations [可选] 默认值=[] 需要卸载的动画ID集
     * @param uis  [可选] 默认值=[] 需要卸载的界面集
     * @param jsons [可选] 默认值=[] 需要卸载的JSON集
     * @param audios [可选] 默认值=[] 需要加载的音频集
     * @param dialogs [可选] 默认值=[] 需要加载的对话框样式
     */
    static batchDisposeAsset(images: string[], scenes: number[], avatars: number[], standAvatars: number[], animations?: number[], uis?: number[], jsons?: string[], audios?: string[], dialogs?: number[]): void;
    /**
     * 释放场景资源，每次调用此函数减少引用计数，当引用计数为0时会销毁实际的资源（请慎重使用，一般情况下销毁对象即会自动销毁其关联的资源）
     * @param id 场景ID
     */
    static disposeScene(id: number): void;
    /**
     * 释放场景对象资源，每次调用此函数减少引用计数，当引用计数为0时会销毁实际的资源（请慎重使用，一般情况下销毁对象即会自动销毁其关联的资源）
     * @param so 场景对象数据
     */
    static disposeSceneObject(so: SceneObject): void;
    /**
     * 释放行走图资源，每次调用此函数减少引用计数，当引用计数为0时会销毁实际的资源（请慎重使用，一般情况下销毁对象即会自动销毁其关联的资源）
     * @param id 行走图ID
     */
    static disposeAvatarAsset(id: number): void;
    /**
     * 释放立绘资源，每次调用此函数减少引用计数，当引用计数为0时会销毁实际的资源（请慎重使用，一般情况下销毁对象即会自动销毁其关联的资源）
     * @param id 立绘ID
     */
    static disposeStandAvatarAsset(id: number): void;
    /**
     * 释放界面，每次调用此函数减少引用计数，当引用计数为0时会销毁实际的资源（请慎重使用，一般情况下销毁对象即会自动销毁其关联的资源）
     * @param id 界面ID
     */
    static disposeUIAsset(id: number): void;
    /**
     * 释放动画，每次调用此函数减少引用计数，当引用计数为0时会销毁实际的资源（请慎重使用，一般情况下销毁对象即会自动销毁其关联的资源）
     * @param id 动画ID
     */
    static disposeAnimationAsset(id: number): void;
    /**
     * 释放由于预加载事件页加载的资源，每次调用此函数减少引用计数，当引用计数为0时会销毁实际的资源（请慎重使用，一般情况下销毁对象即会自动销毁其关联的资源）
     * @param commandPage 事件页
     */
    static disposeCommandPage(commandPage: CommandPage): void;
    /**
     * 预加载对话框样式的相关资源，每次调用此函数减少引用计数，当引用计数为0时会销毁实际的资源（请慎重使用，一般情况下销毁对象即会自动销毁其关联的资源）
     * @param id 对话框样式ID
     */
    static disposeDialog(id: number): void;
    /**
     * 加载图片
     * @param url 图片地址
     * @param complete [可选] 默认值=null 当完成时回调 complete(tex:Texture)
     * @param syncCallbackWhenAssetExist [可选] 默认值=false 当资源存在时同步回调，否则需要等待一帧（异步回调）
     * @param useRef [可选] 默认值=true 是否使用引用计数，使用的话每次调用该函数都会增加一次引用计数
     * @param prerender [可选] 默认值=false 是否预渲染图片资源，保证完成回调后使用时不会因为渲染而卡顿，一般资源较大时可以尝试开启此项
     */
    static loadImage(url: string, complete?: Callback, syncCallbackWhenAssetExist?: boolean, useRef?: boolean, prerender?: boolean): void;
    /**
     * 加载Texture粒子图片
     * @param url 图片地址
     * @param complete [可选] 默认值=null 当完成时回调 complete(tex:Texture)
     * @param syncCallbackWhenAssetExist [可选] 默认值=false 当资源存在时同步回调，否则需要等待一帧（异步回调）
     * @param useRef [可选] 默认值=true 是否使用引用计数，使用的话每次调用该函数都会增加一次引用计数
     */
    static loadTexture(url: string, complete?: Callback, syncCallbackWhenAssetExist?: boolean, useRef?: boolean): void;
    /**
     * 加载图片集，忽略空地址，始终会返回加载完毕回调
     * @param urls 图片地址集
     * @param complete [可选] 默认值=null
     * @param syncCallbackWhenAssetExist [可选] 默认值=false 当资源存在时同步回调，否则需要等待一帧（异步回调）
     * @param useRef [可选] 默认值=true 是否使用引用计数，使用的话每次调用该函数都会增加一次引用计数
     * @param prerender [可选] 默认值=false 是否预渲染图片资源，保证完成回调后使用时不会因为渲染而卡顿，一般资源较大时可以尝试开启此项
     */
    static loadImages(urls: string[], complete?: Callback, syncCallbackWhenAssetExist?: boolean, useRef?: boolean, prerender?: boolean): void;
    /**
     * 加载Texture粒子图片集，忽略空地址，始终会返回加载完毕回调
     * @param urls 图片地址集
     * @param complete [可选] 默认值=null
     * @param syncCallbackWhenAssetExist [可选] 默认值=false 当资源存在时同步回调，否则需要等待一帧（异步回调）
     * @param useRef [可选] 默认值=true 是否使用引用计数，使用的话每次调用该函数都会增加一次引用计数
     */
    static loadTextures(urls: string[], complete?: Callback, syncCallbackWhenAssetExist?: boolean, useRef?: boolean): void;
    /**
     * 加载音频文件支持格式 .mp3 .ogg
     * @param url 音频文件地址
     * @param complete [可选] 默认值=null 加载完成时回调
     * @param syncCallbackWhenAssetExist [可选] 默认值=false 当资源存在时同步回调，否则需要等待一帧（异步回调）
     * @param useRef [可选] 默认值=true 是否使用引用计数，使用的话每次调用该函数都会增加一次引用计数
     */
    static loadAudio(url: string, complete?: Callback, syncCallbackWhenAssetExist?: boolean, useRef?: boolean): void;
    /**
     * 加载音频文件集，忽略空地址，始终会返回加载完毕回调
     * @param urls 音频文件集
     * @param complete [可选] 默认值=null
     * @param syncCallbackWhenAssetExist [可选] 默认值=false 当资源存在时同步回调，否则需要等待一帧（异步回调）
     * @param useRef [可选] 默认值=true 是否使用引用计数，使用的话每次调用该函数都会增加一次引用计数
     */
    static loadAudios(urls: string[], complete?: Callback, syncCallbackWhenAssetExist?: boolean, useRef?: boolean): void;
    /**
     * 加载并解析JSON文件
     * @param url json文件地址
     * @param complete complete(jsonObj:any)
     * @param syncCallbackWhenAssetExist [可选] 默认值=false 当资源存在时同步回调，否则需要等待一帧（异步回调）
     * @param useRef [可选] 默认值=true 是否使用引用计数，使用的话每次调用该函数都会增加一次引用计数
     */
    static loadJson(url: string, complete: Callback, syncCallbackWhenAssetExist?: boolean, useRef?: boolean): void;
    /**
     * 加载并解析JSON文件集，忽略空地址，始终会返回加载完毕回调
     * @param urls json文件地址集
     * @param complete [可选] 默认值=null
     * @param syncCallbackWhenAssetExist [可选] 默认值=false 当资源存在时同步回调，否则需要等待一帧（异步回调）
     * @param useRef [可选] 默认值=true 是否使用引用计数，使用的话每次调用该函数都会增加一次引用计数
     */
    static loadJsons(urls: string[], complete: Callback, syncCallbackWhenAssetExist?: boolean, useRef?: boolean): void;
    /**
     * 加载Text文件
     * @param url 文件路径
     * @param complete
     * @param syncCallbackWhenAssetExist [可选] 默认值=false 当资源存在时同步回调，否则需要等待一帧（异步回调）
     * @param useRef [可选] 默认值=true 是否使用引用计数，使用的话每次调用该函数都会增加一次引用计数
     */
    static loadText(url: string, complete: Callback, syncCallbackWhenAssetExist?: boolean, useRef?: boolean): void;
    /**
     * 加载Text文件集
     * @param urls 文件路径集
     * @param complete
     * @param syncCallbackWhenAssetExist [可选] 默认值=false 当资源存在时同步回调，否则需要等待一帧（异步回调）
     * @param useRef [可选] 默认值=true 是否使用引用计数，使用的话每次调用该函数都会增加一次引用计数
     */
    static loadTexts(urls: string[], complete: Callback, syncCallbackWhenAssetExist?: boolean, useRef?: boolean): void;
    /**
     * 加载文件资源（二进制）
     * @param url 文件路径集
     * @param complete 加载完成时回调函数 complete(arrayBuffer:ArrayBuffer)
     * @param useRef [可选] 默认值=true 是否使用引用计数，使用的话每次调用该函数都会增加一次引用计数
     * @param syncCallbackWhenAssetExist [可选] 默认值=true 当资源存在时同步回调，否则需要等待一帧（异步回调）
     */
    static loadFileArrayBuffer(url: string, complete: Callback, useRef?: boolean, syncCallbackWhenAssetExist?: boolean): void;
    /**
     * 获取贴图资源
     * @param url 图片地址
     * @return [Texture] 贴图资源，如果不存在则返回null
     */
    static getImage(url: string): Texture;
    /**
     * 获取JSON资源
     * @param url JSON文件地址
     * @return [any] Object：如果不存在则返回null
     */
    static getJson(url: string): any;
    /**
     * 获取文本资源
     * @param url 文本地址
     * @return [string] 文本：如果不存在则返回null
     */
    static getText(url: string): string;
    /**
     * 获取文件资源（二进制）
     * @param url 文件地址
     * @return [ArrayBuffer] 如果不存在则返回null
     */
    static getFileArrayBuffer(url: string): ArrayBuffer;
    /**
     * 卸载图片资源：当引用计数为0时会延迟后清理掉实际的所有资源以及其所有的切图资源（需保证切图资源Graphics外部已没有引用）
     * @param url 图片文件地址
     * @param force [可选] 默认值=false 是否强制卸载，强制卸载则无视引用计数
     */
    static disposeImage(url: string, force?: boolean): void;
    /**
     * 卸载图片资源集：当引用计数为0时会延迟后清理掉实际的所有资源以及其所有的切图资源（需保证切图资源Graphics外部已没有引用）
     * @param urls 图片文件地址集合
     * @param force [可选] 默认值=false 是否强制卸载，强制卸载则无视引用计数
     */
    static disposeImages(urls: string[], force?: boolean): void;
    /**
     * 卸载音频资源，当引用计数为0时会延迟后清理掉实际的所有资源
     * @param url 音频文件地址
     * @param force [可选] 默认值=false 是否强制卸载，强制卸载则无视引用计数
     */
    static disposeAudio(url: string, force?: boolean): void;
    /**
     * 卸载JSON资源，当引用计数为0时会延迟后清理掉实际的所有资源
     * @param url json文件地址
     * @param force [可选] 默认值=false 是否强制卸载，强制卸载则无视引用计数
     */
    static disposeJson(url: string, force?: boolean): void;
    /**
     * 卸载文本资源，当引用计数为0时会延迟后清理掉实际的所有资源
     * @param url 文本文件地址
     * @param force [可选] 默认值=false 是否强制卸载，强制卸载则无视引用计数
     */
    static disposeText(url: string, force?: boolean): void;
    /**
     * 卸载文件资源（二进制）
     * @param url 文件路径集
     * @param force [可选] 默认值=false 是否强制卸载，强制卸载则无视引用计数
     */
    static disposeFileArrayBuffer(url: string, force?: boolean): void;
    /**
     * 根据图片地址获取切片的贴图资源：整图资源必须已载入，当没有对应的切图时会临时切一次
     * @param url 贴图地址
     * @param x 显示的偏移值x
     * @param y 显示的偏移值y
     * @param rect 对纹理的取样 偏移和宽高
     */
    static getClipImage(url: string, x: number, y: number, rect: Rectangle): Graphics;
    /**
     * 将显示对象截图为贴图资源使用（显存），贴图尺寸受限于实际的画面尺寸
     * @param source 源，Sprite或Graphics均可
     * @param textureWidth 贴图宽度
     * @param textureHeight 贴图高度
     * @param offsetX source相对于画布的偏移X
     * @param offsetY source相对于画布的偏移Y
     * @param mipmap [可选] 默认值=false 是否使用mipmap（即根据贴图缩放大小来找到对应的mimap层混合，以解决缩放后贴图抖动的问题）
     * @param minFifter [可选] 默认值=0x2600 显示缩小的贴图时的采样方式 0x2600=邻近采样 0x2601=线性采样
     * @param magFifter [可选] 默认值=0x2600 显示放大的贴图时的采样方式 0x2600=邻近采样 0x2601=线性采样
     * @return [Texture]
     */
    static drawToTexture(source: any, textureWidth: number, textureHeight: number, offsetX?: number, offsetY?: number, mipmap?: boolean, minFifter?: number, magFifter?: number): Texture;
    /**
     * 以拼合图的形式绘制到容器中（由于设备限制贴图大小而需要拼合）需要调用disposeAtlasSprite来主动释放这些显存上的贴图
     * @param source 源，Sprite或Graphics均可
     * @param width 需要截取的宽度
     * @param height 需要截取的高度
     * @param mipmap [可选] 默认值=false 是否使用mipmap（即根据贴图缩放大小来找到对应的mimap层混合，以解决缩放后贴图抖动的问题）
     * @param minFifter [可选] 默认值=0x2600 显示缩小的贴图时的采样方式 0x2600=邻近采样 0x2601=线性采样
     * @param magFifter [可选] 默认值=0x2600 显示放大的贴图时的采样方式 0x2600=邻近采样 0x2601=线性采样
     * @param offsetX source相对于画布的偏移X
     * @param offsetY source相对于画布的偏移Y
     * @return [Sprite]
     */
    static drawToAtlasSprite(source: any, width: number, height: number, mipmap?: boolean, minFifter?: number, magFifter?: number, offsetX?: number, offsetY?: number): Sprite;
    /**
     * 大贴图转化为拼图显示对象，以解决大贴图超出显卡最大支持的贴图尺寸（os.MAX_TEXTURE_SIZE）时无法显示的问题
     * @param texture 贴图资源
     * @param xLoop [可选] 默认值=false x循环
     * @param yLoop [可选] 默认值=false y循环
     * @param mapWidth [可选] 默认值=0 拼图宽度
     * @param mapHeight [可选] 默认值=0 拼图高度
     * @return [Sprite] 贴图显示对象
     */
    static bigTextureToAtlasSprite(texture: Texture, xLoop?: boolean, yLoop?: boolean, mapWidth?: number, mapHeight?: number): Sprite;
    /**
     * 释放拼合的贴图，即由drawToAtlasSprite生成的拼合图显示对象
     * @param root 拼合图显示对象
     */
    static disposeAtlasSprite(root: Sprite): void;
    /**
     * 预渲染
     * 如果显示对象包含的资源较多，首次渲染可能造成卡顿，为了让渲染前不至于卡顿，可以在加载之类的地方去预渲染一下。
     * @param 显示对象源 Graphics | Sprite
     */
    static prerender(source: any): void;
    /**
     * 贴图转为base64格式
     * @param texture 贴图
     * @return [string] base64字符串
     */
    static textureToBase64(texture: Texture): string;
    /**
     * 贴图转为ArrayBuffer格式
     * @param texture 贴图
     * @return [ArrayBuffer] ArrayBuffer字节数组
     */
    static textureToArrayBuffer(texture: Texture): ArrayBuffer;
    /**
     * ArrayBuffer转为贴图
     * @param arrayBuffer ArrayBuffer字节数组
     * @param onFin 当完成时回调 onFin(tex:Texture)
     * @return [Texture] 贴图
     */
    static arrayBufferToTexture(arrayBuffer: ArrayBuffer, onFin: Callback): void;
    /**
     * ArrayBuffer转为Base64
     * @param arrayBuffer ArrayBuffer字节数组
     * @return [string] base64字符串
     */
    static arrayBufferToBase64(arrayBuffer: ArrayBuffer): string;
    /**
     * ArrayBuffer转为贴图
     * @param arrayBuffer ArrayBuffer字节数组
     * @param onFin 当完成时回调 onFin(tex:Texture)
     * @return [Texture] 贴图
     */
    static base64ToTexture(base64: string, onFin: Callback): void;
    /**
     * ArrayBuffer转为Base64
     * @param arrayBuffer ArrayBuffer字节数组
     * @return [string] base64字符串
     */
    static base64ToArrayBuffer(base64: string): ArrayBuffer;
}
