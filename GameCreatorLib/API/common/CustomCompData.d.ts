/**
 * 获得或者设置的自定义组件属性相关数据
 *  --自定义模块数据
 *  --自定义世界数据
 *  --自定义玩家数据
 *  --自定义场景对象数据
 *  ==自定义场景对象模型数据
 * Created by JayLen on 2022-06-17 14:25:56.
 */
declare class CustomCompData {
    /**
    * 类别 0:获取属性 1:获取和设置属性 默认值=0
    */
    type: number;
    /**
     * 模块ID 默认值=1
     */
    moduleID: number;
    /**
     * 数据ID 默认值=1
     */
    dataID: number;
    /**
     * 是否使用变量指定数据ID 默认值=false
     */
    dataIsUseVar: boolean;
    /**
     * 变量ID 默认值=1
     */
    dataVarID: number;
    /**
     * 选中的属性唯一ID 默认值=""
     */
    varID: string;
    /**
     * 选中属性名称 默认值=""
     */
    varName: string;
    /**
     * 设置值类别 0-常量 1-变量 默认值=0
     */
    valueType: number;
    /**
     * 设置的值 默认值={}
     */
    value: { copy: boolean, value: number, varType: number };
    /**
     * 是否为自定义模块
     */
    isCustomModule: boolean;
    /**
    * 是否允许获取/设置绑定界面内的属性 默认=false
    */
    compAttrEnable: boolean;
    /**
     * 运算类型 0-等于 1-加上 2-减去 3-乘以 4-除以 5-求余 6-求幂
     */
    operationType: number;
    /**
     * 是否取整（数值类型，根据编辑器设定）
     */
    isRounded: boolean;
    /**
     * 获取的值(绑定界面内属性) 默认值={ uiID: 1, type: 0, compName: "", compID: 0, attrs: [], varName: "" };
     *   --uiID:界面ID
     *   --type:属性类别 0-数值 1-字符串 2-布尔值 3-其他
     *   --compName:组件名称
     *   --compID:组件唯一ID
     *   --attrs:选择的组件属性集合
     *   --varName:组件属性名称
     */
    compInfo: { uiID: number, type: number, compName: string, compID: number, attrs: any[], varName: string };
    /**
     * 选择模式 0-枚举 1-输入 默认值=0
     */
    selectMode: number;
    /**
     * 输入模式下,填入数据 默认值={ mode: 0, constName: "", varNameIndex: 1, typeIndex: 0 }
     *   --mode:模式 0-常量 1-变量
     *   --constName:常量属性名称
     *   --varNameIndex:变量属性名称索引
     *   --typeIndex:属性类别 0-数值 1-字符串 2-布尔值 3-其他
     */
    inputModeInfo: { mode: number, constName: string, varNameIndex: number, typeIndex: number };
    /**
     * 设置数据
     * @param target 修改对象
     * @param data 数据
     * @param soc 场景对象[可选]设置场景对象模块的属性用
     */
    static setData(target: any, data: CustomCompData, soc?: any): void;
    /**
     * 获取数据
     * @param target
     * @param data 数据
     * @param isModule [可选]是否自定义模块,此时target设置为null即可
     */
    static getData(target: any, data: CustomCompData, isModule?: boolean): any
    /**
     * 获取超级数值的值
     * @param v 自定义参数
     * @param trigger 触发器 默认可省略 默认值=null
     * @returns 
     */
    static getSuperNumber(v: any, trigger?: any): number
    /**
     * 获取超级字符串的值
     * @param v 自定义参数
     * @param trigger 触发器 默认可省略 默认值=null
     * @returns 
     */
    static getSuperString(v: any, trigger?: any): string
    /**
     * 获取超级开关的值
     * @param v 自定义参数
     * @param trigger 触发器 默认可省略 默认值=null
     * @returns 
     */
    static getSuperSwitch(v: any, trigger?: any): boolean
}