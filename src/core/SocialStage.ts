import {IStageResult, ITokenizerStage, TokenizeMode} from "../type";

export class SocialStage implements ITokenizerStage {
	id = 'social';
	order = 3;
	priority = 10;
	consuming = true;

	private nameRe = /^[\p{L}\p{N}_\-]+/u;

	run(text: string, start: number, mode: TokenizeMode): IStageResult {
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
			consumed: mode === TokenizeMode.Tokenize
		};
	}
}
