/**
 * 随机名称生成器 - 怪兽国度
 * 生成 2-8 个字的中国风幻想角色名
 * 遵循 GameCreator 自定义脚本 module 模式
 */
module RandomNameGenerator {
    // ===== 姓氏库 =====
    const SURNAMES: string[] = [
        '李', '林', '叶', '萧', '楚', '苏', '白', '夜', '星', '月',
        '风', '云', '龙', '玄', '灵', '雪', '霜', '寒', '冰', '炎',
        '烈', '雷', '电', '尘', '烟', '岚', '影', '幽', '冥', '幻',
        '天', '地', '宇', '辰', '洛', '离', '顾', '沈', '江', '贺',
        '晏', '傅', '裴', '陆', '温', '容', '谢', '秦', '唐', '宋',
        '宁', '封', '柳', '卿', '韩', '魏', '虞', '殷', '卫', '许',
        '张', '王', '赵', '刘', '陈', '杨', '周', '吴', '徐', '孙',
        '马', '朱', '胡', '郭', '何', '高', '罗', '郑', '梁', '宋',
    ];

    // ===== 复姓库 =====
    const SURNAMES_DOUBLE: string[] = [
        '慕容', '欧阳', '司徒', '司空', '上官', '司马', '南宫',
        '夏侯', '诸葛', '皇甫', '独孤', '令狐', '端木', '百里',
        '北辰', '凌霄', '凌云', '星辰', '明月', '夜风', '紫月',
        '青霜', '白羽', '清风', '流云', '寒月', '飞雪', '残影',
    ];

    // ===== 单字名库 =====
    const GIVEN_SINGLE: string[] = [
        '寒', '霜', '雪', '冰', '炎', '烈', '雷', '电',
        '风', '云', '月', '星', '尘', '烟', '影', '幽',
        '灵', '幻', '玄', '羽', '空', '冥', '渊', '辰',
        '曦', '瑶', '汐', '岚', '薇', '瑾', '瑜', '琅',
        '弦', '琴', '剑', '萧', '歌', '舞', '书', '画',
        '玉', '清', '飞', '落', '残', '晓', '暮', '梦',
        '晴', '柔', '雅', '萱', '彤', '绮', '灵', '紫',
        '嫣', '婷', '婉', '宁', '静', '涵', '蕾', '璇',
    ];

    // ===== 双字名库 =====
    const GIVEN_DOUBLE: string[] = [
        '无痕', '无情', '无心', '绝影', '凌天', '傲天',
        '苍穹', '碧落', '星辰', '明月', '清风', '流云',
        '飞雪', '寒霜', '烈焰', '疾风', '雷鸣', '烟雨',
        '红尘', '紫月', '青霜', '白衣', '青云', '逸尘',
        '若曦', '雨薇', '梦瑶', '雪琪', '云岚', '冰凝',
        '诗涵', '紫嫣', '雨桐', '语嫣', '若雪', '倾城',
        '落雁', '羞花', '含烟', '映月', '凌霜', '傲雪',
        '千寻', '百川', '万钧', '九霄', '三生', '七夜',
    ];

    // ===== 中文检测 =====
    function isChinese(ch: string): boolean {
        const code = ch.charCodeAt(0);
        return code >= 0x4e00 && code <= 0x9fa5;
    }

    // ===== 工具：随机取元素 =====
    function pick<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // ===== 核心：生成一个名字 =====
    export function generate(minLen: number = 2, maxLen: number = 8): string {
        const MAX_ATTEMPTS = 50;
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            let name = '';

            // 80% 概率带姓氏
            if (Math.random() < 0.8) {
                // 30% 概率用复姓
                if (Math.random() < 0.3) {
                    name += pick(SURNAMES_DOUBLE);
                } else {
                    name += pick(SURNAMES);
                }
            }

            // 填充名：1~4 个部件
            const partCount = 1 + Math.floor(Math.random() * 3);
            for (let i = 0; i < partCount; i++) {
                // 50% 概率用双字名，50% 用单字
                if (Math.random() < 0.5) {
                    name += pick(GIVEN_DOUBLE);
                } else {
                    name += pick(GIVEN_SINGLE);
                }
            }

            // 检验长度
            if (name.length >= minLen && name.length <= maxLen) {
                return name;
            }
        }
        // 保底：返回一个双字名
        return pick(GIVEN_SINGLE) + pick(GIVEN_SINGLE);
    }

    // ===== 批量生成 =====
    export function generateMultiple(count: number, minLen: number = 2, maxLen: number = 8): string[] {
        const result: string[] = [];
        const seen: { [key: string]: boolean } = {};
        let attempts = 0;
        const maxAttempts = count * 10;

        while (result.length < count && attempts < maxAttempts) {
            attempts++;
            const name = generate(minLen, maxLen);
            if (!seen[name]) {
                seen[name] = true;
                result.push(name);
            }
        }
        return result;
    }

    // ===== 刷新（返回新名字，保证跟当前不同） =====
    export function refresh(currentName: string = '', minLen: number = 2, maxLen: number = 8): string {
        let name = generate(minLen, maxLen);
        let attempts = 0;
        while (name === currentName && attempts < 20) {
            name = generate(minLen, maxLen);
            attempts++;
        }
        return name;
    }
}
