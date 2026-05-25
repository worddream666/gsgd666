/**
 * 场景对象模块-影子
 * Created by 黑暗之神KDS on 2021-11-02 01:05:48.
 */
class SoModule_Shadow extends SceneObjectModule_1 {
    /**
     * 构造函数
     * @param installCB 
     */
    constructor(installCB: Callback) {
        super(installCB);
        this.so.on(ProjectClientSceneObject.JUMP_START, this, this.startUpdateDraw);
        this.so.on(ProjectClientSceneObject.JUMP_OVER, this, this.stopUpdateDraw);
        this.drawShadow();
    }
    /**
     * 模块移除时
     */
    onRemoved(): void {
        this.so.off(ProjectClientSceneObject.JUMP_START, this, this.startUpdateDraw);
        this.so.off(ProjectClientSceneObject.JUMP_OVER, this, this.stopUpdateDraw);
        this.stopUpdateDraw();
        this.clearShadow();
    }
    /**
     * 刷新：通常在改变了属性需要调用此函数统一刷新效果
     */
    refresh(): void {
        this.drawShadow();
    }
    /**
     * 清理影子
     */
    private clearShadow() {
        this.so.shadow.alpha = 1;
        this.so.shadow.graphics.clear();
    }
    /**
     * 绘制影子
     */
    private drawShadow() {
        let scalePer = 1 - (this.so.avatar.y / -ClientWorld.data.jumpHeight) * 0.5;
        this.so.shadow.graphics.clear();
        this.so.shadow.graphics.drawCircle(0, 0, this.shadowWidth * scalePer, "#000000");
        this.so.shadow.scaleY = this.shadowHeight / this.shadowWidth * this.so.avatar.scaleY;
        this.so.shadow.scaleX = this.so.avatar.scaleX;
        this.so.shadow.alpha = this.shadowAlpha;
    }
    //------------------------------------------------------------------------------------------------------
    // 跳跃对影子大小发生改变 
    //------------------------------------------------------------------------------------------------------
    /**
     * 开始刷新绘制
     */
    private startUpdateDraw() {
        stage.on(EventObject.RENDER, this, this.drawShadow);
    }
    /**
     * 停止刷新绘制
     */
    private stopUpdateDraw() {
        stage.off(EventObject.RENDER, this, this.drawShadow);
    }
}