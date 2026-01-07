import {IStageResult, ITokenizerStage, TokenizeMode} from "../type";

export class SymbolSpaceStage implements ITokenizerStage {
	id = 'symbol-space';
	order = 7;
	priority = 0;
	consuming = true;

	private spaceRe = /^\s+/;
	private symbolRe = /^[^\p{L}\p{N}\s]+/u;

	run(text: string, start: number, mode: TokenizeMode): IStageResult {
		const slice = text.slice(start);

		const s = this.spaceRe.exec(slice);
		if (s) {
			return {
				tokens: [{ txt: s[0], type: 'space', src: 'space' }],
				unprocessedStart: start + s[0].length,
				consumed: mode === TokenizeMode.Tokenize
			};
		}

		const p = this.symbolRe.exec(slice);
		if (p) {
			return {
				tokens: [{ txt: p[0], type: 'punctuation', src: 'punctuation' }],
				unprocessedStart: start + p[0].length,
				consumed: mode === TokenizeMode.Tokenize
			};
		}

		return { tokens: [], unprocessedStart: start, consumed: false };
	}
}
