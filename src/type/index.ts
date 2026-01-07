/* =========================
 * 基础常量
 * ========================= */

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

export interface ISpanToken extends IToken {
	start: number;
	end: number;
}


/* =========================
 * 分词模式（数字枚举，低开销）
 * ========================= */

export const enum TokenizeMode {
	Tokenize = 0,
	Extract = 1
}


/* =========================
 * Stage 执行结果
 * ========================= */

export interface IStageResult {
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


/* =========================
 * 通用 Stage 定义（唯一接口）
 * ========================= */

export interface ITokenizerStage {
	/** 阶段唯一标识（调试 / src / 替换用） */
	id: string;

	/**
	 * 流程顺序（1~8）
	 * 表达：词库 → 姓名 → 社交 → 主机/IP → 日期 → 数字 → 符号 → 原生
	 */
	order: number;

	/**
	 * 同一 order 内的优先级
	 * 数值越大越优先
	 */
	priority: number;

	/**
	 * 是否会在 tokenize 模式下消耗字符
	 * - false：仅 extract 候选
	 * - true：可短路后续流程
	 */
	consuming: boolean;

	/**
	 * 执行逻辑
	 * @param text 原始完整文本
	 * @param start 上一阶段未处理的起始位置
	 * @param mode Tokenize | Extract
	 */
	run(
		text: string,
		start: number,
		mode: TokenizeMode
	): IStageResult;

	/**
	 * 可选：能力声明（未来扩展用）
	 * 例：['dictionary', 'name', 'date']
	 */
	capabilities?: readonly string[];
}


/* =========================
 * 姓名词库定义
 * - 字段必选
 * - 未设置则不加载姓名处理 stage
 * ========================= */

export interface INameLexiconGroup {
	lastName: string[];
	firstName: string[];
	title: string[];
}


/* =========================
 * 多语言分词器接口
 * ========================= */

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

	extractAll(text: string): IToken[];

	tokenizeText(text: string): string[];

	extractText(text: string): string[];

	/* ---------- 状态 ---------- */

	loadedLexiconNames: string[];
}


/* =========================
 * 执行器配置（可选）
 * ========================= */

export interface TokenizerOptions {
	/**
	 * 当前前 7 个 stage 执行完后，
	 * 若仍存在未处理字符，是否使用浏览器原生分词处理剩余文本
	 *
	 * tokenize / extract 行为一致
	 */
	useNativeSegmenterForRest?: boolean;

	/**
	 * extract 模式下是否对结果去重
	 */
	deduplicate?: boolean;
}
