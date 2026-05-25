/**
 * 自定义模块的游戏数据类
 *
 * 制作者更新了数据后，玩家来自存档的数据读取后格式会被修正，
 * 比如旧版本的存档没有的属性或数据格式被修改，会使用预设的默认值
 * -- 如原来没有age属性，制作者修改后age属性默认值是10,那么玩家读档后该值则是10
 * -- 如原来存在age属性，数值类型，存档值为20，制作者修改后age是字符串类型，默认值是"kds"，那么玩家读档后age值为"kds"
 *
 * Created by 黑暗之神KDS on 2019-08-16 17:36:43.
 */
declare class GameData {
    /**
     * 获取系统预设的自定义模块数据模型
     * 系统会在初始化时生成一组预设数据，以便获取或参考，比如制作了一个[道具]的模块，并且填充了10个道具数据，
     * 那么系统在游戏运行时会自动生成这10个道具数据，通过此方法即可获取
     * @param moduleID 自定义模块ID 1-N（参考编辑器菜单-自定义编辑器-模块制作器）
     * @param dataID 数据的ID
     * @return [Module_???] 返回自定义的模块类型，根据模块名称（如Module_Actor）
     */
    static getModuleData(moduleID: number, dataID: number): any;
    /**
     * 新建一个指定模块的数据
     * 如果是副本数据：数据与原数据已脱离关系，原数据的更改不会影响该数据的更改，该数据的值来自存档值。
     * 比如一件装备原始攻击+10，而极品装备攻击+15，即使调整了原始数据攻击变为25后，该装备攻击仍然是15
     * 如果不是副本数据：则是引用原数据的关系，数据仍使用原模型数据的值。
     * 比如一件装备原始攻击+10，你获得后，设计人员调整了攻击变为25后，该件装备会自动变为攻击+25
     * @param moduleID 自定义模块ID 1-N
     * @param dataID 数据ID
     * @param isCopy [可选] 默认值=true 是否是数据副本
     * @return [Module_???] 返回自定义的模块类型
     */
    static newModuleData(moduleID: number, dataID: number, isCopy?: boolean): any;
    /**
     * 更改模块数据为副本模式，使用此函数可以将引用关系的数据转化为副本
     * @param data 模块数据
     * @param moduleID 模块编号
     */
    static changeModuleDataToCopyMode(data: any, moduleID: number): void;
    /**
     * 判断数据是否是副本模式
     * @param data 模块数据
     * @return 是否副本模式
     */
    static isCopyModeData(data: any): boolean;
    /**
     * 获取指定模块的数据总长度（编辑器的对于该模块的更改最大值可以修改）
     * 如获取自定义模块[道具]的总数据长度
     * @param moduleID 自定义模块ID 1-N
     * @param typeID [可选] 默认值=1 类型1-16
     * @return [number] 数据总长度
     */
    static getLength(moduleID: number, typeID?: number): number;
}
