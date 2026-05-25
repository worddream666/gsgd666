/**
 * 角色的技能界面
 * Created by 黑暗之神KDS on 2023-10-16 01:29:41.
 */
class GUI_Skill extends GUI_16 {
    /**
     * 描述名称初始颜色
     */
    private itemNameInitColor: string;
    /**
     * 构造函数
     */
    constructor() {
        super();
        // 记录初始颜色
        this.itemNameInitColor = this.itemName.color;
        // 标准化列表
        GUI_Manager.standardList(this.actorList, false);
        GUI_Manager.standardList(this.actorSkillList, false);
        // 事件监听：当界面显示时
        this.on(EventObject.DISPLAY, this, this.onDisplay);
        // 事件监听：面板鼠标悬停
        this.panel.on(EventObject.MOUSE_OVER, this, this.onPanelMouseOver);
        // 事件监听：角色列表容器-鼠标悬停
        this.actorRoot.on(EventObject.MOUSE_OVER, this, this.onActorListMouseOver);
        // 事件监听：角色列表索引改变时
        this.actorList.on(EventObject.CHANGE, this, this.refreshActor);
        // 当创建角色列表项时
        this.actorList.on(UIList.ITEM_CREATE, this, this.onCreateActorItem);
        // 当创建技能列表项时
        this.actorSkillList.on(UIList.ITEM_CREATE, this, this.onCreateActorSkillItem);
        // 当技能栏选中项更改时
        this.actorSkillList.on(EventObject.CHANGE, this, this.onActorSkillChange);
        // 键盘事件
        if (!Browser.onMobile) {
            stage.on(EventObject.KEY_DOWN, this, this.onKeyDown);
        }
    }
    //------------------------------------------------------------------------------------------------------
    //  
    //------------------------------------------------------------------------------------------------------
    /**
     * 当界面显示时事件
     */
    private onDisplay() {
        // 刷新角色
        this.refreshActorList();
        // 刷新焦点
        this.refreshFocus();
        // 刷新道具列表
        this.refreshActorSkillPanel();
    }
    /**
     * 刷新焦点
     */
    private refreshFocus(): void {
        UIList.focus = this.actorSkillList;
    }
    /**
     * 当主面板-鼠标悬停时
     */
    private onPanelMouseOver(): void {
        UIList.focus = this.actorSkillList;
    }
    /**
     * 键盘事件
     */
    private onKeyDown(e: EventObject): void {
        if (!this.stage) return;
        // -- L1
        if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.L1)) {
            this.setSelectActorIndex(this.actorList.selectedIndex - 1);
        }
        // -- R1
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.R1)) {
            this.setSelectActorIndex(this.actorList.selectedIndex + 1);
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 数据
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取当前选中的角色DS
     * @return [DataStructure_inPartyActor] 
     */
    private get selectedActorDS(): DataStructure_inPartyActor {
        let selectedIndex = Math.max(0, this.actorList.selectedIndex);
        return Game.player.data.party[selectedIndex];
    }
    private get selectedActorDSIndex(): number {
        let selectedIndex = Math.max(0, this.actorList.selectedIndex);
        return selectedIndex;
    }
    /**
     * 设置角色索引
     * @param n 
     */
    private setSelectActorIndex(n: number): void {
        if (n < 0) n = this.actorList.length - 1;
        else if (n >= this.actorList.length) n = 0;
        this.actorList.selectedIndex = n;
    }
    //------------------------------------------------------------------------------------------------------
    //  角色列表
    //------------------------------------------------------------------------------------------------------
    /**
     * 刷新角色
     */
    private refreshActorList(): void {
        let lastActorListIndex = this.actorList.selectedIndex;
        let arr = [];
        // 遍历我的队伍
        for (let i = 0; i < Game.player.data.party.length; i++) {
            // 获取角色DS格式数据
            let actorDS: DataStructure_inPartyActor = Game.player.data.party[i];
            // 获取角色模块数据
            let actor: Module_Actor = actorDS.actor;
            // 创建列表的项数据
            let d = new ListItem_1011;
            // 头像
            d.face = actor.face;
            // 绑定数据，以免后面直接访问
            d.data = actorDS;
            // 添加至数组中
            arr.push(d);
        }
        this.actorList.items = arr;
        if (lastActorListIndex == -1) this.actorList.selectedIndex = 0;
        else this.actorList.selectedIndex = lastActorListIndex;
    }
    /**
     * 刷新角色
     */
    private refreshActor(): void {
        this.refreshActorSkillPanel();
    }
    /**
     * 当创建可装备的道具栏项时
     */
    private onCreateActorItem(ui: GUI_1011, data: ListItem_1011, index: number) {
        let actorDS: DataStructure_inPartyActor = data.data;
        if (actorDS) {
            let battler = ProjectPlayer.getPlayerPartyBattler(index);
            let battlerModule = battler.getModule(6) as SoModule_Battler;
            ui.deadSign.visible = battlerModule.isDead ? true : false;
        }
    }
    /**
     * 当角色列表-鼠标悬停
     */
    private onActorListMouseOver(e): void {
        UIList.focus = this.actorList;
    }
    //------------------------------------------------------------------------------------------------------
    // 角色面板-技能
    //------------------------------------------------------------------------------------------------------
    /**
     * 当创建技能栏项时
     */
    private onCreateActorSkillItem(ui: GUI_1013, data: ListItem_1013, index: number) {
        let skill: Module_Skill = data.data;
        if (!skill) return;
    }
    /**
     * 刷新角色技能面板
     */
    private refreshActorSkillPanel() {
        let selectedActorDS = this.selectedActorDS;
        if (!selectedActorDS) return;
        let arr = [];
        // 遍历角色的技能
        for (let i = 0; i < selectedActorDS.actor.skills.length; i++) {
            // 获取背包的道具DS格式
            let skill: Module_Skill = selectedActorDS.actor.skills[i];
            // 如果没有技能图标忽略显示（表示需要隐藏的技能）
            if (skill && !skill.icon) continue;
            // 创建对应的背包物品项数据，该项数据由系统自动生成
            let d = new ListItem_1013;
            // 绑定项数据，项显示对象会自动根据项数据设置对应的值，参考UIList.api头部注释（CTRL+SHIFT+R搜索UIList.api）
            d.data = skill; // 项数据记录对应的技能，以便能够通过项数据找到其对应的技能
            d.icon = skill ? skill.icon : ""; // 设置图标
            arr.push(d);
        }
        this.actorSkillList.items = arr;
        this.actorSkillList.selectedIndex = 0;
    }
    /**
     * 当技能选中发生改变时处理
     */
    private onActorSkillChange() {
        this.refreshDescribe();
    }
    //------------------------------------------------------------------------------------------------------
    // 描述
    //------------------------------------------------------------------------------------------------------
    /**
     * 刷新描述
     */
    private refreshDescribe(): void {
        let name = "";
        let desc = "";
        this.itemName.color = this.itemNameInitColor;
        // 焦点在技能栏的情况下
        let itemData = this.actorSkillList.selectedItem;
        let skill = itemData?.data as Module_Skill;
        if (skill) {
            name = skill.name + (skill.level > 1 ? ` Lv.${skill.level}` : ``);
            desc = GUI_Manager.skillDesc(skill, Game.player.data.party[0].actor);
        }
        this.itemName.text = name;
        this.itemIntro.text = desc;
        this.itemIntro.height = this.itemIntro.textHeight;
        this.itemIntroRoot.refresh();
    }
}