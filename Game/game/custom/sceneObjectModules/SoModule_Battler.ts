/**
 * 模块-战斗者
 * Created by 黑暗之神KDS on 2023-08-10 16:06:33.
 */
class SoModule_Battler extends SceneObjectModule_6 {
    /**
     * 载入完毕
     */
    isLoaded: boolean;
    /**
     * AI处理器
     */
    battleAI: GameBattleAI;
    /**
     * 技能释放中
     */
    duringRelease: boolean;
    /**
     * 是否进入战斗状态
     */
    inBattle: boolean;
    /**
     * 记录设定的出生点
     */
    settingX: number;
    settingY: number;
    /**
     * 硬直：击退相关状态
     */
    readyRepel: boolean;
    repeling: boolean;
    readyRepelingValue: number;
    readyRepelingSpeed: number;
    readyRepelingFrom: ProjectClientSceneObject;
    /**
     * 硬直：受击中
     */
    private _beHiting: number = 0;
    /**
     * 当前使用的整体行走图ID
     */
    private _currentWholeAvatarID: number = 0;
    /**
     * 是否处于整体替换模式
     */
    private _isWholeAvatarMode: boolean = false;
    /**
     * 当前装备部件记录
     */
    private _currentEquipParts: { avatarID: number, equip: Module_Equip }[] = [];
    /**
     * 原始部件记录
     */
    private _originalParts: { partID: number, avatar: Avatar }[] = [];
    /**
     * 部件是否已初始化
     */
    private _partsInitialized: boolean = false;
    /**
     * 硬直：受击中
     */
    set beHiting(v: boolean) {
        if (v) this._beHiting++;
        else this._beHiting--;
    }
    get beHiting(): boolean {
        return this._beHiting > 0;
    }
    /**
     * 硬直：冲刺
     */
    inSprint: boolean;
    /**
     * 硬直：格挡
     */
    inBlockAttack: boolean;
    blockAttackAnimation: number;
    blockAttackMode: number;
    blockAttackInfo: { blockAttackAnimation: number, blockAttackMode: number, blockAttackEvent: string };
    /**
     * 硬直后的迟缓时间（影响AI迟缓）
     */
    stiffnessDelayTime: number = 0;
    /**
     * 连招动作顺序
     */
    comboTimes: number;
    comboTime: number;
    /**
     * 记录原始帧率
     */
    fpsRecord: number;
    /**
     * 朝向监听标志（部件层级用）
     */
    private _oriListening: boolean = false;
    /**
     * 等待部件恢复标志（防重复注册LOADED回调）
     */
    private _pendingPartRestore: boolean = false;
    /**
     * 构造函数
     * @param installCB 
     */
    constructor(installCB: Callback, battler: ProjectClientSceneObject) {
        super(installCB);
        if (battler) {
            this.so = battler;
        }
        stage.on(EventObject.RENDER, this, this.onRender);
        this.settingX = this.so.x;
        this.settingY = this.so.y;
        this.fpsRecord = this.so.avatarFPS;
    }
    /**
     * 模块移除时
     */
    onRemoved(): void {
        if (this.battleAI) this.battleAI.dispose(false);
        stage.off(EventObject.RENDER, this, this.onRender);
        EventUtils.removeEventListenerFunction(Game, Game.EVENT_DISPLAY_BATTLER_POINT_BAR_CHANGE, this.refreshPointBar, this);
        EventUtils.removeEventListenerFunction(Game, Game.EVENT_DISPLAY_BATTLER_POINT_VALUE_CHANGE, this.refreshPointBar, this);
        EventUtils.removeEventListenerFunction(GameBattleData, GameBattleData.EVENT_BATTLER_DEAD, this.refreshPointBar, this);
        // 清理装备变化监听
        EventUtils.removeEventListenerFunction(ProjectPlayer, ProjectPlayer.EVENT_WEAR_PLAYER_ACTOR_EQUIP, this.onEquipChanged, this);
        EventUtils.removeEventListenerFunction(ProjectPlayer, ProjectPlayer.EVENT_TAKE_OFF_PLAYER_ACTOR_EQUIP, this.onEquipChanged, this);
        // 清理朝向监听
        if (this._oriListening) {
            this.so.off(ProjectClientSceneObject.CHANGE_ORI, this, this.refreshPartOrderByDirection);
            this._oriListening = false;
        }
    }
    /**
     * 刷新：通常在改变了属性需要调用此函数统一刷新效果
     */
    refresh(): void {

    }
    //------------------------------------------------------------------------------------------------------
    //  战斗者
    //------------------------------------------------------------------------------------------------------
    /**
     * 战斗者初始化
     * -- 创建战斗者对应的的AI管理实例
     * -- 如果已经死亡的话则显示死亡时动画效果（无播放模式）
     * @param refreshAttribute
     * @param fullState
     */
    battlerInit(refreshAttribute: boolean = true, fullState: boolean = true): void {
        // -- 清理战斗者对应的AI实例
        if (this.battleAI) this.battleAI.dispose(false);
        // -- 未设置攻击技能，提示
        if (!this.actor.atkSkill) {
            alert("ID:" + this.so.index + "-" + this.actor.name + " - No attack skill set");
            if (this.so == Game.player.sceneObject) {
                os.closeWindow();
            }
            else {
                Game.currentScene.removeSceneObject(this.so);
            }
            return;
        }
        // -- NPC
        if (this.inPartyIndex == -1 && fullState) {
            // -- 未携带装备的话清空
            if (!this.actor.takeSetting) {
                this.actor.skills.length = 0;
                this.actor.equips.length = 0;
            }
        }
        // -- 记录sceneObjectIndex，初始化碰撞组
        let actorDS: DataStructure_inPartyActor;
        if (this.inPartyIndex >= 0) {
            actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(this.inPartyIndex);
            if (actorDS) {
                actorDS.sceneObjectIndex = this.so.index;
                this.so.collisionGroup = 1;
            }
        }
        // -- 刷新行走图（根据角色数据）
        this.refreshAvatar(fullState, actorDS);
        // 
        this.battleAI = new GameBattleAI(this.so);
        // 监听显示血条的事件
        EventUtils.removeEventListenerFunction(Game, Game.EVENT_DISPLAY_BATTLER_POINT_BAR_CHANGE, this.refreshPointBar, this);
        EventUtils.addEventListenerFunction(Game, Game.EVENT_DISPLAY_BATTLER_POINT_BAR_CHANGE, this.refreshPointBar, this);
        EventUtils.removeEventListenerFunction(Game, Game.EVENT_DISPLAY_BATTLER_POINT_VALUE_CHANGE, this.refreshPointBar, this);
        EventUtils.addEventListenerFunction(Game, Game.EVENT_DISPLAY_BATTLER_POINT_VALUE_CHANGE, this.refreshPointBar, this);
        // 监听死亡事件
        EventUtils.removeEventListenerFunction(GameBattleData, GameBattleData.EVENT_BATTLER_DEAD, this.refreshPointBar, this);
        EventUtils.addEventListenerFunction(GameBattleData, GameBattleData.EVENT_BATTLER_DEAD, this.refreshPointBar, this);
        // 监听装备穿戴/卸下事件，用于刷新行走图
        EventUtils.removeEventListenerFunction(ProjectPlayer, ProjectPlayer.EVENT_WEAR_PLAYER_ACTOR_EQUIP, this.onEquipChanged, this);
        EventUtils.addEventListenerFunction(ProjectPlayer, ProjectPlayer.EVENT_WEAR_PLAYER_ACTOR_EQUIP, this.onEquipChanged, this);
        EventUtils.removeEventListenerFunction(ProjectPlayer, ProjectPlayer.EVENT_TAKE_OFF_PLAYER_ACTOR_EQUIP, this.onEquipChanged, this);
        EventUtils.addEventListenerFunction(ProjectPlayer, ProjectPlayer.EVENT_TAKE_OFF_PLAYER_ACTOR_EQUIP, this.onEquipChanged, this);
        GameBattleData.refreshBattlerActionByStatus(this.so);
        this.so.root.visible = true;
        this.refreshPointBar();
        // 刷新自动状态
        this.refreshActorAutoStatus();
        this.refreshClassAutoStatus();
        this.refreshEquipAutoStatus();
        this.refreshSkillAutoStatus();
        // -- 刷新战斗者属性
        if (refreshAttribute) {
            let level = this.inPartyIndex >= 0 ? ProjectPlayer.getPlayerActorDSByInPartyIndex(this.inPartyIndex).lv : Math.max(this.level, 1);
            Game.refreshActorAttribute(this.actor, level, this.so);
        }
        // 已死亡的情况
        if (this.isDead) GameBattleAction.battlerDeadAnimation(this.so, false);
        else if (fullState) {
            this.setPointFullState();
        }
        // 清理硬直
        this.clearStiffness();
        // 读取存档后队友显示
        if (this.inPartyIndex >= 1) {
            if (this.so.isFromRecorySaveData) {
                if (WorldData.battleMode != 0 && WorldData.battleAutoHideParty) {
                    this.so.root.visible = false;
                    this.so.through = true;
                }
            }
        }
        // 读取存档后：
        if (this.so.isFromRecorySaveData) {
            // -- 刷新状态动画
            this.refreshStatusAnimationDisplay();
            // -- 尝试复活
            this.tryResurrection();
        }
    }
    /**
     * 设置满状态
     */
    setPointFullState(): void {
        this.actor.hp = this.actor.MaxHP;
        this.actor.sp = this.actor.MaxSP;
    }

    /**
     * 清理硬直状态
     */
    clearStiffness(): void {
        this._beHiting = 0;
        this.repeling = false;
        this.inSprint = false;
        this.inBlockAttack = false;
    }
    /**
     * 连招初始化
     */
    comboInit(): void {
        if (this.comboTimes == null) {
            this.comboTimes = 0;
            this.comboTime = Game.now;
        }
        if (Game.now - this.comboTime >= 750) this.comboTimes = 0;
    }
    //------------------------------------------------------------------------------------------------------
    // NPC
    //------------------------------------------------------------------------------------------------------
    startResurrection(): void {
        let lastScene = Game.currentScene;
        let battler = this.so;
        let battleModule = this;
        let lastStatusIndex = battler.currentStatusPageIndex;
        let waitFrameCount1 = Math.floor(battleModule.periodicResurrectionTime * 60 * 0.5);
        this.startResurrectionTime = Game.now;
        ProjectUtils.waitFrameStartExecute(waitFrameCount1, (lastScene: ProjectClientScene, battler: ProjectClientSceneObject) => {
            if (lastScene == Game.currentScene && lastStatusIndex == battler.currentStatusPageIndex) {
                if (battleModule.isDead && GameBattleHelper.isBattler(battler)) {
                    battler.root.visible = false;
                }
            }
        }, this, [lastScene, battler]);
        this.tryResurrection();
    }
    //------------------------------------------------------------------------------------------------------
    // 角色
    //------------------------------------------------------------------------------------------------------
    /**
     * 穿上装备时的处理
     * -- 刷新形象（智能换装）
     * -- 自动状态
     * @param newEquip 新的装备
     */
    wearEquipHandle(newEquip: Module_Equip) {
        if (newEquip) {
            // -- 智能换装处理（自动刷新形象）
            this.smartWearEquipHandle(newEquip);
            // -- 自动状态
            if (newEquip.passiveStatus) {
                for (let s = 0; s < newEquip.selfStatus.length; s++) {
                    GameBattleData.addStatus(this.so, newEquip.selfStatus[s], this.so);
                }
            }
            // -- 执行佩戴事件
            if (newEquip.eventSetting && newEquip.wearEvent) {
                CommandPage.startTriggerFragmentEvent(newEquip.wearEvent, this.so, this.so);
            }
        }
    }
    /**
     * 卸下装备时的处理
     * -- 刷新形象（智能换装，自动恢复原始部件）
     * -- 自动状态
     * @param takeOffEquip 卸下的装备
     */
    takeOffEquipHandle(takeOffEquip: Module_Equip) {
        if (takeOffEquip) {
            // -- 智能换装处理（自动恢复原始部件）
            this.smartTakeOffEquipHandle(takeOffEquip);
            // -- 自动状态
            if (takeOffEquip.passiveStatus) {
                for (let s = 0; s < takeOffEquip.selfStatus.length; s++) {
                    let st = takeOffEquip.selfStatus[s];
                    // -- 查询其他装备的该自动状态总数
                    let elseStCount = 0;
                    for (let s = 0; s < this.actor.equips.length; s++) {
                        let elseEquip = this.actor.equips[s];
                        if (elseEquip && elseEquip.passiveStatus) {
                            if (elseEquip == takeOffEquip) continue;
                            for (let p = 0; p < elseEquip.selfStatus.length; p++) {
                                let elseEquipSt = elseEquip.selfStatus[p];
                                if (elseEquipSt == st) {
                                    elseStCount++;
                                }
                            }
                        }
                    }
                    // -- 如果没有任何其他装备拥有该自动状态，则直接移除
                    if (elseStCount == 0) {
                        GameBattleData.removeStatus(this.so, st);
                    }
                    // -- 如果其他装备也存在该自动状态则减少一层或不减少（根据层数上线计算）
                    else {
                        let stObj = GameBattleHelper.getBattlerStatus(this.so, st);
                        if (stObj) {
                            // -- 仅减少一层
                            if (stObj.currentLayer > elseStCount) {
                                GameBattleData.removeStatus(this.so, st, true, 1);
                            }
                        }
                    }

                }
            }
            // -- 执行卸下装备的事件
            if (takeOffEquip.eventSetting && takeOffEquip.takeOffEvent) {
                CommandPage.startTriggerFragmentEvent(takeOffEquip.takeOffEvent, this.so, this.so);
            }

        }
    }
    /**
     * 智能穿戴装备处理
     * @param newEquip 新装备
     */
    smartWearEquipHandle(newEquip: Module_Equip): void {
        if (!newEquip) return;

        // 确保已初始化原始部件
        this.initOriginalParts();

        // 优先使用装备的 stylePartID，如果没有则使用装备部位映射
        let partID = (newEquip.stylePartID && newEquip.stylePartID > 0)
            ? newEquip.stylePartID
            : this.getPartIDByEquipPart(newEquip.partID);

        // 判断装备是否有行走图设置
        let hasAvatarSetting = (newEquip.xzt > 0) || (newEquip.styleAvatarID > 0);

        // 判断是否为整体替换模式（衣服/铠甲）- 整体替换模式即使没有xzt也要处理actxzt
        if (this.isWholeAvatarEquip(newEquip.partID)) {
            // 【整体替换模式】直接更换整个行走图
            // 关键修复：在更换行走图之前，先收集所有叠加部件（武器/盾牌等）的数据
            // 并在设置 avatar.id 之前注册 LOADED 监听器
            // 因为 syncLoadWhenAssetExist=true 时 LOADED 会在 id setter 内部同步触发
            let overlayParts = this.collectOverlayParts();

            // 在更换行走图之前注册 LOADED 监听器
            // API 文档明确建议：在设置 id 之前监听该事件
            let avatar = this.so.avatar;
            let doRestore = () => {
                for (let p of overlayParts) {
                    // 使用 changePartByAvatarID 恢复部件（与"修改行走图部件"命令一致的方式）
                    avatar.changePartByAvatarID(p.avatarID, p.partID);
                }
                // 重新调整部件层级
                this.tryFixPartOrder();
                if (avatar && !avatar.isPlaying) {
                    avatar.play();
                }
            };
            avatar.once(EventObject.LOADED, this, doRestore);

            // 更换行走图（这会清空所有已添加的部件）
            // 注意：对于缓存资源，LOADED 会在此调用内部同步触发，但我们的监听器已在上面注册
            this.applyWholeAvatar(newEquip);

        } else if (hasAvatarSetting) {
            // 【部件叠加模式】叠加部件到行走图上（武器、盾牌等）
            if (partID > 0) {
                this.applyPartAvatar(newEquip, partID);
            }
        }
    }
    /**
     * 恢复其他装备部件（武器/盾牌等）
     * 在场景切换/初始化时调用，根据actor.equips数据重新应用所有叠加部件
     */
    private restoreOtherEquipParts(): void {
        let avatar = this.so.avatar;
        if (!avatar) return;
        if (!avatar.isLoaded) return;

        // 遍历所有装备，重新应用所有部件叠加模式的装备（武器、盾牌等）
        for (let i = 0; i < this.actor.equips.length; i++) {
            let equip = this.actor.equips[i];
            if (!equip) continue;
            // 跳过整体替换模式的装备（衣服）
            if (this.isWholeAvatarEquip(equip.partID)) continue;
            // 部件叠加模式只使用 styleAvatarID（武器/盾牌专用）
            if (equip.styleAvatarID > 0) {
                let partID = (equip.stylePartID && equip.stylePartID > 0)
                    ? equip.stylePartID
                    : this.getPartIDByEquipPart(equip.partID);
                if (partID > 0) {
                    this._currentEquipParts[partID] = null;
                    avatar.changePartByAvatarID(equip.styleAvatarID, partID);
                }
            }
        }

        if (this.so.avatar && !this.so.avatar.isPlaying) {
            this.so.avatar.play();
        }
    }
    /**
     * 学习技能的处理
     * -- 自动状态
     * @param newEquip 新的装备
     */
    learnSkillHandle(newSkill: Module_Skill) {
        if (newSkill) {
            // -- 自动状态
            if (newSkill.passiveStatus) {
                for (let s = 0; s < newSkill.selfStatus.length; s++) {
                    GameBattleData.addStatus(this.so, newSkill.selfStatus[s], this.so, false, false);
                }
            }
        }
    }
    /**
     * 卸下装备时的处理
     * -- 刷新形象
     * -- 自动状态
     * @param takeOffEquip 卸下的装备
     */
    forgetSkillHandle(forgetSkill: Module_Skill) {
        if (forgetSkill) {
            // -- 自动状态
            if (forgetSkill.passiveStatus) {
                for (let s = 0; s < forgetSkill.selfStatus.length; s++) {
                    let st = forgetSkill.selfStatus[s];
                    // -- 查询其他装备的该自动状态总数
                    let elseStCount = 0;
                    for (let s = 0; s < this.actor.skills.length; s++) {
                        let elseSkill = this.actor.skills[s];
                        if (elseSkill && elseSkill.passiveStatus) {
                            if (elseSkill == forgetSkill) continue;
                            for (let p = 0; p < elseSkill.selfStatus.length; p++) {
                                let elseSkillSt = elseSkill.selfStatus[p];
                                if (elseSkillSt == st) {
                                    elseStCount++;
                                }
                            }
                        }
                    }
                    // -- 如果没有任何其他装备拥有该自动状态，则直接移除
                    if (elseStCount == 0) {
                        GameBattleData.removeStatus(this.so, st);
                    }
                    // -- 如果其他装备也存在该自动状态则减少一层或不减少（根据层数上线计算）
                    else {
                        let stObj = GameBattleHelper.getBattlerStatus(this.so, st);
                        if (stObj) {
                            // -- 仅减少一层
                            if (stObj.currentLayer > elseStCount) {
                                GameBattleData.removeStatus(this.so, st, true, 1);
                            }
                        }
                    }
                }
            }
        }
    }
    //------------------------------------------------------------------------------------------------------
    //  内部实现
    //------------------------------------------------------------------------------------------------------
    /**
     * 刷新装备形象（行走图部件）
     * 初始化时调用，根据行走图初始形象以及拥有替换形象的装备进行刷新
     * @param execWearEvent[可选] 默认值=false
     * @param actorDS[可选] 默认值=null
     */
    private refreshEquipStyle(execWearEvent: boolean = false, actorDS: DataStructure_inPartyActor = null): void {
        // 重置所有状态，确保初始化时正确应用
        this._partsInitialized = false;
        this._originalParts = [];
        this._currentEquipParts = [];
        this._isWholeAvatarMode = false;
        this._currentWholeAvatarID = 0;

        // 首先处理衣服（整体替换模式，装备部位3）
        // 使用 Game.getActorEquipByPartID 按 partID 查找衣服装备，而不是使用数组索引
        let clothEquip = Game.getActorEquipByPartID(this.actor, 3);
        if (clothEquip) {
            this.smartWearEquipHandle(clothEquip);
            if (execWearEvent && actorDS) {
                EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_WEAR_PLAYER_ACTOR_EQUIP, [this.inPartyIndex, actorDS, null, clothEquip]);
            }
        }

        // 然后处理其他部件叠加模式的装备（武器、盾牌、头盔等）
        for (let i = 0; i < this.actor.equips.length; i++) {
            let equip = this.actor.equips[i];
            if (!equip) continue;
            // 跳过衣服（部位3），已经在上面处理过了
            if (equip.partID === 3) continue;
            this.smartWearEquipHandle(equip);
            if (execWearEvent && actorDS) {
                EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_WEAR_PLAYER_ACTOR_EQUIP, [this.inPartyIndex, actorDS, null, equip]);
            }
        }
    }
    /**
     * 装备变化处理 - 刷新行走图
     * @param params [inPartyIndex, actorDS, takeOffEquip, newEquip]
     */
    private onEquipChanged(params: any[]): void {
        let inPartyIndex = params[0];
        let actorDS = params[1];
        // let takeOffEquip = params[2];
        let newEquip = params[3];
        
        // 只处理当前角色的装备变化
        if (inPartyIndex !== this.inPartyIndex) return;
        
        // 刷新装备形象
        this.refreshEquipStyle(false, actorDS);
    }
    /**
     * 应用整体替换模式（衣服/铠甲）
     * @param equip 装备
     */
    private applyWholeAvatar(equip: Module_Equip): void {
        // 处理角色面板smallAvatar的行走图设置（actxzt）- 必须优先处理，即使没有xzt也要设置actxzt
        let actxztID = equip.actxzt;
        if (actxztID && actxztID > 0) {
            // 将actxzt设置到变量2，供界面4的smallAvatar使用
            Game.player.variable.setVariable(2, actxztID);
        }
        
        // 读取 xzt 属性作为整体行走图ID
        let avatarID = equip.xzt || equip.styleAvatarID;
        
        // 记录当前装备信息，即使没有xzt也要记录，以便下次刷新Avatar时知道应该用什么
        this._isWholeAvatarMode = true;
        this._currentWholeAvatarID = avatarID || 0;
        this._currentEquipParts[0] = {
            avatarID: avatarID || 0,
            equip: equip
        };
        
        // 如果没有有效的xzt，直接返回，不修改当前行走图
        if (avatarID <= 0) return;
        
        // 直接替换整个行走图
        this.so.avatar.id = avatarID;
        this.so.avatarID = avatarID;
    }
    /**
     * 刷新角色自动状态
     */
    private refreshActorAutoStatus(): void {
        if (this.actor && this.actor.passiveStatus) {
            for (let s = 0; s < this.actor.selfStatus1.length; s++) {
                GameBattleData.addStatus(this.so, this.actor.selfStatus1[s], this.so);
            }
        }
    }
    /**
     * 刷新职业自动状态
     */
    private refreshClassAutoStatus(): void {
        let actorClass: Module_Class = GameData.getModuleData(7, this.actor.class);
        if (actorClass && actorClass.passiveStatus) {
            for (let s = 0; s < actorClass.selfStatus.length; s++) {
                GameBattleData.addStatus(this.so, actorClass.selfStatus[s], this.so, false, false);
            }
        }
    }
    /**
     * 刷新装备自动状态
     */
    private refreshEquipAutoStatus(): void {
        for (let i = 0; i < this.actor.equips.length; i++) {
            let equip = this.actor.equips[i];
            if (equip && equip.passiveStatus) {
                for (let s = 0; s < equip.selfStatus.length; s++) {
                    GameBattleData.addStatus(this.so, equip.selfStatus[s], this.so);
                }
            }
        }
    }
    /**
     * 刷新技能自动状态
     */
    private refreshSkillAutoStatus(): void {
        let skills = this.actor.skills.concat(this.actor.atkSkill);
        for (let i = 0; i < skills.length; i++) {
            let skill = skills[i];
            if (skill && skill.passiveStatus) {
                for (let s = 0; s < skill.selfStatus.length; s++) {
                    GameBattleData.addStatus(this.so, skill.selfStatus[s], this.so, false, false);
                }
            }
        }
    }
    /**
     * 渲染
     */
    private onRender(): void {
        this.refreshPointBar();
    }
    /**
     * 刷新数值栏
     */
    private refreshPointBar(): void {
        if (!this.isDead) {
            this.pointBar.hpText.visible = WorldData.displayBattlerPointValue;
            this.pointBar.visible = WorldData.displayBattlerPointBar && this.showPointBar;
            this.pointBar.y = this.pointBarOffsetY;
            this.pointBar.hpBar.value = this.actor.hp * 100 / this.actor.MaxHP;
            this.pointBar.hpText.text = this.actor.hp + "/" + this.actor.MaxHP;
        }
        else if (this.pointBar) {
            this.pointBar.visible = false;
        }
    }
    /**
     * 刷新状态动画显示
     */
    private refreshStatusAnimationDisplay(): void {
        let statusArr = this.actor.status;
        for (let i = 0; i < statusArr.length; i++) {
            let status = statusArr[i];
            if (status && status.animation) {
                this.so.playAnimation(status.animation, true, true);
            }
        }
    }
    /**
     * 尝试复活
     */
    private tryResurrection(): void {
        if (this.isDead && this.startResurrectionTime != null) {
            let lastScene = Game.currentScene;
            let battler = this.so;
            let lastStatusIndex = battler.currentStatusPageIndex;
            let waitFrameCount2 = Math.floor(Math.max(0, (this.startResurrectionTime - Game.now) / Game.oneFrame + this.periodicResurrectionTime * 60));
            ProjectUtils.waitFrameStartExecute(waitFrameCount2, (lastScene: ProjectClientScene, battler: ProjectClientSceneObject) => {
                if (lastScene == Game.currentScene && lastStatusIndex == battler.currentStatusPageIndex) {
                    if (this.isDead && GameBattleHelper.isBattler(battler)) {
                        battler.root.visible = true;
                        battler.setTo(this.settingX, this.settingY);
                        let isResuscitateSuccess = GameBattleData.resuscitate(battler, true);
                        if (isResuscitateSuccess) {
                            let battleModule = battler.getModule(6) as SoModule_Battler;
                            if (battleModule.actor.whenResurrectedEvent) {
                                CommandPage.startTriggerFragmentEvent(battleModule.actor.whenResurrectedEvent, battler, battler);
                            }
                        }
                    }
                }
            }, this, [lastScene, battler]);
        }
    }
    /**
     * 刷新行走图
     */
    private refreshAvatar(execWearEvent: boolean = false, actorDS: DataStructure_inPartyActor = null) {
        if (this.avatarDisplay == 0) {
            if (!this.actor) return;
            this.so.avatar.visible = false;
            if (this.actor.avatar) {
                // 检查是否有衣服装备且有行走图设置（衣服装备在equips[3]位置）
                // 同时检查xzt和styleAvatarID，与applyWholeAvatar保持一致
                // 使用 Game.getActorEquipByPartID 按 partID 查找衣服装备
                let clothEquip = Game.getActorEquipByPartID(this.actor, 3);
                let hasClothAvatar = clothEquip && (clothEquip.xzt > 0 || clothEquip.styleAvatarID > 0);
                
                // 如果有衣服行走图，优先使用衣服的xzt或styleAvatarID，否则使用角色原始行走图
                let clothAvatarID = clothEquip && (clothEquip.xzt || clothEquip.styleAvatarID);
                let targetAvatarID = hasClothAvatar ? clothAvatarID : this.actor.avatar;
                
                // 关键修复：无论avatarID是否改变，都需要等待avatar加载完成
                // 因为即使avatarID相同，avatar可能还没有完全初始化
                let avatar = this.so.avatar;
                let doApplyStyle = () => {
                    this.setAvatarStyleFromActor(execWearEvent, actorDS);
                };
                
                if (this.so.avatarID != targetAvatarID) {
                    // 需要改变avatarID，先监听LOADED事件再设置
                    avatar.once(EventObject.LOADED, this, doApplyStyle);
                    this.so.avatarID = targetAvatarID;
                }
                else {
                    // avatarID 没有变化，但仍然需要应用装备部件（武器、盾牌等）
                    // 确保 avatar 可见并播放动画
                    this.so.avatar.visible = true;
                    if (this.so.avatar && !this.so.avatar.isPlaying) {
                        this.so.avatar.play();
                    }
                    // 应用装备样式（不触发穿戴事件）
                    this.refreshEquipStyle(false, actorDS);
                    // 刷新部件顺序
                    this.refreshPartOrderByDirection();
                }
            }
            else {
                this.setAvatarStyleFromActor(execWearEvent, actorDS);
            }

            // 注意：无需重复设置this.so.avatarID，因为上面三个分支已经处理了
            // 曾经这里无条件设置avatarID导致行走图重新加载，清空了所有已应用的装备部件，并重置了朝向动画
        }
        else {
            this.setAvatarStyleFromActor(execWearEvent, actorDS);
        }
    }
    /**
     * 设置行走图形象
     */
    private setAvatarStyleFromActor(execWearEvent: boolean = false, actorDS: DataStructure_inPartyActor = null): void {
        this.so.avatar.visible = this.isLoaded = true;
        // 确保行走图动画正在播放（refreshAvatar中设置了visible=false可能暂停了动画）
        if (this.so.avatar && !this.so.avatar.isPlaying) {
            this.so.avatar.play();
        }
        this.refreshEquipStyle(execWearEvent, actorDS);
        // 恢复朝向：refreshEquipStyle 可能更换了行走图（如整体替换模式），新行走图会重置朝向为默认值
        // 这里显式恢复为当前场景对象记录的朝向，防止切换场景后行走图只显示一个方向
        if (this.so.avatar && this.so.avatar.orientation != this.so.avatarOri) {
            this.so.avatar.orientation = this.so.avatarOri;
        }
        // 监听朝向变化以调整武器/盾牌部件层级
        if (!this._oriListening) {
            this.so.on(ProjectClientSceneObject.CHANGE_ORI, this, this.refreshPartOrderByDirection);
            this._oriListening = true;
        }
        this.refreshPartOrderByDirection();
    }
    //------------------------------------------------------------------------------------------------------
    //  部件朝向层级管理
    //------------------------------------------------------------------------------------------------------
    /**
     * 判断是否为整体替换模式装备
     * @param equipPartID 装备部位ID
     * @returns true=整体替换模式 false=部件叠加模式
     */
    private isWholeAvatarEquip(equipPartID: number): boolean {
        const wholeAvatarParts = [3]; // 只有衣服(3)使用整体替换模式
        return wholeAvatarParts.indexOf(equipPartID) !== -1;
    }

    /**
     * 根据装备部位ID获取对应的行走图部件ID
     * @param equipPartID 装备部位ID
     * @returns 行走图部件ID
     */
    private getPartIDByEquipPart(equipPartID: number): number {
        // 项目实际配置：武器=部件3 盾牌=部件6 头盔=部件1
        const partMap: { [key: number]: number } = {
            1: 3,  // 武器(1) → 武器部件(3)
            2: 1,  // 头盔(2) → 头部部件(1)
            3: 0,  // 衣服(3) → 整体替换模式
            4: 6,  // 盾牌(4) → 盾牌部件(6)
            5: 0,  // 鞋子(5) → 暂未使用
            6: 0,  // 裤子(6) → 暂未使用
            7: 0   // 手套(7) → 暂未使用
        };
        return partMap[equipPartID] || 0;
    }

    /**
     * 初始化原始部件记录
     */
    private initOriginalParts(): void {
        if (this._originalParts.length > 0) return;
        
        let avatar = this.so.avatar;
        if (!avatar || !avatar.isLoaded) return;
        
        // 记录原始部件
        let parts = avatar.parts;
        for (let i = 0; i < parts.length; i++) {
            let part = parts[i];
            if (part && part.partID > 0) {
                this._originalParts.push({
                    partID: part.partID,
                    avatar: part
                });
            }
        }
    }

    /**
     * 收集所有需要叠加的部件（武器/盾牌等）
     * 在整体替换行走图之前调用，确保数据已被保存
     */
    private collectOverlayParts(): { partID: number, avatarID: number }[] {
        let parts: { partID: number, avatarID: number }[] = [];
        for (let i = 0; i < this.actor.equips.length; i++) {
            let equip = this.actor.equips[i];
            if (!equip) continue;
            if (this.isWholeAvatarEquip(equip.partID)) continue;
            // 部件叠加模式只使用 styleAvatarID（武器/盾牌专用）
            if (equip.styleAvatarID > 0) {
                let pID = (equip.stylePartID && equip.stylePartID > 0)
                    ? equip.stylePartID
                    : this.getPartIDByEquipPart(equip.partID);
                if (pID > 0) {
                    parts.push({ partID: pID, avatarID: equip.styleAvatarID });
                }
            }
        }
        return parts;
    }

    /**
     * 应用部件叠加模式（武器/盾牌等）
     * @param equip 装备
     * @param partID 部件ID
     */
    private applyPartAvatar(equip: Module_Equip, partID: number): void {
        let avatar = this.so.avatar;
        if (!avatar) return;

        // 如果主行走图尚未加载完成，暂时跳过（restoreOtherEquipParts 会在加载完成后处理所有部件）
        if (!avatar.isLoaded) return;

        // 只使用 styleAvatarID（部件叠加模式专用，武器/盾牌使用）
        let partAvatarID = equip.styleAvatarID;
        if (partAvatarID <= 0) return;

        // 检查部件槽是否已存在，使用对应的方法
        if (avatar.getPartByPartID(partID)) {
            avatar.changePartByAvatarID(partAvatarID, partID);
        } else {
            avatar.addPartByID(partID, partAvatarID);
        }

        // 记录当前装备部件
        this._currentEquipParts[partID] = {
            avatarID: partAvatarID,
            equip: equip
        };
    }

    /**
     * 智能卸下装备处理
     * @param takeOffEquip 卸下的装备
     */
    private smartTakeOffEquipHandle(takeOffEquip: Module_Equip): void {
        if (!takeOffEquip) return;
        
        let equipPartID = takeOffEquip.partID;
        
        if (this.isWholeAvatarEquip(equipPartID)) {
            // 整体替换模式：恢复原始行走图
            this.restoreOriginalAvatar();
        } else {
            // 部件叠加模式：移除对应部件
            let partID = this.getPartIDByEquipPart(equipPartID);
            if (partID > 0) {
                this.removePart(partID);
            }
        }
        
        // 刷新部件层级
        this.refreshPartOrderByDirection();
    }

    /**
     * 恢复原始行走图
     */
    private restoreOriginalAvatar(): void {
        if (!this._isWholeAvatarMode) return;

        // 先收集所有叠加部件数据（武器/盾牌等）
        let overlayParts = this.collectOverlayParts();

        // 在设置 avatar.id 之前注册 LOADED 监听器
        let avatar = this.so.avatar;
        let finalize = () => {
            // 恢复所有叠加部件
            for (let p of overlayParts) {
                avatar.changePartByAvatarID(p.avatarID, p.partID);
            }
            this.tryFixPartOrder();
            if (avatar && !avatar.isPlaying) {
                avatar.play();
            }
        };
        avatar.once(EventObject.LOADED, this, finalize);

        // 恢复原始行走图（这会清空所有已添加的部件并触发 LOADED）
        if (this.actor && this.actor.avatar > 0) {
            this.so.avatar.id = this.actor.avatar;
            this.so.avatarID = this.actor.avatar;
        }

        // 重置状态
        this._currentWholeAvatarID = 0;
        this._isWholeAvatarMode = false;
        this._currentEquipParts[0] = null;

        // 脱衣服后，恢复角色面板的默认行走图（88）
        Game.player.variable.setVariable(2, 88);
    }

    /**
     * 移除指定部件
     * @param partID 部件ID
     */
    private removePart(partID: number): void {
        let avatar = this.so.avatar;
        if (!avatar || !avatar.isLoaded) return;
        
        avatar.removePartByPartID(partID);
        this._currentEquipParts[partID] = null;
    }

    /**
     * 简化的部件修复：确保所有已装备的叠加部件正确显示
     * 替代原来的 refreshPartOrderByDirection（不使用不支持的 addPartByAvatar）
     */
    private tryFixPartOrder(): void {
        let avatar = this.so.avatar;
        if (!avatar || !avatar.isLoaded || !this.actor) return;

        // 遍历所有已装备的叠加部件，确保它们通过 changePartByAvatarID 正确显示
        let overlayParts = this.collectOverlayParts();
        for (let p of overlayParts) {
            avatar.changePartByAvatarID(p.avatarID, p.partID);
        }
    }

    /**
     * 根据角色朝向刷新武器/盾牌的部件层级
     * 简化为仅确保部件存在（引擎不支持 addPartByAvatar 动态调整层级）
     */
    private refreshPartOrderByDirection(): void {
        let avatar = this.so.avatar;
        if (!avatar || !avatar.isLoaded || !this.actor) return;

        // 确保所有叠加部件被正确应用
        let overlayParts = this.collectOverlayParts();
        for (let p of overlayParts) {
            avatar.changePartByAvatarID(p.avatarID, p.partID);
        }
    }
}