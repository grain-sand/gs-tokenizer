import {IMultilingualTokenizer, IStageAllResult, IStageBestResult, ITokenizerStage, IWordIndex, TokenType} from "../type";

export class DictionaryStage implements ITokenizerStage {
	readonly id = 'dictionary';
	readonly order = 1;
	readonly priority = 0;
	private index?: IWordIndex

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
				supLang: best.meta.lang,
				src: best.meta.name
			}],
			unprocessedStart: start + best.word.length,
			consumed: true
		};
	}

	all(text: string): IStageAllResult {
		// 获取从文本开头开始的所有可能匹配
		const matches = this.index!.match(text, 0);
		if (!matches.length) {
			return { tokens: [], end: 0 };
		}
		
		// 将所有匹配转换为token
		const tokens = matches.map(match => ({
			txt: match.word,
			type: 'word' as TokenType,
			supLang: match.meta.lang,
			src: match.meta.name
		}));
		
		// 找到最长匹配的长度作为end值
		const end = Math.max(...matches.map(match => match.word.length));
		
		return { tokens, end };
	}
}
