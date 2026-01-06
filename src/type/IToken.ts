/**
 * 分词结果的Token接口
 * @interface IToken
 */
export interface IToken {
  /** Token的文本内容 */
  txt: string;
  /** Token类型：单词、标点符号、空格、其他、表情符号、日期、主机名、IP地址、数字、话题标签、提及 */
  type: 'word' | 'punctuation' | 'space' | 'other' | 'emoji' | 'date' | 'host' | 'ip' | 'number' | 'hashtag' | 'mention';
  /** Token的语言代码（可选） */
  lang?: string;
  /** Token的来源（可选），如自定义词库名称 */
  src?: string;
}
