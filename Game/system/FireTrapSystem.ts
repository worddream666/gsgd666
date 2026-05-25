/**
 * 火焰陷阱系统 - 强制 90 秒 & 难度实时提示版 (集成退出副本功能)
 */
class FireTrapSystem {

    static TRAP_LAYER_INDEX: number = 3;
    static FIRE_GROUND_ANI: number = 22;
    static HIT_EFFECT_ANI: number = 4010;
    private static gridGroups: { [id: number]: { x: number, y: number }[] } = {};
    private static activeAnimations: GCAnimation[] = [];
    private static currentFirePoints: { x: number, y: number }[] = [];
    private static hitRecord: { [soIndex: number]: number } = {};
    private static lastSelectedIds: number[] = [];

    // 基础静态变量
    static timeLeft: number = 90;
    static totalDuration: number = 90;
    static damageCount: number = 0;
    static dodgeCount: number = 0;
    static currentFireCount: number = 1;
    private static isPreparing: boolean = true;
    private static prepTime: number = 10;
    static isActive: boolean = false;
    static isGameOver: boolean = false;
    private static wasHitThisRound: boolean = false;
    private static frameCounter: number = 0;

    private static uiLines: UIString[] = [];
    private static centerTimerText: UIString = null;
    private static levelUpTip: UIString = null;

    /**
     * 初始化
     * 注意：这里即使你传入了 2000，我内部也会强行改成 90
     */
    static init(duration: number = 90): void {
        // --- 强制初始化：无视参数，强制设定为 90 ---
        this.timeLeft = 90;
        this.totalDuration = 90;

        this.isGameOver = false;
        this.isActive = false;
        this.isPreparing = true;
        this.prepTime = 10;
        this.damageCount = 0;
        this.dodgeCount = 0;
        this.currentFireCount = 1;
        this.wasHitThisRound = false;
        this.gridGroups = {};
        this.hitRecord = {};
        this.frameCounter = 0;
        this.lastSelectedIds = [];
        
        // 【新增】进入副本立即显示退出按钮
        this.showQuitButton();
        
        this.scanGridMarkers();
        // 停止之前的计时器防止重叠
        if ((this as any)._intervalId) clearInterval((this as any)._intervalId);
        (this as any)._intervalId = setInterval(() => {
            if (this.isGameOver) {
                this.clearCenterTimer();
                this.clearLevelUpTip();
                clearInterval((this as any)._intervalId);
                return;
            }
            if (this.isPreparing) {
                this.showCenterCountdown(this.prepTime);
                this.prepTime--;
                if (this.prepTime < 0) {
                    this.isPreparing = false;
                    this.clearCenterTimer();
                    this.createUI();
                }
            } else {
                // 正式挑战计时
                this.timeLeft--;
                this.updateUI();
                this.checkLevelUp();
                if (this.timeLeft <= 0) {
                    this.clearCenterTimer();
                    this.clearLevelUpTip();
                    clearInterval((this as any)._intervalId);
                    this.winGame();
                }
            }
        }, 1000);
        this.loop();
    }

    // ========================================================================
    // 【新增】退出副本相关逻辑
    // ========================================================================
    /**
     * 强制显示 fubenquit 按钮并绑定点击事件
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
     * 点击退出按钮后的逻辑处理
     */
    private static onQuitButtonClick(): void {
        // 1. 停止火焰系统
        this.stopSystem();
        
        // 2. 隐藏退出按钮
        const ui18 = GameUI.get(18);
        if (ui18) {
            const btn = ui18.getChildByName("fubenquit");
            if (btn) btn.visible = false;
        }

        // 3. 弹出退出提示并传送
        this.showQuitPrompt();
    }

    /**
     * 停止火焰系统所有逻辑
     */
    private static stopSystem(): void {
        this.isGameOver = true;
        this.stopFire();
        this.clearUI();
        this.clearCenterTimer();
        this.clearLevelUpTip();
        if ((this as any)._intervalId) {
            clearInterval((this as any)._intervalId);
            (this as any)._intervalId = null;
        }
        console.log("火焰陷阱系统已关闭");
    }

    /**
     * 显示退出提示框
     */
    private static showQuitPrompt(): void {
        const customPromptUI = GameUI.show(14);
        if (!customPromptUI) {
            Game.player.toScene(1, 1631, 1822);
            return;
        }

        const promptContentLabel = customPromptUI.getChildByName('promptContentLabel') as UIString;
        const confirmButton = customPromptUI.getChildByName('confirmButton') as UIButton;
        const cancelButton = customPromptUI.getChildByName('cancelButton') as UIButton;
        const promptTitleLabel = customPromptUI.getChildByName('promptTitleLabel') as UIString;

        // 设置退出提示文本
        if (promptContentLabel) promptContentLabel.text = "是否要退出火焰大厅？";
        if (cancelButton) cancelButton.visible = false;
        if (promptTitleLabel) promptTitleLabel.visible = false;

        // 绑定确定按钮事件
        if (confirmButton) {
            confirmButton.once(EventObject.CLICK, this, () => {
                customPromptUI.removeSelf();
                Game.player.toScene(6, 998, 830); // 传送到指定场景
            });
        } else {
            // 备用方案，2秒后自动跳转
            setTimeout(() => {
                if (customPromptUI) customPromptUI.removeSelf();
                Game.player.toScene(6, 998, 830);
            }, 2000);
        }
    }

    // ========================================================================
    // 原有逻辑保持不变
    // ========================================================================
    private static checkLevelUp(): void {
        let progress = (90 - this.timeLeft) / 90;
        let newCount = 1 + Math.floor(progress * 5); // 最终到 6

        if (newCount > this.currentFireCount) {
            this.currentFireCount = newCount;
            this.showLevelUpTip(`难度升级！当前火焰区域：${this.currentFireCount}`);
        }
    }

    private static showLevelUpTip(msg: string): void {
        this.clearLevelUpTip();
        const screenWidth = (Config && Config.WINDOW_WIDTH) ? Config.WINDOW_WIDTH : (stage ? stage.width : 1024);
        this.levelUpTip = new UIString();
        this.levelUpTip.text = msg;
        this.levelUpTip.fontSize = 40;
        this.levelUpTip.color = "#FFD700";
        this.levelUpTip.outline = 2;
        this.levelUpTip.width = 600;
        this.levelUpTip.align = "center";
        this.levelUpTip.x = (screenWidth - 600) / 2;
        this.levelUpTip.y = 250;
        if (stage) stage.addChild(this.levelUpTip);
        setTimeout(() => this.clearLevelUpTip(), 2000);
    }

    private static showCenterCountdown(num: number): void {
        this.clearCenterTimer();
        const screenWidth = (Config && Config.WINDOW_WIDTH) ? Config.WINDOW_WIDTH : (stage ? stage.width : 1024);
        const screenHeight = (Config && Config.WINDOW_HEIGHT) ? Config.WINDOW_HEIGHT : (stage ? stage.height : 768);
        this.centerTimerText = new UIString();
        this.centerTimerText.text = num === 0 ? "GO!" : `火焰开始倒计时：${num}`;
        this.centerTimerText.fontSize = 60;
        this.centerTimerText.color = "#e8dd34";
        this.centerTimerText.outline = 3;
        this.centerTimerText.width = 800;
        this.centerTimerText.align = "center";
        this.centerTimerText.x = (screenWidth - 800) / 2;
        this.centerTimerText.y = (screenHeight / 2) - 40;
        if (stage) stage.addChild(this.centerTimerText);
    }

    private static clearCenterTimer(): void {
        if (this.centerTimerText) {
            this.centerTimerText.removeSelf();
            this.centerTimerText.dispose();
            this.centerTimerText = null;
        }
    }

    private static loop(): void {
        if (this.isGameOver) return;
        if (!this.isPreparing) this.onUpdate();
        requestAnimationFrame(() => this.loop());
    }

    private static scanGridMarkers(): void {
        let scene = Game.currentScene;
        if (!scene) return;
        for (let x = 0; x < scene.gridWidth; x++) {
            for (let y = 0; y < scene.gridHeight; y++) {
                let val = scene.getDataGridState(this.TRAP_LAYER_INDEX, x, y);
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

    private static onUpdate(): void {
        this.frameCounter++;
        let currentCycleFrame = this.frameCounter % 240;
        if (currentCycleFrame < 120) {
            if (!this.isActive) {
                this.isActive = true;
                this.wasHitThisRound = false;
                this.startRandomFire();
            }
            this.checkDamage();
        } else {
            if (this.isActive) {
                this.isActive = false;
                if (!this.wasHitThisRound) {
                    this.dodgeCount++;
                    this.updateUI();
                }
                this.stopFire();
            }
        }
    }

    private static startRandomFire(): void {
        let scene = Game.currentScene;
        let allIds = Object.keys(this.gridGroups).map(v => parseInt(v));
        if (allIds.length === 0) return;
        let targetCount = this.currentFireCount;
        let nextSelected: number[] = [];
        if (this.lastSelectedIds.length === 0) {
            nextSelected.push(allIds[Math.floor(Math.random() * allIds.length)]);
        } else {
            let neighbors: number[] = [];
            for (let lastId of this.lastSelectedIds) {
                let pot = [lastId - 1, lastId + 1, lastId - 5, lastId + 5];
                for (let n of pot) {
                    if (n >= 1 && n <= 25 && allIds.indexOf(n) !== -1 && nextSelected.indexOf(n) === -1) neighbors.push(n);
                }
            }
            neighbors.sort(() => 0.5 - Math.random());
            for (let n of neighbors) if (nextSelected.length < targetCount) nextSelected.push(n);
            if (nextSelected.length < targetCount) {
                allIds.sort(() => 0.5 - Math.random());
                for (let id of allIds) if (nextSelected.length < targetCount && nextSelected.indexOf(id) === -1) nextSelected.push(id);
            }
        }
        this.lastSelectedIds = nextSelected;
        for (let id of nextSelected) {
            let points = this.gridGroups[id];
            for (let pt of points) {
                let ani = new GCAnimation();
                ani.id = this.FIRE_GROUND_ANI;
                ani.loop = true;
                ani.x = pt.x; ani.y = pt.y;
                ani.play();
                if (scene.animationLowLayer) scene.animationLowLayer.addChild(ani);
                else if (scene.shadowLayer) scene.shadowLayer.addChild(ani);
                this.activeAnimations.push(ani);
                this.currentFirePoints.push(pt);
            }
        }
    }

    private static stopFire(): void {
        for (let ani of this.activeAnimations) if (ani) ani.dispose();
        this.activeAnimations = [];
        this.currentFirePoints = [];
        this.hitRecord = {};
    }

    private static checkDamage(): void {
        let player = Game.player.sceneObject;
        if (!player) return;
        for (let pt of this.currentFirePoints) {
            let dx = player.x - pt.x;
            let dy = player.y - pt.y;
            if (Math.sqrt(dx * dx + dy * dy) < 32) {
                let battler = player.getModule(6) as any;
                if (battler && battler.actor && battler.actor.hp > 0) this.applyDamage(player, battler);
                break;
            }
        }
    }

    private static applyDamage(so: ClientSceneObject, battler: any): void {
        let now = Date.now();
        if (this.hitRecord[so.index] && now - this.hitRecord[so.index] < 800) return;
        this.hitRecord[so.index] = now;
        this.wasHitThisRound = true;
        this.damageCount++;
        this.updateUI();
        so.playAnimation(this.HIT_EFFECT_ANI, false, true, null, true);
        let currentHP = battler.actor.hp;
        if (this.damageCount === 1) {
            let loss = Math.floor(currentHP / 3) + 1;
            battler.actor.hp = Math.max(1, currentHP - loss);
        }
        else if (this.damageCount === 2) {
            let loss = Math.floor((currentHP * 2) / 3);
            battler.actor.hp = Math.max(1, currentHP - loss);
        }
        else {
            // --【核心修改】--
            this.isGameOver = true;
            battler.actor.hp = 0;
            if (battler.onDead) battler.onDead(); // 触发死亡事件
            this.loseGame(); // 调用新的失败处理方法
        }
    }

    private static createUI(): void {
        this.clearUI();
        const screenWidth = (Config && Config.WINDOW_WIDTH) ? Config.WINDOW_WIDTH : (stage ? stage.width : 1024);
        const colors = ["#FFFF00", "#FFFFFF", "#FF0000", "#00FF00", "#FFD700"];
        for (let i = 0; i < 5; i++) {
            let line = new UIString();
            line.fontSize = 26; line.color = colors[i];
            line.outline = 2; line.width = 600; line.align = "center";
            line.x = (screenWidth - 600) / 2;
            line.y = 60 + (i * 40);
            if (stage) stage.addChild(line);
            this.uiLines.push(line);
        }
        this.updateUI();
    }

    private static updateUI(): void {
        if (this.uiLines.length < 5) return;
        this.uiLines[0].text = `火焰大厅挑战进行中`;
        this.uiLines[1].text = `剩余时间：${this.timeLeft} 秒`;
        this.uiLines[2].text = `受伤害次数：${this.damageCount} / 3`;
        this.uiLines[3].text = `完美躲避次数：${this.dodgeCount}`;
        this.uiLines[4].text = `当前火焰区域：${this.currentFireCount}`;
    }

    private static clearUI(): void {
        for (let line of this.uiLines) { line.removeSelf(); line.dispose(); }
        this.uiLines = [];
    }

    private static clearLevelUpTip(): void {
        if (this.levelUpTip) { this.levelUpTip.removeSelf(); this.levelUpTip.dispose(); this.levelUpTip = null; }
    }

    // --【新增】-- 失败处理函数
    private static loseGame(): void {
        this.isGameOver = true;
        this.stopFire();
        this.clearUI();
        this.showResultUI("你被邪龙的火焰击败了，另外邪龙的诅咒使你复活后血量为0，记得吃药，勇敢的小猎人我们下次再会!", 12);
    }

    // --【修改】-- 胜利处理函数
    private static winGame(): void {
        this.isGameOver = true;
        this.stopFire();
        this.clearUI();
        this.showResultUI("恭喜通关！可惜奖励被邪龙抢走了，你找花花旁边的守卫问问情况吧，勇敢的小猎人 我们下次再会", 11);
    }
 
    // --【新增】-- 统一的结束UI处理函数
    private static showResultUI(message: string, variableIdToIncrement: number): void {
        // 1. 根据结果增加对应变量ID的值
        if (Game && Game.player && Game.player.variable) {
            const currentVal = Game.player.variable.getVariable(variableIdToIncrement);
            Game.player.variable.setVariable(variableIdToIncrement, currentVal + 1);
        }
    
        // 2. 加载并显示自定义UI（ID: 14）
        const customPromptUI = GameUI.show(14);
    
        // 3. 获取UI上的各个组件
        const promptContentLabel = customPromptUI.getChildByName('promptContentLabel') as UIString;
        const confirmButton = customPromptUI.getChildByName('confirmButton') as UIButton;
        const cancelButton = customPromptUI.getChildByName('cancelButton') as UIButton;
        const promptTitleLabel = customPromptUI.getChildByName('promptTitleLabel') as UIString;
    
        // 4. 设置UI内容和显隐
        if (promptContentLabel) {
            promptContentLabel.text = message;
        }
        if (cancelButton) {
            cancelButton.visible = false;
        }
        if (promptTitleLabel) {
            promptTitleLabel.visible = false;
        }
    
        // 5. 为“确定”按钮绑定一次性点击事件
        if (confirmButton) {
            confirmButton.once(EventObject.CLICK, this, () => {
                customPromptUI.removeSelf();
                Game.player.toScene(6, 1005, 783); // 传送到指定场景
            });
        } else {
            // 如果找不到确定按钮，提供一个备用方案，2秒后自动跳转
            setTimeout(() => {
                if (customPromptUI) customPromptUI.removeSelf();
                Game.player.toScene(6, 1005, 783);
            }, 2000);
        }
    }
}