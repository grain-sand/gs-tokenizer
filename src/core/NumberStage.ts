import {IStageResult, ITokenizerStage, TokenizeMode} from "../type";

export class NumberStage implements ITokenizerStage {
	id = 'number';
	order = 6;
	priority = 10;
	consuming = true;

	private re = /^(\d+(?:\.\d+)?\s*[-~]\s*\d+(?:\.\d+)?|\d+(?:\.\d+)?\s*(?:万|亿|余万|多|成|折|岁以上|以内|系|类)?|[一二三四五六七八九十百千万两伍]+\s*[成折]?|\d+(?:\.\d+)?\s*(?:kg|公斤|英里|米|公里|元钱|元))/;

	run(text: string, start: number, mode: TokenizeMode): IStageResult {
		const m = this.re.exec(text.slice(start));
		if (!m) {
			return { tokens: [], unprocessedStart: start, consumed: false };
		}

		return {
			tokens: [{ txt: m[0], type: 'number', src: 'number' }],
			unprocessedStart: start + m[0].length,
			consumed: mode === TokenizeMode.Tokenize
		};
	}
}
