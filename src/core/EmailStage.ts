import {IStageAllResult, IStageBestResult, ITokenizerStage, Lang} from "../type";

export class EmailStage implements ITokenizerStage {
	readonly id = 'email';
	readonly order = 6;
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
				src: 'email',
				lang: Lang.EN
			}],
			unprocessedStart: start + m[0].length,
			consumed: true
		};
	}

	all(rest: string): IStageAllResult {
		const m = this.re.exec(rest);
		if (!m) {
			return {tokens: [], end: 0};
		}
		return {
			tokens: [
				{
					txt: m[0],
					type: 'email',
					src: 'email',
					lang: Lang.EN
				},
				{
					txt: m[1],
					type: 'word',
					src: 'email-sub',
					lang: Lang.EN
				},
			],
			end: m[0].length
		};
	}
}
