/**
 * GUI_Main.ts (v31 - 绉婚櫎澶ч檰鏃ュ織绯荤粺)
 *
 * 1. [绉婚櫎澶ч檰鏃ュ織绯荤粺] 绉绘Ы浜哹attle绯荤粺鏃ュ織锛屽寘鎷琈ISS銆両TEM_GET绛?
 *    浠呯淮鎸佸疄璺典娇?者?1. [浼樺寲] 闃熷崟娆″惊鐄�澶勭悊闃熷崟娆″惊鐄�
 * 2. [绉婚櫎澶ч檰鏃ュ織绯荤粺] 浠呯淮鎴忓硅薄鍚嶇О鍜屽硅薄韬?界面
 * 3. [淇濆崌] 绉婚櫎鏃ュ織绯荤粺鍚庣殑涓嶅繀瑕佸崰鐢ㄨ祫婧
 */

class GUI_Main extends GUI_18 {
    
    // -- 闈欐�佹爣蹇?--
    public static isChatInputFocus: boolean = false;
    // -- 鍘熸湁鍙橀噺 --
    mainSceneObjectID: number;
    partyMemberIDs: number[] = [];
    private static syncGetItemTipsTask: string = "syncGetItemTipsTask";
    private tipsPostionIndex: number;
    private mainHPCache: number;
    private mainMaxHPCache: number;
    private firstRefreshSkill = false;

    // -- 鑱婂叧绯胯緭鍏ユ枒 --
    public inputField: UIInput;
    public sendButton: UIButton;
    public chatContainer: UIRoot;
    public chatTabWorld: UIButton;
    public chatTabPrivate: UIButton;
    public chatOnlineCount: UIString;
    public chatList: UIList;
    public playerList: UIList;
    private chatCurrentTab: string = 'world';
    private chatTargetUser: string = '';
    private chatLastMsgCount: number = 0;
    private chatPollTimer: number = 0;
    private chatUnreadCount: number = 0;
    private chatLastSendTime: number = 0;
    private chatApiBase: string = 'http://47.96.92.202:8848/fwq/api.php';

    // =======================================================================
    //  v30 鎬ц兘浼樺寲锛氶槦鍛樼姸鎬佺紦瀛?銆戙�戙�?
    // =======================================================================
    private partyStatsCache: { [inPartyIndex: number]: { hp: number, maxHP: number, sp: number, maxSP: number } } = {};


    constructor() {
        super();

        this.HPSlider.value = 0;
        this.SPSlider.value = 0;
        EventUtils.addEventListenerFunction(ProjectPlayer, ProjectPlayer.EVENT_ADD_PLAYER_ACTOR, this.refreshParty, this);
        EventUtils.addEventListenerFunction(ProjectPlayer, ProjectPlayer.EVENT_REMOVE_PLAYER_ACTOR, this.refreshParty, this);
        EventUtils.addEventListenerFunction(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_CTRL_ACTOR, this.refreshAll, this);
        EventUtils.addEventListenerFunction(ProjectPlayer, ProjectPlayer.EVENT_LEARN_PLAYER_ACTOR_SKILL, this.onSkillChange, this);
        EventUtils.addEventListenerFunction(ProjectPlayer, ProjectPlayer.EVENT_FORGET_PLAYER_ACTOR_SKILL, this.onSkillChange, this);
        EventUtils.addEventListenerFunction(GameBattleData, GameBattleData.EVENT_STATUS_CHANGE, this.onStatusChange, this);
        EventUtils.addEventListenerFunction(ProjectPlayer, ProjectPlayer.EVENT_PLAYER_ACTOR_CHANGE_EXP, this.onEXPChange, this);
        EventUtils.addEventListenerFunction(ProjectPlayer, ProjectPlayer.EVENT_PLAYER_ACTOR_CHANGE_LEVEL, this.onLevelChange, this);
        this.skillList.on(UIList.ITEM_CREATE, this, this.onCreateSkillItem);
        this.skillList.mouseEnabled = true;
        this.stateList.on(UIList.ITEM_CREATE, this, this.onCreateMainActorStatusItem);
        this.stateList.mouseEnabled = true;
        EventUtils.addEventListenerFunction(GameUI, GameUI.EVENT_OPEN_SYSTEM_UI, this.onUIOpen, this);
        EventUtils.addEventListenerFunction(GameUI, GameUI.EVENT_CLOSE_SYSTEM_UI, this.onUIClose, this);
        this.skillBar2.visible = false;

        this.refreshAll();
        this.initChatInput();

        this.tipsUI.visible = false;
        stage.on(EventObject.RENDER, this, this.onRender);
    }


    // =======================================================================
    //  聊天系统 - 完整实现 (v32)
    // =======================================================================

    /** 初始化聊天系统 */
    private initChatInput(): void {
        if (!this.inputField || !this.sendButton) return;
        this.sendButton.on(EventObject.CLICK, this, this.onSendClick);
        this.inputField.on(EventObject.ENTER, this, this.onSendClick);
        this.inputField.on(EventObject.FOCUS, this, this.onInputFocus);
        this.inputField.on(EventObject.BLUR, this, this.onInputBlur);

        if (this.chatTabWorld) this.chatTabWorld.on(EventObject.CLICK, this, this.onChatTabWorld);
        if (this.chatTabPrivate) this.chatTabPrivate.on(EventObject.CLICK, this, this.onChatTabPrivate);

        this.chatStartPolling();
        setInterval(() => { this.chatUpdateOnlineStatus(); }, 60000);
        this.chatUpdateOnlineStatus();
        this.chatLoadOnlineUsers();
    }

    /** 发送消息按钮点击 */
    /** 发送消息（3秒冷却） */
    private onSendClick(): void {
        const chatText = this.inputField.text;
        if (!chatText || chatText.trim() === '') return;

        // 3秒发送冷却
        let now = Date.now();
        if (now - this.chatLastSendTime < 3000) {
            let remain = Math.ceil((3000 - (now - this.chatLastSendTime)) / 1000);
            this.chatShowToast('请等待 ' + remain + ' 秒后再发送');
            return;
        }

        let actorName = '玩家';
        if (ProjectPlayer.ctrlActorBattleModule) {
            let actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(ProjectPlayer.ctrlActorBattleModule.inPartyIndex);
            if (actorDS && actorDS.actor) {
                actorName = actorDS.actor.name.toString();
            }
        }

        let token = this.chatGetToken();
        if (!token) {
            this.chatShowToast('请先登录');
            return;
        }

        let toUser = this.chatCurrentTab === 'private' ? this.chatTargetUser : 'all';
        if (this.chatCurrentTab === 'private' && !toUser) {
            this.chatShowToast('请先在在线列表中选择私聊对象');
            return;
        }

        this.chatLastSendTime = now;
        let postData: any = {
            from_user: this.chatGetUsername(),
            to_user: toUser,
            content: chatText.substring(0, 50),
            character_name: actorName,
            token: token
        };

        this.chatApiRequest('sendMessage', postData, (result: any) => {
            if (result && result.code === 200) {
                this.inputField.text = '';
                this.chatRefreshMessages();
            } else {
                let errMsg = (result && result.message) ? result.message : '发送失败';
                this.chatShowToast(errMsg);
            }
        });
    }

    private onInputFocus(): void {
        GUI_Main.isChatInputFocus = true;
    }

    private onInputBlur(): void {
        GUI_Main.isChatInputFocus = false;
    }

    /** 切换到世界频道 */
    private onChatTabWorld(): void {
        this.chatCurrentTab = 'world';
        this.chatTargetUser = '';
        if (this.chatTabWorld) this.chatTabWorld.visible = false;
        if (this.chatTabPrivate) this.chatTabPrivate.visible = true;
        if (this.playerList) this.playerList.visible = false;
        this.chatRefreshMessages();
    }

    /** 切换到私聊 */
    private onChatTabPrivate(): void {
        this.chatCurrentTab = 'private';
        if (this.chatTabWorld) this.chatTabWorld.visible = true;
        if (this.chatTabPrivate) this.chatTabPrivate.visible = false;
        if (this.playerList) this.playerList.visible = true;
        this.chatRefreshMessages();
    }

    /** 选择私聊对象（由playerList的点击触发） */
    private chatSelectUser(username: string): void {
        this.chatTargetUser = username;
        this.chatCurrentTab = 'private';
        if (this.chatTabWorld) this.chatTabWorld.visible = true;
        if (this.chatTabPrivate) this.chatTabPrivate.visible = false;
        if (this.playerList) this.playerList.visible = true;
        this.chatShowToast('正在与 ' + username + ' 私聊');
        this.chatRefreshMessages();
    }

    // =======================================================================
    //  API 通信
    // =======================================================================

    /** 获取用户名 */
    private chatGetUsername(): string {
        try {
            let un = Game.player.variable.getString(14004);
            if (un && un !== 'undefined') return un;
        } catch (e) {}
        try { return localStorage.getItem('mk_username') || ''; } catch (e) {}
        return '';
    }

    /** 获取Token */
    private chatGetToken(): string {
        try {
            let tk = Game.player.variable.getString(14003);
            if (tk && tk !== 'undefined') return tk;
        } catch (e) {}
        try { return localStorage.getItem('mk_token') || ''; } catch (e) {}
        return '';
    }

    /** 通用API请求（异步回调） */
    private chatApiRequest(action: string, data: any, callback: (result: any) => void): void {
        try {
            let xhr = new XMLHttpRequest();
            let timeout = setTimeout(() => { xhr.abort(); if (callback) callback(null); }, 8000);
            xhr.open('POST', this.chatApiBase + '?action=' + action, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    clearTimeout(timeout);
                    if (xhr.status === 200) {
                        try { callback(JSON.parse(xhr.responseText)); }
                        catch (e) { callback(null); }
                    } else { callback(null); }
                }
            };
            xhr.onerror = () => { clearTimeout(timeout); callback(null); };
            xhr.send(JSON.stringify(data));
        } catch (e) { callback(null); }
    }

    /** 更新在线状态（每分钟） */
    private chatUpdateOnlineStatus(): void {
        let token = this.chatGetToken();
        let username = this.chatGetUsername();
        if (!token || !username) return;
        this.chatApiRequest('updateUserStatus', { token: token, username: username }, null);
    }

    /** 加载在线玩家列表 */
    private chatLoadOnlineUsers(): void {
        let token = this.chatGetToken();
        if (!token) return;
        this.chatApiRequest('getChatUsers', { token: token }, (result: any) => {
            if (!result || result.code !== 200 || !result.data) return;
            let users = result.data;
            let myName = this.chatGetUsername();
            let onlineUsers = users.filter((u: any) => u.online && u.username !== myName);
            if (this.chatOnlineCount) {
                this.chatOnlineCount.text = '在线: ' + onlineUsers.length + '人';
            }
            if (this.playerList) {
                let items: UIListItemData[] = [];
                onlineUsers.forEach((u: any) => {
                    let d = new UIListItemData();
                    d.playerName = u.username;
                    d.playerStatus = '在线';
                    items.push(d);
                });
                this.playerList.items = items;
            }
        });
    }

    // =======================================================================
    //  消息列表管理
    // =======================================================================

    /** 刷新消息列表（根据当前频道） */
    private chatRefreshMessages(): void {
        let token = this.chatGetToken();
        if (!token) return;

        if (this.chatCurrentTab === 'world') {
            this.chatApiRequest('getPublicMessages', { token: token }, (result: any) => {
                this.chatRenderMessages(result);
            });
        } else if (this.chatCurrentTab === 'private' && this.chatTargetUser) {
            let myName = this.chatGetUsername();
            this.chatApiRequest('getPrivateMessages', {
                token: token,
                from_user: myName,
                to_user: this.chatTargetUser
            }, (result: any) => {
                this.chatRenderMessages(result);
            });
        }
    }

    /** 渲染消息到chatList */
    /** 渲染消息到chatList */
    private chatRenderMessages(result: any): void {
        if (!result || result.code !== 200 || !result.data || !this.chatList) return;
        let messages = result.data;
        if (messages.length > 50) messages = messages.slice(-50);

        this.chatLastMsgCount = messages.length;

        let items: UIListItemData[] = [];
        let myName = this.chatGetUsername();
        for (let i = 0; i < messages.length; i++) {
            let msg = messages[i];
            let d = new UIListItemData();
            let displayName = msg.character_name || msg.from_user;
            let isSelf = msg.from_user === myName;

            d.msgName = isSelf ? '我' : displayName;

            let channelTag = msg.to_user === 'all' ? '[世界]' : '[私]';
            if (isSelf) {
                d.msgText = msg.content;
            } else {
                d.msgText = channelTag + ' ' + msg.content;
            }
            items.push(d);
        }
        this.chatList.items = items;
    }

    private chatStartPolling(): void {
        if (this.chatPollTimer) clearInterval(this.chatPollTimer);
        this.chatPollTimer = setInterval(() => {
            if (GUI_Main.isChatInputFocus) return;
            this.chatRefreshMessages();
            this.chatLoadOnlineUsers();
        }, 3000);
    }

    private chatStopPolling(): void {
        if (this.chatPollTimer) {
            clearInterval(this.chatPollTimer);
            this.chatPollTimer = 0;
        }
    }

    // =======================================================================
    //  Toast 提示
    // =======================================================================

    private chatShowToast(text: string): void {
        try {
            let old = document.getElementById('mk_chat_toast');
            if (old && old.parentNode) old.parentNode.removeChild(old);
            let toast = document.createElement('div');
            toast.id = 'mk_chat_toast';
            toast.textContent = text;
            toast.style.cssText = 'position:fixed;z-index:100000;top:35%;left:50%;transform:translateX(-50%);padding:10px 24px;background:rgba(0,0,0,0.85);color:#aec6ff;border:1px solid rgba(100,150,255,0.2);border-radius:8px;font-size:14px;font-family:Microsoft YaHei,sans-serif;pointer-events:none;transition:opacity 0.3s;';
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
            }, 2500);
        } catch (e) {}
    }

    /** 析构时清理 */
    public destroy(): void {
        this.chatStopPolling();
        super.destroy();
    }
    private virtualKeyboardSkillInit(): void { }

    private onRender(): void {
        if (!Game.player.data.party) return;
        for (let i = 0; i < Game.player.data.party.length; i++) {
            // -- onRender涓殑璋冪敤鐜板湪浼氱粡杩囩紦瀛樻鏌ワ紝鎬ц兘鏇撮珮 --
            this.refreshActorHP(i);
            this.refreshActorSP(i);
        }
    }
    
    // ... onUIOpen, onUIClose ...
    private onUIOpen(uiID: number): void {
        if (uiID == 12) {
            this.skillBar1.visible = false;
            this.skillBar2.visible = true;
            if (!this.firstRefreshSkill) {
                this.firstRefreshSkill = true;
                this.virtualKeyboardSkillInit();
                this.refreshMainActorSkillBar();
            }
        }
    }
    private onUIClose(uiID: number): void {
        if (uiID == 12) {
            this.skillBar1.visible = true;
            this.skillBar2.visible = false;
        }
    }
    // ...

    refreshActorHP(inPartyIndex: number) {
        if (!ProjectPlayer.ctrlActorBattleModule) return;
        if (inPartyIndex == ProjectPlayer.ctrlActorBattleModule.inPartyIndex) {
            this.refreshMainActorHP();
        } else {
            this.refreshPartyMemberHP(inPartyIndex); // 宸蹭紭鍖?
        }
    }

    refreshActorSP(inPartyIndex: number) {
        if (!ProjectPlayer.ctrlActorBattleModule) return;
        if (inPartyIndex == ProjectPlayer.ctrlActorBattleModule.inPartyIndex) {
            this.refreshMainActorSP();
        } else {
            this.refreshPartyMemberSP(inPartyIndex); // 宸蹭紭鍖?
        }
    }
    
    // ... refreshActorLv, refreshActorExp, refreshActorStatus, refreshAll, refreshMainActor ...
    // ... (杩欎簺鍑芥暟淇濇寔涓嶅彉)
    refreshActorLv(inPartyIndex: number) {
        if (!ProjectPlayer.ctrlActorBattleModule) return;
        if (inPartyIndex == ProjectPlayer.ctrlActorBattleModule.inPartyIndex) {
            this.refreshMainActorLevel();
        } else {
            this.refreshPartyMemberLevel(inPartyIndex);
        }
    }
    refreshActorExp(inPartyIndex: number) {
        if (!ProjectPlayer.ctrlActorBattleModule) return;
        if (inPartyIndex == ProjectPlayer.ctrlActorBattleModule.inPartyIndex) {
            this.refreshMainActorExp();
        }
    }
    refreshActorStatus(inPartyIndex: number) {
        if (!ProjectPlayer.ctrlActorBattleModule) return;
        if (inPartyIndex == ProjectPlayer.ctrlActorBattleModule.inPartyIndex) {
            this.refreshMainActorStatus();
        } else {
            this.refreshPartyMemberStatus(inPartyIndex);
        }
    }
    refreshAll() {
        if (!ProjectPlayer.ctrlActorSceneObject || !ProjectPlayer.ctrlActorBattleModule || ProjectPlayer.ctrlActorBattleModule.inPartyIndex < 0) return;
        this.refreshMainActor();
        this.refreshParty();
    }
    refreshMainActor() {
        this.refreshMainActorHP();
        this.refreshMainActorSP();
        this.refreshMainActorStatus();
        this.refreshMainActorSkillBar();
        this.refreshMainActorLevel();
        this.refreshMainActorExp();
        this.refreshMainActorName();
    }
    refreshMainActorName(): void {
        let actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(ProjectPlayer.ctrlActorBattleModule.inPartyIndex);
        if(!actorDS) return;
        this.mainName.text = actorDS.actor.name.toString();
    }
    refreshMainActorLevel() {
        let actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(ProjectPlayer.ctrlActorBattleModule.inPartyIndex);
        if(!actorDS) return;
        this.mainLevel.text = actorDS.lv.toString();
    }
    refreshMainActorExp() {
        let actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(ProjectPlayer.ctrlActorBattleModule.inPartyIndex);
        if(!actorDS) return;
        if (actorDS.lv >= actorDS.actor.MaxLv) {
            this.EXPSlider.value = 200;
        } else {
            this.EXPSlider.value = actorDS.actor.currentEXP / Game.getLevelUpNeedExp(actorDS.actor, actorDS.lv);
        }
    }
    // ...
    
    refreshMainActorHP() { // 涓绘帶瑙掕壊鐨凥P鍒锋柊閫昏緫宸叉湁缂撳瓨锛屼簣浠ヤ繚鐣?
        let actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(ProjectPlayer.ctrlActorBattleModule.inPartyIndex);
        if(!actorDS) return;
        let actor = actorDS.actor;
        let toSliderValue = actor.hp / actor.MaxHP;
        let toValue = actor.hp;
        if (this.mainHPCache == actor.hp && this.mainMaxHPCache == actor.MaxHP) {
            return;
        }
        this.mainHPCache = actor.hp;
        this.mainMaxHPCache = actor.MaxHP;
        let nowValue = MathUtils.int(this.HPText.text);
        let _this = this;
        let tobj = {
            get value() { return nowValue; },
            set value(v: number) {
                nowValue = v;
                _this.HPText.text = MathUtils.int(v).toString();
            }
        };
        Tween.clearAll(this.HPSlider);
        Tween.clearAll(this.HPText);
        Tween.to(this.HPSlider, { value: toSliderValue }, 300, Ease.strongOut);
        Tween.to(tobj, { value: toValue }, 300, Ease.strongOut);
    }
    
    // ... refreshMainActorSP, refreshMainActorStatus, refreshMainActorSkillBar ... (淇濇寔涓嶅彉)
    refreshMainActorSP() {
        let actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(ProjectPlayer.ctrlActorBattleModule.inPartyIndex);
        if(!actorDS) return;
        let actor = actorDS.actor;
        if (actor.MaxSP == 0) {
            this.SPSlider.value = 0;
        } else {
            this.SPSlider.value = actor.sp / actor.MaxSP;
        }
        this.SPText.text = actor.sp.toString();
    }
    refreshMainActorStatus() {
        let items = [];
        let actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(ProjectPlayer.ctrlActorBattleModule.inPartyIndex);
        if(!actorDS) return;
        let actor = actorDS.actor;
        let status = actor.status;
        for (let i = 0; i < status.length; i++) {
            let d = new ListItem_1028;
            let st = status[i];
            if (!st.icon) continue;
            d.icon = st.icon;
            d.layer = st.currentLayer == 1 ? "" : st.currentLayer.toString();
            d.data = st;
            items.push(d);
        }
        this.stateList.items = items;
        if (this.tipsPostionIndex == 2) {
            this.tipsUI.visible = false;
            this.tipsPostionIndex = null;
        }
    }
    refreshMainActorSkillBar() {
        let uiVirtualKeyboard = GameUI.get(12) as GUI_VirtualKeyboard;
        let actorDS = ProjectPlayer.getPlayerActorDSByInPartyIndex(ProjectPlayer.ctrlActorBattleModule.inPartyIndex);
        if(!actorDS) return;
        let actor = actorDS.actor;
        let activeSkills = GameBattleHelper.getActiveSkills(actor);
        if (uiVirtualKeyboard) {
            for (let i = 0; i < WorldData.showSkillNum; i++) {
                let vIcon: GUI_SkillIcon = this[`vIcon` + (i + 1)];
                if (vIcon) vIcon.setData(activeSkills[i]);
            }
        } else {
            let items = [];
            let maxLen = Math.min(WorldData.showSkillNum, activeSkills.length);
            for (let i = 0; i < maxLen; i++) {
                let d = new ListItem_1030;
                items.push(d);
            }
            this.skillList.items = items;
            for (let i = 0; i < maxLen; i++) {
                let ui = this.skillList.getItemUI(i) as GUI_SkillIcon;
                ui.setData(activeSkills[i]);
            }
            if (this.tipsPostionIndex == 1) {
                this.tipsUI.visible = false;
                this.tipsPostionIndex = null;
            }
        }
    }
    // ...

    /**
     * [浼樺寲] 鍒锋柊闃熶紞鏃讹紝娓呯┖闃熷憳鐨勭姸鎬佺紦瀛?
     */
    refreshParty() {
        if (!Game.player.data.party) return;
        // -- 鏍稿績鏀瑰姩锛氶噸缃紦瀛橈紝鍥犱负闃熶紞鎴愬憳銆侀『搴忕瓑鍙兘宸插彂鐢熷彉鍖?--
        this.partyStatsCache = {};

        let items = [];
        for (let i = 0; i < Game.player.data.party.length; i++) {
            let partyMember = Game.player.data.party[i];
            if (partyMember.sceneObjectIndex == ProjectPlayer.ctrlActorSceneObject.index) continue;
            let d = new ListItem_1024;
            d.HPSlider = 0;
            d.SPSlider = 0;
            items.push(d);
        }
        this.partyList.items = items;
        for (let i = 0; i < Game.player.data.party.length; i++) {
            let partyMember = Game.player.data.party[i];
            if (partyMember.sceneObjectIndex == ProjectPlayer.ctrlActorSceneObject.index) continue;
            this.refreshPartyMember(i);
        }
    }

    refreshPartyMember(inPartyIndex: number) {
        this.refreshPartyMemberName(inPartyIndex);
        this.refreshPartyMemberHP(inPartyIndex); // 宸蹭紭鍖?
        this.refreshPartyMemberSP(inPartyIndex); // 宸蹭紭鍖?
        this.refreshPartyMemberStatus(inPartyIndex);
        this.refreshPartyMemberLevel(inPartyIndex);
    }
    
    // ... refreshPartyMemberName, refreshPartyMemberLevel (淇濇寔涓嶅彉) ...
    refreshPartyMemberName(inPartyIndex: number) {
        let partyMember = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        if (!partyMember) return;
        let ui: GUI_1024 = this.getPartyItemUI(inPartyIndex);
        if (!ui) return;
        let actor: Module_Actor = partyMember.actor;
        ui.actorName.text = actor.name;
    }
    refreshPartyMemberLevel(inPartyIndex: number) {
        let partyMember = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        if (!partyMember) return;
        let ui: GUI_1024 = this.getPartyItemUI(inPartyIndex);
        if (!ui) return;
        let actor: Module_Actor = partyMember.actor;
        ui.levelLabel.text = actor.growUpEnabled ? "Lv." + partyMember.lv.toString() : "";
    }
    // ...
    
    /**
     * [鎬ц兘浼樺寲] 涓洪槦鍛楬P鍒锋柊澧炲姞缂撳瓨妫�鏌?
     */
    refreshPartyMemberHP(inPartyIndex: number) {
        const partyMember = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        if (!partyMember) return;
        
        const actor = partyMember.actor;
        // 鑾峰彇鎴栧垱寤鸿闃熷憳鐨勭紦瀛?
        const cache = this.partyStatsCache[inPartyIndex] || (this.partyStatsCache[inPartyIndex] = { hp: -1, maxHP: -1, sp: -1, maxSP: -1 });

        // 濡傛灉HP鍜孧axHP娌℃湁鍙樺寲锛屽垯鐩存帴杩斿洖锛屼笉鏇存柊UI
        if (cache.hp === actor.hp && cache.maxHP === actor.MaxHP) {
            return;
        }
        // 缂撳瓨鏂板�?
        cache.hp = actor.hp;
        cache.maxHP = actor.MaxHP;

        const ui: GUI_1024 = this.getPartyItemUI(inPartyIndex);
        if (!ui) return;

        ui.HPSlider.value = actor.hp / actor.MaxHP;
    }

    /**
     * [鎬ц兘浼樺寲] 涓洪槦鍛楽P鍒锋柊澧炲姞缂撳瓨妫�鏌?
     */
    refreshPartyMemberSP(inPartyIndex: number) {
        const partyMember = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        if (!partyMember) return;

        const actor = partyMember.actor;
        // 鑾峰彇鎴栧垱寤鸿闃熷憳鐨勭紦瀛?
        const cache = this.partyStatsCache[inPartyIndex] || (this.partyStatsCache[inPartyIndex] = { hp: -1, maxHP: -1, sp: -1, maxSP: -1 });

        // 濡傛灉SP鍜孧axSP娌℃湁鍙樺寲锛屽垯鐩存帴杩斿洖锛屼笉鏇存柊UI
        if (cache.sp === actor.sp && cache.maxSP === actor.MaxSP) {
            return;
        }
        // 缂撳瓨鏂板�?
        cache.sp = actor.sp;
        cache.maxSP = actor.MaxSP;

        const ui: GUI_1024 = this.getPartyItemUI(inPartyIndex);
        if (!ui) return;
        
        if (actor.MaxSP == 0) {
            ui.SPSlider.value = 0;
        } else {
            ui.SPSlider.value = actor.sp / actor.MaxSP;
        }
    }
    
    // ... refreshPartyMemberStatus, getPartyItemUI, onSkillChange, onStatusChange ... (淇濇寔涓嶅彉)
    refreshPartyMemberStatus(inPartyIndex: number) {
        let partyMember = ProjectPlayer.getPlayerActorDSByInPartyIndex(inPartyIndex);
        if (!partyMember) return;
        let ui: GUI_1024 = this.getPartyItemUI(inPartyIndex);
        if (!ui) return;
        let actor: Module_Actor = partyMember.actor;
        let items = [];
        let status = actor.status;
        for (let i = 0; i < status.length; i++) {
            let d = new ListItem_1029;
            let st = status[i];
            if (!st.icon) continue;
            d.icon = st.icon;
            d.layer = st.currentLayer == 1 ? "" : st.currentLayer.toString();
            d.data = st;
            items.push(d);
        }
        ui.stateList.items = items;
    }
    private getPartyItemUI(inPartyIndex: number): GUI_1024 {
        for (let i = 0, s = 0; i < Game.player.data.party.length; i++) {
            let partyMember = Game.player.data.party[i];
            if (partyMember.sceneObjectIndex == ProjectPlayer.ctrlActorSceneObject.index) continue;
            if (i == inPartyIndex) return this.partyList.getItemUI(s) as any;
            s++;
        }
        return null;
    }
    private onSkillChange(inPartyIndex: number, actorDS: DataStructure_inPartyActor, skill: Module_Skill) {
        if (ProjectPlayer.ctrlActorBattleModule.inPartyIndex == inPartyIndex) this.refreshMainActorSkillBar();
    }
    private onStatusChange(battler: ProjectClientSceneObject) {
        let battleModule = battler.getModule(6) as SoModule_Battler;
        if (battleModule.inPartyIndex >= 0) this.refreshActorStatus(battleModule.inPartyIndex);
    }
    private onEXPChange(inPartyIndex: number): void {
        this.refreshActorExp(inPartyIndex);
    }
    private onLevelChange(inPartyIndex: number): void {
        this.refreshActorLv(inPartyIndex);
    }
    private onCreateSkillItem(ui: GUI_SkillIcon, data: ListItem_1030, index: number): void {
        ui.iconBg.on(EventObject.MOUSE_OVER, this, this.onSkillItemMouseOver, [ui]);
        ui.iconBg.on(EventObject.MOUSE_OUT, this, this.onSkillItemMouseOut, [ui]);
        ui.iconBg.on(EventObject.CLICK, this, this.onSkillClick, [ui]);
    }
    private onSkillItemMouseOver(ui: GUI_SkillIcon) {
        let skill = ui.skill;
        if (skill) {
            this.tipsUI.descName.text = skill.name + (skill.level > 1 ? ` Lv.${skill.level}` : ``);
            this.tipsUI.descText.text = GUI_Manager.skillDesc(skill, ProjectPlayer.ctrlActorBattleModule.actor);
            this.tipsUI.visible = true;
            let tipsRect = this.tipsUI.getBounds();
            this.tipsUI.x = Math.min(Math.floor(this.mouseX - tipsRect.width / 2), stage.width - tipsRect.width - 10);
            this.tipsUI.y = this.mouseY - tipsRect.height - 50;
            this.tipsPostionIndex = 1;
        }
    }
    private onSkillItemMouseOut() {
        this.tipsUI.visible = false;
        this.tipsPostionIndex = null;
    }
    private onSkillClick(ui: GUI_SkillIcon) {
        GameBattleAction.useSkill(ProjectPlayer.ctrlActorSceneObject, ui.skill);
    }
    private onCreateMainActorStatusItem(ui: GUI_1028, data: ListItem_1028, index: number): void {
        ui.icon.on(EventObject.MOUSE_OVER, this, this.onActorStatusItemMouseOver, [data.data]);
        ui.icon.on(EventObject.MOUSE_OUT, this, this.onActorStatusItemMouseOut);
    }
    private onActorStatusItemMouseOver(status: Module_Status) {
        this.tipsUI.descName.text = status.name;
        this.tipsUI.descText.text = status.intro;
        this.tipsUI.visible = true;
        let tipsRect = this.tipsUI.getBounds();
        this.tipsUI.x = Math.max(Math.min(this.mouseX + 5, stage.width - tipsRect.width), 0);
        this.tipsUI.y = Math.max(Math.min(this.mouseY + 10, stage.height - tipsRect.height), 0);
        this.tipsPostionIndex = 2;
    }
    private onActorStatusItemMouseOut() {
        this.tipsUI.visible = false;
        this.tipsPostionIndex = null;
    }
    // ...
}




