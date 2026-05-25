/**
 * 镜头
 * 一般作为场景的镜头来使用，坐标为镜头中心点
 * 比如场景中使用了相机 Game.currentScene.camera
 * Created by 黑暗之神KDS on 2020-03-01 01:32:43.
 */
declare class Camera {
    /**
     * 包含相机位置和可见宽高 默认值=new Rectangle(0, 0, 100, 100)
     */
    viewPort: Rectangle;
    /**
     * 镜头旋转角度 默认值=0
     */
    rotation: number;
    /**
     * 镜头偏移量x 默认值=0
     */
    offsetX: number;
    /**
     * 镜头偏移量y 默认值=0
     */
    offsetY: number;
    /**
     * 镜头z轴位置 默认值=0
     */
    z: number;
    /**
     * 相机镜头缩放x（场景专用）默认值=1
     */
    scaleX: number;
    /**
     * 相机镜头缩放y（场景专用）默认值=1
     */
    scaleY: number;
    /**
     * 镜头锁定场景对象，锁定后将以该场景对象为视角中心点，如果设置为null则以viewPort计算
     */
    sceneObject: ClientSceneObject;
    //------------------------------------------------------------------------------------------------------
    // [代码示例]
    // 镜头跳转到指定的场景位置（如像素坐标点500,500）：
    // <code>
    // // 先取消锁定目标，如果未锁定目标的话可以不调用此代码
    // Game.currentScene.camera.sceneObject = null;
    // // 再设置指定的位置
    // Game.currentScene.camera.viewPort.x = 500;
    // Game.currentScene.camera.viewPort.y = 500;
    // </code>
    // 镜头缓动到指定的场景位置（有平滑移动的效果）
    // <code>
    // // 先取消锁定目标，如果未锁定目标的话可以不调用此代码
    // Game.currentScene.camera.sceneObject = null;
    // // 用2000毫秒时间以Ease.strongOut的缓动形式使镜头移动到像素坐标点500,500
    // Tween.to(Game.currentScene.camera.viewPort, { x: 500, y: 500 }, 2000, Ease.strongOut);
    // </code>
    // 镜头缩放（有平滑移动的效果）
    // <code>
    // // 先取消锁定目标，如果未锁定目标的话可以不调用此代码
    // Game.currentScene.camera.sceneObject = null;
    // // 用1000毫秒时间以Ease.strongOut的缓动形式使镜头缩放到0.5（即50%）
    // Tween.to(Game.currentScene.camera, { scaleX: 0.5, scaleY: 0.5 }, 1000, Ease.strongOut);
    // </code>
    // 持续的镜头旋转效果
    // <code>
    // // 用1000毫秒时间以Ease.strongOut的缓动形式使镜头缩放到0.5（即50%）
    // os.add_ENTERFRAME(() => {
    //    Game.currentScene.camera.rotation++;
    // }, this);
    // </code>
    //------------------------------------------------------------------------------------------------------
}
