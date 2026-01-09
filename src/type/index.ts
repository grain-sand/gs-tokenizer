export const SUPPORTED_LANGUAGES = [
	'zh',
	'zh-CN',
	'zh-TW',
	'en',
	'ja',
	'ko'
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];


/* =========================
 * Token 定义
 * ========================= */

export type TokenType =
	| 'word'
	| 'name'
	| 'title'
	| 'hashtag'
	| 'mention'
	| 'host'
	| 'email'
	| 'url'
	| 'ip'
	| 'date'
	| 'number'
	| 'emoji'
	| 'punctuation'
	| 'space'
	| 'other';

export interface IToken {
	txt: string;
	type: TokenType;

	/** 说明性信息 */
	lang?: SupportedLanguage;
	src?: string;
}

export interface IRange {
	start: number;
	end: number;
}

export interface ISpanToken extends IToken, IRange {
}


export interface IStageBestResult {
	/** 当前阶段识别出的 tokens */
	tokens: IToken[];

	/**
	 * 尚未处理的字符起始位置
	 * - 基于上一阶段的未处理位置继续向后推进
	 * - tokenize / extract 语义一致
	 */
	unprocessedStart: number;

	/**
	 * tokenize 模式下：
	 * 是否已消费字符并可短路后续流程
	 */
	consumed: boolean;
}

export interface IStageAllResult {
	tokens: IToken[];
	end: number;
}


export interface ITokenizerStage {
	/** 阶段唯一标识（调试 / src / 替换用） */
	readonly id: string;

	/**
	 * 流程顺序（1~8）
	 * 表达：词库 → 姓名 → 社交 → 主机/IP → 日期 → 数字 → 符号 → 原生
	 */
	readonly order: number;

	/**
	 * 同一 order 内的优先级
	 * 数值越大越优先
	 */
	readonly priority: number;

	/**
	 * 是否跳过当前 `Stage` 上次识别出的最大位置
	 * - 仅对自己生效
	 */
	readonly skipOwnLastMax?: boolean;

	/**
	 * 是否在当前阶段处理过字符后，短路后续流程
	 */
	breakIfProcessed?: boolean;

	/**
	 * 是否仅处理未处理字符
	 */
	unprocessedOnly?: boolean

	/**
	 * 初始化逻辑（可选）
	 * - 主要用于获取 `IMultilingualTokenizer` 实例
	 * - 仅在首次加载时调用
	 * - 也可用于加载词库、初始化模型等
	 */
	initialize?: (tokenizer: IMultilingualTokenizer) => void;

	/**
	 * 执行逻辑
	 * @param text 原始完整文本
	 * @param start 上一阶段未处理的起始位置
	 */
	best(
		text: string,
		start: number,
	): IStageBestResult;

	all(rest: string): IStageAllResult;
}


export interface INameLexiconGroup {
	lastName: string[];
	firstName: string[];
	title: string[];
}


export interface IMultilingualTokenizer {

	readonly wordIndex: IWordIndex;

	loadedLexiconNames: string[];

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


export interface LexiconMeta {
	name: string;
	priority: number;
	lang?: SupportedLanguage;
}

export interface IWordMatch {
	start?: number;
	end?: number;
	word: string;
	meta: LexiconMeta;
}

export interface IWordIndex {

	add(word: string, meta: LexiconMeta): void;
	addBatch(words: { word: string; meta: LexiconMeta }[]): void;

	match(text: string, pos: number): IWordMatch[];

	matches(text: string): IToken[];

}
