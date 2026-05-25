/**
 * 怪兽国度 - 游戏数据管理模块
 * 负责处理玩家数据上传、排行榜更新和token管理
 * 
 * 游戏变量配置：
 * - 14002: 角色名称
 * - 14003: 登录Token
 * - 14004: 用户名
 */

var MonsterKingdomAPI = (function () {
    function MonsterKingdomAPI() {
        // 服务器地址（部署时请修改为实际服务器地址）
this.apiUrl = '/api.php';
        this.token = '';
        this.username = '';
        this.autoUploadTimer = null;
        this.uploadInterval = 60000; // 60秒
        this.lastUploadTime = 0;
        // 游戏变量ID配置
        this.VAR_CHARACTER_NAME = 14002;
        this.VAR_TOKEN = 14003;
        this.VAR_USERNAME = 14004;
    }
    MonsterKingdomAPI.getInstance = function () {
        if (!MonsterKingdomAPI.instance) {
            MonsterKingdomAPI.instance = new MonsterKingdomAPI();
        }
        return MonsterKingdomAPI.instance;
    };
    /**
     * 初始化API模块
     * 从游戏变量读取token和用户名
     */
    MonsterKingdomAPI.prototype.initialize = function () {
        this.token = this.getGameVariable(this.VAR_TOKEN) || '';
        this.username = this.getGameVariable(this.VAR_USERNAME) || '';
        // 也从localStorage读取（如果存在），过滤无效值
        var storedToken = localStorage.getItem('mk_token');
        var storedUsername = localStorage.getItem('mk_username');
        if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
            this.token = storedToken;
        }
        if (storedUsername) {
            this.username = storedUsername;
        }
        // 清除localStorage中残留的无效值
        if (storedToken === 'undefined' || storedToken === 'null') {
            localStorage.removeItem('mk_token');
        }
        console.log('[MK API] 初始化完成 - token:', this.token ? '已设置 (' + this.token.substring(0, 20) + '...)' : '未设置');
        if (this.token && this.username) {
            this.startAutoUpload();
        }
    };
    /**
     * 获取游戏变量（字符串）
     */
    MonsterKingdomAPI.prototype.getGameVariable = function (variableId) {
        if (typeof Game !== 'undefined' && Game.player && Game.player.variable) {
            return Game.player.variable.getString(variableId) || '';
        }
        return '';
    };
    /**
     * 设置游戏变量（字符串）
     */
    MonsterKingdomAPI.prototype.setGameVariable = function (variableId, value) {
        if (typeof Game !== 'undefined' && Game.player && Game.player.variable) {
            Game.player.variable.setString(variableId, value);
        }
    };
    /**
     * 用户登录
     */
    MonsterKingdomAPI.prototype.login = async function (username, password) {
        try {
            var response = await fetch(this.apiUrl + '?action=login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username, password: password })
            });
            var result = await response.json();
            if (result.code === 200 && result.data && result.data.user) {
                this.token = result.data.user.token || '';
                this.username = result.data.user.username || '';
                // 将token和用户名保存到游戏变量（多种方式确保保存成功）
                this.setGameVariable(this.VAR_TOKEN, this.token);
                this.setGameVariable(this.VAR_USERNAME, this.username);
                // 同时保存到sessionStorage（供网页直接访问）
                sessionStorage.setItem('game_token', this.token);
                sessionStorage.setItem('game_username', this.username);
                // 保存到localStorage（持久化存储）
                localStorage.setItem('mk_token', this.token);
                localStorage.setItem('mk_username', this.username);
                console.log('[MK API] 登录成功 - 用户名:', this.username);
                console.log('[MK API] Token已保存到游戏变量:', this.VAR_TOKEN);
                console.log('[MK API] Token值:', this.token.substring(0, 20) + '...');
                this.startAutoUpload();
                return true;
            }
            console.error('[MK API] 登录失败:', result.message);
            return false;
        }
        catch (error) {
            console.error('[MK API] 登录异常:', error);
            return false;
        }
    };
    /**
     * 用户登出
     */
    MonsterKingdomAPI.prototype.logout = async function () {
        try {
            if (this.token) {
                await fetch(this.apiUrl + '?action=logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: this.token })
                });
            }
        }
        catch (error) {
            console.error('[MK API] 登出异常:', error);
        }
        finally {
            this.token = '';
            this.username = '';
            this.setGameVariable(this.VAR_TOKEN, '');
            this.setGameVariable(this.VAR_USERNAME, '');
            sessionStorage.removeItem('game_token');
            sessionStorage.removeItem('game_username');
            localStorage.removeItem('mk_token');
            localStorage.removeItem('mk_username');
            this.stopAutoUpload();
            console.log('[MK API] 已登出');
        }
    };
    /**
     * 获取当前token（供网页弹窗使用）
     */
    MonsterKingdomAPI.prototype.getToken = function () {
        return this.token;
    };
    /**
     * 获取当前用户名
     */
    MonsterKingdomAPI.prototype.getUsername = function () {
        return this.username;
    };
    /**
     * 检查是否已登录
     */
    MonsterKingdomAPI.prototype.isLoggedIn = function () {
        return !!this.token && !!this.username;
    };
    /**
     * 启动自动上传
     */
    MonsterKingdomAPI.prototype.startAutoUpload = function () {
        if (this.autoUploadTimer) {
            clearInterval(this.autoUploadTimer);
        }
        this.uploadPlayerData();
        this.autoUploadTimer = window.setInterval(function () {
            this.uploadPlayerData();
        }.bind(this), this.uploadInterval);
        console.log('[MK API] 自动上传已启动，间隔:', this.uploadInterval / 1000, '秒');
    };
    /**
     * 停止自动上传
     */
    MonsterKingdomAPI.prototype.stopAutoUpload = function () {
        if (this.autoUploadTimer) {
            clearInterval(this.autoUploadTimer);
            this.autoUploadTimer = null;
            console.log('[MK API] 自动上传已停止');
        }
    };
    /**
     * 手动触发上传（供按钮调用）
     */
    MonsterKingdomAPI.prototype.manualUpload = async function () {
        return await this.uploadPlayerData();
    };
    /**
     * 上传玩家数据
     */
    MonsterKingdomAPI.prototype.uploadPlayerData = async function () {
        if (!this.isLoggedIn()) {
            console.log('[MK API] 未登录，跳过上传');
            return false;
        }
        try {
            var playerData = this.collectPlayerData();
            var response = await fetch(this.apiUrl + '?action=savePlayerData', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: this.token,
                    playerData: playerData
                })
            });
            var result = await response.json();
            if (result.code === 200) {
                this.lastUploadTime = Date.now();
                console.log('[MK API] 数据上传成功:', new Date().toLocaleString());
                return true;
            }
            else {
                console.error('[MK API] 数据上传失败:', result.message);
                if (result.code === 401) {
                    console.log('[MK API] token已过期，需要重新登录');
                }
                return false;
            }
        }
        catch (error) {
            console.error('[MK API] 数据上传异常:', error);
            return false;
        }
    };
    /**
     * 收集玩家数据
     */
    MonsterKingdomAPI.prototype.collectPlayerData = function () {
        var data = {};
        try {
            // 读取角色名称（变量14002）
            var charName = this.getGameVariable(this.VAR_CHARACTER_NAME) || '';
            // 只在角色名有效时才保存，防止"未知角色"污染服务器数据
            if (charName && charName !== '未知角色' && charName !== 'undefined' && charName !== 'null') {
                data['playerName'] = charName;
                localStorage.setItem('mk_charactername', charName);
            }
            // 从队伍中获取主角数据
            var party = (Game.player && Game.player.data && Game.player.data.party) || [];
            if (party.length > 0 && party[0].actor) {
                var actorDS = party[0];
                var actor = actorDS.actor;
                var extendAttributes = actor.extendAttributes || [];
                data['level'] = actorDS.lv || 1;
                data['attack'] = extendAttributes[2] || 0;
                data['hp'] = extendAttributes[1] || 0;
                data['gold'] = (Game.player && Game.player.data && Game.player.data.gold) || 0;
                data['toxic'] = extendAttributes[3] || 0;
                data['ice'] = extendAttributes[4] || 0;
                data['fire'] = extendAttributes[5] || 0;
                data['thunder'] = extendAttributes[6] || 0;
                data['toxic_def'] = extendAttributes[7] || 0;
                data['ice_def'] = extendAttributes[8] || 0;
                data['fire_def'] = extendAttributes[9] || 0;
                data['thunder_def'] = extendAttributes[10] || 0;
            }
        }
        catch (error) {
            console.error('[MK API] 收集玩家数据失败:', error);
        }
        return data;
    };
    /**
     * 获取排行榜数据
     */
    MonsterKingdomAPI.prototype.getRanking = async function (type) {
        if (type === void 0) { type = 'level'; }
        try {
            var response = await fetch(this.apiUrl + '?action=getRanking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: type, limit: 20 })
            });
            var result = await response.json();
            if (result.code === 200) {
                return result.data || [];
            }
            console.error('[MK API] 获取排行榜失败:', result.message);
            return null;
        }
        catch (error) {
            console.error('[MK API] 获取排行榜异常:', error);
            return null;
        }
    };
    /**
     * 获取在线用户列表
     */
    MonsterKingdomAPI.prototype.getOnlineUsers = async function () {
        if (!this.isLoggedIn())
            return null;
        try {
            var response = await fetch(this.apiUrl + '?action=getChatUsers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: this.token })
            });
            var result = await response.json();
            if (result.code === 200) {
                return result.data || [];
            }
            console.error('[MK API] 获取在线用户失败:', result.message);
            return null;
        }
        catch (error) {
            console.error('[MK API] 获取在线用户异常:', error);
            return null;
        }
    };
    /**
     * 保存游戏存档到服务器
     * @param {number} slot 存档槽位 (1-5)
     * @param {string} saveData base64编码的存档数据
     */
    MonsterKingdomAPI.prototype.getFeatureCode = function () {
        var fc = '';
        try { fc = window.localStorage.getItem('mk_featurecode') || ''; } catch(e) {}
        if (!fc) { try { fc = this.getGameVariable(14006) || ''; } catch(e) {} }
        return fc;
    };
    MonsterKingdomAPI.prototype.saveGameData = async function (slot, saveData) {
        if (!this.isLoggedIn()) return { success: false, message: '未登录' };
        try {
            var response = await fetch(this.apiUrl + '?action=saveGameData', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: this.token,
                    slot: slot || 1,
                    saveData: saveData || '',
                    featureCode: this.getFeatureCode()
                })
            });
            var result = await response.json();
            return { success: result.code === 200, message: result.message };
        } catch (error) {
            console.error('[MK API] 存档上传失败:', error);
            return { success: false, message: '网络错误' };
        }
    };
    /**
     * 从服务器下载游戏存档
     * @param {number} slot 存档槽位 (1-5)
     */
    MonsterKingdomAPI.prototype.loadGameData = async function (slot) {
        if (!this.isLoggedIn()) return { success: false, data: null };
        try {
            var response = await fetch(this.apiUrl + '?action=loadGameData', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: this.token,
                    slot: slot || 1,
                    featureCode: this.getFeatureCode()
                })
            });
            var result = await response.json();
            if (result.code === 200 && result.data && result.data.hasData) {
                return { success: true, data: result.data.saveData };
            }
            return { success: false, data: null, message: result.message };
        } catch (error) {
            console.error('[MK API] 存档下载失败:', error);
            return { success: false, data: null };
        }
    };
    /**
     * 获取服务器存档列表
     */
    MonsterKingdomAPI.prototype.listServerSaves = async function () {
        if (!this.isLoggedIn()) return { success: false, slots: [] };
        try {
            var response = await fetch(this.apiUrl + '?action=listSaves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: this.token })
            });
            var result = await response.json();
            if (result.code === 200 && result.data && result.data.slots) {
                return { success: true, slots: result.data.slots };
            }
            return { success: false, slots: [] };
        } catch (error) {
            console.error('[MK API] 获取存档列表失败:', error);
            return { success: false, slots: [] };
        }
    };
    /**
     * 从服务器批量下载所有存档并写入本地存储
     * 让游戏引擎能识别服务器上的存档，实现完全云存档化
     */
    MonsterKingdomAPI.prototype.loadAllSavesFromServer = async function () {
        if (!this.isLoggedIn()) return false;
        try {
            // 先获取存档列表
            var listResp = await fetch(this.apiUrl + '?action=listSaves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: this.token })
            });
            var listResult = await listResp.json();
            if (listResult.code !== 200 || !listResult.data || !listResult.data.slots) return false;

            var slots = listResult.data.slots;
            var loadedCount = 0;

            for (var i = 0; i < slots.length; i++) {
                var slotInfo = slots[i];
                if (!slotInfo.hasData) continue;

                // 下载每个有数据的槽位
                var loadResp = await fetch(this.apiUrl + '?action=loadGameData', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: this.token, slot: slotInfo.slot, featureCode: this.getFeatureCode() })
                });
                var loadResult = await loadResp.json();

                if (loadResult.code === 403) {
                    console.warn('[MK API] 槽位' + slotInfo.slot + '特征码不匹配，跳过');
                }
                else if (loadResult.code === 200 && loadResult.data && loadResult.data.hasData && loadResult.data.saveData) {
                    try {
                        // base64解码
                        var saveDataStr = decodeURIComponent(escape(atob(loadResult.data.saveData)));
                        var parsedData = JSON.parse(saveDataStr);
                        var saveKey = "savedata/gamedata" + slotInfo.slot + ".gcdata";

                        // 写入LocalStorage（引擎存储）
                        if (typeof LocalStorage !== 'undefined') {
                            LocalStorage.setJSON(saveKey, parsedData);
                        }
                        // 同时也写入标准localStorage（兼容）
                        if (typeof localStorage !== 'undefined') {
                            localStorage.setItem(saveKey, saveDataStr);
                        }

                        // 更新SinglePlayerGame.saveIDs（让引擎识别该存档）
                        if (typeof SinglePlayerGame !== 'undefined' && SinglePlayerGame.saveIDs) {
                            var existing = null;
                            if (typeof ArrayUtils !== 'undefined') {
                                existing = ArrayUtils.matchAttributes(SinglePlayerGame.saveIDs, { id: slotInfo.slot }, true)[0];
                            } else {
                                for (var j = 0; j < SinglePlayerGame.saveIDs.length; j++) {
                                    if (SinglePlayerGame.saveIDs[j].id === slotInfo.slot) { existing = SinglePlayerGame.saveIDs[j]; break; }
                                }
                            }
                            if (!existing) {
                                var indexInfo = parsedData[15] || { screenshotImg: '', mapName: '', gameTime: 0 };
                                SinglePlayerGame.saveIDs.push({
                                    id: slotInfo.slot,
                                    indexInfo: indexInfo,
                                    now: Date.now()
                                });
                            } else {
                                // 更新已有条目的indexInfo
                                if (parsedData[15]) {
                                    existing.indexInfo = parsedData[15];
                                }
                                existing.now = Date.now();
                            }
                        }

                        loadedCount++;
                        console.log('[MK API] 服务器存档已下载到本地: 槽位' + slotInfo.slot);
                    } catch (e) {
                        console.warn('[MK API] 解析槽位' + slotInfo.slot + '存档失败:', e);
                    }
                }
            }

            console.log('[MK API] 批量下载完成，共加载' + loadedCount + '个存档');
            return loadedCount > 0;
        } catch (error) {
            console.error('[MK API] 批量下载存档失败:', error);
            return false;
        }
    };
    /**
     * 在加载指定存档前，先从服务器下载最新数据
     * @param {number} slot 存档槽位
     */
    MonsterKingdomAPI.prototype.loadSlotFromServerFirst = async function (slot) {
        if (!this.isLoggedIn()) return false;
        slot = slot || 1;
        try {
            var response = await fetch(this.apiUrl + '?action=loadGameData', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: this.token, slot: slot, featureCode: this.getFeatureCode() })
            });
            var result = await response.json();
            if (result.code === 403) {
                console.warn('[MK API] 槽位' + slot + '特征码不匹配');
                return false;
            }
            if (result.code === 200 && result.data && result.data.hasData && result.data.saveData) {
                var saveDataStr = decodeURIComponent(escape(atob(result.data.saveData)));
                var parsedData = JSON.parse(saveDataStr);
                var saveKey = "savedata/gamedata" + slot + ".gcdata";

                if (typeof LocalStorage !== 'undefined') {
                    LocalStorage.setJSON(saveKey, parsedData);
                }
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem(saveKey, saveDataStr);
                }

                // 确保saveIDs中有此条目
                if (typeof SinglePlayerGame !== 'undefined' && SinglePlayerGame.saveIDs) {
                    var existing = null;
                    if (typeof ArrayUtils !== 'undefined') {
                        existing = ArrayUtils.matchAttributes(SinglePlayerGame.saveIDs, { id: slot }, true)[0];
                    } else {
                        for (var j = 0; j < SinglePlayerGame.saveIDs.length; j++) {
                            if (SinglePlayerGame.saveIDs[j].id === slot) { existing = SinglePlayerGame.saveIDs[j]; break; }
                        }
                    }
                    if (!existing) {
                        var indexInfo = parsedData[15] || { screenshotImg: '', mapName: '', gameTime: 0 };
                        SinglePlayerGame.saveIDs.push({ id: slot, indexInfo: indexInfo, now: Date.now() });
                    } else {
                        if (parsedData[15]) existing.indexInfo = parsedData[15];
                        existing.now = Date.now();
                    }
                }

                console.log('[MK API] 槽位' + slot + '已从服务器下载');
                return true;
            }
            console.log('[MK API] 服务器槽位' + slot + '无存档');
            return false;
        } catch (error) {
            console.error('[MK API] 下载槽位' + slot + '失败:', error);
            return false;
        }
    };
    MonsterKingdomAPI.prototype.fullLogout = async function () {
        await this.logout();
        // 清除角色相关数据
        this.setGameVariable(this.VAR_CHARACTER_NAME, '');
        localStorage.removeItem('mk_charactername');
        localStorage.removeItem('mk_character_ready');
        localStorage.removeItem('mk_gender');
        console.log('[MK API] 完全退出登录，已清除角色数据');
    };
    /**
     * 检查当前账号是否有角色
     */
    MonsterKingdomAPI.prototype.checkCharacterExists = async function () {
        if (!this.isLoggedIn()) {
            return { hasCharacter: false, characterName: '' };
        }
        try {
            var response = await fetch(this.apiUrl + '?action=checkCharacter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: this.token })
            });
            var result = await response.json();
            if (result.code === 200 && result.data) {
                return {
                    hasCharacter: result.data.hasCharacter || false,
                    characterName: result.data.characterName || ''
                };
            }
            return { hasCharacter: false, characterName: '' };
        }
        catch (error) {
            console.error('[MK API] 检查角色失败:', error);
            return { hasCharacter: false, characterName: '' };
        }
    };
    /**
     * 检查角色名是否可用
     */
    MonsterKingdomAPI.prototype.checkNameAvailability = async function (characterName) {
        if (!this.isLoggedIn())
            return false;
        try {
            var response = await fetch(this.apiUrl + '?action=checkName', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: this.token,
                    characterName: characterName
                })
            });
            var result = await response.json();
            if (result.code === 200 && result.data) {
                return result.data.available === true;
            }
            return false;
        }
        catch (error) {
            console.error('[MK API] 检查角色名失败:', error);
            return false;
        }
    };
    /**
     * 创建角色（游戏内点击开始时调用）
     */
    MonsterKingdomAPI.prototype.createCharacter = async function (characterName) {
        if (!this.isLoggedIn()) {
            return { success: false, message: '未登录' };
        }
        try {
            var response = await fetch(this.apiUrl + '?action=createCharacter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: this.token,
                    characterName: characterName
                })
            });
            var result = await response.json();
            if (result.code === 200) {
                this.setGameVariable(this.VAR_CHARACTER_NAME, characterName);
                localStorage.setItem('mk_charactername', characterName);
                console.log('[MK API] 角色创建成功:', characterName);
                return { success: true, message: result.message || '创建成功' };
            }
            console.error('[MK API] 角色创建失败:', result.message);
            return { success: false, message: result.message || '创建失败' };
        }
        catch (error) {
            console.error('[MK API] 角色创建异常:', error);
            return { success: false, message: '网络错误' };
        }
    };
    /**
     * 发送聊天消息
     */
    MonsterKingdomAPI.prototype.sendMessage = async function (toUser, content) {
        if (!this.isLoggedIn())
            return false;
        try {
            var response = await fetch(this.apiUrl + '?action=sendMessage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: this.token,
                    from_user: this.username,
                    to_user: toUser,
                    content: content,
                    character_name: this.getGameVariable(this.VAR_CHARACTER_NAME)
                })
            });
            var result = await response.json();
            if (result.code === 200) {
                return true;
            }
            console.error('[MK API] 发送消息失败:', result.message);
            return false;
        }
        catch (error) {
            console.error('[MK API] 发送消息异常:', error);
            return false;
        }
    };
    /**
     * 获取公共消息
     */
    MonsterKingdomAPI.prototype.getPublicMessages = async function () {
        if (!this.isLoggedIn())
            return null;
        try {
            var response = await fetch(this.apiUrl + '?action=getPublicMessages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: this.token })
            });
            var result = await response.json();
            if (result.code === 200) {
                return result.data || [];
            }
            console.error('[MK API] 获取公共消息失败:', result.message);
            return null;
        }
        catch (error) {
            console.error('[MK API] 获取公共消息异常:', error);
            return null;
        }
    };
    return MonsterKingdomAPI;
}());
// 导出模块
window.MonsterKingdomAPI = MonsterKingdomAPI;
// 自动初始化
document.addEventListener('DOMContentLoaded', function () {
    var api = MonsterKingdomAPI.getInstance();
    api.initialize();
});