/**
 * 执行器配置选项接口
 */
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
