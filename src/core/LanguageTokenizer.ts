import { Token } from './types';

/**
 * 语言分词器接口
 * @interface LanguageTokenizer
 */
export interface LanguageTokenizer {
  /**
   * 检测文本的语言
   * @param text - 要检测语言的文本
   * @returns 检测到的语言代码
   */
  detectLanguage(text: string): string;
  
  /**
   * 对文本进行分词
   * @param text - 要分词的文本
   * @param language - 指定的语言代码
   * @returns 分词结果的Token数组
   */
  tokenize(text: string, language: string): Token[];
}