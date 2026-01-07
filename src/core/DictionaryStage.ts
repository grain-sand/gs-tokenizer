
/* =========================================================
 * Stage 1：纯词库分词
 * ========================================================= */

import {IStageResult, ITokenizerStage, TokenizeMode} from "../type";
import {WordIndex} from "./WordIndex";

export class DictionaryStage implements ITokenizerStage {
	id = 'dictionary';
	order = 1;
	priority = 0;
	consuming = true;

	constructor(private index: WordIndex) {}

	run(text: string, start: number, mode: TokenizeMode): IStageResult {
		const matches = this.index.match(text, start);
		if (!matches.length) {
			return { tokens: [], unprocessedStart: start, consumed: false };
		}

		const best = matches.sort((a, b) => {
			if (b.word.length !== a.word.length) {
				return b.word.length - a.word.length;
			}
			return b.meta.priority - a.meta.priority;
		})[0];

		return {
			tokens: [{
				txt: best.word,
				type: 'word',
				lang: best.meta.lang,
				src: best.meta.name
			}],
			unprocessedStart: start + best.word.length,
			consumed: mode === TokenizeMode.Tokenize
		};
	}
}
