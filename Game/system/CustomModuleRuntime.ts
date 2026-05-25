/**
 * #1 道具
 */
class Module_Item {
    id: number;
    name: string;
    icon: string; // = ""; 图标
    intro: string; // = "";
    sell: number; // = 0; 商店售价
    isUse: boolean; // = false; 可使用
    sellEnabled: boolean; // = false; 允许出售给商店
    isConsumables: boolean; // = false; 消耗品
    callEvent: string; // = ""; 使用后执行的事件
    se: string; // = ""; 非战斗使用时音效
    isSingleTarget: boolean; // = true; 指定单个目标
    applyDeadBattler: boolean; // = true; 指定已死亡的目标
    useAnimation: number; // = 0; 使用时战斗者动画
    recoveryHP: number; // = 0; 恢复生命值
    recoverySP: number; // = 0; 恢复魔法值
    addStatus: number[]; // = [];
    removeStatus: number[]; // = [];
    dropEvent: string; // = ""; 地图掉落事件
    pickUpEvent: string; // = ""; 拾取道具事件
    isUnrealItem: boolean; // = false; 虚拟商品
    value: number; // = 0;
    category: number; // = 0; 类别
}
/**
 * #2 预留
 */
class Module_reserve2 {
    id: number;
    name: string;
}
/**
 * #3 预留
 */
class Module_reserve3 {
    id: number;
    name: string;
}
/**
 * #4 预留
 */
class Module_reserve4 {
    id: number;
    name: string;
}
/**
 * #5 预留
 */
class Module_reserve5 {
    id: number;
    name: string;
}
/**
 * #6 角色
 */
class Module_Actor {
    id: number;
    name: string;
    customAttributes: DataStructure_customAttribute[]; // = [];
    face: string; // = ""; 头像
    class: number; // = 1; 职业
    avatar: number; // = 0; 行走图
    growUpEnabled: boolean; // = false; 可成长角色
    dropEnabled: boolean; // = false; 死亡后掉落设定
    whenDeadEvent: string; // = "1"; 当死亡时处理
    takeSetting: boolean; // = false; 初始携带设定
    aiSetting: boolean; // = false; 电脑控制设定
    whenResurrectedEvent: string; // = "1"; 当复活时处理
    HIT: number; // = 100; 命中率
    MoveSpeed: number; // = 150; 移动速度
    MoveSpeed2: number; // = 50; 非战斗移动速度
    MaxLv: number; // = 100; 最大等级
    levelUpEvent: string; // = ""; 升级后执行的事件
    DEF: number; // = 0; 防御力
    MAG: number; // = 0; 魔力
    MagDef: number; // = 0; 魔法防御力
    ATK: number; // = 0; 攻击力
    MaxHP: number; // = 100; 生命值
    MaxSP: number; // = 100; 魔法值
    DOD: number; // = 0; 回避
    CRIT: number; // = 0; 暴击率
    MagCrit: number; // = 0; 魔法暴击率
    isCustomAttribute: boolean; // = false; 扩展属性
    POISON_ATK: number; // = 0; 毒系攻击
    ICE_ATK: number; // = 0; 冰系攻击
    FIRE_ATK: number; // = 0; 火系攻击
    ELEC_ATK: number; // = 0; 电系攻击
    POISON_DEF: number; // = 0; 毒系防御
    ICE_DEF: number; // = 0; 冰系防御
    FIRE_DEF: number; // = 0; 火系防御
    ELEC_DEF: number; // = 0; 电系防御
    atkSkill: Module_Skill; // = 1; 攻击技能
    skills: Module_Skill[]; // = [];
    equips: Module_Equip[]; // = [];
    aiType: number; // = 0; 行动类别
    aiVigilanceRange: number; // = 350; 警戒范围
    aiGetTargetMode: number; // = 0; 获取目标的方式
    moveType: number; // = 1; 移动方式
    lostTargetRange1: number; // = 1000; 丢失目标的距离-A
    lostTargetRange2: number; // = 1000; 丢失目标的距离-B
    lostTargetBack: boolean; // = true; 丢失目标后返回进入战斗的地点
    vigilanceAngle: number; // = 150; 警戒角度
    dropGold: number; // = 0; 掉落金币
    dropExp: number; // = 0; 掉落经验值
    dropEquips: DataStructure_dropEquip[]; // = [];
    dropItems: DataStructure_dropItem[]; // = [];
    passiveStatus: boolean; // = false; 被动状态
    specialAbility: boolean; // = false; 特殊能力
    selfStatus1: number[]; // = [];
    selfImmuneStatus1: number[]; // = [];
    hitTargetStatus1: number[]; // = [];
    hitTargetSelfAddStatus1: number[]; // = [];
    specialBattleEffect: DataStructure_specialBattleEffect[]; // = [];
    currentEXP: number; // = 0; 当前经验值
    increaseMaxHP: number; // = 0; 增加的最大生命值
    increaseMaxSP: number; // = 0; 增加的最大魔法值
    increaseMag: number; // = 0; 增加的魔力
    increaseATK: number; // = 0; 增加的攻击力
    increaseDEF: number; // = 0; 增加的防御力
    increaseMagDef: number; // = 0; 增加的魔法防御力
    increaseDod: number; // = 0; 增加的回避
    increaseCRIT: number; // = 0; 增加的暴击率
    increaseMagCrit: number; // = 0; 增加魔法暴击率
    increaseSpeed: number; // = 0; 增加移动速度
    increaseExtendAttributes: number[]; // = [];
    status: Module_Status[]; // = [];
    AI: boolean; // = false;
    hp: number; // = 1;
    sp: number; // = 1;
    selfStatus: number[]; // = [];
    selfImmuneStatus: number[]; // = [];
    hitTargetStatus: number[]; // = [];
    hitTargetSelfAddStatus: number[]; // = [];
    initAttrs: any; // 记录初始属性
    extendAttributes: number[]; // = [];
    AtkSpeed: number; // = 0;
    subClass: number; // = 0; 副职业
    favorSetting: DataStructure_favor[]; // = [];
}
/**
 * #7 职业
 */
class Module_Class {
    id: number;
    name: string;
    lvUpAutoGetSkills: DataStructure_levelUpLearnSkill[]; // = [];
    icon: string; // = ""; 职业图标
    levelUpEvent: string; // = ""; 升级后执行的事件
    equipSetting: number[]; // = [];
    MaxHPGrow: string; // = ""; 生命值
    MaxSPGrow: string; // = ""; 魔法值
    ATKGrow: string; // = ""; 攻击力
    DEFGrow: string; // = ""; 防御力
    MAGGrow: string; // = ""; 魔力
    DODGrow: string; // = ""; 回避
    needEXPGrow: string; // = ""; 经验值设定
    MAGDEFGrow: string; // = ""; 魔法防御力
    POISON_ATK: string; // = ""; 毒系攻击
    ICE_ATK: string; // = ""; 冰系攻击
    FIRE_ATK: string; // = ""; 火系攻击
    ELEC_ATK: string; // = ""; 电系攻击
    POISON_DEF: string; // = ""; 毒系防御
    ICE_DEF: string; // = ""; 冰系防御
    FIRE_DEF: string; // = ""; 火系防御
    ELEC_DEF: string; // = ""; 电系防御
    passiveStatus: boolean; // = false; 被动状态
    specialAbility: boolean; // = false; 特殊能力
    isCustomAttribute: boolean; // = false; 扩展属性
    selfStatus: number[]; // = [];
    selfImmuneStatus: number[]; // = [];
    hitTargetStatus: number[]; // = [];
    hitTargetSelfAddStatus: number[]; // = [];
    specialBattleEffect: DataStructure_specialBattleEffect[]; // = [];
    customAttributes: DataStructure_customAttributeGrow[]; // = [];
}
/**
 * #8 技能
 */
class Module_Skill {
    id: number;
    name: string;
    icon: string; // = ""; 技能图标
    intro: string; // = "";  
    skillType: number; // = 0; 技能类别
    useCondition: number; // = 0; 使用条件
    conditionStatus: number; // = 1; 状态
    targetType: number; // = 2; 作用目标
    targetNum: number; // = 2; 目标个数
    skillReleaseType: number; // = 0; 范围类别
    scanAngle: number; // = 60; 角度
    distance: number; // = 100; 作用距离
    hitRange: number; // = 60; 碰撞范围
    releaseFrame: number; // = 1; 释放帧
    releaseActionID: number; // = 1; 释放动作
    useAction2: boolean; // = false; 多动作模式
    mulActionMode: number; // = 0; 播放模式
    actionFPS: number; // = 12; 帧率
    multiActions: DataStructure_multiAction[]; // = [];
    totalCD: number; // = 1; 冷却时间
    costSP: number; // = 0; 消耗魔法值
    useDamage: boolean; // = false; 计算伤害
    useHate: boolean; // = false; 造成仇恨
    costHP: number; // = 0; 消耗生命值
    hit: number; // = 100; 命中率
    hitType: number; // = 0; 命中率-类别
    dodType: number; // = 0; 计算目标的回避
    bulletSpeed: number; // = 0; 弹幕速度
    bulletAnimation: number; // = 0; 弹幕对象
    bulletRotation: boolean; // = true; 弹幕根据方位旋转
    damageType: number; // = 0; 伤害类型
    damageValue: number; // = 0; 数值
    additionMultiple: number; // = 100; 属性加成值
    useAddition: boolean; // = false; 属性加成
    additionMultipleType: number; // = 0; 加成类别
    elementType: number; // = 1; 元素类别
    hitEffect: boolean; // = false; 受击效果
    fixedHeteValue: number; // = 0; 固定仇恨值
    damageHatePer: number; // = 100; 按伤害数值比例增加仇恨
    releaseAnimation: number; // = 0; 释放动画
    hitAnimation: number; // = 0; 击中目标的动画
    passiveAttribute: boolean; // = false; 被动属性
    passiveStatus: boolean; // = false; 被动状态
    specialAbility: boolean; // = false; 特殊能力
    statusSetting: boolean; // = false; 状态变更
    eventSetting: boolean; // = false; 事件设定
    isCustomAttribute: boolean; // = false; 扩展属性
    releaseEvent: string; // = ""; 使用技能时事件
    hitEvent: string; // = ""; 击中目标时事件
    addStatus: number[]; // = [];
    removeStatus: number[]; // = [];
    maxHP: number; // = 0;
    maxSP: number; // = 0;
    atk: number; // = 0; 攻击力
    def: number; // = 0; 防御力
    mag: number; // = 0; 魔力
    magDef: number; // = 0; 魔法防御力
    hit1: number; // = 0; 命中率变更
    moveSpeed: number; // = 0; 移动速度
    dod: number; // = 0; 回避
    crit: number; // = 0; 暴击率变更
    magCrit: number; // = 0; 魔法暴击率变更
    atkSpeed: number; // = 0; 攻击速度+%
    customAttributes: DataStructure_customAttribute[]; // = [];
    selfStatus: number[]; // = [];
    selfImmuneStatus: number[]; // = [];
    hitTargetStatus: number[]; // = [];
    hitTargetSelfAddStatus: number[]; // = [];
    specialBattleEffect: DataStructure_specialBattleEffect[]; // = [];
    currentCD: number; // = 0;
    level: number; // = 1;
}
/**
 * #9 装备
 */
class Module_Equip {
    id: number;
    name: string;
    icon: string; // = ""; 装备图标
    intro: string; // = "";  
    sell: number; // = 0; 商店售价
    sellEnabled: boolean; // = true; 允许出售
    partID: number; // = 1; 部位
    type: number; // = 1; 类别
    quality: number; // = 2; 品质
    maxHP: number; // = 0;
    maxSP: number; // = 0;
    atk: number; // = 0; 攻击力
    def: number; // = 0; 防御力
    mag: number; // = 0; 魔力
    magDef: number; // = 0; 魔法防御力
    hit: number; // = 0; 命中率变更
    moveSpeed: number; // = 0; 移动速度
    dod: number; // = 0; 回避
    crit: number; // = 0; 暴击率变更
    magCrit: number; // = 0; 魔法暴击率变更
    atkSpeed: number; // = 0; 攻击速度+%
    isCustomAttribute: boolean; // = false; 扩展属性
    POISON_ATK: number; // = 0; 毒系攻击
    ICE_ATK: number; // = 0; 冰系攻击
    FIRE_ATK: number; // = 0; 火系攻击
    ELEC_ATK: number; // = 0; 电系攻击
    POISON_DEF: number; // = 0; 毒系防御
    ICE_DEF: number; // = 0; 冰系防御
    FIRE_DEF: number; // = 0; 火系防御
    ELEC_DEF: number; // = 0; 电系防御
    customAttributes: DataStructure_customAttribute[]; // = [];
    passiveStatus: boolean; // = false; 被动状态
    specialAbility: boolean; // = false; 特殊能力
    eventSetting: boolean; // = false; 事件设定
    weaponStyleSetting: boolean; // = false; 部件样式设定
    xzt: number; // = 0; 行走图设置
    actxzt: number; // = 0; 面板图设置
    stylePartID: number; // = 1; 部件
    styleAvatarID: number; // = 1; 部件形象
    wearEvent: string; // = ""; 佩戴时事件
    takeOffEvent: string; // = ""; 卸下时事件
    selfStatus: number[]; // = [];
    selfImmuneStatus: number[]; // = [];
    hitTargetStatus: number[]; // = [];
    hitTargetSelfAddStatus: number[]; // = [];
    specialBattleEffect: DataStructure_specialBattleEffect[]; // = [];
    baseRate: number; // = 80; 初始强化成功率
    ratePenalty: number; // = 5; 每次强化成功减少的成功率
    enhancedAux: number; // = 0; 强化辅助物一
    auxUpgradeRate: number; // = 0; 提升的成功率
    enhancedAux2: number; // = 0; 强化辅助物二
    auxUpgradeRate2: number; // = 0; 提升的成功率
    baseGold: number; // = 80; 基础消耗金币
    goldIncreasePerTime: number; // = 80; 每次强化成功叠加的金币
    category: number; // = 0; 类别
}
/**
 * #10 状态
 */
class Module_Status {
    id: number;
    name: string;
    icon: string; // = ""; 图标
    intro: string; // = "";
    totalDuration: number; // = 1; 持续时间
    overtime: boolean; // = false; DOT/HOT
    statusHit: number; // = 100; 命中率
    cantMove: boolean; // = false; 无法移动
    cantAtk: boolean; // = false; 无法攻击
    cantUseSkill: boolean; // = false; 无法使用技能
    removeWhenInjured: boolean; // = false; 受伤时解除
    maxlayer: number; // = 1; 最大叠加层
    removePer: number; // = 100; 解除概率
    animation: number; // = 1; 状态自动动画
    cantAutoPlay: boolean; // = false; 禁止播放动作
    cantChangeOri: boolean; // = false; 禁止更改朝向
    cantBeHit: boolean; // = false; 无法被击中
    intervalTime: number; // = 1; 时间间隔
    damageType: number; // = 0; 伤害类别
    damageValue: number; // = 0; 数值
    additionMultiple: number; // = 100; 属性加成值
    useAddition: boolean; // = false; 属性加成
    additionMultipleType: number; // = 0; 加成类别
    whenOvertimeEvent: string; // = ""; 执行的事件
    fixedHeteValue: number; // = 0; 固定仇恨值
    damageHatePer: number; // = 0; + 按伤害数值比例增加仇恨
    elementType: number; // = 1; 元素类别
    tempHateValue: number; // = 0; 临时仇恨值
    maxHP: number; // = 0; maxHP
    maxSP: number; // = 0; maxSP
    atk: number; // = 0; 攻击力
    def: number; // = 0; 防御力
    mag: number; // = 0; 魔力
    magDef: number; // = 0; 魔法防御力
    hit: number; // = 0; 命中率
    moveSpeed: number; // = 0; 移动速度
    crit: number; // = 0; 暴击率变更
    magCrit: number; // = 0; 魔法暴击率
    maxHPPer: number; // = 100; maxHP%
    maxSPPer: number; // = 100; maxSP%
    atkPer: number; // = 100; 攻击力%
    defPer: number; // = 100; 防御力%
    magPer: number; // = 100; 魔力%
    magDefPer: number; // = 100; 魔法防御力%
    hitPer: number; // = 100; 命中率%
    moveSpeedPer: number; // = 100; 移动速度%
    critPer: number; // = 100; 暴击率%
    magCritPer: number; // = 100; 魔法暴击率%
    atkSpeed: number; // = 0; 攻击速度+%
    isCustomAttribute: boolean; // = false; 扩展属性
    customAttributes: DataStructure_customAttribute[]; // = [];
    specialAbility: boolean; // = false; 特殊能力
    eventSetting: boolean; // = false; 事件设定
    whenAddEvent: string; // = ""; 拥有该状态时处理
    whenRemoveEvent: string; // = ""; 解除该状态时处理
    specialBattleEffect: DataStructure_specialBattleEffect[]; // = [];
    currentLayer: number; // = 1; 当前层
    fromBattlerID: number; // = 0; 来源的场景对象编号
    currentDuration: number; // = 0;
    effectTimes: number; // = 0;
    fromSceneID: number; // = 0;
    flushFromATK: number; // = 0;
    flushFromMAG: number; // = 0;
    flushIsFriendlyRelationship: boolean; // = false;
    fromBattlerSID: number; // = 0; 来源者唯一ID
    flushFromCRIT: number; // = 0;
    flushFromMagCrit: number; // = 0;
    flushFromDamagePer: number; // = 0;
    overTimeCurrentDuration: number; // = 0;
    addMaxHPUsed: boolean; // = false;
}
/**
 * #11 预留
 */
class Module_reserve11 {
    id: number;
    name: string;
}
/**
 * #12 预留
 */
class Module_reserve12 {
    id: number;
    name: string;
}
/**
 * #13 预留
 */
class Module_reserve13 {
    id: number;
    name: string;
}
/**
 * #14 属性
 */
class Module_Attribute {
    id: number;
    name: string;
}
/**
 * #15 预留
 */
class Module_reserve15 {
    id: number;
    name: string;
}
/**
 * #16 预留
 */
class Module_reserve16 {
    id: number;
    name: string;
}
/**
 * #17 元素类别
 */
class Module_elementType {
    id: number;
    name: string;
}
/**
 * #18 装备类别
 */
class Module_equipType {
    id: number;
    name: string;
}
/**
 * #19 装备部位
 */
class Module_equipParts {
    id: number;
    name: string;
}
/**
 * #20 装备品质
 */
class Module_equipQuality {
    id: number;
    name: string;
}
/**
 * #21 任务
 */
class Module_任务 {
    id: number;
    name: string;
    missionName: string; // = ""; 任务名称
    missionAddEvent: string; // = ""; 接受任务事件
    missionAddSE: string; // = ""; 接受任务音效
    missionCptSE: string; // = ""; 完成任务音效
    missionFailEvent: string; // = ""; 任务失败事件
    missionColor: string; // = "#000"; 标题颜色
    autoComplete: boolean; // = false; 自动完成
    missionAbandonEvent: string; // = ""; 放弃任务事件
    missionText: string; // = ""; 任务描述
    missionText1: number; // = 0; 任务描述
    type1: number; // = 0; 类型
    missionTarget: string; // = "无"; 任务目标
    scene: number; // = 0; 场景
    npc: string; // = "无"; 发布者
    trackedType: number; // = 0; 追踪类型
    missionReward: string; // = ""; 奖励描述
    missionReward1: number; // = 0; 奖励描述
    missionRewardEvent: string; // = ""; 任务奖励事件
    type2: number; // = 0; 类型
    missionRewardList: DataStructure_packageItem[]; // = [];
    appearCondition: DataStructure_missionAppearCondition[]; // = [];
    missionStep: DataStructure_missionStep[]; // = [];
    isTimeLimited: boolean; // = false; 是否限时任务
    timeLimitConfig: DataStructure_Lmkrt_MissionTime[]; // = [];
    timeLimitInterval: number; // = 1000; 时间变更间隔ms
    timeLimitStringVarID: number; // = 0; 剩余时间字符串变量ID
}
/**
 * #22 日志
 */
class Module_日志 {
    id: number;
    name: string;
    内容: string; // = "";
}
/**
 * #23 物品类别
 */
class Module_Lmkrt_ItemCategory {
    id: number;
    name: string;
}
/**
 * #24 锻造配方
 */
class Module_CraftingRecipe {
    id: number;
    name: string;
    productItemId: number[]; // = [];
    isProductEquip: boolean; // = false;
    mainMaterialId: number; // = 0; 主材料ID
    auxMaterials: number[]; // = [];
    goldCost: number; // = 0;
    auxCounts: number[]; // = [];
}
/**
 * #25 成就
 */
class Module_成就 {
    id: number;
    name: string;
    intro: string; // = ""; 达成后的描述
    lockedIntro: string; // = ""; 未达成时的描述
    icon: string; // = ""; 图标
    category: number; // = 0; 类别
    isHidden: boolean; // = false; 是否隐藏
    point: number; // = 1; 成就点数
    checkType: number; // = 0; 触发条件
    checkVar: number; // = 0; 监听变量
    checkValue: number; // = 1; 目标值
    rewardEvent: string; // = ""; 奖励事件
    rewardList: DataStructure_packageItem[]; // = [];
    popToat: boolean; // = true; 弹窗提示
    se: boolean; // = false; 音效
}
/**
 * #26 成就类别
 */
class Module_成就类别 {
    id: number;
    name: string;
}
/**
 * #27 副本系统
 */
class Module_Dungeon {
    id: number;
    name: string;
    name: string; // = ""; 副本名字
    bossImg: string; // = ""; BOOS图
    reqLevel: number; // = 0; 等级要求
    maxCount: number; // = 0; 副本次数
    reqAtk: number; // = 0; 攻击要求
    reqDef: number; // = 0; 防御要求
    countVarID: number; // = 0; 进入次数
    drops: number[]; // = [];
    intro: string; // = ""; 副本背景
    strategy: string; // = ""; 副本攻略
    reqDef1: number; // = 0; 副本事件
    noticeDropItems: number[]; // = [];
    noticeEnabled: boolean; // = false; 是否公告
}
