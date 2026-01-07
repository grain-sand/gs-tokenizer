import {IStageBestResult, ITokenizerStage} from "../type";

export class DateStage implements ITokenizerStage {
	id = 'date';
	order = 5;
	priority = 0;
	consuming = true;

	private static FULL: RegExp[] = [
		/^\d{4}年\d{1,2}月\d{1,2}日/,
		/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/,
		/^\d{1,2}[-/.]\d{1,2}[-/.]\d{4}/
	];

	private static PART: RegExp[] = [
		/^\d{4}年/,
		/^\d{1,2}月/,
		/^\d{1,2}日/
	];

	best(
		text: string,
		start: number
	): IStageBestResult {
		const rest = text.slice(start);

		/* ---------- ① 完整日期优先 ---------- */
		for (const re of DateStage.FULL) {
			const m = re.exec(rest);
			if (m) {
				return {
					tokens: [{ txt: m[0], type: 'date' }],
					unprocessedStart: start + m[0].length,
					consumed: true
				};
			}
		}

		/* ---------- ② extract 才拆字段 ---------- */
		// if (mode === TokenizeMode.Extract) {
		// 	for (const re of DateStage.PART) {
		// 		const m = re.exec(rest);
		// 		if (m) {
		// 			return {
		// 				tokens: [{ txt: m[0], type: 'date' }],
		// 				unprocessedStart: start + m[0].length,
		// 				consumed: true
		// 			};
		// 		}
		// 	}
		// }

		/* ---------- ③ 明确不处理 ---------- */
		return {
			tokens: [],
			unprocessedStart: start,
			consumed: false
		};
	}

	all(text: string) {
		return [];
	}
}


