/**
 * 22-角色创建界面绑定脚本
 *
 * 功能：监听界面22创建，绑定 namestar 按钮到服务器API
 *       读取 crenam 输入框名称，调用 fwq/api.php 创建角色
 *       未登录时弹出 iframe 重新登录页面
 *       失败时调用界面24显示错误提示（yes按钮关闭）
 *
 * 游戏变量：
 *   14002 - 角色名称
 *   14003 - 登录Token
 *   14004 - 用户名
 *
 * 对接接口（fwq/api.php）：
 *   action=checkName        - 检查角色名是否可用（服务器确保唯一性）
 *   action=createCharacter  - 创建角色
 *
 * 中途登录页：http://47.96.92.202:8848/fwq/reconnect.html
 */

module GUI22Creator {
    'use strict';

    const API_BASE = 'http://47.96.92.202:8848/fwq/api.php';
    const RECONNECT_URL = 'http://47.96.92.202:8848/fwq/reconnect.html';
    const VAR_CHAR_NAME = 14002;
    const VAR_TOKEN = 14003;
    const VAR_USERNAME = 14004;

    let _ui: GUI_22 = null;
    let _isProcessing = false;
    /** 当前等待创建的角色名（重新登录后使用） */
    let _pendingName: string = '';
    /** 是否正在显示重新登录页面 */
    let _showingReconnect: boolean = false;
    /** 保存原始GameUI.show引用 */
    let _origGameUIShow: Function = null;

    // ================================================================
    //  初始化
    // ================================================================

    export function init(): void {
        _origGameUIShow = GameUI.show;
        EventUtils.addEventListenerFunction(GameUI, GameUI.EVENT_CREATE_UI, onUICreate);
        window.addEventListener('message', onReconnectMessage);
        let existing = GameUI.get(22) as GUI_22;
        if (existing) {
            onUICreate(existing);
        }
        console.log('[22-Creator] 初始化完成，等待界面22打开');
    }

    // ================================================================
    //  绑定UI22
    // ================================================================

    function onUICreate(ui: GUI_BASE): void {
        if (ui instanceof GUI_22) {
            _ui = ui as GUI_22;
            bindUI();
        }
    }

    function bindUI(): void {
        if (!_ui) return;

        let token = localStorage.getItem('mk_token') || '';
        let existingCharName = localStorage.getItem('mk_charactername') || '';
        
        // 如果没有token，说明还没登录，显示创建角色界面
        if (!token) {
            showCreateCharacterMode();
            return;
        }
        
        // 有token但没有角色名，显示创建角色界面
        if (!existingCharName || existingCharName === '' || existingCharName === 'undefined' || existingCharName === 'null') {
            showCreateCharacterMode();
            return;
        }
        
        // 有token和角色名，验证当前账号是否有这个角色
        apiRequest('checkCharacter', { token: token })
            .then((result: any) => {
                if (result.code === 200 && result.data && result.data.hasCharacter) {
                    // 当前账号确实有角色
                    let charName = result.data.characterName || existingCharName;
                    
                    // 检查本地是否有匹配的存档
                    let hasLocalSave = false;
                    let localCharName = '';
                    
                    for (let i = 0; i < localStorage.length; i++) {
                        let key = localStorage.key(i);
                        if (key && key.indexOf('SinglePlayerGame_SaveData_') === 0) {
                            try {
                                let saveDataStr = localStorage.getItem(key);
                                if (saveDataStr) {
                                    let saveData = JSON.parse(saveDataStr);
                                    if (saveData && saveData.playerData && saveData.playerData.name) {
                                        localCharName = saveData.playerData.name;
                                        hasLocalSave = true;
                                        break;
                                    }
                                }
                            } catch (e) {
                                // 忽略解析错误
                            }
                        }
                    }
                    
                    // 如果本地有存档且角色名匹配，跳转读档界面
                    if (hasLocalSave && localCharName === charName) {
                        console.log('[22-Creator] 账号已有角色且本地有匹配存档，角色名:', charName, '跳转读档界面');
                        openSaveFileInterface(charName, token);
                    } else if (hasLocalSave && localCharName !== charName) {
                        // 有存档但角色名不匹配，显示创建角色界面重新输入名字
                        console.log('[22-Creator] 本地存档角色名与服务器角色名不匹配，显示创建角色界面');
                        localStorage.removeItem('mk_charactername');
                        showCreateCharacterMode();
                    } else {
                        // 没有本地存档，显示22号界面并填入服务器角色名，让用户点击开始游戏
                        console.log('[22-Creator] 账号已有角色但无本地存档，显示界面并填入角色名:', charName);
                        showEnterGameWithName(charName);
                    }
                } else {
                    // 当前账号没有角色，显示创建角色界面
                    localStorage.removeItem('mk_charactername');
                    showCreateCharacterMode();
                }
            })
            .catch(() => {
                showCreateCharacterMode();
            });
    }
    
    /** 检查本地是否有指定角色名的存档 */
    function hasLocalSaveFile(charName: string): boolean {
        if (!charName) return false;
        
        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            if (key && key.indexOf('SinglePlayerGame_SaveData_') === 0) {
                try {
                    let saveDataStr = localStorage.getItem(key);
                    if (saveDataStr) {
                        let saveData = JSON.parse(saveDataStr);
                        if (saveData && saveData.playerData && saveData.playerData.name === charName) {
                            return true;
                        }
                    }
                } catch (e) {
                    // 忽略解析错误
                }
            }
        }
        return false;
    }
    
    /** 直接打开存档界面（读档界面） */
    function openSaveFileInterface(charName: string, token: string): void {
        try {
            // 检查本地是否有存档数据
            let hasLocalSave = hasLocalSaveFile(charName);
            let localCharName = charName;
            
            // 设置token到存档管理器
            if (typeof GUI_SaveFileManager !== 'undefined') {
                if (!GUI_SaveFileManager.currentToken) {
                    GUI_SaveFileManager.setUserToken(token);
                }
            }
            
            // 隐藏当前界面
            GameUI.hide(22);
            
            // 延迟打开存档界面
            setTimeout(() => {
                try {
                    // 显示读档界面（界面 ID=2）
                    if (typeof GUI_Manager !== 'undefined' && GUI_Manager.open) {
                        GUI_Manager.open(2);
                    } else if (typeof GameUI !== 'undefined' && GameUI.show) {
                        GameUI.show(2);
                    }
                    console.log('[22-Creator] 成功打开存档界面');
                } catch (e) {
                    console.warn('[22-Creator] 打开存档界面失败:', e);
                    // 失败则直接启动游戏
                    startGameDirectly(token, localStorage.getItem('mk_username') || '', charName);
                }
            }, 300);
            
        } catch (e) {
            console.warn('[22-Creator] 打开存档界面出错:', e);
            startGameDirectly(token, localStorage.getItem('mk_username') || '', charName);
        }
    }
    
    /** 显示创建角色模式 */
    function showCreateCharacterMode(): void {
        _ui.crenam.visible = true;
        for (let i = 0; i < _ui.numChildren; i++) {
            let child = _ui.getChildAt(i);
            if (child instanceof UIBitmap && child !== _ui.namestar) {
                let bmp = child as UIBitmap;
                if (bmp.y >= 760 && bmp.y <= 800 && bmp.x <= 100 && bmp.width > 600) {
                    bmp.visible = true;
                    break;
                }
            }
        }
        bindNamestarEvent();
        if (_ui.crenam.text === '输入你的名字') {
            _ui.crenam.text = '';
        }
        console.log('[22-Creator] 显示创建角色界面');
    }
    
    /** 显示已有角色模式（填入服务器角色名） */
    function showEnterGameWithName(charName: string): void {
        // ===== 隐藏名字输入框和背景图 =====
        // 隐藏名字输入框
        if (_ui.crenam) {
            _ui.crenam.visible = false;
        } else {
            console.warn('[22-Creator] showEnterGameWithName: crenam 组件不存在');
        }
        
        // 隐藏名字背景图（扩大查找范围）
        let foundBackground = false;
        for (let i = 0; i < _ui.numChildren; i++) {
            let child = _ui.getChildAt(i);
            if (child instanceof UIBitmap && child !== _ui.namestar) {
                let bmp = child as UIBitmap;
                // 扩大查找范围，确保找到名字背景
                if ((bmp.y >= 750 && bmp.y <= 820) && (bmp.x >= 0 && bmp.x <= 150) && bmp.width > 500) {
                    bmp.visible = false;
                    foundBackground = true;
                    break;
                }
            }
        }
        
        // 如果没找到背景图，尝试按名字属性查找
        if (!foundBackground) {
            console.log('[22-Creator] showEnterGameWithName: 未找到名字背景图，尝试其他方式');
            for (let i = 0; i < _ui.numChildren; i++) {
                let child = _ui.getChildAt(i);
                if (child instanceof UIBitmap && child !== _ui.namestar) {
                    if (child['name'] && child['name'].indexOf('背景') !== -1) {
                        child.visible = false;
                        foundBackground = true;
                        break;
                    }
                }
            }
        }
        
        // 创建提示文本组件
        let tipLabel = new UIString();
        tipLabel.text = '小猎人 赛文已经获取您的名字信息';
        tipLabel.fontSize = 32;
        tipLabel.color = '#FFD700';
        tipLabel.bold = true;
        tipLabel.x = 180;
        tipLabel.y = 730;
        tipLabel.align = 0;
        // 添加文字阴影效果
        tipLabel.shadow = true;
        tipLabel.shadowColor = '#000000';
        tipLabel.shadowBlur = 4;
        tipLabel.shadowOffsetX = 2;
        tipLabel.shadowOffsetY = 2;
        _ui.addChild(tipLabel);
        // 绑定进入游戏事件（点击namestar开始游戏）
        bindEnterGameEvent();
        // 保存角色名到localStorage
        localStorage.setItem('mk_charactername', charName);
        console.log('[22-Creator] 显示已有角色界面，角色名:', charName);
    }

    /** 统一绑定namestar按钮事件 */
    function bindNamestarEvent(): void {
        if (!_ui) return;
        _ui.namestar.mouseEnabled = true;
        _ui.namestar.off(EventObject.CLICK, null, onCreateClick);
        _ui.namestar.off(EventObject.CLICK, null, onEnterGameClick);
        _ui.namestar.on(EventObject.CLICK, null, onCreateClick);
        _ui.crenam.off(EventObject.ENTER, null, onCreateClick);
        _ui.crenam.off(EventObject.ENTER, null, onEnterGameClick);
        _ui.crenam.on(EventObject.ENTER, null, onCreateClick);
    }

    /** 显示已有角色模式（隐藏名字输入框和背景） */
    function showEnterGameMode(charName: string): void {
        // 确保 _ui 存在
        if (!_ui) {
            console.warn('[22-Creator] showEnterGameMode: _ui 为空');
            return;
        }
        
        // 隐藏名字输入框
        if (_ui.crenam) {
            _ui.crenam.visible = false;
        } else {
            console.warn('[22-Creator] showEnterGameMode: crenam 组件不存在');
        }
        
        // 隐藏名字背景图（查找范围扩大）
        let foundBackground = false;
        for (let i = 0; i < _ui.numChildren; i++) {
            let child = _ui.getChildAt(i);
            if (child instanceof UIBitmap && child !== _ui.namestar) {
                let bmp = child as UIBitmap;
                // 扩大查找范围，确保找到名字背景
                if ((bmp.y >= 750 && bmp.y <= 820) && (bmp.x >= 0 && bmp.x <= 150) && bmp.width > 500) {
                    bmp.visible = false;
                    foundBackground = true;
                    break;
                }
            }
        }
        
        // 如果没找到背景图，尝试其他方式查找
        if (!foundBackground) {
            console.log('[22-Creator] showEnterGameMode: 未找到名字背景图，尝试其他方式');
            // 尝试按名字或其他属性查找
            for (let i = 0; i < _ui.numChildren; i++) {
                let child = _ui.getChildAt(i);
                if (child instanceof UIBitmap && child !== _ui.namestar) {
                    // 查找名字背景的其他特征
                    if (child['name'] && child['name'].indexOf('背景') !== -1) {
                        child.visible = false;
                        foundBackground = true;
                        break;
                    }
                }
            }
        }
        
        // 绑定进入游戏事件
        bindEnterGameEvent();
        console.log('[22-Creator] 已有角色(' + charName + ')，隐藏名字输入和背景，绑定进入游戏');
    }

    /** 绑定进入游戏模式的事件 */
    function bindEnterGameEvent(): void {
        if (!_ui) return;
        _ui.namestar.mouseEnabled = true;
        _ui.namestar.off(EventObject.CLICK, null, onCreateClick);
        _ui.namestar.off(EventObject.CLICK, null, onEnterGameClick);
        _ui.namestar.on(EventObject.CLICK, null, onEnterGameClick);
    }

    // ================================================================
    //  重新登录页面 (iframe)
    // ================================================================

    /** 显示重新登录 iframe 遮罩 */
    function showReconnectUI(): void {
        if (_showingReconnect) return;
        _showingReconnect = true;

        GameUI.hide(22);

        let overlay = document.createElement('div');
        overlay.id = 'mk_reconnect_overlay';
        overlay.style.cssText = 'position:fixed;z-index:99999;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;';

        let iframeW = Math.min(600, window.innerWidth - 40);
        let iframeH = Math.min(650, window.innerHeight - 40);

        let container = document.createElement('div');
        container.style.cssText = 'position:relative;width:' + iframeW + 'px;height:' + iframeH + 'px;border-radius:14px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.8);border:1px solid rgba(100,150,255,0.1);';

        let iframe = document.createElement('iframe');
        iframe.src = RECONNECT_URL;
        iframe.style.cssText = 'width:100%;height:100%;border:none;background:#0a0a12;';

        container.appendChild(iframe);
        overlay.appendChild(container);
        document.body.appendChild(overlay);
    }

    /** 关闭重新登录遮罩 */
    function closeReconnectUI(): void {
        _showingReconnect = false;
        let overlay = document.getElementById('mk_reconnect_overlay');
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }

    /** 收到重新登录成功消息 */
    function onReconnectMessage(event: MessageEvent): void {
        if (event.data && event.data.type === 'mk_reconnected') {
            let token = event.data.token;
            let username = event.data.username;
            let hasCharacter = event.data.hasCharacter || false;
            let characterName = event.data.characterName || '';
            if (!token) return;

            console.log('[22-Creator] 收到重新登录消息:', username, ', hasCharacter:', hasCharacter, ', characterName:', characterName);

            localStorage.setItem('mk_token', token);
            localStorage.setItem('mk_username', username);
            if (characterName) {
                localStorage.setItem('mk_charactername', characterName);
            }

            setGameVar(VAR_TOKEN, token);
            setGameVar(VAR_USERNAME, username);

            closeReconnectUI();

            // 检查当前账号是否已有角色
            if (_ui) {
                // 重置处理标志，允许用户操作
                _isProcessing = false;
                
                // 如果服务器返回已有角色，直接使用服务器信息
                if (hasCharacter && characterName) {
                    // 检查本地是否有存档
                    let hasLocalSave = hasLocalSaveFile(characterName);
                    
                    if (hasLocalSave) {
                        // 有角色且本地有存档，直接打开读档界面
                        console.log('[22-Creator] 账号已有角色且本地有存档，角色名:', characterName, '，打开读档界面');
                        openSaveFileInterface(characterName, token);
                    } else {
                        // 有角色但无本地存档，显示已有角色界面
                        console.log('[22-Creator] 账号已有角色但无本地存档，角色名:', characterName);
                        GameUI.show(22);
                        showEnterGameWithName(characterName);
                        _ui.namestar.mouseEnabled = true;
                        bindNamestarEvent();
                    }
                } else {
                    // 服务器未返回角色信息，需要调用API检查
                    checkAccountHasCharacter(token).then(hasChar => {
                        // 先显示界面22
                        GameUI.show(22);
                        if (hasChar) {
                            let storedCharName = localStorage.getItem('mk_charactername') || '';
                            // 检查本地是否有存档
                            if (storedCharName && hasLocalSaveFile(storedCharName)) {
                                console.log('[22-Creator] API检查发现有角色且本地有存档，角色名:', storedCharName, '，打开读档界面');
                                openSaveFileInterface(storedCharName, token);
                            } else {
                                showEnterGameMode(storedCharName);
                            }
                        } else {
                            localStorage.removeItem('mk_charactername');
                            showCreateCharacterMode();
                        }
                        _ui.namestar.mouseEnabled = true;
                        bindNamestarEvent();
                    }).catch(() => {
                        // 重置处理标志
                        _isProcessing = false;
                        // 先显示界面22
                        GameUI.show(22);
                        localStorage.removeItem('mk_charactername');
                        showCreateCharacterMode();
                        _ui.namestar.mouseEnabled = true;
                        bindNamestarEvent();
                    });
                }
            } else {
                showUI22Safely();
            }
        }
    }

    /** 检查当前账号是否已有角色 */
    function checkAccountHasCharacter(token: string): Promise<boolean> {
        return apiRequest('checkCharacter', { token: token })
            .then((result: any) => {
                if (result.code === 401) {
                    throw new Error('登录已过期');
                }
                return result.code === 200 && result.data && result.data.hasCharacter;
            })
            .catch(() => false);
    }

    // ================================================================
    //  核心逻辑：创建角色
    // ================================================================

    function onCreateClick(): void {
        if (_isProcessing) return;

        let characterName = (_ui.crenam.text || '').trim();
        if (!characterName) {
            showError('请输入角色名字');
            return;
        }
        if (characterName.length < 2 || characterName.length > 8) {
            showError('角色名需要2-8个字符');
            return;
        }
        if (!/^[一-龥]+$/.test(characterName)) {
            showError('角色名只能包含中文字符');
            return;
        }

        let token = localStorage.getItem('mk_token') || '';
        if (!token) {
            _pendingName = characterName;
            showReconnectUI();
            return;
        }

        _pendingName = characterName;
        doCreateCharacter(characterName, token);
    }

    function doCreateCharacter(characterName: string, token: string): void {
        console.log('[22-Creator] 开始检查账号角色状态');

        _isProcessing = true;
        if (_ui) {
            _ui.namestar.mouseEnabled = false;
        }

        apiRequest('checkCharacter', { token: token })
            .then((result: any) => {
                if (result.code === 401) {
                    markReconnect();
                    throw new Error('登录已过期');
                }
                if (result.code === 200 && result.data && result.data.hasCharacter) {
                    let name = result.data.characterName || characterName;
                    console.log('[22-Creator] 账号已有角色:', name);
                    return loadExistingCharacter(name, token);
                }
                return createNewCharacter(characterName, token);
            })
            .catch((err: Error) => {
                if (_reconnecting) {
                    _reconnecting = false;
                    showReconnectUI();
                    return;
                }
                console.error('[22-Creator] 操作失败:', err.message);
                showError(err.message);
                if (_ui) {
                    _ui.namestar.mouseEnabled = true;
                }
                showUI22Safely();
                _isProcessing = false;
            });
    }

    /** 加载已有角色数据并进入游戏 */
    function loadExistingCharacter(characterName: string, token: string): Promise<void> {
        return apiRequest('getPlayerData', { token: token })
            .then((result: any) => {
                if (result.code === 401) {
                    markReconnect();
                    throw new Error('登录已过期');
                }
                if (result.code !== 200 || !result.data) {
                    throw new Error(result.message || '获取角色数据失败');
                }
                console.log('[22-Creator] 加载已有角色成功:', characterName);
                completeAndStartGame(characterName, token);
            });
    }

    /** 创建新角色 */
    function createNewCharacter(characterName: string, token: string): Promise<void> {
        console.log('[22-Creator] 开始创建新角色:', characterName);

        return apiRequest('checkName', { token: token, characterName: characterName })
            .then((checkResult: any) => {
                if (checkResult.code === 401) {
                    markReconnect();
                    throw new Error('登录已过期');
                }
                if (checkResult.code === 200 && checkResult.data && checkResult.data.available === true) {
                    console.log('[22-Creator] 角色名可用，开始创建');
                    return apiRequest('createCharacter', { token: token, characterName: characterName });
                } else if (checkResult.code === 200 && checkResult.data && checkResult.data.available === false) {
                    throw new Error('该角色名已被占用，请换一个名字');
                } else {
                    throw new Error(checkResult.message || '校验角色名失败');
                }
            })
            .then((createResult: any) => {
                if (!createResult) {
                    throw new Error('创建角色失败');
                }
                if (createResult.code === 401) {
                    markReconnect();
                    throw new Error('登录已过期');
                }
                if (createResult.code !== 200) {
                    throw new Error(createResult.message || '创建角色失败');
                }
                console.log('[22-Creator] 角色创建成功:', characterName);
                completeAndStartGame(characterName, token);
            });
    }

    // ================================================================
    //  已有角色：进入游戏
    // ================================================================

    /** 已有角色时点击 namestar 按钮，直接进入游戏 */
    function onEnterGameClick(): void {
        if (_isProcessing) return;
        _isProcessing = true;

        let token = localStorage.getItem('mk_token') || '';
        let charName = localStorage.getItem('mk_charactername') || '';
        let username = localStorage.getItem('mk_username') || '';

        if (!token) {
            _isProcessing = false;
            _pendingName = charName;
            showReconnectUI();
            return;
        }

        console.log('[22-Creator] 已有角色，进入游戏:', charName);

        if (!_origGameUIShow) {
            try { _origGameUIShow = GameUI.show; } catch (e) {}
        }

        // 检查是否有本地存档且角色名匹配
        checkLocalSaveAndProceed(charName, token, username);
    }

    /** 检查本地存档并决定下一步操作 */
    function checkLocalSaveAndProceed(charName: string, token: string, username: string): void {
        try {
            // 检查本地是否有存档数据
            let hasLocalSave = false;
            let localCharName = '';
            
            // 尝试从 localStorage 读取存档信息
            for (let i = 0; i < localStorage.length; i++) {
                let key = localStorage.key(i);
                if (key && key.indexOf('SinglePlayerGame_SaveData_') === 0) {
                    try {
                        let saveDataStr = localStorage.getItem(key);
                        if (saveDataStr) {
                            let saveData = JSON.parse(saveDataStr);
                            if (saveData && saveData.playerData && saveData.playerData.name) {
                                localCharName = saveData.playerData.name;
                                hasLocalSave = true;
                                break;
                            }
                        }
                    } catch (e) {
                        // 忽略解析错误
                    }
                }
            }
            
            // 如果本地有存档且角色名匹配，跳转读档界面
            if (hasLocalSave && localCharName === charName) {
                console.log('[22-Creator] 发现匹配的本地存档，角色名:', localCharName, '跳转读档界面');
                GameUI.hide(22);
                setTimeout(() => {
                    try {
                        if (typeof GUI_SaveFileManager !== 'undefined') {
                            if (!GUI_SaveFileManager.currentToken) {
                                GUI_SaveFileManager.setUserToken(token);
                            }
                        }
                        // 显示读档界面（界面 ID=2）
                        if (typeof GUI_Manager !== 'undefined' && GUI_Manager.open) {
                            GUI_Manager.open(2);
                        } else if (typeof GameUI !== 'undefined' && GameUI.show) {
                            GameUI.show(2);
                        }
                    } catch (e) {
                        console.warn('[22-Creator] 打开读档界面失败:', e);
                        // 失败则直接启动游戏
                        startGameDirectly(token, username, charName);
                    }
                }, 300);
            } else {
                // 没有本地存档或角色名不匹配，直接启动游戏
                console.log('[22-Creator] 未发现匹配的本地存档，直接启动游戏');
                startGameDirectly(token, username, charName);
            }
        } catch (e) {
            console.warn('[22-Creator] 检查本地存档失败:', e);
            startGameDirectly(token, username, charName);
        }
        
        _isProcessing = false;
    }

    /** 直接启动游戏 */
    function startGameDirectly(token: string, username: string, charName: string): void {
        GameUI.hide(22);

        try { (window as any)._mk_characterReady = true; } catch (e) {}
        localStorage.setItem('mk_character_ready', 'true');

        setGameVar(VAR_CHAR_NAME, charName);
        setGameVar(VAR_TOKEN, token);
        setGameVar(VAR_USERNAME, username);

        ensurePartyMember();

        try {
            if (typeof GUI_SaveFileManager !== 'undefined') {
                if (!GUI_SaveFileManager.currentToken) {
                    GUI_SaveFileManager.setUserToken(token);
                }
                GUI_SaveFileManager.initAutoSave();
            }
        } catch (e) {
            console.warn('[22-Creator] 启动自动存档失败:', e);
        }

        // 纯本地模式：直接启动游戏，不下载服务器存档
        setTimeout(() => {
            try {
                if (typeof SinglePlayerGame !== 'undefined' && SinglePlayerGame.newGame) {
                    SinglePlayerGame.newGame();
                }
            } catch (e) {
                console.warn('[22-Creator] 启动游戏失败:', e);
            }
        }, 300);
    }

    /** 保存角色信息并启动游戏 */
    function completeAndStartGame(characterName: string, token: string): void {
        localStorage.setItem('mk_charactername', characterName);
        _pendingName = '';

        setGameVar(VAR_CHAR_NAME, characterName);
        setGameVar(VAR_TOKEN, token);
        setGameVar(VAR_USERNAME, localStorage.getItem('mk_username') || '');

        GameUI.hide(22);

        try {
            if (typeof GUI_SaveFileManager !== 'undefined') {
                if (GUI_SaveFileManager.currentToken || token) {
                    if (!GUI_SaveFileManager.currentToken) {
                        GUI_SaveFileManager.setUserToken(token);
                    }
                    GUI_SaveFileManager.initAutoSave();
                }
            }
        } catch (e) {
            console.warn('[22-Creator] 启动自动存档失败:', e);
        }

        ensurePartyMember();

        setTimeout(() => {
            try {
                if (typeof SinglePlayerGame !== 'undefined' && SinglePlayerGame.newGame) {
                    SinglePlayerGame.newGame();
                }
            } catch (e) {
                console.warn('[22-Creator] 启动游戏失败:', e);
            }
        }, 300);
    }

    /** 如果队伍为空，添加默认角色避免卡死 */
    function ensurePartyMember(): void {
        try {
            if (Game && Game.player && Game.player.data && Game.player.data.party) {
                if (Game.player.data.party.length === 0) {
                    console.log('[22-Creator] 队伍为空，添加默认角色');
                    if (typeof ProjectPlayer !== 'undefined' && ProjectPlayer.addPlayerActorByActorID) {
                        ProjectPlayer.addPlayerActorByActorID(1001, 1, false);
                        console.log('[22-Creator] 默认角色添加成功');
                    } else {
                        console.warn('[22-Creator] ProjectPlayer 不可用');
                    }
                }
            }
        } catch (e) {
            console.warn('[22-Creator] 添加默认角色失败:', e);
        }
    }

    /** 标记需要重新登录 */
    let _reconnecting = false;
    function markReconnect(): void {
        _reconnecting = true;
    }

    function showUI22Safely(): void {
        try {
            if (_origGameUIShow) {
                let ui22 = _origGameUIShow.call(GameUI, 22) as GUI_22;
                if (ui22) {
                    _ui = ui22;
                    bindUI();
                }
            } else {
                let ui22 = GameUI.show(22) as GUI_22;
                if (ui22) {
                    _ui = ui22;
                    bindUI();
                }
            }
        } catch (e) {
            console.warn('[22-Creator] 恢复UI22显示失败:', e);
        }
    }

    // ================================================================
    //  工具函数
    // ================================================================

    /** 调用服务器API */
    function apiRequest(action: string, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            let timeout = setTimeout(() => {
                xhr.abort();
                reject(new Error('请求超时'));
            }, 10000);

            xhr.open('POST', API_BASE + '?action=' + action, true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    clearTimeout(timeout);
                    if (xhr.status === 200) {
                        try {
                            resolve(JSON.parse(xhr.responseText));
                        } catch (e) {
                            reject(new Error('服务器响应格式错误'));
                        }
                    } else {
                        reject(new Error('网络错误: ' + xhr.status));
                    }
                }
            };

            xhr.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('无法连接服务器'));
            };

            xhr.send(JSON.stringify(data));
        });
    }

    /** 设置游戏变量 */
    function setGameVar(varId: number, value: string): void {
        try {
            if (typeof Game !== 'undefined' && Game.player && Game.player.variable) {
                Game.player.variable.setString(varId, value);
            }
        } catch (e) {
            console.warn('[22-Creator] 设置变量失败:', e);
        }
    }

    /** 显示错误提示 */
    function showError(text: string): void {
        try {
            let old = document.getElementById('mk_error_toast');
            if (old && old.parentNode) { old.parentNode.removeChild(old); }

            let toast = document.createElement('div');
            toast.id = 'mk_error_toast';
            toast.textContent = text;
            toast.style.cssText = 'position:fixed;z-index:100000;top:25%;left:50%;transform:translateX(-50%);padding:14px 28px;background:rgba(0,0,0,0.88);color:#f06060;border:1px solid rgba(240,96,96,0.25);border-radius:10px;font-size:15px;font-family:Microsoft YaHei,sans-serif;pointer-events:none;white-space:nowrap;transition:opacity 0.3s;box-shadow:0 4px 20px rgba(0,0,0,0.4);';
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => {
                    if (toast.parentNode) { toast.parentNode.removeChild(toast); }
                }, 300);
            }, 3000);
        } catch (e) {
            console.error('[22-Creator] 显示错误失败:', e);
        }
    }
}

// ================================================================
//  自动初始化
// ================================================================
(function () {
    try {
        GUI22Creator.init();
        console.log('[22-Creator] 已加载，等待界面22打开');
    } catch (e) {
        console.error('[22-Creator] 初始化失败:', e);
    }
})();