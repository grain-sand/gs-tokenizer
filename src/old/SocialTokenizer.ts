import { IToken } from '../type';
import { ILanguageTokenizer } from './ILanguageTokenizer';

/**
 * 社交媒体分词器类，专门处理文本中的#关键词和@名称
 * @class SocialTokenizer
 * @implements {ILanguageTokenizer}
 */
export class SocialTokenizer implements ILanguageTokenizer {
  /**
   * 检测文本的语言
   * @param text - 要检测语言的文本
   * @returns 始终返回'en'，因为社交媒体格式是通用的
   */
  detectLanguage(text: string): string {
    return 'en';
  }

  /**
   * 对文本进行分词，识别#关键词和@名称
   * @param text - 要分词的文本
   * @param language - 指定的语言代码（在本实现中未使用）
   * @returns 分词结果的Token数组，包含社交媒体特殊结构的Token
   */
  tokenize(text: string, language: string): IToken[] {
		const tokens: IToken[] = [];
    let currentIndex = 0;

    // 正则表达式：匹配#关键词和@名称
    // #关键词：以#开头，后跟一个或多个字母、数字、中文或下划线
    // @名称：以@开头，后跟一个或多个字母、数字、中文或下划线
    const socialRegex = /(#[\p{L}\p{N}_]+)|(@[\p{L}\p{N}_]+)/gu;

    let match;
    while ((match = socialRegex.exec(text)) !== null) {
      // 添加匹配前的文本
      if (match.index > currentIndex) {
        tokens.push({
          txt: text.substring(currentIndex, match.index),
          type: 'other',
          supLang: language as any,
          src: ''
        });
      }

      // 添加匹配到的#关键词或@名称
      const socialText = match[0];
      const type = socialText.startsWith('#') ? 'hashtag' : 'mention';
      tokens.push({
        txt: socialText,
        type,
        supLang: language as any,
        src: 'social'
      });

      currentIndex = match.index + socialText.length;
    }

    // 添加剩余的文本
    if (currentIndex < text.length) {
      tokens.push({
        txt: text.substring(currentIndex),
        type: 'other',
        supLang: language as any,
        src: ''
      });
    }

    return tokens;
  }
}
