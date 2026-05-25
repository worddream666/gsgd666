/**
 * GUI_Main.ts (v31 - 绉婚櫎澶ч檰鏃ュ織绯荤粺)
 *
 * 1. [绉婚櫎澶ч檰鏃ュ織绯荤粺] 绉绘Ы浜哹attle绯荤粺鏃ュ織锛屽寘鎷琈ISS銆両TEM_GET绛?
 *    浠呯淮鎸佸疄璺典娇?者?1. [浼樺寲] 闃熷崟娆″惊鐄€澶勭悊闃熷崟娆″惊鐄€
 * 2. [绉婚櫎澶ч檰鏃ュ織绯荤粺] 浠呯淮鎴忓硅薄鍚嶇О鍜屽硅薄韬?界面
 * 3. [淇濆崌] 绉婚櫎鏃ュ織绯荤粺鍚庣殑涓嶅繀瑕佸崰鐢ㄨ祫婧
 */

class GUI_Main extends GUI_18 {
    
    // -- 闈欐€佹爣蹇?--
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
    
    // -- 系统公告组件（固定在聊天列表顶部） --
    private noticeContainer: UIRoot;
    private noticeText: UIString;
    private noticeTimer: number = 0;
    private currentNoticeIndex: number = 0;
    private noticeList: any[] = [];
    
    // -- 在线人数更新控制 --
    private lastOnlineUpdateTime: number = 0;
    private onlineUpdateInterval: number = 5000; // 5秒更新一次在线人数

    // =======================================================================
    //  v30 鎬ц兘浼樺寲锛氶槦鍛樼姸鎬佺紦瀛?銆戙€戙€?
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

        // 启动全局心跳包（不依赖于聊天组件是否存在）
        // 只要有token，每60秒发送一次心跳包保持在线状态
        setInterval(() => {
            let token = this.chatGetToken();
            let username = this.chatGetUsername();
            if (token && username) {
                this.chatApiRequest('updateUserStatus', { token: token, username: username }, null);
            }
        }, 60000);

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

        // -- 消息列表点击：点名字私聊 --
        if (this.chatList) {
            this.chatList.on(UIList.ITEM_CLICK, this, this.onChatListItemClick);
            this.chatList.on(UIList.ITEM_CREATE, this, this.onChatListItemCreate);
            // 启用滚动条+滚轮：限制显示区域、垂直滚动条
            this.chatList.enabledLimitView = true;
            this.chatList.scrollShowType = 3; // 3=仅竖滚动条
            this.chatList.slowmotionType = 1; // 1=始终启用拖拽滚动（保持滚动条可拖拽）
            this.chatList.mouseEnabled = true; // 启用鼠标交互
            this.chatList.mouseChildren = true; // 允许子元素接收鼠标事件
        }

        // 设置父容器不拦截鼠标事件，确保子组件可以正常交互
        if (this.chatContainer) {
            this.chatContainer.mouseEnabled = true;
            this.chatContainer.mouseChildren = true;
            
            // 创建固定位置的系统公告组件
            this.createFixedNoticeContainer();
        }

        this.chatStartPolling();
        this.chatUpdateOnlineStatus();
        this.chatLoadOnlineUsers();
        
        // 启动公告轮询
        this.startNoticePolling();
        
        // 监听登录状态变化（来自22-creator的通知）
        window.addEventListener('message', (event: MessageEvent) => {
            if (event.data && event.data.type === 'mk_reconnected') {
                // 登录状态更新，刷新在线人数和消息
                setTimeout(() => {
                    this.chatLoadOnlineUsers();
                    this.chatRefreshMessages();
                }, 300);
            }
        });
        
        // 监听读档完成事件（来自GUI_SaveFileManager）
        window.addEventListener('mk_game_loaded', () => {
            // 读档完成后重新加载聊天数据
            setTimeout(() => {
                this.chatLoadOnlineUsers();
                this.chatRefreshMessages();
            }, 500);
        });
        
        // 监听localStorage变化（兼容其他登录方式）
        this.setupLocalStorageWatcher();
    }

    /** 点击聊天消息列表项：点击玩家名字触发私聊 */
    private onChatListItemClick(index: number): void {
        if (!this.chatList) return;
        let itemData = this.chatList.selectedItem as ListItem_1033;
        if (!itemData || !itemData.data) return;
        let data = itemData.data as { username: string; characterName: string };
        let fromUser = data.username;
        let characterName = data.characterName;
        // 不能和自己私聊
        let myName = this.chatGetUsername();
        if (fromUser === myName) {
            this.chatShowToast('不能和自己私聊');
            return;
        }
        this.chatSelectUser(fromUser, characterName);
    }

    /** ITEM_CREATE：创建消息项时自动调整样式和尺寸 */
    private onChatListItemCreate(ui: UIRoot, data: UIListItemData, index: number): void {
        let itemUI = ui as GUI_1033;
        let itemData = data as ListItem_1033;
        if (!itemUI || !itemData) return;

        // ==================== 精确尺寸配置（根据用户要求）====================
        // 名字配置：紧凑布局，行高19px，不换行
        const NAME_CHAR_W = 15;     // 每个汉字宽度（紧凑）
        const NAME_MAX_W = 180;     // 名字最大宽度
        const NAME_MIN_W = 50;      // 名字最小宽度
        
        // 消息配置：50字上限，3行显示，宽度309px，行高19px
        const TEXT_MAX_W = 309;     // 消息最大宽度
        const TEXT_CHAR_W = 18.5;   // 309px / 16.7字 ≈ 18.5px/字（每行约16-17字）
        const LINE_H = 19;          // 行高19px
        
        // 布局配置
        const LIST_W = 448;         // chatList总宽度
        const PADDING = 3;          // 左边内边距（减小）
        const GAP = 0;              // 名字和消息之间的间距（紧密贴合）

        // 获取额外数据
        let itemExtraData = itemData.data || {};
        let isSystemNotice = itemExtraData.isSystemNotice || false;
        let noticeType = itemExtraData.noticeType || '';
        let noticeColor = itemExtraData.noticeColor || '#ff0000';

        // ==================== msgName：名字组件布局 ====================
        let nameLen = itemData.msgName.length;
        
        // 计算名字宽度（自适应）
        let nameWidth = nameLen * NAME_CHAR_W;
        nameWidth = Math.max(NAME_MIN_W, Math.min(nameWidth, NAME_MAX_W));
        
        // 设置名字组件属性
        itemUI.msgName.bold = true;
        itemUI.msgName.stroke = 2;
        itemUI.msgName.strokeColor = '#000000';
        itemUI.msgName.width = nameWidth;
        itemUI.msgName.height = LINE_H;
        itemUI.msgName.x = PADDING;  // 名字从左边内边距开始
        itemUI.msgName.y = 0;        // 垂直居中对齐
        itemUI.msgName.wordWrap = false;  // 名字不换行
        
        // 设置名字颜色
        if (isSystemNotice) {
            itemUI.msgName.color = (noticeType === 'monster_defeat') ? '#FFD700' : noticeColor;
        } else {
            itemUI.msgName.color = '#00ff00'; // 绿色玩家名
        }

        // ==================== msgText：消息文本组件布局 ====================
        // 消息x坐标 = 名字起始x + 名字宽度 + 间距
        let msgTextX = itemUI.msgName.x + itemUI.msgName.width + GAP;
        
        // 消息可用宽度 = 列表总宽 - 消息x坐标 - 右边距
        let availableTextWidth = LIST_W - msgTextX - PADDING;
        availableTextWidth = Math.min(availableTextWidth, TEXT_MAX_W);
        
        itemUI.msgText.x = msgTextX;
        itemUI.msgText.y = 0;        // 垂直对齐
        
        let textContent = itemData.msgText || '';
        
        // 计算消息宽度（根据内容长度自适应）
        let textWidth = Math.min(textContent.length * TEXT_CHAR_W, availableTextWidth);
        textWidth = Math.max(50, textWidth); // 最小宽度50px
        
        itemUI.msgText.width = textWidth;
        itemUI.msgText.wordWrap = true;
        
        // 计算换行后的行数和高度
        // 每行可显示的字符数 = 消息宽度 / 字符宽度
        let charsPerLine = Math.floor(textWidth / TEXT_CHAR_W);
        charsPerLine = Math.max(1, charsPerLine);
        let lines = Math.max(1, Math.ceil(textContent.length / charsPerLine));
        let textHeight = lines * LINE_H;
        
        itemUI.msgText.height = textHeight;
        
        // 设置消息颜色
        if (isSystemNotice) {
            itemUI.msgText.color = (noticeType === 'monster_defeat') ? '#FFD700' : noticeColor;
        } else {
            itemUI.msgText.color = '#ffffff'; // 白色消息
        }
        
        // 设置消息描边
        itemUI.msgText.stroke = 1;
        itemUI.msgText.strokeColor = '#000000';
        
        // ==================== 调整整个列表项的高度 ====================
        let itemHeight = Math.max(LINE_H, textHeight);
        itemUI.height = itemHeight;
        
        console.log('[ChatLayout] 名字宽度:', nameWidth, '消息x:', msgTextX, '消息宽度:', textWidth, '行数:', lines, '总高度:', itemHeight);
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
        if (this.playerList) this.playerList.visible = false;
        this.chatClearMessages();
        this.chatRefreshMessages();
    }

    /** 切换到私聊 */
    private onChatTabPrivate(): void {
        this.chatCurrentTab = 'private';
        if (this.playerList) this.playerList.visible = true;
        this.chatClearMessages();
        this.chatRefreshMessages();
    }

    /** 清空消息列表 */
    private chatClearMessages(): void {
        if (this.chatList) this.chatList.items = [];
    }

    /** 选择私聊对象 */
    private chatSelectUser(username: string, characterName?: string): void {
        this.chatTargetUser = username;
        this.chatCurrentTab = 'private';
        if (this.playerList) this.playerList.visible = true;
        this.chatClearMessages();
        // 显示角色名而不是账号
        let displayName = characterName || username;
        this.chatShowToast('正在与 ' + displayName + ' 私聊');
        this.chatRefreshMessages();
    }

    // =======================================================================
    //  API 通信
    // =======================================================================

    /** 获取用户名（多渠道获取） */
    private chatGetUsername(): string {
        // 1. 游戏变量 14004
        try {
            let un = Game.player.variable.getString(14004);
            if (un && un !== 'undefined' && un !== 'null') return un;
        } catch (e) {}
        // 2. localStorage（由登录流程保存）
        try {
            let ls = localStorage.getItem('mk_username');
            if (ls && ls !== 'undefined' && ls !== 'null') return ls;
        } catch (e) {}
        // 3. sessionStorage
        try {
            let ss = sessionStorage.getItem('game_username');
            if (ss && ss !== 'undefined' && ss !== 'null') return ss;
        } catch (e) {}
        // 4. 游戏变量 14002（角色名，作为最后手段）
        try {
            let cn = Game.player.variable.getString(14002);
            if (cn && cn !== 'undefined' && cn !== 'null') return cn;
        } catch (e) {}
        console.warn('[Chat] chatGetUsername: 无法获取用户名');
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
                        try { if (callback) callback(JSON.parse(xhr.responseText)); }
                        catch (e) { if (callback) callback(null); }
                    } else { if (callback) callback(null); }
                }
            };
            xhr.onerror = () => { clearTimeout(timeout); if (callback) callback(null); };
            xhr.send(JSON.stringify(data));
        } catch (e) { if (callback) callback(null); }
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
        if (!token) {
            // 未登录时尝试获取在线人数（不包含玩家列表）
            this.chatApiRequest('getStats', {}, (result: any) => {
                console.log('[Online] getStats result:', result);
                if (result && result.code === 200 && result.data) {
                    let onlineCount = result.data.displayOnlineUsers !== undefined ? result.data.displayOnlineUsers : (result.data.onlineUsers || 0);
                    console.log('[Online] chatOnlineCount component:', this.chatOnlineCount);
                    if (this.chatOnlineCount) {
                        this.chatOnlineCount.text = '在线: ' + onlineCount + '人';
                        console.log('[Online] 设置在线人数:', onlineCount);
                    } else {
                        console.warn('[Online] chatOnlineCount 组件未初始化');
                    }
                } else {
                    if (this.chatOnlineCount) {
                        this.chatOnlineCount.text = '在线: --';
                    }
                    console.warn('[Online] 获取在线人数失败:', result);
                }
            });
            if (this.playerList) {
                this.playerList.items = [];
            }
            return;
        }
        this.chatApiRequest('getChatUsers', { token: token }, (result: any) => {
            if (!result || result.code !== 200 || !result.data) return;
            
            // 服务器返回的数据结构是 { users: [...], displayOnlineCount: N }
            let responseData = result.data;
            let users = responseData.users || [];
            let myName = this.chatGetUsername();
            let onlineUsers = users.filter((u: any) => u.online && u.username !== myName);
            
            // 使用API返回的显示在线人数（支持虚拟在线）
            let displayOnlineCount = onlineUsers.length;
            if (responseData.displayOnlineCount !== undefined) {
                displayOnlineCount = responseData.displayOnlineCount;
            } else if (responseData.displayOnlineUsers !== undefined) {
                displayOnlineCount = responseData.displayOnlineUsers;
            }
            
            console.log('[Online] 登录状态 - 显示在线人数:', displayOnlineCount);
            if (this.chatOnlineCount) {
                this.chatOnlineCount.text = '在线: ' + displayOnlineCount + '人';
            } else {
                console.warn('[Online] chatOnlineCount 组件未初始化');
            }
            
            if (this.playerList) {
                let items: ListItem_1034[] = [];
                onlineUsers.forEach((u: any) => {
                    let d = new ListItem_1034();
                    d.playerName = u.username;
                    d.playerStatus = '在线';
                    // 名字宽度自适应
                    let nameW = Math.max(40, Math.min(u.username.length * 17.4, 122));
                    d.customSize = true;
                    d.width = 118 + nameW;
                    d.height = 20;
                    items.push(d);
                });
                this.playerList.items = items;
                // 调整playerName宽度
                for (let j = 0; j < items.length; j++) {
                    let playerUI = this.playerList.getItemUI(j) as GUI_1034;
                    if (playerUI) {
                        playerUI.playerName.width = Math.max(40, Math.min(items[j].playerName.length * 17.4, 122));
                        playerUI.playerName.height = 19;
                    }
                }
            }
        });
    }

    // =======================================================================
    //  系统公告 - 使用独立的GUI_SystemNotice组件显示（在initSystemNotice中初始化）
    // =======================================================================

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
    private chatRenderMessages(result: any): void {
        if (!result || result.code !== 200 || !result.data || !this.chatList) return;
        let messages = result.data;
        if (messages.length > 50) messages = messages.slice(-50);

        this.chatLastMsgCount = messages.length;

        let items: ListItem_1033[] = [];
        let myName = this.chatGetUsername();

        // 尺寸常量：行高20px，名字宽度自适应
        let NAME_CHAR_W = 16;      // 每个汉字宽度
        let NAME_MAX_W = 180;      // 名字最大宽度（包含频道前缀）
        let NAME_MIN_W = 60;       // 名字最小宽度
        let TEXT_CHAR_W = 15;      // 消息文字宽度
        let TEXT_MAX_W = 340;      // 消息最大宽度
        let TEXT_MIN_W = 80;       // 消息最小宽度
        let LINE_H = 20;           // 行高
        let GAP = 8;               // 名字和消息之间的间距
        let PADDING = 5;           // 左右内边距

        // ============ 步骤1：渲染系统公告（放在最顶部） ============
        // 从服务器获取公告并显示在聊天列表顶部
        this.chatApiRequest('getSystemNotices', {}, (noticeResult: any) => {
            if (noticeResult && noticeResult.code === 200 && noticeResult.data) {
                let notices = noticeResult.data;
                notices.forEach((notice: any) => {
                    if (notice.type === 'monster_defeat') {
                        // 怪物击败公告
                        let d = new ListItem_1033();
                        d.msgName = '[系统]';
                        let itemsText = '';
                        if (notice.dropped_items && notice.dropped_items.length > 0) {
                            let itemList = notice.dropped_items.map((item: any) => {
                                return '【' + item.itemName + (item.num > 1 ? 'x' + item.num : '') + '】';
                            });
                            itemsText = itemList.join('');
                        }
                        d.msgText = notice.player_name + ' 经过重重困难，终于打败了 ' + notice.monster_name + '，并获得' + itemsText + '，正在某个角落偷着乐呢！！！';
                        d.customSize = true;
                        d.width = 448;
                        d.height = LINE_H + 4;
                        // 标记为系统公告
                        if (!d.data) d.data = {};
                        d.data.isSystemNotice = true;
                        d.data.noticeType = 'monster_defeat';
                        items.push(d);
                    } else if (notice.content) {
                        // 普通系统公告
                        let d = new ListItem_1033();
                        d.msgName = '[公告]';
                        d.msgText = notice.content;
                        d.customSize = true;
                        d.width = 448;
                        d.height = LINE_H + 4;
                        // 标记为系统公告
                        if (!d.data) d.data = {};
                        d.data.isSystemNotice = true;
                        d.data.noticeType = 'normal';
                        d.data.noticeColor = notice.color || '#ff0000';
                        items.push(d);
                    }
                });
            }

            // ============ 步骤2：渲染聊天消息 ============
            for (let i = 0; i < messages.length; i++) {
                let msg = messages[i];
                let d = new ListItem_1033();
                let displayName = msg.character_name || msg.from_user;
                let isSelf = msg.from_user === myName;

                // 频道前缀放在玩家名字左边
                let channelTag = '';
                if (msg.to_user === 'all') {
                    channelTag = '[世界]';
                } else if (msg.to_user === 'guild') {
                    channelTag = '[公会]';
                } else if (msg.to_user === 'team') {
                    channelTag = '[队伍]';
                } else {
                    channelTag = '[私]';
                }

                // 组合名字（频道前缀 + [玩家名]:）
                let fullName = channelTag + '[' + displayName + ']:';
                d.msgName = fullName;
                d.msgText = msg.content || '';

                // 存储额外数据供后续使用
                d.data = {
                    username: msg.from_user,
                    characterName: displayName,
                    isSelf: isSelf,
                    channel: msg.to_user,
                    isSystemNotice: false
                };

                // ============ 智能尺寸计算 ============
                
                // 1. 计算名字宽度（自适应）
                let nameW = fullName.length * NAME_CHAR_W;
                nameW = Math.max(NAME_MIN_W, Math.min(nameW, NAME_MAX_W));

                // 2. 计算消息宽度（自适应）
                let textContent = d.msgText || '';
                let textW = textContent.length * TEXT_CHAR_W;
                textW = Math.max(TEXT_MIN_W, Math.min(textW, TEXT_MAX_W));

                // 3. 计算消息高度（支持换行）
                // 每行最多显示的字符数
                let maxCharsPerLine = Math.floor(TEXT_MAX_W / TEXT_CHAR_W);
                let lines = Math.max(1, Math.ceil(textContent.length / maxCharsPerLine));
                let textH = lines * LINE_H;

                // 4. 计算总宽度和高度
                let totalWidth = PADDING + nameW + GAP + textW + PADDING;
                let totalHeight = Math.max(LINE_H + 4, textH + 4);

                // 确保最小宽度
                totalWidth = Math.max(totalWidth, 448);

                d.customSize = true;
                d.width = totalWidth;
                d.height = totalHeight;

                items.push(d);
            }

            // ============ 步骤3：更新列表并滚动 ============
            this.chatList.items = items;

            // 自动滚动到底部（最新消息）
            let lastIdx = items.length - 1;
            if (lastIdx >= 0) {
                this.chatList.scrollTo(lastIdx, true);
            }
            // 刷新滚动条
            this.chatList.refresh();
        });
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
    
    /** 设置localStorage监听器，当token变化时自动刷新聊天状态 */
    private setupLocalStorageWatcher(): void {
        let lastToken = this.chatGetToken();
        setInterval(() => {
            let currentToken = this.chatGetToken();
            if (currentToken && currentToken !== lastToken) {
                lastToken = currentToken;
                // Token发生变化（登录成功），刷新在线人数和消息
                this.chatLoadOnlineUsers();
                this.chatRefreshMessages();
            }
        }, 1000);
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
        this.chatStopNoticePolling();
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
    
    // =======================================================================
    //  系统公告 - 固定位置显示
    // =======================================================================
    
    /** 创建固定位置的公告容器 */
    private createFixedNoticeContainer(): void {
        if (!this.chatContainer) return;
        
        // 创建公告容器（背景）
        this.noticeContainer = new UIRoot();
        this.noticeContainer.width = this.chatContainer.width - 10;
        this.noticeContainer.height = 40;
        this.noticeContainer.x = 5;
        this.noticeContainer.y = 5;
        this.noticeContainer.zOrder = 100; // 确保在最上层
        
        // 创建半透明背景
        let noticeBg = new UIImage();
        noticeBg.color = 'rgba(0, 0, 0, 0.8)';
        noticeBg.width = this.noticeContainer.width;
        noticeBg.height = this.noticeContainer.height;
        this.noticeContainer.addChild(noticeBg);
        
        // 创建公告文本
        this.noticeText = new UIString();
        this.noticeText.fontSize = 14;
        this.noticeText.color = '#FFD700'; // 金色
        this.noticeText.stroke = 2;
        this.noticeText.strokeColor = '#000000';
        this.noticeText.width = this.noticeContainer.width - 20;
        this.noticeText.height = this.noticeContainer.height;
        this.noticeText.x = 10;
        this.noticeText.y = 5;
        this.noticeText.wordWrap = false;
        this.noticeContainer.addChild(this.noticeText);
        
        // 将公告容器添加到聊天容器中（放在聊天列表上方）
        this.chatContainer.addChild(this.noticeContainer);
        
        // 调整聊天列表位置，留出公告空间
        if (this.chatList) {
            this.chatList.y = this.noticeContainer.height + 10;
            this.chatList.height = Math.max(100, (this.chatContainer.height || 200) - this.noticeContainer.height - 60);
        }
    }
    
    /** 启动公告轮询 */
    private startNoticePolling(): void {
        if (this.noticeTimer) clearInterval(this.noticeTimer);
        
        // 先加载一次公告
        this.loadNotices();
        
        // 每10秒更新一次公告列表
        this.noticeTimer = setInterval(() => {
            this.loadNotices();
        }, 10000);
    }
    
    /** 停止公告轮询 */
    private chatStopNoticePolling(): void {
        if (this.noticeTimer) {
            clearInterval(this.noticeTimer);
            this.noticeTimer = 0;
        }
    }
    
    /** 加载公告 */
    private loadNotices(): void {
        this.chatApiRequest('getSystemNotices', {}, (result: any) => {
            if (result && result.code === 200 && result.data) {
                this.noticeList = result.data;
                this.displayNextNotice();
            }
        });
    }
    
    /** 显示下一条公告 */
    private displayNextNotice(): void {
        if (!this.noticeText || this.noticeList.length === 0) {
            this.hideNotice();
            return;
        }
        
        // 循环显示公告
        let notice = this.noticeList[this.currentNoticeIndex];
        if (notice && notice.content) {
            this.noticeText.text = notice.content;
            this.noticeText.color = notice.color || '#FFD700';
            this.noticeContainer.visible = true;
            
            // 3秒后显示下一条
            setTimeout(() => {
                this.currentNoticeIndex = (this.currentNoticeIndex + 1) % this.noticeList.length;
                this.displayNextNotice();
            }, (notice.duration || 4) * 1000);
        } else {
            this.hideNotice();
        }
    }
    
    /** 隐藏公告 */
    private hideNotice(): void {
        if (this.noticeContainer) {
            this.noticeContainer.visible = false;
        }
    }
    
    // =======================================================================
    //  在线人数更新优化
    // =======================================================================
    
    /** 优化后的在线人数加载方法 */
    private chatLoadOnlineUsers(): void {
        let now = Date.now();
        
        // 控制更新频率：至少间隔指定时间才能更新
        if (now - this.lastOnlineUpdateTime < this.onlineUpdateInterval) {
            return;
        }
        this.lastOnlineUpdateTime = now;
        
        let token = this.chatGetToken();
        if (!token) {
            this.chatApiRequest('getStats', {}, (result: any) => {
                console.log('[Online] getStats result:', result);
                if (result && result.code === 200 && result.data) {
                    let onlineCount = result.data.displayOnlineUsers !== undefined ? result.data.displayOnlineUsers : (result.data.onlineUsers || 0);
                    if (this.chatOnlineCount) {
                        this.chatOnlineCount.text = '在线: ' + onlineCount + '人';
                    }
                }
            });
            return;
        }
        this.chatApiRequest('getChatUsers', { token: token }, (result: any) => {
            if (!result || result.code !== 200 || !result.data) return;
            let responseData = result.data;
            let users = responseData.users || [];
            let displayOnlineCount = responseData.displayOnlineCount !== undefined ? responseData.displayOnlineCount : users.length;
            if (this.chatOnlineCount) {
                this.chatOnlineCount.text = '在线: ' + displayOnlineCount + '人';
            }
        });
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
     * [鎬ц兘浼樺寲] 涓洪槦鍛楬P鍒锋柊澧炲姞缂撳瓨妫€鏌?
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
        // 缂撳瓨鏂板€?
        cache.hp = actor.hp;
        cache.maxHP = actor.MaxHP;

        const ui: GUI_1024 = this.getPartyItemUI(inPartyIndex);
        if (!ui) return;

        ui.HPSlider.value = actor.hp / actor.MaxHP;
    }

    /**
     * [鎬ц兘浼樺寲] 涓洪槦鍛楽P鍒锋柊澧炲姞缂撳瓨妫€鏌?
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
        // 缂撳瓨鏂板€?
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




