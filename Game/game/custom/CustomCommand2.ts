/**
 * 自定义事件命令
 * -- 图像/动画/立绘/界面/视频/音频相关的指令
 * -- 对于图像显示以及移动过程追加了存档读档支持
 * Created by 黑暗之神KDS on 2018-12-18 17:17:50.
 */
module CommandExecute {
    //------------------------------------------------------------------------------------------------------
    // 图像系统基础指令运行时
    //------------------------------------------------------------------------------------------------------
    /**
     * 显示图片
     */
    export function customCommand_3001(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_3001): void {
        // 获取通道
        let passageID = cp.passageIDUseVar ? Game.player.variable.getVariable(cp.passageIDVar) : cp.passageID;
        passageID = MathUtils.int(passageID);
        // 清理通道
        GameImageLayer.deletePassage(passageID);
        // 获取属性值
        let image = cp.imageUseVar ? Game.player.variable.getString(cp.imageVar) : cp.image;
        let dpX: number, dpY: number, dpWidth: number, dpHeight: number;
        if (cp.posUseVar) {
            dpX = Game.player.variable.getVariable(cp.dpXVar);
            dpY = Game.player.variable.getVariable(cp.dpYVar);
        }
        else {
            dpX = cp.dpX;
            dpY = cp.dpY;
        }
        let dpz = cp.zUseVar ? Game.player.variable.getVariable(cp.dpZVar) : cp.dpZ;
        if (cp.sizeUseVar) {
            dpWidth = Game.player.variable.getVariable(cp.dpWidthVar);
            dpHeight = Game.player.variable.getVariable(cp.dpHeightVar);
        }
        else {
            dpWidth = cp.dpWidth;
            dpHeight = cp.dpHeight;
        }
        let rotation = cp.rotationUseVar ? Game.player.variable.getVariable(cp.rotationVar) : cp.rotation;
        let opacity = cp.opacityUseVar ? Game.player.variable.getVariable(cp.opacityVar) : cp.opacity;
        // 创建显示对象
        let a = new UIBitmap();
        // 设置通道由该显示对象占用
        GameImageLayer.setImageSprite(passageID, a);
        Game.layer.imageLayer.addChild(a);
        a.dpDisplayPriority = passageID;
        a.image = image;
        a.useDPCoord = true;
        a.dpX = dpX;
        a.dpY = dpY;
        a.dpZ = dpz;
        a.dpWidth = dpWidth;
        a.dpHeight = dpHeight;
        a.rotation1 = rotation;
        a.opacity = opacity;
        a.pivotType = cp.pivotType;
        a.flip = cp.flip;
        a.blendMode = [null, "lighter", "blend5-1", "blend4-1", "blend4-7", "blend4-4"][cp.blendMode];
        a.dpCoordToRealCoord();

    }
    /**
     * 移动图像
     */
    export function customCommand_3002(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_3002): void {
        // 获取通道
        let passageID = cp.passageIDUseVar ? Game.player.variable.getVariable(cp.passageIDVar) : cp.passageID;
        passageID = MathUtils.int(passageID);
        // 获取通道显示对象
        let a = GameImageLayer.getImageSprite(passageID) as UIBitmap;
        if (!a || !(a instanceof UIBitmap)) return;
        // 标识：用于注册图像层帧刷时的标识，以便可用此标识取消该类型帧刷
        let sign = "gcImageMove";
        // 清理同一个通道的移动图像效果
        GameImageLayer.clearPassageFrameUpdate(passageID, sign);
        // 获取属性
        let toDpX: number, toDpY: number, toDpWidth: number, toDpHeight: number;
        if (cp.posUseVar) {
            toDpX = Game.player.variable.getVariable(cp.dpXVar);
            toDpY = Game.player.variable.getVariable(cp.dpYVar);
        }
        else {
            toDpX = cp.dpX;
            toDpY = cp.dpY;
        }
        let toDpZ = cp.zUseVar ? Game.player.variable.getVariable(cp.dpZVar) : cp.dpZ;
        if (cp.sizeUseVar) {
            toDpWidth = Game.player.variable.getVariable(cp.dpWidthVar);
            toDpHeight = Game.player.variable.getVariable(cp.dpHeightVar);
        }
        else {
            toDpWidth = cp.dpWidth;
            toDpHeight = cp.dpHeight;
        }
        let toRotation = cp.rotationUseVar ? Game.player.variable.getVariable(cp.rotationVar) : cp.rotation;
        let toOpacity = cp.opacityUseVar ? Game.player.variable.getVariable(cp.opacityVar) : cp.opacity;
        // 立即模式：无需清理此行为
        if (cp.timeType == 0) {
            a.dpX = toDpX;
            a.dpY = toDpY;
            a.dpZ = toDpZ;
            a.dpWidth = toDpWidth;
            a.dpHeight = toDpHeight;
            a.rotation = toRotation;
            a.opacity = toOpacity;
            a.pivotType = cp.pivotType;
            a.blendMode = [null, "lighter", "blend5-1", "blend4-1", "blend4-7", "blend4-4"][cp.blendMode];
            a.flip = cp.flip;
        }
        // 过渡模式：由于注册了帧刷，需要清理
        else {
            // 下一帧开始移动 1/MAX
            let m: ImageMoveParams = {
                time: cp.time,
                curTime: 1,
                x: a.dpX,
                y: a.dpY,
                z: a.dpZ,
                width: a.dpWidth,
                height: a.dpHeight,
                rotation: a.rotation1,
                opacity: a.opacity,
                x2: toDpX - a.dpX,
                y2: toDpY - a.dpY,
                z2: toDpZ - a.dpZ,
                width2: toDpWidth - a.dpWidth,
                height2: toDpHeight - a.dpHeight,
                rotation2: toRotation - a.rotation1,
                opacity2: toOpacity - a.opacity,
                pivotType2: cp.pivotType,
                blendMode2: cp.blendMode,
                flip2: cp.flip,
                transData: GameUtils.getTransData(cp.trans)
            }
            let thisPtr = {};
            GameImageLayer.regPassageFrameUpdate(passageID, gcImageMoveFrameUpdate, thisPtr, [a, m, passageID, sign], sign);
            // 立刻开始执行一帧
            gcImageMoveFrameUpdate.apply(thisPtr, [a, m, passageID, sign]);
        }
    }
    /**
     * 移动图像层相机
     */
    export function customCommand_3003(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_3003): void {
        let passageID = 10001;
        // 标识：用于注册图像层帧刷时的标识，以便可用此标识取消该类型帧刷
        let sign = "gcCameraMove";
        // 清理同一个通道的移动图像效果
        GameImageLayer.clearPassageFrameUpdate(passageID, sign);
        let tocameraX = cp.xUseVar ? Game.player.variable.getVariable(cp.cameraXVar) : cp.cameraX;
        let tocameraY = cp.yUseVar ? Game.player.variable.getVariable(cp.cameraYVar) : cp.cameraY;
        let tocameraZ = cp.zUseVar ? Game.player.variable.getVariable(cp.cameraZVar) : cp.cameraZ;
        let tocameraRotation = cp.roUseVar ? Game.player.variable.getVariable(cp.cameraRotationVar) : cp.cameraRotation;
        let imageLayer = Game.layer.imageLayer;
        let m: ImageLayerCameraMoveParams = {
            time: cp.time,
            curTime: 1,
            x: imageLayer.camera.viewPort.x,
            y: imageLayer.camera.viewPort.y,
            z: imageLayer.camera.z,
            rotation: imageLayer.camera.rotation,
            x2: tocameraX - imageLayer.camera.viewPort.x,
            y2: tocameraY - imageLayer.camera.viewPort.y,
            z2: tocameraZ - imageLayer.camera.z,
            rotation2: tocameraRotation - imageLayer.camera.rotation,
            transData: GameUtils.getTransData(cp.trans)
        }
        // 立即模式
        if (cp.timeType == 0) {
            imageLayer.camera.viewPort.x = tocameraX;
            imageLayer.camera.viewPort.y = tocameraY;
            imageLayer.camera.z = tocameraZ;
            imageLayer.camera.rotation = tocameraRotation;
        }
        else {
            let thisPtr = {};
            GameImageLayer.regPassageFrameUpdate(passageID, gcCameraMoveFrameUpdate, thisPtr, [null, m, passageID, sign], sign);
            // 立刻开始执行一帧
            gcCameraMoveFrameUpdate.apply(thisPtr, [null, m, passageID, sign]);
        }
    }
    /**
     * 显示动画
     */
    export function customCommand_3004(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_3004): void {
        // 获取通道
        let passageID = cp.passageIDUseVar ? Game.player.variable.getVariable(cp.passageIDVar) : cp.passageID;
        passageID = MathUtils.int(passageID);
        // 清理通道
        GameImageLayer.deletePassage(passageID);
        // 获取属性
        let animationID = cp.objectUseVar ? Game.player.variable.getVariable(cp.animationVar) : cp.animation;
        let toDpX: number, toDpY: number, toDpScaleX: number, toDpScaleY: number;
        if (cp.posUseVar) {
            toDpX = Game.player.variable.getVariable(cp.dpXVar);
            toDpY = Game.player.variable.getVariable(cp.dpYVar);
        }
        else {
            toDpX = cp.dpX;
            toDpY = cp.dpY;
        }
        let toDpZ = cp.zUseVar ? Game.player.variable.getVariable(cp.dpZVar) : cp.dpZ;
        if (cp.sizeUseVar) {
            toDpScaleX = Game.player.variable.getVariable(cp.dpScaleXVar);
            toDpScaleY = Game.player.variable.getVariable(cp.dpScaleYVar);
        }
        else {
            toDpScaleX = cp.dpScaleX;
            toDpScaleY = cp.dpScaleY;
        }
        let toRotation = cp.rotationUseVar ? Game.player.variable.getVariable(cp.rotationVar) : cp.rotation;
        let toOpacity = cp.opacityUseVar ? Game.player.variable.getVariable(cp.opacityVar) : cp.opacity;
        let aniFrame = cp.aniFrameUseVar ? Game.player.variable.getVariable(cp.aniFrameVar) : cp.aniFrame;
        // 创建图片显示对象
        let a = new UIAnimation();
        a.animation.syncLoadWhenAssetExist = true;
        a.useDPCoordScaleMode = true;
        a.dpDisplayPriority = passageID;
        a.animationID = animationID;
        // 设置通道由该显示对象占用
        GameImageLayer.setImageSprite(passageID, a);
        Game.layer.imageLayer.addChild(a);
        a.useDPCoord = true;
        a.dpX = toDpX;
        a.dpY = toDpY;
        a.dpZ = toDpZ;
        a.dpScaleX = toDpScaleX;
        a.dpScaleY = toDpScaleY;
        a.rotation1 = toRotation;
        a.opacity = toOpacity;
        a.silentMode = cp.silentMode;
        a.showHitEffect = cp.showHitEffect;
        a.playFps = cp.playFps;
        a.aniFrame = aniFrame;
        a.playType = cp.playType;
        // 刷新坐标
        a.dpCoordToRealCoord();

    }
    /**
     * 移动动画
     */
    export function customCommand_3005(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_3005): void {
        // 获取通道
        let passageID = cp.passageIDUseVar ? Game.player.variable.getVariable(cp.passageIDVar) : cp.passageID;
        passageID = MathUtils.int(passageID);
        // 获取通道显示对象
        let a: UIAnimation = GameImageLayer.getImageSprite(passageID) as any;
        if (!a || !(a instanceof UIAnimation)) return;
        // 标识：用于注册图像层帧刷时的标识，以便可用此标识取消该类型帧刷
        let sign = "gcAnimationMove";
        // 清理同一个通道的移动图像效果
        GameImageLayer.clearPassageFrameUpdate(passageID, sign);
        // 获取属性
        let toDpX: number, toDpY: number, toDpScaleX: number, toDpScaleY: number;
        if (cp.posUseVar) {
            toDpX = Game.player.variable.getVariable(cp.dpXVar);
            toDpY = Game.player.variable.getVariable(cp.dpYVar);
        }
        else {
            toDpX = cp.dpX;
            toDpY = cp.dpY;
        }
        let toDpZ = cp.zUseVar ? Game.player.variable.getVariable(cp.dpZVar) : cp.dpZ;
        if (cp.sizeUseVar) {
            toDpScaleX = Game.player.variable.getVariable(cp.dpScaleXVar);
            toDpScaleY = Game.player.variable.getVariable(cp.dpScaleYVar);
        }
        else {
            toDpScaleX = cp.dpScaleX;
            toDpScaleY = cp.dpScaleY;
        }
        let toRotation = cp.rotationUseVar ? Game.player.variable.getVariable(cp.rotationVar) : cp.rotation;
        let toOpacity = cp.opacityUseVar ? Game.player.variable.getVariable(cp.opacityVar) : cp.opacity;
        let toFrame = cp.frameUseVar ? Game.player.variable.getVariable(cp.aniFrameVar) : cp.aniFrame;
        // 立即模式：无需清理此行为
        if (cp.timeType == 0) {
            a.dpX = toDpX;
            a.dpY = toDpY;
            a.dpZ = toDpZ;
            a.dpScaleX = toDpScaleX;
            a.dpScaleY = toDpScaleY;
            a.rotation1 = toRotation;
            a.opacity = toOpacity;
            if (cp.changeFrame) a.aniFrame = toFrame;
            a.dpCoordToRealCoord();
        }
        // 过渡模式：由于注册了帧刷，需要清理
        else {
            // 下一帧开始移动 1/MAX
            let m: AnimationMoveParams = {
                time: cp.time,
                curTime: 1,
                x: a.dpX,
                y: a.dpY,
                z: a.dpZ,
                scaleX: a.dpScaleX,
                scaleY: a.dpScaleY,
                rotation: a.rotation1,
                opacity: a.opacity,
                aniFrame: a.aniFrame,
                x2: toDpX - a.dpX,
                y2: toDpY - a.dpY,
                z2: toDpZ - a.dpZ,
                scaleX2: toDpScaleX - a.dpScaleX,
                scaleY2: toDpScaleY - a.dpScaleY,
                rotation2: toRotation - a.rotation1,
                opacity2: toOpacity - a.opacity,
                aniFrame2: toFrame - a.aniFrame,
                transData: GameUtils.getTransData(cp.trans)
            }
            let thisPtr = {};
            GameImageLayer.regPassageFrameUpdate(passageID, gcAnimationMoveFrameUpdate, thisPtr, [a, m, passageID, sign, cp.changeFrame], sign);
            // 立刻开始执行一帧
            gcAnimationMoveFrameUpdate.apply(thisPtr, [a, m, passageID, sign, cp.changeFrame]);
        }
    }
    /**
     * 显示立绘
     */
    export function customCommand_3006(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_3006): void {
        // 获取通道
        let passageID = cp.passageIDUseVar ? Game.player.variable.getVariable(cp.passageIDVar) : cp.passageID;
        passageID = MathUtils.int(passageID);
        // 清理通道
        GameImageLayer.deletePassage(passageID);
        // 获取属性
        let standAvatarID = cp.objectUseVar ? Game.player.variable.getVariable(cp.standAvatarVar) : cp.standAvatar;
        let toDpX: number, toDpY: number, toDpScaleX: number, toDpScaleY: number;
        if (cp.posUseVar) {
            toDpX = Game.player.variable.getVariable(cp.dpXVar);
            toDpY = Game.player.variable.getVariable(cp.dpYVar);
        }
        else {
            toDpX = cp.dpX;
            toDpY = cp.dpY;
        }
        let toDpZ = cp.zUseVar ? Game.player.variable.getVariable(cp.dpZVar) : cp.dpZ;
        if (cp.sizeUseVar) {
            toDpScaleX = Game.player.variable.getVariable(cp.dpScaleXVar);
            toDpScaleY = Game.player.variable.getVariable(cp.dpScaleYVar);
        }
        else {
            toDpScaleX = cp.dpScaleX;
            toDpScaleY = cp.dpScaleY;
        }
        let toRotation = cp.rotationUseVar ? Game.player.variable.getVariable(cp.rotationVar) : cp.rotation;
        let toOpacity = cp.opacityUseVar ? Game.player.variable.getVariable(cp.opacityVar) : cp.opacity;
        let avatarFrame = cp.frameUseVar ? Game.player.variable.getVariable(cp.avatarFrameVar) : cp.avatarFrame;
        let expression = cp.expressionUseVar ? Game.player.variable.getVariable(cp.expressionVar) : cp.expression;
        //
        // 创建图片显示对象
        let a = new UIStandAvatar();
        a.avatar.syncLoadWhenAssetExist = true;
        // 设定显示优先度，以便在同Z轴时，编号越大，显示在越前方
        a.useDPCoordScaleMode = true;
        a.dpDisplayPriority = passageID;
        a.avatarID = standAvatarID;
        // 设置通道由该显示对象占用
        GameImageLayer.setImageSprite(passageID, a);
        Game.layer.imageLayer.addChild(a);
        a.useDPCoord = true;
        a.dpX = toDpX;
        a.dpY = toDpY;
        a.dpZ = toDpZ;
        a.dpScaleX = toDpScaleX;
        a.dpScaleY = toDpScaleY;
        a.rotation1 = toRotation;
        a.opacity = toOpacity;
        a.playOnce = cp.playType == 1;


        a.avatarFPS = cp.avatarFPS;
        a.avatarFrame = avatarFrame;
        a.actionID = expression
        a.isPlay = cp.playType != 0;
        // 刷新坐标
        a.dpCoordToRealCoord();

    }
    /**
     * 移动立绘
     */
    export function customCommand_3007(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_3007): void {
        // 获取通道
        let passageID = cp.passageIDUseVar ? Game.player.variable.getVariable(cp.passageIDVar) : cp.passageID;
        passageID = MathUtils.int(passageID);
        // 获取通道显示对象
        let a: UIStandAvatar = GameImageLayer.getImageSprite(passageID) as any;
        if (!a || !(a instanceof UIStandAvatar)) return;
        // 标识：用于注册图像层帧刷时的标识，以便可用此标识取消该类型帧刷
        let sign = "gcStandAvatarMove";
        // 清理同一个通道的移动图像效果
        GameImageLayer.clearPassageFrameUpdate(passageID, sign);
        let toDpX: number, toDpY: number, toDpScaleX: number, toDpScaleY: number;
        // 获取属性
        if (cp.posUseVar) {
            toDpX = Game.player.variable.getVariable(cp.dpXVar);
            toDpY = Game.player.variable.getVariable(cp.dpYVar);
        }
        else {
            toDpX = cp.dpX;
            toDpY = cp.dpY;
        }
        let toDpZ = cp.zUseVar ? Game.player.variable.getVariable(cp.dpZVar) : cp.dpZ;
        if (cp.sizeUseVar) {
            toDpScaleX = Game.player.variable.getVariable(cp.dpScaleXVar);
            toDpScaleY = Game.player.variable.getVariable(cp.dpScaleYVar);
        }
        else {
            toDpScaleX = cp.dpScaleX;
            toDpScaleY = cp.dpScaleY;
        }
        let toRotation = cp.rotationUseVar ? Game.player.variable.getVariable(cp.rotationVar) : cp.rotation;
        let toOpacity = cp.opacityUseVar ? Game.player.variable.getVariable(cp.opacityVar) : cp.opacity;
        let avatarFrame = cp.frameUseVar ? Game.player.variable.getVariable(cp.avatarFrameVar) : cp.avatarFrame;
        let expression = cp.expressionUseVar ? Game.player.variable.getVariable(cp.expressionVar) : cp.expression;
        // 立即模式：无需清理此行为
        if (cp.timeType == 0) {
            a.dpX = toDpX;
            a.dpY = toDpY;
            a.dpZ = toDpZ;
            a.dpScaleX = toDpScaleX;
            a.dpScaleY = toDpScaleY;
            a.rotation1 = toRotation;
            a.opacity = toOpacity;
            if (cp.changeExpression) {
                a.avatar.actionID = expression;
            }
            if (cp.changeFrame) {
                a.avatarFrame = avatarFrame;
            }
            a.dpCoordToRealCoord();
        }
        // 过渡模式：由于注册了帧刷，需要清理
        else {
            // 下一帧开始移动 1/MAX
            // GameUtils.getValueByTransData(null, );
            let m: StandAvatarMoveParams = {
                time: cp.time,
                curTime: 1,
                x: a.dpX,
                y: a.dpY,
                z: a.dpZ,
                scaleX: a.dpScaleX,
                scaleY: a.dpScaleY,
                rotation: a.rotation1,
                opacity: a.opacity,
                avatarFrame: a.avatarFrame,
                x2: toDpX - a.dpX,
                y2: toDpY - a.dpY,
                z2: toDpZ - a.dpZ,
                scaleX2: toDpScaleX - a.dpScaleX,
                scaleY2: toDpScaleY - a.dpScaleY,
                rotation2: toRotation - a.rotation1,
                opacity2: toOpacity - a.opacity,
                transData: GameUtils.getTransData(cp.trans),
                actionID: expression,
                avatarFrame2: avatarFrame - a.avatarFrame,
                changeExpression: cp.changeExpression,
                changeFrame: cp.changeFrame
            }
            let thisPtr = {};
            GameImageLayer.regPassageFrameUpdate(passageID, gcStandAvatarMoveFrameUpdate, thisPtr, [a, m, passageID, sign], sign);
            // 立刻开始执行一帧
            gcStandAvatarMoveFrameUpdate.apply(thisPtr, [a, m, passageID, sign]);
        }
    }
    /**
     * 清理图像
     */
    export function customCommand_3008(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_3008): void {
        // 获取通道
        let passageID = cp.passageIDUseVar ? Game.player.variable.getVariable(cp.passageIDVar) : cp.passageID;
        passageID = MathUtils.int(passageID);
        // 派发清理事件
        let a = GameImageLayer.getImageSprite(passageID);
        if (a) a.event(`___deletePassage`);
        // 清理通道
        GameImageLayer.deletePassage(passageID);
    }
    /**
     * 自动旋转
     */
    export function customCommand_3009(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_3009): void {
        // 获取通道
        let passageID = cp.passageIDUseVar ? Game.player.variable.getVariable(cp.passageIDVar) : cp.passageID;
        passageID = MathUtils.int(passageID);
        // 获取通道显示对象
        let a: GameSprite = GameImageLayer.getImageSprite(passageID) as any;
        if (!a || !(a instanceof GameSprite)) return;
        // 标识：用于注册图像层帧刷时的标识，以便可用此标识取消该类型帧刷
        let sign = "gcImageSpriteRotationMove";
        // 清理同一个通道的移动图像效果
        GameImageLayer.clearPassageFrameUpdate(passageID, sign);
        // 如果不存在的话
        if (cp.rotation != 0) {
            let thisPtr = {};
            GameImageLayer.regPassageFrameUpdate(passageID, gcGameSpriteRotationMoveFrameUpdate, thisPtr, [a, cp.rotation, passageID, sign], sign);
            // 立刻开始执行一帧
            gcGameSpriteRotationMoveFrameUpdate.apply(thisPtr, [a, cp.rotation, passageID, sign]);
        }
    }
    /**
     * 显示界面
     */
    export function customCommand_3010(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_3010): void {
        // 获取通道
        let passageID = cp.passageIDUseVar ? Game.player.variable.getVariable(cp.passageIDVar) : cp.passageID;
        passageID = MathUtils.int(passageID);
        // 界面ID
        let uiID = cp.objectUseVar ? Game.player.variable.getVariable(cp.uiVar) : cp.uiID;
        // -- 图像层的场合
        if (cp.showType == 1) {
            passageID = cp.passageIDUseVar ? Game.player.variable.getVariable(cp.passageIDVar) : cp.passageID;
        }
        // -- 界面层的场合
        else {
            passageID = 1000000 + uiID;
        }
        // 清理通道
        // GameImageLayer.deletePassage(passageID);
        // 获取属性
        let toDpX: number, toDpY: number, toDpScaleX: number, toDpScaleY: number;
        if (cp.posUseVar) {
            toDpX = Game.player.variable.getVariable(cp.dpXVar);
            toDpY = Game.player.variable.getVariable(cp.dpYVar);
        }
        else {
            toDpX = cp.dpX;
            toDpY = cp.dpY;
        }
        let toDpZ = cp.zUseVar ? Game.player.variable.getVariable(cp.dpZVar) : cp.dpZ;
        if (cp.sizeUseVar) {
            toDpScaleX = Game.player.variable.getVariable(cp.dpScaleXVar);
            toDpScaleY = Game.player.variable.getVariable(cp.dpScaleYVar);
        }
        else {
            toDpScaleX = cp.dpScaleX;
            toDpScaleY = cp.dpScaleY;
        }
        let toRotation = cp.rotationUseVar ? Game.player.variable.getVariable(cp.rotationVar) : cp.rotation;
        let toOpacity = cp.opacityUseVar ? Game.player.variable.getVariable(cp.opacityVar) : cp.opacity;
        // 创建图片显示对象
        let a = GameUI.load(uiID, cp.showType == 1);
        // a.syncLoadWhenAssetExist = true;
        // 设定显示优先度，以便在同Z轴时，编号越大，显示在越前方
        a.useDPCoordScaleMode = true;
        // 设置通道由该显示对象占用
        GameImageLayer.setImageSprite(passageID, a);
        if (cp.showType == 1) {
            Game.layer.imageLayer.addChild(a);
            a.dpDisplayPriority = passageID;
            a.useDPCoord = true;
            if (cp.setAttr) {
                a.dpX = toDpX;
                a.dpY = toDpY;
                a.dpZ = toDpZ;
                a.dpScaleX = toDpScaleX;
                a.dpScaleY = toDpScaleY;
                a.rotation1 = toRotation;
                a.opacity = toOpacity;
            }
            // 刷新坐标
            a.dpCoordToRealCoord();
        }
        else {
            GameUI.show(uiID);
            if (cp.setAttr) {
                a.x = toDpX;
                a.y = toDpY;
                a.scaleX = toDpScaleX;
                a.scaleY = toDpScaleY;
                a.rotation1 = toRotation;
                a.opacity = toOpacity;
            }
        }

    }
    /**
     * 移动界面
     */
    export function customCommand_3011(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_3011): void {
        // 获取通道
        let passageID = cp.passageIDUseVar ? Game.player.variable.getVariable(cp.passageIDVar) : cp.passageID;
        passageID = MathUtils.int(passageID);
        // 界面ID
        let uiID = cp.objectUseVar ? Game.player.variable.getVariable(cp.uiVar) : cp.uiID;
        // -- 图像层的场合
        if (cp.showType == 1) {
            passageID = cp.passageIDUseVar ? Game.player.variable.getVariable(cp.passageIDVar) : cp.passageID;
        }
        // -- 界面层的场合
        else {
            passageID = 1000000 + uiID;
        }
        // 获取通道显示对象
        let a: GUI_BASE = GameImageLayer.getImageSprite(passageID) as any;
        if (!a || !(a instanceof GUI_BASE)) return;
        // 标识：用于注册图像层帧刷时的标识，以便可用此标识取消该类型帧刷
        let sign = "gcUIMove";
        // 清理同一个通道的移动图像效果
        GameImageLayer.clearPassageFrameUpdate(passageID, sign);
        // 获取属性
        let toDpX: number, toDpY: number, toDpScaleX: number, toDpScaleY: number;
        if (cp.posUseVar) {
            toDpX = Game.player.variable.getVariable(cp.dpXVar);
            toDpY = Game.player.variable.getVariable(cp.dpYVar);
        }
        else {
            toDpX = cp.dpX;
            toDpY = cp.dpY;
        }
        let toDpZ = cp.zUseVar ? Game.player.variable.getVariable(cp.dpZVar) : cp.dpZ;
        if (cp.sizeUseVar) {
            toDpScaleX = Game.player.variable.getVariable(cp.dpScaleXVar);
            toDpScaleY = Game.player.variable.getVariable(cp.dpScaleYVar);
        }
        else {
            toDpScaleX = cp.dpScaleX;
            toDpScaleY = cp.dpScaleY;
        }
        let toRotation = cp.rotationUseVar ? Game.player.variable.getVariable(cp.rotationVar) : cp.rotation;
        let toOpacity = cp.opacityUseVar ? Game.player.variable.getVariable(cp.opacityVar) : cp.opacity;
        //
        // 立即模式：无需清理此行为
        if (cp.timeType == 0) {
            if (cp.showType == 1) {
                a.dpX = toDpX;
                a.dpY = toDpY;
                a.dpZ = toDpZ;
                a.dpScaleX = toDpScaleX;
                a.dpScaleY = toDpScaleY;
                a.dpCoordToRealCoord();
            }
            else {
                a.x = toDpX;
                a.y = toDpY;
                a.scaleX = toDpScaleX;
                a.scaleY = toDpScaleY;
            }
            a.rotation1 = toRotation;
            a.opacity = toOpacity;
        }
        // 过渡模式：由于注册了帧刷，需要清理
        else {
            // 下一帧开始移动 1/MAX
            // GameUtils.getValueByTransData(null, );
            let cX: number, cY: number, cScaleX: number, cScaleY: number;
            if (cp.showType == 1) {
                cX = a.dpX;
                cY = a.dpY;
                cScaleX = a.dpScaleX;
                cScaleY = a.dpScaleY;
            }
            else {
                cX = a.x;
                cY = a.y;
                cScaleX = a.scaleX;
                cScaleY = a.scaleY;
            }
            let m: ScaleSpriteMoveParams = {
                time: cp.time,
                curTime: 1,
                x: cX,
                y: cY,
                z: a.dpZ,
                scaleX: cScaleX,
                scaleY: cScaleY,
                rotation: a.rotation1,
                opacity: a.opacity,
                x2: toDpX - cX,
                y2: toDpY - cY,
                z2: toDpZ - a.dpZ,
                scaleX2: toDpScaleX - cScaleX,
                scaleY2: toDpScaleY - cScaleY,
                rotation2: toRotation - a.rotation1,
                opacity2: toOpacity - a.opacity,
                transData: GameUtils.getTransData(cp.trans)
            }
            let thisPtr = {};
            GameImageLayer.regPassageFrameUpdate(passageID, gcUIMoveFrameUpdate, thisPtr, [a, m, passageID, sign], sign);
            // 立刻开始执行一帧
            gcUIMoveFrameUpdate.apply(thisPtr, [a, m, passageID, sign]);
        }
    }
    /**
     * 关闭界面
     */
    export function customCommand_3012(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_3012): void {
        // -- 图像层的场合
        if (cp.showType == 1) {
            // 获取通道
            let passageID = cp.passageIDUseVar ? Game.player.variable.getVariable(cp.passageIDVar) : cp.passageID;
            passageID = MathUtils.int(passageID);
            passageID = cp.passageIDUseVar ? Game.player.variable.getVariable(cp.passageIDVar) : cp.passageID;
            GameImageLayer.deletePassage(passageID);
        }
        // -- 界面层的场合
        else {
            let uiID = cp.objectUseVar ? Game.player.variable.getVariable(cp.uiVar) : cp.uiID;
            GameUI.hide(uiID);
        }
    }
    /**
     * 移动界面元件
     */
    export function customCommand_3013(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_3013): void {
        // 解析移动数据
        if (!cp.changeUIAttr || !Array.isArray(cp.changeUIAttr)) return;
        let cmdParam = cp.changeUIAttr[1];
        if (!cmdParam) return;
        let atts: { uiID: number, atts: { [compID: string]: [number, { [attrName: string]: any }] } } = cmdParam[2];
        if (!atts || !atts.uiID) return;
        // 获取通道
        let uiID = atts.uiID;
        // -- 图像层的场合
        let passageID = 1000000 + uiID;
        // 获取通道显示对象
        //@ts-ignore
        let a: GUI_BASE = GameImageLayer.getImageSprite(passageID) as any;
        //@ts-ignore
        if (!a || !(a instanceof GUI_BASE)) return;
        // 标识：由于移动界面元件支持对同一个界面多次叠加，此处sign则是唯一
        let sign = "gcUICompMove" + ObjectUtils.getRandID();
        // 立即模式：无需清理此行为
        if (cmdParam[5] == 0) {
            let comps = GameUI.getAllCompChildren(a, true);
            for (let compID in atts.atts) {
                let uiComp = comps.keyValue[compID];
                if (uiComp) {
                    let attsValues = atts.atts[compID][1];
                    //@ts-ignore
                    let useVarAndTransitionAttrs = atts.atts[compID][2];
                    for (let attName in attsValues) {
                        let attValue = attsValues[attName];
                        //同步材质
                        if (attName == "materialData") {
                            refreshCompMaterials.apply({}, [attValue, uiComp]);
                        } else {
                            //变量
                            //@ts-ignore
                            if (useVarAndTransitionAttrs && useVarAndTransitionAttrs[attName].type != null) {
                                //@ts-ignore
                                if (useVarAndTransitionAttrs[attName].type == 0) {
                                    //@ts-ignore
                                    attValue = Game.player.variable.getVariable(useVarAndTransitionAttrs[attName].index);
                                }
                                //@ts-ignore
                                else if (useVarAndTransitionAttrs[attName].type == 1) {
                                    //@ts-ignore
                                    attValue = Game.player.variable.getString(useVarAndTransitionAttrs[attName].index);
                                }
                                //@ts-ignore
                                else if (useVarAndTransitionAttrs[attName].type == 2) {
                                    //@ts-ignore
                                    attValue = Game.player.variable.getSwitch(useVarAndTransitionAttrs[attName].index) ? true : false;
                                }
                            }
                            // 字符串变量（设置成字符串仅根据当前的值而非绑定字符串）
                            if (typeof attValue == "string") {
                                let strVarID = GameUtils.getVarID(attValue);
                                if (strVarID != 0) {
                                    attValue = Game.player.variable.getString(strVarID);
                                }
                                else {
                                    //@ts-ignore
                                    let globalStrVarID = GameUtils.getGlobalVarID(attValue);
                                    if (globalStrVarID != 0) {
                                        attValue = ClientWorld.variable.getString(globalStrVarID);
                                    }
                                }
                            }
                            uiComp[attName] = attValue;
                        }
                    }
                }
            }
        }
        else {
            let m = {
                time: cmdParam[0],
                curTime: 1,
                transData: GameUtils.getTransData(cmdParam[1]),
                attrInfos: []
            }
            let comps = GameUI.getAllCompChildren(a, true);
            for (let compID in atts.atts) {
                let uiComp = comps.keyValue[compID];
                if (uiComp) {
                    let attsValues = atts.atts[compID][1];
                    //@ts-ignore
                    let useVarAndTransitionAttrs = atts.atts[compID][2];
                    for (let attName in attsValues) {
                        let oldValue = uiComp[attName];
                        let needTween = typeof oldValue == "number";
                        if (attName == "materialData") needTween = true;
                        //@ts-ignore
                        let useVarAndTransition: { index: number, change: boolean, type: number } = useVarAndTransitionAttrs[attName];
                        if (useVarAndTransition) {
                            // 如果并非过渡渐变的话则表示立即变更，效果会受到「无法渐变的属性处理」影响
                            if (!useVarAndTransition.change) {
                                needTween = false;
                            }
                        }
                        let newValue = attsValues[attName];
                        //变量
                        //@ts-ignore
                        if (useVarAndTransitionAttrs && useVarAndTransitionAttrs[attName].type != null) {
                            //@ts-ignore
                            if (useVarAndTransitionAttrs[attName].type == 0) {
                                //@ts-ignore
                                newValue = Game.player.variable.getVariable(useVarAndTransitionAttrs[attName].index);
                            }
                            //@ts-ignore
                            else if (useVarAndTransitionAttrs[attName].type == 1) {
                                //@ts-ignore
                                newValue = Game.player.variable.getString(useVarAndTransitionAttrs[attName].index);
                            }
                            //@ts-ignore
                            else if (useVarAndTransitionAttrs[attName].type == 2) {
                                //@ts-ignore
                                newValue = Game.player.variable.getSwitch(useVarAndTransitionAttrs[attName].index) ? true : false;
                            }
                        }
                        let attrInfo = { uiComp: uiComp, uiCompID: uiComp.id, attName: attName, oldValue: oldValue, needTween: needTween, newValue: newValue };
                        //@ts-ignore
                        m.attrInfos.push(attrInfo);
                    }
                }
            }
            //
            let thisPtr = {};
            GameImageLayer.regPassageFrameUpdate(passageID, gcUICompMoveFrameUpdate, thisPtr, [a, m, passageID, sign, cmdParam[3]], sign);
            // 立刻开始执行一帧
            gcUICompMoveFrameUpdate.apply(thisPtr, [a, m, passageID, sign, cmdParam[3]]);
        }
    }
    /**
     * 添加材质
     */
    export function customCommand_3014(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_3014): void {
        // 材质数据设置，格式：[{ materials: [] },{ materials: [] }]  渲染用的materialData不更改，其他数组等容器复制
        let materialData = [];
        for (let i = 0; i < cp.materialData.length; i++) {
            let md = { materials: cp.materialData[i].materials.concat() };
            materialData.push(md);
        }
        // -- 图像层
        if (cp.targetType == 0) {
            addMaterialToLayer(Game.layer.imageLayer);
        }
        // -- 指定的图像编号
        else if (cp.targetType == 1) {
            let imagePassageID = cp.passageIDUseVar ? Game.player.variable.getVariable(cp.passageIDVar) : cp.passageID;
            let imagePassageInfos = { passageID: imagePassageID, materialSetting: materialData };
            // 获取通道显示对象
            let a: GameSprite = GameImageLayer.getImageSprite(imagePassageID) as any;
            if (!a || !(a instanceof GameSprite)) return;
            // 遍历所有的通道
            for (let p = 0; p < imagePassageInfos.materialSetting.length; p++) {
                let materialSetting = imagePassageInfos.materialSetting[p];
                // 遍历所有的材质
                for (let s = 0; s < materialSetting.materials.length; s++) {
                    let mData: MaterialData = materialSetting.materials[s];
                    mData.____timeInfo = {};
                    let m = a.getMaterialByID(mData.id, p);
                    // 如果已存在的话需要移除掉，替换新的同ID材质
                    if (m) a.removeMaterial(mData, p);
                    a.addMaterial(mData, p);
                    a.setMaterialDirty();
                }
            }
        }
        // -- 指定的界面
        else if (cp.targetType == 2) {
            let uiID = cp.objectUseVar ? Game.player.variable.getVariable(cp.uiVar) : cp.uiID;
            let uiPassageInfos = { uiID: uiID, materialSetting: materialData };
            let targetPassageID = 1000000 + uiPassageInfos.uiID;
            // 获取界面
            let b: GUI_BASE = GameImageLayer.getImageSprite(targetPassageID) as any;
            if (!b || !(b instanceof GUI_BASE)) return;
            // 遍历所有的通道
            for (let p = 0; p < uiPassageInfos.materialSetting.length; p++) {
                let materialSetting = uiPassageInfos.materialSetting[p];
                // 遍历所有的材质
                for (let s = 0; s < materialSetting.materials.length; s++) {
                    let mData: MaterialData = materialSetting.materials[s];
                    mData.____timeInfo = {};
                    let m = b.getMaterialByID(mData.id, p);
                    // 如果已存在的话需要移除掉，替换新的同ID材质
                    if (m) b.removeMaterial(mData, p);
                    b.addMaterial(mData, p);
                    b.setMaterialDirty();
                }
            }
        }
        // -- 界面层
        else if (cp.targetType == 3) {
            addMaterialToLayer(Game.layer.uiLayer);
        }
        // -- 全画面
        else if (cp.targetType == 4) {
            addMaterialToLayer(Game.layer);
        }
        // -- 场景层
        else if (cp.targetType == 5) {
            addMaterialToLayer(Game.layer.sceneLayer);
        }
        function addMaterialToLayer(layer: GameSprite): void {
            let stageInfos = materialData;
            // 遍历所有的通道
            for (let p = 0; p < stageInfos.length; p++) {
                let stageInfo = stageInfos[p];
                // 遍历所有的材质
                for (let s = 0; s < stageInfo.materials.length; s++) {
                    let mData: MaterialData = stageInfo.materials[s];
                    mData.____timeInfo = {};
                    let m = layer.getMaterialByID(mData.id, p);
                    // 如果已存在的话需要移除掉，替换新的同ID材质
                    if (m) layer.removeMaterial(mData, p);
                    layer.addMaterial(mData, p);
                }
            }
        }
    }
    /**
     * 更改材质：同添加材质
     */
    export function customCommand_3015(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_3015): void {
        customCommand_3014.apply(this, arguments);
    }
    /**
     * 删除材质
     */
    export function customCommand_3016(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_3016): void {
        let cmdParams = cp;
        if (cmdParams.targetType == 0) {
            clearLayerMaterials(Game.layer.imageLayer);
        }
        // // -- 指定的图像编号
        else if (cmdParams.targetType == 1) {
            let imagePassageID = cmdParams.passageIDUseVar ? Game.player.variable.getVariable(cp.passageIDVar) : cmdParams.passageID;
            // 获取通道显示对象
            let a: GameSprite = GameImageLayer.getImageSprite(imagePassageID) as any;
            if (!a || !(a instanceof GameSprite)) return;
            if (cmdParams.clearType == 1) {
                a.removeMaterialByID(cp.materialID, cp.materialPassage);
            }
            else {
                a.clearMaterials();
            }
        }
        // -- 指定的界面
        else if (cmdParams.targetType == 2) {
            let uiID = cp.objectUseVar ? Game.player.variable.getVariable(cp.uiVar) : cp.uiID;
            let targetPassageID = 1000000 + uiID;
            // 获取界面
            let b: GUI_BASE = GameImageLayer.getImageSprite(targetPassageID) as any;
            if (!b || !(b instanceof GUI_BASE)) return;
            uiID = cmdParams.uiID;
            let uiPassageID = cmdParams.uiID + 1000000;
            if (cmdParams.clearType == 1) {
                b.removeMaterialByID(cp.materialID, cp.materialPassage);
            }
            else {
                b.clearMaterials();
            }
        }
        // -- 界面层
        else if (cp.targetType == 3) {
            clearLayerMaterials(Game.layer.uiLayer);
        }
        // -- 全画面
        else if (cp.targetType == 4) {
            clearLayerMaterials(Game.layer);
        }
        // -- 场景层
        else if (cp.targetType == 5) {
            clearLayerMaterials(Game.layer.sceneLayer);
        }
        function clearLayerMaterials(layer: GameSprite): void {
            if (cmdParams.clearType == 1) {
                // 遍历所有来自指令的添加
                layer.removeMaterialByID(cp.materialID, cp.materialPassage);
            }
            else {
                layer.clearMaterials();
            }
        }
    }
    /**
     * 显示视频
     */
    let startVideo: UIVideo;
    export function customCommand_3018(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_3018): void {
        // 获取通道
        let passageID = cp.passageIDUseVar ? Game.player.variable.getVariable(cp.passageIDVar) : cp.passageID;
        passageID = MathUtils.int(passageID);
        // 获取属性值
        let video = cp.objectUseVar ? Game.player.variable.getString(cp.videoVar) : cp.video;
        let dpX: number, dpY: number, dpWidth: number, dpHeight: number;
        if (cp.posUseVar) {
            dpX = Game.player.variable.getVariable(cp.dpXVar);
            dpY = Game.player.variable.getVariable(cp.dpYVar);
        }
        else {
            dpX = cp.dpX;
            dpY = cp.dpY;
        }
        let dpz = cp.zUseVar ? Game.player.variable.getVariable(cp.dpZVar) : cp.dpZ;
        if (cp.sizeUseVar) {
            dpWidth = Game.player.variable.getVariable(cp.dpWidthVar);
            dpHeight = Game.player.variable.getVariable(cp.dpHeightVar);
        }
        else {
            dpWidth = cp.dpWidth;
            dpHeight = cp.dpHeight;
        }
        let rotation = cp.rotationUseVar ? Game.player.variable.getVariable(cp.rotationVar) : cp.rotation;
        let opacity = cp.opacityUseVar ? Game.player.variable.getVariable(cp.opacityVar) : cp.opacity;
        // 创建显示对象
        let a = new UIVideo();
        startVideo = a;
        // 先暂停，等真正载入完毕时才继续
        trigger.pause = true;
        trigger.offset(1);
        a.once(EventObject.LOADED, this, () => {
            a.dpX = dpX;
            a.dpY = dpY;
            a.dpZ = dpz;
            a.dpWidth = dpWidth;
            a.dpHeight = dpHeight;
            a.rotation1 = rotation;
            a.opacity = opacity;
            a.flip = cp.flip;
            let currentTime = cp.currentTimeUseVar ? Game.player.variable.getVariable(cp.currentTimeVar) : cp.currentTime;
            a.muted = cp.muted;
            a.loop = cp.loop;
            a.volume = cp.volume;
            a.currentTime = currentTime;
            a.playbackRate = cp.playbackRate;
            a.playType = cp.playType;
            a.dpCoordToRealCoord();
            Game.layer.imageLayer.addChild(a);
            a.visible = false;
            if (a.playType != 0 || a.isPlaying) {
                GameImageLayer.deletePassage(passageID);
                // 设置通道由该显示对象占用
                GameImageLayer.setImageSprite(passageID, a);
                a.visible = true;
                CommandPage.executeEvent(trigger, []);
            }
            else {
                os.add_ENTERFRAME(() => {
                    if (a.isPlaying) {
                        setFrameout(() => {
                            GameImageLayer.deletePassage(passageID);
                            // 设置通道由该显示对象占用
                            GameImageLayer.setImageSprite(passageID, a);
                            CommandPage.executeEvent(trigger, []);
                            a.visible = true;
                            a.event(`Video_Real_Loaded`);
                        }, 1)
                        //@ts-ignore
                        os.remove_ENTERFRAME(arguments.callee, this);
                    }
                }, this);
            }
        })
        a.useDPCoord = true;
        a.dpDisplayPriority = passageID;
        a.videoURL = video;
        if (cp.blendMode != null) a.blendMode = [null, "lighter", "blend5-1", "blend4-1", "blend4-7", "blend4-4"][cp.blendMode];
    }
    /**
     * 移动视频
     */
    export function customCommand_3019(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_3019): void {
        // 获取通道
        let passageID = cp.passageIDUseVar ? Game.player.variable.getVariable(cp.passageIDVar) : cp.passageID;
        passageID = MathUtils.int(passageID);
        // 获取通道显示对象
        let a = GameImageLayer.getImageSprite(passageID) as UIVideo;
        if (!a || !(a instanceof UIBitmap)) {
            return;
        }
        // 标识：用于注册图像层帧刷时的标识，以便可用此标识取消该类型帧刷
        let sign = "gcVideoMove";
        // 清理同一个通道的移动图像效果
        GameImageLayer.clearPassageFrameUpdate(passageID, sign);
        // 获取属性
        let toDpX: number, toDpY: number, toDpWidth: number, toDpHeight: number;
        if (cp.posUseVar) {
            toDpX = Game.player.variable.getVariable(cp.dpXVar);
            toDpY = Game.player.variable.getVariable(cp.dpYVar);
        }
        else {
            toDpX = cp.dpX;
            toDpY = cp.dpY;
        }
        let toDpZ = cp.zUseVar ? Game.player.variable.getVariable(cp.dpZVar) : cp.dpZ;
        if (cp.sizeUseVar) {
            toDpWidth = Game.player.variable.getVariable(cp.dpWidthVar);
            toDpHeight = Game.player.variable.getVariable(cp.dpHeightVar);
        }
        else {
            toDpWidth = cp.dpWidth;
            toDpHeight = cp.dpHeight;
        }
        let toRotation = cp.rotationUseVar ? Game.player.variable.getVariable(cp.rotationVar) : cp.rotation;
        let toOpacity = cp.opacityUseVar ? Game.player.variable.getVariable(cp.opacityVar) : cp.opacity;
        let toCurrentTime = cp.changeStartTime ? (cp.currentTimeUseVar ? Game.player.variable.getVariable(cp.currentTimeVar) : cp.currentTime) : null;
        // 立即模式：无需清理此行为
        if (cp.timeType == 0) {
            a.dpX = toDpX;
            a.dpY = toDpY;
            a.dpZ = toDpZ;
            a.dpWidth = toDpWidth;
            a.dpHeight = toDpHeight;
            a.rotation = toRotation;
            a.opacity = toOpacity;
            a.flip = cp.flip;

            if (cp.playType != null && a.playType != cp.playType) a.playType = cp.playType;
            if (cp.muted != null) a.muted = cp.muted;
            if (cp.loop != null) a.loop = cp.loop;
            if (cp.playbackRate != null) a.playbackRate = cp.playbackRate;
            if (cp.changeStartTime) a.currentTime = toCurrentTime;
            if (cp.volume != null) a.volume = cp.volume;
            if (cp.blendMode != null) a.blendMode = [null, "lighter", "blend5-1", "blend4-1", "blend4-7", "blend4-4"][cp.blendMode];
        }
        // 过渡模式：由于注册了帧刷，需要清理
        else {
            // 下一帧开始移动 1/MAX
            let m: ImageMoveParams = {
                time: cp.time,
                curTime: 1,
                x: a.dpX,
                y: a.dpY,
                z: a.dpZ,
                width: a.dpWidth,
                height: a.dpHeight,
                rotation: a.rotation1,
                opacity: a.opacity,
                x2: toDpX - a.dpX,
                y2: toDpY - a.dpY,
                z2: toDpZ - a.dpZ,
                width2: toDpWidth - a.dpWidth,
                height2: toDpHeight - a.dpHeight,
                rotation2: toRotation - a.rotation1,
                opacity2: toOpacity - a.opacity,
                pivotType2: a.pivotType,
                blendMode2: cp.blendMode,
                flip2: cp.flip,
                transData: GameUtils.getTransData(cp.trans),
                volume: a.volume,
                currentTime: a.currentTime,
                volume2: cp.volume != null ? cp.volume - a.volume : null,
                currentTime2: toCurrentTime == null ? null : toCurrentTime - a.currentTime,
            }
            let thisPtr = {};
            GameImageLayer.regPassageFrameUpdate(passageID, gcImageMoveFrameUpdate, thisPtr, [a, m, passageID, sign], sign);
            // 立即更改
            if (cp.playType != null && a.playType != cp.playType) {
                a.playType = cp.playType;
            }
            if (cp.muted != null) a.muted = cp.muted;
            if (cp.loop != null) a.loop = cp.loop;
            if (cp.playbackRate != null) a.playbackRate = cp.playbackRate;
            // 立刻开始执行一帧
            gcImageMoveFrameUpdate.apply(thisPtr, [a, m, passageID, sign]);
        }
    }
    /**
     * 等待指定视频播放完成
     */
    export function customCommand_3021(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_3021): void {
        let passageID = cp.varType == 1 ? Game.player.variable.getVariable(cp.passageIDVar) : cp.passageID;
        let a = GameImageLayer.getImageSprite(passageID) as UIVideo;
        if (!a || !(a instanceof UIVideo)) {
            // -- 再次查询即将开始的UIVideo
            a = startVideo;
            if (!a) {
                return;
            }
            // -- 找到后等待真正加载完成
            else {
                startVideo = null;
                // 停止
                a.once(`Video_Real_Loaded`, this, doWaitVideo, [true]);
                return;
            }
        }
        function doWaitVideo(realLoaded: boolean = false) {
            // 如果被删除掉了
            a.once(`___deletePassage`, this, doNext);
            // 等待真正的加载完毕后
            if (realLoaded) {
                trigger.pause = true;
                trigger.offset(1);
                a.once(EventObject.COMPLETE, this, doNext, [trigger]);
            }
            // 未加载完成时先加载
            else if (isNaN(a.duration)) {
                a.once(EventObject.LOADED, this, () => {
                    a.once(EventObject.COMPLETE, this, doNext, [trigger]);
                });
            }
            else if (a.isPlaying) {
                // 等待播放完成后继续执行
                a.once(EventObject.COMPLETE, this, doNext, [trigger]);
            }
            else {
                doNext.apply(this);
            }
        }
        function doNext(): void {
            a.offAll(`___deletePassage`);
            if (trigger.pause) CommandPage.executeEvent(trigger, []);
        }
        // 停止
        trigger.pause = true;
        trigger.offset(1);
        doWaitVideo.apply(this);
    }
    /**
     * 记录监听的界面以及对应的触发器标识
     */
    let isWaitingUICloseInfos: { uiID: number, triggerMainType: number, triggerIndexType: number, triggerFrom: any }[] = []
    /**
     * 额外的存档标识
     */
    let extSaveSign: string = "waitCloseUIListener";
    /**
     * 等待指定界面关闭
     */
    export function customCommand_3020(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_3020): void {
        // 根据常量或变量或者界面编号
        let uiID = p.useVar == 1 ? Game.player.variable.getVariable(p.uiVar) : p.uiID;
        // 如果该界面已打开的话则暂停并监听关闭后继续事件
        if (GameUI.isOpened(uiID)) {
            trigger.pause = true;
            trigger.offset(1);
            listenerWhenUIClose(uiID, trigger);
        }
    }
    /**
     * 存档时保存额外的信息：记录正处于监听界面关闭的状态
     */
    SinglePlayerGame.regSaveCustomData(extSaveSign, Callback.New(() => {
        return isWaitingUICloseInfos;
    }, null));
    /**
     * 读档：重新恢复监听界面关闭的状态
     */
    EventUtils.addEventListener(SinglePlayerGame, SinglePlayerGame.EVENT_RECOVER_TRIGGER, Callback.New((trigger: CommandTrigger) => {
        let listers: { uiID: number, triggerMainType: number, triggerIndexType: number, from: any }[] = SinglePlayerGame.getSaveCustomData(extSaveSign);
        // 检查该触发器是否在listers中
        let lister = ArrayUtils.matchAttributes(listers, { triggerMainType: trigger.mainType, triggerIndexType: trigger.indexType, triggerFrom: trigger.from }, true)[0];
        if (lister) {
            listenerWhenUIClose(lister.uiID, trigger);
        }
    }, null));
    /**
     * 监听当窗口关闭时的状态
     * @param uiID 系统界面组中的界面编号
     * @param trigger 触发器
     */
    function listenerWhenUIClose(uiID: number, trigger: CommandTrigger) {
        // 添加监听记录至列表，以便读档后恢复
        let t = { uiID: uiID, triggerMainType: trigger.mainType, triggerIndexType: trigger.indexType, triggerFrom: trigger.from };
        isWaitingUICloseInfos.push(t);
        // 添加监听指定的界面关闭时事件
        EventUtils.addEventListenerFunction(GameUI, GameUI.EVENT_CLOSE_SYSTEM_UI, (closeUIID: number) => {
            if (closeUIID == uiID) {
                ArrayUtils.remove(isWaitingUICloseInfos, t);
                //@ts-ignore
                EventUtils.removeEventListenerFunction(GameUI, GameUI.EVENT_CLOSE_SYSTEM_UI, arguments.callee, this);
                CommandPage.executeEvent(trigger, []);
            }
        }, this);
    }
    //------------------------------------------------------------------------------------------------------
    //  音频
    //------------------------------------------------------------------------------------------------------
    /**
     * 播放背景音乐
     */
    export function customCommand_5001(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_5001): void {
        let bgmURL = cp.advanceSetting && cp.bgmUseVar ? Game.player.variable.getString(cp.bgmVarID) : cp.bgm;
        let volume = 1;
        let pitch = 1;
        if (bgmURL) {
            let bgmURLArr = bgmURL.split(",");
            if (bgmURLArr.length == 3) {
                volume = MathUtils.float(parseFloat(bgmURLArr[1]) / 100);
                pitch = MathUtils.float(parseFloat(bgmURLArr[2]) / 100);
            }
        }
        let fadeIn = MathUtils.int(cp.advanceSetting && cp.fadeInTimeUseVar ? Game.player.variable.getVariable(cp.fadeInTimeVarID) : cp.fadeInTime);
        GameAudio.playBGM(bgmURL, volume, 99999, fadeIn != 0, fadeIn * 1000, pitch);
    }
    /**
     * 停止背景音乐
     */
    export function customCommand_5002(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_5002): void {
        let fadeOut = MathUtils.int(cp.fadeOutTimeUseVar ? Game.player.variable.getVariable(cp.fadeOutTimeVarID) : cp.fadeOutTime);
        GameAudio.stopBGM(fadeOut != 0, fadeOut * 1000);
    }
    /**
     * 播放环境声效
     */
    export function customCommand_5003(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_5003): void {
        let bgsURL = cp.advanceSetting && cp.bgsUseVar ? Game.player.variable.getString(cp.bgsVarID) : cp.bgs;
        let volume = 1;
        let pitch = 1;
        if (bgsURL) {
            let bgsURLArr = bgsURL.split(",");
            if (bgsURLArr.length == 3) {
                volume = MathUtils.float(parseFloat(bgsURLArr[1]) / 100);
                pitch = MathUtils.float(parseFloat(bgsURLArr[2]) / 100);
            }
        }
        let fadeIn = MathUtils.int(cp.advanceSetting && cp.fadeInTimeUseVar ? Game.player.variable.getVariable(cp.fadeInTimeVarID) : cp.fadeInTime);
        GameAudio.playBGS(bgsURL, volume, 99999, fadeIn != 0, fadeIn * 1000, pitch);
    }
    /**
     * 停止环境声效
     */
    export function customCommand_5004(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_5004): void {
        let fadeOut = MathUtils.int(cp.fadeOutTimeUseVar ? Game.player.variable.getVariable(cp.fadeOutTimeVarID) : cp.fadeOutTime);
        GameAudio.stopBGS(fadeOut != 0, fadeOut * 1000);
    }
    /**
     * 播放音效
     */
    export function customCommand_5005(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_5005): void {
        let soc: ClientSceneObject = null;
        // 如果触发器类型来源于场景对象且勾选了近大远小的效果
        if (trigger.mainType == CommandTrigger.COMMAND_MAIN_TYPE_SCENE_OBJECT && cp.nearBigFarSmall) {
            soc = trigger.executor as ClientSceneObject;
        }
        let seURL: string;
        if (cp.systemSE) {
            switch (cp.systemSEType) {
                case 0:
                    seURL = WorldData.selectSE;
                    break;
                case 1:
                    seURL = WorldData.sureSE;
                    break;
                case 2:
                    seURL = WorldData.cancelSE;
                    break;
                case 3:
                    seURL = WorldData.disalbeSE;
                    break;
                default:
                    return;
            }
            GameAudio.playSE(seURL);
        }
        else {
            seURL = (cp.seUseVar ? Game.player.variable.getString(cp.seVarID) : cp.se);
            let volume = 1;
            let pitch = 1;
            if (seURL) {
                let seURLArr = seURL.split(",");
                if (seURLArr.length == 3) {
                    volume = MathUtils.float(parseFloat(seURLArr[1]) / 100);
                    pitch = MathUtils.float(parseFloat(seURLArr[2]) / 100);
                }
            }
            GameAudio.playSE(seURL, volume, pitch, soc);
        }
    }
    /**
     * 停止全部音效
     */
    export function customCommand_5006(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_5006): void {
        GameAudio.stopSE();
    }
    /**
     * 播放语音
     */
    export function customCommand_5007(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_5007): void {
        let soc: ClientSceneObject = null;
        // 如果触发器类型来源于场景对象且勾选了近大远小的效果
        if (trigger.mainType == CommandTrigger.COMMAND_MAIN_TYPE_SCENE_OBJECT && cp.nearBigFarSmall) {
            soc = trigger.executor as ClientSceneObject;
        }
        let tsURL = cp.tsUseVar ? Game.player.variable.getString(cp.tsVarID) : cp.ts;
        let volume = 1;
        let pitch = 1;
        if (tsURL) {
            let tsURLArr = tsURL.split(",");
            if (tsURLArr.length == 3) {
                volume = MathUtils.float(parseFloat(tsURLArr[1]) / 100);
                pitch = MathUtils.float(parseFloat(tsURLArr[2]) / 100);
            }
        }
        GameAudio.playTS(tsURL, volume, pitch, soc);
    }
    /**
     * 停止全部语音
     */
    export function customCommand_5008(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_5008): void {
        GameAudio.stopTS();
    }
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 移动图片时的逐帧执行的函数
     */
    export function gcImageMoveFrameUpdate(a: UIBitmap, m: ImageMoveParams, passageID: number, sign: string) {
        // 首帧变化的属性
        if (m.curTime == 1) {
            a.pivotType = m.pivotType2;
            a.blendMode = [null, "lighter", "blend5-1", "blend4-1", "blend4-7", "blend4-4"][m.blendMode2];
            a.flip = m.flip2;
        }
        let per = m.curTime / m.time;
        let value = GameUtils.getValueByTransData(m.transData, per);
        a.dpX = m.x2 * value + m.x;
        a.dpY = m.y2 * value + m.y;
        a.dpZ = m.z2 * value + m.z;
        a.dpWidth = m.width2 * value + m.width;
        a.dpHeight = m.height2 * value + m.height;
        a.rotation1 = m.rotation2 * value + m.rotation;
        a.opacity = m.opacity2 * value + m.opacity;
        if (a instanceof UIVideo) {
            if (m.volume2 != null) a.volume = m.volume2 * value + m.volume;
            if (m.currentTime2 != null) a.currentTime = m.currentTime2 * value + m.currentTime;
        }
        m.curTime++;
        if (per == 1) {
            GameImageLayer.clearPassageFrameUpdate(passageID, sign);
        }
        a.dpCoordToRealCoord();
    }
    /**
     * 移动相机时的逐帧执行的函数
     */
    export function gcCameraMoveFrameUpdate(a: any, m: ImageLayerCameraMoveParams, passageID: number, sign: string) {
        let imageLayer = Game.layer.imageLayer
        let per = m.curTime / m.time;
        let value = GameUtils.getValueByTransData(m.transData, per);
        imageLayer.camera.viewPort.x = m.x2 * value + m.x;
        imageLayer.camera.viewPort.y = m.y2 * value + m.y;
        imageLayer.camera.z = m.z2 * value + m.z;
        imageLayer.camera.rotation = m.rotation2 * value + m.rotation;
        m.curTime++;
        if (per == 1) {
            GameImageLayer.clearPassageFrameUpdate(passageID, sign);
        }
        imageLayer.updateFrame(true);
    }
    /**
     * 移动动画时的逐帧执行的函数
     */
    export function gcAnimationMoveFrameUpdate(a: UIAnimation, m: AnimationMoveParams, passageID: number, sign: string, changeFrame: boolean) {
        let per = m.curTime / m.time;
        let value = GameUtils.getValueByTransData(m.transData, per);
        a.dpX = m.x2 * value + m.x;
        a.dpY = m.y2 * value + m.y;
        a.dpZ = m.z2 * value + m.z;
        a.dpScaleX = m.scaleX2 * value + m.scaleX;
        a.dpScaleY = m.scaleY2 * value + m.scaleY;
        a.rotation1 = m.rotation2 * value + m.rotation;
        a.opacity = m.opacity2 * value + m.opacity;
        if (changeFrame) {
            a.aniFrame = m.aniFrame2 * value + m.aniFrame;
        }
        a.dpCoordToRealCoord();
        m.curTime++;
        if (per == 1) {
            GameImageLayer.clearPassageFrameUpdate(passageID, sign);
        }
    }
    /**
     * 移动立绘时的逐帧执行的函数
     */
    export function gcStandAvatarMoveFrameUpdate(a: UIStandAvatar, m: StandAvatarMoveParams, passageID: number, sign: string) {
        // 立即变更
        if (m.curTime == 1) {
            if (m.changeExpression) {
                a.actionID = m.actionID;
            }
        }
        let per = m.curTime / m.time;
        let value = GameUtils.getValueByTransData(m.transData, per);
        a.dpX = m.x2 * value + m.x;
        a.dpY = m.y2 * value + m.y;
        a.dpZ = m.z2 * value + m.z;
        a.dpScaleX = m.scaleX2 * value + m.scaleX;
        a.dpScaleY = m.scaleY2 * value + m.scaleY;
        a.rotation1 = m.rotation2 * value + m.rotation;
        a.opacity = m.opacity2 * value + m.opacity;
        a.dpCoordToRealCoord();
        if (m.changeFrame) {
            a.avatarFrame = m.avatarFrame2 * value + m.avatarFrame;
        }
        m.curTime++;
        if (per == 1) {
            GameImageLayer.clearPassageFrameUpdate(passageID, sign);
        }
    }
    /**
     * 自动旋转的逐帧执行的函数
     */
    export function gcGameSpriteRotationMoveFrameUpdate(a: GameSprite, rotation: number, passageID: number, sign: string) {
        // 该通道的显示对象开始旋转
        if (a) {
            a.rotation2 += rotation;
        }
        // 如果已没有显示对象的话就直接清理掉该函数
        else {
            GameImageLayer.clearPassageFrameUpdate(passageID, sign);
        }
    }
    /**
     * 移动界面的逐帧执行的函数
     */
    export function gcUIMoveFrameUpdate(a: GUI_BASE, m: ScaleSpriteMoveParams, passageID: number, sign: string) {
        // 没有显示对象或已被释放的情况
        if (!a || a.isDisposed) {
            GameImageLayer.clearPassageFrameUpdate(passageID, sign);
            return;
        }
        // 计算过渡值
        let per = m.curTime / m.time;
        let value = GameUtils.getValueByTransData(m.transData, per);
        if (a.useDPCoord) {
            a.dpX = m.x2 * value + m.x;
            a.dpY = m.y2 * value + m.y;
            a.dpZ = m.z2 * value + m.z;
            a.dpScaleX = m.scaleX2 * value + m.scaleX;
            a.dpScaleY = m.scaleY2 * value + m.scaleY;
            a.dpCoordToRealCoord();
        }
        else {
            a.x = m.x2 * value + m.x;
            a.y = m.y2 * value + m.y;
            a.scaleX = m.scaleX2 * value + m.scaleX;
            a.scaleY = m.scaleY2 * value + m.scaleY;
        }
        a.rotation1 = m.rotation2 * value + m.rotation;
        a.opacity = m.opacity2 * value + m.opacity;
        m.curTime++;
        if (per == 1) {
            GameImageLayer.clearPassageFrameUpdate(passageID, sign);
        }
    }
    /**
     * 移动界面元件的逐帧执行的函数
     */
    export function gcUICompMoveFrameUpdate(a: GUI_BASE, m: UICompMoveParams, passageID: number, sign: string, nonTweenType: number) {
        let per = m.curTime / m.time;
        for (let i = 0; i < m.attrInfos.length; i++) {
            let attrInfo = m.attrInfos[i];
            if (!attrInfo.needTween) {
                // 无法渐变过渡的属性处理方式：在第一帧时变动/在最后一帧变动
                if ((nonTweenType == 0 && m.curTime == 1) || (nonTweenType == 1 && per == 1)) {
                    if (attrInfo.attName == "materialData") {
                        refreshCompMaterials.apply({}, [attrInfo.newValue, attrInfo.uiComp]);
                    } else {
                        attrInfo.uiComp[attrInfo.attName] = attrInfo.newValue;
                    }
                }
            }
            else {
                let valuePer = GameUtils.getValueByTransData(m.transData, per);
                //同步材质
                if (attrInfo.attName == "materialData") {
                    let materials = refreshCompMaterialsTrans.apply({}, [attrInfo.newValue, attrInfo.oldValue, valuePer, nonTweenType, m.curTime]);
                    refreshCompMaterials.apply({}, [materials, attrInfo.uiComp]);
                } else {
                    attrInfo.uiComp[attrInfo.attName] = (attrInfo.newValue - attrInfo.oldValue) * valuePer + attrInfo.oldValue;
                }
            }
        }
        m.curTime++;
        if (per == 1) {
            GameImageLayer.clearPassageFrameUpdate(passageID, sign);
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    // 移动图片的参数伪类
    declare class ImageMoveParams {
        time: number;
        curTime: number;
        x: number;
        y: number;
        z: number;
        width: number;
        height: number;
        rotation: number;
        opacity: number;
        x2: number;
        y2: number;
        z2: number;
        width2: number;
        height2: number;
        rotation2: number;
        opacity2: number;
        pivotType2: number;
        blendMode2: number;
        flip2: boolean;
        transData: TransData;
        // video
        volume?: number;
        currentTime?: number;
        volume2?: number;
        currentTime2?: number;
    }
    // 移动图像层镜头的参数伪类
    declare class ImageLayerCameraMoveParams {
        time: number;
        curTime: number;
        x: number;
        y: number;
        z: number;
        rotation: number;
        x2: number;
        y2: number;
        z2: number;
        rotation2: number;
        transData: TransData;
    }
    // 移动缩放类对象的参数伪类
    declare class ScaleSpriteMoveParams {
        time: number;
        curTime: number;
        x: number;
        y: number;
        z: number;
        scaleX: number;
        scaleY: number;
        rotation: number;
        opacity: number;
        x2: number;
        y2: number;
        z2: number;
        scaleX2: number;
        scaleY2: number;
        rotation2: number;
        opacity2: number;
        transData: TransData;
    }
    // 移动动画的参数伪类
    declare class AnimationMoveParams extends ScaleSpriteMoveParams {
        aniFrame: number;
        aniFrame2: number;
    }
    // 移动立绘的参数伪类
    declare class StandAvatarMoveParams extends ScaleSpriteMoveParams {
        actionID: number;
        avatarFrame: number;
        avatarFrame2: number;
        changeExpression: boolean;
        changeFrame: boolean
    }
    // 移动界面元件的参数伪类
    declare class UICompMoveParams {
        time: any;
        curTime: number;
        transData: TransData;
        attrInfos: { uiComp: UIBase; uiCompID: number; attName: string; oldValue: any; needTween: boolean; newValue: any; }[];
    }
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 储存界面层的界面状态和界面内元件的状态，以便读档后打开界面时使用一次恢复
     */
    let useOnceUIInfos: {
        [uiID: number]: {
            // 界面基础属性
            x: number, y: number, scaleX: number, scaleY: number, rotation1: number, rotation2: number, opacity: number,
            // 界面内元件的属性
            uiCompInfo: { [uiCompID: string]: { [varName: string]: any }[] }
        }
    } = {} as any;
    /**
     * 监听界面打开：通过使用GameUI.show()打开的界面（位于界面层）
     */
    EventUtils.addEventListener(GameUI, GameUI.EVENT_OPEN_SYSTEM_UI, Callback.New((uiID: number) => {
        // -- 获取通道
        let passageID = 1000000 + uiID;
        let ui = GameUI.get(uiID);
        if (!ui) return;
        // -- 装载属性
        let useOnceUIInfo = useOnceUIInfos[uiID];
        if (useOnceUIInfo) {
            for (let i in useOnceUIInfo) {
                if (i == "uiCompInfo") continue;
                ui[i] = useOnceUIInfo[i];
            }
            let childs = GameUI.getAllCompChildren(ui, true, (uiComp: Sprite) => {
                // 列表的属性忽略，一般由创建时刷新
                if (uiComp instanceof UIList) {
                    return false;
                }
            }).keyValue;
            for (let uiCompID in useOnceUIInfo.uiCompInfo) {
                let uiComp = childs[uiCompID];
                if (!uiComp) continue;
                let uiCompInfo = useOnceUIInfo.uiCompInfo[uiCompID];
                for (let varName in uiCompInfo) {
                    uiComp[varName] = uiCompInfo[varName];
                }
            }
            delete useOnceUIInfos[uiID];
        }
        // -- 储存
        GameImageLayer.setImageSprite(passageID, ui);
    }, null));
    /**
     * 监听界面关闭
     */
    EventUtils.addEventListener(GameUI, GameUI.EVENT_CLOSE_SYSTEM_UI, Callback.New((uiID: number) => {
        // -- 获取通道
        let passageID = 1000000 + uiID;
        // -- 删除该通道
        // GameImageLayer.deletePassage(passageID);
    }, null));
    //------------------------------------------------------------------------------------------------------
    // 存档和读档-追加这些事件的修改的状态
    //------------------------------------------------------------------------------------------------------
    /**
     * 注册储存额外的自定义数据：
     * -- 当前显示的图像
     * -- 当前正在移动中的效果
     */
    if (!Config.BEHAVIOR_EDIT_MODE) {
        SinglePlayerGame.regSaveCustomData("cmdImagerLayer", Callback.New(() => {
            // 储存显示对象
            let imageSpriteInfos: { [id: string]: { type: string, displayObjectAttrs: any } } = {};
            for (let passageIDStr in GameImageLayer.imageSprites) {
                let disobjectInfo = GameImageLayer.imageSprites[passageIDStr];
                let sp: GameSprite = disobjectInfo.displayObject;
                let displayObjectAttrs = {};
                // 记录身上的材质
                let materialData = sp.getAllMaterialDatas();
                displayObjectAttrs["___materialData"] = materialData;
                // 视频
                if (sp instanceof UIVideo) {
                    let saveAttrs = ["videoURL", "dpX", "dpY", "dpZ", "dpWidth", "dpHeight", "rotation1", "rotation2", "opacity", "flip",
                        "playType", "muted", "volume", "loop", "currentTime", "playbackRate", "blendMode"];
                    for (let i in saveAttrs) {
                        let attrName = saveAttrs[i];
                        displayObjectAttrs[attrName] = sp[attrName];
                    }
                    imageSpriteInfos[passageIDStr] = {
                        type: "UIVideo",
                        displayObjectAttrs: displayObjectAttrs
                    };
                }
                // 图片
                else if (sp instanceof UIBitmap) {
                    let saveAttrs = ["image", "dpX", "dpY", "dpZ", "dpWidth", "dpHeight", "rotation1", "rotation2", "opacity", "pivotType", "blendMode", "flip"];
                    for (let i in saveAttrs) {
                        let attrName = saveAttrs[i];
                        displayObjectAttrs[attrName] = sp[attrName];
                    }
                    imageSpriteInfos[passageIDStr] = {
                        type: "UIBitmap",
                        displayObjectAttrs: displayObjectAttrs
                    };
                }
                // 动画
                else if (sp instanceof UIAnimation) {
                    let saveAttrs = ["animationID", "dpX", "dpY", "dpZ", "dpScaleX", "dpScaleY", "rotation1", "rotation2", "opacity", "playType", "silentMode", "showHitEffect", "playFps", "blendMode"];
                    for (let i in saveAttrs) {
                        let attrName = saveAttrs[i];
                        displayObjectAttrs[attrName] = sp[attrName];
                    }
                    // 记录当前帧
                    displayObjectAttrs["aniFrame"] = (sp as UIAnimation).animation.currentFrame;
                    imageSpriteInfos[passageIDStr] = {
                        type: "UIAnimation",
                        displayObjectAttrs: displayObjectAttrs
                    };
                }
                // 立绘
                else if (sp instanceof UIStandAvatar) {
                    let saveAttrs = ["avatarID", "dpX", "dpY", "dpZ", "dpScaleX", "dpScaleY", "rotation1", "rotation2", "opacity", "isPlay", "playOnce", "actionID", "avatarFPS", "blendMode"];
                    for (let i in saveAttrs) {
                        let attrName = saveAttrs[i];
                        displayObjectAttrs[attrName] = sp[attrName];
                    }
                    displayObjectAttrs["avatarFrame"] = (sp as UIStandAvatar).avatar.currentFrame;
                    imageSpriteInfos[passageIDStr] = {
                        type: "UIStandAvatar",
                        displayObjectAttrs: displayObjectAttrs
                    };
                }
                // 界面
                else if (sp instanceof GUI_BASE) {
                    if (!sp.stage) continue;
                    let saveAttrs: string[];
                    if (sp.useDPCoord) {
                        saveAttrs = ["useDPCoord", "dpX", "dpY", "dpZ", "dpScaleX", "dpScaleY", "rotation1", "rotation2", "opacity", "blendMode"];
                    }
                    else {
                        saveAttrs = ["useDPCoord", "x", "y", "scaleX", "scaleY", "rotation1", "rotation2", "opacity", "blendMode"];
                        displayObjectAttrs["___childIndex"] = Game.layer.uiLayer.getChildIndex(sp);
                    }
                    for (let i in saveAttrs) {
                        let attrName = saveAttrs[i];
                        displayObjectAttrs[attrName] = sp[attrName];
                    }
                    displayObjectAttrs["guiID"] = (sp as GUI_BASE).guiID;
                    imageSpriteInfos[passageIDStr] = {
                        type: "GUI_BASE",
                        displayObjectAttrs: displayObjectAttrs
                    };
                }
                // 其他的情况
                else {
                    continue;
                }
            }
            // 储存移动效果
            let passageFrameUpdateDatas = {};
            let passageFrameUpdates = GameImageLayer.getPassageFrameUpdates();
            for (let passageIDStr in passageFrameUpdates) {
                let pArr = passageFrameUpdates[passageIDStr];
                if (pArr) {
                    let pDataArr = passageFrameUpdateDatas[passageIDStr] = [];
                    for (let s = 0; s < pArr.length; s++) {
                        let p = pArr[s];
                        let args = p.args.concat();
                        args.shift(); // 去除头-显示对象
                        // 移动界面元件时需要记录下
                        if (p.sign.indexOf("gcUICompMove") != -1) {
                            let m: UICompMoveParams = args[0];
                            let newM: UICompMoveParams = {
                                time: m.time,
                                curTime: m.curTime,
                                transData: m.transData,
                                attrInfos: []
                            };
                            for (let k = 0; k < m.attrInfos.length; k++) {
                                let oldAttrInfo = m.attrInfos[k];
                                let oldComp = oldAttrInfo.uiComp;
                                oldAttrInfo.uiComp = null;
                                newM.attrInfos[k] = ObjectUtils.depthClone(oldAttrInfo);
                                oldAttrInfo.uiComp = oldComp;
                            }
                            args[0] = newM;
                        }
                        pDataArr.push({ sign: p.sign, args: args });
                    }
                }
            }
            // 储存界面层的系统组界面以及其元件状态
            let allSystemGroupUIs = GameUI.getAllSystemGroupUIs();
            let saveDataUseOnceUIInfo = {};
            let BASE_ATTRS_OBJ = { x: true, y: true, width: true, height: true, rotation: true, show: true, opacity: true, mouseEventEnabledData: true };
            for (let o in allSystemGroupUIs) {
                let uiID = parseInt(o);
                let ui: GUI_BASE = allSystemGroupUIs[o];
                if (!ui) continue;
                let uiPosData = {
                    // 界面基础属性
                    x: ui.x, y: ui.y, scaleX: ui.scaleX, scaleY: ui.scaleX, rotation1: ui.rotation1, rotation2: ui.rotation2, opacity: ui.opacity,
                    // 界面内元件的属性
                    uiCompInfo: {}
                }
                saveDataUseOnceUIInfo[uiID] = uiPosData;
                let allComps = GameUI.getAllCompChildren(ui, false).arr;
                allComps.forEach((comp: UIBase) => {
                    if (comp instanceof UIBase) {
                        let uiCompAtts = uiPosData.uiCompInfo[comp.id] = {};
                        // 基础属性记录
                        for (let b in BASE_ATTRS_OBJ) {
                            uiCompAtts[b] = comp[b];
                        }
                        // 自定义属性记录
                        let __compCustomAttributes = GameUI["__compCustomAttributes"];
                        if (__compCustomAttributes) {
                            let customAttrs: string[] = __compCustomAttributes[comp.className];
                            for (let c in customAttrs) {
                                let b = customAttrs[c];
                                uiCompAtts[b] = comp[b];
                            }
                        }
                    }
                });
            }
            // 储存当前镜头
            let imageLayer = Game.layer.imageLayer;
            let cameraInfo = {
                x: imageLayer.camera.viewPort.x,
                y: imageLayer.camera.viewPort.y,
                z: imageLayer.camera.z,
                rotation: imageLayer.camera.rotation
            };
            // 储存图像层的材质
            let imageLayerMaterialData = Game.layer.imageLayer.getAllMaterialDatas();
            // 储存界面层的材质
            let uiLayerMaterialData = Game.layer.uiLayer.getAllMaterialDatas();
            // 储存全画面的材质
            let screenMaterialData = Game.layer.getAllMaterialDatas();
            // 储存场景的材质
            let sceneLayerMaterialData = Game.layer.sceneLayer.getAllMaterialDatas();
            return { cameraInfo: cameraInfo, imageSpriteInfos: imageSpriteInfos, passageFrameUpdateDatas: passageFrameUpdateDatas, saveDataUseOnceUIInfo: saveDataUseOnceUIInfo, imageLayerMaterialData: imageLayerMaterialData, uiLayerMaterialData: uiLayerMaterialData, screenMaterialData: screenMaterialData, sceneLayerMaterialData: sceneLayerMaterialData };
        }, {}));
        /**
         * 监听读档恢复数据，恢复储存的自定义数据-图像相关事件
         */
        EventUtils.addEventListener(SinglePlayerGame, SinglePlayerGame.EVENT_ON_BEFORE_RECOVERY_DATA, Callback.New(() => {
            // 停止当前对话
            GameDialog.stop();
            // 清理所有图像
            for (let pi in GameImageLayer.imageSprites) {
                let passageID: number = parseInt(pi);
                let sp: GameSprite = GameImageLayer.getImageSprite(passageID);
                // 标题界面和读档界面以及对话菜单不释放
                if (sp instanceof GUI_BASE && ((sp as GUI_BASE).guiID == 1 || (sp as GUI_BASE).guiID == 2 || (sp as GUI_BASE).guiID == 2003 || (sp as GUI_BASE).guiID == 12)) continue;
                GameImageLayer.deletePassage(passageID);
                if (sp instanceof GUI_BASE) {
                    if (sp == GameUI.get((sp as GUI_BASE).guiID)) {
                        GameUI.dispose((sp as GUI_BASE).guiID);
                    }
                }
            }
            // 清理图像层材质
            Game.layer.imageLayer.clearMaterials();
            // 安装材质的方法
            function installMaterialData(sp: GameSprite, materialData: any[]) {
                if (!materialData || materialData.length == 0) return;
                sp.installMaterialData(materialData, false);
            }
            let o = SinglePlayerGame.getSaveCustomData("cmdImagerLayer");
            if (!o) return;
            // 恢复 saveDataUseOnceUIInfo
            useOnceUIInfos = o.saveDataUseOnceUIInfo;
            // 显示对象
            let imageSpriteInfos: { [id: string]: { type: string, displayObjectAttrs: any } } = o.imageSpriteInfos;
            for (let passageIDStr in imageSpriteInfos) {
                let passageID = MathUtils.int(passageIDStr)
                let imageSpriteInfo = imageSpriteInfos[passageIDStr];
                // -- 视频
                if (imageSpriteInfo.type == "UIVideo") {
                    let e = new UIVideo();
                    e.dpDisplayPriority = passageID;
                    GameImageLayer.setImageSprite(passageID, e);
                    e.useDPCoord = true;
                    Game.layer.imageLayer.addChild(e);
                    for (let i in imageSpriteInfo.displayObjectAttrs) {
                        e[i] = imageSpriteInfo.displayObjectAttrs[i];
                    }
                    installMaterialData(e, imageSpriteInfo.displayObjectAttrs["___materialData"]);
                }
                // -- 图片
                else if (imageSpriteInfo.type == "UIBitmap") {
                    let a = new UIBitmap();
                    a.dpDisplayPriority = passageID;
                    GameImageLayer.setImageSprite(passageID, a);
                    a.useDPCoord = true;
                    Game.layer.imageLayer.addChild(a);
                    for (let i in imageSpriteInfo.displayObjectAttrs) {
                        a[i] = imageSpriteInfo.displayObjectAttrs[i];
                    }
                    installMaterialData(a, imageSpriteInfo.displayObjectAttrs["___materialData"]);
                }
                // -- 动画
                else if (imageSpriteInfo.type == "UIAnimation") {
                    let b = new UIAnimation();
                    b.animation.syncLoadWhenAssetExist = true;
                    b.dpDisplayPriority = passageID;
                    GameImageLayer.setImageSprite(passageID, b);
                    b.useDPCoord = true;
                    b.useDPCoordScaleMode = true;
                    Game.layer.imageLayer.addChild(b);
                    for (let i in imageSpriteInfo.displayObjectAttrs) {
                        b[i] = imageSpriteInfo.displayObjectAttrs[i];
                    }
                    installMaterialData(b, imageSpriteInfo.displayObjectAttrs["___materialData"]);
                }
                // -- 立绘
                else if (imageSpriteInfo.type == "UIStandAvatar") {
                    let c = new UIStandAvatar();
                    c.avatar.syncLoadWhenAssetExist = true;
                    c.dpDisplayPriority = passageID;
                    GameImageLayer.setImageSprite(passageID, c);
                    c.useDPCoord = true;
                    c.useDPCoordScaleMode = true;
                    Game.layer.imageLayer.addChild(c);
                    for (let i in imageSpriteInfo.displayObjectAttrs) {
                        c[i] = imageSpriteInfo.displayObjectAttrs[i];
                    }
                    installMaterialData(c, imageSpriteInfo.displayObjectAttrs["___materialData"]);
                }
                // -- 界面
                else if (imageSpriteInfo.type == "GUI_BASE") {
                    let uiID = imageSpriteInfo.displayObjectAttrs["guiID"];
                    let useDPCoord = imageSpriteInfo.displayObjectAttrs["useDPCoord"];
                    let d = GameUI.load(uiID, useDPCoord);
                    GameImageLayer.setImageSprite(passageID, d);
                    d.useDPCoordScaleMode = true;
                    if (useDPCoord) {
                        d.dpDisplayPriority = passageID;
                        Game.layer.imageLayer.addChild(d);
                    }
                    else {
                        // 记录显示层次，以便读档后
                        d.dpDisplayPriority = imageSpriteInfo.displayObjectAttrs["___childIndex"];
                        GameUI.show(uiID);
                    }
                    for (let i in imageSpriteInfo.displayObjectAttrs) {
                        d[i] = imageSpriteInfo.displayObjectAttrs[i];
                    }
                    installMaterialData(d, imageSpriteInfo.displayObjectAttrs["___materialData"]);
                }
            }
            // 界面层刷新层次 childIndex
            let uiChilds = [];
            let uiChildLength = Game.layer.uiLayer.numChildren;
            for (let s = 0; s < uiChildLength; s++) {
                uiChilds.push(Game.layer.uiLayer.getChildAt(s));
            }
            uiChilds.sort(function (a: GameSprite, b: GameSprite): number {
                return a.dpDisplayPriority < b.dpDisplayPriority ? -1 : 1;
            });
            for (let j: number = 0; j < uiChildLength; j++) {
                Game.layer.uiLayer.setChildIndex(uiChilds[j], j);
            }
            // 当前的镜头
            let imageLayer = Game.layer.imageLayer;
            imageLayer.camera.viewPort.x = o.cameraInfo.x;
            imageLayer.camera.viewPort.y = o.cameraInfo.y;
            imageLayer.camera.z = o.cameraInfo.z;
            imageLayer.camera.rotation = o.cameraInfo.rotation;
            // 图像层刷新
            Game.layer.imageLayer.updateFrame(true);
            // 移动中效果
            let passageFrameUpdateDatas: { [passageIDStr: string]: { sign: string, args: any }[] } = o.passageFrameUpdateDatas;
            for (let passageIDStr in passageFrameUpdateDatas) {
                let passageID = MathUtils.int(passageIDStr)
                let pArr = passageFrameUpdateDatas[passageIDStr];
                if (pArr) {
                    for (let s = 0; s < pArr.length; s++) {
                        let p = pArr[s];
                        let thisPtr = {};
                        if (p.sign == "gcImageMove") {
                            let bmp: UIBitmap = GameImageLayer.getImageSprite(passageID) as any;
                            if (!bmp || !(bmp instanceof UIBitmap)) continue;
                            GameImageLayer.regPassageFrameUpdate(passageID, CommandExecute.gcImageMoveFrameUpdate, thisPtr, [bmp].concat(p.args), p.sign);
                        }
                        else if (p.sign == "gcVideoMove") {
                            let video: UIVideo = GameImageLayer.getImageSprite(passageID) as any;
                            if (!video || !(video instanceof UIVideo)) continue;
                            GameImageLayer.regPassageFrameUpdate(passageID, CommandExecute.gcImageMoveFrameUpdate, thisPtr, [video].concat(p.args), p.sign);
                        }
                        else if (p.sign == "gcCameraMove") {
                            GameImageLayer.regPassageFrameUpdate(passageID, CommandExecute.gcCameraMoveFrameUpdate, thisPtr, [null].concat(p.args), p.sign);
                        }
                        else if (p.sign == "gcAnimationMove") {
                            let ani: UIAnimation = GameImageLayer.getImageSprite(passageID) as any;
                            if (!ani || !(ani instanceof UIAnimation)) continue;
                            GameImageLayer.regPassageFrameUpdate(passageID, CommandExecute.gcAnimationMoveFrameUpdate, thisPtr, [ani].concat(p.args), p.sign);
                        }
                        else if (p.sign == "gcStandAvatarMove") {
                            let standAvatar: UIStandAvatar = GameImageLayer.getImageSprite(passageID) as any;
                            if (!standAvatar || !(standAvatar instanceof UIStandAvatar)) continue;
                            GameImageLayer.regPassageFrameUpdate(passageID, CommandExecute.gcStandAvatarMoveFrameUpdate, thisPtr, [standAvatar].concat(p.args), p.sign);
                        }
                        else if (p.sign == "gcImageSpriteRotationMove") {
                            let sp: GameSprite = GameImageLayer.getImageSprite(passageID) as any;
                            if (!sp || !(sp instanceof GameSprite)) continue;
                            GameImageLayer.regPassageFrameUpdate(passageID, CommandExecute.gcGameSpriteRotationMoveFrameUpdate, thisPtr, [sp].concat(p.args), p.sign);
                        }
                        else if (p.sign == "gcUIMove") {
                            let ui: GUI_BASE = GameImageLayer.getImageSprite(passageID) as any;
                            if (!ui || !(ui instanceof GUI_BASE)) continue;
                            GameImageLayer.regPassageFrameUpdate(passageID, CommandExecute.gcUIMoveFrameUpdate, thisPtr, [ui].concat(p.args), p.sign);
                        }
                        // 移动界面元件时需要记录下
                        else if (p.sign.indexOf("gcUICompMove") != -1) {
                            let ui: GUI_BASE = GameImageLayer.getImageSprite(passageID) as any;
                            if (!ui || !(ui instanceof GUI_BASE)) continue;
                            let m: UICompMoveParams = p.args[0];
                            let uiComps = GameUI.getAllCompChildren(ui, true);
                            for (let k = 0; k < m.attrInfos.length; k++) {
                                let attrInfo = m.attrInfos[k];
                                attrInfo.uiComp = uiComps.keyValue[attrInfo.uiCompID];
                                // 如果不存在组件的情况则无视该移动（可能新版本已无该组件）
                                if (!attrInfo.uiComp) {
                                    m.attrInfos.splice(k, 1);
                                    k--;
                                }
                            }
                            GameImageLayer.regPassageFrameUpdate(passageID, CommandExecute.gcUICompMoveFrameUpdate, thisPtr, [ui].concat(p.args), p.sign);
                        }
                    }
                }
            }
            // 图像层材质
            installMaterialData(Game.layer.imageLayer, o.imageLayerMaterialData);
            // 界面层的材质
            if (o.uiLayerMaterialData) installMaterialData(Game.layer.uiLayer, o.uiLayerMaterialData);
            // 储存全画面的材质
            if (o.screenMaterialData) installMaterialData(Game.layer, o.screenMaterialData);
            // 储存场景的材质
            if (o.sceneLayerMaterialData) installMaterialData(Game.layer.sceneLayer, o.sceneLayerMaterialData);
        }, {}, null));
    }
    //------------------------------------------------------------------------------------------------------
    // 预加载和卸载
    //------------------------------------------------------------------------------------------------------
    // 使用资源的自定义指令编号
    let PLUGIN_COMMAND_SHOWPICTURE: number = 3001;
    let PLUGIN_COMMAND_SHOWANIMATION: number = 3004;
    let PLUGIN_COMMAND_SHOWSTANDAVATAR: number = 3006;
    let PLUGIN_COMMAND_SHOWUI: number = 3010;
    // 缓存
    let preloadCommandPageInfo: { [cmdPageID: number]: { imageArr: string[], aniArr: number[], standAvatarArr: number[], uiArr: number[] } } = {};
    // 重写预加载事件页
    let oldPreLoadCommandPage = AssetManager.preLoadCommandPage;
    AssetManager.preLoadCommandPage = function (commandPage: CommandPage, complete: Callback = null, syncCallbackWhenAssetExist: boolean = false, autoDispose: boolean = false) {
        // 资源获取
        let imageArr = [];
        let aniArr = [];
        let standAvatarArr = [];
        let uiArr = [];
        // 记录
        preloadCommandPageInfo[commandPage.id] = {
            imageArr: imageArr,
            aniArr: aniArr,
            standAvatarArr: standAvatarArr,
            uiArr: uiArr
        };
        for (let i = 0; i < commandPage.commands.length; i++) {
            let cmd = commandPage.commands[i];
            if (cmd.customID == PLUGIN_COMMAND_SHOWPICTURE) {
                let cp: CustomCommandParams_3001 = cmd.params[0];
                if (!cp.imageUseVar) {
                    imageArr.push(cp.image);
                }
            }
            else if (cmd.customID == PLUGIN_COMMAND_SHOWANIMATION) {
                let cp2: CustomCommandParams_3004 = cmd.params[0];
                if (!cp2.objectUseVar) {
                    aniArr.push(cp2.animation);
                }
            }
            else if (cmd.customID == PLUGIN_COMMAND_SHOWSTANDAVATAR) {
                let cp3: CustomCommandParams_3006 = cmd.params[0];
                if (!cp3.objectUseVar) {
                    standAvatarArr.push(cp3.standAvatar);
                }
            }
            else if (cmd.customID == PLUGIN_COMMAND_SHOWUI) {
                let cp4: CustomCommandParams_3010 = cmd.params[0];
                if (!cp4.objectUseVar) {
                    uiArr.push(cp4.uiID);
                }
            }
        }
        // 记录旧的参数
        let oldArgs = arguments;
        // 需要加载的
        let totalCount = 1 + aniArr.length + standAvatarArr.length + uiArr.length;
        let currentLoad = 0;
        function onLoadOver() {
            currentLoad++;
            if (totalCount == currentLoad) {
                oldPreLoadCommandPage.apply(this, oldArgs);
            }
        }
        let onLoadOverCB = Callback.New(onLoadOver, this);
        AssetManager.loadImages(imageArr, onLoadOverCB, true, true, true);
        for (let i = 0; i < aniArr.length; i++) {
            AssetManager.preLoadAnimationAsset(aniArr[i], onLoadOverCB, true, false, true);
        }
        for (let i = 0; i < standAvatarArr.length; i++) {
            AssetManager.preLoadStandAvatarAsset(standAvatarArr[i], onLoadOverCB, true, false, true);
        }
        for (let i = 0; i < uiArr.length; i++) {
            AssetManager.preLoadUIAsset(uiArr[i], onLoadOverCB, true, false, true);
        }
    }
    // 重写卸载事件页
    let oldDisposeCommandPage = AssetManager.disposeCommandPage;
    AssetManager.disposeCommandPage = function (commandPage: CommandPage) {
        let cache = preloadCommandPageInfo[commandPage.id];
        if (cache) {
            let imageCache = cache.imageArr, uiCache = cache.uiArr, animationCache = cache.aniArr, standAvatarCache = cache.standAvatarArr;
            AssetManager.disposeImages(imageCache);
            for (let s = 0; s < uiCache.length; s++)AssetManager.disposeUIAsset(uiCache[s]);
            for (let s = 0; s < animationCache.length; s++)AssetManager.disposeAnimationAsset(animationCache[s]);
            for (let s = 0; s < standAvatarCache.length; s++)AssetManager.disposeStandAvatarAsset(standAvatarCache[s]);
            delete preloadCommandPageInfo[commandPage.id];
        }
        oldDisposeCommandPage.apply(this, arguments);
    }
    //------------------------------------------------------------------------------------------------------
    // 材质
    //------------------------------------------------------------------------------------------------------
    function refreshCompMaterialsTrans(newValue: any, oldValue: any, per: number, nonTweenType: number, curTime: number) {
        let materials = ObjectUtils.depthClone(newValue);
        //材质组
        for (let i = 0; i < materials.length; i++) {
            let pass1 = materials[i];
            let pass2 = oldValue[i];
            if (!pass1 || !pass1.materials || !pass2 || !pass2.materials) continue;
            //对比材质
            for (let m = 0; m < pass1.materials.length; m++) {
                let material1 = pass1.materials[m];
                let material2 = pass2.materials[m];
                //存在相同材质才会过渡
                if (material2 && material1.id == material2.id) {
                    for (let key in material1) {
                        //id和过渡信息除外
                        if (key == "id" || key == "____timeInfo") continue;
                        let materialValue1 = material1[key];
                        let materialValue2 = material2[key];
                        //只支持number类型的数据过渡
                        if (typeof materialValue1 == "number" && typeof materialValue2 == "number") {
                            material1[key] = (materialValue1 - materialValue2) * per + materialValue2;
                        } else {
                            // 无法渐变过渡的属性处理方式：在第一帧时变动/在最后一帧变动
                            if ((nonTweenType == 0 && curTime != 1) || (nonTweenType == 1 && per != 1)) {
                                material1[key] = materialValue2;
                            }
                        }
                    }
                }
            }
        }
        return materials;
    }
    type UIBase = /*unresolved*/ any
    //@ts-ignore
    export function refreshCompMaterials(attValue: any, uiComp: UIBase) {
        //增删材质组
        if (attValue.length != uiComp.materialData.length) {
            uiComp.materialData = attValue;
            uiComp.installMaterialData(uiComp.materialData);
            return;
        }
        for (let i = 0; i < attValue.length; i++) {
            let pass1 = attValue[i];
            let pass2 = uiComp.materialData[i];
            if (!pass1 || !pass1.materials || !pass2 || !pass2.materials) continue;
            //增删材质
            if (pass1.materials.length != pass2.materials.length) {
                uiComp.materialData = attValue;
                uiComp.installMaterialData(uiComp.materialData);
                return;
            }
            for (let j = 0; j < pass1.materials.length; j++) {
                let material1 = pass1.materials[j];
                let material2 = pass2.materials[j];
                //替换材质
                if (material1.id != material2.id) {
                    uiComp.materialData = attValue;
                    uiComp.installMaterialData(uiComp.materialData);
                    return;
                }
                let materialValues = {} as any;
                for (let key in material1) {
                    //id和过渡信息除外
                    if (key == "id" || key == "____timeInfo") continue;
                    let materialValue1 = material1[key];
                    let materialValue2 = material2[key];
                    if (materialValue1 != materialValue2) {
                        //材质只支持fast设置number类型的数据
                        if (typeof materialValue1 == "number" && typeof materialValue1 == "number") {
                            materialValues[`mu${material1.id}_${key}`] = materialValue1;
                        } else {
                            uiComp.materialData = attValue;
                            uiComp.installMaterialData(uiComp.materialData);
                            return;
                        }
                    }
                }
                //设置材质效果
                uiComp.setMaterialValueFast(materialValues, j);
            }
        }
        //
        uiComp.materialData = attValue;
    }
}