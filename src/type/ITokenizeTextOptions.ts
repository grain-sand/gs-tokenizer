/**
 * 文本分词选项接口
 * @interface ITokenizeTextOptions
 */
export interface ITokenizeTextOptions {
  /** 可选，指定文本语言代码 */
  language?: string;
  /** 可选，指定要包含的token类型数组 */
  includeTypes?: string[];
  /** 可选，指定要排除的token类型数组 */
  excludeTypes?: string[];
}
