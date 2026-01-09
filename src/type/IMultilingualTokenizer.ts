import {IToken, TokenType} from './IToken';
import {IWordIndex, INameLexiconGroup} from './IWordIndex';
import {ITokenizerStage} from './ITokenizerStage';
import {SupportedLanguage} from './SupportedLanguage';

export interface ITokenizerOption {
	/**
	 * 最小分词长度
	 * - 小于该长度的 token 会被过滤
	 */
	minTokenLength?: number
	/**
	 * CJK 分词长度限制
	 * - 超过该长度的 token 会被截断
	 */
	cjkTokenLengthLimit?: number
	/**
	 * 英文分词长度限制,它应该 >= cjkTokenLengthLimit,否则会出错
	 * - 超过该长度的 token 会被截断
	 */
	enTokenLengthLimit?: number
	/**
	 * URL 路径 Token 长度限制
	 * - 超过该长度的 token 会被截断
	 */
	urlPathLengthLimit?: number
	/**
	 * URL 查询参数 Token 长度限制
	 * - 超过该长度的 token 会被截断
	 */
	urlQueryLengthLimit?: number

	/**
	 * 是否将英文分词转换为小写
	 */
	lowercaseEnglish?: boolean
}

export const DefaultTokenizerOption: Required<ITokenizerOption> = {
	minTokenLength: 1,
	enTokenLengthLimit: 64,
	cjkTokenLengthLimit: 32,
	urlPathLengthLimit: 64,
	urlQueryLengthLimit: 64,
	lowercaseEnglish: true
}

export interface IMultilingualTokenizer {

	readonly wordIndex: IWordIndex;

	loadedLexiconNames: string[];

	initialize(options: ITokenizerOption): void;

	addDictionary(
		words: string[],
		name: string,
		priority?: number,
		language?: SupportedLanguage
	): void;

	/* ---------- Stage 扩展 ---------- */

	/**
	 * 设置姓名词库
	 * - 一旦设置即启用姓名分词 stage
	 * - 未设置则不加载姓名处理流程
	 */
	setNameDictionary(
		nameLexicon: INameLexiconGroup,
		language: SupportedLanguage
	): void;

	/**
	 * 添加自定义分词 Stage
	 * - 可用于新增能力
	 * - 可用于替换内置算法（同 order + 更高 priority）
	 */
	addStage(stage: ITokenizerStage): void;

	tokenize(text: string): IToken[];

	tokenizeAll(text: string): IToken[];

	tokenizeText(text: string, exclude?: TokenType[]): string[];

	tokenizeTextAll(text: string, exclude?: TokenType[]): string[];
}
