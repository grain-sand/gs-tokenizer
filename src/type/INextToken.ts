/**
 * 扩展的Token接口，增加了必选的位置信息
 * @interface INextToken
 * @extends IToken
 */
import { IToken } from './IToken';

export interface INextToken extends IToken {
  /** Token在原文本中的起始位置 */
  start: number;
  /** Token在原文本中的结束位置 */
  end: number;
}
