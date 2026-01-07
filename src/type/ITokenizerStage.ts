/**
 * 通用 Stage 定义接口
 */
import { TokenizeMode } from './TokenizeMode';
import { IStageResult } from './IStageResult';

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
