import {IStageBestResult, IToken, ITokenizerStage} from "../type";

export class EmailStage implements ITokenizerStage {
	readonly id = 'email';
	readonly order = 3;
	readonly priority = 20;
	readonly skipOwnLastMax = true;

	private re =
		/^([a-zA-Z0-9._%+-]+)@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

	best(text: string, start: number): IStageBestResult {
		const m = this.re.exec(text.slice(start));
		if (!m) {
			return {tokens: [], unprocessedStart: start, consumed: false};
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

	all(text: string): IToken[] {
		const m = this.re.exec(text);
		if (!m) {
			return [];
		}
		return [
			{
				txt: m[0],
				type: 'email',
				src: 'email'
			},
			{
				txt: m[1],
				type: 'word',
				src: 'email-sub'
			},
		];
	}
}

