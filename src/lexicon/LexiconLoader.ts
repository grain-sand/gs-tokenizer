import {IMultilingualTokenizer} from '../type';
import * as lexicons from './data';
import {SUPPORTED_LANGUAGES, SupportedLanguage} from "../type";
// 公开的词库类型数组
export const SUPPORTED_TYPES = [
  'firstName', 'lastName', 'famousName', 'famousWorks', 'honorific', 'nickname',
  'title', 'kinship', 'organization', 'country', 'city', 'address', 'computerTerm',
  'networkTerms', 'pronouns', 'foods', 'medicines', 'luxury', 'transportation',
  'appliances', 'furniture', 'pets', 'ecommerce', 'otherNames'
] as const;

// 基于数组的联合类型
export type SupportedType = typeof SUPPORTED_TYPES[number];

export interface LexiconConfig {
  types: SupportedType[];
  languages: SupportedLanguage[];
}

interface LexiconEntryExt {
  priority: number;
  name: string;
  lang: string;
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

    // 按语言分组，同时分离出特殊的姓名词库
    const lexiconsByLang: Record<string, LexiconEntryExt[]> = {};
    const nameLexiconsByLang: Record<string, {lastName?: string[], firstName?: string[], title?: string[]}> = {};
    
    lexicons.forEach(lexicon => {
      // 提取词库类型，如 'zh_CN_firstName' -> 'firstName'
      const lexiconType = lexicon.name.split('_').pop();
      
      if (lexiconType === 'firstName' || lexiconType === 'lastName' || lexiconType === 'title') {
        // 处理特殊的姓名词库
        if (!nameLexiconsByLang[lexicon.lang]) {
          nameLexiconsByLang[lexicon.lang] = {};
        }
        nameLexiconsByLang[lexicon.lang][lexiconType] = lexicon.words;
      } else {
        // 处理普通词库
        if (!lexiconsByLang[lexicon.lang]) {
          lexiconsByLang[lexicon.lang] = [];
        }
        lexiconsByLang[lexicon.lang].push(lexicon);
      }
    });

    // 添加普通词库到tokenizer
    for (const lang in lexiconsByLang) {
      lexiconsByLang[lang].forEach(lexicon => {
        tokenizer.addDictionary(lexicon.words, lexicon.name, lexicon.priority, lexicon.lang as any);
      });
    }
    
    // 添加姓名词库到tokenizer
    for (const lang in nameLexiconsByLang) {
      const nameLexicon = nameLexiconsByLang[lang];
      // 只有当至少包含一个姓名相关词库时才设置
      if (nameLexicon.firstName || nameLexicon.lastName || nameLexicon.title) {
        tokenizer.setNameDictionary({
          lastName: nameLexicon.lastName || [],
          firstName: nameLexicon.firstName || [],
          title: nameLexicon.title || []
        }, lang as any);
      }
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
      .split('')
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
