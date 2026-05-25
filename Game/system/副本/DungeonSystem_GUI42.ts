// ========================================================================
// 副本挑战系统 - 正式版（无日志·UIList规范）
// 绑定UI：42
// 掉落子项：43
// 道具模块：7
// ========================================================================

// --- 系统配置 ---
const DUNGEON_UI_ID = 42;
const DUNGEON_MODULE_ID = 27;
const ITEM_MODULE_ID = 7;
const LOOT_ITEM_MODEL_UI_ID = 43;
const DUNGEON_REQUEST_ID_VAR = 16;
const DUNGEON_REFRESH_DATE_VAR = 8;
const PROMPT_UI_ID = 14;
const TARGET_SCENE_ID = 2;
const TARGET_SCENE_X = 315;
const TARGET_SCENE_Y = 1403;

// --- UIList 布局 ---
const LOOT_LIST_REPEAT_X = 5;
const LOOT_ITEM_WIDTH = 60;
const LOOT_ITEM_HEIGHT = 60;
const LOOT_SPACE_X = 10;
const LOOT_SPACE_Y = 10;
const LOOT_SCROLL_TYPE = 0;

// --- 颜色 ---
const COLOR_MET = "#25FF25";
const COLOR_UNMET = "#FF4040";

// --- 属性ID ---
const ATTR_IDS = {
    ATK_BASE: 2,
    DEF_BASE: 16,
    HP_BASE: 1
};

// --- 全局声明 ---
declare const GameUI: any;
declare const GameData: any;
declare const Game: any;
declare const EventObject: any;
declare const Lmkrt_GUI_CommonInfo: any;
declare const Point: any;
declare const UIList: any;
declare const UIListItemData: any;
declare const ListItem_43: any;

interface CustomItemData {
    id: number;
    icon?: string;
    name?: string;
    [key: string]: any;
}

declare class GUI_42 {
    sys_bossAvatar: {
        image: string;
        setImageForce(image: string): void;
        on(type: string, caller: any, func: Function): void;
        visible: boolean;
        width?: number;
        height?: number;
        scaleX?: number;
        scaleY?: number;
        pivotType: number;
        flip: boolean;
        isTile: boolean;
        grid9: string;
    };
    sys_info_level: { text: string; color: string };
    sys_info_count: { text: string; color: string };
    sys_info_atk: { text: string; color: string };
    sys_info_def: { text: string; color: string };
    sys_tab: { selectedIndex: number; on(type: string, caller: any, func: Function): void };
    sys_list_loot: UIList;
    sys_text_strategy: { text: string };
    sys_text_intro: { text: string };
    sys_btn_enter: { on(type: string, caller: any, func: Function): void };
    sys_title: { text: string };
    bossNameLabel: { text: string };

    on(type: string, caller: any, func: Function): void;
    constructor();
}

class DungeonSystem_GUI42 extends GUI_42 {
    private currentDungeonData: any = null;
    private currentCount = 0;
    private isReady = false;

    constructor() {
        super();
        this.init();
    }

    private init(): void {
        if (this.verifyUIComponents()) {
            this.isReady = true;
            const lootList = this.sys_list_loot;
            if (lootList) {
                lootList.itemModelGUI = LOOT_ITEM_MODEL_UI_ID;
                lootList.repeatX = LOOT_LIST_REPEAT_X;
                lootList.itemWidth = LOOT_ITEM_WIDTH;
                lootList.itemHeight = LOOT_ITEM_HEIGHT;
                lootList.spaceX = LOOT_SPACE_X;
                lootList.spaceY = LOOT_SPACE_Y;
                lootList.scrollShowType = LOOT_SCROLL_TYPE;
                lootList.selectEnable = false;
                lootList.optimizationMode = false;
                lootList.mouseEnabled = true;
                lootList.visible = true;
            }
            this.bindEvents();
        }
    }

    private verifyUIComponents(): boolean {
        let allOk = true;
        const core = ["sys_bossAvatar","sys_title","bossNameLabel","sys_btn_enter","sys_info_level","sys_list_loot"];
        for (const c of core) { if (!(this as any)[c]) allOk = false; }
        if (this.sys_list_loot && !(this.sys_list_loot instanceof UIList)) allOk = false;
        return allOk;
    }

    private bindEvents(): void {
        this.on(EventObject.DISPLAY, this, this.onDisplay);
        this.on(EventObject.UNDISPLAY, this, this.onUndisplay);
        this.sys_btn_enter.on(EventObject.CLICK, this, this.onEnterButtonClick);
        this.sys_tab.on(EventObject.CHANGE, this, this.onTabChange);
        this.sys_list_loot.on(UIList.ITEM_CREATE, this, this.onLootItemCreate);
    }

    private onDisplay(): void {
        if (!this.isReady) return;
        const dungeonId = Game.player?.variable?.getVariable(DUNGEON_REQUEST_ID_VAR) || 0;
        if (!dungeonId) return;

        this.checkAndResetDailyCounts();
        this.currentDungeonData = GameData.getModuleData(DUNGEON_MODULE_ID, dungeonId);
        if (!this.currentDungeonData) return;

        this.updateAllDungeonInfo();
        this.sys_tab.selectedIndex = 0;
        this.onTabChange();
    }

    private checkAndResetDailyCounts(): void {
        const today = new Date().toLocaleDateString();
        const last = Game.player.variable.getString(DUNGEON_REFRESH_DATE_VAR) || "";
        if (today !== last) {
            Game.player.variable.setString(DUNGEON_REFRESH_DATE_VAR, today);
        }
    }

    private get selectedActorDS(): any {
        const actorUI = GameUI.get(4);
        if (actorUI && actorUI.actorList) {
            const idx = Math.min(Math.max(0, actorUI.actorList.selectedIndex), Game.player.data.party.length-1);
            return Game.player.data.party[idx];
        }
        return Game.player.data.party[0] || { actor: { extendAttributes: {} }, lv:1 };
    }

    private getActorAttrValue(actor: any, id: number): number {
        return actor?.extendAttributes?.[id] ?? 0;
    }

    private getPlayerAttributes() {
        const a = this.selectedActorDS;
        if (!a?.actor) return { level:1, ATK:0, DEF:0 };
        const lv = a.lv || 1;
        const atk = this.getActorAttrValue(a.actor, ATTR_IDS.ATK_BASE);
        const def = this.getActorAttrValue(a.actor, ATTR_IDS.DEF_BASE);
        return { level:lv, ATK:atk, DEF:def };
    }

    private updateBossAvatar(): void {
        if (!this.sys_bossAvatar || !this.currentDungeonData.bossImg) return;
        const img = this.currentDungeonData.bossImg.trim();
        this.sys_bossAvatar.on(EventObject.LOADED, this, ()=>{ this.sys_bossAvatar.visible = true; });
        this.sys_bossAvatar.visible = false;
        this.sys_bossAvatar.pivotType = 0;
        this.sys_bossAvatar.flip = false;
        this.sys_bossAvatar.isTile = false;
        this.sys_bossAvatar.grid9 = "0,0,0,0,0";
        this.sys_bossAvatar.setImageForce ? this.sys_bossAvatar.setImageForce(img) : (this.sys_bossAvatar.image = img);
        this.sys_bossAvatar.width = 100;
        this.sys_bossAvatar.height = 100;
        this.sys_bossAvatar.scaleX = 1;
        this.sys_bossAvatar.scaleY = 1;
    }

    private updateLootList(): void {
        if (!this.sys_list_loot || !this.currentDungeonData) return;
        const drops = this.currentDungeonData.drops;
        if (!drops || !Array.isArray(drops)) { this.sys_list_loot.items = []; return; }

        const items: UIListItemData[] = [];
        for (const raw of drops) {
            const id = typeof raw === "object" ? raw.id : raw;
            if (!id || id <= 0) continue;
            const data = GameData.getModuleData(ITEM_MODULE_ID, id) || (typeof raw === "object" ? raw : null);
            if (!data) continue;
            const icon = data.icon || data.item_icon || data.img || "";
            if (!icon) continue;

            const item = new ListItem_43();
            item.sys_icon = icon;
            item.customData = data;
            items.push(item);
        }
        this.sys_list_loot.items = items;
    }

    private onLootItemCreate(ui: any, data: any): void {
        if (!ui || !data.customData) return;
        ui.on(EventObject.MOUSE_OVER, this, () => {
            const info = Lmkrt_GUI_CommonInfo.getInstance();
            info.showItemInfo(data.customData);
            const p = ui.localToGlobal(new Point(0,0));
            info.setPosition(p.x + 70, p.y);
        });
        ui.on(EventObject.MOUSE_OUT, this, () => {
            Lmkrt_GUI_CommonInfo.getInstance().hide();
        });
    }

    private updateAllDungeonInfo(): void {
        const d = this.currentDungeonData;
        const p = this.getPlayerAttributes();
        if (!d) return;

        this.updateBossAvatar();
        this.sys_title.text = `副本挑战 - ${d.name || "未知副本"}`;
        this.bossNameLabel.text = d.bossName || d.name || "未知BOSS";
        this.updateLootList();

        this.sys_text_intro.text = `        ${d.intro || "暂无介绍"}`;
        this.sys_text_strategy.text = `        ${d.strategy || "暂无攻略"}`;

        const lvOk = p.level >= (d.reqLevel||0);
        this.sys_info_level.text = String(d.reqLevel||0);
        this.sys_info_level.color = lvOk ? COLOR_MET : COLOR_UNMET;

        const atkOk = p.ATK >= (d.reqAtk||0);
        this.sys_info_atk.text = String(d.reqAtk||0);
        this.sys_info_atk.color = atkOk ? COLOR_MET : COLOR_UNMET;

        const defOk = p.DEF >= (d.reqDef||0);
        this.sys_info_def.text = String(d.reqDef||0);
        this.sys_info_def.color = defOk ? COLOR_MET : COLOR_UNMET;

        const last = Game.player.variable.getString(DUNGEON_REFRESH_DATE_VAR) || "";
        const today = new Date().toLocaleDateString();
        const countVar = d.countVarID || 0;
        this.currentCount = (last !== today) ? 0 : (Game.player.variable.getVariable(countVar)||0);
        const max = d.maxCount || 0;
        const countOk = this.currentCount < max;
        this.sys_info_count.text = `${this.currentCount}/${max}`;
        this.sys_info_count.color = countOk ? COLOR_MET : COLOR_UNMET;
    }

    private onTabChange(): void {
        const s = this.sys_tab.selectedIndex;
        this.sys_list_loot.visible = s === 0;
        this.sys_text_strategy.visible = s === 1;
        this.sys_text_intro.visible = s === 2;
        if (s === 0) this.updateLootList();
    }

    private onEnterButtonClick(): void {
        const d = this.currentDungeonData;
        const p = this.getPlayerAttributes();
        if (!d) return;

        const reqLv = d.reqLevel|0;
        const reqAtk = d.reqAtk|0;
        const maxCnt = d.maxCount|0;

        if (p.level < reqLv) return;
        if (p.ATK < reqAtk) return;
        if (this.currentCount >= maxCnt) return;

        this.enterDungeon(d);
    }

    private enterDungeon(d: any): void {
        const varId = d.countVarID|0;
        if (varId>0) Game.player.variable.setVariable(varId, this.currentCount+1);
        GameUI.hide(DUNGEON_UI_ID);

        const msg = `即将进入【${d.name||"副本"}】！
等级：${d.reqLevel||0}级（当前${this.getPlayerAttributes().level}）
攻击：${d.reqAtk||0}（当前${this.getPlayerAttributes().ATK}）
防御：${d.reqDef||0}（当前${this.getPlayerAttributes().DEF}）
今日剩余：${(d.maxCount||0)-this.currentCount}次
确认挑战？`;
        this.showResultUI(msg,0,true);
    }

    private showResultUI(msg: string, varId: number, tp: boolean): void {
        if (varId>0) {
            const v = Game.player.variable.getVariable(varId);
            Game.player.variable.setVariable(varId, v+1);
        }
        const ui = GameUI.show(PROMPT_UI_ID);
        if (!ui) { alert(msg); return; }

        const lab = ui.getChildByName("promptContentLabel");
        const ok = ui.getChildByName("confirmButton");
        const no = ui.getChildByName("cancelButton");
        const title = ui.getChildByName("promptTitleLabel");

        if (lab) lab.text = msg;
        if (no) no.visible = false;
        if (title) title.visible = false;

        if (ok) {
            ok.once(EventObject.CLICK, this, ()=>{
                ui.removeSelf();
                if (tp) Game.player.toScene(TARGET_SCENE_ID, TARGET_SCENE_X, TARGET_SCENE_Y);
            });
        } else {
            setTimeout(()=>{
                ui.removeSelf();
                if (tp) Game.player.toScene(TARGET_SCENE_ID, TARGET_SCENE_X, TARGET_SCENE_Y);
            },2000);
        }
    }

    private onUndisplay(): void {
        this.currentDungeonData = null;
        if (Lmkrt_GUI_CommonInfo) Lmkrt_GUI_CommonInfo.getInstance().hide();
    }
}

if (typeof Game !== "undefined" && Game.UI) {
    Game.UI.register(DUNGEON_UI_ID, DungeonSystem_GUI42);
}