import { ITokenizeTextOptions } from './ITokenizeTextOptions';
import { IToken } from './IToken';

/**
 * 多语言分词器接口
 * @interface IMultilingualTokenizer
 */
export interface IMultilingualTokenizer {
  /**
   * 添加自定义词库
   * @param words - 要添加的单词数组
   * @param name - 词库名称，用于标识和管理词库
   * @param priority - 词库优先级，值越高优先级越高，默认比内置词库最高优先级大100
   * @param language - 词库对应的语言代码，未指定时自动根据words判断
   */
  addDictionary(words: string[], name: string, priority?: number, language?: string): void;

  /**
   * 移除自定义词库中的指定单词
   * @param word - 要移除的单词
   * @param language - 可选，指定要操作的语言词库
   * @param lexiconName - 可选，指定要操作的词库名称
   */
  removeCustomWord(word: string, language?: string, lexiconName?: string): void;

  /**
   * 对文本进行分词
   * @param text - 要分词的文本
   * @param language - 可选，指定文本语言代码
   * @returns 分词结果的Token数组
   */
  tokenize(text: string, language?: string): IToken[];

  /**
   * 获取纯文本分词结果，可自定义包含或排除的token类型
   * @param text - 要分词的文本
   * @param options - 可选，配置项
   * @returns 文本数组
   */
  tokenizeText(text: string, options?: ITokenizeTextOptions): string[];

  /**
   * 获取当前已加载的所有词库名称
   * @returns 词库名称数组
   */
  loadedLexiconNames: string[];
}
