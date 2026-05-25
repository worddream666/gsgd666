/**
 * 行走图辅助体数据
 * 一般用于自定义Avatar的一些点、范围等，比如击中角色后以哪里作为中心点显示击中的动画
 * Created by 黑暗之神KDS on 2018-12-09 7:15:22.
 */
declare class AvatarRefObj {
    /**
     * ID
     */
    id: number;
    /**
     * 坐标x
     */
    x: number;
    /**
     * 坐标y
     */
    y: number;
    /**
     * 宽度
     */
    width: number;
    /**
     * 高度
     */
    height: number;
    /**
     * 类型：当前版本只支持矩形，未来将支持更多
     * null/0=矩形
     * 1=圆形
     * 2=三角形
     * 3=多边形
     * 4=线段
     */
    type: number;
}
