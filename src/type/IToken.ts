/**
 * Token接口定义
 */
import { TokenType } from './TokenType';
import { SupportedLanguage } from './SupportedLanguage';

export interface IToken {
	txt: string;
	type: TokenType;

	/** 说明性信息 */
	lang?: SupportedLanguage;
	src?: string;
}
