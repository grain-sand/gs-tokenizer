import {IMultilingualTokenizer, IStageBestResult, ITokenizerStage, IWordIndex} from "../type";

export class DictionaryStage implements ITokenizerStage {
	id = 'dictionary';
	order = 1;
	priority = 0;
	consuming = true;
	private index?: IWordIndex

	constructor() {
	}

	initialize(tokenizer: IMultilingualTokenizer) {
		this.index = tokenizer.wordIndex;
	}

	best(text: string, start: number): IStageBestResult {
		const matches = this.index!.match(text, start);
		if (!matches.length) {
			return {tokens: [], unprocessedStart: start, consumed: false};
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
			consumed: true
		};
	}

	all(text: string) {
		return this.index!.matches(text);
	}
}
