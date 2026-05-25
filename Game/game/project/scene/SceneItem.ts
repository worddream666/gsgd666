/**
 * 地图道具 (专注显示名称版 v2)
 *
 * 核心修改 (by Gemini):
 * - 道具名称在掉落时立刻创建并显示。
 * - 移除了根据玩家距离动态显示/隐藏名称的逻辑，确保名称持续可见。
 * - 优化了名称UI的初始位置设置。
 * - 保留了原始的按 'A' 键拾取和点击名称拾取的功能。
 * - 未添加任何自动拾取或空格拾取逻辑，以保证稳定性。
 *
 * Created by 黑暗之神KDS on 2023-09-24 / Modified & Fixed by Gemini on 2026-01-19
 */
class SceneItem {
    // ===============================================================
    // PART 1: 原始属性 (无改动)
    // ===============================================================
    private static lastPickUpFrame: number;
    private static iconNameLayer: number = 0;
    private static iconNameFrame: number;
    
    iconImg: UIBitmap;
    iconImgRoot: UIRoot;
    itemSo: ProjectClientSceneObject;
    item: Module_Item | Module_Equip;
    itemNameUI: GUI_1032;
    private iconRect: Rectangle;
    private isEquip: boolean;
    private num: number;
    private qualityEffect: GCAnimation;
    private autoItemDisposeI: number;

    // ===============================================================
    // PART 2: 构造函数 (已修改)
    // ===============================================================
    constructor(item: Module_Item | Module_Equip, x: number, y: number, isEquip: boolean, num: number = 1) {
        this.item = item;
        this.isEquip = isEquip;
        this.num = num;
        let presetSceneObjectData = { x: x, y: y };
        let itemSo = this.itemSo = Game.currentScene.addNewSceneObject(1, presetSceneObjectData) as ProjectClientSceneObject;
        this.iconImg = new UIBitmap();
        this.iconImgRoot = new UIRoot();
        this.iconImg.on(EventObject.LOADED, this, () => {
            let per = GameUtils.getAutoFitSizePre(new Rectangle(0, 0, this.iconImg.width, this.iconImg.height), new Rectangle(0, 0, WorldData.sceneItemSize, WorldData.sceneItemSize));
            if (per < 1) {
                this.iconImg.scaleX = this.iconImg.scaleY = per;
                let wh = MathUtils.int(this.iconImg.width);
                this.iconRect = new Rectangle(x, y, wh, wh);
            } else {
                this.iconRect = new Rectangle(x, y, this.iconImg.width, this.iconImg.height);
            }
            this.iconRect.x -= MathUtils.int(this.iconImg.width / 2);
            this.iconRect.y -= MathUtils.int(this.iconImg.height / 2);
            this.iconRect.x -= 5; this.iconRect.y -= 5; this.iconRect.width += 10; this.iconRect.height += 10;
        });
        this.iconImg.image = item.icon;
        this.iconImg.pivotType = 1;
        this.iconImgRoot.addChild(this.iconImg);
        itemSo.root.addChild(this.iconImgRoot);
        itemSo.layerLevel = WorldData.sceneItemLayer;
        itemSo.on(GameSprite.ON_DISPOSE, this, this.dispose);
        
        let dropEffect = new GCAnimation;
        dropEffect.once(GCAnimation.PLAY_COMPLETED, this, (de: GCAnimation) => { de.dispose(); }, [dropEffect]);
        dropEffect.id = 1018; dropEffect.target = this.iconImgRoot; dropEffect.play();
        
        if (this.isEquip) {
            let qualityEffect = this.qualityEffect = new GCAnimation;
            qualityEffect.id = 1056 + (this.item as Module_Equip).quality;
            qualityEffect.target = this.iconImgRoot;
            qualityEffect.loop = true;
            qualityEffect.play();
            itemSo.playAnimation(1067 + (this.item as Module_Equip).quality, true, true);
        }
        
        // 【核心修改】在构造函数中就立刻创建并显示名称
        this.createItemNameUI();
        
        os.add_ENTERFRAME(this.onEnterFrame, this);
        stage.on(EventObject.KEY_DOWN, this, this.onKeyDown);
        if (!this.isEquip) CommandPage.startTriggerFragmentEvent((item as Module_Item).dropEvent, ProjectPlayer.ctrlActorSceneObject, ProjectPlayer.ctrlActorSceneObject);
        this.autoItemDisposeI = setTimeout(() => { if (!itemSo.isDisposed) itemSo.dispose(); }, WorldData.dropItemDisposeTime * 1000);
    }

    // ===============================================================
    // PART 3: onEnterFrame (已修改)
    // ===============================================================
    /**
     * 【核心修改】
     * onEnterFrame 不再负责显示/隐藏名称，只负责处理名称堆叠的位置
     */
    private onEnterFrame(): void {
        // 确保 itemNameUI 存在且未被销毁
        if (!this.itemNameUI || this.itemNameUI.isDisposed) return;
        
        // -- 名称堆叠逻辑 (来自您的原始代码) --
        // 如果玩家在道具的拾取范围内，我们就处理名称的堆叠显示
        if (this.iconRect && ProjectPlayer.ctrlActorSceneObject && this.iconRect.contains(ProjectPlayer.ctrlActorSceneObject.x, ProjectPlayer.ctrlActorSceneObject.y)) {
             // init
            if (SceneItem.iconNameFrame != Game.frameCount) {
                SceneItem.iconNameFrame = Game.frameCount;
                SceneItem.iconNameLayer = 0;
            }
            this.itemNameUI.x = this.itemSo.x;
            // 确保 Config.SCENE_GRID_SIZE 存在
            const gridSize = Config.SCENE_GRID_SIZE || 48; // 使用默认值防止崩溃
            let playerGridY = Math.floor(ProjectPlayer.ctrlActorSceneObject.y / gridSize) * gridSize + gridSize / 2;
            this.itemNameUI.y = playerGridY - SceneItem.iconNameLayer * this.itemNameUI.nameBtn.height;
            SceneItem.iconNameLayer++;
        } else {
            // 如果玩家不在范围内，就把名称放回道具的默认位置
            this.itemNameUI.x = this.itemSo.x;
            this.itemNameUI.y = this.itemSo.y - 30; // 放在道具上方一个固定的偏移位置
        }
        // 确保名称UI总是可见
        this.itemNameUI.visible = true; 
    }

    // ===============================================================
    // PART 4: 其他方法 (与您的原始代码几乎完全相同)
    // ===============================================================
    dispose(): void {
        if (this.autoItemDisposeI) { clearTimeout(this.autoItemDisposeI); this.autoItemDisposeI = null; }
        if (this.qualityEffect) this.qualityEffect.dispose();
        os.remove_ENTERFRAME(this.onEnterFrame, this);
        stage.off(EventObject.KEY_DOWN, this, this.onKeyDown);
        if (this.itemNameUI) {
            this.itemNameUI.nameBtn.off(EventObject.MOUSE_DOWN, this, this.onItemNameMouseDown);
            this.itemNameUI.dispose();
        }
    }

    private createItemNameUI(): void {
        if (this.itemNameUI && !this.itemNameUI.isDisposed) return; // 防止重复创建

        this.itemNameUI = GameUI.load(1032, true) as any;
        Game.currentScene.animationHighLayer.addChild(this.itemNameUI);
        
        // 设置名称的初始位置
        this.itemNameUI.x = this.itemSo.x;
        this.itemNameUI.y = this.itemSo.y - 30; // 默认显示在道具上方30像素
        
        let itemName = this.item.name + `${this.num > 1 ? " x " + this.num : ""}`;
        if (this.isEquip) {
            this.itemNameUI.nameBtn.color = GUI_Manager.getEquipNameColorByInstance(this.item as Module_Equip);
            itemName = `[${GameData.getModuleData(19, (this.item as Module_Equip).partID).name}]` + itemName;
        }
        this.itemNameUI.nameBtn.label = itemName;
        this.itemNameUI.nameBtn.on(EventObject.MOUSE_DOWN, this, this.onItemNameMouseDown);
        // 默认就是可见的，无需再设置 this.itemNameUI.visible = true;
    }
    
    private onItemNameMouseDown(e: EventObject): void {
        e.stopPropagation();
        this.pickUpItem();
    }

    private onKeyDown(e: EventObject): void {
        if (Controller.inSceneEnabled) {
            if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.A)) {
                // 修改：现在我们不检查 itemNameUI.visible，而是直接检查距离
                if (!this.iconRect || !ProjectPlayer.ctrlActorSceneObject || !this.iconRect.contains(ProjectPlayer.ctrlActorSceneObject.x, ProjectPlayer.ctrlActorSceneObject.y)) return;
                
                if (SceneItem.lastPickUpFrame == Game.frameCount) {
                    return;
                }
                SceneItem.lastPickUpFrame = Game.frameCount;
                this.pickUpItem();
            }
        }
    }

    private pickUpItem(): void {
        let bool: boolean;
        if (this.isEquip) {
            bool = ProjectPlayer.addEquipByInstance(this.item as Module_Equip);
        } else {
            bool = ProjectPlayer.changeItemNumber(this.item.id, this.num, false);
        }
        if (!bool) {
            GameAudio.playSE(WorldData.disalbeSE);
            return;
        }
        if (this.itemNameUI) {
            this.itemNameUI.nameBtn.off(EventObject.MOUSE_DOWN, this, this.onItemNameMouseDown);
            this.itemNameUI.dispose(); // 拾取成功后销毁名称UI
            this.itemNameUI = null; // 清空引用
        }
        GameAudio.playSE(WorldData.pickupItemSE);
        if (!this.isEquip) {
            Game.player.variable.setVariable(15023, (this.item as Module_Item).value);
            CommandPage.startTriggerFragmentEvent((this.item as Module_Item).pickUpEvent, ProjectPlayer.ctrlActorSceneObject, ProjectPlayer.ctrlActorSceneObject);
        }
        this.itemSo.dispose();
    }
}
