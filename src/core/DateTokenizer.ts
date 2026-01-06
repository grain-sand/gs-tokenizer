import { IToken } from '../type';
import { ILanguageTokenizer } from './ILanguageTokenizer';

/**
 * 日期分词器类，实现ILanguageTokenizer接口，用于识别和分词文本中的日期格式
 * @class DateTokenizer
 * @implements {ILanguageTokenizer}
 */
export class DateTokenizer implements ILanguageTokenizer {
  /** 综合日期时间正则表达式，用于匹配多种日期和时间格式 */
  private comprehensiveDatePattern: RegExp = /\d{8}|\d{4}[-/.]\d{2}[-/.]\d{2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:,\s+\d{4})?|\d{4}年\d{1,2}月(?:\d{1,2}日)?|\d{1,2}月\d{1,2}日(?:\d{4}年)?|\d+(?:小时|分钟|秒|毫秒|天|周|月|年|\s+(?:hours?|minutes?|seconds?|milliseconds?|days?|weeks?|months?|years?))|[零一二三四五六七八九十百千万亿]+(?:小时|分钟|秒|毫秒|天|周|月|年)/gi;

  /**
   * 检测文本的语言
   * @param text - 要检测语言的文本
   * @returns 日期分词器不检测语言，返回空字符串
   */
  detectLanguage(text: string): string {
    // 日期分词器不需要检测语言，它会处理所有语言中的日期格式
    return '';
  }

  /**
   * 对文本进行分词，识别并提取日期格式
   * @param text - 要分词的文本
   * @param language - 指定的语言代码，默认为中文'zh'
   * @returns 分词结果的Token数组，日期token的type为'date'
   */
  tokenize(text: string, language: string = 'zh'): IToken[] {
		const tokens: IToken[] = [];
    let lastIndex = 0;

    // 收集所有日期匹配
    const dateMatches: Array<{ text: string; index: number }> = [];
    
    // 使用综合正则表达式匹配所有可能的日期格式
    for (const match of text.matchAll(this.comprehensiveDatePattern)) {
      if (match.index !== undefined && match[0]) {
        dateMatches.push({ text: match[0], index: match.index });
      }
    }

    // 按位置排序
    dateMatches.sort((a, b) => a.index - b.index);

    // 合并重叠或相邻的匹配
    const mergedMatches: Array<{ text: string; index: number }> = [];
    let currentMatch: { text: string; index: number; end: number } | null = null;
    
    for (const match of dateMatches) {
      const matchEnd = match.index + match.text.length;
      
      if (!currentMatch) {
        currentMatch = { ...match, end: matchEnd };
      } else if (match.index <= currentMatch.end) {
        // 重叠或相邻，合并
        const combinedText = text.slice(currentMatch.index, Math.max(currentMatch.end, matchEnd));
        currentMatch = {
          text: combinedText,
          index: currentMatch.index,
          end: Math.max(currentMatch.end, matchEnd)
        };
      } else {
        // 不重叠，保存当前匹配
        mergedMatches.push({ text: currentMatch.text, index: currentMatch.index });
        currentMatch = { ...match, end: matchEnd };
      }
    }
    
    if (currentMatch) {
      mergedMatches.push({ text: currentMatch.text, index: currentMatch.index });
    }

    // 生成最终的tokens
    for (const match of mergedMatches) {
      // 添加匹配前的文本
      if (match.index > lastIndex) {
        const nonDateText = text.slice(lastIndex, match.index);
        tokens.push({ txt: nonDateText, type: 'other', lang: language, src: '' });
      }
      
      // 添加日期token
      if (this.isValidDate(match.text)) {
        tokens.push({ txt: match.text, type: 'date', lang: language, src: '' });
      } else {
        tokens.push({ txt: match.text, type: 'other', lang: language, src: '' });
      }
      
      lastIndex = match.index + match.text.length;
    }
    
    // 添加剩余的文本
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      tokens.push({ txt: remainingText, type: 'other', lang: language, src: '' });
    }

    return tokens;
  }

  // 简单的日期时间验证，确保日期格式合理，时间格式直接通过验证
  private isValidDate(text: string): boolean {
    // 处理时间格式：数字+时间单位
    if (/^\d+(?:小时|分钟|秒|毫秒|天|周|月|年|\s+(?:hours?|minutes?|seconds?|milliseconds?|days?|weeks?|months?|years?))$/.test(text)) {
      return true;
    }
    
    // 处理时间格式：中文数字+时间单位
    if (/^[零一二三四五六七八九十百千万亿]+(?:小时|分钟|秒|毫秒|天|周|月|年)$/.test(text)) {
      return true;
    }
    
    // 处理不同的日期格式
    let year: number, month: number, day: number;
    
    // 8位数字日期：20231001
    if (/^\d{8}$/.test(text)) {
      year = parseInt(text.slice(0, 4));
      month = parseInt(text.slice(4, 6));
      day = parseInt(text.slice(6, 8));
    }
    // YYYY-MM-DD 或 YYYY.MM.DD
    else if (/^\d{4}[-.]\d{2}[-.]\d{2}$/.test(text)) {
      const parts = text.split(/[-.]/).map(Number);
      year = parts[0];
      month = parts[1];
      day = parts[2];
    }
    // MM/DD/YYYY 或 DD-MM-YYYY 或 MM.DD.YYYY 或 YYYY/MM/DD
    else if (/^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$/.test(text) || /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(text)) {
      const parts = text.split(/[-/.]/).map(Number);
      if (parts[0] >= 1000) {
        // YYYY在最前（YYYY/MM/DD 或 YYYY-MM-DD 或 YYYY.MM.DD）
        year = parts[0];
        month = parts[1];
        day = parts[2];
      } else if (parts[2] > 31) {
        // YYYY在最后（MM/DD/YYYY）
        month = parts[0];
        day = parts[1];
        year = parts[2];
      } else {
        // 假设是 MM/DD/YY
        month = parts[0];
        day = parts[1];
        year = parts[2] < 50 ? 2000 + parts[2] : 1900 + parts[2];
      }
    }
    // 英文日期：October 1, 2023 或 Oct 1, 2023
    else if (/^(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:,\s+(\d{4}))?$/i.test(text)) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const match = text.match(/^(\w+)\s+(\d{1,2})(?:,\s+(\d{4}))?$/i);
      if (!match) return false;
      
      month = monthNames.findIndex(m => m.toLowerCase() === match[1].substring(0, 3).toLowerCase()) + 1;
      day = parseInt(match[2]);
      year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
    }
    // 中文日期：2023年10月1日 或 10月1日2023年
    else if (/^(\d{4})?年?(\d{1,2})月(\d{1,2})日?(\d{4})?$/.test(text)) {
      const match = text.match(/^(\d{4})?年?(\d{1,2})月(\d{1,2})日?(\d{4})?$/);
      if (!match) return false;
      
      year = parseInt(match[1] || match[4] || new Date().getFullYear().toString());
      month = parseInt(match[2]);
      day = parseInt(match[3]);
    }
    else {
      return false;
    }
    
    return this.isValidDateComponents(year, month, day);
  }
  

  
  // 验证日期组件是否有效
  private isValidDateComponents(year: number, month: number, day: number): boolean {
    // 验证月和日的范围
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    // 检查不同月份的天数
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month === 2) {
      // 检查闰年
      const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      if (day > (isLeapYear ? 29 : 28)) return false;
    } else {
      if (day > daysInMonth[month - 1]) return false;
    }
    
    return true;
  }
}
