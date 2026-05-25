/**
 * 行走图动作数据
 * 一个Avatar可能包含若干个动作，每个动作拥有对应每个方向都有一系列的图集
 * 面向系统参考小键盘以5为中心面向其他数字的方向： 1-左下 2-下 3-右下 4-左 6-右 7-左上 8-上 9-右上
 * 7 8 9
 * 4 5 6
 * 1 2 3
 *
 * Created by 黑暗之神KDS on 2018-12-07 03:15:16.
 */
declare class AvatarAction {
    /**
     * 动作ID 对应动作库中的ID
     */
    id: number;
    /**
     * 图集的帧数据信息 默认值=[]
     * [面向](对应小键盘) - 帧图
     * 如 [2] = AvatarFrameImage[] 表示该动作面向下的一组帧图数据
     */
    frameImageInfo: AvatarFrameImage[][];
    /**
     * 方向模式 1 2 3 4 5 8
     * 其中1、3、5方向会自动镜像翻转
     */
    oriMode: number;
    /**
     * 获取指定面向的总帧数
     * @param ori 面向
     * @param useMapping [可选] 默认值=true 使用映射获取实际面向，比如没有7面向则使用4面向代替
     */
    getFrameLength(ori: number, useMapping?: boolean): number;
    /**
     * 获取当前动作中某个方向与某帧的数据图像
     * @param ori 面向
     * @param frame 帧
     * @param useMapping [可选] 默认值=true 使用映射获取实际面向，比如没有7面向则使用4面向代替
     * @return 数据图像
     */
    getFrameImage(ori: number, frame: number, useMapping?: boolean): AvatarFrameImage;
    /**
     * 是否存在该面向
     * @param ori 面向
     * @return [boolean]
     */
    hasOri(ori: number): boolean;
}
