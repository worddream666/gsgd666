/**
 * 获得场景坐标的自定义组件属性相关数据
 *  --获得场景坐标
 * Created by JayLen on 2023-02-23 14:25:56.
 */
declare class SelectedSenceData {
    /**
     * 是否变量 默认为false
     */
    isVer: boolean;
    /**
     * 场景地图Id 默认为0
     */
    id: number;
    /**
     * 场景坐标X 默认为0
     */
    x: number;
    /**
     * 场景坐标Y 默认为0
     */
    y: number;
    /**
     * 是否格子坐标 默认为true
     */
    isCell: boolean;
    /**
     * 朝向 0-不变 1-下 2-左 3-上 4-右 5-左下 6-右下 7-左上 8-右上 9-随机 默认为0
     */
    ori: number;
}