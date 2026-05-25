/**
 * 存档界面
 * Created by 黑暗之神KDS on 2020-09-15 14:01:31.
 */
class GUI_Save extends GUI_5 {
    constructor() {
        super();
        if (this.list) GUI_SaveFileManager.initSaveFileList(this.list, true);
    }
}