import { Token, TokenizerOptions, LexiconEntry, TokenizeTextOptions } from './types';
import { LanguageTokenizer } from './LanguageTokenizer';
import { EnglishTokenizer } from './EnglishTokenizer';
import { CJKTokenizer } from './CJKTokenizer';
import { DateTokenizer } from './DateTokenizer';
import { URLIPTokenizer } from './URLIPTokenizer';
import { NumberTokenizer } from './NumberTokenizer';
import { LanguageDetector } from './LanguageDetector';

/**
 * 多语言分词器类，支持中英文、日语、韩语等多种语言的文本分词
 * @class MultilingualTokenizer
 */
export class MultilingualTokenizer {
  /** 语言分词器数组 */
  private tokenizers: LanguageTokenizer[];
  /** 自定义词库，键为语言代码，值为该语言的词库条目数组 */
  private customDictionaries: Record<string, LexiconEntry[]>;
  /** 默认语言代码 */
  private defaultLanguage;

  /**
   * 构造函数
   * @param options - 分词器配置选项
   */
  constructor(options: TokenizerOptions = {}) {
    this.customDictionaries = options.customDictionaries || {};
    this.defaultLanguage = options.defaultLanguage || 'en';
    this.tokenizers = [
      new DateTokenizer(),
      new URLIPTokenizer(),
      new NumberTokenizer(),
      new EnglishTokenizer(),
      new CJKTokenizer(this.customDictionaries)
    ];
  }

  /**
   * 添加自定义词库
   * @param words - 要添加的单词数组
   * @param language - 词库对应的语言代码
   * @param priority - 词库优先级，值越高优先级越高
   * @param name - 词库名称，用于标识和管理词库
   */
  addCustomDictionary(words: string[], language: string, priority: number, name: string): void {
    const lang = language || this.defaultLanguage;
    
    if (!this.customDictionaries[lang]) {
      this.customDictionaries[lang] = [];
    }
    
    const existingIndex = this.customDictionaries[lang].findIndex(entry => 
      entry.name === name && entry.lang === lang && entry.priority === priority
    );
    
    if (existingIndex >= 0) {
      const existingEntry = this.customDictionaries[lang][existingIndex];
      words.forEach(word => existingEntry.data.add(word));
    } else {
      this.customDictionaries[lang].push({
        priority,
        data: new Set(words),
        name,
        lang
      });
    }
    
    // 更新CJKTokenizer实例中的customDictionaries
    const cjkTokenizer = this.tokenizers.find(t => t instanceof CJKTokenizer);
    if (cjkTokenizer) {
      (cjkTokenizer as any).customDictionaries = this.customDictionaries;
    }
  }

  /**
   * 移除自定义词库中的指定单词
   * @param word - 要移除的单词
   * @param language - 可选，指定要操作的语言词库
   * @param lexiconName - 可选，指定要操作的词库名称
   */
  removeCustomWord(word: string, language?: string, lexiconName?: string): void {
    if (language) {
      if (this.customDictionaries[language]) {
        if (lexiconName) {
          const lexicon = this.customDictionaries[language].find(entry => entry.name === lexiconName);
          if (lexicon) {
            lexicon.data.delete(word);
          }
        } else {
          this.customDictionaries[language].forEach(lexicon => {
            lexicon.data.delete(word);
          });
        }
      }
    } else {
      Object.values(this.customDictionaries).forEach(lexicons => {
        lexicons.forEach(lexicon => {
          if (lexicon.data.has(word)) {
            lexicon.data.delete(word);
          }
        });
      });
    }
  }

  /**
   * 主分词方法，对输入文本进行多语言分词
   * @param text - 要分词的文本
   * @param language - 可选，指定文本语言代码，不指定则自动检测
   * @returns 分词结果的Token数组
   */
  tokenize(text: string, language?: string): Token[] {
    const lang = language || LanguageDetector.detectLanguage(text);
    
    // 1. 首先使用日期分词器处理所有日期格式
    const dateTokenizer = this.tokenizers.find(t => t instanceof DateTokenizer);
    if (!dateTokenizer) return [];
    
    const dateTokens = dateTokenizer.tokenize(text, lang);
    const finalTokens: Token[] = [];
    
    // 2. 对非日期部分使用URLIP分词器处理
    const urlIpTokenizer = this.tokenizers.find(t => t instanceof URLIPTokenizer);
    if (!urlIpTokenizer) return finalTokens;
    
    for (const token of dateTokens) {
      if (token.type === 'date') {
        finalTokens.push(token);
      } else {
        const urlIpTokens = urlIpTokenizer.tokenize(token.txt, lang);
        
        // 3. 对非URL和非IP部分使用数字分词器处理
        const numberTokenizer = this.tokenizers.find(t => t instanceof NumberTokenizer);
        if (!numberTokenizer) return finalTokens;
        
        for (const urlIpToken of urlIpTokens) {
          if (urlIpToken.type === 'url' || urlIpToken.type === 'ip') {
            finalTokens.push(urlIpToken);
          } else {
            const numberTokens = numberTokenizer.tokenize(urlIpToken.txt, lang);
            
            // 4. 对非数字部分使用相应的语言分词器处理
            for (const numberToken of numberTokens) {
              if (numberToken.type === 'number') {
                finalTokens.push(numberToken);
              } else {
                let subTokens: Token[] = [];
                
                if (lang === 'en') {
                  const englishTokenizer = this.tokenizers.find(t => t instanceof EnglishTokenizer);
                  if (englishTokenizer) {
                    subTokens = (englishTokenizer as any).tokenize(numberToken.txt, lang);
                  }
                } else if (['zh', 'ja', 'ko'].includes(lang)) {
                  const cjkTokenizer = this.tokenizers.find(t => t instanceof CJKTokenizer);
                  if (cjkTokenizer) {
                    subTokens = (cjkTokenizer as any).tokenize(numberToken.txt, lang);
                  }
                } else {
                  const cjkTokenizer = this.tokenizers.find(t => t instanceof CJKTokenizer);
                  if (cjkTokenizer) {
                    subTokens = (cjkTokenizer as any).tokenize(numberToken.txt, lang);
                  }
                }
                
                if (subTokens.length > 0) {
                  finalTokens.push(...subTokens);
                } else {
                  finalTokens.push(numberToken);
                }
              }
            }
          }
        }
      }
    }
    
    return finalTokens;
  }

  /**
   * 获取纯文本分词结果，可自定义包含或排除的token类型
   * @param text - 要分词的文本
   * @param options - 可选，配置项
   * @param options.language - 可选，指定文本语言代码
   * @param options.includeTypes - 可选，指定要包含的token类型数组
   * @param options.excludeTypes - 可选，指定要排除的token类型数组
   * @returns 文本数组
   */
  tokenizeText(text: string, options?: TokenizeTextOptions): string[] {
    const tokens = this.tokenize(text, options?.language);
    
    // 默认排除标点符号、空格和其他类型
    const defaultExcludeTypes: Token['type'][] = ['punctuation', 'space', 'other'];
    
    // 合并默认排除类型和用户指定的排除类型
    const excludeTypes = [
      ...defaultExcludeTypes,
      ...(options?.excludeTypes || [])
    ];
    
    return tokens.filter(token => {
      // 如果提供了includeTypes，首先检查是否包含指定类型
      if (options?.includeTypes && options.includeTypes.length > 0) {
        if (!options.includeTypes.includes(token.type)) {
          return false;
        }
      }
      
      // 检查是否在排除类型列表中
      return !excludeTypes.includes(token.type);
    }).map(token => token.txt);
  }

}

/**
 * 创建多语言分词器实例的工厂函数
 * @param options - 分词器配置选项
 * @returns MultilingualTokenizer实例
 */
export function createTokenizer(options?: TokenizerOptions) {
  return new MultilingualTokenizer(options);
}