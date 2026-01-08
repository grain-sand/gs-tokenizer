import {IStageBestResult, ITokenizerStage} from "../type";

export class DateStage implements ITokenizerStage {
	readonly id = 'date';
	readonly order = 5;
	readonly priority = 0;

	private static FULL: RegExp[] = [
		/^\d{4}年\d{1,2}月\d{1,2}日/,
		/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/,
		/^\d{1,2}[-/.]\d{1,2}[-/.]\d{4}/
	];

	best(
		text: string,
		start: number
	): IStageBestResult {
		const rest = text.slice(start);
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


