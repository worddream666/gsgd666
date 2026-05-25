// ========================================================================
// 项目：GameCreator 装备锻造与充能与化合与转移系统 (逻辑修复版)
// 修复：现在点击打造前会严格检查所有辅材的数量，缺少时提示具体物品名称
// ========================================================================

const CRAFTING_MAIN_UI_ID: number = 31;
const CRAFTING_RECIPE_MODULE_ID: number = 24;
const MATERIAL_CATEGORY_ID: number = 2; 
const EQUIP_MODULE_ID: number = 9;
const ITEM_MODULE_ID: number = 1;
const ATTR_MODULE_ID: number = 14;

// --- 属性ID配置 ---
const ATTR_IDS = {
    HP_BASE: 1, ATK_BASE: 2,
    POISON_ATK: 3, ICE_ATK: 4, FIRE_ATK: 5, ELEC_ATK: 6,
    POISON_DEF: 7, ICE_DEF: 8, FIRE_DEF: 9, ELEC_DEF: 10,
    DODGE_BASE: 11, MOVE_BASE: 12, HIT_BASE: 13, CRIT_BASE: 14, SPD_BASE: 15,
    DEF_BASE: 16,       
    HP_COMBINE: 17, DODGE_COMBINE: 18, MOVE_COMBINE: 19,
    HIT_COMBINE: 20, CRIT_COMBINE: 21, SPD_COMBINE: 22, RANGE: 23
};

// 基础属性集合（不占潜能槽）
const BASE_ATTR_SET = new Set([
    ATTR_IDS.HP_BASE, ATTR_IDS.ATK_BASE, ATTR_IDS.DEF_BASE,
    ATTR_IDS.DODGE_BASE, ATTR_IDS.MOVE_BASE, 
    ATTR_IDS.HIT_BASE, ATTR_IDS.CRIT_BASE, ATTR_IDS.SPD_BASE,
    ATTR_IDS.RANGE
]);

const PART_IDS = {
    WEAPON: 1, HELM: 2, ARMOR: 3, SHIELD: 4, BOOTS: 5, PANTS: 6, GLOVES: 7
};

// --- 声明部分 ---
declare class Lmkrt_TipsManager { static showTip(icon: string, text: string, se?: string): void; }
declare class ClientWorld { static data: { sureSE: string; cancelSE: string; failSE: string; }; }
declare class ListItem_40 { itemIcon: string; itemCountLabel: string; data: any; }
declare class DataStructure_customAttribute {
    constructor(); attribute: number; value: number; type: number; level: number;
    init(attr: number, val: number, t: number, lv: number): void;
}
declare class DataStructure_packageItem { isEquip: boolean; item: any; equip: any; number: number; }
declare class GUI_40 { 
    mouseEnabled: boolean; mouseChildren: boolean; 
    on(type: string, ctx: any, func: Function): void; 
    data: any; 
}
declare class UIList { static ITEM_CREATE: string; items: any[]; selectedIndex: number; itemRender: any; }
declare class GUI_32 extends GUI_40 {
    attrTxt: { text: string; color: string }; 
}
declare class GUI_31 {
    backpackList: { mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; visible: boolean; items: any[]; };
    backpackPageUp: { mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; disabled: boolean; };
    backpackPageDown: { mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; disabled: boolean; };
    backpackPageLabel: { text: string };
    mainTabBox: { selectedIndex: number; on(type: string, ctx: any, func: Function): void; };
    equipmentSubTabBox: { selectedIndex: number; on(type: string, ctx: any, func: Function): void; visible: boolean; };
    
    // 面板
    craftingPanel: { visible: boolean }; 
    rechargePanel: { visible: boolean };
    combinePanel: { visible: boolean };
    transferPanel: { visible: boolean };

    // 打造组件
    craftButton: { mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; disabled: boolean; };
    mainMaterialSlot: { image: string; avatarID: number|string; alpha: number; visible: boolean; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; };
    mainMaterialCountLabel: { text: string; visible: boolean; color: string; };
    productSlot: { image: string; visible: boolean; mouseEnabled: boolean; }; // 选中成品显示
    craftSuccessLabel: { text: string; visible: boolean; alpha: number; scaleX: number; scaleY: number; }; // 打造成功文字
    productSlot1: { image: string; visible: boolean; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; }; // 多成品选项1
    productSlot2: { image: string; visible: boolean; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; }; // 多成品选项2
    productSlot3: { image: string; visible: boolean; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; }; // 多成品选项3
    productSlot4: { image: string; visible: boolean; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; }; // 多成品选项4
    productSlot5: { image: string; visible: boolean; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; }; // 多成品选项5
    auxMaterialSlot1: any; auxMaterialSlot2: any; auxMaterialSlot3: any; auxMaterialSlot4: any;
    auxMaterialCountLabel1: any; auxMaterialCountLabel2: any; auxMaterialCountLabel3: any; auxMaterialCountLabel4: any;
    goldCostLabel: { text: string };
    selectedProductIndex: number; // 当前选中的成品索引

    // 充能组件
    rechargeSlot: { image: string; avatarID: number|string; alpha: number; visible: boolean; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; };
    rechargeBtn: { mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; disabled: boolean; };
    rechargeNameLabel: { text: string };
    rechargePotencyLabel: { text: string; color: string };
    rechargeCostLabel: { text: string };
    rechargeAttrLabel1: { text: string; visible: boolean; color: string };
    rechargeAttrLabel2: { text: string; visible: boolean; color: string };
    rechargeAttrLabel3: { text: string; visible: boolean; color: string };
    rechargeAttrLabel4: { text: string; visible: boolean; color: string };
    rechargeAttrLabel5: { text: string; visible: boolean; color: string };
    rechargeSuccessLabel: any;

    // 化合组件
    combineMainSlot: { image: string; avatarID: number|string; alpha: number; visible: boolean; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; };
    combineSubSlot: { image: string; avatarID: number|string; alpha: number; visible: boolean; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; };
    combineMainName: { text: string };
    combineSubName: { text: string };
    combineBtn: { mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; disabled: boolean; };
    combineTipLabel: { text: string; color: string };
    combineAttrLabel1: { text: string; visible: boolean; color: string; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; };
    combineAttrLabel2: { text: string; visible: boolean; color: string; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; };
    combineAttrLabel3: { text: string; visible: boolean; color: string; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; };
    combineAttrLabel4: { text: string; visible: boolean; color: string; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; };
    combineAttrLabel5: { text: string; visible: boolean; color: string; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; };
    combineSuccessLabel: any;

    // 转移组件
    transferMainSlot: { image: string; visible: boolean; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; };
    transferSubSlot: { image: string; visible: boolean; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; };
    transferMainName: { text: string };
    transferSubName: { text: string };
    transferBtn: { mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; disabled: boolean; };
    transferCostLabel: { text: string };
    // 转移-主装备属性列表
    transferMainAttrLabel1: { text: string; visible: boolean; color: string; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; };
    transferMainAttrLabel2: { text: string; visible: boolean; color: string; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; };
    transferMainAttrLabel3: { text: string; visible: boolean; color: string; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; };
    transferMainAttrLabel4: { text: string; visible: boolean; color: string; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; };
    transferMainAttrLabel5: { text: string; visible: boolean; color: string; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; };
    // 转移-副装备属性列表
    transferSubAttrLabel1: { text: string; visible: boolean; color: string; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; };
    transferSubAttrLabel2: { text: string; visible: boolean; color: string; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; };
    transferSubAttrLabel3: { text: string; visible: boolean; color: string; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; };
    transferSubAttrLabel4: { text: string; visible: boolean; color: string; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; };
    transferSubAttrLabel5: { text: string; visible: boolean; color: string; mouseEnabled: boolean; on(type: string, ctx: any, func: Function): void; };

    width: number; height: number; addChild(child: any): void;
}
declare class Module_Equip {
    id: number; name: string; icon: string; intro: string; sell: number; partID: number; type: number;
    maxHP: number; maxSP: number; atk: number; def: number; mag: number; magDef: number;
    hit: number; moveSpeed: number; crit: number; atkSpeed: number; dod: number;
    customAttributes: any[]; isCustomAttribute: boolean;
    [key: string]: any; 
    setCustomAttribute(attrs: any[]): void;
}
declare class Module_Item { icon: string; id: number; category: number; name: string; }
declare class ProjectPlayer {
    static changeItemNumber(itemID: number, v: number, isEquip?: boolean, happenEvent?: boolean): boolean;
    static addEquipByInstance(equip: Module_Equip, happenEvent?: boolean, inPackageIndex?: number): boolean;
    static increaseGold(v: number): void;
    static removeItemByInstance(itemDS: DataStructure_packageItem, v: number, happenEvent?: boolean): void;
    static EVENT_CHANGE_ITEM_NUMBER: string;
}
declare class GameData {
    static getModuleData(moduleID: number, id: number): any;
    static newModuleData(moduleID: number, id: number): Module_Equip | Module_Item;
    static getLength(moduleID: number): number;
}
declare class Game { static player: { data: { package: any[]; gold: number; }; }; static layer: { uiLayer: { addChild(child: any): void; }; }; }
declare class EventUtils { static happen(target: any, event: string): void; }
declare class UIString { text: string; color: string; size: number; x: number; y: number; width: number; height: number; stroke: number; strokeColor: string; pivotX: number; pivotY: number; scaleX: number; scaleY: number; alpha: number; bold: boolean; align: number; wordWrap: boolean; textHeight: number; dispose(): void; }
declare class Point { x: number; y: number; constructor(x?: number, y?: number); }
declare class GameUI { static showTip(msg: string): void; }
declare class GUI_Manager { static standardList(list: any, flag: boolean): void; static itemDesc(item: Module_Item): string; }
interface CraftingRecipe {
    id: number;
    productItemId: number[];  // 改为数组，支持多个成品
    isProductEquip: boolean;
    mainMaterialId: number;
    auxMaterials: number[];
    auxCounts: number[];
    goldCost: number;
}
declare const EventObject: { CLICK: string; CHANGE: string; UNDISPLAY: string; DISPLAY: string; MOUSE_OVER: string; MOUSE_OUT: string; ITEM_CREATE: string; };
declare const Lmkrt_GUI_CommonInfo: { isAvailable(): boolean; getInstance(): any; };

// ========================================================================
// 主系统类
// ========================================================================

class ListItemRenderer extends GUI_40 {
    constructor() { super(); }
    public set data(value: any) { this["_data"] = value; }
    public get data(): any { return this["_data"]; }
}

class CraftingMainUI extends GUI_31 {
    private readonly MODE_CRAFT = 0;    
    private readonly MODE_RECHARGE = 1; 
    private readonly MODE_COMBINE = 2; 
    private readonly MODE_TRANSFER = 3; 
    
    private currentMode = 0;
    private readonly PAGE_SIZE = 15; // 每页显示15个格子
    private currentPage = 0; // 当前页码
    private totalPages = 1; // 总页数
    private allBackpackItems: any[] = []; // 所有背包物品
    
    // 打造相关
    private currentRecipe: CraftingRecipe | null = null;
    private readonly AUX_COUNTS_DEFAULT = [1, 1, 1, 1];
    private selectedProductIndex: number = 0; // 当前选中的成品索引
    
    // 充能相关
    private selectedRechargeEquip: Module_Equip | null = null; 
    private selectedRechargeIndex: number = -1;
    
    // 化合相关
    private selectedCombineMain: Module_Equip | null = null;
    private selectedCombineMainIndex: number = -1;
    private selectedCombineSub: Module_Equip | null = null;
    private selectedCombineSubIndex: number = -1;
    private selectedCombineAttrIndex: number = -1;

    // 转移相关
    private selectedTransferMain: Module_Equip | null = null;
    private selectedTransferMainIndex: number = -1;
    private selectedTransferSub: Module_Equip | null = null;
    private selectedTransferSubIndex: number = -1;
    private selectedTransferMainAttrIdx: number = -1; 
    private selectedTransferSubAttrIdx: number = -1;  

    constructor() {
        super();
        this.initUI();
    }

    private initUI(): void {
        if (this.backpackList) {
            try { GUI_Manager.standardList(this.backpackList, false); } catch (e) { }
            this.backpackList.mouseEnabled = true;
            this.backpackList.on(UIList.ITEM_CREATE, this, this.onBackpackItemCreate);
        }
        
        // 翻页按钮绑定
        if (this.backpackPageUp) this.backpackPageUp.on(EventObject.CLICK, this, this.onBackpackPageUp);
        if (this.backpackPageDown) this.backpackPageDown.on(EventObject.CLICK, this, this.onBackpackPageDown);

        // 打造绑定
        if (this.craftButton) this.craftButton.on(EventObject.CLICK, this, this.doCraft);
        if (this.mainMaterialSlot) this.mainMaterialSlot.on(EventObject.CLICK, this, this.resetCraftUI);
        // 多成品槽位绑定
        const productSlots = this.getProductSlots();
        for (let i = 0; i < productSlots.length; i++) {
            const slot = productSlots[i];
            if (slot) slot.on(EventObject.CLICK, this, () => this.onProductSlotClick(i));
        }

        // 充能绑定
        if (this.rechargeBtn) this.rechargeBtn.on(EventObject.CLICK, this, this.doRecharge);
        if (this.rechargeSlot) this.rechargeSlot.on(EventObject.CLICK, this, () => this.setRechargeTarget(null, -1));

        // 化合绑定
        if (this.combineBtn) this.combineBtn.on(EventObject.CLICK, this, this.doCombine);
        if (this.combineMainSlot) this.combineMainSlot.on(EventObject.CLICK, this, () => this.setCombineMain(null, -1));
        if (this.combineSubSlot) this.combineSubSlot.on(EventObject.CLICK, this, () => this.setCombineSub(null, -1));
        
        const combineLabels = this.getCombineAttrLabels();
        for (let i = 0; i < combineLabels.length; i++) {
            const lbl = combineLabels[i];
            if (lbl) {
                lbl.mouseEnabled = true;
                lbl.on(EventObject.CLICK, this, () => this.onCombineAttrClick(i));
            }
        }

        // 转移绑定
        if (this.transferBtn) this.transferBtn.on(EventObject.CLICK, this, this.doTransfer);
        if (this.transferMainSlot) this.transferMainSlot.on(EventObject.CLICK, this, () => this.setTransferMain(null, -1));
        if (this.transferSubSlot) this.transferSubSlot.on(EventObject.CLICK, this, () => this.setTransferSub(null, -1));

        const transMainLabels = this.getTransferMainLabels();
        for (let i = 0; i < transMainLabels.length; i++) {
            const lbl = transMainLabels[i];
            if(lbl) { lbl.mouseEnabled=true; lbl.on(EventObject.CLICK, this, () => this.onTransferMainAttrClick(i)); }
        }
        const transSubLabels = this.getTransferSubLabels();
        for (let i = 0; i < transSubLabels.length; i++) {
            const lbl = transSubLabels[i];
            if(lbl) { lbl.mouseEnabled=true; lbl.on(EventObject.CLICK, this, () => this.onTransferSubAttrClick(i)); }
        }

        if (this.equipmentSubTabBox) {
            this.equipmentSubTabBox.visible = true; 
            this.equipmentSubTabBox.on(EventObject.CHANGE, this, this.onTabChange);
        }
        if (this.mainTabBox) this.mainTabBox.selectedIndex = 0;

        this.bindSlotTips();
        this.on(EventObject.UNDISPLAY, this, this.onUndisplay);
        
        this.on(EventObject.DISPLAY, this, () => {
            setTimeout(() => {
                if (this.equipmentSubTabBox && this.equipmentSubTabBox.selectedIndex === -1) {
                    this.equipmentSubTabBox.selectedIndex = 0;
                }
                this.onTabChange();
            }, 50);
        });
    }

    // ==================================================================
    // 界面切换逻辑
    // ==================================================================

    private onTabChange(): void {
        this.hideTooltip(); 
        if (!this.equipmentSubTabBox) return;
        this.currentMode = this.equipmentSubTabBox.selectedIndex;
        
        if (this.craftingPanel) this.craftingPanel.visible = (this.currentMode === this.MODE_CRAFT);
        if (this.rechargePanel) this.rechargePanel.visible = (this.currentMode === this.MODE_RECHARGE);
        if (this.combinePanel) this.combinePanel.visible = (this.currentMode === this.MODE_COMBINE);
        if (this.transferPanel) this.transferPanel.visible = (this.currentMode === this.MODE_TRANSFER);

        if (this.currentMode === this.MODE_CRAFT) this.resetCraftUI();
        else if (this.currentMode === this.MODE_RECHARGE) this.setRechargeTarget(null, -1);
        else if (this.currentMode === this.MODE_COMBINE) this.resetCombineUI();
        else if (this.currentMode === this.MODE_TRANSFER) this.resetTransferUI();
        
        this.refreshBackpackList();
    }

    public refreshBackpackList(): void {
        this.hideTooltip(); 
        if (!this.backpackList) return;
        this.backpackList.visible = true;
        
        const arr: any[] = [];
        const rawPackage = Game.player.data.package;
        
        for (let i = 0; i < rawPackage.length; i++) {
            const itemDS = rawPackage[i] as DataStructure_packageItem;
            if (!itemDS) continue;

            if (this.currentMode === this.MODE_CRAFT) {
                if (!itemDS.isEquip && itemDS.item && itemDS.item.category === MATERIAL_CATEGORY_ID) {
                    const d = new ListItem_40();
                    d.itemIcon = itemDS.item.icon;
                    d.itemCountLabel = "x" + itemDS.number;
                    d.data = { ...itemDS, pkgIndex: i }; 
                    arr.push(d);
                }
            }
            else {
                if (itemDS.isEquip && itemDS.equip) {
                    const equip = itemDS.equip as Module_Equip;
                    
                    if (this.currentMode === this.MODE_COMBINE) {
                        if (equip === this.selectedCombineMain || equip === this.selectedCombineSub) continue;
                    }
                    if (this.currentMode === this.MODE_TRANSFER) {
                        if (equip === this.selectedTransferMain || equip === this.selectedTransferSub) continue;
                    }

                    const d = new ListItem_40();
                    d.itemIcon = itemDS.equip.icon;
                    const max = equip["maxPotency"] || 0;
                    if (max > 0) {
                        const curr = equip.customAttributes ? equip.customAttributes.filter(ca => !BASE_ATTR_SET.has(ca.attribute)).length : 0;
                        d.itemCountLabel = `${curr}/${max}`; 
                    } else {
                        d.itemCountLabel = ""; 
                    }
                    d.data = { ...itemDS, pkgIndex: i }; 
                    arr.push(d);
                }
            }
        }
        
        // 保存所有物品
        this.allBackpackItems = arr;
        
        // 计算总页数
        this.totalPages = Math.ceil(this.allBackpackItems.length / this.PAGE_SIZE);
        if (this.totalPages < 1) this.totalPages = 1;
        if (this.currentPage >= this.totalPages) this.currentPage = 0;
        
        // 获取当前页的物品
        const startIndex = this.currentPage * this.PAGE_SIZE;
        const endIndex = startIndex + this.PAGE_SIZE;
        const currentPageItems = this.allBackpackItems.slice(startIndex, endIndex);
        
        // 固定显示20个格子，不足的用空物品填充
        while (currentPageItems.length < this.PAGE_SIZE) {
            const emptyItem = new ListItem_40();
            emptyItem.itemIcon = "";
            emptyItem.itemCountLabel = "";
            emptyItem.data = null;
            currentPageItems.push(emptyItem);
        }
        
        this.backpackList.items = currentPageItems;
        
        // 更新翻页按钮状态和页码显示
        this.updatePageUI();
    }
    
    // 更新翻页UI
    private updatePageUI(): void {
        if (this.backpackPageUp) {
            this.backpackPageUp.disabled = (this.currentPage <= 0);
        }
        if (this.backpackPageDown) {
            this.backpackPageDown.disabled = (this.currentPage >= this.totalPages - 1);
        }
        if (this.backpackPageLabel) {
            this.backpackPageLabel.text = `${this.currentPage + 1}/${this.totalPages}`;
        }
    }
    
    // 上一页
    private onBackpackPageUp(): void {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.refreshBackpackList();
        }
    }
    
    // 下一页
    private onBackpackPageDown(): void {
        if (this.currentPage < this.totalPages - 1) {
            this.currentPage++;
            this.refreshBackpackList();
        }
    }

    private onBackpackItemCreate(ui: GUI_40, data: ListItem_40, index: number): void {
        const itemData = data.data; 
        
        // 如果是空物品（填充的格子），禁用鼠标事件
        if (!itemData) {
            ui.mouseEnabled = false;
            ui.mouseChildren = false;
            return;
        }
        
        ui.mouseEnabled = true; 
        ui.mouseChildren = true;
        
        ui.on(EventObject.CLICK, this, () => {
            this.hideTooltip(); 
            if (this.currentMode === this.MODE_CRAFT) {
                if (itemData.item) this.onMainMaterialChange(itemData.item.id);
            } 
            else if (this.currentMode === this.MODE_RECHARGE) {
                if (itemData.isEquip) this.setRechargeTarget(itemData.equip, itemData.pkgIndex);
            }
            else if (this.currentMode === this.MODE_COMBINE) {
                if (itemData.isEquip) this.handleCombineItemClick(itemData.equip, itemData.pkgIndex);
            }
            else if (this.currentMode === this.MODE_TRANSFER) {
                if (itemData.isEquip) this.handleTransferItemClick(itemData.equip, itemData.pkgIndex);
            }
        });

        ui.on(EventObject.MOUSE_OVER, this, () => {
            if (Lmkrt_GUI_CommonInfo.isAvailable()) {
                const infoUI = Lmkrt_GUI_CommonInfo.getInstance();
                if (!infoUI.parent) Game.layer.uiLayer.addChild(infoUI);
                infoUI.visible = true;
                if (itemData.isEquip) infoUI.showEquipInfo(itemData.equip);
                else infoUI.showItemInfo(itemData.item);
                
                const pos = ui.localToGlobal(new Point(0, 0));
                infoUI.setPosition(pos.x + 60, pos.y);
            }
        });
        ui.on(EventObject.MOUSE_OUT, this, this.onUndisplay);
    }

    // ==================================================================
    // 功能 1: 打造 (Craft)
    // ==================================================================

    private calculateEquipPotential(equip: Module_Equip): { count: number, max: number } {
        if (!equip) return { count: 0, max: 0 };
        const partID = equip.partID;
        let maxPotency = 1;
        const rand = Math.random() * 100;

        if (partID === PART_IDS.WEAPON || partID === PART_IDS.SHIELD) {
            if (rand < 10) maxPotency = 4;
            else if (rand < 30) maxPotency = 3;
            else if (rand < 60) maxPotency = 2;
        }
        else if (partID === PART_IDS.HELM || partID === PART_IDS.ARMOR || partID === PART_IDS.PANTS) {
            if (rand < 10) maxPotency = 5;
            else if (rand < 30) maxPotency = 3;
            else if (rand < 60) maxPotency = 2;
        }
        else if (partID === PART_IDS.GLOVES) {
            if (rand < 10) maxPotency = 2;
        }

        equip["maxPotency"] = maxPotency;
        if (!equip.customAttributes) equip.customAttributes = [];
        equip.customAttributes = equip.customAttributes.filter(ca => BASE_ATTR_SET.has(ca.attribute));
        equip.isCustomAttribute = equip.customAttributes.length > 0;
        return { count: 0, max: maxPotency };
    }

    // 【核心修复】打造方法
    private doCraft(): void {
        if (!this.currentRecipe) { this.safeTip("请先选择配方"); return; }
        const r = this.currentRecipe;

        // 1. 检查金币
        if (Game.player.data.gold < r.goldCost) { this.safeTip("金币不足"); return; }

        // 2. 检查主材料
        if (this.countItemInBag(r.mainMaterialId) < 1) { this.safeTip("主材料不足"); return; }

        // 3. 【新增】检查辅材料数量
        for (let i = 0; i < 4; i++) {
            // 获取辅材ID，如果配置了就检查
            const auxId = (r.auxMaterials && r.auxMaterials[i]) ? r.auxMaterials[i] : 0;
            if (auxId) {
                // 获取需求数量（默认1）
                const needCount = (r.auxCounts && r.auxCounts[i]) ? r.auxCounts[i] : 1;
                // 获取拥有的数量
                const hasCount = this.countItemInBag(auxId);
                
                // 数量不足则阻断
                if (hasCount < needCount) {
                    const itemData = GameData.getModuleData(ITEM_MODULE_ID, auxId);
                    const itemName = itemData ? itemData.name : "未知材料";
                    this.safeTip(`缺少材料：${itemName}`);
                    return; // 直接返回，不扣除物品
                }
            }
        }

        // 4. 所有检查通过，开始扣除
        ProjectPlayer.increaseGold(-r.goldCost);
        ProjectPlayer.changeItemNumber(r.mainMaterialId, -1);

        for(let i=0; i<4; i++) {
            if(r.auxMaterials && r.auxMaterials[i]) {
                const count = (r.auxCounts && r.auxCounts[i]) ? r.auxCounts[i] : 1;
                ProjectPlayer.changeItemNumber(r.auxMaterials[i], -count);
            }
        }

        let successName = "", successIcon = "", potentialInfo = {count:0, max:0};
        
        // 获取选中的成品ID（支持数组和单个值）
        const productIds = r.productItemId;
        const isArray = Array.isArray(productIds);
        const targetProductId = isArray ? (productIds[this.selectedProductIndex] || productIds[0]) : productIds;
        
        if (r.isProductEquip) {
            const newEquip = GameData.newModuleData(EQUIP_MODULE_ID, targetProductId) as Module_Equip;
            if (newEquip) {
                potentialInfo = this.calculateEquipPotential(newEquip);
                if (ProjectPlayer.addEquipByInstance(newEquip, true)) {
                    successName = newEquip.name;
                    successIcon = newEquip.icon;
                }
            }
        } else {
            ProjectPlayer.changeItemNumber(targetProductId, 1);
            const item = GameData.getModuleData(ITEM_MODULE_ID, targetProductId);
            if (item) {
                successName = item.name;
                successIcon = item.icon;
            }
        }

        // 5. 播放打造动画
        this.playCraftAnimation(() => {
            this.resetCraftUI();
            this.refreshBackpackList();
            
            if (successName) {
                let tip = `打造成功！\n获得 ${successName}`;
                if (r.isProductEquip) tip = `打造成功！\n属性潜能(0/${potentialInfo.max})`;
                if (typeof Lmkrt_TipsManager !== "undefined") Lmkrt_TipsManager.showTip(successIcon, tip, ClientWorld.data.sureSE);
                else this.safeTip(tip.replace(/\n/g, " "));
            }
        });
    }

    // 播放打造动画
    private playCraftAnimation(onComplete: Function): void {
        console.log("=== 播放打造动画 ===");
        
        // 禁用按钮防止重复点击
        if (this.craftButton) this.craftButton.disabled = true;

        // 1. 材料发光闪烁效果
        this.flashMaterialSlots(() => {
            console.log("材料闪烁完成，开始显示成功文字");
            // 2. 显示成功文字动画
            this.showSuccessAnimation(onComplete);
        });
    }

    // 材料槽位发光闪烁
    private flashMaterialSlots(onComplete: Function): void {
        console.log("=== 开始材料闪烁 ===");
        const mainSlot = this.mainMaterialSlot;
        const auxSlots = this.getAuxSlots();
        const allSlots = [mainSlot, ...auxSlots];
        console.log("材料槽位数量:", allSlots.length);
        
        // 外发光材质ID为4
        const glowMaterialID = 4;
        
        // 为所有可见槽位添加外发光材质
        for (const slot of allSlots) {
            if (slot && slot.visible) {
                slot.addMaterialByID(glowMaterialID);
                slot.setMaterialValueFast({
                    mu4_color: [1, 0.85, 0],  // 金色 RGB 0~1
                    mu4_blur: 6
                });
            }
        }
        
        // 快速闪烁效果
        let flashCount = 0;
        const maxFlashes = 4;
        const flashInterval = 120;
        
        const flash = () => {
            flashCount++;
            const isBright = flashCount % 2 === 1;
            
            for (const slot of allSlots) {
                if (slot && slot.visible) {
                    slot.setMaterialValueFast({
                        mu4_blur: isBright ? 12 : 3,
                        mu4_color: isBright ? [1, 0.95, 0.3] : [0.7, 0.6, 0]
                    });
                }
            }
            
            if (flashCount < maxFlashes * 2) {
                setTimeout(flash, flashInterval);
            } else {
                // 移除所有材质
                setTimeout(() => {
                    console.log("=== 移除所有外发光材质 ===");
                    for (const slot of allSlots) {
                        if (slot) {
                            slot.removeMaterialByID(glowMaterialID);
                        }
                    }
                    console.log("=== 材料闪烁完成 ===");
                    onComplete();
                }, 100);
            }
        };
        
        flash();
    }

    // 显示成功动画
    private showSuccessAnimation(onComplete: Function): void {
        console.log("=== showSuccessAnimation 开始 ===");
        console.log("this:", this);
        console.log("craftSuccessLabel:", this.craftSuccessLabel);
        console.log("craftSuccessLabel visible:", this.craftSuccessLabel ? this.craftSuccessLabel.visible : "N/A");
        console.log("craftSuccessLabel alpha:", this.craftSuccessLabel ? this.craftSuccessLabel.alpha : "N/A");
        
        if (!this.craftSuccessLabel) {
            console.log("craftSuccessLabel 不存在，直接完成");
            onComplete();
            return;
        }

        // 初始化状态
        console.log("设置 craftSuccessLabel 为可见");
        this.craftSuccessLabel.visible = true;
        this.craftSuccessLabel.alpha = 1;
        this.craftSuccessLabel.scaleX = 0.3;
        this.craftSuccessLabel.scaleY = 0.3;
        console.log("设置后的 craftSuccessLabel:", this.craftSuccessLabel);

        // 弹性缩放动画
        let scale = 0.3;
        const targetScale = 1;
        const scaleStep = 0.18;
        const scaleInterval = 40;
        let bounceCount = 0;
        const maxBounce = 1;

        const scaleUp = () => {
            scale += scaleStep;
            
            // 弹性回弹效果
            if (scale > targetScale && bounceCount < maxBounce) {
                scale = targetScale - (scale - targetScale) * 0.5;
                bounceCount++;
            }
            
            this.craftSuccessLabel.scaleX = scale;
            this.craftSuccessLabel.scaleY = scale;
            
            if (Math.abs(scale - targetScale) > 0.05 || bounceCount < maxBounce) {
                setTimeout(scaleUp, scaleInterval);
            } else {
                this.craftSuccessLabel.scaleX = targetScale;
                this.craftSuccessLabel.scaleY = targetScale;
                
                // 延迟后隐藏
                setTimeout(() => {
                    // 淡出效果
                    let alpha = 1;
                    const fadeStep = 0.08;
                    const fadeInterval = 40;
                    
                    const fadeOut = () => {
                        alpha -= fadeStep;
                        if (alpha > 0) {
                            this.craftSuccessLabel.alpha = alpha;
                            // 淡出时略微缩小
                            this.craftSuccessLabel.scaleX = targetScale * (0.8 + alpha * 0.2);
                            this.craftSuccessLabel.scaleY = targetScale * (0.8 + alpha * 0.2);
                            setTimeout(fadeOut, fadeInterval);
                        } else {
                            this.craftSuccessLabel.visible = false;
                            this.craftSuccessLabel.alpha = 1;
                            if (this.craftButton) this.craftButton.disabled = false;
                            onComplete();
                        }
                    };
                    
                    fadeOut();
                }, 1500);
            }
        };

        scaleUp();
    }

    public resetCraftUI(): void {
        this.currentRecipe = null;
        this.selectedProductIndex = 0; // 重置选中索引
        if(this.mainMaterialSlot) { this.mainMaterialSlot.image = ""; this.mainMaterialSlot.visible = false; }
        
        // 重置多成品槽位
        const productSlots = this.getProductSlots();
        for (let i = 0; i < productSlots.length; i++) {
            const slot = productSlots[i];
            if (slot) { slot.image = ""; slot.visible = false; slot.alpha = 1; }
        }
        
        // 重置选中成品显示槽位（打造成功后清空）
        if (this.productSlot) { this.productSlot.image = ""; this.productSlot.visible = false; }
        
        if(this.mainMaterialCountLabel) this.mainMaterialCountLabel.text = "";
        
        const slots = this.getAuxSlots();
        const labels = this.getAuxLabels();
        for(let i=0; i<4; i++) { 
            if(slots[i]) { slots[i].image = ""; slots[i].visible = false; }
            if(labels[i]) labels[i].text = "";
        }
        if(this.goldCostLabel) this.goldCostLabel.text = "需要金币：-";
        if(this.craftButton) this.craftButton.disabled = false;
    }

    private onMainMaterialChange(materialItemID: number): void {
        const len = GameData.getLength(CRAFTING_RECIPE_MODULE_ID);
        let found: CraftingRecipe | null = null;
        
        for (let i = 1; i <= len; i++) {
            const data = GameData.getModuleData(CRAFTING_RECIPE_MODULE_ID, i);
            if (data && data.mainMaterialId === materialItemID) {
                found = data as CraftingRecipe;
                break;
            }
        }
        if (found) {
            this.currentRecipe = found;
            this.updateCraftUI();
        } else {
            this.safeTip("该材料没有对应的打造配方");
        }
    }

    private updateCraftUI(): void {
        if (!this.currentRecipe) return;
        const r = this.currentRecipe;
        if (this.mainMaterialSlot) {
            const matItem = GameData.getModuleData(ITEM_MODULE_ID, r.mainMaterialId);
            this.mainMaterialSlot.image = matItem ? matItem.icon : "";
            this.mainMaterialSlot.visible = true;
        }
        
        const myCount = this.countItemInBag(r.mainMaterialId);
        if (this.mainMaterialCountLabel) {
            this.mainMaterialCountLabel.text = `${myCount}/1`;
            this.mainMaterialCountLabel.color = myCount >= 1 ? "#00FF00" : "#FF0000";
            this.mainMaterialCountLabel.visible = true;
        }

        // 显示多个成品槽位
        const moduleID = r.isProductEquip ? EQUIP_MODULE_ID : ITEM_MODULE_ID;
        const productIds = Array.isArray(r.productItemId) ? r.productItemId : [r.productItemId];
        const productSlots = this.getProductSlots();
        
        for (let i = 0; i < productSlots.length; i++) {
            const slot = productSlots[i];
            if (!slot) continue;
            
            if (i < productIds.length) {
                const product = GameData.getModuleData(moduleID, productIds[i]);
                // 正确获取图标路径：通过 attrs.icon.value
                let iconPath = "";
                if (product) {
                    if (product.icon) {
                        iconPath = product.icon;
                    } else if (product.attrs && product.attrs.icon) {
                        iconPath = product.attrs.icon.value || "";
                    }
                }
                slot.image = iconPath;
                slot.visible = true;
                slot.mouseEnabled = true;
                slot.alpha = (i === this.selectedProductIndex) ? 1 : 0.5;
            } else {
                slot.image = "";
                slot.visible = false;
            }
        }

        const slots = this.getAuxSlots();
        const labels = this.getAuxLabels();
        
        for (let i = 0; i < 4; i++) {
            const slot = slots[i];
            const label = labels[i];
            
            if (r.auxMaterials && r.auxMaterials[i]) {
                const mId = r.auxMaterials[i];
                const need = (r.auxCounts && r.auxCounts[i]) ? r.auxCounts[i] : 1;
                const has = this.countItemInBag(mId);
                const item = GameData.getModuleData(ITEM_MODULE_ID, mId);
                
                if (slot) {
                    slot.image = item ? item.icon : "";
                    slot.visible = true;
                }
                if (label) {
                    label.text = `${has}/${need}`;
                    label.color = has >= need ? "#00FF00" : "#FF0000";
                    label.visible = true;
                }
            } else {
                if (slot) slot.visible = false;
                if (label) label.text = "";
            }
        }
        if (this.goldCostLabel) this.goldCostLabel.text = `需要金币：${r.goldCost}`;
    }

    // ==================================================================
    // 功能 2: 充能 (Recharge)
    // ==================================================================

    private getRechargeAttrLabels(): any[] {
        return [this.rechargeAttrLabel1, this.rechargeAttrLabel2, this.rechargeAttrLabel3, this.rechargeAttrLabel4, this.rechargeAttrLabel5];
    }

    private setRechargeTarget(equip: Module_Equip | null, index: number): void {
        this.selectedRechargeEquip = equip;
        this.selectedRechargeIndex = index;
        const labels = this.getRechargeAttrLabels();
        if (!this.rechargeSlot) return;
        
        if (equip) {
            this.rechargeSlot.image = equip.icon;
            this.rechargeSlot.visible = true;
            if (this.rechargeNameLabel) this.rechargeNameLabel.text = equip.name;

            const max = equip["maxPotency"] || 0;
            const currentAttrs = equip.customAttributes || [];
            const rechargeAttrs = currentAttrs.filter(ca => !BASE_ATTR_SET.has(ca.attribute));
            const currentCount = rechargeAttrs.length;
            
            if (this.rechargePotencyLabel) {
                const color = (max > 0 && currentCount >= max) ? "#FF0000" : "#00FF00";
                this.rechargePotencyLabel.text = `潜能: ${currentCount}/${max}`;
                this.rechargePotencyLabel.color = color;
            }
            if (this.rechargeCostLabel) this.rechargeCostLabel.text = `消耗: 1000`;

            for (let i = 0; i < 5; i++) {
                const label = labels[i];
                if (!label) continue;
                if (i < currentCount) {
                    const ca = rechargeAttrs[i];
                    const attrData = GameData.getModuleData(ATTR_MODULE_ID, ca.attribute);
                    if (attrData) {
                        const percentVal = ca.value; 
                        let color = "#FFFFFF";
                        if (percentVal >= 80) color = "#FFFF00";      
                        else if (percentVal >= 60) color = "#00BFFF"; 
                        else if (percentVal >= 40) color = "#00FF00"; 
                        
                        label.text = `${attrData.name} +${percentVal.toFixed(2)}%`;
                        label.color = color;
                        label.visible = true;
                    } else {
                        label.text = `ID:${ca.attribute}`;
                        label.visible = true;
                    }
                } else {
                    label.visible = false;
                }
            }
        } else {
            this.rechargeSlot.image = "";
            this.rechargeSlot.visible = false;
            if (this.rechargeNameLabel) this.rechargeNameLabel.text = "请选择装备";
            if (this.rechargePotencyLabel) this.rechargePotencyLabel.text = "";
            if (this.rechargeCostLabel) this.rechargeCostLabel.text = "";
            for (const label of labels) if (label) label.visible = false;
        }
    }

    private calcRechargeValue(equip: Module_Equip, attrID: number): number {
        const val = 10 + (Math.random() * 10);
        return Number(val.toFixed(2));
    }

    private doRecharge(): void {
        const equip = this.selectedRechargeEquip;
        if (!equip) { this.safeTip("请先放入装备"); return; }
        
        const max = equip["maxPotency"] || 0;
        const currentAttrs = equip.customAttributes || [];
        const usedSlots = currentAttrs.filter(ca => !BASE_ATTR_SET.has(ca.attribute)).length;
        const existingAttrIds = new Set(currentAttrs.map(ca => ca.attribute));

        if (usedSlots >= max) { this.safeTip("该装备潜能已耗尽！"); return; }

        const partID = equip.partID;
        let candidates: any[] = [];
        let costSlots = 1;

        if (partID === PART_IDS.SHIELD) {
            costSlots = 2; 
            const elementTypes = [
                { name: "毒系", atk: ATTR_IDS.POISON_ATK, def: ATTR_IDS.POISON_DEF },
                { name: "冰系", atk: ATTR_IDS.ICE_ATK, def: ATTR_IDS.ICE_DEF },
                { name: "火系", atk: ATTR_IDS.FIRE_ATK, def: ATTR_IDS.FIRE_DEF },
                { name: "电系", atk: ATTR_IDS.ELEC_ATK, def: ATTR_IDS.ELEC_DEF }
            ];
            candidates = elementTypes.filter(e => !existingAttrIds.has(e.atk) && !existingAttrIds.has(e.def));
        } 
        else if (partID === PART_IDS.WEAPON) candidates = [ATTR_IDS.POISON_DEF, ATTR_IDS.ICE_DEF, ATTR_IDS.FIRE_DEF, ATTR_IDS.ELEC_DEF].filter(id => !existingAttrIds.has(id));
        else if (partID === PART_IDS.HELM || partID === PART_IDS.ARMOR || partID === PART_IDS.PANTS) candidates = [ATTR_IDS.POISON_DEF, ATTR_IDS.ICE_DEF, ATTR_IDS.FIRE_DEF, ATTR_IDS.ELEC_DEF, ATTR_IDS.HP_COMBINE].filter(id => !existingAttrIds.has(id));
        else if (partID === PART_IDS.GLOVES) candidates = [ATTR_IDS.CRIT_COMBINE, ATTR_IDS.SPD_COMBINE].filter(id => !existingAttrIds.has(id));
        else if (partID === PART_IDS.BOOTS) candidates = [ATTR_IDS.DODGE_COMBINE].filter(id => !existingAttrIds.has(id));

        if (candidates.length === 0) { this.safeTip("已获得所有可充能属性！"); return; }
        if (usedSlots + costSlots > max) { this.safeTip("剩余潜能空间不足！"); return; }

        const cost = 1000;
        if (Game.player.data.gold < cost) { this.safeTip("金币不足"); return; }
        ProjectPlayer.increaseGold(-cost);

        let changeSummary = "";
        const createAttrObj = (id: number) => {
            const val = this.calcRechargeValue(equip, id);
            let newAttr: any;
            try {
                newAttr = new DataStructure_customAttribute();
                newAttr.attribute = id; newAttr.value = val; newAttr.type = 0;
                if (newAttr.init) newAttr.init(id, val, 0, 0);
            } catch (e) {
                newAttr = { attribute: id, value: val, type: 0, level: 0 };
            }
            return { attr: newAttr, val: val };
        };

        if (partID === PART_IDS.SHIELD) {
            const pick = candidates[Math.floor(Math.random() * candidates.length)];
            const resAtk = createAttrObj(pick.atk);
            const resDef = createAttrObj(pick.def);
            if (!equip.customAttributes) equip.customAttributes = [];
            equip.customAttributes.push(resAtk.attr);
            equip.customAttributes.push(resDef.attr);
            changeSummary = `${pick.name} (攻+${resAtk.val}%, 防+${resDef.val}%)`;
        } else {
            const pickId = candidates[Math.floor(Math.random() * candidates.length)];
            const res = createAttrObj(pickId);
            if (!equip.customAttributes) equip.customAttributes = [];
            equip.customAttributes.push(res.attr);
            const attrData = GameData.getModuleData(ATTR_MODULE_ID, pickId);
            changeSummary = `${attrData ? attrData.name : "属性"} +${res.val}%`;
        }

        equip.isCustomAttribute = true;
        equip.customAttributes = [...equip.customAttributes]; 
        this.setRechargeTarget(equip, this.selectedRechargeIndex);
        
        this.playRechargeAnimation(changeSummary);
    }

    private playRechargeAnimation(changeSummary: string): void {
        console.log("=== 播放充能动画 ===");
        if (this.rechargeBtn) this.rechargeBtn.disabled = true;
        
        this.flashRechargeSlot(() => {
            console.log("充能槽位闪烁完成，显示成功文字");
            this.showRechargeSuccessAnimation(changeSummary);
        });
    }

    private flashRechargeSlot(onComplete: Function): void {
        console.log("=== 开始充能槽位闪烁 ===");
        const slot = this.rechargeSlot;
        if (!slot || !slot.visible) {
            console.log("rechargeSlot 不存在或不可见，跳过闪烁");
            onComplete();
            return;
        }
        
        const glowMaterialID = 4;
        slot.addMaterialByID(glowMaterialID);
        slot.setMaterialValueFast({
            mu4_color: [0, 1, 1],
            mu4_blur: 6
        });
        
        let flashCount = 0;
        const maxFlashes = 4;
        const flashInterval = 120;
        
        const flash = () => {
            flashCount++;
            const isBright = flashCount % 2 === 1;
            
            console.log(`充能闪烁 ${flashCount}: ${isBright ? '亮' : '暗'}`);
            
            slot.setMaterialValueFast({
                mu4_blur: isBright ? 12 : 3,
                mu4_color: isBright ? [0.3, 1, 1] : [0, 0.5, 0.5]
            });
            
            if (flashCount < maxFlashes * 2) {
                setTimeout(flash, flashInterval);
            } else {
                setTimeout(() => {
                    console.log("=== 移除充能槽位外发光材质 ===");
                    slot.removeMaterialByID(glowMaterialID);
                    console.log("=== 充能槽位闪烁完成 ===");
                    onComplete();
                }, 100);
            }
        };
        
        flash();
    }

    private showRechargeSuccessAnimation(changeSummary: string): void {
        console.log("rechargeSuccessLabel:", this.rechargeSuccessLabel);
        if (!this.rechargeSuccessLabel) {
            console.log("rechargeSuccessLabel 不存在，直接显示提示");
            this.showRechargeTip(changeSummary);
            return;
        }
        
        this.rechargeSuccessLabel.visible = true;
        this.rechargeSuccessLabel.alpha = 1;
        this.rechargeSuccessLabel.scaleX = 0.3;
        this.rechargeSuccessLabel.scaleY = 0.3;
        
        let scale = 0.3;
        const targetScale = 1;
        const scaleStep = 0.18;
        const scaleInterval = 40;
        let bounceCount = 0;
        const maxBounce = 1;
        
        const scaleUp = () => {
            scale += scaleStep;
            
            if (scale > targetScale && bounceCount < maxBounce) {
                scale = targetScale - (scale - targetScale) * 0.5;
                bounceCount++;
            }
            
            this.rechargeSuccessLabel.scaleX = scale;
            this.rechargeSuccessLabel.scaleY = scale;
            
            if (Math.abs(scale - targetScale) > 0.05 || bounceCount < maxBounce) {
                setTimeout(scaleUp, scaleInterval);
            } else {
                this.rechargeSuccessLabel.scaleX = targetScale;
                this.rechargeSuccessLabel.scaleY = targetScale;
                
                setTimeout(() => {
                    let alpha = 1;
                    const fadeStep = 0.08;
                    const fadeInterval = 40;
                    
                    const fadeOut = () => {
                        alpha -= fadeStep;
                        if (alpha > 0) {
                            this.rechargeSuccessLabel.alpha = alpha;
                            this.rechargeSuccessLabel.scaleX = targetScale * (0.8 + alpha * 0.2);
                            this.rechargeSuccessLabel.scaleY = targetScale * (0.8 + alpha * 0.2);
                            setTimeout(fadeOut, fadeInterval);
                        } else {
                            this.rechargeSuccessLabel.visible = false;
                            this.rechargeSuccessLabel.alpha = 1;
                            this.rechargeSuccessLabel.scaleX = 1;
                            this.rechargeSuccessLabel.scaleY = 1;
                            if (this.rechargeBtn) this.rechargeBtn.disabled = false;
                            this.showRechargeTip(changeSummary);
                        }
                    };
                    fadeOut();
                }, 1200);
            }
        };
        
        scaleUp();
    }

    private showRechargeTip(changeSummary: string): void {
        if (typeof Lmkrt_TipsManager !== "undefined") Lmkrt_TipsManager.showTip(this.selectedRechargeEquip.icon, `充能成功！\n${changeSummary}`, ClientWorld.data.sureSE);
        else this.safeTip(`充能成功：${changeSummary}`);
    }

    // ==================================================================
    // 功能 3: 装备化合 (Combine)
    // ==================================================================

    private getCombineAttrLabels(): any[] {
        return [this.combineAttrLabel1, this.combineAttrLabel2, this.combineAttrLabel3, this.combineAttrLabel4, this.combineAttrLabel5];
    }

    private resetCombineUI(): void {
        this.setCombineMain(null, -1);
        this.setCombineSub(null, -1);
        this.selectedCombineAttrIndex = -1;
        if (this.combineTipLabel) this.combineTipLabel.text = "请放入主装备";
        this.refreshCombineAttrLabels(); 
    }

    private handleCombineItemClick(equip: Module_Equip, index: number): void {
        if (index === this.selectedCombineMainIndex || index === this.selectedCombineSubIndex) return;
        if (!this.selectedCombineMain) this.setCombineMain(equip, index);
        else this.setCombineSub(equip, index); 
    }

    private setCombineMain(equip: Module_Equip | null, index: number): void {
        this.selectedCombineMain = equip;
        this.selectedCombineMainIndex = index;
        this.selectedCombineAttrIndex = -1; 
        if (this.combineMainSlot) {
            this.combineMainSlot.image = equip ? equip.icon : "";
            this.combineMainSlot.visible = !!equip;
        }
        if (this.combineMainName) this.combineMainName.text = equip ? equip.name : "主装备";
        this.refreshCombineAttrLabels();
        this.refreshBackpackList(); 
    }

    private setCombineSub(equip: Module_Equip | null, index: number): void {
        this.selectedCombineSub = equip;
        this.selectedCombineSubIndex = index;
        if (this.combineSubSlot) {
            this.combineSubSlot.image = equip ? equip.icon : "";
            this.combineSubSlot.visible = !!equip;
        }
        if (this.combineSubName) this.combineSubName.text = equip ? equip.name : "副装备";
        this.refreshBackpackList();
    }

    private onCombineAttrClick(index: number): void {
        if (!this.selectedCombineMain) return;
        const equip = this.selectedCombineMain;
        const displayAttrs = equip.customAttributes.filter(ca => !BASE_ATTR_SET.has(ca.attribute));
        if (index < displayAttrs.length) {
            this.selectedCombineAttrIndex = index;
            this.refreshCombineAttrLabels();
            this.updateCombineTip(displayAttrs[index]);
        }
    }

    private refreshCombineAttrLabels(): void {
        const labels = this.getCombineAttrLabels();
        const equip = this.selectedCombineMain;
        
        if (!equip || !equip.customAttributes || equip.customAttributes.length === 0) {
            for (const lbl of labels) if (lbl) lbl.visible = false;
            if (this.combineTipLabel) this.combineTipLabel.text = equip ? "该装备没有可强化属性" : "请放入主装备";
            return;
        }

        const displayAttrs = equip.customAttributes.filter(ca => !BASE_ATTR_SET.has(ca.attribute));
        for (let i = 0; i < 5; i++) {
            const label = labels[i];
            if (!label) continue;
            if (i < displayAttrs.length) {
                const ca = displayAttrs[i];
                const attrData = GameData.getModuleData(ATTR_MODULE_ID, ca.attribute);
                
                const percentVal = ca.value;
                const calculatedLevel = Math.floor(percentVal / 10);
                const levelStr = `(${calculatedLevel}阶)`;
                const valStr = `+${percentVal.toFixed(2)}%`;
                
                label.text = `${attrData ? attrData.name : "???"} ${valStr} ${levelStr}`;
                label.color = (i === this.selectedCombineAttrIndex) ? "#00FF00" : "#FFFFFF";
                label.visible = true;
            } else {
                label.visible = false;
            }
        }
    }

    private updateCombineTip(ca: any): void {
        if (!this.combineTipLabel) return;
        this.combineTipLabel.text = "化合范围 0.1% ~ 1.5%";
    }

    private doCombine(): void {
        if (!this.selectedCombineMain) { this.safeTip("放入主装备"); return; }
        if (!this.selectedCombineSub) { this.safeTip("请放入副装备"); return; }
        if (this.selectedCombineAttrIndex < 0) { this.safeTip("请点击选择要强化的属性"); return; }
        
        const equip = this.selectedCombineMain;
        const displayAttrs = equip.customAttributes.filter(ca => !BASE_ATTR_SET.has(ca.attribute));
        const ca = displayAttrs[this.selectedCombineAttrIndex];
        const pkg = Game.player.data.package;
        
        let foundSubIndex = -1;
        if (pkg[this.selectedCombineSubIndex] && pkg[this.selectedCombineSubIndex].equip === this.selectedCombineSub) {
            foundSubIndex = this.selectedCombineSubIndex;
        } else {
            for(let i=0; i<pkg.length; i++) {
                if(pkg[i] && pkg[i].equip === this.selectedCombineSub) {
                    foundSubIndex = i;
                    break;
                }
            }
        }

        if (foundSubIndex === -1) { this.safeTip("副装备丢失"); return; }
        
        pkg[foundSubIndex] = null; 
        EventUtils.happen(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_ITEM_NUMBER);
        
        this.selectedCombineSub = null;
        this.selectedCombineSubIndex = -1;
        if (this.combineSubSlot) { this.combineSubSlot.image = ""; this.combineSubSlot.visible = false; }
        if (this.combineSubName) this.combineSubName.text = "副装备";

        const addV = 0.1 + (Math.random() * 1.4); 
        ca.value += addV;
        
        const tipMsg = `强化成功！\n本次提升：+${addV.toFixed(2)}%`;
        equip.customAttributes = [...equip.customAttributes];
        this.selectedCombineAttrIndex = -1; 
        this.setCombineMain(equip, this.selectedCombineMainIndex);
        
        this.playCombineAnimation(tipMsg);
    }

    private playCombineAnimation(tipMsg: string): void {
        console.log("=== 播放化合动画 ===");
        if (this.combineBtn) this.combineBtn.disabled = true;
        
        this.flashCombineSlots(() => {
            console.log("化合槽位闪烁完成，显示成功文字");
            this.showCombineSuccessAnimation(tipMsg);
        });
    }

    private flashCombineSlots(onComplete: Function): void {
        console.log("=== 开始化合槽位闪烁 ===");
        const mainSlot = this.combineMainSlot;
        const subSlot = this.combineSubSlot;
        
        const glowMaterialID = 4;
        const slots = [];
        if (mainSlot && mainSlot.visible) slots.push(mainSlot);
        if (subSlot && subSlot.visible) slots.push(subSlot);
        
        console.log("化合槽位数量:", slots.length);
        
        for (const slot of slots) {
            slot.addMaterialByID(glowMaterialID);
            slot.setMaterialValueFast({
                mu4_color: [1, 0, 1],
                mu4_blur: 6
            });
        }
        
        let flashCount = 0;
        const maxFlashes = 4;
        const flashInterval = 120;
        
        const flash = () => {
            flashCount++;
            const isBright = flashCount % 2 === 1;
            
            console.log(`化合闪烁 ${flashCount}: ${isBright ? '亮' : '暗'}`);
            
            for (const slot of slots) {
                slot.setMaterialValueFast({
                    mu4_blur: isBright ? 12 : 3,
                    mu4_color: isBright ? [1, 0.3, 1] : [0.5, 0, 0.5]
                });
            }
            
            if (flashCount < maxFlashes * 2) {
                setTimeout(flash, flashInterval);
            } else {
                setTimeout(() => {
                    console.log("=== 移除化合槽位外发光材质 ===");
                    for (const slot of slots) {
                        slot.removeMaterialByID(glowMaterialID);
                    }
                    console.log("=== 化合槽位闪烁完成 ===");
                    onComplete();
                }, 100);
            }
        };
        
        flash();
    }

    private showCombineSuccessAnimation(tipMsg: string): void {
        console.log("combineSuccessLabel:", this.combineSuccessLabel);
        if (!this.combineSuccessLabel) {
            console.log("combineSuccessLabel 不存在，直接显示提示");
            this.showCombineTip(tipMsg);
            return;
        }
        
        this.combineSuccessLabel.visible = true;
        this.combineSuccessLabel.alpha = 1;
        this.combineSuccessLabel.scaleX = 0.3;
        this.combineSuccessLabel.scaleY = 0.3;
        
        let scale = 0.3;
        const targetScale = 1;
        const scaleStep = 0.18;
        const scaleInterval = 40;
        let bounceCount = 0;
        const maxBounce = 1;
        
        const scaleUp = () => {
            scale += scaleStep;
            
            if (scale > targetScale && bounceCount < maxBounce) {
                scale = targetScale - (scale - targetScale) * 0.5;
                bounceCount++;
            }
            
            this.combineSuccessLabel.scaleX = scale;
            this.combineSuccessLabel.scaleY = scale;
            
            if (Math.abs(scale - targetScale) > 0.05 || bounceCount < maxBounce) {
                setTimeout(scaleUp, scaleInterval);
            } else {
                this.combineSuccessLabel.scaleX = targetScale;
                this.combineSuccessLabel.scaleY = targetScale;
                
                setTimeout(() => {
                    let alpha = 1;
                    const fadeStep = 0.08;
                    const fadeInterval = 40;
                    
                    const fadeOut = () => {
                        alpha -= fadeStep;
                        if (alpha > 0) {
                            this.combineSuccessLabel.alpha = alpha;
                            this.combineSuccessLabel.scaleX = targetScale * (0.8 + alpha * 0.2);
                            this.combineSuccessLabel.scaleY = targetScale * (0.8 + alpha * 0.2);
                            setTimeout(fadeOut, fadeInterval);
                        } else {
                            this.combineSuccessLabel.visible = false;
                            this.combineSuccessLabel.alpha = 1;
                            this.combineSuccessLabel.scaleX = 1;
                            this.combineSuccessLabel.scaleY = 1;
                            if (this.combineBtn) this.combineBtn.disabled = false;
                            this.showCombineTip(tipMsg);
                        }
                    };
                    fadeOut();
                }, 1200);
            }
        };
        
        scaleUp();
    }

    private showCombineTip(tipMsg: string): void {
        if (typeof Lmkrt_TipsManager !== "undefined") Lmkrt_TipsManager.showTip(this.selectedCombineMain.icon, tipMsg, ClientWorld.data.sureSE);
    }

    // ==================================================================
    // 功能 4: 转移 (Transfer)
    // ==================================================================

    private getTransferMainLabels(): any[] {
        return [this.transferMainAttrLabel1, this.transferMainAttrLabel2, this.transferMainAttrLabel3, this.transferMainAttrLabel4, this.transferMainAttrLabel5];
    }

    private getTransferSubLabels(): any[] {
        return [this.transferSubAttrLabel1, this.transferSubAttrLabel2, this.transferSubAttrLabel3, this.transferSubAttrLabel4, this.transferSubAttrLabel5];
    }

    private resetTransferUI(): void {
        this.setTransferMain(null, -1);
        this.setTransferSub(null, -1);
        this.selectedTransferMainAttrIdx = -1;
        this.selectedTransferSubAttrIdx = -1;
        if(this.transferCostLabel) this.transferCostLabel.text = "需要金币：-";
    }

    private handleTransferItemClick(equip: Module_Equip, index: number): void {
        if (index === this.selectedTransferMainIndex || index === this.selectedTransferSubIndex) return;
        if (!this.selectedTransferMain) this.setTransferMain(equip, index);
        else this.setTransferSub(equip, index); 
    }

    private setTransferMain(equip: Module_Equip | null, index: number): void {
        this.selectedTransferMain = equip;
        this.selectedTransferMainIndex = index;
        this.selectedTransferMainAttrIdx = -1;
        if (this.transferMainSlot) {
            this.transferMainSlot.image = equip ? equip.icon : "";
            this.transferMainSlot.visible = !!equip;
        }
        if (this.transferMainName) this.transferMainName.text = equip ? equip.name : "主装备";
        this.refreshTransferAttrLabels(true);
        this.refreshBackpackList();
    }

    private setTransferSub(equip: Module_Equip | null, index: number): void {
        this.selectedTransferSub = equip;
        this.selectedTransferSubIndex = index;
        this.selectedTransferSubAttrIdx = -1;
        if (this.transferSubSlot) {
            this.transferSubSlot.image = equip ? equip.icon : "";
            this.transferSubSlot.visible = !!equip;
        }
        if (this.transferSubName) this.transferSubName.text = equip ? equip.name : "副装备";
        this.refreshTransferAttrLabels(false);
        this.refreshBackpackList();
    }

    private onTransferMainAttrClick(index: number): void {
        if(!this.selectedTransferMain) return;
        const attrs = this.selectedTransferMain.customAttributes.filter(ca => !BASE_ATTR_SET.has(ca.attribute));
        if(index < attrs.length) {
            this.selectedTransferMainAttrIdx = index;
            this.refreshTransferAttrLabels(true);
        }
    }

    private onTransferSubAttrClick(index: number): void {
        if(!this.selectedTransferSub) return;
        const attrs = this.selectedTransferSub.customAttributes.filter(ca => !BASE_ATTR_SET.has(ca.attribute));
        if(index < attrs.length) {
            this.selectedTransferSubAttrIdx = index;
            this.refreshTransferAttrLabels(false);
        }
    }

    private refreshTransferAttrLabels(isMain: boolean): void {
        const equip = isMain ? this.selectedTransferMain : this.selectedTransferSub;
        const labels = isMain ? this.getTransferMainLabels() : this.getTransferSubLabels();
        const selectIdx = isMain ? this.selectedTransferMainAttrIdx : this.selectedTransferSubAttrIdx;
        
        if (!equip || !equip.customAttributes) {
            for(const l of labels) if(l) l.visible = false;
            return;
        }

        const displayAttrs = equip.customAttributes.filter(ca => !BASE_ATTR_SET.has(ca.attribute));
        for (let i = 0; i < 5; i++) {
            const label = labels[i];
            if (!label) continue;
            if (i < displayAttrs.length) {
                const ca = displayAttrs[i];
                const attrData = GameData.getModuleData(ATTR_MODULE_ID, ca.attribute);
                let valStr = `+${ca.value.toFixed(2)}%`;
                label.text = `${attrData ? attrData.name : "???"} ${valStr}`;
                label.color = (i === selectIdx) ? "#00FF00" : "#FFFFFF";
                label.visible = true;
            } else {
                label.visible = false;
            }
        }
        if(this.transferCostLabel) this.transferCostLabel.text = "消耗金币: 1000";
    }

    private doTransfer(): void {
        if (!this.selectedTransferMain || !this.selectedTransferSub) { this.safeTip("请放入主副装备"); return; }
        const mainData = GameData.getModuleData(EQUIP_MODULE_ID, this.selectedTransferMain.id);
        const subData = GameData.getModuleData(EQUIP_MODULE_ID, this.selectedTransferSub.id);
        if (!mainData || !subData) { this.safeTip("装备数据异常"); return; }
        if (mainData.partID != subData.partID) { this.safeTip("只能在【同部位】装备之间转移！"); return; }
        if (this.selectedTransferMainAttrIdx < 0) { this.safeTip("请选择主装备属性"); return; }
        if (this.selectedTransferSubAttrIdx < 0) { this.safeTip("请选择副装备属性"); return; }
        
        const COST = 1000;
        if (Game.player.data.gold < COST) { this.safeTip("金币不足"); return; }

        const mainAttrs = this.selectedTransferMain.customAttributes || [];
        const subAttrs = this.selectedTransferSub.customAttributes || [];
        const mainDisplayAttrs = mainAttrs.filter(ca => !BASE_ATTR_SET.has(ca.attribute));
        const subDisplayAttrs = subAttrs.filter(ca => !BASE_ATTR_SET.has(ca.attribute));
        
        const targetMainAttr = mainDisplayAttrs[this.selectedTransferMainAttrIdx];
        const sourceSubAttr = subDisplayAttrs[this.selectedTransferSubAttrIdx];
        if (!targetMainAttr || !sourceSubAttr) return;

        const duplicateCheck = mainDisplayAttrs.find(ca => ca !== targetMainAttr && ca.attribute === sourceSubAttr.attribute);
        if (duplicateCheck) { this.safeTip("转移失败：主装备已存在相同属性！"); return; }

        ProjectPlayer.increaseGold(-COST);
        
        targetMainAttr.attribute = sourceSubAttr.attribute;
        targetMainAttr.value = sourceSubAttr.value;
        targetMainAttr.type = sourceSubAttr.type || 0;
        targetMainAttr.level = sourceSubAttr.level || 0;

        if (this.selectedTransferSub.customAttributes) {
            const rawIndex = this.selectedTransferSub.customAttributes.indexOf(sourceSubAttr);
            if (rawIndex > -1) this.selectedTransferSub.customAttributes.splice(rawIndex, 1);
        }

        this.selectedTransferMain.customAttributes = [...(this.selectedTransferMain.customAttributes || [])];
        this.selectedTransferSub.customAttributes = [...(this.selectedTransferSub.customAttributes || [])];
        
        this.resetTransferUI(); 
        this.safeTip("转移成功！");
        this.refreshBackpackList();
    }

    private bindSlotTips(): void {
        const bind = (slot: any, getter: () => any) => {
            if (!slot) return;
            slot.mouseEnabled = true;
            slot.on(EventObject.MOUSE_OVER, this, () => {
                const data = getter();
                if (data && Lmkrt_GUI_CommonInfo.isAvailable()) {
                    const ui = Lmkrt_GUI_CommonInfo.getInstance();
                    if (!ui.parent) Game.layer.uiLayer.addChild(ui);
                    else ui.parent.setChildIndex(ui, ui.parent.numChildren - 1);
                    ui.visible = true;
                    if (data.isEquip) ui.showEquipInfo(data.equip); else ui.showItemInfo(data.item);
                    const pos = slot.localToGlobal(new Point(0, 0)); ui.setPosition(pos.x + 60, pos.y);
                }
            });
            slot.on(EventObject.MOUSE_OUT, this, this.onUndisplay);
        };
        
        bind(this.mainMaterialSlot, () => this.currentRecipe ? {isEquip:false, item:GameData.getModuleData(1, this.currentRecipe.mainMaterialId)} : null);
        // 多成品槽位绑定
        const productSlots = this.getProductSlots();
        for (let i = 0; i < productSlots.length; i++) {
            bind(productSlots[i], () => {
                if (!this.currentRecipe) return null;
                const productIds = Array.isArray(this.currentRecipe.productItemId) ? this.currentRecipe.productItemId : [this.currentRecipe.productItemId];
                if (i >= productIds.length) return null;
                const isE = this.currentRecipe.isProductEquip;
                let d = GameData.getModuleData(isE ? 9 : 1, productIds[i]);
                // 如果返回的是包含 attrs 的对象，提取实际数据
                if (d && d.attrs) {
                    d = Object.assign({}, d.attrs, { id: d.id });
                    // 将嵌套的 value 展开
                    for (const key in d) {
                        if (d[key] && typeof d[key] === 'object' && 'value' in d[key]) {
                            d[key] = d[key].value;
                        }
                    }
                }
                return { isEquip: isE, item: !isE ? d : null, equip: isE ? d : null };
            });
        }
        // productSlot 悬浮提示（显示选中的成品信息）
        bind(this.productSlot, () => {
            if (!this.currentRecipe) return null;
            const productIds = Array.isArray(this.currentRecipe.productItemId) ? this.currentRecipe.productItemId : [this.currentRecipe.productItemId];
            if (this.selectedProductIndex < 0 || this.selectedProductIndex >= productIds.length) return null;
            const isE = this.currentRecipe.isProductEquip;
            let d = GameData.getModuleData(isE ? 9 : 1, productIds[this.selectedProductIndex]);
            if (d && d.attrs) {
                d = Object.assign({}, d.attrs, { id: d.id });
                for (const key in d) {
                    if (d[key] && typeof d[key] === 'object' && 'value' in d[key]) {
                        d[key] = d[key].value;
                    }
                }
            }
            return { isEquip: isE, item: !isE ? d : null, equip: isE ? d : null };
        });
        
        bind(this.rechargeSlot, () => this.selectedRechargeEquip ? {isEquip:true, equip:this.selectedRechargeEquip} : null);
        bind(this.combineMainSlot, () => this.selectedCombineMain ? {isEquip:true, equip:this.selectedCombineMain} : null);
        bind(this.combineSubSlot, () => this.selectedCombineSub ? {isEquip:true, equip:this.selectedCombineSub} : null);
        bind(this.transferMainSlot, () => this.selectedTransferMain ? {isEquip:true, equip:this.selectedTransferMain} : null);
        bind(this.transferSubSlot, () => this.selectedTransferSub ? {isEquip:true, equip:this.selectedTransferSub} : null);
        
        const s = this.getAuxSlots();
        for(let i=0; i<4; i++) bind(s[i], () => (this.currentRecipe && this.currentRecipe.auxMaterials && this.currentRecipe.auxMaterials[i]) ? {isEquip:false, item:GameData.getModuleData(1, this.currentRecipe.auxMaterials[i])} : null);
    }
    
    private countItemInBag(id: number): number {
        const pkg = Game.player.data.package;
        return pkg.reduce((sum: number, ds: any) => sum + (ds && !ds.isEquip && ds.item && ds.item.id == id ? (Number(ds.number)||0) : 0), 0);
    }

    private getAuxSlots(): any[] { return [this.auxMaterialSlot1, this.auxMaterialSlot2, this.auxMaterialSlot3, this.auxMaterialSlot4]; }
    private getAuxLabels(): any[] { return [this.auxMaterialCountLabel1, this.auxMaterialCountLabel2, this.auxMaterialCountLabel3, this.auxMaterialCountLabel4]; }
    private getProductSlots(): any[] { return [this.productSlot1, this.productSlot2, this.productSlot3, this.productSlot4, this.productSlot5]; }
    
    // 点击成品槽位选择要打造的成品
    private onProductSlotClick(index: number): void {
        if (!this.currentRecipe) return;
        const productIds = this.currentRecipe.productItemId;
        if (!Array.isArray(productIds) || index >= productIds.length) return;
        
        this.selectedProductIndex = index;
        this.updateProductSlotsSelection();
    }
    
    // 更新成品槽位的选中状态显示，并将选中的成品显示到单独的 productSlot 组件
    private updateProductSlotsSelection(): void {
        const slots = this.getProductSlots();
        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            if (slot) {
                slot.alpha = (i === this.selectedProductIndex) ? 1 : 0.5;
            }
        }
        
        // 将选中的成品显示到单独的 productSlot 组件
        if (this.productSlot && this.currentRecipe) {
            const productIds = Array.isArray(this.currentRecipe.productItemId) ? this.currentRecipe.productItemId : [this.currentRecipe.productItemId];
            if (this.selectedProductIndex >= 0 && this.selectedProductIndex < productIds.length) {
                const moduleID = this.currentRecipe.isProductEquip ? EQUIP_MODULE_ID : ITEM_MODULE_ID;
                const product = GameData.getModuleData(moduleID, productIds[this.selectedProductIndex]);
                let iconPath = "";
                if (product) {
                    if (product.icon) {
                        iconPath = product.icon;
                    } else if (product.attrs && product.attrs.icon) {
                        iconPath = product.attrs.icon.value || "";
                    }
                }
                this.productSlot.image = iconPath;
                this.productSlot.visible = true;
            } else {
                this.productSlot.image = "";
                this.productSlot.visible = false;
            }
        }
    }
    
    private safeTip(msg: string): void { if (GameUI.showTip) GameUI.showTip(msg); }
    
    private hideTooltip(): void {
        if (typeof Lmkrt_GUI_CommonInfo !== "undefined" && Lmkrt_GUI_CommonInfo.isAvailable()) {
            const ui = Lmkrt_GUI_CommonInfo.getInstance();
            if (ui) { ui.visible = false; if (ui.parent) ui.parent.removeChild(ui); }
        }
    }

    private onUndisplay(): void { this.hideTooltip(); }
}
