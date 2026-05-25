/**
 * #1 preloadAsset
 */
class DataStructure_preloadAsset {
    assetType: number; // = 0; 资源类型
    asset0: string; // = ""; 图片
    asset1: string; // = ""; 音频
    asset2: number; // = 1; 行走图
    asset3: number; // = 1; 立绘
    asset4: number; // = 1; 动画
    asset5: number; // = 1; 界面
    asset6: number; // = 1; 对话框
}
/**
 * #2 packageItem
 */
class DataStructure_packageItem {
    isEquip: boolean; // = false; 是否装备
    equip: Module_Equip; // = 0; 装备
    item: Module_Item; // = 0; 道具
    number: number; // = 1; 数目
}
/**
 * #3 keys
 */
class DataStructure_keys {
    key: number; // = 0; 按键
}
/**
 * #4 point
 */
class DataStructure_point {
    x: number; // = 0;
    y: number; // = 0;
}
/**
 * #5 shopItem
 */
class DataStructure_shopItem {
    isEquip: boolean; // = false; 装备
    item: number; // = 1; 道具
    equip: number; // = 1; 装备
    numberType: number; // = 0;
    number: number; // = 1; 数量
    numberVar: number; // = 0; 数量
    priceType: number; // = 0;
    price: number; // = 0; 价格
    priceVar: number; // = 0; 价格
}
/**
 * #7 inputMessage
 */
class DataStructure_inputMessage {
    type: number; // = 0; 类别
    numberValue: any; // 游戏数值
    booleanValue: any; // 游戏开关
    stringValue: any; // 游戏字符串
}
/**
 * #8 collisionGroupSetting
 */
class DataStructure_collisionGroupSetting {
    group1: number; // = 0; 组-1
    group2: number; // = 0; 组-2
}
/**
 * #1001 dropItem
 */
class DataStructure_dropItem {
    dropProbability: number; // = 100; 掉落几率
    item: number; // = 1; 掉落道具
    num: number; // = 1; 数量
}
/**
 * #1002 dropEquip
 */
class DataStructure_dropEquip {
    dropProbability: number; // = 100; 掉落几率
    equip: Module_Equip; // = 1; 掉落装备
}
/**
 * #1003 classValidity
 */
class DataStructure_classValidity {
    class: number; // = 0; 职业
    per: number; // = 100; 有效度
}
/**
 * #1004 levelUpLearnSkill
 */
class DataStructure_levelUpLearnSkill {
    lv: number; // = 2;
    skill: number; // = 0; 技能
}
/**
 * #1005 inPartyActor
 */
class DataStructure_inPartyActor {
    actor: Module_Actor; // = 0;
    lv: number; // = 1; 等级
    dissolutionEnabled: boolean; // = true; 允许解散
    sceneObjectIndex: number; // = 0; 对应的场景对象编号
}
/**
 * #1006 battlerHate
 */
class DataStructure_battlerHate {
    targetIndex: number; // = 0; 目标编号
    hateValue: number; // = 0;
}
/**
 * #1007 equipRand
 */
class DataStructure_equipRand {
    type: number; // = 0; 属性
    extAttribute: number; // = 1;
    usePer: boolean; // = true; 按照比例
    minValue: number; // = 100; 最低浮动率
    maxValue: number; // = 150; 最高浮动率
    minFixValue: number; // = 0; 最低浮动值
    maxFixValue: number; // = 0; 最高浮动值
    probability: number; // = 100; 概率
}
/**
 * #1008 gameKeyboard
 */
class DataStructure_gameKeyboard {
    gameKey: number; // = 0; 键位
    keyCode1: number; // = 0; 值1
    keyCode2: number; // = 0; 值2
    keyCode3: number; // = 0; 值3
    keyCode4: number; // = 0; 值4
}
/**
 * #1009 specialBattleEffect
 */
class DataStructure_specialBattleEffect {
    type: number; // = 0; 类别
    reflectCondition: number; // = 0; 限定条件
    returnPer: number; // = 100; 概率%
    returnDamagePer: number; // = 100; 伤害%
    suckCondition: number; // = 0; 限定条件
    damagePer: number; // = 100; 有效度%
    suckPer: number; // = 100; 吸取%
    strikePer: number; // = 100; 有效度%
    elementType: number; // = 1; 元素类别
    effectiveness: number; // = 100; 有效度%
    repelPer: number; // = 100; 概率
    repelValue: number; // = 32; 幅度
    repelSpeed: number; // = 250; 速度
    repelCondition: number; // = 0;
    sprintSpeed: number; // = 400; 速度
    sprintDistance: number; // = 200; 距离
    blockAttackMode: number; // = 0; 格挡模式
    blockAttackAnimation: number; // = 1036; 动画
    blockAttackEvent: string; // = "1036"; 事件
}
/**
 * #1010 equipQualitySetting
 */
class DataStructure_equipQualitySetting {
    equipQualityType: number; // = 0; 品质
    color: string; // = ""; 颜色
}
/**
 * #1011 multiAction
 */
class DataStructure_multiAction {
    actionID: number; // = 1; 动作
    releaseFrame: number; // = 1; 释放帧
    fps: number; // = 12; 帧率
    damagePer: number; // = 100; 伤害加成
}
/**
 * #1012 drapGold
 */
class DataStructure_drapGold {
    item: number; // = 0; 道具
    below: number; // = 100; <
}
/**
 * #1013 battleKeyboard
 */
class DataStructure_battleKeyboard {
    gameKey: number; // = 0; 键位
    keyCode: number; // = 0; 键值
    battleFunction: number; // = 0; 功能
    eventID: number; // = 14019; 事件库
}
/**
 * #1014 equipRand
 */
class DataStructure_1559_equipRand {
    type: number; // = 0; 属性
    extAttribute: number; // = 1;
    usePer: boolean; // = true; 按照比例
    minValue: number; // = 100; 最低浮动率
    maxValue: number; // = 150; 最高浮动率
    minFixValue: number; // = 0; 最低浮动值
    maxFixValue: number; // = 0; 最高浮动值
    probability: number; // = 100; 概率
}
/**
 * #2007 
 */
class DataStructure_unnamed2007 {
}
/**
 * #2008 customAttribute
 */
class DataStructure_customAttribute {
    attribute: number; // = 1;
    value: number; // = 0;
    type: number; // = 0;
}
/**
 * #2009 customAttributeGrow
 */
class DataStructure_customAttributeGrow {
    attribute: number; // = 1;
    value: string; // = "1";
}
/**
 * #2010 customAttributeSetting
 */
class DataStructure_customAttributeSetting {
    attribute: number; // = 1;
    lowerLimit: number; // = 0; 下限
    upperLimit: number; // = 999; 上限
    isinteger: boolean; // = true; 取整
}
/**
 * #15001 数据网格对应数据
 */
class DataStructure_MiniMap_data {
    dataID: number; // = 0; 网格序号
    color: string; // = ""; 网格颜色
}
/**
 * #15002 地图对应地图图片
 */
class DataStructure_MiniMap_picture {
    scene: number; // = 0; 地图
    picture: string; // = ""; 图片
}
/**
 * #15003 获得物品项
 */
class DataStructure_Lmkrt_GetItem {
    isEquip: boolean; // = false; 是否装备
    equip: Module_Equip; // = 0; 装备
    item: Module_Item; // = 0; 道具
    number: number; // = 1; 数目
    probability: number; // = 100; 概率
}
/**
 * #15004 任务
 */
class DataStructure_mission {
    mission: Module_任务; // = 0; 任务
    isCompleted: boolean; // = false; 任务已完成
    isFailed: boolean; // = false; 任务失败
    timeSystemId: number; // = 0;
}
/**
 * #15005 任务接取
 */
class DataStructure_missionAccept {
    mission: Module_任务; // = 0; 任务
}
/**
 * #15006 任务步骤
 */
class DataStructure_missionStep {
    stepName: string; // = ""; 步骤名
    stepColor: string; // = "fbd859"; 默认颜色
    stepType: number; // = 0; 步骤类型
    ProgressVar: number; // = 0; 进度
    itemId: number; // = 0; 道具
    equipId: number; // = 0; 装备
    ProgressMax: number; // = 1; 进度最大值
    ProgressCptEvent: string; // = "1"; 进度完成事件
    isCpt: boolean; // = false; 是否完成
    isFailed: boolean; // = false;
    stepLocation: string; // = ""; 任务地点
    stepTarget: string; // = ""; 任务NPC
}
/**
 * #15007 Ltrwp_BroadcastGroup
 */
class DataStructure_Ltrwp_BroadcastGroup {
    memo: string; // = ""; 备注名
    content: string; // = ""; 广播信息
    randomMode: boolean; // = false; 是否随机播放其中一条
}
/**
 * #15008 Ltrwp_GroupState
 */
class DataStructure_Ltrwp_GroupState {
    targetIndex: number; // = 0; 世界设定中的索引
    enable: number; // = 0; 是否启用
}
/**
 * #15009 批量数字
 */
class DataStructure_批量数字 {
    element: number; // = 0; 元素
    elementVar: number; // = 0; 元素
    userVar: boolean; // = false; 使用变量
}
/**
 * #15010 批量字符串
 */
class DataStructure_批量字符串 {
    element: string; // = ""; 元素
    elementVar: number; // = 0; 元素
    userVar: boolean; // = false; 使用变量
}
/**
 * #15011 好感度设定
 */
class DataStructure_favor {
    actor: number; // = 0; 角色
    favor: number; // = 0; 好感度
}
/**
 * #15012 好感度设定2
 */
class DataStructure_favorPair {
    actorA: number; // = 0; 角色A
    actorB: number; // = 0; 角色B
    favor: number; // = 0; 好感度
}
/**
 * #15013 玩家成就
 */
class DataStructure_玩家成就 {
    id: number; // = 0;
    isUnlocked: boolean; // = false; 已达成
    unlockTime: number; // = 0; 达成时间戳
    isRewardClaimed: boolean; // = false; 奖励是否已领取
}
/**
 * #15014 任务条件
 */
class DataStructure_missionAppearCondition {
    appearConditionType: number; // = 0; 条件类型
    appearConditionVar: number; // = 0; 变量
    appearConditionSwitch: number; // = 0; 开关
    missionId: number; // = 0; 任务
    appearConditionVarCompare: number; // = 0; 比较方式
    appearConditionTargetValue: number; // = 0; 目标值
    itemId: number; // = 0; 道具
    equipId: number; // = 0; 装备
}
/**
 * #15015 任务时间
 */
class DataStructure_Lmkrt_MissionTime {
    name: string; // = "时"; 时间单位名称
    num: number; // = 0; 默认值
    valueSet: number; // = 0; 绑定游戏数值
    system: number; // = 24; 进制
    min: number; // = 0; 最小值
    isArray: boolean; // = false; 数组模式
    system1: number[]; // = [];
    padZero: boolean; // = false; 是否补零
}
