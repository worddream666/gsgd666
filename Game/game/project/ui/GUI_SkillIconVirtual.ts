/**
 * 虚拟按键下的技能图标
 * Created by 黑暗之神KDS on 2023-08-18 17:45:16.
 */
class GUI_SkillIconVirtual extends GUI_1031 {
    /**
     * 技能
     */
    skill: Module_Skill;
    /**
     * 冷却标志
     */
    coolingSign: boolean;
    /**
     * 更新标记
     */
    private updateCount: number = 0;
    /**
     * 禁用动画
     */
    private disabledAni: GCAnimation;

    /**
     * 构造函数
     */
    constructor() {
        super();
        this.coolingMask.removeSelf();
        this.iconBlack.setTonal(-200, -200, -200, 100);
        os.add_ENTERFRAME(this.update, this);
        // MASK-圆形范围
        let offset = 2;
        let r1 = MathUtils.int(this.target.width / 2) - offset;
        let mask1 = new Sprite();
        mask1.graphics.drawCircle(r1 + offset, r1 + offset, r1, "#FF0000");
        this.target.mask = mask1;
    }
    dispose() {
        os.remove_ENTERFRAME(this.update, this);
        super.dispose();
    }
    /**
     * 设置数据
     * @param skill 
     */
    setData(skill: Module_Skill) {
        this.skill = skill;
        this.icon.mask = null;
        if (this.skill) {
            this.icon.image = this.iconBlack.image = skill.icon;
            if (this.skill.totalCD != 0) {
                this.icon.mask = this.coolingMask;
            }
            this.on(EventObject.CLICK, this, this.onClick);
        }
        else {
            this.icon.image = this.iconBlack.image = "";
            this.off(EventObject.CLICK, this, this.onClick);
        }
        this.update();
    }
    /**
     * 刷新
     */
    update() {
        if (!this.skill || !this.stage) return;
        this.updateCount++;
        if (this.updateCount % 3 == 0) {
            if (Game.currentScene) {
                let useEnabled = GameBattleHelper.canUseOneSkill(ProjectPlayer.ctrlActorSceneObject, this.skill, true);
                if (useEnabled) {
                    if (this.disabledAni) {
                        this.disabledAni.dispose();
                        this.disabledAni = null;
                    }
                }
                else {
                    if (!this.disabledAni) {
                        this.disabledAni = new GCAnimation;
                        this.disabledAni.id = WorldData.iconDisabledAni;
                        this.disabledAni.target = this.icon;
                        this.disabledAni.play();
                    }
                }
            }
        }
        if (this.skill.totalCD == 0) return;
        let intervalTime = Game.now - this.skill.currentCD;
        let coolingTime = this.skill.totalCD * 1000;
        let per = Math.min(intervalTime / coolingTime, 1);
        if (this.skill.currentCD == 0) per = 1;
        if (per < 1 && !this.coolingSign) {
            this.coolingSign = true;
        }
        else if (per == 1 && this.coolingSign) {
            this.coolingSign = false;
            // 冷却动画效果：给图标附加15002号动画
            let ani = new GCAnimation();
            ani.id = 1016;
            ani.addToGameSprite(this.target, this, this);
            this.addChild(ani);
            ani.play();
            ani.once(GCAnimation.PLAY_COMPLETED, this, (ani: GCAnimation) => {
                ani.dispose();
            }, [ani]);
        }
        this.coolingMask.graphics.clear();
        if (per == 1) {
            this.icon.mask = null;
        }
        else {
            if (this.icon.mask == null) this.icon.mask = this.coolingMask;
            let pr = -90;
            this.coolingMask.graphics.drawPie(this.icon.width / 2, this.icon.height / 2, this.icon.width, 0 + pr, per * 359 + pr, "#FF0000");
        }
    }
    /**
     * 按键
     */
    private onClick(): void {
        GameBattleAction.useSkill(ProjectPlayer.ctrlActorSceneObject, this.skill);
        // 移动端清理按键后摇杆按下但无法移动的问题
        if (Browser.onMobile) Controller.clearJoy();
    }
}