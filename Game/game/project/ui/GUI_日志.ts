class GUI_日志 extends GUI_30 {
    constructor() {
        super();
        this.on(EventObject.DISPLAY, this, this.当界面显示时);
        this.关闭.on(EventObject.CLICK, this, this.当点击关闭按钮时);
        GUI_Manager.standardList(this.日志列表, false);
        this.日志列表.mouseEnabled = true;
    }
    private 当界面显示时() {
        this.日志列表.on(EventObject.CHANGE, this, this.当点击日志时);
        this.刷新日志列表();
    }
    private 刷新日志列表() {
        const 所有的日志项 = [];
        for (let i = 0; i < Game.player.data.持有日志.length; i++) {
            const 这一条日志 = Game.player.data.持有日志[i];
            const 一个新项 = new ListItem_29();
            一个新项.日志名 = 这一条日志.name;
            一个新项.data = 这一条日志;
            所有的日志项.push(一个新项);
        }
        this.日志列表.items = 所有的日志项;
    }
    private 当点击关闭按钮时() {
        GameUI.hide(30);
    }
    private 当点击日志时() {
        const 选中的项 = this.日志列表.selectedItem as ListItem_30;
        if (选中的项 && 选中的项.data) {
            const 日志数据 = 选中的项.data;
            this.日志内容.text = 日志数据.内容;
        }
    }
}