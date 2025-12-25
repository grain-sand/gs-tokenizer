/**
 * 分词结果的Token接口
 * @interface Token
 */
export interface Token {
  /** Token的文本内容 */
  txt: string;
  /** Token类型：单词、标点符号、空格、其他、表情符号、日期、URL、IP地址、数字、话题标签、提及 */
  type: 'word' | 'punctuation' | 'space' | 'other' | 'emoji' | 'date' | 'url' | 'ip' | 'number' | 'hashtag' | 'mention';
  /** Token的语言代码（可选） */
  lang?: string;
  /** Token的来源（可选），如自定义词库名称 */
  src?: string;
}

/**
 * 自定义词库条目接口
 * @interface LexiconEntry
 */
export interface LexiconEntry {
  /** 词库优先级，值越高优先级越高 */
  priority: number;
  /** 词库中的单词集合 */
  data: Set<string>;
  /** 词库名称 */
  name: string;
  /** 词库对应的语言代码 */
  lang: string;
}

/**
 * 分词器配置选项接口
 * @interface TokenizerOptions
 */
export interface TokenizerOptions {
  /** 自定义词库配置，键为语言代码，值为该语言的词库条目数组 */
  customDictionaries?: Record<string, LexiconEntry[]>;
  /** 分词粒度：单词、字符、句子 */
  granularity?: 'word' | 'grapheme' | 'sentence';
  /** 默认语言代码，当无法检测语言时使用 */
  defaultLanguage?: string;
}

/**
 * 文本分词选项接口
 * @interface TokenizeTextOptions
 */
export interface TokenizeTextOptions {
  /** 可选，指定文本语言代码 */
  language?: string;
  /** 可选，指定要包含的token类型数组 */
  includeTypes?: Token['type'][];
  /** 可选，指定要排除的token类型数组 */
  excludeTypes?: Token['type'][];
}
