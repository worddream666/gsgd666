/**
 * 图块素材配置数据
 * 来自编辑器预设好的图块素材数据
 * Created by 黑暗之神KDS on 2018-10-16 17:49:10.
 */
declare class TileData {
    /**
     * 唯一ID
     */
    id: number;
    /**
     * 名称
     */
    name: string;
    /**
     * 图片路径 默认值=""
     */
    url: string;
    /**
    * 数据层数据 [自定义数据层索引][xGrid][yGrid] 默认值=[]
    */
    dataLayers: number[][][];
    /**
     * 宽度 默认值=0
     */
    width: number;
    /**
     * 高度 默认值=0
     */
    height: number;
    /**
     * 获取图块数据
     * @param texID 图块素材ID
     * @return 图块素材配置数据
     */
    static getTileData(texID: number): TileData;
}
