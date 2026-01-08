import {IStageBestResult, ITokenizerStage} from "../type";

export class SocialStage implements ITokenizerStage {
	readonly id = 'social';
	readonly order = 3;
	readonly priority = 10;
	readonly skipOwnLastMax = true;

	private nameRe = /^[\p{L}\p{N}_\-]+/u;

	best(text: string, start: number): IStageBestResult {
		const ch = text[start];
		if (ch !== '@' && ch !== '#') {
			return { tokens: [], unprocessedStart: start, consumed: false };
		}

		let pos = start + 1;
		const m = this.nameRe.exec(text.slice(pos));
		if (!m) {
			return { tokens: [], unprocessedStart: start, consumed: false };
		}

		const full = ch + m[0];
		return {
			tokens: [{
				txt: full,
				type: ch === '@' ? 'mention' : 'hashtag',
				src: 'social'
			}],
			unprocessedStart: pos + m[0].length,
			consumed: true
		};
	}

	all(rest: string) {
		return this.best(rest, 0).tokens;
	}
}
