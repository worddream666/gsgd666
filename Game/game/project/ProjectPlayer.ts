/**
 * 项目层-玩家实现类
 * 
 * Created by 黑暗之神KDS on 2020-03-03 09:04:41.
 */
class ProjectPlayer extends ClientPlayer {
    //------------------------------------------------------------------------------------------------------
    // EventUtils 事件：道具和金币
    //------------------------------------------------------------------------------------------------------
    /**
     * 事件：监听道具数目改变 onChangeItemNumber()
     */
    static EVENT_CHANGE_ITEM_NUMBER = "ProjectPlayerCHANGE_ITEM_NUMBER";
    /**
     * 事件：监听金币改变 onChangeGoldNumber(oldGold: number, nowGold: number)
     */
    static EVENT_CHANGE_GOLD_NUMBER = "ProjectPlayerCHANGE_GOLD_NUMBER";
    /**
     * 事件：地图掉落道具 onMapDropItem(item: Module_Item | Module_Equip)
     */
    static EVENT_MAP_DROP_ITEM = "ProjectPlayerEVENT_MAP_DROP_ITEM";
    //------------------------------------------------------------------------------------------------------
    // EventUtils 事件：队伍
    //------------------------------------------------------------------------------------------------------
    /**
     * 事件：新增队伍成员 onAddPlayerActor(inPartyIndex: number,actorDS: DataStructure_inPartyActor)
     */
    static EVENT_ADD_PLAYER_ACTOR: string = "ProjectPlayerEVENT_ADD_PLAYER_ACTOR";
    /**
     * 事件：减少队伍成员 onRemovePlayerActor(inPartyIndex: number,actorDS: DataStructure_inPartyActor)
     */
    static EVENT_REMOVE_PLAYER_ACTOR: string = "ProjectPlayerEVENT_REMOVE_PLAYER_ACTOR";
    /**
     * 事件：更改控制角色 onChangeCtrl(lastCtrlSo:ProjectClientSceneObject,currentCtrlSo:ProjectClientSceneObject);
     */
    static EVENT_CHANGE_CTRL_ACTOR: string = "ProjectPlayerEVENT_CHANGE_CTRL_ACTOR";
    //------------------------------------------------------------------------------------------------------
    // EventUtils 事件：玩家的角色
    //------------------------------------------------------------------------------------------------------
    /**
     * 事件：学习了技能 onPlayerActorLearnSkill(inPartyIndex: number, actorDS: DataStructure_inPartyActor, newSkill: Module_Skill);
     */
    static EVENT_LEARN_PLAYER_ACTOR_SKILL: string = "ProjectPlayerEVENT_LEARN_PLAYER_ACTOR_SKILL";
    /**
     * 事件：忘记了技能 onPlayerActorForgetSkill(inPartyIndex: number, actorDS: DataStructure_inPartyActor, forgetSkill: Module_Skill);
     */
    static EVENT_FORGET_PLAYER_ACTOR_SKILL: string = "ProjectPlayerEVENT_FORGET_PLAYER_ACTOR_SKILL";
    /**
     * 事件：穿戴了装备 onWearPlayerActorEquip(inPartyIndex: number, actorDS: DataStructure_inPartyActor, takeOffEquip: Module_Equip, newEquip: Module_Equip);
     */
    static EVENT_WEAR_PLAYER_ACTOR_EQUIP: string = "ProjectPlayerEVENT_WEAR_PLAYER_ACTOR_EQUIP";
    /**
     * 事件：卸下了装备 onTakeOffPlayerActorEquip(inPartyIndex: number, actorDS: DataStructure_inPartyActor, takeOffEquip: Module_Equip);
     */
    static EVENT_TAKE_OFF_PLAYER_ACTOR_EQUIP: string = "ProjectPlayerEVENT_TAKE_OFF_PLAYER_ACTOR_EQUIP";
    /**
     * 事件：当经验值变更时 onPlayerActorChangeEXP(inPartyIndex: number,exp:number)
     */
    static EVENT_PLAYER_ACTOR_CHANGE_EXP: string = "ProjectPlayerEVENT_PLAYER_ACTOR_CHANGE_EXP";
    /**
     * 事件：当等级发生变更时 onPlayerActorChangeLevel(inPartyIndex: number,toLv:number)
     */
    static EVENT_PLAYER_ACTOR_CHANGE_LEVEL: string = "ProjectPlayerEVENT_PLAYER_ACTOR_CHANGE_LEVEL";
    //------------------------------------------------------------------------------------------------------
    //  静态变量
    //------------------------------------------------------------------------------------------------------
    /**
     * 当前控制的角色对应的场景对象
     */
    private static ctrlSceneObject: ProjectClientSceneObject;
    //------------------------------------------------------------------------------------------------------
    // 实例
    //------------------------------------------------------------------------------------------------------
    /**
     * 玩家的游戏对象数据：重写以便类别能够指向项目层的ProjectClientSceneObject，方便调用
     */
    declare public sceneObject: ProjectClientSceneObject;
    /**
     * 构造函数
     */
    constructor() {
        super(true);
        // -- 监听学习/忘却技能刷新被动状态
        EventUtils.addEventListenerFunction(ProjectPlayer, ProjectPlayer.EVENT_LEARN_PLAYER_ACTOR_SKILL, ProjectPlayer.onLearnPlayerActorSkill, this);
        EventUtils.addEventListenerFunction(ProjectPlayer, ProjectPlayer.EVENT_FORGET_PLAYER_ACTOR_SKILL, ProjectPlayer.onForgetPlayerActorSkill, this);
    }
    /**
     * 初始化角色数据 - 新游戏
     * @param actor 角色数据 
     */
    static init(): void {
        // -- 初始化角色
        for (let i = 0; i < Game.player.data.party.length; i++) {
            this.initPlayerActor(i);
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 静态方法-属性
    //------------------------------------------------------------------------------------------------------
    /**
     * 增加金币
     * @param v 增加的数
     */
    static increaseGold(v: number): void {
        // 修改金币
        Game.player.data.gold = Math.max(Game.player.data.gold + v, 0);
        // 派发事件
        EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_GOLD_NUMBER);
    }
    //------------------------------------------------------------------------------------------------------
    // 静态方法-背包
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取背包中的道具-DS类型
     * @param itemID 道具ID
     * @param isEquip 是否装备
     * @param includeCopyMode[可选] 默认值=false  包含复制的装备（如随机属性的装备是复制体）
     * @return [DataStructure_packageItem] 
     */
    static getItemDS(itemID: number, isEquip: boolean = false, includeCopyMode: boolean = false): DataStructure_packageItem {
        let itemDSs = ArrayUtils.matchAttributes(Game.player.data.package, { isEquip: isEquip }, false);
        if (!isEquip) {
            return ArrayUtils.matchAttributesD2(itemDSs, "item", { id: itemID }, true)[0] as any;
        }
        else {
            let equipDSs: DataStructure_packageItem[] = ArrayUtils.matchAttributesD2(itemDSs, "equip", { id: itemID }, false);
            for (let i = 0; i < equipDSs.length; i++) {
                let equipDS = equipDSs[i];
                if (!GameData.isCopyModeData(equipDS.equip) || includeCopyMode) return equipDS;
            }
            return null;
        }
    }
    /**
     * 获取道具
     * @param itemID 道具ID
     * @return [Module_Item] 
     */
    static getItem(itemID: number): Module_Item {
        let itemDS = this.getItemDS(itemID);
        if (itemDS) return itemDS.item;
        return null;
    }
    /**
     * 获取道具-根据所在背包的位置
     * @param itemIndex 道具的位置
     * @return [DataStructure_packageItem] 
     */
    static getItemDSByIndex(itemIndex: number): DataStructure_packageItem {
        return Game.player.data.package[itemIndex];
    }
    /**
     * 获取道具位置
     * @param item 道具
     * @return [number] 位置，不存在返回null
     */
    static getItemIndex(item: Module_Item): number {
        return ArrayUtils.matchAttributes(Game.player.data.package, { item: item }, true, "==", true)[0];
    }
    /**
     * 获取装备位置
     * @param equip 道具
     * @return [number] 位置，不存在返回null
     */
    static getEquipIndex(equip: Module_Equip): number {
        return ArrayUtils.matchAttributes(Game.player.data.package, { equip: equip }, true, "==", true)[0];
    }
    /**
     * 改变道具数目（增减道具）
     * @param itemID 道具ID
     * @param v 增加或减少的数目
     */
    static changeItemNumber(itemID: number, v: number, isEquip: boolean = false, happenEvent: boolean = true): boolean {
        // 道具不存在的情况：忽略
        let moduleID = isEquip ? 9 : 1;
        let sysItem = GameData.getModuleData(moduleID, itemID);
        if (!sysItem) return false;
        if (!isEquip) {
            if ((sysItem as Module_Item).isUnrealItem) return true;
        }
        // 增加的情况
        if (v > 0) {
            let itemDS = this.getItemDS(itemID, isEquip);
            // 如果不存在道具或加入的是副本装备的话则新增一个
            if (!itemDS) {
                // -- 背包已满的情况
                let nullPostion = ArrayUtils.getNullPosition(Game.player.data.package);
                if (nullPostion >= Game.player.data.packageCapacity) {
                    return false;
                }
                itemDS = new DataStructure_packageItem;
                if (isEquip) {
                    itemDS.equip = GameData.newModuleData(moduleID, itemID);
                }
                else {
                    itemDS.item = GameData.newModuleData(moduleID, itemID);
                }
                itemDS.number = v;
                itemDS.isEquip = isEquip;
                ArrayUtils.insertToNullPosition(Game.player.data.package, itemDS);
            }
            else if (itemDS) {
                itemDS.number += v;
            }
        }
        // 减少的情况
        else {
            // 优先回收普通装备，再回收复制出来的装备
            let itemDS = this.getItemDS(itemID, isEquip);
            if (!itemDS) itemDS = this.getItemDS(itemID, isEquip, true);
            if (itemDS) {
                itemDS.number += v;
                if (itemDS.number <= 0) {
                    Game.player.data.package[Game.player.data.package.indexOf(itemDS)] = null;
                }
            }
        }
        // 派发事件
        if (happenEvent) EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_ITEM_NUMBER);
        return true;
    }
    /**
     * 改变背包中的装备数目：预设的装备
     * @param equipID 装备编号
     * @param v 数目
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     */
    static addEquip(equipID: number, v: number, happenEvent: boolean = true): void {
        this.changeItemNumber(equipID, v, true, happenEvent);
    }
    /**
     * 添加装备实例进入背包（支持非预设属性的装备，如极品装备）
     * 将该装备实例打包成DS数据格式装入背包中，一个实例仅对应一件物品
     * @param equip 装备实例
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     * @param inPackageIndex[可选] 默认值=true 指定位于背包的位置
     */
    static addEquipByInstance(equip: Module_Equip, happenEvent: boolean = true, inPackageIndex: number = null): boolean {
        // -- 背包已满的情况
        let nullPostion = ArrayUtils.getNullPosition(Game.player.data.package);
        if (nullPostion >= Game.player.data.packageCapacity) {
            return false;
        }
        if (inPackageIndex != null && Game.player.data.package[inPackageIndex] != null) return false;
        let equipDS = new DataStructure_packageItem;
        equipDS.equip = equip;
        equipDS.number = 1;
        equipDS.isEquip = true;
        if (inPackageIndex == null) {
            ArrayUtils.insertToNullPosition(Game.player.data.package, equipDS);
        }
        else {
            Game.player.data.package[inPackageIndex] = equipDS;
        }
        if (happenEvent) EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_ITEM_NUMBER);
        return true;
    }
    /**
     * 添加道具实例进入背包（支持非预设属性的道具）
     * @param item 道具实例
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     * @param num [可选] 默认值=1 数目
     */
    static addItemByInstance(item: Module_Item, happenEvent: boolean = true, num: number = 1): boolean {
        if (!item.isUnrealItem) {
            // -- 背包已满的情况
            let nullPostion = ArrayUtils.getNullPosition(Game.player.data.package);
            if (nullPostion >= Game.player.data.packageCapacity) {
                return false;
            }
            let itemDS = new DataStructure_packageItem;
            itemDS.item = item;
            itemDS.number = num;
            itemDS.isEquip = false;
            ArrayUtils.insertToNullPosition(Game.player.data.package, itemDS);
            if (happenEvent) EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_ITEM_NUMBER);
        }
        return true;
    }
    /**
     * 移除道具根据实例
     * @param itemDS 
     * @param v 
     * @param happenEvent[可选] 默认值=true 
     */
    static removeItemByInstance(itemDS: DataStructure_packageItem, v: number, happenEvent: boolean = true) {
        let item = itemDS.isEquip ? itemDS.equip : itemDS.item;
        if (GameData.isCopyModeData(item)) {
            if (itemDS.number > v) {
                itemDS.number -= v;
            }
            else {
                Game.player.data.package.splice(Game.player.data.package.indexOf(itemDS), 1);
            }
        }
        else {
            ProjectPlayer.changeItemNumber(item.id, -v, itemDS.isEquip)
        }
        if (happenEvent) EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_ITEM_NUMBER);
    }
    //------------------------------------------------------------------------------------------------------
    //  掉落的地图道具（可用于拾取）
    //------------------------------------------------------------------------------------------------------
    /**
     * 掉落地图道具-自动计算位置
     * @param target 目标战斗者
     * @param startIndex[可选] 默认值=0 起始位置
     * @return [Point] 
     */
    static getDropMapItemPostion(target: ProjectClientSceneObject, startIndex: number = 0): Point {
        let gridArr: Point[] = [
            new Point(0, 0),
            new Point(1, 0),
            new Point(0, 1),
            new Point(1, 1),
            new Point(-1, 0),
            new Point(-1, 1),
            new Point(0, -1),
            new Point(-1, -1),
            new Point(1, -1)
        ];
        if (startIndex > gridArr.length - 1) return new Point(target.x, target.y);
        let p = gridArr[startIndex];
        let toX = target.x + p.x * WorldData.sceneItemSpace;
        let toY = target.y + p.y * WorldData.sceneItemSpace;
        if (Game.currentScene.sceneUtils.isObstacle(new Point(toX, toY), ProjectPlayer.ctrlActorSceneObject)) {
            toX = target.x;
            toY = target.y;
        }
        else if (SoModule_CustomCollision.collisionTest(target, true, new Point(toX, toY), true).length > 0) {
            toX = target.x;
            toY = target.y;
        }
        return new Point(toX, toY);
    }
    /**
     * 生成掉落的金币
     */
    static dropMapGold(goldNum: number, toX: number, toY: number): void {
        if (WorldData.dropGoldSetting.length == 0) return;
        let dropGoldSettingIndex = 0;
        for (let i = 0; i < WorldData.dropGoldSetting.length; i++) {
            let below = WorldData.dropGoldSetting[i].below;
            if (goldNum < below || below < 0) {
                dropGoldSettingIndex = i;
                break;
            }
        }
        let itemID = WorldData.dropGoldSetting[dropGoldSettingIndex].item;
        if (GameData.getModuleData(1, itemID) == null) return;
        let mapItem = ProjectPlayer.dropMapItemByID(itemID, toX, toY, false);
        mapItem.item.name += " x " + goldNum;
        (mapItem.item as Module_Item).value = goldNum;
    }
    /**
     * 掉落地图道具
     * @param itemID 
     * @param x 坐标x
     * @param y 坐标y
     * @param isEquip 是否装备
     * @param happenEvent[可选] 默认值=true 
     * @param num[可选] 默认值=1
     * @return [Module_Item] 
     */
    static dropMapItemByID(itemID: number, x: number, y: number, isEquip: boolean, happenEvent: boolean = true, num: number = 1): SceneItem {
        if (isEquip) {
            let equip = GameData.newModuleData(9, itemID) as Module_Equip;
            return this.dropMapItemByInstance(equip, x, y, true, happenEvent);
        }
        else {
            let item = GameData.newModuleData(1, itemID) as Module_Item;
            return this.dropMapItemByInstance(item, x, y, false, happenEvent, num);
        }
    }
    /**
     * 掉落地图道具
     * @param item 道具
     * @param x 
     * @param y 
     */
    static dropMapItemByInstance(item: Module_Item | Module_Equip, x: number, y: number, isEquip: boolean, happenEvent: boolean = true, num: number = 1): SceneItem {
        if (!isEquip) (item as Module_Item).value = num;
        let sceneItem = new SceneItem(item, x, y, isEquip, num);
        if (happenEvent) EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_MAP_DROP_ITEM, [item]);
        return sceneItem;
    }
    //------------------------------------------------------------------------------------------------------
    //  控制的角色
    //------------------------------------------------------------------------------------------------------
    /**
     * 控制的角色
     */
    static get ctrlActorSceneObject() {
        if (!ProjectPlayer.ctrlSceneObject) {
            if (!ProjectGame.inited) return Game.player.sceneObject;
            ProjectPlayer.ctrlSceneObject = Game.currentScene.sceneObjects[Game.player.data.party[Game.player.data.ctrlActorIndex].sceneObjectIndex];
        }
        return ProjectPlayer.ctrlSceneObject;
    }
    static get ctrlActorBattleModule() {
        return this.ctrlActorSceneObject.getModule(6) as SoModule_Battler;
    }
    /**
     * 切换控制的角色
     * @return [boolean] 是否切换成功
     */
    static changeToNextCtrlActor(): boolean {
        // 全员死亡或隐藏的情况下无法切换
        let canNext = false;
        for (let i = 0; i < Game.player.data.party.length; i++) {
            let targetSo = Game.currentScene.sceneObjects[Game.player.data.party[i].sceneObjectIndex];
            if (targetSo && targetSo.root.visible && !GameBattleHelper.isImpossibleBattle(targetSo)) {
                canNext = true;
                break;
            }
        }
        if (!canNext) return false;
        // 切换至下一个可控制的角色
        let oldCtrlActorIndex = Game.player.data.ctrlActorIndex;
        let lastCtrlSceneObject = this.ctrlActorSceneObject;
        Game.player.data.ctrlActorIndex++;
        if (Game.player.data.ctrlActorIndex >= Game.player.data.party.length) {
            Game.player.data.ctrlActorIndex = 0;
        }
        if (oldCtrlActorIndex != Game.player.data.ctrlActorIndex) {
            let nextCtrlSceneObject = Game.currentScene.sceneObjects[Game.player.data.party[Game.player.data.ctrlActorIndex].sceneObjectIndex];
            if (!nextCtrlSceneObject.root.visible) {
                ProjectPlayer.changeToNextCtrlActor();
                return false;
            }
            ProjectPlayer.ctrlSceneObject = nextCtrlSceneObject;
            if ((ProjectPlayer.ctrlSceneObject.getModule(6) as SoModule_Battler).isDead) {
                ProjectPlayer.changeToNextCtrlActor();
                return false;
            }
            GameFunction.cameraMove(1, 0, 0, ProjectPlayer.ctrlSceneObject.index, true, 10);
            EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_CTRL_ACTOR, [lastCtrlSceneObject, ProjectPlayer.ctrlSceneObject]);
            return true;
        }
        return false;
    }
    /**
     * 根据角色数据创建实际的场景对象
     */
    static createBattlerByActor(inPartyIndex: number, isCreateActor: boolean = true): ProjectClientSceneObject {
        if (inPartyIndex < 0) return null;
        this.initPlayerActor(inPartyIndex, isCreateActor);
        let actorDS = Game.player.data.party[inPartyIndex];
        if (actorDS) {
            let presetSceneObjectData = {
                x: Game.player.sceneObject.x,
                y: Game.player.sceneObject.y,
                avatarID: actorDS.actor.avatar,
                avatarOri: Game.player.sceneObject.avatarOri,
                name: actorDS.actor.name
            }
            let battler = Game.currentScene.addNewSceneObject(1, presetSceneObjectData) as ProjectClientSceneObject;
            let battlerModule = new SoModule_Battler(null, battler);
            battlerModule.id = 6;
            battlerModule.pointBar = GameUI.load(1023, true) as GUI_1023;
            battler.addModule(battlerModule);
            battlerModule.actor = actorDS.actor;
            battlerModule.showPointBar = true;
            battlerModule.pointBarOffsetY = 0;
            battlerModule.isDead = false;
            battlerModule.camp = -1;
            battlerModule.inPartyIndex = inPartyIndex;
            battlerModule.battlerInit(false, isCreateActor);
            actorDS.sceneObjectIndex = battler.index;
            Game.refreshActorAttribute(actorDS.actor, actorDS.lv, battler);
            if (isCreateActor) battlerModule.setPointFullState();
            return battler;
        }
    }
    /**
     * 获取角色对应的战斗者
     */
    static getPlayerPartyBattler(inPartyIndex: number): ProjectClientSceneObject {
        if (inPartyIndex < 0) return null;
        let ds = Game.player.data.party[inPartyIndex];
        return Game.currentScene.sceneObjects[ds.sceneObjectIndex];
    }
    //------------------------------------------------------------------------------------------------------
    // 静态方法-角色
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取玩家的角色集
     * @return [Module_Actor] 
     */
    static getPlayerActors(): Module_Actor[] {
        let arr: Module_Actor[] = []
        for (let i = 0; i < Game.player.data.party.length; i++) {
            arr.push(Game.player.data.party[i].actor);
        }
        return arr;
    }
    /**
     * 获取成员-DS格式数据：根据成员所在队伍的位置 
     * @param inPartyIndex 成员位置 0~N
     * @return [DataStructure_inPartyActor]
     */
    static getPlayerActorDSByInPartyIndex(inPartyIndex: number): DataStructure_inPartyActor {
        if (inPartyIndex < 0) return null;
        let ds = Game.player.data.party[inPartyIndex];
        return ds;
    }
    /**
     * 获取成员-DS格式数据：根据角色编号，如果存在多个，则返回第一个
     * @param actorID 角色编号
     * @return [DataStructure_inPartyActor] 
     */
    static getPlayerActorDSByActorID(actorID: number): DataStructure_inPartyActor {
        return ArrayUtils.matchAttributesD2(Game.player.data.party, "actor", { id: actorID }, true)[0];
    }
    /**
     * 获取成员-DS格式数据：根据成员的角色数据
     * @param actor 角色数据 
     * @return [DataStructure_inPartyActor] 
     */
    static getPlayerActorDSByActor(actor: Module_Actor): DataStructure_inPartyActor {
        return ArrayUtils.matchAttributes(Game.player.data.party, { actor: actor }, true)[0];
    }
    /**
     * 获取成员所在队伍位置：根据成员的角色数据
     * @param actor 角色数据 
     * @return 所在队伍位置
     */
    static getPlayerActorIndexByActor(actor: Module_Actor): number {
        let actorDS = this.getPlayerActorDSByActor(actor);
        if (actorDS) return Game.player.data.party.indexOf(actorDS);
        return -1;
    }
    /**
     * 获取指定角色所在队伍的首个位置
     * @param actorID 角色编号
     * @return [number] -1表示无 0~n 表示所在位置
     */
    static getPlayerActorFirstPositionByActorID(actorID: number): number {
        let actorDS = ArrayUtils.matchAttributesD2(Game.player.data.party, "actor", { id: actorID }, true)[0];
        if (actorDS) return Game.player.data.party.indexOf(actorDS);
        return -1;
    }
    /**
     * 初始化角色数据-当创建角色时调用
     * -- 修正等级上限
     * -- 根据当前等级习得对应的技能（如果已有则忽略）
     * @param inPartyIndex 所在队伍的位置 
     * @param isCreateActor 是否创建角色
     */
    static initPlayerActor(inPartyIndex: number, isCreateActor: boolean = false): void {
        let actorDS: DataStructure_inPartyActor = Game.player.data.party[inPartyIndex];
        // 创建角色的话根据携带设置清空装备和技能
        if (isCreateActor) {
            if (actorDS && !actorDS.actor.takeSetting) {
                actorDS.actor.skills.length = 0;
                actorDS.actor.equips.length = 0;
            }
        }
        // 如果是成长角色的情况下需要修正
        if (actorDS && actorDS.actor.growUpEnabled) {
            actorDS.lv = Math.max(1, Math.min(actorDS.lv, actorDS.actor.MaxLv));
            let classData: Module_Class = GameData.getModuleData(7, actorDS.actor.class);
            for (let i = 0; i < classData.lvUpAutoGetSkills.length; i++) {
                let lvUpAutoGetSkill = classData.lvUpAutoGetSkills[i];
                if (actorDS.lv >= lvUpAutoGetSkill.lv) {
                    this.learnSkillBySkillID(inPartyIndex, lvUpAutoGetSkill.skill);
                }
            }
        }
        // 刷新属性
        let battler = Game.currentScene.sceneObjects[actorDS.sceneObjectIndex];
        if (battler) {
            let battleModule = battler.getModule(6) as SoModule_Battler;
            if (battleModule) {
                Game.refreshActorAttribute(actorDS.actor, actorDS.lv, battler);
                if (isCreateActor) battleModule.setPointFullState();
            }
        }
    }
    /**
     * 增加队伍成员：根据角色编号
     * 相同编号的角色也允许（即存在多名量产型角色）
     * @param actorID 角色编号
     * @param lv [可选] 默认值=1 等级
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     * @return [Module_Actor] 
     */
    static addPlayerActorByActorID(actorID: number, lv: number = 1, happenEvent: boolean = true): DataStructure_inPartyActor {
        if (lv < 1) lv = 1;
        // 新建数据，以克隆模式，即读档后数据来自存档而非数据库设定，因为角色数据通常会变化和成长
        let newActor: Module_Actor = GameData.newModuleData(6, actorID, true);
        let ds = new DataStructure_inPartyActor();
        ds.actor = newActor;
        ds.lv = Math.min(lv, newActor.MaxLv);
        return this.addPlayerActorByDS(ds, happenEvent, true);
    }
    /**
     * 增加队伍成员：根据角色DS
     * @param actorDS 角色DS
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     * @return [Module_Actor] 
     */
    static addPlayerActorByDS(actorDS: DataStructure_inPartyActor, happenEvent: boolean = true, isCreateActor: boolean = true): DataStructure_inPartyActor {
        Game.player.data.party.push(actorDS);
        ProjectPlayer.createBattlerByActor(Game.player.data.party.length - 1, isCreateActor);
        if (happenEvent) EventUtils.happen(this, this.EVENT_ADD_PLAYER_ACTOR, [Game.player.data.party.length - 1, actorDS]);
        return actorDS;
    }
    /**
     * 减少队伍成员
     * @param inPartyIndex 队伍成员所在的位置
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     * @return [DataStructure_inPartyActor] 
     */
    static removePlayerActorByActorID(actorID: number, happenEvent: boolean = true): DataStructure_inPartyActor {
        let inPartyIndex = ProjectPlayer.getPlayerActorFirstPositionByActorID(actorID);
        if (inPartyIndex != -1) {
            let playerBattlerModule = Game.player.sceneObject.getModule(6) as SoModule_Battler;
            if (inPartyIndex == playerBattlerModule.inPartyIndex) return;
            return ProjectPlayer.removePlayerActorByInPartyIndex(inPartyIndex, happenEvent);
        }
    }
    /**
     * 减少队伍成员
     * @param inPartyIndex 队伍成员所在的位置
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     * @param removeSceneObject[可选] 默认值=true 是否移除场景对象
     * @return [DataStructure_inPartyActor] 
     */
    static removePlayerActorByInPartyIndex(inPartyIndex: number, happenEvent: boolean = true, removeSceneObject: boolean = true): DataStructure_inPartyActor {
        if (inPartyIndex >= Game.player.data.party.length || inPartyIndex <= 0) return null;
        let ctrlInPartyIndex = ProjectPlayer.ctrlActorBattleModule.inPartyIndex;
        let needChangeCtrlActor = ctrlInPartyIndex == inPartyIndex;
        let sceneOjbectIndex = Game.player.data.party[inPartyIndex].sceneObjectIndex;
        let partner = Game.currentScene.sceneObjects[sceneOjbectIndex];
        if (removeSceneObject) partner.dispose();
        let actorDS = Game.player.data.party.splice(inPartyIndex, 1)[0];
        // -- 刷新inPartyIndex
        for (let i = inPartyIndex; i < Game.player.data.party.length; i++) {
            let battler = ProjectPlayer.getPlayerPartyBattler(i);
            let battlerModule = battler.getModule(6) as SoModule_Battler;
            battlerModule.inPartyIndex = i;
        }

        if (needChangeCtrlActor) {
            ProjectPlayer.changeToNextCtrlActor();
        }
        if (happenEvent) EventUtils.happen(this, this.EVENT_REMOVE_PLAYER_ACTOR, [inPartyIndex, actorDS]);
        return actorDS;
    }
    //------------------------------------------------------------------------------------------------------
    // 角色的技能
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取玩家角色的技能：根据技能编号
     * @param inPartyIndex 所在队伍的位置
     * @param skillID 技能编号
     * @return [Module_Skill] 
     */
    static getPlayerActorSkillBySkillID(inPartyIndex: number, skillID: number): Module_Skill {
        let actorDS = this.getPlayerActorDSByActorID(inPartyIndex);
        if (actorDS) return ArrayUtils.matchAttributes(actorDS.actor.skills, { id: skillID }, true)[0];
    }
    /**
     * 学习技能
     * @param inPartyIndex 该角色所在队伍的编号
     * @param skillID 技能编号
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     * @return [boolean] 
     */
    static learnSkillBySkillID(inPartyIndex: number, skillID: number, happenEvent: boolean = true): Module_Skill {
        let actorDS: DataStructure_inPartyActor = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        if (!actorDS) return;
        let newSkill = Game.actorLearnSkill(actorDS.actor, skillID);
        if (newSkill && happenEvent) EventUtils.happen(this, this.EVENT_LEARN_PLAYER_ACTOR_SKILL, [inPartyIndex, actorDS, newSkill]);
        return newSkill;
    }
    /**
     * 忘记技能
     * @param inPartyIndex 该角色所在队伍的编号
     * @param skillID 技能编号
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     * @return [boolean] 
     */
    static forgetSkillBySkillID(inPartyIndex: number, skillID: number, happenEvent: boolean = true) {
        let actorDS: DataStructure_inPartyActor = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        if (!actorDS) return;
        let forgetSkill = Game.actorForgetSkill(actorDS.actor, skillID);
        if (forgetSkill && happenEvent) EventUtils.happen(this, this.EVENT_FORGET_PLAYER_ACTOR_SKILL, [inPartyIndex, actorDS, forgetSkill]);
        return forgetSkill;
    }
    /**
     * 忘记全部技能
     * @param inPartyIndex 该角色所在队伍的编号
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     * @return [Module_Skill] 忘记的技能集合
     */
    static forgetAllSkills(inPartyIndex: number, happenEvent: boolean = true): Module_Skill[] {
        let actorDS: DataStructure_inPartyActor = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        if (!actorDS) return;
        let forgetSkills = actorDS.actor.skills.concat();
        Game.actorForgetAllSkills(actorDS.actor, happenEvent);
        for (let i = 0; i < forgetSkills.length; i++) {
            if (happenEvent) EventUtils.happen(this, this.EVENT_FORGET_PLAYER_ACTOR_SKILL, [inPartyIndex, actorDS, forgetSkills[i]]);
        }
        return forgetSkills;
    }
    //------------------------------------------------------------------------------------------------------
    // 角色的装备
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取角色的装备：根据部位编号
     * @param inPartyIndex 该角色所在队伍的索引
     * @param partID 部位ID
     * @return [Module_Equip] 
     */
    static getPlayerActorEquipByPartID(inPartyIndex: number, partID: number): Module_Equip {
        let actorDS = this.getPlayerActorDSByInPartyIndex(inPartyIndex);
        if (actorDS) return Game.getActorEquipByPartID(actorDS.actor, partID);
    }
    /**
     * 检查角色是否允许佩戴指定的装备
     * @param inPartyIndex 指定的角色
     * @param newEquip 装备
     * @return [boolean] 
     */
    static canWearPlayerActorEquip(inPartyIndex: number, newEquip: Module_Equip): boolean {
        let actorDS = this.getPlayerActorDSByInPartyIndex(inPartyIndex);
        if (actorDS) {
            let classID = actorDS.actor.class;
            let classData: Module_Class = GameData.getModuleData(7, classID);
            if (classData) {
                return classData.equipSetting.indexOf(newEquip.type) != -1;
            }
        }
        return false;
    }
    /**
     * 佩戴角色装备：
     * -- 如果该部位已存在装备则会卸下至背包中
     * -- 新的装备必须已拥有（在背包中）
     * @param inPartyIndex 该角色所在队伍的索引
     * @param newEquip 新的装备
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     * @return success=是否更换成功 removeEquip=更换下来的装备
     */
    static wearPlayerActorEquip(inPartyIndex: number, newEquip: Module_Equip, happenEvent: boolean = true): { success: boolean, takeOffEquip: Module_Equip } {
        if (newEquip) {
            // -- 查找背包该装备
            let newEquipIndex = this.getEquipIndex(newEquip);
            if (newEquipIndex != null) {
                // -- 查找角色
                let actorDS = this.getPlayerActorDSByInPartyIndex(inPartyIndex);
                if (actorDS) {
                    // -- 背包该装备-1
                    this.removePackageItemByItemDS(Game.player.data.package[newEquipIndex], 1, happenEvent);
                    // -- 卸载该部位上的装备
                    let takeOffEquip = this.takeOffPlayerActorEquipByPartID(inPartyIndex, newEquip.partID, happenEvent);
                    // -- 装上来自背包的装备
                    Game.wearActorEquip(actorDS.actor, newEquip);
                    // -- 派发事件
                    if (happenEvent) EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_WEAR_PLAYER_ACTOR_EQUIP, [inPartyIndex, actorDS, takeOffEquip, newEquip]);
                    return { success: true, takeOffEquip: takeOffEquip };
                }
            }
        }
        return { success: false, takeOffEquip: null };
    }
    /**
     * 卸下装备:该装备将会放置回背包（如有）根据角色索引
     * @param inPartyIndex 该角色所在队伍的索引
     * @param partID 部位ID
     * @param happenEvent[可选] 默认值=true 是否派发事件
     * @param addEquipToPackage[可选] 默认值=true 是否卸下的装备加入到背包中
     * @param inPackageIndex[可选] 默认值=true 指定位于背包的位置
     * @return [Module_Equip] 卸载出来的装备
     */
    static takeOffPlayerActorEquipByPartID(inPartyIndex: number, partID: number, happenEvent: boolean = true, addEquipToPackage: boolean = true, inPackageIndex: number = null): Module_Equip {
        let actorDS = Game.player.data.party[inPartyIndex];
        if (!actorDS) return null;
        let takeOffEquip = Game.takeOffActorEquipByPartID(actorDS.actor, partID);
        if (takeOffEquip) {
            // 装备移入背包中
            if (addEquipToPackage) {
                let bool = this.addEquipByInstance(takeOffEquip, happenEvent, inPackageIndex);
                if (!bool) return null;
            }
            if (happenEvent) EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_TAKE_OFF_PLAYER_ACTOR_EQUIP, [inPartyIndex, actorDS, takeOffEquip]);
        }
        return takeOffEquip;
    }
    /**
     * 卸下全部装备:这些装备将会放置回背包（如有）根据角色索引
     * @param inPartyIndex 该角色所在队伍的索引
     * @param addEquipToPackage[可选] 默认值=true 是否卸下的装备加入到背包中
     * @return [Module_Equip] 卸载出来的装备
     */
    static takeOffPlayerActorAllEquips(inPartyIndex: number, happenEvent: boolean = true, addEquipToPackage: boolean = true): Module_Equip[] {
        let actorDS = Game.player.data.party[inPartyIndex];
        if (!actorDS) return null;
        let takeOffEquips = Game.takeOffActorAllEquips(actorDS.actor);
        for (let i = 0; i < takeOffEquips.length; i++) {
            let takeOffEquip = takeOffEquips[i];
            if (addEquipToPackage) this.addEquipByInstance(takeOffEquip, happenEvent);
            if (happenEvent) EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_TAKE_OFF_PLAYER_ACTOR_EQUIP, [inPartyIndex, actorDS, takeOffEquip]);
        }
        return takeOffEquips;
    }
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 增加经验值
     */
    static increaseExpByIndex(inPartyIndex: number, exp: number): { isLevelUp: boolean, fromLv: number, toLv: number, fromExp: number, toExp: number, learnSkills: Module_Skill[] } {
        let actorDS: DataStructure_inPartyActor = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        let actor: Module_Actor = actorDS.actor;
        let classData: Module_Class = GameData.getModuleData(7, actor.class);
        if (!classData) return;
        // 已经最高级则不再允许增加经验值
        if (actorDS.lv >= actor.MaxLv) return;
        // 无法成长的角色
        if (!actor.growUpEnabled) return;
        let fromExp = actor.currentEXP;
        let fromLv = actorDS.lv;
        // 增加经验值
        actor.currentEXP += exp;
        // 升级判定
        let isLevelUp = false;
        let learnSkills: Module_Skill[] = [];
        while (1) {
            if (actorDS.lv >= actor.MaxLv) break;
            let nextExp = Game.getLevelUpNeedExp(actor, actorDS.lv);
            if (actor.currentEXP >= nextExp) {
                actorDS.lv++;
                isLevelUp = true;
                actor.currentEXP -= nextExp;
                for (let i = 0; i < classData.lvUpAutoGetSkills.length; i++) {
                    let lvUpAutoGetSkill = classData.lvUpAutoGetSkills[i];
                    if (actorDS.lv >= lvUpAutoGetSkill.lv) {
                        let learnSkill = this.learnSkillBySkillID(inPartyIndex, lvUpAutoGetSkill.skill);
                        if (learnSkill) learnSkills.push(learnSkill);
                    }
                }
            }
            else {
                break;
            }
        }
        let toLv = actorDS.lv;
        let toExp = actor.currentEXP;
        EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_PLAYER_ACTOR_CHANGE_EXP, [inPartyIndex, exp]);
        // 升级时处理
        if (isLevelUp) {
            let battler = ProjectPlayer.getPlayerPartyBattler(inPartyIndex);
            if (actor.levelUpEvent) CommandPage.startTriggerFragmentEvent(actor.levelUpEvent, battler, battler);
            let actorClass: Module_Class = GameData.getModuleData(7, actor.class);
            if (actorClass && actorClass.levelUpEvent) CommandPage.startTriggerFragmentEvent(actorClass.levelUpEvent, battler, battler);
            Game.refreshActorAttribute(actor, actorDS.lv, battler);
            GameCommand.startCommonCommand(14023, [], null, battler, battler);
            EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_PLAYER_ACTOR_CHANGE_LEVEL, [inPartyIndex, toLv]);
        }
        return { isLevelUp: isLevelUp, fromLv: fromLv, toLv: toLv, fromExp: fromExp, toExp: toExp, learnSkills: learnSkills };
    }
    //------------------------------------------------------------------------------------------------------
    // 内部实现
    //------------------------------------------------------------------------------------------------------
    /**
     * 改变背包中的道具数目（增减道具/装备）：根据指定的DS数据
     * @param itemDS 道具/装备DS格式数据
     * @param v 变更的数目
     * @param isEquip 是否装备
     * @param happenEvent [可选] 默认值=true 是否派发相关事件
     */
    private static removePackageItemByItemDS(itemDS: DataStructure_packageItem, v: number, happenEvent: boolean = true): void {
        let inPackageIdx = Game.player.data.package.indexOf(itemDS);
        if (inPackageIdx == -1) return;
        itemDS.number -= v;
        if (itemDS.number <= 0) {
            Game.player.data.package[inPackageIdx] = null;
        }
        if (happenEvent) EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_ITEM_NUMBER);
    }
    /**
     * 当玩家角色学习技能时 - 刷新自动状态
     * @param inPartyIndex 所在队伍位置
     * @param actorDS 角色数据
     * @param takeOffEquip 卸下的装备
     * @param newEquip 新的装备
     */
    private static onLearnPlayerActorSkill(inPartyIndex: number, actorDS: DataStructure_inPartyActor, newSkill: Module_Skill) {
        let battler = ProjectPlayer.getPlayerPartyBattler(inPartyIndex);
        if (battler) {
            let battleModule = battler.getModule(6) as SoModule_Battler;
            battleModule.learnSkillHandle(newSkill);
        }
    }
    /**
     * 当玩家角色卸下装备时 - 更新行走图部件样式
     * @param inPartyIndex 所在队伍位置
     * @param actorDS 角色数据
     * @param takeOffEquip 卸下的装备
     */
    private static onForgetPlayerActorSkill(inPartyIndex: number, actorDS: DataStructure_inPartyActor, forgetSkill: Module_Skill) {
        let battler = ProjectPlayer.getPlayerPartyBattler(inPartyIndex);
        if (battler) {
            let battleModule = battler.getModule(6) as SoModule_Battler;
            battleModule.forgetSkillHandle(forgetSkill);
        }
    }
}