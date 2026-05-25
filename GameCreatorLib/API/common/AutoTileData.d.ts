/**
 * 自动元件数据
 * Created by 黑暗之神KDS on 2020-06-08 13:36:16.
 */
declare class AutoTileData {
    /**
     * 图片路径
     */
    url: string;
    /**
     * 数据层数据-由于自动元件仅视为一格 默认值=[]
     * [dataGridIndex] = 1/0 
     */
    dataLayers: number[];
    /**
     * 规格模式
     * 0-GCAT1的规格
     */
    GCATMode: number;
    /**
     * 运行时使用，获取图块数据
     * @param texID 自动元件的编号（1~N）
     */
    static getAutoTileData(texID: number): AutoTileData;
}
