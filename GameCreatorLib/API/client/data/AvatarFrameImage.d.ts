/**
 * 行走图帧图像数据
 * 目前适用于行走图和立绘的帧切图数据
 * Created by 黑暗之神KDS  on 2018-12-07 05:22:16.
 */
declare class AvatarFrameImage {
    /**
     * 所在帧索引
     */
    index: number;
    /**
     * 对应图集的索引 Avatar的picUrls
     */
    picUrlIndex: number;
    /**
     * 贴图
     */
    tex: Texture;
    /**
     * 切图数据 null表示直接使用整张图
     */
    rect: Rectangle;
    /**
     * 坐标X 显示的偏移值x
     */
    x: number;
    /**
     * 坐标Y 显示的偏移值y
     */
    y: number;
    /**
     * 宽度，存在则使用该宽度，否则使用切图宽度
     */
    width: number;
    /**
     * 高度，存在则使用该高度，否则使用切图高度
     */
    height: number;
    /**
     * 旋转角度 默认值0
     */
    rotation: number;
    /**
     * 透明 0~1 默认值1
     */
    alpha: number;
    /**
     * 色相 -180~180 默认值0
     */
    hue: number;
    /**
     * 模糊度 0~N 0表示无模糊 默认值0
     */
    blur: number;
    /**
     * 色调：红 -255~255 默认值0
     */
    tonal_r: number;
    /**
     * 色调：绿 -255~255 默认值0
     */
    tonal_g: number;
    /**
     * 色调：蓝 -255~255 默认值0
     */
    tonal_b: number;
    /**
     * 色调：灰色 0~100 默认值0
     */
    tonal_gray: number;
    /**
     * 红曝光 0~10 默认值0
     */
    tonal_mr: number;
    /**
     * 绿曝光 0~10 默认值0
     */
    tonal_mg: number;
    /**
     * 蓝曝光 0~10 默认值0
     */
    tonal_mb: number;
    /**
     * 等待类型 0/null-无（按照帧率） 1-等待X帧 2-等待X毫秒
     */
    wait_type: number;
    /**
     * 等待计数（帧/毫秒） 
     * -- 其中帧是根据avatar帧率计算，比如帧率设置为20，游戏帧率为60，那么等待1帧则游戏实际渲染3帧的时间（60/20*1）
     *    也就是意味着等待3帧表示等待3倍间隔时间
     * -- 部件跟随本体的等待
     */
    wait_count: number;
    /**
     * 获取图像的切图正数据
     */
    get positiveRect(): Rectangle;
}
