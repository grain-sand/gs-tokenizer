/**
 * Stage 执行结果接口
 */
import { IToken } from './IToken';

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
