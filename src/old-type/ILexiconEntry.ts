/**
 * 自定义词库条目接口
 * @interface ILexiconEntry
 */
export interface ILexiconEntry {
  /** 词库优先级，值越高优先级越高 */
  priority: number;
  /** 词库中的单词集合 */
  data: Set<string>;
  /** 词库名称 */
  name: string;
  /** 词库对应的语言代码 */
  lang: string;
}
