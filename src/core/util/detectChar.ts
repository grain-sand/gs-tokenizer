import {Lang} from "../../type";

/**
 * 检测单个字符的语言类型
 * @param cp 输入字符的Unicode码点
 * @returns 检测到的语言类型
 *
 * 支持的语言类型：
 * - EN: 英文及ASCII字母数字
 * - CJK: 中文、日文、韩文
 * - EMOJI: 表情符号（包括基础emoji、修饰符和组合标记）
 * - RU: 俄语（西里尔文）
 * - AR: 阿拉伯语
 * - HI: 印地语（天城文）
 * - TH: 泰语
 * - HE: 希伯来语
 * - EL: 希腊语
 * - SYMBOL_HALF: 半角符号（ASCII范围内的符号）
 * - SYMBOL_FULL: 全角符号（包括中文符号等Unicode符号）
 * - WHITESPACE: 空白字符（空格、制表符、换行符等）
 * - NUMERIC_HALF: 半角数字
 * - NUMERIC_FULL: 全角数字
 * - NUMERIC_OTHER: 其他数字（罗马数字、圆圈内数字等）
 * - OTHER: 无法识别的字符
 */
export function detectChar(cp: number): Lang {

    // 空白字符处理
    if (cp <= 0x7f && (cp === 0x20 || cp === 0x09 || cp === 0x0a || cp === 0x0d)) {
        return Lang.WHITESPACE;
    }

    // 半角数字检测
    if (cp >= 0x30 && cp <= 0x39) {
        return Lang.NUMERIC_HALF;
    }

    // 全角数字检测
    if (cp >= 0xff10 && cp <= 0xff19) {
        return Lang.NUMERIC_FULL;
    }

    // 罗马数字检测
    if ((cp >= 0x2160 && cp <= 0x2188) || (cp >= 0x2150 && cp <= 0x215f)) {
        return Lang.NUMERIC_OTHER;
    }

    // 圆圈内数字检测
    if ((cp >= 0x2460 && cp <= 0x249b) || (cp >= 0x3220 && cp <= 0x325f) || (cp >= 0x32b1 && cp <= 0x32bf)) {
        return Lang.NUMERIC_OTHER;
    }

    // 其他特殊数字检测
    if ((cp >= 0x2070 && cp <= 0x209f) || (cp >= 0x00b2 && cp <= 0x00b3) || cp === 0x00b9) {
        return Lang.NUMERIC_OTHER;
    }

    // ASCII字符（英文及ASCII字母数字）
    if (cp <= 0x7f) {
        // 半角字母检测
        if ((cp >= 0x41 && cp <= 0x5a) || (cp >= 0x61 && cp <= 0x7a)) {
            return Lang.EN;
        }
        // 半角符号检测（ASCII范围内的非字母数字字符）
        return Lang.SYMBOL_HALF;
    }

    // CJK（中、日、韩）
    if ((cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf)) {
        // 中文：汉字及汉字扩展A
        return Lang.ZH;
    } else if (cp >= 0x3040 && cp <= 0x30ff) {
        // 日文：日文假名
        return Lang.JA;
    } else if (cp >= 0xac00 && cp <= 0xd7af) {
        // 韩文：韩文字母
        return Lang.KO;
    }

    // Emoji
    if ((cp >= 0x1F000 && cp <= 0x1FAFF) ||
        // 经典emoji
        (cp >= 0x2600 && cp <= 0x27BF) ||
        // Emoji修饰符
        (cp >= 0x1F3FB && cp <= 0x1F3FF) ||
        // Emoji组合标记 (零宽连接符)
        (cp >= 0x200D && cp <= 0x200D) ||
        // 变体选择器
        (cp >= 0xFE00 && cp <= 0xFE0F)) {
        return Lang.EMOJI;
    }

    // 其他语言类型
    // 俄语 / 西里尔
    if (cp >= 0x0400 && cp <= 0x04ff) {
        return Lang.RU;
    }

    // 阿拉伯
    if (cp >= 0x0600 && cp <= 0x06ff) {
        return Lang.AR;
    }

    // 印地语（天城文）
    if (cp >= 0x0900 && cp <= 0x097f) {
        return Lang.HI;
    }

    // 泰语
    if (cp >= 0x0e00 && cp <= 0x0e7f) {
        return Lang.TH;
    }

    // 希伯来
    if (cp >= 0x0590 && cp <= 0x05ff) {
        return Lang.HE;
    }

    // 希腊
    if (cp >= 0x0370 && cp <= 0x03ff) {
        return Lang.EL;
    }

    // 全角符号
    if (
        // 中文标点符号
        (cp >= 0x3000 && cp <= 0x303f) ||
        // 全角ASCII符号 (包含所有全角标点和括号)
        (cp >= 0xff00 && cp <= 0xffef) ||
        // 其他常见符号
        (cp >= 0x2000 && cp <= 0x206f) ||
        (cp >= 0x2100 && cp <= 0x26ff)
    ) {
        return Lang.SYMBOL_FULL;
    }

    // 无法识别的字符
    return Lang.OTHER;
}
