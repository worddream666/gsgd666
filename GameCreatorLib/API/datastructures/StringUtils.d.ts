/**
 * 字符串工具类
 * GC内部封装的字符串处理工具类
 * Created by 黑暗之神KDS on 2019-01-02 20:23:15.
 */
declare class StringUtils {
    /**
     * 获取字符真实长度，会计算汉字
     * @param str 字符串
     * @return 字符串str的真实长度
     */
    static getRealLength(str: string): number;
    /**
     * 清除HTML格式
     * @param str 可能带有HTML格式的字符串
     * @return [string] 清除HTML格式后的字符串
     */
    static clearHtmlTag(str: string): string;
    /**
     * 获取两个字符串中间不相同的地方的信息
     * @param str1 字符串1
     * @param str2 字符串2
     * @return [头串相同的字符数目,尾串相同的字符数目]
     */
    static getMiddleDiff(str1: string, str2: string): [number, number];
}
