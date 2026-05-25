/**
 * 行走图辅助体数据
 * 一般用于自定义Avatar的一些点、范围等，比如击中角色后以哪里作为中心点显示击中的动画
 * Created by 黑暗之神KDS on 2018-12-09 7:15:22.
 */
declare class Helper {
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
     * 半径
     */
    radius: number;
    /**
     * 旋转
     */
    rotation: number;
    /**
     * 点位置集合:多边形为[x1,y1,x2,y2...] 线段为[x1,y1,x2,y2]
     */
    points: number[];
    /**
     * 包围盒(多边形和线段用)
     */
    boundingBox: Rectangle;
    /**
     * 类型
     * -1=无
     * 0=矩形
     * 1=圆形
     * 2=三角形
     * 3=多边形
     * 4=线段
     * 5=椭圆形
     */
    type: number;
    /**
     * 所有顶点相对于原点的坐标
     */
    pointPostion: Point[];
}
