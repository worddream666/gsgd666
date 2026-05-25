/**
 * 该文件为GameCreator编辑器自动生成的代码，请勿修改
 */

/**
 * 1-标题界面 [BASE]
 */
class GUI_1 extends GUI_BASE {
   标题背景:UIBitmap;
   按钮底衬:UIBitmap;
   游戏标题:UIString;
   开始游戏按钮:UIButton;
   读取存档按钮:UIButton;
   游戏设置按钮:UIButton;
   退出游戏按钮:UIButton;
   文本:UIString;

   constructor(){
      super(1);
   }
}
class ListItem_1 extends UIListItemData {
   标题背景:string;
   按钮底衬:string;
   游戏标题:string;
   文本:string;

}

/**
 * 2-读档界面 [BASE]
 */
class GUI_2 extends GUI_BASE {
   图片:UIBitmap;
   背景:UIBitmap;
   顶部底衬:UIBitmap;
   滚动条背景:UIBitmap;
   list:UIList; // Item=1001
   关闭读档界面按钮:UIButton;
   界面标题:UIString;
   读档标志:UIBitmap;
   constructor(){
      super(2);
   }
}
class ListItem_2 extends UIListItemData {
   图片:string;
   背景:string;
   顶部底衬:string;
   滚动条背景:string;
   list:UIListItemData[];
   界面标题:string;
   读档标志:string;
}

/**
 * 3-菜单界面 [BASE]
 */
class GUI_3 extends GUI_BASE {
   图片:UIBitmap;
   界面背景:UIBitmap;
   背包按钮:UIButton;
   存档按钮:UIButton;
   读档按钮:UIButton;
   设置按钮:UIButton;
   返回标题界面按钮:UIButton;
   技能按钮:UIButton;
   关闭标志:UIBitmap;
   菜单装饰:UIBitmap;
   文本:UIString;

   constructor(){
      super(3);
   }
}
class ListItem_3 extends UIListItemData {
   图片:string;
   界面背景:string;
   关闭标志:string;
   菜单装饰:string;
   文本:string;

}

/**
 * 4-角色界面 [BASE]
 */
class GUI_4 extends GUI_BASE {
   背景:UIBitmap;
   actorLv:UIString;
   Level:UIString;
   等级经验容器:UIRoot;
   LevelRoot:UIRoot;
   属性显示容器:UIRoot;
   actxzt:UIAvatar;
   玩家自定义名字:UIString;
   界面标题:UIString;
   关闭角色:UIButton;
   角色属性:UIRoot;
   txtAttrAtk:UIString;
   txtAttrDef:UIString;
   txtAttrBase:UIString;
   txtAttrBasic:UIString;
   图片:UIBitmap;
   actorEquipList:UIList; // Item=1012
   HPLabel:UIString;
   HPSlider:UISlider;
   SPLabel:UIString;
   SPSlider:UISlider;
   HPText:UIString;
   SPText:UIString;

   constructor(){
      super(4);
   }
}
class ListItem_4 extends UIListItemData {
   背景:string;
   actorLv:string;
   actxzt:number;
   玩家自定义名字:string;
   界面标题:string;
   txtAttrAtk:string;
   txtAttrDef:string;
   txtAttrBase:string;
   txtAttrBasic:string;
   图片:string;
   actorEquipList:UIListItemData[];
   HPLabel:string;
   HPSlider:number;
   SPLabel:string;
   SPSlider:number;
   HPText:string;
   SPText:string;

}

/**
 * 5-存档界面 [BASE]
 */
class GUI_5 extends GUI_BASE {
   图片:UIBitmap;
   顶部底衬:UIBitmap;
   滚动条背景:UIBitmap;
   list:UIList; // Item=1001
   关闭存档界面按钮:UIButton;
   界面标题:UIString;
   文本:UIString;
   constructor(){
      super(5);
   }
}
class ListItem_5 extends UIListItemData {
   图片:string;
   顶部底衬:string;
   滚动条背景:string;
   list:UIListItemData[];
   界面标题:string;
   文本:string;
}

/**
 * 6-系统设置 [BASE]
 */
class GUI_6 extends GUI_BASE {
   顶部底衬:UIBitmap;
   界面标题:UIString;
   侧边背景:UIBitmap;
   typeTab:UITabBox;
   常规:UIRoot;
   bgmFocus:UIButton;
   背景音乐左侧底衬:UIBitmap;
   背景音乐左侧装饰:UIBitmap;
   背景音乐右侧装饰:UIBitmap;
   背景音乐滑块背景:UIBitmap;
   背景音乐音量文本:UIString;
   bgsFocus:UIButton;
   环境音效左侧底衬:UIBitmap;
   环境音效左侧装饰:UIBitmap;
   环境音效右侧装饰:UIBitmap;
   环境音效滑块背景:UIBitmap;
   环境音效音量文本:UIString;
   seFocus:UIButton;
   音效左侧底衬:UIBitmap;
   音效左侧装饰:UIBitmap;
   音效右侧装饰:UIBitmap;
   音效滑块背景:UIBitmap;
   音效音量文本:UIString;
   tsFocus:UIButton;
   语音左侧底衬:UIBitmap;
   语音左侧装饰:UIBitmap;
   语音右侧装饰:UIBitmap;
   语音滑块背景:UIBitmap;
   语音音量文本:UIString;
   bgmSlider:UISlider;
   bgsSlider:UISlider;
   seSlider:UISlider;
   tsSlider:UISlider;
   键盘控制:UIRoot;
   键盘滚动条背景:UIBitmap;
   keyboardList:UIList; // Item=1018
   keyboardReset:UIButton;
   手柄控制:UIRoot;
   手柄滚动条背景:UIBitmap;
   gamepadList:UIList; // Item=1019
   gamepadReset:UIButton;
   关闭系统设置界面按钮:UIButton;
   needInputKeyPanel:UIBitmap;
   needInputKeyLabel:UIString;
   系统设置标志:UIBitmap;
   constructor(){
      super(6);
   }
}
class ListItem_6 extends UIListItemData {
   顶部底衬:string;
   界面标题:string;
   侧边背景:string;
   typeTab:string;
   背景音乐左侧底衬:string;
   背景音乐左侧装饰:string;
   背景音乐右侧装饰:string;
   背景音乐滑块背景:string;
   背景音乐音量文本:string;
   环境音效左侧底衬:string;
   环境音效左侧装饰:string;
   环境音效右侧装饰:string;
   环境音效滑块背景:string;
   环境音效音量文本:string;
   音效左侧底衬:string;
   音效左侧装饰:string;
   音效右侧装饰:string;
   音效滑块背景:string;
   音效音量文本:string;
   语音左侧底衬:string;
   语音左侧装饰:string;
   语音右侧装饰:string;
   语音滑块背景:string;
   语音音量文本:string;
   bgmSlider:number;
   bgsSlider:number;
   seSlider:number;
   tsSlider:number;
   键盘滚动条背景:string;
   keyboardList:UIListItemData[];
   手柄滚动条背景:string;
   gamepadList:UIListItemData[];
   needInputKeyPanel:string;
   needInputKeyLabel:string;
   系统设置标志:string;
}

/**
 * 7-文本输入界面 [BASE]
 */
class GUI_7 extends GUI_BASE {
   界面背景:UIBitmap;
   界面标题背景:UIBitmap;
   输入框背景:UIBitmap;
   input:UIInput;
   提交文本输入按钮:UIButton;
   constructor(){
      super(7);
   }
}
class ListItem_7 extends UIListItemData {
   界面背景:string;
   界面标题背景:string;
   输入框背景:string;
   input:string;

}

/**
 * 8-数字输入界面 [BASE]
 */
class GUI_8 extends GUI_BASE {
   界面背景:UIBitmap;
   界面标题背景:UIBitmap;
   输入框背景:UIBitmap;
   input:UIInput;
   提交数字输入按钮:UIButton;
   constructor(){
      super(8);
   }
}
class ListItem_8 extends UIListItemData {
   界面背景:string;
   界面标题背景:string;
   输入框背景:string;
   input:string;

}

/**
 * 9-密码输入界面 [BASE]
 */
class GUI_9 extends GUI_BASE {
   界面背景:UIBitmap;
   界面标题背景:UIBitmap;
   输入框背景:UIBitmap;
   input:UIInput;
   提交密码输入按钮:UIButton;
   constructor(){
      super(9);
   }
}
class ListItem_9 extends UIListItemData {
   界面背景:string;
   界面标题背景:string;
   输入框背景:string;
   input:string;

}

/**
 * 10-游戏结束界面 [BASE]
 */
class GUI_10 extends GUI_BASE {
   半透明背景:UIBitmap;
   底部装饰:UIBitmap;
   GameOver文本:UIString;
   constructor(){
      super(10);
   }
}
class ListItem_10 extends UIListItemData {
   半透明背景:string;
   底部装饰:string;
   GameOver文本:string;
}

/**
 * 11-商店界面 [BASE]
 */
class GUI_11 extends GUI_BASE {
   顶部底衬:UIBitmap;
   侧边背景:UIBitmap;
   goodsListBox:UIBitmap;
   文字底衬:UIBitmap;
   文本_价格:UIString;
   文本_数量:UIString;
   文本_持有数量:UIString;
   滚动条背景:UIBitmap;
   goodsList:UIList; // Item=1003
   sellItemList:UIList; // Item=1003
   说明栏背景:UIBitmap;
   人物属性标题背景:UIBitmap;
   buyBox:UIRoot;
   buyBoxArea:UIRoot;
   购买数量背景底衬:UIBitmap;
   减号底衬:UIBitmap;
   加号底衬:UIBitmap;
   buyNum_text:UIString;
   sellNum_text:UIString;
   subNumBtn:UIButton;
   addNumBtn:UIButton;
   maxNumBtn:UIButton;
   购买数量背景纹路:UIBitmap;
   buyNum:UIString;
   sureBtn:UIButton;
   cancelBtn:UIButton;
   itemBox:UIBitmap;
   说明栏背景底衬:UIBitmap;
   itemName:UIString;
   itemIntroRoot:UIRoot;
   itemIntro:UIString;
   货币栏背景:UIBitmap;
   goldNum:UIString;
   closeBtn:UIButton;
   typeTab:UITabBox;
   我的金币文本:UIString;
   货币图片:UIBitmap;
   商店标志:UIBitmap;
   界面标题:UIString;
   constructor(){
      super(11);
   }
}
class ListItem_11 extends UIListItemData {
   顶部底衬:string;
   侧边背景:string;
   goodsListBox:string;
   文字底衬:string;
   文本_价格:string;
   文本_数量:string;
   文本_持有数量:string;
   滚动条背景:string;
   goodsList:UIListItemData[];
   sellItemList:UIListItemData[];
   说明栏背景:string;
   人物属性标题背景:string;
   购买数量背景底衬:string;
   减号底衬:string;
   加号底衬:string;
   buyNum_text:string;
   sellNum_text:string;
   购买数量背景纹路:string;
   buyNum:string;
   itemBox:string;
   说明栏背景底衬:string;
   itemName:string;
   itemIntro:string;
   货币栏背景:string;
   typeTab:string;
   我的金币文本:string;
   货币图片:string;
   商店标志:string;
   界面标题:string;
}

/**
 * 12-虚拟按键 [BASE]
 */
class GUI_12 extends GUI_BASE {
   容器:UIRoot;
   A:UIButton;
   B:UIButton;
   START:UIButton;
   BACK:UIButton;
   rockerBg:UIBitmap;
   rocker:UIBitmap;
   dirBtnRoot:UIRoot;
   上按钮:UIButton;
   下按钮:UIButton;
   左按钮:UIButton;
   右按钮:UIButton;
   隐藏按键:UIButton;
   隐藏标志:UIBitmap;
   猎人成就:UIBitmap;
   任务:UIBitmap;
   角色:UIBitmap;
   锻造:UIBitmap;
   文本:UIString;
   constructor(){
      super(12);
   }
}
class ListItem_12 extends UIListItemData {
   rockerBg:string;
   rocker:string;
   隐藏标志:string;
   猎人成就:string;
   任务:string;
   角色:string;
   锻造:string;
   文本:string;
}

/**
 * 13-计时器 [BASE]
 */
class GUI_13 extends GUI_BASE {
   背景框:UIBitmap;
   time:UIString;
   constructor(){
      super(13);
   }
}
class ListItem_13 extends UIListItemData {
   背景框:string;
   time:string;
}

/**
 * 14-通用提示 [BASE]
 */
class GUI_14 extends GUI_BASE {
   promptPanel:UIRoot;
   图片:UIBitmap;
   promptContentLabel:UIString;
   confirmButton:UIButton;
   cancelButton:UIButton;
   promptTitleLabel:UIString;
   constructor(){
      super(14);
   }
}
class ListItem_14 extends UIListItemData {
   图片:string;
   promptContentLabel:string;
   promptTitleLabel:string;
}

/**
 * 15-预留 [BASE]
 */
class GUI_15 extends GUI_BASE {

   constructor(){
      super(15);
   }
}
class ListItem_15 extends UIListItemData {

}

/**
 * 16-技能界面 [BASE]
 */
class GUI_16 extends GUI_BASE {
   背景:UIBitmap;
   顶部底衬:UIBitmap;
   界面标题:UIString;
   侧边背景:UIBitmap;
   魔法阵背景:UIBitmap;
   actorRoot:UIBitmap;
   actorList:UIList; // Item=1011
   技能介绍背景:UIBitmap;
   技能介绍背景顶衬:UIBitmap;
   技能详细文本:UIString;
   文本内容背景:UIBitmap;
   panel:UIBitmap;
   itemName:UIString;
   itemIntroRoot:UIRoot;
   itemIntro:UIString;
   actorSkillList:UIList; // Item=1013
   关闭按钮:UIButton;
   技能标志:UIBitmap;
   constructor(){
      super(16);
   }
}
class ListItem_16 extends UIListItemData {
   背景:string;
   顶部底衬:string;
   界面标题:string;
   侧边背景:string;
   魔法阵背景:string;
   actorRoot:string;
   actorList:UIListItemData[];
   技能介绍背景:string;
   技能介绍背景顶衬:string;
   技能详细文本:string;
   文本内容背景:string;
   panel:string;
   itemName:string;
   itemIntro:string;
   actorSkillList:UIListItemData[];
   技能标志:string;
}

/**
 * 17-指定角色 [BASE]
 */
class GUI_17 extends GUI_BASE {
   半透明背景:UIBitmap;
   targetPanel:UIBitmap;
   界面顶部背景:UIBitmap;
   actorList:UIList; // Item=1015
   closeTargetBtn:UIButton;
   文本:UIString;
   constructor(){
      super(17);
   }
}
class ListItem_17 extends UIListItemData {
   半透明背景:string;
   targetPanel:string;
   界面顶部背景:string;
   actorList:UIListItemData[];
   文本:string;
}

/**
 * 18-战斗主界面 [BASE]
 */
class GUI_18 extends GUI_BASE {
   血条背景:UIBitmap;
   蓝条背景:UIBitmap;
   经验条背景:UIBitmap;
   HPSlider:UISlider;
   SPSlider:UISlider;
   图片:UIBitmap;
   mainName:UIString;
   mainLevel:UIString;
   HPText:UIString;
   SPText:UIString;
   stateList:UIList; // Item=1028
   partyList:UIList; // Item=1024
   skillBar1:UIBitmap;
   技能图标背景:UIBitmap;
   skillList:UIList; // Item=1030
   技能1:UIString;
   技能2:UIString;
   技能3:UIString;
   skillBar2:UIRoot;
   vIcon1:GUI_SkillIconVirtual;
   vIcon2:GUI_SkillIconVirtual;
   vIcon3:GUI_SkillIconVirtual;
   EXPSlider:UISlider;
   复选框:UICheckBox;
   队友主动攻击文本:UIString;
   tipsUI:GUI_1027;
   游戏数值:UIString;
   文本:UIString;
   角色:UIButton;
   logScroller:UIRoot;
   logTextDisplay:UIString;
   老发送:UIButton;
   老输入:UIInput;
   技能提示:UIString;
   背包:UIBitmap;
   锻造:UIBitmap;
   猎人成就:UIBitmap;
   fubenquit:UIBitmap;
   任务:UIBitmap;
   排行榜:UIBitmap;
   chatContainer:UIRoot;
   聊天界面底板:UIBitmap;
   chatList:UIList; // Item=1033
   chatTabWorld:UIButton;
   chatTabPrivate:UIButton;
   chatOnlineCount:UIString;
   inputField:UIInput;
   sendButton:UIButton;
   playerList:UIList; // Item=1034
   constructor(){
      super(18);
   }
}
class ListItem_18 extends UIListItemData {
   血条背景:string;
   蓝条背景:string;
   经验条背景:string;
   HPSlider:number;
   SPSlider:number;
   图片:string;
   mainName:string;
   mainLevel:string;
   HPText:string;
   SPText:string;
   stateList:UIListItemData[];
   partyList:UIListItemData[];
   skillBar1:string;
   技能图标背景:string;
   skillList:UIListItemData[];
   vIcon1:number;
   vIcon2:number;
   vIcon3:number;
   EXPSlider:number;
   复选框:boolean;
   队友主动攻击文本:string;
   tipsUI:number;
   文本:string;
   logTextDisplay:string;
   老输入:string;
   技能提示:string;
   背包:string;
   锻造:string;
   猎人成就:string;
   fubenquit:string;
   任务:string;
   排行榜:string;
   聊天界面底板:string;
   chatList:UIListItemData[];
   chatOnlineCount:string;
   inputField:string;
   playerList:UIListItemData[];
}

/**
 * 19-新的数据 [BASE]
 */
class GUI_19 extends GUI_BASE {

   constructor(){
      super(19);
   }
}
class ListItem_19 extends UIListItemData {

}

/**
 * 20-地牢通关界面 [BASE]
 */
class GUI_20 extends GUI_BASE {
   黑色底衬:UIBitmap;
   文字背景:UIBitmap;
   通关文字:UIString;
   constructor(){
      super(20);
   }
}
class ListItem_20 extends UIListItemData {
   黑色底衬:string;
   文字背景:string;
   通关文字:string;
}

/**
 * 21-技能特写界面 [BASE]
 */
class GUI_21 extends GUI_BASE {

   constructor(){
      super(21);
   }
}
class ListItem_21 extends UIListItemData {

}

/**
 * 22-创建角色 [BASE]
 */
class GUI_22 extends GUI_BASE {
   图片:UIBitmap;
   名字背景:UIBitmap;
   namestar:UIBitmap;
   crenam:UIInput;
   constructor(){
      super(22);
   }
}
class ListItem_22 extends UIListItemData {
   图片:string;
   名字背景:string;
   namestar:string;
   crenam:string;
}

/**
 * 23-背包界面 [BASE]
 */
class GUI_23 extends GUI_BASE {
   leftPanel:UIBitmap;
   分隔线:UIBitmap;
   goodsList:UIList; // Item=1002
   itemIntroRoot:UIRoot;
   itemIntro:UIString;
   itemName:UIString;
   discardArea:UIButton;
   constructor(){
      super(23);
   }
}
class ListItem_23 extends UIListItemData {
   leftPanel:string;
   分隔线:string;
   goodsList:UIListItemData[];
   itemIntro:string;
   itemName:string;

}

/**
 * 24-提示框 [BASE]
 */
class GUI_24 extends GUI_BASE {
   提示背景:UIBitmap;
   提示内容:UIString;
   yes:UIButton;
   no:UIButton;
   constructor(){
      super(24);
   }
}
class ListItem_24 extends UIListItemData {
   提示背景:string;
   提示内容:string;

}

/**
 * 25-聊天界面模型 [BASE]
 */
class GUI_25 extends GUI_BASE {
   messageLabel:UIString;
   constructor(){
      super(25);
   }
}
class ListItem_25 extends UIListItemData {
   messageLabel:string;
}

/**
 * 26-聊天界面 [BASE]
 */
class GUI_26 extends GUI_BASE {

   constructor(){
      super(26);
   }
}
class ListItem_26 extends UIListItemData {

}

/**
 * 27-怪物信息面板  [BASE]
 */
class GUI_27 extends GUI_BASE {
   图片:UIBitmap;
   HPSlider:UISlider;
   SPSlider:UISlider;
   HPText:UIString;
   SPText:UIString;
   avatarIcon:UIBitmap;
   detailLabel:UIString;
   constructor(){
      super(27);
   }
}
class ListItem_27 extends UIListItemData {
   图片:string;
   HPSlider:number;
   SPSlider:number;
   HPText:string;
   SPText:string;
   avatarIcon:string;
   detailLabel:string;
}

/**
 * 28-新的数据 [BASE]
 */
class GUI_28 extends GUI_BASE {

   constructor(){
      super(28);
   }
}
class ListItem_28 extends UIListItemData {

}

/**
 * 29-日志项 [BASE]
 */
class GUI_29 extends GUI_BASE {
   日志名:UIString;
   constructor(){
      super(29);
   }
}
class ListItem_29 extends UIListItemData {
   日志名:string;
}

/**
 * 30-日志 [BASE]
 */
class GUI_30 extends GUI_BASE {
   图片:UIBitmap;
   日志列表:UIList; // Item=29
   日志内容:UIString;
   关闭:UIButton;
   constructor(){
      super(30);
   }
}
class ListItem_30 extends UIListItemData {
   图片:string;
   日志列表:UIListItemData[];
   日志内容:string;

}

/**
 * 31-锻造 [BASE]
 */
class GUI_31 extends GUI_BASE {
   整体背景:UIBitmap;
   mainTabBox:UITabBox;
   界面标题:UIString;
   关闭:UIButton;
   equipmentSubTabBox:UITabBox;
   craftingPanel:UIRoot;
   图片:UIBitmap;
   mainMaterialSlotbg:UIBitmap;
   辅材1:UIBitmap;
   辅材2:UIBitmap;
   辅材3:UIBitmap;
   辅材4:UIBitmap;
   产物:UIBitmap;
   goldCostLabel:UIString;
   craftButton:UIButton;
   mainMaterialSlot:UIBitmap;
   mainMaterialCountLabel:UIString;
   auxMaterialSlot1:UIBitmap;
   auxMaterialCountLabel1:UIString;
   auxMaterialSlot2:UIBitmap;
   auxMaterialCountLabel2:UIString;
   auxMaterialSlot3:UIBitmap;
   auxMaterialSlot4:UIBitmap;
   craftTip1:UIString;
   craftTip2:UIString;
   productSlot:UIBitmap;
   productBg1:UIBitmap;
   productBg2:UIBitmap;
   productBg3:UIBitmap;
   productBg4:UIBitmap;
   productBg5:UIBitmap;
   productSlot1:UIBitmap;
   productSlot2:UIBitmap;
   productSlot3:UIBitmap;
   productSlot4:UIBitmap;
   productSlot5:UIBitmap;
   auxMaterialCountLabel3:UIString;
   auxMaterialCountLabel4:UIString;
   craftSuccessLabel:UIString;
   rechargePanel:UIRoot;
   装备底框:UIBitmap;
   rechargeSlot:UIBitmap;
   rechargeNameLabel:UIString;
   rechargePotencyLabel:UIString;
   rechargeBtn:UIButton;
   rechargeCostLabel:UIString;
   rechargeAttrLabel1:UIString;
   rechargeAttrLabel2:UIString;
   rechargeAttrLabel3:UIString;
   rechargeAttrLabel4:UIString;
   rechargeAttrLabel5:UIString;
   backpackPageUp:UIButton;
   backpackPageLabel:UIString;
   backpackPageDown:UIButton;
   rechargeSuccessLabel:UIString;
   backpackList:UIList; // Item=40
   combinePanel:UIRoot;
   combineMainSlot:UIBitmap;
   combineSubSlot:UIBitmap;
   combineMainName:UIString;
   combineSubName:UIString;
   combineBtn:UIButton;
   combineTipLabel:UIString;
   combineAttrLabel1:UIString;
   combineAttrLabel5:UIString;
   combineAttrLabel4:UIString;
   combineAttrLabel3:UIString;
   combineAttrLabel2:UIString;
   combineSuccessLabel:UIString;
   transferPanel:UIRoot;
   transferMainSlot:UIBitmap;
   transferSubSlot:UIBitmap;
   transferMainName:UIString;
   transferSubName:UIString;
   transferBtn:UIButton;
   transferCostLabel:UIString;
   transferMainAttrLabel1:UIString;
   transferMainAttrLabel5:UIString;
   transferMainAttrLabel4:UIString;
   transferMainAttrLabel3:UIString;
   transferMainAttrLabel2:UIString;
   transferSubAttrLabel1:UIString;
   transferSubAttrLabel5:UIString;
   transferSubAttrLabel4:UIString;
   transferSubAttrLabel3:UIString;
   transferSubAttrLabel2:UIString;
   constructor(){
      super(31);
   }
}
class ListItem_31 extends UIListItemData {
   整体背景:string;
   mainTabBox:string;
   界面标题:string;
   equipmentSubTabBox:string;
   图片:string;
   mainMaterialSlotbg:string;
   辅材1:string;
   辅材2:string;
   辅材3:string;
   辅材4:string;
   产物:string;
   goldCostLabel:string;
   mainMaterialSlot:string;
   mainMaterialCountLabel:string;
   auxMaterialSlot1:string;
   auxMaterialCountLabel1:string;
   auxMaterialSlot2:string;
   auxMaterialCountLabel2:string;
   auxMaterialSlot3:string;
   auxMaterialSlot4:string;
   craftTip1:string;
   craftTip2:string;
   productSlot:string;
   productBg1:string;
   productBg2:string;
   productBg3:string;
   productBg4:string;
   productBg5:string;
   productSlot1:string;
   productSlot2:string;
   productSlot3:string;
   productSlot4:string;
   productSlot5:string;
   auxMaterialCountLabel3:string;
   auxMaterialCountLabel4:string;
   craftSuccessLabel:string;
   装备底框:string;
   rechargeSlot:string;
   rechargeNameLabel:string;
   rechargePotencyLabel:string;
   rechargeCostLabel:string;
   rechargeAttrLabel1:string;
   rechargeAttrLabel2:string;
   rechargeAttrLabel3:string;
   rechargeAttrLabel4:string;
   rechargeAttrLabel5:string;
   backpackPageLabel:string;
   rechargeSuccessLabel:string;
   backpackList:UIListItemData[];
   combineMainSlot:string;
   combineSubSlot:string;
   combineMainName:string;
   combineSubName:string;
   combineTipLabel:string;
   combineAttrLabel1:string;
   combineAttrLabel5:string;
   combineAttrLabel4:string;
   combineAttrLabel3:string;
   combineAttrLabel2:string;
   combineSuccessLabel:string;
   transferMainSlot:string;
   transferSubSlot:string;
   transferMainName:string;
   transferSubName:string;
   transferCostLabel:string;
   transferMainAttrLabel1:string;
   transferMainAttrLabel5:string;
   transferMainAttrLabel4:string;
   transferMainAttrLabel3:string;
   transferMainAttrLabel2:string;
   transferSubAttrLabel1:string;
   transferSubAttrLabel5:string;
   transferSubAttrLabel4:string;
   transferSubAttrLabel3:string;
   transferSubAttrLabel2:string;
}

/**
 * 32-化合显示项 [BASE]
 */
class GUI_32 extends GUI_BASE {
   道具背景:UIBitmap;
   itemNameLabel:UIString;
   attrTxt:UIString;
   constructor(){
      super(32);
   }
}
class ListItem_32 extends UIListItemData {
   道具背景:string;
   itemNameLabel:string;
   attrTxt:string;
}

/**
 * 33-新的数据 [BASE]
 */
class GUI_33 extends GUI_BASE {

   constructor(){
      super(33);
   }
}
class ListItem_33 extends UIListItemData {

}

/**
 * 34-打造 [BASE]
 */
class GUI_34 extends GUI_BASE {
   mainMaterialSlot:UIBitmap;
   mainMaterialCountLabel:UIString;
   图片:UIBitmap;
   辅材1:UIBitmap;
   auxMaterialSlot1:UIBitmap;
   auxMaterialCountLabel1:UIString;
   辅材2:UIBitmap;
   auxMaterialSlot2:UIBitmap;
   auxMaterialCountLabel2:UIString;
   辅材3:UIBitmap;
   auxMaterialSlot3:UIBitmap;
   auxMaterialCountLabel3:UIString;
   辅材4:UIBitmap;
   auxMaterialSlot4:UIBitmap;
   auxMaterialCountLabel4:UIString;
   产物:UIBitmap;
   productSlot:UIBitmap;
   goldCostLabel:UIString;
   craftButton:UIButton;
   backpackList:UIList; // Item=40
   constructor(){
      super(34);
   }
}
class ListItem_34 extends UIListItemData {
   mainMaterialSlot:string;
   mainMaterialCountLabel:string;
   图片:string;
   辅材1:string;
   auxMaterialSlot1:string;
   auxMaterialCountLabel1:string;
   辅材2:string;
   auxMaterialSlot2:string;
   auxMaterialCountLabel2:string;
   辅材3:string;
   auxMaterialSlot3:string;
   auxMaterialCountLabel3:string;
   辅材4:string;
   auxMaterialSlot4:string;
   auxMaterialCountLabel4:string;
   产物:string;
   productSlot:string;
   goldCostLabel:string;
   backpackList:UIListItemData[];
}

/**
 * 35- [BASE]
 */
class GUI_35 extends GUI_BASE {

   constructor(){
      super(35);
   }
}
class ListItem_35 extends UIListItemData {

}

/**
 * 36- [BASE]
 */
class GUI_36 extends GUI_BASE {

   constructor(){
      super(36);
   }
}
class ListItem_36 extends UIListItemData {

}

/**
 * 37- [BASE]
 */
class GUI_37 extends GUI_BASE {

   constructor(){
      super(37);
   }
}
class ListItem_37 extends UIListItemData {

}

/**
 * 38-新的数据 [BASE]
 */
class GUI_38 extends GUI_BASE {

   constructor(){
      super(38);
   }
}
class ListItem_38 extends UIListItemData {

}

/**
 * 39-新的数据 [BASE]
 */
class GUI_39 extends GUI_BASE {

   constructor(){
      super(39);
   }
}
class ListItem_39 extends UIListItemData {

}

/**
 * 40-列表项模版 [BASE]
 */
class GUI_40 extends GUI_BASE {
   道具背景:UIBitmap;
   itemNameLabel:UIString;
   itemIcon:UIBitmap;
   itemCountLabel:UIString;
   constructor(){
      super(40);
   }
}
class ListItem_40 extends UIListItemData {
   道具背景:string;
   itemNameLabel:string;
   itemIcon:string;
   itemCountLabel:string;
}

/**
 * 41-验证界面 [BASE]
 */
class GUI_41 extends GUI_BASE {
   图片:UIBitmap;
   提示内容:UIString;
   testID:UIInput;
   confirmButton:UIButton;
   文本:UIString;
   风雪阁:UIString;
   constructor(){
      super(41);
   }
}
class ListItem_41 extends UIListItemData {
   图片:string;
   提示内容:string;
   testID:string;
   文本:string;
   风雪阁:string;
}

/**
 * 42-副本界面 [BASE]
 */
class GUI_42 extends GUI_BASE {
   bg:UIBitmap;
   bossNameLabel:UIString;
   sys_title:UIString;
   推荐等级:UIString;
   参与次数:UIString;
   参与人数:UIString;
   推荐攻击:UIString;
   推荐防御:UIString;
   sys_info_level:UIString;
   sys_info_count:UIString;
   提示:UIString;
   sys_info_atk:UIString;
   sys_info_def:UIString;
   sys_tab:UITabBox;
   sys_btn_enter:UIButton;
   sys_text_strategy:UIString;
   sys_text_intro:UIString;
   sys_list_loot:UIList; // Item=43
   sys_bossAvatar:UIBitmap;
   按钮:UIButton;
   任意系:UIString;

   constructor(){
      super(42);
   }
}
class ListItem_42 extends UIListItemData {
   bg:string;
   bossNameLabel:string;
   sys_title:string;
   推荐等级:string;
   参与次数:string;
   参与人数:string;
   推荐攻击:string;
   推荐防御:string;
   sys_info_level:string;
   sys_info_count:string;
   提示:string;
   sys_info_atk:string;
   sys_info_def:string;
   sys_tab:string;
   sys_text_strategy:string;
   sys_text_intro:string;
   sys_list_loot:UIListItemData[];
   sys_bossAvatar:string;
   任意系:string;

}

/**
 * 43-掉落子项 [BASE]
 */
class GUI_43 extends GUI_BASE {
   道具背景:UIBitmap;
   sys_quality:UIRoot;
   sys_icon:UIBitmap;
   sys_num:UIString;
   constructor(){
      super(43);
   }
}
class ListItem_43 extends UIListItemData {
   道具背景:string;
   sys_icon:string;
   sys_num:string;
}

/**
 * 44-游戏开始界面 [BASE]
 */
class GUI_44 extends GUI_BASE {
   图片:UIBitmap;
   constructor(){
      super(44);
   }
}
class ListItem_44 extends UIListItemData {
   图片:string;
}

/**
 * 45- [BASE]
 */
class GUI_45 extends GUI_BASE {

   constructor(){
      super(45);
   }
}
class ListItem_45 extends UIListItemData {

}

/**
 * 1001-档案_Item [BASE]
 */
class GUI_1001 extends GUI_BASE {
   项目背景:UIBitmap;
   项目左侧底衬:UIBitmap;
   项目左侧装饰:UIBitmap;
   项目右侧装饰:UIBitmap;
   截图背景:UIBitmap;
   screenshotImg:UIBitmap;
   mapName:UIString;
   no:UIString;
   delBtn:UIButton;
   texts:UIRoot;
   游戏时长文本:UIString;
   创建时间文本:UIString;
   gameTimeStr:UIString;
   dateStr:UIString;
   constructor(){
      super(1001);
   }
}
class ListItem_1001 extends UIListItemData {
   项目背景:string;
   项目左侧底衬:string;
   项目左侧装饰:string;
   项目右侧装饰:string;
   截图背景:string;
   screenshotImg:string;
   mapName:string;
   no:string;
   游戏时长文本:string;
   创建时间文本:string;
   gameTimeStr:string;
   dateStr:string;
}

/**
 * 1002-道具_Item [BASE]
 */
class GUI_1002 extends GUI_BASE {
   道具背景:UIBitmap;
   icon:UIBitmap;
   itemNum:UIString;
   constructor(){
      super(1002);
   }
}
class ListItem_1002 extends UIListItemData {
   道具背景:string;
   icon:string;
   itemNum:string;
}

/**
 * 1003-商品_Item [BASE]
 */
class GUI_1003 extends GUI_BASE {
   项目背景:UIBitmap;
   项目左侧底衬:UIBitmap;
   项目左侧装饰:UIBitmap;
   项目右侧装饰:UIBitmap;
   ownNum:UIString;
   itemNum:UIString;
   itemPrice:UIString;
   itemName:UIString;
   icon:UIBitmap;
   constructor(){
      super(1003);
   }
}
class ListItem_1003 extends UIListItemData {
   项目背景:string;
   项目左侧底衬:string;
   项目左侧装饰:string;
   项目右侧装饰:string;
   ownNum:string;
   itemNum:string;
   itemPrice:string;
   itemName:string;
   icon:string;
}

/**
 * 1004- [BASE]
 */
class GUI_1004 extends GUI_BASE {

   constructor(){
      super(1004);
   }
}
class ListItem_1004 extends UIListItemData {

}

/**
 * 1005- [BASE]
 */
class GUI_1005 extends GUI_BASE {

   constructor(){
      super(1005);
   }
}
class ListItem_1005 extends UIListItemData {

}

/**
 * 1006- [BASE]
 */
class GUI_1006 extends GUI_BASE {

   constructor(){
      super(1006);
   }
}
class ListItem_1006 extends UIListItemData {

}

/**
 * 1007- [BASE]
 */
class GUI_1007 extends GUI_BASE {

   constructor(){
      super(1007);
   }
}
class ListItem_1007 extends UIListItemData {

}

/**
 * 1008-按钮选中效果样式1 [BASE]
 */
class GUI_1008 extends GUI_BASE {
   容器:UIRoot;
   target:UIBitmap;
   constructor(){
      super(1008);
   }
}
class ListItem_1008 extends UIListItemData {
   target:string;
}

/**
 * 1009-按钮选中效果样式2 [BASE]
 */
class GUI_1009 extends GUI_BASE {
   容器:UIRoot;
   target:UIBitmap;
   constructor(){
      super(1009);
   }
}
class ListItem_1009 extends UIListItemData {
   target:string;
}

/**
 * 1010-按钮选中效果样式3 [BASE]
 */
class GUI_1010 extends GUI_BASE {
   容器:UIRoot;
   target:UIBitmap;
   constructor(){
      super(1010);
   }
}
class ListItem_1010 extends UIListItemData {
   target:string;
}

/**
 * 1011-角色_Item [BASE]
 */
class GUI_1011 extends GUI_BASE {
   头像底衬:UIBitmap;
   face:UIBitmap;
   deadSign:UIBitmap;
   阵亡文字:UIString;
   constructor(){
      super(1011);
   }
}
class ListItem_1011 extends UIListItemData {
   头像底衬:string;
   face:string;
   deadSign:string;
   阵亡文字:string;
}

/**
 * 1012-角色装备_Item [BASE]
 */
class GUI_1012 extends GUI_BASE {
   容器:UIRoot;
   partName:UIString;
   icon:UIBitmap;
   tierLabel:UIString;
   constructor(){
      super(1012);
   }
}
class ListItem_1012 extends UIListItemData {
   partName:string;
   icon:string;
   tierLabel:string;
}

/**
 * 1013-角色技能_item [BASE]
 */
class GUI_1013 extends GUI_BASE {
   技能图标背景:UIBitmap;
   技能图标容器:UIRoot;
   icon:UIBitmap;
   constructor(){
      super(1013);
   }
}
class ListItem_1013 extends UIListItemData {
   技能图标背景:string;
   icon:string;
}

/**
 * 1014-技能界面的角色_Item [BASE]
 */
class GUI_1014 extends GUI_BASE {
   头像底衬:UIBitmap;
   face:UIBitmap;
   deadSign:UIBitmap;
   阵亡文字:UIString;
   constructor(){
      super(1014);
   }
}
class ListItem_1014 extends UIListItemData {
   头像底衬:string;
   face:string;
   deadSign:string;
   阵亡文字:string;
}

/**
 * 1015-目标角色选择_Item [BASE]
 */
class GUI_1015 extends GUI_BASE {
   actorInfoBox:UIBitmap;
   魔法条底部:UIBitmap;
   spSlider:UISlider;
   头像底衬:UIBitmap;
   actorFace:UIBitmap;
   生命条底部:UIBitmap;
   职业底衬:UIBitmap;
   hpSlider:UISlider;
   hpText:UIString;
   spText:UIString;
   actorName:UIString;
   actorLvLabel:UIString;
   actorLv:UIString;
   classText:UIString;
   deadSign:UIBitmap;
   阵亡文字:UIString;
   classIcon:UIBitmap;
   constructor(){
      super(1015);
   }
}
class ListItem_1015 extends UIListItemData {
   actorInfoBox:string;
   魔法条底部:string;
   spSlider:number;
   头像底衬:string;
   actorFace:string;
   生命条底部:string;
   职业底衬:string;
   hpSlider:number;
   hpText:string;
   spText:string;
   actorName:string;
   actorLvLabel:string;
   actorLv:string;
   classText:string;
   deadSign:string;
   阵亡文字:string;
   classIcon:string;
}

/**
 * 1016- [BASE]
 */
class GUI_1016 extends GUI_BASE {

   constructor(){
      super(1016);
   }
}
class ListItem_1016 extends UIListItemData {

}

/**
 * 1017- [BASE]
 */
class GUI_1017 extends GUI_BASE {

   constructor(){
      super(1017);
   }
}
class ListItem_1017 extends UIListItemData {

}

/**
 * 1018-设置_Item1 [BASE]
 */
class GUI_1018 extends GUI_BASE {
   项目背景:UIBitmap;
   背景音乐左侧底衬:UIBitmap;
   背景音乐左侧装饰:UIBitmap;
   背景音乐右侧装饰:UIBitmap;
   keyName:UIString;
   key1:UIButton;
   key2:UIButton;
   key3:UIButton;
   key4:UIButton;
   constructor(){
      super(1018);
   }
}
class ListItem_1018 extends UIListItemData {
   项目背景:string;
   背景音乐左侧底衬:string;
   背景音乐左侧装饰:string;
   背景音乐右侧装饰:string;
   keyName:string;

}

/**
 * 1019-设置_Item2 [BASE]
 */
class GUI_1019 extends GUI_BASE {
   项目背景:UIBitmap;
   背景音乐左侧底衬:UIBitmap;
   背景音乐左侧装饰:UIBitmap;
   背景音乐右侧装饰:UIBitmap;
   keyName:UIString;
   key1:UIButton;
   constructor(){
      super(1019);
   }
}
class ListItem_1019 extends UIListItemData {
   项目背景:string;
   背景音乐左侧底衬:string;
   背景音乐左侧装饰:string;
   背景音乐右侧装饰:string;
   keyName:string;

}

/**
 * 1020- [BASE]
 */
class GUI_1020 extends GUI_BASE {

   constructor(){
      super(1020);
   }
}
class ListItem_1020 extends UIListItemData {

}

/**
 * 1021- [BASE]
 */
class GUI_1021 extends GUI_BASE {

   constructor(){
      super(1021);
   }
}
class ListItem_1021 extends UIListItemData {

}

/**
 * 1022-===== 战斗相关 ==== [BASE]
 */
class GUI_1022 extends GUI_BASE {

   constructor(){
      super(1022);
   }
}
class ListItem_1022 extends UIListItemData {

}

/**
 * 1023-战斗者血条 [BASE]
 */
class GUI_1023 extends GUI_BASE {
   血条背景:UIBitmap;
   hpBar:UISlider;
   hpText:UIString;
   玩家自定义名字:UIString;
   最终名字:UIString;
   constructor(){
      super(1023);
   }
}
class ListItem_1023 extends UIListItemData {
   血条背景:string;
   hpBar:number;
   hpText:string;
   玩家自定义名字:string;
   最终名字:string;
}

/**
 * 1024-主界面-队友ITEM [BASE]
 */
class GUI_1024 extends GUI_BASE {
   actorName:UIString;
   levelLabel:UIString;
   血条背景:UIBitmap;
   蓝条背景:UIBitmap;
   HPSlider:UISlider;
   SPSlider:UISlider;
   stateList:UIList; // Item=1029
   constructor(){
      super(1024);
   }
}
class ListItem_1024 extends UIListItemData {
   actorName:string;
   levelLabel:string;
   血条背景:string;
   蓝条背景:string;
   HPSlider:number;
   SPSlider:number;
   stateList:UIListItemData[];
}

/**
 * 1025- [BASE]
 */
class GUI_1025 extends GUI_BASE {

   constructor(){
      super(1025);
   }
}
class ListItem_1025 extends UIListItemData {

}

/**
 * 1026-战斗人物头像状态_Item [BASE]
 */
class GUI_1026 extends GUI_BASE {
   icon:UIBitmap;
   layer:UIString;
   constructor(){
      super(1026);
   }
}
class ListItem_1026 extends UIListItemData {
   icon:string;
   layer:string;
}

/**
 * 1027-战斗：说明栏 [BASE]
 */
class GUI_1027 extends GUI_BASE {
   说明栏背景:UIBitmap;
   descText:UIString;
   descName:UIString;
   constructor(){
      super(1027);
   }
}
class ListItem_1027 extends UIListItemData {
   说明栏背景:string;
   descText:string;
   descName:string;
}

/**
 * 1028-主界面-控制者状态_Item [BASE]
 */
class GUI_1028 extends GUI_BASE {
   icon:UIBitmap;
   layer:UIString;
   constructor(){
      super(1028);
   }
}
class ListItem_1028 extends UIListItemData {
   icon:string;
   layer:string;
}

/**
 * 1029-主界面-队友状态_Item [BASE]
 */
class GUI_1029 extends GUI_BASE {
   icon:UIBitmap;
   layer:UIString;
   constructor(){
      super(1029);
   }
}
class ListItem_1029 extends UIListItemData {
   icon:string;
   layer:string;
}

/**
 * 1030-主界面-技能_item [BASE]
 */
class GUI_1030 extends GUI_BASE {
   iconBg:UIBitmap;
   target:UIRoot;
   iconBlack:UIBitmap;
   icon:UIBitmap;
   coolingMask:UIRoot;
   constructor(){
      super(1030);
   }
}
class ListItem_1030 extends UIListItemData {
   iconBg:string;
   iconBlack:string;
   icon:string;

}

/**
 * 1031-主界面-技能_虚拟按键_item [BASE]
 */
class GUI_1031 extends GUI_BASE {
   iconBg:UIBitmap;
   容器:UIRoot;
   target:UIRoot;
   iconBlack:UIBitmap;
   icon:UIBitmap;
   coolingMask:UIRoot;
   constructor(){
      super(1031);
   }
}
class ListItem_1031 extends UIListItemData {
   iconBg:string;
   iconBlack:string;
   icon:string;

}

/**
 * 1032-地图道具名称 [BASE]
 */
class GUI_1032 extends GUI_BASE {
   nameBtn:UIButton;
   constructor(){
      super(1032);
   }
}
class ListItem_1032 extends UIListItemData {

}

/**
 * 1033-消息列表子项 [BASE]
 */
class GUI_1033 extends GUI_BASE {
   msgText:UIString;
   msgName:UIString;
   constructor(){
      super(1033);
   }
}
class ListItem_1033 extends UIListItemData {
   msgText:string;
   msgName:string;
}

/**
 * 1034-私聊列表子项 [BASE]
 */
class GUI_1034 extends GUI_BASE {
   playerName:UIString;
   playerStatus:UIString;
   constructor(){
      super(1034);
   }
}
class ListItem_1034 extends UIListItemData {
   playerName:string;
   playerStatus:string;
}

/**
 * 1035- [BASE]
 */
class GUI_1035 extends GUI_BASE {

   constructor(){
      super(1035);
   }
}
class ListItem_1035 extends UIListItemData {

}

/**
 * 1036- [BASE]
 */
class GUI_1036 extends GUI_BASE {

   constructor(){
      super(1036);
   }
}
class ListItem_1036 extends UIListItemData {

}

/**
 * 1037- [BASE]
 */
class GUI_1037 extends GUI_BASE {

   constructor(){
      super(1037);
   }
}
class ListItem_1037 extends UIListItemData {

}

/**
 * 1038- [BASE]
 */
class GUI_1038 extends GUI_BASE {

   constructor(){
      super(1038);
   }
}
class ListItem_1038 extends UIListItemData {

}

/**
 * 1039- [BASE]
 */
class GUI_1039 extends GUI_BASE {

   constructor(){
      super(1039);
   }
}
class ListItem_1039 extends UIListItemData {

}

/**
 * 1040-==== 伤害显示-敌人 ==== [BASE]
 */
class GUI_1040 extends GUI_BASE {

   constructor(){
      super(1040);
   }
}
class ListItem_1040 extends UIListItemData {

}

/**
 * 1041-miss [BASE]
 */
class GUI_1041 extends GUI_BASE {
   target:UIRoot;
   targetLabel:UIString;
   constructor(){
      super(1041);
   }
}
class ListItem_1041 extends UIListItemData {
   targetLabel:string;
}

/**
 * 1042-物理伤害-敌人 [BASE]
 */
class GUI_1042 extends GUI_BASE {
   target:UIRoot;
   damage:UIString;
   constructor(){
      super(1042);
   }
}
class ListItem_1042 extends UIListItemData {
   damage:string;
}

/**
 * 1043-魔法伤害-敌人 [BASE]
 */
class GUI_1043 extends GUI_BASE {
   target:UIRoot;
   damage:UIString;
   constructor(){
      super(1043);
   }
}
class ListItem_1043 extends UIListItemData {
   damage:string;
}

/**
 * 1044-真实伤害-敌人 [BASE]
 */
class GUI_1044 extends GUI_BASE {
   target:UIRoot;
   damage:UIString;
   constructor(){
      super(1044);
   }
}
class ListItem_1044 extends UIListItemData {
   damage:string;
}

/**
 * 1045-恢复生命值-敌人 [BASE]
 */
class GUI_1045 extends GUI_BASE {
   target:UIRoot;
   damage:UIString;
   constructor(){
      super(1045);
   }
}
class ListItem_1045 extends UIListItemData {
   damage:string;
}

/**
 * 1046-恢复魔法值-敌人 [BASE]
 */
class GUI_1046 extends GUI_BASE {
   target:UIRoot;
   damage:UIString;
   constructor(){
      super(1046);
   }
}
class ListItem_1046 extends UIListItemData {
   damage:string;
}

/**
 * 1047-格挡 [BASE]
 */
class GUI_1047 extends GUI_BASE {
   target:UIRoot;
   targetLabel:UIString;
   格挡图片:UIBitmap;
   constructor(){
      super(1047);
   }
}
class ListItem_1047 extends UIListItemData {
   targetLabel:string;
   格挡图片:string;
}

/**
 * 1048- [BASE]
 */
class GUI_1048 extends GUI_BASE {

   constructor(){
      super(1048);
   }
}
class ListItem_1048 extends UIListItemData {

}

/**
 * 1049- [BASE]
 */
class GUI_1049 extends GUI_BASE {

   constructor(){
      super(1049);
   }
}
class ListItem_1049 extends UIListItemData {

}

/**
 * 1050-===== 掉落显示 ==== [BASE]
 */
class GUI_1050 extends GUI_BASE {

   constructor(){
      super(1050);
   }
}
class ListItem_1050 extends UIListItemData {

}

/**
 * 1051-经验值掉落文本 [BASE]
 */
class GUI_1051 extends GUI_BASE {
   target:UIRoot;
   txt:UIString;
   constructor(){
      super(1051);
   }
}
class ListItem_1051 extends UIListItemData {
   txt:string;
}

/**
 * 1052-金币掉落文本 [BASE]
 */
class GUI_1052 extends GUI_BASE {
   target:UIRoot;
   txt:UIString;
   constructor(){
      super(1052);
   }
}
class ListItem_1052 extends UIListItemData {
   txt:string;
}

/**
 * 1053-获得道具 [BASE]
 */
class GUI_1053 extends GUI_BASE {
   itemBox:UIBitmap;
   itemTxt:UIString;
   itemIcon:UIBitmap;
   constructor(){
      super(1053);
   }
}
class ListItem_1053 extends UIListItemData {
   itemBox:string;
   itemTxt:string;
   itemIcon:string;
}

/**
 * 1054- [BASE]
 */
class GUI_1054 extends GUI_BASE {

   constructor(){
      super(1054);
   }
}
class ListItem_1054 extends UIListItemData {

}

/**
 * 1055-==== 伤害显示-玩家 ==== [BASE]
 */
class GUI_1055 extends GUI_BASE {

   constructor(){
      super(1055);
   }
}
class ListItem_1055 extends UIListItemData {

}

/**
 * 1056-miss [BASE]
 */
class GUI_1056 extends GUI_BASE {
   target:UIRoot;
   targetLabel:UIString;
   constructor(){
      super(1056);
   }
}
class ListItem_1056 extends UIListItemData {
   targetLabel:string;
}

/**
 * 1057-物理伤害-玩家 [BASE]
 */
class GUI_1057 extends GUI_BASE {
   target:UIRoot;
   damage:UIString;
   constructor(){
      super(1057);
   }
}
class ListItem_1057 extends UIListItemData {
   damage:string;
}

/**
 * 1058-魔法伤害-玩家 [BASE]
 */
class GUI_1058 extends GUI_BASE {
   target:UIRoot;
   damage:UIString;
   constructor(){
      super(1058);
   }
}
class ListItem_1058 extends UIListItemData {
   damage:string;
}

/**
 * 1059-真实伤害-玩家 [BASE]
 */
class GUI_1059 extends GUI_BASE {
   target:UIRoot;
   damage:UIString;
   constructor(){
      super(1059);
   }
}
class ListItem_1059 extends UIListItemData {
   damage:string;
}

/**
 * 1060-恢复生命值-玩家 [BASE]
 */
class GUI_1060 extends GUI_BASE {
   target:UIRoot;
   damage:UIString;
   constructor(){
      super(1060);
   }
}
class ListItem_1060 extends UIListItemData {
   damage:string;
}

/**
 * 1061-恢复魔法值-玩家 [BASE]
 */
class GUI_1061 extends GUI_BASE {
   target:UIRoot;
   damage:UIString;
   constructor(){
      super(1061);
   }
}
class ListItem_1061 extends UIListItemData {
   damage:string;
}

/**
 * 1062- [BASE]
 */
class GUI_1062 extends GUI_BASE {

   constructor(){
      super(1062);
   }
}
class ListItem_1062 extends UIListItemData {

}

/**
 * 2001-启动载入界面 [BASE]
 */
class GUI_2001 extends GUI_BASE {
   图片:UIBitmap;
   进度条背景:UIBitmap;
   loadingComp:UISlider;
   加载文本:UIString;
   行走图:UIAvatar;
   constructor(){
      super(2001);
   }
}
class ListItem_2001 extends UIListItemData {
   图片:string;
   进度条背景:string;
   loadingComp:number;
   加载文本:string;
   行走图:number;
}

/**
 * 2002-新游戏载入界面 [BASE]
 */
class GUI_2002 extends GUI_BASE {
   图片:UIBitmap;
   constructor(){
      super(2002);
   }
}
class ListItem_2002 extends UIListItemData {
   图片:string;
}

/**
 * 2003-读档载入界面 [BASE]
 */
class GUI_2003 extends GUI_BASE {
   图片:UIBitmap;
   文本:UIString;
   constructor(){
      super(2003);
   }
}
class ListItem_2003 extends UIListItemData {
   图片:string;
   文本:string;
}

/**
 * 2004-场景载入界面 [BASE]
 */
class GUI_2004 extends GUI_BASE {
   图片:UIBitmap;
   constructor(){
      super(2004);
   }
}
class ListItem_2004 extends UIListItemData {
   图片:string;
}

/**
 * 2005-场景名称界面 [BASE]
 */
class GUI_2005 extends GUI_BASE {
   图片:UIBitmap;
   提示背景:UIBitmap;
   场景名称:UIString;
   constructor(){
      super(2005);
   }
}
class ListItem_2005 extends UIListItemData {
   图片:string;
   提示背景:string;
   场景名称:string;
}

/**
 * 3001-我的自定义界面 [BASE]
 */
class GUI_3001 extends GUI_BASE {
   文本:UIString;
   图片:UIBitmap;
   游戏数值:UIString;
   按钮:UIButton;
   constructor(){
      super(3001);
   }
}
class ListItem_3001 extends UIListItemData {
   文本:string;
   图片:string;

}

/**
 * 3002- [BASE]
 */
class GUI_3002 extends GUI_BASE {

   constructor(){
      super(3002);
   }
}
class ListItem_3002 extends UIListItemData {

}

/**
 * 15001- [BASE]
 */
class GUI_15001 extends GUI_BASE {

   constructor(){
      super(15001);
   }
}
class ListItem_15001 extends UIListItemData {

}

/**
 * 15002-任务栏 [BASE]
 */
class GUI_15002 extends GUI_BASE {
   图片:UIBitmap;
   任务详情:UIRoot;
   missionRoot:UIRoot;
   missionText:UIString;
   missionStep:UIList; // Item=15005
   missionRewardListContainer:UIString;
   missionRewardList:UIList; // Item=15035
   任务列表:UIRoot;
   missionTab:UITabBox;
   missionList:UIList; // Item=15003
   missionListC:UIList; // Item=15003
   missionListF:UIList; // Item=15003
   文本:UIString;
   trackMission:UIButton;
   exit:UIButton;
   focusMission:UIButton;
   abandonMission:UIButton;
   constructor(){
      super(15002);
   }
}
class ListItem_15002 extends UIListItemData {
   图片:string;
   missionText:string;
   missionStep:UIListItemData[];
   missionRewardListContainer:string;
   missionRewardList:UIListItemData[];
   missionTab:string;
   missionList:UIListItemData[];
   missionListC:UIListItemData[];
   missionListF:UIListItemData[];
   文本:string;

}

/**
 * 15003-任务栏_item [BASE]
 */
class GUI_15003 extends GUI_BASE {
   容器:UIRoot;
   图片:UIBitmap;
   itemBg:UIBitmap;
   missionName:UIString;
   missionTarget:UIString;
   文本:UIString;
   missionLoc:UIString;
   missionFrom:UIString;
   missionText:UIString;
   missionReward:UIString;

   constructor(){
      super(15003);
   }
}
class ListItem_15003 extends UIListItemData {
   图片:string;
   itemBg:string;
   missionName:string;
   missionTarget:string;
   文本:string;
   missionLoc:string;
   missionFrom:string;
   missionText:string;
   missionReward:string;

}

/**
 * 15004-领取任务栏 [BASE]
 */
class GUI_15004 extends GUI_BASE {
   图片:UIBitmap;
   任务详情:UIRoot;
   missionRoot:UIRoot;
   missionText:UIString;
   任务列表:UIRoot;
   missionList:UIList; // Item=15003
   文本:UIString;
   exit:UIButton;
   acceptMission:UIButton;
   constructor(){
      super(15004);
   }
}
class ListItem_15004 extends UIListItemData {
   图片:string;
   missionText:string;
   missionList:UIListItemData[];
   文本:string;

}

/**
 * 15005-任务步骤 [BASE]
 */
class GUI_15005 extends GUI_BASE {
   stepSymbol:UIString;
   stepName:UIString;
   stepLocation:UIString;
   stepTarget:UIString;
   constructor(){
      super(15005);
   }
}
class ListItem_15005 extends UIListItemData {
   stepSymbol:string;
   stepName:string;
   stepLocation:string;
   stepTarget:string;
}

/**
 * 15006-小地图 [BASE]
 */
class GUI_15006 extends GUI_BASE {
   miniMap:UIRoot;
   background:UIRoot;
   r:UIRoot;
   basepBlocks:UIBitmap;
   baseBlocks:UIBitmap;
   sceneObjects2:UIBitmap;
   sceneObjects:UIBitmap;
   cameraView:UIBitmap;
   slide:UISlider;
   constructor(){
      super(15006);
   }
}
class ListItem_15006 extends UIListItemData {
   basepBlocks:string;
   baseBlocks:string;
   sceneObjects2:string;
   sceneObjects:string;
   cameraView:string;
   slide:number;
}

/**
 * 15007-小大地图 [BASE]
 */
class GUI_15007 extends GUI_BASE {
   miniMap:UIRoot;
   background:UIRoot;
   r:UIRoot;
   basepBlocks:UIBitmap;
   baseBlocks:UIBitmap;
   sceneObjects:UIBitmap;
   cameraView:UIBitmap;
   posLabel:UIString;
   closeButton:UIButton;
   mapNameLabel:UIString;
   playerPosLabel:UIString;
   slide:UISlider;
   constructor(){
      super(15007);
   }
}
class ListItem_15007 extends UIListItemData {
   basepBlocks:string;
   baseBlocks:string;
   sceneObjects:string;
   cameraView:string;
   posLabel:string;
   mapNameLabel:string;
   playerPosLabel:string;
   slide:number;
}

/**
 * 15008-通用信息显示 [BASE]
 */
class GUI_15008 extends GUI_BASE {
   背景:UIBitmap;
   infoContainer:UIRoot;
   titleText:UIString;
   contentText:UIString;
   constructor(){
      super(15008);
   }
}
class ListItem_15008 extends UIListItemData {
   背景:string;
   titleText:string;
   contentText:string;
}

/**
 * 15009-强化界面 [BASE]
 */
class GUI_15009 extends GUI_BASE {
   图片:UIBitmap;
   goodsList:UIList; // Item=15010
   enhancedButton:UIButton;
   关闭:UIButton;
   itemIntro:UIString;
   successRate:UIString;
   文本:UIString;
   tooltip:UIRoot;
   tooltiptxt:UIString;
   enhancedAux:UICheckBox;
   enhancedAuxtishi:UIString;
   enhancedAux2:UICheckBox;
   enhancedAux2tishi:UIString;
   equipName:UIString;
   requiredGold:UIString;
   ownGold:UIString;
   constructor(){
      super(15009);
   }
}
class ListItem_15009 extends UIListItemData {
   图片:string;
   goodsList:UIListItemData[];
   itemIntro:string;
   successRate:string;
   文本:string;
   tooltiptxt:string;
   enhancedAux:boolean;
   enhancedAuxtishi:string;
   enhancedAux2:boolean;
   enhancedAux2tishi:string;
   equipName:string;
   requiredGold:string;
   ownGold:string;
}

/**
 * 15010-道具_Item [BASE]
 */
class GUI_15010 extends GUI_BASE {
   道具背景:UIBitmap;
   icon:UIBitmap;
   itemNum:UIString;
   itemName:UIString;
   constructor(){
      super(15010);
   }
}
class ListItem_15010 extends UIListItemData {
   道具背景:string;
   icon:string;
   itemNum:string;
   itemName:string;
}

/**
 * 15011-联网公告 [BASE]
 */
class GUI_15011 extends GUI_BASE {
   底色:UIBitmap;
   typeListRoot:UIRoot;
   typeList:UIList; // Item=15014
   listRoot:UIRoot;
   list:UIList; // Item=15013
   公告:UIString;
   cloneBtn:UIButton;
   constructor(){
      super(15011);
   }
}
class ListItem_15011 extends UIListItemData {
   底色:string;
   typeList:UIListItemData[];
   list:UIListItemData[];
   公告:string;

}

/**
 * 15012-联网公告内容 [BASE]
 */
class GUI_15012 extends GUI_BASE {
   底色:UIBitmap;
   底图2:UIBitmap;
   底图3:UIBitmap;
   typeName:UIString;
   title:UIString;
   cover:UIBitmap;
   typeCover:UIBitmap;
   contentRoot:UIRoot;
   content:UIString;
   detailBtn:UIButton;
   cloneBtn:UIButton;
   createdAt:UIString;
   constructor(){
      super(15012);
   }
}
class ListItem_15012 extends UIListItemData {
   底色:string;
   底图2:string;
   底图3:string;
   typeName:string;
   title:string;
   cover:string;
   typeCover:string;
   content:string;
   createdAt:string;
}

/**
 * 15013-联网公告_Item [BASE]
 */
class GUI_15013 extends GUI_BASE {
   底图:UIBitmap;
   title:UIString;
   typeName:UIString;
   cover:UIBitmap;
   createdAt:UIString;
   isNew:UIBitmap;
   constructor(){
      super(15013);
   }
}
class ListItem_15013 extends UIListItemData {
   底图:string;
   title:string;
   typeName:string;
   cover:string;
   createdAt:string;
   isNew:string;
}

/**
 * 15014-联网公告分类_Item [BASE]
 */
class GUI_15014 extends GUI_BASE {
   图片:UIBitmap;
   typeName:UIString;
   typeCover:UIBitmap;
   isNew:UIBitmap;
   constructor(){
      super(15014);
   }
}
class ListItem_15014 extends UIListItemData {
   图片:string;
   typeName:string;
   typeCover:string;
   isNew:string;
}

/**
 * 15015-提示栏 [BASE]
 */
class GUI_15015 extends GUI_BASE {
   root:UIRoot;
   itemTxt:UIString;
   itemIcon:UIBitmap;
   constructor(){
      super(15015);
   }
}
class ListItem_15015 extends UIListItemData {
   itemTxt:string;
   itemIcon:string;
}

/**
 * 15016- [BASE]
 */
class GUI_15016 extends GUI_BASE {

   constructor(){
      super(15016);
   }
}
class ListItem_15016 extends UIListItemData {

}

/**
 * 15017-游戏内网页弹窗 [BASE]
 */
class GUI_15017 extends GUI_BASE {
   图片:UIBitmap;
   iframeBox:UIRoot;
   closeBtn:UIButton;
   constructor(){
      super(15017);
   }
}
class ListItem_15017 extends UIListItemData {
   图片:string;

}

/**
 * 15018-富文本测试12 [BASE]
 */
class GUI_15018 extends GUI_BASE {
   图片:UIBitmap;
   input:UIInput;
   output:UIRoot;
   rich:UIString;
   水平对齐:UIComboBox;
   垂直对齐:UIComboBox;
   自动换行:UICheckBox;
   文本:UIString;
   超出隐藏:UICheckBox;
   确定:UIButton;
   斜体:UICheckBox;
   粗体:UICheckBox;
   描边:UICheckBox;
   阴影:UICheckBox;
   字体大小:UICheckBox;
   水平间距:UICheckBox;
   水:UIString;
   垂直间距:UICheckBox;
   添加文本:UIButton;
   删除富文本:UIButton;
   行垂直对齐:UIComboBox;
   按钮:UIButton;

   constructor(){
      super(15018);
   }
}
class ListItem_15018 extends UIListItemData {
   图片:string;
   input:string;
   rich:string;
   自动换行:boolean;
   文本:string;
   超出隐藏:boolean;
   斜体:boolean;
   粗体:boolean;
   描边:boolean;
   阴影:boolean;
   字体大小:boolean;
   水平间距:boolean;
   水:string;
   垂直间距:boolean;

}

/**
 * 15019-任务提示 [BASE]
 */
class GUI_15019 extends GUI_BASE {
   itemBox:UIBitmap;
   itemTxt:UIString;
   constructor(){
      super(15019);
   }
}
class ListItem_15019 extends UIListItemData {
   itemBox:string;
   itemTxt:string;
}

/**
 * 15020-背包 [BASE]
 */
class GUI_15020 extends GUI_BASE {
   背景:UIBitmap;
   背包容器:UIRoot;
   currentPage:UIString;
   closeBtn:UIButton;
   sortBtn:UIButton;
   discardArea:UIButton;
   categoryTab:UITabBox;
   prevPage:UIButton;
   nextPage:UIButton;
   itemList:UIList; // Item=15021
   游戏数值:UIString;
   文本:UIString;
   constructor(){
      super(15020);
   }
}
class ListItem_15020 extends UIListItemData {
   背景:string;
   currentPage:string;
   categoryTab:string;
   itemList:UIListItemData[];
   文本:string;
}

/**
 * 15021-背包项 [BASE]
 */
class GUI_15021 extends GUI_BASE {
   道具背景:UIBitmap;
   colorBg:UIRoot;
   itemColor:UIString;
   icon:UIBitmap;
   itemNum:UIString;
   tierLabel:UIString;
   constructor(){
      super(15021);
   }
}
class ListItem_15021 extends UIListItemData {
   道具背景:string;
   itemColor:string;
   icon:string;
   itemNum:string;
   tierLabel:string;
}

/**
 * 15022-广播界面 [BASE]
 */
class GUI_15022 extends GUI_BASE {
   Image:UIBitmap;
   Label:UIString;
   constructor(){
      super(15022);
   }
}
class ListItem_15022 extends UIListItemData {
   Image:string;
   Label:string;
}

/**
 * 15023-名字界面 [BASE]
 */
class GUI_15023 extends GUI_BASE {
   nameLabel:UIString;
   constructor(){
      super(15023);
   }
}
class ListItem_15023 extends UIListItemData {
   nameLabel:string;
}

/**
 * 15024-数组元素 [BASE]
 */
class GUI_15024 extends GUI_BASE {
   insert:UIButton;
   delete:UIButton;
   background:UIBitmap;
   index:UIString;
   strInput:UIInput;
   kuang:UIBitmap;
   constructor(){
      super(15024);
   }
}
class ListItem_15024 extends UIListItemData {
   background:string;
   index:string;
   strInput:string;
   kuang:string;
}

/**
 * 15025-数组显示 [BASE]
 */
class GUI_15025 extends GUI_BASE {
   touchArea:UIBitmap;
   elementList:UIList; // Item=15024
   background:UIBitmap;
   ArrayId:UIString;
   close:UIButton;
   pushStart:UIButton;
   constructor(){
      super(15025);
   }
}
class ListItem_15025 extends UIListItemData {
   touchArea:string;
   elementList:UIListItemData[];
   background:string;
   ArrayId:string;

}

/**
 * 15026-数组面板 [BASE]
 */
class GUI_15026 extends GUI_BASE {
   window1:UIRoot;
   touchArea:UIRoot;
   background:UIBitmap;
   arrayList:UIList; // Item=15027
   frame:UIRoot;
   图片:UIBitmap;
   文本:UIString;
   window2:UIRoot;
   arrayShow:Wfskp_GUI_ArrayShow;
   frame2:UIRoot;

   constructor(){
      super(15026);
   }
}
class ListItem_15026 extends UIListItemData {
   background:string;
   arrayList:UIListItemData[];
   图片:string;
   文本:string;
   arrayShow:number;

}

/**
 * 15027-数组 [BASE]
 */
class GUI_15027 extends GUI_BASE {
   button:UIButton;
   index:UIString;
   index3:UIString;
   constructor(){
      super(15027);
   }
}
class ListItem_15027 extends UIListItemData {
   index:string;
   index3:string;
}

/**
 * 15028-角色好感度 [BASE]
 */
class GUI_15028 extends GUI_BASE {
   背景:UIBitmap;
   文本:UIString;
   列表:UIList; // Item=15029
   closeBtn:UIButton;
   constructor(){
      super(15028);
   }
}
class ListItem_15028 extends UIListItemData {
   背景:string;
   文本:string;
   列表:UIListItemData[];

}

/**
 * 15029-角色好感度项 [BASE]
 */
class GUI_15029 extends GUI_BASE {
   actor:UIString;
   value:UIString;
   constructor(){
      super(15029);
   }
}
class ListItem_15029 extends UIListItemData {
   actor:string;
   value:string;
}

/**
 * 15030-成就 [BASE]
 */
class GUI_15030 extends GUI_BASE {
   bg:UIBitmap;
   closeBtn:UIButton;
   categoryList:UIList; // Item=15031
   achievementList:UIList; // Item=15032
   成就点Label:UIString;
   pointsLabel:UIString;
   标题:UIString;
   constructor(){
      super(15030);
   }
}
class ListItem_15030 extends UIListItemData {
   bg:string;
   categoryList:UIListItemData[];
   achievementList:UIListItemData[];
   成就点Label:string;
   pointsLabel:string;
   标题:string;
}

/**
 * 15031-成就_分类 [BASE]
 */
class GUI_15031 extends GUI_BASE {
   bg:UIBitmap;
   categoryName:UIString;
   constructor(){
      super(15031);
   }
}
class ListItem_15031 extends UIListItemData {
   bg:string;
   categoryName:string;
}

/**
 * 15032-成就项 [BASE]
 */
class GUI_15032 extends GUI_BASE {
   bg:UIBitmap;
   iconBg:UIBitmap;
   icon:UIBitmap;
   achievementName:UIString;
   achievemenDesc:UIString;
   progressBar:UISlider;
   progress:UIString;
   point:UIString;
   unlockTime:UIString;
   rewardBtn:UIButton;
   rewardStatus:UIString;
   rewardList:UIList; // Item=15033
   constructor(){
      super(15032);
   }
}
class ListItem_15032 extends UIListItemData {
   bg:string;
   iconBg:string;
   icon:string;
   achievementName:string;
   achievemenDesc:string;
   progressBar:number;
   progress:string;
   point:string;
   unlockTime:string;
   rewardStatus:string;
   rewardList:UIListItemData[];
}

/**
 * 15033-成就奖励 [BASE]
 */
class GUI_15033 extends GUI_BASE {
   道具背景:UIBitmap;
   colorBg:UIRoot;
   icon:UIBitmap;
   itemNum:UIString;
   itemColor:UIString;
   itemName:UIString;
   itemText:UIString;
   itemEvent:UIString;
   itemType:UIString;
   constructor(){
      super(15033);
   }
}
class ListItem_15033 extends UIListItemData {
   道具背景:string;
   icon:string;
   itemNum:string;
   itemColor:string;
   itemName:string;
   itemText:string;
   itemEvent:string;
   itemType:string;
}

/**
 * 15034-成就完成提示 [BASE]
 */
class GUI_15034 extends GUI_BASE {
   bg:UIBitmap;
   achievementName:UIString;
   achievementIcon:UIBitmap;
   title:UIString;
   achievementPoint:UIString;
   constructor(){
      super(15034);
   }
}
class ListItem_15034 extends UIListItemData {
   bg:string;
   achievementName:string;
   achievementIcon:string;
   title:string;
   achievementPoint:string;
}

/**
 * 15035-奖励道具 [BASE]
 */
class GUI_15035 extends GUI_BASE {
   道具背景:UIBitmap;
   icon:UIBitmap;
   itemNum:UIString;
   constructor(){
      super(15035);
   }
}
class ListItem_15035 extends UIListItemData {
   道具背景:string;
   icon:string;
   itemNum:string;
}

/**
 * 15036-迷你任务栏 [BASE]
 */
class GUI_15036 extends GUI_BASE {
   bgPanel:UIBitmap;
   miniMissionTab:UITabBox;
   constructor(){
      super(15036);
   }
}
class ListItem_15036 extends UIListItemData {
   bgPanel:string;
   miniMissionTab:string;
}

/**
 * 15037-迷你任务栏_item [BASE]
 */
class GUI_15037 extends GUI_BASE {
   图片:UIBitmap;
   missionName:UIString;
   stepList:UIList; // Item=15005
   missionDesc:UIString;
   missionScene:UIString;
   missionNPC:UIString;
   constructor(){
      super(15037);
   }
}
class ListItem_15037 extends UIListItemData {
   图片:string;
   missionName:string;
   stepList:UIListItemData[];
   missionDesc:string;
   missionScene:string;
   missionNPC:string;
}

/**
 * 15038- [BASE]
 */
class GUI_15038 extends GUI_BASE {

   constructor(){
      super(15038);
   }
}
class ListItem_15038 extends UIListItemData {

}

/**
 * 15039- [BASE]
 */
class GUI_15039 extends GUI_BASE {

   constructor(){
      super(15039);
   }
}
class ListItem_15039 extends UIListItemData {

}

/**
 * 15040- [BASE]
 */
class GUI_15040 extends GUI_BASE {

   constructor(){
      super(15040);
   }
}
class ListItem_15040 extends UIListItemData {

}

/**
 * 15041- [BASE]
 */
class GUI_15041 extends GUI_BASE {

   constructor(){
      super(15041);
   }
}
class ListItem_15041 extends UIListItemData {

}

/**
 * 15042- [BASE]
 */
class GUI_15042 extends GUI_BASE {

   constructor(){
      super(15042);
   }
}
class ListItem_15042 extends UIListItemData {

}
GameUI["__compCustomAttributes"] = {"UIRoot":["enabledLimitView","scrollShowType","hScrollBar","hScrollBg","vScrollBar","vScrollBg","scrollWidth","slowmotionType","enabledWheel","hScrollValue","vScrollValue"],"UIButton":["label","image1","grid9img1","image2","grid9img2","image3","grid9img3","fontSize","color","overColor","clickColor","bold","italic","smooth","align","valign","letterSpacing","font","textDx","textDy","textStroke","textStrokeColor"],"UIBitmap":["image","grid9","flip","isTile","pivotType","isAdaptiveSize"],"UIString":["text","fontSize","color","bold","italic","smooth","align","valign","leading","letterSpacing","font","wordWrap","overflow","shadowEnabled","shadowColor","shadowDx","shadowDy","stroke","strokeColor","onChangeFragEvent"],"UIVariable":["varMode","varID","fontSize","color","bold","italic","smooth","align","valign","leading","letterSpacing","font","wordWrap","overflow","shadowEnabled","shadowColor","shadowDx","shadowDy","stroke","strokeColor","onChangeFragEvent"],"UICustomGameNumber":["customData","previewNum","previewFixed","fontSize","color","bold","italic","smooth","align","valign","leading","letterSpacing","font","wordWrap","overflow","shadowEnabled","shadowColor","shadowDx","shadowDy","stroke","strokeColor"],"UICustomGameString":["customData","inEditorText","fontSize","color","bold","italic","smooth","align","valign","leading","letterSpacing","font","wordWrap","overflow","shadowEnabled","shadowColor","shadowDx","shadowDy","stroke","strokeColor"],"UIAvatar":["avatarID","scaleNumberX","scaleNumberY","orientationIndex","avatarFPS","playOnce","isPlay","avatarFrame","actionID","avatarHue"],"UIStandAvatar":["avatarID","actionID","scaleNumberX","scaleNumberY","flip","playOnce","isPlay","avatarFrame","avatarFPS","avatarHue"],"UIAnimation":["animationID","scaleNumberX","scaleNumberY","aniFrame","playFps","playType","showHitEffect","silentMode"],"UIInput":["text","fontSize","color","prompt","promptColor","bold","italic","smooth","align","leading","font","wordWrap","restrict","inputMode","maxChars","shadowEnabled","shadowColor","shadowDx","shadowDy","onInputFragEvent","onEnterFragEvent"],"UICheckBox":["selected","image1","grid9img1","image2","grid9img2","onChangeFragEvent"],"UISwitch":["switchMode","selected","image1","grid9img1","image2","grid9img2","previewselected","onChangeFragEvent"],"UITabBox":["selectedIndex","itemImage1","grid9img1","itemImage2","grid9img2","itemWidth","itemHeight","items","rowMode","spacing","labelSize","labelColor","labelFont","labelBold","labelItalic","smooth","labelAlign","labelValign","labelLetterSpacing","labelSelectedColor","labelDx","labelDy","labelStroke","labelStrokeColor","onChangeFragEvent"],"UISlider":["image1","bgGrid9","image2","blockGrid9","image3","blockFillGrid9","step","min","max","value","transverseMode","blockFillMode","blockPosMode","fillStrething","isBindingVarID","bindingVarID","onChangeFragEvent"],"UIGUI":["guiID","instanceClassName"],"UIList":["itemModelGUI","previewSize","selectEnable","repeatX","itemWidth","itemHeight","spaceX","spaceY","scrollShowType","hScrollBar","hScrollBg","vScrollBar","vScrollBg","scrollWidth","selectImageURL","selectImageGrid9","selectedImageAlpha","selectedImageOnTop","overImageURL","overImageGrid9","overImageAlpha","overImageOnTop","overSelectMode","slowmotionType","onChangeFragEvent1","onChangeFragEvent2"],"UIComboBox":["itemLabels","selectedIndex","bgSkin","bgGrid9","fontSize","color","bold","italic","smooth","align","valign","letterSpacing","font","textDx","textStroke","textStrokeColor","displayItemSize","listScrollBg","listScrollBar","listAlpha","listBgColor","itemHeight","itemFontSize","itemColor","itemBold","itemItalic","itemAlign","itemValign","itemLetterSpacing","itemFont","itemOverColor","itemOverBgColor","itemTextDx","itemTextDy","itemTextStroke","itemTextStrokeColor","onChangeFragEvent"],"UIVideo":["videoURL","playType","volume","playbackRate","currentTime","muted","loop","pivotType","flip","onLoadedFragEvent","onErrorFragEvent","onCompleteFragEvent"]};
