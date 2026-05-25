/**
 * UI22 角色注册绑定脚本
 *
 * 作用：绑定到游戏引擎的界面22（角色创建界面），
 *       拦截"star"按钮点击，读取"name"输入框，
 *       调用服务器API校验角色名是否可用，
 *       可用则创建角色并放行，不可用则显示错误。
 *
 * 游戏变量说明：
 *   14002 - 角色名称
 *   14003 - 登录Token
 *   14004 - 用户名
 *   14005 - 性别 (1=男, 2=女)
 *
 * 依赖：
 *   - MonsterKingdomAPI.js（提供网络请求能力）
 *   - 游戏引擎GUI系统（GUI_BASE, getChildByName）
 */

var UI22RegisterBinding = (function () {
    'use strict';

    function UI22RegisterBinding() {
        this._patched = false;
        this._ui = null;
        this._starBtn = null;
        this._nameInput = null;
        // 服务器地址（部署时请修改为实际服务器地址）
this._apiUrl = '/api.php';
        this._token = '';
        this._username = '';
        // 保存原始的click回调（创建角色后需要恢复执行）
        this._origStarCallback = null;
    }

    UI22RegisterBinding.getInstance = function () {
        if (!UI22RegisterBinding._instance) {
            UI22RegisterBinding._instance = new UI22RegisterBinding();
        }
        return UI22RegisterBinding._instance;
    };

    /**
     * 初始化：从localStorage或游戏变量读取登录信息
     */
    UI22RegisterBinding.prototype.init = function () {
        var self = this;

        // 从localStorage读取登录信息
        this._token = localStorage.getItem('mk_token') || '';
        this._username = localStorage.getItem('mk_username') || '';

        // 如果localStorage没有，尝试从游戏变量读取
        if (!this._token || !this._username) {
            this.readFromGameVars();
        }

        console.log('[UI22绑定] 初始化, token:', this._token ? '已设置' : '未设置');
    };

    /**
     * 绑定到指定的UI22实例（由Game/index.html的UI22拦截代码调用）
     * @param {Object} uiInstance - GameUI.show(22) 返回的UI对象
     */
    UI22RegisterBinding.prototype.bindToUI = function (uiInstance) {
        if (!uiInstance) {
            console.error('[UI22绑定] bindToUI: UI实例为空');
            return;
        }
        this._ui = uiInstance;

        // 确保登录信息已读取
        if (!this._token || !this._username) {
            this._token = localStorage.getItem('mk_token') || '';
            this._username = localStorage.getItem('mk_username') || '';
            this.readFromGameVars();
        }

        console.log('[UI22绑定] bindToUI: 开始绑定组件');
        this.bindUI22Components();
    };

    /**
     * 从游戏变量读取token/用户名
     */
    UI22RegisterBinding.prototype.readFromGameVars = function () {
        try {
            if (typeof Game !== 'undefined' && Game.player && Game.player.variable) {
                if (!this._token) {
                    this._token = Game.player.variable.getString(14003) || '';
                }
                if (!this._username) {
                    this._username = Game.player.variable.getString(14004) || '';
                }
            }
        } catch (e) {
            console.warn('[UI22绑定] 读取游戏变量失败:', e);
        }
    };

    /**
     * 调用服务器API
     */
    UI22RegisterBinding.prototype.apiRequest = function (action, data, timeout) {
        timeout = timeout || 10000;
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            var timer = setTimeout(function () {
                xhr.abort();
                reject(new Error('请求超时'));
            }, timeout);

            xhr.open('POST', this._apiUrl + '?action=' + action, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    clearTimeout(timer);
                    if (xhr.status === 200) {
                        try {
                            resolve(JSON.parse(xhr.responseText));
                        } catch (e) {
                            reject(new Error('解析响应失败'));
                        }
                    } else {
                        reject(new Error('网络错误: ' + xhr.status));
                    }
                }
            };
            xhr.onerror = function () {
                clearTimeout(timer);
                reject(new Error('网络错误'));
            };
            xhr.send(JSON.stringify(data));
        });
    };

    /**
     * 检查角色名是否可用
     */
    UI22RegisterBinding.prototype.checkNameAvailability = function (characterName) {
        return this.apiRequest('checkName', {
            token: this._token,
            characterName: characterName
        });
    };

    /**
     * 创建角色
     */
    UI22RegisterBinding.prototype.createCharacter = function (characterName) {
        return this.apiRequest('createCharacter', {
            token: this._token,
            characterName: characterName
        });
    };

    /**
     * 设置游戏变量
     */
    UI22RegisterBinding.prototype.setGameVar = function (varId, value) {
        try {
            if (typeof Game !== 'undefined' && Game.player && Game.player.variable) {
                Game.player.variable.setString(varId, String(value));
            }
        } catch (e) {
            console.warn('[UI22绑定] 设置变量失败:', e);
        }
    };

    /**
     * 在UI22中显示文本消息（利用引擎的提示系统）
     */
    UI22RegisterBinding.prototype.showMessage = function (text, isError) {
        // 方式1: 尝试用 engine 的提示组件
        try {
            if (typeof GameTip !== 'undefined' && GameTip.show) {
                GameTip.show(text, isError ? 3 : 1); // 3=错误, 1=普通
                return;
            }
        } catch (e) {}

        // 方式2: 尝试在UI22中查找文本组件并设置
        if (this._ui) {
            var msgLabel = this._ui.getChildByName('message');
            if (msgLabel) {
                msgLabel.setText(text);
                if (typeof msgLabel.setVisible === 'function') {
                    msgLabel.setVisible(true);
                }
                // 错误显示红色
                if (isError && typeof msgLabel.setTextColor === 'function') {
                    msgLabel.setTextColor('#FF4444');
                } else if (typeof msgLabel.setTextColor === 'function') {
                    msgLabel.setTextColor('#FFFFFF');
                }
            }
        }
    };

    /**
     * 打补丁：拦截GameUI.show方法，在UI22显示时注入绑定逻辑
     */
    UI22RegisterBinding.prototype.patchUI22 = function () {
        var self = this;

        if (this._patched) {
            console.log('[UI22绑定] 已打过补丁，跳过');
            return;
        }

        var checkAndPatch = function () {
            if (typeof GameUI === 'undefined' || !GameUI.show) {
                return false;
            }

            // 防止重复打补丁
            if (GameUI.__ui22Bound) {
                self._patched = true;
                return true;
            }

            var origShow = GameUI.show;

            GameUI.show = function (id) {
                var result = origShow.call(GameUI, id);

                // UI22 被显示时，注入绑定
                if (id === 22) {
                    console.log('[UI22绑定] 界面22已显示，开始绑定组件');
                    self._ui = result;
                    self.bindUI22Components();
                }

                return result;
            };

            GameUI.__ui22Bound = true;
            self._patched = true;
            console.log('[UI22绑定] 补丁安装完成');
            return true;
        };

        // 立即尝试，如果GameUI还没准备好则等待
        if (!checkAndPatch()) {
            var waitTimer = setInterval(function () {
                if (checkAndPatch()) {
                    clearInterval(waitTimer);
                }
            }, 300);
            // 30秒后停止等待
            setTimeout(function () {
                if (!self._patched) {
                    clearInterval(waitTimer);
                    console.warn('[UI22绑定] GameUI初始化超时');
                }
            }, 30000);
        }
    };

    /**
     * 绑定UI22内部的组件
     * 查找 'star' 按钮和 'name' 输入框并绑定事件
     */
    UI22RegisterBinding.prototype.bindUI22Components = function () {
        var self = this;
        if (!this._ui) {
            console.warn('[UI22绑定] UI对象为空，无法绑定');
            return;
        }

        // 查找star按钮 (开始游戏)
        var starBtn = this._ui.getChildByName('star');
        if (!starBtn) {
            console.warn('[UI22绑定] 未找到star按钮，尝试递归查找...');
            starBtn = this.findChildRecursive(this._ui, 'star');
        }

        // 查找name输入框
        var nameInput = this._ui.getChildByName('name');
        if (!nameInput) {
            console.warn('[UI22绑定] 未找到name输入框，尝试递归查找...');
            nameInput = this.findChildRecursive(this._ui, 'name');
        }

        if (!starBtn) {
            console.error('[UI22绑定] 无法找到star按钮，绑定失败');
            return;
        }

        if (!nameInput) {
            console.error('[UI22绑定] 无法找到name输入框，绑定失败');
            return;
        }

        this._starBtn = starBtn;
        this._nameInput = nameInput;

        console.log('[UI22绑定] 找到star按钮和name输入框，开始绑定事件');

        // 保存原始的按钮点击回调（如果有）
        if (typeof starBtn.onClick === 'function') {
            this._origStarCallback = starBtn.onClick;
        } else if (starBtn._clickHandler) {
            this._origStarCallback = starBtn._clickHandler;
        }

        // 绑定新的点击事件
        var newClickHandler = function () {
            self.handleStarClick();
        };

        // 不同版本的引擎可能有不同的事件绑定方式
        if (typeof starBtn.onClick === 'function' || starBtn.onClick === undefined) {
            // 直接替换onClick属性
            starBtn.onClick = newClickHandler;
        } else if (typeof starBtn.addClickListener === 'function') {
            starBtn.addClickListener(newClickHandler);
        } else if (typeof starBtn.addEventListener === 'function') {
            starBtn.addEventListener('click', newClickHandler);
        } else {
            // 尝试通过事件系统绑定
            console.warn('[UI22绑定] 未知的按钮事件模型，尝试直接覆盖');
            starBtn.onClick = newClickHandler;
        }

        // 绑定回车键（在输入框中按回车触发开始）
        if (typeof nameInput.onEnter === 'function' || nameInput.onEnter === undefined) {
            nameInput.onEnter = function () {
                self.handleStarClick();
            };
        } else if (typeof nameInput.addEnterListener === 'function') {
            nameInput.addEnterListener(function () {
                self.handleStarClick();
            });
        }

        // 获取初始值
        var initialName = '';
        if (typeof nameInput.getText === 'function') {
            initialName = nameInput.getText() || '';
        } else if (nameInput.text !== undefined) {
            initialName = nameInput.text || '';
        }

        console.log('[UI22绑定] 组件绑定完成, 当前输入值:', initialName || '(空)');

        // 如果已有角色名（编辑模式下），可以预填
        var savedName = localStorage.getItem('mk_charactername') || '';
        if (savedName && !initialName) {
            this.setInputText(nameInput, savedName);
        }
    };

    /**
     * 递归查找子组件
     */
    UI22RegisterBinding.prototype.findChildRecursive = function (parent, name) {
        if (!parent) return null;

        // 直接查找
        if (typeof parent.getChildByName === 'function') {
            var found = parent.getChildByName(name);
            if (found) return found;
        }

        // 遍历子组件
        var children = parent._childs || parent.children || [];
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child.name === name || child._name === name) {
                return child;
            }
            // 递归
            var deep = this.findChildRecursive(child, name);
            if (deep) return deep;
        }

        return null;
    };

    /**
     * 设置输入框文本
     */
    UI22RegisterBinding.prototype.setInputText = function (input, text) {
        if (typeof input.setText === 'function') {
            input.setText(text);
        } else if (input.text !== undefined) {
            input.text = text;
        }
    };

    /**
     * 获取输入框文本
     */
    UI22RegisterBinding.prototype.getInputText = function (input) {
        if (typeof input.getText === 'function') {
            return (input.getText() || '').trim();
        } else if (input.text !== undefined) {
            return (input.text || '').trim();
        }
        return '';
    };

    /**
     * 处理star按钮点击
     */
    UI22RegisterBinding.prototype.handleStarClick = function () {
        var self = this;

        // 读取角色名
        var characterName = this.getInputText(this._nameInput);
        if (!characterName) {
            this.showMessage('请输入角色名字', true);
            return;
        }
        if (characterName.length < 2) {
            this.showMessage('角色名至少2个字符', true);
            return;
        }
        if (characterName.length > 8) {
            this.showMessage('角色名不能超过8个字符', true);
            return;
        }

        // 检查登录状态
        this.readFromGameVars();
        if (!this._token) {
            this.showMessage('请先登录', true);
            return;
        }

        // 禁用按钮防止重复点击
        this.setButtonEnabled(false);
        this.showMessage('正在校验角色名...', false);

        console.log('[UI22绑定] 开始注册角色:', characterName);

        // 第一步：检查名字是否可用
        this.checkNameAvailability(characterName)
            .then(function (checkResult) {
                if (checkResult.code === 200 && checkResult.data && checkResult.data.available === true) {
                    // 名字可用 -> 创建角色
                    console.log('[UI22绑定] 角色名可用，开始创建:', characterName);
                    self.showMessage('角色名可用，正在创建...', false);
                    return self.createCharacter(characterName);
                } else if (checkResult.code === 200 && checkResult.data && checkResult.data.available === false) {
                    throw new Error('该角色名已被占用，请换一个');
                } else {
                    throw new Error(checkResult.message || '校验角色名失败');
                }
            })
            .then(function (createResult) {
                if (!createResult || createResult.code !== 200) {
                    throw new Error(createResult ? createResult.message : '创建角色失败');
                }

                // 创建成功
                console.log('[UI22绑定] 角色创建成功:', characterName);

                // 保存到localStorage
                localStorage.setItem('mk_charactername', characterName);

                // 设置游戏变量
                self.setGameVar(14002, characterName);
                self.setGameVar(14003, self._token);
                self.setGameVar(14004, self._username);

                self.showMessage('角色创建成功！', false);

                // 恢复按钮
                self.setButtonEnabled(true);

                // 放行：触发UI22的关闭/完成事件
                self.releaseUI22(characterName);
            })
            .catch(function (err) {
                console.error('[UI22绑定] 注册失败:', err.message);
                self.showMessage(err.message, true);
                self.setButtonEnabled(true);
            });
    };

    /**
     * 设置按钮启用/禁用
     */
    UI22RegisterBinding.prototype.setButtonEnabled = function (enabled) {
        if (!this._starBtn) return;
        try {
            if (typeof this._starBtn.setEnabled === 'function') {
                this._starBtn.setEnabled(enabled);
            } else if (typeof this._starBtn.setDisable === 'function') {
                this._starBtn.setDisable(!enabled);
            } else {
                this._starBtn._enabled = enabled;
            }
        } catch (e) {
            console.warn('[UI22绑定] 设置按钮状态失败:', e);
        }
    };

    /**
     * 放行UI22：角色创建完成后，触发事件让游戏继续
     */
    UI22RegisterBinding.prototype.releaseUI22 = function (characterName) {
        console.log('[UI22绑定] 释放UI22，角色:', characterName);

        // 方式1：触发引擎的"removed"事件（如果有__mkUI22ReadyCallbacks队列）
        if (window.__mkReleaseUI22) {
            window.__mkReleaseUI22();
        }

        // 方式2：如果UI22有close/remove方法，调用它
        if (this._ui) {
            try {
                if (typeof this._ui.close === 'function') {
                    this._ui.close();
                } else if (typeof this._ui.remove === 'function') {
                    this._ui.remove();
                } else if (typeof this._ui.setVisible === 'function') {
                    this._ui.setVisible(false);
                }
            } catch (e) {
                console.warn('[UI22绑定] 关闭UI22失败:', e);
            }
        }

        // 方式3：通过GameUI关闭
        try {
            if (typeof GameUI !== 'undefined' && typeof GameUI.close === 'function') {
                GameUI.close(22);
            } else if (typeof GameUI !== 'undefined' && typeof GameUI.hide === 'function') {
                GameUI.hide(22);
            }
        } catch (e) {
            console.warn('[UI22绑定] GameUI关闭UI22失败:', e);
        }

        // 方式4：通知MonsterKingdomAPI
        try {
            var api = null;
            if (typeof MonsterKingdomAPI !== 'undefined') {
                api = MonsterKingdomAPI.getInstance();
                if (api && typeof api.setGameVariable === 'function') {
                    api.setGameVariable(14002, characterName);
                }
            }
        } catch (e) {}

        // 方式5：启动游戏（引擎已由 showEngineUI22 启动，只需开始新游戏）
        // 如果 __startMKGame 可用（会先检查引擎状态，不重复初始化），优先使用
        var self = this;
        setTimeout(function () {
            if (typeof window.__startMKGame === 'function') {
                console.log('[UI22绑定] 调用__startMKGame启动游戏');
                window.__startMKGame();
            } else {
                // 备用：引擎可能已初始化，直接开始新游戏
                console.log('[UI22绑定] 直接启动游戏引擎');
                try {
                    if (typeof main === 'function') {
                        // 标记防止 main() 重复初始化引擎
                        if (!window.__engineStarted) {
                            main();
                            window.__engineStarted = true;
                        }
                    }
                    // 等待引擎完全初始化
                    var checkTimer = setInterval(function () {
                        if (typeof SinglePlayerGame !== 'undefined' && SinglePlayerGame.newGame) {
                            clearInterval(checkTimer);
                            SinglePlayerGame.newGame();
                            console.log('[UI22绑定] SinglePlayerGame.newGame() 调用成功');
                        }
                    }, 200);
                    // 15秒超时
                    setTimeout(function () { clearInterval(checkTimer); }, 15000);
                } catch (e) {
                    console.warn('[UI22绑定] 启动游戏失败:', e);
                }
            }
        }, 300);
    };

    UI22RegisterBinding._instance = null;
    return UI22RegisterBinding;
})();

// 自动初始化：读取localStorage中的登录信息
// Game/index.html 的UI22拦截代码会调用 UI22RegisterBinding.getInstance().bindToUI(uiInstance)
(function () {
    var binding = UI22RegisterBinding.getInstance();
    binding.init();
    console.log('[UI22绑定] 已加载，等待UI22显示时由Game/index.html调用bindToUI()');
})();
