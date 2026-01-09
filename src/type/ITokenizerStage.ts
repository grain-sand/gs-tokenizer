import { IToken } from './IToken';
import { IMultilingualTokenizer } from './IMultilingualTokenizer';

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
