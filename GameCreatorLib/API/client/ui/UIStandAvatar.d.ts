/**
 * 立绘组件
 * 封装了立绘的界面组件
 * 相关事件
 *  EventObject.LOADED 加载完成时候事件
 *  Avatar.ACTION_PLAY_COMPLETED
 *  Avatar.RENDER 当确实到达了新的一帧后派发，本体如果没有实际的帧则不派发
 *
 * 使用方法：
 * var a = new UIStandAvatar();
 * a.avatarID =5;
 * stage.addChild(a);
 *
 * // 事件监听示例
 * a.on(EventObject.LOADED,this,this.onLoaded);
 * a.on(Avatar.ACTION_PLAY_COMPLETED,this,this.onActionPlayComplete);
 * a.on(Avatar.RENDER,this,this.onRender);
 *
 * Created by 黑暗之神KDS on 2020-01-27 01:23:18.
 */
declare class UIStandAvatar extends UIAvatar {
    /**
     * 是否水平翻转
     */
    flip: boolean;
}
