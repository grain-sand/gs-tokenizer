import { IToken } from '../type';
import { ILanguageTokenizer } from './ILanguageTokenizer';

/**
 * 主机名和IP地址分词器类，专门处理文本中的主机名和IP地址
 * @class HostIPTokenizer
 * @implements {ILanguageTokenizer}
 */
export class HostIPTokenizer implements ILanguageTokenizer {
  /**
   * 检测文本的语言
   * @param text - 要检测语言的文本
   * @returns 始终返回'en'，因为URL和IP地址通常与英语相关
   */
  detectLanguage(text: string): string {
    return 'en';
  }

  /**
   * 对文本进行分词，识别主机名和IP地址
   * @param text - 要分词的文本
   * @param language - 指定的语言代码（在本实现中未使用）
   * @returns 分词结果的Token数组，包含主机名和IP地址类型的Token
   */
  tokenize(text: string, language: string): IToken[] {
		const tokens: IToken[] = [];
    let currentIndex = 0;

    // IPv4正则表达式（带端口）
    const ipv4Regex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?::\d{1,5})?\b/g;
    // 主机名正则表达式（带端口）
    const hostRegex = /\b(?:[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?|localhost)(?::\d{1,5})?\b/g;

    // 首先找出所有主机名和IP地址的匹配位置
    const matches: Array<{ index: number; endIndex: number; type: 'host' | 'ip'; text: string }> = [];

    // 查找所有IP地址
    let match;
    while ((match = ipv4Regex.exec(text)) !== null) {
      matches.push({
        index: match.index,
        endIndex: match.index + match[0].length,
        type: 'ip',
        text: match[0]
      });
    }

    // 查找所有主机名
    while ((match = hostRegex.exec(text)) !== null) {
      matches.push({
        index: match.index,
        endIndex: match.index + match[0].length,
        type: 'host',
        text: match[0]
      });
    }

    // 按位置排序
    matches.sort((a, b) => a.index - b.index);

    // 去重：如果一个匹配被另一个包含，保留较长的那个
    // 如果两个匹配完全相同，优先保留IP类型
    const uniqueMatches: typeof matches = [];
    for (let i = 0; i < matches.length; i++) {
      let isDuplicate = false;
      for (let j = 0; j < matches.length; j++) {
        if (i !== j) {
          // 检查是否完全相同的匹配
          const isExactMatch =
            matches[i].index === matches[j].index &&
            matches[i].endIndex === matches[j].endIndex;

          // 检查是否被包含
          const isIncluded =
            matches[i].index >= matches[j].index &&
            matches[i].endIndex <= matches[j].endIndex;

          if (isExactMatch) {
            // 如果两个匹配完全相同，优先保留IP类型
            if (matches[j].type === 'ip') {
              isDuplicate = true;
              break;
            }
          } else if (isIncluded) {
            // 如果被另一个匹配包含，标记为重复
            isDuplicate = true;
            break;
          }
        }
      }
      if (!isDuplicate) {
        uniqueMatches.push(matches[i]);
      }
    }

    // 生成Token
    for (const match of uniqueMatches) {
      // 添加匹配前的文本
      if (match.index > currentIndex) {
        tokens.push({
          txt: text.substring(currentIndex, match.index),
          type: 'other',
          lang: language as any
        });
      }

      // 添加匹配的主机名或IP
      tokens.push({
        txt: match.text,
        type: match.type,
        lang: 'en'
      });

      currentIndex = match.endIndex;
    }

    // 添加剩余文本
    if (currentIndex < text.length) {
      tokens.push({
        txt: text.substring(currentIndex),
        type: 'other',
        lang: language as any
      });
    }

    return tokens;
  }
}
