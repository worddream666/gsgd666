/**
 * 安全存档 API 客户端
 * 
 * 安全特性：
 * 1. 与服务器端AES-256加密存档配合
 * 2. 特征码防盗用机制
 * 3. Token自动续期
 * 4. 存档完整性校验
 */

const SECURE_API_URL = 'http://47.96.92.202:8848/fwq/secure_save_api.php';

class SecureSaveAPI {
    private static instance: SecureSaveAPI;
    private token: string = '';
    private username: string = '';
    private featureCode: string = '';
    private characterName: string = '';
    
    // 游戏变量ID
    private VAR_CHARACTER_NAME: number = 14002;
    private VAR_TOKEN: number = 14003;
    private VAR_USERNAME: number = 14004;
    private VAR_FEATURE_CODE: number = 14005; // 新增：特征码
    
    private constructor() {
        this.loadFromStorage();
    }
    
    public static getInstance(): SecureSaveAPI {
        if (!SecureSaveAPI.instance) {
            SecureSaveAPI.instance = new SecureSaveAPI();
        }
        return SecureSaveAPI.instance;
    }
    
    /**
     * 从本地存储加载登录状态
     */
    private loadFromStorage(): void {
        try {
            this.token = window.localStorage.getItem('mk_token') || '';
            this.username = window.localStorage.getItem('mk_username') || '';
            this.featureCode = window.localStorage.getItem('mk_featurecode') || '';
            this.characterName = window.localStorage.getItem('mk_charactername') || '';
        } catch (e) {
            console.log('[SecureSaveAPI] Failed to load from storage:', e);
        }
    }
    
    /**
     * 保存登录状态到本地存储
     */
    private saveToStorage(): void {
        try {
            if (this.token) window.localStorage.setItem('mk_token', this.token);
            if (this.username) window.localStorage.setItem('mk_username', this.username);
            if (this.featureCode) window.localStorage.setItem('mk_featurecode', this.featureCode);
            if (this.characterName) window.localStorage.setItem('mk_charactername', this.characterName);
        } catch (e) {
            console.log('[SecureSaveAPI] Failed to save to storage:', e);
        }
    }
    
    /**
     * 保存到游戏变量
     */
    private saveToGameVariables(): void {
        try {
            if (typeof GameVariable !== 'undefined') {
                if (this.token) GameVariable.setString(this.VAR_TOKEN, this.token);
                if (this.username) GameVariable.setString(this.VAR_USERNAME, this.username);
                if (this.characterName) GameVariable.setString(this.VAR_CHARACTER_NAME, this.characterName);
                if (this.featureCode) GameVariable.setString(this.VAR_FEATURE_CODE, this.featureCode);
            }
            // 同时保存到 Game.player.variable（如果可用）
            if (typeof Game !== 'undefined' && Game.player && Game.player.variable) {
                if (this.token) Game.player.variable.setString(this.VAR_TOKEN, this.token);
                if (this.username) Game.player.variable.setString(this.VAR_USERNAME, this.username);
                if (this.characterName) Game.player.variable.setString(this.VAR_CHARACTER_NAME, this.characterName);
                if (this.featureCode) Game.player.variable.setString(this.VAR_FEATURE_CODE, this.featureCode);
            }
        } catch (e) {
            console.log('[SecureSaveAPI] Failed to save to game variables:', e);
        }
    }
    
    /**
     * 用户注册
     */
    public async register(username: string, password: string): Promise<boolean> {
        try {
            const response = await fetch(SECURE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'register', username, password })
            });
            
            const result = await response.json();
            
            if (result.code === 200 && result.data && result.data.user) {
                this.token = result.data.user.token || '';
                this.username = result.data.user.username || '';
                this.saveToStorage();
                this.saveToGameVariables();
                console.log('[SecureSaveAPI] Registration successful');
                return true;
            }
            
            console.error('[SecureSaveAPI] Registration failed:', result.message);
            return false;
        } catch (error) {
            console.error('[SecureSaveAPI] Registration error:', error);
            return false;
        }
    }
    
    /**
     * 用户登录
     */
    public async login(username: string, password: string): Promise<boolean> {
        try {
            const response = await fetch(SECURE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'login', username, password })
            });
            
            const result = await response.json();
            
            if (result.code === 200 && result.data && result.data.user) {
                this.token = result.data.user.token || '';
                this.username = result.data.user.username || '';
                this.saveToStorage();
                this.saveToGameVariables();
                
                // 登录后获取角色信息
                await this.fetchCharacterInfo();
                
                console.log('[SecureSaveAPI] Login successful');
                return true;
            }
            
            console.error('[SecureSaveAPI] Login failed:', result.message);
            return false;
        } catch (error) {
            console.error('[SecureSaveAPI] Login error:', error);
            return false;
        }
    }
    
    /**
     * 获取角色信息
     */
    private async fetchCharacterInfo(): Promise<void> {
        if (!this.token) return;
        
        try {
            const response = await fetch(SECURE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'check', token: this.token })
            });
            
            const result = await response.json();
            
            if (result.code === 200 && result.data) {
                this.characterName = result.data.characterName || '';
                this.featureCode = result.data.featureCode || '';
                this.saveToStorage();
                this.saveToGameVariables();
            }
        } catch (error) {
            console.log('[SecureSaveAPI] Failed to fetch character info:', error);
        }
    }
    
    /**
     * 创建角色
     */
    public async createCharacter(characterName: string): Promise<{ success: boolean; message: string; featureCode?: string }> {
        if (!this.token) {
            return { success: false, message: '请先登录' };
        }
        
        try {
            const response = await fetch(SECURE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'createCharacter', token: this.token, characterName })
            });
            
            const result = await response.json();
            
            if (result.code === 200 && result.data) {
                this.characterName = result.data.characterName || '';
                this.featureCode = result.data.featureCode || '';
                this.saveToStorage();
                this.saveToGameVariables();
                console.log('[SecureSaveAPI] Character created:', this.characterName);
                return { success: true, message: '角色创建成功', featureCode: this.featureCode };
            }
            
            return { success: false, message: result.message || '创建失败' };
        } catch (error) {
            console.error('[SecureSaveAPI] Create character error:', error);
            return { success: false, message: '网络错误' };
        }
    }
    
    /**
     * 检查角色名是否可用
     */
    public async checkCharacterName(characterName: string): Promise<boolean> {
        if (!this.token) return false;
        
        try {
            const response = await fetch(SECURE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'checkCharacterName', token: this.token, characterName })
            });
            
            const result = await response.json();
            return result.code === 200 && result.data && result.data.available === true;
        } catch (error) {
            console.error('[SecureSaveAPI] Check name error:', error);
            return false;
        }
    }
    
    /**
     * 检查是否已创建角色
     */
    public async checkCharacterExists(): Promise<{ hasCharacter: boolean; characterName: string; featureCode: string }> {
        if (!this.token) {
            return { hasCharacter: false, characterName: '', featureCode: '' };
        }
        
        try {
            const response = await fetch(SECURE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'checkCharacter', token: this.token })
            });
            
            const result = await response.json();
            
            if (result.code === 200 && result.data) {
                this.characterName = result.data.characterName || '';
                this.featureCode = result.data.featureCode || '';
                this.saveToStorage();
                this.saveToGameVariables();
                
                return {
                    hasCharacter: result.data.hasCharacter || false,
                    characterName: this.characterName,
                    featureCode: this.featureCode
                };
            }
            
            return { hasCharacter: false, characterName: '', featureCode: '' };
        } catch (error) {
            console.error('[SecureSaveAPI] Check character error:', error);
            return { hasCharacter: false, characterName: '', featureCode: '' };
        }
    }
    
    /**
     * 上传存档到服务器
     */
    public async uploadSave(slot: number, saveData: string, mapName: string = '', gameTime: number = 0): Promise<boolean> {
        if (!this.token || !this.featureCode) {
            console.log('[SecureSaveAPI] Not logged in or no feature code');
            return false;
        }
        
        try {
            const response = await fetch(SECURE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'saveGameData',
                    token: this.token,
                    slot: slot,
                    saveData: saveData,
                    featureCode: this.featureCode,
                    mapName: mapName,
                    gameTime: gameTime,
                    clientVersion: '1.0.0'
                })
            });
            
            const result = await response.json();
            
            if (result.code === 200) {
                console.log('[SecureSaveAPI] Save uploaded successfully (slot:', slot, ')');
                return true;
            }
            
            console.error('[SecureSaveAPI] Upload failed:', result.message);
            return false;
        } catch (error) {
            console.error('[SecureSaveAPI] Upload error:', error);
            return false;
        }
    }
    
    /**
     * 从服务器下载存档
     */
    public async downloadSave(slot: number): Promise<{ success: boolean; saveData?: string; characterName?: string; mapName?: string; gameTime?: number }> {
        if (!this.token || !this.featureCode) {
            return { success: false };
        }
        
        try {
            const response = await fetch(SECURE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'loadGameData',
                    token: this.token,
                    slot: slot,
                    featureCode: this.featureCode
                })
            });
            
            const result = await response.json();
            
            if (result.code === 200 && result.data) {
                if (result.data.hasData) {
                    console.log('[SecureSaveAPI] Save downloaded successfully (slot:', slot, ')');
                    return {
                        success: true,
                        saveData: result.data.saveData,
                        characterName: result.data.characterName,
                        mapName: result.data.mapName,
                        gameTime: result.data.gameTime
                    };
                } else {
                    console.log('[SecureSaveAPI] No save data in slot:', slot);
                    return { success: false };
                }
            }
            
            console.error('[SecureSaveAPI] Download failed:', result.message);
            return { success: false };
        } catch (error) {
            console.error('[SecureSaveAPI] Download error:', error);
            return { success: false };
        }
    }
    
    /**
     * 获取存档列表
     */
    public async getSaveList(): Promise<Array<{ slot: number; hasData: boolean; characterName?: string; mapName?: string; gameTime?: number; updatedAt?: string }> | null> {
        if (!this.token) return null;
        
        try {
            const response = await fetch(SECURE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'listSaves', token: this.token })
            });
            
            const result = await response.json();
            
            if (result.code === 200 && result.data && result.data.slots) {
                return result.data.slots;
            }
            
            return null;
        } catch (error) {
            console.error('[SecureSaveAPI] Get save list error:', error);
            return null;
        }
    }
    
    /**
     * 删除存档
     */
    public async deleteSave(slot: number): Promise<boolean> {
        if (!this.token || !this.featureCode) return false;
        
        try {
            const response = await fetch(SECURE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'deleteSave',
                    token: this.token,
                    slot: slot,
                    featureCode: this.featureCode
                })
            });
            
            const result = await response.json();
            return result.code === 200;
        } catch (error) {
            console.error('[SecureSaveAPI] Delete save error:', error);
            return false;
        }
    }
    
    /**
     * 验证Token有效性
     */
    public async validateToken(): Promise<boolean> {
        if (!this.token) return false;
        
        try {
            const response = await fetch(SECURE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'check', token: this.token })
            });
            
            const result = await response.json();
            
            if (result.code === 200) {
                // 更新服务器返回的信息
                if (result.data) {
                    this.characterName = result.data.characterName || this.characterName;
                    this.featureCode = result.data.featureCode || this.featureCode;
                    this.saveToStorage();
                    this.saveToGameVariables();
                }
                return true;
            }
            
            // Token过期，清除本地存储
            this.logout();
            return false;
        } catch (error) {
            console.error('[SecureSaveAPI] Validate token error:', error);
            return false;
        }
    }
    
    /**
     * 用户登出
     */
    public logout(): void {
        this.token = '';
        this.username = '';
        this.featureCode = '';
        this.characterName = '';
        
        try {
            window.localStorage.removeItem('mk_token');
            window.localStorage.removeItem('mk_username');
            window.localStorage.removeItem('mk_featurecode');
            window.localStorage.removeItem('mk_charactername');
        } catch (e) {}
        
        try {
            if (typeof GameVariable !== 'undefined') {
                GameVariable.setString(this.VAR_TOKEN, '');
                GameVariable.setString(this.VAR_USERNAME, '');
                GameVariable.setString(this.VAR_CHARACTER_NAME, '');
                GameVariable.setString(this.VAR_FEATURE_CODE, '');
            }
            if (typeof Game !== 'undefined' && Game.player && Game.player.variable) {
                Game.player.variable.setString(this.VAR_TOKEN, '');
                Game.player.variable.setString(this.VAR_USERNAME, '');
                Game.player.variable.setString(this.VAR_CHARACTER_NAME, '');
                Game.player.variable.setString(this.VAR_FEATURE_CODE, '');
            }
        } catch (e) {}
        
        console.log('[SecureSaveAPI] Logged out');
    }
    
    // Getter methods
    public getToken(): string { return this.token; }
    public getUsername(): string { return this.username; }
    public getFeatureCode(): string { return this.featureCode; }
    public getCharacterName(): string { return this.characterName; }
    public isLoggedIn(): boolean { return !!this.token && !!this.username; }
}
