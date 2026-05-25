/**
 * 战斗核心流程类
 * 
 * Created by 黑暗之神KDS on 2021-01-14 09:47:28.
 */
class GameBattle {
    //------------------------------------------------------------------------------------------------------
    // 实现用变量
    //------------------------------------------------------------------------------------------------------
    /**
     * 刷新计数
     */
    private static updateCount: number = 0;
    //------------------------------------------------------------------------------------------------------
    // 开始
    //------------------------------------------------------------------------------------------------------
    /**
     * 开始战斗
     */
    static start(): void {
        // AI管理启动
        GameBattleAI.start();
        // 行为管理启动
        GameBattleAction.start();
        // 战斗者处理器启动
        GameBattleData.start();
        // 启动帧刷
        os.add_ENTERFRAME(this.update, this);
    }
    //------------------------------------------------------------------------------------------------------
    // 结束
    //------------------------------------------------------------------------------------------------------
    /**
     * 停止战斗：通常来自结束战斗指令的调用（无论是主动结束战斗或是满足条件自动结束战斗）
     * -- 满足胜负条件：GameBattle.checkBattleIsComplete => WorldData.reachBattleCompelteConditionEvent => 调用结束战斗指令
     * -- 主动结束：调用结束战斗指令
     */
    static stop(): void {
        // AI管理结束
        GameBattleAI.stop();
        // 行为管理启动
        GameBattleAction.stop();
        // 战斗者处理器启动
        GameBattleData.stop();
        // 关闭帧刷
        os.remove_ENTERFRAME(this.update, this);
    }
    //------------------------------------------------------------------------------------------------------
    // 战斗判定
    //------------------------------------------------------------------------------------------------------
    /**
     * 检查战斗者是否死亡
     * @param battler 战斗者
     * @param fromBattler 来源战斗者
     */
    static checkBattlerIsDead(battler: ProjectClientSceneObject, fromBattler: ProjectClientSceneObject): void {
        let battlerModule = battler.getModule(6) as SoModule_Battler;
        // 当生命值归零的时候
        if (!battler.isDisposed && GameBattleHelper.isBattler(battler) && !battlerModule.isDead && battlerModule.actor.hp == 0) {
            // -- 仍然是战斗者且死亡的话则进行死亡处理
            GameBattleData.dead(battler, fromBattler);
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 内部实现 - 逐帧刷新
    //------------------------------------------------------------------------------------------------------
    /**
     * 逐帧刷新
     */
    private static update(): void {
        // 暂停中时忽略
        if (Game.pause) return;
        this.updateCount++;
        // -- 6帧刷新一次，（约100ms）以便减少计算量
        if (this.updateCount % 6 == 0) {
            let allBattlers = GameBattleHelper.allBattlers;
            // 刷新状态
            this.updateStatus(allBattlers);
            // 刷新进入战斗的状态
            this.refreshInBattleState(allBattlers);
        }
    }
    /**
     * 刷新状态
     */
    private static updateStatus(allBattlers: ProjectClientSceneObject[]): void {
        let now = Game.now;
        // 6帧刷新一次，（约100ms）以便减少计算量
        for (let i = 0; i < allBattlers.length; i++) {
            let battler: ProjectClientSceneObject = allBattlers[i] as any;
            let battlerModule = battler.getModule(6) as SoModule_Battler;
            if (!battlerModule) continue;
            let status = battlerModule.actor.status;
            let hasRemoveStatus = false;
            let overtimeHit: { fromBattler: ProjectClientSceneObject, battler: ProjectClientSceneObject, status: Module_Status }[] = [];
            for (let s = 0; s < status.length; s++) {
                let st = status[s];
                if (!st) continue;
                // 获得状态已过去的时间
                let intervalTime = now - st.overTimeCurrentDuration;
                //  DOT/HOT 效果 （来源必须同场景）
                if (st.overtime && st.intervalTime != 0) {
                    // 获得状态应该作用的次数
                    let needEffectTimes = Math.floor(intervalTime / (st.intervalTime * 1000));
                    // 开始作用：
                    for (let t = st.effectTimes; t < needEffectTimes; t++) {
                        let fromBattler = Game.currentScene.sceneObjects[st.fromBattlerID] as ProjectClientSceneObject;
                        if (fromBattler && fromBattler.sid != st.fromBattlerSID) fromBattler = null;
                        overtimeHit.push({ fromBattler: fromBattler, battler: battler, status: st });
                    }
                    st.effectTimes = needEffectTimes;
                }
                // 持续时间结束：非自动状态需要结束掉
                if (GameBattleHelper.isStatusOverTime(st)) {
                    let isRemoved = GameBattleData.removeStatus(battler, st.id, false);
                    if (isRemoved) {
                        s--;
                        hasRemoveStatus = true;
                    }
                }
            }
            // 存在移除状态的话则刷新属性和行为状态
            if (hasRemoveStatus) {
                let lv = GameBattleHelper.getLevelByActor(battlerModule.actor);
                Game.refreshActorAttribute(battlerModule.actor, lv, battler);
                GameBattleData.refreshBattlerActionByStatus(battler);
            }
            // 结算来自状态的伤害
            for (let s = 0; s < overtimeHit.length; s++) {
                let o = overtimeHit[s];
                GameBattleAction.hitTarget(o.fromBattler, o.battler, 3, null, null, o.status);
            }
        }
    }
    /**
     * 刷新进入战斗的状态
     */
    private static refreshInBattleState(allBattlers: ProjectClientSceneObject[]): void {
        for (let i = 0; i < allBattlers.length; i++) {
            let so: ProjectClientSceneObject = allBattlers[i] as any;
            GameBattleData.refreshInBattleState(so);
        }
    }
}