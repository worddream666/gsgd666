/**
 * 玩家基类
 * 支持自定义属性，即玩家设定中预设的属性：比如RPG游戏中的玩家背包就是一种自定义的玩家属性。
 *   -- 可视化编辑自定义属性：菜单-自定义编辑器-玩家属性编辑
 *   -- 存档会自动包含这些自定义属性
 * 支持玩家变量：数值变量、开关变量、字符串变量：
 *   -- 存档会自动包含玩家变量
 *   -- 玩家变量改变会自动影响到一些地方，比如界面中的变量控件。
 * 玩家默认带有一个场景对象数据：
 *   -- 切换场景时会销毁其场景对象this.sceneObject，同时将基础数据、自定义数据写入到数据this.data.sceneObject中
 *      并且切换完毕后会重新创建新的场景对象this.sceneObject
 *   -- 存档会自动包含玩家的显示对象数据（基础数据[SceneObject] + 场景对象的自定义数据）
 * Created by 黑暗之神KDS on 2019-05-22 00:25:37.
 */
declare class Player {
    /**
     * 唯一uid（GC平台登录的账号UID）
     */
    uid: number;
    /**
     * gc用户昵称（GC平台登录的账号昵称）
     */
    gcNickName: string;
    /**
     * 玩家属性：包含自定义属性和玩家的场景对象数据（基础数据[SceneObject] + 场景对象的自定义数据）
     */
    data: PlayerData;
    /**
     * 玩家变量：包含数值变量、开关变量、字符串变量
     */
    variable: Variable;
    /**
     * 玩家的场景对象实体
     */
    sceneObject: SceneObjectEntity;
    /**
     * 进入指定场景
     * @param sceneID 场景ID
     * @param x [可选] 默认值=0 实际坐标x
     * @param y [可选] 默认值=0 实际坐标y
     */
    toScene(sceneID: number, x?: number, y?: number): void;
}
