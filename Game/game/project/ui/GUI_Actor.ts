// =======================================================================
// 角色面板 (GUI_Actor) - 完美对齐与清理版
// =======================================================================

// -----------------------------------------------------------------------
// 1. 布局配置 (请仔细核对这里)
// -----------------------------------------------------------------------

// 左侧列：1~6号部位
const LEFT_PARTS = [1, 2, 3, 4, 5, 6]; 

// 右侧列：前5个是0(空位)，第6个是7(真实装备)
const RIGHT_PARTS = [0, 0, 0, 0, 0, 7]; 

const ATTR_IDS = {
    HP_BASE: 1, ATK_BASE: 2,
    POISON_ATK: 3, ICE_ATK: 4, FIRE_ATK: 5, ELEC_ATK: 6,
    POISON_DEF: 7, ICE_DEF: 8, FIRE_DEF: 9, ELEC_DEF: 10,
    DODGE_BASE: 11, MOVE_BASE: 12, HIT_BASE: 13, CRIT_BASE: 14, SPD_BASE: 15,
    DEF_BASE: 16,
    HP_COMBINE: 17, DODGE_COMBINE: 18, MOVE_COMBINE: 19,
    HIT_COMBINE: 20, CRIT_COMBINE: 21, SPD_COMBINE: 22,
    RANGE: 23, MAG_BASE: 24 
};

// 基础属性
const BASE_ATTR_SET = new Set([
    ATTR_IDS.HP_BASE, ATTR_IDS.ATK_BASE, ATTR_IDS.DEF_BASE,
    ATTR_IDS.DODGE_BASE, ATTR_IDS.MOVE_BASE, 
    ATTR_IDS.HIT_BASE, ATTR_IDS.CRIT_BASE, ATTR_IDS.SPD_BASE,
    ATTR_IDS.RANGE, ATTR_IDS.MAG_BASE
]);

// 拓展属性
const EXT_ATTR_SET = new Set([
    ATTR_IDS.POISON_ATK, ATTR_IDS.ICE_ATK, ATTR_IDS.FIRE_ATK, ATTR_IDS.ELEC_ATK,
    ATTR_IDS.POISON_DEF, ATTR_IDS.ICE_DEF, ATTR_IDS.FIRE_DEF, ATTR_IDS.ELEC_DEF,
    ATTR_IDS.HP_COMBINE, ATTR_IDS.DODGE_COMBINE, ATTR_IDS.MOVE_COMBINE,
    ATTR_IDS.HIT_COMBINE, ATTR_IDS.CRIT_COMBINE, ATTR_IDS.SPD_COMBINE
]);

const ACTOR_ATTR_MAPPING = {
    CHAR_INFO: [ { name: "基础生命", id: 1 }, { name: "基础魔法", id: 24 } ],
    ATK: [ { name: "毒系攻击", id: 3 }, { name: "冰系攻击", id: 4 }, { name: "火系攻击", id: 5 }, { name: "电系攻击", id: 6 } ],
    DEF: [ { name: "毒系防御", id: 7 }, { name: "冰系防御", id: 8 }, { name: "火系防御", id: 9 }, { name: "电系防御", id: 10 } ],
    BASIC: [ { name: "基础闪避", id: 11 }, { name: "基础移速", id: 12 }, { name: "基础命中", id: 13 }, { name: "基础暴击", id: 14 }, { name: "基础攻速", id: 15 } ]
};

// -----------------------------------------------------------------------
// 2. 角色面板类
// -----------------------------------------------------------------------

if (typeof GUI_4 === 'undefined') {
    var GUI_4 = class extends GameCreator.BaseUI { constructor() { super(); } };
}

class GUI_Actor extends GUI_4 {
    static actorSelectedIndex: number;
    
    // 向网页发送角色数据
    static sendActorStatsToWeb() {
        if (!Game.player || !Game.player.data || !Game.player.data.party || Game.player.data.party.length === 0) {
            console.log('No player data available');
            return;
        }
        
        // 获取第一个角色的数据
        const actorDS = Game.player.data.party[0];
        const actor = actorDS.actor;
        
        // 提取角色属性
        // 读取字符串变量14002中的角色名字（类型15的第3个变量）
        const actorName = Game.player.variable.getString(14002) || actor.name || '未知角色';
        
        const stats = {
            level: actorDS.lv || 1,
            attack: actor.extendAttributes ? Math.floor(actor.extendAttributes[2] || 0) : 0,
            hp: actor.extendAttributes ? Math.floor(actor.extendAttributes[1] || 0) : 0,
            gold: Game.player.data.gold || 0,
            toxic: actor.extendAttributes ? Math.floor(actor.extendAttributes[3] || 0) : 0,
            ice: actor.extendAttributes ? Math.floor(actor.extendAttributes[4] || 0) : 0,
            fire: actor.extendAttributes ? Math.floor(actor.extendAttributes[5] || 0) : 0,
            thunder: actor.extendAttributes ? Math.floor(actor.extendAttributes[6] || 0) : 0,
            toxic_def: actor.extendAttributes ? Math.floor(actor.extendAttributes[7] || 0) : 0,
            ice_def: actor.extendAttributes ? Math.floor(actor.extendAttributes[8] || 0) : 0,
            fire_def: actor.extendAttributes ? Math.floor(actor.extendAttributes[9] || 0) : 0,
            thunder_def: actor.extendAttributes ? Math.floor(actor.extendAttributes[10] || 0) : 0,
            name: actorName
        };
        
        console.log('Sending actor stats to web:', stats);
        
        // 发送消息到所有iframe
        try {
            const iframes = document.getElementsByTagName('iframe');
            for (let i = 0; i < iframes.length; i++) {
                const iframe = iframes[i];
                try {
                    iframe.contentWindow.postMessage({
                        type: 'GAME_STATS_UPDATE',
                        stats: stats
                    }, '*');
                } catch (e) {
                    console.log('Cannot send to iframe:', e);
                }
            }
        } catch (e) {
            console.log('Error sending message to web:', e);
        }
    }

    static get actorIndex(): number {
        let actorUI = GameUI.get(4) as GUI_Actor;
        if (actorUI && actorUI.actorList) return actorUI.actorList.selectedIndex;
        return 0;
    }

    public txtAttrBase: UIString;
    public txtAttrAtk: UIString;
    public txtAttrDef: UIString;
    public txtAttrBasic: UIString;
    
    // 生命条和魔法条组件
    public HPSlider: UISlider;
    public HPText: UIString;
    public SPSlider: UISlider;
    public SPText: UIString;

    constructor() {
        super();
        
        if (this.actorList) GUI_Manager.standardList(this.actorList, false);
        if (this.targetActorList) GUI_Manager.standardList(this.targetActorList, false);
        
        this.on(EventObject.DISPLAY, this, this.onDisplay);
        this.on(EventObject.UNDISPLAY, this, this.onUndisplay);

        if (this.actorRoot) this.actorRoot.on(EventObject.MOUSE_OVER, this, this.onActorListMouseOver);
        if (this.actorList) {
            this.actorList.on(EventObject.CHANGE, this, this.refreshActor);
            this.actorList.on(UIList.ITEM_CREATE, this, this.onCreateActorItem);
        }

        if (this.targetActorList) {
            this.targetActorList.on(UIList.ITEM_CLICK, this, this.onActorItemClick);
        }

        if (this.actorEquipRoot) this.actorEquipRoot.on(EventObject.MOUSE_OVER, this, this.onEquipMouseOver);
        
        if (this.actorEquipList) {
            this.actorEquipList.mouseEnabled = true;
            // 【关键】强制2列
            this.actorEquipList.repeatX = 2;

            this.actorEquipList.on(EventObject.RIGHT_CLICK, this, (e: EventObject) => {
                if (e && e.stopPropagation) e.stopPropagation();
            });

            this.actorEquipList.on(EventObject.CHANGE, this, this.refreshEquipInfo);
            this.actorEquipList.on(UIList.ITEM_CREATE, this, this.onEquipCreate);
        }

        if (!Browser.onMobile) {
            stage.on(EventObject.KEY_DOWN, this, this.onKeyDown);
        }

        // 监听装备穿戴/卸下事件，用于同步数据到排行榜
        EventUtils.addEventListenerFunction(ProjectPlayer, ProjectPlayer.EVENT_WEAR_PLAYER_ACTOR_EQUIP, this.onEquipChanged, this);
        EventUtils.addEventListenerFunction(ProjectPlayer, ProjectPlayer.EVENT_TAKE_OFF_PLAYER_ACTOR_EQUIP, this.onEquipChanged, this);
    }

    /**
     * 装备变化处理 - 刷新角色面板显示并发送更新到排行榜
     */
    private onEquipChanged() {
        // 刷新角色面板显示（包括 smallAvatar）
        this.refreshActorDataPanel();
        this.refreshActorEquips();
        
        // 延迟发送，确保装备数据已更新
        setTimeout(() => {
            GUI_Actor.sendActorStatsToWeb();
        }, 100);
    }

    private onDisplay() {
        this.refreshActorList();
        this.refreshFocus();
        this.refreshActorEquips();
        if (this.actorEquipList) this.actorEquipList.selectedIndex = -1;
        this.refreshActorAttributes();
        
        // 发送角色数据到网页
        GUI_Actor.sendActorStatsToWeb();
    }

    private onUndisplay() {
        if (typeof Lyirs_GUI_CommonInfo !== "undefined") {
            Lyirs_GUI_CommonInfo.getInstance().hide();
        }
    }

    // -----------------------------------------------------------------------
    // 装备列表显示 (Item Create)
    // -----------------------------------------------------------------------

    private onEquipCreate(ui: GUI_1012, data: ListItem_1012, index: number): void {
        if (!ui) return;
        
        // 【核心修复：彻底隐藏占位符并清空文字】
        // data.data === null 表示这是我们生成的占位空数据
        if (data.data === null) {
            ui.visible = false;      // 隐藏格子
            ui.mouseEnabled = false; // 禁止交互
            
            // 强制清空文字，防止显示 "PartName" 或 "Tier" 这种残留文字
            if (ui["partName"]) ui["partName"].text = "";
            if (ui["tierLabel"]) ui["tierLabel"].text = "";
            if (ui.icon) ui.icon.image = "";
            return;
        }
        
        // 如果是有效数据，确保显示出来
        ui.visible = true;
        ui.mouseEnabled = true;
        
        let equip: Module_Equip = data.data;

        // 1. 阶数显示
        if (ui["tierLabel"]) {
            ui["tierLabel"].text = ""; // 先清空
            if (equip && equip.id) {
                const tierInfo = this.getEquipTierInfo(equip);
                if (tierInfo.tier > 0) {
                    ui["tierLabel"].text = "+" + tierInfo.tier;
                    ui["tierLabel"].color = tierInfo.color;
                }
            }
        }

        // 2. 绑定事件
        if (ui["__hasBoundEvents"]) return;
        ui["__hasBoundEvents"] = true;

        const showTooltip = () => {
            let currentItem = this.actorEquipList.items[index];
            if (!currentItem || currentItem.data === null) return;
            let currentEquip = currentItem.data;
            
            if (currentEquip && currentEquip.id && typeof Lyirs_GUI_CommonInfo !== "undefined") {
                const infoUI = Lyirs_GUI_CommonInfo.getInstance();
                infoUI.showEquipInfo(currentEquip);
                const globalPos = ui.localToGlobal(new Point(0, 0));
                infoUI.setPosition(globalPos.x + ui.width + 10, globalPos.y);
                if(infoUI.parent) infoUI.parent.setChildIndex(infoUI, infoUI.parent.numChildren - 1);
            }
        };

        const hideTooltip = () => {
            if (typeof Lyirs_GUI_CommonInfo !== "undefined") Lyirs_GUI_CommonInfo.getInstance().hide();
        };

        ui.on(EventObject.MOUSE_OVER, this, showTooltip);
        ui.on(EventObject.MOUSE_OUT, this, hideTooltip);

        const handleInteraction = (e: EventObject) => {
            if (e && e.stopPropagation) e.stopPropagation(); 
            this.doUnequip(index);
        };

        ui.on(EventObject.DOUBLE_CLICK, this, handleInteraction);
        ui.on(EventObject.RIGHT_CLICK, this, handleInteraction);

        if (ui.icon) {
            ui.icon.mouseEnabled = true;
            ui.icon.on(EventObject.MOUSE_OVER, this, showTooltip);
            ui.icon.on(EventObject.MOUSE_OUT, this, hideTooltip);
            ui.icon.on(EventObject.DOUBLE_CLICK, this, handleInteraction);
            ui.icon.on(EventObject.RIGHT_CLICK, this, handleInteraction);
        }
    }

    // -----------------------------------------------------------------------
    // 【核心】数据填充 (Z字形填充日志版)
    // -----------------------------------------------------------------------
    private refreshActorEquips() { 
        let ds = this.selectedActorDS; 
        if (!ds || !this.actorEquipList) return; 
        
        let arr = []; 
        const maxRows = Math.max(LEFT_PARTS.length, RIGHT_PARTS.length);
        
        console.log("=== 装备列表布局生成开始 ===");
        
        for (let row = 0; row < maxRows; row++) {
            
            // --- 左侧列 (第1列) ---
            let leftPartID = 0;
            if (row < LEFT_PARTS.length) leftPartID = LEFT_PARTS[row];
            
            if (leftPartID !== 0) {
                arr.push(this.createEquipItemData(ds.actor, leftPartID));
              
            } else {
                arr.push(this.createEmptyItemData());
            }
            
            // --- 右侧列 (第2列) ---
            let rightPartID = 0;
            if (row < RIGHT_PARTS.length) rightPartID = RIGHT_PARTS[row];
            
            if (rightPartID !== 0) {
                arr.push(this.createEquipItemData(ds.actor, rightPartID));
            } else {
                arr.push(this.createEmptyItemData());
            }
        }
        
      
        
        this.actorEquipList.items = arr; 
        
        // 强制刷新
        setTimeout(() => {
            if (!this.actorEquipList || !this.actorEquipList.items) return;
            // 确保列表项大小足够 (调试用：如果错位请检查这里)
            // this.actorEquipList.itemWidth = 200; // 您可以在这里强制设定宽度
            
            for (let i = 0; i < this.actorEquipList.items.length; i++) {
                let ui = this.actorEquipList.getItemUI(i) as GUI_1012;
                if (ui) {
                    ui["__hasBoundEvents"] = false; 
                    this.onEquipCreate(ui, this.actorEquipList.items[i], i);
                }
            }
        }, 50);
    }

    private createEquipItemData(actor: Module_Actor, partID: number): ListItem_1012 {
        let eq = Game.getActorEquipByPartID(actor, partID);
        let d = new ListItem_1012; 
        if (eq) { 
            d.data = eq; 
            d.icon = eq.icon; 
        } else { 
            d.icon = ""; 
            d.data = { partID: partID } as any; 
        } 
        const partModule = GameData.getModuleData(19, partID);
        d.partName = partModule ? partModule.name : "";
        return d;
    }

    private createEmptyItemData(): ListItem_1012 {
        let d = new ListItem_1012;
        d.icon = "";
        d.partName = ""; // 数据层清空文字
        d.data = null;   // 标记为纯占位符
        return d;
    }

    private getEquipTierInfo(equip: Module_Equip): { tier: number, color: string } {
        if (!equip || !equip.customAttributes) return { tier: 0, color: "#FFFFFF" };
        let maxPercent = 0;
        for (let ca of equip.customAttributes) {
            if (EXT_ATTR_SET.has(ca.attribute)) {
                const p = ca.value; 
                if (p > maxPercent) maxPercent = p;
            }
        }
        let tier = 0;
        let color = "#FFFFFF";
        if (maxPercent > 0) {
            tier = Math.floor(maxPercent / 10);
            if (maxPercent >= 80) color = "#FFFF00";      
            else if (maxPercent >= 60) color = "#00BFFF"; 
            else if (maxPercent >= 40) color = "#00FF00"; 
        }
        return { tier: tier, color: color };
    }

    private doUnequip(index: number) {
        if (index < 0 || !this.actorEquipList || index >= this.actorEquipList.items.length) return;
        let itemUI = this.actorEquipList.items[index];
        if (!itemUI || !itemUI.data || !itemUI.data.id) return; 
        
        let equip: Module_Equip = itemUI.data;
        if (ProjectPlayer.takeOffPlayerActorEquipByPartID(this.selectedActorDSIndex, equip.partID)) {
            GameAudio.playSE(WorldData.unequipSE);
            this.refreshActorEquips();
            Game.refreshActorAttribute(this.selectedActorDS.actor, this.selectedActorDS.lv, ProjectPlayer.getPlayerPartyBattler(this.selectedActorDSIndex));
            this.refreshActorDataPanel();
            if (typeof Lyirs_GUI_CommonInfo !== "undefined") Lyirs_GUI_CommonInfo.getInstance().hide();
            // 装备变化后发送更新到排行榜
            GUI_Actor.sendActorStatsToWeb();
        } else {
            GameAudio.playSE(WorldData.disalbeSE);
        }
    }

    // 属性刷新保持不变
    private refreshActorAttributes(): void {
        if (!this.selectedActorDS) return;
        let selectedActor = this.selectedActorDS.actor;
        if (!selectedActor) return;
        if (this.txtAttrBase) {
            let text = "";
            for (let cfg of ACTOR_ATTR_MAPPING.CHAR_INFO) {
                text += `${cfg.name}: ${this.getActorAttrValue(selectedActor, cfg.id)}\n`;
            }
            this.txtAttrBase.text = text;
        }
        if (this.txtAttrAtk) {
            let text = "";
            for (let cfg of ACTOR_ATTR_MAPPING.ATK) {
                text += `${cfg.name}: ${this.getActorAttrValue(selectedActor, cfg.id)}\n`;
            }
            this.txtAttrAtk.text = text;
        }
        if (this.txtAttrDef) {
            let text = "";
            for (let cfg of ACTOR_ATTR_MAPPING.DEF) {
                text += `${cfg.name}: ${this.getActorAttrValue(selectedActor, cfg.id)}\n`;
            }
            this.txtAttrDef.text = text;
        }
        if (this.txtAttrBasic) {
            let text = "";
            for (let cfg of ACTOR_ATTR_MAPPING.BASIC) {
                text += `${cfg.name}: ${this.getActorAttrValue(selectedActor, cfg.id)}\n`;
            }
            this.txtAttrBasic.text = text;
        }
    }

    private getActorAttrValue(actor: Module_Actor, attrId: number): number {
        if (actor.extendAttributes && actor.extendAttributes[attrId] != null) {
            return Math.floor(actor.extendAttributes[attrId]);
        }
        return 0;
    }

    private refreshActor(): void { 
        this.refreshActorEquips(); 
        this.refreshActorDataPanel(); 
        if(this.selectedActorDS && this.dissolutionBtn) this.dissolutionBtn.visible = this.selectedActorDS.dissolutionEnabled; 
    }

    private refreshActorDataPanel() { 
        if(!this.selectedActorDS) return; 
        let selectedActor=this.selectedActorDS.actor;
        if(this.actorName) this.actorName.text=selectedActor.name;
        if(this.actxzt) this.actxzt.avatarID = Game.player.variable.getVariable(2);
        let c=GameData.getModuleData(7,selectedActor.class);
        if(this.actorClass) this.actorClass.text=c?c.name:"";
        if(this.classIcon) this.classIcon.image=c?c.icon:"";
        if(selectedActor.growUpEnabled){
            if(this.LevelRoot) this.LevelRoot.visible=true;
            let n=Game.getLevelUpNeedExp(selectedActor,this.selectedActorDS.lv);
            if(this.actorExpSlider) this.actorExpSlider.value=selectedActor.currentEXP*100/n;
        }else{
            if(this.LevelRoot) this.LevelRoot.visible=false;
            if(this.actorExpSlider) this.actorExpSlider.value=100;
        }
        
        this.refreshActorAttributes();
        
        // 刷新生命条和魔法条
        this.refreshActorHP();
        this.refreshActorSP();
    }
    
    private refreshActorHP() {
        if (!this.selectedActorDS) return;
        let actor = this.selectedActorDS.actor;
        if (this.HPSlider) {
            this.HPSlider.value = actor.MaxHP > 0 ? actor.hp / actor.MaxHP : 0;
        }
        if (this.HPText) {
            this.HPText.text = actor.hp.toString() + "/" + actor.MaxHP.toString();
        }
    }
    
    private refreshActorSP() {
        if (!this.selectedActorDS) return;
        let actor = this.selectedActorDS.actor;
        if (this.SPSlider) {
            this.SPSlider.value = actor.MaxSP > 0 ? actor.sp / actor.MaxSP : 0;
        }
        if (this.SPText) {
            this.SPText.text = actor.sp.toString() + "/" + actor.MaxSP.toString();
        }
    }
    
    private onKeyDown(e: EventObject): void { 
        if(!this.stage)return; 
        if(GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.L1)) this.setSelectActorIndex(this.actorList.selectedIndex-1); 
        else if(GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.R1)) this.setSelectActorIndex(this.actorList.selectedIndex+1); 
        else if(GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.X)) if(this.dissolutionBtn?.visible) this.dissolutionBtn.event(EventObject.CLICK); 
    }

    private refreshFocus() { 
        if(this.actorEquipList) this.actorEquipList.selectedIndex=-1; 
        this.refreshActorDataPanel(); 
    }

    static dissolutionPartyActor() { 
        var ui=GameUI.get(4)as GUI_Actor; 
        if(!ui||!ui.selectedActorDS)return; 
        if(Game.player.data.party.length==1||!ui.selectedActorDS.dissolutionEnabled){GameAudio.playSE(WorldData.disalbeSE);return;} 
        GameAudio.playSE(WorldData.sureSE); 
        ProjectPlayer.removePlayerActorByInPartyIndex(ui.actorList.selectedIndex); 
        ui.refreshActorList(); 
        FocusButtonsManager.closeFocus(); 
        UIList.focus=ui.actorList; 
        ui.actorList.selectedIndex=0; 
        ui.refreshFocus(); 
    }

    private get selectedActorDS() { if(!this.actorList)return Game.player.data.party[0]; return Game.player.data.party[Math.min(Math.max(0,this.actorList.selectedIndex),Game.player.data.party.length-1)]; }
    private get selectedActorDSIndex() { if(!this.actorList)return 0; return Math.min(Math.max(0,this.actorList.selectedIndex),Game.player.data.party.length-1); }
    private setSelectActorIndex(n) { if(!this.actorList)return; this.actorList.selectedIndex=(n<0?this.actorList.length-1:(n>=this.actorList.length?0:n)); }
    
    private refreshActorList() { 
        if(!this.actorList)return; 
        let last=this.actorList.selectedIndex; 
        let arr=[]; 
        for(let i=0;i<Game.player.data.party.length;i++){ 
            let d=new ListItem_1011; 
            d.face=Game.player.data.party[i].actor.face; 
            d.data=Game.player.data.party[i]; 
            arr.push(d); 
        } 
        this.actorList.items=arr; 
        this.actorList.selectedIndex=(last==-1?0:last); 
    }

    private onCreateActorItem(ui, data, index) { 
        if(data.data && ui.deadSign){ 
            let b=ProjectPlayer.getPlayerPartyBattler(index); 
            let m=b.getModule(6)as SoModule_Battler; 
            ui.deadSign.visible=m.isDead; 
        } 
    }

    private onActorListMouseOver(e) { if(this.actorList) UIList.focus=this.actorList; }
    
    private get targetActorList() { return this.targetUI?this.targetUI.actorList:null; }
    
    private onActorItemClick() { 
        if(this.targetActorList) GUI_Actor.actorSelectedIndex=this.targetActorList.selectedIndex; 
    }

    private onEquipMouseOver() { 
        if(UIList.focus!=this.actorEquipList){ 
            UIList.focus=this.actorEquipList; 
            this.actorEquipList.selectedIndex=-1; 
        } 
    }

    private refreshEquipInfo() { }
}
