/**
 * GUI_SystemNotice - 固定位置系统公告组件
 * 专门用于显示系统公告（怪物击败公告、管理员公告等）
 * 在聊天界面顶部固定位置显示，不影响聊天内容
 * 支持自定义颜色、显示时长和动画效果
 */

class GUI_SystemNotice extends UIRoot {
    // UI组件（动态创建）
    private noticeBg: UIImage;
    private noticeText: UIString;
    private noticeIcon: UIImage;
    
    // 动画状态
    private isShowing: boolean = false;
    private currentNotice: any = null;
    private noticeQueue: any[] = [];
    private displayTimer: number = 0;
    
    // 配置参数
    private defaultDuration: number = 4000; // 默认显示时长（毫秒）
    
    constructor() {
        super();
        
        // 初始化动态创建的组件
        this.initComponents();
        
        // 启动公告轮询
        this.startNoticePolling();
    }
    
    /** 初始化动态组件 */
    private initComponents(): void {
        // 创建背景图片（半透明黑色渐变）
        this.noticeBg = new UIImage();
        this.noticeBg.source = '';
        this.noticeBg.width = 448;
        this.noticeBg.height = 45;
        this.noticeBg.visible = false;
        this.noticeBg.touchEnabled = false;
        this.noticeBg.x = 0;
        this.noticeBg.y = 0;
        this.addChild(this.noticeBg);
        
        // 创建公告图标
        this.noticeIcon = new UIImage();
        this.noticeIcon.source = '';
        this.noticeIcon.width = 24;
        this.noticeIcon.height = 24;
        this.noticeIcon.visible = false;
        this.noticeIcon.touchEnabled = false;
        this.noticeIcon.x = 10;
        this.noticeIcon.y = 10;
        this.addChild(this.noticeIcon);
        
        // 创建公告文字
        this.noticeText = new UIString();
        this.noticeText.fontSize = 16;
        this.noticeText.color = '#FFD700'; // 金色
        this.noticeText.bold = true;
        this.noticeText.stroke = 2;
        this.noticeText.strokeColor = '#000000'; // 黑色描边
        this.noticeText.align = UIString.LEFT;
        this.noticeText.valign = UIString.MIDDLE;
        this.noticeText.visible = false;
        this.noticeText.touchEnabled = false;
        this.noticeText.x = 40; // 留出图标的空间
        this.noticeText.y = 0;
        this.noticeText.width = 400;
        this.noticeText.height = 45;
        this.addChild(this.noticeText);
        
        // 设置容器属性
        this.width = 448;
        this.height = 45;
        this.visible = true;
        this.touchEnabled = false;
        this.zOrder = 100; // 确保在最上层
    }
    
    /** 设置组件位置（相对于父容器） */
    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }
    
    /** 设置宽度 */
    public setWidth(width: number): void {
        this.width = width;
        if (this.noticeBg) this.noticeBg.width = width;
        if (this.noticeText) {
            this.noticeText.x = 40;
            this.noticeText.width = width - 50;
        }
    }
    
    /** 启动公告轮询 */
    private startNoticePolling(): void {
        setInterval(() => {
            this.loadNotices();
        }, 5000);
        
        // 初始加载
        setTimeout(() => {
            this.loadNotices();
        }, 2000);
    }
    
    /** 从服务器加载公告 */
    private loadNotices(): void {
        try {
            let xhr = new XMLHttpRequest();
            let timeout = setTimeout(() => { xhr.abort(); }, 5000);
            
            // 服务器只支持POST请求
            xhr.open('POST', 'http://47.96.92.202:8848/fwq/api.php?action=getSystemNotices', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    clearTimeout(timeout);
                    if (xhr.status === 200) {
                        try {
                            let result = JSON.parse(xhr.responseText);
                            if (result.code === 200 && result.data) {
                                this.onNoticesLoaded(result.data);
                            }
                        } catch (e) {
                            console.warn('[Notice] 解析公告失败:', e);
                        }
                    }
                }
            };
            
            xhr.onerror = () => {
                clearTimeout(timeout);
            };
            
            xhr.send(JSON.stringify({})); // 发送空对象作为POST数据
        } catch (e) {
            console.warn('[Notice] 加载公告异常:', e);
        }
    }
    
    /** 公告加载完成 */
    private onNoticesLoaded(notices: any[]): void {
        // 添加新公告到队列（去重）
        notices.forEach(notice => {
            let exists = this.noticeQueue.some(n => n.id === notice.id);
            if (!exists && notice.timestamp) {
                // 检查是否是新公告（1分钟内的）
                if (Date.now() - notice.timestamp * 1000 < 60000) {
                    this.noticeQueue.push(notice);
                }
            }
        });
        
        // 如果当前没有显示公告，显示下一个
        if (!this.isShowing && this.noticeQueue.length > 0) {
            this.showNextNotice();
        }
    }
    
    /** 显示下一个公告 */
    private showNextNotice(): void {
        if (this.noticeQueue.length === 0) return;
        
        this.currentNotice = this.noticeQueue.shift();
        this.isShowing = true;
        
        if (!this.noticeBg || !this.noticeText) return;
        
        // 设置公告内容
        let text = this.formatNoticeText(this.currentNotice);
        this.noticeText.text = text;
        
        // 设置颜色
        this.setNoticeColor(this.currentNotice);
        
        // 显示背景和文字
        this.noticeBg.visible = true;
        this.noticeText.visible = true;
        this.noticeIcon.visible = true;
        this.visible = true;
        
        // 设置背景样式（半透明黑色）
        this.noticeBg.source = '';
        this.noticeBg.color = 'rgba(0, 0, 0, 0.8)';
        
        // 设置图标（金色星星效果）
        this.noticeIcon.source = '';
        this.noticeIcon.color = '#FFD700';
        
        // 淡入动画
        this.noticeText.alpha = 0;
        this.noticeBg.alpha = 0;
        this.noticeIcon.alpha = 0;
        
        let fadeInStep = () => {
            if (this.noticeText.alpha < 1) {
                this.noticeText.alpha += 0.1;
                this.noticeBg.alpha += 0.1;
                this.noticeIcon.alpha += 0.1;
                setTimeout(fadeInStep, 20);
            } else {
                // 获取显示时长（公告配置优先，否则使用默认值）
                let duration = (this.currentNotice.duration || this.defaultDuration) * 1000;
                // 显示指定时长后淡出
                setTimeout(() => {
                    this.fadeOutNotice();
                }, duration);
            }
        };
        fadeInStep();
    }
    
    /** 淡出公告 */
    private fadeOutNotice(): void {
        let fadeOutStep = () => {
            if (this.noticeText && this.noticeBg && this.noticeIcon) {
                if (this.noticeText.alpha > 0) {
                    this.noticeText.alpha -= 0.1;
                    this.noticeBg.alpha -= 0.1;
                    this.noticeIcon.alpha -= 0.1;
                    setTimeout(fadeOutStep, 20);
                } else {
                    this.noticeBg.visible = false;
                    this.noticeText.visible = false;
                    this.noticeIcon.visible = false;
                    this.visible = false;
                    this.isShowing = false;
                    this.currentNotice = null;
                    
                    // 显示下一个公告
                    if (this.noticeQueue.length > 0) {
                        setTimeout(() => {
                            this.showNextNotice();
                        }, 300);
                    }
                }
            }
        };
        fadeOutStep();
    }
    
    /** 格式化公告文本 */
    private formatNoticeText(notice: any): string {
        if (notice.type === 'monster_defeat') {
            // 怪物击败公告格式
            let itemsText = '';
            if (notice.dropped_items && notice.dropped_items.length > 0) {
                let itemList = notice.dropped_items.map((item: any) => {
                    return '【' + item.itemName + (item.num > 1 ? 'x' + item.num : '') + '】';
                });
                itemsText = itemList.join('');
            }
            return notice.player_name + ' 经过重重困难，终于打败了 ' + notice.monster_name + '，并获得' + itemsText + '，正在某个角落偷着乐呢！！！';
        } else {
            // 普通系统公告
            return notice.content || '';
        }
    }
    
    /** 设置公告颜色 */
    private setNoticeColor(notice: any): void {
        if (!this.noticeText) return;
        
        if (notice.type === 'monster_defeat') {
            // 怪物击败公告 - 金色
            this.noticeText.color = '#FFD700';
        } else {
            // 系统公告 - 使用配置颜色或默认红色
            this.noticeText.color = notice.color || '#FF4444';
        }
        
        // 设置描边
        this.noticeText.stroke = 2;
        this.noticeText.strokeColor = '#000000';
    }
    
    /** 手动添加公告 */
    public addNotice(notice: any): void {
        this.noticeQueue.push(notice);
        if (!this.isShowing) {
            this.showNextNotice();
        }
    }
    
    /** 清理 */
    public dispose(): void {
        this.isShowing = false;
        this.noticeQueue = [];
        if (this.noticeBg) this.noticeBg.visible = false;
        if (this.noticeText) this.noticeText.visible = false;
        if (this.noticeIcon) this.noticeIcon.visible = false;
        this.visible = false;
    }
}
