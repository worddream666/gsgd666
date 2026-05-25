/**
 * 怪兽国度 - 游戏数据管理模块
 * 负责处理玩家数据上传、排行榜更新和token管理
 * 
 * 游戏变量配置：
 * - 14002: 角色名称
 * - 14003: 登录Token
 * - 14004: 用户名
 */

class MonsterKingdomAPI {
    private static instance: MonsterKingdomAPI;
    // 服务器地址（部署时请修改为实际服务器地址）
private apiUrl: string = '/api.php';
    private token: string = '';
    private username: string = '';
    private autoUploadTimer: number | null = null;
    private uploadInterval: number = 60000; // 60秒
    private lastUploadTime: number = 0;
    
    // 游戏变量ID配置
    private VAR_CHARACTER_NAME: number = 14002;
    private VAR_TOKEN: number = 14003;
    private VAR_USERNAME: number = 14004;

    private constructor() {}

    public static getInstance(): MonsterKingdomAPI {
        if (!MonsterKingdomAPI.instance) {
            MonsterKingdomAPI.instance = new MonsterKingdomAPI();
        }
        return MonsterKingdomAPI.instance;
    }

    /**
     * 初始化API模块
     * 从游戏变量读取token和用户名
     */
    public initialize(): void {
        this.token = this.getGameVariable(this.VAR_TOKEN) || '';
        this.username = this.getGameVariable(this.VAR_USERNAME) || '';
        
        console.log('[MK API] 初始化完成 - token:', this.token ? '已设置' : '未设置');
        
        if (this.token && this.username) {
            this.startAutoUpload();
        }
    }

    /**
     * 获取游戏变量（字符串）
     */
    private getGameVariable(variableId: number): string {
        if (typeof Game !== 'undefined' && Game.player && Game.player.variable) {
            return Game.player.variable.getString(variableId) || '';
        }
        return '';
    }

    /**
     * 设置游戏变量（字符串）
     */
    private setGameVariable(variableId: number, value: string): void {
        if (typeof Game !== 'undefined' && Game.player && Game.player.variable) {
            Game.player.variable.setString(variableId, value);
        }
    }

    /**
     * 用户登录
     */
    public async login(username: string, password: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.apiUrl}?action=login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            
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
                console.log('[MK API] Token值:', this.token);
                
                this.startAutoUpload();
                
                return true;
            }
            
            console.error('[MK API] 登录失败:', result.message);
            return false;
        } catch (error) {
            console.error('[MK API] 登录异常:', error);
            return false;
        }
    }

    /**
     * 用户登出
     */
    public async logout(): Promise<void> {
        try {
            if (this.token) {
                await fetch(`${this.apiUrl}?action=logout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: this.token })
                });
            }
        } catch (error) {
            console.error('[MK API] 登出异常:', error);
        } finally {
            this.token = '';
            this.username = '';
            this.setGameVariable(this.VAR_TOKEN, '');
            this.setGameVariable(this.VAR_USERNAME, '');
            this.stopAutoUpload();
            console.log('[MK API] 已登出');
        }
    }

    /**
     * 获取当前token（供网页弹窗使用）
     */
    public getToken(): string {
        return this.token;
    }

    /**
     * 获取当前用户名
     */
    public getUsername(): string {
        return this.username;
    }

    /**
     * 检查是否已登录
     */
    public isLoggedIn(): boolean {
        return !!this.token && !!this.username;
    }

    /**
     * 启动自动上传
     */
    public startAutoUpload(): void {
        if (this.autoUploadTimer) {
            clearInterval(this.autoUploadTimer);
        }
        
        this.uploadPlayerData();
        
        this.autoUploadTimer = window.setInterval(() => {
            this.uploadPlayerData();
        }, this.uploadInterval);
        
        console.log('[MK API] 自动上传已启动，间隔:', this.uploadInterval / 1000, '秒');
    }

    /**
     * 停止自动上传
     */
    public stopAutoUpload(): void {
        if (this.autoUploadTimer) {
            clearInterval(this.autoUploadTimer);
            this.autoUploadTimer = null;
            console.log('[MK API] 自动上传已停止');
        }
    }

    /**
     * 手动触发上传（供按钮调用）
     */
    public async manualUpload(): Promise<boolean> {
        return await this.uploadPlayerData();
    }

    /**
     * 上传玩家数据
     */
    private async uploadPlayerData(): Promise<boolean> {
        if (!this.isLoggedIn()) {
            console.log('[MK API] 未登录，跳过上传');
            return false;
        }

        try {
            const playerData = this.collectPlayerData();
            
            const response = await fetch(`${this.apiUrl}?action=savePlayerData`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: this.token,
                    playerData: playerData
                })
            });

            const result = await response.json();
            
            if (result.code === 200) {
                this.lastUploadTime = Date.now();
                console.log('[MK API] 数据上传成功:', new Date().toLocaleString());
                return true;
            } else {
                console.error('[MK API] 数据上传失败:', result.message);
                
                if (result.code === 401) {
                    console.log('[MK API] token已过期，需要重新登录');
                }
                
                return false;
            }
        } catch (error) {
            console.error('[MK API] 数据上传异常:', error);
            return false;
        }
    }

    /**
     * 收集玩家数据
     */
    private collectPlayerData(): Record<string, unknown> {
        const data: Record<string, unknown> = {};
        
        try {
            // 读取角色名称（变量14002）
            var charName = this.getGameVariable(this.VAR_CHARACTER_NAME) || '';
            // 只在角色名有效时才保存，防止"未知角色"污染服务器数据
            if (charName && charName !== '未知角色' && charName !== 'undefined' && charName !== 'null') {
                data['playerName'] = charName;
            }

            // 从队伍中获取主角数据
            const party = (Game.player?.data?.party || []) as Array<Record<string, unknown>>;
            if (party.length > 0 && party[0].actor) {
                const actorDS = party[0];
                const actor = actorDS.actor as Record<string, unknown>;
                const extendAttributes = actor.extendAttributes as number[] || [];
                
                data['level'] = actorDS.lv || 1;
                data['attack'] = extendAttributes[2] || 0;
                data['hp'] = extendAttributes[1] || 0;
                data['gold'] = Game.player?.data?.gold || 0;
                data['toxic'] = extendAttributes[3] || 0;
                data['ice'] = extendAttributes[4] || 0;
                data['fire'] = extendAttributes[5] || 0;
                data['thunder'] = extendAttributes[6] || 0;
                data['toxic_def'] = extendAttributes[7] || 0;
                data['ice_def'] = extendAttributes[8] || 0;
                data['fire_def'] = extendAttributes[9] || 0;
                data['thunder_def'] = extendAttributes[10] || 0;
            }
        } catch (error) {
            console.error('[MK API] 收集玩家数据失败:', error);
        }
        
        return data;
    }

    /**
     * 获取排行榜数据
     */
    public async getRanking(type: string = 'level'): Promise<Array<Record<string, unknown>> | null> {
        try {
            const response = await fetch(`${this.apiUrl}?action=getRanking`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, limit: 20 })
            });

            const result = await response.json();
            
            if (result.code === 200) {
                return result.data || [];
            }
            
            console.error('[MK API] 获取排行榜失败:', result.message);
            return null;
        } catch (error) {
            console.error('[MK API] 获取排行榜异常:', error);
            return null;
        }
    }

    /**
     * 获取在线用户列表
     */
    public async getOnlineUsers(): Promise<Array<Record<string, unknown>> | null> {
        if (!this.isLoggedIn()) return null;
        
        try {
            const response = await fetch(`${this.apiUrl}?action=getChatUsers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: this.token })
            });

            const result = await response.json();
            
            if (result.code === 200) {
                return result.data || [];
            }
            
            console.error('[MK API] 获取在线用户失败:', result.message);
            return null;
        } catch (error) {
            console.error('[MK API] 获取在线用户异常:', error);
            return null;
        }
    }

    /**
     * 检查当前账号是否有角色
     */
    public async checkCharacterExists(): Promise<{ hasCharacter: boolean, characterName: string }> {
        if (!this.isLoggedIn()) {
            return { hasCharacter: false, characterName: '' };
        }

        try {
            const response = await fetch(`${this.apiUrl}?action=checkCharacter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: this.token })
            });

            const result = await response.json();

            if (result.code === 200 && result.data) {
                return {
                    hasCharacter: result.data.hasCharacter || false,
                    characterName: result.data.characterName || ''
                };
            }

            return { hasCharacter: false, characterName: '' };
        } catch (error) {
            console.error('[MK API] 检查角色失败:', error);
            return { hasCharacter: false, characterName: '' };
        }
    }

    /**
     * 检查角色名是否可用
     */
    public async checkNameAvailability(characterName: string): Promise<boolean> {
        if (!this.isLoggedIn()) return false;

        try {
            const response = await fetch(`${this.apiUrl}?action=checkName`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: this.token,
                    characterName: characterName
                })
            });

            const result = await response.json();

            if (result.code === 200 && result.data) {
                return result.data.available === true;
            }

            return false;
        } catch (error) {
            console.error('[MK API] 检查角色名失败:', error);
            return false;
        }
    }

    /**
     * 创建角色（游戏内点击开始时调用）
     */
    public async createCharacter(characterName: string): Promise<{ success: boolean, message: string }> {
        if (!this.isLoggedIn()) {
            return { success: false, message: '未登录' };
        }

        try {
            const response = await fetch(`${this.apiUrl}?action=createCharacter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: this.token,
                    characterName: characterName
                })
            });

            const result = await response.json();

            if (result.code === 200) {
                // 设置角色名到游戏变量
                this.setGameVariable(this.VAR_CHARACTER_NAME, characterName);
                // 同步存储到 localStorage
                localStorage.setItem('mk_charactername', characterName);
                console.log('[MK API] 角色创建成功:', characterName);
                return { success: true, message: result.message || '创建成功' };
            }

            console.error('[MK API] 角色创建失败:', result.message);
            return { success: false, message: result.message || '创建失败' };
        } catch (error) {
            console.error('[MK API] 角色创建异常:', error);
            return { success: false, message: '网络错误' };
        }
    }

    /**
     * 发送聊天消息
     */
    public async sendMessage(toUser: string, content: string): Promise<boolean> {
        if (!this.isLoggedIn()) return false;
        
        try {
            const response = await fetch(`${this.apiUrl}?action=sendMessage`, {
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

            const result = await response.json();
            
            if (result.code === 200) {
                return true;
            }
            
            console.error('[MK API] 发送消息失败:', result.message);
            return false;
        } catch (error) {
            console.error('[MK API] 发送消息异常:', error);
            return false;
        }
    }

    /**
     * 获取公共消息
     */
    public async getPublicMessages(): Promise<Array<Record<string, unknown>> | null> {
        if (!this.isLoggedIn()) return null;
        
        try {
            const response = await fetch(`${this.apiUrl}?action=getPublicMessages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: this.token })
            });

            const result = await response.json();
            
            if (result.code === 200) {
                return result.data || [];
            }
            
            console.error('[MK API] 获取公共消息失败:', result.message);
            return null;
        } catch (error) {
            console.error('[MK API] 获取公共消息异常:', error);
            return null;
        }
    }
}

// 导出模块
(window as any).MonsterKingdomAPI = MonsterKingdomAPI;

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    const api = MonsterKingdomAPI.getInstance();
    api.initialize();
});