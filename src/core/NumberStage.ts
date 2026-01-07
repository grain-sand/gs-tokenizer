import {IStageBestResult, ITokenizerStage} from "../type";

export class NumberStage implements ITokenizerStage {
	id = 'number';
	order = 6;
	priority = 10;
	consuming = true;

	// 连续数字（支持小数、科学计数、百分号、分隔符）
	private static NUM =
		/^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?:e[+-]?\d+)?%?/i;

	best(
		text: string,
		start: number
	): IStageBestResult {
		const rest = text.slice(start);
		const m = NumberStage.NUM.exec(rest);

		// 没命中 → 绝不消费
		if (!m) {
			return {
				tokens: [],
				unprocessedStart: start,
				consumed: false
			};
		}

		const raw = m[0];

		// 👉 这里开始，不管你要不要这个数字
		// 👉 指针都必须前进
		const next = start + raw.length;

		// 例：过滤路径里的版本号 v1
		if (start > 0 && /[a-zA-Z]/.test(text[start - 1])) {
			return {
				tokens: [],
				unprocessedStart: next,
				consumed: true
			};
		}

		// 正常数字
		return {
			tokens: [{ txt: raw, type: 'number' }],
			unprocessedStart: next,
			consumed: true
		};
	}

	all(text: string) {
		return [];
	}
}

