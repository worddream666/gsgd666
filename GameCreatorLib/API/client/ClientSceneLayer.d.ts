/**
 * 场景图层-显示对象
 * 包含图片图层和图块图层
 * Created by 黑暗之神KDS on 2018-07-22 17:29:13.
 */
declare class ClientSceneLayer extends GameSprite {
    /**
     * 对应的地图对象
     */
    scene: ClientScene;
    /**
     * 偏移值-X 默认值=0
     */
    dx: number;
    /**
     * 偏移值-Y 默认值=0
     */
    dy: number;
    /**
     * X方向自动滚动 默认值=0
     */
    xMove: number;
    /**
     * Y方向自动滚动 默认值=0
     */
    yMove: number;
    /**
     * 是否自动更换子显示对象层次 根据显示对象Y坐标刷新
     * 比如在一般RPG游戏中，A在B的下方会遮挡B，而当A移动到B上方时会被B遮挡住，开启此项会自动计算
     */
    isChangeChildZOrder: boolean;
    /**
     * x循环（平铺） 中途更改此项后需要调用refreshLoopShow刷新
     */
    xLoop: boolean;
    /**
     * y循环（平铺） 中途更改此项后需要调用refreshLoopShow刷新
     */
    yLoop: boolean;
    /**
     * 远景比例X轴 默认值=1.0 表示 100% 普通地图是100%，值越小则移动越慢，多重远景一般通过更改此属性来制作
     */
    prospectsPerX: number;
    /**
     * 远景比例Y轴 默认值=1.0 表示 100% 普通地图是100%，值越小则移动越慢，多重远景一般通过更改此属性来制作
     */
    prospectsPerY: number;
    /**
     * 地图层的图片资源地址
     */
    get mapUrl(): string;
    /**
     * 是否是绘图模式（图块），在创建时需要设定好才可使用图块模式绘制
     */
    drawMode: boolean;
    /**
     * 构造函数
     * @param scene 所属的场景
     */
    constructor(scene: ClientScene);
    /**
     * 刷新循环显示，中途更改了xLoop或yLoop后调用此项以便刷新
     */
    refreshLoopShow(): void;
    /**
     * 绘制图块，绘制后需要调用flushTile进行冲印，同时绘制多个图块时可以在绘制完毕后统一冲印，以便节约不必要的性能耗损。
     * 图层必须是绘制模式（drawMode==true）
     * @param xGrid 格子坐标x
     * @param yGrid 格子坐标y
     * @param tileData 贴图对象、图块ID、图块的采样（x,y,width,height） 如果为null则表示擦除
     */
    drawTile(xGrid: number, yGrid: number, tileData: { tex: Texture; texID: number; x: number; y: number; w: number; h: number; }): void;
    /**
     * 绘制自动图块元件，绘制后需要调用flushTile进行冲印，同时绘制多个图块时可以在绘制完毕后统一冲印，以便节约不必要的性能耗损。
     * 图层必须是绘制模式（drawMode==true）
     * @param xGrid 格子坐标x
     * @param yGrid 格子坐标y
     * @param autoTileID 自动元件的ID
     * @param texture 自动元件的贴图
     */
    drawAutoTile(xGrid: number, yGrid: number, autoTileID: number, texture: Texture): void;
    /**
     * 刷新图块：将此前绘制过的图块统一显示出来
     */
    flushTile(): void;
    /**
     * 清理图块，将当前图块全部清空
     */
    clearTile(): void;
    /**
     * 设置完整图片作为该层地图图像，仅图片图层可用
     * @param imgURL 完整图片地址
     */
    setBigImage(imgURL: string): void;
    /**
     * 根据texture设置背景，仅图片图层可用
     * @param t 贴图
     */
    setBigTexture(t: Texture): void;
    //------------------------------------------------------------------------------------------------------
    // [代码示例]
    // 创建一个图片图层添加到当前场景上
    // <code>
    // 创建一个图层，并设置图片，添加到场景上，默认在左上角（0,0）
    // var layer = new ClientSceneLayer(Game.currentScene);
    // layer.setBigImage("asset/image/xxxx.png");
    // Game.currentScene.addLayer(layer);
    // </code>
    // 创建一个图块图层，绘制图块
    // <code>
    // // 创建一个图块图层
    // var layer = new ClientSceneLayer(Game.currentScene);
    // layer.drawMode = true;
    // layer.graphics.drawRect(0,0,100,100,"#FF0000");
    // // 加载指定的贴图作为图块素材
    // AssetManager.loadImage("asset/image/tile/矿洞.png", Callback.New((tex: Texture) => {
    //     // 从图源0,0中取得48x48的图绘制到格子3,0的位置上
    //     layer.drawTile(3, 0, { tex: tex, texID: 1, x: 0, y: 0, w: 48, h: 48 });
    //     // 从图源96,0中取得48x48的图绘制到格子4,0的位置上
    //     layer.drawTile(4, 0, { tex: tex, texID: 1, x: 96, y: 0, w: 48, h: 48 });
    //     // 提交绘制
    //     layer.flushTile();
    // }, this));
    //
    // // 加载指定的自动元件贴图作为自动元件素材
    // AssetManager.loadImage("asset/image/tile/GCAT1a.png", Callback.New((tex: Texture) => {
    //    // 绘制到坐标3,3，作为自动元件6号
    //    layer.drawAutoTile(3, 3, 6, tex);
    //    // 提交绘制
    //    layer.flushTile();
    // }, this));
    // 
    // // 添加到场景上
    // Game.currentScene.addLayer(layer);
    // </code>
    //------------------------------------------------------------------------------------------------------
}
