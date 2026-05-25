/**
 * 场景对象模块-光影
 * Created by Karson.DS on 2025-03-19 16:02:36.
 */
class SoModule_LightShadow extends SceneObjectModule_5 {
    /**
     * 当前场景的阴影组 [groupID] = [shadow1、shadow2...]
     */
    private static shadowArr: SoModule_LightShadow[][] = [];
    /**
     * 当前场景的阴影组 [groupID] = [light1、light2...]
     */
    private static lightArr: SoModule_LightShadow[][] = [];
    /**
     * 阴影容器：shadowAvatar/shadowImageObject使用该容器装载
     */
    private shadowRoot: UIRoot;
    /**
     * 阴影对象-行走图
     */
    private shadowAvatar: Avatar;
    /**
     * 阴影对象-图片对象
     */
    private shadowImageObject: UIBitmap;
    /**
     * 光照对象-图片对象
     */
    private lightImageObject: UIBitmap;
    /**
     * 光照对象-动画对象
     */
    private lightAnimationObject: GCAnimation;
    /**
     * 所在组
     */
    private inGroupID: number;
    /**
     * 所在组类别 0-光照 1-阴影
     */
    private inGroupType: number;
    /**
     * 闪耀
     */
    private lightShineTransData: TransData;
    private lightShineTransI = 0;
    /**
     * 记录阴影被光照作用的帧，确保同组同一帧只会收到一个光照影响
     */
    private brightenFrame: number;
    /**
     * 构造函数
     * @param installCB 用于安装模块的属性值
     */
    constructor(installCB: Callback) {
        super(installCB);
        this.init();
    }
    /**
     * 当移除模块时执行的函数
     */
    onRemoved(): void {
        this.clear();
        if (this.shadowAvatar) {
            this.so.shadow.removeChild(this.shadowAvatar);
            this.shadowAvatar.dispose();
            this.shadowAvatar = null;
        }
        if (this.lightImageObject) {
            this.lightImageObject.dispose();
            this.lightImageObject = null;
        }
        if (this.lightAnimationObject) {
            this.lightAnimationObject.dispose();
            this.lightAnimationObject = null;
        }
        if (this.shadowImageObject) {
            this.shadowImageObject.dispose();
            this.shadowImageObject = null;
        }
        if (this.shadowRoot) {
            this.shadowRoot.dispose();
            this.shadowRoot = null;
        }
        this.so.avatar.blendMode = null;
        this.so.avatar.off(Avatar.RENDER, this, this.onAvatarRender);
        os.remove_ENTERFRAME(this.lightBrightenUpdate, this);
        os.remove_ENTERFRAME(this.onDynamicShadowUpdate, this);
        this.so.avatarContainer.scaleX = 1;
        this.so.avatarContainer.scaleY = 1;
        this.so.avatarContainer.rotation = 0;
        this.so.avatarContainer.alpha = 1;
    }
    /**
     * 刷新：通常在改变了属性需要调用此函数统一刷新效果
     */
    refresh(): void {
        this.init();
    }
    //------------------------------------------------------------------------------------------------------
    //  同步
    //------------------------------------------------------------------------------------------------------
    /**
     * 初始化
     */
    private init() {
        this.clear();
        if (this.type == 0) {
            this.initLight();
        }
        else {
            this.initShadow();
        }
    }
    /**
     * 清理
     */
    private clear() {
        this.removeFromGroup();
        if (this.shadowRoot) this.shadowRoot.removeSelf();
        if (this.shadowAvatar) this.shadowAvatar.removeSelf();
        if (this.shadowImageObject) this.shadowImageObject.removeSelf();
        if (this.lightAnimationObject) this.lightAnimationObject.removeSelf();
        if (this.lightImageObject) this.lightImageObject.removeSelf();
    }
    //------------------------------------------------------------------------------------------------------
    //  光照
    //------------------------------------------------------------------------------------------------------
    /**
     * 光照初始化
     */
    private initLight() {
        this.addToLightGroup();
        // clear
        this.createLight();
        this.refreshLightStyle();
        this.startLightBrighten()
    }
    /**
     * 刷新光照样式
     */
    private refreshLightStyle() {
        let blendTarget: Avatar | UIBitmap | GCAnimation;
        switch (this.lightStyleType) {
            case 0:
                blendTarget = this.so.avatar;
                break;
            case 1:
                blendTarget = this.lightImageObject;
                break;
            case 2:
                blendTarget = this.lightAnimationObject;
                break;
        }
        switch (this.lightBlendMode) {
            case 0:
                blendTarget.blendMode = null;
                break;
            case 1:
                blendTarget.blendMode = "lighter";
                break;
            case 2:
                blendTarget.blendMode = "blend5-1";
                break;
            case 3:
                blendTarget.blendMode = "blend4-1";
                break;
            case 4:
                blendTarget.blendMode = "blend4-7";
                break;
            case 5:
                blendTarget.blendMode = "blend4-4";
                break;
        }
    }
    /**
     * 光照作用开始
     */
    private startLightBrighten() {
        if (!this.lightBrighten) return;
        let lightRange2 = this.lightRange * this.lightRange;
        if (this.lightShineEnable) {
            this.lightShineTransData = GameUtils.getTransData(this.lightShineTransition);
        }
        os.remove_ENTERFRAME(this.lightBrightenUpdate, this);
        os.add_ENTERFRAME(this.lightBrightenUpdate, this, [lightRange2]);
    }
    /**
     * 光照作用-帧刷
     * @param lightRange2 
     */
    private lightBrightenUpdate(lightRange2: number) {
        Callback.CallLaterBeforeRender(() => {
            if (this.isDisposed) return;
            let shineValue: number;
            if (this.lightShineEnable) {
                if (!this.lightShineTransData) return;
                let per = (this.lightShineTransI % this.lightShineTransData.totalTime) / this.lightShineTransData.totalTime;
                shineValue = GameUtils.getValueByTransData(this.lightShineTransData, per) * this.lightShineValue + 1;
                this.lightShineTransI++;
            }
            else {
                shineValue = 1;
            }
            // -- 获取同组的阴影
            let shadowGroup = SoModule_LightShadow.shadowArr[this.groupID];
            if (shadowGroup) {
                for (let i = 0; i < shadowGroup.length; i++) {
                    let soModuleShadow = shadowGroup[i];
                    if (soModuleShadow.shadowType == 1 && soModuleShadow.brightenFrame != Game.frameCount) {
                        let dis2 = Point.distanceSquare2(this.so.x, this.so.y, soModuleShadow.so.x, soModuleShadow.so.y);
                        if (dis2 <= lightRange2) {
                            soModuleShadow.brightenFrame = Game.frameCount;
                            let lightStrength = 1 - dis2 / lightRange2; // 0~1
                            let shadowRotation = MathUtils.direction360(this.so.x, this.so.y, soModuleShadow.so.x, soModuleShadow.so.y);
                            let shadowAlpha = soModuleShadow.shadowOpacity * lightStrength * soModuleShadow.shadowOpacityFactor * shineValue;
                            let shadowScaleChangeValue = soModuleShadow.shadowMaxScale - soModuleShadow.shadowMinScale;
                            let shadowScaleY = (shadowScaleChangeValue * (1 - lightStrength) * soModuleShadow.shadowScaleFactor) * shineValue + soModuleShadow.shadowMinScale;
                            soModuleShadow.setShadowStyle(shadowAlpha, shadowScaleY, shadowRotation);
                        }
                    }
                }
            }
        }, this)
    }
    /**
     * 创建灯光
     */
    private createLight() {
        // -- 图片灯光
        if (this.lightStyleType == 1) {
            // clear
            if (this.so.avatar.id != 0) this.so.avatar.id = 0;
            this.so.avatar.blendMode = null;
            if (this.lightAnimationObject) this.lightAnimationObject.stop();
            // create
            if (!this.lightImageObject) this.lightImageObject = new UIBitmap;
            // set
            if (this.lightImageObject.image != this.lightImage) {
                this.lightImageObject.off(EventObject.LOADED, this, this.onLightImageLoaded);
                this.lightImageObject.once(EventObject.LOADED, this, this.onLightImageLoaded);
                this.lightImageObject.image = this.lightImage;
            }
            this.so.animationHighLayer.addChild(this.lightImageObject);
            this.lightImageObject.scaleX = this.lightAnimationScaleX;
            this.lightImageObject.scaleY = this.lightAnimationScaleY;
            this.lightImageObject.rotation = this.lightAnimationRotation;
            this.lightImageObject.alpha = this.lightOpacity;
            this.onLightImageLoaded();
        }
        // -- 动画灯光
        else if (this.lightStyleType == 2) {
            // clear
            if (this.so.avatar.id != 0) this.so.avatar.id = 0;
            this.so.avatar.blendMode = null;
            // create
            if (!this.lightAnimationObject) {
                this.lightAnimationObject = new GCAnimation;
                this.lightAnimationObject.loop = true;
            }
            // set
            if (!this.lightAnimationObject.isPlaying) this.lightAnimationObject.play();
            if (this.lightAnimationObject.id != this.lightAnimation) this.lightAnimationObject.id = this.lightAnimation;
            this.so.animationHighLayer.addChild(this.lightAnimationObject);
            this.lightAnimationObject.scaleX = this.lightAnimationScaleX;
            this.lightAnimationObject.scaleY = this.lightAnimationScaleY;
            this.lightAnimationObject.rotation = this.lightAnimationRotation;
            this.lightAnimationObject.alpha = this.lightOpacity;
        }
        // -- 行走图灯光
        else {
            if (this.so.avatar.id != this.so.avatarID) this.so.avatar.id = this.so.avatarID;
            if (this.lightAnimationObject) this.lightAnimationObject.stop();
            this.so.avatarContainer.scaleX = this.lightAnimationScaleX;
            this.so.avatarContainer.scaleY = this.lightAnimationScaleY;
            this.so.avatarContainer.rotation = this.lightAnimationRotation;
            this.so.avatarContainer.alpha = this.lightOpacity;
        }
    }
    private onLightImageLoaded() {
        let imageTex = AssetManager.getImage(this.lightImage);
        if (imageTex && this.lightImageObject) {
            this.lightImageObject.width = imageTex.width;
            this.lightImageObject.height = imageTex.height;
            this.lightImageObject.pivotType = 1;
        }
    }
    //------------------------------------------------------------------------------------------------------
    //  阴影
    //------------------------------------------------------------------------------------------------------
    /**
     * 初始化阴影
     */
    private initShadow() {
        this.addToShadowGroup();
        this.createShadow();
    }
    /**
     * 创建阴影样式
     */
    private createShadow() {
        if (!this.shadowRoot) {
            this.shadowRoot = new UIRoot;
        }
        this.so.shadow.addChild(this.shadowRoot);
        if (this.shadowStyle == 0) {
            if (!this.shadowAvatar) {
                this.shadowAvatar = new Avatar;
                this.shadowAvatar.setTonal(0, 0, 0, 0, 0, 0, 0);
            }
            let shadowAvatar = this.shadowAvatar;
            if (shadowAvatar.id != this.so.avatarID) shadowAvatar.id = this.so.avatarID;
            this.shadowAvatar.x = this.shadowOffsetX;
            this.shadowAvatar.y = this.shadowOffsetY;
            this.shadowRoot.addChild(this.shadowAvatar);
            this.so.avatar.off(Avatar.RENDER, this, this.onAvatarRender);
            this.so.avatar.on(Avatar.RENDER, this, this.onAvatarRender);
            this.onAvatarRender();
        }
        else if (this.shadowStyle == 1) {
            if (!this.shadowImageObject) {
                this.shadowImageObject = new UIBitmap;
            }
            if (this.shadowImageObject.image != this.shadowImage) {
                this.shadowImageObject.off(EventObject.LOADED, this, this.onShadowImageLoaded);
                this.shadowImageObject.once(EventObject.LOADED, this, this.onShadowImageLoaded);
                this.shadowImageObject.image = this.shadowImage;
            }
            this.onShadowImageLoaded();
            this.shadowRoot.addChild(this.shadowImageObject);
        }
        if (this.shadowType == 0) {
            this.setShadowStyle(this.shadowOpacity, this.shadowScale, this.shadowRotation);
        } else {
            this.setShadowStyle(0, 0, 0);
            os.add_ENTERFRAME(this.onDynamicShadowUpdate, this);
        }
    }
    /**
     * 每帧先重置阴影状态
     */
    private onDynamicShadowUpdate() {
        this.setShadowStyle(0, 0, 0);
    }
    /**
     * 当阴影图片加载完毕时：初始化位置
     */
    private onShadowImageLoaded() {
        let imageTex = AssetManager.getImage(this.shadowImage);
        if (imageTex && this.shadowImageObject) {
            this.shadowImageObject.width = imageTex.width;
            this.shadowImageObject.height = imageTex.height;
            this.shadowImageObject.x = Math.floor(this.shadowOffsetX - imageTex.width * 0.5);
            this.shadowImageObject.y = this.shadowOffsetY - imageTex.height;
        }
    }
    /**
     * 当行走图渲染时-阴影同步
     */
    private onAvatarRender() {
        if (this.shadowAvatar.id != this.so.avatar.id) this.shadowAvatar.id = this.so.avatar.id;
        this.shadowAvatar.actionID = this.so.avatar.actionID;
        this.shadowAvatar.currentFrame = this.so.avatar.currentFrame;
        this.shadowAvatar.orientation = this.so.avatar.orientation;
    }
    /**
     * 刷新阴影样式-动态
     */
    private setShadowStyle(alpha: number, scaleY: number, rotation: number) {
        this.shadowRoot.alpha = alpha;
        this.shadowRoot.scaleY = scaleY;
        this.shadowRoot.rotation = rotation;
        this.shadowRoot.scaleX = rotation >= 90 && rotation <= 270 ? -1 : 1;
    }
    //------------------------------------------------------------------------------------------------------
    // 通用 
    //------------------------------------------------------------------------------------------------------
    /**
     * 添加到阴影组
     */
    private addToShadowGroup() {
        let shadowGroup = SoModule_LightShadow.shadowArr[this.groupID];
        if (!shadowGroup) shadowGroup = SoModule_LightShadow.shadowArr[this.groupID] = [];
        let shadowIdx = shadowGroup.indexOf(this);
        if (shadowIdx == -1) shadowGroup.push(this);
        this.inGroupID = this.groupID;
        this.inGroupType = this.type;
    }
    /**
     * 添加到灯光组
     */
    private addToLightGroup() {
        let lightGroup = SoModule_LightShadow.lightArr[this.groupID];
        if (!lightGroup) lightGroup = SoModule_LightShadow.lightArr[this.groupID] = [];
        let lightIdx = lightGroup.indexOf(this);
        if (lightIdx == -1) lightGroup.push(this);
        this.inGroupID = this.groupID;
        this.inGroupType = this.type;
    }
    /**
     * 从阴影/灯光组里移除
     */
    private removeFromGroup() {
        if (this.inGroupID != null) {
            let groupArr = this.inGroupType == 0 ? SoModule_LightShadow.lightArr[this.inGroupType] : SoModule_LightShadow.shadowArr[this.inGroupType];
            if (groupArr) {
                let idx = groupArr.indexOf(this);
                if (idx != -1) groupArr.splice(idx, 1);
            }
        }
    }
}