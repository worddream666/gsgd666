/**
 * 图像层
 * Created by 黑暗之神KDS on 2020-11-30 10:28:32.
 */
declare class GameImageLayer extends GameSprite {
    /**
     * 相机
     */
    camera: Camera;
    /**
     * 刷新帧，如果更改了相机设置希望在当前帧立刻刷新的话可自行调用该函数，否则会在帧刷中自动每帧调用（意味着下一帧才调用）
     * @param force [可选] 默认值=false 强制刷新，让图层内的对象全部刷新相机的设置
     *                                （默认情况下系统会自动根据是否更新了相机来决定是否刷新子对象相对于相机的位置）
     */
    updateFrame(force?: boolean): void;
    /**
     * 记录全部通道的显示对象 默认值={}
     * 格式 { [passageID: string]: { displayObject: GameSprite } } 
     */
    static imageSprites: any;
    /**
     * 设置通道显示对象
     * @param passageID 通道编号
     * @param sp 显示对象
     */
    static setImageSprite(passageID: number, sp: GameSprite): void;
    /**
     * 获取占用该通道的显示对象
     * @param passageID 通道编号
     */
    static getImageSprite(passageID: number): GameSprite;
    /**
     * 删除通道
     * -- 清理显示对象
     * @param passageID 通道编号
     */
    static deletePassage(passageID: number): void;
    /**
     * 注册帧刷效果，支持注册多个
     * @param passageID 通道编号
     * @param onUpdate 帧刷函数
     * @param thisPtr 作用域
     * @param args [可选] 默认值=null 自定义参数
     * @param sign [可选] 默认值=null 标识，清理时可清理指定的标识
     */
    static regPassageFrameUpdate(passageID: number, onUpdate: Function, thisPtr: any, args?: any[], sign?: string): void;
    /**
     * 清理通道的帧刷函数效果
     * @param passageID 通道编号
     * @param sign [可选] 默认值=null 标识，清理时可清理指定的标识
     */
    static clearPassageFrameUpdate(passageID: number, sign?: string): void;
    /**
     * 获取通道帧刷函数
     * -- passageID 通道编号
     * -- onUpdate 帧刷函数
     * -- thisPtr 作用域
     * -- sign 标识
     * -- args 自定义参数
     * @return { [passageID: string]: { onUpdate: Function, thisPtr: any, sign: string, args: any[] }[] }
     */
    static getPassageFrameUpdates(): any;
}
