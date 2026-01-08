/**
 * 分词器配置选项接口
 */
export interface ITokenizerOptions {
  /** 自定义词库配置，键为语言代码，值为该语言的词库条目数组 */
  dictionaries?: Record<string, any[]>;
  /** 分词粒度：单词、字符、句子 */
  granularity?: 'word' | 'grapheme' | 'sentence';
  /** 默认语言代码，当无法检测语言时使用 */
  defaultLanguage?: string;
}
