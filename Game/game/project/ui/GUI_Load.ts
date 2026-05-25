/**
 * 读档界面
 * Created by 黑暗之神KDS on 2020-09-15 12:22:43.
 */
class GUI_Load extends GUI_2 {
    /**
     * 构造函数
     */
    constructor() {
        super();
        // 监听事件：当界面显示时
        if (this.list) GUI_SaveFileManager.initSaveFileList(this.list);
    }
}