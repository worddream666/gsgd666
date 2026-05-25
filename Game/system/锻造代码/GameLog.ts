/**
 * GameLog.ts
 * 
 * 提供一个全局的、简单的快捷方式来向主日志界面发送消息。
 * 这是推荐的、在任何地方添加日志的方法。
 */

// 确保这个事件名与 GUI_Main.ts 中的完全一致
const EVENT_ADD_LOG = "EVENT_ADD_LOG_MESSAGE";

class GameLog {

    /**
     * 【全局快捷功能】向日志框添加一条系统消息。
     * @param text 要显示的文本内容。
     * 
     * ---
     * 
     * 【【【 调用示例 】】】
     * 
     * // 在你的任何其他脚本中 (比如一个任务脚本、一个NPC对话脚本等):
     * GameLog.add("你找到了一个隐藏的宝箱！");
     * GameLog.add("村民向你表示了感谢。");
     * 
     */
    public static add(text: string): void {
        // 参数1: 文本内容
        // 参数2: 消息类型 (我们默认为最常用的“系统信息”类型)
        EventUtils.happen(Game, EVENT_ADD_LOG, [text, LogType.SYSTEM_INFO]);
    }

}
