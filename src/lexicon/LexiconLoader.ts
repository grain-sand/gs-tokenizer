import {ILexiconEntry} from '../core';
import {IMultilingualTokenizer} from '../type';
import * as lexicons from './data';

// 公开的语言数组
// 支持的语言包括'zh'作为'zh-CN'的别名
export const SUPPORTED_LANGUAGES = ['zh', 'zh-CN', 'zh-TW', 'en', 'ja', 'ko'] as const;
// 公开的词库类型数组
export const SUPPORTED_TYPES = [
  'firstName', 'lastName', 'famousName', 'famousWorks', 'honorific', 'nickname',
  'title', 'kinship', 'organization', 'country', 'city', 'address', 'computerTerm',
  'networkTerms', 'pronouns', 'foods', 'medicines', 'luxury', 'transportation',
  'appliances', 'furniture', 'pets', 'ecommerce', 'otherNames'
] as const;

// 基于数组的联合类型
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
export type SupportedType = typeof SUPPORTED_TYPES[number];

export interface LexiconConfig {
  types: SupportedType[];
  languages: SupportedLanguage[];
}

interface LexiconEntryExt extends Omit<ILexiconEntry, 'data'> {
  words: string[];
}

export class LexiconLoader {
  private static instances: Map<string, LexiconLoader> = new Map();
  private lexicons: LexiconEntryExt[] = [];

  private constructor(config: LexiconConfig) {
    this.loadLexicons(config);
  }

  /**
   * 获取词库加载器实例
   */
  public static getInstance(config: LexiconConfig): LexiconLoader {
    const key = `${JSON.stringify(config.types)}-${JSON.stringify(config.languages)}`;
    if (!LexiconLoader.instances.has(key)) {
      LexiconLoader.instances.set(key, new LexiconLoader(config));
    }
    return LexiconLoader.instances.get(key)!;
  }

  /**
   * 加载指定语言和类型的词库到MultilingualTokenizer实例
   */
  public static loadTo(tokenizer: IMultilingualTokenizer, config?: LexiconConfig): void {
    // 如果未提供配置，默认加载所有词库
    const actualConfig: LexiconConfig = config || {
      types: Array.from(SUPPORTED_TYPES),
      languages: Array.from(SUPPORTED_LANGUAGES)
    };

    const loader = LexiconLoader.getInstance(actualConfig);
    const lexicons = loader.getLexicons();

    // 按语言分组添加到tokenizer
    const lexiconsByLang: Record<string, LexiconEntryExt[]> = {};
    lexicons.forEach(lexicon => {
      if (!lexiconsByLang[lexicon.lang]) {
        lexiconsByLang[lexicon.lang] = [];
      }
      lexiconsByLang[lexicon.lang].push(lexicon);
    });

    // 添加到tokenizer
    for (const lang in lexiconsByLang) {
      // 添加到tokenizer，使用预存储的数组版本避免重复转换
      lexiconsByLang[lang].forEach(lexicon => {
        tokenizer.addDictionary(lexicon.words, lexicon.name, lexicon.priority, lexicon.lang);
      });
    }
  }

  /**
   * 加载指定语言和类型的词库
   */
  private loadLexicons(config: LexiconConfig): void {
    const { languages, types } = config;
    this.lexicons = [];

    // 优先级映射对象
    const priorityMap: Record<string, number> = {
      lastName: 100,
      firstName: 100,
      famousName: 100,
      famousWorks: 100,
      country: 80,
      computerTerm: 75,
      ecommerce: 75,
      city: 70,
      networkTerms: 70,
      medicines: 70,
      transportation: 70,
      luxury: 65,
      pronouns: 65,
      address: 60,
      foods: 60,
      appliances: 60,
      honorific: 50,
      nickname: 50,
      title: 50,
      kinship: 50,
      organization: 50,
      furniture: 55,
      pets: 55
    };

    // 遍历所有语言和类型，自动推测并加载词库
    languages.forEach(lang => {
      // 将语言代码转换为词库名称格式，如'zh-CN' -> 'zh_CN', 'en' -> 'en_US'
      let langCode: string;

      // 处理中文别名
      if (lang === 'zh') {
        langCode = 'zh_CN';
      } else if (lang === 'zh-CN') {
        langCode = 'zh_CN';
      } else if (lang === 'zh-TW') {
        langCode = 'zh_TW';
      } else if (lang === 'en') {
        langCode = 'en_US';
      } else if (lang === 'ja') {
        langCode = 'ja_JP';
      } else if (lang === 'ko') {
        langCode = 'ko_KR';
      } else {
        // 默认为语言代码本身
        langCode = lang;
      }

      types.forEach(type => {
        // 构建词库名称，如'zh_CN_LastName'
        const lexiconName = `${langCode}_${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof lexicons;

        // 从lexicons对象中获取词库内容
        const lexiconContent = lexicons[lexiconName] || '';

        // 解析词库并添加到列表
        this.lexicons.push({
          priority: priorityMap[type] || 50, // 默认优先级50
          words: this.parseLexiconString(lexiconContent), // 直接存储数组版本
          name: `${langCode}_${type}`,
          lang: lang
        });
      });
    });
  }

  /**
   * 解析词库字符串为Set
   */
  private parseLexiconString(lexiconString: string):string[] {
    return  lexiconString
      .split('\u001F')
      .map(word => word.trim())
      .filter(word => word.length > 0);
  }

  /**
   * 获取所有词库条目
   */
  public getLexicons(): LexiconEntryExt[] {
    return this.lexicons;
  }
  /**
   * 清除所有实例
   */
  public static clearAllInstances(): void {
    LexiconLoader.instances.clear();
  }

}
