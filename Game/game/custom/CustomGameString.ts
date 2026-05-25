/**
 * Created by 黑暗之神KDS on 2021-03-11 10:24:08.
 */
module CustomGameString {
    /**
     * 场景
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f1(trigger: CommandTrigger, p: CustomGameStringParams_1): string {
        switch (p.type) {
            case 0:
                return Game.currentScene ? Game.currentScene.name : "";
        }
        return "";
    }
    /**
     * 场景对象
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f2(trigger: CommandTrigger, p: CustomGameStringParams_2): string {
        // 没有场景的情况下返回0，比如切换场景中的情况
        if (!Game.currentScene) return "";
        // 获取对象
        let so: ProjectClientSceneObject = ProjectClientScene.getSceneObjectBySetting(p.soType, p.no, p.useVar, p.varID, trigger);
        if (!(so instanceof ProjectClientSceneObject) && p.type != 1) return "";
        // 属性
        if (p.type == 0) return so.name;
        if (p.type == 1) {
            //获取设置的名称
            let varName: string;
            if (p.customAttr.selectMode == 1) {
                let mode = p.customAttr.inputModeInfo.mode;
                let constName = p.customAttr.inputModeInfo.constName;
                let varNameIndex = p.customAttr.inputModeInfo.varNameIndex;
                varName = mode == 0 ? constName : Game.player.variable.getString(varNameIndex);
            }
            else {
                varName = p.customAttr.varName;
            }
            if (so[varName] == undefined || so[varName] == null) return "";
            //指定界面
            if (p.customAttr.compAttrEnable) {
                // 获取界面
                let ui: GUI_BASE = so[varName];
                if (!ui || !(ui instanceof GUI_BASE)) return "";
                // 根据组件唯一ID找到该组件
                let comp = ui.compsIDInfo[p.customAttr.compInfo.compID];
                if (!comp) return "";
                return comp[p.customAttr.compInfo.varName].toString();
            } else {
                return so[varName].toString();
            }
        }
        if (p.type == 2) {
            let soModule = so.getModule(p.soModuleAttr.moduleID);
            if (!soModule) return "";
            //获取设置的名称
            let varName: string;
            if (p.soModuleAttr.selectMode == 1) {
                let mode = p.soModuleAttr.inputModeInfo.mode;
                let constName = p.soModuleAttr.inputModeInfo.constName;
                let varNameIndex = p.soModuleAttr.inputModeInfo.varNameIndex;
                varName = mode == 0 ? constName : Game.player.variable.getString(varNameIndex);
            }
            else {
                varName = p.soModuleAttr.varName;
            }
            if (soModule[varName] == undefined || soModule[varName] == null) return "";
            //指定界面
            if (p.soModuleAttr.compAttrEnable) {
                // 获取界面
                let ui: GUI_BASE = soModule[varName];
                if (!ui || !(ui instanceof GUI_BASE)) return "";
                // 根据组件唯一ID找到该组件
                let comp = ui.compsIDInfo[p.soModuleAttr.compInfo.compID];
                if (!comp) return "";
                return comp[p.soModuleAttr.compInfo.varName].toString();
            } else {
                return soModule[varName].toString();
            }
        }
    }
    /**
     * 玩家
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f3(trigger: CommandTrigger, p: CustomGameStringParams_3): string {
        //获取设置的名称
        let varName: string;
        if (p.playerData.selectMode == 1) {
            let mode = p.playerData.inputModeInfo.mode;
            let constName = p.playerData.inputModeInfo.constName;
            let varNameIndex = p.playerData.inputModeInfo.varNameIndex;
            varName = mode == 0 ? constName : Game.player.variable.getString(varNameIndex);
        }
        else {
            varName = p.playerData.varName;
        }
        if (Game.player.data[varName] == undefined) return "";
        return Game.player.data[varName];
    }
    /**
     * 界面
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f4(trigger: CommandTrigger, p: CustomGameStringParams_4): string {
        // 获取界面
        let uiID = p.uiComp.uiID;
        // 界面ID
        let ui: GUI_BASE = GameUI.get(uiID) as any;
        if (!ui) return "";
        // 根据组件唯一ID找到该组件
        let comp = ui.compsIDInfo[p.uiComp.compID];
        if (!comp) return "";
        let value = comp[p.uiComp.varName];
        return value == null ? "" : value.toString();
    }
    /**
     * 模块 - 字符串
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f5(trigger: CommandTrigger, p: CustomGameStringParams_5): string {
        let moduleID = p.modelData.moduleID;
        let dataID: number;
        if (p.modelData.dataIsUseVar) {
            dataID = Game.player.variable.getVariable(p.modelData.dataVarID);
        }
        else {
            dataID = p.modelData.dataID;
        }
        let moduleData = GameData.getModuleData(moduleID, dataID);
        if (!moduleData) return "";
        //获取设置的名称
        let varName: string;
        if (p.modelData.selectMode == 1) {
            let mode = p.modelData.inputModeInfo.mode;
            let constName = p.modelData.inputModeInfo.constName;
            let varNameIndex = p.modelData.inputModeInfo.varNameIndex;
            varName = mode == 0 ? constName : Game.player.variable.getString(varNameIndex);
        }
        else {
            varName = p.modelData.varName;
        }
        if (moduleData[varName] == undefined || moduleData[varName] == null) return "";
        return moduleData[varName].toString();
    }
    /**
     * 世界 - 字符串
     * @param trigger 触发器，可能为空
     * @param p 自定义数值参数 
     */
    export function f6(trigger: CommandTrigger, p: CustomGameStringParams_6): string {
        //获取设置的名称
        let varName: string;
        if (p.worldData.selectMode == 1) {
            let mode = p.worldData.inputModeInfo.mode;
            let constName = p.worldData.inputModeInfo.constName;
            let varNameIndex = p.worldData.inputModeInfo.varNameIndex;
            varName = mode == 0 ? constName : Game.player.variable.getString(varNameIndex);
        }
        else {
            varName = p.worldData.varName;
        }
        if (WorldData[varName] == undefined || WorldData[varName] == null) return "";
        return WorldData[varName].toString();
    }
    /**
     * 系统
     */
    export function f7(trigger: CommandTrigger, p: CustomGameStringParams_7): string {
        switch (p.type) {
            case 0:
                return GUI_Setting.getSystemKeyDesc(GUI_Setting.SYSTEM_KEYS[p.systemKeys]);
            case 1:
                return `${GameAudio.lastBgmURL},${GameAudio.lastBGMVolume},${GameAudio.lastBGMPitch}`
            case 2:
                return `${GameAudio.lastBgsURL},${GameAudio.lastBGSVolume},${GameAudio.lastBGSPitch}`
            case 3:
                return ProjectUtils.timerFormat(Game.gameTime);
        }
    }
}