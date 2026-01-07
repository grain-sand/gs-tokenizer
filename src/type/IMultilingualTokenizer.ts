/**
 * 多语言分词器接口
 */
import { SupportedLanguage } from './SupportedLanguage';
import { INameLexiconGroup } from './INameLexiconGroup';
import { ITokenizerStage } from './ITokenizerStage';
import { IToken } from './IToken';

export interface IMultilingualTokenizer {

	/* ---------- 词库管理 ---------- */

	addDictionary(
		words: string[],
		name: string,
		priority?: number,
		language?: SupportedLanguage
	): void;

	/**
	 * 设置姓名词库
	 * - 一旦设置即启用姓名分词 stage
	 * - 未设置则不加载姓名处理流程
	 */
	setNameDictionary(
		nameLexicon: INameLexiconGroup,
		language: SupportedLanguage
	): void;

	/* ---------- Stage 扩展 ---------- */

	/**
	 * 添加自定义分词 Stage
	 * - 可用于新增能力
	 * - 可用于替换内置算法（同 order + 更高 priority）
	 */
	addStage(stage: ITokenizerStage): void;

	/**
	 * 移除指定 Stage
	 */
	removeStage(stageId: string): void;

	/* ---------- 执行 ---------- */

	tokenize(text: string): IToken[];

	extract(text: string): IToken[];

	tokenizeText(text: string): string[];

	extractText(text: string): string[];

	/* ---------- 状态 ---------- */

	loadedLexiconNames: string[];
}
