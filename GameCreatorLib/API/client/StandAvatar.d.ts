/**
 * 立绘显示对象
 * 立绘系统继承于Avatar，可以视为没有方向概念的特殊行走图
 * 支持表情、部件、序列帧
 * 【创建立绘】
 * var sa = new StandAvatar();
 * sa.id = 1;
 * sa.x = 300;
 * sa.y = 300;
 * stage.addChild(sa);
 * Created by 黑暗之神KDS on 2018-11-04 03:15:18.
 */
declare class StandAvatar extends Avatar {
    /**
     * 是否水平翻转
     */
    flip: boolean;
}
