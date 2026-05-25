/**
 * 游戏总显示层次
 * 通过 Game.layer 访问该类的唯一实例
 * 重写 initLayer 可以自定义层次关系
 * 系统默认层次：
 * stage：
 *   -- sceneLayer 场景层：通常场景应添加到场景层
 *   -- imageLayer 图像层：通常图像系统中显示的图片动画等添加在该层
 *   -- uiLayer 界面层：通常界面、对话框添加在该层
 * Created by 黑暗之神KDS on 2019-01-09 15:09:23.
 */
declare class GameLayer extends GameSprite {
    /**
     * 场景层：通常场景应添加到场景层
     */
    sceneLayer: GameSprite;
    /**
     * 图像层：通常图像系统中显示的图片动画等添加在该层
     */
    imageLayer: GameImageLayer;
    /**
     * UI层：界面层：通常界面、对话框添加在该层
     */
    uiLayer: GameSprite;
    /**
     * 初始化层次
     * 可以通过 GameLayer.prototype.initLayer 重写此函数
     * 系统默认层次依次是
     * -- 场景层 this.addChild(this.sceneLayer);
     * -- 图像层 this.addChild(this.imageLayer);
     * -- UI层 this.addChild(this.uiLayer); 对话框在此层
     */
    initLayer(): void;
    //------------------------------------------------------------------------------------------------------
    // [代码示例]
    // 暂时隐藏所有界面层，间隔3秒后再显示
    // <code>
    // Game.layer.uiLayer.visible = false;
    // setTimeout(()=>{
    //    Game.layer.uiLayer.visible = true;
    // },3000);
    // </code>
    //------------------------------------------------------------------------------------------------------
}
