import {IStageBestResult, ITokenizerStage} from "../type";

export class EmailStage implements ITokenizerStage {
	id = 'email';
	order = 3;
	priority = 20;
	consuming = true;

	private re =
		/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

	best(text: string, start: number): IStageBestResult {
		const m = this.re.exec(text.slice(start));
		if (!m) {
			return { tokens: [], unprocessedStart: start, consumed: false };
		}

		return {
			tokens: [{
				txt: m[0],
				type: 'email',
				src: 'email'
			}],
			unprocessedStart: start + m[0].length,
			consumed: true
		};
	}

	all(text: string) {
		return [];
	}
}

