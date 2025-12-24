import {LexiconEntry} from '../core';
import * as lexicons from '../lexicon';

export interface LexiconConfig {
  types: string[];
  languages: string[];
}

export class LexiconLoader {
  private static instances: Map<string, LexiconLoader> = new Map();
  private lexicons: LexiconEntry[] = [];

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
      // 将语言代码转换为词库名称格式，如'zh-CN' -> 'zh_CN'
      const langCode = lang.replace('-', '_');
      
      types.forEach(type => {
        // 构建词库名称，如'zh_CN_LastName'
        const lexiconName = `${langCode}_${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof lexicons;
        
        // 从lexicons对象中获取词库内容
        const lexiconContent = lexicons[lexiconName] || '';
        
        // 解析词库并添加到列表
        const lexiconSet = this.parseLexiconString(lexiconContent);
        this.lexicons.push({
          priority: priorityMap[type] || 50, // 默认优先级50
          data: lexiconSet,
          name: `${langCode}_${type}`,
          lang: lang
        });
      });
    });
  }

  /**
   * 解析词库字符串为Set
   */
  private parseLexiconString(lexiconString: string): Set<string> {
    const words = lexiconString
      .split('\u001F')
      .map(word => word.trim())
      .filter(word => word.length > 0);
    return new Set(words);
  }

  /**
   * 检查单词是否在词库中，并返回词库来源
   */
  public checkWord(word: string): { found: boolean; lexiconName: string } {
    for (const lexicon of this.lexicons) {
      if (lexicon.data.has(word)) {
        return { found: true, lexiconName: lexicon.name };
      }
    }
    return { found: false, lexiconName: '' };
  }

  /**
   * 添加自定义词库
   */
  public addCustomLexicon(lexicon: LexiconEntry): void {
    this.lexicons.push(lexicon);
    // 按优先级排序（降序）
    this.lexicons.sort((a, b) => b.priority - a.priority);
  }
  /**
   * 获取所有词库条目
   */
  public getLexicons(): LexiconEntry[] {
    return this.lexicons;
  }

  /**
   * 清除所有实例
   */
  public static clearAllInstances(): void {
    LexiconLoader.instances.clear();
  }
}