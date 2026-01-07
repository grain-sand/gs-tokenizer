import { IToken } from '../type';
import { ILanguageTokenizer } from './ILanguageTokenizer';

/**
 * 数字分词器类，实现ILanguageTokenizer接口，用于识别和分词文本中的数字和数字+单位组合
 * @class NumberTokenizer
 * @implements {ILanguageTokenizer}
 */
export class NumberTokenizer implements ILanguageTokenizer {
  /**
   * 中文数字字符集
   */
  private readonly CHINESE_NUMBERS = new Set(['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '万', '亿', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖', '拾', '佰', '仟']);
  /** 常见单位集合 */
  private readonly UNITS = new Set(['公斤', '英里', '克', '千克', '吨', '米', '厘米', '毫米', '公里', '斤', '两', '元', '角', '分', '小时', '分钟', '秒', '折', '折扣', '卷', '券', '美元', '人民币', '元', '角', '分', '亩', '公顷', '平方米', '平方分米', '平方厘米', '立方厘米', '升', '毫升', '天', '周', '月', '年', '岁', '度', '瓦', '千瓦', '安培', '伏特', '欧姆', '焦耳', '卡路里', '千克力', '牛', '牛顿', '帕斯卡', '巴', '标准大气压', '毫米汞柱', '摄氏度', '华氏度', '弧度', '角度', 'kg', 'g', 'mg', 't', 'km', 'm', 'cm', 'mm', 'μm', 'nm', 'L', 'mL', 'l', 'ml', 'h', 'min', 's', 'd', 'w', 'y', '°C', '°F', 'rad', 'deg', 'Hz', 'kHz', 'MHz', 'GHz', 'bit', 'Byte', 'B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'lb', 'oz', 'pound', 'pounds']);
  /** 序数词前缀集合 */
  private readonly ORDINAL_PREFIXES = new Set(['第', 'No.', 'No', 'no.', 'no']);

  /**
   * 检测文本的语言
   * @param text - 要检测语言的文本
   * @returns 数字分词器不检测语言，返回空字符串
   */
  detectLanguage(text: string): string {
    return '';
  }

  /**
   * 对文本进行分词，识别并提取数字格式
   * @param text - 要分词的文本
   * @param language - 指定的语言代码
   * @returns 分词结果的Token数组，数字token的type为'number'
   */
  tokenize(text: string, language: string): IToken[] {
    if (!text) return [];

    // 收集所有数字相关的token
    const numberTokens: { start: number; end: number; txt: string }[] = [];
    let i = 0;
    const textLength = text.length;

    while (i < textLength) {
      let matchFound = false;

      // 检查序数词前缀
      let ordinalPrefixMatch = this.findOrdinalPrefix(text, i);
      if (ordinalPrefixMatch) {
        const { prefixEnd } = ordinalPrefixMatch;
        let start = prefixEnd;

        // 跳过空格
        while (start < textLength && text[start].trim() === '') {
          start++;
        }

        // 尝试匹配数字部分
        const numberMatch = this.findNumber(text, start);
        if (numberMatch) {
          let end = numberMatch.end;

          // 跳过空格
          while (end < textLength && text[end].trim() === '') {
            end++;
          }

          // 尝试匹配单位
          const unitMatch = this.findUnit(text, end);
          if (unitMatch) {
            end = unitMatch.end;
          }

          // 添加数字token
          numberTokens.push({
            start: i,
            end: end,
            txt: text.substring(i, end)
          });
          i = end;
          matchFound = true;
        }
      }

      if (!matchFound) {
        // 检查数字+单位
        const numberUnitMatch = this.findNumberWithUnit(text, i);
        if (numberUnitMatch) {
          numberTokens.push({
            start: i,
            end: numberUnitMatch.end,
            txt: text.substring(i, numberUnitMatch.end)
          });
          i = numberUnitMatch.end;
          matchFound = true;
        }
      }

      if (!matchFound) {
        // 检查纯数字
        const numberMatch = this.findNumber(text, i);
        if (numberMatch) {
          numberTokens.push({
            start: i,
            end: numberMatch.end,
            txt: text.substring(i, numberMatch.end)
          });
          i = numberMatch.end;
          matchFound = true;
        }
      }

      if (!matchFound) {
        // 检查中文数字+单位
        const chineseNumberUnitMatch = this.findChineseNumberWithUnit(text, i);
        if (chineseNumberUnitMatch) {
          numberTokens.push({
            start: i,
            end: chineseNumberUnitMatch.end,
            txt: text.substring(i, chineseNumberUnitMatch.end)
          });
          i = chineseNumberUnitMatch.end;
          matchFound = true;
        }
      }

      if (!matchFound) {
        // 检查纯中文数字
        const chineseNumberMatch = this.findChineseNumber(text, i);
        if (chineseNumberMatch) {
          numberTokens.push({
            start: i,
            end: chineseNumberMatch.end,
            txt: text.substring(i, chineseNumberMatch.end)
          });
          i = chineseNumberMatch.end;
          matchFound = true;
        }
      }

      if (!matchFound) {
        // 跳过非数字字符
        i++;
      }
    }

    // 如果没有找到数字token，返回整个文本作为一个other token
    if (numberTokens.length === 0) {
      return [{
        txt: text,
        type: 'other',
        lang: language as any,
        src: ''
      }];
    }

    // 生成最终的token数组，包括数字token和非数字token
    const tokens: IToken[] = [];
    let lastEnd = 0;

    // 处理重叠的数字token，保留最长的
    const mergedTokens: typeof numberTokens = [];
    for (const current of numberTokens) {
      let merged = false;
      for (const [i, existing] of mergedTokens.entries()) {
        if (current.start <= existing.end && current.end >= existing.start) {
          // 重叠，保留最长的
          if (current.end - current.start > existing.end - existing.start) {
            mergedTokens[i] = current;
          }
          merged = true;
          break;
        }
      }
      if (!merged) {
        mergedTokens.push(current);
      }
    }

    // 按起始位置排序
    mergedTokens.sort((a, b) => a.start - b.start);

    // 填充数字token之间的非数字内容
    for (const numberToken of mergedTokens) {
      // 添加数字token前的非数字内容
      if (numberToken.start > lastEnd) {
        tokens.push({
          txt: text.substring(lastEnd, numberToken.start),
          type: 'other',
          lang: language as any,
          src: ''
        });
      }

      // 添加数字token
      tokens.push({
        txt: numberToken.txt,
        type: 'number',
        lang: language as any,
        src: ''
      });

      lastEnd = numberToken.end;
    }

    // 添加最后一个数字token后的非数字内容
    if (lastEnd < textLength) {
      tokens.push({
        txt: text.substring(lastEnd),
        type: 'other',
        lang: language as any,
        src: ''
      });
    }

    return tokens;
  }

  /**
   * 查找序数词前缀
   */
  private findOrdinalPrefix(text: string, start: number): { prefix: string; prefixEnd: number } | null {
    for (const prefix of this.ORDINAL_PREFIXES) {
      if (text.startsWith(prefix, start)) {
        return { prefix, prefixEnd: start + prefix.length };
      }
    }
    return null;
  }

  /**
   * 查找数字部分（包括小数、科学计数法、百分比、千分比等）
   */
  private findNumber(text: string, start: number): { end: number } | null {
    const patterns = [
      // 科学计数法 (如 1.23e4, 1.23E-4, -2.34E+5)
      /^[+-]?\d+(\.\d+)?[eE][+-]?\d+/,
      // 百分比和千分比 (如 50%, 50.5‰, -50%, +50‰)
      /^[+-]?\d+(\.\d+)?%/,
      /^[+-]?\d+(\.\d+)?‰/,
      // 小数 (如 1.23, .123, -123.45)
      /^[+-]?\d+\.\d+/,
      /^[+-]?\.\d+/,
      // 整数 (如 123, -456)
      /^[+-]?\d+/
    ];

    for (const pattern of patterns) {
      const match = pattern.exec(text.substring(start));
      if (match) {
        const matchEnd = start + match[0].length;
        // 检查数字后面是否跟有字母或中文，如果是，则不将其识别为数字（避免拆分5G、0佣金等组合）
        if (matchEnd < text.length && (/[a-zA-Z]/.test(text[matchEnd]) || /[\u4e00-\u9fff]/.test(text[matchEnd]))) {
          // 如果是科学计数法，则仍然识别为数字
          if (pattern === patterns[0]) {
            return { end: matchEnd };
          }
          // 否则跳过这个匹配
          continue;
        }
        // 确保不包含后面的非数字字符
        return { end: matchEnd };
      }
    }

    return null;
  }

  /**
   * 查找中文数字部分
   */
  private findChineseNumber(text: string, start: number): { end: number } | null {
    let i = start;
    while (i < text.length && this.CHINESE_NUMBERS.has(text[i])) {
      i++;
    }

    const length = i - start;

    // 识别长度大于1的中文数字
    if (length > 1) {
      return { end: i };
    }

    // 对于单个数字字符，只有在特定条件下才识别为数字
    if (length === 1) {
      // 检查前面是否是数字相关字符（包括数字、小数点等）
      const prevChar = start > 0 ? text[start - 1] : '';

      // 检查后面是否是单位或其他数字相关字符
      const nextChar = start + 1 < text.length ? text[start + 1] : '';
      const nextUnit = this.findUnit(text, start + 1);

      // 如果前面是数字相关字符，或者后面是单位，则识别为数字
      if ((prevChar && this.isNumberRelatedChar(prevChar)) ||
          nextUnit) {
        return { end: i };
      }

      // 如果后面是数字字符，则识别为数字
      if (nextChar && this.CHINESE_NUMBERS.has(nextChar)) {
        return { end: i };
      }
    }

    return null;
  }

  /**
   * 判断字符是否是数字相关字符
   */
  private isNumberRelatedChar(char: string): boolean {
    return this.CHINESE_NUMBERS.has(char) ||
           this.UNITS.has(char) ||
           (char >= '0' && char <= '9') ||
           char === '.' || char === 'e' || char === 'E' ||
           char === '+' || char === '-';
  }

  /**
   * 查找单位部分
   */
  private findUnit(text: string, start: number): { end: number } | null {
    // 查找最长匹配的单位
    let maxLength = 0;
    for (let i = start; i < Math.min(start + 5, text.length); i++) {
      const possibleUnit = text.substring(start, i + 1);
      if (this.UNITS.has(possibleUnit)) {
        // 确保单位后面不是字母或数字，避免匹配到单词的一部分
        const nextChar = text[i + 1];
        if (!nextChar || !/[a-zA-Z0-9]/.test(nextChar)) {
          maxLength = i + 1 - start;
        }
      }
    }
    if (maxLength > 0) {
      return { end: start + maxLength };
    }
    return null;
  }

  /**
   * 查找数字+单位组合
   */
  private findNumberWithUnit(text: string, start: number): { end: number } | null {
    // 先查找数字部分
    const numberMatch = this.findNumber(text, start);
    if (!numberMatch) return null;

    let end = numberMatch.end;

    // 检查是否有单位（不跳过空格，避免包含多余空格）
    const unitMatch = this.findUnit(text, end);
    if (unitMatch) {
      end = unitMatch.end;
    }

    // 检查是否是数字+单位组合
    if (end > numberMatch.end) {
      return { end };
    }

    return null;
  }

  /**
   * 查找中文数字+单位组合
   */
  private findChineseNumberWithUnit(text: string, start: number): { end: number } | null {
    // 先查找中文数字部分
    const chineseNumberMatch = this.findChineseNumber(text, start);
    if (!chineseNumberMatch) return null;

    let end = chineseNumberMatch.end;

    // 检查是否有单位（不跳过空格，避免包含多余空格）
    const unitMatch = this.findUnit(text, end);
    if (unitMatch) {
      end = unitMatch.end;
    }

    // 检查是否是中文数字+单位组合
    if (end > chineseNumberMatch.end) {
      return { end };
    }

    return null;
  }



}
