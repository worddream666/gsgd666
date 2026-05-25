/**
 * 冰气冲击系统 - 修复版（进入副本即显示按钮）
 */
class IceShockSystem {
    // ========== 固定配置 ==========
    static TRAP_LAYER_INDEX: number = 4;
    static ICE_GROUND_ANI: number = 23;
    static PRE_DAMAGE_ANI: number = 4007;
    static HIT_EFFECT_ANI: number = 4011;
    
    // ========== 核心状态变量 ==========
    private static gridGroups: { [id: number]: { x: number, y: number }[] } = {};
    private static activeAnimations: GCAnimation[] = [];
    private static currentIcePoints: { x: number, y: number }[] = [];
    private static cycleHitFlag: boolean = false;
    private static iceLoopTimer: NodeJS.Timeout = null;
    private static isSystemRunning: boolean = false;
    private static lastSelectedIds: number[] = [];

    // 游戏结束状态
    private static isGameOver: boolean = false;

    static damageCount: number = 0;

    /**
     * 初始化系统
     */
    static init(): void {
        if (this.isSystemRunning) return;
        this.isSystemRunning = true;
        this.isGameOver = false;
        this.damageCount = 0;
        this.cycleHitFlag = false;
        
        // 【修改】进入副本，直接强制显示 fubenquit 按钮
        this.showQuitButton();
        
        this.scanGridMarkers();
        this.triggerIceCycle();
        
        this.iceLoopTimer = setInterval(() => {
            if (!this.isSystemRunning || this.isGameOver) return;
            this.triggerIceCycle();
        }, 5000);
    }

    /**
     * 关闭系统
     */
    static stopSystem(): void {
        this.isSystemRunning = false;
        if (this.iceLoopTimer) {
            clearInterval(this.iceLoopTimer);
            this.iceLoopTimer = null;
        }
        this.stopIceAnimation();
        console.log("冰气冲击系统已关闭");
    }

    private static triggerIceCycle(): void {
        if (this.isGameOver) return;

        this.cycleHitFlag = false;
        this.stopIceAnimation();
        this.startIceAnimation();
        
        const damageCheckTimer = setInterval(() => {
            if (!this.isSystemRunning || this.cycleHitFlag || this.isGameOver) {
                clearInterval(damageCheckTimer);
                return;
            }
            this.checkDamageOnce();
        }, 100);
        
        setTimeout(() => {
            if (!this.isSystemRunning || this.isGameOver) return;
            clearInterval(damageCheckTimer);
            this.stopIceAnimation();
        }, 2000);
    }

    private static scanGridMarkers(): void {
        const scene = Game.currentScene;
        if (!scene) return;
        
        this.gridGroups = {};
        for (let x = 0; x < scene.gridWidth; x++) {
            for (let y = 0; y < scene.gridHeight; y++) {
                const val = scene.getDataGridState(this.TRAP_LAYER_INDEX, x, y);
                if (val >= 1 && val <= 25) {
                    if (!this.gridGroups[val]) this.gridGroups[val] = [];
                    this.gridGroups[val].push({
                        x: x * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE / 2,
                        y: y * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE / 2
                    });
                }
            }
        }
    }

    private static startIceAnimation(): void {
        const scene = Game.currentScene;
        if (!scene || Object.keys(this.gridGroups).length === 0) return;
        
        const allIds = Object.keys(this.gridGroups).map(v => parseInt(v));
        const selectedId = allIds[Math.floor(Math.random() * allIds.length)];
        this.lastSelectedIds = [selectedId];
        
        const points = this.gridGroups[selectedId];
        for (const pt of points) {
            const ani = new GCAnimation();
            ani.id = this.ICE_GROUND_ANI;
            ani.loop = true;
            ani.x = pt.x;
            ani.y = pt.y;
            ani.play();
            
            if (scene.animationLowLayer) scene.animationLowLayer.addChild(ani);
            else if (scene.shadowLayer) scene.shadowLayer.addChild(ani);
            
            this.activeAnimations.push(ani);
            this.currentIcePoints.push(pt);
        }
    }

    private static stopIceAnimation(): void {
        for (const ani of this.activeAnimations) {
            if (ani) ani.dispose();
        }
        this.activeAnimations = [];
        this.currentIcePoints = [];
    }

    private static checkDamageOnce(): void {
        const player = Game.player.sceneObject;
        if (!player || this.cycleHitFlag || this.isGameOver) return;
        
        for (const pt of this.currentIcePoints) {
            const dx = player.x - pt.x;
            const dy = player.y - pt.y;
            if (Math.sqrt(dx * dx + dy * dy) < 32) {
                const battler = player.getModule(6) as any;
                if (battler && battler.actor && battler.actor.hp > 0) {
                    this.applyDamage(player, battler);
                    this.cycleHitFlag = true;
                    break;
                }
            }
        }
    }

    private static applyDamage(so: ClientSceneObject, battler: any): void {
        // 1. 播放前置动画
        so.playAnimation(this.PRE_DAMAGE_ANI, false, true, null, true);
        
        // 2. 扣除10%血量
        const currentHP = battler.actor.hp;
        const loss = Math.max(1, Math.floor(currentHP * 0.1));
        battler.actor.hp = Math.max(0, currentHP - loss);
        
        // 3. 播放击中特效
        so.playAnimation(this.HIT_EFFECT_ANI, false, true, null, true);
        
        this.damageCount++;
        
        // 4. 检测死亡
        if (battler.actor.hp <= 0) {
            this.isGameOver = true;
            if (battler.onDead) battler.onDead();
            this.loseGame();
        }
    }

    // ========================================================================
    // UI 交互逻辑区域
    // ========================================================================

    /**
     * 【新增】强制显示 fubenquit 按钮并绑定点击事件
     * 不管初始状态是什么，进来就设为 visible = true
     */
    private static showQuitButton(): void {
        // 1. 获取 UI 18
        const ui18 = GameUI.get(18);
        if (!ui18) {
            console.warn("未找到UI ID: 18，无法显示 fubenquit");
            return;
        }

        // 2. 获取组件
        const fubenquitBtn = ui18.getChildByName("fubenquit");
        if (!fubenquitBtn) {
            console.warn("UI 18 中未找到 fubenquit 组件");
            return;
        }

        // 3. 强制设置为可见
        fubenquitBtn.visible = true;

        // 4. 绑定点击事件 (先 off 再 on，防止重复绑定)
        if (fubenquitBtn.off && fubenquitBtn.on) {
            fubenquitBtn.off(EventObject.CLICK, this, this.onQuitButtonClick);
            fubenquitBtn.on(EventObject.CLICK, this, this.onQuitButtonClick);
        }
    }

    /**
     * 点击按钮后的逻辑处理
     */
    private static onQuitButtonClick(): void {
        // 先停止系统
        this.stopSystem();
        
        // 获取UI18并把按钮隐藏（可选，为了美观）
        const ui18 = GameUI.get(18);
        if (ui18) {
            const btn = ui18.getChildByName("fubenquit");
            if (btn) btn.visible = false;
        }

        // 弹出提示并传送
        this.showFinalPrompt();
    }

    /**
     * 失败处理
     */
    private static loseGame(): void {
        this.stopSystem();
        // 这里不需要做额外UI操作，因为按钮已经在屏幕上了，玩家自己点
    }

    /**
     * 弹出 UI 14 并传送
     */
    private static showFinalPrompt(): void {
        const customPromptUI = GameUI.show(14);
        if (!customPromptUI) {
            Game.player.toScene(1, 1631, 1822);
            return;
        }

        const promptContentLabel = customPromptUI.getChildByName('promptContentLabel') as UIString;
        const confirmButton = customPromptUI.getChildByName('confirmButton') as UIButton;
        const cancelButton = customPromptUI.getChildByName('cancelButton') as UIButton;
        const promptTitleLabel = customPromptUI.getChildByName('promptTitleLabel') as UIString;

        if (promptContentLabel) promptContentLabel.text = "已经是邪龙手下最弱的BOSS了，你确定要退出吗？";
        if (cancelButton) cancelButton.visible = false;
        if (promptTitleLabel) promptTitleLabel.visible = false;

        if (confirmButton) {
            confirmButton.once(EventObject.CLICK, this, () => {
                customPromptUI.removeSelf();
                Game.player.toScene(1, 1631, 1822);
            });
        } else {
            setTimeout(() => {
                if (customPromptUI) customPromptUI.removeSelf();
                Game.player.toScene(1, 1631, 1822);
            }, 2000);
        }
    }
}