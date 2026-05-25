/**
 * 支持者数据
 * -- GC 云服功能-通信编号100001开始
 * -- 基础安全：做了基础版本的防数据串改
 * Created by Karson.DS on 2025-11-17 10:17:13.
 */
(() => {
    class GCClound_SupporterData {
        /**
         * 配置参数：白名单域名
         */
        private static whiteOrigins = ["http://127.0.0.1", "http://localhost",
            "https://gc.gamecreator.com.cn", "https://gamecreator.com.cn",
            "https://www.gamecreator.com.cn", "http://gc.gamecreator.com.cn",
            "https://global.gamecreator.com.cn", "http://global.gamecreator.com.cn"];
        /**
         * 锁定值
         */
        private static lock_fp_user: number;
        private static lock_fp_game: number;
        private static lock_fp_cost: number;
        /**
         * 最大值
         */
        private static lock_fp_gameMAX: number;
        /**
         * 初始化
         */
        static init() {
            this.initCommand();
            // 接收消息
            window.addEventListener("message", (event) => {
                // 白名单
                let allow = false;
                for (let i in this.whiteOrigins) {
                    let origin = this.whiteOrigins[i];
                    if (event.origin.indexOf(origin) != -1) {
                        allow = true;
                        break;
                    }
                }
                if (!allow) return;
                // 
                var data = event.data;
                if (!data || typeof data != "object") return;
                switch (data.msgType) {
                    case 100001: // 同步
                        this.syncFPValue(data.fp_user, data.fp_game);
                        break;
                    case 1002: // 支持者模块初始化完毕，开始同步数据（也可以视为引擎初始化完毕）
                        break;
                    case 1003: //
                        break;
                    default:
                        break;
                }
            })
            
            // 定期发送角色数据到网页（每5秒发送一次）
            setInterval(() => {
                GCClound_SupporterData.sendActorStatsToWeb();
            }, 5000);
            
            // 立即发送一次
            setTimeout(() => {
                GCClound_SupporterData.sendActorStatsToWeb();
            }, 1000);
            
            // 监听来自网页的消息
            window.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'REQUEST_GAME_STATS') {
                    GCClound_SupporterData.sendActorStatsToWeb();
                }
            });
            
            // 暴露全局函数供测试
            window['sendGameStatsToWeb'] = function() {
                GCClound_SupporterData.sendActorStatsToWeb();
            };
            
            // 也添加到window对象上
            if (typeof (window as any).sendGameStatsToWeb === 'undefined') {
                Object.defineProperty(window, 'sendGameStatsToWeb', {
                    value: function() {
                        GCClound_SupporterData.sendActorStatsToWeb();
                    },
                    writable: true,
                    configurable: true
                });
            }
            
            // 直接暴露角色数据到window对象（用于网页直接读取）
            setInterval(() => {
                if (Game && Game.player && Game.player.data) {
                    const party = Game.player.data.party || [];
                    if (party.length > 0 && party[0].actor) {
                        const actorDS = party[0];
                        const actor = actorDS.actor;
                        
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
                            name: actor.name || '未知角色',
                            timestamp: Date.now()
                        };
                        
                        (window as any).gameActorStats = stats;
                        
                        // 使用localStorage传递数据（更可靠）
                        try {
                            localStorage.setItem('gameActorStats', JSON.stringify(stats));
                        } catch (e) {
                            // localStorage可能被阻止
                        }
                    }
                }
            }, 1000);
            
            }
        
        /**
         * 发送角色数据到网页
         */
        private static sendActorStatsToWeb() {
            // 检查玩家数据是否存在
            if (!Game || !Game.player || !Game.player.data) {
                return;
            }
            
            if (!Game.player.data.party || Game.player.data.party.length === 0) {
                return;
            }
            
            // 获取第一个角色的数据
            const actorDS = Game.player.data.party[0];
            const actor = actorDS.actor;
            
            if (!actor) {
                return;
            }
            
            // 提取角色属性（与GUI_Actor中的属性ID对应）
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
                name: actor.name || '未知角色'
            };
            
            // 发送消息到父窗口（排行榜页面可能在父窗口或iframe中）
            try {
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({
                        type: 'GAME_STATS_UPDATE',
                        stats: stats
                    }, '*');
                }
            } catch (e) {
                // 忽略跨域错误
            }
            
            // 同时发送到所有iframe
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
                        // 忽略跨域错误
                    }
                }
            } catch (e) {
                // 忽略错误
            }
        }
        
        /**
         * 同步支持度
         * @param fp_user 作者支持度
         * @param fp_game 作品支持度
         */
        private static syncFPValue(fp_user: number, fp_game: number) {
            // 安全防护：若低于此前记录的最大值则说明数据异常
            if (this.lock_fp_gameMAX == null || fp_game > this.lock_fp_gameMAX) {
                this.lock_fp_gameMAX = fp_game;
            }
            if (fp_game < this.lock_fp_gameMAX) {
                alert(`GCClound_SupporterData:Data anomaly 1`); // 数据异常-1：接收到了更小的值，不会出现该情况，因为支持度不会减少，可能遇到外部修改
                window.location.reload();
                return;
            }
            // 获取正确的消耗值（修正变量）
            let old_fp_cost_value = this.safelyFP_cost;
            if (old_fp_cost_value != ClientWorld.variable.getVariable(WorldData.const_fp_cost_value)) { ClientWorld.variable.setVariable(WorldData.const_fp_cost_value, old_fp_cost_value); this.onFixed(); }
            // 作者支持度发生变化时：更新
            let old_fp_user = this.safelyFP_user;
            if (old_fp_user != ClientWorld.variable.getVariable(WorldData.const_fp_user)) { ClientWorld.variable.setVariable(WorldData.const_fp_user, old_fp_user); this.onFixed(); }
            if (old_fp_user != fp_user) {
                ClientWorld.variable.setVariable(WorldData.const_fp_user, fp_user);
            }
            // 作品支持度发生变化时：更新 + 派发事件
            let old_fp_game = this.safelyFP_game;
            if (old_fp_game != ClientWorld.variable.getVariable(WorldData.const_fp_game)) { ClientWorld.variable.setVariable(WorldData.const_fp_game, old_fp_game); this.onFixed(); }
            if (old_fp_game != fp_game) {
                let changeValue = fp_game - old_fp_game;
                // changeValue
                ClientWorld.variable.setVariable(WorldData.const_fp_changeValue, changeValue);
                // fp_game
                ClientWorld.variable.setVariable(WorldData.const_fp_game, fp_game);
                // lock cost
                let newCostValue = old_fp_cost_value + changeValue;
                ClientWorld.variable.setVariable(WorldData.const_fp_cost_value, newCostValue);
                this.lock_fp_cost = newCostValue;
                // event
                CommandPage.startTriggerFragmentEvent(WorldData.const_fp_changeEvent, Game.player.sceneObject, Game.player.sceneObject);
            }
            else if (this.lock_fp_cost == null) {
                this.lock_fp_cost = ClientWorld.variable.getVariable(WorldData.const_fp_cost_value);
            }
            // lock
            this.lock_fp_user = fp_user;
            this.lock_fp_game = fp_game;
        }
        /**
         * 初始化指令
         */
        private static initCommand() {
            CommandExecute.customCommand_14001 = (commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_14001) => {
                if (!trigger || !(trigger instanceof CommandTrigger) || !triggerPlayer || !(triggerPlayer instanceof ClientPlayer)) return;
                let safelyFP_cost = this.safelyFP_cost;
                if (ClientWorld.variable.getVariable(WorldData.const_fp_cost_value) != safelyFP_cost) ClientWorld.variable.setVariable(WorldData.const_fp_cost_value, safelyFP_cost);
                // -- 超出上限下限
                let cost = Math.floor(p.cost);
                if (cost <= 0 || cost > safelyFP_cost) return;
                // -- 减少
                let newValue = safelyFP_cost - cost;
                ClientWorld.variable.setVariable(WorldData.const_fp_cost_value, newValue);
                this.lock_fp_cost = newValue;

            }
            Object.defineProperty(CommandExecute, 'customCommand_14001', {
                value: CommandExecute.customCommand_14001,
                writable: false,
                configurable: false,
                enumerable: true
            });
            
            // 自定义指令1008：发送角色数据到网页
            CommandExecute.customCommand_1008 = (commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_1008) => {
                if (!Game.player || !Game.player.data || !Game.player.data.party || Game.player.data.party.length === 0) {
                    return;
                }
                
                // 获取第一个角色的数据
                const actorDS = Game.player.data.party[0];
                const actor = actorDS.actor;
                
                // 提取角色属性
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
                    name: actor.name || '未知角色'
                };
                
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
                            // 忽略跨域错误
                        }
                    }
                } catch (e) {
                    // 忽略错误
                }
            }
            Object.defineProperty(CommandExecute, 'customCommand_1008', {
                value: CommandExecute.customCommand_1008,
                writable: false,
                configurable: false,
                enumerable: true
            });
        }
        /**
         * 高频率修正监控
         */
        private static onFixed() {
            alert(`GCClound_SupporterData:Data anomaly 2`); // 数据异常-2：关键变量被修正，作者使用错误或遇到外部修改
            window.location.reload();
            return;
        }
        //------------------------------------------------------------------------------------------------------
        // 获取
        //------------------------------------------------------------------------------------------------------
        private static get safelyFP_user() {
            return this.lock_fp_user != null ? this.lock_fp_user : ClientWorld.variable.getVariable(WorldData.const_fp_user);
        }
        private static get safelyFP_game() {
            return this.lock_fp_game != null ? this.lock_fp_game : ClientWorld.variable.getVariable(WorldData.const_fp_game);
        }
        private static get safelyFP_cost() {
            return this.lock_fp_cost != null ? this.lock_fp_cost : ClientWorld.variable.getVariable(WorldData.const_fp_cost_value);
        }
    }
    
    // 监听引擎初始化完毕
    EventUtils.addEventListener(ClientWorld, ClientWorld.EVENT_INITED, Callback.New(() => {
        GCClound_SupporterData.init();
        parent.postMessage({ msgType: 1002 }, '*');
    }, this), true);
})();
module CommandExecute {
    export function customCommand_14001(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_14001): void { }
    export function customCommand_1008(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_1008): void { }
}